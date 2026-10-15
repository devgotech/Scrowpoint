package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type AdminHandler struct {
	disputeService    *services.DisputeService
	moderationService *services.ModerationService
}

func NewAdminHandler(
	disputeService *services.DisputeService,
	moderationService *services.ModerationService,
) *AdminHandler {
	return &AdminHandler{
		disputeService:    disputeService,
		moderationService: moderationService,
	}
}

func (h *AdminHandler) ListDisputes(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	status := q.Get("status")
	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))

	disputes, total, err := h.disputeService.ListDisputes(r.Context(), status, page, limit)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	JSONSuccess(w, http.StatusOK, PaginatedData{
		Items: disputes,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func (h *AdminHandler) AssignDispute(w http.ResponseWriter, r *http.Request, adminID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	dispute, err := h.disputeService.AssignDispute(r.Context(), disputeID, adminID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *AdminHandler) GetDisputeEvidence(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	dispute, err := h.disputeService.GetDisputeByID(r.Context(), disputeID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]interface{}{
		"disputeId":           dispute.ID,
		"orderId":             dispute.OrderID,
		"issueType":           dispute.IssueType,
		"evidence":            dispute.Evidence,
		"sellerResponseNotes": dispute.SellerResponseNotes,
		"mediatorNotes":       dispute.MediatorNotes,
	})
}

func (h *AdminHandler) IssueVerdict(w http.ResponseWriter, r *http.Request, adminID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	disputeID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid dispute UUID")
		return
	}

	var req services.DisputeVerdictInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	dispute, err := h.disputeService.IssueMediationVerdict(r.Context(), disputeID, adminID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, dispute)
}

func (h *AdminHandler) DecideAppeal(w http.ResponseWriter, r *http.Request, adminID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	appealID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid appeal UUID")
		return
	}

	var req struct {
		Uphold bool   `json:"uphold"`
		Notes  string `json:"notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	appeal, err := h.disputeService.DecideAppeal(r.Context(), appealID, adminID, req.Uphold, req.Notes)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, appeal)
}

func (h *AdminHandler) CreateReport(w http.ResponseWriter, r *http.Request, reportedBy uuid.UUID) {
	var req services.CreateReportInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	report, err := h.moderationService.CreateReport(r.Context(), reportedBy, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, report)
}

func (h *AdminHandler) ListReports(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	status := q.Get("status")
	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))

	reports, total, err := h.moderationService.ListReports(r.Context(), status, page, limit)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	JSONSuccess(w, http.StatusOK, PaginatedData{
		Items: reports,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func (h *AdminHandler) DismissReport(w http.ResponseWriter, r *http.Request, adminID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	reportID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid report UUID")
		return
	}

	var req struct {
		Notes string `json:"notes"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	report, err := h.moderationService.DismissReport(r.Context(), reportID, adminID, req.Notes)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, report)
}

func (h *AdminHandler) SuspendUser(w http.ResponseWriter, r *http.Request, adminID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	targetUserID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid user UUID")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	if err := h.moderationService.SuspendUser(r.Context(), targetUserID, adminID, req.Reason); err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "User suspended successfully"})
}

func (h *AdminHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.moderationService.GetAdminSummary(r.Context())
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, summary)
}
