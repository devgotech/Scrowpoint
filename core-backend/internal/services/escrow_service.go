package services

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type EscrowStatusDTO struct {
	OrderID             uuid.UUID      `json:"orderId"`
	EscrowState         db.EscrowState `json:"escrowState"`
	TotalHeld           float64        `json:"totalHeld"`
	ItemPrice           float64        `json:"itemPrice"`
	PlatformFee         float64        `json:"platformFee"`
	Currency            string         `json:"currency"`
	BuyerID             uuid.UUID      `json:"buyerId"`
	SellerID            uuid.UUID      `json:"sellerId"`
	InspectionExpiresAt *time.Time     `json:"inspectionExpiresAt,omitempty"`
	LedgerEntriesCount  int            `json:"ledgerEntriesCount"`
	LastStateChange     time.Time      `json:"lastStateChange"`
}

type EscrowService struct {
	mu           sync.RWMutex
	ledger       map[uuid.UUID][]db.EscrowTransaction
	orderService *OrderService
	authService  *AuthService
}

func NewEscrowService(orderService *OrderService, authService *AuthService) *EscrowService {
	return &EscrowService{
		ledger:       make(map[uuid.UUID][]db.EscrowTransaction),
		orderService: orderService,
		authService:  authService,
	}
}

func (s *EscrowService) AppendLedgerEntry(
	ctx context.Context,
	orderID uuid.UUID,
	txType db.EscrowTxType,
	amount float64,
	currency string,
	fromUser *uuid.UUID,
	toUser *uuid.UUID,
	reference string,
	notes string,
) (*db.EscrowTransaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if amount < 0 {
		return nil, errors.New("ledger amount cannot be negative")
	}

	currentEntries := s.ledger[orderID]
	var currentBalance float64 = 0.0

	for _, entry := range currentEntries {
		switch entry.TransactionType {
		case db.EscrowTxDeposit:
			currentBalance += entry.Amount
		case db.EscrowTxPlatformFee, db.EscrowTxGatewayFee:
			currentBalance -= entry.Amount
		case db.EscrowTxRelease, db.EscrowTxRefund:
			currentBalance -= entry.Amount
		}
	}

	var newBalance float64
	switch txType {
	case db.EscrowTxDeposit:
		newBalance = currentBalance + amount
	case db.EscrowTxPlatformFee, db.EscrowTxGatewayFee, db.EscrowTxRelease, db.EscrowTxRefund:
		if amount > currentBalance {
			return nil, fmt.Errorf("insufficient escrow balance for debit: current %.2f, attempted %.2f", currentBalance, amount)
		}
		newBalance = currentBalance - amount
	default:
		newBalance = currentBalance
	}

	entry := db.EscrowTransaction{
		ID:              uuid.New(),
		OrderID:         orderID,
		Amount:          amount,
		Currency:        currency,
		TransactionType: txType,
		FromUserID:      fromUser,
		ToUserID:        toUser,
		BalanceAfter:    newBalance,
		Reference:       reference,
		Notes:           notes,
		CreatedAt:       time.Now(),
	}

	s.ledger[orderID] = append(s.ledger[orderID], entry)
	return &entry, nil
}

func (s *EscrowService) FundEscrow(
	ctx context.Context,
	orderID uuid.UUID,
	buyerID uuid.UUID,
	paymentMethod db.PaymentMethod,
	gatewayRef string,
) (*db.Order, error) {
	order, err := s.orderService.GetOrderByID(ctx, orderID, buyerID)
	if err != nil {
		return nil, err
	}

	if order.BuyerID != buyerID {
		return nil, errors.New("forbidden: only the buyer may fund this order")
	}

	if order.EscrowState != db.EscrowStateCreated && order.EscrowState != db.EscrowStatePendingPayment {
		return nil, fmt.Errorf("order cannot be funded from current state: %s", order.EscrowState)
	}

	if err := db.ValidateStateTransition(order.EscrowState, db.EscrowStateFundsHeld); err != nil {
		return nil, err
	}

	depositRef := fmt.Sprintf("DEP-%s-%s", orderID.String()[:8], uuid.New().String()[:8])
	if gatewayRef != "" {
		depositRef = gatewayRef
	}

	_, err = s.AppendLedgerEntry(
		ctx,
		order.ID,
		db.EscrowTxDeposit,
		order.TotalAmount,
		order.Currency,
		&buyerID,
		nil,
		depositRef,
		fmt.Sprintf("Escrow funded by buyer via %s. Total: %.2f %s", paymentMethod, order.TotalAmount, order.Currency),
	)
	if err != nil {
		return nil, err
	}

	if order.PlatformFee > 0 {
		feeRef := fmt.Sprintf("FEE-%s-%s", orderID.String()[:8], uuid.New().String()[:8])
		_, err = s.AppendLedgerEntry(
			ctx,
			order.ID,
			db.EscrowTxPlatformFee,
			order.PlatformFee,
			order.Currency,
			nil,
			nil,
			feeRef,
			fmt.Sprintf("Platform escrow fee collected: %.2f %s", order.PlatformFee, order.Currency),
		)
		if err != nil {
			return nil, err
		}
	}

	s.orderService.Mu.Lock()
	order.EscrowState = db.EscrowStateFundsHeld
	order.UpdatedAt = time.Now()
	s.orderService.Mu.Unlock()

	return order, nil
}

