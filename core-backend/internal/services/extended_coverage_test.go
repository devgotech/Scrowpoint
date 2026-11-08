package services

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type coverageFixture struct {
	auth     *AuthService
	listings *ListingService
	orders   *OrderService
	escrow   *EscrowService
	buyer    *db.User
	seller   *db.User
	admin    *db.User
	listing  *db.Listing
	order    *db.Order
}

func newCoverageFixture(t *testing.T) coverageFixture {
	t.Helper()
	ctx := context.Background()
	auth := NewAuthService()
	buyer, err := auth.SignUp(ctx, SignUpInput{
		Email: "extended-buyer@example.com", Password: "password-123", Name: "Extended Buyer",
	})
	if err != nil {
		t.Fatalf("create buyer: %v", err)
	}
	seller, err := auth.SignUp(ctx, SignUpInput{
		Email: "extended-seller@example.com", Password: "password-123", Name: "Extended Seller",
	})
	if err != nil {
		t.Fatalf("create seller: %v", err)
	}
	admin, err := auth.SignUp(ctx, SignUpInput{
		Email: "extended-admin@example.com", Password: "password-123", Name: "Extended Admin", Role: db.RoleAdmin,
	})
	if err != nil {
		t.Fatalf("create admin: %v", err)
	}
	listings := NewListingService(auth)
	listing := &db.Listing{
		ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive,
		Brand: "Apple", Model: "iPhone", SKU: "TEST-IPHONE", Price: 200000, Currency: "NGN",
	}
	listings.ListingsByID[listing.ID] = listing
	orders := NewOrderService(listings, auth)
	order, err := orders.CreateOrder(ctx, buyer.ID, CreateOrderInput{ListingID: listing.ID})
	if err != nil {
		t.Fatalf("create order: %v", err)
	}
	return coverageFixture{
		auth: auth, listings: listings, orders: orders, escrow: NewEscrowService(orders, auth),
		buyer: buyer, seller: seller, admin: admin, listing: listing, order: order,
	}
}

func TestExtendedAuthServiceFlows(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	user, session, err := auth.OAuthLogin(ctx, "google", "oauth@example.com", "OAuth User", "provider-1", "test", "127.0.0.1")
	if err != nil {
		t.Fatalf("OAuthLogin: %v", err)
	}
	if user.Email != "oauth@example.com" || session.UserID != user.ID {
		t.Fatalf("OAuthLogin returned unexpected user/session: %+v %+v", user, session)
	}
	if _, existingSession, err := auth.OAuthLogin(ctx, "google", user.Email, user.Name, "provider-1", "", ""); err != nil || existingSession.ID == session.ID {
		t.Fatalf("OAuthLogin existing account returned session=%+v error=%v", existingSession, err)
	}
	user.IsSuspended = true
	if _, _, err := auth.OAuthLogin(ctx, "google", user.Email, user.Name, "provider-1", "", ""); err == nil {
		t.Fatal("OAuthLogin accepted a suspended account")
	}

	user.IsSuspended = false
	if err := auth.ChangePassword(ctx, user.ID, "wrong-password", "new-password-123"); err == nil {
		t.Fatal("ChangePassword accepted the wrong current password")
	}
	if err := auth.ChangePassword(ctx, user.ID, "wrong-password", "short"); err == nil {
		t.Fatal("ChangePassword accepted a short new password")
	}
	if err := auth.ChangePassword(ctx, user.ID, "wrong-password", "new-password-123"); err == nil {
		t.Fatal("ChangePassword accepted an invalid old password")
	}

	created, err := auth.SignUp(ctx, SignUpInput{Email: "password-user@example.com", Password: "password-123", Name: "Password User"})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	if err := auth.ChangePassword(ctx, created.ID, "password-123", "new-password-123"); err != nil {
		t.Fatalf("ChangePassword: %v", err)
	}
	_, loginSession, err := auth.Login(ctx, created.Email, "new-password-123", "", "")
	if err != nil {
		t.Fatalf("Login after password change: %v", err)
	}
	sessions, err := auth.ListSessions(ctx, created.ID)
	if err != nil || len(sessions) == 0 {
		t.Fatalf("ListSessions returned %d sessions, error %v", len(sessions), err)
	}
	if err := auth.RevokeSession(ctx, created.ID, loginSession.ID); err != nil {
		t.Fatalf("RevokeSession: %v", err)
	}
	if err := auth.RevokeSession(ctx, created.ID, uuid.New()); err == nil {
		t.Fatal("RevokeSession accepted an unknown session")
	}
}

