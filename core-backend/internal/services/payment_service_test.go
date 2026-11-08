package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func paymentTestFixture(secret string) (*PaymentService, *OrderService) {
	auth := NewAuthService()
	listings := NewListingService(auth)
	orders := NewOrderService(listings, auth)
	escrow := NewEscrowService(orders, auth)
	return NewPaymentService(secret, escrow, orders, auth), orders
}

func TestVerifyWebhookSignature(t *testing.T) {
	t.Setenv("ENV", "test")
	t.Setenv("ALLOW_DEV_MOCK_PAYMENTS", "false")
	service, _ := paymentTestFixture("paystack-test-secret")
	payload := []byte(`{"event":"charge.success"}`)
	mac := hmac.New(sha512.New, []byte("paystack-test-secret"))
	mac.Write(payload)
	validSignature := hex.EncodeToString(mac.Sum(nil))

	if !service.VerifyWebhookSignature(payload, validSignature) {
		t.Fatal("VerifyWebhookSignature rejected a valid HMAC")
	}
	if service.VerifyWebhookSignature(payload, "invalid") {
		t.Fatal("VerifyWebhookSignature accepted an invalid HMAC")
	}
	if service.VerifyWebhookSignature(payload, "") {
		t.Fatal("VerifyWebhookSignature accepted an empty signature")
	}
	emptySecret, _ := paymentTestFixture("")
	if emptySecret.VerifyWebhookSignature(payload, validSignature) {
		t.Fatal("VerifyWebhookSignature accepted a signature without a configured secret")
	}
}

func TestPaymentMethodsDefaultSelectionAndDeletion(t *testing.T) {
	service, _ := paymentTestFixture("test-secret")
	ctx := context.Background()
	userID := uuid.New()

	first, err := service.AddPaymentMethod(ctx, userID, AddPaymentMethodInput{
		Type: db.PaymentMethodTypeCard, MaskedDetails: "**** 4242",
	})
	if err != nil {
		t.Fatalf("AddPaymentMethod returned error: %v", err)
	}
	if !first.IsDefault {
		t.Fatal("first saved payment method was not made default")
	}
	second, err := service.AddPaymentMethod(ctx, userID, AddPaymentMethodInput{
		Type: db.PaymentMethodTypeBank, MaskedDetails: "**** 1234", IsDefault: true,
	})
	if err != nil {
		t.Fatalf("AddPaymentMethod returned error: %v", err)
	}
	methods, err := service.ListPaymentMethods(ctx, userID)
	if err != nil {
		t.Fatalf("ListPaymentMethods returned error: %v", err)
	}
	if len(methods) != 2 || methods[0].IsDefault || !methods[1].IsDefault {
		t.Errorf("new default method not selected exclusively: %+v", methods)
	}
	if err := service.SetDefaultPaymentMethod(ctx, userID, first.ID); err != nil {
		t.Fatalf("SetDefaultPaymentMethod returned error: %v", err)
	}
	if err := service.DeletePaymentMethod(ctx, userID, second.ID); err != nil {
		t.Fatalf("DeletePaymentMethod returned error: %v", err)
	}
	methods, err = service.ListPaymentMethods(ctx, userID)
	if err != nil {
		t.Fatalf("ListPaymentMethods returned error: %v", err)
	}
	if len(methods) != 1 || !methods[0].IsDefault || methods[0].ID != first.ID {
		t.Errorf("unexpected remaining payment methods: %+v", methods)
	}
	if _, err := service.AddPaymentMethod(ctx, userID, AddPaymentMethodInput{}); err == nil {
		t.Fatal("AddPaymentMethod accepted empty masked details")
	}
	if err := service.SetDefaultPaymentMethod(ctx, userID, uuid.New()); err == nil {
		t.Fatal("SetDefaultPaymentMethod accepted an unknown method")
	}
}

func TestRequestPayoutUsesAvailableSellerEarnings(t *testing.T) {
	service, orders := paymentTestFixture("test-secret")
	ctx := context.Background()
	sellerID := uuid.New()
	listing := &db.Listing{ID: uuid.New(), SellerID: sellerID}
	orders.listingService.ListingsByID[listing.ID] = listing

	order := &db.Order{
		ID: uuid.New(), ListingID: listing.ID, ItemPrice: 100,
		EscrowState: db.EscrowStateCompleted, Currency: "NGN",
	}
	orders.OrdersByID[order.ID] = order
	orders.OrdersBySeller[sellerID] = []uuid.UUID{order.ID}

	payout, err := service.RequestPayout(ctx, sellerID, PayoutRequestInput{
		Amount: 60, PaymentMethodID: uuid.New(),
	})
	if err != nil {
		t.Fatalf("RequestPayout returned error: %v", err)
	}
	if payout.Amount != 60 || payout.Status != db.PayoutStatusCompleted || payout.SellerID != sellerID {
		t.Errorf("unexpected payout: %+v", payout)
	}
	summary, err := service.GetSellerEarningsSummary(ctx, sellerID)
	if err != nil {
		t.Fatalf("GetSellerEarningsSummary returned error: %v", err)
	}
	if summary.AvailableBalance != 40 || summary.TotalPaidOut != 60 {
		t.Errorf("unexpected earnings after payout: %+v", summary)
	}
	if _, err := service.RequestPayout(ctx, sellerID, PayoutRequestInput{Amount: 41}); err == nil {
		t.Fatal("RequestPayout allowed withdrawal beyond available earnings")
	}
	if _, err := service.RequestPayout(ctx, sellerID, PayoutRequestInput{Amount: 0}); err == nil {
		t.Fatal("RequestPayout accepted zero amount")
	}
}

func TestResolveBankAccountValidatesNUBANAndUsesDirectory(t *testing.T) {
	service, _ := paymentTestFixture("sk_test_mock")
	resolved, err := service.ResolveBankAccount(context.Background(), uuid.New(), NUBANResolutionInput{
		AccountNumber: "0123456789",
	})
	if err != nil {
		t.Fatalf("ResolveBankAccount returned error: %v", err)
	}
	if resolved.BankCode != "058" || resolved.BankName == "" || resolved.Provider != "paystack_nip" {
		t.Errorf("unexpected bank resolution: %+v", resolved)
	}
	for _, invalid := range []string{"123", "abcdefghij"} {
		if _, err := service.ResolveBankAccount(context.Background(), uuid.New(), NUBANResolutionInput{
			AccountNumber: invalid,
		}); err == nil {
			t.Errorf("ResolveBankAccount accepted invalid account number %q", invalid)
		}
	}
}
