package services

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestUpdateProfileAndAvatar(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	user, err := auth.SignUp(ctx, SignUpInput{
		Email: "profile@example.com", Password: "password-123", Name: "Original Name",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	service := NewUserService(auth)

	updated, err := service.UpdateProfile(ctx, user.ID, UpdateProfileInput{
		Name:     "  Updated Name ",
		Phone:    " +2348000000000 ",
		Location: " Lagos ",
	})
	if err != nil {
		t.Fatalf("UpdateProfile returned error: %v", err)
	}
	if updated.Name != "Updated Name" || updated.Phone != "+2348000000000" || updated.Location != "Lagos" {
		t.Errorf("profile fields were not normalized: %+v", updated)
	}
	if _, err := service.UpdateAvatar(ctx, user.ID, ""); err == nil {
		t.Fatal("UpdateAvatar accepted an empty URL")
	}
	if _, err := service.UpdateAvatar(ctx, user.ID, "https://cdn.example.test/avatar.webp"); err != nil {
		t.Fatalf("UpdateAvatar returned error: %v", err)
	}

	user.KYCStatus = db.KYCApproved
	profile, err := service.GetPublicProfile(ctx, user.ID)
	if err != nil {
		t.Fatalf("GetPublicProfile returned error: %v", err)
	}
	if profile.Name != updated.Name || profile.AvatarURL != user.AvatarURL || !profile.IsKYCVerified {
		t.Errorf("public profile did not reflect user data: %+v", profile)
	}
	if _, err := service.GetPublicProfile(ctx, uuid.New()); err == nil {
		t.Fatal("GetPublicProfile returned an unknown user")
	}
}
