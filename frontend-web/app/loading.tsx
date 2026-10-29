import { Skeleton } from "@/components/ui/skeleton";

/**
 * Root Loading State for Scrowpoint App Router.
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - 0px sharp architectural cards (rounded-none)
 */
export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8F7F4] text-[#111113]">
      {/* 1. Global Shell Navigation Skeleton */}
      <header className="sticky top-0 z-40 w-full border-b border-[#111113]/12 bg-[#F8F7F4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36 rounded-none" />
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Skeleton className="h-9 w-full rounded-none" />
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-none" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>

        {/* 2. Escrow Micro-Summary Bar Skeleton */}
        <div className="border-t border-[#111113]/12 bg-[#111113] px-4 py-2 sm:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 rounded-none bg-white/15" />
              <Skeleton className="h-5 w-24 rounded-full bg-white/15" />
            </div>
            <Skeleton className="h-4 w-36 rounded-none bg-white/15" />
          </div>
        </div>
      </header>

      {/* 3. Main Viewport Content Skeleton */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] p-4 sm:p-8 pb-24 md:pb-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Skeleton className="h-9 w-24 rounded-none" />
            <Skeleton className="h-9 w-28 rounded-none" />
            <Skeleton className="h-9 w-28 rounded-none" />
          </div>
          <Skeleton className="hidden sm:block h-9 w-32 rounded-none" />
        </div>

        {/* 6-Card Gadget Listing Grid Skeleton (0px sharp architectural cards) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-none border border-[#111113]/12 bg-white"
            >
              <div className="relative aspect-4/3 w-full bg-[#F0EFEA]">
                <Skeleton className="h-full w-full rounded-none" />
              </div>

              <div className="flex flex-1 flex-col p-5 space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-none" />
                <Skeleton className="h-4 w-1/2 rounded-none" />

                <div className="pt-3 mt-auto flex items-center justify-between border-t border-[#111113]/12">
                  <Skeleton className="h-5 w-1/4 rounded-none" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
