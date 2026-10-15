-- ============================================================================
-- BUYER'S HIGH: PEER-TO-PEER GADGET ESCROW PLATFORM
-- PostgreSQL Database Initialization Schema (Phase 1)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'manual_review_required');
CREATE TYPE payment_method_type AS ENUM ('card', 'bank', 'wallet');
CREATE TYPE device_condition AS ENUM ('mint', 'good', 'fair', 'salvage');
CREATE TYPE listing_status AS ENUM ('draft', 'live', 'locked', 'sold', 'removed');
CREATE TYPE fulfillment_method AS ENUM ('shipping', 'local_handoff');
CREATE TYPE escrow_state AS ENUM ('created', 'pending_payment', 'funds_held', 'in_transit', 'inspection_period', 'completed', 'disputed', 'refunded', 'released_manual');
CREATE TYPE payment_method AS ENUM ('card', 'bank', 'crypto', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'funded', 'failed', 'paid_out');
CREATE TYPE escrow_tx_type AS ENUM ('deposit', 'platform_fee', 'gateway_fee', 'release', 'refund', 'split');
CREATE TYPE dispute_status AS ENUM ('open', 'evidence_collection', 'seller_review', 'admin_mediation', 'resolved', 'appealed');
CREATE TYPE mediation_outcome AS ENUM ('refund_buyer', 'release_to_seller', 'split');
CREATE TYPE evidence_type AS ENUM ('photo', 'video', 'tracking');
CREATE TYPE appeal_status AS ENUM ('pending', 'upheld', 'overturned');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email');
CREATE TYPE report_target_type AS ENUM ('user', 'listing');
CREATE TYPE report_status AS ENUM ('open', 'reviewed', 'dismissed');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Auto-update trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'buyer',
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    avatar_url TEXT,
    kyc_status kyc_status NOT NULL DEFAULT 'pending',
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    rating_count INT NOT NULL DEFAULT 0,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE user_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_ref VARCHAR(255) NOT NULL,
    status kyc_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    masked_details VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    provider_authorization_code TEXT,
    bank_name VARCHAR(100),
    account_number_last4 VARCHAR(4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    sku VARCHAR(150) NOT NULL,
    condition device_condition NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    escrow_terms TEXT NOT NULL,
    description TEXT,
    status listing_status NOT NULL DEFAULT 'draft',
    fulfillment_method fulfillment_method NOT NULL DEFAULT 'shipping',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE listing_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL DEFAULT 'photo',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    fulfillment_method fulfillment_method NOT NULL,
    escrow_state escrow_state NOT NULL DEFAULT 'created',
    item_price NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gateway_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    inspection_expires_at TIMESTAMPTZ,
    shipping_label_url TEXT,
    tracking_number VARCHAR(100),
    tracking_carrier VARCHAR(100),
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    gateway_reference VARCHAR(255),
    paystack_access_code VARCHAR(255),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Immutable Append-Only Escrow Ledger
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    transaction_type escrow_tx_type NOT NULL,
    from_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    to_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    balance_after NUMERIC(12, 2) NOT NULL,
    reference VARCHAR(255) NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION enforce_escrow_ledger_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Escrow ledger is append-only. Modification or deletion of records is forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_escrow_immutability
BEFORE UPDATE OR DELETE ON escrow_transactions
FOR EACH ROW EXECUTE PROCEDURE enforce_escrow_ledger_immutability();

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    parent_dispute_id UUID REFERENCES disputes(id) ON DELETE SET NULL,
    issue_type VARCHAR(100) NOT NULL,
    status dispute_status NOT NULL DEFAULT 'open',
    mediation_outcome mediation_outcome,
    assigned_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    evidence_deadline TIMESTAMPTZ,
    seller_response_deadline TIMESTAMPTZ,
    return_deadline TIMESTAMPTZ,
    return_tracking_number VARCHAR(100),
    return_label_url TEXT,
    mediator_notes TEXT,
    seller_response_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    evidence_type evidence_type NOT NULL,
    media_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE RESTRICT,
    appellant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    status appeal_status NOT NULL DEFAULT 'pending',
    arbitrator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    arbitrator_verdict_notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL DEFAULT 'in_app',
    trigger_event VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_type report_target_type NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'open',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    payment_method_id UUID REFERENCES saved_payment_methods(id) ON DELETE SET NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    reference VARCHAR(255) NOT NULL UNIQUE,
    gateway_transfer_code VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
