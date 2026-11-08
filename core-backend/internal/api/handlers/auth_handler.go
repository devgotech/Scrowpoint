package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
	"core-backend/internal/services"
)

type TokenGenerator interface {
	GenerateToken(user *db.User, sessionID uuid.UUID, ttl time.Duration) (string, error)
}

type AuthHandler struct {
	authService *services.AuthService
	tokenGen    TokenGenerator
}

func NewAuthHandler(authService *services.AuthService, tokenGen TokenGenerator) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		tokenGen:    tokenGen,
	}
}

type SignupRequest struct {
	Email    string      `json:"email"`
	Password string      `json:"password"`
	Name     string      `json:"name,omitempty"`
	FullName string      `json:"fullName,omitempty"`
	Phone    string      `json:"phone,omitempty"`
	Location string      `json:"location,omitempty"`
	Role     db.UserRole `json:"role,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type OAuthRequest struct {
	Email       string `json:"email"`
	Name        string `json:"name"`
	ProviderUID string `json:"providerUid"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

type AuthResponseData struct {
	User      *db.User  `json:"user"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expiresAt"`
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	displayName := req.Name
	if displayName == "" {
		displayName = req.FullName
	}

	// SEC-01 Hardening: Prevent mass-assignment privilege escalation to admin.
	// Public registration can only provision buyer or seller roles.
	assignedRole := db.RoleBuyer
	if strings.EqualFold(string(req.Role), string(db.RoleSeller)) {
		assignedRole = db.RoleSeller
	}

	user, err := h.authService.SignUp(r.Context(), services.SignUpInput{
		Email:    req.Email,
		Password: req.Password,
		Name:     displayName,
		Phone:    req.Phone,
		Location: req.Location,
		Role:     assignedRole,
	})
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	sessID := uuid.New()
	ttl := 7 * 24 * time.Hour
	token, err := h.tokenGen.GenerateToken(user, sessID, ttl)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Failed to issue security token")
		return
	}

	JSONSuccess(w, http.StatusCreated, AuthResponseData{
		User:      user,
		Token:     token,
		ExpiresAt: time.Now().Add(ttl),
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, sess, err := h.authService.Login(r.Context(), req.Email, req.Password, r.UserAgent(), r.RemoteAddr)
	if err != nil {
		JSONError(w, http.StatusUnauthorized, err.Error())
		return
	}

	ttl := 7 * 24 * time.Hour
	token, err := h.tokenGen.GenerateToken(user, sess.ID, ttl)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Failed to generate session token")
		return
	}

	JSONSuccess(w, http.StatusOK, AuthResponseData{
		User:      user,
		Token:     token,
		ExpiresAt: sess.ExpiresAt,
	})
}

func (h *AuthHandler) OAuth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	provider := "google"
	if len(pathParts) >= 4 {
		provider = pathParts[3]
	}

	var req OAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, sess, err := h.authService.OAuthLogin(r.Context(), provider, req.Email, req.Name, req.ProviderUID, r.UserAgent(), r.RemoteAddr)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.tokenGen.GenerateToken(user, sess.ID, 7*24*time.Hour)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Failed to generate session token")
		return
	}

	JSONSuccess(w, http.StatusOK, AuthResponseData{
		User:      user,
		Token:     token,
		ExpiresAt: sess.ExpiresAt,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request, sessionID uuid.UUID) {
	_ = h.authService.Logout(r.Context(), sessionID)
	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	user, err := h.authService.GetUserByID(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, "User not found")
		return
	}
	JSONSuccess(w, http.StatusOK, user)
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Token == "" {
		JSONError(w, http.StatusBadRequest, "Token is required")
		return
	}

	if err := h.authService.VerifyEmail(r.Context(), req.Token); err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Email verified successfully"})
}

func (h *AuthHandler) ResendVerification(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	token, err := h.authService.RequestEmailVerification(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{
		"message": "Verification link sent to registered email",
		"token":   token,
	})
}

func (h *AuthHandler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		JSONError(w, http.StatusBadRequest, "Email is required")
		return
	}

	_, _ = h.authService.RequestPasswordReset(r.Context(), req.Email)
	JSONSuccess(w, http.StatusOK, map[string]string{
		"message": "If this email exists, a password reset link has been dispatched",
	})
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.authService.ResetPassword(r.Context(), req.Token, req.NewPassword); err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Password has been successfully updated"})
}

func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.authService.ChangePassword(r.Context(), userID, req.OldPassword, req.NewPassword); err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Password changed successfully"})
}

func (h *AuthHandler) ListSessions(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	sessions, err := h.authService.ListSessions(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, sessions)
}

func (h *AuthHandler) RevokeSession(w http.ResponseWriter, r *http.Request, userID, sessionID uuid.UUID) {
	if err := h.authService.RevokeSession(r.Context(), userID, sessionID); err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Session revoked"})
}
