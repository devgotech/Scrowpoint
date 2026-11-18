"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Fingerprint,
  Scale,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProtocolComparisonWidget
 *
 * Intuitive, low-cognitive-load interactive comparison between
 * "Unprotected P2P Channels" and "Scrowpoint Custodial Protocol".
 *
 * Shows ONE scenario at a time via a clean 4-tab switcher so the user's eye
 * only scans 2 short, high-contrast cards side-by-side at any moment.
 */

interface ComparisonScenario {
  id: string;
  index: string;
  shortLabel: string;
  roleFocus: string;
  icon: React.ReactNode;
  unprotectedTitle: string;
  unprotectedSummary: string;
  unprotectedConsequence: string;
  protectedTitle: string;
  protectedSummary: string;
  protectedGuarantee: string;
}

const SCENARIOS: ComparisonScenario[] = [
  {
    id: "payment",
    index: "01",
    shortLabel: "Payment Security",
    roleFocus: "Protects Sellers & Buyers",
    icon: <CreditCard className="h-4 w-4" />,
    unprotectedTitle: "Fake Bank Alerts & Transfer Reversals",
    unprotectedSummary:
      "You hand over an ₦850,000 iPhone or MacBook on a doctored SMS alert or an unconfirmed bank screenshot.",
    unprotectedConsequence: "100% Loss of Device & Cash",
    protectedTitle: "Segregated Paystack Vault Lock",
    protectedSummary:
      "100% of the buyer's deposit is verified and locked in custody before you ever dispatch the package.",
    protectedGuarantee: "₦0 Fake Alert Exposure",
  },
  {
    id: "hardware",
    index: "02",
    shortLabel: "Device Condition",
    roleFocus: "Protects Gadget Buyers",
    icon: <Clock className="h-4 w-4" />,
    unprotectedTitle: "Hidden Defects & Swapped Parts",
    unprotectedSummary:
      "You pay upfront on WhatsApp or classifieds only to discover boosted battery health, swapped screens, or iCloud locks.",
    unprotectedConsequence: "No Refund After Transfer",
    protectedTitle: "48-Hour Hardware Inspection SLA",
    protectedSummary:
      "Funds remain frozen for 48 hours after courier delivery while you test FaceID, TrueTone, battery cycles, and IMEI.",
    protectedGuarantee: "48H Full Diagnostic Window",
  },
  {
    id: "identity",
    index: "03",
    shortLabel: "Trader Identity",
    roleFocus: "Prevents Anonymous Fraud",
    icon: <Fingerprint className="h-4 w-4" />,
    unprotectedTitle: "Burner SIMs & Blocked Numbers",
    unprotectedSummary:
      "Anonymous social media vendors or buyers vanish immediately after payment with zero legal or banking trail.",
    unprotectedConsequence: "Untraceable Counterparty",
    protectedTitle: "SmileID Biometric NIN/BVN KYC",
    protectedSummary:
      "Every buyer and merchant passes 3D liveness + government ID verification before entering an escrow room.",
    protectedGuarantee: "100% Biometric Verified",
  },
  {
    id: "dispute",
    index: "04",
    shortLabel: "Dispute Resolution",
    roleFocus: "Enforceable Recourse",
    icon: <Scale className="h-4 w-4" />,
    unprotectedTitle: "Unmoderated Standoffs",
    unprotectedSummary:
      "When a device arrives damaged or differs from the listing, you are stuck with police reports or social media callouts.",
    unprotectedConsequence: "Weeks of Deadlock",
    protectedTitle: "1-Click Freeze & Engineering Audit",
    protectedSummary:
      "Tap 'Raise Dispute' within 48 hours to freeze the vault. Hardware engineers arbitrate using unboxing video & 3uTools logs.",
    protectedGuarantee: "Automated Vault Freeze",
  },
];

export interface ProtocolComparisonWidgetProps {
  className?: string;
}

