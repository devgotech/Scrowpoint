package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/services"
)

type PaymentHandler struct {
	paymentService *services.PaymentService
}

func NewPaymentHandler(paymentService *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
	}
}

func (h *PaymentHandler) InitializePaystack(w http.ResponseWriter, r *http.Request, buyerID uuid.UUID) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		OrderID uuid.UUID `json:"orderId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.OrderID == uuid.Nil {
		JSONError(w, http.StatusBadRequest, "orderId is required")
		return
	}

	res, err := h.paymentService.InitializePaystackTransaction(r.Context(), req.OrderID, buyerID)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, res)
}

func (h *PaymentHandler) PaystackWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}

	sigHeader := r.Header.Get("x-paystack-signature")
	if !h.paymentService.VerifyWebhookSignature(payload, sigHeader) {
		JSONError(w, http.StatusBadRequest, "Invalid webhook HMAC signature")
		return
	}

	if err := h.paymentService.HandlePaystackWebhook(r.Context(), payload); err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusOK, map[string]string{"status": "processed"})
}

func (h *PaymentHandler) HandlePaymentMethods(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	if r.Method == http.MethodGet {
		methods, err := h.paymentService.ListPaymentMethods(r.Context(), userID)
		if err != nil {
			JSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, methods)
		return
	}

	if r.Method == http.MethodPost {
		var in services.AddPaymentMethodInput
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			JSONError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		method, err := h.paymentService.AddPaymentMethod(r.Context(), userID, in)
		if err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusCreated, method)
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func (h *PaymentHandler) HandleSinglePaymentMethod(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 5 {
		JSONError(w, http.StatusBadRequest, "Payment method ID is required")
		return
	}

	methodID, err := uuid.Parse(parts[4])
	if err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid method UUID")
		return
	}

	if r.Method == http.MethodPut && len(parts) == 6 && parts[5] == "default" {
		if err := h.paymentService.SetDefaultPaymentMethod(r.Context(), userID, methodID); err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, map[string]string{"message": "Default payment method updated"})
		return
	}

	if r.Method == http.MethodDelete {
		if err := h.paymentService.DeletePaymentMethod(r.Context(), userID, methodID); err != nil {
			JSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		JSONSuccess(w, http.StatusOK, map[string]string{"message": "Payment method removed"})
		return
	}

	JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func (h *PaymentHandler) GetEarningsSummary(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	summary, err := h.paymentService.GetSellerEarningsSummary(r.Context(), sellerID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, summary)
}

func (h *PaymentHandler) RequestPayout(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	var req services.PayoutRequestInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		JSONError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	payout, err := h.paymentService.RequestPayout(r.Context(), sellerID, req)
	if err != nil {
		JSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	JSONSuccess(w, http.StatusCreated, payout)
}

func (h *PaymentHandler) GetPayouts(w http.ResponseWriter, r *http.Request, sellerID uuid.UUID) {
	payouts, err := h.paymentService.GetPayoutHistory(r.Context(), sellerID)
	if err != nil {
		JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSONSuccess(w, http.StatusOK, payouts)
}
