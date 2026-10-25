# Scrowpoint - Local Development & VS Code Execution Guide

This document explains how to set up, run, and test the full Scrowpoint Escrow platform on your local machine using Visual Studio Code.

---

## 1. Prerequisites to Install on Your Computer

1. **Visual Studio Code**: [Download VS Code](https://code.visualstudio.com/)
2. **Go** (v1.20 or later): `go version`
3. **Python** (v3.10 or later): `python3 --version`
4. **Node.js** (v18 or v20+ with npm): `node --version`
5. **PostgreSQL** (v14+) or **Docker Desktop** (recommended for instant database setup).

---

## 2. Recommended VS Code Extensions

Open VS Code, press `Ctrl+P` (or `Cmd+P` on Mac), and type `ext install` followed by:

- **REST Client** (`humao.rest-client`) -> Allows you to run requests in `api_tests.http` with one click!
- **Go** (`golang.Go`) -> Syntax highlighting and autocomplete for Go.
- **Python** (`ms-python.python`) -> Virtual environment detection and linting.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

---



## 3. Environment Configuration (`.env`)

Both `.env` and `.env.example` templates are provided in your workspace.

### Core Backend (`core-backend/.env`):

```env
# ============================================================================
# Scrowpoint CORE BACKEND ENVIRONMENT CONFIGURATION
# ============================================================================

PORT=8080
ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/scrowpoint?sslmode=disable
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=scrowpoint

# Authentication & Security
JWT_SECRET=super-secret-scrowpoint-production-jwt-key-2026
JWT_EXPIRATION_HOURS=168

# Payment Gateway (Paystack)
PAYSTACK_SECRET_KEY=sk_test_scrowpoint_mock_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_scrowpoint_mock_paystack_public_key

# KYC Provider (SmileID)
SMILE_ID_PARTNER_ID=smile_partner_test_8492
SMILE_ID_API_KEY=smile_api_key_test_9482018492

# Microservices
MEDIA_SERVICE_URL=http://localhost:8000
```



### Media Microservice (`media-service/.env`):

```env
# ============================================================================
# Scrowpoint MEDIA MICROSERVICE (PYTHON / FASTAPI)
# ============================================================================

PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Storage Provider Configuration (use 'local' for testing, 's3' for production)
STORAGE_BACKEND=local
LOCAL_STORAGE_DIR=/tmp/scrowpoint_media
CDN_BASE_URL=http://localhost:8000/media

# AWS S3 / Cloud Object Storage (activated when STORAGE_BACKEND=s3)
AWS_ACCESS_KEY_ID=test_aws_key
AWS_SECRET_ACCESS_KEY=test_aws_secret
AWS_REGION=eu-west-1
S3_BUCKET_NAME=scrowpoint-secure-media-vault

# Image Processing Limits & EXIF Privacy Stripping
MAX_UPLOAD_SIZE_MB=15
MAX_IMAGE_DIMENSION_PX=2048
COMPRESSION_QUALITY=85
STRIP_EXIF=true
```

---



## 4. Running the Stack

You can run everything via **Docker Compose** or run each service natively in VS Code.

### Option A: Using Docker Compose (Single Command)

Run from `scrowpoint_workspace/`:

```bash
# Start all 3 services (Postgres, Go backend, Python media service):
docker compose up -d

# Or start ONLY Postgres in Docker while developing Go & Python in VS Code:
docker compose up -d postgres
```



### Option B: Running Natively in VS Code (Multi-Terminal)



#### Terminal 1: Database (PostgreSQL)

If using Docker for just Postgres:

```bash
docker compose up -d postgres
```

If using native local PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE scrowpoint;
\c scrowpoint;
\i core-backend/internal/db/init.sql;
```



#### Terminal 2: Core Go Backend (Port 8080)

```bash
cd core-backend
go mod tidy
go run cmd/api/main.go
```

- Listens on `http://localhost:8080`.
- Starts the API routers for Auth, KYC, Listings, Orders, Escrow, Disputes, and the 48-hour background inspection worker.
- **Interactive Swagger docs:** `http://localhost:8080/docs`
- Raw OpenAPI spec: `http://localhost:8080/openapi.yaml`



#### Terminal 3: Python Media Microservice (Port 8000)

```bash
cd media-service

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# On Windows (Command Prompt / PowerShell):
python -m venv venv
venv\Scripts\activate

# Install dependencies and start server
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Interactive Swagger docs will be live at `http://localhost:8000/docs`.

---



## 5. Interactive API Docs (Swagger)

Both services expose the same style of browser-based docs:

| Service | Swagger UI | OpenAPI Spec |
|---------|------------|--------------|
| Core Backend (Go) | http://localhost:8080/docs | http://localhost:8080/openapi.json |
| Media Service (Python) | http://localhost:8000/docs | http://localhost:8000/openapi.json |

### Using Core Backend Swagger

1. Start the Go backend (`go run cmd/api/main.go`).
2. Open `http://localhost:8080/docs` in your browser.
3. Call **`POST /api/auth/login`** (or register) via **Try it out**.
4. Copy `data.token` from the response.
5. Click **Authorize**, paste the token (Swagger adds the `Bearer` prefix), then exercise any protected endpoint.

The OpenAPI file lives at `core-backend/internal/api/docs/openapi.yaml` — update it when you add or change routes so the docs stay accurate.

---



## 6. Testing API Endpoints in VS Code

1. Open `scrowpoint_workspace/api_tests.http` in VS Code.
2. Click the **"Send Request"** button right above any request to execute it.
3. The requests test the complete lifecycle:
  - **Auth & KYC**: Registration, Login, Token capture, SmileID verification.
  - **Media Upload**: Uploads test photo, strips EXIF metadata, converts to WebP.
  - **Listing**: Create draft -> Publish live.
  - **Fee Quote**: Verifies the tiered 5% / 2.5% / 1.5% fee calculation.
  - **Order & Paystack**: Order creation, Paystack payment webhook simulation (updates state to `ESCROW_FUNDED`).
  - **Courier & 48h Window**: Dispatches courier, records delivery, starts 48-hour inspection countdown.
  - **Disputes**: Submits evidence and handles parent-child dispute escalation.

