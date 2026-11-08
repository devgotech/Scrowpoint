package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type PersistentServices struct {
	Auth          *AuthService
	Listings      *ListingService
	Orders        *OrderService
	Escrow        *EscrowService
	Payments      *PaymentService
	Disputes      *DisputeService
	KYC           *KYCService
	Moderation    *ModerationService
	Notifications *NotificationService
	Waitlist      *WaitlistService
	Support       *SupportService
}

type authState struct {
	UsersByID     map[uuid.UUID]*db.User
	Sessions      map[uuid.UUID]*Session
	UserSessions  map[uuid.UUID][]uuid.UUID
	TokensByValue map[string]*VerificationToken
}

type listingState struct {
	ListingsByID   map[uuid.UUID]*db.Listing
	DraftsBySeller map[uuid.UUID]*db.Listing
	MediaByListing map[uuid.UUID][]*db.ListingMedia
	SavedListings  map[uuid.UUID]map[uuid.UUID]time.Time
}

type orderState struct {
	OrdersByID      map[uuid.UUID]*db.Order
	OrdersByBuyer   map[uuid.UUID][]uuid.UUID
	OrdersBySeller  map[uuid.UUID][]uuid.UUID
	MessagesByOrder map[string][]*db.OrderChatMessage
}

type paymentState struct {
	Payments       map[string]*db.Payment
	PaymentMethods map[uuid.UUID][]*db.SavedPaymentMethod
	Payouts        map[uuid.UUID][]*db.Payout
}

type disputeState struct {
	DisputesByID  map[uuid.UUID]*db.Dispute
	EvidenceByDsp map[uuid.UUID][]db.DisputeEvidence
	AppealsByDsp  map[uuid.UUID]*db.Appeal
	Timelines     map[uuid.UUID][]DisputeTimelineItem
}

type kycState struct {
	Verifications map[uuid.UUID][]*db.UserVerification
	ActiveJobMap  map[string]uuid.UUID
}

type waitlistState struct {
	EntriesByID  map[uuid.UUID]*db.WaitlistEntry
	TotalSlots   int
	ClaimedCount int
	RecentFeed   []RecentWaitlistFeedItem
}

type supportState struct {
	TicketsByNumber   map[string]*db.SupportTicket
	TicketsBySession  map[string]*db.SupportTicket
	MessagesBySession map[string][]*db.SupportMessage
	TicketSeq         int
}

func (s PersistentServices) Export() (map[string][]byte, error) {
	states := make(map[string][]byte, 11)
	collect := func(name string, value any) error {
		payload, err := json.Marshal(value)
		if err != nil {
			return fmt.Errorf("encode %s service state: %w", name, err)
		}
		states[name] = payload
		return nil
	}

	s.Auth.Mu.RLock()
	err := collect("auth", authState{s.Auth.UsersByID, s.Auth.Sessions, s.Auth.UserSessions, s.Auth.TokensByValue})
	s.Auth.Mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Listings.Mu.RLock()
	listingCopies := make(map[uuid.UUID]*db.Listing, len(s.Listings.ListingsByID))
	for id, listing := range s.Listings.ListingsByID {
		copyListing := *listing
		copyListing.Media = nil
		copyListing.Seller = nil
		listingCopies[id] = &copyListing
	}
	err = collect("listings", listingState{listingCopies, s.Listings.DraftsBySeller, s.Listings.MediaByListing, s.Listings.SavedListings})
	s.Listings.Mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Orders.Mu.RLock()
	orderCopies := make(map[uuid.UUID]*db.Order, len(s.Orders.OrdersByID))
	for id, order := range s.Orders.OrdersByID {
		copyOrder := *order
		copyOrder.Listing = nil
		copyOrder.Buyer = nil
		orderCopies[id] = &copyOrder
	}
	err = collect("orders", orderState{orderCopies, s.Orders.OrdersByBuyer, s.Orders.OrdersBySeller, s.Orders.MessagesByOrder})
	s.Orders.Mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Escrow.mu.RLock()
	err = collect("escrow", s.Escrow.ledger)
	s.Escrow.mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Payments.mu.RLock()
	err = collect("payments", paymentState{s.Payments.payments, s.Payments.paymentMethods, s.Payments.payouts})
	s.Payments.mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Disputes.Mu.RLock()
	err = collect("disputes", disputeState{s.Disputes.DisputesByID, s.Disputes.EvidenceByDsp, s.Disputes.AppealsByDsp, s.Disputes.Timelines})
	s.Disputes.Mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.KYC.Mu.RLock()
	err = collect("kyc", kycState{s.KYC.Verifications, s.KYC.activeJobMap})
	s.KYC.Mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Moderation.mu.RLock()
	err = collect("moderation", s.Moderation.reportsByID)
	s.Moderation.mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Notifications.mu.RLock()
	err = collect("notifications", s.Notifications.notifications)
	s.Notifications.mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Waitlist.mu.RLock()
	err = collect("waitlist", waitlistState{s.Waitlist.entriesByID, s.Waitlist.totalSlots, s.Waitlist.claimedCount, s.Waitlist.recentFeed})
	s.Waitlist.mu.RUnlock()
	if err != nil {
		return nil, err
	}

	s.Support.mu.RLock()
	err = collect("support", supportState{s.Support.ticketsByNumber, s.Support.ticketsBySession, s.Support.messagesBySession, s.Support.ticketSeq})
	s.Support.mu.RUnlock()
	if err != nil {
		return nil, err
	}

	return states, nil
}

