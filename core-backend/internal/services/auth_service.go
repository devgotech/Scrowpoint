package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"net/mail"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"core-backend/internal/db"
)

type Session struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"userId"`
	UserAgent string    `json:"userAgent"`
	IPAddress string    `json:"ipAddress"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
	IsRevoked bool      `json:"isRevoked"`
}

type VerificationToken struct {
	Token     string
	UserID    uuid.UUID
	TokenType string
	ExpiresAt time.Time
}

type MediatorInvitation struct {
	Email      string     `json:"email"`
	InvitedBy  uuid.UUID  `json:"invitedBy"`
	ExpiresAt  time.Time  `json:"expiresAt"`
	AcceptedAt *time.Time `json:"acceptedAt,omitempty"`
}

type AuthService struct {
	Mu                  sync.RWMutex
	UsersByID           map[uuid.UUID]*db.User
	UsersByEmail        map[string]*db.User
	Sessions            map[uuid.UUID]*Session
	UserSessions        map[uuid.UUID][]uuid.UUID
	TokensByValue       map[string]*VerificationToken
	MediatorInvitations map[string]*MediatorInvitation
}

func NewAuthService() *AuthService {
	return &AuthService{
		UsersByID:           make(map[uuid.UUID]*db.User),
		UsersByEmail:        make(map[string]*db.User),
		Sessions:            make(map[uuid.UUID]*Session),
		UserSessions:        make(map[uuid.UUID][]uuid.UUID),
		TokensByValue:       make(map[string]*VerificationToken),
		MediatorInvitations: make(map[string]*MediatorInvitation),
	}
}

type SignUpInput struct {
	Email           string      `json:"email"`
	Password        string      `json:"password"`
	Name            string      `json:"name"`
	Phone           string      `json:"phone,omitempty"`
	Location        string      `json:"location,omitempty"`
	Role            db.UserRole `json:"role,omitempty"`
	TermsAcceptedAt *time.Time  `json:"termsAcceptedAt,omitempty"`
	TermsVersion    string      `json:"termsVersion,omitempty"`
}

func (s *AuthService) SignUp(ctx context.Context, in SignUpInput) (*db.User, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	return s.createUserLocked(in, in.Role, false)
}

