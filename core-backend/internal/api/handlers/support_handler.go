package handlers

import (
	"encoding/json"
	"net/http"

	"core-backend/internal/services"
)

type SupportHandler struct {
	supportService *services.SupportService
}

func NewSupportHandler(supportService *services.SupportService) *SupportHandler {
	return &SupportHandler{
		supportService: supportService,
	}
}

func (h *SupportHandler) HandleSupportMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		sessionID := r.URL.Query().Get("sessionId")
		msgs, ticket, err := h.supportService.GetMessages(r.Context(), sessionID)
		if err != nil {
			JSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, map[string]interface{}{
			"messages": msgs,
			"ticket":   ticket,
		})
		return
	}

	if r.Method == http.MethodPost {
		var req services.SendSupportMessageInput
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			JSONError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		res, err := h.supportService.SendMessage(r.Context(), req)
		if err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}

		JSONSuccess(w, http.StatusCreated, res)
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func (h *SupportHandler) CreateSupportTicket(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req services.CreateSupportTicketInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	res, err := h.supportService.CreateTicket(r.Context(), req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, res)
}