func (s PersistentServices) Restore(states map[string][]byte) error {
	restore := func(name string, target any) error {
		payload, exists := states[name]
		if !exists {
			return nil
		}
		if err := json.Unmarshal(payload, target); err != nil {
			return fmt.Errorf("decode %s service state: %w", name, err)
		}
		return nil
	}

	var auth authState
	if err := restore("auth", &auth); err != nil {
		return err
	}
	if auth.UsersByID != nil {
		s.Auth.UsersByID = auth.UsersByID
		s.Auth.UsersByEmail = make(map[string]*db.User, len(auth.UsersByID))
		for _, user := range auth.UsersByID {
			s.Auth.UsersByEmail[user.Email] = user
		}
	}
	if auth.Sessions != nil {
		s.Auth.Sessions = auth.Sessions
	}
	if auth.UserSessions != nil {
		s.Auth.UserSessions = auth.UserSessions
	}
	if auth.TokensByValue != nil {
		s.Auth.TokensByValue = auth.TokensByValue
	}

	var listings listingState
	if err := restore("listings", &listings); err != nil {
		return err
	}
	if listings.ListingsByID != nil {
		s.Listings.ListingsByID = listings.ListingsByID
	}
	if listings.DraftsBySeller != nil {
		s.Listings.DraftsBySeller = make(map[uuid.UUID]*db.Listing, len(listings.DraftsBySeller))
		for sellerID, draft := range listings.DraftsBySeller {
			if stored, ok := s.Listings.ListingsByID[draft.ID]; ok {
				s.Listings.DraftsBySeller[sellerID] = stored
			} else {
				s.Listings.DraftsBySeller[sellerID] = draft
			}
		}
	}
	if listings.MediaByListing != nil {
		s.Listings.MediaByListing = listings.MediaByListing
	}
	if listings.SavedListings != nil {
		s.Listings.SavedListings = listings.SavedListings
	}

	var orders orderState
	if err := restore("orders", &orders); err != nil {
		return err
	}
	if orders.OrdersByID != nil {
		s.Orders.OrdersByID = orders.OrdersByID
		for _, order := range s.Orders.OrdersByID {
			order.Listing = s.Listings.ListingsByID[order.ListingID]
			order.Buyer = s.Auth.UsersByID[order.BuyerID]
		}
	}
	if orders.OrdersByBuyer != nil {
		s.Orders.OrdersByBuyer = orders.OrdersByBuyer
	}
	if orders.OrdersBySeller != nil {
		s.Orders.OrdersBySeller = orders.OrdersBySeller
	}
	if orders.MessagesByOrder != nil {
		s.Orders.MessagesByOrder = orders.MessagesByOrder
	}

	var ledger map[uuid.UUID][]db.EscrowTransaction
	if err := restore("escrow", &ledger); err != nil {
		return err
	}
	if ledger != nil {
		s.Escrow.ledger = ledger
	}

	var payments paymentState
	if err := restore("payments", &payments); err != nil {
		return err
	}
	if payments.Payments != nil {
		s.Payments.payments = payments.Payments
	}
	if payments.PaymentMethods != nil {
		s.Payments.paymentMethods = payments.PaymentMethods
	}
	if payments.Payouts != nil {
		s.Payments.payouts = payments.Payouts
	}

	var disputes disputeState
	if err := restore("disputes", &disputes); err != nil {
		return err
	}
	if disputes.DisputesByID != nil {
		s.Disputes.DisputesByID = disputes.DisputesByID
	}
	if disputes.EvidenceByDsp != nil {
		s.Disputes.EvidenceByDsp = disputes.EvidenceByDsp
	}
	if disputes.AppealsByDsp != nil {
		s.Disputes.AppealsByDsp = disputes.AppealsByDsp
	}
	if disputes.Timelines != nil {
		s.Disputes.Timelines = disputes.Timelines
	}

	var kyc kycState
	if err := restore("kyc", &kyc); err != nil {
		return err
	}
	if kyc.Verifications != nil {
		s.KYC.Verifications = kyc.Verifications
	}
	if kyc.ActiveJobMap != nil {
		s.KYC.activeJobMap = kyc.ActiveJobMap
	}

	var reports map[uuid.UUID]*db.Report
	if err := restore("moderation", &reports); err != nil {
		return err
	}
	if reports != nil {
		s.Moderation.reportsByID = reports
	}

	var notifications map[uuid.UUID][]db.Notification
	if err := restore("notifications", &notifications); err != nil {
		return err
	}
	if notifications != nil {
		s.Notifications.notifications = notifications
	}

	var waitlist waitlistState
	if err := restore("waitlist", &waitlist); err != nil {
		return err
	}
	if waitlist.EntriesByID != nil {
		s.Waitlist.entriesByID = waitlist.EntriesByID
		s.Waitlist.entriesByMail = make(map[string]*db.WaitlistEntry, len(waitlist.EntriesByID))
		s.Waitlist.entriesByCode = make(map[string]*db.WaitlistEntry, len(waitlist.EntriesByID))
		for _, entry := range waitlist.EntriesByID {
			s.Waitlist.entriesByMail[entry.Email] = entry
			s.Waitlist.entriesByCode[entry.ReferralCode] = entry
		}
		s.Waitlist.totalSlots = waitlist.TotalSlots
		s.Waitlist.claimedCount = waitlist.ClaimedCount
		s.Waitlist.recentFeed = waitlist.RecentFeed
	}

	var support supportState
	if err := restore("support", &support); err != nil {
		return err
	}
	if support.TicketsByNumber != nil {
		s.Support.ticketsByNumber = support.TicketsByNumber
	}
	if support.TicketsBySession != nil {
		s.Support.ticketsBySession = make(map[string]*db.SupportTicket, len(support.TicketsBySession))
		for sessionID, ticket := range support.TicketsBySession {
			if stored, ok := s.Support.ticketsByNumber[ticket.TicketNumber]; ok {
				s.Support.ticketsBySession[sessionID] = stored
			} else {
				s.Support.ticketsBySession[sessionID] = ticket
			}
		}
	}
	if support.MessagesBySession != nil {
		s.Support.messagesBySession = support.MessagesBySession
	}
	if support.TicketSeq != 0 {
		s.Support.ticketSeq = support.TicketSeq
	}

	return nil
}

