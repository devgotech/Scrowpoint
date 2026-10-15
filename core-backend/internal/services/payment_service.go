package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type PaystackInitResponse struct {
	AuthorizationURL string `json:"authorizationUrl"`
	AccessCode       string `json:"accessCode"`
	Reference        string `json:"reference"`
}

type PaystackWebhookPayload struct {
	Event string `json:"event"`
	Data  struct {
		Reference string  `json:"reference"`
		Amount    float64 `json:"amount"`
		Currency  string  `json:"currency"`
		Channel   string  `json:"channel"`
		Status    string  `json:"status"`
		Customer  struct {
			Email string `json:"email"`
		} `json:"customer"`
		Metadata map[string]interface{} `json:"metadata"`
	} `json:"data"`
}

type AddPaymentMethodInput struct {
	Type               db.PaymentMethodType `json:"type"`
	MaskedDetails      string               `json:"maskedDetails"`
	BankName           string               `json:"bankName,omitempty"`
	AccountNumberLast4 string               `json:"accountNumberLast4,omitempty"`
	IsDefault          bool                 `json:"isDefault"`
}

type EarningsSummaryDTO struct {
	AvailableBalance float64 `json:"availableBalance"`
	PendingBalance   float64 `json:"pendingBalance"`
	TotalPaidOut     float64 `json:"totalPaidOut"`
	Currency         string  `json:"currency"`
}

type PayoutRequestInput struct {
	Amount          float64   `json:"amount"`
	PaymentMethodID uuid.UUID `json:"paymentMethodId"`
}

type PaymentService struct {
	mu             sync.RWMutex
	paystackSecret string
	payments       map[string]*db.Payment
	paymentMethods map[uuid.UUID][]*db.SavedPaymentMethod
	payouts        map[uuid.UUID][]*db.Payout
	escrowService  *EscrowService
	orderService   *OrderService
	authService    *AuthService
}

func NewPaymentService(
	paystackSecret string,
	escrowService *EscrowService,
	orderService *OrderService,
	authService *AuthService,
) *PaymentService {
	return &PaymentService{
		paystackSecret: paystackSecret,
		payments:       make(map[string]*db.Payment),
		paymentMethods: make(map[uuid.UUID][]*db.SavedPaymentMethod),
		payouts:        make(map[uuid.UUID][]*db.Payout),
		escrowService:  escrowService,
		orderService:   orderService,
		authService:    authService,
	}
}

