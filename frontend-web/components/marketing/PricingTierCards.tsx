"use client";

import React from "react";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PricingTierCards Component (Phase 1 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays the 3 transparent fee tiers of Scrowpoint Escrow.
 * - Corner Radius: 8px on cards (rounded-ui), 4px on badges/chips (rounded-ui).
 * - Typography: Geist headings (font-primary), Inter body (font-secondary), Inter Tabular for percentages (font-mono).
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
      {PRICING_TIERS.map((tier, index) => {
        const isSelected = selectedTierId === tier.id;

        return (
          <div
            key={tier.id}
            onClick={() => onSelectTier?.(tier)}
            className={cn(
              "v7-card relative flex flex-col justify-between transition-all duration-200 ease-out cursor-pointer",
              tier.isPopular
                ? "border-ink ring-1 ring-ink"
                : "border-ink-faint hover:border-ink/40",
              isSelected && "ring-2 ring-accent-orange border-accent-orange"
            )}
          >
            {/* Popular Indicator */}
            {tier.isPopular && (
              <div className="absolute -top-3 left-6 bg-ink text-white px-2.5 py-0.5 font-mono text-caption font-bold tracking-[0.12em] uppercase">
                Most Common
              </div>
            )}

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="label">
                  [0{index + 1}] {tier.minFeeText}
                </span>
              </div>

              <h3 className="font-primary text-xl font-bold tracking-[-0.04em] text-ink">
                {tier.name}
              </h3>

              {/* Price / Rate */}
              <div className="flex items-baseline gap-1.5 my-3">
                <span className="font-primary text-4xl font-bold tracking-[-0.04em] text-ink">
                  {tier.feePercent.toFixed(1)}%
                </span>
                <span className="font-secondary text-xs text-ink/65">
                  of gadget value
                </span>
              </div>

              {/* Range badge */}
              <div className="inline-block bg-paper border border-ink-faint px-2.5 py-1 font-mono text-meta font-semibold text-ink mb-4 rounded-card">
                {tier.range}
              </div>

              <p className="font-secondary text-xs text-ink/70 leading-relaxed mb-6">
                {tier.description}
              </p>

              {/* Target gadgets chip */}
              <div className="mb-6 bg-paper border border-ink-faint p-3 rounded-card">
                <div className="label mb-1">
                  Typical Devices
                </div>
                <div className="font-secondary text-xs font-semibold text-ink">
                  {tier.targetGadgets}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 border-t border-ink-faint pt-4 mb-6">
                {tier.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-secondary text-ink">
                    <Check className="h-4 w-4 text-trust shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom action cue */}
            <div className="pt-4 border-t border-ink-faint">
              <button
                type="button"
                className={cn(
                  "w-full h-10 rounded-full text-xs font-semibold transition-all duration-200 ease-out flex items-center justify-center gap-1.5",
                  tier.isPopular
                    ? "bg-ink text-white hover:bg-accent-orange"
                    : "bg-paper border border-ink/15 text-ink hover:bg-ink hover:text-white"
                )}
              >
                <Zap className="h-3.5 w-3.5 text-accent-orange" />
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
