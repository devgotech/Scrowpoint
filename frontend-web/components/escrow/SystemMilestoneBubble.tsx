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
 * - Sharp 0px architectural geometry (border-[#111113]/12)
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
        "my-4 border bg-white p-4 sm:p-5 transition-all duration-200 ease-out",
        isDispute
          ? "border-[#f56565]/50 bg-[#f56565]/5"
          : isSettled
          ? "border-[#15803d]/25 bg-[#22c55e]/5"
          : isInspection
          ? "border-[#ecc94b]/60 bg-[#ecc94b]/10"
          : "border-[#111113]/12 bg-[#F8F7F4]",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center shrink-0 mt-0.5",
            isDispute
              ? "bg-[#c53030] text-white"
              : isSettled
              ? "bg-[#15803d] text-white"
              : isInspection
              ? "bg-[#ecc94b] text-[#111113]"
              : "bg-[#111113] text-white"
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
                "font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
                isDispute
                  ? "text-[#c53030]"
                  : isSettled
                  ? "text-[#15803d]"
                  : isInspection
                  ? "text-[#975a16]"
                  : "text-[#111113]/70"
              )}
            >
              {stepBadgeLabel}
            </span>
            <span className="font-mono text-[10px] text-[#111113]/55">
              {milestone.timestamp}
            </span>
          </div>

          <h4 className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113] leading-snug">
            {milestone.title}
          </h4>

          <p className="font-secondary text-xs text-[#111113]/75 leading-relaxed">
            {milestone.description}
          </p>

          {milestone.nextStepHint && (
            <div className="pt-2 mt-2 border-t border-[#111113]/10 flex items-center gap-1.5 text-[11px] font-secondary text-[#111113]/80">
              <Sparkles className="h-3.5 w-3.5 text-[#FF5A25] shrink-0" />
              <span>
                <strong className="font-semibold text-[#111113]">
                  What&apos;s next:
                </strong>{" "}
                {milestone.nextStepHint}
              </span>
            </div>
          )}

          {milestone.actionText && (
            <div className="pt-1 font-mono text-[11px] font-semibold text-[#15803d] underline underline-offset-2">
              {milestone.actionText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemMilestoneBubble;
