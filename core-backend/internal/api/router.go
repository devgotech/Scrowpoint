package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"core-backend/internal/api/handlers"
	"core-backend/internal/api/middleware"
	"core-backend/internal/db"
	"core-backend/internal/services"
)

type Router struct {
	authHandler         *handlers.AuthHandler
	userHandler         *handlers.UserHandler
	kycHandler          *handlers.KYCHandler
	listingHandler      *handlers.ListingHandler
	orderHandler        *handlers.OrderHandler
	escrowHandler       *handlers.EscrowHandler
	paymentHandler      *handlers.PaymentHandler
	disputeHandler      *handlers.DisputeHandler
	adminHandler        *handlers.AdminHandler
	notificationHandler *handlers.NotificationHandler
	waitlistHandler     *handlers.WaitlistHandler
	supportHandler      *handlers.SupportHandler
	jwtMw               *middleware.AuthMiddleware
}

func NewRouter(
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	kycHandler *handlers.KYCHandler,
	listingHandler *handlers.ListingHandler,
	orderHandler *handlers.OrderHandler,
	escrowHandler *handlers.EscrowHandler,
	paymentHandler *handlers.PaymentHandler,
	disputeHandler *handlers.DisputeHandler,
	adminHandler *handlers.AdminHandler,
	notificationHandler *handlers.NotificationHandler,
	jwtMw *middleware.AuthMiddleware,
) *Router {
	return &Router{
		authHandler:         authHandler,
		userHandler:         userHandler,
		kycHandler:          kycHandler,
		listingHandler:      listingHandler,
		orderHandler:        orderHandler,
		escrowHandler:       escrowHandler,
		paymentHandler:      paymentHandler,
		disputeHandler:      disputeHandler,
		adminHandler:        adminHandler,
		notificationHandler: notificationHandler,
		waitlistHandler:     handlers.NewWaitlistHandler(services.NewWaitlistService()),
		supportHandler:      handlers.NewSupportHandler(services.NewSupportService()),
		jwtMw:               jwtMw,
	}
}

func (rt *Router) RegisterExtendedHandlers(
	waitlistHandler *handlers.WaitlistHandler,
	supportHandler *handlers.SupportHandler,
) {
	if waitlistHandler != nil {
		rt.waitlistHandler = waitlistHandler
	}
	if supportHandler != nil {
		rt.supportHandler = supportHandler
	}
}

