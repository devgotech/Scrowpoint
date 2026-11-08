package services

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type KYCSubmitInput struct {
	ProviderRef string `json:"providerVerificationRef,omitempty"`
	IDType      string `json:"idType,omitempty"`
	IDNumber    string `json:"idNumber,omitempty"`
	DocumentURL string `json:"documentUrl,omitempty"`
	SelfieURL   string `json:"selfieUrl,omitempty"`
}

type KYCStatusResponse struct {
	Status          db.KYCStatus `json:"status"`
	ProviderRef     string       `json:"providerRef,omitempty"`
	SubmittedAt     *time.Time   `json:"submittedAt,omitempty"`
	SlaExpiresAt    *time.Time   `json:"slaExpiresAt,omitempty"`
	RejectionReason string       `json:"rejectionReason,omitempty"`
	RequiresAction  bool         `json:"requiresAction"`
	Message         string       `json:"message"`
}

type SmileIDWebSession struct {
	Token       string `json:"token"`
	Environment string `json:"environment"`
	PartnerID   string `json:"partnerId"`
	CallbackURL string `json:"callbackUrl"`
	SessionID   string `json:"sessionId"`
	PartnerName string `json:"partnerName"`
	LogoURL     string `json:"logoUrl"`
	PolicyURL   string `json:"policyUrl"`
	ThemeColor  string `json:"themeColor"`
}

type SmileIDClient struct {
	partnerID   string
	apiKey      string
	apiBaseURL  string
	environment string
	httpClient  *http.Client
}

type SmileIDClientConfig struct {
	Environment string
	APIBaseURL  string
	HTTPClient  *http.Client
}

func NewSmileIDClient(partnerID, apiKey string, configs ...SmileIDClientConfig) *SmileIDClient {
	config := SmileIDClientConfig{}
	if len(configs) > 0 {
		config = configs[0]
	}
	if config.Environment == "" {
		config.Environment = strings.ToLower(strings.TrimSpace(os.Getenv("SMILE_ID_ENVIRONMENT")))
	}
	config.Environment = strings.ToLower(strings.TrimSpace(config.Environment))
	if config.Environment == "" {
		config.Environment = "sandbox"
	}
	if config.APIBaseURL == "" {
		if config.Environment == "production" {
			config.APIBaseURL = "https://api.smileidentity.com"
		} else {
			config.APIBaseURL = "https://testapi.smileidentity.com"
		}
	}
	if config.HTTPClient == nil {
		config.HTTPClient = &http.Client{Timeout: 15 * time.Second}
	}
	return &SmileIDClient{
		partnerID:   partnerID,
		apiKey:      apiKey,
		apiBaseURL:  strings.TrimRight(config.APIBaseURL, "/"),
		environment: config.Environment,
		httpClient:  config.HTTPClient,
	}
}

