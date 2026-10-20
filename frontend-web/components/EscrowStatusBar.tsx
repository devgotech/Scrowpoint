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
import { Tooltip } from "@/components/ui/tooltip";

/**
 * EscrowStatusBar Component for Buyer's High.
 *
 * Requirements (UI Context Spec 1, §2 & §3.C, Core Directive 3):
 * - Micro-summary component that mounts directly below the sticky top navbar during active trades.
 * - Trigger states: PENDING_PAYMENT, FUNDS_HELD, IN_TRANSIT, INSPECTION_PERIOD, or DISPUTED.
 * - Visual Theme: Brand navy background with crisp white text.
 * - Color Enforcement:
 *   - `trust` (#22c55e) strictly for escrow-active and verified states.
 *   - `warning` (#ecc94b) for pending, inspection warnings, or disputed states.
 * - Inspection windows use the warning state; urgent windows are emphasized without motion.
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
  initialSecondsRemaining = 6840, // 1h 54m to demonstrate the urgent warning state
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
          barAccent: "border-trust/30",
        };
      case "IN_TRANSIT":
        return {
          label: "In Transit with Courier",
          variant: "secondary" as const,
          icon: Package,
          timerLabel: "Estimated Delivery",
          barAccent: "border-border",
        };
      case "INSPECTION_PERIOD":
        return {
          label: isUrgent ? "Inspection Ending Soon" : "48-Hour Inspection Active",
          variant: "warning" as const,
          icon: isUrgent ? AlertTriangle : ShieldCheck,
          timerLabel: "Auto-Release in",
          barAccent: isUrgent ? "border-warning ring-1 ring-warning/30" : "border-warning/50",
        };
      case "DISPUTED":
        return {
          label: "Dispute Arbitration Active",
          variant: "warning" as const,
          icon: ShieldAlert,
          timerLabel: "Evidence Deadline",
          barAccent: "border-warning",
        };
      case "PENDING_PAYMENT":
      default:
        return {
          label: "Awaiting Buyer Funding",
          variant: "warning" as const,
          icon: Clock,
          timerLabel: "Payment Reservation",
          barAccent: "border-warning/60",
        };
    }
  }, [state, isUrgent]);

  const StatusIcon = statusConfig.icon;

  return (
    <div
      role="region"
      aria-label="Active Escrow Status"
      className={cn(
        "relative w-full bg-primary text-primary-foreground border-b px-4 py-2 transition-colors duration-200 ease-out",
        statusConfig.barAccent,
        isUrgent && "ring-inset ring-1 ring-warning/50",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* Left: Escrow Order ID & Status Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 mono-data text-slate-300">
            <Lock className="h-3.5 w-3.5 text-trust" />
            <span className="hidden sm:inline text-slate-400">Order:</span>
            <span className="text-white">{orderShortId}</span>
          </div>

          <span className="hidden md:inline text-slate-600">|</span>

          {/* Item Title context */}
          <span className="hidden lg:inline text-slate-300 font-medium truncate max-w-xs">
            {itemTitle}
          </span>

          <span className="hidden lg:inline text-slate-600">|</span>

          {/* Status Badge */}
          <Tooltip
            content={
              state === "IN_TRANSIT"
                ? "ITEM WITH COURIER"
                : state === "DISPUTED"
                  ? "ESCROW LOCKED: DISPUTE"
                  : state === "INSPECTION_PERIOD"
                    ? "48H INSPECTION ACTIVE"
                    : state === "FUNDS_HELD"
                      ? "FUNDS SECURED IN VAULT"
                      : "PAYMENT REQUIRED"
            }
          >
            <Badge
              variant={statusConfig.variant}
              className={cn(
                "gap-1 py-0 px-2 label-caps",
                statusConfig.variant === "trust"
                  ? "bg-trust/20 text-trust border-trust/40"
                  : statusConfig.variant === "warning"
                    ? "bg-warning/20 text-warning border-warning/40"
                    : "bg-white/10 text-white border-white/20"
              )}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </Badge>
          </Tooltip>
        </div>

        {/* Right: Dynamic Countdown Timer & CTA */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Countdown Clock */}
          <div
            className={cn(
              "flex items-center gap-1.5 mono-data px-2 py-0.5 rounded-md",
              isUrgent
                ? "bg-warning/20 text-warning font-bold"
                : "bg-slate-800/80 text-slate-200"
            )}
          >
            <Clock
              className={cn(
                "h-3.5 w-3.5",
                isUrgent ? "text-warning" : "text-slate-400"
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
            className="group flex min-h-11 items-center gap-1 rounded-md bg-slate-800 px-3 py-1 text-[11px] font-semibold text-white transition-colors duration-200 ease-out hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
