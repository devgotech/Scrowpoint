package handlers

import (
	"encoding/json"
	"net/http"

	"core-backend/internal/services"
)

type WaitlistHandler struct {
	waitlistService *services.WaitlistService
}

func NewWaitlistHandler(waitlistService *services.WaitlistService) *WaitlistHandler {
	return &WaitlistHandler{
		waitlistService: waitlistService,
	}
}

func (h *WaitlistHandler) HandleWaitlist(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		h.GetWaitlistStatus(w, r)
		return
	}

	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req services.WaitlistSignupInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	entry, claimedCount, err := h.waitlistService.JoinWaitlist(r.Context(), req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, map[string]interface{}{
		"entry":        entry,
		"claimedSlots": claimedCount,
		"totalSlots":   500,
	})
}

func (h *WaitlistHandler) GetWaitlistStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	q := r.URL.Query()
	email := q.Get("email")
	code := q.Get("code")

	status, err := h.waitlistService.GetStatus(r.Context(), email, code)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, status)
}
