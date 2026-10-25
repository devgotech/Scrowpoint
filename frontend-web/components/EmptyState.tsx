"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EmptyState Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 3, §3):
 * - Corner Radius: --radius-card (8px -> rounded-[8px]).
 * - Subtle monochrome Lucide icon sized at `w-12 h-12` with soft circular background.
 * - Bold Heading (font-primary text-lg font-medium text-[#020617]).
 * - Descriptive subtext (font-secondary text-sm text-[#64748b] max-w-md).
 * - Optional actionable `<Button>` (supports onAction callback or href navigation) with 4px control radius.
 * - Transitions: strict duration-200 ease-out transitions.
 */

export interface EmptyStateProps {
  /** The primary heading for the empty state */
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
        className="mt-2 font-medium shadow-xs min-w-36"
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
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 w-full rounded-[8px] border border-dashed border-[#e2e8f0] bg-white transition-all duration-200 ease-out",
        className
      )}
    >
      {/* 1. Subtle, monochrome Lucide icon with soft circular backdrop */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b]">
        <Icon className="h-8 w-8 text-[#64748b]" aria-hidden="true" />
      </div>

      {/* 2. Heading (Roboto, 500) */}
      <h3 className="font-primary text-lg font-medium tracking-normal text-[#020617]">
        {title}
      </h3>

      {/* 3. Descriptive Subtext in Muted Text (Geist) */}
      <p className="mt-2 max-w-md font-secondary text-sm text-[#64748b] leading-relaxed">
        {description}
      </p>

      {/* 4. Optional Primary Call-to-Action */}
      {actionLabel && <div className="mt-6">{renderActionButton()}</div>}
    </div>
  );
}

export default EmptyState;
