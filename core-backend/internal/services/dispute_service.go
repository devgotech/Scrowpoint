package services

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type OpenDisputeInput struct {
	OrderID   uuid.UUID `json:"orderId"`
	IssueType string    `json:"issueType"`
	Notes     string    `json:"notes,omitempty"`
}

type SubmitEvidenceInput struct {
	EvidenceType db.EvidenceType `json:"evidenceType"`
	MediaURL     string          `json:"mediaUrl"`
	Description  string          `json:"description,omitempty"`
}

type SellerResponseInput struct {
	Decision string `json:"decision"`
	Notes    string `json:"notes"`
}

type SubCaseInput struct {
	IssueType   string `json:"issueType"`
	Description string `json:"description"`
}

type DisputeVerdictInput struct {
	Outcome db.MediationOutcome `json:"outcome"`
	Notes   string              `json:"notes"`
}

type AppealInput struct {
	Reason string `json:"reason"`
}

type DisputeTimelineItem struct {
	Timestamp   time.Time `json:"timestamp"`
	Actor       string    `json:"actor"`
	Action      string    `json:"action"`
	Description string    `json:"description"`
}

type DisputeService struct {
	Mu            sync.RWMutex
	DisputesByID  map[uuid.UUID]*db.Dispute
	EvidenceByDsp map[uuid.UUID][]db.DisputeEvidence
	AppealsByDsp  map[uuid.UUID]*db.Appeal
	Timelines     map[uuid.UUID][]DisputeTimelineItem
	orderService  *OrderService
	escrowService *EscrowService
	authService   *AuthService
}

func NewDisputeService(
	orderService *OrderService,
	escrowService *EscrowService,
	authService *AuthService,
) *DisputeService {
	return &DisputeService{
		DisputesByID:  make(map[uuid.UUID]*db.Dispute),
		EvidenceByDsp: make(map[uuid.UUID][]db.DisputeEvidence),
		AppealsByDsp:  make(map[uuid.UUID]*db.Appeal),
		Timelines:     make(map[uuid.UUID][]DisputeTimelineItem),
		orderService:  orderService,
		escrowService: escrowService,
		authService:   authService,
	}
}

