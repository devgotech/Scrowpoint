package services

import (
	"context"
	"testing"

	"core-backend/internal/db"
)

func TestRepairAdminPasswordOnlyFixesUnusableAdmins(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	admin, _ := auth.SignUp(ctx, SignUpInput{Email: "boot-admin@example.com", Password: "original-pass-123", Name: "Admin", Role: db.RoleAdmin})
	buyer, _ := auth.SignUp(ctx, SignUpInput{Email: "boot-buyer@example.com", Password: "buyer-pass-123", Name: "Buyer"})

	if repaired, _ := auth.RepairAdminPassword(ctx, admin.Email, "other-pass-12345"); repaired {
		t.Fatal("a working admin password was overwritten")
	}
	if _, _, err := auth.Login(ctx, admin.Email, "original-pass-123", "", ""); err != nil {
		t.Fatalf("original admin password stopped working: %v", err)
	}

	// Simulate an account restored by an older build that dropped the hash.
	auth.Mu.Lock()
	admin.PasswordHash = ""
	buyer.PasswordHash = ""
	auth.Mu.Unlock()

	if repaired, _ := auth.RepairAdminPassword(ctx, buyer.Email, "takeover-pass-123"); repaired {
		t.Fatal("a non-admin account was given a password by the admin repair")
	}
	if repaired, err := auth.RepairAdminPassword(ctx, "BOOT-ADMIN@example.com ", "bootstrap-pass-123"); err != nil || !repaired {
		t.Fatalf("unusable admin not repaired: %v, %v", repaired, err)
	}
	if _, _, err := auth.Login(ctx, admin.Email, "bootstrap-pass-123", "", ""); err != nil {
		t.Fatalf("repaired admin cannot sign in: %v", err)
	}
}
