package services

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func escrowTestFixture(state db.EscrowState) (*EscrowService, *OrderService, *db.Order, uuid.UUID) {
	auth := NewAuthService()
	listings := NewListingService(auth)
	orders := NewOrderService(listings, auth)
	buyerID := uuid.New()
	order := &db.Order{
		ID:          uuid.New(),
		BuyerID:     buyerID,
		EscrowState: state,
		ItemPrice:   100,
		PlatformFee: 5,
		TotalAmount: 105,
		Currency:    "NGN",
		Listing:     &db.Listing{SellerID: uuid.New()},
	}
	listings.ListingsByID[order.ListingID] = order.Listing
	orders.OrdersByID[order.ID] = order
	return NewEscrowService(orders, auth), orders, order, buyerID
}

func TestAppendLedgerEntryTracksBalanceAndRejectsOverspend(t *testing.T) {
	service, _, order, buyerID := escrowTestFixture(db.EscrowStateCreated)
	ctx := context.Background()

	deposit, err := service.AppendLedgerEntry(ctx, order.ID, db.EscrowTxDeposit, 105, "NGN", &buyerID, nil, "deposit-1", "")
	if err != nil {
		t.Fatalf("deposit entry failed: %v", err)
	}
	if deposit.BalanceAfter != 105 {
		t.Errorf("deposit balance = %.2f, want 105", deposit.BalanceAfter)
	}
	fee, err := service.AppendLedgerEntry(ctx, order.ID, db.EscrowTxPlatformFee, 5, "NGN", nil, nil, "fee-1", "")
	if err != nil {
		t.Fatalf("platform fee entry failed: %v", err)
	}
	if fee.BalanceAfter != 100 {
		t.Errorf("post-fee balance = %.2f, want 100", fee.BalanceAfter)
	}
	if _, err := service.AppendLedgerEntry(ctx, order.ID, db.EscrowTxRelease, 101, "NGN", nil, nil, "release-too-much", ""); err == nil {
		t.Fatal("ledger allowed a debit larger than available balance")
	}
	if _, err := service.AppendLedgerEntry(ctx, order.ID, db.EscrowTxDeposit, -1, "NGN", nil, nil, "negative", ""); err == nil {
		t.Fatal("ledger accepted a negative transaction amount")
	}
}

func TestFundEscrowAndStartInspectionPeriod(t *testing.T) {
	service, _, order, buyerID := escrowTestFixture(db.EscrowStateCreated)
	ctx := context.Background()

	funded, err := service.FundEscrow(ctx, order.ID, buyerID, db.PaymentMethodCard, "gateway-123")
	if err != nil {
		t.Fatalf("FundEscrow returned error: %v", err)
	}
	if funded.EscrowState != db.EscrowStateFundsHeld {
		t.Errorf("funded state = %q, want funds held", funded.EscrowState)
	}
	ledger, err := service.GetLedger(ctx, order.ID, buyerID)
	if err != nil {
		t.Fatalf("GetLedger returned error: %v", err)
	}
	if len(ledger) != 2 || ledger[0].TransactionType != db.EscrowTxDeposit ||
		ledger[0].Reference != "gateway-123" || ledger[1].TransactionType != db.EscrowTxPlatformFee {
		t.Errorf("unexpected funding ledger: %+v", ledger)
	}

	if _, err := service.TransitionToInTransit(ctx, order.ID, order.Listing.SellerID, "TRACK-123", "Test Courier"); err != nil {
		t.Fatalf("TransitionToInTransit returned error: %v", err)
	}
	inspection, err := service.StartInspectionPeriod(ctx, order.ID)
	if err != nil {
		t.Fatalf("StartInspectionPeriod returned error: %v", err)
	}
	if inspection.EscrowState != db.EscrowStateInspectionPeriod ||
		inspection.InspectionExpiresAt == nil ||
		time.Until(*inspection.InspectionExpiresAt) < 47*time.Hour {
		t.Errorf("inspection window not initialized as expected: %+v", inspection)
	}
}

func TestEscrowStatusAndLedgerEnforceOrderAccess(t *testing.T) {
	service, _, order, buyerID := escrowTestFixture(db.EscrowStateFundsHeld)
	ctx := context.Background()
	if _, err := service.AppendLedgerEntry(ctx, order.ID, db.EscrowTxDeposit, 105, "NGN", nil, nil, "deposit", ""); err != nil {
		t.Fatalf("AppendLedgerEntry returned error: %v", err)
	}

	status, err := service.GetEscrowStatus(ctx, order.ID, buyerID)
	if err != nil {
		t.Fatalf("GetEscrowStatus returned error: %v", err)
	}
	if status.OrderID != order.ID || status.EscrowState != db.EscrowStateFundsHeld || status.LedgerEntriesCount != 1 {
		t.Errorf("unexpected escrow status: %+v", status)
	}
	if _, err := service.GetLedger(ctx, order.ID, uuid.New()); err == nil || !strings.Contains(err.Error(), "forbidden") {
		t.Errorf("GetLedger unauthorized error = %v, want forbidden", err)
	}
}
