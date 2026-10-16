# UI Context Spec 3: Premium States (Loading, Empty, Error)

## 1. Executive Purpose
To maintain a high-trust, premium fintech feel, the application must never show a blank white screen, a broken layout, or a raw database error. Every async list or data-fetching component must strictly implement three states: Loading Skeletons, Actionable Empty States, and Graceful Error States.

---

## 2. The Loading State (Skeletons)
*   **Primitive:** Use the Shadcn `<Skeleton>` component (`bg-muted animate-pulse`).
*   **Rule of Parity:** A loading skeleton must exactly match the height, padding, and grid structure of the component it represents to achieve zero Cumulative Layout Shift (CLS).
*   **Implementation Targets:**
    *   **GadgetListing Skeleton:** A 4:3 `bg-muted` block for the image, followed by a `h-6 w-3/4` block for the title, and a `h-5 w-1/4` block for the price. Render exactly 6 of these in a grid during initial page load.
    *   **Admin Data Table Skeleton:** Do not skeleton the entire table as one block. Skeleton the header row, and render 5 individual row skeletons (`h-12 w-full`) below it.
    *   **Escrow Tracker Skeleton:** A muted horizontal bar with 4 muted circles, representing the stepper UI before the exact state is fetched.

---

## 3. The Empty State (Actionable & Educational)
*   **Purpose:** An empty state should never be a dead end. It must explain *why* it is empty and provide a Primary Call to Action (CTA) to resolve it.
*   **Visual Structure:** 
    1. Centered layout (`flex flex-col items-center justify-center text-center p-8`).
    2. A subtle, monochrome Lucide icon (e.g., `PackageX`, `ShieldAlert`, `SearchX`) sized at `w-12 h-12 text-muted-foreground`.
    3. A bold Heading (`font-heading text-lg`).
    4. A descriptive subtext (`text-muted-foreground text-sm max-w-md`).
    5. A `<Button>` (Primary or Secondary).
*   **Standardized Scenarios:**
    *   *Empty Active Escrows:* "No Active Trades." -> "You have no gadgets in escrow. Start buying or selling securely." -> CTA: "Browse Marketplace"
    *   *Empty Dispute Queue (Admin):* "All Clear." -> "There are no active disputes requiring moderation at this time." -> CTA: None (or "Refresh Queue").
    *   *Empty Search Results:* "No Gadgets Found." -> "We couldn't find any listings for '[Search Term]'." -> CTA: "Clear Filters".

---

## 4. The Error State (Graceful Degradation)
*   **Purpose:** When the Go backend fails, times out, or returns a 500, the UI must catch it gracefully without crashing the Next.js client router.
*   **Visual Structure:**
    *   Uses a Shadcn `<Card>` with a subtle red border (`border-destructive/50`).
    *   Icon: `AlertCircle` (`text-destructive`).
    *   Standardized Message: "We couldn't load this information." (Do not expose raw JSON or Go panic stack traces to the user).
    *   Action: A ghost or secondary `<Button>` labeled "Try Again" that triggers a router refresh or data re-fetch.
*   **Next.js Integration:** Must utilize Next.js `error.tsx` boundaries for full page crashes, but use localized component error states for partial failures (e.g., if the Escrow Widget fails to load, the rest of the Order Page should still render).