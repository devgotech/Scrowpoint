package services

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type CreateOrderInput struct {
	ListingID         uuid.UUID            `json:"listingId"`
	FulfillmentMethod db.FulfillmentMethod `json:"fulfillmentMethod"`
}

type SendOrderMessageInput struct {
	SenderRole        string `json:"sender"`
	SenderName        string `json:"senderName"`
	Text              string `json:"text"`
	AttachmentURL     string `json:"attachmentUrl,omitempty"`
	AttachmentCaption string `json:"attachmentCaption,omitempty"`
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
	Mu              sync.RWMutex
	OrdersByID      map[uuid.UUID]*db.Order
	OrdersByBuyer   map[uuid.UUID][]uuid.UUID
	OrdersBySeller  map[uuid.UUID][]uuid.UUID
	MessagesByOrder map[string][]*db.OrderChatMessage
	listingService  *ListingService
	authService     *AuthService
}

func NewOrderService(listingService *ListingService, authService *AuthService) *OrderService {
	return &OrderService{
		OrdersByID:      make(map[uuid.UUID]*db.Order),
		OrdersByBuyer:   make(map[uuid.UUID][]uuid.UUID),
		OrdersBySeller:  make(map[uuid.UUID][]uuid.UUID),
		MessagesByOrder: make(map[string][]*db.OrderChatMessage),
		listingService:  listingService,
		authService:     authService,
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

	if order.EscrowState == db.EscrowStateInTransit {
		// Delivery has been confirmed by buyer, initiating the official 48-hour inspection window.
		now := time.Now()
		expires := now.Add(48 * time.Hour)
		order.EscrowState = db.EscrowStateInspectionPeriod
		order.DeliveredAt = &now
		order.InspectionExpiresAt = &expires
		order.UpdatedAt = now
		orderCopy := *order
		return &orderCopy, nil
	}

	if order.EscrowState != db.EscrowStateInspectionPeriod {
		return nil, fmt.Errorf("cannot confirm receipt: order is in '%s' state (must be 'in_transit' or 'inspection_period')", order.EscrowState)
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

	receiptNumber := fmt.Sprintf("BH-REC-%s-%s", order.ID.String()[:8], order.CreatedAt.Format("20060102"))

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

var (
	tradeChatPhoneRegex = regexp.MustCompile(`(?:(?:\+?234)|0)[789][01]\d{8}`)
	tradeChatEmailRegex = regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
	tradeChatLinkRegex  = regexp.MustCompile(`(?i)(?:https?://|www\.|wa\.me/|whatsapp\.com/|t\.me/)[^\s]+`)
	tradeChatNubanRegex = regexp.MustCompile(`\b\d{10}\b`)
)

// SanitizeTradeChatMessage scrubs off-platform phone numbers, emails, 10-digit NUBAN accounts, and external links.
func SanitizeTradeChatMessage(raw string) (string, bool, string) {
	masked := raw
	sanitized := false

	if tradeChatPhoneRegex.MatchString(masked) {
		masked = tradeChatPhoneRegex.ReplaceAllString(masked, "[PHONE HIDDEN FOR SAFETY]")
		sanitized = true
	}
	if tradeChatEmailRegex.MatchString(masked) {
		masked = tradeChatEmailRegex.ReplaceAllString(masked, "[EMAIL HIDDEN FOR SAFETY]")
		sanitized = true
	}
	if tradeChatLinkRegex.MatchString(masked) {
		masked = tradeChatLinkRegex.ReplaceAllString(masked, "[EXTERNAL LINK HIDDEN]")
		sanitized = true
	}
	if tradeChatNubanRegex.MatchString(masked) {
		masked = tradeChatNubanRegex.ReplaceAllString(masked, "[BANK ACCOUNT HIDDEN FOR SAFETY]")
		sanitized = true
	}

	var reason string
	if sanitized {
		reason = "Friendly heads-up: We hid a phone number, bank account, email, or external link in your message. Keeping all chat inside Scrowpoint ensures your 48-hour money-back guarantee stays 100% valid!"
	}

	return masked, sanitized, reason
}

func (s *OrderService) ensureDefaultOrderMessagesLocked(orderIDKey string) []*db.OrderChatMessage {
	msgs, exists := s.MessagesByOrder[orderIDKey]
	if exists && len(msgs) > 0 {
		return msgs
	}

	baseTime := time.Now().Add(-3 * time.Hour)
	seeded := []*db.OrderChatMessage{
		{
			ID:                   uuid.New(),
			OrderID:              orderIDKey,
			SenderRole:           "admin",
			SenderName:           "Scrowpoint Concierge",
			IsMilestone:          true,
			MilestoneType:        "FUNDED",
			MilestoneTitle:       "₦850,000 Safely Locked in Paystack Escrow",
			MilestoneDescription: "Adeola's payment is secured in the segregated vault. Chidi Gadgets can now package and hand off the iPhone 14 Pro Max with full peace of mind.",
			MilestoneNextStep:    "Seller dispatches the gadget via GIG Logistics and shares the waybill.",
			Timestamp:            "10:14 AM",
			CreatedAt:            baseTime,
		},
		{
			ID:         uuid.New(),
			OrderID:    orderIDKey,
			SenderRole: "seller",
			SenderName: "Chidi Gadgets (Seller)",
			Text:       "Hi Adeola! Thanks for the prompt deposit. I've just wrapped your iPhone 14 Pro Max in bubble wrap along with the original Apple 20W brick and USB-C cable. Heading to the GIG Ikeja hub now!",
			Timestamp:  "10:18 AM",
			CreatedAt:  baseTime.Add(4 * time.Minute),
		},
		{
			ID:                   uuid.New(),
			OrderID:              orderIDKey,
			SenderRole:           "admin",
			SenderName:           "Scrowpoint Concierge",
			IsMilestone:          true,
			MilestoneType:        "SHIPPED",
			MilestoneTitle:       "Gadget Dispatched via GIG Logistics (#GIG-948102-LOS)",
			MilestoneDescription: "The package has been sealed with tamper-evident tape and is on its way from Ikeja GRA.",
			MilestoneNextStep:    "Once delivered, Adeola gets a full 48-hour window to test the device at home.",
			Timestamp:            "11:45 AM",
			CreatedAt:            baseTime.Add(90 * time.Minute),
		},
		{
			ID:         uuid.New(),
			OrderID:    orderIDKey,
			SenderRole: "buyer",
			SenderName: "Adeola (Buyer)",
			Text:       "Awesome, thank you Chidi! I'll let you know as soon as the rider drops it off so I can test FaceID and battery health.",
			Timestamp:  "11:52 AM",
			CreatedAt:  baseTime.Add(97 * time.Minute),
		},
		{
			ID:                   uuid.New(),
			OrderID:              orderIDKey,
			SenderRole:           "admin",
			SenderName:           "Scrowpoint Concierge",
			IsMilestone:          true,
			MilestoneType:        "INSPECTION_ACTIVE",
			MilestoneTitle:       "Delivered! Your 48-Hour Home Inspection Window is Open",
			MilestoneDescription: "Take your time to check the screen, TrueTone, cameras, SIM signal, and battery health (97%).",
			MilestoneNextStep:    "Happy with the gadget? Tap 'Approve Payout' on the left to pay Chidi immediately.",
			Timestamp:            "Yesterday • 03:20 PM",
			CreatedAt:            baseTime.Add(150 * time.Minute),
		},
		{
			ID:         uuid.New(),
			OrderID:    orderIDKey,
			SenderRole: "seller",
			SenderName: "Chidi Gadgets (Seller)",
			Text:       "Glad the courier delivered safely! Take your time testing everything, and let me know if you have any questions about the setup.",
			Timestamp:  "Yesterday • 03:25 PM",
			CreatedAt:  baseTime.Add(155 * time.Minute),
		},
	}

	s.MessagesByOrder[orderIDKey] = seeded
	return seeded
}

func (s *OrderService) GetOrderMessages(ctx context.Context, orderIDKey string, userID uuid.UUID) ([]db.OrderChatMessage, error) {
	cleanID := strings.TrimSpace(orderIDKey)
	if cleanID == "" {
		return nil, errors.New("orderId is required")
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	raw := s.ensureDefaultOrderMessagesLocked(cleanID)
	out := make([]db.OrderChatMessage, len(raw))
	for i, m := range raw {
		msgCopy := *m
		if msgCopy.Timestamp == "" {
			msgCopy.Timestamp = msgCopy.CreatedAt.Format("03:04 PM")
		}
		out[i] = msgCopy
	}
	return out, nil
}

func (s *OrderService) AddOrderMessage(ctx context.Context, orderIDKey string, userID uuid.UUID, in SendOrderMessageInput) (*db.OrderChatMessage, error) {
	cleanID := strings.TrimSpace(orderIDKey)
	if cleanID == "" {
		return nil, errors.New("orderId is required")
	}
	if strings.TrimSpace(in.Text) == "" && strings.TrimSpace(in.AttachmentURL) == "" {
		return nil, errors.New("message text or attachmentUrl is required")
	}

	// If order exists in memory and is disputed, reject direct P2P messages
	if parsedUUID, err := uuid.Parse(cleanID); err == nil {
		s.Mu.RLock()
		ord, exists := s.OrdersByID[parsedUUID]
		s.Mu.RUnlock()
		if exists && ord.EscrowState == db.EscrowStateDisputed {
			return nil, errors.New("direct trade chat is paused while an active dispute is under mediation")
		}
	}

	maskedText, sanitized, reason := SanitizeTradeChatMessage(in.Text)

	// SEC-06 Hardening: Authenticated users have their sender identity and role derived
	// directly from their verified session, completely preventing counterparty or admin impersonation.
	senderRole := "buyer"
	senderName := "Buyer"

	if userID != uuid.Nil {
		if u, err := s.authService.GetUserByID(ctx, userID); err == nil && u != nil {
			senderName = u.Name
			senderRole = string(u.Role)
		}
	} else {
		// Unauthenticated fallback (test only): restrict strictly to buyer/seller, never allow admin spoofing
		reqRole := strings.ToLower(strings.TrimSpace(in.SenderRole))
		if reqRole == "seller" {
			senderRole = "seller"
			senderName = "Seller (Preview)"
		} else {
			senderRole = "buyer"
			senderName = "Buyer (Preview)"
		}
		if strings.TrimSpace(in.SenderName) != "" && !strings.Contains(strings.ToLower(in.SenderName), "admin") {
			senderName = strings.TrimSpace(in.SenderName)
		}
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	s.ensureDefaultOrderMessagesLocked(cleanID)

	now := time.Now()
	var senderIDStr string
	if userID != uuid.Nil {
		senderIDStr = userID.String()
	}

	msg := &db.OrderChatMessage{
		ID:                uuid.New(),
		OrderID:           cleanID,
		SenderID:          senderIDStr,
		SenderRole:        senderRole,
		SenderName:        senderName,
		Text:              maskedText,
		AttachmentURL:     strings.TrimSpace(in.AttachmentURL),
		AttachmentCaption: strings.TrimSpace(in.AttachmentCaption),
		Sanitized:         sanitized,
		SanitizedReason:   reason,
		IsMilestone:       false,
		Timestamp:         now.Format("03:04 PM"),
		CreatedAt:         now,
	}

	s.MessagesByOrder[cleanID] = append(s.MessagesByOrder[cleanID], msg)
	msgCopy := *msg
	return &msgCopy, nil
}

