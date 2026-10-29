package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type OrderHandler struct {
	orderService *services.OrderService
}

func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

func (h *OrderHandler) GetOrderQuote(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "quote" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/orders/:id/quote")
		return
	}

	targetID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid UUID")
		return
	}

	quote, err := h.orderService.GetQuoteForListing(r.Context(), targetID)
	if err != nil {
		if order, oErr := h.orderService.GetOrderByID(r.Context(), targetID, userID); oErr == nil {
			quote, err = h.orderService.GetQuote(r.Context(), order.ItemPrice, order.Currency)
		}
	}

	if err != nil {
		JSONError(w, http.StatusNotFound, "Could not compute escrow quote: "+err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, quote)
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request, buyerID uuid.UUID) {
	var req services.CreateOrderInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.ListingID == uuid.Nil {
		JSONError(w, http.StatusBadRequest, "listingId is required")
		return
	}

	order, err := h.orderService.CreateOrder(r.Context(), buyerID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, order)
}

func (h *OrderHandler) ListOrders(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	q := r.URL.Query()
	role := q.Get("role")
	if role == "" {
		role = "buyer"
	}
	status := q.Get("status")
	page, _ := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))

	orders, total, err := h.orderService.ListOrders(r.Context(), userID, role, status, page, limit)
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
		Items: orders,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func (h *OrderHandler) GetOrderDetail(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		JSONError(w, http.StatusBadRequest, "Order ID is required")
		return
	}

	orderID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid order UUID")
		return
	}

	order, err := h.orderService.GetOrderByID(r.Context(), orderID, userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, order)
}

func (h *OrderHandler) GetOrderTracking(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "tracking" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/orders/:id/tracking")
		return
	}

	orderID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid order UUID")
		return
	}

	tracking, err := h.orderService.GetOrderTracking(r.Context(), orderID, userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, tracking)
}

func (h *OrderHandler) ConfirmReceipt(w http.ResponseWriter, r *http.Request, buyerID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "confirm-receipt" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/orders/:id/confirm-receipt")
		return
	}

	orderID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid order UUID")
		return
	}

	order, err := h.orderService.ConfirmReceipt(r.Context(), orderID, buyerID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, order)
}

func (h *OrderHandler) GetReceipt(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "receipt" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/orders/:id/receipt")
		return
	}

	orderID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid order UUID")
		return
	}

	receipt, err := h.orderService.GetReceipt(r.Context(), orderID, userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, receipt)
}

func (h *OrderHandler) HandleOrderMessages(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "messages" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/orders/:id/messages")
		return
	}

	orderIDKey := parts[2]

	if r.Method == http.MethodGet {
		msgs, err := h.orderService.GetOrderMessages(r.Context(), orderIDKey, userID)
		if err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, msgs)
		return
	}

	if r.Method == http.MethodPost {
		var req services.SendOrderMessageInput
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			JSONError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		msg, err := h.orderService.AddOrderMessage(r.Context(), orderIDKey, userID, req)
		if err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusCreated, msg)
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

