package workers

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
	"core-backend/internal/services"
)

func newWorkerServices() (*services.OrderService, *services.EscrowService, *services.DisputeService, *services.NotificationService) {
	authService := services.NewAuthService()
	listingService := services.NewListingService(authService)
	orderService := services.NewOrderService(listingService, authService)
	escrowService := services.NewEscrowService(orderService, authService)
	disputeService := services.NewDisputeService(orderService, escrowService, authService)
	notificationService := services.NewNotificationService()
	return orderService, escrowService, disputeService, notificationService
}

func TestProcessInspectionAutoReleasesOnlyExpiredInspectionOrders(t *testing.T) {
	orderService, escrowService, disputeService, notifications := newWorkerServices()
	ctx := context.Background()

	sellerID := uuid.New()
	buyerID := uuid.New()
	expiredOrder := &db.Order{
		ID:                  uuid.New(),
		BuyerID:             buyerID,
		EscrowState:         db.EscrowStateInspectionPeriod,
		ItemPrice:           100,
		Currency:            "NGN",
		InspectionExpiresAt: timePtr(time.Now().Add(-time.Minute)),
		Listing:             &db.Listing{SellerID: sellerID},
	}
	notExpiredOrder := &db.Order{
		ID:                  uuid.New(),
		EscrowState:         db.EscrowStateInspectionPeriod,
		ItemPrice:           50,
		Currency:            "NGN",
		InspectionExpiresAt: timePtr(time.Now().Add(time.Hour)),
	}
	orderService.OrdersByID[expiredOrder.ID] = expiredOrder
	orderService.OrdersByID[notExpiredOrder.ID] = notExpiredOrder
	if _, err := escrowService.AppendLedgerEntry(ctx, expiredOrder.ID, db.EscrowTxDeposit, 100, "NGN", nil, nil, "deposit-expired", "test"); err != nil {
		t.Fatalf("AppendLedgerEntry returned error: %v", err)
	}

	worker := NewEscrowWorker(orderService, escrowService, disputeService, notifications, time.Second)
	if got := worker.ProcessInspectionAutoReleases(ctx); got != 1 {
		t.Fatalf("released count = %d, want 1", got)
	}
	if expiredOrder.EscrowState != db.EscrowStateCompleted || expiredOrder.CompletedAt == nil {
		t.Errorf("expired order was not completed: %+v", expiredOrder)
	}
	if notExpiredOrder.EscrowState != db.EscrowStateInspectionPeriod {
		t.Errorf("unexpired order changed state: %q", notExpiredOrder.EscrowState)
	}
	sellerNotifications, err := notifications.ListNotifications(ctx, sellerID, false)
	if err != nil {
		t.Fatalf("ListNotifications(seller) returned error: %v", err)
	}
	buyerNotifications, err := notifications.ListNotifications(ctx, buyerID, false)
	if err != nil {
		t.Fatalf("ListNotifications(buyer) returned error: %v", err)
	}
	if len(sellerNotifications) != 2 || len(buyerNotifications) != 1 {
		t.Errorf("unexpected auto-release notifications: seller=%d buyer=%d", len(sellerNotifications), len(buyerNotifications))
	}
}

func TestProcessDisputeDeadlinesDismissesMissingEvidence(t *testing.T) {
	orderService, escrowService, disputeService, notifications := newWorkerServices()
	ctx := context.Background()

	orderID := uuid.New()
	order := &db.Order{
		ID:          orderID,
		BuyerID:     uuid.New(),
		EscrowState: db.EscrowStateDisputed,
		ItemPrice:   100,
		Currency:    "NGN",
	}
	orderService.OrdersByID[orderID] = order
	if _, err := escrowService.AppendLedgerEntry(ctx, orderID, db.EscrowTxDeposit, 100, "NGN", nil, nil, "deposit-dispute", "test"); err != nil {
		t.Fatalf("AppendLedgerEntry returned error: %v", err)
	}

	dispute := &db.Dispute{
		ID:               uuid.New(),
		OrderID:          orderID,
		Status:           db.DisputeStatusEvidenceCollection,
		EvidenceDeadline: timePtr(time.Now().Add(-time.Minute)),
	}
	disputeService.DisputesByID[dispute.ID] = dispute
	worker := NewEscrowWorker(orderService, escrowService, disputeService, notifications, time.Second)

	if got := worker.ProcessDisputeDeadlines(ctx); got != 1 {
		t.Fatalf("processed count = %d, want 1", got)
	}
	if dispute.Status != db.DisputeStatusResolved || dispute.MediationOutcome == nil ||
		*dispute.MediationOutcome != db.MediationOutcomeReleaseToSeller {
		t.Errorf("expired empty-evidence dispute not resolved for seller: %+v", dispute)
	}
	if order.EscrowState != db.EscrowStateReleasedManual {
		t.Errorf("order escrow state = %q, want %q", order.EscrowState, db.EscrowStateReleasedManual)
	}
}

