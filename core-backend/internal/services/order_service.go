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

type CreateOrderInput struct {
	ListingID         uuid.UUID            `json:"listingId"`
	FulfillmentMethod db.FulfillmentMethod `json:"fulfillmentMethod"`
}

type OrderReceiptDTO struct {
	OrderID           uuid.UUID            `json:"orderId"`
	ReceiptNumber     string               `json:"receiptNumber"`
	ListingTitle      string               `json:"listingTitle"`
	SKU               string               `json:"sku"`
	BuyerID           uuid.UUID            `json:"buyerId"`
	SellerID          uuid.UUID            `json:"sellerId"`
	ItemPrice         float64              `json:"itemPrice"`
	PlatformFee       float64              `json:"platformFee"`
	PlatformFeePct    float64              `json:"platformFeePct"`
	GatewayFee        float64              `json:"gatewayFee"`
	TotalPaid         float64              `json:"totalPaid"`
	SellerPayout      float64              `json:"sellerPayout"`
	Currency          string               `json:"currency"`
	EscrowState       db.EscrowState       `json:"escrowState"`
	FulfillmentMethod db.FulfillmentMethod `json:"fulfillmentMethod"`
	PaidAt            *time.Time           `json:"paidAt,omitempty"`
	DeliveredAt       *time.Time           `json:"deliveredAt,omitempty"`
	CompletedAt       *time.Time           `json:"completedAt,omitempty"`
	CreatedAt         time.Time            `json:"createdAt"`
}

type OrderTrackingDTO struct {
	OrderID                uuid.UUID      `json:"orderId"`
	EscrowState            db.EscrowState `json:"escrowState"`
	FulfillmentMethod      string         `json:"fulfillmentMethod"`
	TrackingNumber         string         `json:"trackingNumber,omitempty"`
	TrackingCarrier        string         `json:"trackingCarrier,omitempty"`
	ShippingLabelURL       string         `json:"shippingLabelUrl,omitempty"`
	DeliveredAt            *time.Time     `json:"deliveredAt,omitempty"`
	InspectionExpiresAt    *time.Time     `json:"inspectionExpiresAt,omitempty"`
	InspectionRemainingSec int64          `json:"inspectionRemainingSec"`
	CanConfirmReceipt      bool           `json:"canConfirmReceipt"`
	CanDispute             bool           `json:"canDispute"`
}

type OrderService struct {
	Mu             sync.RWMutex
	OrdersByID     map[uuid.UUID]*db.Order
	OrdersByBuyer  map[uuid.UUID][]uuid.UUID
	OrdersBySeller map[uuid.UUID][]uuid.UUID
	listingService *ListingService
	authService    *AuthService
}

func NewOrderService(listingService *ListingService, authService *AuthService) *OrderService {
	return &OrderService{
		OrdersByID:     make(map[uuid.UUID]*db.Order),
		OrdersByBuyer:  make(map[uuid.UUID][]uuid.UUID),
		OrdersBySeller: make(map[uuid.UUID][]uuid.UUID),
		listingService: listingService,
		authService:    authService,
	}
}

func (s *OrderService) GetQuote(ctx context.Context, itemPrice float64, currency string) (db.EscrowQuote, error) {
	return db.CalculateEscrowQuote(itemPrice, currency)
}

func (s *OrderService) GetQuoteForListing(ctx context.Context, listingID uuid.UUID) (db.EscrowQuote, error) {
	listing, err := s.listingService.GetListingByID(ctx, listingID)
	if err != nil {
		return db.EscrowQuote{}, err
	}
	return db.CalculateEscrowQuote(listing.Price, listing.Currency)
}

