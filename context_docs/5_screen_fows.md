# 5_screen_flows.md — Screen Flows & Architecture Mapping (Updated)

> **Purpose:** Defines the exact Next.js routing, Shadcn UI components, and Go/Python architecture links for every screen in the Buyer's High platform, including adaptive navigation, gadget detail media galleries with inspection video, post gadget screen flow, and sandbox verification.

---

## Global Navigation Bar Architecture (`components/Navbar.tsx`)

The navigation bar dynamically adapts to user authentication and role state:

* **Height & Styling:** Fixed `h-16`, sticky top with `bg-[#f8fafc]/90 backdrop-blur-md border-b border-[#e2e8f0]`.
* **Guest / Browsing State:**
  - Marketplace search bar & public discovery links (Marketplace, Fee Calculator, Trust & Safety).
  - "Log in" Ghost Button (`/login`).
  - "Sign up" Primary Fill Button (`#0f172a`, `/signup`).
* **Authenticated / Trader State:**
  - **"Sell Gadget"** Primary CTA Button (links directly to `/seller/post-gadget`).
  - **Notification Bell** with active green unread indicator dot (`#22c55e`) and flyout popover for recent escrow alerts.
  - **User Avatar Dropdown** with initials fallback, user email, and SmileID KYC Status Pill (`KYC Verified` / `In Manual Review` / `KYC Pending`).
  - Quick action links: Trades Dashboard (`/seller/dashboard`), Post New Gadget (`/seller/post-gadget`), Wallet & Payouts (`/seller/wallet`), Active Escrow Room (`/escrow/BH-ORD-9421`), Identity Verification (`/verify-identity`), and Logout.

---

## Phase 1: Public & Onboarding Flow

### 1. Landing Page & Marketing
* **Route:** `app/(marketing)/page.tsx`
* **Components:** `Navbar` (Adaptive), `HeroSection`, `ValuePropGrid`, `EscrowExplainerCard`, `Footer`.
* **Architecture Link:** Static marketing layout showcasing zero-chargeback escrow protection and 48-hour inspection guarantee.

### 2. Public Marketplace (Browse & Read-Only Catalog)
* **Route:** `app/(public)/marketplace/page.tsx`
* **Components:** `SearchInput`, `FilterSidebar` (Category, Price slider, Condition grade, Battery health, Location), `GadgetListingCard` (Masonry grid), `TrustBadge` (SmileID NIN Verified).
* **Architecture Link:** Calls Go backend for public gadget feed; media assets served from Python media service / S3 storage.

### 3. Single Gadget Detail & Inspection Screen
* **Route:** `app/(public)/gadget/[id]/page.tsx`
* **Components:**
  - **Scrollable High-Res Photo Gallery:** Multi-angle photo carousel with previous/next chevron navigation, photo counter badge (`Photo 1 of 5`), condition grade chip, and horizontal scrollable thumbnail strip with active border ring.
  - **Hardware Inspection Video Segment:** Dedicated 30-second inspection video player with play/pause, timecode indicator, audio toggle, and verified checkpoints (IMEI on screen match, full screen touch digitizer sweep, TrueTone/camera check, battery health OEM audit, clean iCloud log-out).
  - **Hardware Diagnostic Report Card:** 6-checkpoint diagnostic grid (Battery health % capacity, Storage & RAM, Activation Lock status, FaceID sensor status, Display TrueTone, Carrier unlock).
  - **Escrow Purchase Desk:** Live price in NGN, 2.5% Buyer escrow fee breakdown, tracked courier shipping fee, "Lock Funds & Start Escrow Trade" CTA.
  - **SmileID Verified Seller Card:** NIN verified badge, rating (4.95★), total escrow trades, completion rate.
  - **Sticky Mobile Bottom Bar:** Fixed on `<lg` viewports with 44px touch targets.
* **Architecture Link:** Pre-escrow verification presentation; locking funds transitions trade to `PENDING_PAYMENT` via Paystack gateway.

### 4. Trust & Safety Hub
* **Route:** `app/(marketing)/trust-and-safety/page.tsx`
* **Components:** `TrustPillarsGrid`, `PolicyAccordion`, `EscrowTimelineExplainer`.
* **Architecture Link:** Static marketing page detailing the 48-hour inspection SLA and anti-fraud safeguards.

