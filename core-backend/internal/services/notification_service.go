package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type NotificationService struct {
	mu            sync.RWMutex
	notifications map[uuid.UUID][]db.Notification
}

func NewNotificationService() *NotificationService {
	return &NotificationService{
		notifications: make(map[uuid.UUID][]db.Notification),
	}
}

func (s *NotificationService) SendNotification(
	ctx context.Context,
	userID uuid.UUID,
	channel db.NotificationChannel,
	triggerEvent string,
	title string,
	message string,
	data map[string]interface{},
) (*db.Notification, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var dataBytes []byte
	if data != nil {
		dataBytes, _ = json.Marshal(data)
	}

	now := time.Now()
	notification := db.Notification{
		ID:           uuid.New(),
		UserID:       userID,
		Channel:      channel,
		TriggerEvent: triggerEvent,
		Title:        title,
		Message:      message,
		Data:         dataBytes,
		IsRead:       false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	s.notifications[userID] = append(s.notifications[userID], notification)

	if channel == db.NotificationChannelEmail {
		fmt.Printf("[EMAIL-DISPATCH] To User %s | Event: %s | %s\n", userID.String()[:8], triggerEvent, title)
	}

	return &notification, nil
}

func (s *NotificationService) ListNotifications(ctx context.Context, userID uuid.UUID, recentOnly bool) ([]db.Notification, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := s.notifications[userID]
	var out []db.Notification
	for _, n := range list {
		if n.DeletedAt == nil {
			if recentOnly && n.IsRead {
				continue
			}
			out = append(out, n)
		}
	}

	sort.Slice(out, func(i, j int) bool {
		return out[i].CreatedAt.After(out[j].CreatedAt)
	})

	return out, nil
}

func (s *NotificationService) MarkAsRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	list := s.notifications[userID]
	found := false
	for i := range list {
		if list[i].ID == notificationID {
			list[i].IsRead = true
			list[i].UpdatedAt = time.Now()
			found = true
			break
		}
	}

	if !found {
		return errors.New("notification not found")
	}
	return nil
}

func (s *NotificationService) MarkAllAsRead(ctx context.Context, userID uuid.UUID) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	list := s.notifications[userID]
	now := time.Now()
	for i := range list {
		list[i].IsRead = true
		list[i].UpdatedAt = now
	}
	return nil
}
