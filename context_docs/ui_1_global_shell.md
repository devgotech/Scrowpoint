# UI Context Spec 1: Global Shell & Application Frame

## 1. Executive Purpose
The Global Shell defines the permanent visual and structural framework of the Scrowpoint web application. It houses the unmoving elements—Navigation, Escrow Context Bar, Main Content Viewport, and Footer—ensuring a unified, high-trust experience across public marketing pages, trading marketplaces, and secure escrow dashboards.

## 2. Shell Architecture (`layout.tsx`)
*   **Top Bar (Sticky):** Brand Logo, Global Search, Notification Bell, User Avatar.
*   **Escrow Trust Bar (Conditional):** Mounts directly below the top bar during active trades.
*   **Main Viewport:** `<main className="flex-1 container py-6 pb-24 md:pb-6">` (Extra bottom padding on mobile to clear the bottom nav).
*   **Desktop Footer:** 4-column trust and legal links.
*   **Mobile Bottom Navigation (Fixed):** Core routing actions locked to the bottom of the screen on devices under 768px.

## 3. Dynamic Navigation Rules

### A. Guest Access vs. Gated Actions
*   **Open Access:** Unauthenticated users have full access to browse gadget listings, view pricing, and use the fee calculator.
*   **Gated Actions:** Clicking "Start Escrow", "Buy Now", or attempting to message a seller triggers an auth-modal or redirects to `/login`.

### B. Mobile "Webapp" Navigation (Bottom Bar)
To mimic a native app experience on mobile devices, the desktop header links disappear and are replaced by a fixed bottom navigation bar (`fixed bottom-0 z-50 w-full bg-background/90 backdrop-blur-md border-t`).
*   **Icons:** Home (Marketplace), Search, Escrows (Active Trades), Profile.
*   **Top Bar on Mobile:** Reduced to simply the Scrowpoint Logo (left) and Notification Bell/Hamburger Menu for secondary links (right).

### C. Conditional Escrow Trust Bar & Alerts
*   **Trigger:** Appears dynamically below the top navbar ONLY when an active order is in state `PENDING_PAYMENT`, `FUNDS_HELD`, `IN_TRANSIT`, or `INSPECTION_PERIOD`.
*   **Visual Rules:** Slate 900 background, white text.
*   **Critical Alerts:** If an inspection window drops below 2 hours, the Trust Bar pulses with the `warning` (#ecc94b) color. This state also triggers an automated push/in-app notification to the buyer to approve the item or raise a dispute before auto-release.

## 4. Layout Rules & Responsive Constraints
*   **Maximum Layout Width:** `1200px` (`max-w-7xl` centered with `mx-auto`).
*   **Side Gutters:** Minimum `16px` (`px-4`) on mobile, `32px` (`px-8`) on desktop.
*   **Z-Index Layering Hierarchy:**
    *   Base Content: `z-0`
    *   Sticky Header & Bottom Nav: `z-40`
    *   Mobile Drawers / Dropdowns: `z-50`
    *   Modal Overlays: `z-100`