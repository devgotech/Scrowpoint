package handlers

import (
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type NotificationHandler struct {
	notificationService *services.NotificationService
}

func NewNotificationHandler(notificationService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
	}
}

func (h *NotificationHandler) ListNotifications(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	recentOnly := r.URL.Query().Get("recent") == "true"
	notifications, err := h.notificationService.ListNotifications(r.Context(), userID, recentOnly)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, notifications)
}

func (h *NotificationHandler) MarkAllAsRead(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	if err := h.notificationService.MarkAllAsRead(r.Context(), userID); err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, map[string]string{"message": "All notifications marked as read"})
}

func (h *NotificationHandler) MarkAsRead(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "read" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/notifications/:id/read")
		return
	}

	notificationID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid notification UUID")
		return
	}

	if err := h.notificationService.MarkAsRead(r.Context(), userID, notificationID); err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Notification marked as read"})
}
