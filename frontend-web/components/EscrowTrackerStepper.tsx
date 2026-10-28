"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Package,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * EscrowTrackerStepper Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 2 Tier 3):
 * - Macro-view timeline component located in the page body of `/escrow/[id]/status`.
 * - Corner Radius: --radius-card (8px -> rounded-[8px]). Controls / inner cards: rounded-[4px].
 * - Distinct views:
 *   - Desktop (>=768px): Full horizontal stepper timeline with connecting status lines.
 *   - Mobile (<768px): Vertical stepper timeline with full detail descriptions and timestamps.
 * - Strict Color Enforcement:
 *   - `FUNDS_HELD` must use the `trust` color (#22c55e) and MUST pulse when currently active.
 *   - Completed steps use solid trust checkmarks (#22c55e).
 *   - Warning / Disputed / Escalated branches use `warning` (#ecc94b) or `destructive` (#f56565).
 *   - Text on white uses --color-trust-strong (#15803d) for high-contrast accessibility.
 * - State Mapping (Go Backend models & Spec 2 enums):
 *   1. PENDING_PAYMENT / CREATED -> Buyer deposits funds into vault
 *   2. FUNDS_HELD -> Funds held securely in escrow (PULSES in green trust state)
 *   3. IN_TRANSIT -> Seller ships via verified courier with tracking
 *   4. INSPECTION_PERIOD -> Buyer gets 48 hours to inspect gadget hardware
 *   5. COMPLETED / RELEASED -> Funds released to seller wallet
 * - Typography: font-primary for headings, font-secondary for body, font-mono for tracking numbers & timestamps.
 * - Transitions: strict duration-200 ease-out transitions (NEVER bouncy).
 */

export type EscrowState =
  | "created"
  | "pending_payment"
  | "funds_held"
  | "in_transit"
  | "inspection_period"
  | "completed"
  | "disputed"
  | "refunded"
  | "released_manual";

export interface EscrowStepDetail {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isWarning?: boolean;
}

export interface EscrowTrackerStepperProps {
  currentState?: EscrowState;
  orderNumber?: string;
  trackingNumber?: string;
  courierName?: string;
  className?: string;
}

export function EscrowTrackerStepper({
  currentState = "funds_held",
  orderNumber = "SP-ORD-94218A",
  trackingNumber = "GIG-89421092-NG",
  courierName = "GIG Logistics",
  className,
}: EscrowTrackerStepperProps) {
  // Ordered linear path for standard escrow lifecycle
  const steps = useMemo<EscrowStepDetail[]>(() => {
    const isDisputed = currentState === "disputed";
    const isRefunded = currentState === "refunded";

    // Determine numerical progression rank
    const rankMap: Record<EscrowState, number> = {
      created: 0,
      pending_payment: 0,
      funds_held: 1,
      in_transit: 2,
      inspection_period: 3,
      completed: 4,
      released_manual: 4,
      disputed: 3,
      refunded: 4,
    };

    const currentRank = rankMap[currentState] ?? 1;

    return [
      {
        id: "step_payment",
        title: "Escrow Deposit",
        shortLabel: "Funded",
        description: "Buyer authorized and reserved funds via Paystack vault.",
        timestamp: "Oct 15, 2026 • 10:14 AM",
        isCompleted: currentRank > 0,
        isCurrent: currentState === "created" || currentState === "pending_payment",
      },
      {
        id: "step_funds_held",
        title: "Funds Held Securely",
        shortLabel: "Vault Lock",
        description:
          "Institutional escrow guarantee active. Seller notified to package and dispatch gadget.",
        timestamp: currentRank >= 1 ? "Oct 15, 2026 • 10:15 AM" : undefined,
        isCompleted: currentRank > 1,
        isCurrent: currentState === "funds_held",
      },
      {
        id: "step_in_transit",
        title: "Verified Dispatch",
        shortLabel: "In Transit",
        description:
          currentRank >= 2
            ? `${courierName} tracking: ${trackingNumber}`
            : "Seller generates return-safe waybill with authorized courier.",
        timestamp: currentRank >= 2 ? "Oct 15, 2026 • 02:30 PM" : undefined,
        isCompleted: currentRank > 2,
        isCurrent: currentState === "in_transit",
      },
      {
        id: "step_inspection",
        title: isDisputed ? "Dispute Raised" : "48-Hour Inspection",
        shortLabel: isDisputed ? "Disputed" : "Inspection",
        description: isDisputed
          ? "Arbitration hold placed. Payout frozen pending evidence review."
          : "Buyer tests battery, camera, screen, and carrier lock before funds release.",
        timestamp: currentRank >= 3 ? "Oct 16, 2026 • 09:00 AM" : undefined,
        isCompleted: currentRank > 3,
        isCurrent: currentState === "inspection_period" || isDisputed,
        isWarning: isDisputed,
      },
      {
        id: "step_payout",
        title: isRefunded ? "Buyer Refunded" : "Funds Released",
        shortLabel: isRefunded ? "Refunded" : "Settled",
        description: isRefunded
          ? "Escrow funds returned to buyer bank account."
          : "Buyer confirmed receipt. Seller payout credited to bank account.",
        timestamp: currentRank >= 4 ? "Oct 16, 2026 • 01:22 PM" : undefined,
        isCompleted: currentRank > 4,
        isCurrent: currentState === "completed" || isRefunded,
      },
    ];
  }, [currentState, courierName, trackingNumber]);

  return (
    <div
      role="region"
      aria-label="Escrow Transaction Stepper"
      className={cn(
        "w-full border border-[#111113]/12 bg-white p-6 transition-all duration-200 ease-out",
        className
      )}
    >
      {/* Header Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#111113]/12">
        <div>
          <span className="label">
            Escrow Timeline Tracker
          </span>
          <h2 className="font-primary text-lg font-bold tracking-[-0.03em] text-[#111113] mt-0.5">
            Order Reference: <span className="font-mono font-semibold text-[#111113]">{orderNumber}</span>
          </h2>
        </div>

        {/* Current State Highlight Pill */}
        <div className="flex items-center gap-2">
          {currentState === "funds_held" ? (
            <Badge
              variant="trust"
              className="gap-1.5 px-3 py-1 text-xs font-semibold animate-pulse"
            >
              <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>FUNDS HELD (ACTIVE VAULT)</span>
            </Badge>
          ) : currentState === "disputed" ? (
            <Badge
              variant="warning"
              className="gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-[#ecc94b]" />
              <span>DISPUTE ARBITRATION</span>
            </Badge>
          ) : currentState === "completed" ? (
            <Badge
              variant="trust"
              className="gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>ESCROW SETTLED</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span className="uppercase">{currentState.replace("_", " ")}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* ====================================================================
          1. DESKTOP VIEW: HORIZONTAL STEPPER TIMELINE (md:flex)
          ==================================================================== */}
      <div className="hidden md:block pt-8 pb-4">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Bar */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#111113]/12 -z-0" />

          {/* Stepper Node Items */}
          {steps.map((step) => {
            const isFundsHeld = step.id === "step_funds_held" && step.isCurrent;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-1 flex-col items-center text-center px-2 group"
              >
                {/* Node Circle */}
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200 ease-out",
                    step.isCompleted
                      ? "border-[#22c55e] bg-[#22c55e] text-white"
                      : isFundsHeld
                      ? "border-[#22c55e] bg-[#22c55e]/15 text-[#15803d] ring-4 ring-[#22c55e]/20 animate-pulse"
                      : step.isCurrent && step.isWarning
                      ? "border-[#ecc94b] bg-[#ecc94b]/20 text-[#975a16] ring-4 ring-[#ecc94b]/20"
                      : step.isCurrent
                      ? "border-[#111113] bg-[#111113] text-white ring-4 ring-[#111113]/10"
                      : "border-[#111113]/15 bg-white text-[#111113]/50"
                  )}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  ) : isFundsHeld ? (
                    <Lock className="h-5 w-5 fill-current" />
                  ) : step.isCurrent && step.isWarning ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : step.id === "step_payment" ? (
                    <CreditCard className="h-5 w-5" />
                  ) : step.id === "step_in_transit" ? (
                    <Truck className="h-5 w-5" />
                  ) : step.id === "step_inspection" ? (
                    <Search className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>

                {/* Title & Short Label */}
                <span
                  className={cn(
                    "mt-3 font-primary text-xs font-medium tracking-[-0.02em] leading-tight",
                    step.isCurrent
                      ? isFundsHeld
                        ? "text-[#15803d] font-bold"
                        : "text-[#111113] font-bold"
                      : step.isCompleted
                      ? "text-[#111113]"
                      : "text-[#111113]/55"
                  )}
                >
                  {step.title}
                </span>

                {/* Subtitle / Timestamp */}
                {step.timestamp ? (
                  <span className="mt-1 font-mono text-[10px] text-[#111113]/55">
                    {step.timestamp.split("•")[1] || step.timestamp}
                  </span>
                ) : (
                  <span className="mt-1 text-[10px] text-[#111113]/45 font-secondary">Pending</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Stage Callout Box */}
        <div className="mt-8 bg-[#F8F7F4] border border-[#111113]/12 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-[#22c55e]/15 text-[#15803d]">
              <Lock className="h-4 w-4 text-[#22c55e]" />
            </div>
            <div>
              <h4 className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                Current Escrow Status:{" "}
                <span className="text-[#15803d] font-semibold">
                  {currentState === "funds_held" ? "Funds Held in Institutional Vault" : currentState.replace("_", " ").toUpperCase()}
                </span>
              </h4>
              <p className="mt-1 font-secondary text-xs text-[#111113]/70 leading-relaxed">
                {steps.find((s) => s.isCurrent)?.description ||
                  "Funds are protected by Scrowpoint escrow. Both buyer and seller are shielded from fraudulent chargebacks and counterfeit items."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MOBILE VIEW: VERTICAL STEPPER TIMELINE (md:hidden)
          ==================================================================== */}
      <div className="block md:hidden pt-6">
        <div className="relative pl-6 space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute top-2 bottom-4 left-[21px] w-0.5 bg-[#111113]/12" />

          {steps.map((step) => {
            const isFundsHeld = step.id === "step_funds_held" && step.isCurrent;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Node Circle */}
                <div
                  className={cn(
                    "absolute -left-6 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ease-out",
                    step.isCompleted
                      ? "border-[#22c55e] bg-[#22c55e] text-white"
                      : isFundsHeld
                      ? "border-[#22c55e] bg-[#22c55e]/15 text-[#15803d] ring-4 ring-[#22c55e]/20 animate-pulse"
                      : step.isCurrent && step.isWarning
                      ? "border-[#ecc94b] bg-[#ecc94b]/20 text-[#975a16] ring-4 ring-[#ecc94b]/20"
                      : step.isCurrent
                      ? "border-[#111113] bg-[#111113] text-white ring-4 ring-[#111113]/10"
                      : "border-[#111113]/15 bg-white text-[#111113]/50"
                  )}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isFundsHeld ? (
                    <Lock className="h-3.5 w-3.5 fill-current" />
                  ) : step.isCurrent && step.isWarning ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>

                {/* Content Box */}
                <div className="flex-1 pl-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        "font-primary text-sm font-medium tracking-[-0.02em]",
                        isFundsHeld
                          ? "text-[#15803d] font-bold"
                          : step.isCurrent
                          ? "text-[#111113] font-bold"
                          : "text-[#111113]"
                      )}
                    >
                      {step.title}
                    </h4>

                    {step.timestamp && (
                      <span className="font-mono text-[10px] text-[#111113]/55">
                        {step.timestamp.split("•")[1] || step.timestamp}
                      </span>
                    )}
                  </div>

                  <p className="font-secondary text-xs text-[#111113]/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EscrowTrackerStepper;
