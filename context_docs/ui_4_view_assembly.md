# UI Context Spec 4: View Assembly & Screen Inventory

## 1. Executive Purpose
This document defines the complete Next.js route structure and screen inventory for the Scrowpoint platform. It merges the core user journeys (Buyer, Seller, Admin, Escrow, Disputes)[cite: 6, 7, 8] with essential external, legal, and edge-case screens required for a compliant P2P financial product.

---

## 2. Pre-Launch & Marketing Routes (`/`)
*These screens establish trust and capture initial users before full platform availability.*

*   **`/(marketing)/waitlist`**: Pre-launch email capture, value proposition, and early-access referral mechanics.
*   **`/(marketing)/page.tsx`**: The main Landing Page[cite: 6]. Highlights the 8-point trust system, tiered fee structure, and live marketplace preview.
*   **`/(marketing)/pricing`**: Fee calculator and transparent breakdown of escrow charges.
*   **`/(legal)/*`**: Static trust documents. Must include: Terms of Service, Privacy Policy, Escrow Agreement/Rules, and Prohibited Items Policy.

---

## 3. Auth & Identity Routes (`/(auth)`)
*Strictly gated flows to ensure user accountability.*

*   **`/login` & `/signup`**: Email and OAuth (Google/Apple) entry points[cite: 6].
*   **`/verify-email` & `/reset-password`**: Standard credential recovery[cite: 6].
*   **`/kyc/profile`**: Complete profile (name, phone, location)[cite: 6].
*   **`/kyc/document`**: Government ID upload and selfie capture (24-48h pending review state)[cite: 6].

---

## 4. Public Marketplace Routes (`/marketplace`)
*Accessible to guests[cite: 6], but transactions require authentication.*

*   **`/marketplace`**: Browse & Search listings with horizontal filter chips[cite: 6]. Uses `GadgetListingCard`.
*   **`/marketplace/[id]`**: Listing Detail (public/read-only or authenticated)[cite: 6].
*   **`/user/[username]`**: Public Seller Profile. Displays trust score, completed trades, and active listings.

---

## 5. User Dashboard & Order Management (`/dashboard`)
*The authenticated hub for managing active trades and listings.*

*   **`/dashboard`**: Unified overview. Shows immediate Action Required cards, recent buyer orders, and seller sales.
*   **`/dashboard/listings/create`**: Multi-step wizard (Category -> Details -> Media Upload -> Escrow Terms)[cite: 7].
*   **`/dashboard/listings/manage`**: My Listings view (edit/remove)[cite: 7] and Preview Listing[cite: 7].
*   **`/dashboard/wallet`**: Payment Methods Management and Payout/Earnings configuration (linking bank/Paystack for withdrawals)[cite: 7].
*   **`/dashboard/settings/*`**: Notifications, Security, KYC Status, and Help/Support[cite: 8].

---

## 6. The Escrow Room (`/escrow/[transaction_id]`)
*The high-stakes transaction environment where the `EscrowTrackerStepper` lives.*

*   **`/escrow/[id]/review`**: Review Escrow Terms and Fee Receipt[cite: 6].
*   **`/escrow/[id]/fund`**: Fund Escrow (Card/Bank/Crypto/Wallet)[cite: 6], with Payment Retry state[cite: 6].
*   **`/escrow/[id]/status`**: The core Escrow Status (Buyer & Seller view)[cite: 7]. Displays Order Confirmation, Shipment Tracking, and the 48-hour Inspection Period countdown[cite: 6].
*   **`/escrow/[id]/receipt`**: Transaction Complete / Final Digital Receipt[cite: 6].
*   **`/escrow/[id]/chat`**: P2P Negotiation Interface. Direct messaging between buyer and seller strictly within the context of an active or pending transaction.

---

## 7. Dispute Resolution Engine (`/dispute/[transaction_id]`)
*Highly structured forms to prevent emotional unstructured data.*

*   **`/dispute/[id]/report`**: Report Issue (strict type selection, e.g., "Not as described", "Damaged")[cite: 7].
*   **`/dispute/[id]/evidence`**: Submit Evidence (Photo/Video/Tracking dropzone)[cite: 7].
*   **`/dispute/[id]/status`**: Dispute Status & Timeline[cite: 7] and Seller Response interface[cite: 7].
*   **`/dispute/[id]/return`**: Return Shipping Label generation and Ship Return / Confirm Receipt tracking[cite: 7].
*   **`/dispute/[id]/resolution`**: Mediation Outcome and Appeal Submission[cite: 7].

---

## 8. Admin & Moderation Routes (`/admin`)
*Desktop-first layouts for rapid triage and fund allocation.*

*   **`/admin`**: Admin Dashboard (platform health, escrow volume, active disputes)[cite: 8].
*   **`/admin/disputes`**: Dispute Case Queue (Data Table)[cite: 8].
*   **`/admin/disputes/[id]`**: Case Review (side-by-side Evidence Viewer)[cite: 8], Verdict/Resolution Decision[cite: 8], and Arbitration/Appeal Review[cite: 8].
*   **`/admin/reports`**: User & Listing Reports (moderation queue)[cite: 8].

---

## 9. System States (`/error`, `/loading`)
*Global boundaries to catch and handle UI failures gracefully.*

*   **`404 Not Found`**: Custom branded missing page[cite: 8].
*   **`error.tsx`**: Generic Error State with "Try Again" recovery[cite: 8].
*   **`loading.tsx`**: Global Loading State (Skeletons)[cite: 8].
*   **`Offline / Connectivity State`**: Banner warning users of network drops[cite: 8] to prevent double-payments.

---

## 10. External Touchpoints (Transactional Email Templates)
*React Email / Tailwind templates used by the Python microservice to alert users.*

1.  **Welcome & Verify Email**: Sent upon registration.
2.  **Action Required: Escrow Funded**: Instructs the seller to ship the gadget.
3.  **Action Required: Item Delivered**: Starts the buyer's 48-hour inspection countdown.
4.  **Warning: Inspection Expiring**: Sent at the 12-hour mark before auto-release.
5.  **Dispute Opened**: Halts the timeline and requests evidence.
6.  **Funds Released / Escrow Closed**: Final receipt sent to both parties.
7.  **KYC Status Update**: Notification of document approval or rejection.