type persistErrorResponseWriter struct {
	header http.Header
	status int
	body   bytes.Buffer
}

func newPersistErrorResponseWriter() *persistErrorResponseWriter {
	return &persistErrorResponseWriter{header: make(http.Header)}
}

func (w *persistErrorResponseWriter) Header() http.Header {
	return w.header
}

func (w *persistErrorResponseWriter) WriteHeader(status int) {
	if w.status == 0 {
		w.status = status
	}
}

func (w *persistErrorResponseWriter) Write(data []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	return w.body.Write(data)
}

func PersistingHandler(next http.Handler, persist func(context.Context) error) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		captured := newPersistErrorResponseWriter()
		next.ServeHTTP(captured, r)

		if err := persist(r.Context()); err != nil {
			for key := range w.Header() {
				w.Header().Del(key)
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = w.Write([]byte(`{"error":"application state could not be persisted"}`))
			return
		}

		for key, values := range captured.header {
			for _, value := range values {
				w.Header().Add(key, value)
			}
		}
		status := captured.status
		if status == 0 {
			status = http.StatusOK
		}
		w.WriteHeader(status)
		_, _ = w.Write(captured.body.Bytes())
	})
}

type stateWriter interface {
	SaveServiceStates(context.Context, map[string][]byte) error
}

func NewStatePersistFunc(store stateWriter, services PersistentServices) func(context.Context) error {
	var mu sync.Mutex
	return func(ctx context.Context) error {
		mu.Lock()
		defer mu.Unlock()
		states, err := services.Export()
		if err != nil {
			return err
		}
		return store.SaveServiceStates(ctx, states)
	}
}
