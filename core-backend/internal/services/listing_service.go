package services

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type ListingFilter struct {
	Category  string
	Condition db.DeviceCondition
	MinPrice  float64
	MaxPrice  float64
	Search    string
	Page      int
	Limit     int
}

type DraftListingInput struct {
	Category          string               `json:"category"`
	Brand             string               `json:"brand"`
	Model             string               `json:"model"`
	Storage           string               `json:"storage,omitempty"`
	Condition         db.DeviceCondition   `json:"condition"`
	Price             float64              `json:"price"`
	Currency          string               `json:"currency,omitempty"`
	EscrowTerms       string               `json:"escrowTerms"`
	Description       string               `json:"description,omitempty"`
	FulfillmentMethod db.FulfillmentMethod `json:"fulfillmentMethod"`
}

type MediaUploadInput struct {
	MediaURL  string `json:"mediaUrl"`
	MediaType string `json:"mediaType"`
	SortOrder int    `json:"sortOrder"`
}

type MediaReorderInput struct {
	MediaOrder []uuid.UUID `json:"mediaOrder"`
}

type ListingService struct {
	Mu             sync.RWMutex
	ListingsByID   map[uuid.UUID]*db.Listing
	DraftsBySeller map[uuid.UUID]*db.Listing
	MediaByListing map[uuid.UUID][]*db.ListingMedia
	SavedListings  map[uuid.UUID]map[uuid.UUID]time.Time
	AuthService    *AuthService
}

func NewListingService(authService *AuthService) *ListingService {
	return &ListingService{
		ListingsByID:   make(map[uuid.UUID]*db.Listing),
		DraftsBySeller: make(map[uuid.UUID]*db.Listing),
		MediaByListing: make(map[uuid.UUID][]*db.ListingMedia),
		SavedListings:  make(map[uuid.UUID]map[uuid.UUID]time.Time),
		AuthService:    authService,
	}
}

