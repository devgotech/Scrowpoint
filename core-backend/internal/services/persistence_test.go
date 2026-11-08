package services

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestPersistentServicesRoundTrip(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	listings := NewListingService(auth)
	orders := NewOrderService(listings, auth)
	escrow := NewEscrowService(orders, auth)
	payments := NewPaymentService("test-secret", escrow, orders, auth)
	disputes := NewDisputeService(orders, escrow, auth)
	kyc := NewKYCService(auth, NewSmileIDClient("", ""))
	moderation := NewModerationService(auth, disputes, orders, kyc)
	notifications := NewNotificationService()
	waitlist := NewWaitlistService()
	support := NewSupportService()

	user, err := auth.SignUp(ctx, SignUpInput{Email: "persist@example.com", Password: "password123", Name: "Persisted User"})
	if err != nil {
		t.Fatal(err)
	}
	draft, err := listings.GetOrCreateDraft(ctx, user.ID)
	if err != nil {
		t.Fatal(err)
	}
	notification, err := notifications.SendNotification(ctx, user.ID, db.NotificationChannelInApp, "TEST", "Persisted", "Message", nil)
	if err != nil {
		t.Fatal(err)
	}
	waitlisted, _, err := waitlist.JoinWaitlist(ctx, WaitlistSignupInput{FullName: "Wait List", Email: "waitlist@example.com"})
	if err != nil {
		t.Fatal(err)
	}
	ticket, err := support.CreateTicket(ctx, CreateSupportTicketInput{SessionID: "persist-session", InitialMessage: "Help"})
	if err != nil {
		t.Fatal(err)
	}

	orderID := uuid.New()
	order := &db.Order{ID: orderID, BuyerID: user.ID}
	orders.Mu.Lock()
	orders.OrdersByID[orderID] = order
	orders.OrdersByBuyer[user.ID] = []uuid.UUID{orderID}
	orders.Mu.Unlock()
	escrow.mu.Lock()
	escrow.ledger[orderID] = []db.EscrowTransaction{{ID: uuid.New(), OrderID: orderID, Reference: "persisted-ledger"}}
	escrow.mu.Unlock()
	payments.mu.Lock()
	payments.payments["persisted-payment"] = &db.Payment{ID: uuid.New(), GatewayReference: "persisted-payment"}
	payments.mu.Unlock()
	disputeID := uuid.New()
	disputes.Mu.Lock()
	disputes.DisputesByID[disputeID] = &db.Dispute{ID: disputeID, OrderID: orderID}
	disputes.Mu.Unlock()
	kyc.Mu.Lock()
	kyc.Verifications[user.ID] = []*db.UserVerification{{ID: uuid.New(), UserID: user.ID, ProviderRef: "persisted-verification"}}
	kyc.activeJobMap["persisted-verification"] = user.ID
	kyc.Mu.Unlock()
	moderation.mu.Lock()
	reportID := uuid.New()
	moderation.reportsByID[reportID] = &db.Report{ID: reportID, ReportedBy: user.ID}
	moderation.mu.Unlock()

	first := PersistentServices{
		Auth: auth, Listings: listings, Orders: orders, Escrow: escrow, Payments: payments,
		Disputes: disputes, KYC: kyc, Moderation: moderation, Notifications: notifications,
		Waitlist: waitlist, Support: support,
	}
	states, err := first.Export()
	if err != nil {
		t.Fatal(err)
	}

	auth2 := NewAuthService()
	listings2 := NewListingService(auth2)
	orders2 := NewOrderService(listings2, auth2)
	escrow2 := NewEscrowService(orders2, auth2)
	payments2 := NewPaymentService("test-secret", escrow2, orders2, auth2)
	disputes2 := NewDisputeService(orders2, escrow2, auth2)
	kyc2 := NewKYCService(auth2, NewSmileIDClient("", ""))
	second := PersistentServices{
		Auth: auth2, Listings: listings2, Orders: orders2, Escrow: escrow2, Payments: payments2,
		Disputes: disputes2, KYC: kyc2,
		Moderation:    NewModerationService(auth2, disputes2, orders2, kyc2),
		Notifications: NewNotificationService(), Waitlist: NewWaitlistService(), Support: NewSupportService(),
	}
	if err := second.Restore(states); err != nil {
		t.Fatal(err)
	}

	if _, err := auth2.GetUserByID(ctx, user.ID); err != nil {
		t.Fatalf("restored user: %v", err)
	}
	restoredDraft, err := listings2.GetOrCreateDraft(ctx, user.ID)
	if err != nil || restoredDraft.ID != draft.ID {
		t.Fatalf("restored listing draft = %v, %v", restoredDraft, err)
	}
	restoredNotifications, err := second.Notifications.ListNotifications(ctx, user.ID, false)
	if err != nil || len(restoredNotifications) != 1 || restoredNotifications[0].ID != notification.ID {
		t.Fatalf("restored notifications = %v, %v", restoredNotifications, err)
	}
	if orders2.OrdersByID[orderID].ID != orderID || escrow2.ledger[orderID][0].Reference != "persisted-ledger" {
		t.Fatal("order or escrow state did not survive restore")
	}
	if payments2.payments["persisted-payment"].GatewayReference != "persisted-payment" {
		t.Fatal("payment state did not survive restore")
	}
	if _, exists := disputes2.DisputesByID[disputeID]; !exists {
		t.Fatal("dispute state did not survive restore")
	}
	if len(kyc2.Verifications[user.ID]) != 1 || second.Moderation.reportsByID[reportID] == nil {
		t.Fatal("KYC or moderation state did not survive restore")
	}
	if status, err := second.Waitlist.GetStatus(ctx, waitlisted.Email, ""); err != nil || status.Entry == nil || status.Entry.ID != waitlisted.ID {
		t.Fatalf("restored waitlist state = %v, %v", status, err)
	}
	if messages, _, err := second.Support.GetMessages(ctx, ticket.Ticket.SessionID); err != nil || len(messages) < 2 {
		t.Fatalf("restored support messages = %v, %v", messages, err)
	}
}
