"use client";

import React from "react";
import { Check, Info, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PricingTierCards Component (Phase 1 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays the 3 transparent fee tiers of Scrowpoint Escrow.
 * - Corner Radius: 8px on cards (rounded-[8px]), 4px on badges/chips (rounded-[4px]).
 * - Typography: Roboto headings (font-primary), Geist body (font-secondary), Geist Mono for percentages.
 * - Responsive: 1-col on mobile, 3-col on lg desktop.
 */

export interface PricingTier {
  id: string;
  name: string;
  range: string;
  feePercent: number;
  minFeeText: string;
  description: string;
  targetGadgets: string;
  isPopular?: boolean;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "tier-1",
    name: "Entry / Accessories",
    range: "₦10,000 — ₦100,000",
    feePercent: 5.0,
    minFeeText: "Min ₦1,500",
    description: "Ideal for earbuds, smartwatches, power banks, and budget Android devices.",
    targetGadgets: "Earbuds, Smartwatches, Minor Accessories",
    features: [
      "48-hour hardware inspection SLA",
      "Paystack segregated vault holding",
      "Direct carrier waybill tracking",
      "Automated SMS/Email milestone alerts",
    ],
  },
  {
    id: "tier-2",
    name: "Mid-Range Gadgets",
    range: "₦100,001 — ₦500,000",
    feePercent: 3.5,
    minFeeText: "Standard Tier",
    isPopular: true,
    description: "Optimized for flagship smartphones, iPads, consoles, and creative equipment.",
    targetGadgets: "iPhone 11–13, Galaxy S21/S22, PS5, iPad Air",
    features: [
      "All Tier 1 features included",
      "IMEI / Serial blacklist verification",
      "Priority 12-hour dispute arbitration SLA",
      "Doorstep sign-off photo evidence archive",
    ],
  },
  {
    id: "tier-3",
    name: "High-Value Flagships & Laptops",
    range: "₦500,001+",
    feePercent: 2.5,
    minFeeText: "Lowest Percentage",
    description: "Designed for premium MacBook Pros, iPhone Pro Max flagships, and workstations.",
    targetGadgets: "MacBook Pro, iPhone 14/15 Pro Max, High-end PC",
    features: [
      "Lowest 2.5% institutional escrow rate",
      "Dedicated senior mediation officer",
      "High-value transit insurance rider coverage",
      "Direct bank settlement within 15 minutes of release",
    ],
  },
];

export interface PricingTierCardsProps {
  className?: string;
  selectedTierId?: string;
  onSelectTier?: (tier: PricingTier) => void;
}

export function PricingTierCards({
  className,
  selectedTierId,
  onSelectTier,
}: PricingTierCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {PRICING_TIERS.map((tier) => {
        const isSelected = selectedTierId === tier.id;

        return (
          <div
            key={tier.id}
            onClick={() => onSelectTier?.(tier)}
            className={cn(
              "relative flex flex-col justify-between rounded-[8px] border bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out cursor-pointer",
              tier.isPopular
                ? "border-[#0f172a] ring-1 ring-[#0f172a]"
                : "border-[#e2e8f0] hover:border-[#cbd5e1]",
              isSelected && "ring-2 ring-[#22c55e] border-[#22c55e]"
            )}
          >
            {/* Popular Indicator */}
            {tier.isPopular && (
              <div className="absolute -top-3 left-6 bg-[#0f172a] text-white px-2.5 py-0.5 rounded-[4px] font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                Most Common
              </div>
            )}

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-primary text-base font-bold text-[#020617]">
                  {tier.name}
                </span>
                <span className="font-mono text-xs font-semibold text-[#64748b]">
                  {tier.minFeeText}
                </span>
              </div>

              {/* Price / Rate */}
              <div className="flex items-baseline gap-1 my-3">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#020617]">
                  {tier.feePercent.toFixed(1)}%
                </span>
                <span className="font-secondary text-xs text-[#64748b]">
                  of gadget value
                </span>
              </div>

              {/* Range badge */}
              <div className="inline-block bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 rounded-[4px] font-mono text-[11px] font-medium text-[#0f172a] mb-4">
                {tier.range}
              </div>

              <p className="font-secondary text-xs text-[#64748b] leading-relaxed mb-6">
                {tier.description}
              </p>

              {/* Target gadgets chip */}
              <div className="mb-6 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0] p-2.5">
                <div className="font-mono text-[10px] uppercase font-semibold text-[#64748b] mb-1">
                  Typical Devices
                </div>
                <div className="font-secondary text-xs font-medium text-[#020617]">
                  {tier.targetGadgets}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 border-t border-[#e2e8f0] pt-4 mb-6">
                {tier.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-secondary text-[#020617]">
                    <Check className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom action cue */}
            <div className="pt-4 border-t border-[#e2e8f0]">
              <button
                type="button"
                className={cn(
                  "w-full h-10 rounded-[4px] text-xs font-medium transition-all duration-200 ease-out flex items-center justify-center gap-1.5",
                  tier.isPopular
                    ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
                    : "bg-[#f8fafc] border border-[#e2e8f0] text-[#020617] hover:bg-[#f1f5f9]"
                )}
              >
                <Zap className="h-3.5 w-3.5 text-[#ecc94b]" />
                <span>Test this tier in calculator</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PricingTierCards;
