"use client";

import React from "react";
import {
  Clock,
  Database,
  Lock,
  Scale,
  Truck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ValuePropGrid Component for Scrowpoint Landing Page — Design Variation 7.
 */

export interface ValuePropItem {
  id: string;
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  highlightText: string;
  badgeColor?: "trust" | "warning" | "default";
}

export const VALUE_PROPS: ValuePropItem[] = [
  {
    id: "escrow-vault",
    index: "01",
    icon: Lock,
    title: "Segregated Escrow Vault",
    subtitle: "Paystack Custodial Hold",
    description:
      "Buyer funds are locked in dedicated escrow vaults prior to seller shipping. Sellers never risk fraudulent reversals, and buyers never lose money to vanishing sellers.",
    highlightText: "Zero Chargeback Risk",
    badgeColor: "trust",
  },
  {
    id: "inspection-period",
    index: "02",
    icon: Clock,
    title: "48-Hour Inspection Window",
    subtitle: "Hardware Diagnostic SLA",
    description:
      "Once delivered, the buyer has a strict 48-hour inspection countdown to test battery health, TrueTone, carrier status, and cosmetic condition before payout releases.",
    highlightText: "48H Return Right",
    badgeColor: "trust",
  },
  {
    id: "smileid-kyc",
    index: "03",
    icon: UserCheck,
    title: "SmileID Biometric KYC",
    subtitle: "Government ID Checked",
    description:
      "Sellers must pass live selfie liveness checks and verify against national identity databases (NIN / BVN) before listing or withdrawing funds.",
    highlightText: "No Anonymous Sellers",
    badgeColor: "trust",
  },
  {
    id: "tracked-shipping",
    index: "04",
    icon: Truck,
    title: "Tracked Courier Dispatch",
    subtitle: "Doorstep Signature Required",
    description:
      "All packages ship through verified logistics partners (GIG, DHL, Fez) with real-time tracking webhooks and tamper-evident courier handoff.",
    highlightText: "Waybill Verified",
    badgeColor: "default",
  },
  {
    id: "immutable-ledger",
    index: "05",
    icon: Database,
    title: "Append-Only Escrow Ledger",
    subtitle: "Postgres Immutability",
    description:
      "Every deposit, fee deduction, and release triggers an immutable financial record. Database-level triggers block historical tampering or duplicate withdrawals.",
    highlightText: "Audit-Grade Accounting",
    badgeColor: "default",
  },
  {
    id: "dispute-mediation",
    index: "06",
    icon: Scale,
    title: "Human Dispute Arbitration",
    subtitle: "Sub-Case Support",
    description:
      "If a device fails hardware audit, funds are hard-frozen instantly. Human mediation officers inspect photographic/video proof within an enforced 24-hour SLA.",
    highlightText: "24h Mediation SLA",
    badgeColor: "warning",
  },
];

export interface ValuePropGridProps {
  className?: string;
}

export function ValuePropGrid({ className }: ValuePropGridProps) {
  return (
    <section
      aria-label="Value Propositions"
      className={cn("py-20 sm:py-24 bg-[#F8F7F4]", className)}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="label block mb-3">Architectural Guarantees</span>
            <h2 className="font-primary text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#111113] leading-none">
              BUILT FOR ABSOLUTE TRUST.
            </h2>
          </div>
          <p className="font-secondary text-sm sm:text-base text-[#111113]/70 max-w-md leading-relaxed">
            Standard classifieds leave buyers and sellers exposed to scams. Scrowpoint engineers every trade with bank-grade custodial rules.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;

            return (
              <div
                key={prop.id}
                className="v7-card group flex flex-col justify-between transition-colors duration-200 hover:border-[#111113]/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="label">[{prop.index}] {prop.subtitle}</span>
                    <div className="flex h-10 w-10 items-center justify-center border border-[#111113]/15 bg-[#F8F7F4] text-[#111113] group-hover:bg-[#111113] group-hover:text-white transition-colors duration-200">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
                    {prop.title}
                  </h3>

                  <p className="mt-3 font-secondary text-sm text-[#111113]/70 leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#111113]/12 flex items-center justify-between">
                  <span className="label">{prop.highlightText}</span>
                  <span className="font-mono text-xs font-bold text-[#111113]">
                    ENFORCED
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ValuePropGrid;
