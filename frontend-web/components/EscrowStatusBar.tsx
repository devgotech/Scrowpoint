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
 * EscrowStatusBar Component for Scrowpoint.
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
  orderId = "sp-ord-94218a",
  orderShortId = "SP-ORD-9421",
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
        "relative w-full bg-[#111113] text-white border-b border-white/10 px-4 py-2 transition-all duration-300",
        statusConfig.barAccent,
        isUrgent && "bg-[#111113] ring-inset ring-1 ring-amber-400/50 animate-pulse",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs font-secondary">
        {/* Left: Escrow Order ID & Status Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono font-medium text-white/75">
            <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
            <span className="hidden sm:inline text-white/50">Order:</span>
            <span className="text-white font-semibold">{orderShortId}</span>
          </div>

          <span className="hidden md:inline text-white/25">|</span>

          {/* Item Title context */}
          <span className="hidden lg:inline text-white/80 font-medium truncate max-w-xs font-primary">
            {itemTitle}
          </span>

          <span className="hidden lg:inline text-white/25">|</span>

          {/* Status Badge */}
          <Badge
            variant={statusConfig.variant}
            className="gap-1 py-0.5 px-2 text-[10px] font-mono tracking-wider"
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
              "flex items-center gap-1.5 font-mono text-[11px] sm:text-xs px-2.5 py-0.5",
              isUrgent
                ? "bg-[#ecc94b]/20 text-[#ecc94b] font-bold"
                : "bg-white/10 text-white/90"
            )}
          >
            <Clock
              className={cn(
                "h-3.5 w-3.5",
                isUrgent ? "text-[#ecc94b] animate-spin" : "text-white/60"
              )}
            />
            <span className="hidden sm:inline text-white/60 font-secondary">
              {statusConfig.timerLabel}:
            </span>
            <span>{formattedCountdown}</span>
          </div>

          {/* Escrow Status Link */}
          <Link
            href={`/escrow/${orderId}/status`}
            className="group flex items-center gap-1 rounded-full bg-[#FF5A25] hover:bg-[#FF5A25]/90 px-3 py-1 text-[11px] font-primary uppercase tracking-[0.06em] font-semibold text-white transition-colors duration-200 ease-out"
          >
            <span>View Trade</span>
            <ArrowRight className="h-3 w-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EscrowStatusBar;
