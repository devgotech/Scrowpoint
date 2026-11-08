package services

import (
	"context"
	"strings"
	"testing"
)

func TestCreateTicketAndSendMessagePreserveSession(t *testing.T) {
	service := NewSupportService()
	ctx := context.Background()
	sessionID := "support-session-1"

	created, err := service.CreateTicket(ctx, CreateSupportTicketInput{
		SessionID:      sessionID,
		UserEmail:      "buyer@example.com",
		UserName:       "Buyer",
		Category:       "  delivery ",
		InitialMessage: "  My order has not arrived. ",
	})
	if err != nil {
		t.Fatalf("CreateTicket returned error: %v", err)
	}
	if created.Ticket == nil || created.UserMessage == nil || created.AgentReply == nil {
		t.Fatalf("CreateTicket response is incomplete: %+v", created)
	}
	if created.Ticket.SessionID != sessionID || created.Ticket.Category != "delivery" || created.Ticket.Status != "open" {
		t.Errorf("ticket fields are incorrect: %+v", created.Ticket)
	}
	if created.UserMessage.Text != "My order has not arrived." || created.UserMessage.Sender != "user" {
		t.Errorf("initial user message is incorrect: %+v", created.UserMessage)
	}

	followup, err := service.SendMessage(ctx, SendSupportMessageInput{
		SessionID: sessionID,
		UserName:  "Buyer",
		Text:      "  Can you check the tracking? ",
	})
	if err != nil {
		t.Fatalf("SendMessage returned error: %v", err)
	}
	if followup.Ticket == nil || followup.Ticket.TicketNumber != created.Ticket.TicketNumber {
		t.Fatalf("follow-up message did not reuse ticket: %+v", followup.Ticket)
	}
	if followup.UserMessage.Text != "Can you check the tracking?" || followup.AgentReply == nil {
		t.Errorf("follow-up exchange is incomplete: %+v", followup)
	}

	messages, ticket, err := service.GetMessages(ctx, sessionID)
	if err != nil {
		t.Fatalf("GetMessages returned error: %v", err)
	}
	if ticket == nil || ticket.TicketNumber != created.Ticket.TicketNumber || len(messages) != 5 {
		t.Errorf("unexpected support conversation: ticket=%+v messages=%+v", ticket, messages)
	}
}

func TestSendMessageRejectsEmptyTextAndContextualReply(t *testing.T) {
	service := NewSupportService()
	if _, err := service.SendMessage(context.Background(), SendSupportMessageInput{
		SessionID: "empty-message",
		Text:      "   ",
	}); err == nil {
		t.Fatal("SendMessage accepted an empty message")
	}

	reply := buildContextualSupportReply("I need help with my KYC verification", "SUP-TEST")
	if !strings.Contains(reply, "SUP-TEST") {
		t.Errorf("support reply did not include ticket number: %q", reply)
	}
}
