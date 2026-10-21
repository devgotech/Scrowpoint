"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, Clock, DollarSign, Lock, Package, ShieldCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SellerStatsOverview Component (Phase 3 §1 - Seller Dashboard)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays seller metrics:
 *   1. Active Escrow Vault Balance (Held in custody)
 *   2. Available Balance for Payout
 *   3. Total Completed Sales (NGN)
 *   4. Active Listings & Completion Rate
 * - Token Compliance: 8px card radius, 4px badges, Roboto headings, Geist Mono currency.
 */

export interface SellerStatsData {
  escrowBalanceNaira: number;
  availableBalanceNaira: number;
  totalSalesNaira: number;
  activeListingsCount: number;
  completionRatePercent: number;
}

export interface SellerStatsOverviewProps {
  stats?: SellerStatsData;
  className?: string;
}

export function SellerStatsOverview({
  stats = {
    escrowBalanceNaira: 1530000,
    availableBalanceNaira: 420000,
    totalSalesNaira: 8450000,
    activeListingsCount: 5,
    completionRatePercent: 100,
  },
  className,
}: SellerStatsOverviewProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      label: "Locked in Escrow",
      value: formatNaira(stats.escrowBalanceNaira),
      subtext: "2 orders in 48h inspection",
      icon: Lock,
      isHighlight: true,
      badgeText: "Protected",
    },
    {
      label: "Available Payout",
      value: formatNaira(stats.availableBalanceNaira),
      subtext: "Ready for bank withdrawal",
      icon: DollarSign,
      badgeText: "NUBAN Ready",
    },
    {
      label: "Lifetime Volume",
      value: formatNaira(stats.totalSalesNaira),
      subtext: "18 successful trades",
      icon: TrendingUp,
      badgeText: "+14% MoM",
    },
    {
      label: "Seller Standing",
      value: `${stats.completionRatePercent}%`,
      subtext: `${stats.activeListingsCount} active gadget listings`,
      icon: ShieldCheck,
      badgeText: "SmileID NIN Verified",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {cards.map((card, i) => {
        const Icon = card.icon;

        return (
          <div
            key={i}
            className={cn(
              "rounded-[8px] border bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.06)] flex flex-col justify-between transition-all duration-200 ease-out hover:border-[#cbd5e1]",
              card.isHighlight ? "border-[#22c55e]/40 ring-1 ring-[#22c55e]/20" : "border-[#e2e8f0]"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-secondary text-xs text-[#64748b]">
                  {card.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[2px]",
                    card.isHighlight
                      ? "bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30"
                      : "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"
                  )}
                >
                  {card.badgeText}
                </span>
              </div>

              <div className="font-mono text-2xl font-extrabold text-[#020617] tracking-tight">
                {card.value}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] font-secondary text-[#64748b]">
              <span>{card.subtext}</span>
              <Icon className="h-3.5 w-3.5 text-[#0f172a]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SellerStatsOverview;
