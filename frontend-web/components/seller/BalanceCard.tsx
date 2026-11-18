"use client";

import React from "react";
import { ArrowDownRight, CheckCircle2, Lock, Wallet } from "lucide-react";
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
        "border border-ink-faint bg-surface p-6 space-y-6 rounded-card",
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-ink-faint">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-ink text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-primary text-sm font-bold tracking-[-0.02em] text-ink">
              Merchant Escrow Wallet
            </h3>
            <span className="label text-micro!">
              Paystack Automated NIP Settlement
            </span>
          </div>
        </div>

        <span className="font-mono text-xs bg-trust/15 text-trust-strong border border-trust/30 px-2.5 py-1 rounded-full font-bold">
          100% Guaranteed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Available for Payout */}
        <div className="border border-trust/40 bg-trust/10 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-secondary text-xs font-semibold text-trust-strong">
              Available for Instant Payout
            </span>
            <CheckCircle2 className="h-4 w-4 text-trust" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-trust-strong">
            {formatNaira(availableNaira)}
          </div>
          <p className="font-secondary text-meta text-trust-strong/80">
            Disburses to your verified Nigerian NUBAN account in ~15 minutes.
          </p>
        </div>

        {/* Locked in Escrow */}
        <div className="border border-ink-faint bg-paper p-5 space-y-2 rounded-card">
          <div className="flex items-center justify-between">
            <span className="font-secondary text-xs font-semibold text-ink/65">
              Locked in Escrow Vault
            </span>
            <Lock className="h-4 w-4 text-ink/60" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-ink">
            {formatNaira(lockedInEscrowNaira)}
          </div>
          <p className="font-secondary text-meta text-ink/65">
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
          className="w-full sm:w-auto h-11 px-6 rounded-full bg-ink hover:bg-accent-orange text-white font-primary font-bold text-xs gap-2 transition-colors"
        >
          <ArrowDownRight className="h-4 w-4 text-trust" />
          <span>Withdraw Available Funds ({formatNaira(availableNaira)})</span>
        </Button>
      </div>
    </div>
  );
}

export default BalanceCard;
