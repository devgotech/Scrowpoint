package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"core-backend/internal/api"
	"core-backend/internal/api/handlers"
	"core-backend/internal/api/middleware"
	"core-backend/internal/db"
	"core-backend/internal/services"
	"core-backend/internal/workers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-buyers-high-production-jwt-key-2026"
	}

	paystackSecret := os.Getenv("PAYSTACK_SECRET_KEY")
	if paystackSecret == "" {
		paystackSecret = "sk_test_buyers_high_mock_paystack_secret_key"
	}

	smilePartnerID := os.Getenv("SMILE_ID_PARTNER_ID")
	smileAPIKey := os.Getenv("SMILE_ID_API_KEY")

	log.Println("[INFO] Initializing Buyer's High Escrow Core Backend...")

	jwtMw := middleware.NewAuthMiddleware(jwtSecret)

	authService := services.NewAuthService()
	userService := services.NewUserService(authService)
	smileClient := services.NewSmileIDClient(smilePartnerID, smileAPIKey)
	kycService := services.NewKYCService(authService, smileClient)
	listingService := services.NewListingService(authService)
	orderService := services.NewOrderService(listingService, authService)
	escrowService := services.NewEscrowService(orderService, authService)
	paymentService := services.NewPaymentService(paystackSecret, escrowService, orderService, authService)
	disputeService := services.NewDisputeService(orderService, escrowService, authService)
	moderationService := services.NewModerationService(authService, disputeService, orderService, kycService)
	notificationService := services.NewNotificationService()
	waitlistService := services.NewWaitlistService()
	supportService := services.NewSupportService()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	adminUser, err := authService.SignUp(ctx, services.SignUpInput{
		Email:    "admin@buyershigh.com",
		Password: "AdminPassword123!",
		Name:     "Lead Compliance Officer",
		Role:     db.RoleAdmin,
		Phone:    "+2348000000001",
		Location: "Lagos, Nigeria",
	})
	if err == nil {
		now := adminUser.CreatedAt
		adminUser.EmailVerifiedAt = &now
		adminUser.KYCStatus = db.KYCApproved
		log.Printf("[SEED] Default Admin seeded: %s (%s)", adminUser.Email, adminUser.ID)
	}

	authHandler := handlers.NewAuthHandler(authService, jwtMw)
	userHandler := handlers.NewUserHandler(userService)
	kycHandler := handlers.NewKYCHandler(kycService)
	listingHandler := handlers.NewListingHandler(listingService)
	orderHandler := handlers.NewOrderHandler(orderService)
	escrowHandler := handlers.NewEscrowHandler(escrowService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	disputeHandler := handlers.NewDisputeHandler(disputeService)
	adminHandler := handlers.NewAdminHandler(disputeService, moderationService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)
	waitlistHandler := handlers.NewWaitlistHandler(waitlistService)
	supportHandler := handlers.NewSupportHandler(supportService)

	router := api.NewRouter(
		authHandler,
		userHandler,
		kycHandler,
		listingHandler,
		orderHandler,
		escrowHandler,
		paymentHandler,
		disputeHandler,
		adminHandler,
		notificationHandler,
		jwtMw,
	)
	router.RegisterExtendedHandlers(waitlistHandler, supportHandler)

	cronInterval := 30 * time.Second
	escrowWorker := workers.NewEscrowWorker(
		orderService,
		escrowService,
		disputeService,
		notificationService,
		cronInterval,
	)
	escrowWorker.Start(ctx)

	serverAddr := fmt.Sprintf(":%s", port)
	srv := &http.Server{
		Addr:    serverAddr,
		Handler: router,
	}

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("[SHUTDOWN] Terminating server and background workers...")
		escrowWorker.Stop()
		shutdownCtx, sCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer sCancel()
		_ = srv.Shutdown(shutdownCtx)
		cancel()
	}()

	log.Printf("[READY] Core Backend API listening on %s", serverAddr)
	log.Println("[WORKER] 48-Hour Inspection Auto-Release & Dispute SLA Timer ACTIVE")

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("[FATAL] Server error: %v", err)
	}
}
