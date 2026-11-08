package db

import (
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleBuyer  UserRole = "buyer"
	RoleSeller UserRole = "seller"
	RoleAdmin  UserRole = "admin"
)

type KYCStatus string

const (
	KYCPending              KYCStatus = "pending"
	KYCApproved             KYCStatus = "approved"
	KYCRejected             KYCStatus = "rejected"
	KYCManualReviewRequired KYCStatus = "manual_review_required"
)

type PaymentMethodType string

const (
	PaymentMethodTypeCard   PaymentMethodType = "card"
	PaymentMethodTypeBank   PaymentMethodType = "bank"
	PaymentMethodTypeWallet PaymentMethodType = "wallet"
)

type DeviceCondition string

const (
	ConditionMint    DeviceCondition = "mint"
	ConditionGood    DeviceCondition = "good"
	ConditionFair    DeviceCondition = "fair"
	ConditionSalvage DeviceCondition = "salvage"
)

type ListingStatus string

const (
	ListingDraft   ListingStatus = "draft"
	ListingLive    ListingStatus = "live"
	ListingLocked  ListingStatus = "locked"
	ListingSold    ListingStatus = "sold"
	ListingRemoved ListingStatus = "removed"
)

type FulfillmentMethod string

const (
	FulfillmentShipping     FulfillmentMethod = "shipping"
	FulfillmentLocalHandoff FulfillmentMethod = "local_handoff"
)

type EscrowState string

const (
	EscrowStateCreated          EscrowState = "created"
	EscrowStatePendingPayment    EscrowState = "pending_payment"
	EscrowStateFundsHeld        EscrowState = "funds_held"
	EscrowStateInTransit        EscrowState = "in_transit"
	EscrowStateInspectionPeriod EscrowState = "inspection_period"
	EscrowStateCompleted        EscrowState = "completed"
	EscrowStateDisputed         EscrowState = "disputed"
	EscrowStateRefunded         EscrowState = "refunded"
	EscrowStateReleasedManual   EscrowState = "released_manual"
)

type PaymentMethod string

const (
	PaymentMethodCard   PaymentMethod = "card"
	PaymentMethodBank   PaymentMethod = "bank"
	PaymentMethodCrypto PaymentMethod = "crypto"
	PaymentMethodWallet PaymentMethod = "wallet"
)

type PaymentStatus string

const (
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusFunded  PaymentStatus = "funded"
	PaymentStatusFailed  PaymentStatus = "failed"
	PaymentStatusPaidOut PaymentStatus = "paid_out"
)

type EscrowTxType string

const (
	EscrowTxDeposit     EscrowTxType = "deposit"
	EscrowTxPlatformFee EscrowTxType = "platform_fee"
	EscrowTxGatewayFee  EscrowTxType = "gateway_fee"
	EscrowTxRelease     EscrowTxType = "release"
	EscrowTxRefund      EscrowTxType = "refund"
	EscrowTxSplit       EscrowTxType = "split"
)

type DisputeStatus string

const (
	DisputeStatusOpen               DisputeStatus = "open"
	DisputeStatusEvidenceCollection DisputeStatus = "evidence_collection"
	DisputeStatusSellerReview       DisputeStatus = "seller_review"
	DisputeStatusAdminMediation     DisputeStatus = "admin_mediation"
	DisputeStatusResolved           DisputeStatus = "resolved"
	DisputeStatusAppealed           DisputeStatus = "appealed"
)

type MediationOutcome string

const (
	MediationOutcomeRefundBuyer     MediationOutcome = "refund_buyer"
	MediationOutcomeReleaseToSeller MediationOutcome = "release_to_seller"
	MediationOutcomeSplit           MediationOutcome = "split"
)

type EvidenceType string

const (
	EvidenceTypePhoto    EvidenceType = "photo"
	EvidenceTypeVideo    EvidenceType = "video"
	EvidenceTypeTracking EvidenceType = "tracking"
)

type AppealStatus string

const (
	AppealStatusPending    AppealStatus = "pending"
	AppealStatusUpheld     AppealStatus = "upheld"
	AppealStatusOverturned AppealStatus = "overturned"
)

type NotificationChannel string