export function ProtocolComparisonWidget({
  className,
}: ProtocolComparisonWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = SCENARIOS[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? SCENARIOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === SCENARIOS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={cn(
        "border border-ink/15 bg-surface text-left overflow-hidden rounded-card",
        className
      )}
    >
      {/* 1. Interactive Scenario Selector Tabs (Single-Focus Navigation) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-ink-faint bg-paper divide-y sm:divide-y-0 divide-x divide-ink-faint">
        {SCENARIOS.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "p-4 sm:px-5 sm:py-4 text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5",
                isActive
                  ? "bg-ink text-white"
                  : "bg-paper text-ink/70 hover:bg-surface hover:text-ink"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    "font-mono text-caption uppercase tracking-[0.15em] font-bold",
                    isActive ? "text-accent-orange" : "text-ink/50"
                  )}
                >
                  [{item.index}] Scenario
                </span>
                <span className={cn(isActive ? "text-white" : "text-ink/50")}>
                  {item.icon}
                </span>
              </div>
              <div className="font-primary text-sm sm:text-base font-bold tracking-[-0.02em]">
                {item.shortLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Single Focused Side-by-Side Comparison View (Only 2 Cards at a Glance) */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-faint">
        {/* Left Card: Without Escrow */}
        <div className="p-6 sm:p-10 bg-paper/40 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-[0.14em] font-bold text-state-error-strong">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Unprotected P2P Channels</span>
              </span>
              <span className="label">WhatsApp • Jiji • IG</span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <XCircle className="h-5 w-5 text-state-error-strong shrink-0 mt-1" />
              <div className="space-y-2">
                <h4 className="font-primary text-xl sm:text-2xl font-bold text-ink tracking-[-0.03em]">
                  {current.unprotectedTitle}
                </h4>
                <p className="font-secondary text-sm text-ink/70 leading-relaxed max-w-md">
                  {current.unprotectedSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 flex items-center justify-between font-mono text-xs">
            <span className="text-ink/55 uppercase tracking-wider">Outcome:</span>
            <span className="text-state-error-strong font-bold uppercase tracking-wider">
              {current.unprotectedConsequence}
            </span>
          </div>
        </div>

        {/* Right Card: With Scrowpoint Custody */}
        <div className="p-6 sm:p-10 bg-surface flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-[0.14em] font-bold text-trust-strong">
                <ShieldCheck className="h-4 w-4 text-trust shrink-0" />
                <span>Scrowpoint Custodial Protocol</span>
              </span>
              <span className="label !opacity-100 text-ink">
                {current.roleFocus}
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <CheckCircle2 className="h-5 w-5 text-trust shrink-0 mt-1" />
              <div className="space-y-2">
                <h4 className="font-primary text-xl sm:text-2xl font-bold text-ink tracking-[-0.03em]">
                  {current.protectedTitle}
                </h4>
                <p className="font-secondary text-sm text-ink/80 leading-relaxed max-w-md">
                  {current.protectedSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 flex items-center justify-between font-mono text-xs">
            <span className="text-ink/55 uppercase tracking-wider">Protection:</span>
            <span className="bg-trust/15 text-trust-strong border border-trust/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-meta">
              {current.protectedGuarantee}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Subtle Bottom Stepper Bar */}
      <div className="px-6 py-3.5 border-t border-ink-faint bg-paper flex items-center justify-between text-xs font-mono">
        <span className="text-ink/65 uppercase tracking-wider">
          Risk Vector {activeIndex + 1} of {SCENARIOS.length}:{" "}
          <strong className="text-ink">{current.shortLabel}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous scenario"
            className="h-8 w-8 border border-ink/15 bg-surface hover:border-ink flex items-center justify-center text-ink transition-colors cursor-pointer rounded-ui"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next scenario"
            className="h-8 px-3 border border-ink/15 bg-surface hover:border-ink flex items-center gap-1.5 text-ink font-bold uppercase tracking-wider text-meta transition-colors cursor-pointer rounded-ui"
          >
            <span>Next Vector</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProtocolComparisonWidget;
