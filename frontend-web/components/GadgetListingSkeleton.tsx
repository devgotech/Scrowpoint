import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * GadgetListingSkeleton Component for Buyer's High.
 *
 * Requirements (UI Context Spec 3, §2 & UI Context Spec 2, Tier 1):
 * - Rule of Parity: Exactly mirrors the height, padding, and grid structure of `GadgetListingCard`.
 * - Image Skeleton: 4:3 `bg-muted` block for the image with a condition pill skeleton at top-3 left-3.
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
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className
      )}
      {...props}
    >
      {/* 4:3 Aspect Ratio Image Block */}
      <div className="relative aspect-4/3 w-full bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
        {/* Condition Badge Placeholder */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Category & Verified Seller Row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-full" />
        </div>

        {/* Title Block: h-6 w-3/4 (Spec requirement) */}
        <Skeleton className="h-6 w-3/4" />

        {/* Specs / Storage metadata */}
        <Skeleton className="h-4 w-1/2" />

        {/* Price & Escrow Footer */}
        <div className="pt-3 mt-auto flex items-center justify-between border-t border-border/60">
          {/* Price Block: h-5 w-1/4 (Spec requirement) */}
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-20 rounded-full" />
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
