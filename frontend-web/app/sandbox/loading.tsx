import { Skeleton } from "@/components/ui/skeleton";

/**
 * Root Loading State for Buyer's High App Router.
 *
 * Requirements (UI Context Spec 3, §2 & UI Context Spec 4, §9):
 * - Rule of Parity: Exactly mirrors the global shell, active escrow bar, and 6-card listing grid to eliminate Cumulative Layout Shift (CLS).
 * - Adheres strictly to the 4-point spacing scale (p-4, p-6, gap-6, max-w-7xl).
 * - Masonry-ready gadget cards: 4:3 image skeleton block, title block, condition pill, and NGN price block.
 * - Desktop/Mobile responsive layout with zero arbitrary values.
 */
export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* 1. Global Shell Navigation Skeleton */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Desktop Search Bar Skeleton */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Right Action Icons (Notifications + Avatar) */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* 2. Escrow Micro-Summary Bar Skeleton (Conditional State Parity) */}
        <div className="border-t border-border/60 bg-muted/30 px-4 py-2 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </header>

      {/* 3. Main Viewport Content Skeleton */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {/* Filter Chips Skeleton Bar */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="hidden sm:block h-9 w-32 rounded-md" />
        </div>

        {/* 6-Card Gadget Listing Grid Skeleton (Exact Spec Target §2) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              {/* 4:3 Aspect Ratio Image Skeleton */}
              <div className="relative aspect-4/3 w-full bg-muted">
                <Skeleton className="h-full w-full rounded-none" />
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>

              {/* Card Meta Body */}
              <div className="flex flex-1 flex-col p-5 space-y-3">
                {/* Title Skeleton: h-6 w-3/4 */}
                <Skeleton className="h-6 w-3/4" />

                {/* Subtitle / Spec Skeleton */}
                <Skeleton className="h-4 w-1/2" />

                <div className="pt-2 flex items-center justify-between border-t border-border/60">
                  {/* Price Skeleton: h-5 w-1/4 */}
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden px-4">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
    </div>
  );
}