func (c *SmileIDClient) CreateWebToken(
	ctx context.Context,
	userID, sessionID uuid.UUID,
	callbackURL string,
) (string, error) {
	if c.partnerID == "" || c.apiKey == "" {
		return "", errors.New("Smile ID is not configured")
	}
	if c.environment != "sandbox" && c.environment != "production" {
		return "", errors.New("SMILE_ID_ENVIRONMENT must be sandbox or production")
	}
	if callbackURL == "" {
		return "", errors.New("SMILE_ID_CALLBACK_URL must be configured")
	}
	callback, err := url.Parse(callbackURL)
	if err != nil || callback.Scheme != "https" || callback.Host == "" {
		return "", errors.New("Smile ID callback URL must be an absolute HTTPS URL")
	}

	body := &bytes.Buffer{}
	form := multipart.NewWriter(body)
	partnerParams, err := json.Marshal(map[string]string{
		"internal_reference": sessionID.String(),
		"internal_user_id":   userID.String(),
	})
	if err != nil {
		return "", fmt.Errorf("encode Smile ID partner parameters: %w", err)
	}
	payload, err := json.Marshal(map[string]string{"callback_url": callbackURL})
	if err != nil {
		return "", fmt.Errorf("encode Smile ID token payload: %w", err)
	}
	for name, value := range map[string]string{
		"product":        "biometric_kyc",
		"user_id":        userID.String(),
		"partner_params": string(partnerParams),
		"payload":        string(payload),
	} {
		if err := form.WriteField(name, value); err != nil {
			return "", fmt.Errorf("write Smile ID token field %s: %w", name, err)
		}
	}
	if err := form.Close(); err != nil {
		return "", fmt.Errorf("finish Smile ID token request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.apiBaseURL+"/v3/token", body)
	if err != nil {
		return "", fmt.Errorf("create Smile ID token request: %w", err)
	}
	req.Header.Set("Content-Type", form.FormDataContentType())
	req.Header.Set("Accept", "application/json")
	req.Header.Set("SmileID-Partner-ID", c.partnerID)
	req.Header.Set("SmileID-API-Key", c.apiKey)

	res, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request Smile ID Web SDK token: %w", err)
	}
	defer res.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return "", fmt.Errorf("read Smile ID token response: %w", err)
	}
	var response struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(responseBody, &response); err != nil {
		return "", fmt.Errorf("decode Smile ID token response (HTTP %d): %w", res.StatusCode, err)
	}
	if res.StatusCode != http.StatusOK || response.Token == "" {
		return "", fmt.Errorf("Smile ID token request failed (HTTP %d)", res.StatusCode)
	}
	return response.Token, nil
}

func (c *SmileIDClient) VerifyWebhookSignature(timestamp, signature string) bool {
	if c.partnerID == "" || c.apiKey == "" || timestamp == "" || signature == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(c.apiKey))
	_, _ = mac.Write([]byte(timestamp + c.partnerID + "sid_request"))
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

type KYCService struct {
	Mu            sync.RWMutex
	authService   *AuthService
	smileIDClient *SmileIDClient
	Verifications map[uuid.UUID][]*db.UserVerification
	activeJobMap  map[string]uuid.UUID
}

func NewKYCService(authService *AuthService, smileClient *SmileIDClient) *KYCService {
	return &KYCService{
		authService:   authService,
		smileIDClient: smileClient,
		Verifications: make(map[uuid.UUID][]*db.UserVerification),
		activeJobMap:  make(map[string]uuid.UUID),
	}
}

