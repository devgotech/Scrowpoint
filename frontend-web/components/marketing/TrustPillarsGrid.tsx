"use client";

import React from "react";
import {
  Clock,
  Eye,
  FileCheck,
  Lock,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  UserCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TrustPillarsGrid Component (Phase 1 §3 - Trust & Safety Hub)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays 4 core Trust & Safety pillars:
 *   1. 48-Hour Hardware Inspection SLA
 *   2. Segregated Paystack Escrow Vault
 *   3. SmileID Biometric Government ID Verification
 *   4. Independent Human Dispute Arbitration
 * - Token Compliance: 8px card radius, 4px badges, Roboto headings, Geist Mono metrics.
 */

export interface TrustPillar {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  metric: string;
  metricLabel: string;
  badge: string;
  description: string;
  points: string[];
}

export const TRUST_PILLARS: TrustPillar[] = [
  {
    id: "pillar-inspection",
    icon: Clock,
    title: "48-Hour Diagnostic SLA",
    metric: "48h",
    metricLabel: "Hardware Window",
    badge: "Buyer Protection",
    description:
      "Buyers hold unconditional rights to test battery health, TrueTone, FaceID, and cosmetic accuracy before any seller payout can occur.",
    points: [
      "Hardware diagnostic checklist standard",
      "Automatic freeze upon dispute filing",
      "No seller payout without buyer sign-off",
    ],
  },
  {
    id: "pillar-vault",
    icon: Lock,
    title: "Segregated Escrow Vault",
    metric: "100%",
    metricLabel: "Custodial Hold",
    badge: "Paystack Rail",
    description:
      "Buyer funds are held in dedicated trust accounts licensed by CBN. Neither party can touch or withdraw funds during transit.",
    points: [
      "Zero chargeback risk for sellers",
      "Immediate NIP bank settlement on release",
      "Append-only immutable transaction ledger",
    ],
  },
  {
    id: "pillar-kyc",
    icon: UserCheck,
    title: "SmileID Biometric KYC",
    metric: "100%",
    metricLabel: "NIN/BVN Checked",
    badge: "Identity Seal",
    description:
      "Every merchant must pass 3D active liveness checks and validate national identity documents to eliminate anonymous scam operations.",
    points: [
      "Anti-spoofing facial recognition",
      "National Identity Database validation",
      "Fraud blacklist & IMEI check",
    ],
  },
  {
    id: "pillar-dispute",
    icon: Scale,
    title: "Human Dispute Arbitration",
    metric: "12h",
    metricLabel: "Mediation SLA",
    badge: "Fair Verdict",
    description:
      "Impartial senior mediation officers inspect unboxing videos, diagnostic logs, and IMEI records to issue binding payouts or refunds.",
    points: [
      "Evidence locker with video proof",
      "Sub-case categorization (NAD, DOA)",
      "Strict 24h evidence submission window",
    ],
  },
];

export interface TrustPillarsGridProps {
  className?: string;
}

export function TrustPillarsGrid({ className }: TrustPillarsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {TRUST_PILLARS.map((pillar) => {
        const Icon = pillar.icon;

        return (
          <div
            key={pillar.id}
            className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] flex flex-col justify-between hover:border-[#cbd5e1] transition-all duration-200 ease-out"
          >
            <div>
              {/* Header Strip */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[4px] bg-[#0f172a] text-white shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-2.5 py-0.5 rounded-[4px]">
                  {pillar.badge}
                </span>
              </div>

              {/* Title & Metric */}
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-primary text-lg font-bold text-[#020617]">
                  {pillar.title}
                </h3>
                <div className="text-right">
                  <span className="font-mono text-xl font-extrabold text-[#020617]">
                    {pillar.metric}
                  </span>
                  <span className="block font-mono text-[10px] text-[#64748b]">
                    {pillar.metricLabel}
                  </span>
                </div>
              </div>

              <p className="font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed mb-4">
                {pillar.description}
              </p>

              {/* Bullet Features */}
              <ul className="space-y-2 border-t border-[#e2e8f0] pt-3">
                {pillar.points.map((pt, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs font-secondary text-[#020617]"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#22c55e] shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TrustPillarsGrid;
