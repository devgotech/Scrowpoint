"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EmptyState Component for Buyer's High.
 *
 * Requirements (UI Context Spec 3, §3):
 * - Visual Structure:
 *   1. Centered layout (`flex flex-col items-center justify-center text-center p-8`).
 *   2. Subtle monochrome Lucide icon sized at `w-12 h-12 text-muted-foreground` (with soft circular background).
 *   3. Bold Heading (`font-heading text-lg`).
 *   4. Descriptive subtext (`text-muted-foreground text-sm max-w-md font-body`).
 *   5. Optional actionable `<Button>` (supports either onAction callback or href navigation).
 * - Adheres strictly to the 4-point spacing scale (p-8, gap-3, max-w-md, etc.) and semantic color tokens.
 */

export interface EmptyStateProps {
  /** The primary bold heading for the empty state */
  title: string;
  /** Descriptive subtext explaining why the screen is empty */
  description: string;
  /** Optional custom Lucide icon component. Defaults to PackageX */
  icon?: LucideIcon;
  /** Optional call-to-action button label */
  actionLabel?: string;
  /** Optional click handler for the action button */
  onAction?: () => void;
  /** Optional link destination if action should act as a route navigation */
  actionHref?: string;
  /** Custom wrapper classes */
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = PackageX,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  const renderActionButton = () => {
    if (!actionLabel) return null;

    const buttonElement = (
      <Button
        onClick={onAction}
        variant="default"
        size="default"
        className="mt-2 font-medium shadow-sm min-w-36"
      >
        {actionLabel}
      </Button>
    );

    if (actionHref) {
      return (
        <Link href={actionHref} className="inline-block">
          {buttonElement}
        </Link>
      );
    }

    return buttonElement;
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 w-full rounded-2xl border border-dashed border-border/80 bg-card/50",
        className
      )}
    >
      {/* 1. Subtle, monochrome Lucide icon with soft circular backdrop */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* 2. Bold Heading */}
      <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      {/* 3. Descriptive Subtext in Muted Text */}
      <p className="mt-2 max-w-md font-body text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* 4. Optional Primary Call-to-Action */}
      {actionLabel && <div className="mt-6">{renderActionButton()}</div>}
    </div>
  );
}

export default EmptyState;