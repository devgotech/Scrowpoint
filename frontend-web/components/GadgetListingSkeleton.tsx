import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * GadgetListingSkeleton Component for Scrowpoint.
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
        "flex flex-col overflow-hidden border border-[#111113]/12 bg-white",
        className
      )}
      {...props}
    >
      {/* 4:3 Aspect Ratio Image Block */}
      <div className="relative aspect-4/3 w-full bg-[#F0EFEA] border-b border-[#111113]/10">
        <Skeleton className="h-full w-full rounded-none bg-[#111113]/8" />
        {/* Condition Badge Placeholder */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-16 rounded-none bg-[#111113]/15" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        {/* Category & Verified Seller Row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 rounded-none bg-[#111113]/10" />
          <Skeleton className="h-3.5 w-24 rounded-none bg-[#111113]/10" />
        </div>

        {/* Title Block: h-6 w-3/4 */}
        <Skeleton className="h-6 w-3/4 rounded-none bg-[#111113]/12" />

        {/* Specs / Storage metadata */}
        <Skeleton className="h-4 w-1/2 rounded-none bg-[#111113]/8" />

        {/* Price & Escrow Footer */}
        <div className="pt-3.5 mt-auto flex items-center justify-between border-t border-[#111113]/12">
          {/* Price Block: h-5 w-1/4 */}
          <Skeleton className="h-5 w-1/4 rounded-none bg-[#111113]/12" />
          <Skeleton className="h-5 w-20 rounded-full bg-[#111113]/10" />
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
