"use client";

import React from "react";
import { CheckCircle2, RotateCcw, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * VerdictActionGroup Component (Phase 6 §1 - Arbitration Room)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Adjudication controls for senior dispute officer:
 *   1. Rule in favor of Buyer (100% Refund upon return waybill)
 *   2. Rule in favor of Seller (100% Payout Release)
 *   3. 50/50 Split Compromise Settlement
 * - Token Compliance: 8px container radius, 4px buttons, semantic warning/destructive/trust styling.
 */

export interface VerdictActionGroupProps {
  orderAmount: number;
  caseId: string;
  onExecuteVerdict?: (verdictType: "refund_buyer" | "release_seller" | "split") => void;
  className?: string;
}

export function VerdictActionGroup({
  orderAmount = 850000,
  caseId = "dsp-101",
  onExecuteVerdict,
  className,
}: VerdictActionGroupProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      className={cn(
        "border border-ink-faint bg-surface p-6 space-y-4 rounded-card",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-ink-faint">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-ink" />
          <h4 className="font-primary text-sm font-bold text-ink tracking-[-0.02em]">
            Arbitration Verdict Console ({caseId})
          </h4>
        </div>
        <span className="font-mono text-xs font-bold text-ink">
          Locked: {formatNaira(orderAmount)}
        </span>
      </div>

      <p className="font-secondary text-xs text-ink/65 leading-relaxed">
        Selecting a verdict will execute binding database triggers on the Paystack custodial holding account.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Option 1: Full Refund */}
        <button
          type="button"
          onClick={() => {
            onExecuteVerdict?.("refund_buyer");
          }}
          className="p-4 border border-state-error/40 bg-state-error/10 hover:bg-state-error/20 text-left transition-all duration-200 ease-out space-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold text-state-error-strong">
              Full Buyer Refund
            </span>
            <RotateCcw className="h-4 w-4 text-state-error" />
          </div>
          <div className="font-mono text-sm font-extrabold text-state-error-strong">
            {formatNaira(orderAmount)}
          </div>
          <p className="font-secondary text-meta text-state-error-deep leading-tight">
            Trigger return waybill; refund buyer upon return receipt.
          </p>
        </button>

        {/* Option 2: Full Payout to Seller */}
        <button
          type="button"
          onClick={() => {
            onExecuteVerdict?.("release_seller");
          }}
          className="p-4 border border-trust/40 bg-trust/10 hover:bg-trust/20 text-left transition-all duration-200 ease-out space-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold text-trust-strong">
              Release to Seller
            </span>
            <CheckCircle2 className="h-4 w-4 text-trust" />
          </div>
          <div className="font-mono text-sm font-extrabold text-trust-strong">
            {formatNaira(orderAmount)}
          </div>
          <p className="font-secondary text-meta text-trust-strong/80 leading-tight">
            Claim rejected; release escrow funds to seller&apos;s NUBAN.
          </p>
        </button>

        {/* Option 3: 50/50 Compromise */}
        <button
          type="button"
          onClick={() => {
            onExecuteVerdict?.("split");
          }}
          className="p-4 border border-ink bg-paper hover:bg-surface-muted text-left transition-all duration-200 ease-out space-y-1 cursor-pointer rounded-card"
        >
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold text-ink">
              50 / 50 Compromise
            </span>
            <Scale className="h-4 w-4 text-ink" />
          </div>
          <div className="font-mono text-sm font-extrabold text-ink">
            {formatNaira(orderAmount / 2)} each
          </div>
          <p className="font-secondary text-meta text-ink/65 leading-tight">
            Split settlement to cover repair or battery replacement costs.
          </p>
        </button>
      </div>
    </div>
  );
}

export default VerdictActionGroup;
