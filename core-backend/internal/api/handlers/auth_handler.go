package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
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
	emailSender services.EmailSender
}

func NewAuthHandler(
	authService *services.AuthService,
	tokenGen TokenGenerator,
	emailSenders ...services.EmailSender,
) *AuthHandler {
	handler := &AuthHandler{
		authService: authService,
		tokenGen:    tokenGen,
	}
	if len(emailSenders) > 0 {
		handler.emailSender = emailSenders[0]
	}
	return handler
}

type SignupRequest struct {
	Email         string      `json:"email"`
	Password      string      `json:"password"`
	Name          string      `json:"name,omitempty"`
	FullName      string      `json:"fullName,omitempty"`
	Phone         string      `json:"phone,omitempty"`
	Location      string      `json:"location,omitempty"`
	Role          db.UserRole `json:"role,omitempty"`
	TermsAccepted bool        `json:"termsAccepted"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type OAuthRequest struct {
	Email         string `json:"email"`
	Name          string `json:"name"`
	ProviderUID   string `json:"providerUid"`
	TermsAccepted bool   `json:"termsAccepted"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

type CreateMediatorInvitationRequest struct {
	Email string `json:"email"`
}

type AcceptMediatorInvitationRequest struct {
	Token    string `json:"token"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type AuthResponseData struct {
	User                    *db.User  `json:"user"`
	Token                   string    `json:"token"`
	ExpiresAt               time.Time `json:"expiresAt"`
	VerificationCodePreview string    `json:"verificationCodePreview,omitempty"`
}

const TermsOfServiceVersion = "SPP-TOS-2026-009"

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
	if !req.TermsAccepted {
		JSONError(w, http.StatusBadRequest, "You must accept the Terms of Service before creating an account")
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

	acceptedAt := time.Now().UTC()
	user, err := h.authService.SignUp(r.Context(), services.SignUpInput{
		Email:           req.Email,
		Password:        req.Password,
		Name:            displayName,
		Phone:           req.Phone,
		Location:        req.Location,
		Role:            assignedRole,
		TermsAcceptedAt: &acceptedAt,
		TermsVersion:    TermsOfServiceVersion,
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
	verificationCode, err := h.authService.RequestEmailVerification(r.Context(), user.ID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Unable to create email verification code")
		return
	}
	preview, err := h.deliverEmail(
		r,
		user.Email,
		"Verify your Scrowpoint email",
		fmt.Sprintf("Your Scrowpoint email verification code is %s. It expires in 10 minutes.", verificationCode),
	)
	if err != nil {
		JSONError(w, http.StatusBadGateway, err.Error())
		return
	}
	verificationCodePreview := ""
	if preview {
		verificationCodePreview = verificationCode
	}

	JSONSuccess(w, http.StatusCreated, AuthResponseData{
		User:                    user,
		Token:                   token,
		ExpiresAt:               time.Now().Add(ttl),
		VerificationCodePreview: verificationCodePreview,
	})
}

func (h *AuthHandler) CreateMediatorInvitation(w http.ResponseWriter, r *http.Request, adminID uuid.UUID) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req CreateMediatorInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	token, expiresAt, err := h.authService.CreateMediatorInvitation(r.Context(), adminID, req.Email)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	JSONSuccess(w, http.StatusCreated, map[string]interface{}{
		"token":     token,
		"email":     strings.ToLower(strings.TrimSpace(req.Email)),
		"expiresAt": expiresAt,
	})
}

func (h *AuthHandler) AcceptMediatorInvitation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req AcceptMediatorInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	user, err := h.authService.AcceptMediatorInvitation(r.Context(), req.Token, req.Name, req.Password)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	authenticatedUser, session, err := h.authService.Login(
		r.Context(),
		user.Email,
		req.Password,
		r.UserAgent(),
		r.RemoteAddr,
	)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Failed to create mediator session")
		return
	}
	ttl := 7 * 24 * time.Hour
	token, err := h.tokenGen.GenerateToken(authenticatedUser, session.ID, ttl)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Failed to issue security token")
		return
	}
	JSONSuccess(w, http.StatusCreated, AuthResponseData{
		User:      authenticatedUser,
		Token:     token,
		ExpiresAt: session.ExpiresAt,
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

	var acceptedAt *time.Time
	if req.TermsAccepted {
		now := time.Now().UTC()
		acceptedAt = &now
	}
	user, sess, err := h.authService.OAuthLoginWithTerms(
		r.Context(),
		provider,
		req.Email,
		req.Name,
		req.ProviderUID,
		r.UserAgent(),
		r.RemoteAddr,
		acceptedAt,
		TermsOfServiceVersion,
	)
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

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
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

	if err := h.authService.VerifyEmailForUser(r.Context(), userID, req.Token); err != nil {
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
	user, err := h.authService.GetUserByID(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, "User not found")
		return
	}
	preview, err := h.deliverEmail(
		r,
		user.Email,
		"Your Scrowpoint verification code",
		fmt.Sprintf("Your new Scrowpoint email verification code is %s. It expires in 10 minutes.", token),
	)
	if err != nil {
		JSONError(w, http.StatusBadGateway, err.Error())
		return
	}

	response := map[string]string{
		"message": "Verification code sent to your registered email",
	}
	if preview {
		response["verificationCodePreview"] = token
	}
	JSONSuccess(w, http.StatusOK, response)
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

	token, err := h.authService.RequestPasswordReset(r.Context(), req.Email)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, "Unable to create password reset token")
		return
	}
	response := map[string]string{
		"message": "If this email exists, a password reset link has been sent",
	}
	if token != "" {
		frontendURL := strings.TrimRight(os.Getenv("FRONTEND_BASE_URL"), "/")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}
		resetURL := frontendURL + "/forgot-password?token=" + url.QueryEscape(token)
		preview, err := h.deliverEmail(
			r,
			req.Email,
			"Reset your Scrowpoint password",
			"Use this secure link to reset your Scrowpoint password. It expires in one hour:\n\n"+resetURL,
		)
		if err != nil {
			JSONError(w, http.StatusBadGateway, err.Error())
			return
		}
		if preview {
			response["resetTokenPreview"] = token
		}
	}
	JSONSuccess(w, http.StatusOK, response)
}

func (h *AuthHandler) deliverEmail(r *http.Request, to, subject, body string) (bool, error) {
	if h.emailSender == nil {
		return false, nil
	}
	if !h.emailSender.Configured() {
		if os.Getenv("ENV") == "development" {
			return true, nil
		}
		return false, errors.New("SMTP email delivery is not configured")
	}
	if err := h.emailSender.Send(r.Context(), to, subject, body); err != nil {
		return false, fmt.Errorf("email delivery failed: %w", err)
	}
	return false, nil
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
