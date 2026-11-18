"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Lock,
  ShieldAlert,
  Sparkles,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SystemMilestoneBubble Component (Phase 3 §2)
 *
 * Friendly, human-centered Escrow Milestone card inside the Trade Conversation.
 * Adheres strictly to Design Variation 7 (4_ui_system.md):
 * - Sharp 0px architectural geometry (border-ink-faint)
 * - WCAG-compliant trust green (#15803d) on light surfaces
 * - Space Grotesk headings & monospace timestamps, Plus Jakarta Sans body
 */

export type MilestoneType =
  | "FUNDED"
  | "SHIPPED"
  | "DELIVERED"
  | "INSPECTION_ACTIVE"
  | "DISPUTED"
  | "SETTLED";

export interface SystemMilestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  timestamp: string;
  nextStepHint?: string;
  actionText?: string;
}

export interface SystemMilestoneBubbleProps {
  milestone: SystemMilestone;
  className?: string;
}

export function SystemMilestoneBubble({
  milestone,
  className,
}: SystemMilestoneBubbleProps) {
  const isDispute = milestone.type === "DISPUTED";
  const isSettled =
    milestone.type === "SETTLED" || milestone.type === "FUNDED";
  const isInspection =
    milestone.type === "INSPECTION_ACTIVE" || milestone.type === "DELIVERED";

  const stepBadgeLabel =
    milestone.type === "FUNDED"
      ? "Milestone 01 • Funds Secured"
      : milestone.type === "SHIPPED"
      ? "Milestone 02 • On the Way"
      : milestone.type === "INSPECTION_ACTIVE" || milestone.type === "DELIVERED"
      ? "Milestone 03 • 48H Test Window"
      : milestone.type === "SETTLED"
      ? "Milestone 04 • Trade Complete"
      : "Escrow Protection Hold";

  return (
    <div
      className={cn(
        "my-4 border bg-surface p-4 sm:p-5 transition-all duration-200 ease-out rounded-card",
        isDispute
          ? "border-state-error/50 bg-state-error/5"
          : isSettled
          ? "border-trust-strong/25 bg-trust/5"
          : isInspection
          ? "border-state-warning/60 bg-state-warning/10"
          : "border-ink-faint bg-paper",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center shrink-0 mt-0.5",
            isDispute
              ? "bg-state-error-strong text-white"
              : isSettled
              ? "bg-trust-strong text-white"
              : isInspection
              ? "bg-state-warning text-ink"
              : "bg-ink text-white"
          )}
        >
          {isDispute ? (
            <ShieldAlert className="h-4 w-4" />
          ) : milestone.type === "SETTLED" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isSettled ? (
            <Lock className="h-4 w-4" />
          ) : isInspection ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Truck className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={cn(
                "font-mono text-caption font-bold uppercase tracking-[0.14em]",
                isDispute
                  ? "text-state-error-strong"
                  : isSettled
                  ? "text-trust-strong"
                  : isInspection
                  ? "text-state-warning-strong"
                  : "text-ink/70"
              )}
            >
              {stepBadgeLabel}
            </span>
            <span className="font-mono text-caption text-ink/55">
              {milestone.timestamp}
            </span>
          </div>

          <h4 className="font-primary text-sm font-bold tracking-[-0.02em] text-ink leading-snug">
            {milestone.title}
          </h4>

          <p className="font-secondary text-xs text-ink/75 leading-relaxed">
            {milestone.description}
          </p>

          {milestone.nextStepHint && (
            <div className="pt-2 mt-2 border-t border-ink/10 flex items-center gap-1.5 text-meta font-secondary text-ink/80">
              <Sparkles className="h-3.5 w-3.5 text-accent-orange shrink-0" />
              <span>
                <strong className="font-semibold text-ink">
                  What&apos;s next:
                </strong>{" "}
                {milestone.nextStepHint}
              </span>
            </div>
          )}

          {milestone.actionText && (
            <div className="pt-1 font-mono text-meta font-semibold text-trust-strong underline underline-offset-2">
              {milestone.actionText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemMilestoneBubble;
