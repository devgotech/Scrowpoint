package services

import (
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestCreateOrderLocksListingAndCalculatesQuote(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	buyer, err := auth.SignUp(ctx, SignUpInput{
		Email: "buyer-order@example.com", Password: "password-123", Name: "Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp buyer returned error: %v", err)
	}
	seller, err := auth.SignUp(ctx, SignUpInput{
		Email: "seller-order@example.com", Password: "password-123", Name: "Seller",
	})
	if err != nil {
		t.Fatalf("SignUp seller returned error: %v", err)
	}
	listings := NewListingService(auth)
	listing := &db.Listing{
		ID: uuid.New(), SellerID: seller.ID, Brand: "Apple", Model: "iPhone",
		SKU: "PHN-APPLE-IPHON-STD-GOOD", Price: 200000, Currency: "NGN",
		Status: db.ListingLive,
	}
	listings.ListingsByID[listing.ID] = listing
	service := NewOrderService(listings, auth)

	order, err := service.CreateOrder(ctx, buyer.ID, CreateOrderInput{
		ListingID: listing.ID, FulfillmentMethod: db.FulfillmentShipping,
	})
	if err != nil {
		t.Fatalf("CreateOrder returned error: %v", err)
	}
	if order.BuyerID != buyer.ID || order.ListingID != listing.ID || order.EscrowState != db.EscrowStateCreated {
		t.Errorf("created order has incorrect relationships or state: %+v", order)
	}
	if order.PlatformFee != 5000 || order.TotalAmount != 205000 {
		t.Errorf("order amounts = fee %.2f total %.2f, want 5000 and 205000", order.PlatformFee, order.TotalAmount)
	}
	if listing.Status != db.ListingLocked {
		t.Errorf("listing status = %q, want locked", listing.Status)
	}

	loaded, err := service.GetOrderByID(ctx, order.ID, buyer.ID)
	if err != nil {
		t.Fatalf("GetOrderByID for buyer returned error: %v", err)
	}
	if loaded.Listing == nil || loaded.Listing.ID != listing.ID {
		t.Errorf("loaded order has no listing: %+v", loaded)
	}
	if _, err := service.GetOrderByID(ctx, order.ID, uuid.New()); err == nil || !strings.Contains(err.Error(), "forbidden") {
		t.Errorf("GetOrderByID unauthorized error = %v, want forbidden", err)
	}
}

func TestCreateOrderRejectsOwnOrUnavailableListing(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	buyer, err := auth.SignUp(ctx, SignUpInput{
		Email: "buyer-order-reject@example.com", Password: "password-123", Name: "Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	listings := NewListingService(auth)
	service := NewOrderService(listings, auth)
	ownListing := &db.Listing{ID: uuid.New(), SellerID: buyer.ID, Status: db.ListingLive, Price: 100}
	listings.ListingsByID[ownListing.ID] = ownListing
	if _, err := service.CreateOrder(ctx, buyer.ID, CreateOrderInput{ListingID: ownListing.ID}); err == nil {
		t.Fatal("CreateOrder allowed seller to purchase their own listing")
	}

	unavailable := &db.Listing{ID: uuid.New(), SellerID: uuid.New(), Status: db.ListingLocked, Price: 100}
	listings.ListingsByID[unavailable.ID] = unavailable
	if _, err := service.CreateOrder(ctx, buyer.ID, CreateOrderInput{ListingID: unavailable.ID}); err == nil {
		t.Fatal("CreateOrder accepted an unavailable listing")
	}
}

func TestConfirmReceiptStartsInspectionThenCompletesOrder(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	listings := NewListingService(auth)
	buyerID := uuid.New()
	listing := &db.Listing{ID: uuid.New(), SellerID: uuid.New(), Status: db.ListingLocked}
	order := &db.Order{
		ID: uuid.New(), ListingID: listing.ID, BuyerID: buyerID,
		EscrowState: db.EscrowStateInTransit,
	}
	listings.ListingsByID[listing.ID] = listing
	service := NewOrderService(listings, auth)
	service.OrdersByID[order.ID] = order

	inspection, err := service.ConfirmReceipt(ctx, order.ID, buyerID)
	if err != nil {
		t.Fatalf("ConfirmReceipt (delivery confirmation) returned error: %v", err)
	}
	if inspection.EscrowState != db.EscrowStateInspectionPeriod || inspection.InspectionExpiresAt == nil {
		t.Errorf("receipt confirmation did not start inspection: %+v", inspection)
	}
	completed, err := service.ConfirmReceipt(ctx, order.ID, buyerID)
	if err != nil {
		t.Fatalf("ConfirmReceipt (final confirmation) returned error: %v", err)
	}
	if completed.EscrowState != db.EscrowStateCompleted || listing.Status != db.ListingSold {
		t.Errorf("final receipt did not complete order/sell listing: order=%+v listing=%+v", completed, listing)
	}
}