const (
	NotificationChannelInApp NotificationChannel = "in_app"
	NotificationChannelEmail NotificationChannel = "email"
)

type ReportTargetType string

const (
	ReportTargetUser    ReportTargetType = "user"
	ReportTargetListing ReportTargetType = "listing"
)

type ReportStatus string

const (
	ReportStatusOpen      ReportStatus = "open"
	ReportStatusReviewed  ReportStatus = "reviewed"
	ReportStatusDismissed ReportStatus = "dismissed"
)

type PayoutStatus string

const (
	PayoutStatusPending    PayoutStatus = "pending"
	PayoutStatusProcessing PayoutStatus = "processing"
	PayoutStatusCompleted  PayoutStatus = "completed"
	PayoutStatusFailed     PayoutStatus = "failed"
)

type User struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	Role            UserRole   `json:"role" db:"role"`
	Email           string     `json:"email" db:"email"`
	PasswordHash    string     `json:"-" db:"password_hash"`
	Name            string     `json:"name" db:"name"`
	Phone           string     `json:"phone,omitempty" db:"phone"`
	Location        string     `json:"location,omitempty" db:"location"`
	AvatarURL       string     `json:"avatarUrl,omitempty" db:"avatar_url"`
	KYCStatus       KYCStatus  `json:"kycStatus" db:"kyc_status"`
	RatingAvg       float64    `json:"ratingAvg" db:"rating_avg"`
	RatingCount     int        `json:"ratingCount" db:"rating_count"`
	IsSuspended     bool       `json:"isSuspended" db:"is_suspended"`
	EmailVerifiedAt *time.Time `json:"emailVerifiedAt,omitempty" db:"email_verified_at"`
	CreatedAt       time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time  `json:"updatedAt" db:"updated_at"`
	DeletedAt       *time.Time `json:"deletedAt,omitempty" db:"deleted_at"`
}

type UserVerification struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	UserID          uuid.UUID  `json:"userId" db:"user_id"`
	ProviderRef     string     `json:"providerRef" db:"provider_ref"`
	Status          KYCStatus  `json:"status" db:"status"`
	RejectionReason string     `json:"rejectionReason,omitempty" db:"rejection_reason"`
	Metadata        []byte     `json:"metadata,omitempty" db:"metadata"`
	CreatedAt       time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time  `json:"updatedAt" db:"updated_at"`
	DeletedAt       *time.Time `json:"deletedAt,omitempty" db:"deleted_at"`
}

