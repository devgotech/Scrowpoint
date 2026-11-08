package services

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestNotificationsListUnreadAndMarkRead(t *testing.T) {
	service := NewNotificationService()
	ctx := context.Background()
	userID := uuid.New()

	first, err := service.SendNotification(ctx, userID, db.NotificationChannelInApp, "ORDER_CREATED", "Order created", "Order placed", map[string]interface{}{
		"orderId": "order-1",
	})
	if err != nil {
		t.Fatalf("SendNotification returned error: %v", err)
	}
	olderTime := first.CreatedAt.Add(-time.Minute)
	service.notifications[userID] = append(service.notifications[userID], db.Notification{
		ID:        uuid.New(),
		UserID:    userID,
		Title:     "Deleted",
		IsRead:    false,
		CreatedAt: olderTime,
		DeletedAt: &olderTime,
	})
	second, err := service.SendNotification(ctx, userID, db.NotificationChannelInApp, "ORDER_SHIPPED", "Order shipped", "Order sent", nil)
	if err != nil {
		t.Fatalf("SendNotification returned error: %v", err)
	}
	second.CreatedAt = first.CreatedAt.Add(time.Second)
	service.notifications[userID][2] = *second

	var data map[string]interface{}
	if err := json.Unmarshal(first.Data, &data); err != nil || data["orderId"] != "order-1" {
		t.Errorf("notification data = %s, error = %v", first.Data, err)
	}

	all, err := service.ListNotifications(ctx, userID, false)
	if err != nil {
		t.Fatalf("ListNotifications returned error: %v", err)
	}
	if len(all) != 2 || all[0].ID != second.ID {
		t.Fatalf("ListNotifications returned unexpected records/order: %+v", all)
	}
	if err := service.MarkAsRead(ctx, userID, second.ID); err != nil {
		t.Fatalf("MarkAsRead returned error: %v", err)
	}
	unread, err := service.ListNotifications(ctx, userID, true)
	if err != nil {
		t.Fatalf("ListNotifications(recentOnly) returned error: %v", err)
	}
	if len(unread) != 1 || unread[0].ID != first.ID {
		t.Fatalf("unread notifications = %+v, want only the first notification", unread)
	}
	if err := service.MarkAsRead(ctx, userID, uuid.New()); err == nil {
		t.Fatal("MarkAsRead accepted an unknown notification")
	}
}

func TestMarkAllNotificationsAsRead(t *testing.T) {
	service := NewNotificationService()
	ctx := context.Background()
	userID := uuid.New()
	for _, title := range []string{"First", "Second"} {
		if _, err := service.SendNotification(ctx, userID, db.NotificationChannelInApp, "EVENT", title, title, nil); err != nil {
			t.Fatalf("SendNotification returned error: %v", err)
		}
	}
	if err := service.MarkAllAsRead(ctx, userID); err != nil {
		t.Fatalf("MarkAllAsRead returned error: %v", err)
	}
	unread, err := service.ListNotifications(ctx, userID, true)
	if err != nil {
		t.Fatalf("ListNotifications returned error: %v", err)
	}
	if len(unread) != 0 {
		t.Fatalf("unread notifications = %+v, want none", unread)
	}
}
