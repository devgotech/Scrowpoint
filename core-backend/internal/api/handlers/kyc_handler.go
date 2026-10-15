package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type KYCHandler struct {
	kycService *services.KYCService
}

func NewKYCHandler(kycService *services.KYCService) *KYCHandler {
	return &KYCHandler{
		kycService: kycService,
	}
}

func (h *KYCHandler) SubmitKYC(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	var req services.KYCSubmitInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.ProviderRef == "" && req.DocumentURL == "" && req.SelfieURL == "" && req.IDNumber == "" && req.IDType == "" {
		JSONError(w, http.StatusBadRequest, "providerVerificationRef or identity documents (idType, idNumber, documentUrl, selfieUrl) are required")
		return
	}

	verification, err := h.kycService.SubmitKYC(r.Context(), userID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, verification)
}

func (h *KYCHandler) GetStatus(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	status, err := h.kycService.GetStatus(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, status)
}

func (h *KYCHandler) GetHistory(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	history, err := h.kycService.GetHistory(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, history)
}

func (h *KYCHandler) AdminReview(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		JSONError(w, http.StatusBadRequest, "Verification ID is required")
		return
	}

	verifID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid verification UUID")
		return
	}

	var req struct {
		Approve bool   `json:"approve"`
		Reason  string `json:"reason,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	updatedRecord, err := h.kycService.AdminReviewDecision(r.Context(), verifID, req.Approve, req.Reason)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, updatedRecord)
}
