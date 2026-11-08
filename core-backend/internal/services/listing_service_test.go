package services

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestListingDraftMediaPublishAndSearch(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	seller, err := auth.SignUp(ctx, SignUpInput{
		Email: "seller-listing@example.com", Password: "password-123", Name: "Seller",
	})
	if err != nil {
		t.Fatalf("SignUp returned error: %v", err)
	}
	service := NewListingService(auth)

	draft, err := service.UpdateDraft(ctx, seller.ID, DraftListingInput{
		Category:  " Smartphone ",
		Brand:     " Apple ",
		Model:     " iPhone 15 Pro ",
		Condition: db.ConditionGood,
		Price:     500000,
		Currency:  "NGN",
	})
	if err != nil {
		t.Fatalf("UpdateDraft returned error: %v", err)
	}
	if draft.Category != "smartphone" || draft.Brand != "Apple" || draft.Model != "iPhone 15 Pro" {
		t.Errorf("draft fields were not normalized: %+v", draft)
	}
	if _, err := service.PublishListing(ctx, seller.ID); err == nil {
		t.Fatal("PublishListing accepted a draft without media")
	}
	media, err := service.AddDraftMedia(ctx, seller.ID, MediaUploadInput{
		MediaURL:  "https://cdn.example.test/iphone.webp",
		MediaType: "photo",
	})
	if err != nil {
		t.Fatalf("AddDraftMedia returned error: %v", err)
	}
	listing, err := service.PublishListing(ctx, seller.ID)
	if err != nil {
		t.Fatalf("PublishListing returned error: %v", err)
	}
	if listing.Status != db.ListingLive || len(listing.Media) != 1 || listing.Media[0].ID != media.ID {
		t.Errorf("published listing is incomplete: %+v", listing)
	}
	if listing.SKU == "" {
		t.Error("published listing has no generated SKU")
	}

	results, total, err := service.SearchListings(ctx, ListingFilter{
		Category: "smartphone",
		Search:   "iphone 15",
		MinPrice: 400000,
		MaxPrice: 600000,
	})
	if err != nil {
		t.Fatalf("SearchListings returned error: %v", err)
	}
	if total != 1 || len(results) != 1 || results[0].ID != listing.ID {
		t.Errorf("search returned total=%d results=%+v", total, results)
	}

	if err := service.SaveListing(ctx, uuid.New(), listing.ID); err != nil {
		t.Fatalf("SaveListing returned error: %v", err)
	}
}

func TestListingMediaOwnershipAndListingState(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	service := NewListingService(auth)
	sellerID := uuid.New()
	otherSellerID := uuid.New()
	draft, err := service.GetOrCreateDraft(ctx, sellerID)
	if err != nil {
		t.Fatalf("GetOrCreateDraft returned error: %v", err)
	}
	media, err := service.AddDraftMedia(ctx, sellerID, MediaUploadInput{MediaURL: "https://cdn.example.test/item.webp"})
	if err != nil {
		t.Fatalf("AddDraftMedia returned error: %v", err)
	}
	if err := service.DeleteDraftMedia(ctx, otherSellerID, media.ID); err == nil {
		t.Fatal("another seller deleted draft media")
	}
	if err := service.DeleteDraftMedia(ctx, sellerID, media.ID); err != nil {
		t.Fatalf("DeleteDraftMedia returned error: %v", err)
	}
	if err := service.LockListing(ctx, draft.ID); err == nil {
		t.Fatal("LockListing accepted a draft")
	}

	live := &db.Listing{ID: uuid.New(), SellerID: sellerID, Status: db.ListingLive}
	service.ListingsByID[live.ID] = live
	if err := service.LockListing(ctx, live.ID); err != nil {
		t.Fatalf("LockListing returned error: %v", err)
	}
	if err := service.DelistListing(ctx, sellerID, live.ID); err == nil {
		t.Fatal("DelistListing accepted a listing locked in escrow")
	}
	if err := service.UnlockListing(ctx, live.ID); err != nil {
		t.Fatalf("UnlockListing returned error: %v", err)
	}
	if live.Status != db.ListingLive {
		t.Errorf("unlocked listing status = %q, want live", live.Status)
	}
}
