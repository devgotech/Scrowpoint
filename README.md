# Buyer's High — Peer-to-Peer Gadget Escrow Platform

> Living workspace README. Update this file when you add services, change ports, or change how the stack is run.

**Buyer's High** is a peer-to-peer marketplace where buyers and sellers trade used gadgets under escrow protection. Funds are held until delivery and a 48-hour inspection window complete (or until an admin resolves a dispute).

---

## Workspace layout

```
buyers_high_workspace/
├── README.md                 ← you are here (run the whole app)
├── LOCAL_SETUP_GUIDE.md      ← VS Code / REST Client focused setup
├── docker-compose.yml        ← Postgres + Go API + Media service
├── api_tests.http            ← End-to-end API test suite (REST Client)
├── context_docs/             ← Product, domain, architecture specs
├── core-backend/             ← Go escrow API (port 8080)
└── media-service/            ← Python FastAPI media pipeline (port 8000)
```

| Package | Role | Docs |
|---------|------|------|
| [`core-backend/`](./core-backend/README.md) | Auth, KYC, listings, orders, Paystack, escrow, disputes, admin | [Swagger](http://localhost:8080/docs) |
| [`media-service/`](./media-service/README.md) | Image upload, EXIF strip, WebP, partitioned storage | [Swagger](http://localhost:8000/docs) |
| [`context_docs/`](./context_docs/README.md) | Requirements, domain rules, architecture, API contract | Spec index |

---

## What has been built (current status)

### Core capabilities

| Area | Status | Notes |
|------|--------|--------|
| Auth (register / login / JWT / sessions) | ✅ | Roles: `buyer`, `seller`, `admin` |
| User profiles & public profiles | ✅ | Avatar, saved listings hooks |
| SmileID KYC + manual admin review | ✅ | Sims: `sim_approved`, `sim_rejected`, `sim_timeout_error` |
| Listings (draft → media → publish) | ✅ | SKU generation, conditions mint/good/fair/salvage |
| Tiered fee quote (5% / 2.5% / 1.5%) | ✅ | Buyer-paid; seller gets 100% of ask |
| Orders + escrow state machine | ✅ | `created → pending_payment → funds_held → …` |
| Paystack initialize + webhook | ✅ | Local mock signature: `dev_mock_signature` |
| Escrow ledger (append-only) | ✅ | Deposit, platform fee, release, refund types |
| 48h inspection auto-release worker | ✅ | Background cron in Go process |
| Disputes + sub-cases + appeals | ✅ | Parent/child dispute hierarchy |
| Admin summary, verdicts, KYC review | ✅ | Seeded admin: `admin@buyershigh.com` |
| Media microservice | ✅ | Listing / KYC / dispute partitions |
| Interactive Swagger (both services) | ✅ | `/docs` on 8080 and 8000 |
| PostgreSQL schema (`init.sql`) | ✅ | Compose mounts it on first boot |
| Frontend UI | ⏳ | Specs in `context_docs/4_ui_system.md` — not in this repo yet |

> **Runtime note:** The Go API currently uses **in-memory stores** for local MVP flows, with the full PostgreSQL schema ready in `init.sql` for persistence wiring. Treat DB connectivity as the next hardening step when you promote beyond local demos.

---

## Quick start

### Prerequisites

- Go **1.22+**
- Python **3.10+**
- Docker Desktop (recommended for Postgres), **or** local PostgreSQL 14+
- (Optional) VS Code + [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

### Option A — Docker Compose (full stack)

From the workspace root:

```bash
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Core API | http://localhost:8080 |
| Core Swagger | http://localhost:8080/docs |
| Media API | http://localhost:8000 |
| Media Swagger | http://localhost:8000/docs |
| Postgres | `localhost:5432` / db `buyers_high` |

Stop:

```bash
docker compose down
```

### Option B — Native (multi-terminal)

**1. Postgres only**

```bash
docker compose up -d postgres
```

**2. Core backend**

```bash
cd core-backend
cp .env.example .env   # if needed
go mod tidy
go run cmd/api/main.go
```

**3. Media service**

```bash
cd media-service
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # if needed
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

More detail: [`LOCAL_SETUP_GUIDE.md`](./LOCAL_SETUP_GUIDE.md) and per-service READMEs.

---

## Happy-path test flow

Use either **Swagger** (`/docs`) or **`api_tests.http`**.

Suggested order:

1. `GET /health` (both services)
2. Register / login **buyer** and **seller**
3. Seller: draft listing → attach media URL → publish
4. Buyer: fee quote → create order
5. Buyer: initialize Paystack → simulate webhook (`charge.success`)
6. Inspect escrow status (`funds_held`)
7. Confirm receipt → 48h inspection (or wait for worker)
8. Optional: open dispute / admin KYC review

Seeded admin (created on Go API boot):

- Email: `admin@buyershigh.com`
- Password: `AdminPassword123!`

---

## Escrow lifecycle (summary)

```
CREATED
  → PENDING_PAYMENT     (Paystack initialize)
  → FUNDS_HELD          (webhook charge.success / FundEscrow)
  → IN_TRANSIT
  → INSPECTION_PERIOD   (confirm receipt; 48h timer)
  → COMPLETED           (buyer accept OR auto-release)
     ↘ DISPUTED → REFUNDED | RELEASED_MANUAL
```

Illegal jumps (e.g. `created → funds_held`) are rejected by `ValidateStateTransition`.

Fee tiers (buyer checkout):

| Band | Rate |
|------|------|
| ≤ ₦150,000 | 5% |
| ₦150,001 – ₦750,000 | 2.5% |
| above ₦750,000 | 1.5% |

---

## Environment overview

| Variable area | Where | Purpose |
|---------------|-------|---------|
| `PORT`, `JWT_*`, `PAYSTACK_*`, `SMILE_ID_*` | `core-backend/.env` | API + integrations |
| `DATABASE_URL` / `DB_*` | `core-backend/.env` | Postgres |
| `MEDIA_SERVICE_URL` | `core-backend/.env` | Points at media service |
| `STORAGE_BACKEND`, `CDN_BASE_URL`, limits | `media-service/.env` | Upload pipeline |

Never commit real secrets. Templates live in each service’s `.env.example`.

---

## Documentation map

| Doc | Audience |
|-----|----------|
| This README | Anyone running the monorepo |
| [`LOCAL_SETUP_GUIDE.md`](./LOCAL_SETUP_GUIDE.md) | Local VS Code workflow |
| [`core-backend/README.md`](./core-backend/README.md) | Go API developers |
| [`media-service/README.md`](./media-service/README.md) | Media / Python developers |
| [`context_docs/README.md`](./context_docs/README.md) | Product & architecture |
| `api_tests.http` | Manual E2E regression |
| `core-backend/internal/api/docs/openapi.yaml` | Keep in sync when routes change |

---

## Extending this project (open to change)

When you change the system, update the matching docs in the same PR/commit:

1. **New HTTP route** → OpenAPI (`openapi.yaml` + regenerate `openapi.json`) + `api_tests.http` example + this status table if it is a major feature.
2. **New domain rule** → `context_docs/2_domain_logic.md` (and PRD if product-facing).
3. **New table / column** → `core-backend/internal/db/init.sql` + `models.go` + architecture doc.
4. **New media partition or upload type** → media-service README + FastAPI route docs.
5. **Port / compose change** → root README + `LOCAL_SETUP_GUIDE.md` + `docker-compose.yml`.

Suggested changelog stub (append at the bottom of this file as you ship):

```md
### Changelog
- YYYY-MM-DD: <what changed and why>
```

---

## Changelog

- 2026-10-15: Initial monorepo README documenting MVP backend + media stack, Swagger, escrow flow, and run instructions.
