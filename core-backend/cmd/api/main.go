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
		if err := os.Setenv("ENV", env); err != nil {
			log.Fatalf("[FATAL] Could not set runtime environment: %v", err)
		}
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
		log.Println("[WARN] PAYSTACK_SECRET_KEY is not configured; checkout will be unavailable")
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
	smileClient := services.NewSmileIDClient(
		smilePartnerID,
		smileAPIKey,
		services.SmileIDClientConfig{Environment: os.Getenv("SMILE_ID_ENVIRONMENT")},
	)
	kycService := services.NewKYCService(authService, smileClient)
	listingService := services.NewListingService(authService)
	orderService := services.NewOrderService(listingService, authService)
	escrowService := services.NewEscrowService(orderService, authService)
	paymentService := services.NewPaymentService(
		paystackSecret,
		escrowService,
		orderService,
		authService,
		services.PaymentServiceConfig{
			PaystackAPIBaseURL: os.Getenv("PAYSTACK_API_BASE_URL"),
			FrontendBaseURL:    os.Getenv("FRONTEND_BASE_URL"),
		},
	)
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

	// Development may seed a demo admin; production uses an explicit one-time secret bootstrap.
	if env == "development" && os.Getenv("SEED_DEV_ADMIN") != "false" {
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
	} else if env == "production" || env == "staging" {
		bootstrapEmail := strings.TrimSpace(os.Getenv("BOOTSTRAP_ADMIN_EMAIL"))
		bootstrapPassword := os.Getenv("BOOTSTRAP_ADMIN_PASSWORD")
		if (bootstrapEmail == "") != (bootstrapPassword == "") {
			log.Fatal("[FATAL] BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be configured together")
		}
		if bootstrapEmail != "" {
			if len(bootstrapPassword) < 12 {
				log.Fatal("[FATAL] BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters long")
			}
			authService.Mu.RLock()
			hasAdmin := false
			for _, user := range authService.UsersByID {
				if user.Role == db.RoleAdmin {
					hasAdmin = true
					break
				}
			}
			authService.Mu.RUnlock()
			if hasAdmin {
				log.Printf("[INFO] %s admin already exists; bootstrap credentials were not used.", strings.ToUpper(env))
			} else {
				adminUser, err := authService.SignUp(ctx, services.SignUpInput{
					Email:    bootstrapEmail,
					Password: bootstrapPassword,
					Name:     "Platform Administrator",
					Role:     db.RoleAdmin,
				})
				if err != nil {
					log.Fatalf("[FATAL] Production admin bootstrap failed: %v", err)
				}
				now := time.Now()
				adminUser.EmailVerifiedAt = &now
				log.Printf("[BOOTSTRAP] Initial %s admin provisioned: %s", strings.ToUpper(env), adminUser.Email)
			}
		} else {
			log.Printf("[INFO] %s admin bootstrap is disabled; no bootstrap credentials configured.", strings.ToUpper(env))
		}
	}
	if err := persistState(context.Background()); err != nil {
		log.Fatalf("[FATAL] Initial PostgreSQL application state save failed: %v", err)
	}

	authHandler := handlers.NewAuthHandler(authService, jwtMw, services.NewSMTPEmailSenderFromEnv())
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
	for _, path := range []string{".env", ".env.local", "../.env", "../.env.local"} {
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
