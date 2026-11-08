package services

import (
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func newDisputeServiceFixture(state db.EscrowState) (*DisputeService, *db.Order, uuid.UUID) {
	authService := NewAuthService()
	listingService := NewListingService(authService)
	orderService := NewOrderService(listingService, authService)

	buyerID := uuid.New()
	listingID := uuid.New()
	order := &db.Order{
		ID:          uuid.New(),
		ListingID:   listingID,
		BuyerID:     buyerID,
		EscrowState: state,
	}
	listingService.ListingsByID[listingID] = &db.Listing{
		ID:       listingID,
		SellerID: uuid.New(),
	}
	orderService.OrdersByID[order.ID] = order

	return NewDisputeService(orderService, nil, authService), order, buyerID
}

func TestOpenDisputeFreezesOrderAndCreatesEvidenceCollection(t *testing.T) {
	service, order, buyerID := newDisputeServiceFixture(db.EscrowStateInspectionPeriod)

	dispute, err := service.OpenDispute(context.Background(), buyerID, OpenDisputeInput{
		OrderID:   order.ID,
		IssueType: "not_as_described",
		Notes:     "Device condition differs from listing",
	})
	if err != nil {
		t.Fatalf("OpenDispute returned error: %v", err)
	}
	if dispute.Status != db.DisputeStatusEvidenceCollection {
		t.Errorf("dispute status = %q, want %q", dispute.Status, db.DisputeStatusEvidenceCollection)
	}
	if dispute.OrderID != order.ID || dispute.IssueType != "not_as_described" {
		t.Errorf("dispute does not retain its order and issue type: %+v", dispute)
	}
	if dispute.EvidenceDeadline == nil {
		t.Fatal("OpenDispute did not set an evidence deadline")
	}
	if order.EscrowState != db.EscrowStateDisputed {
		t.Errorf("order escrow state = %q, want %q", order.EscrowState, db.EscrowStateDisputed)
	}

	timeline, err := service.GetTimeline(context.Background(), dispute.ID)
	if err != nil {
		t.Fatalf("GetTimeline returned error: %v", err)
	}
	if len(timeline) != 1 || timeline[0].Action != "DISPUTE_OPENED" {
		t.Errorf("unexpected dispute timeline: %+v", timeline)
	}
}

func TestOpenDisputeRejectsIneligibleAndUnauthorizedOrders(t *testing.T) {
	t.Run("ineligible escrow state", func(t *testing.T) {
		service, order, buyerID := newDisputeServiceFixture(db.EscrowStateCreated)
		_, err := service.OpenDispute(context.Background(), buyerID, OpenDisputeInput{OrderID: order.ID})
		if err == nil || !strings.Contains(err.Error(), "cannot open dispute") {
			t.Fatalf("OpenDispute error = %v, want ineligible escrow state error", err)
		}
	})

	t.Run("order not owned by caller", func(t *testing.T) {
		service, order, _ := newDisputeServiceFixture(db.EscrowStateInTransit)
		_, err := service.OpenDispute(context.Background(), uuid.New(), OpenDisputeInput{OrderID: order.ID})
		if err == nil || !strings.Contains(err.Error(), "forbidden") {
			t.Fatalf("OpenDispute error = %v, want authorization error", err)
		}
	})
}

func TestEvidenceMustExistBeforeFinalization(t *testing.T) {
	service, _, buyerID := newDisputeServiceFixture(db.EscrowStateInTransit)
	dispute := &db.Dispute{
		ID:     uuid.New(),
		Status: db.DisputeStatusEvidenceCollection,
	}
	service.DisputesByID[dispute.ID] = dispute

	if _, err := service.FinalizeEvidenceSubmission(context.Background(), dispute.ID, buyerID); err == nil {
		t.Fatal("FinalizeEvidenceSubmission accepted an empty evidence list")
	}

	evidence, err := service.SubmitEvidence(context.Background(), dispute.ID, buyerID, SubmitEvidenceInput{
		EvidenceType: db.EvidenceTypeVideo,
		MediaURL:     "dispute_evidence/user/video.mp4",
		Description:  "Device inspection",
	})
	if err != nil {
		t.Fatalf("SubmitEvidence returned error: %v", err)
	}
	if evidence.DisputeID != dispute.ID || evidence.SubmittedBy != buyerID {
		t.Errorf("evidence was not associated with its dispute and submitter: %+v", evidence)
	}

	finalized, err := service.FinalizeEvidenceSubmission(context.Background(), dispute.ID, buyerID)
	if err != nil {
		t.Fatalf("FinalizeEvidenceSubmission returned error: %v", err)
	}
	if finalized.Status != db.DisputeStatusSellerReview || finalized.SellerResponseDeadline == nil {
		t.Errorf("evidence finalization did not start seller review: %+v", finalized)
	}

	disputeCopy, err := service.GetDisputeByID(context.Background(), dispute.ID)
	if err != nil {
		t.Fatalf("GetDisputeByID returned error: %v", err)
	}
	if len(disputeCopy.Evidence) != 1 || disputeCopy.Evidence[0].MediaURL != evidence.MediaURL {
		t.Errorf("retrieved dispute does not include its evidence: %+v", disputeCopy.Evidence)
	}
}
