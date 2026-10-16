# AI Studio Execution Guide: Buyer's High Frontend

## Phase 1: Environment & API Bridge
*These establish the rules for how data moves through your app.*

- **Manual Action:** Ensure you have completed the Next.js setup and your `layout.tsx` and `globals.css` are configured (Completed).
- **Generation 1 (Currency Utils):**
  > **CURRENT TASK:** Generate a utility file `lib/currency.ts` containing a `formatCurrency` function that takes an integer in kobo/cents (e.g., 150000) and returns a formatted Nigerian Naira string (e.g., "₦1,500").
- **Generation 2 (Middleware):**
  > **CURRENT TASK:** Generate `middleware.ts` for Next.js App Router. It must check for an HTTP-only JWT cookie. Protect the `/dashboard`, `/escrow`, and `/admin` routes. Redirect unauthenticated users to `/login`.
- **Generation 3 (Auth Context):**
  > **CURRENT TASK:** Generate a React Context provider `AuthContext.tsx` (Client Component) that stores the user's ID, Role, and KYC tier. Include a custom hook `useAuth()`.
- **Generation 4 (S3 Config for fileuploader)**
- >**CURRENT TASK**: Generate a frontend client utility file lib/s3.ts. It must export an async function uploadToPresignedUrl(file: File, referenceId: string). The function must perform two steps:
 1. Make a POST request to our Go backend (e.g., /api/media/presign) sending the file name, file type, and reference ID (like a Dispute ID) to receive an AWS S3 presigned URL.
  2. Execute a direct PUT request to that received presigned URL containing the actual file object.

  3. Include proper TypeScript types, error handling (throwing standard errors if the upload fails), and return the final uploaded file URL or S3 Key. Do not use AWS SDKs; use native fetch()

- **Generation 4 (System States):**
  > **CURRENT TASK:** Generate a global `error.tsx` (must include a "Try Again" recovery button) and a global `loading.tsx` (using Shadcn skeletons) for the root `app` directory.

---

## Phase 2: Global Shell Assembly
*Building the unmoving frame (ui_1).*

- **Generation 5 (Navbar):**
  > **CURRENT TASK:** Generate `Navbar.tsx`. It must be sticky, `h-16`, and backdrop-blurred. Include a guest state (login/signup buttons) and an authenticated state (avatar dropdown, notification bell).
- **Generation 6 (Mobile Nav):**
  > **CURRENT TASK:** Generate `MobileBottomNav.tsx`. It must be fixed to the bottom, visible only on screens `<768px`, and include icons for Home, Search, Escrows, and Profile.
- **Generation 7 (Trust Bar):**
  > **CURRENT TASK:** Generate `EscrowStatusBar.tsx`. This is the micro-summary trust bar from ui_1. It should display a mocked Order ID, a status badge using the `trust` or `warning` color enum, and a countdown timer.
- **Generation 8 (Footer):**
  > **CURRENT TASK:** Generate `Footer.tsx`. Build a 4-column layout for desktop that collapses into a stacked accordion on mobile. Include trust metrics and legal links.
- **Manual Action (Layout Assembly):** In Cursor, open `app/layout.tsx`. Import the Navbar, MobileBottomNav, EscrowStatusBar, and Footer, and wrap them around the `{children}` prop.

---

## Phase 3: Tier 1 Atoms
*Locking in the Shadcn primitives.*

- **Manual Action (Installs):** Run these commands in your Cursor terminal:
  `npx shadcn@latest add dialog drawer skeleton toast dropdown-menu`
- **Manual Action (Badge):** Ensure `badge.tsx` has the `trust` and `warning` variants (Completed).
- **Generation 9 (Empty State):**
  > **CURRENT TASK:** Generate `EmptyState.tsx`. It must accept props for `title`, `description`, `icon` (Lucide), and an optional `actionLabel`. Design it centered, using muted text for the description.
- **Generation 10 (Avatar):**
  > **CURRENT TASK:** Generate a custom `UserAvatar.tsx` wrapper around the Shadcn Avatar primitive. It must accept a name string and automatically calculate and display the user's initials if the image fails to load.

---

## Phase 4: Tier 2 & 3 Domain Components (The Sandbox)
*Generate these one by one, test them in `app/sandbox/page.tsx`, and fix any layout issues before moving on.*

- **Generation 11 (Listing Card):**
  > **CURRENT TASK:** Generate `GadgetListingCard.tsx` and its loading skeleton `GadgetListingSkeleton.tsx`. The image must be 4:3. Include a condition badge, title, and formatted NGN price.
- **Generation 12 (Search Bar):**
  > **CURRENT TASK:** Generate `SearchBar.tsx`. Include a text input and a horizontally scrolling row of filter chips (e.g., "iPhone", "Samsung", "Mint Condition") below it.
- **Generation 13 (Tracker Stepper):**
  > **CURRENT TASK:** Generate `EscrowTrackerStepper.tsx`. This is the macro-view timeline. Map the steps strictly to the enums in ui_2. Ensure `FUNDS_HELD` uses the `trust` color and pulses. Make it horizontal on desktop, vertical on mobile.
- **Generation 14 (Receipt):**
  > **CURRENT TASK:** Generate `EscrowFeeReceipt.tsx`. Display an itemized list: Item Price, Escrow Fee, Shipping, and Total Locked. Use `font-mono` for all numbers.
- **Generation 15 (Action Alert):**
  > **CURRENT TASK:** Generate `ActionRequiredCard.tsx` using the Shadcn Alert primitive. Include a primary button to unblock the transaction (e.g., "Approve Item").
- **Generation 16 (Payment Selector):**
  > **CURRENT TASK:** Generate `PaymentMethodSelector.tsx`. Build a grid of selectable cards for Card, Bank, Crypto, and Wallet. Highlight the selected state with a primary border.
- **Generation 17 (Uploader):**
  > **CURRENT TASK:** Generate `FileUploader.tsx`. It must support drag-and-drop on desktop and camera capture on mobile. Include a loading state for when a presigned URL is being fetched.
- **Generation 18 (Admin Row & Mobile Fallback):**
  > **CURRENT TASK:** Generate `AdminDisputeRow.tsx` (a standard table row) AND `StackedCard.tsx` (the mobile fallback). Use Tailwind classes to show the row on `md:table-row` and the card on `md:hidden`.
- **Generation 19 (Evidence Viewer):**
  > **CURRENT TASK:** Generate `EvidenceViewer.tsx`. Build a desktop-first, side-by-side layout comparing buyer and seller evidence with action buttons for resolution.

---

## Phase 5: View Assembly
*Putting the Lego blocks together.*

- **Manual Action:** For simple pages (like the Landing Page or basic Dashboard), do not use AI Studio. Create the folder structure in Next.js (e.g., `app/marketplace/page.tsx`), type `<GadgetListingCard />`, and let Cursor autocomplete and import it.
- **Generation 20 (Complex Form Example - Listing Wizard):**
  > **CURRENT TASK:** Generate the View Assembly for `/dashboard/listings/create`. Do not build the small components from scratch; assume `FileUploader`, `Input`, and `Button` exist. Build the multi-step wizard logic (Category -> Details -> Media -> Escrow Terms) managing state between the steps.