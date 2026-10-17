"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Lock,
  Package,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * EscrowStatusBar Component for Buyer's High.
 *
 * Requirements (UI Context Spec 1, §2 & §3.C, Core Directive 3):
 * - Micro-summary component that mounts directly below the sticky top navbar during active trades.
 * - Trigger states: PENDING_PAYMENT, FUNDS_HELD, IN_TRANSIT, INSPECTION_PERIOD, or DISPUTED.
 * - Visual Theme: Slate 900 background (`bg-slate-900` / `dark:bg-slate-950`), crisp white text.
 * - Color Enforcement:
 *   - `trust` (#22c55e) strictly for verified / funds held states.
 *   - `warning` (#ecc94b) for pending, inspection warnings, or disputed states.
 * - Critical Alert Pulsing:
 *   - If inspection window drops below 2 hours (< 7200 seconds), pulses with the `warning` (#ecc94b) color.
 * - Typography: Tracking IDs & countdown timer in `font-mono`.
 * - Navigation: Actionable link directing directly to `/escrow/[id]/status`.
 */

export type EscrowDisplayState =
  | "PENDING_PAYMENT"
  | "FUNDS_HELD"
  | "IN_TRANSIT"
  | "INSPECTION_PERIOD"
  | "DISPUTED";

export interface EscrowStatusBarProps {
  className?: string;
  orderId?: string;
  orderShortId?: string;
  state?: EscrowDisplayState;
  /** Seconds remaining in the inspection or action window. Default mock: 10800 (3h 0m) */
  initialSecondsRemaining?: number;
  itemTitle?: string;
}

export function EscrowStatusBar({
  className,
  orderId = "bh-ord-94218a",
  orderShortId = "BH-ORD-9421",
  state = "INSPECTION_PERIOD",
  initialSecondsRemaining = 6840, // ~1h 54m to demonstrate <2h warning pulse by default
  itemTitle = "MacBook Pro 14' M2",
}: EscrowStatusBarProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    initialSecondsRemaining
  );

  // Live countdown timer ticker
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  // Format seconds into HH:MM:SS
  const formattedCountdown = useMemo(() => {
    if (secondsRemaining <= 0) return "00:00:00 (Expired)";
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  }, [secondsRemaining]);

  // Is inspection expiring within 2 hours (< 7200s)?
  const isUrgent =
    state === "INSPECTION_PERIOD" && secondsRemaining > 0 && secondsRemaining < 7200;

  // Metadata configuration mapped strictly to UI Spec 1 & 2
  const statusConfig = useMemo(() => {
    switch (state) {
      case "FUNDS_HELD":
        return {
          label: "Funds Held Securely",
          variant: "trust" as const,
          icon: Lock,
          timerLabel: "Seller Ship Window",
          barAccent: "border-emerald-500/30",
        };
      case "IN_TRANSIT":
        return {
          label: "In Transit with Courier",
          variant: "trust" as const,
          icon: Package,
          timerLabel: "Estimated Delivery",
          barAccent: "border-emerald-500/30",
        };
      case "INSPECTION_PERIOD":
        return {
          label: isUrgent ? "Inspection Ending Soon" : "48-Hour Inspection Active",
          variant: isUrgent ? ("warning" as const) : ("trust" as const),
          icon: isUrgent ? AlertTriangle : ShieldCheck,
          timerLabel: "Auto-Release in",
          barAccent: isUrgent ? "border-amber-400/80 ring-1 ring-amber-400/30" : "border-emerald-500/30",
        };
      case "DISPUTED":
        return {
          label: "Dispute Arbitration Active",
          variant: "warning" as const,
          icon: ShieldAlert,
          timerLabel: "Evidence Deadline",
          barAccent: "border-amber-400/80",
        };
      case "PENDING_PAYMENT":
      default:
        return {
          label: "Awaiting Buyer Funding",
          variant: "warning" as const,
          icon: Clock,
          timerLabel: "Payment Reservation",
          barAccent: "border-amber-400/60",
        };
    }
  }, [state, isUrgent]);

  const StatusIcon = statusConfig.icon;

  return (
    <div
      role="region"
      aria-label="Active Escrow Status"
      className={cn(
        "relative w-full bg-slate-900 text-white border-b px-4 py-2 transition-all duration-300",
        statusConfig.barAccent,
        isUrgent && "bg-slate-900 ring-inset ring-1 ring-amber-400/50 animate-pulse",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Left: Escrow Order ID & Status Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono font-medium text-slate-300">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-slate-400">Order:</span>
            <span className="text-white font-semibold">{orderShortId}</span>
          </div>

          <span className="hidden md:inline text-slate-600">|</span>

          {/* Item Title context */}
          <span className="hidden lg:inline text-slate-300 font-medium truncate max-w-xs">
            {itemTitle}
          </span>

          <span className="hidden lg:inline text-slate-600">|</span>

          {/* Status Badge */}
          <Badge
            variant={statusConfig.variant}
            className={cn(
              "gap-1 py-0 px-2 text-[11px] font-semibold tracking-wide",
              statusConfig.variant === "trust"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            )}
          >
            <StatusIcon className="h-3 w-3" />
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Right: Dynamic Countdown Timer & CTA */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Countdown Clock */}
          <div
            className={cn(
              "flex items-center gap-1.5 font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded-md",
              isUrgent
                ? "bg-amber-400/20 text-amber-300 font-bold"
                : "bg-slate-800/80 text-slate-200"
            )}
          >
            <Clock
              className={cn(
                "h-3.5 w-3.5",
                isUrgent ? "text-amber-400 animate-spin" : "text-slate-400"
              )}
            />
            <span className="hidden sm:inline text-slate-400">
              {statusConfig.timerLabel}:
            </span>
            <span>{formattedCountdown}</span>
          </div>

          {/* Escrow Status Link */}
          <Link
            href={`/escrow/${orderId}/status`}
            className="group flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
          >
            <span>View Trade</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EscrowStatusBar;
