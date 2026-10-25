package workers

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
	"core-backend/internal/services"
)

type EscrowWorker struct {
	orderService        *services.OrderService
	escrowService       *services.EscrowService
	disputeService      *services.DisputeService
	notificationService *services.NotificationService
	checkInterval       time.Duration
	stopChan            chan struct{}
	wg                  sync.WaitGroup
	mu                  sync.Mutex
	isRunning           bool
}

func NewEscrowWorker(
	orderService *services.OrderService,
	escrowService *services.EscrowService,
	disputeService *services.DisputeService,
	notificationService *services.NotificationService,
	checkInterval time.Duration,
) *EscrowWorker {
	if checkInterval <= 0 {
		checkInterval = 1 * time.Minute
	}

	return &EscrowWorker{
		orderService:        orderService,
		escrowService:       escrowService,
		disputeService:      disputeService,
		notificationService: notificationService,
		checkInterval:       checkInterval,
		stopChan:            make(chan struct{}),
	}
}

func (w *EscrowWorker) Start(ctx context.Context) {
	w.mu.Lock()
	if w.isRunning {
		w.mu.Unlock()
		return
	}
	w.isRunning = true
	w.stopChan = make(chan struct{})
	w.mu.Unlock()

	log.Printf("[CRON] Escrow Background Worker started (Interval: %v)", w.checkInterval)

	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		ticker := time.NewTicker(w.checkInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				w.ProcessInspectionAutoReleases(ctx)
				w.ProcessDisputeDeadlines(ctx)
			case <-w.stopChan:
				log.Println("[CRON] Escrow Background Worker stopping gracefully...")
				return
			case <-ctx.Done():
				log.Println("[CRON] Escrow Background Worker context cancelled")
				return
			}
		}
	}()
}

func (w *EscrowWorker) Stop() {
	w.mu.Lock()
	if !w.isRunning {
		w.mu.Unlock()
		return
	}
	w.isRunning = false
	close(w.stopChan)
	w.mu.Unlock()

	w.wg.Wait()
	log.Println("[CRON] Escrow Background Worker stopped.")
}

func (w *EscrowWorker) ProcessInspectionAutoReleases(ctx context.Context) int {
	now := time.Now()
	releasedCount := 0

	w.orderService.Mu.RLock()
	var expiredOrders []*db.Order
	for _, order := range w.orderService.OrdersByID {
		if order.DeletedAt != nil {
			continue
		}

		if order.EscrowState == db.EscrowStateInspectionPeriod &&
			order.InspectionExpiresAt != nil &&
			now.After(*order.InspectionExpiresAt) {
			expiredOrders = append(expiredOrders, order)
		}
	}
	w.orderService.Mu.RUnlock()

	for _, order := range expiredOrders {
		log.Printf("[CRON-AUTO-RELEASE] Processing Order %s (Expired at: %s)", order.ID, order.InspectionExpiresAt.Format(time.RFC3339))

		updatedOrder, err := w.escrowService.ReleaseFundsToSeller(
			ctx,
			order.ID,
			false,
			fmt.Sprintf("Auto-released by background cron: 48-hour inspection window elapsed at %s with zero disputes filed.", now.Format(time.RFC3339)),
		)
		if err != nil {
			log.Printf("[CRON-ERROR] Failed to auto-release order %s: %v", order.ID, err)
			continue
		}

		releasedCount++

		var sellerID uuid.UUID
		if updatedOrder.Listing != nil {
			sellerID = updatedOrder.Listing.SellerID
		}

		if sellerID != uuid.Nil {
			_, _ = w.notificationService.SendNotification(
				ctx,
				sellerID,
				db.NotificationChannelInApp,
				"ESCROW_AUTO_RELEASED_SELLER",
				"Funds Released: 48-Hour Inspection Window Elapsed",
				fmt.Sprintf("The 48-hour buyer inspection period has completed with zero defects reported. 100%% of your listed price (%.2f %s) has been released to your payout balance.", updatedOrder.ItemPrice, updatedOrder.Currency),
				map[string]interface{}{
					"orderId":   updatedOrder.ID,
					"amount":    updatedOrder.ItemPrice,
					"currency":  updatedOrder.Currency,
					"timestamp": now,
				},
			)
			_, _ = w.notificationService.SendNotification(
				ctx,
				sellerID,
				db.NotificationChannelEmail,
				"EMAIL_PAYOUT_AVAILABLE",
				"Escrow Payout Available",
				fmt.Sprintf("Your sale of %s is now complete and funds are available for withdrawal.", updatedOrder.ID.String()[:8]),
				nil,
			)
		}

		_, _ = w.notificationService.SendNotification(
			ctx,
			updatedOrder.BuyerID,
			db.NotificationChannelInApp,
			"ESCROW_AUTO_RELEASED_BUYER",
			"Transaction Completed",
			"The 48-hour device inspection period has concluded. Escrow protection is finalized. Thank you for trading safely on Scrowpoint.",
			map[string]interface{}{
				"orderId":   updatedOrder.ID,
				"timestamp": now,
			},
		)
	}

	if releasedCount > 0 {
		log.Printf("[CRON-SUCCESS] Auto-released %d orders from inspection window to completed", releasedCount)
	}

	return releasedCount
}

func (w *EscrowWorker) ProcessDisputeDeadlines(ctx context.Context) int {
	now := time.Now()
	processedCount := 0

	w.disputeService.Mu.RLock()
	var disputesToCheck []*db.Dispute
	for _, d := range w.disputeService.DisputesByID {
		disputesToCheck = append(disputesToCheck, d)
	}
	w.disputeService.Mu.RUnlock()

	for _, d := range disputesToCheck {
		if d.Status == db.DisputeStatusEvidenceCollection && d.EvidenceDeadline != nil && now.After(*d.EvidenceDeadline) {
			evidenceList := w.disputeService.EvidenceByDsp[d.ID]
			if len(evidenceList) == 0 {
				log.Printf("[CRON-DISPUTE] Buyer failed to upload evidence within 24h for Dispute %s. Dismissing dispute.", d.ID)
				w.disputeService.Mu.Lock()
				d.Status = db.DisputeStatusResolved
				outcome := db.MediationOutcomeReleaseToSeller
				d.MediationOutcome = &outcome
				d.MediatorNotes = "Dispute dismissed automatically: Buyer failed to upload required proof within the 24-hour window."
				d.UpdatedAt = now
				w.disputeService.Mu.Unlock()

				_, _ = w.escrowService.ReleaseFundsToSeller(ctx, d.OrderID, true, "Buyer failed to submit dispute evidence within 24h deadline")
				processedCount++
			}
		}

		if d.ReturnDeadline != nil && now.After(*d.ReturnDeadline) && d.ReturnTrackingNumber == "" && d.Status == db.DisputeStatusAdminMediation {
			log.Printf("[CRON-DISPUTE] Buyer failed to ship return within 72h for Dispute %s. Auto-releasing funds to seller.", d.ID)
			w.disputeService.Mu.Lock()
			d.Status = db.DisputeStatusResolved
			outcome := db.MediationOutcomeReleaseToSeller
			d.MediationOutcome = &outcome
			d.MediatorNotes = "Dispute closed in seller's favor: Buyer did not provide return tracking within the 72-hour shipping deadline."
			d.UpdatedAt = now
			w.disputeService.Mu.Unlock()

			_, _ = w.escrowService.ReleaseFundsToSeller(ctx, d.OrderID, true, "Buyer exceeded 72-hour return shipping window without tracking")
			processedCount++
		}
	}

	return processedCount
}
