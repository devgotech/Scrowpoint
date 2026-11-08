package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
	"core-backend/internal/services"
)

type handlerTokenGenerator struct {
	err error
}

func (g handlerTokenGenerator) GenerateToken(*db.User, uuid.UUID, time.Duration) (string, error) {
	if g.err != nil {
		return "", g.err
	}
	return "test-token", nil
}

func performHandlerRequest(handler func(http.ResponseWriter, *http.Request), method, path, body string) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	handler(recorder, request)
	return recorder
}

func assertHandlerStatus(t *testing.T, recorder *httptest.ResponseRecorder, want int) {
	t.Helper()
	if recorder.Code != want {
		t.Fatalf("status = %d, want %d; body: %s", recorder.Code, want, recorder.Body.String())
	}
}

func TestAuthHandlerSignUpLoginAndEmailVerification(t *testing.T) {
	auth := services.NewAuthService()
	handler := NewAuthHandler(auth, handlerTokenGenerator{})

	assertHandlerStatus(t, performHandlerRequest(handler.SignUp, http.MethodGet, "/api/auth/signup", ""), http.StatusMethodNotAllowed)
	assertHandlerStatus(t, performHandlerRequest(handler.SignUp, http.MethodPost, "/api/auth/signup", "{"), http.StatusBadRequest)
	assertHandlerStatus(t, performHandlerRequest(handler.SignUp, http.MethodPost, "/api/auth/signup",
		`{"email":"no-terms@example.com","password":"password-123","name":"No Terms"}`), http.StatusBadRequest)

	signup := performHandlerRequest(handler.SignUp, http.MethodPost, "/api/auth/signup",
		`{"email":"handler@example.com","password":"password-123","name":"Handler User","role":"admin","termsAccepted":true}`)
	assertHandlerStatus(t, signup, http.StatusCreated)
	var signupResponse struct {
		Data AuthResponseData `json:"data"`
	}
	if err := json.Unmarshal(signup.Body.Bytes(), &signupResponse); err != nil {
		t.Fatalf("decode signup response: %v", err)
	}
	if signupResponse.Data.Token != "test-token" || signupResponse.Data.User.Role != db.RoleBuyer {
		t.Fatalf("signup response did not issue token or restrict public role: %+v", signupResponse.Data)
	}
	if signupResponse.Data.User.TermsAcceptedAt == nil || signupResponse.Data.User.TermsVersion != TermsOfServiceVersion {
		t.Fatal("signup did not persist the accepted terms version and timestamp")
	}
	mediatorSignup := performHandlerRequest(handler.SignUp, http.MethodPost, "/api/auth/signup",
		`{"email":"public-mediator@example.com","password":"password-123","name":"Public Mediator","role":"mediator","termsAccepted":true}`)
	assertHandlerStatus(t, mediatorSignup, http.StatusCreated)
	var mediatorSignupResponse struct {
		Data AuthResponseData `json:"data"`
	}
	if err := json.Unmarshal(mediatorSignup.Body.Bytes(), &mediatorSignupResponse); err != nil {
		t.Fatalf("decode public mediator signup response: %v", err)
	}
	if mediatorSignupResponse.Data.User.Role != db.RoleBuyer {
		t.Fatalf("public signup provisioned mediator role: %q", mediatorSignupResponse.Data.User.Role)
	}

	assertHandlerStatus(t, performHandlerRequest(handler.Login, http.MethodPost, "/api/auth/login",
		`{"email":"handler@example.com","password":"wrong-password"}`), http.StatusUnauthorized)
	assertHandlerStatus(t, performHandlerRequest(handler.Login, http.MethodPost, "/api/auth/login",
		`{"email":"handler@example.com","password":"password-123"}`), http.StatusOK)

	user := signupResponse.Data.User
	token, err := auth.RequestEmailVerification(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("RequestEmailVerification: %v", err)
	}
	verifyEmail := func(w http.ResponseWriter, r *http.Request) {
		handler.VerifyEmail(w, r, user.ID)
	}
	assertHandlerStatus(t, performHandlerRequest(verifyEmail, http.MethodPost, "/api/auth/verify-email",
		`{"token":"`+token+`"}`), http.StatusOK)
	assertHandlerStatus(t, performHandlerRequest(verifyEmail, http.MethodPost, "/api/auth/verify-email", `{}`), http.StatusBadRequest)

	recorder := httptest.NewRecorder()
	handler.GetCurrentUser(recorder, httptest.NewRequest(http.MethodGet, "/api/auth/me", nil), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetCurrentUser(recorder, httptest.NewRequest(http.MethodGet, "/api/auth/me", nil), uuid.New())
	assertHandlerStatus(t, recorder, http.StatusNotFound)
}

func TestAuthOAuthHandlerAndAdditionalValidation(t *testing.T) {
	auth := services.NewAuthService()
	handler := NewAuthHandler(auth, handlerTokenGenerator{})
	assertHandlerStatus(t, performHandlerRequest(handler.OAuth, http.MethodGet, "/api/auth/oauth/google", ""), http.StatusMethodNotAllowed)
	assertHandlerStatus(t, performHandlerRequest(handler.OAuth, http.MethodPost, "/api/auth/oauth/google", "{"), http.StatusBadRequest)
	assertHandlerStatus(t, performHandlerRequest(handler.OAuth, http.MethodPost, "/api/auth/oauth/google",
		`{"email":"oauth-handler@example.com","name":"OAuth Handler","providerUid":"provider-1"}`), http.StatusBadRequest)
	oauthResponse := performHandlerRequest(handler.OAuth, http.MethodPost, "/api/auth/oauth/google",
		`{"email":"oauth-handler@example.com","name":"OAuth Handler","providerUid":"provider-1","termsAccepted":true}`)
	assertHandlerStatus(t, oauthResponse, http.StatusOK)
	var authResponse struct {
		Data AuthResponseData `json:"data"`
	}
	if err := json.Unmarshal(oauthResponse.Body.Bytes(), &authResponse); err != nil {
		t.Fatalf("decode OAuth response: %v", err)
	}
	assertHandlerStatus(t, performHandlerRequest(handler.Login, http.MethodPost, "/api/auth/login", "{"), http.StatusBadRequest)
	assertHandlerStatus(t, performHandlerRequest(handler.ResetPassword, http.MethodPost, "/api/auth/password/reset/confirm", "{"), http.StatusBadRequest)
	assertHandlerStatus(t, performHandlerRequest(handler.ResetPassword, http.MethodPost, "/api/auth/password/reset/confirm",
		`{"token":"missing","newPassword":"new-password"}`), http.StatusBadRequest)
	verifyEmail := func(w http.ResponseWriter, r *http.Request) {
		handler.VerifyEmail(w, r, uuid.New())
	}
	assertHandlerStatus(t, performHandlerRequest(verifyEmail, http.MethodGet, "/api/auth/verify-email", ""), http.StatusMethodNotAllowed)
	assertHandlerStatus(t, performHandlerRequest(verifyEmail, http.MethodPost, "/api/auth/verify-email", "{"), http.StatusBadRequest)

	recorder := httptest.NewRecorder()
	handler.ResendVerification(recorder, httptest.NewRequest(http.MethodPost, "/api/auth/verify-email/resend", nil), authResponse.Data.User.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.ChangePassword(recorder, httptest.NewRequest(http.MethodPost, "/api/auth/password/change", strings.NewReader("{")), uuid.New())
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.RevokeSession(recorder, httptest.NewRequest(http.MethodDelete, "/api/auth/sessions/invalid", nil), uuid.New(), uuid.New())
	assertHandlerStatus(t, recorder, http.StatusNotFound)
}

func TestAuthHandlerTokenFailureAndPasswordRoutes(t *testing.T) {
	auth := services.NewAuthService()
	handler := NewAuthHandler(auth, handlerTokenGenerator{err: errors.New("token unavailable")})
	assertHandlerStatus(t, performHandlerRequest(handler.SignUp, http.MethodPost, "/api/auth/signup",
		`{"email":"token@example.com","password":"password-123","name":"Token User","termsAccepted":true}`), http.StatusInternalServerError)
	assertHandlerStatus(t, performHandlerRequest(handler.Login, http.MethodPost, "/api/auth/login",
		`{"email":"token@example.com","password":"password-123"}`), http.StatusInternalServerError)

	user, err := auth.SignUp(context.Background(), services.SignUpInput{
		Email: "password-routes@example.com", Password: "password-123", Name: "Password Routes",
	})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	handler = NewAuthHandler(auth, handlerTokenGenerator{})
	assertHandlerStatus(t, performHandlerRequest(handler.RequestPasswordReset, http.MethodGet, "/api/auth/password/reset", ""), http.StatusMethodNotAllowed)
	assertHandlerStatus(t, performHandlerRequest(handler.RequestPasswordReset, http.MethodPost, "/api/auth/password/reset", `{}`), http.StatusBadRequest)
	assertHandlerStatus(t, performHandlerRequest(handler.RequestPasswordReset, http.MethodPost, "/api/auth/password/reset",
		`{"email":"password-routes@example.com"}`), http.StatusOK)

	token, err := auth.RequestPasswordReset(context.Background(), user.Email)
	if err != nil {
		t.Fatalf("RequestPasswordReset: %v", err)
	}
	assertHandlerStatus(t, performHandlerRequest(handler.ResetPassword, http.MethodPost, "/api/auth/password/reset/confirm",
		`{"token":"`+token+`","newPassword":"new-password-123"}`), http.StatusOK)
	assertHandlerStatus(t, performHandlerRequest(handler.ResetPassword, http.MethodPost, "/api/auth/password/reset/confirm",
		`{"token":"invalid-token","newPassword":"new-password-123"}`), http.StatusBadRequest)
	assertHandlerStatus(t, performHandlerRequest(func(w http.ResponseWriter, r *http.Request) {
		handler.ChangePassword(w, r, user.ID)
	}, http.MethodPost, "/api/auth/password/change",
		`{"oldPassword":"new-password-123","newPassword":"changed-password-123"}`), http.StatusOK)
	assertHandlerStatus(t, performHandlerRequest(func(w http.ResponseWriter, r *http.Request) {
		handler.ChangePassword(w, r, user.ID)
	}, http.MethodPost, "/api/auth/password/change",
		`{"oldPassword":"wrong-password","newPassword":"another-password-123"}`), http.StatusBadRequest)

	recorder := httptest.NewRecorder()
	handler.ListSessions(recorder, httptest.NewRequest(http.MethodGet, "/api/auth/sessions", nil), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.ResendVerification(recorder, httptest.NewRequest(http.MethodPost, "/api/auth/verify-email/resend", nil), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)

	_, session, err := auth.Login(context.Background(), user.Email, "changed-password-123", "", "")
	if err != nil {
		t.Fatalf("Login after password change: %v", err)
	}
	recorder = httptest.NewRecorder()
	handler.RevokeSession(recorder, httptest.NewRequest(http.MethodDelete, "/api/auth/sessions/"+session.ID.String(), nil), user.ID, session.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.Logout(recorder, httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil), session.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
}

func TestWaitlistHandlerJoinAndStatus(t *testing.T) {
	service := services.NewWaitlistService()
	handler := NewWaitlistHandler(service)

	assertHandlerStatus(t, performHandlerRequest(handler.HandleWaitlist, http.MethodGet, "/api/waitlist?email=chidi@scrowpoint.com", ""), http.StatusOK)
	assertHandlerStatus(t, performHandlerRequest(handler.HandleWaitlist, http.MethodPut, "/api/waitlist", ""), http.StatusMethodNotAllowed)
	assertHandlerStatus(t, performHandlerRequest(handler.HandleWaitlist, http.MethodPost, "/api/waitlist", "{"), http.StatusBadRequest)

	joined := performHandlerRequest(handler.HandleWaitlist, http.MethodPost, "/api/waitlist",
		`{"fullName":"New User","email":"new-user@example.com"}`)
	assertHandlerStatus(t, joined, http.StatusCreated)
	assertHandlerStatus(t, performHandlerRequest(handler.GetWaitlistStatus, http.MethodGet,
		"/api/waitlist/status?email=new-user@example.com", ""), http.StatusOK)
	assertHandlerStatus(t, performHandlerRequest(handler.GetWaitlistStatus, http.MethodPost, "/api/waitlist/status", ""), http.StatusMethodNotAllowed)
}

func TestNotificationHandlerRoutes(t *testing.T) {
	service := services.NewNotificationService()
	handler := NewNotificationHandler(service)
	userID := uuid.New()
	note, err := service.SendNotification(context.Background(), userID, db.NotificationChannelInApp,
		"test", "Test notification", "Message", nil)
	if err != nil {
		t.Fatalf("SendNotification: %v", err)
	}

	recorder := httptest.NewRecorder()
	handler.ListNotifications(recorder, httptest.NewRequest(http.MethodGet, "/api/notifications?recent=true", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.MarkAsRead(recorder, httptest.NewRequest(http.MethodPost, "/api/notifications/"+note.ID.String()+"/read", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.MarkAsRead(recorder, httptest.NewRequest(http.MethodPost, "/api/notifications/not-a-uuid/read", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.MarkAsRead(recorder, httptest.NewRequest(http.MethodPost, "/api/notifications/"+uuid.NewString()+"/read", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusNotFound)
	recorder = httptest.NewRecorder()
	handler.MarkAsRead(recorder, httptest.NewRequest(http.MethodPost, "/api/notifications/"+note.ID.String()+"/invalid", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.MarkAllAsRead(recorder, httptest.NewRequest(http.MethodPost, "/api/notifications/read-all", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.ListNotifications(recorder, httptest.NewRequest(http.MethodGet, "/api/notifications", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
}

func TestListingHandlerDraftSearchAndPublish(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	seller, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "listing-handler@example.com", Password: "password-123", Name: "Listing Seller",
	})
	if err != nil {
		t.Fatalf("SignUp seller: %v", err)
	}
	handler := NewListingHandler(services.NewListingService(auth))

	recorder := httptest.NewRecorder()
	handler.HandleDraft(recorder, httptest.NewRequest(http.MethodGet, "/api/listings/draft", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleDraft(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/draft",
		strings.NewReader(`{"category":"phone","brand":"Apple","model":"iPhone","condition":"good","price":100000,"currency":"NGN"}`)), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleDraft(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/draft", strings.NewReader("{")), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.HandleDraft(recorder, httptest.NewRequest(http.MethodPut, "/api/listings/draft", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)

	recorder = httptest.NewRecorder()
	handler.UploadDraftMedia(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/draft/media",
		strings.NewReader(`{"mediaUrl":"https://cdn.example.test/phone.webp","mediaType":"photo"}`)), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.UploadDraftMedia(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/draft/media", strings.NewReader("{")), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)

	recorder = httptest.NewRecorder()
	handler.HandleListings(recorder, httptest.NewRequest(http.MethodGet, "/api/listings?category=phone&page=1&limit=5", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleListings(recorder, httptest.NewRequest(http.MethodGet, "/api/listings?role=seller", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleListings(recorder, httptest.NewRequest(http.MethodGet, "/api/listings?role=seller", nil), uuid.New())
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleListings(recorder, httptest.NewRequest(http.MethodPost, "/api/listings", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)

	recorder = httptest.NewRecorder()
	handler.HandleListings(recorder, httptest.NewRequest(http.MethodDelete, "/api/listings", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
}

func TestListingHandlerSingleSaveAndMediaManagement(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	seller, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "listing-single-handler@example.com", Password: "password-123", Name: "Listing Seller",
	})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	service := services.NewListingService(auth)
	listing := &db.Listing{
		ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive,
		Brand: "Apple", Model: "iPhone", Price: 100000, Currency: "NGN",
	}
	service.ListingsByID[listing.ID] = listing
	handler := NewListingHandler(service)

	recorder := httptest.NewRecorder()
	handler.HandleSingleListing(recorder, httptest.NewRequest(http.MethodGet,
		"/api/listings/"+listing.ID.String(), nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleSingleListing(recorder, httptest.NewRequest(http.MethodPut,
		"/api/listings/"+listing.ID.String(), strings.NewReader(`{"price":120000}`)), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleSingleListing(recorder, httptest.NewRequest(http.MethodPatch,
		"/api/listings/"+listing.ID.String(), nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	handler.HandleSingleListing(recorder, httptest.NewRequest(http.MethodGet,
		"/api/listings/"+uuid.NewString(), nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusNotFound)
	recorder = httptest.NewRecorder()
	handler.HandleSaveListing(recorder, httptest.NewRequest(http.MethodPost,
		"/api/listings/"+listing.ID.String()+"/save", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetSavedListings(recorder, httptest.NewRequest(http.MethodGet, "/api/listings/saved", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleSaveListing(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/listings/"+listing.ID.String()+"/save", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleSaveListing(recorder, httptest.NewRequest(http.MethodPut,
		"/api/listings/"+listing.ID.String()+"/save", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	handler.DeleteDraftMedia(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/listings/draft/media/"+uuid.NewString(), nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusNotFound)
	recorder = httptest.NewRecorder()
	handler.DeleteDraftMedia(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/listings/draft/media/not-a-uuid", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.HandleSingleListing(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/listings/"+listing.ID.String(), nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)

	if _, err := service.GetOrCreateDraft(ctx, seller.ID); err != nil {
		t.Fatalf("GetOrCreateDraft: %v", err)
	}
	media, err := service.AddDraftMedia(ctx, seller.ID, services.MediaUploadInput{MediaURL: "https://cdn.example.test/photo.png"})
	if err != nil {
		t.Fatalf("AddDraftMedia: %v", err)
	}
	recorder = httptest.NewRecorder()
	handler.ReorderDraftMedia(recorder, httptest.NewRequest(http.MethodPut, "/api/listings/draft/media/order",
		strings.NewReader(`{"mediaOrder":["`+media.ID.String()+`"]}`)), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.DeleteDraftMedia(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/listings/draft/media/"+media.ID.String(), nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
}

func TestOrderHandlerCreateReadAndChat(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	buyer, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "handler-buyer@example.com", Password: "password-123", Name: "Handler Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp buyer: %v", err)
	}
	seller, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "handler-seller@example.com", Password: "password-123", Name: "Handler Seller",
	})
	if err != nil {
		t.Fatalf("SignUp seller: %v", err)
	}
	listings := services.NewListingService(auth)
	listing := &db.Listing{
		ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive,
		Price: 100000, Currency: "NGN", Brand: "Apple", Model: "iPhone",
	}
	listings.ListingsByID[listing.ID] = listing
	handler := NewOrderHandler(services.NewOrderService(listings, auth))

	recorder := httptest.NewRecorder()
	handler.GetOrderQuote(recorder, httptest.NewRequest(http.MethodGet,
		"/api/orders/"+listing.ID.String()+"/quote", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetOrderQuote(recorder, httptest.NewRequest(http.MethodGet,
		"/api/orders/"+uuid.NewString()+"/quote", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusNotFound)

	recorder = httptest.NewRecorder()
	handler.CreateOrder(recorder, httptest.NewRequest(http.MethodPost, "/api/orders",
		strings.NewReader(`{"listingId":"`+listing.ID.String()+`","fulfillmentMethod":"shipping"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	var created struct {
		Data db.Order `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode order response: %v", err)
	}
	orderID := created.Data.ID

	recorder = httptest.NewRecorder()
	handler.ListOrders(recorder, httptest.NewRequest(http.MethodGet, "/api/orders?page=1&limit=10", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetOrderDetail(recorder, httptest.NewRequest(http.MethodGet, "/api/orders/"+orderID.String(), nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetOrderTracking(recorder, httptest.NewRequest(http.MethodGet,
		"/api/orders/"+orderID.String()+"/tracking", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleOrderMessages(recorder, httptest.NewRequest(http.MethodGet,
		"/api/orders/"+orderID.String()+"/messages", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleOrderMessages(recorder, httptest.NewRequest(http.MethodPost,
		"/api/orders/"+orderID.String()+"/messages", strings.NewReader(`{"text":"Thanks"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.HandleOrderMessages(recorder, httptest.NewRequest(http.MethodPut,
		"/api/orders/"+orderID.String()+"/messages", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
}

func TestOrderReceiptAndEscrowHandlerFlow(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	buyer, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "escrow-handler-buyer@example.com", Password: "password-123", Name: "Escrow Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp buyer: %v", err)
	}
	seller, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "escrow-handler-seller@example.com", Password: "password-123", Name: "Escrow Seller",
	})
	if err != nil {
		t.Fatalf("SignUp seller: %v", err)
	}
	listings := services.NewListingService(auth)
	listing := &db.Listing{ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive, Price: 200000, Currency: "NGN"}
	listings.ListingsByID[listing.ID] = listing
	orders := services.NewOrderService(listings, auth)
	order, err := orders.CreateOrder(ctx, buyer.ID, services.CreateOrderInput{ListingID: listing.ID})
	if err != nil {
		t.Fatalf("CreateOrder: %v", err)
	}
	orderHandler := NewOrderHandler(orders)
	order.EscrowState = db.EscrowStateInTransit
	recorder := httptest.NewRecorder()
	orderHandler.ConfirmReceipt(recorder, httptest.NewRequest(http.MethodPost,
		"/api/orders/"+order.ID.String()+"/confirm-receipt", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	orderHandler.ConfirmReceipt(recorder, httptest.NewRequest(http.MethodPost,
		"/api/orders/"+order.ID.String()+"/confirm-receipt", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	orderHandler.GetReceipt(recorder, httptest.NewRequest(http.MethodGet,
		"/api/orders/"+order.ID.String()+"/receipt", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)

	// Exercise funding on a separate order in its initial state.
	listing2 := &db.Listing{ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive, Price: 50000, Currency: "NGN"}
	listings.ListingsByID[listing2.ID] = listing2
	order2, err := orders.CreateOrder(ctx, buyer.ID, services.CreateOrderInput{ListingID: listing2.ID})
	if err != nil {
		t.Fatalf("CreateOrder second: %v", err)
	}
	escrowService := services.NewEscrowService(orders, auth)
	escrowHandler := NewEscrowHandler(escrowService)
	recorder = httptest.NewRecorder()
	escrowHandler.FundEscrow(recorder, httptest.NewRequest(http.MethodPost, "/api/escrow/fund",
		strings.NewReader(`{"orderId":"`+order2.ID.String()+`"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	escrowHandler.GetStatus(recorder, httptest.NewRequest(http.MethodGet,
		"/api/escrow/"+order2.ID.String()+"/status", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	escrowHandler.GetLedger(recorder, httptest.NewRequest(http.MethodGet,
		"/api/escrow/"+order2.ID.String()+"/ledger", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
}

func TestDisputeAndAdminHandlerWorkflow(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	buyer, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "dispute-handler-buyer@example.com", Password: "password-123", Name: "Dispute Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp buyer: %v", err)
	}
	seller, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "dispute-handler-seller@example.com", Password: "password-123", Name: "Dispute Seller",
	})
	if err != nil {
		t.Fatalf("SignUp seller: %v", err)
	}
	admin, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "dispute-handler-admin@example.com", Password: "password-123", Name: "Dispute Admin", Role: db.RoleAdmin,
	})
	if err != nil {
		t.Fatalf("SignUp admin: %v", err)
	}
	listings := services.NewListingService(auth)
	listing := &db.Listing{
		ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive,
		Brand: "Samsung", Model: "Galaxy", Price: 100000, Currency: "NGN",
	}
	listings.ListingsByID[listing.ID] = listing
	orders := services.NewOrderService(listings, auth)
	order, err := orders.CreateOrder(ctx, buyer.ID, services.CreateOrderInput{ListingID: listing.ID})
	if err != nil {
		t.Fatalf("CreateOrder: %v", err)
	}
	orders.OrdersByID[order.ID].EscrowState = db.EscrowStateInTransit
	escrow := services.NewEscrowService(orders, auth)
	if _, err := escrow.AppendLedgerEntry(ctx, order.ID, db.EscrowTxDeposit,
		order.TotalAmount, order.Currency, nil, nil, "handler-deposit", "test funding"); err != nil {
		t.Fatalf("AppendLedgerEntry: %v", err)
	}
	disputeService := services.NewDisputeService(orders, escrow, auth)
	handler := NewDisputeHandler(disputeService)

	recorder := httptest.NewRecorder()
	handler.OpenDispute(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes",
		strings.NewReader(`{"orderId":"`+order.ID.String()+`","reason":"damaged item","claimSummary":"Screen cracked"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	var disputeResponse struct {
		Data db.Dispute `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &disputeResponse); err != nil {
		t.Fatalf("decode dispute response: %v", err)
	}
	disputeID := disputeResponse.Data.ID

	recorder = httptest.NewRecorder()
	handler.GetDispute(recorder, httptest.NewRequest(http.MethodGet, "/api/disputes/"+disputeID.String(), nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetDispute(recorder, httptest.NewRequest(http.MethodGet, "/api/disputes/"+uuid.NewString(), nil))
	assertHandlerStatus(t, recorder, http.StatusNotFound)
	recorder = httptest.NewRecorder()
	handler.GetTimeline(recorder, httptest.NewRequest(http.MethodGet, "/api/disputes/"+disputeID.String()+"/timeline", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.SubmitEvidence(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/evidence", strings.NewReader("{")), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.SubmitEvidence(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/"+disputeID.String()+"/evidence",
		strings.NewReader(`{"evidenceType":"video","mediaUrl":"private-evidence.mp4","description":"Unboxing"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.FinalizeEvidence(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/finalize", nil), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.Respond(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/"+disputeID.String()+"/respond",
		strings.NewReader(`{"decision":"accept_fault","notes":"Accepted"}`)), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.Respond(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/respond", strings.NewReader("{")), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.GetReturnLabel(recorder, httptest.NewRequest(http.MethodGet,
		"/api/disputes/"+disputeID.String()+"/return-label", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetReturnLabel(recorder, httptest.NewRequest(http.MethodGet,
		"/api/disputes/"+uuid.NewString()+"/return-label", nil))
	assertHandlerStatus(t, recorder, http.StatusNotFound)
	recorder = httptest.NewRecorder()
	handler.MarkReturnShipped(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/ship", strings.NewReader(`{"trackingNumber":"RETURN-123"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.ConfirmReturn(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/confirm-return", nil), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)

	recorder = httptest.NewRecorder()
	handler.OpenSubCase(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/sub-case",
		strings.NewReader(`{"reason":"missing accessory","claimSummary":"Charger"}`)), seller.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.SubmitAppeal(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/appeal", strings.NewReader(`{"reason":"new evidence"}`)), buyer.ID)
	// ConfirmReturn resolves the dispute, so an appeal is allowed.
	assertHandlerStatus(t, recorder, http.StatusCreated)
	var appealResponse struct {
		Data db.Appeal `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &appealResponse); err != nil {
		t.Fatalf("decode appeal response: %v", err)
	}
	recorder = httptest.NewRecorder()
	handler.SubmitAppeal(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+disputeID.String()+"/appeal", strings.NewReader("{")), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)

	adminHandler := NewAdminHandler(disputeService, nil, &MediaHandler{})
	recorder = httptest.NewRecorder()
	adminHandler.ListDisputes(recorder, httptest.NewRequest(http.MethodGet, "/api/admin/disputes?page=1&limit=10", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.ListDisputes(recorder, httptest.NewRequest(http.MethodGet, "/api/admin/disputes", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.AssignDispute(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/disputes/"+disputeID.String()+"/assign", nil), admin.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.GetDisputeEvidence(recorder, httptest.NewRequest(http.MethodGet,
		"/api/admin/disputes/"+disputeID.String()+"/evidence", nil))
	assertHandlerStatus(t, recorder, http.StatusServiceUnavailable)
	recorder = httptest.NewRecorder()
	adminHandler.IssueVerdict(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/disputes/"+disputeID.String()+"/verdict",
		strings.NewReader(`{"outcome":"split","notes":"Split verdict"}`)), admin.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.DecideAppeal(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/appeals/"+appealResponse.Data.ID.String()+"/decision",
		strings.NewReader(`{"uphold":true,"notes":"Confirmed"}`)), admin.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
}

func TestUserHandlerProfileAndAvatar(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	user, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "profile-handler@example.com", Password: "password-123", Name: "Profile User",
	})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	handler := NewUserHandler(services.NewUserService(auth))

	recorder := httptest.NewRecorder()
	handler.UpdateProfile(recorder, httptest.NewRequest(http.MethodPut, "/api/users/me",
		strings.NewReader(`{"name":"Updated Name","location":"Lagos"}`)), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.UpdateAvatar(recorder, httptest.NewRequest(http.MethodPut, "/api/users/me/avatar",
		strings.NewReader(`{"avatarUrl":"https://cdn.example.test/avatar.png"}`)), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetPublicProfile(recorder, httptest.NewRequest(http.MethodGet,
		"/api/users/"+user.ID.String()+"/public-profile", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetPublicProfile(recorder, httptest.NewRequest(http.MethodGet,
		"/api/users/not-a-uuid/public-profile", nil))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.GetPublicProfile(recorder, httptest.NewRequest(http.MethodGet,
		"/api/users/"+uuid.NewString()+"/public-profile", nil))
	assertHandlerStatus(t, recorder, http.StatusNotFound)
	recorder = httptest.NewRecorder()
	handler.UpdateAvatar(recorder, httptest.NewRequest(http.MethodPut, "/api/users/me/avatar", strings.NewReader("{}")), user.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.UpdateProfile(recorder, httptest.NewRequest(http.MethodPut, "/api/users/me", strings.NewReader("{")), user.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
}

func TestSupportHandlerMessagesAndTickets(t *testing.T) {
	handler := NewSupportHandler(services.NewSupportService())

	recorder := httptest.NewRecorder()
	handler.HandleSupportMessages(recorder, httptest.NewRequest(http.MethodGet,
		"/api/support/messages?sessionId=handler-session", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.HandleSupportMessages(recorder, httptest.NewRequest(http.MethodPost, "/api/support/messages",
		strings.NewReader(`{"sessionId":"handler-session","text":"I need help"}`)))
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.HandleSupportMessages(recorder, httptest.NewRequest(http.MethodDelete, "/api/support/messages", nil))
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	handler.HandleSupportMessages(recorder, httptest.NewRequest(http.MethodPost, "/api/support/messages", strings.NewReader("{")))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.CreateSupportTicket(recorder, httptest.NewRequest(http.MethodPost, "/api/support/tickets",
		strings.NewReader(`{"sessionId":"handler-ticket","category":"order","message":"Order help"}`)))
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.CreateSupportTicket(recorder, httptest.NewRequest(http.MethodGet, "/api/support/tickets", nil))
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	handler.CreateSupportTicket(recorder, httptest.NewRequest(http.MethodPost, "/api/support/tickets", strings.NewReader("{")))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
}

func TestKYCHandlerSubmissionAndReview(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	user, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "kyc-handler@example.com", Password: "password-123", Name: "KYC User",
	})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	kyc := services.NewKYCService(auth, nil)
	handler := NewKYCHandler(kyc)

	recorder := httptest.NewRecorder()
	handler.SubmitKYC(recorder, httptest.NewRequest(http.MethodPost, "/api/kyc",
		strings.NewReader(`{}`)), user.ID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.SubmitKYC(recorder, httptest.NewRequest(http.MethodPost, "/api/kyc",
		strings.NewReader(`{"idType":"passport","idNumber":"123","documentUrl":"https://cdn.example.test/id.png"}`)), user.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	recorder = httptest.NewRecorder()
	handler.GetStatus(recorder, httptest.NewRequest(http.MethodGet, "/api/kyc/status", nil), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetHistory(recorder, httptest.NewRequest(http.MethodGet, "/api/kyc/history", nil), user.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.GetStatus(recorder, httptest.NewRequest(http.MethodGet, "/api/kyc/status", nil), uuid.New())
	assertHandlerStatus(t, recorder, http.StatusInternalServerError)

	verificationID := kyc.Verifications[user.ID][0].ID
	recorder = httptest.NewRecorder()
	handler.AdminReview(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/kyc/"+verificationID.String()+"/review", strings.NewReader(`{"approve":true}`)))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	handler.AdminReview(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/kyc/not-a-uuid/review", strings.NewReader(`{"approve":false}`)))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	handler.AdminReview(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/kyc/"+verificationID.String()+"/review", strings.NewReader("{")))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
}

func TestHandlerValidationResponses(t *testing.T) {
	listings := NewListingHandler(services.NewListingService(services.NewAuthService()))
	userID := uuid.New()
	recorder := httptest.NewRecorder()
	listings.DeleteDraftMedia(recorder, httptest.NewRequest(http.MethodDelete, "/api/listings/draft/media", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	listings.ReorderDraftMedia(recorder, httptest.NewRequest(http.MethodPut, "/api/listings/draft/media/order",
		strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	listings.HandleSingleListing(recorder, httptest.NewRequest(http.MethodGet, "/api/listings/not-a-uuid", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	listings.HandleSaveListing(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/not-a-uuid/save", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	listings.VerifyIMEI(recorder, httptest.NewRequest(http.MethodGet, "/api/listings/verify-imei", nil))
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	listings.VerifyIMEI(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/verify-imei",
		strings.NewReader(`{"imei":"358941092837461"}`)))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	listings.VerifyIMEI(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/verify-imei", strings.NewReader("{")))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	listings.VerifyIMEI(recorder, httptest.NewRequest(http.MethodPost, "/api/listings/verify-imei", strings.NewReader("{}")))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)

	media := &MediaHandler{privateBucket: "private-media", videoLimitMB: 100}
	recorder = httptest.NewRecorder()
	media.PresignUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/presign", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	media.PresignUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/presign",
		strings.NewReader(`{"fileType":"image/png","fileSize":100}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	media.PresignUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/presign",
		strings.NewReader(`{"fileType":"video/mp4","fileSize":200000000}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusRequestEntityTooLarge)
	recorder = httptest.NewRecorder()
	media.CompleteUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/complete",
		strings.NewReader(`{"fileType":"video/mp4","key":"dispute_evidence/not-owned/video.mp4"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusForbidden)
	recorder = httptest.NewRecorder()
	media.CompleteUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/complete",
		strings.NewReader(`{"fileType":"video/mp4","key":"dispute_evidence/`+userID.String()+`/evidence.png"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	if _, err := media.PrivateEvidenceDownloadURL(httptest.NewRequest(http.MethodGet, "/", nil), "invalid"); err == nil {
		t.Fatal("PrivateEvidenceDownloadURL accepted an invalid private key")
	}

	payments := NewPaymentHandler(services.NewPaymentService("", nil, nil, nil))
	recorder = httptest.NewRecorder()
	payments.InitializePaystack(recorder, httptest.NewRequest(http.MethodGet, "/api/payments/initialize", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	payments.InitializePaystack(recorder, httptest.NewRequest(http.MethodPost, "/api/payments/initialize", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	payments.PaystackWebhook(recorder, httptest.NewRequest(http.MethodGet, "/api/payments/webhook", nil))
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	payments.PaystackWebhook(recorder, httptest.NewRequest(http.MethodPost, "/api/payments/webhook", strings.NewReader("{}")))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	payments.HandlePaymentMethods(recorder, httptest.NewRequest(http.MethodDelete, "/api/payment-methods", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)
	recorder = httptest.NewRecorder()
	payments.HandlePaymentMethods(recorder, httptest.NewRequest(http.MethodPost, "/api/payment-methods", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	payments.HandleSinglePaymentMethod(recorder, httptest.NewRequest(http.MethodDelete, "/api/payment-methods", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	payments.HandleSinglePaymentMethod(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/payment-methods/methods/action/not-a-uuid", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	payments.RequestPayout(recorder, httptest.NewRequest(http.MethodPost, "/api/payouts", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	payments.ResolveBankAccount(recorder, httptest.NewRequest(http.MethodPut, "/api/banks/resolve", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusMethodNotAllowed)

	escrow := NewEscrowHandler(nil)
	recorder = httptest.NewRecorder()
	escrow.FundEscrow(recorder, httptest.NewRequest(http.MethodPost, "/api/escrow/fund", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	escrow.GetStatus(recorder, httptest.NewRequest(http.MethodGet, "/api/escrow/not-a-uuid/status", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	escrow.GetLedger(recorder, httptest.NewRequest(http.MethodGet, "/api/escrow/not-a-uuid/ledger", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	escrow.GetStatus(recorder, httptest.NewRequest(http.MethodGet,
		"/api/escrow/"+uuid.NewString()+"/not-status", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	escrow.FundEscrow(recorder, httptest.NewRequest(http.MethodPost, "/api/escrow/fund", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)

	disputes := NewDisputeHandler(services.NewDisputeService(nil, nil, nil))
	recorder = httptest.NewRecorder()
	disputes.OpenDispute(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes",
		strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.GetDispute(recorder, httptest.NewRequest(http.MethodGet, "/api/disputes/not-a-uuid", nil))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.GetTimeline(recorder, httptest.NewRequest(http.MethodGet, "/api/disputes/not-a-uuid/timeline", nil))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.SubmitEvidence(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/evidence", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.FinalizeEvidence(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/finalize", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.Respond(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/respond", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.GetReturnLabel(recorder, httptest.NewRequest(http.MethodGet, "/api/disputes/not-a-uuid/return-label", nil))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.MarkReturnShipped(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/ship", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.MarkReturnShipped(recorder, httptest.NewRequest(http.MethodPost,
		"/api/disputes/"+uuid.NewString()+"/ship", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.ConfirmReturn(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/confirm-return", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.OpenSubCase(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/sub-case", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	disputes.SubmitAppeal(recorder, httptest.NewRequest(http.MethodPost, "/api/disputes/not-a-uuid/appeal", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)

	admin := NewAdminHandler(disputes.disputeService,
		services.NewModerationService(services.NewAuthService(), nil, nil, nil), nil)
	recorder = httptest.NewRecorder()
	admin.AssignDispute(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/disputes/not-a-uuid/assign", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.GetDisputeEvidence(recorder, httptest.NewRequest(http.MethodGet, "/api/admin/disputes/not-a-uuid/evidence", nil))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.IssueVerdict(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/disputes/not-a-uuid/verdict", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.DecideAppeal(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/appeals/not-a-uuid/decision", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.DismissReport(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/reports/not-a-uuid/dismiss", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.SuspendUser(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/users/not-a-uuid/suspend", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.CreateReport(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/reports", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	admin.CreateReport(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/reports", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)

	orders := NewOrderHandler(nil)
	recorder = httptest.NewRecorder()
	orders.CreateOrder(recorder, httptest.NewRequest(http.MethodPost, "/api/orders", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.CreateOrder(recorder, httptest.NewRequest(http.MethodPost, "/api/orders", strings.NewReader("{}")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.GetOrderQuote(recorder, httptest.NewRequest(http.MethodGet, "/api/orders/not-a-uuid/quote", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.GetOrderDetail(recorder, httptest.NewRequest(http.MethodGet, "/api/orders/not-a-uuid", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.GetOrderTracking(recorder, httptest.NewRequest(http.MethodGet, "/api/orders/not-a-uuid/tracking", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.ConfirmReceipt(recorder, httptest.NewRequest(http.MethodPost, "/api/orders/not-a-uuid/confirm-receipt", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.GetReceipt(recorder, httptest.NewRequest(http.MethodGet, "/api/orders/not-a-uuid/receipt", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	orders.HandleOrderMessages(recorder, httptest.NewRequest(http.MethodPost,
		"/api/orders/"+uuid.NewString()+"/messages", strings.NewReader("{")), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
}

func TestMediaHandlerConfigurationAndStorageErrors(t *testing.T) {
	t.Setenv("S3_PRIVATE_BUCKET_NAME", "")
	t.Setenv("S3_REGION", "")
	t.Setenv("S3_ENDPOINT_URL", "")
	t.Setenv("MAX_VIDEO_UPLOAD_MB", "0")
	handler := NewMediaHandler()
	if handler.region != "eu-west-1" || handler.videoLimitMB != defaultVideoUploadLimitMB {
		t.Fatalf("unexpected defaults: region=%q limit=%d", handler.region, handler.videoLimitMB)
	}

	userID := uuid.New()
	recorder := httptest.NewRecorder()
	handler.PresignUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/presign",
		strings.NewReader(`{"fileType":"video/mp4","fileSize":1024}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusServiceUnavailable)

	key := "dispute_evidence/" + userID.String() + "/evidence.mp4"
	recorder = httptest.NewRecorder()
	handler.CompleteUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/complete",
		strings.NewReader(`{"fileType":"video/mp4","key":"`+key+`"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusServiceUnavailable)

	if _, err := handler.PrivateEvidenceDownloadURL(httptest.NewRequest(http.MethodGet, "/", nil),
		"dispute_evidence/"+uuid.NewString()+"/evidence.mp4"); err == nil {
		t.Fatal("PrivateEvidenceDownloadURL succeeded without object storage configuration")
	}
	t.Setenv("MAX_VIDEO_UPLOAD_MB", "25")
	if got := positiveEnvInt64("MAX_VIDEO_UPLOAD_MB", defaultVideoUploadLimitMB); got != 25 {
		t.Errorf("positiveEnvInt64 = %d, want 25", got)
	}
}

func TestMediaHandlerPresignsAndVerifiesPrivateUploads(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method != http.MethodHead {
			t.Errorf("unexpected storage request method %s", r.Method)
			http.Error(w, "unexpected method", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Length", "1024")
		if strings.Contains(r.URL.Path, "mismatch") {
			w.Header().Set("Content-Type", "text/plain")
		} else {
			w.Header().Set("Content-Type", "video/mp4")
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	t.Setenv("AWS_ACCESS_KEY_ID", "test-access-key")
	t.Setenv("AWS_SECRET_ACCESS_KEY", "test-secret-key")
	t.Setenv("AWS_EC2_METADATA_DISABLED", "true")
	t.Setenv("S3_PRIVATE_BUCKET_NAME", "private-media")
	t.Setenv("S3_REGION", "us-east-1")
	t.Setenv("S3_ENDPOINT_URL", server.URL)
	t.Setenv("MAX_VIDEO_UPLOAD_MB", "100")

	handler := NewMediaHandler()
	userID := uuid.New()
	recorder := httptest.NewRecorder()
	handler.PresignUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/presign",
		strings.NewReader(`{"fileType":"video/mp4","fileSize":1024,"referenceId":"dispute-1"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	var presignResponse struct {
		Data struct {
			UploadURL string `json:"uploadUrl"`
			Key       string `json:"key"`
		} `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &presignResponse); err != nil {
		t.Fatalf("decode presign response: %v", err)
	}
	if presignResponse.Data.UploadURL == "" || !strings.HasPrefix(presignResponse.Data.Key, "dispute_evidence/"+userID.String()+"/") {
		t.Fatalf("presign response is incomplete: %+v", presignResponse.Data)
	}

	key := "dispute_evidence/" + userID.String() + "/" + uuid.NewString() + ".mp4"
	recorder = httptest.NewRecorder()
	handler.CompleteUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/complete",
		strings.NewReader(`{"fileType":"video/mp4","key":"`+key+`"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	mismatchKey := "dispute_evidence/" + userID.String() + "/mismatch.mp4"
	recorder = httptest.NewRecorder()
	handler.CompleteUpload(recorder, httptest.NewRequest(http.MethodPost, "/api/media/complete",
		strings.NewReader(`{"fileType":"video/mp4","key":"`+mismatchKey+`"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusUnprocessableEntity)
	downloadURL, err := handler.PrivateEvidenceDownloadURL(httptest.NewRequest(http.MethodGet, "/", nil), key)
	if err != nil || downloadURL == "" {
		t.Fatalf("PrivateEvidenceDownloadURL = %q, error %v", downloadURL, err)
	}
}

func TestPaymentAndAdminHandlerServiceFlows(t *testing.T) {
	ctx := context.Background()
	auth := services.NewAuthService()
	seller, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "payments-handler@example.com", Password: "password-123", Name: "Payment Seller",
	})
	if err != nil {
		t.Fatalf("SignUp seller: %v", err)
	}
	adminUser, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "admin-handler@example.com", Password: "password-123", Name: "Admin",
		Role: db.RoleAdmin,
	})
	if err != nil {
		t.Fatalf("SignUp admin: %v", err)
	}
	listings := services.NewListingService(auth)
	orders := services.NewOrderService(listings, auth)
	escrow := services.NewEscrowService(orders, auth)
	paystack := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			Reference string `json:"reference"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Errorf("decode Paystack initialization request: %v", err)
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status": true,
			"data": map[string]string{
				"authorization_url": "https://checkout.paystack.com/test-code",
				"access_code":       "test-code",
				"reference":         request.Reference,
			},
		})
	}))
	defer paystack.Close()
	paymentService := services.NewPaymentService("sk_test_mock", escrow, orders, auth, services.PaymentServiceConfig{
		PaystackAPIBaseURL: paystack.URL,
		FrontendBaseURL:    "https://frontend.example",
	})
	paymentHandler := NewPaymentHandler(paymentService)
	userID := seller.ID

	recorder := httptest.NewRecorder()
	paymentHandler.HandlePaymentMethods(recorder, httptest.NewRequest(http.MethodGet, "/api/payment-methods", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	paymentHandler.HandlePaymentMethods(recorder, httptest.NewRequest(http.MethodPost, "/api/payment-methods",
		strings.NewReader(`{"type":"card","maskedDetails":"**** 4242","isDefault":true}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	var methodResponse struct {
		Data db.SavedPaymentMethod `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &methodResponse); err != nil {
		t.Fatalf("decode payment method response: %v", err)
	}
	methodID := methodResponse.Data.ID
	recorder = httptest.NewRecorder()
	paymentHandler.HandleSinglePaymentMethod(recorder, httptest.NewRequest(http.MethodPut,
		"/api/payment-methods/methods/action/"+methodID.String()+"/default", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	paymentHandler.HandleSinglePaymentMethod(recorder, httptest.NewRequest(http.MethodDelete,
		"/api/payment-methods/methods/action/"+methodID.String(), nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	paymentHandler.GetEarningsSummary(recorder, httptest.NewRequest(http.MethodGet, "/api/earnings", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	paymentHandler.GetPayouts(recorder, httptest.NewRequest(http.MethodGet, "/api/payouts", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	paymentHandler.RequestPayout(recorder, httptest.NewRequest(http.MethodPost, "/api/payouts",
		strings.NewReader(`{"amount":1}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	recorder = httptest.NewRecorder()
	paymentHandler.ResolveBankAccount(recorder, httptest.NewRequest(http.MethodGet,
		"/api/banks/resolve?account_number=0123456789&bank_code=058", nil), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	paymentHandler.ResolveBankAccount(recorder, httptest.NewRequest(http.MethodPost, "/api/banks/resolve",
		strings.NewReader(`{"accountNumber":"0123456789","bankCode":"058"}`)), userID)
	assertHandlerStatus(t, recorder, http.StatusOK)

	listing := &db.Listing{
		ID: uuid.New(), SellerID: seller.ID, Status: db.ListingLive,
		Price: 50000, Currency: "NGN", Brand: "Test", Model: "Device",
	}
	listings.ListingsByID[listing.ID] = listing
	buyer, err := auth.SignUp(ctx, services.SignUpInput{
		Email: "payment-buyer-handler@example.com", Password: "password-123", Name: "Payment Buyer",
	})
	if err != nil {
		t.Fatalf("SignUp buyer: %v", err)
	}
	order, err := orders.CreateOrder(ctx, buyer.ID, services.CreateOrderInput{ListingID: listing.ID})
	if err != nil {
		t.Fatalf("CreateOrder: %v", err)
	}
	recorder = httptest.NewRecorder()
	paymentHandler.InitializePaystack(recorder, httptest.NewRequest(http.MethodPost, "/api/payments/initialize",
		strings.NewReader(`{"orderId":"`+order.ID.String()+`"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	var initialization struct {
		Data services.PaystackInitResponse `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &initialization); err != nil {
		t.Fatalf("decode Paystack initialization response: %v", err)
	}
	recorder = httptest.NewRecorder()
	paymentHandler.PaystackWebhook(recorder, httptest.NewRequest(http.MethodPost, "/api/payments/webhook", strings.NewReader(`{}`)))
	assertHandlerStatus(t, recorder, http.StatusBadRequest)
	t.Setenv("ENV", "test")
	t.Setenv("ALLOW_DEV_MOCK_PAYMENTS", "true")
	webhookRequest := httptest.NewRequest(http.MethodPost, "/api/payments/webhook",
		strings.NewReader(`{"event":"unknown.event","data":{"reference":"`+initialization.Data.Reference+`"}}`))
	webhookRequest.Header.Set("x-paystack-signature", "dev_mock_signature")
	recorder = httptest.NewRecorder()
	paymentHandler.PaystackWebhook(recorder, webhookRequest)
	assertHandlerStatus(t, recorder, http.StatusOK)

	disputes := services.NewDisputeService(orders, escrow, auth)
	kyc := services.NewKYCService(auth, nil)
	moderation := services.NewModerationService(auth, disputes, orders, kyc)
	adminHandler := NewAdminHandler(disputes, moderation, &MediaHandler{})
	recorder = httptest.NewRecorder()
	adminHandler.CreateReport(recorder, httptest.NewRequest(http.MethodPost, "/api/admin/reports",
		strings.NewReader(`{"targetType":"user","targetId":"`+seller.ID.String()+`","reason":"suspicious listing"}`)), buyer.ID)
	assertHandlerStatus(t, recorder, http.StatusCreated)
	var reportResponse struct {
		Data db.Report `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &reportResponse); err != nil {
		t.Fatalf("decode report response: %v", err)
	}
	recorder = httptest.NewRecorder()
	adminHandler.ListReports(recorder, httptest.NewRequest(http.MethodGet, "/api/admin/reports?page=1&limit=10", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.ListReports(recorder, httptest.NewRequest(http.MethodGet, "/api/admin/reports", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.DismissReport(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/reports/"+reportResponse.Data.ID.String()+"/dismiss", strings.NewReader(`{"notes":"reviewed"}`)), adminUser.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.SuspendUser(recorder, httptest.NewRequest(http.MethodPost,
		"/api/admin/users/"+seller.ID.String()+"/suspend", strings.NewReader(`{"reason":"review"}`)), adminUser.ID)
	assertHandlerStatus(t, recorder, http.StatusOK)
	recorder = httptest.NewRecorder()
	adminHandler.GetSummary(recorder, httptest.NewRequest(http.MethodGet, "/api/admin/summary", nil))
	assertHandlerStatus(t, recorder, http.StatusOK)
}
