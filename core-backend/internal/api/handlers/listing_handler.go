package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/db"
	"core-backend/internal/services"
)

type ListingHandler struct {
	listingService *services.ListingService
}

func NewListingHandler(listingService *services.ListingService) *ListingHandler {
	return &ListingHandler{
		listingService: listingService,
	}
}

func (h *ListingHandler) HandleListings(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	if r.Method == http.MethodGet {
		roleParam := r.URL.Query().Get("role")
		if roleParam == "seller" || strings.HasSuffix(r.URL.Path, "/my-listings") {
			h.getSellerListings(w, r, userID)
			return
		}
		h.searchListings(w, r)
		return
	}

	if r.Method == http.MethodPost {
		h.publishListing(w, r, userID)
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func (h *ListingHandler) searchListings(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	minPrice, _ := strconv.ParseFloat(q.Get("minPrice"), 64)
	maxPrice, _ := strconv.ParseFloat(q.Get("maxPrice"), 64)
	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))

	filter := services.ListingFilter{
		Category:  q.Get("category"),
		Condition: db.DeviceCondition(q.Get("condition")),
		MinPrice:  minPrice,
		MaxPrice:  maxPrice,
		Search:    q.Get("search"),
		Page:      page,
		Limit:     limit,
	}

	items, total, err := h.listingService.SearchListings(r.Context(), filter)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	JSONSuccess(w, http.StatusOK, PaginatedData{
		Items: items,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func (h *ListingHandler) getSellerListings(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	listings, err := h.listingService.GetSellerListings(r.Context(), sellerID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, listings)
}

func (h *ListingHandler) publishListing(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	liveListing, err := h.listingService.PublishListing(r.Context(), sellerID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}
	JSONSuccess(w, http.StatusCreated, liveListing)
}

func (h *ListingHandler) HandleDraft(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	if r.Method == http.MethodGet {
		draft, err := h.listingService.GetOrCreateDraft(r.Context(), sellerID)
		if err != nil {
			JSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, draft)
		return
	}

	if r.Method == http.MethodPost {
		var in services.DraftListingInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			JSONError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		updatedDraft, err := h.listingService.UpdateDraft(r.Context(), sellerID, in)
		if err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, updatedDraft)
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func (h *ListingHandler) UploadDraftMedia(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	var in services.MediaUploadInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	media, err := h.listingService.AddDraftMedia(r.Context(), sellerID, in)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, media)
}

func (h *ListingHandler) DeleteDraftMedia(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		JSONError(w, http.StatusBadRequest, "Media ID is required")
		return
	}

	mediaID, err := uuid.Parse(parts[4])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid media UUID")
		return
	}

	if err := h.listingService.DeleteDraftMedia(r.Context(), sellerID, mediaID); err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Media deleted successfully"})
}

func (h *ListingHandler) ReorderDraftMedia(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	var in services.MediaReorderInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.listingService.ReorderDraftMedia(r.Context(), sellerID, in); err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"message": "Media reordered successfully"})
}

func (h *ListingHandler) HandleSingleListing(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		JSONError(w, http.StatusBadRequest, "Listing ID is required")
		return
	}

	listingID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid listing UUID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		listing, err := h.listingService.GetListingByID(r.Context(), listingID)
		if err != nil {
			JSONError(w, http.StatusNotFound, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, listing)

	case http.MethodPut:
		var in services.DraftListingInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			JSONError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		updated, err := h.listingService.UpdateListing(r.Context(), userID, listingID, in)
		if err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, updated)

	case http.MethodDelete:
		if err := h.listingService.DelistListing(r.Context(), userID, listingID); err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, map[string]string{"message": "Listing delisted successfully"})

	default:
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (h *ListingHandler) HandleSaveListing(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	listingID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid listing UUID")
		return
	}

	if r.Method == http.MethodPost {
		if err := h.listingService.SaveListing(r.Context(), userID, listingID); err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, map[string]string{"message": "Listing saved to favorites"})
		return
	}

	if r.Method == http.MethodDelete {
		if err := h.listingService.UnsaveListing(r.Context(), userID, listingID); err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, map[string]string{"message": "Listing removed from favorites"})
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func (h *ListingHandler) GetSavedListings(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	saved, err := h.listingService.GetSavedListings(r.Context(), userID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, saved)
}