type SavedPaymentMethod struct {
	ID                        uuid.UUID         `json:"id" db:"id"`
	UserID                    uuid.UUID         `json:"userId" db:"user_id"`
	Type                      PaymentMethodType `json:"type" db:"type"`
	MaskedDetails             string            `json:"maskedDetails" db:"masked_details"`
	IsDefault                 bool              `json:"isDefault" db:"is_default"`
	ProviderAuthorizationCode string            `json:"-" db:"provider_authorization_code"`
	BankName                  string            `json:"bankName,omitempty" db:"bank_name"`
	AccountNumberLast4        string            `json:"accountNumberLast4,omitempty" db:"account_number_last4"`
	CreatedAt                 time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt                 time.Time         `json:"updatedAt" db:"updated_at"`
	DeletedAt                 *time.Time        `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Listing struct {
	ID                uuid.UUID         `json:"id" db:"id"`
	SellerID          uuid.UUID         `json:"sellerId" db:"seller_id"`
	Category          string            `json:"category" db:"category"`
	Brand             string            `json:"brand" db:"brand"`
	Model             string            `json:"model" db:"model"`
	SKU               string            `json:"sku" db:"sku"`
	Condition         DeviceCondition   `json:"condition" db:"condition"`
	Price             float64           `json:"price" db:"price"`
	Currency          string            `json:"currency" db:"currency"`
	EscrowTerms       string            `json:"escrowTerms" db:"escrow_terms"`
	Description       string            `json:"description,omitempty" db:"description"`
	Status            ListingStatus     `json:"status" db:"status"`
	FulfillmentMethod FulfillmentMethod `json:"fulfillmentMethod" db:"fulfillment_method"`
	Media             []ListingMedia    `json:"media,omitempty" db:"-"`
	Seller            *User             `json:"seller,omitempty" db:"-"`
	CreatedAt         time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time         `json:"updatedAt" db:"updated_at"`
	DeletedAt         *time.Time        `json:"deletedAt,omitempty" db:"deleted_at"`
}

type ListingMedia struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	ListingID uuid.UUID  `json:"listingId" db:"listing_id"`
	MediaURL  string     `json:"mediaUrl" db:"media_url"`
	MediaType string     `json:"mediaType" db:"media_type"`
	SortOrder int        `json:"sortOrder" db:"sort_order"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time  `json:"updatedAt" db:"updated_at"`
	DeletedAt *time.Time `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Order struct {
	ID                  uuid.UUID         `json:"id" db:"id"`
	ListingID           uuid.UUID         `json:"listingId" db:"listing_id"`
	BuyerID             uuid.UUID         `json:"buyerId" db:"buyer_id"`
	FulfillmentMethod   FulfillmentMethod `json:"fulfillmentMethod" db:"fulfillment_method"`
	EscrowState         EscrowState       `json:"escrowState" db:"escrow_state"`
	ItemPrice           float64           `json:"itemPrice" db:"item_price"`
	PlatformFee         float64           `json:"platformFee" db:"platform_fee"`
	GatewayFee          float64           `json:"gatewayFee" db:"gateway_fee"`
	TotalAmount         float64           `json:"totalAmount" db:"total_amount"`
	Currency            string            `json:"currency" db:"currency"`
	InspectionExpiresAt *time.Time        `json:"inspectionExpiresAt,omitempty" db:"inspection_expires_at"`
	ShippingLabelURL    string            `json:"shippingLabelUrl,omitempty" db:"shipping_label_url"`
	TrackingNumber      string            `json:"trackingNumber,omitempty" db:"tracking_number"`
	TrackingCarrier     string            `json:"trackingCarrier,omitempty" db:"tracking_carrier"`
	DeliveredAt         *time.Time        `json:"deliveredAt,omitempty" db:"delivered_at"`
	CompletedAt         *time.Time        `json:"completedAt,omitempty" db:"completed_at"`
	Listing             *Listing          `json:"listing,omitempty" db:"-"`
	Buyer               *User             `json:"buyer,omitempty" db:"-"`
	CreatedAt           time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt           time.Time         `json:"updatedAt" db:"updated_at"`
	DeletedAt           *time.Time        `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Payment struct {
	ID                  uuid.UUID     `json:"id" db:"id"`
	OrderID             uuid.UUID     `json:"orderId" db:"order_id"`
	Amount              float64       `json:"amount" db:"amount"`
	Currency            string        `json:"currency" db:"currency"`
	Method              PaymentMethod `json:"method" db:"method"`
	Status              PaymentStatus `json:"status" db:"status"`
	GatewayReference    string        `json:"gatewayReference,omitempty" db:"gateway_reference"`
	PaystackAccessCode  string        `json:"paystackAccessCode,omitempty" db:"paystack_access_code"`
	PaidAt              *time.Time    `json:"paidAt,omitempty" db:"paid_at"`
	CreatedAt           time.Time     `json:"createdAt" db:"created_at"`
	UpdatedAt           time.Time     `json:"updatedAt" db:"updated_at"`
	DeletedAt           *time.Time    `json:"deletedAt,omitempty" db:"deleted_at"`
}

type EscrowTransaction struct {
	ID              uuid.UUID    `json:"id" db:"id"`
	OrderID         uuid.UUID    `json:"orderId" db:"order_id"`
	Amount          float64      `json:"amount" db:"amount"`
	Currency        string       `json:"currency" db:"currency"`
	TransactionType EscrowTxType `json:"transactionType" db:"transaction_type"`
	FromUserID      *uuid.UUID   `json:"fromUserId,omitempty" db:"from_user_id"`
	ToUserID        *uuid.UUID   `json:"toUserId,omitempty" db:"to_user_id"`
	BalanceAfter    float64      `json:"balanceAfter" db:"balance_after"`
	Reference       string       `json:"reference" db:"reference"`
	Notes           string       `json:"notes,omitempty" db:"notes"`
	CreatedAt       time.Time    `json:"createdAt" db:"created_at"`
}

type Dispute struct {
	ID                     uuid.UUID         `json:"id" db:"id"`
	OrderID                uuid.UUID         `json:"orderId" db:"order_id"`
	ParentDisputeID        *uuid.UUID        `json:"parentDisputeId,omitempty" db:"parent_dispute_id"`
	IssueType              string            `json:"issueType" db:"issue_type"`
	Status                 DisputeStatus     `json:"status" db:"status"`
	MediationOutcome       *MediationOutcome `json:"mediationOutcome,omitempty" db:"mediation_outcome"`
	AssignedAdminID        *uuid.UUID        `json:"assignedAdminId,omitempty" db:"assigned_admin_id"`
	EvidenceDeadline       *time.Time        `json:"evidenceDeadline,omitempty" db:"evidence_deadline"`
	SellerResponseDeadline *time.Time        `json:"sellerResponseDeadline,omitempty" db:"seller_response_deadline"`
	ReturnDeadline         *time.Time        `json:"returnDeadline,omitempty" db:"return_deadline"`
	ReturnTrackingNumber   string            `json:"returnTrackingNumber,omitempty" db:"return_tracking_number"`
	ReturnLabelURL         string            `json:"returnLabelUrl,omitempty" db:"return_label_url"`
	MediatorNotes          string            `json:"mediatorNotes,omitempty" db:"mediator_notes"`
	SellerResponseNotes    string            `json:"sellerResponseNotes,omitempty" db:"seller_response_notes"`
	Evidence               []DisputeEvidence `json:"evidence,omitempty" db:"-"`
	CreatedAt              time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt              time.Time         `json:"updatedAt" db:"updated_at"`
	DeletedAt              *time.Time        `json:"deletedAt,omitempty" db:"deleted_at"`
}

type DisputeEvidence struct {
	ID           uuid.UUID    `json:"id" db:"id"`
	DisputeID    uuid.UUID    `json:"disputeId" db:"dispute_id"`
	SubmittedBy  uuid.UUID    `json:"submittedBy" db:"submitted_by"`
	EvidenceType EvidenceType `json:"evidenceType" db:"evidence_type"`
	MediaURL     string       `json:"mediaUrl" db:"media_url"`
	Description  string       `json:"description,omitempty" db:"description"`
	CreatedAt    time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time    `json:"updatedAt" db:"updated_at"`
	DeletedAt    *time.Time   `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Appeal struct {
	ID                     uuid.UUID    `json:"id" db:"id"`
	DisputeID              uuid.UUID    `json:"disputeId" db:"dispute_id"`
	AppellantID            uuid.UUID    `json:"appellantId" db:"appellant_id"`
	Reason                 string       `json:"reason" db:"reason"`
	Status                 AppealStatus `json:"status" db:"status"`
	ArbitratorID           *uuid.UUID   `json:"arbitratorId,omitempty" db:"arbitrator_id"`
	ArbitratorVerdictNotes string       `json:"arbitratorVerdictNotes,omitempty" db:"arbitrator_verdict_notes"`
	DecidedAt              *time.Time   `json:"decidedAt,omitempty" db:"decided_at"`
	CreatedAt              time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt              time.Time    `json:"updatedAt" db:"updated_at"`
	DeletedAt              *time.Time   `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Notification struct {
	ID           uuid.UUID           `json:"id" db:"id"`
	UserID       uuid.UUID           `json:"userId" db:"user_id"`
	Channel      NotificationChannel `json:"channel" db:"channel"`
	TriggerEvent string              `json:"triggerEvent" db:"trigger_event"`
	Title        string              `json:"title" db:"title"`
	Message      string              `json:"message" db:"message"`
	Data         []byte              `json:"data,omitempty" db:"data"`
	IsRead       bool                `json:"isRead" db:"is_read"`
	CreatedAt    time.Time           `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time           `json:"updatedAt" db:"updated_at"`
	DeletedAt    *time.Time          `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Report struct {
	ID              uuid.UUID        `json:"id" db:"id"`
	ReportedBy      uuid.UUID        `json:"reportedBy" db:"reported_by"`
	TargetType      ReportTargetType `json:"targetType" db:"target_type"`
	TargetID        uuid.UUID        `json:"targetId" db:"target_id"`
	Reason          string           `json:"reason" db:"reason"`
	Status          ReportStatus     `json:"status" db:"status"`
	ReviewedBy      *uuid.UUID       `json:"reviewedBy,omitempty" db:"reviewed_by"`
	ResolutionNotes string           `json:"resolutionNotes,omitempty" db:"resolution_notes"`
	CreatedAt       time.Time        `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time        `json:"updatedAt" db:"updated_at"`
	DeletedAt       *time.Time       `json:"deletedAt,omitempty" db:"deleted_at"`
}

type Payout struct {
	ID                  uuid.UUID    `json:"id" db:"id"`
	SellerID            uuid.UUID    `json:"sellerId" db:"seller_id"`
	Amount              float64      `json:"amount" db:"amount"`
	Currency            string       `json:"currency" db:"currency"`
	PaymentMethodID     *uuid.UUID   `json:"paymentMethodId,omitempty" db:"payment_method_id"`
	Status              PayoutStatus `json:"status" db:"status"`
	Reference           string       `json:"reference" db:"reference"`
	GatewayTransferCode string       `json:"gatewayTransferCode,omitempty" db:"gateway_transfer_code"`
	CreatedAt           time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt           time.Time    `json:"updatedAt" db:"updated_at"`
	DeletedAt           *time.Time   `json:"deletedAt,omitempty" db:"deleted_at"`
}

type WaitlistEntry struct {
	ID               uuid.UUID `json:"id" db:"id"`
	FullName         string    `json:"fullName" db:"full_name"`
	Email            string    `json:"email" db:"email"`
	Phone            string    `json:"phone" db:"phone"`
	Role             string    `json:"role" db:"role"`
	City             string    `json:"city" db:"city"`
	FavoriteGadgets  []string  `json:"favoriteGadgets" db:"-"`
	MonthlyVolume    string    `json:"monthlyVolume" db:"monthly_volume"`
	ReferralCode     string    `json:"referralCode" db:"referral_code"`
	ReferredBy       string    `json:"referredBy,omitempty" db:"referred_by"`
	ReferralCount    int       `json:"referralCount" db:"referral_count"`
	QueuePosition    int       `json:"queuePosition" db:"queue_position"`
	PriorityUnlocked bool      `json:"priorityUnlocked" db:"priority_unlocked"`
	CreatedAt        time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time `json:"updatedAt" db:"updated_at"`
}

type OrderChatMessage struct {
	ID                   uuid.UUID `json:"id" db:"id"`
	OrderID              string    `json:"orderId" db:"order_id"`
	SenderID             string    `json:"senderId,omitempty" db:"sender_id"`
	SenderRole           string    `json:"sender" db:"sender_role"`
	SenderName           string    `json:"senderName" db:"sender_name"`
	Text                 string    `json:"text" db:"message_text"`
	AttachmentURL        string    `json:"attachmentUrl,omitempty" db:"attachment_url"`
	AttachmentCaption    string    `json:"attachmentCaption,omitempty" db:"attachment_caption"`
	Sanitized            bool      `json:"sanitized" db:"sanitized"`
	SanitizedReason      string    `json:"sanitizedReason,omitempty" db:"sanitized_reason"`
	IsMilestone          bool      `json:"isMilestone" db:"is_milestone"`
	MilestoneType        string    `json:"milestoneType,omitempty" db:"milestone_type"`
	MilestoneTitle       string    `json:"milestoneTitle,omitempty" db:"milestone_title"`
	MilestoneDescription string    `json:"milestoneDescription,omitempty" db:"milestone_description"`
	MilestoneNextStep    string    `json:"milestoneNextStepHint,omitempty" db:"milestone_next_step"`
	Timestamp            string    `json:"timestamp" db:"-"`
	CreatedAt            time.Time `json:"createdAt" db:"created_at"`
}

type SupportTicket struct {
	ID           uuid.UUID `json:"id" db:"id"`
	TicketNumber string    `json:"ticketNumber" db:"ticket_number"`
	SessionID    string    `json:"sessionId" db:"session_id"`
	UserID       string    `json:"userId,omitempty" db:"user_id"`
	UserEmail    string    `json:"userEmail,omitempty" db:"user_email"`
	UserName     string    `json:"userName,omitempty" db:"user_name"`
	OrderID      string    `json:"orderId,omitempty" db:"order_id"`
	Category     string    `json:"category" db:"category"`
	Status       string    `json:"status" db:"status"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

type SupportMessage struct {
	ID         uuid.UUID `json:"id" db:"id"`
	TicketID   string    `json:"ticketId,omitempty" db:"ticket_id"`
	SessionID  string    `json:"sessionId" db:"session_id"`
	Sender     string    `json:"sender" db:"sender"`
	SenderName string    `json:"senderName" db:"sender_name"`
	Text       string    `json:"text" db:"message_text"`
	Time       string    `json:"time" db:"-"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
}

type EscrowQuote struct {
	ItemPrice   float64 `json:"itemPrice"`
	FeeTierRate float64 `json:"feeTierRate"`
	PlatformFee float64 `json:"platformFee"`
	GatewayFee  float64 `json:"gatewayFee"`
	TotalDue    float64 `json:"totalDue"`
	Currency    string  `json:"currency"`
}

func CalculateEscrowQuote(price float64, currency string) (EscrowQuote, error) {
	if price <= 0 {
		return EscrowQuote{}, errors.New("price must be greater than zero")
	}

	if currency == "" {
		currency = "NGN"
	}

	var feeRate float64
	switch {
	case price <= 150000:
		feeRate = 0.050 // 5.0%
	case price <= 750000:
		feeRate = 0.025 // 2.5% standard
	default:
		feeRate = 0.015 // 1.5% high volume
	}

	platformFee := roundToCent(price * feeRate)
	totalDue := roundToCent(price + platformFee)

	return EscrowQuote{
		ItemPrice:   price,
		FeeTierRate: feeRate,
		PlatformFee: platformFee,
		GatewayFee:  0.0,
		TotalDue:    totalDue,
		Currency:    currency,
	}, nil
}

func GenerateSKU(category, brand, model, storage string, condition DeviceCondition) string {
	cleanCategory := strings.ToUpper(strings.TrimSpace(category))
	cleanBrand := strings.ToUpper(strings.TrimSpace(brand))
	cleanModel := strings.ToUpper(strings.TrimSpace(model))
	cleanStorage := strings.ToUpper(strings.TrimSpace(storage))
	cleanGrade := strings.ToUpper(strings.TrimSpace(string(condition)))

	switch cleanCategory {
	case "SMARTPHONE", "PHONE":
		cleanCategory = "PHN"
	case "LAPTOP", "COMPUTER":
		cleanCategory = "LPT"
	case "TABLET", "IPAD":
		cleanCategory = "TAB"
	}

	cleanModel = strings.ReplaceAll(cleanModel, " ", "")

	return fmt.Sprintf("%s-%s-%s-%s-%s", cleanCategory, cleanBrand, cleanModel, cleanStorage, cleanGrade)
}

func ValidateStateTransition(current EscrowState, next EscrowState) error {
	validNextStates, exists := validTransitions[current]
	if !exists {
		return fmt.Errorf("unknown current state: %s", current)
	}

	for _, state := range validNextStates {
		if state == next {
			return nil
		}
	}

	return fmt.Errorf("illegal escrow state transition: %s -> %s", current, next)
}

var validTransitions = map[EscrowState][]EscrowState{
	EscrowStateCreated: {
		EscrowStatePendingPayment,
		EscrowStateFundsHeld,
	},
	EscrowStatePendingPayment: {
		EscrowStateFundsHeld,
	},
	EscrowStateFundsHeld: {
		EscrowStateInTransit,
		EscrowStateDisputed,
		EscrowStateRefunded,
	},
	EscrowStateInTransit: {
		EscrowStateInspectionPeriod,
		EscrowStateDisputed,
	},
	EscrowStateInspectionPeriod: {
		EscrowStateCompleted,
		EscrowStateDisputed,
	},
	EscrowStateDisputed: {
		EscrowStateRefunded,
		EscrowStateReleasedManual,
	},
	EscrowStateCompleted:      {},
	EscrowStateRefunded:       {},
	EscrowStateReleasedManual: {},
}

func roundToCent(val float64) float64 {
	return math.Round(val*100) / 100
}
