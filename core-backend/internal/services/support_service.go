package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type CreateSupportTicketInput struct {
	SessionID      string `json:"sessionId"`
	UserID         string `json:"userId,omitempty"`
	UserEmail      string `json:"userEmail,omitempty"`
	UserName       string `json:"userName,omitempty"`
	OrderID        string `json:"orderId,omitempty"`
	Category       string `json:"category"`
	InitialMessage string `json:"message"`
}

type SendSupportMessageInput struct {
	SessionID string `json:"sessionId"`
	TicketID  string `json:"ticketId,omitempty"`
	UserID    string `json:"userId,omitempty"`
	UserName  string `json:"userName,omitempty"`
	OrderID   string `json:"orderId,omitempty"`
	Text      string `json:"text"`
}

type SupportExchangeResponse struct {
	Ticket      *db.SupportTicket  `json:"ticket,omitempty"`
	UserMessage *db.SupportMessage `json:"userMessage"`
	AgentReply  *db.SupportMessage `json:"agentReply"`
}

type SupportService struct {
	mu                sync.RWMutex
	ticketsByNumber   map[string]*db.SupportTicket
	ticketsBySession  map[string]*db.SupportTicket
	messagesBySession map[string][]*db.SupportMessage
	ticketSeq         int
}

func NewSupportService() *SupportService {
	return &SupportService{
		ticketsByNumber:   make(map[string]*db.SupportTicket),
		ticketsBySession:  make(map[string]*db.SupportTicket),
		messagesBySession: make(map[string][]*db.SupportMessage),
		ticketSeq:         4100,
	}
}

func (s *SupportService) ensureSessionMessagesLocked(sessionID string) []*db.SupportMessage {
	if sessionID == "" {
		sessionID = "default-concierge-session"
	}
	msgs, exists := s.messagesBySession[sessionID]
	if !exists || len(msgs) == 0 {
		now := time.Now()
		welcome := &db.SupportMessage{
			ID:         uuid.New(),
			SessionID:  sessionID,
			Sender:     "agent",
			SenderName: "Scrowpoint Escrow Desk",
			Text:       "Hello! Welcome to Scrowpoint Escrow Support. Need assistance with an active trade, 48-hour inspection, or KYC?",
			Time:       "Just now",
			CreatedAt:  now,
		}
		msgs = []*db.SupportMessage{welcome}
		s.messagesBySession[sessionID] = msgs
	}
	return msgs
}

func (s *SupportService) GetMessages(ctx context.Context, sessionID string) ([]db.SupportMessage, *db.SupportTicket, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if sessionID == "" {
		sessionID = "default-concierge-session"
	}

	raw := s.ensureSessionMessagesLocked(sessionID)
	out := make([]db.SupportMessage, len(raw))
	for i, m := range raw {
		msgCopy := *m
		if msgCopy.Time == "" {
			msgCopy.Time = msgCopy.CreatedAt.Format("03:04 PM")
		}
		out[i] = msgCopy
	}

	var ticketCopy *db.SupportTicket
	if t, ok := s.ticketsBySession[sessionID]; ok {
		tc := *t
		ticketCopy = &tc
	}

	return out, ticketCopy, nil
}