func (s *EscrowService) TransitionToInTransit(
	ctx context.Context,
	orderID uuid.UUID,
	sellerID uuid.UUID,
	trackingNumber string,
	carrier string,
) (*db.Order, error) {
	order, err := s.orderService.GetOrderByID(ctx, orderID, sellerID)
	if err != nil {
		return nil, err
	}

	if order.Listing != nil && order.Listing.SellerID != sellerID {
		return nil, errors.New("forbidden: only seller can initiate shipment")
	}

	if err := db.ValidateStateTransition(order.EscrowState, db.EscrowStateInTransit); err != nil {
		return nil, err
	}

	s.orderService.Mu.Lock()
	order.EscrowState = db.EscrowStateInTransit
	order.TrackingNumber = trackingNumber
	order.TrackingCarrier = carrier
	order.UpdatedAt = time.Now()
	s.orderService.Mu.Unlock()

	return order, nil
}

func (s *EscrowService) StartInspectionPeriod(ctx context.Context, orderID uuid.UUID) (*db.Order, error) {
	s.orderService.Mu.Lock()
	defer s.orderService.Mu.Unlock()

	order, exists := s.orderService.OrdersByID[orderID]
	if !exists {
		return nil, errors.New("order not found")
	}

	if err := db.ValidateStateTransition(order.EscrowState, db.EscrowStateInspectionPeriod); err != nil {
		return nil, err
	}

	now := time.Now()
	expiresAt := now.Add(48 * time.Hour)

	order.EscrowState = db.EscrowStateInspectionPeriod
	order.DeliveredAt = &now
	order.InspectionExpiresAt = &expiresAt
	order.UpdatedAt = now

	return order, nil
}

func (s *EscrowService) ReleaseFundsToSeller(
	ctx context.Context,
	orderID uuid.UUID,
	adminTriggered bool,
	notes string,
) (*db.Order, error) {
	s.orderService.Mu.Lock()
	order, exists := s.orderService.OrdersByID[orderID]
	if !exists {
		s.orderService.Mu.Unlock()
		return nil, errors.New("order not found")
	}

	targetState := db.EscrowStateCompleted
	if adminTriggered {
		targetState = db.EscrowStateReleasedManual
	}

	if err := db.ValidateStateTransition(order.EscrowState, targetState); err != nil {
		s.orderService.Mu.Unlock()
		return nil, err
	}
	s.orderService.Mu.Unlock()

	var sellerID uuid.UUID
	if order.Listing != nil {
		sellerID = order.Listing.SellerID
	}

	relRef := fmt.Sprintf("REL-%s-%s", orderID.String()[:8], uuid.New().String()[:8])
	_, err := s.AppendLedgerEntry(
		ctx,
		order.ID,
		db.EscrowTxRelease,
		order.ItemPrice,
		order.Currency,
		nil,
		&sellerID,
		relRef,
		fmt.Sprintf("Escrow released to seller payout wallet. Amount: %.2f %s. %s", order.ItemPrice, order.Currency, notes),
	)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	s.orderService.Mu.Lock()
	order.EscrowState = targetState
	order.CompletedAt = &now
	order.UpdatedAt = now
	s.orderService.Mu.Unlock()

	return order, nil
}

func (s *EscrowService) RefundBuyer(
	ctx context.Context,
	orderID uuid.UUID,
	notes string,
) (*db.Order, error) {
	s.orderService.Mu.Lock()
	order, exists := s.orderService.OrdersByID[orderID]
	if !exists {
		s.orderService.Mu.Unlock()
		return nil, errors.New("order not found")
	}

	if err := db.ValidateStateTransition(order.EscrowState, db.EscrowStateRefunded); err != nil {
		s.orderService.Mu.Unlock()
		return nil, err
	}
	s.orderService.Mu.Unlock()

	refRef := fmt.Sprintf("REF-%s-%s", orderID.String()[:8], uuid.New().String()[:8])
	_, err := s.AppendLedgerEntry(
		ctx,
		order.ID,
		db.EscrowTxRefund,
		order.ItemPrice,
		order.Currency,
		nil,
		&order.BuyerID,
		refRef,
		fmt.Sprintf("Dispute refund issued to buyer. Amount: %.2f %s (platform fee non-refundable). %s", order.ItemPrice, order.Currency, notes),
	)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	s.orderService.Mu.Lock()
	order.EscrowState = db.EscrowStateRefunded
	order.UpdatedAt = now
	s.orderService.Mu.Unlock()

	return order, nil
}

func (s *EscrowService) GetEscrowStatus(ctx context.Context, orderID, requestorID uuid.UUID) (*EscrowStatusDTO, error) {
	order, err := s.orderService.GetOrderByID(ctx, orderID, requestorID)
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	entries := s.ledger[orderID]
	s.mu.RUnlock()

	var sellerID uuid.UUID
	if order.Listing != nil {
		sellerID = order.Listing.SellerID
	}

	return &EscrowStatusDTO{
		OrderID:             order.ID,
		EscrowState:         order.EscrowState,
		TotalHeld:           order.TotalAmount,
		ItemPrice:           order.ItemPrice,
		PlatformFee:         order.PlatformFee,
		Currency:            order.Currency,
		BuyerID:             order.BuyerID,
		SellerID:            sellerID,
		InspectionExpiresAt: order.InspectionExpiresAt,
		LedgerEntriesCount:  len(entries),
		LastStateChange:     order.UpdatedAt,
	}, nil
}

func (s *EscrowService) GetLedger(ctx context.Context, orderID, requestorID uuid.UUID) ([]db.EscrowTransaction, error) {
	if _, err := s.orderService.GetOrderByID(ctx, orderID, requestorID); err != nil {
		return nil, err
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	entries := s.ledger[orderID]
	var copyEntries []db.EscrowTransaction
	for _, e := range entries {
		copyEntries = append(copyEntries, e)
	}
	return copyEntries, nil
}
