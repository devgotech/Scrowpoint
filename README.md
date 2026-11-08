# SCROWPOINT WORKSPACE — Backend, Media Microservice & Deployment Guide

This workspace (`scrowpoint_workspace/`) contains the core backend infrastructure, database schema, media processing microservice, API test suite, and cloud deployment blueprints for **Scrowpoint** — Nigeria's custodial P2P gadget escrow platform.

---

## 1. Workspace Contents

```text
scrowpoint_workspace/
├── core-backend/                     # Go 1.22 Core Escrow & State Machine API (:8080)
│   ├── cmd/api/main.go               # HTTP Server & 48-Hour SLA Background Worker entrypoint
│   ├── internal/
│   │   ├── api/router.go             # REST Router & JWT / Role Middleware
│   │   ├── api/handlers/             # Auth (Email, OAuth, OTP, Reset), KYC, Listings, Escrow, Disputes
│   │   ├── db/init.sql               # PostgreSQL 16 Schema & Append-Only Escrow Ledger
│   │   ├── db/models.go              # Domain Models, SKU Generator & Tiered Fee Math
│   │   └── services/                 # Business Logic & State Machine Guards
│   ├── Dockerfile                    # Multi-stage Alpine production build
│   └── .env.example                  # Environment variable template
├── media-service/                    # Python 3.11 FastAPI Media Microservice (:8000)
│   ├── app/main.py                   # EXIF metadata stripping & WebP compression pipeline
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Render-ready container binding dynamic ${PORT:-8000}
│   └── .env.example                  # Media storage environment template
├── context_docs/                     # Product, Domain Logic, UI System & API Specifications
├── api_tests.http                    # One-click VS Code REST Client test suite
├── docker-compose.yml                # Local Postgres 16 + Go Backend + Python Media stack
├── render.yaml                       # Render Cloud Blueprint for 1-click backend deployment
├── CHANGELOG.md                      # Complete platform changelog
└── LOCAL_SETUP_GUIDE.md              # Step-by-step VS Code & Docker instructions
```

---

## 2. How the Application Works (End-to-End Flow)

### A. Authentication & Identity (`POST /api/auth/*` & `POST /api/kyc/verify`)
1. **Third-Party OAuth (`POST /api/auth/oauth/google` & `POST /api/auth/oauth/apple`)**:
   - Accepts `{ email, name, providerUid }`, automatically creates or links the user account, stamps `emailVerifiedAt`, and returns a 7-day Bearer JWT.
2. **Manual Registration & Email Verification**:
   - Registration requires acceptance of the Terms of Service and Privacy Policy.
   - `POST /api/auth/verify-email` verifies the account's emailed code. Configure SMTP for delivery; local development can use the development-only code preview.
3. **Password Recovery Flow**:
   - `POST /api/auth/request-password-reset` sends a time-limited, high-entropy reset link.
   - `POST /api/auth/reset-password` validates the link token, updates the password hash, and invalidates the token.
4. **Smile ID Biometric KYC**:
   - The backend creates a sandbox or production Smile ID Web SDK session. A signed Smile ID webhook is authoritative for verification status, so the callback must be publicly reachable over HTTPS.

### B. Hardware Listing & Custodial Escrow (`POST /api/listings` & `POST /api/escrow/fund`)
1. **Seller Posts Hardware (`/seller/post-gadget`)**:
   - Seller submits device specs, IMEI/Serial, 6-point hardware diagnostics, photos, and a 30-second inspection video.
   - Seller receives **100% of their asking price (0% seller fee)**.
2. **Buyer Locks Funds in Paystack Custody (`/checkout/[order_id]`)**:
   - Tiered buyer escrow fee is calculated (`5.0%` up to ₦150k, `2.5%` up to ₦750k, `1.5%` above ₦750k; `0%` for Founding Cohort 01).
   - Paystack webhook transitions the order to `FUNDS_HELD`.

### C. 48-Hour Inspection SLA & Friendly Trade Chat (`/escrow/[order_id]`)
1. Seller dispatches the device via tracked courier (`IN_TRANSIT`).
2. Upon delivery, the state transitions to `INSPECTION_PERIOD` and starts a **48-Hour Countdown Timer**.
3. Buyer and Seller coordinate in the **Friendly Trade Chat & Live Milestones** feed with quick-reply chips and unboxing photo uploads.
4. Buyer clicks **Approve & Release Funds** (or the 48-hour cron completes automatically) to settle funds to the seller's wallet (`COMPLETED`), or clicks **Report Issue** to freeze funds (`DISPUTED`) for Admin Arbitration (`/admin/disputes/[case_id]`).

---

## 3. Deploying to Render

1. Push the repository to GitHub (no `.git` directory is pre-created so you can initialize your own repo cleanly).
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Connect your GitHub repository:
   - Use the root `/render.yaml` to deploy the **Go Backend (`scrowpoint-core-backend`) + Python Media Service (`scrowpoint-media-service`) + PostgreSQL 16 (`scrowpoint-db`)** together. Deploy the Next.js frontend in `frontend-web` as a Node web service and set `CORE_BACKEND_URL` to the Go backend service URL.
   - Or use `scrowpoint_workspace/render.yaml` if deploying the backend microservices from a dedicated backend repository.
4. Configure backend environment variables in Render:
   - Set `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` to test or live keys. Configure Paystack to send `charge.success` events to `/api/payments/paystack/webhook`.
   - Set `SMILE_ID_PARTNER_ID`, `SMILE_ID_API_KEY`, and `SMILE_ID_ENVIRONMENT`. Set `SMILE_ID_CALLBACK_URL` to the public HTTPS address ending in `/api/kyc/smile/webhook`.
   - Set `FRONTEND_BASE_URL` to the deployed frontend origin. Configure SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL`) to deliver verification and password-reset emails.
5. Use sandbox/test credentials in development and staging. Switch to production credentials and the live Smile ID environment only when ready for real transactions and identity checks.

### Local Sandbox Testing

1. Copy `core-backend/.env.example` to `core-backend/.env` and add your own Paystack and Smile ID sandbox credentials. Never commit `.env` files.
2. Start PostgreSQL and the Go API, then run the frontend with its backend API URL pointing at the local API.
3. Paystack can initialize test transactions locally; configure Paystack to deliver signed webhooks to a publicly reachable API URL.
4. Smile ID requires `SMILE_ID_CALLBACK_URL` to be publicly reachable over HTTPS. Use a secure development tunnel and point the callback to `/api/kyc/smile/webhook`.
5. Without SMTP, local development returns a verification code or reset-token preview from the API. Configure SMTP to test actual email delivery. Do not enable development previews in staging or production.