func (s *AuthService) createUserLocked(in SignUpInput, role db.UserRole, emailVerified bool) (*db.User, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))
	if email == "" || in.Password == "" || in.Name == "" {
		return nil, errors.New("email, password, and name are required")
	}

	if _, exists := s.UsersByEmail[email]; exists {
		return nil, errors.New("an account with this email already exists")
	}

	if len(in.Password) < 8 {
		return nil, errors.New("password must be at least 8 characters long")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	if role == "" {
		role = db.RoleBuyer
	}

	now := time.Now()
	var emailVerifiedAt *time.Time
	if emailVerified {
		emailVerifiedAt = &now
	}
	user := &db.User{
		ID:              uuid.New(),
		Role:            role,
		Email:           email,
		PasswordHash:    string(hashedPassword),
		Name:            strings.TrimSpace(in.Name),
		Phone:           strings.TrimSpace(in.Phone),
		Location:        strings.TrimSpace(in.Location),
		KYCStatus:       db.KYCPending,
		RatingAvg:       5.00,
		RatingCount:     0,
		IsSuspended:     false,
		EmailVerifiedAt: emailVerifiedAt,
		TermsAcceptedAt: in.TermsAcceptedAt,
		TermsVersion:    in.TermsVersion,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	s.UsersByID[user.ID] = user
	s.UsersByEmail[email] = user

	return user, nil
}

func (s *AuthService) CreateMediatorInvitation(ctx context.Context, invitedBy uuid.UUID, email string) (string, time.Time, error) {
	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	parsedEmail, err := mail.ParseAddress(cleanEmail)
	if err != nil || parsedEmail.Address != cleanEmail {
		return "", time.Time{}, errors.New("a valid email address is required")
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", time.Time{}, fmt.Errorf("generate mediator invitation token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)
	tokenHash := hashInvitationToken(token)
	expiresAt := time.Now().Add(24 * time.Hour)

	s.Mu.Lock()
	defer s.Mu.Unlock()
	if _, exists := s.UsersByEmail[cleanEmail]; exists {
		return "", time.Time{}, errors.New("an account with this email already exists")
	}
	now := time.Now()
	for hash, invitation := range s.MediatorInvitations {
		if invitation.AcceptedAt != nil || !invitation.ExpiresAt.After(now) ||
			(invitation.Email == cleanEmail && invitation.AcceptedAt == nil) {
			delete(s.MediatorInvitations, hash)
		}
	}
	s.MediatorInvitations[tokenHash] = &MediatorInvitation{
		Email:     cleanEmail,
		InvitedBy: invitedBy,
		ExpiresAt: expiresAt,
	}
	return token, expiresAt, nil
}

func (s *AuthService) AcceptMediatorInvitation(ctx context.Context, token, name, password string) (*db.User, error) {
	if strings.TrimSpace(name) == "" {
		return nil, errors.New("name is required")
	}
	if len(password) < 12 {
		return nil, errors.New("password must be at least 12 characters long")
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	tokenHash := hashInvitationToken(strings.TrimSpace(token))
	invitation, exists := s.MediatorInvitations[tokenHash]
	if !exists || invitation.AcceptedAt != nil {
		return nil, errors.New("invalid or already used mediator invitation")
	}
	if time.Now().After(invitation.ExpiresAt) {
		delete(s.MediatorInvitations, tokenHash)
		return nil, errors.New("mediator invitation has expired")
	}

	user, err := s.createUserLocked(SignUpInput{
		Email:    invitation.Email,
		Password: password,
		Name:     name,
	}, db.RoleMediator, true)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	invitation.AcceptedAt = &now
	return user, nil
}

// StaffMember is the admin-facing view of an admin or mediator account.
type StaffMember struct {
	ID        uuid.UUID   `json:"id"`
	Name      string      `json:"name"`
	Email     string      `json:"email"`
	Role      db.UserRole `json:"role"`
	IsActive  bool        `json:"isActive"`
	CreatedAt time.Time   `json:"createdAt"`
}

// PendingStaffInvitation is an unaccepted, unexpired mediator invitation.
type PendingStaffInvitation struct {
	Email     string    `json:"email"`
	InvitedBy uuid.UUID `json:"invitedBy"`
	ExpiresAt time.Time `json:"expiresAt"`
}

// ListStaff returns every admin and mediator account plus pending invitations.
func (s *AuthService) ListStaff(_ context.Context) ([]StaffMember, []PendingStaffInvitation) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()
	staff := make([]StaffMember, 0)
	for _, u := range s.UsersByID {
		if u.Role != db.RoleAdmin && u.Role != db.RoleMediator {
			continue
		}
		staff = append(staff, StaffMember{
			ID: u.ID, Name: u.Name, Email: u.Email, Role: u.Role,
			IsActive: !u.IsSuspended, CreatedAt: u.CreatedAt,
		})
	}
	sort.Slice(staff, func(i, j int) bool {
		if staff[i].Role != staff[j].Role {
			return staff[i].Role == db.RoleAdmin
		}
		return staff[i].CreatedAt.Before(staff[j].CreatedAt)
	})
	now := time.Now()
	pending := make([]PendingStaffInvitation, 0)
	for _, inv := range s.MediatorInvitations {
		if inv.AcceptedAt == nil && inv.ExpiresAt.After(now) {
			pending = append(pending, PendingStaffInvitation{Email: inv.Email, InvitedBy: inv.InvitedBy, ExpiresAt: inv.ExpiresAt})
		}
	}
	sort.Slice(pending, func(i, j int) bool { return pending[i].ExpiresAt.Before(pending[j].ExpiresAt) })
	return staff, pending
}

// SetStaffActive deactivates or reactivates an admin or mediator. Deactivating
// signs them out everywhere at once. An admin cannot deactivate themselves,
// and the last active admin can never be deactivated.
func (s *AuthService) SetStaffActive(_ context.Context, actorID, targetID uuid.UUID, active bool) (*StaffMember, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()
	target, exists := s.UsersByID[targetID]
	if !exists || (target.Role != db.RoleAdmin && target.Role != db.RoleMediator) {
		return nil, errors.New("staff member not found")
	}
	if !active {
		if targetID == actorID {
			return nil, errors.New("you cannot deactivate your own account")
		}
		if target.Role == db.RoleAdmin {
			activeAdmins := 0
			for _, u := range s.UsersByID {
				if u.Role == db.RoleAdmin && !u.IsSuspended {
					activeAdmins++
				}
			}
			if activeAdmins <= 1 && !target.IsSuspended {
				return nil, errors.New("cannot deactivate the last active admin")
			}
		}
	}
	target.IsSuspended = !active
	target.UpdatedAt = time.Now()
	if !active {
		s.revokeAllSessionsLocked(targetID)
	}
	return &StaffMember{
		ID: target.ID, Name: target.Name, Email: target.Email, Role: target.Role,
		IsActive: !target.IsSuspended, CreatedAt: target.CreatedAt,
	}, nil
}

// RevokeMediatorInvitation cancels any pending invitation for the email.
func (s *AuthService) RevokeMediatorInvitation(_ context.Context, email string) bool {
	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	s.Mu.Lock()
	defer s.Mu.Unlock()
	revoked := false
	for hash, inv := range s.MediatorInvitations {
		if inv.Email == cleanEmail && inv.AcceptedAt == nil {
			delete(s.MediatorInvitations, hash)
			revoked = true
		}
	}
	return revoked
}

func hashInvitationToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (s *AuthService) Login(ctx context.Context, email, password, userAgent, ip string) (*db.User, *Session, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	user, exists := s.UsersByEmail[cleanEmail]
	if !exists {
		return nil, nil, errors.New("invalid email or password")
	}

	if user.IsSuspended {
		return nil, nil, errors.New("account is suspended")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, nil, errors.New("invalid email or password")
	}

	return user, s.createSessionLocked(user.ID, userAgent, ip, SessionTTL), nil
}

// RepairAdminPassword sets the password on an existing admin account that has
// no stored password hash. Older builds dropped hashes when saving state, which
// left accounts unable to sign in after a restart. It never overwrites a
// working password and only touches admin accounts. It reports whether it
// changed anything.
func (s *AuthService) RepairAdminPassword(ctx context.Context, email, password string) (bool, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	user, exists := s.UsersByEmail[strings.ToLower(strings.TrimSpace(email))]
	if !exists || user.Role != db.RoleAdmin || user.PasswordHash != "" {
		return false, nil
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return false, errors.New("failed to hash password")
	}
	user.PasswordHash = string(hashedPassword)
	user.UpdatedAt = time.Now()
	return true, nil
}

// SessionTTL is how long an issued login session (and its token) stays valid.
const SessionTTL = 7 * 24 * time.Hour

// ErrSessionInvalid means a token's session was revoked, expired, never
// issued, or belongs to a suspended or missing account.
var ErrSessionInvalid = errors.New("session is no longer valid")

func (s *AuthService) createSessionLocked(userID uuid.UUID, userAgent, ip string, ttl time.Duration) *Session {
	now := time.Now()
	session := &Session{
		ID:        uuid.New(),
		UserID:    userID,
		UserAgent: userAgent,
		IPAddress: ip,
		CreatedAt: now,
		ExpiresAt: now.Add(ttl),
	}
	s.Sessions[session.ID] = session
	s.UserSessions[userID] = append(s.UserSessions[userID], session.ID)
	return session
}

// CreateSession registers a server-side session for a user who was just
// authenticated by another flow (e.g. sign-up), so its token can be revoked.
func (s *AuthService) CreateSession(_ context.Context, userID uuid.UUID, userAgent, ip string) (*Session, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()
	user, exists := s.UsersByID[userID]
	if !exists {
		return nil, errors.New("user not found")
	}
	if user.IsSuspended {
		return nil, errors.New("account is suspended")
	}
	return s.createSessionLocked(userID, userAgent, ip, SessionTTL), nil
}

// ValidateSession is called on every authenticated request. It rejects tokens
// whose session was revoked or expired, or whose account is suspended, and
// returns the account's current role so role changes take effect immediately.
func (s *AuthService) ValidateSession(_ context.Context, userID, sessionID uuid.UUID) (db.UserRole, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()
	session, exists := s.Sessions[sessionID]
	if !exists || session.UserID != userID || session.IsRevoked || !time.Now().Before(session.ExpiresAt) {
		return "", ErrSessionInvalid
	}
	user, exists := s.UsersByID[userID]
	if !exists || user.IsSuspended {
		return "", ErrSessionInvalid
	}
	return user.Role, nil
}

// RevokeAllSessions signs a user out everywhere.
func (s *AuthService) RevokeAllSessions(_ context.Context, userID uuid.UUID) {
	s.Mu.Lock()
	defer s.Mu.Unlock()
	s.revokeAllSessionsLocked(userID)
}

func (s *AuthService) revokeAllSessionsLocked(userID uuid.UUID) {
	for _, sid := range s.UserSessions[userID] {
		if sess, ok := s.Sessions[sid]; ok {
			sess.IsRevoked = true
		}
	}
}

func (s *AuthService) OAuthLogin(ctx context.Context, provider, email, name, providerUID, userAgent, ip string) (*db.User, *Session, error) {
	return s.OAuthLoginWithTerms(ctx, provider, email, name, providerUID, userAgent, ip, nil, "")
}

func (s *AuthService) OAuthLoginWithTerms(
	ctx context.Context,
	provider, email, name, providerUID, userAgent, ip string,
	termsAcceptedAt *time.Time,
	termsVersion string,
) (*db.User, *Session, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	if cleanEmail == "" {
		return nil, nil, errors.New("email is required for OAuth login")
	}

	user, exists := s.UsersByEmail[cleanEmail]
	now := time.Now()

	if !exists {
		if termsAcceptedAt == nil || termsVersion == "" {
			return nil, nil, errors.New("accepting the terms of service is required to create an account")
		}
		randomBytes := make([]byte, 24)
		_, _ = rand.Read(randomBytes)
		randomPassword, _ := bcrypt.GenerateFromPassword(randomBytes, bcrypt.DefaultCost)

		user = &db.User{
			ID:              uuid.New(),
			Role:            db.RoleBuyer,
			Email:           cleanEmail,
			PasswordHash:    string(randomPassword),
			Name:            strings.TrimSpace(name),
			KYCStatus:       db.KYCPending,
			RatingAvg:       5.00,
			RatingCount:     0,
			IsSuspended:     false,
			EmailVerifiedAt: &now,
			TermsAcceptedAt: termsAcceptedAt,
			TermsVersion:    termsVersion,
			CreatedAt:       now,
			UpdatedAt:       now,
		}

		s.UsersByID[user.ID] = user
		s.UsersByEmail[cleanEmail] = user
	} else if user.IsSuspended {
		return nil, nil, errors.New("account is suspended")
	}

	sessionID := uuid.New()
	session := &Session{
		ID:        sessionID,
		UserID:    user.ID,
		UserAgent: userAgent,
		IPAddress: ip,
		CreatedAt: now,
		ExpiresAt: now.Add(7 * 24 * time.Hour),
		IsRevoked: false,
	}

	s.Sessions[sessionID] = session
	s.UserSessions[user.ID] = append(s.UserSessions[user.ID], sessionID)

	return user, session, nil
}

func (s *AuthService) Logout(ctx context.Context, sessionID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	session, exists := s.Sessions[sessionID]
	if !exists {
		return nil
	}
	session.IsRevoked = true
	return nil
}

func (s *AuthService) GetUserByID(ctx context.Context, userID uuid.UUID) (*db.User, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	user, exists := s.UsersByID[userID]
	if !exists || user.DeletedAt != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *AuthService) RequestEmailVerification(ctx context.Context, userID uuid.UUID) (string, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	token, err := generateUniqueEmailOTP(s.TokensByValue)
	if err != nil {
		return "", err
	}
	s.TokensByValue[token] = &VerificationToken{
		Token:     token,
		UserID:    userID,
		TokenType: "email_verify",
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	return token, nil
}

func (s *AuthService) VerifyEmail(ctx context.Context, tokenStr string) error {
	return s.verifyEmail(ctx, uuid.Nil, tokenStr)
}

func (s *AuthService) VerifyEmailForUser(ctx context.Context, userID uuid.UUID, tokenStr string) error {
	if userID == uuid.Nil {
		return errors.New("authenticated user is required")
	}
	return s.verifyEmail(ctx, userID, tokenStr)
}

func (s *AuthService) verifyEmail(_ context.Context, userID uuid.UUID, tokenStr string) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	tokenRecord, exists := s.TokensByValue[tokenStr]
	if !exists || tokenRecord.TokenType != "email_verify" ||
		(userID != uuid.Nil && tokenRecord.UserID != userID) {
		return errors.New("invalid or expired verification token")
	}

	if time.Now().After(tokenRecord.ExpiresAt) {
		delete(s.TokensByValue, tokenStr)
		return errors.New("verification token has expired")
	}

	user, exists := s.UsersByID[tokenRecord.UserID]
	if !exists {
		return errors.New("user not found")
	}

	now := time.Now()
	user.EmailVerifiedAt = &now
	user.UpdatedAt = now

	delete(s.TokensByValue, tokenStr)
	return nil
}

func generateUniqueEmailOTP(existing map[string]*VerificationToken) (string, error) {
	for attempt := 0; attempt < 10; attempt++ {
		code, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
		if err != nil {
			return "", fmt.Errorf("generate email verification code: %w", err)
		}
		token := fmt.Sprintf("%06d", code.Int64())
		if _, exists := existing[token]; !exists {
			return token, nil
		}
	}
	return "", errors.New("could not generate a unique email verification code")
}

func (s *AuthService) RequestPasswordReset(ctx context.Context, email string) (string, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	user, exists := s.UsersByEmail[cleanEmail]
	if !exists {
		return "", nil
	}

	token := generateSecureToken()
	s.TokensByValue[token] = &VerificationToken{
		Token:     token,
		UserID:    user.ID,
		TokenType: "password_reset",
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	return token, nil
}

func (s *AuthService) ResetPassword(ctx context.Context, tokenStr, newPassword string) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	if len(newPassword) < 8 {
		return errors.New("new password must be at least 8 characters long")
	}

	tokenRecord, exists := s.TokensByValue[tokenStr]
	if !exists || tokenRecord.TokenType != "password_reset" {
		return errors.New("invalid or expired reset token")
	}

	if time.Now().After(tokenRecord.ExpiresAt) {
		delete(s.TokensByValue, tokenStr)
		return errors.New("reset token has expired")
	}

	user, exists := s.UsersByID[tokenRecord.UserID]
	if !exists {
		return errors.New("user not found")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash new password")
	}

	user.PasswordHash = string(hashedPassword)
	user.UpdatedAt = time.Now()

	delete(s.TokensByValue, tokenStr)
	return nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID uuid.UUID, oldPassword, newPassword string) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	user, exists := s.UsersByID[userID]
	if !exists {
		return errors.New("user not found")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
		return errors.New("incorrect current password")
	}

	if len(newPassword) < 8 {
		return errors.New("new password must be at least 8 characters long")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	user.PasswordHash = string(hashedPassword)
	user.UpdatedAt = time.Now()
	return nil
}

func (s *AuthService) ListSessions(ctx context.Context, userID uuid.UUID) ([]Session, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	sessionIDs := s.UserSessions[userID]
	var activeSessions []Session

	for _, sid := range sessionIDs {
		sess, ok := s.Sessions[sid]
		if ok && !sess.IsRevoked && time.Now().Before(sess.ExpiresAt) {
			activeSessions = append(activeSessions, *sess)
		}
	}
	return activeSessions, nil
}

func (s *AuthService) RevokeSession(ctx context.Context, userID, sessionID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	sess, exists := s.Sessions[sessionID]
	if !exists || sess.UserID != userID {
		return errors.New("session not found")
	}
	sess.IsRevoked = true
	return nil
}

func generateSecureToken() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
