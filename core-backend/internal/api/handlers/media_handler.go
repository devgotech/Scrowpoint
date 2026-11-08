package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

const (
	defaultVideoUploadLimitMB = 100
)

type MediaHandler struct {
	clientOnce    sync.Once
	client        *s3.Client
	presigner     *s3.PresignClient
	initErr       error
	privateBucket string
	region        string
	endpoint      string
	videoLimitMB  int64
}

type mediaUploadRequest struct {
	FileType    string `json:"fileType"`
	FileSize    int64  `json:"fileSize"`
	ReferenceID string `json:"referenceId"`
}

func NewMediaHandler() *MediaHandler {
	return &MediaHandler{
		privateBucket: os.Getenv("S3_PRIVATE_BUCKET_NAME"),
		region:        envOrDefault("S3_REGION", "eu-west-1"),
		endpoint:      os.Getenv("S3_ENDPOINT_URL"),
		videoLimitMB:  positiveEnvInt64("MAX_VIDEO_UPLOAD_MB", defaultVideoUploadLimitMB),
	}
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func positiveEnvInt64(name string, fallback int64) int64 {
	value, err := strconv.ParseInt(os.Getenv(name), 10, 64)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func (h *MediaHandler) s3Clients(r *http.Request) error {
	h.clientOnce.Do(func() {
		if h.privateBucket == "" {
			h.initErr = errors.New("S3_PRIVATE_BUCKET_NAME is required")
			return
		}

		cfg, err := config.LoadDefaultConfig(r.Context(), config.WithRegion(h.region))
		if err != nil {
			h.initErr = fmt.Errorf("load object storage configuration: %w", err)
			return
		}
		h.client = s3.NewFromConfig(cfg, func(options *s3.Options) {
			if h.endpoint != "" {
				options.BaseEndpoint = aws.String(h.endpoint)
				options.UsePathStyle = true
			}
		})
		h.presigner = s3.NewPresignClient(h.client)
	})
	return h.initErr
}

func (h *MediaHandler) PresignUpload(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	var request mediaUploadRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	folder, bucket, maxBytes, err := h.uploadTarget(request.FileType)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	if request.FileSize <= 0 || request.FileSize > maxBytes {
		JSONError(w, http.StatusRequestEntityTooLarge, fmt.Sprintf("File exceeds the %d MB upload limit", maxBytes/(1024*1024)))
		return
	}
	if err := h.s3Clients(r); err != nil {
		JSONError(w, http.StatusServiceUnavailable, "Object storage is not configured")
		return
	}

	extension := extensionForContentType(request.FileType)
	key := fmt.Sprintf("%s/%s/%s%s", folder, userID.String(), uuid.NewString(), extension)
	presigned, err := h.presigner.PresignPutObject(r.Context(), &s3.PutObjectInput{
		Bucket:        aws.String(bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(request.FileType),
		ContentLength: aws.Int64(request.FileSize),
	}, func(options *s3.PresignOptions) {
		options.Expires = 10 * time.Minute
	})
	if err != nil {
		JSONError(w, http.StatusServiceUnavailable, "Could not authorize the storage upload")
		return
	}

	response := map[string]interface{}{
		"uploadUrl":   presigned.URL,
		"key":         key,
		"s3Key":       key,
		"referenceId": request.ReferenceID,
		"expiresIn":   int((10 * time.Minute).Seconds()),
	}
	JSONSuccess(w, http.StatusOK, response)
}

func (h *MediaHandler) CompleteUpload(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	var request struct {
		Key      string `json:"key"`
		FileType string `json:"fileType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	folder, bucket, maxBytes, err := h.uploadTarget(request.FileType)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	prefix := fmt.Sprintf("%s/%s/", folder, userID.String())
	if !strings.HasPrefix(request.Key, prefix) || strings.Contains(request.Key, "..") || strings.Contains(request.Key, "\\") {
		JSONError(w, http.StatusForbidden, "The uploaded object does not belong to this account")
		return
	}
	if filepath.Ext(request.Key) != extensionForContentType(request.FileType) {
		JSONError(w, http.StatusBadRequest, "The uploaded file type does not match the authorized upload")
		return
	}
	if err := h.s3Clients(r); err != nil {
		JSONError(w, http.StatusServiceUnavailable, "Object storage is not configured")
		return
	}

	head, err := h.client.HeadObject(r.Context(), &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(request.Key),
	})
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Uploaded object could not be verified")
		return
	}
	if head.ContentLength == nil || *head.ContentLength <= 0 || *head.ContentLength > maxBytes ||
		head.ContentType == nil || *head.ContentType != request.FileType {
		_, deleteErr := h.client.DeleteObject(r.Context(), &s3.DeleteObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(request.Key),
		})
		if deleteErr != nil {
			JSONError(w, http.StatusInternalServerError, "Upload validation failed and the object could not be removed")
			return
		}
		JSONError(w, http.StatusUnprocessableEntity, "Uploaded object failed size or content-type validation")
		return
	}

	response := map[string]interface{}{
		"key":       request.Key,
		"sizeBytes": *head.ContentLength,
		"fileType":  request.FileType,
		"private":   true,
	}
	JSONSuccess(w, http.StatusOK, response)
}

func (h *MediaHandler) PrivateEvidenceDownloadURL(r *http.Request, key string) (string, error) {
	if err := validatePrivateEvidenceKey(key); err != nil {
		return "", err
	}
	if err := h.s3Clients(r); err != nil {
		return "", err
	}

	presigned, err := h.presigner.PresignGetObject(r.Context(), &s3.GetObjectInput{
		Bucket:               aws.String(h.privateBucket),
		Key:                  aws.String(key),
		ResponseCacheControl: aws.String("no-store"),
	}, func(options *s3.PresignOptions) {
		options.Expires = 5 * time.Minute
	})
	if err != nil {
		return "", fmt.Errorf("presign private evidence download: %w", err)
	}
	return presigned.URL, nil
}

func validatePrivateEvidenceKey(key string) error {
	parts := strings.Split(key, "/")
	if len(parts) != 3 || parts[0] != "dispute_evidence" {
		return errors.New("invalid private evidence key")
	}
	if _, err := uuid.Parse(parts[1]); err != nil {
		return errors.New("invalid private evidence key")
	}
	extension := strings.ToLower(filepath.Ext(parts[2]))
	if extension != ".mp4" && extension != ".mov" && extension != ".webm" {
		return errors.New("invalid private evidence key")
	}
	if _, err := uuid.Parse(strings.TrimSuffix(parts[2], extension)); err != nil {
		return errors.New("invalid private evidence key")
	}
	return nil
}

func (h *MediaHandler) uploadTarget(contentType string) (string, string, int64, error) {
	if !strings.HasPrefix(contentType, "video/") {
		return "", "", 0, errors.New("Only video evidence can use direct uploads; upload images through the image-processing service")
	}
	if extensionForContentType(contentType) == "" {
		return "", "", 0, errors.New("Unsupported media content type")
	}
	return "dispute_evidence", h.privateBucket, h.videoLimitMB * 1024 * 1024, nil
}

func extensionForContentType(contentType string) string {
	switch strings.ToLower(contentType) {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	case "image/heic":
		return ".heic"
	case "image/heif":
		return ".heif"
	case "video/mp4":
		return ".mp4"
	case "video/quicktime":
		return ".mov"
	case "video/webm":
		return ".webm"
	default:
		return ""
	}
}