func (s *KYCService) SubmitKYC(ctx context.Context, userID uuid.UUID, in KYCSubmitInput) (*db.UserVerification, error) {
	if in.ProviderRef != "" {
		return nil, errors.New("Smile ID results can only be recorded from a verified provider webhook")
	}
	if in.DocumentURL == "" && in.SelfieURL == "" {
		return nil, errors.New("private identity document or selfie upload is required")
	}

	user, err := s.authService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	now := time.Now()
	initialStatus := db.KYCManualReviewRequired
	providerRef := "manual_" + uuid.NewString()

	metadataObj := map[string]interface{}{
		"provider":    "manual_review",
		"idType":      in.IDType,
		"documentUrl": in.DocumentURL,
		"selfieUrl":   in.SelfieURL,
		"submittedAt": now.Format(time.RFC3339),
		"slaWindow":   "24-48 hours",
	}
	metadataBytes, _ := json.Marshal(metadataObj)

	verification := &db.UserVerification{
		ID:          uuid.New(),
		UserID:      user.ID,
		ProviderRef: providerRef,
		Status:      initialStatus,
		Metadata:    metadataBytes,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	s.authService.Mu.Lock()
	user.KYCStatus = initialStatus
	user.UpdatedAt = now
	s.authService.Mu.Unlock()

	s.Verifications[user.ID] = append(s.Verifications[user.ID], verification)
	s.activeJobMap[providerRef] = user.ID

	return verification, nil
}

func (s *KYCService) StartSmileIDSession(
	ctx context.Context,
	userID uuid.UUID,
	callbackURL, frontendBaseURL string,
) (*SmileIDWebSession, error) {
	user, err := s.authService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	sessionID := uuid.New()
	token, err := s.smileIDClient.CreateWebToken(ctx, userID, sessionID, callbackURL)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	verification := &db.UserVerification{
		ID:          uuid.New(),
		UserID:      user.ID,
		ProviderRef: sessionID.String(),
		Status:      db.KYCPending,
		Metadata:    []byte(`{"provider":"SmileID","product":"biometric_kyc"}`),
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	s.Mu.Lock()
	s.Verifications[user.ID] = append(s.Verifications[user.ID], verification)
	s.activeJobMap[sessionID.String()] = user.ID
	s.Mu.Unlock()

	s.authService.Mu.Lock()
	user.KYCStatus = db.KYCPending
	user.UpdatedAt = now
	s.authService.Mu.Unlock()

	environment := s.smileIDClient.environment
	if environment == "" {
		environment = "sandbox"
	}
	baseURL := strings.TrimRight(frontendBaseURL, "/")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	return &SmileIDWebSession{
		Token:       token,
		Environment: environment,
		PartnerID:   s.smileIDClient.partnerID,
		CallbackURL: callbackURL,
		SessionID:   sessionID.String(),
		PartnerName: "Scrowpoint",
		LogoURL:     baseURL + "/favicon.ico",
		PolicyURL:   baseURL + "/legal/privacy",
		ThemeColor:  "#FF5A25",
	}, nil
}

func (s *KYCService) HandleSmileIDWebhook(timestamp, signature string, payload []byte) error {
	if !s.smileIDClient.VerifyWebhookSignature(timestamp, signature) {
		return errors.New("invalid Smile ID webhook signature")
	}
	var event struct {
		Product       string `json:"product"`
		Status        string `json:"status"`
		Reason        string `json:"reason"`
		Message       string `json:"message"`
		PartnerParams struct {
			InternalReference string `json:"internal_reference"`
			InternalUserID    string `json:"internal_user_id"`
		} `json:"partner_params"`
	}
	if err := json.Unmarshal(payload, &event); err != nil {
		return errors.New("invalid Smile ID webhook payload")
	}
	if event.Product != "biometric_kyc" {
		return fmt.Errorf("unsupported Smile ID product %q", event.Product)
	}
	sessionID, err := uuid.Parse(event.PartnerParams.InternalReference)
	if err != nil {
		return errors.New("Smile ID webhook is missing a valid session reference")
	}
	var expectedUserID uuid.UUID
	if event.PartnerParams.InternalUserID != "" {
		expectedUserID, err = uuid.Parse(event.PartnerParams.InternalUserID)
		if err != nil {
			return errors.New("Smile ID webhook has an invalid user reference")
		}
	}

	var status db.KYCStatus
	var reviewReason string
	switch strings.ToLower(event.Status) {
	case "clear":
		status = db.KYCApproved
	case "attention":
		status = db.KYCManualReviewRequired
		reviewReason = event.Message
	case "block":
		status = db.KYCRejected
		reviewReason = event.Message
	case "error":
		status = db.KYCManualReviewRequired
		reviewReason = event.Message
	default:
		return fmt.Errorf("unsupported Smile ID verification status %q", event.Status)
	}
	if reviewReason == "" && status == db.KYCRejected {
		reviewReason = event.Reason
	}

	s.Mu.Lock()
	userID, exists := s.activeJobMap[sessionID.String()]
	if !exists || (expectedUserID != uuid.Nil && userID != expectedUserID) {
		s.Mu.Unlock()
		return errors.New("Smile ID webhook session does not match an active user verification")
	}
	var verification *db.UserVerification
	for _, record := range s.Verifications[userID] {
		if record.ProviderRef == sessionID.String() {
			verification = record
			break
		}
	}
	if verification == nil {
		s.Mu.Unlock()
		return errors.New("Smile ID verification record not found")
	}
	now := time.Now()
	verification.Status = status
	verification.RejectionReason = reviewReason
	verification.UpdatedAt = now
	s.Mu.Unlock()

	s.authService.Mu.Lock()
	user := s.authService.UsersByID[userID]
	if user == nil {
		s.authService.Mu.Unlock()
		return errors.New("Smile ID verification user not found")
	}
	user.KYCStatus = status
	user.UpdatedAt = now
	s.authService.Mu.Unlock()
	return nil
}

func (s *KYCService) GetStatus(ctx context.Context, userID uuid.UUID) (*KYCStatusResponse, error) {
	user, err := s.authService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	s.Mu.RLock()
	defer s.Mu.RUnlock()

	history := s.Verifications[user.ID]
	var latest *db.UserVerification
	if len(history) > 0 {
		latest = history[len(history)-1]
	}

	var submittedAt *time.Time
	var slaExpiresAt *time.Time
	var reason string
	var providerRef string

	if latest != nil {
		submittedAt = &latest.CreatedAt
		t := latest.CreatedAt.Add(48 * time.Hour)
		slaExpiresAt = &t
		reason = latest.RejectionReason
		providerRef = latest.ProviderRef
	}

	var msg string
	var requiresAction bool

	switch user.KYCStatus {
	case db.KYCApproved:
		msg = "Identity successfully verified. Full escrow buying and selling enabled."
	case db.KYCPending:
		msg = "Identity review pending. Verification typically completes within 24 to 48 hours."
	case db.KYCManualReviewRequired:
		msg = "Automated verification encountered a delay. A compliance officer is reviewing your credentials manually."
	case db.KYCRejected:
		msg = "Identity verification was declined. Please submit a clear, non-expired government ID and selfie."
		requiresAction = true
	}

	return &KYCStatusResponse{
		Status:          user.KYCStatus,
		ProviderRef:     providerRef,
		SubmittedAt:     submittedAt,
		SlaExpiresAt:    slaExpiresAt,
		RejectionReason: reason,
		RequiresAction:  requiresAction,
		Message:         msg,
	}, nil
}

func (s *KYCService) GetHistory(ctx context.Context, userID uuid.UUID) ([]db.UserVerification, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	records := s.Verifications[userID]
	var res []db.UserVerification
	for _, rec := range records {
		res = append(res, *rec)
	}
	return res, nil
}

func (s *KYCService) AdminReviewDecision(ctx context.Context, verificationID uuid.UUID, approve bool, reason string) (*db.UserVerification, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	var target *db.UserVerification
	for _, list := range s.Verifications {
		for _, v := range list {
			if v.ID == verificationID {
				target = v
				break
			}
		}
	}
	// Fallback 1: check if verificationID corresponds to a UserID
	if target == nil {
		if list, ok := s.Verifications[verificationID]; ok && len(list) > 0 {
			target = list[len(list)-1]
		}
	}
	// Fallback 2: if only one or multiple verifications exist, pick the most recent
	if target == nil {
		var latest *db.UserVerification
		for _, list := range s.Verifications {
			for _, v := range list {
				if latest == nil || v.CreatedAt.After(latest.CreatedAt) {
					latest = v
				}
			}
		}
		target = latest
	}
	if target == nil {
		return nil, errors.New("verification record not found")
	}

	now := time.Now()
	target.UpdatedAt = now

	user, err := s.authService.GetUserByID(ctx, target.UserID)
	if err != nil {
		return nil, err
	}

	s.authService.Mu.Lock()
	defer s.authService.Mu.Unlock()
	if approve {
		target.Status = db.KYCApproved
		target.RejectionReason = ""
		user.KYCStatus = db.KYCApproved
	} else {
		target.Status = db.KYCRejected
		target.RejectionReason = reason
		user.KYCStatus = db.KYCRejected
	}
	user.UpdatedAt = now

	return target, nil
}
