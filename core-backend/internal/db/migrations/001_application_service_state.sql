-- Service-owned application records are stored as JSONB snapshots while the
-- existing relational schema is reconciled with the current Go model.
CREATE TABLE IF NOT EXISTS application_service_state (
    service_name TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
