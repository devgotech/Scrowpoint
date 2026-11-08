package services

import (
	"context"
	"strings"
	"testing"
)

func TestJoinWaitlistNormalizesAndReturnsExistingSignup(t *testing.T) {
	service := NewWaitlistService()
	ctx := context.Background()
	input := WaitlistSignupInput{
		FullName: "  Alex Sample ",
		Email:    "  Alex@Example.com ",
		Role:     "buyer",
		City:     " Abuja ",
	}

	entry, claimed, err := service.JoinWaitlist(ctx, input)
	if err != nil {
		t.Fatalf("JoinWaitlist returned error: %v", err)
	}
	if entry.FullName != "Alex Sample" || entry.Email != "alex@example.com" || entry.City != "Abuja" {
		t.Errorf("JoinWaitlist did not normalize fields: %+v", entry)
	}
	if entry.Phone == "" || len(entry.FavoriteGadgets) == 0 || !strings.HasPrefix(entry.ReferralCode, "SP-C1-") {
		t.Errorf("JoinWaitlist defaults or referral code missing: %+v", entry)
	}

	duplicate, duplicateClaimed, err := service.JoinWaitlist(ctx, WaitlistSignupInput{
		FullName: "Different Name",
		Email:    "ALEX@example.com",
	})
	if err != nil {
		t.Fatalf("duplicate JoinWaitlist returned error: %v", err)
	}
	if duplicate.ID != entry.ID || duplicateClaimed != claimed {
		t.Errorf("duplicate signup created a second entry or changed claimed count: entry=%+v claimed=%d", duplicate, duplicateClaimed)
	}
}

func TestJoinWaitlistValidatesRequiredFields(t *testing.T) {
	service := NewWaitlistService()
	for _, testCase := range []struct {
		name  string
		input WaitlistSignupInput
	}{
		{name: "missing name", input: WaitlistSignupInput{Email: "buyer@example.com"}},
		{name: "invalid email", input: WaitlistSignupInput{FullName: "Buyer", Email: "not-an-email"}},
	} {
		t.Run(testCase.name, func(t *testing.T) {
			if _, _, err := service.JoinWaitlist(context.Background(), testCase.input); err == nil {
				t.Fatal("JoinWaitlist accepted invalid required fields")
			}
		})
	}
}

func TestJoinWaitlistReferralUnlocksPriorityAndUpdatesReferrer(t *testing.T) {
	service := NewWaitlistService()
	ctx := context.Background()
	referrer, _, err := service.JoinWaitlist(ctx, WaitlistSignupInput{
		FullName: "Referrer One",
		Email:    "referrer@example.com",
	})
	if err != nil {
		t.Fatalf("JoinWaitlist referrer returned error: %v", err)
	}
	referrerBefore := referrer.ReferralCount

	invitee, _, err := service.JoinWaitlist(ctx, WaitlistSignupInput{
		FullName:   "Invitee Two",
		Email:      "invitee@example.com",
		ReferredBy: strings.ToLower(referrer.ReferralCode),
	})
	if err != nil {
		t.Fatalf("JoinWaitlist invitee returned error: %v", err)
	}
	if !invitee.PriorityUnlocked || invitee.ReferredBy != referrer.ReferralCode {
		t.Errorf("invitee referral priority not recorded: %+v", invitee)
	}

	status, err := service.GetStatus(ctx, referrer.Email, "")
	if err != nil {
		t.Fatalf("GetStatus returned error: %v", err)
	}
	if status.Entry == nil || status.Entry.ReferralCount != referrerBefore+1 || !status.Entry.PriorityUnlocked {
		t.Errorf("referrer was not credited for referral: %+v", status.Entry)
	}
	if status.RemainingSlots != status.TotalSlots-status.ClaimedSlots {
		t.Errorf("remaining slots = %d, total=%d claimed=%d", status.RemainingSlots, status.TotalSlots, status.ClaimedSlots)
	}
}
