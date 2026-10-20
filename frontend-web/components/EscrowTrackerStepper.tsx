"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  orderNumber = "BH-ORD-94218A",
  trackingNumber = "GIG-89421092-NG",
  courierName = "GIG Logistics",
  className,
}: EscrowTrackerStepperProps) {
  const steps = useMemo<EscrowStepDetail[]>(() => {
    const isDisputed = currentState === "disputed";
    const isRefunded = currentState === "refunded";

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
        isWarning: isDisputed || currentState === "inspection_period",
      },
      {
        id: "step_payout",
        title: isRefunded ? "Buyer Refunded" : "Funds Released",
        shortLabel: isRefunded ? "Refunded" : "Settled",
        description: isRefunded
          ? "Escrow funds returned to buyer bank account."
          : "Buyer confirmed receipt. Seller payout credited to bank account.",
        timestamp: currentRank >= 4 ? "Oct 16, 2026 • 01:22 PM" : undefined,
        isCompleted: currentRank >= 4,
        isCurrent: currentState === "completed" || isRefunded,
      },
    ];
  }, [currentState, courierName, trackingNumber]);

  const isTrustStatus =
    currentState === "funds_held" || currentState === "completed";
  const isWarningStatus =
    currentState === "inspection_period" || currentState === "disputed";

  return (
    <div
      role="region"
      aria-label="Escrow Transaction Stepper"
      className={cn(
        "w-full rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-soft-sm)]",
        className
      )}
    >
      {/* Header Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Escrow Timeline Tracker
          </span>
          <h2 className="font-heading text-lg font-bold text-foreground mt-0.5">
            Order Reference: <span className="mono-data text-primary">{orderNumber}</span>
          </h2>
        </div>

        {/* Current State Highlight Pill */}
        <div className="flex items-center gap-2">
          {currentState === "funds_held" ? (
            <Badge
              variant="trust"
              className="gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>FUNDS HELD (ACTIVE VAULT)</span>
            </Badge>
          ) : currentState === "disputed" ? (
            <Badge
              variant="warning"
              className="gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>DISPUTE ARBITRATION</span>
            </Badge>
          ) : currentState === "completed" ? (
            <Badge
              variant="trust"
              className="gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>ESCROW SETTLED</span>
            </Badge>
          ) : currentState === "inspection_period" ? (
            <Badge variant="warning" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span>48H INSPECTION ACTIVE</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span className="uppercase">{currentState.replace("_", " ")}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* 1. Desktop View: Horizontal Stepper Timeline */}
      <div className="hidden md:block pt-8 pb-4">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-5 left-6 right-6 h-1 bg-muted -z-0" />

          {steps.map((step) => {
            const isFundsHeld = step.id === "step_funds_held" && step.isCurrent;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-1 flex-col items-center text-center px-2 group"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors duration-200 ease-out",
                    step.isCompleted
                      ? step.id === "step_payout" && currentState === "completed"
                        ? "border-trust-strong bg-trust-strong text-white shadow-[var(--shadow-soft-sm)]"
                        : "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft-sm)]"
                      : isFundsHeld
                      ? "border-trust-strong bg-trust-subtle text-trust-strong shadow-[var(--shadow-soft-md)] ring-4 ring-trust/20"
                      : step.isCurrent && step.isWarning
                      ? "border-warning text-warning-text bg-warning/20 ring-4 ring-warning/20"
                      : step.isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/10"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
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

                <span
                  className={cn(
                    "mt-3 font-heading text-xs font-semibold leading-tight",
                    step.isCurrent
                      ? isFundsHeld
                        ? "text-trust-strong font-bold"
                        : "text-foreground font-bold"
                      : step.isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>

                {step.timestamp ? (
                  <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {step.timestamp.split("•")[1] || step.timestamp}
                  </span>
                ) : (
                  <span className="mt-1 text-[10px] text-muted-foreground">Pending</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Stage Callout Box */}
        <div className="mt-8 rounded-lg bg-muted/40 border border-border/80 p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                isTrustStatus
                  ? "bg-trust-subtle text-trust-strong"
                  : isWarningStatus
                    ? "bg-warning/20 text-warning-text"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground">
                Current Escrow Status:{" "}
                <span
                  className={cn(
                    isTrustStatus
                      ? "text-trust-strong"
                      : isWarningStatus
                        ? "text-warning-text"
                        : "text-foreground"
                  )}
                >
                  {currentState === "funds_held" ? "Funds Held in Institutional Vault" : currentState.replace("_", " ").toUpperCase()}
                </span>
              </h4>
              <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed">
                {steps.find((s) => s.isCurrent)?.description ||
                  "Funds are protected by Buyer's High escrow. Both buyer and seller are shielded from fraudulent chargebacks and counterfeit items."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mobile View: Vertical Stepper Timeline */}
      <div className="block md:hidden pt-6">
        <div className="relative pl-6 space-y-6">
          <div className="absolute top-2 bottom-4 left-[21px] w-0.5 bg-border" />

          {steps.map((step) => {
            const isFundsHeld = step.id === "step_funds_held" && step.isCurrent;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                <div
                  className={cn(
                    "absolute -left-6 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200 ease-out",
                    step.isCompleted
                      ? step.id === "step_payout" && currentState === "completed"
                        ? "border-trust-strong bg-trust-strong text-white"
                        : "border-primary bg-primary text-primary-foreground"
                      : isFundsHeld
                      ? "border-trust-strong bg-trust-subtle text-trust-strong ring-4 ring-trust/20"
                      : step.isCurrent && step.isWarning
                      ? "border-warning bg-warning/20 text-warning-text ring-4 ring-warning/20"
                      : step.isCurrent
                      ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/10"
                      : "border-border bg-card text-muted-foreground"
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

                <div className="flex-1 pl-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        "font-heading text-sm font-semibold",
                        isFundsHeld
                          ? "text-trust-strong font-bold"
                          : step.isCurrent
                          ? "text-foreground font-bold"
                          : "text-foreground"
                      )}
                    >
                      {step.title}
                    </h4>

                    {step.timestamp && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {step.timestamp.split("•")[1] || step.timestamp}
                      </span>
                    )}
                  </div>

                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
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