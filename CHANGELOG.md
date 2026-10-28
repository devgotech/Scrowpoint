# Changelog — Scrowpoint Workspace (`scrowpoint_workspace`)

All notable changes to the **Scrowpoint** full-stack workspace (`core-backend`, `media-service`, frontend screens, and Render deployment configuration) are documented here.

---

## [2.4.0] — 2026-10-27
### Complete Authentication Flow, Interactive Gadget Vector Spotlight & Render Blueprints

- **Third-Party OAuth Integration (`POST /api/auth/oauth/{provider}`)**:
  - Connected `google` (default in `core-backend/internal/api/handlers/auth_handler.go`) and `apple` OAuth providers to the Login and Register screens with an iframe-safe account chooser and automatic `emailVerifiedAt` verification.
- **Manual Registration + 6-Digit Email OTP + SmileID KYC Handoff**:
  - Wired `POST /api/auth/register`, `POST /api/auth/verify-email` (with 6-digit OTP boxes and Demo Code `492810`), and `POST /api/auth/resend-verification` into a 3-stage registration flow leading into SmileID KYC (`/verify-identity`).
- **3-Stage Forgot & Reset Password Screen (`/forgot-password`)**:
  - Wired `POST /api/auth/request-password-reset` and `POST /api/auth/reset-password` (with 6-digit recovery OTP boxes, Demo Code `842915`, live 4-checkpoint password strength validation, and session revocation confirmation).
- **Interactive Circular Cursor-Spotlight Gadget Vector Pattern (`GadgetVectorPattern.tsx`)**:
  - Added a repeating monoline hardware vector background (iPhones, MacBooks, Console Controllers, iPads, Cameras, Headphones, Smartwatches, Earbuds) at `5%` resting opacity with a `220px` cursor-tracking circular spotlight (`24%–28%` ink opacity and `30%` Vermilion `#FF5A25` accents).
- **Navigation Bar Refinement (`Navbar.tsx`)**:
  - Removed the redundant global search input so marketplace filtering remains consolidated in the dedicated Marketplace `SearchBar`.
- **Render Cloud Deployment Readiness**:
  - Added `/render.yaml` and `/scrowpoint_workspace/render.yaml` Blueprints, updated `media-service/Dockerfile` for dynamic `${PORT:-8000}` binding on Render, and rebranded all container/env templates to `scrowpoint`.

---

## [2.3.0] — 2026-10-27
### Design Variation 7 Overhaul, Kobo Math & Friendly Escrow Room Chat

- **Friendly Trade Chat & Live Milestones (`/escrow/[order_id]`)**:
  - Upgraded the Escrow Room communication ledger with buyer/seller avatars, online response status, plain-English milestone explanations, 1-tap quick reply chips, and unboxing photo uploads.
- **Full-App Design Variation 7 Compliance**:
  - Unified all screens under Warm Editorial Paper (`#F8F7F4`), Deep Carbon Ink (`#111113`), Vermilion Orange (`#FF5A25`), `0px` architectural cards, `999px` pill primary buttons, and integer kobo math in the Post Gadget wizard (`/seller/post-gadget`).

---

## [2.2.0] — 2026-10-27
### Founding Waitlist & Minimalist Hero Architecture

- **Streamlined Waitlist Hero (`/waitlist`)**:
  - Introduced the compact 4-metric value bar (`0% FEE`, `₦125K`, `INSTANT`, `TIER 01`), interactive Cohort Priority Pass generator, and the **Unprotected P2P Channels vs. Scrowpoint Custodial Protocol** comparison widget.
