# Buyer's High: Frontend Execution Roadmap

## Phase 1: Environment & API Bridge (ui_1, ui_5)
*The foundational layer. Do not build UI components until data fetching and styling variables are locked.*

- [x] Next.js App Router setup (Tailwind v4, Geist/Roboto fonts configured).
- [x] Implement global `formatCurrency` utility (converting kobo/cents to ₦ NGN).
- [x] Set up HTTP-only JWT interception in `middleware.ts`.
- [x] Create `AuthContext.tsx` to distribute user state (ID, Role, KYC tier) globally.
- [x] Configure AWS S3 Presigned URL fetcher for the `FileUploader` component.
- [x] Set up global `error.tsx` (Generic Error State) and `loading.tsx` (Global Skeleton).

## Phase 2: Global Shell Assembly (ui_1)
*The unmoving architecture of the application.*

- [x] Build `Navbar.tsx` (Desktop top-nav with Guest and Authenticated states).
- [x] Build `MobileBottomNav.tsx` (Fixed bottom routing for screens <768px).
- [x] Build `EscrowStatusBar.tsx` (The micro-trust banner for active trades).
- [x] Build `Footer.tsx` (4-column desktop, stacked accordion on mobile).
- [x] Assemble `app/layout.tsx` (Inject Navbar, Bottom Nav, and Footer around the `<main>` viewport).

## Phase 3: Tier 1 Atoms (ui_2, ui_3)
*Shadcn primitive installations and strict brand enforcement.*

- [x] Install base Shadcn primitives (Button, Input, Card, Badge).
- [x] Install interactive Shadcn primitives (Dialog, Drawer, Skeleton, Toast, DropdownMenu).
- [x] Customize `<Badge>` with specific enums (`trust: #22c55e`, `warning: #ecc94b`).
- [x] Build `EmptyState.tsx` wrapper (Icon, bold header, muted subtext, CTA button).
- [x] Build `Avatar` component with initials fallback logic.

## Phase 4: Tier 2 & 3 Domain Components (ui_2, ui_3)
*The sandbox generation phase. Build these in isolation using AI Studio.*

**Marketplace & Discovery**
- [x] Build `GadgetListingCard.tsx` (Masonry-ready, 4:3 image, price, condition badge).
- [x] Build `GadgetListingSkeleton.tsx` (Matching 4:3 placeholder grid).
- [x] Build `SearchBar.tsx` (With horizontal scrolling filter chips).

**Escrow & Trust**
- [x] Build `EscrowTrackerStepper.tsx` (Dynamic horizontal/vertical timeline).
- [x] Build `EscrowFeeReceipt.tsx` (Itemized breakdown of gadget price + tiered platform fees).
- [x] Build `ActionRequiredCard.tsx` (Dynamic alert box for pending actions).
- [x] Build `PaymentMethodSelector.tsx` (Card/Bank/Crypto selection grid).

**Moderation & Evidence**
- [x] Build `FileUploader.tsx` (Camera capture on mobile, drag-drop on desktop).
- [x] Build `AdminDisputeRow.tsx` (Desktop raw table row).
- [x] Build `StackedCard.tsx` (Mobile fallback for admin data tables).
- [x] Build `EvidenceViewer.tsx` (Side-by-side desktop layout for dispute review).

## Phase 5: View Assembly (ui_4)
*Stitching the components into Next.js routes.*

**Public / Pre-Auth**
- [ ] Assemble `/(marketing)/page.tsx` (Landing page with value props).
- [ ] Assemble `/pricing` (Escrow fee calculator).
- [ ] Assemble `/login` and `/signup` auth entry points.

**Marketplace & Dashboard**
- [ ] Assemble `/marketplace` (Inject SearchBar and GadgetListingCard grid).
- [ ] Assemble `/dashboard` (Unified overview of sales/purchases).
- [ ] Assemble `/dashboard/listings/create` (Multi-step gadget creation wizard).
- [ ] Assemble `/kyc/document` (Inject FileUploader for ID and selfie).

**The Escrow Room**
- [ ] Assemble `/escrow/[id]/review` (Inject EscrowFeeReceipt).
- [ ] Assemble `/escrow/[id]/status` (Inject EscrowTrackerStepper and ActionRequiredCard).
- [ ] Assemble `/escrow/[id]/chat` (P2P negotiation interface).

**Dispute Resolution Engine**
- [ ] Assemble `/dispute/[id]/report` (Issue type selection form).
- [ ] Assemble `/dispute/[id]/evidence` (Inject FileUploader).
- [ ] Assemble `/dispute/[id]/status` (Dispute timeline and seller response).

**Admin Dashboard**
- [ ] Assemble `/admin/disputes` (Inject AdminDisputeRow and StackedCard).
- [ ] Assemble `/admin/disputes/[id]` (Inject EvidenceViewer and verdict actions).