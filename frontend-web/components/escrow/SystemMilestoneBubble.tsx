"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  Package,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SystemMilestoneBubble Component (Phase 3 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Distinct, un-deletable chat bubbles triggered by backend events in the escrow ledger.
 * - Distinct styling for: FUNDED, SHIPPED, DELIVERED/INSPECTION, DISPUTED, SETTLED.
 * - Token Compliance: 8px container radius, 4px badges, Geist Mono timestamps and numbers.
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
  const isSettled = milestone.type === "SETTLED" || milestone.type === "FUNDED";
  const isTransit = milestone.type === "SHIPPED";
  const isInspection = milestone.type === "INSPECTION_ACTIVE" || milestone.type === "DELIVERED";

  return (
    <div
      className={cn(
        "my-3 rounded-[8px] border p-4 shadow-2xs transition-all duration-200 ease-out",
        isDispute
          ? "border-[#f56565]/40 bg-[#f56565]/10 text-[#c53030]"
          : isSettled
          ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#15803d]"
          : isInspection
          ? "border-[#ecc94b]/40 bg-[#ecc94b]/15 text-[#975a16]"
          : "border-[#e2e8f0] bg-[#f8fafc] text-[#020617]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-[4px] shrink-0 mt-0.5",
            isDispute
              ? "bg-[#f56565] text-white"
              : isSettled
              ? "bg-[#22c55e] text-white"
              : isInspection
              ? "bg-[#ecc94b] text-[#020617]"
              : "bg-[#0f172a] text-white"
          )}
        >
          {isDispute ? (
            <ShieldAlert className="h-4 w-4" />
          ) : isSettled ? (
            <Lock className="h-4 w-4" />
          ) : isInspection ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Truck className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
              SYSTEM PROTOCOL MILESTONE
            </span>
            <span className="font-mono text-[10px] opacity-75">
              {milestone.timestamp}
            </span>
          </div>

          <h4 className="font-primary text-xs font-bold leading-tight">
            {milestone.title}
          </h4>

          <p className="font-secondary text-xs opacity-90 leading-relaxed">
            {milestone.description}
          </p>

          {milestone.actionText && (
            <div className="pt-1 font-mono text-[11px] font-semibold underline underline-offset-2">
              {milestone.actionText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemMilestoneBubble;
