package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	var req services.UpdateProfileInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, err := h.userService.UpdateProfile(r.Context(), userID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateAvatar(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	var req struct {
		AvatarURL string `json:"avatarUrl"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.AvatarURL == "" {
		JSONError(w, http.StatusBadRequest, "avatarUrl is required")
		return
	}

	user, err := h.userService.UpdateAvatar(r.Context(), userID, req.AvatarURL)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, user)
}

func (h *UserHandler) GetPublicProfile(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "public-profile" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/users/:id/public-profile")
		return
	}

	targetUserID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid user UUID")
		return
	}

	profile, err := h.userService.GetPublicProfile(r.Context(), targetUserID)
	if err != nil {
		JSONError(w, http.StatusNotFound, "User profile not found")
		return
	}

	JSONSuccess(w, http.StatusOK, profile)
}