func TestNewEscrowWorkerUsesFallbackInterval(t *testing.T) {
	orderService, escrowService, disputeService, notifications := newWorkerServices()
	worker := NewEscrowWorker(orderService, escrowService, disputeService, notifications, 0)
	if worker.checkInterval != time.Minute {
		t.Errorf("check interval = %v, want %v", worker.checkInterval, time.Minute)
	}
}

func TestEscrowWorkerStartAndStopAreIdempotent(t *testing.T) {
	orderService, escrowService, disputeService, notifications := newWorkerServices()
	worker := NewEscrowWorker(orderService, escrowService, disputeService, notifications, time.Hour)

	worker.Start(context.Background())
	worker.Start(context.Background())
	worker.Stop()
	worker.Stop()

	worker.Start(context.Background())
	worker.Stop()
	if worker.isRunning {
		t.Fatal("worker remains running after Stop")
	}
}

func TestProcessDisputeDeadlinesReleasesExpiredReturnAndSkipsEvidenceCases(t *testing.T) {
	orderService, escrowService, disputeService, notifications := newWorkerServices()
	ctx := context.Background()

	orderID := uuid.New()
	order := &db.Order{
		ID: orderID, BuyerID: uuid.New(), ItemPrice: 100, Currency: "NGN",
		EscrowState: db.EscrowStateDisputed,
	}
	orderService.OrdersByID[orderID] = order
	if _, err := escrowService.AppendLedgerEntry(ctx, orderID, db.EscrowTxDeposit, 100, "NGN", nil, nil, "return-deposit", "test"); err != nil {
		t.Fatalf("AppendLedgerEntry returned error: %v", err)
	}

	expiredReturn := &db.Dispute{
		ID: uuid.New(), OrderID: orderID, Status: db.DisputeStatusAdminMediation,
		ReturnDeadline: timePtr(time.Now().Add(-time.Minute)),
	}
	withEvidence := &db.Dispute{
		ID: uuid.New(), OrderID: uuid.New(), Status: db.DisputeStatusEvidenceCollection,
		EvidenceDeadline: timePtr(time.Now().Add(-time.Minute)),
	}
	disputeService.DisputesByID[expiredReturn.ID] = expiredReturn
	disputeService.DisputesByID[withEvidence.ID] = withEvidence
	disputeService.EvidenceByDsp[withEvidence.ID] = []db.DisputeEvidence{{ID: uuid.New(), DisputeID: withEvidence.ID}}

	worker := NewEscrowWorker(orderService, escrowService, disputeService, notifications, time.Second)
	if got := worker.ProcessDisputeDeadlines(ctx); got != 1 {
		t.Fatalf("processed count = %d, want 1", got)
	}
	if expiredReturn.Status != db.DisputeStatusResolved || order.EscrowState != db.EscrowStateReleasedManual {
		t.Fatalf("expired return was not resolved and released: dispute=%+v order=%+v", expiredReturn, order)
	}
	if withEvidence.Status != db.DisputeStatusEvidenceCollection {
		t.Fatalf("dispute with submitted evidence was changed: %+v", withEvidence)
	}
}

func timePtr(value time.Time) *time.Time {
	return &value
}
