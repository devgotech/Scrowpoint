package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

// StaffHandler lets admins manage admin and mediator accounts. All routes are
// admin-only (enforced by the router).
type StaffHandler struct {
	authService    *services.AuthService
	disputeService *services.DisputeService
}

func NewStaffHandler(authService *services.AuthService, disputeService *services.DisputeService) *StaffHandler {
	return &StaffHandler{authService: authService, disputeService: disputeService}
}

// ListStaff handles GET /api/admin/staff.
func (h *StaffHandler) ListStaff(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	staff, pending := h.authService.ListStaff(r.Context())
	JSONSuccess(w, http.StatusOK, map[string]interface{}{
		"staff":              staff,
		"pendingInvitations": pending,
	})
}

// SetActive handles POST /api/admin/staff/{id}/deactivate and /reactivate.
func (h *StaffHandler) SetActive(w http.ResponseWriter, r *http.Request, actorID uuid.UUID, active bool) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) != 5 {
		JSONError(w, http.StatusBadRequest, "Staff member ID is required")
		return
	}
	targetID, err := uuid.Parse(parts[3])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid staff member UUID")
		return
	}
	member, err := h.authService.SetStaffActive(r.Context(), actorID, targetID, active)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	unassigned := 0
	if !active && h.disputeService != nil {
		unassigned = h.disputeService.UnassignOpenCases(r.Context(), targetID)
	}
	JSONSuccess(w, http.StatusOK, map[string]interface{}{
		"staff":           member,
		"casesUnassigned": unassigned,
	})
}

// RevokeInvitation handles POST /api/admin/staff/invitations/revoke {"email": "..."}.
func (h *StaffHandler) RevokeInvitation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Email) == "" {
		JSONError(w, http.StatusBadRequest, "An email address is required")
		return
	}
	if !h.authService.RevokeMediatorInvitation(r.Context(), req.Email) {
		JSONError(w, http.StatusNotFound, "No pending invitation for that email")
		return
	}
	JSONSuccess(w, http.StatusOK, map[string]interface{}{"revoked": true})
}
