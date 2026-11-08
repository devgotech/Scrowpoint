package services

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func kycTestFixture(t *testing.T) (*KYCService, *AuthService, *db.User) {
	t.Helper()
	auth := NewAuthService()
	user, err := auth.SignUp(context.Background(), SignUpInput{
		Email: "kyc@example.com", Password: "password-123", Name: "KYC User",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	return NewKYCService(auth, NewSmileIDClient("partner", "api-key")), auth, user
}

func TestSubmitKYCMapsSmileIDStatusesAndFallback(t *testing.T) {
	for _, testCase := range []struct {
		name        string
		providerRef string
		wantStatus  db.KYCStatus
	}{
		{name: "approved", providerRef: "sim_approved", wantStatus: db.KYCApproved},
		{name: "rejected", providerRef: "sim_rejected", wantStatus: db.KYCRejected},
		{name: "pending", providerRef: "sim_pending", wantStatus: db.KYCPending},
		{name: "manual review after provider failure", providerRef: "sim_timeout_error", wantStatus: db.KYCManualReviewRequired},
	} {
		t.Run(testCase.name, func(t *testing.T) {
			service, _, user := kycTestFixture(t)
			verification, err := service.SubmitKYC(context.Background(), user.ID, KYCSubmitInput{
				ProviderRef: testCase.providerRef,
			})
			if err != nil {
				t.Fatalf("SubmitKYC returned error: %v", err)
			}
			if verification.Status != testCase.wantStatus || user.KYCStatus != testCase.wantStatus {
				t.Errorf("verification/user status = %q/%q, want %q", verification.Status, user.KYCStatus, testCase.wantStatus)
			}
			if testCase.wantStatus == db.KYCManualReviewRequired && verification.RejectionReason == "" {
				t.Error("manual-review fallback did not explain the provider failure")
			}
		})
	}
}

func TestSubmitKYCRequiresIdentityInputAndUnknownUser(t *testing.T) {
	service, _, _ := kycTestFixture(t)
	if _, err := service.SubmitKYC(context.Background(), uuid.New(), KYCSubmitInput{}); err == nil {
		t.Fatal("SubmitKYC accepted empty input for an unknown user")
	}
	if _, err := service.SubmitKYC(context.Background(), uuid.New(), KYCSubmitInput{DocumentURL: "private/document"}); err == nil {
		t.Fatal("SubmitKYC accepted documents for an unknown user")
	}
}

func TestAdminReviewDecisionUpdatesVerificationAndUser(t *testing.T) {
	service, _, user := kycTestFixture(t)
	verification, err := service.SubmitKYC(context.Background(), user.ID, KYCSubmitInput{
		ProviderRef: "sim_timeout_error",
	})
	if err != nil {
		t.Fatalf("SubmitKYC returned error: %v", err)
	}

	reviewed, err := service.AdminReviewDecision(context.Background(), verification.ID, false, "Document is unreadable")
	if err != nil {
		t.Fatalf("AdminReviewDecision returned error: %v", err)
	}
	if reviewed.Status != db.KYCRejected || reviewed.RejectionReason != "Document is unreadable" || user.KYCStatus != db.KYCRejected {
		t.Errorf("rejection was not propagated: verification=%+v userStatus=%q", reviewed, user.KYCStatus)
	}

	approved, err := service.AdminReviewDecision(context.Background(), verification.ID, true, "")
	if err != nil {
		t.Fatalf("AdminReviewDecision approval returned error: %v", err)
	}
	if approved.Status != db.KYCApproved || approved.RejectionReason != "" || user.KYCStatus != db.KYCApproved {
		t.Errorf("approval was not propagated: verification=%+v userStatus=%q", approved, user.KYCStatus)
	}

	status, err := service.GetStatus(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("GetStatus returned error: %v", err)
	}
	history, err := service.GetHistory(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("GetHistory returned error: %v", err)
	}
	if status.Status != db.KYCApproved || len(history) != 1 {
		t.Errorf("unexpected status/history: status=%+v history=%+v", status, history)
	}
}
