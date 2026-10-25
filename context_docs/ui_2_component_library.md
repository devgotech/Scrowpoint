# UI Context Spec 2: Component Inventory & Rules

## 1. Executive Purpose
This document defines the strict architectural rules for the Scrowpoint UI components, derived from the 56-screen Figma inventory. Components follow a Mobile-First baseline (360-428px), adapting through tablet (768px) and desktop (1280px+). The AI must build these in complete isolation using Shadcn primitives and Tailwind v4, strictly adhering to the 8-point grid.

---

## 2. Tier 1: Foundation (Build First)
*These block the majority of screens and are used globally.*

*   **Buttons & Inputs:** Handled via Shadcn. Inputs must support an `aria-invalid` error state triggering a destructive border.
*   **Status Badges / Pills:** Green (`#22c55e`) is reserved **strictly** for trust/escrow states (e.g., "Funds Held", "Verified"). All other statuses (Draft, Pending) use a neutral or amber palette.
*   **Avatar:** Must include an initials fallback mechanism for users without an uploaded profile photo.
*   **Card (3 Primary Variants):**
    1.  `ListingCard`: Masonry-ready. Displays gadget image (4:3 or square), condition badge, title, and NGN price.
    2.  `OrderCard`: Transaction summary. Includes the Escrow Status Badge and buyer/seller interaction prompts.
    3.  `DisputeCaseCard`: Admin/User view. Highlights dispute reason, locked value, and active countdown timer.
*   **Empty / Loading / Error States:** Every list screen must support these three variations. *(Detailed further in ui_3_premium_states.md)*.

---

## 3. Tier 2: Flow-Specific (Reused 3+ Times)
*Core interactive modules for onboarding, listing, and moderation.*

*   **Stepper / Multi-step Progress:** Used for "List a Gadget" (4 steps) and "Onboarding + KYC" (3-4 steps).
*   **File / Media Uploader:** Must support camera capture on mobile and drag-and-drop on desktop. Used for listing photos, KYC docs, and dispute evidence.
*   **Countdown Timer:** A high-visibility dynamic component for the 48-hour inspection window, dispute response SLA, and KYC review pending states.
*   **Search Bar + Filter Chips:** Horizontal scrolling chips on mobile, wrapping flex container on desktop. Used in Browse Listings.
*   **Responsive Modals (Crucial Rule):**
    *   **Mobile (<768px):** Use a full-screen `BottomSheet` (Shadcn Drawer).
    *   **Desktop (>768px):** Use a centered `Dialog` modal.
    *   *Use Cases:* Cancel order, submit dispute, delete listing.
*   **Toast / Snackbar:** Required for every asynchronous action (e.g., "Tracking ID updated").

---

## 4. Tier 3: Domain-Specific (Core Trust Elements)
*Used infrequently but carry the highest business value.*

*   **Escrow Status Widget:** The most important component. Visually dictates "funds held" vs "funds released" using strict color enforcement.
*   **Timeline / Activity Log:** Vertical stepper tracking the lifecycle of an order (Shipment Tracking) or a Dispute Status timeline.
*   **Payment Method Selector:** Selectable UI cards featuring icons for Card, Bank, Crypto, and Wallet, revealing conditional forms based on the selection.
*   **Evidence Viewer (Admin):** Desktop-first design. Displays buyer photos, seller video, and tracking logs side-by-side for rapid moderation.
*   **Admin Data Table:** 
    *   **Desktop:** Dense raw table for maximum data visibility.
    *   **Mobile:** Does not use responsive CSS tricks. Conditionally renders a distinct `StackedCard` fallback component for lightweight glance-and-approve moderation.

---

## 5. Strict AI Generation Directives (Master Prompt Rules)
1.  **Component Swapping over Resizing:** For complex responsive elements (like Navigation and Admin Tables), build dedicated Mobile and Desktop components and conditionally render them at the `md:` (768px) breakpoint. Do not attempt complex CSS grid morphing.
2.  **No Arbitrary Padding:** You must use Tailwind's 4-point scale (e.g., `p-4` = 16px, `gap-6` = 24px).
3.  **Color Enforcement:** Never hallucinate colors. Trust states use `trust` (#22c55e), Warnings use `warning` (#ecc94b), Defaults use `primary` (Slate 900) or `muted`.