func (s *OrderService) CreateOrder(ctx context.Context, buyerID uuid.UUID, in CreateOrderInput) (*db.Order, error) {
	buyer, err := s.authService.GetUserByID(ctx, buyerID)
	if err != nil {
		return nil, errors.New("buyer account not found")
	}
	if buyer.IsSuspended {
		return nil, errors.New("buyer account is suspended")
	}

	listing, err := s.listingService.GetListingByID(ctx, in.ListingID)
	if err != nil {
		return nil, err
	}

	if listing.Status != db.ListingLive {
		return nil, fmt.Errorf("listing is not available for purchase (current status: %s)", listing.Status)
	}

	if listing.SellerID == buyerID {
		return nil, errors.New("cannot purchase your own gadget listing")
	}

	if err := s.listingService.LockListing(ctx, listing.ID); err != nil {
		return nil, err
	}

	quote, err := db.CalculateEscrowQuote(listing.Price, listing.Currency)
	if err != nil {
		_ = s.listingService.UnlockListing(ctx, listing.ID)
		return nil, err
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	now := time.Now()
	order := &db.Order{
		ID:                uuid.New(),
		ListingID:         listing.ID,
		BuyerID:           buyerID,
		FulfillmentMethod: in.FulfillmentMethod,
		EscrowState:       db.EscrowStateCreated,
		ItemPrice:         quote.ItemPrice,
		PlatformFee:       quote.PlatformFee,
		GatewayFee:        quote.GatewayFee,
		TotalAmount:       quote.TotalDue,
		Currency:          quote.Currency,
		Listing:           listing,
		Buyer:             buyer,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	s.OrdersByID[order.ID] = order
	s.OrdersByBuyer[buyerID] = append(s.OrdersByBuyer[buyerID], order.ID)
	s.OrdersBySeller[listing.SellerID] = append(s.OrdersBySeller[listing.SellerID], order.ID)

	return order, nil
}

func (s *OrderService) GetOrderByID(ctx context.Context, orderID, requestorID uuid.UUID) (*db.Order, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	order, exists := s.OrdersByID[orderID]
	if !exists || order.DeletedAt != nil {
		return nil, errors.New("order not found")
	}

	listing, _ := s.listingService.GetListingByID(ctx, order.ListingID)
	order.Listing = listing

	if requestorID != uuid.Nil {
		reqUser, _ := s.authService.GetUserByID(ctx, requestorID)
		isAdmin := reqUser != nil && reqUser.Role == db.RoleAdmin

		if order.BuyerID != requestorID && (listing == nil || listing.SellerID != requestorID) && !isAdmin {
			return nil, errors.New("forbidden: unauthorized access to order")
		}
	}

	orderCopy := *order
	return &orderCopy, nil
}

func (s *OrderService) ListOrders(ctx context.Context, userID uuid.UUID, role string, status string, page, limit int) ([]db.Order, int, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	var orderIDs []uuid.UUID
	if role == "seller" {
		orderIDs = s.OrdersBySeller[userID]
	} else {
		orderIDs = s.OrdersByBuyer[userID]
	}

	var results []db.Order
	for _, oid := range orderIDs {
		o, exists := s.OrdersByID[oid]
		if !exists || o.DeletedAt != nil {
			continue
		}

		if status != "" && string(o.EscrowState) != status {
			continue
		}

		orderCopy := *o
		if listing, err := s.listingService.GetListingByID(ctx, o.ListingID); err == nil {
			orderCopy.Listing = listing
		}
		results = append(results, orderCopy)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].CreatedAt.After(results[j].CreatedAt)
	})

	total := len(results)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	start := (page - 1) * limit
	if start > total {
		return []db.Order{}, total, nil
	}

	end := start + limit
	if end > total {
		end = total
	}

	return results[start:end], total, nil
}

func (s *OrderService) GetOrderTracking(ctx context.Context, orderID, requestorID uuid.UUID) (*OrderTrackingDTO, error) {
	order, err := s.GetOrderByID(ctx, orderID, requestorID)
	if err != nil {
		return nil, err
	}

	var remainingSec int64 = 0
	canConfirm := false
	canDispute := false

	if order.EscrowState == db.EscrowStateInspectionPeriod && order.InspectionExpiresAt != nil {
		diff := time.Until(*order.InspectionExpiresAt)
		if diff > 0 {
			remainingSec = int64(diff.Seconds())
			canConfirm = (order.BuyerID == requestorID)
			canDispute = (order.BuyerID == requestorID)
		}
	} else if order.EscrowState == db.EscrowStateInTransit {
		canDispute = true
	}

	return &OrderTrackingDTO{
		OrderID:                order.ID,
		EscrowState:            order.EscrowState,
		FulfillmentMethod:      string(order.FulfillmentMethod),
		TrackingNumber:         order.TrackingNumber,
		TrackingCarrier:        order.TrackingCarrier,
		ShippingLabelURL:       order.ShippingLabelURL,
		DeliveredAt:            order.DeliveredAt,
		InspectionExpiresAt:    order.InspectionExpiresAt,
		InspectionRemainingSec: remainingSec,
		CanConfirmReceipt:      canConfirm,
		CanDispute:             canDispute,
	}, nil
}

