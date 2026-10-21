import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * GadgetListingSkeleton Component for Buyer's High.
 *
 * Requirements (4_ui_system.md & Spec 3, §2):
 * - Rule of Parity: Exactly mirrors the height, padding, 8px radius, and grid structure of `GadgetListingCard`.
 * - Image Skeleton: 4:3 `bg-[#f1f5f9]` block for the image with a condition pill skeleton at top-3 left-3.
 * - Title Block: `h-6 w-3/4` block.
 * - Price Block: `h-5 w-1/4` block in `font-mono`.
 * - Zero Cumulative Layout Shift (CLS).
 */

export interface GadgetListingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function GadgetListingSkeleton({
  className,
  ...props
}: GadgetListingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading gadget listing"
      className={cn(
        "flex flex-col overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)]",
        className
      )}
      {...props}
    >
      {/* 4:3 Aspect Ratio Image Block */}
      <div className="relative aspect-4/3 w-full bg-[#f1f5f9]">
        <Skeleton className="h-full w-full rounded-none bg-[#e2e8f0]" />
        {/* Condition Badge Placeholder */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-16 rounded-[4px] bg-[#cbd5e1]" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Category & Verified Seller Row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 rounded-[4px] bg-[#e2e8f0]" />
          <Skeleton className="h-3.5 w-24 rounded-[4px] bg-[#e2e8f0]" />
        </div>

        {/* Title Block: h-6 w-3/4 (Spec requirement) */}
        <Skeleton className="h-6 w-3/4 rounded-[4px] bg-[#e2e8f0]" />

        {/* Specs / Storage metadata */}
        <Skeleton className="h-4 w-1/2 rounded-[4px] bg-[#f1f5f9]" />

        {/* Price & Escrow Footer */}
        <div className="pt-3 mt-auto flex items-center justify-between border-t border-[#e2e8f0]">
          {/* Price Block: h-5 w-1/4 (Spec requirement) */}
          <Skeleton className="h-5 w-1/4 rounded-[4px] bg-[#e2e8f0]" />
          <Skeleton className="h-5 w-20 rounded-full bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Convenience helper rendering a grid of 6 gadget listing skeletons
 * matching UI Context Spec 3 target of 6 cards on initial page load.
 */
export function GadgetListingGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <GadgetListingSkeleton key={index} />
      ))}
    </div>
  );
}

export default GadgetListingSkeleton;