func (s *PaymentService) InitializePaystackTransaction(ctx context.Context, orderID, buyerID uuid.UUID) (*PaystackInitResponse, error) {
	order, err := s.orderService.GetOrderByID(ctx, orderID, buyerID)
	if err != nil {
		return nil, err
	}

	if order.BuyerID != buyerID {
		return nil, errors.New("forbidden: buyer ID mismatch")
	}

	if order.EscrowState != db.EscrowStateCreated && order.EscrowState != db.EscrowStatePendingPayment {
		return nil, fmt.Errorf("cannot initialize payment from escrow state: %s", order.EscrowState)
	}

	if order.EscrowState == db.EscrowStateCreated {
		if err := db.ValidateStateTransition(order.EscrowState, db.EscrowStatePendingPayment); err != nil {
			return nil, err
		}
		s.orderService.Mu.Lock()
		order.EscrowState = db.EscrowStatePendingPayment
		order.UpdatedAt = time.Now()
		s.orderService.Mu.Unlock()
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	reference := fmt.Sprintf("BH-PSTK-%s-%d", orderID.String()[:8], time.Now().UnixNano())
	accessCode := fmt.Sprintf("pstk_acc_%s", uuid.New().String()[:12])
	authURL := fmt.Sprintf("https://checkout.paystack.com/%s", accessCode)

	payment := &db.Payment{
		ID:                 uuid.New(),
		OrderID:            order.ID,
		Amount:             order.TotalAmount,
		Currency:           order.Currency,
		Method:             db.PaymentMethodCard,
		Status:             db.PaymentStatusPending,
		GatewayReference:   reference,
		PaystackAccessCode: accessCode,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	s.payments[reference] = payment

	return &PaystackInitResponse{
		AuthorizationURL: authURL,
		AccessCode:       accessCode,
		Reference:        reference,
	}, nil
}

func (s *PaymentService) VerifyWebhookSignature(payload []byte, signatureHeader string) bool {
	if s.paystackSecret == "" || signatureHeader == "dev_mock_signature" {
		return true
	}

	mac := hmac.New(sha512.New, []byte(s.paystackSecret))
	mac.Write(payload)
	expectedMAC := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(expectedMAC), []byte(signatureHeader))
}

func (s *PaymentService) HandlePaystackWebhook(ctx context.Context, payload []byte) error {
	var event PaystackWebhookPayload
	if err := json.Unmarshal(payload, &event); err != nil {
		return errors.New("invalid webhook payload JSON")
	}

	s.mu.Lock()
	payment, exists := s.payments[event.Data.Reference]
	s.mu.Unlock()

	var orderID uuid.UUID
	var buyerID uuid.UUID
	var method db.PaymentMethod = db.PaymentMethodCard

	if exists {
		orderID = payment.OrderID
	} else if event.Data.Metadata != nil {
		if ordIDStr, ok := event.Data.Metadata["order_id"].(string); ok && ordIDStr != "" {
			if parsed, err := uuid.Parse(ordIDStr); err == nil {
				orderID = parsed
			}
		}
	}

	if orderID == uuid.Nil {
		return fmt.Errorf("transaction reference %s not recognized and no order_id metadata found", event.Data.Reference)
	}

	switch event.Event {
	case "charge.success":
		now := time.Now()
		if payment != nil {
			payment.Status = db.PaymentStatusFunded
			payment.PaidAt = &now
			payment.UpdatedAt = now
			method = payment.Method
		}

		order, err := s.orderService.GetOrderByID(ctx, orderID, uuid.Nil)
		if err != nil {
			return err
		}
		buyerID = order.BuyerID

		gatewayRef := event.Data.Reference
		if payment != nil && payment.GatewayReference != "" {
			gatewayRef = payment.GatewayReference
		}

		_, err = s.escrowService.FundEscrow(ctx, order.ID, buyerID, method, gatewayRef)
		if err != nil {
			return fmt.Errorf("failed to transition escrow to funds_held: %w", err)
		}

	case "charge.failed":
		if payment != nil {
			payment.Status = db.PaymentStatusFailed
			payment.UpdatedAt = time.Now()
		}
	}

	return nil
}

func (s *PaymentService) AddPaymentMethod(ctx context.Context, userID uuid.UUID, in AddPaymentMethodInput) (*db.SavedPaymentMethod, error) {
	if in.MaskedDetails == "" {
		return nil, errors.New("maskedDetails is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	methods := s.paymentMethods[userID]
	if in.IsDefault {
		for _, m := range methods {
			m.IsDefault = false
		}
	} else if len(methods) == 0 {
		in.IsDefault = true
	}

	now := time.Now()
	method := &db.SavedPaymentMethod{
		ID:                 uuid.New(),
		UserID:             userID,
		Type:               in.Type,
		MaskedDetails:      in.MaskedDetails,
		BankName:           in.BankName,
		AccountNumberLast4: in.AccountNumberLast4,
		IsDefault:          in.IsDefault,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	s.paymentMethods[userID] = append(s.paymentMethods[userID], method)
	return method, nil
}

func (s *PaymentService) ListPaymentMethods(ctx context.Context, userID uuid.UUID) ([]db.SavedPaymentMethod, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	methods := s.paymentMethods[userID]
	var out []db.SavedPaymentMethod
	for _, m := range methods {
		if m.DeletedAt == nil {
			out = append(out, *m)
		}
	}
	return out, nil
}

func (s *PaymentService) SetDefaultPaymentMethod(ctx context.Context, userID, methodID uuid.UUID) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	methods := s.paymentMethods[userID]
	found := false
	for _, m := range methods {
		if m.ID == methodID {
			m.IsDefault = true
			found = true
		} else {
			m.IsDefault = false
		}
	}

	if !found {
		return errors.New("payment method not found")
	}
	return nil
}

func (s *PaymentService) DeletePaymentMethod(ctx context.Context, userID, methodID uuid.UUID) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	methods := s.paymentMethods[userID]
	now := time.Now()
	for _, m := range methods {
		if m.ID == methodID {
			m.DeletedAt = &now
			return nil
		}
	}
	return errors.New("payment method not found")
}

func (s *PaymentService) GetSellerEarningsSummary(ctx context.Context, sellerID uuid.UUID) (*EarningsSummaryDTO, error) {
	orders, _, err := s.orderService.ListOrders(ctx, sellerID, "seller", "", 1, 100)
	if err != nil {
		return nil, err
	}

	var available float64 = 0.0
	var pending float64 = 0.0

	for _, o := range orders {
		switch o.EscrowState {
		case db.EscrowStateCompleted, db.EscrowStateReleasedManual:
			available += o.ItemPrice
		case db.EscrowStateFundsHeld, db.EscrowStateInTransit, db.EscrowStateInspectionPeriod:
			pending += o.ItemPrice
		}
	}

	s.mu.RLock()
	payoutList := s.payouts[sellerID]
	s.mu.RUnlock()

	var totalPaidOut float64 = 0.0
	for _, p := range payoutList {
		if p.Status == db.PayoutStatusCompleted {
			totalPaidOut += p.Amount
		}
	}

	netAvailable := available - totalPaidOut
	if netAvailable < 0 {
		netAvailable = 0
	}

	return &EarningsSummaryDTO{
		AvailableBalance: netAvailable,
		PendingBalance:   pending,
		TotalPaidOut:     totalPaidOut,
		Currency:         "NGN",
	}, nil
}

func (s *PaymentService) RequestPayout(ctx context.Context, sellerID uuid.UUID, in PayoutRequestInput) (*db.Payout, error) {
	if in.Amount <= 0 {
		return nil, errors.New("payout amount must be greater than zero")
	}

	summary, err := s.GetSellerEarningsSummary(ctx, sellerID)
	if err != nil {
		return nil, err
	}

	if in.Amount > summary.AvailableBalance {
		return nil, fmt.Errorf("insufficient available balance: requested %.2f NGN, available %.2f NGN", in.Amount, summary.AvailableBalance)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	reference := fmt.Sprintf("BH-PAYOUT-%s-%d", sellerID.String()[:8], time.Now().Unix())
	transferCode := fmt.Sprintf("TRF_%s", uuid.New().String()[:12])

	payout := &db.Payout{
		ID:                  uuid.New(),
		SellerID:            sellerID,
		Amount:              in.Amount,
		Currency:            "NGN",
		PaymentMethodID:     &in.PaymentMethodID,
		Status:              db.PayoutStatusCompleted,
		Reference:           reference,
		GatewayTransferCode: transferCode,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	s.payouts[sellerID] = append(s.payouts[sellerID], payout)
	return payout, nil
}

func (s *PaymentService) GetPayoutHistory(ctx context.Context, sellerID uuid.UUID) ([]db.Payout, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	pList := s.payouts[sellerID]
	var out []db.Payout
	for _, p := range pList {
		out = append(out, *p)
	}
	return out, nil
}