func (s *SupportService) CreateTicket(ctx context.Context, in CreateSupportTicketInput) (*SupportExchangeResponse, error) {
	sessionID := strings.TrimSpace(in.SessionID)
	if sessionID == "" {
		sessionID = fmt.Sprintf("sess-%d", time.Now().UnixNano())
	}

	category := strings.TrimSpace(in.Category)
	if category == "" {
		category = "general_escrow"
	}

	s.mu.Lock()
	s.ticketSeq++
	ticketNum := fmt.Sprintf("SUP-%d", s.ticketSeq)
	now := time.Now()

	ticket := &db.SupportTicket{
		ID:           uuid.New(),
		TicketNumber: ticketNum,
		SessionID:    sessionID,
		UserID:       in.UserID,
		UserEmail:    in.UserEmail,
		UserName:     in.UserName,
		OrderID:      in.OrderID,
		Category:     category,
		Status:       "open",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	s.ticketsByNumber[ticketNum] = ticket
	s.ticketsBySession[sessionID] = ticket
	s.ensureSessionMessagesLocked(sessionID)
	s.mu.Unlock()

	initialText := strings.TrimSpace(in.InitialMessage)
	if initialText == "" {
		initialText = fmt.Sprintf("Support ticket opened under category: %s", category)
	}

	return s.SendMessage(ctx, SendSupportMessageInput{
		SessionID: sessionID,
		TicketID:  ticketNum,
		UserID:    in.UserID,
		UserName:  in.UserName,
		OrderID:   in.OrderID,
		Text:      initialText,
	})
}

func (s *SupportService) SendMessage(ctx context.Context, in SendSupportMessageInput) (*SupportExchangeResponse, error) {
	text := strings.TrimSpace(in.Text)
	if text == "" {
		return nil, errors.New("support message text is required")
	}

	sessionID := strings.TrimSpace(in.SessionID)
	if sessionID == "" {
		sessionID = "default-concierge-session"
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.ensureSessionMessagesLocked(sessionID)

	ticket, exists := s.ticketsBySession[sessionID]
	if !exists {
		s.ticketSeq++
		ticketNum := fmt.Sprintf("SUP-%d", s.ticketSeq)
		now := time.Now()
		ticket = &db.SupportTicket{
			ID:           uuid.New(),
			TicketNumber: ticketNum,
			SessionID:    sessionID,
			UserID:       in.UserID,
			UserName:     in.UserName,
			OrderID:      in.OrderID,
			Category:     "escrow_concierge",
			Status:       "open",
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		s.ticketsByNumber[ticketNum] = ticket
		s.ticketsBySession[sessionID] = ticket
	}

	senderName := strings.TrimSpace(in.UserName)
	if senderName == "" {
		senderName = "Marketplace User"
	}

	now := time.Now()
	userMsg := &db.SupportMessage{
		ID:         uuid.New(),
		TicketID:   ticket.TicketNumber,
		SessionID:  sessionID,
		Sender:     "user",
		SenderName: senderName,
		Text:       text,
		Time:       now.Format("03:04 PM"),
		CreatedAt:  now,
	}

	replyText := buildContextualSupportReply(text, ticket.TicketNumber)
	agentMsg := &db.SupportMessage{
		ID:         uuid.New(),
		TicketID:   ticket.TicketNumber,
		SessionID:  sessionID,
		Sender:     "agent",
		SenderName: "Senior Escrow Officer",
		Text:       replyText,
		Time:       now.Format("03:04 PM"),
		CreatedAt:  now.Add(1 * time.Second),
	}

	s.messagesBySession[sessionID] = append(s.messagesBySession[sessionID], userMsg, agentMsg)
	ticket.UpdatedAt = now

	tc := *ticket
	um := *userMsg
	am := *agentMsg

	return &SupportExchangeResponse{
		Ticket:      &tc,
		UserMessage: &um,
		AgentReply:  &am,
	}, nil
}

func buildContextualSupportReply(input string, ticketNum string) string {
	lower := strings.ToLower(input)

	switch {
	case strings.Contains(lower, "48-hour") || strings.Contains(lower, "inspection"):
		return fmt.Sprintf("[%s] The 48-hour inspection SLA begins upon verified courier delivery. Funds remain locked in Paystack custody until you confirm satisfaction or report a discrepancy.", ticketNum)
	case strings.Contains(lower, "payout") || strings.Contains(lower, "withdraw") || strings.Contains(lower, "bank"):
		return fmt.Sprintf("[%s] Seller payouts disburse via automated Paystack NIBSS Instant Payment (NIP) within 15 minutes of buyer sign-off or inspection timer expiration.", ticketNum)
	case strings.Contains(lower, "dispute") || strings.Contains(lower, "refund") || strings.Contains(lower, "defect"):
		return fmt.Sprintf("[%s] You can open a dispute directly from your Escrow Room by tapping 'Report Issue'. A compliance officer will freeze the escrow vault and review your unboxing evidence.", ticketNum)
	case strings.Contains(lower, "kyc") || strings.Contains(lower, "smile") || strings.Contains(lower, "bvn") || strings.Contains(lower, "nin"):
		return fmt.Sprintf("[%s] SmileID biometric BVN/NIN verification takes under 60 seconds and unlocks unlimited seller listings and instant NUBAN bank settlements.", ticketNum)
	case strings.Contains(lower, "imei") || strings.Contains(lower, "serial"):
		return fmt.Sprintf("[%s] Every device's 15-digit IMEI or serial number is cryptographically bound to the escrow order so the buyer can verify an exact hardware match during unboxing.", ticketNum)
	default:
		return fmt.Sprintf("Ticket %s logged: A Senior Escrow Officer has received your inquiry. Average live response time is under 3 minutes.", ticketNum)
	}
}
