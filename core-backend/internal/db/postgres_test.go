package db

import (
	"context"
	"encoding/json"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestPostgresServiceStateRoundTrip(t *testing.T) {
	runtimeURL := os.Getenv("POSTGRES_TEST_DATABASE_URL")
	if runtimeURL == "" {
		t.Skip("POSTGRES_TEST_DATABASE_URL is not configured")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	store, err := OpenPostgres(ctx, runtimeURL, os.Getenv("POSTGRES_TEST_DATABASE_URL_UNPOOLED"))
	if err != nil {
		t.Fatal("open PostgreSQL persistence test database:", err)
	}
	defer store.Close()

	key := "test-" + uuid.NewString()
	defer store.Pool.ExecContext(context.Background(), "DELETE FROM application_service_state WHERE service_name = $1", key)

	expected := []byte(`{"recordId":"persisted"}`)
	if err := store.SaveServiceStates(ctx, map[string][]byte{key: expected}); err != nil {
		t.Fatal(err)
	}
	states, err := store.LoadServiceStates(ctx)
	if err != nil {
		t.Fatal(err)
	}
	var got, want map[string]string
	if err := json.Unmarshal(states[key], &got); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(expected, &want); err != nil {
		t.Fatal(err)
	}
	if got["recordId"] != want["recordId"] {
		t.Fatalf("state round trip = %s, want %s", states[key], expected)
	}
}
