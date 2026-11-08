package handlers

import (
	"testing"
)

func TestUploadTargetForVideoEvidenceUsesPrivateBucketAndVideoLimit(t *testing.T) {
	handler := &MediaHandler{
		privateBucket: "private-media",
		videoLimitMB:  100,
	}

	folder, bucket, maxBytes, err := handler.uploadTarget("video/mp4")
	if err != nil {
		t.Fatalf("uploadTarget returned error: %v", err)
	}
	if folder != "dispute_evidence" || bucket != "private-media" {
		t.Fatalf("unexpected target: folder=%q bucket=%q", folder, bucket)
	}
	if maxBytes != 100*1024*1024 {
		t.Fatalf("video limit = %d bytes, want %d", maxBytes, 100*1024*1024)
	}
}

func TestUploadTargetRejectsImagesAndUnsupportedVideoTypes(t *testing.T) {
	handler := &MediaHandler{
		privateBucket: "private-media",
		videoLimitMB:  100,
	}

	for _, testCase := range []struct {
		contentType string
	}{
		{contentType: "video/x-matroska"},
		{contentType: "image/jpeg"},
	} {
		t.Run(testCase.contentType, func(t *testing.T) {
			if _, _, _, err := handler.uploadTarget(testCase.contentType); err == nil {
				t.Fatal("uploadTarget accepted an unsupported purpose or content type")
			}
		})
	}
}

func TestValidatePrivateEvidenceKey(t *testing.T) {
	validKey := "dispute_evidence/5cc92c8e-7491-4d59-8ef8-75ef9984f09c/28f64671-c508-4d4a-9b04-d8d05a7c465c.mp4"
	if err := validatePrivateEvidenceKey(validKey); err != nil {
		t.Fatalf("valid evidence key rejected: %v", err)
	}

	for _, key := range []string{
		"listing_media/5cc92c8e-7491-4d59-8ef8-75ef9984f09c/video.mp4",
		"dispute_evidence/../video.mp4",
		"dispute_evidence/5cc92c8e-7491-4d59-8ef8-75ef9984f09c/not-a-uuid.mp4",
	} {
		t.Run(key, func(t *testing.T) {
			if err := validatePrivateEvidenceKey(key); err == nil {
				t.Fatal("invalid evidence key accepted")
			}
		})
	}
}
