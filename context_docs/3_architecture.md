# 3_architecture.md: System Architecture & Data Models

## 1. System Boundaries
*   **Core Backend (Go):** Handles escrow state machine transitions, PostgreSQL database routing, payment gateway integrations, and API endpoints.
*   **Media Microservice (Python):** Handles file uploads (KYC docs, gadget photos, dispute evidence), compresses images, strips EXIF data, and returns secure object storage URLs.

## 2. Core PostgreSQL Database Schema
All database tables must use `uuid` for primary keys and include `created_at`, `updated_at`, and `deleted_at` timestamps.

*   `users`: ID, role, email, password_hash, name, phone, location, avatar_url, kyc_status, rating_avg, rating_count, is_suspended.
*   `user_verifications`: ID, user_id, provider_ref, status, rejection_reason, metadata.
*   `saved_payment_methods`: ID, user_id, type, masked_details, is_default, provider_auth_code, bank_name, account_number_last4.
*   `listings`: ID, seller_id, category, brand, model, sku, condition, price, currency, escrow_terms, status, fulfillment_method.
*   `listing_media`: ID, listing_id, media_url, media_type, sort_order.
*   `orders`: ID, listing_id, buyer_id, fulfillment_method, escrow_state, item_price, platform_fee, gateway_fee, total_amount, currency, inspection_expires_at, tracking_number.
*   `payments`: ID, order_id, amount, currency, method, status, gateway_reference, paystack_access_code, paid_at.
*   `escrow_transactions`: Immutable append-only ledger recording ID, order_id, amount, currency, transaction_type, from_user_id, to_user_id, balance_after, reference, notes, created_at.
*   `disputes`: ID, order_id, parent_dispute_id (sub-cases), issue_type, status, mediation_outcome, assigned_admin_id, deadlines.
*   `dispute_evidence`: ID, dispute_id, submitted_by, evidence_type, media_url, description.
*   `appeals`: ID, dispute_id, appellant_id, reason, status, arbitrator_id, arbitrator_verdict_notes.
*   `notifications`: ID, user_id, channel, trigger_event, title, message, data, is_read.
*   `reports`: ID, reported_by, target_type, target_id, reason, status, reviewed_by, resolution_notes.
*   `payouts`: ID, seller_id, amount, currency, payment_method_id, status, reference, gateway_transfer_code.
