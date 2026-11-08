package services

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"core-backend/internal/db"
)

func TestSignUpNormalizesAccountAndRejectsDuplicateEmail(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()

	user, err := service.SignUp(ctx, SignUpInput{
		Email:    "  Buyer@Example.com ",
		Password: "password-123",
		Name:     "  Buyer One ",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	if user.Email != "buyer@example.com" || user.Name != "Buyer One" {
		t.Errorf("SignUp did not normalize account fields: email=%q name=%q", user.Email, user.Name)
	}
	if user.Role != db.RoleBuyer {
		t.Errorf("default role = %q, want %q", user.Role, db.RoleBuyer)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("password-123")); err != nil {
		t.Errorf("stored password is not a valid hash: %v", err)
	}

	if _, err := service.SignUp(ctx, SignUpInput{
		Email:    "buyer@example.com",
		Password: "different-123",
		Name:     "Duplicate",
	}); err == nil {
		t.Fatal("SignUp accepted a duplicate email with different casing")
	}
}

func TestSignUpRejectsMissingFieldsAndShortPassword(t *testing.T) {
	for _, testCase := range []struct {
		name  string
		input SignUpInput
	}{
		{name: "missing email", input: SignUpInput{Password: "password-123", Name: "Buyer"}},
		{name: "missing password", input: SignUpInput{Email: "buyer@example.com", Name: "Buyer"}},
		{name: "missing name", input: SignUpInput{Email: "buyer@example.com", Password: "password-123"}},
		{name: "short password", input: SignUpInput{Email: "buyer@example.com", Password: "short", Name: "Buyer"}},
	} {
		t.Run(testCase.name, func(t *testing.T) {
			if _, err := NewAuthService().SignUp(context.Background(), testCase.input); err == nil {
				t.Fatal("SignUp accepted invalid account details")
			}
		})
	}
}

func TestMediatorInvitationIsSingleUseAndCreatesLimitedVerifiedAccount(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()
	admin, err := service.SignUp(ctx, SignUpInput{
		Email: "admin@example.com", Password: "password-123", Name: "Admin", Role: db.RoleAdmin,
	})
	if err != nil {
		t.Fatal(err)
	}

	token, expiresAt, err := service.CreateMediatorInvitation(ctx, admin.ID, " Mediator@Example.com ")
	if err != nil {
		t.Fatalf("CreateMediatorInvitation returned error: %v", err)
	}
	if expiresAt.Before(time.Now().Add(23*time.Hour)) || expiresAt.After(time.Now().Add(25*time.Hour)) {
		t.Fatalf("invitation expiry = %v, want about 24 hours from now", expiresAt)
	}
	if _, exists := service.MediatorInvitations[hashInvitationToken(token)]; !exists {
		t.Fatal("invitation token was not stored by hash")
	}

	if _, err := service.AcceptMediatorInvitation(ctx, token, "Mediator One", "short-pass"); err == nil {
		t.Fatal("AcceptMediatorInvitation accepted a password shorter than 12 characters")
	}
	user, err := service.AcceptMediatorInvitation(ctx, token, "Mediator One", "mediator-password-123")
	if err != nil {
		t.Fatalf("AcceptMediatorInvitation returned error: %v", err)
	}
	if user.Role != db.RoleMediator || user.Email != "mediator@example.com" || user.EmailVerifiedAt == nil {
		t.Fatalf("invited account has incorrect role, email, or verification state: %+v", user)
	}
	if _, err := service.AcceptMediatorInvitation(ctx, token, "Mediator One", "mediator-password-123"); err == nil {
		t.Fatal("AcceptMediatorInvitation accepted a token more than once")
	}
}

func TestMediatorInvitationRejectsExpiredAndExistingAccounts(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()
	existing, err := service.SignUp(ctx, SignUpInput{
		Email: "existing@example.com", Password: "password-123", Name: "Existing",
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, _, err := service.CreateMediatorInvitation(ctx, uuid.New(), existing.Email); err == nil {
		t.Fatal("CreateMediatorInvitation accepted an email that already has an account")
	}

	token, _, err := service.CreateMediatorInvitation(ctx, uuid.New(), "expired@example.com")
	if err != nil {
		t.Fatal(err)
	}
	service.Mu.Lock()
	service.MediatorInvitations[hashInvitationToken(token)].ExpiresAt = time.Now().Add(-time.Minute)
	service.Mu.Unlock()
	if _, err := service.AcceptMediatorInvitation(ctx, token, "Expired", "mediator-password-123"); err == nil {
		t.Fatal("AcceptMediatorInvitation accepted an expired invitation")
	}
}

func TestLoginCreatesSessionAndRejectsInvalidOrSuspendedAccounts(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()
	user, err := service.SignUp(ctx, SignUpInput{
		Email:    "buyer@example.com",
		Password: "password-123",
		Name:     "Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}

	loggedInUser, session, err := service.Login(ctx, " BUYER@example.com ", "password-123", "test-agent", "127.0.0.1")
	if err != nil {
		t.Fatalf("Login returned error: %v", err)
	}
	if loggedInUser.ID != user.ID || session.UserID != user.ID || session.IsRevoked {
		t.Fatalf("Login returned inconsistent account or session: user=%+v session=%+v", loggedInUser, session)
	}
	if _, _, err := service.Login(ctx, user.Email, "wrong-password", "", ""); err == nil {
		t.Fatal("Login accepted an incorrect password")
	}

	user.IsSuspended = true
	if _, _, err := service.Login(ctx, user.Email, "password-123", "", ""); err == nil {
		t.Fatal("Login accepted a suspended account")
	}
}

func TestEmailVerificationTokenIsSingleUseAndExpires(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()
	user, err := service.SignUp(ctx, SignUpInput{
		Email:    "verify@example.com",
		Password: "password-123",
		Name:     "Verify",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}

	token, err := service.RequestEmailVerification(ctx, user.ID)
	if err != nil {
		t.Fatalf("RequestEmailVerification returned error: %v", err)
	}
	if err := service.VerifyEmail(ctx, token); err != nil {
		t.Fatalf("VerifyEmail returned error: %v", err)
	}
	if user.EmailVerifiedAt == nil {
		t.Fatal("VerifyEmail did not set the verified timestamp")
	}
	if err := service.VerifyEmail(ctx, token); err == nil {
		t.Fatal("VerifyEmail accepted a token more than once")
	}

	expiredToken := uuid.NewString()
	service.TokensByValue[expiredToken] = &VerificationToken{
		Token:     expiredToken,
		UserID:    user.ID,
		TokenType: "email_verify",
		ExpiresAt: time.Now().Add(-time.Minute),
	}
	if err := service.VerifyEmail(ctx, expiredToken); err == nil {
		t.Fatal("VerifyEmail accepted an expired token")
	}
	if _, exists := service.TokensByValue[expiredToken]; exists {
		t.Fatal("VerifyEmail retained an expired token")
	}
}

func TestResetPasswordConsumesTokenAndUpdatesCredentials(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()
	user, err := service.SignUp(ctx, SignUpInput{
		Email:    "reset@example.com",
		Password: "original-password",
		Name:     "Reset",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}

	token, err := service.RequestPasswordReset(ctx, " RESET@example.com ")
	if err != nil || token == "" {
		t.Fatalf("RequestPasswordReset returned token=%q error=%v", token, err)
	}
	if err := service.ResetPassword(ctx, token, "new-password-123"); err != nil {
		t.Fatalf("ResetPassword returned error: %v", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("new-password-123")); err != nil {
		t.Errorf("password hash was not updated: %v", err)
	}
	if _, _, err := service.Login(ctx, user.Email, "new-password-123", "", ""); err != nil {
		t.Errorf("Login with reset password failed: %v", err)
	}
	if err := service.ResetPassword(ctx, token, "another-password"); err == nil {
		t.Fatal("ResetPassword accepted a consumed reset token")
	}

	unknownToken, err := service.RequestPasswordReset(ctx, "unknown@example.com")
	if err != nil || unknownToken != "" {
		t.Errorf("unknown email reset should not reveal an account: token=%q error=%v", unknownToken, err)
	}
}

func TestLogoutRevokesSession(t *testing.T) {
	service := NewAuthService()
	ctx := context.Background()
	user, err := service.SignUp(ctx, SignUpInput{
		Email: "logout@example.com", Password: "password-123", Name: "Logout",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	_, session, err := service.Login(ctx, user.Email, "password-123", "", "")
	if err != nil {
		t.Fatalf("Login returned error: %v", err)
	}
	if err := service.Logout(ctx, session.ID); err != nil {
		t.Fatalf("Logout returned error: %v", err)
	}
	if !session.IsRevoked {
		t.Fatal("Logout did not revoke the session")
	}
}
