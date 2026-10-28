package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type WaitlistSignupInput struct {
	FullName        string   `json:"fullName"`
	Email           string   `json:"email"`
	Phone           string   `json:"phone"`
	Role            string   `json:"role"`
	City            string   `json:"city"`
	FavoriteGadgets []string `json:"favoriteGadgets"`
	MonthlyVolume   string   `json:"monthlyVolume"`
	ReferredBy      string   `json:"referredBy,omitempty"`
}

type RecentWaitlistFeedItem struct {
	Name   string `json:"name"`
	City   string `json:"city"`
	Role   string `json:"role"`
	Gadget string `json:"gadget"`
	Time   string `json:"time"`
}

type WaitlistStatusResponse struct {
	CohortName     string                   `json:"cohortName"`
	TotalSlots     int                      `json:"totalSlots"`
	ClaimedSlots   int                      `json:"claimedSlots"`
	RemainingSlots int                      `json:"remainingSlots"`
	RecentSignups  []RecentWaitlistFeedItem `json:"recentSignups"`
	Entry          *db.WaitlistEntry        `json:"entry,omitempty"`
}

type WaitlistService struct {
	mu            sync.RWMutex
	entriesByID   map[uuid.UUID]*db.WaitlistEntry
	entriesByMail map[string]*db.WaitlistEntry
	entriesByCode map[string]*db.WaitlistEntry
	totalSlots    int
	claimedCount  int
	recentFeed    []RecentWaitlistFeedItem
}

func NewWaitlistService() *WaitlistService {
	svc := &WaitlistService{
		entriesByID:   make(map[uuid.UUID]*db.WaitlistEntry),
		entriesByMail: make(map[string]*db.WaitlistEntry),
		entriesByCode: make(map[string]*db.WaitlistEntry),
		totalSlots:    500,
		claimedCount:  384,
		recentFeed: []RecentWaitlistFeedItem{
			{Name: "Tunde A.", City: "Lekki, Lagos", Role: "Buyer & Seller", Gadget: "MacBook Pro M3 Max", Time: "2m ago"},
			{Name: "Chiamaka O.", City: "Wuse II, Abuja", Role: "Verified Merchant", Gadget: "iPhone 15 Pro Max", Time: "7m ago"},
			{Name: "Ibrahim K.", City: "GRA, Port Harcourt", Role: "Gadget Buyer", Gadget: "PS5 Slim + Portal", Time: "14m ago"},
			{Name: "Seyi M.", City: "Ikeja Computer Village", Role: "Verified Merchant", Gadget: "Samsung S24 Ultra", Time: "21m ago"},
		},
	}

	// Pre-seed Founding Cohort 01 VIP Referral Anchor
	seedEntry := &db.WaitlistEntry{
		ID:               uuid.New(),
		FullName:         "Chidi Tech Hub",
		Email:            "chidi@scrowpoint.com",
		Phone:            "+2348030001122",
		Role:             "seller",
		City:             "Lagos (Island & Mainland)",
		FavoriteGadgets:  []string{"iPhones & iPads", "MacBooks & Laptops"},
		MonthlyVolume:    "Above ₦2,500,000 / mo",
		ReferralCode:     "SP-C1-CHIDI",
		ReferralCount:    4,
		QueuePosition:    12,
		PriorityUnlocked: true,
		CreatedAt:        time.Now().Add(-48 * time.Hour),
		UpdatedAt:        time.Now().Add(-1 * time.Hour),
	}
	svc.entriesByID[seedEntry.ID] = seedEntry
	svc.entriesByMail[strings.ToLower(seedEntry.Email)] = seedEntry
	svc.entriesByCode[seedEntry.ReferralCode] = seedEntry

	return svc
}

func generateReferralCode(fullName string) string {
	clean := strings.ToUpper(strings.TrimSpace(fullName))
	prefix := ""
	for _, ch := range clean {
		if ch >= 'A' && ch <= 'Z' {
			prefix += string(ch)
			if len(prefix) == 3 {
				break
			}
		}
	}
	if len(prefix) < 3 {
		prefix = "VIP"
	}

	b := make([]byte, 2)
	_, _ = rand.Read(b)
	suffix := strings.ToUpper(hex.EncodeToString(b))
	return fmt.Sprintf("SP-C1-%s%s", prefix, suffix[:3])
}

