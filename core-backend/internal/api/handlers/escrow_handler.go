package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/db"
	"core-backend/internal/services"
)

type EscrowHandler struct {
	escrowService *services.EscrowService
}

func NewEscrowHandler(escrowService *services.EscrowService) *EscrowHandler {
	return &EscrowHandler{
		escrowService: escrowService,
	}
}

type FundEscrowRequest struct {
	OrderID          uuid.UUID        `json:"orderId"`
	PaymentMethod    db.PaymentMethod `json:"paymentMethod"`
	GatewayReference string           `json:"gatewayReference,omitempty"`
}

func (h *EscrowHandler) FundEscrow(w http.ResponseWriter, r *http.Request, buyerID uuid.UUID) {
	var req FundEscrowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.OrderID == uuid.Nil {
		JSONError(w, http.StatusBadRequest, "orderId is required")
		return
	}

	if req.PaymentMethod == "" {
		req.PaymentMethod = db.PaymentMethodCard
	}

	order, err := h.escrowService.FundEscrow(r.Context(), req.OrderID, buyerID, req.PaymentMethod, req.GatewayReference)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]interface{}{
		"order":       order,
		"escrowState": order.EscrowState,
		"message":     "Funds securely held in escrow. Seller notified to initiate shipment.",
	})
}

func (h *EscrowHandler) GetStatus(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "status" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/escrow/:orderId/status")
		return
	}

	orderID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid order UUID")
		return
	}

	status, err := h.escrowService.GetEscrowStatus(r.Context(), orderID, userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, status)
}

func (h *EscrowHandler) GetLedger(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[3] != "ledger" {
		JSONError(w, http.StatusBadRequest, "Invalid path. Expected /api/escrow/:orderId/ledger")
		return
	}

	orderID, err := uuid.Parse(parts[2])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid order UUID")
		return
	}

	ledgerEntries, err := h.escrowService.GetLedger(r.Context(), orderID, userID)
	if err != nil {
		JSONError(w, http.StatusNotFound, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, ledgerEntries)
}
