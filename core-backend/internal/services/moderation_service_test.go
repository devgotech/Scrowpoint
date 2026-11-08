package services

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestCreateListAndDismissReports(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	orders := NewOrderService(NewListingService(auth), auth)
	disputes := NewDisputeService(orders, nil, auth)
	kyc := NewKYCService(auth, NewSmileIDClient("", ""))
	service := NewModerationService(auth, disputes, orders, kyc)
	reporterID := uuid.New()

	report, err := service.CreateReport(ctx, reporterID, CreateReportInput{
		TargetType: db.ReportTargetListing,
		TargetID:   uuid.New(),
		Reason:     "Suspected counterfeit listing",
	})
	if err != nil {
		t.Fatalf("CreateReport returned error: %v", err)
	}
	if report.Status != db.ReportStatusOpen || report.ReportedBy != reporterID {
		t.Errorf("report was not initialized as open: %+v", report)
	}
	if _, err := service.CreateReport(ctx, reporterID, CreateReportInput{TargetID: uuid.New()}); err == nil {
		t.Fatal("CreateReport accepted a missing reason")
	}
	if _, err := service.CreateReport(ctx, reporterID, CreateReportInput{Reason: "missing target"}); err == nil {
		t.Fatal("CreateReport accepted a missing target")
	}

	list, total, err := service.ListReports(ctx, string(db.ReportStatusOpen), 1, 10)
	if err != nil {
		t.Fatalf("ListReports returned error: %v", err)
	}
	if total != 1 || len(list) != 1 || list[0].ID != report.ID {
		t.Errorf("unexpected open report page: total=%d reports=%+v", total, list)
	}

	adminID := uuid.New()
	dismissed, err := service.DismissReport(ctx, report.ID, adminID, "Insufficient evidence")
	if err != nil {
		t.Fatalf("DismissReport returned error: %v", err)
	}
	if dismissed.Status != db.ReportStatusDismissed || dismissed.ReviewedBy == nil ||
		*dismissed.ReviewedBy != adminID || dismissed.ResolutionNotes != "Insufficient evidence" {
		t.Errorf("report dismissal details not recorded: %+v", dismissed)
	}
	if _, err := service.DismissReport(ctx, uuid.New(), adminID, ""); err == nil {
		t.Fatal("DismissReport accepted an unknown report")
	}
}

func TestSuspendUserAndAdminSummary(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	target, err := auth.SignUp(ctx, SignUpInput{
		Email: "moderation-user@example.com", Password: "password-123", Name: "Target",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	listings := NewListingService(auth)
	orders := NewOrderService(listings, auth)
	escrow := NewEscrowService(orders, auth)
	disputes := NewDisputeService(orders, escrow, auth)
	kyc := NewKYCService(auth, NewSmileIDClient("", ""))
	service := NewModerationService(auth, disputes, orders, kyc)

	orders.OrdersByID[uuid.New()] = &db.Order{
		EscrowState: db.EscrowStateInspectionPeriod,
		TotalAmount: 250,
		PlatformFee: 10,
	}
	orders.OrdersByID[uuid.New()] = &db.Order{
		EscrowState: db.EscrowStateCompleted,
		PlatformFee: 5,
	}
	disputes.DisputesByID[uuid.New()] = &db.Dispute{Status: db.DisputeStatusSellerReview}
	disputes.DisputesByID[uuid.New()] = &db.Dispute{Status: db.DisputeStatusResolved}
	kyc.Verifications[target.ID] = []*db.UserVerification{
		{Status: db.KYCPending},
		{Status: db.KYCManualReviewRequired},
		{Status: db.KYCApproved},
	}
	if _, err := service.CreateReport(ctx, target.ID, CreateReportInput{
		TargetID: uuid.New(), Reason: "Open report",
	}); err != nil {
		t.Fatalf("CreateReport returned error: %v", err)
	}

	if err := service.SuspendUser(ctx, target.ID, uuid.New(), "Repeated fraud reports"); err != nil {
		t.Fatalf("SuspendUser returned error: %v", err)
	}
	if !target.IsSuspended {
		t.Fatal("SuspendUser did not suspend target")
	}

	summary, err := service.GetAdminSummary(ctx)
	if err != nil {
		t.Fatalf("GetAdminSummary returned error: %v", err)
	}
	if summary.OpenDisputesCount != 1 || summary.PendingKYCCount != 2 ||
		summary.ActiveReportsCount != 1 || summary.TotalEscrowHeld != 250 ||
		summary.ActiveOrdersCount != 1 || summary.SuspendedUsersCount != 1 ||
		summary.PlatformFeeEarned != 5 || summary.Currency != "NGN" {
		t.Errorf("unexpected admin summary: %+v", summary)
	}

	if err := service.SuspendUser(ctx, uuid.New(), uuid.New(), "not found"); err == nil {
		t.Fatal("SuspendUser accepted unknown user")
	}
}