func (s *ListingService) GetOrCreateDraft(ctx context.Context, sellerID uuid.UUID) (*db.Listing, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	draft, exists := s.DraftsBySeller[sellerID]
	if exists && draft.Status == db.ListingDraft {
		draft.Media = s.getMediaListLocked(draft.ID)
		return draft, nil
	}

	now := time.Now()
	newDraft := &db.Listing{
		ID:                uuid.New(),
		SellerID:          sellerID,
		Category:          "smartphone",
		Brand:             "",
		Model:             "",
		SKU:               "",
		Condition:         db.ConditionGood,
		Price:             0.00,
		Currency:          "NGN",
		EscrowTerms:       "Standard 48-hour inspection period upon delivery confirmation. 100% refund on verified defects.",
		Description:       "",
		Status:            db.ListingDraft,
		FulfillmentMethod: db.FulfillmentShipping,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	s.DraftsBySeller[sellerID] = newDraft
	s.ListingsByID[newDraft.ID] = newDraft
	newDraft.Media = []db.ListingMedia{}

	return newDraft, nil
}

func (s *ListingService) UpdateDraft(ctx context.Context, sellerID uuid.UUID, in DraftListingInput) (*db.Listing, error) {
	draft, err := s.GetOrCreateDraft(ctx, sellerID)
	if err != nil {
		return nil, err
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	if in.Category != "" {
		draft.Category = strings.ToLower(strings.TrimSpace(in.Category))
	}
	if in.Brand != "" {
		draft.Brand = strings.TrimSpace(in.Brand)
	}
	if in.Model != "" {
		draft.Model = strings.TrimSpace(in.Model)
	}
	if in.Condition != "" {
		draft.Condition = in.Condition
	}
	if in.Price >= 0 {
		draft.Price = in.Price
	}
	if in.Currency != "" {
		draft.Currency = in.Currency
	}
	if in.EscrowTerms != "" {
		draft.EscrowTerms = in.EscrowTerms
	}
	if in.Description != "" {
		draft.Description = in.Description
	}
	if in.FulfillmentMethod != "" {
		draft.FulfillmentMethod = in.FulfillmentMethod
	}

	storage := in.Storage
	if storage == "" {
		storage = "STD"
	}
	draft.SKU = db.GenerateSKU(draft.Category, draft.Brand, draft.Model, storage, draft.Condition)
	draft.UpdatedAt = time.Now()
	draft.Media = s.getMediaListLocked(draft.ID)

	return draft, nil
}

func (s *ListingService) AddDraftMedia(ctx context.Context, sellerID uuid.UUID, in MediaUploadInput) (*db.ListingMedia, error) {
	draft, err := s.GetOrCreateDraft(ctx, sellerID)
	if err != nil {
		return nil, err
	}

	if in.MediaURL == "" {
		return nil, errors.New("mediaUrl is required")
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	mediaType := in.MediaType
	if mediaType == "" {
		mediaType = "photo"
	}

	currentMedia := s.MediaByListing[draft.ID]
	sortOrder := in.SortOrder
	if sortOrder == 0 {
		sortOrder = len(currentMedia) + 1
	}

	now := time.Now()
	media := &db.ListingMedia{
		ID:        uuid.New(),
		ListingID: draft.ID,
		MediaURL:  in.MediaURL,
		MediaType: mediaType,
		SortOrder: sortOrder,
		CreatedAt: now,
		UpdatedAt: now,
	}

	s.MediaByListing[draft.ID] = append(s.MediaByListing[draft.ID], media)
	return media, nil
}

func (s *ListingService) DeleteDraftMedia(ctx context.Context, sellerID uuid.UUID, mediaID uuid.UUID) error {
	draft, err := s.GetOrCreateDraft(ctx, sellerID)
	if err != nil {
		return err
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	list := s.MediaByListing[draft.ID]
	var updated []*db.ListingMedia
	found := false

	for _, m := range list {
		if m.ID == mediaID {
			found = true
			continue
		}
		updated = append(updated, m)
	}

	if !found {
		return errors.New("media item not found in draft")
	}

	s.MediaByListing[draft.ID] = updated
	return nil
}

func (s *ListingService) ReorderDraftMedia(ctx context.Context, sellerID uuid.UUID, in MediaReorderInput) error {
	draft, err := s.GetOrCreateDraft(ctx, sellerID)
	if err != nil {
		return err
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	list := s.MediaByListing[draft.ID]
	mediaMap := make(map[uuid.UUID]*db.ListingMedia)
	for _, m := range list {
		mediaMap[m.ID] = m
	}

	var reordered []*db.ListingMedia
	for idx, id := range in.MediaOrder {
		if m, exists := mediaMap[id]; exists {
			m.SortOrder = idx + 1
			m.UpdatedAt = time.Now()
			reordered = append(reordered, m)
		}
	}

	s.MediaByListing[draft.ID] = reordered
	return nil
}

func (s *ListingService) PublishListing(ctx context.Context, sellerID uuid.UUID) (*db.Listing, error) {
	draft, err := s.GetOrCreateDraft(ctx, sellerID)
	if err != nil {
		return nil, err
	}

	s.Mu.Lock()
	defer s.Mu.Unlock()

	media := s.getMediaListLocked(draft.ID)
	if len(media) < 1 {
		return nil, errors.New("a live gadget listing requires at least 1 verified photo")
	}

	if draft.Brand == "" || draft.Model == "" {
		return nil, errors.New("brand and model are required to publish")
	}

	if draft.Price <= 0 {
		return nil, errors.New("price must be greater than zero")
	}

	seller, err := s.AuthService.GetUserByID(ctx, sellerID)
	if err != nil {
		return nil, err
	}
	if seller.KYCStatus == db.KYCRejected {
		return nil, errors.New("cannot publish listing: seller identity verification rejected")
	}

	if draft.SKU == "" || strings.HasPrefix(draft.SKU, "--") {
		draft.SKU = db.GenerateSKU(draft.Category, draft.Brand, draft.Model, "STD", draft.Condition)
	}

	now := time.Now()
	draft.Status = db.ListingLive
	draft.UpdatedAt = now
	draft.Seller = seller
	draft.Media = media

	delete(s.DraftsBySeller, sellerID)
	return draft, nil
}

func (s *ListingService) GetListingByID(ctx context.Context, id uuid.UUID) (*db.Listing, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	listing, exists := s.ListingsByID[id]
	if !exists || listing.DeletedAt != nil {
		return nil, errors.New("listing not found")
	}

	listingCopy := *listing
	listingCopy.Media = s.getMediaListLocked(listing.ID)

	if seller, err := s.AuthService.GetUserByID(ctx, listing.SellerID); err == nil {
		listingCopy.Seller = seller
	}

	return &listingCopy, nil
}

func (s *ListingService) SearchListings(ctx context.Context, filter ListingFilter) ([]db.Listing, int, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	var results []db.Listing

	for _, l := range s.ListingsByID {
		if l.Status != db.ListingLive || l.DeletedAt != nil {
			continue
		}

		if filter.Category != "" && !strings.EqualFold(l.Category, filter.Category) {
			continue
		}

		if filter.Condition != "" && l.Condition != filter.Condition {
			continue
		}

		if filter.MinPrice > 0 && l.Price < filter.MinPrice {
			continue
		}

		if filter.MaxPrice > 0 && l.Price > filter.MaxPrice {
			continue
		}

		if filter.Search != "" {
			term := strings.ToLower(filter.Search)
			brandMatch := strings.Contains(strings.ToLower(l.Brand), term)
			modelMatch := strings.Contains(strings.ToLower(l.Model), term)
			skuMatch := strings.Contains(strings.ToLower(l.SKU), term)
			if !brandMatch && !modelMatch && !skuMatch {
				continue
			}
		}

		itemCopy := *l
		itemCopy.Media = s.getMediaListLocked(l.ID)
		if seller, err := s.AuthService.GetUserByID(ctx, l.SellerID); err == nil {
			itemCopy.Seller = seller
		}
		results = append(results, itemCopy)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].CreatedAt.After(results[j].CreatedAt)
	})

	total := len(results)
	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 || limit > 100 {
		limit = 20
	}

	start := (page - 1) * limit
	if start > total {
		return []db.Listing{}, total, nil
	}

	end := start + limit
	if end > total {
		end = total
	}

	return results[start:end], total, nil
}

func (s *ListingService) GetSellerListings(ctx context.Context, sellerID uuid.UUID) ([]db.Listing, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	var sellerListings []db.Listing
	for _, l := range s.ListingsByID {
		if l.SellerID == sellerID && l.DeletedAt == nil {
			itemCopy := *l
			itemCopy.Media = s.getMediaListLocked(l.ID)
			sellerListings = append(sellerListings, itemCopy)
		}
	}

	sort.Slice(sellerListings, func(i, j int) bool {
		return sellerListings[i].CreatedAt.After(sellerListings[j].CreatedAt)
	})

	return sellerListings, nil
}

func (s *ListingService) UpdateListing(ctx context.Context, sellerID, listingID uuid.UUID, in DraftListingInput) (*db.Listing, error) {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	listing, exists := s.ListingsByID[listingID]
	if !exists || listing.DeletedAt != nil {
		return nil, errors.New("listing not found")
	}

	if listing.SellerID != sellerID {
		return nil, errors.New("forbidden: you do not own this listing")
	}

	if listing.Status == db.ListingLocked || listing.Status == db.ListingSold {
		return nil, fmt.Errorf("cannot modify listing in %s status", listing.Status)
	}

	if in.Price > 0 {
		listing.Price = in.Price
	}
	if in.EscrowTerms != "" {
		listing.EscrowTerms = in.EscrowTerms
	}
	if in.Description != "" {
		listing.Description = in.Description
	}
	listing.UpdatedAt = time.Now()

	listingCopy := *listing
	listingCopy.Media = s.getMediaListLocked(listing.ID)
	return &listingCopy, nil
}

func (s *ListingService) DelistListing(ctx context.Context, sellerID, listingID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	listing, exists := s.ListingsByID[listingID]
	if !exists || listing.DeletedAt != nil {
		return errors.New("listing not found")
	}

	if listing.SellerID != sellerID {
		return errors.New("forbidden: you do not own this listing")
	}

	if listing.Status == db.ListingLocked {
		return errors.New("cannot delist an item currently locked in escrow")
	}

	listing.Status = db.ListingRemoved
	listing.UpdatedAt = time.Now()
	return nil
}

func (s *ListingService) LockListing(ctx context.Context, listingID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	listing, exists := s.ListingsByID[listingID]
	if !exists {
		return errors.New("listing not found")
	}
	if listing.Status != db.ListingLive {
		return fmt.Errorf("listing is not available for purchase (status: %s)", listing.Status)
	}

	listing.Status = db.ListingLocked
	listing.UpdatedAt = time.Now()
	return nil
}

func (s *ListingService) UnlockListing(ctx context.Context, listingID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	listing, exists := s.ListingsByID[listingID]
	if !exists {
		return errors.New("listing not found")
	}

	if listing.Status == db.ListingLocked {
		listing.Status = db.ListingLive
		listing.UpdatedAt = time.Now()
	}
	return nil
}

func (s *ListingService) SaveListing(ctx context.Context, userID, listingID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	if _, exists := s.ListingsByID[listingID]; !exists {
		return errors.New("listing not found")
	}

	if _, ok := s.SavedListings[userID]; !ok {
		s.SavedListings[userID] = make(map[uuid.UUID]time.Time)
	}

	s.SavedListings[userID][listingID] = time.Now()
	return nil
}

func (s *ListingService) UnsaveListing(ctx context.Context, userID, listingID uuid.UUID) error {
	s.Mu.Lock()
	defer s.Mu.Unlock()

	if userSaved, ok := s.SavedListings[userID]; ok {
		delete(userSaved, listingID)
	}
	return nil
}

func (s *ListingService) GetSavedListings(ctx context.Context, userID uuid.UUID) ([]db.Listing, error) {
	s.Mu.RLock()
	defer s.Mu.RUnlock()

	savedMap := s.SavedListings[userID]
	var items []db.Listing

	for lid := range savedMap {
		if l, exists := s.ListingsByID[lid]; exists && l.DeletedAt == nil {
			itemCopy := *l
			itemCopy.Media = s.getMediaListLocked(l.ID)
			items = append(items, itemCopy)
		}
	}

	return items, nil
}

func (s *ListingService) getMediaListLocked(listingID uuid.UUID) []db.ListingMedia {
	raw := s.MediaByListing[listingID]
	var out []db.ListingMedia
	for _, m := range raw {
		if m.DeletedAt == nil {
			out = append(out, *m)
		}
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].SortOrder < out[j].SortOrder
	})
	return out
}
