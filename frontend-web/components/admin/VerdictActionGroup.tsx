"use client";

import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Scale, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);

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
        "rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[#0f172a]" />
          <h4 className="font-primary text-sm font-bold text-[#020617]">
            Arbitration Verdict Console ({caseId})
          </h4>
        </div>
        <span className="font-mono text-xs font-bold text-[#020617]">
          Locked: {formatNaira(orderAmount)}
        </span>
      </div>

      <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
        Selecting a verdict will execute binding database triggers on the Paystack custodial holding account.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Option 1: Full Refund */}
        <button
          type="button"
          onClick={() => {
            setSelectedVerdict("refund_buyer");
            onExecuteVerdict?.("refund_buyer");
          }}
          className="p-4 rounded-[4px] border border-[#f56565]/40 bg-[#f56565]/10 hover:bg-[#f56565]/20 text-left transition-all duration-200 ease-out space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold text-[#c53030]">
              Full Buyer Refund
            </span>
            <RotateCcw className="h-4 w-4 text-[#f56565]" />
          </div>
          <div className="font-mono text-sm font-extrabold text-[#c53030]">
            {formatNaira(orderAmount)}
          </div>
          <p className="font-secondary text-[11px] text-[#7f1d1d] leading-tight">
            Trigger return waybill; refund buyer upon return receipt.
          </p>
        </button>

        {/* Option 2: Full Payout to Seller */}
        <button
          type="button"
          onClick={() => {
            setSelectedVerdict("release_seller");
            onExecuteVerdict?.("release_seller");
          }}
          className="p-4 rounded-[4px] border border-[#22c55e]/40 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-left transition-all duration-200 ease-out space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold text-[#15803d]">
              Release to Seller
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
          </div>
          <div className="font-mono text-sm font-extrabold text-[#15803d]">
            {formatNaira(orderAmount)}
          </div>
          <p className="font-secondary text-[11px] text-[#15803d]/80 leading-tight">
            Claim rejected; release escrow funds to seller's NUBAN.
          </p>
        </button>

        {/* Option 3: 50/50 Compromise */}
        <button
          type="button"
          onClick={() => {
            setSelectedVerdict("split");
            onExecuteVerdict?.("split");
          }}
          className="p-4 rounded-[4px] border border-[#0f172a] bg-[#f8fafc] hover:bg-[#f1f5f9] text-left transition-all duration-200 ease-out space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold text-[#020617]">
              50 / 50 Compromise
            </span>
            <Scale className="h-4 w-4 text-[#0f172a]" />
          </div>
          <div className="font-mono text-sm font-extrabold text-[#020617]">
            {formatNaira(orderAmount / 2)} each
          </div>
          <p className="font-secondary text-[11px] text-[#64748b] leading-tight">
            Split settlement to cover repair or battery replacement costs.
          </p>
        </button>
      </div>
    </div>
  );
}

export default VerdictActionGroup;
