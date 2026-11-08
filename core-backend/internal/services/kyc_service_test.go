package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
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

func TestSubmitKYCDoesNotTrustClientProviderReferences(t *testing.T) {
	service, _, user := kycTestFixture(t)
	if _, err := service.SubmitKYC(context.Background(), user.ID, KYCSubmitInput{
		ProviderRef: "approved",
	}); err == nil {
		t.Fatal("SubmitKYC accepted a client-supplied Smile ID result")
	}
	verification, err := service.SubmitKYC(context.Background(), user.ID, KYCSubmitInput{
		DocumentURL: "private/document",
	})
	if err != nil {
		t.Fatalf("SubmitKYC manual review returned error: %v", err)
	}
	if verification.Status != db.KYCManualReviewRequired || user.KYCStatus != db.KYCManualReviewRequired {
		t.Fatalf("manual evidence status = %q/%q, want manual review", verification.Status, user.KYCStatus)
	}
	if strings.Contains(string(verification.Metadata), "idNumber") {
		t.Fatal("manual KYC metadata persisted a raw identity number")
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
		DocumentURL: "private/document",
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

func TestSmileIDSessionAndSignedWebhook(t *testing.T) {
	auth := NewAuthService()
	user, err := auth.SignUp(context.Background(), SignUpInput{
		Email: "smile@example.com", Password: "password-123", Name: "Smile User",
	})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	var requestedPartnerParams, requestedPayload map[string]string
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/v3/token" {
			t.Errorf("unexpected Smile ID request %s %s", r.Method, r.URL.Path)
		}
		if r.Header.Get("SmileID-Partner-ID") != "12345" || r.Header.Get("SmileID-API-Key") != "sandbox-api-key" {
			t.Errorf("Smile ID credentials were not sent in provider headers")
		}
		if err := r.ParseMultipartForm(1 << 20); err != nil {
			t.Errorf("parse Smile ID token request: %v", err)
		}
		if r.FormValue("product") != "biometric_kyc" || r.FormValue("user_id") != user.ID.String() {
			t.Errorf("unexpected Smile ID token form fields: %v", r.Form)
		}
		_ = json.Unmarshal([]byte(r.FormValue("partner_params")), &requestedPartnerParams)
		_ = json.Unmarshal([]byte(r.FormValue("payload")), &requestedPayload)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"token":"sdk-session-token"}`))
	}))
	defer provider.Close()

	client := NewSmileIDClient("12345", "sandbox-api-key", SmileIDClientConfig{
		Environment: "sandbox",
		APIBaseURL:  provider.URL,
		HTTPClient:  provider.Client(),
	})
	service := NewKYCService(auth, client)
	session, err := service.StartSmileIDSession(
		context.Background(),
		user.ID,
		"https://public.example/api/kyc/smile/webhook",
		"https://app.example",
	)
	if err != nil {
		t.Fatalf("StartSmileIDSession: %v", err)
	}
	if session.Token != "sdk-session-token" || session.Environment != "sandbox" || session.PartnerID != "12345" {
		t.Fatalf("unexpected Smile ID session: %+v", session)
	}
	if requestedPartnerParams["internal_reference"] != session.SessionID ||
		requestedPartnerParams["internal_user_id"] != user.ID.String() ||
		requestedPayload["callback_url"] != session.CallbackURL {
		t.Fatalf("Smile ID session correlation fields are incorrect: params=%v payload=%v", requestedPartnerParams, requestedPayload)
	}

	webhook := []byte(fmt.Sprintf(
		`{"product":"biometric_kyc","status":"clear","partner_params":{"internal_reference":%q}}`,
		session.SessionID,
	))
	timestamp := "2026-11-08T22:00:00Z"
	mac := hmac.New(sha256.New, []byte("sandbox-api-key"))
	_, _ = mac.Write([]byte(timestamp + "12345" + "sid_request"))
	signature := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	if err := service.HandleSmileIDWebhook(timestamp, signature, webhook); err != nil {
		t.Fatalf("HandleSmileIDWebhook: %v", err)
	}
	status, err := service.GetStatus(context.Background(), user.ID)
	if err != nil || status.Status != db.KYCApproved {
		t.Fatalf("Smile ID webhook status = %+v, error %v", status, err)
	}
	if err := service.HandleSmileIDWebhook(timestamp, "invalid", webhook); err == nil {
		t.Fatal("HandleSmileIDWebhook accepted an invalid signature")
	}
}
