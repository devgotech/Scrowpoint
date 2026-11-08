"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Package,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EscrowTimelineExplainer Component (Phase 1 §3 - Trust & Safety Hub)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Visual interactive 5-stage timeline explaining lifecycle from fund lock to payout or dispute.
 * - Token Compliance: 8px container radius, 4px badges, Roboto headings, Geist Mono steps.
 */

export interface TimelineStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  statusBadge: string;
  badgeVariant?: "trust" | "warning" | "default";
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    step: "01",
    title: "Buyer Funds Locked in Escrow",
    subtitle: "Paystack Segregated Vault",
    description:
      "Buyer initiates purchase and deposits agreed price into a secure custodial account. Seller is notified that 100% of the funds are locked.",
    icon: Lock,
    statusBadge: "100% Guaranteed",
    badgeVariant: "trust",
  },
  {
    step: "02",
    title: "Tracked Logistics Dispatch",
    subtitle: "Insured Waybill & Courier",
    description:
      "Seller dispatches device via registered logistics (GIG, DHL, Fez) with real-time waybill tracking and signature confirmation.",
    icon: Truck,
    statusBadge: "Waybill Verified",
    badgeVariant: "default",
  },
  {
    step: "03",
    title: "Delivery & 48H Diagnostic Window",
    subtitle: "Comprehensive Hardware SLA",
    description:
      "Buyer accepts delivery and begins a strict 48-hour hardware audit covering battery health, display digitizer, FaceID, and clean activation status.",
    icon: Clock,
    statusBadge: "48H Window Active",
    badgeVariant: "warning",
  },
  {
    step: "04",
    title: "Buyer Approval or Dispute Report",
    subtitle: "Dual Resolution Pathway",
    description:
      "Buyer clicks 'Release Funds' upon satisfaction. If device has undisclosed defects, clicking 'Report Issue' freezes the escrow vault for human arbitration.",
    icon: Scale,
    statusBadge: "Dual Safeguard",
    badgeVariant: "trust",
  },
  {
    step: "05",
    title: "Instant Settlement or Full Refund",
    subtitle: "Direct NIP Bank Rail",
    description:
      "On approval, seller receives payout within 15 minutes. In verified disputes, buyer receives 100% refund upon return courier receipt.",
    icon: CheckCircle2,
    statusBadge: "15-Min Payout",
    badgeVariant: "trust",
  },
];

export interface EscrowTimelineExplainerProps {
  className?: string;
}

export function EscrowTimelineExplainer({ className }: EscrowTimelineExplainerProps) {
  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white p-6 sm:p-8 space-y-6",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#111113]/12">
        <div>
          <span className="label">
            Protocol Lifecycle
          </span>
          <h3 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113] mt-1">
            The Scrowpoint Escrow Cycle
          </h3>
          <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
            How funds, goods, and hardware inspections move through our platform.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-[#15803d]">
          <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
          <span>Paystack Custodial Hold</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {TIMELINE_STEPS.map((s, idx) => {
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className="border border-[#111113]/12 bg-[#F8F7F4] p-4 flex flex-col justify-between space-y-3 relative group hover:border-[#111113]/40 hover:bg-white transition-all duration-200 ease-out"
            >
              <div>
                {/* Step & Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-[#111113] text-white font-mono text-xs font-bold">
                    {s.step}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase font-bold px-1.5 py-0.5",
                      s.badgeVariant === "trust"
                        ? "bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30"
                        : s.badgeVariant === "warning"
                        ? "bg-[#ecc94b]/20 text-[#975a16] border border-[#ecc94b]/40"
                        : "bg-white text-[#111113]/70 border border-[#111113]/12"
                    )}
                  >
                    {s.statusBadge}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-[#111113]" />
                  <h4 className="font-primary text-xs font-bold tracking-[-0.02em] text-[#111113] leading-snug">
                    {s.title}
                  </h4>
                </div>

                <div className="label text-[9.5px]! mb-2">
                  {s.subtitle}
                </div>

                <p className="font-secondary text-[11px] text-[#111113]/70 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#111113]/12 flex items-center justify-between text-[10px] font-mono text-[#111113]/60">
                <span>State</span>
                <span className="font-bold text-[#111113]">Stage {idx + 1}/5</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EscrowTimelineExplainer;
