"use client";

import React from "react";
import {
  Clock,
  Database,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  Truck,
  UserCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ValuePropGrid Component for Scrowpoint Landing Page.
 *
 * Requirements (5_screen_flows.md Phase 1 §1 & 4_ui_system.md):
 * - 6-item Value Proposition Grid outlining core architectural escrow pillars.
 * - Corner Radius: --radius-card (8px -> rounded-[8px]) on feature cards; --radius-control (4px -> rounded-[4px]) on icon holders.
 * - Shadows: --shadow-soft-sm (0 2px 4px rgba(15,23,42,0.06)).
 * - Typography: font-primary (Geist) for headings, font-secondary (Inter) for copy, font-mono (Inter Tabular) for metrics.
 * - Responsive: 1-col on mobile, 2-col on sm/md, 3-col on lg screens.
 */

export interface ValuePropItem {
  id: string;
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
      className={cn("py-14 sm:py-20 bg-white", className)}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            Architectural Guarantees
          </span>
          <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#020617]">
            Built from the Ground Up for Absolute Trust
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[#64748b] leading-relaxed">
            Standard classifieds leave buyers and sellers exposed to scams. Scrowpoint
            engineers every trade with bank-grade custodial rules.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;

            return (
              <div
                key={prop.id}
                className="group relative flex flex-col justify-between rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:border-[#cbd5e1] hover:shadow-[0_4px_8px_rgba(15,23,42,0.06)]"
              >
                <div>
                  {/* Icon & Badge Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] group-hover:bg-[#0f172a] group-hover:text-white transition-colors duration-200 ease-out shadow-xs">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px]",
                        prop.badgeColor === "trust"
                          ? "bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30"
                          : prop.badgeColor === "warning"
                          ? "bg-[#ecc94b]/20 text-[#975a16] border border-[#ecc94b]/40"
                          : "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"
                      )}
                    >
                      {prop.highlightText}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-primary text-base font-medium text-[#020617] group-hover:text-[#0f172a]">
                    {prop.title}
                  </h3>
                  <div className="font-mono text-xs text-[#64748b] mt-0.5">
                    {prop.subtitle}
                  </div>

                  {/* Description */}
                  <p className="mt-3 font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                  <span>Protocol Standard</span>
                  <span className="font-medium text-[#020617]">Enforced</span>
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