func (s *DisputeService) OpenDispute(ctx context.Context, buyerID uuid.UUID, in OpenDisputeInput) (*db.Dispute, error) {
	order, err := s.orderService.GetOrderByID(ctx, in.OrderID, buyerID)
	if err != nil {
		return nil, err
	}

	if order.BuyerID != buyerID {
		return nil, errors.New("forbidden: only the buyer can initiate a dispute on this order")
	}

	if order.EscrowState != db.EscrowStateInspectionPeriod && order.EscrowState != db.EscrowStateInTransit {
		return nil, fmt.Errorf("cannot open dispute on order with state: %s", order.EscrowState)
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	now := time.Now()
	evidenceDeadline := now.Add(24 * time.Hour)

	dispute := &db.Dispute{
		ID:               uuid.New(),
		OrderID:          order.ID,
		IssueType:        in.IssueType,
		Status:           db.DisputeStatusEvidenceCollection,
		EvidenceDeadline: &evidenceDeadline,
		MediatorNotes:    in.Notes,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	s.orderService.Mu.Lock()
	order.EscrowState = db.EscrowStateDisputed
	order.UpdatedAt = now
	s.orderService.Mu.Unlock()

	s.DisputesByID[dispute.ID] = dispute
	s.appendTimelineLocked(dispute.ID, "buyer", "DISPUTE_OPENED", fmt.Sprintf("Dispute opened for issue: %s. Escrow funds hard-frozen.", in.IssueType))

	return dispute, nil
}

func (s *DisputeService) SubmitEvidence(ctx context.Context, disputeID, userID uuid.UUID, in SubmitEvidenceInput) (*db.DisputeEvidence, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	if dispute.Status != db.DisputeStatusOpen && dispute.Status != db.DisputeStatusEvidenceCollection {
		return nil, fmt.Errorf("cannot submit evidence when dispute is in %s status", dispute.Status)
	}

	if in.MediaURL == "" {
		return nil, errors.New("mediaUrl is required")
	}

	now := time.Now()
	evidence := db.DisputeEvidence{
		ID:           uuid.New(),
		DisputeID:    dispute.ID,
		SubmittedBy:  userID,
		EvidenceType: in.EvidenceType,
		MediaURL:     in.MediaURL,
		Description:  in.Description,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	s.EvidenceByDsp[dispute.ID] = append(s.EvidenceByDsp[dispute.ID], evidence)
	s.appendTimelineLocked(dispute.ID, "user", "EVIDENCE_SUBMITTED", fmt.Sprintf("Uploaded %s evidence: %s", in.EvidenceType, in.Description))

	return &evidence, nil
}

func (s *DisputeService) FinalizeEvidenceSubmission(ctx context.Context, disputeID, userID uuid.UUID) (*db.Dispute, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	evidenceList := s.EvidenceByDsp[dispute.ID]
	if len(evidenceList) == 0 {
		return nil, errors.New("minimum 1 photo or video proof required before submitting dispute")
	}

	now := time.Now()
	sellerDeadline := now.Add(24 * time.Hour)

	dispute.Status = db.DisputeStatusSellerReview
	dispute.SellerResponseDeadline = &sellerDeadline
	dispute.UpdatedAt = now

	s.appendTimelineLocked(dispute.ID, "buyer", "EVIDENCE_FINALIZED", "Buyer finalized evidence. 24h timer started for seller response.")
	return dispute, nil
}

func (s *DisputeService) RespondToDispute(ctx context.Context, disputeID, sellerID uuid.UUID, in SellerResponseInput) (*db.Dispute, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	now := time.Now()
	dispute.SellerResponseNotes = in.Notes
	dispute.UpdatedAt = now

	if in.Decision == "accept_fault" {
		returnDeadline := now.Add(72 * time.Hour)
		dispute.ReturnDeadline = &returnDeadline
		dispute.ReturnLabelURL = fmt.Sprintf("https://shipping.scrowpoint.internal/labels/return-%s.pdf", dispute.ID.String()[:8])
		dispute.Status = db.DisputeStatusAdminMediation
		s.appendTimelineLocked(dispute.ID, "seller", "ACCEPTED_FAULT", "Seller accepted fault. 72-hour buyer return shipping window initiated.")
	} else {
		dispute.Status = db.DisputeStatusAdminMediation
		s.appendTimelineLocked(dispute.ID, "seller", "DENIED_FAULT", fmt.Sprintf("Seller contested claim: %s. Case routed to Admin mediation queue.", in.Notes))
	}

	return dispute, nil
}

func (s *DisputeService) MarkReturnShipped(ctx context.Context, disputeID, buyerID uuid.UUID, trackingNumber string) (*db.Dispute, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	now := time.Now()
	dispute.ReturnTrackingNumber = trackingNumber
	dispute.UpdatedAt = now

	s.appendTimelineLocked(dispute.ID, "buyer", "RETURN_SHIPPED", fmt.Sprintf("Buyer shipped return item. Tracking: %s", trackingNumber))
	return dispute, nil
}

func (s *DisputeService) ConfirmReturnCondition(ctx context.Context, disputeID, sellerID uuid.UUID) (*db.Dispute, error) {
	s.Mu.Lock()
	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		s.Mu.Unlock()
		return nil, errors.New("dispute not found")
	}

	now := time.Now()
	dispute.Status = db.DisputeStatusResolved
	outcome := db.MediationOutcomeRefundBuyer
	dispute.MediationOutcome = &outcome
	dispute.UpdatedAt = now
	s.appendTimelineLocked(dispute.ID, "seller", "RETURN_ACCEPTED", "Seller confirmed returned item intact. Triggering buyer refund.")
	s.Mu.Unlock()

	_, err := s.escrowService.RefundBuyer(ctx, dispute.OrderID, "Seller accepted returned gadget condition")
	if err != nil {
		return nil, err
	}

	return dispute, nil
}

func (s *DisputeService) OpenSubCase(ctx context.Context, parentDisputeID, sellerID uuid.UUID, in SubCaseInput) (*db.Dispute, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	parent, exists := s.DisputesByID[parentDisputeID]
	if !exists {
		return nil, errors.New("parent dispute not found")
	}

	now := time.Now()
	subCase := &db.Dispute{
		ID:              uuid.New(),
		OrderID:         parent.OrderID,
		ParentDisputeID: &parent.ID,
		IssueType:       in.IssueType,
		Status:          db.DisputeStatusAdminMediation,
		MediatorNotes:   in.Description,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	s.DisputesByID[subCase.ID] = subCase
	s.appendTimelineLocked(parent.ID, "seller", "SUB_CASE_OPENED", fmt.Sprintf("Sub-case %s created: %s. Refund halted pending arbitration.", subCase.ID.String()[:8], in.IssueType))
	s.appendTimelineLocked(subCase.ID, "system", "SUB_CASE_INITIALIZED", fmt.Sprintf("Linked to parent dispute %s", parent.ID))

	return subCase, nil
}

func (s *DisputeService) IssueMediationVerdict(
	ctx context.Context,
	disputeID uuid.UUID,
	adminID uuid.UUID,
	in DisputeVerdictInput,
) (*db.Dispute, error) {
	s.Mu.Lock()
	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		s.Mu.Unlock()
		return nil, errors.New("dispute not found")
	}

	now := time.Now()
	dispute.Status = db.DisputeStatusResolved
	dispute.MediationOutcome = &in.Outcome
	dispute.AssignedAdminID = &adminID
	dispute.MediatorNotes = in.Notes
	dispute.UpdatedAt = now
	s.appendTimelineLocked(dispute.ID, "admin", "VERDICT_ISSUED", fmt.Sprintf("Ruling: %s. Notes: %s", in.Outcome, in.Notes))
	s.Mu.Unlock()

	switch in.Outcome {
	case db.MediationOutcomeRefundBuyer:
		_, err := s.escrowService.RefundBuyer(ctx, dispute.OrderID, "Admin arbitration ruling: refunded to buyer")
		if err != nil {
			return nil, err
		}
	case db.MediationOutcomeReleaseToSeller:
		_, err := s.escrowService.ReleaseFundsToSeller(ctx, dispute.OrderID, true, "Admin arbitration ruling: released to seller")
		if err != nil {
			return nil, err
		}
	case db.MediationOutcomeSplit:
		order, err := s.orderService.GetOrderByID(ctx, dispute.OrderID, adminID)
		if err == nil {
			half := order.ItemPrice / 2
			splitBuyerRef := fmt.Sprintf("SPLIT-BUYER-%s", dispute.ID.String()[:8])
			splitSellerRef := fmt.Sprintf("SPLIT-SELLER-%s", dispute.ID.String()[:8])

			var sellerID uuid.UUID
			if order.Listing != nil {
				sellerID = order.Listing.SellerID
			}

			_, _ = s.escrowService.AppendLedgerEntry(ctx, order.ID, db.EscrowTxSplit, half, order.Currency, nil, &order.BuyerID, splitBuyerRef, "Mediation 50% split refund to buyer")
			_, _ = s.escrowService.AppendLedgerEntry(ctx, order.ID, db.EscrowTxSplit, half, order.Currency, nil, &sellerID, splitSellerRef, "Mediation 50% split payout to seller")
		}
	}

	return dispute, nil
}

func (s *DisputeService) SubmitAppeal(ctx context.Context, disputeID, appellantID uuid.UUID, in AppealInput) (*db.Appeal, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	if dispute.Status != db.DisputeStatusResolved {
		return nil, errors.New("can only appeal a resolved dispute outcome")
	}

	if in.Reason == "" {
		return nil, errors.New("appeal reason is required")
	}

	now := time.Now()
	appeal := &db.Appeal{
		ID:          uuid.New(),
		DisputeID:   dispute.ID,
		AppellantID: appellantID,
		Reason:      in.Reason,
		Status:      db.AppealStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	dispute.Status = db.DisputeStatusAppealed
	dispute.UpdatedAt = now
	s.AppealsByDsp[dispute.ID] = appeal
	s.appendTimelineLocked(dispute.ID, "user", "APPEAL_FILED", fmt.Sprintf("Appeal filed by user: %s", in.Reason))

	return appeal, nil
}

func (s *DisputeService) DecideAppeal(ctx context.Context, appealID, arbitratorID uuid.UUID, uphold bool, notes string) (*db.Appeal, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	var targetAppeal *db.Appeal
	for _, a := range s.AppealsByDsp {
		if a.ID == appealID {
			targetAppeal = a
			break
		}
	}

	if targetAppeal == nil {
		return nil, errors.New("appeal record not found")
	}

	now := time.Now()
	targetAppeal.ArbitratorID = &arbitratorID
	targetAppeal.ArbitratorVerdictNotes = notes
	targetAppeal.DecidedAt = &now
	targetAppeal.UpdatedAt = now

	if uphold {
		targetAppeal.Status = db.AppealStatusUpheld
		s.appendTimelineLocked(targetAppeal.DisputeID, "admin", "APPEAL_UPHELD", fmt.Sprintf("Arbitration upheld original decision. Notes: %s", notes))
	} else {
		targetAppeal.Status = db.AppealStatusOverturned
		s.appendTimelineLocked(targetAppeal.DisputeID, "admin", "APPEAL_OVERTURNED", fmt.Sprintf("Arbitration overturned original decision. Notes: %s", notes))
	}

	return targetAppeal, nil
}

func (s *DisputeService) GetDisputeByID(ctx context.Context, disputeID uuid.UUID) (*db.Dispute, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	disputeCopy := *dispute
	disputeCopy.Evidence = s.EvidenceByDsp[dispute.ID]
	return &disputeCopy, nil
}

func (s *DisputeService) ListDisputes(ctx context.Context, status string, page, limit int) ([]db.Dispute, int, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	var list []db.Dispute
	for _, d := range s.DisputesByID {
		if status != "" && string(d.Status) != status {
			continue
		}
		item := *d
		item.Evidence = s.EvidenceByDsp[d.ID]
		list = append(list, item)
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].CreatedAt.After(list[j].CreatedAt)
	})

	total := len(list)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	start := (page - 1) * limit
	if start > total {
		return []db.Dispute{}, total, nil
	}

	end := start + limit
	if end > total {
		end = total
	}

	return list[start:end], total, nil
}

func (s *DisputeService) GetTimeline(ctx context.Context, disputeID uuid.UUID) ([]DisputeTimelineItem, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	items, exists := s.Timelines[disputeID]
	if !exists {
		return []DisputeTimelineItem{}, nil
	}

	return items, nil
}

func (s *DisputeService) AssignDispute(ctx context.Context, disputeID, adminID uuid.UUID) (*db.Dispute, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	dispute, exists := s.DisputesByID[disputeID]
	if !exists {
		return nil, errors.New("dispute not found")
	}

	dispute.AssignedAdminID = &adminID
	dispute.UpdatedAt = time.Now()
	s.appendTimelineLocked(dispute.ID, "admin", "CASE_ASSIGNED", fmt.Sprintf("Case assigned to admin %s", adminID.String()[:8]))

	return dispute, nil
}

func (s *DisputeService) appendTimelineLocked(disputeID uuid.UUID, actor, action, desc string) {
	s.Timelines[disputeID] = append(s.Timelines[disputeID], DisputeTimelineItem{
		Timestamp:   time.Now(),
		Actor:       actor,
		Action:      action,
		Description: desc,
	})
}