func (rt *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-paystack-signature")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Health Probes & Root
	if path == "/health" || path == "/api/health" || path == "/" {
		handlers.JSONSuccess(w, http.StatusOK, map[string]interface{}{
			"status":  "healthy",
			"service": "buyers-high-core-backend",
			"version": "1.0.0",
		})
		return
	}

	// Configuration
	if path == "/api/config" && r.Method == http.MethodGet {
		handlers.JSONSuccess(w, http.StatusOK, map[string]interface{}{
			"categories":     []string{"smartphone", "laptop", "tablet", "other"},
			"conditions":     []string{"mint", "good", "fair", "salvage"},
			"platformFeePct": 2.5,
			"feeTiers": map[string]interface{}{
				"tier1": map[string]interface{}{"threshold": 150000, "rate": 5.0},
				"tier2": map[string]interface{}{"threshold": 750000, "rate": 2.5},
				"tier3": map[string]interface{}{"threshold": "above", "rate": 1.5},
			},
		})
		return
	}

	// Public Routes
	if path == "/api/auth/signup" || path == "/api/auth/register" {
		rt.authHandler.SignUp(w, r)
		return
	}
	if path == "/api/auth/login" {
		rt.authHandler.Login(w, r)
		return
	}
	if strings.HasPrefix(path, "/api/auth/oauth/") {
		rt.authHandler.OAuth(w, r)
		return
	}
	if path == "/api/auth/verify-email" {
		rt.authHandler.VerifyEmail(w, r)
		return
	}
	if path == "/api/auth/request-password-reset" {
		rt.authHandler.RequestPasswordReset(w, r)
		return
	}
	if path == "/api/auth/reset-password" {
		rt.authHandler.ResetPassword(w, r)
		return
	}

	// Founding Cohort 01 Waitlist & Referral Queue
	if path == "/api/waitlist" {
		rt.waitlistHandler.HandleWaitlist(w, r)
		return
	}
	if path == "/api/waitlist/status" {
		rt.waitlistHandler.GetWaitlistStatus(w, r)
		return
	}

	// Customer Support Live Chat Tickets & Messages
	if path == "/api/support/messages" {
		rt.supportHandler.HandleSupportMessages(w, r)
		return
	}
	if path == "/api/support/tickets" {
		rt.supportHandler.CreateSupportTicket(w, r)
		return
	}

	// Automated IMEI / Serial Number Blacklist & Duplicate Lookup
	if path == "/api/listings/verify-imei" {
		rt.listingHandler.VerifyIMEI(w, r)
		return
	}

	// Nigerian Bank Account Name Enquiry / NUBAN Resolution (supports public or authenticated calls)
	if path == "/api/payments/paystack/resolve-account" && r.Header.Get("Authorization") == "" {
		rt.paymentHandler.ResolveBankAccount(w, r, uuid.Nil)
		return
	}

	if strings.HasPrefix(path, "/api/users/") && strings.HasSuffix(path, "/public-profile") {
		rt.userHandler.GetPublicProfile(w, r)
		return
	}
	if path == "/api/payments/paystack/webhook" || path == "/api/payments/webhook" {
		rt.paymentHandler.PaystackWebhook(w, r)
		return
	}
	if path == "/api/listings" && r.Method == http.MethodGet && r.URL.Query().Get("role") != "seller" {
		rt.listingHandler.HandleListings(w, r, [16]byte{})
		return
	}

	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) == 3 && parts[0] == "api" && parts[1] == "listings" && r.Method == http.MethodGet {
		if _, err := uuid.Parse(parts[2]); err == nil {
			rt.listingHandler.HandleSingleListing(w, r, [16]byte{})
			return
		}
	}

	// Allow Escrow Room P2P Trade Chat when accessed without Bearer token in preview/demo mode
	if len(parts) == 4 && parts[0] == "api" && parts[1] == "orders" && parts[3] == "messages" && r.Header.Get("Authorization") == "" {
		rt.orderHandler.HandleOrderMessages(w, r, uuid.Nil)
		return
	}

	if path == "/api/media/presign" && r.Method == http.MethodPost {
		var req struct {
			FileName    string `json:"fileName"`
			FileType    string `json:"fileType"`
			ReferenceID string `json:"referenceId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			handlers.JSONError(w, http.StatusBadRequest, "Invalid request payload")
			return
		}
		if req.FileName == "" {
			req.FileName = "upload_" + uuid.NewString()[:8]
		}
		cleanName := strings.ReplaceAll(req.FileName, " ", "_")
		s3Key := fmt.Sprintf("evidence/%s/%s", req.ReferenceID, cleanName)
		if req.ReferenceID == "" {
			s3Key = fmt.Sprintf("uploads/%s", cleanName)
		}

		// Provide S3 upload URL or direct media URL for local / test environments
		uploadURL := fmt.Sprintf("http://localhost:8000/media/%s", s3Key)
		fileURL := uploadURL

		handlers.JSONSuccess(w, http.StatusOK, map[string]interface{}{
			"uploadUrl":   uploadURL,
			"fileUrl":     fileURL,
			"key":         s3Key,
			"s3Key":       s3Key,
			"referenceId": req.ReferenceID,
		})
		return
	}

	// Authenticated Routes
	rt.jwtMw.Authenticate(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, err := middleware.GetUserClaims(r.Context())
		if err != nil {
			handlers.JSONError(w, http.StatusUnauthorized, "Unauthorized")
			return
		}

		userID := claims.UserID

		switch {
		case path == "/api/auth/me" || path == "/api/users/me":
			rt.authHandler.GetCurrentUser(w, r, userID)
		case path == "/api/auth/logout":
			rt.authHandler.Logout(w, r, claims.SessionID)
		case path == "/api/auth/resend-verification":
			rt.authHandler.ResendVerification(w, r, userID)
		case path == "/api/auth/change-password":
			rt.authHandler.ChangePassword(w, r, userID)
		case path == "/api/auth/sessions":
			rt.authHandler.ListSessions(w, r, userID)

		case path == "/api/users/me/profile":
			rt.userHandler.UpdateProfile(w, r, userID)
		case path == "/api/users/me/avatar":
			rt.userHandler.UpdateAvatar(w, r, userID)
		case path == "/api/users/me/saved-listings":
			rt.listingHandler.GetSavedListings(w, r, userID)

		case path == "/api/users/me/payment-methods":
			rt.paymentHandler.HandlePaymentMethods(w, r, userID)
		case len(parts) >= 5 && parts[1] == "users" && parts[2] == "me" && parts[3] == "payment-methods":
			rt.paymentHandler.HandleSinglePaymentMethod(w, r, userID)

		case path == "/api/notifications" && r.Method == http.MethodGet:
			rt.notificationHandler.ListNotifications(w, r, userID)
		case path == "/api/notifications/mark-all-read" && r.Method == http.MethodPut:
			rt.notificationHandler.MarkAllAsRead(w, r, userID)
		case len(parts) == 4 && parts[1] == "notifications" && parts[3] == "read" && r.Method == http.MethodPut:
			rt.notificationHandler.MarkAsRead(w, r, userID)

		case path == "/api/kyc/submit" || path == "/api/kyc/verify":
			rt.kycHandler.SubmitKYC(w, r, userID)
		case path == "/api/kyc/status":
			rt.kycHandler.GetStatus(w, r, userID)
		case path == "/api/kyc/history":
			rt.kycHandler.GetHistory(w, r, userID)

		case path == "/api/reports" && r.Method == http.MethodPost:
			rt.adminHandler.CreateReport(w, r, userID)

		case path == "/api/listings/draft":
			rt.listingHandler.HandleDraft(w, r, userID)
		case path == "/api/listings/draft/media":
			rt.listingHandler.UploadDraftMedia(w, r, userID)
		case strings.HasPrefix(path, "/api/listings/draft/media/reorder"):
			rt.listingHandler.ReorderDraftMedia(w, r, userID)
		case strings.HasPrefix(path, "/api/listings/draft/media/"):
			rt.listingHandler.DeleteDraftMedia(w, r, userID)
		case path == "/api/listings" && r.Method == http.MethodPost:
			rt.listingHandler.HandleListings(w, r, userID)
		case path == "/api/listings/my-listings" || (path == "/api/listings" && r.Method == http.MethodGet && r.URL.Query().Get("role") == "seller"):
			rt.listingHandler.HandleListings(w, r, userID)
		case len(parts) == 4 && parts[1] == "listings" && (parts[3] == "publish" || parts[3] == "save"):
			if parts[3] == "publish" {
				rt.listingHandler.HandleListings(w, r, userID)
			} else {
				rt.listingHandler.HandleSaveListing(w, r, userID)
			}
		case len(parts) == 3 && parts[1] == "listings" && (r.Method == http.MethodPut || r.Method == http.MethodDelete):
			rt.listingHandler.HandleSingleListing(w, r, userID)

		case len(parts) == 4 && parts[1] == "orders" && parts[3] == "quote":
			rt.orderHandler.GetOrderQuote(w, r, userID)
		case len(parts) == 4 && parts[1] == "orders" && parts[3] == "tracking":
			rt.orderHandler.GetOrderTracking(w, r, userID)
		case len(parts) == 4 && parts[1] == "orders" && (parts[3] == "confirm-receipt" || parts[3] == "deliver" || parts[3] == "release"):
			rt.orderHandler.ConfirmReceipt(w, r, userID)
		case len(parts) == 4 && parts[1] == "orders" && parts[3] == "dispatch":
			rt.orderHandler.GetOrderDetail(w, r, userID)
		case len(parts) == 4 && parts[1] == "orders" && parts[3] == "receipt":
			rt.orderHandler.GetReceipt(w, r, userID)
		case len(parts) == 4 && parts[1] == "orders" && parts[3] == "messages":
			rt.orderHandler.HandleOrderMessages(w, r, userID)
		case path == "/api/orders" && r.Method == http.MethodPost:
			rt.orderHandler.CreateOrder(w, r, userID)
		case path == "/api/orders" && r.Method == http.MethodGet:
			rt.orderHandler.ListOrders(w, r, userID)
		case len(parts) == 3 && parts[1] == "orders" && r.Method == http.MethodGet:
			rt.orderHandler.GetOrderDetail(w, r, userID)

		case path == "/api/escrow/fund":
			rt.escrowHandler.FundEscrow(w, r, userID)
		case (len(parts) == 4 && parts[1] == "escrow" && parts[3] == "status") || (len(parts) == 4 && parts[1] == "escrow" && parts[2] == "orders"):
			rt.escrowHandler.GetStatus(w, r, userID)
		case len(parts) == 4 && parts[1] == "escrow" && parts[3] == "ledger":
			rt.escrowHandler.GetLedger(w, r, userID)

		case path == "/api/payments/paystack/initialize" || path == "/api/payments/initialize":
			rt.paymentHandler.InitializePaystack(w, r, userID)
		case path == "/api/payments/paystack/resolve-account":
			rt.paymentHandler.ResolveBankAccount(w, r, userID)
		case path == "/api/seller/earnings-summary":
			rt.paymentHandler.GetEarningsSummary(w, r, userID)
		case path == "/api/payouts" && r.Method == http.MethodPost:
			rt.paymentHandler.RequestPayout(w, r, userID)
		case path == "/api/payouts" && r.Method == http.MethodGet:
			rt.paymentHandler.GetPayouts(w, r, userID)

		case path == "/api/disputes" && r.Method == http.MethodPost:
			rt.disputeHandler.OpenDispute(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "timeline":
			rt.disputeHandler.GetTimeline(w, r)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "evidence":
			rt.disputeHandler.SubmitEvidence(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "submit":
			rt.disputeHandler.FinalizeEvidence(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "respond":
			rt.disputeHandler.Respond(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "return-label":
			rt.disputeHandler.GetReturnLabel(w, r)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "return-shipped":
			rt.disputeHandler.MarkReturnShipped(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "confirm-return":
			rt.disputeHandler.ConfirmReturn(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && (parts[3] == "sub-case" || parts[3] == "subcases"):
			rt.disputeHandler.OpenSubCase(w, r, userID)
		case len(parts) == 4 && parts[1] == "disputes" && parts[3] == "appeal":
			rt.disputeHandler.SubmitAppeal(w, r, userID)
		case len(parts) == 3 && parts[1] == "disputes" && r.Method == http.MethodGet:
			rt.disputeHandler.GetDispute(w, r)

		case strings.HasPrefix(path, "/api/admin/"):
			middleware.RequireRole(db.RoleAdmin)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				switch {
				case path == "/api/admin/summary":
					rt.adminHandler.GetSummary(w, r)
				case path == "/api/admin/disputes" && r.Method == http.MethodGet:
					rt.adminHandler.ListDisputes(w, r)
				case len(parts) == 4 && parts[1] == "admin" && parts[2] == "disputes" && parts[3] == "assign":
					rt.adminHandler.AssignDispute(w, r, userID)
				case len(parts) == 4 && parts[1] == "admin" && parts[2] == "disputes" && parts[3] == "evidence":
					rt.adminHandler.GetDisputeEvidence(w, r)
				case len(parts) == 4 && parts[1] == "admin" && parts[2] == "disputes" && parts[3] == "verdict":
					rt.adminHandler.IssueVerdict(w, r, userID)
				case len(parts) == 4 && parts[1] == "admin" && parts[2] == "appeals" && parts[3] == "decide":
					rt.adminHandler.DecideAppeal(w, r, userID)
				case path == "/api/admin/reports" && r.Method == http.MethodGet:
					rt.adminHandler.ListReports(w, r)
				case len(parts) == 4 && parts[1] == "admin" && parts[2] == "reports" && parts[3] == "dismiss":
					rt.adminHandler.DismissReport(w, r, userID)
				case len(parts) == 4 && parts[1] == "admin" && parts[2] == "users" && parts[3] == "suspend":
					rt.adminHandler.SuspendUser(w, r, userID)
				case strings.HasPrefix(path, "/api/admin/kyc/") && strings.HasSuffix(path, "/review"):
					rt.kycHandler.AdminReview(w, r)
				default:
					handlers.JSONError(w, http.StatusNotFound, "Admin endpoint not found")
				}
			})).ServeHTTP(w, r)

		default:
			handlers.JSONError(w, http.StatusNotFound, "Endpoint not found")
		}
	})).ServeHTTP(w, r)
}
