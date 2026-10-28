# Scrowpoint — Local Development & Cloud Deployment Guide

This guide explains how to run the full **Scrowpoint P2P Hardware Escrow** stack locally in VS Code and how to deploy it to **Render** once pushed to GitHub.

---

## 1. Prerequisites for Local Development

1. **Visual Studio Code**: [Download VS Code](https://code.visualstudio.com/)
2. **Node.js** (v18 or v20+ with npm): `node --version`
3. **Go** (v1.22 or later): `go version`
4. **Python** (v3.10 or v3.11+): `python3 --version`
5. **PostgreSQL** (v16+) or **Docker Desktop** (recommended for 1-command database & microservice startup).

---

## 2. Recommended VS Code Extensions

Open VS Code, press `Ctrl+P` (or `Cmd+P` on macOS), and run `ext install`:
- **REST Client** (`humao.rest-client`) — Execute any API test in `scrowpoint_workspace/api_tests.http` with one click.
- **Go** (`golang.Go`) — Go language server and debugger.
- **Python** (`ms-python.python`) — FastAPI virtual environment and linting.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

---

## 3. Running Locally (Frontend + Go Backend + Python Media + Postgres)

### Step A: Start Backend Services (`scrowpoint_workspace/`)
Using Docker Compose:
```bash
cd scrowpoint_workspace
docker compose up -d
```
Or run natively in separate terminals:
```bash
# Terminal 1: Core Go Backend (Port 8080)
cd scrowpoint_workspace/core-backend
cp .env.example .env
go mod tidy
go run cmd/api/main.go

# Terminal 2: Python Media Microservice (Port 8000)
cd scrowpoint_workspace/media-service
cp .env.example .env
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step B: Start Frontend Application (Port 3000)
From the workspace root:
```bash
cd frontend-web
npm ci
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 4. Deploying to Render (1-Click Blueprint or Manual Setup)

### Option A: 1-Click Render Blueprint (`render.yaml`) — Recommended
Both the repository root (`/render.yaml`) and `/scrowpoint_workspace/render.yaml` contain pre-configured Render Blueprints:
1. Push your code to a GitHub repository.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
3. Select your GitHub repository.
4. Render will automatically read `render.yaml` and create:
   - **`scrowpoint-core-backend`**: Docker web service built from `scrowpoint_workspace/core-backend/Dockerfile` with `/health` probe.
   - **`scrowpoint-media-service`**: Docker web service built from `scrowpoint_workspace/media-service/Dockerfile` with dynamic `$PORT` binding.
   - **`scrowpoint-db`**: Managed PostgreSQL 16 database automatically wired to `scrowpoint-core-backend` via `DATABASE_URL`.
5. Enter your Paystack (`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`) and SmileID (`SMILE_ID_PARTNER_ID`, `SMILE_ID_API_KEY`) keys when prompted (or use test keys) and click **Apply**.

### Option B: Deploy the Next.js Frontend on Render
Deploy `frontend-web` as a Node web service; Next.js must run as a server because its `/api/*` rewrites forward requests to the Go backend.
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `frontend-web`, the **Build Command** to `npm ci && npm run build`, and the **Start Command** to `npm run start`.
4. Add `CORE_BACKEND_URL` with the URL of the deployed `scrowpoint-core-backend` service.
5. Click **Create Web Service**.
