package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
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
	if err := loadLocalEnv(); err != nil {
		log.Fatalf("[FATAL] Could not load local environment: %v", err)
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if env == "production" {
			log.Fatalf("[FATAL] JWT_SECRET environment variable must be set in production mode")
		}
		jwtSecret = "dev-insecure-scrowpoint-local-jwt-key-do-not-use-in-prod"
		log.Println("[WARN] Running with fallback dev JWT secret. Do NOT use in production!")
	}

	paystackSecret := os.Getenv("PAYSTACK_SECRET_KEY")
	if paystackSecret == "" {
		if env == "production" {
			log.Fatalf("[FATAL] PAYSTACK_SECRET_KEY must be configured in production mode")
		}
		paystackSecret = "sk_test_buyers_high_mock_paystack_secret_key"
		log.Println("[WARN] Running with mock Paystack test secret key for development")
	}

	smilePartnerID := os.Getenv("SMILE_ID_PARTNER_ID")
	smileAPIKey := os.Getenv("SMILE_ID_API_KEY")

	log.Printf("[INFO] Initializing Buyer's High Escrow Core Backend (Environment: %s)...", env)

	startupCtx, startupCancel := context.WithTimeout(context.Background(), 30*time.Second)
	postgres, err := db.OpenPostgres(startupCtx, os.Getenv("DATABASE_URL"), os.Getenv("DATABASE_URL_UNPOOLED"))
	startupCancel()
	if err != nil {
		log.Fatalf("[FATAL] PostgreSQL startup failed: %v", err)
	}
	defer postgres.Close()

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

	persistentServices := services.PersistentServices{
		Auth:          authService,
		Listings:      listingService,
		Orders:        orderService,
		Escrow:        escrowService,
		Payments:      paymentService,
		Disputes:      disputeService,
		KYC:           kycService,
		Moderation:    moderationService,
		Notifications: notificationService,
		Waitlist:      waitlistService,
		Support:       supportService,
	}
	states, err := postgres.LoadServiceStates(context.Background())
	if err != nil {
		log.Fatalf("[FATAL] PostgreSQL application state load failed: %v", err)
	}
	if err := persistentServices.Restore(states); err != nil {
		log.Fatalf("[FATAL] PostgreSQL application state restore failed: %v", err)
	}
	persistState := services.NewStatePersistFunc(postgres, persistentServices)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// SEC-03 Hardening: Admin account is only auto-seeded during local development.
	// In production, administrative accounts must be provisioned via migration or secure CLI.
	if env != "production" && os.Getenv("SEED_DEV_ADMIN") != "false" {
		devAdminEmail := os.Getenv("DEV_ADMIN_EMAIL")
		if devAdminEmail == "" {
			devAdminEmail = "admin@scrowpoint.com"
		}
		devAdminPass := os.Getenv("DEV_ADMIN_PASSWORD")
		if devAdminPass == "" {
			devAdminPass = "AdminPassword123!"
		}

		adminUser, err := authService.SignUp(ctx, services.SignUpInput{
			Email:    devAdminEmail,
			Password: devAdminPass,
			Name:     "Lead Compliance Officer (Dev Seed)",
			Role:     db.RoleAdmin,
			Phone:    "+2348000000001",
			Location: "Lagos, Nigeria",
		})
		if err == nil {
			now := adminUser.CreatedAt
			adminUser.EmailVerifiedAt = &now
			adminUser.KYCStatus = db.KYCApproved
			log.Printf("[DEV-SEED] Development Admin seeded: %s", adminUser.Email)
		}
	} else if env == "production" {
		log.Println("[INFO] Production mode active: Automatic admin account seeding is disabled.")
	}
	if err := persistState(context.Background()); err != nil {
		log.Fatalf("[FATAL] Initial PostgreSQL application state save failed: %v", err)
	}

	authHandler := handlers.NewAuthHandler(authService, jwtMw)
	userHandler := handlers.NewUserHandler(userService)
	kycHandler := handlers.NewKYCHandler(kycService)
	listingHandler := handlers.NewListingHandler(listingService)
	orderHandler := handlers.NewOrderHandler(orderService)
	escrowHandler := handlers.NewEscrowHandler(escrowService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	disputeHandler := handlers.NewDisputeHandler(disputeService)
	mediaHandler := handlers.NewMediaHandler()
	adminHandler := handlers.NewAdminHandler(disputeService, moderationService, mediaHandler)
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
		mediaHandler,
	)
	router.RegisterExtendedHandlers(waitlistHandler, supportHandler)
	persistingRouter := services.PersistingHandler(router, persistState)

	cronInterval := 30 * time.Second
	escrowWorker := workers.NewEscrowWorker(
		orderService,
		escrowService,
		disputeService,
		notificationService,
		cronInterval,
	)
	escrowWorker.SetPersistenceHook(persistState)
	escrowWorker.Start(ctx)

	serverAddr := fmt.Sprintf(":%s", port)
	srv := &http.Server{
		Addr:    serverAddr,
		Handler: persistingRouter,
	}

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("[SHUTDOWN] Terminating server and background workers...")
		escrowWorker.Stop()
		if err := persistState(context.Background()); err != nil {
			log.Printf("[SHUTDOWN] Could not persist final application state: %v", err)
		}
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

func loadLocalEnv() error {
	for _, path := range []string{".env.local", "../.env.local"} {
		file, err := os.Open(path)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return fmt.Errorf("open %s", path)
		}
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
			key, value, found := strings.Cut(line, "=")
			if !found {
				continue
			}
			key = strings.TrimSpace(key)
			value = strings.TrimSpace(value)
			if len(value) >= 2 && value[0] == '"' && value[len(value)-1] == '"' {
				if unquoted, err := strconv.Unquote(value); err == nil {
					value = unquoted
				}
			} else if len(value) >= 2 && value[0] == '\'' && value[len(value)-1] == '\'' {
				value = value[1 : len(value)-1]
			}
			if key != "" && os.Getenv(key) == "" {
				if err := os.Setenv(key, value); err != nil {
					_ = file.Close()
					return fmt.Errorf("set environment variable %s", key)
				}
			}
		}
		if err := scanner.Err(); err != nil {
			_ = file.Close()
			return fmt.Errorf("read %s", path)
		}
		if err := file.Close(); err != nil {
			return fmt.Errorf("close %s", path)
		}
	}
	return nil
}
