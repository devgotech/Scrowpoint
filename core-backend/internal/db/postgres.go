package db

import (
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

//go:embed migrations/001_application_service_state.sql
var applicationStateMigration string

type Postgres struct {
	Pool *sql.DB
}

func OpenPostgres(ctx context.Context, runtimeURL, migrationURL string) (*Postgres, error) {
	if runtimeURL == "" {
		return nil, errors.New("DATABASE_URL is required for PostgreSQL runtime")
	}

	pool, err := sql.Open("pgx", runtimeURL)
	if err != nil {
		return nil, errors.New("open PostgreSQL runtime pool")
	}
	pool.SetMaxOpenConns(10)
	pool.SetMaxIdleConns(2)
	pool.SetConnMaxLifetime(30 * time.Minute)
	pool.SetConnMaxIdleTime(5 * time.Minute)

	if err := pool.PingContext(ctx); err != nil {
		_ = pool.Close()
		return nil, errors.New("connect to PostgreSQL runtime using DATABASE_URL")
	}

	migrationPool := pool
	closeMigrationPool := false
	if migrationURL != "" && migrationURL != runtimeURL {
		migrationPool, err = sql.Open("pgx", migrationURL)
		if err != nil {
			_ = pool.Close()
			return nil, errors.New("open PostgreSQL migration connection")
		}
		closeMigrationPool = true
		if err := migrationPool.PingContext(ctx); err != nil {
			_ = migrationPool.Close()
			_ = pool.Close()
			return nil, errors.New("connect to PostgreSQL migration endpoint using DATABASE_URL_UNPOOLED")
		}
	}
	if closeMigrationPool {
		defer migrationPool.Close()
	}

	if _, err := migrationPool.ExecContext(ctx, applicationStateMigration); err != nil {
		_ = pool.Close()
		return nil, errors.New("apply PostgreSQL application-state migration")
	}

	return &Postgres{Pool: pool}, nil
}

func (p *Postgres) LoadServiceStates(ctx context.Context) (map[string][]byte, error) {
	rows, err := p.Pool.QueryContext(ctx, `
		SELECT service_name, payload
		FROM application_service_state`)
	if err != nil {
		return nil, errors.New("load PostgreSQL application state")
	}
	defer rows.Close()

	states := make(map[string][]byte)
	for rows.Next() {
		var name string
		var payload []byte
		if err := rows.Scan(&name, &payload); err != nil {
			return nil, errors.New("read PostgreSQL application state")
		}
		states[name] = payload
	}
	if err := rows.Err(); err != nil {
		return nil, errors.New("iterate PostgreSQL application state")
	}
	return states, nil
}

func (p *Postgres) SaveServiceStates(ctx context.Context, states map[string][]byte) error {
	tx, err := p.Pool.BeginTx(ctx, nil)
	if err != nil {
		return errors.New("begin PostgreSQL application-state transaction")
	}
	defer tx.Rollback()

	for name, payload := range states {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO application_service_state (service_name, payload, updated_at)
			VALUES ($1, $2::jsonb, NOW())
			ON CONFLICT (service_name) DO UPDATE
			SET payload = EXCLUDED.payload, updated_at = NOW()`, name, string(payload)); err != nil {
			return fmt.Errorf("save PostgreSQL state for %s", name)
		}
	}
	if err := tx.Commit(); err != nil {
		return errors.New("commit PostgreSQL application-state transaction")
	}
	return nil
}

func (p *Postgres) Close() error {
	return p.Pool.Close()
}
