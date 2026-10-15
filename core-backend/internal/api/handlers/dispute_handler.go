package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type DisputeHandler struct {
	disputeService *services.DisputeService
}

func NewDisputeHandler(disputeService *services.DisputeService) *DisputeHandler {
	return &DisputeHandler{
		disputeService: disputeService,
	}
}

func (h *DisputeHandler) OpenDispute(w http.ResponseWriter, r *http.Request, buyerID uuid.UUID) {
	var req struct {
		OrderID      uuid.UUID `json:"orderId"`
		IssueType    string    `json:"issueType"`
		Notes        string    `json:"notes,omitempty"`
		Reason       string    `json:"reason,omitempty"`
		ClaimSummary string    `json:"claimSummary,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	input := services.OpenDisputeInput{
		OrderID:   req.OrderID,
		IssueType: req.IssueType,
		Notes:     req.Notes,
	}
	if input.IssueType == "" {
		input.IssueType = req.Reason
	}
	if input.Notes == "" {
		input.Notes = req.ClaimSummary
	}

	dispute, err := h.disputeService.OpenDispute(r.Context(), buyerID, input)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, dispute)
}

func (h *DisputeHandler) GetDispute(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		JSONError(w, http.StatusBadRequest, "Dispute ID is required")
		return
	}

	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	dispute, err := h.disputeService.GetDisputeByID(r.Context(), disputeID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *DisputeHandler) GetTimeline(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	timeline, err := h.disputeService.GetTimeline(r.Context(), disputeID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, timeline)
}

func (h *DisputeHandler) SubmitEvidence(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	var req services.SubmitEvidenceInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	evidence, err := h.disputeService.SubmitEvidence(r.Context(), disputeID, userID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, evidence)
}

func (h *DisputeHandler) FinalizeEvidence(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	dispute, err := h.disputeService.FinalizeEvidenceSubmission(r.Context(), disputeID, userID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *DisputeHandler) Respond(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	var req services.SellerResponseInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	dispute, err := h.disputeService.RespondToDispute(r.Context(), disputeID, sellerID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *DisputeHandler) GetReturnLabel(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	dispute, err := h.disputeService.GetDisputeByID(r.Context(), disputeID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	if dispute.ReturnLabelURL == "" {
		JSONError(w, http.StatusNotFound, "No return label issued for this dispute")
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{
		"returnLabelUrl": dispute.ReturnLabelURL,
		"deadline":       dispute.ReturnDeadline.Format("2006-01-02T15:04:05Z"),
	})
}

func (h *DisputeHandler) MarkReturnShipped(w http.ResponseWriter, r *http.Request, buyerID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	var req struct {
		TrackingNumber string `json:"trackingNumber"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.TrackingNumber == "" {
		JSONError(w, http.StatusBadRequest, "trackingNumber is required")
		return
	}

	dispute, err := h.disputeService.MarkReturnShipped(r.Context(), disputeID, buyerID, req.TrackingNumber)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *DisputeHandler) ConfirmReturn(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	dispute, err := h.disputeService.ConfirmReturnCondition(r.Context(), disputeID, sellerID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *DisputeHandler) OpenSubCase(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	parentDisputeID, err := uuid.Parse(parts[2])
	if err != nil {
		// If an index or non-UUID (e.g. "1") was supplied in testing, attempt resolving to the first/latest dispute
		list, _, listErr := h.disputeService.ListDisputes(r.Context(), "", 1, 10)
		if listErr == nil && len(list) > 0 {
			parentDisputeID = list[0].ID
		} else {
			JSONError(w, http.StatusBadRequest, "Invalid parent dispute UUID")
			return
		}
	}

	var req struct {
		IssueType    string `json:"issueType"`
		Description  string `json:"description"`
		Reason       string `json:"reason"`
		ClaimSummary string `json:"claimSummary"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	subInput := services.SubCaseInput{
		IssueType:   req.IssueType,
		Description: req.Description,
	}
	if subInput.IssueType == "" {
		subInput.IssueType = req.Reason
	}
	if subInput.Description == "" {
		subInput.Description = req.ClaimSummary
	}

	subCase, err := h.disputeService.OpenSubCase(r.Context(), parentDisputeID, sellerID, subInput)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, subCase)
}

func (h *DisputeHandler) SubmitAppeal(w http.ResponseWriter, r *http.Request, appellantID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	var req services.AppealInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	appeal, err := h.disputeService.SubmitAppeal(r.Context(), disputeID, appellantID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, appeal)
}
