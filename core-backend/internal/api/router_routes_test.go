package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/api/handlers"
	"core-backend/internal/api/middleware"
	"core-backend/internal/db"
	"core-backend/internal/services"
)

func TestRouterDispatchesPublicAndAuthenticatedRoutes(t *testing.T) {
	t.Setenv("ENV", "test")
	t.Setenv("S3_PRIVATE_BUCKET_NAME", "")
	t.Setenv("CORS_ALLOWED_ORIGIN", "")
	t.Setenv("ALLOWED_ORIGINS", "")

	auth := services.NewAuthService()
	buyer, err := auth.SignUp(context.Background(), services.SignUpInput{
		Email: "router-buyer@example.com", Password: "password-123", Name: "Router Buyer",
	})
	if err != nil {
		t.Fatalf("create buyer: %v", err)
	}
	admin, err := auth.SignUp(context.Background(), services.SignUpInput{
		Email: "router-admin@example.com", Password: "password-123", Name: "Router Admin", Role: db.RoleAdmin,
	})
	if err != nil {
		t.Fatalf("create admin: %v", err)
	}
	mediator, err := auth.SignUp(context.Background(), services.SignUpInput{
		Email: "router-mediator@example.com", Password: "password-123", Name: "Router Mediator", Role: db.RoleMediator,
	})
	if err != nil {
		t.Fatalf("create mediator: %v", err)
	}
	tokenMiddleware := middleware.NewAuthMiddleware("router-test-secret")
	buyerToken, err := tokenMiddleware.GenerateToken(buyer, uuid.New(), time.Hour)
	if err != nil {
		t.Fatalf("generate buyer token: %v", err)
	}
	adminToken, err := tokenMiddleware.GenerateToken(admin, uuid.New(), time.Hour)
	if err != nil {
		t.Fatalf("generate admin token: %v", err)
	}
	mediatorToken, err := tokenMiddleware.GenerateToken(mediator, uuid.New(), time.Hour)
	if err != nil {
		t.Fatalf("generate mediator token: %v", err)
	}

	listings := services.NewListingService(auth)
	orders := services.NewOrderService(listings, auth)
	escrow := services.NewEscrowService(orders, auth)
	disputes := services.NewDisputeService(orders, escrow, auth)
	kyc := services.NewKYCService(auth, nil)
	moderation := services.NewModerationService(auth, disputes, orders, kyc)
	payments := services.NewPaymentService("", escrow, orders, auth)
	router := NewRouter(
		handlers.NewAuthHandler(auth, tokenMiddleware),
		handlers.NewUserHandler(services.NewUserService(auth)),
		handlers.NewKYCHandler(kyc),
		handlers.NewListingHandler(listings),
		handlers.NewOrderHandler(orders),
		handlers.NewEscrowHandler(escrow),
		handlers.NewPaymentHandler(payments),
		handlers.NewDisputeHandler(disputes),
		handlers.NewAdminHandler(disputes, moderation, handlers.NewMediaHandler()),
		handlers.NewNotificationHandler(services.NewNotificationService()),
		tokenMiddleware,
		handlers.NewMediaHandler(),
	)
	router.RegisterExtendedHandlers(handlers.NewWaitlistHandler(services.NewWaitlistService()), nil)

	type routeCase struct {
		name   string
		method string
		path   string
		body   string
		token  string
		want   int
	}
	id := uuid.NewString()
	cases := []routeCase{
		{"health root", http.MethodGet, "/", "", "", http.StatusOK},
		{"config", http.MethodGet, "/api/config", "", "", http.StatusOK},
		{"signup", http.MethodPost, "/api/auth/register", "{}", "", http.StatusBadRequest},
		{"login", http.MethodPost, "/api/auth/login", "{}", "", http.StatusUnauthorized},
		{"oauth", http.MethodPost, "/api/auth/oauth/google", "{}", "", http.StatusBadRequest},
		{"verify email", http.MethodPost, "/api/auth/verify-email", "{}", buyerToken, http.StatusBadRequest},
		{"request password reset", http.MethodPost, "/api/auth/request-password-reset", "{}", "", http.StatusBadRequest},
		{"reset password", http.MethodPost, "/api/auth/reset-password", "{}", "", http.StatusBadRequest},
		{"waitlist status", http.MethodGet, "/api/waitlist/status", "", "", http.StatusOK},
		{"support messages", http.MethodGet, "/api/support/messages", "", "", http.StatusOK},
		{"support ticket", http.MethodPost, "/api/support/tickets", `{"sessionId":"router-session","message":"help"}`, "", http.StatusCreated},
		{"verify imei", http.MethodPost, "/api/listings/verify-imei", `{"imei":"358941092837461"}`, "", http.StatusOK},
		{"public bank resolution", http.MethodGet, "/api/payments/paystack/resolve-account?account_number=0123456789", "", "", http.StatusOK},
		{"public profile", http.MethodGet, "/api/users/" + id + "/public-profile", "", "", http.StatusNotFound},
		{"paystack webhook", http.MethodPost, "/api/payments/webhook", "{}", "", http.StatusBadRequest},
		{"public listing search", http.MethodGet, "/api/listings", "", "", http.StatusOK},
		{"public listing detail", http.MethodGet, "/api/listings/" + id, "", "", http.StatusNotFound},
		{"development order chat", http.MethodGet, "/api/orders/" + id + "/messages", "", "", http.StatusOK},
		{"missing auth", http.MethodGet, "/api/auth/me", "", "", http.StatusUnauthorized},

		{"media presign", http.MethodPost, "/api/media/presign", "{", buyerToken, http.StatusBadRequest},
		{"media complete", http.MethodPost, "/api/media/complete", "{", buyerToken, http.StatusBadRequest},
		{"current user", http.MethodGet, "/api/auth/me", "", buyerToken, http.StatusOK},
		{"logout", http.MethodPost, "/api/auth/logout", "", buyerToken, http.StatusOK},
		{"resend verification without SMTP outside development", http.MethodPost, "/api/auth/resend-verification", "", buyerToken, http.StatusBadGateway},
		{"change password", http.MethodPost, "/api/auth/change-password", "{", buyerToken, http.StatusBadRequest},
		{"sessions", http.MethodGet, "/api/auth/sessions", "", buyerToken, http.StatusOK},
		{"update profile", http.MethodPut, "/api/users/me/profile", `{"name":"Changed"}`, buyerToken, http.StatusOK},
		{"update avatar", http.MethodPut, "/api/users/me/avatar", "{}", buyerToken, http.StatusBadRequest},
		{"saved listings", http.MethodGet, "/api/users/me/saved-listings", "", buyerToken, http.StatusOK},
		{"payment methods", http.MethodGet, "/api/users/me/payment-methods", "", buyerToken, http.StatusOK},
		{"single payment method", http.MethodDelete, "/api/users/me/payment-methods/methods/action/not-a-uuid", "", buyerToken, http.StatusBadRequest},
		{"notifications", http.MethodGet, "/api/notifications", "", buyerToken, http.StatusOK},
		{"mark all notifications", http.MethodPut, "/api/notifications/mark-all-read", "", buyerToken, http.StatusOK},
		{"mark notification", http.MethodPut, "/api/notifications/" + id + "/read", "", buyerToken, http.StatusNotFound},
		{"submit kyc", http.MethodPost, "/api/kyc/submit", "{}", buyerToken, http.StatusBadRequest},
		{"kyc status", http.MethodGet, "/api/kyc/status", "", buyerToken, http.StatusOK},
		{"kyc history", http.MethodGet, "/api/kyc/history", "", buyerToken, http.StatusOK},
		{"create report", http.MethodPost, "/api/reports", `{"targetType":"user","targetId":"` + buyer.ID.String() + `","reason":"test"}`, buyerToken, http.StatusCreated},
		{"listing draft", http.MethodGet, "/api/listings/draft", "", buyerToken, http.StatusOK},
		{"upload draft media", http.MethodPost, "/api/listings/draft/media", "{", buyerToken, http.StatusBadRequest},
		{"reorder draft media", http.MethodPut, "/api/listings/draft/media/reorder", "{", buyerToken, http.StatusBadRequest},
		{"delete draft media", http.MethodDelete, "/api/listings/draft/media/" + id, "", buyerToken, http.StatusNotFound},
		{"publish listing", http.MethodPost, "/api/listings/" + id + "/publish", "", buyerToken, http.StatusBadRequest},
		{"save listing", http.MethodPost, "/api/listings/" + id + "/save", "", buyerToken, http.StatusBadRequest},
		{"update listing", http.MethodPut, "/api/listings/" + id, "{}", buyerToken, http.StatusBadRequest},
		{"seller listings", http.MethodGet, "/api/listings/my-listings", "", buyerToken, http.StatusOK},
		{"create order", http.MethodPost, "/api/orders", "{}", buyerToken, http.StatusBadRequest},
		{"list orders", http.MethodGet, "/api/orders", "", buyerToken, http.StatusOK},
		{"order quote", http.MethodGet, "/api/orders/" + id + "/quote", "", buyerToken, http.StatusNotFound},
		{"order tracking", http.MethodGet, "/api/orders/" + id + "/tracking", "", buyerToken, http.StatusNotFound},
		{"order receipt", http.MethodGet, "/api/orders/" + id + "/receipt", "", buyerToken, http.StatusNotFound},
		{"order detail", http.MethodGet, "/api/orders/" + id, "", buyerToken, http.StatusNotFound},
		{"order messages", http.MethodPost, "/api/orders/" + id + "/messages", "{}", buyerToken, http.StatusBadRequest},
		{"confirm receipt", http.MethodPost, "/api/orders/" + id + "/confirm-receipt", "", buyerToken, http.StatusBadRequest},
		{"escrow fund", http.MethodPost, "/api/escrow/fund", "{}", buyerToken, http.StatusBadRequest},
		{"escrow status", http.MethodGet, "/api/escrow/" + id + "/status", "", buyerToken, http.StatusNotFound},
		{"escrow ledger", http.MethodGet, "/api/escrow/" + id + "/ledger", "", buyerToken, http.StatusNotFound},
		{"initialize payment", http.MethodPost, "/api/payments/initialize", "{}", buyerToken, http.StatusBadRequest},
		{"resolve bank", http.MethodGet, "/api/payments/paystack/resolve-account?accountNumber=0123456789", "", buyerToken, http.StatusOK},
		{"earnings", http.MethodGet, "/api/seller/earnings-summary", "", buyerToken, http.StatusOK},
		{"request payout", http.MethodPost, "/api/payouts", "{}", buyerToken, http.StatusBadRequest},
		{"list payouts", http.MethodGet, "/api/payouts", "", buyerToken, http.StatusOK},
		{"open dispute", http.MethodPost, "/api/disputes", "{", buyerToken, http.StatusBadRequest},
		{"dispute timeline", http.MethodGet, "/api/disputes/" + id + "/timeline", "", buyerToken, http.StatusOK},
		{"submit dispute evidence", http.MethodPost, "/api/disputes/" + id + "/evidence", "{", buyerToken, http.StatusBadRequest},
		{"finalize dispute evidence", http.MethodPost, "/api/disputes/" + id + "/submit", "", buyerToken, http.StatusBadRequest},
		{"respond to dispute", http.MethodPost, "/api/disputes/" + id + "/respond", "{", buyerToken, http.StatusBadRequest},
		{"dispute return label", http.MethodGet, "/api/disputes/" + id + "/return-label", "", buyerToken, http.StatusNotFound},
		{"mark return shipped", http.MethodPost, "/api/disputes/" + id + "/return-shipped", "{}", buyerToken, http.StatusBadRequest},
		{"confirm return", http.MethodPost, "/api/disputes/" + id + "/confirm-return", "", buyerToken, http.StatusBadRequest},
		{"dispute subcase", http.MethodPost, "/api/disputes/" + id + "/sub-case", "{}", buyerToken, http.StatusBadRequest},
		{"dispute appeal", http.MethodPost, "/api/disputes/" + id + "/appeal", "{}", buyerToken, http.StatusBadRequest},
		{"admin route forbidden", http.MethodGet, "/api/admin/summary", "", buyerToken, http.StatusForbidden},
		{"admin summary", http.MethodGet, "/api/admin/summary", "", adminToken, http.StatusOK},
		{"mediator disputes", http.MethodGet, "/api/admin/disputes", "", mediatorToken, http.StatusOK},
		{"mediator summary forbidden", http.MethodGet, "/api/admin/summary", "", mediatorToken, http.StatusForbidden},
		{"mediator reports forbidden", http.MethodGet, "/api/admin/reports", "", mediatorToken, http.StatusForbidden},
		{"mediator dispute assignment forbidden", http.MethodPost, "/api/admin/disputes/assign", "{}", mediatorToken, http.StatusForbidden},
		{"mediator kyc forbidden", http.MethodPost, "/api/admin/kyc/" + id + "/review", "{}", mediatorToken, http.StatusForbidden},
		{"mediator invitation forbidden", http.MethodPost, "/api/admin/mediators/invitations", `{"email":"new-mediator@example.com"}`, mediatorToken, http.StatusForbidden},
		{"admin mediator invitation", http.MethodPost, "/api/admin/mediators/invitations", `{"email":"new-mediator@example.com"}`, adminToken, http.StatusCreated},
		{"mediator invitation acceptance invalid token", http.MethodPost, "/api/auth/mediator-invitations/accept", `{"token":"invalid","name":"New Mediator","password":"mediator-password-123"}`, "", http.StatusBadRequest},
		{"admin disputes", http.MethodGet, "/api/admin/disputes", "", adminToken, http.StatusOK},
		{"admin assign", http.MethodPost, "/api/admin/disputes/assign", "", adminToken, http.StatusBadRequest},
		{"admin evidence", http.MethodGet, "/api/admin/disputes/" + id + "/evidence", "", adminToken, http.StatusNotFound},
		{"admin verdict", http.MethodPost, "/api/admin/disputes/" + id + "/verdict", "{}", adminToken, http.StatusBadRequest},
		{"mediator verdict", http.MethodPost, "/api/admin/disputes/" + id + "/verdict", "{}", mediatorToken, http.StatusBadRequest},
		{"admin appeal decision", http.MethodPost, "/api/admin/appeals/" + id + "/decide", "{}", adminToken, http.StatusBadRequest},
		{"mediator appeal decision", http.MethodPost, "/api/admin/appeals/" + id + "/decide", "{}", mediatorToken, http.StatusBadRequest},
		{"admin reports", http.MethodGet, "/api/admin/reports", "", adminToken, http.StatusOK},
		{"admin dismiss report", http.MethodPost, "/api/admin/reports/dismiss", "{}", adminToken, http.StatusBadRequest},
		{"admin suspend user", http.MethodPost, "/api/admin/users/suspend", "{}", adminToken, http.StatusBadRequest},
		{"admin kyc review", http.MethodPost, "/api/admin/kyc/" + id + "/review", "{}", adminToken, http.StatusBadRequest},
		{"admin unknown route", http.MethodGet, "/api/admin/unknown", "", adminToken, http.StatusNotFound},
		{"unknown authenticated route", http.MethodGet, "/api/unknown", "", buyerToken, http.StatusNotFound},
	}

	for _, test := range cases {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(test.method, test.path, strings.NewReader(test.body))
			if test.token != "" {
				request.Header.Set("Authorization", "Bearer "+test.token)
			}
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, request)
			if recorder.Code != test.want {
				t.Fatalf("status = %d, want %d; body: %s", recorder.Code, test.want, recorder.Body.String())
			}
		})
	}

	invitationToken, _, err := auth.CreateMediatorInvitation(context.Background(), admin.ID, "accepted-mediator@example.com")
	if err != nil {
		t.Fatalf("create mediator invitation for acceptance route: %v", err)
	}
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/auth/mediator-invitations/accept",
		strings.NewReader(`{"token":"`+invitationToken+`","name":"Accepted Mediator","password":"mediator-password-123"}`),
	)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("mediator invitation acceptance status = %d, want %d; body: %s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}
	if accepted := auth.UsersByEmail["accepted-mediator@example.com"]; accepted == nil || accepted.Role != db.RoleMediator {
		t.Fatalf("invitation acceptance did not create a mediator account: %+v", accepted)
	}
}