func TestExtendedListingServiceFlows(t *testing.T) {
	ctx := context.Background()
	fixture := newCoverageFixture(t)
	fixture.listing.Status = db.ListingLive
	sellerListings, err := fixture.listings.GetSellerListings(ctx, fixture.seller.ID)
	if err != nil || len(sellerListings) != 1 {
		t.Fatalf("GetSellerListings returned %d listings, error %v", len(sellerListings), err)
	}
	if _, err := fixture.listings.UpdateListing(ctx, fixture.seller.ID, fixture.listing.ID, DraftListingInput{
		Price: 220000, Description: "updated",
	}); err != nil {
		t.Fatalf("UpdateListing: %v", err)
	}
	if _, err := fixture.listings.UpdateListing(ctx, fixture.buyer.ID, fixture.listing.ID, DraftListingInput{Price: 1}); err == nil {
		t.Fatal("UpdateListing allowed a non-owner")
	}

	if err := fixture.listings.SaveListing(ctx, fixture.buyer.ID, fixture.listing.ID); err != nil {
		t.Fatalf("SaveListing: %v", err)
	}
	saved, err := fixture.listings.GetSavedListings(ctx, fixture.buyer.ID)
	if err != nil || len(saved) != 1 {
		t.Fatalf("GetSavedListings returned %d listings, error %v", len(saved), err)
	}
	if err := fixture.listings.UnsaveListing(ctx, fixture.buyer.ID, fixture.listing.ID); err != nil {
		t.Fatalf("UnsaveListing: %v", err)
	}

	draftService := NewListingService(fixture.auth)
	if _, err := draftService.AddDraftMedia(ctx, fixture.seller.ID, MediaUploadInput{MediaURL: "https://cdn.example.test/1.jpg"}); err != nil {
		t.Fatalf("AddDraftMedia first: %v", err)
	}
	second, err := draftService.AddDraftMedia(ctx, fixture.seller.ID, MediaUploadInput{MediaURL: "https://cdn.example.test/2.jpg"})
	if err != nil {
		t.Fatalf("AddDraftMedia second: %v", err)
	}
	if err := draftService.ReorderDraftMedia(ctx, fixture.seller.ID, MediaReorderInput{MediaOrder: []uuid.UUID{second.ID}}); err != nil {
		t.Fatalf("ReorderDraftMedia: %v", err)
	}

	for _, imei := range []string{"358941092837461", "ABC123456789"} {
		result, err := fixture.listings.VerifyIMEI(ctx, IMEIVerificationInput{IMEI: imei})
		if err != nil || !result.Valid {
			t.Errorf("VerifyIMEI(%q) = %+v, error %v", imei, result, err)
		}
	}
	if _, err := fixture.listings.VerifyIMEI(ctx, IMEIVerificationInput{}); err == nil {
		t.Fatal("VerifyIMEI accepted an empty identifier")
	}
}