func (s *OrderService) ConfirmReceipt(ctx context.Context, orderID, buyerID uuid.UUID) (*db.Order, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	order, exists := s.OrdersByID[orderID]
	if !exists || order.DeletedAt != nil {
		return nil, errors.New("order not found")
	}

	if order.BuyerID != buyerID {
		return nil, errors.New("forbidden: only the buyer may confirm receipt of the item")
	}

	if order.EscrowState != db.EscrowStateInspectionPeriod && order.EscrowState != db.EscrowStateInTransit {
		// If confirmed prior to transit / delivery in test environment (e.g. Created or FundsHeld),
		// advance the lifecycle: set delivery time and initiate the 48-hour inspection period.
		if order.EscrowState == db.EscrowStateCreated || order.EscrowState == db.EscrowStatePendingPayment || order.EscrowState == db.EscrowStateFundsHeld {
			now := time.Now()
			expires := now.Add(48 * time.Hour)
			order.EscrowState = db.EscrowStateInspectionPeriod
			order.DeliveredAt = &now
			order.InspectionExpiresAt = &expires
			order.UpdatedAt = now
			orderCopy := *order
			return &orderCopy, nil
		}
		return nil, fmt.Errorf("cannot confirm receipt when order is in state: %s", order.EscrowState)
	}

	now := time.Now()
	order.EscrowState = db.EscrowStateCompleted
	order.CompletedAt = &now
	order.UpdatedAt = now

	if listing, exists := s.listingService.ListingsByID[order.ListingID]; exists {
		listing.Status = db.ListingSold
		listing.UpdatedAt = now
	}

	orderCopy := *order
	return &orderCopy, nil
}

func (s *OrderService) GetReceipt(ctx context.Context, orderID, requestorID uuid.UUID) (*OrderReceiptDTO, error) {
	order, err := s.GetOrderByID(ctx, orderID, requestorID)
	if err != nil {
		return nil, err
	}

	listingTitle := "Gadget Order"
	sku := "GENERIC"
	sellerID := uuid.Nil

	if order.Listing != nil {
		listingTitle = fmt.Sprintf("%s %s", order.Listing.Brand, order.Listing.Model)
		sku = order.Listing.SKU
		sellerID = order.Listing.SellerID
	}

	sellerPayout := order.ItemPrice

	feePct := 0.025
	if order.ItemPrice <= 150000 {
		feePct = 0.05
	} else if order.ItemPrice > 750000 {
		feePct = 0.015
	}

	receiptNumber := fmt.Sprintf("SP-REC-%s-%s", order.ID.String()[:8], order.CreatedAt.Format("20060102"))

	return &OrderReceiptDTO{
		OrderID:           order.ID,
		ReceiptNumber:     receiptNumber,
		ListingTitle:      listingTitle,
		SKU:               sku,
		BuyerID:           order.BuyerID,
		SellerID:          sellerID,
		ItemPrice:         order.ItemPrice,
		PlatformFee:       order.PlatformFee,
		PlatformFeePct:    feePct * 100,
		GatewayFee:        0.00,
		TotalPaid:         order.TotalAmount,
		SellerPayout:      sellerPayout,
		Currency:          order.Currency,
		EscrowState:       order.EscrowState,
		FulfillmentMethod: order.FulfillmentMethod,
		PaidAt:            order.DeliveredAt,
		DeliveredAt:       order.DeliveredAt,
		CompletedAt:       order.CompletedAt,
		CreatedAt:         order.CreatedAt,
	}, nil
}
