"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, DollarSign, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * BalanceCard Component (Phase 3 §2 - Wallet & Payouts)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays Available for Withdrawal vs. Locked in Escrow Vault.
 * - Token Compliance: 8px card radius, 4px buttons, Geist Mono currency numbers.
 */

export interface BalanceCardProps {
  availableNaira?: number;
  lockedInEscrowNaira?: number;
  onWithdrawClick?: () => void;
  className?: string;
}

export function BalanceCard({
  availableNaira = 420000,
  lockedInEscrowNaira = 1530000,
  onWithdrawClick,
  className,
}: BalanceCardProps) {
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
        "border border-[#111113]/12 bg-white p-6 space-y-6",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#111113]/12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-[#111113] text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
              Merchant Escrow Wallet
            </h3>
            <span className="label text-[9.5px]!">
              Paystack Automated NIP Settlement
            </span>
          </div>
        </div>

        <span className="font-mono text-xs bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-2.5 py-1 rounded-full font-bold">
          100% Guaranteed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Available for Payout */}
        <div className="border border-[#22c55e]/40 bg-[#22c55e]/10 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-secondary text-xs font-semibold text-[#15803d]">
              Available for Instant Payout
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#15803d]">
            {formatNaira(availableNaira)}
          </div>
          <p className="font-secondary text-[11px] text-[#15803d]/80">
            Disburses to your verified Nigerian NUBAN account in ~15 minutes.
          </p>
        </div>

        {/* Locked in Escrow */}
        <div className="border border-[#111113]/12 bg-[#F8F7F4] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-secondary text-xs font-semibold text-[#111113]/65">
              Locked in Escrow Vault
            </span>
            <Lock className="h-4 w-4 text-[#111113]/60" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-[#111113]">
            {formatNaira(lockedInEscrowNaira)}
          </div>
          <p className="font-secondary text-[11px] text-[#111113]/65">
            Held in Paystack custody during active 48-hour inspection countdowns.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onWithdrawClick}
          className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white font-primary font-bold text-xs gap-2 transition-colors"
        >
          <ArrowDownRight className="h-4 w-4 text-[#22c55e]" />
          <span>Withdraw Available Funds ({formatNaira(availableNaira)})</span>
        </Button>
      </div>
    </div>
  );
}

export default BalanceCard;