func TestExtendedOrderAndEscrowFlows(t *testing.T) {
	ctx := context.Background()
	fixture := newCoverageFixture(t)
	if _, err := fixture.orders.GetQuote(ctx, fixture.order.ItemPrice, fixture.order.Currency); err != nil {
		t.Fatalf("GetQuote: %v", err)
	}
	if _, err := fixture.orders.GetQuoteForListing(ctx, fixture.listing.ID); err != nil {
		t.Fatalf("GetQuoteForListing: %v", err)
	}

	trackingOrder := fixture.orders.OrdersByID[fixture.order.ID]
	trackingOrder.EscrowState = db.EscrowStateInTransit
	trackingOrder.TrackingNumber = "TRACK-1"
	tracking, err := fixture.orders.GetOrderTracking(ctx, trackingOrder.ID, fixture.buyer.ID)
	if err != nil || !tracking.CanDispute {
		t.Fatalf("GetOrderTracking = %+v, error %v", tracking, err)
	}
	if _, err := fixture.orders.GetReceipt(ctx, trackingOrder.ID, fixture.buyer.ID); err != nil {
		t.Fatalf("GetReceipt: %v", err)
	}
	if _, err := fixture.orders.GetOrderMessages(ctx, trackingOrder.ID.String(), fixture.buyer.ID); err != nil {
		t.Fatalf("GetOrderMessages: %v", err)
	}
	message, err := fixture.orders.AddOrderMessage(ctx, trackingOrder.ID.String(), fixture.buyer.ID,
		SendOrderMessageInput{SenderRole: "admin", SenderName: "Impersonator", Text: "Contact me at user@example.com"})
	if err != nil || message.SenderRole != string(fixture.buyer.Role) || !strings.Contains(message.Text, "[EMAIL HIDDEN") {
		t.Fatalf("AddOrderMessage failed to derive identity/sanitize content: message=%+v error=%v", message, err)
	}
	if _, err := fixture.orders.AddOrderMessage(ctx, trackingOrder.ID.String(), fixture.buyer.ID, SendOrderMessageInput{}); err == nil {
		t.Fatal("AddOrderMessage accepted an empty message")
	}
	if _, err := fixture.orders.GetOrderMessages(ctx, " ", fixture.buyer.ID); err == nil {
		t.Fatal("GetOrderMessages accepted an empty order ID")
	}

	releaseOrder := fixture.orders.OrdersByID[fixture.order.ID]
	releaseOrder.EscrowState = db.EscrowStateInspectionPeriod
	if _, err := fixture.escrow.AppendLedgerEntry(ctx, releaseOrder.ID, db.EscrowTxDeposit,
		releaseOrder.TotalAmount, releaseOrder.Currency, nil, nil, "deposit-release", "test deposit"); err != nil {
		t.Fatalf("AppendLedgerEntry release deposit: %v", err)
	}
	if _, err := fixture.escrow.ReleaseFundsToSeller(ctx, releaseOrder.ID, false, "approved"); err != nil {
		t.Fatalf("ReleaseFundsToSeller: %v", err)
	}

	refundOrder := &db.Order{
		ID: uuid.New(), ListingID: fixture.listing.ID, BuyerID: fixture.buyer.ID,
		ItemPrice: 10000, TotalAmount: 10500, Currency: "NGN", EscrowState: db.EscrowStateDisputed,
	}
	fixture.orders.OrdersByID[refundOrder.ID] = refundOrder
	if _, err := fixture.escrow.AppendLedgerEntry(ctx, refundOrder.ID, db.EscrowTxDeposit,
		refundOrder.TotalAmount, refundOrder.Currency, nil, nil, "deposit-refund", "test deposit"); err != nil {
		t.Fatalf("AppendLedgerEntry refund deposit: %v", err)
	}
	if _, err := fixture.escrow.RefundBuyer(ctx, refundOrder.ID, "approved"); err != nil {
		t.Fatalf("RefundBuyer: %v", err)
	}
}