### 5. Authentication Entry (Sign Up / Login / Reset)
* **Route:** `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
* **Components:** `AuthForm`, `FormHelperText`.
* **Architecture Link:** Authenticates with Go Auth API, sets persistent session token, immediately updates Navbar to authenticated state.

### 6. Identity Verification (SmileID KYC)
* **Route:** `app/(onboarding)/verify-identity/page.tsx`
* **Components:** `CameraCaptureWidget`, `DocumentUploadArea`, `StatusToast`.
* **Architecture Link:** Streams biometric selfie and NIN document to Python microservice; provides 503 fallback to `MANUAL_REVIEW_REQUIRED` without UI blockage.

---

## Phase 2: The Buyer Journey & Payments

### 1. Fee Calculator & Legal Pages
* **Route:** `app/(marketing)/pricing/page.tsx` and `app/(marketing)/legal/[slug]/page.tsx`
* **Components:** `EscrowFeeCalculator` (Tiered 5%, 2.5%, 1.5% live calculation), `LegalSidebarNav`, `ProseTypography`.
* **Architecture Link:** Client-side mathematical formula synced with platform P&L rules.

### 2. Escrow Payment & Checkout
* **Route:** `app/(protected)/checkout/[order_id]/page.tsx`
* **Components:** `PaymentMethodSelector` (Card, Bank Transfer, USSD), `OrderSummaryCard`, `SecureCheckoutButton`.
* **Architecture Link:** Go backend generates Paystack checkout session; webhook confirms funding and transitions order to `FUNDS_HELD`.

---

## Phase 3: The Seller Journey

### 1. Seller Dashboard
* **Route:** `app/(protected)/seller/dashboard/page.tsx`
* **Components:** `SellerStatsOverview` (Active Escrows, Total Sales, Escrow Balance), `RecentOrdersTable`, `QuickActionBanner` (Post New Gadget navigation).
* **Architecture Link:** Aggregates metrics from Postgres `orders` and `listings` tables.

### 2. Wallet & Payouts
* **Route:** `app/(protected)/seller/wallet/page.tsx`
* **Components:** `BalanceCard` (Available vs. Locked in Escrow), `BankAccList`, `WithdrawButton`, `TransactionHistoryLedger`.
* **Architecture Link:** Go backend interacts with payment gateway for automated bulk payouts upon inspection approval.

### 3. Post a Gadget / Sell Device Flow (New Screen Flow)
* **Route:** `app/(protected)/seller/post-gadget/page.tsx`
* **Components:**
  - **Multi-Step Wizard Stepper:** Step 1 (Device Specs), Step 2 (Diagnostics), Step 3 (Media & Video), Step 4 (Pricing & Logistics).
  - **Device Identification:** Category selector (Phone, Laptop, Tablet, Watch, Console), Brand, Model, Storage, RAM, Color, Encrypted IMEI/Serial Number input.
  - **Diagnostic Condition Audit:** Condition grade (Mint, Good, Fair), Battery health percentage slider (70-100%), Screen condition selector, FaceID/Biometrics toggle, iCloud/MDM clean confirmation, Carrier lock status.
  - **Visual Evidence & Mandatory Video Uploader:** Multi-photo dropzone with angle previews, and dedicated 30-Second Hardware Inspection Video uploader with live video preview player and 4 diagnostic checkpoint requirements.
  - **Automated Escrow Pricing Engine:** 100% net seller asking price payout (0% seller fee), automated 2.5% buyer escrow fee calculation, tracked courier fee, total buyer escrow deposit.
  - **Logistics Waypoint Selector:** State/Region, Pickup address, Courier partner selector (GIG Logistics, DHL Express, Kwik Delivery).
  - **Live Marketplace Preview Card:** Real-time synchronized gadget preview card.
  - **Publish Milestone Modal:** Confirmation dialog with generated listing ID and quick links to view listing or open dashboard.
* **Architecture Link:** Ingests listing to Postgres `listings` table and uploads media/video to Python FastAPI media service.

---

## Phase 4: Active Transactions (Escrow Room & Sandbox)

### 1. The Active Escrow Room
* **Route:** `app/(protected)/escrow/[order_id]/page.tsx`
* **Components:** `EscrowTrackerStepper`, `EscrowStatusBar` (48-hour inspection countdown), `OrderSummaryCard`, `P2PChatRoom`, `DisputeActionGroup`.
* **Architecture Link:** Real-time state machine updates via WebSockets; 48-hour cron automatically executes `COMPLETED` if no dispute is opened.

### 2. Design System Sandbox & Component Registry
* **Route:** `app/sandbox/page.tsx`
* **Components:** `EvidenceUploadSandboxDemo` (Interactive trigger button that cleanly opens and closes the dispute modal instead of blocking the screen on initial load), component gallery, button tokens, typography badges.
* **Architecture Link:** Isolated component harness for testing design tokens and modal dialogs.

---

## Phase 5: Global User Systems

### 1. Dashboard Settings & Profile
* **Route:** `app/(protected)/settings/profile/page.tsx`
* **Components:** `ProfileDetailsForm`, `SecuritySettings` (2FA), `KYCStatusBadge`.

### 2. Global Notifications Center
* **Route:** `app/(protected)/notifications/page.tsx` and Navbar flyout.
* **Components:** `NotificationFeed`, `UnreadBadge`.

### 3. Customer Support (Live Chat)
* **Route:** Global `LiveChatWidget` floating action button (FAB).
* **Components:** `SupportChatWindow`, `FAQQuickLinks`.

---

## Phase 6: Admin & Moderation

### 1. The Arbitration Room (Case Review)
* **Route:** `app/(admin)/disputes/[case_id]/page.tsx`
* **Components:** `ReadonlyChatTranscript`, `EvidenceViewer` (Split-pane layout), `VerdictActionGroup` (Release to Seller / Refund Buyer).
* **Architecture Link:** Reads immutable chat history and media; writes final financial settlement to append-only `escrow_transactions` ledger.

### 2. Dispute Triage & Pending KYC
* **Route:** `app/(admin)/dashboard/page.tsx`
* **Components:** `DisputeQueueDataTable` (sorted by value and 48h SLA countdown), `KYCManualApprovalQueue`.