func (s *WaitlistService) JoinWaitlist(ctx context.Context, in WaitlistSignupInput) (*db.WaitlistEntry, int, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))
	fullName := strings.TrimSpace(in.FullName)
	phone := strings.TrimSpace(in.Phone)

	if fullName == "" {
		return nil, 0, errors.New("fullName is required")
	}
	if email == "" || !strings.Contains(email, "@") {
		return nil, 0, errors.New("a valid email address is required")
	}
	if phone == "" {
		phone = "+2348000000000"
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if existing, exists := s.entriesByMail[email]; exists {
		copyEntry := *existing
		return &copyEntry, s.claimedCount, nil
	}

	if s.claimedCount < s.totalSlots {
		s.claimedCount++
	}
	queuePos := s.claimedCount

	role := strings.TrimSpace(in.Role)
	if role == "" {
		role = "both"
	}
	city := strings.TrimSpace(in.City)
	if city == "" {
		city = "Lagos (Island & Mainland)"
	}
	gadgets := in.FavoriteGadgets
	if len(gadgets) == 0 {
		gadgets = []string{"iPhones & iPads", "MacBooks & Laptops"}
	}
	volume := strings.TrimSpace(in.MonthlyVolume)
	if volume == "" {
		volume = "₦500k – ₦2,500,000 / mo"
	}

	refCode := generateReferralCode(fullName)
	for {
		if _, collision := s.entriesByCode[refCode]; !collision {
			break
		}
		refCode = generateReferralCode(fullName)
	}

	referredBy := strings.ToUpper(strings.TrimSpace(in.ReferredBy))
	priorityUnlocked := false

	// Credit referrer if referral code is valid
	if referredBy != "" {
		if referrer, ok := s.entriesByCode[referredBy]; ok {
			referrer.ReferralCount++
			if referrer.QueuePosition > 15 {
				referrer.QueuePosition -= 15
			} else {
				referrer.QueuePosition = 1
			}
			referrer.PriorityUnlocked = true
			referrer.UpdatedAt = time.Now()
		}
		// Invited members also start 10 spots ahead
		if queuePos > 20 {
			queuePos -= 10
		}
		priorityUnlocked = true
	}

	now := time.Now()
	entry := &db.WaitlistEntry{
		ID:               uuid.New(),
		FullName:         fullName,
		Email:            email,
		Phone:            phone,
		Role:             role,
		City:             city,
		FavoriteGadgets:  gadgets,
		MonthlyVolume:    volume,
		ReferralCode:     refCode,
		ReferredBy:       referredBy,
		ReferralCount:    0,
		QueuePosition:    queuePos,
		PriorityUnlocked: priorityUnlocked,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	s.entriesByID[entry.ID] = entry
	s.entriesByMail[email] = entry
	s.entriesByCode[refCode] = entry

	// Prepend to recent signups feed
	shortName := fullName
	parts := strings.Fields(fullName)
	if len(parts) > 1 && len(parts[1]) > 0 {
		shortName = fmt.Sprintf("%s %c.", parts[0], parts[1][0])
	}
	roleLabel := "Buyer & Seller"
	if role == "seller" {
		roleLabel = "Verified Merchant"
	} else if role == "buyer" {
		roleLabel = "Gadget Buyer"
	}

	newFeedItem := RecentWaitlistFeedItem{
		Name:   shortName,
		City:   city,
		Role:   roleLabel,
		Gadget: gadgets[0],
		Time:   "Just now",
	}
	s.recentFeed = append([]RecentWaitlistFeedItem{newFeedItem}, s.recentFeed...)
	if len(s.recentFeed) > 6 {
		s.recentFeed = s.recentFeed[:6]
	}

	copyEntry := *entry
	return &copyEntry, s.claimedCount, nil
}

func (s *WaitlistService) GetStatus(ctx context.Context, emailQuery, codeQuery string) (*WaitlistStatusResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var matchedEntry *db.WaitlistEntry
	if emailQuery != "" {
		if e, ok := s.entriesByMail[strings.ToLower(strings.TrimSpace(emailQuery))]; ok {
			copyE := *e
			matchedEntry = &copyE
		}
	} else if codeQuery != "" {
		if e, ok := s.entriesByCode[strings.ToUpper(strings.TrimSpace(codeQuery))]; ok {
			copyE := *e
			matchedEntry = &copyE
		}
	}

	remaining := s.totalSlots - s.claimedCount
	if remaining < 0 {
		remaining = 0
	}

	feedCopy := make([]RecentWaitlistFeedItem, len(s.recentFeed))
	copy(feedCopy, s.recentFeed)

	return &WaitlistStatusResponse{
		CohortName:     "Founding Cohort 01",
		TotalSlots:     s.totalSlots,
		ClaimedSlots:   s.claimedCount,
		RemainingSlots: remaining,
		RecentSignups:  feedCopy,
		Entry:          matchedEntry,
	}, nil
}