func TestExtendedPaymentAndDisputeFlows(t *testing.T) {
	ctx := context.Background()
	fixture := newCoverageFixture(t)
	payments := NewPaymentService("sk_test_mock", fixture.escrow, fixture.orders, fixture.auth)
	init, err := payments.InitializePaystackTransaction(ctx, fixture.order.ID, fixture.buyer.ID)
	if err != nil || init.Reference == "" {
		t.Fatalf("InitializePaystackTransaction = %+v, error %v", init, err)
	}
	payload := []byte(fmt.Sprintf(
		`{"event":"charge.success","data":{"reference":%q,"amount":%.0f,"currency":"NGN","status":"success"}}`,
		init.Reference, fixture.order.TotalAmount*100,
	))
	if err := payments.HandlePaystackWebhook(ctx, payload); err != nil {
		t.Fatalf("HandlePaystackWebhook charge.success: %v", err)
	}
	if _, err := payments.GetPayoutHistory(ctx, fixture.seller.ID); err != nil {
		t.Fatalf("GetPayoutHistory: %v", err)
	}
	if _, err := payments.ResolveBankAccount(ctx, fixture.seller.ID, NUBANResolutionInput{
		AccountNumber: "not-a-number", BankCode: "058",
	}); err == nil {
		t.Fatal("ResolveBankAccount accepted invalid account number")
	}
	if _, err := payments.ResolveBankAccount(ctx, fixture.seller.ID, NUBANResolutionInput{
		AccountNumber: "0123456789", BankCode: "058",
	}); err != nil {
		t.Fatalf("ResolveBankAccount: %v", err)
	}
	if err := payments.HandlePaystackWebhook(ctx, []byte("{")); err == nil {
		t.Fatal("HandlePaystackWebhook accepted invalid JSON")
	}

	// Use a separate in-transit order so the dispute workflow is independent of payment settlement.
	listing := &db.Listing{
		ID: uuid.New(), SellerID: fixture.seller.ID, Status: db.ListingLive,
		Brand: "Samsung", Model: "Phone", Price: 100000, Currency: "NGN",
	}
	fixture.listings.ListingsByID[listing.ID] = listing
	order, err := fixture.orders.CreateOrder(ctx, fixture.buyer.ID, CreateOrderInput{ListingID: listing.ID})
	if err != nil {
		t.Fatalf("CreateOrder for dispute: %v", err)
	}
	order.EscrowState = db.EscrowStateInTransit
	disputes := NewDisputeService(fixture.orders, fixture.escrow, fixture.auth)
	dispute, err := disputes.OpenDispute(ctx, fixture.buyer.ID, OpenDisputeInput{
		OrderID: order.ID, IssueType: "damaged item",
	})
	if err != nil {
		t.Fatalf("OpenDispute: %v", err)
	}
	if _, err := disputes.SubmitEvidence(ctx, dispute.ID, fixture.buyer.ID, SubmitEvidenceInput{
		EvidenceType: db.EvidenceTypePhoto, MediaURL: "private/evidence.jpg",
	}); err != nil {
		t.Fatalf("SubmitEvidence: %v", err)
	}
	if _, err := disputes.FinalizeEvidenceSubmission(ctx, dispute.ID, fixture.buyer.ID); err != nil {
		t.Fatalf("FinalizeEvidenceSubmission: %v", err)
	}
	if _, err := disputes.RespondToDispute(ctx, dispute.ID, fixture.seller.ID, SellerResponseInput{
		Decision: "accept_fault", Notes: "Accepting the claim",
	}); err != nil {
		t.Fatalf("RespondToDispute: %v", err)
	}
	if _, err := disputes.MarkReturnShipped(ctx, dispute.ID, fixture.buyer.ID, "RETURN-TRACK-1"); err != nil {
		t.Fatalf("MarkReturnShipped: %v", err)
	}
	if _, err := disputes.GetDisputeByID(ctx, dispute.ID); err != nil {
		t.Fatalf("GetDisputeByID: %v", err)
	}
	if _, _, err := disputes.ListDisputes(ctx, "", 1, 10); err != nil {
		t.Fatalf("ListDisputes: %v", err)
	}
	if _, err := disputes.GetTimeline(ctx, dispute.ID); err != nil {
		t.Fatalf("GetTimeline: %v", err)
	}
	if _, err := disputes.AssignDispute(ctx, dispute.ID, fixture.admin.ID); err != nil {
		t.Fatalf("AssignDispute: %v", err)
	}
	if _, err := disputes.OpenSubCase(ctx, dispute.ID, fixture.seller.ID, SubCaseInput{
		IssueType: "missing accessory", Description: "Charger not returned",
	}); err != nil {
		t.Fatalf("OpenSubCase: %v", err)
	}
	if _, err := disputes.IssueMediationVerdict(ctx, dispute.ID, fixture.admin.ID, DisputeVerdictInput{
		Outcome: db.MediationOutcomeSplit, Notes: "Split decision",
	}); err != nil {
		t.Fatalf("IssueMediationVerdict: %v", err)
	}
	appeal, err := disputes.SubmitAppeal(ctx, dispute.ID, fixture.buyer.ID, AppealInput{Reason: "New evidence"})
	if err != nil {
		t.Fatalf("SubmitAppeal: %v", err)
	}
	if _, err := disputes.DecideAppeal(ctx, appeal.ID, fixture.admin.ID, true, "Decision upheld"); err != nil {
		t.Fatalf("DecideAppeal: %v", err)
	}
}
