import { Skeleton } from "@/components/ui/skeleton";

/**
 * Root Loading State for Scrowpoint App Router.
 *
 * Requirements (4_ui_system.md & UI Context Spec 3, §2 & UI Context Spec 4, §9):
 * - Rule of Parity: Exactly mirrors the global shell, active escrow bar, and 6-card listing grid to eliminate Cumulative Layout Shift (CLS).
 * - Exact Corner Radius: 8px on cards (rounded-[8px]), 4px on controls/chips (rounded-[4px]), rounded-full ONLY on trust badge placeholders.
 * - Desktop/Mobile responsive layout with 1280px container max width.
 */
export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] text-[#020617]">
      {/* 1. Global Shell Navigation Skeleton */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-[4px]" />
            <Skeleton className="h-6 w-32 rounded-[4px]" />
          </div>

          {/* Desktop Search Bar Skeleton */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Skeleton className="h-9 w-full rounded-[4px]" />
          </div>

          {/* Right Action Icons (Notifications + Avatar) */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-[4px]" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* 2. Escrow Micro-Summary Bar Skeleton */}
        <div className="border-t border-[#e2e8f0] bg-white px-4 py-2 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 rounded-[4px] bg-[#f1f5f9]" />
              <Skeleton className="h-5 w-24 rounded-full bg-[#f1f5f9]" />
            </div>
            <Skeleton className="h-4 w-36 rounded-[4px] bg-[#f1f5f9]" />
          </div>
        </div>
      </header>

      {/* 3. Main Viewport Content Skeleton */}
      <main className="flex-1 mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {/* Filter Chips Skeleton Bar (4px radius per rule 3) */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Skeleton className="h-8 w-20 rounded-[4px]" />
            <Skeleton className="h-8 w-24 rounded-[4px]" />
            <Skeleton className="h-8 w-28 rounded-[4px]" />
            <Skeleton className="h-8 w-24 rounded-[4px]" />
          </div>
          <Skeleton className="hidden sm:block h-9 w-32 rounded-[4px]" />
        </div>

        {/* 6-Card Gadget Listing Grid Skeleton (8px card radius) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)]"
            >
              {/* 4:3 Aspect Ratio Image Skeleton */}
              <div className="relative aspect-4/3 w-full bg-[#f1f5f9]">
                <Skeleton className="h-full w-full rounded-none" />
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-5 w-16 rounded-[4px]" />
                </div>
              </div>

              {/* Card Meta Body */}
              <div className="flex flex-1 flex-col p-4 space-y-3">
                {/* Title Skeleton: h-6 w-3/4 */}
                <Skeleton className="h-6 w-3/4 rounded-[4px]" />

                {/* Subtitle / Spec Skeleton */}
                <Skeleton className="h-4 w-1/2 rounded-[4px]" />

                <div className="pt-3 mt-auto flex items-center justify-between border-t border-[#e2e8f0]">
                  {/* Price Skeleton: h-5 w-1/4 */}
                  <Skeleton className="h-5 w-1/4 rounded-[4px]" />
                  {/* Trust badge pill skeleton */}
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur-md md:hidden px-4">
        <Skeleton className="h-6 w-6 rounded-[4px]" />
        <Skeleton className="h-6 w-6 rounded-[4px]" />
        <Skeleton className="h-6 w-6 rounded-[4px]" />
        <Skeleton className="h-6 w-6 rounded-[4px]" />
      </div>
    </div>
  );
}
