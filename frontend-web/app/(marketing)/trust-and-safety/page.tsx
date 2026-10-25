"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrustPillarsGrid } from "@/components/marketing/TrustPillarsGrid";
import { PolicyAccordion } from "@/components/marketing/PolicyAccordion";
import { EscrowTimelineExplainer } from "@/components/marketing/EscrowTimelineExplainer";
import { Button } from "@/components/ui/button";

/**
 * Screen: Trust & Safety Hub (Phase 1 §3)
 * Route: app/(marketing)/trust-and-safety/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: TrustPillarsGrid, PolicyAccordion, EscrowTimelineExplainer.
 * - Architecture Link: Fully static marketing page outlining 48-hour SLA, anti-fraud measures, and verification rules.
 * - Responsive: Full desktop layout, clean mobile stacking with touch-friendly 44px targets.
 */

export interface TrustAndSafetyPageProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigatePricing?: () => void;
}

export default function TrustAndSafetyPage({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigatePricing,
}: TrustAndSafetyPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Header Breadcrumb & Hero */}
        <div className="bg-white border-b border-[#e2e8f0] py-8 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a]">
                Trust & Safety Hub
              </span>
            </div>

            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 px-3 py-1 text-xs font-mono font-semibold text-[#15803d]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>INSTITUTIONAL GRADE FRAUD PREVENTION</span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-tight text-[#020617]">
                Trust & Safety at Scrowpoint
              </h1>
              <p className="font-secondary text-sm sm:text-base text-[#64748b] leading-relaxed">
                We engineered Nigeria's first custodial escrow framework for secondhand gadgets. Every trade is fortified with biometric KYC, segregated holding accounts, and an enforceable 48-hour hardware diagnostic SLA.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: 4 Core Pillars */}
        <section aria-label="Trust Pillars" className="py-10 sm:py-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Pillars of Integrity
              </span>
              <h2 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                How We Eliminate Fraud
              </h2>
            </div>

            <TrustPillarsGrid />
          </div>
        </section>

        {/* Section 2: Escrow Timeline Explainer */}
        <section
          aria-label="Escrow Timeline"
          className="py-10 sm:py-16 bg-white border-y border-[#e2e8f0]"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
            <EscrowTimelineExplainer />
          </div>
        </section>

        {/* Section 3: Detailed Policy Accordion */}
        <section aria-label="Policy Details" className="py-10 sm:py-16 bg-[#f8fafc]">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="max-w-2xl mb-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Statutory Guidelines
              </span>
              <h2 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617] mt-1">
                Frequently Clarified Trust Policies
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-1">
                Transparent rules governing inspection claims, counterfeit devices, and payment releases.
              </p>
            </div>

            <PolicyAccordion />

            {/* Bottom CTA Banner */}
            <div className="mt-12 rounded-[8px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-primary text-lg font-bold text-[#020617]">
                  Ready to trade with zero fraud risk?
                </h3>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
                  Browse pre-inspected gadgets or calculate your protection fee.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={onNavigateMarketplace}
                    className="w-full sm:w-auto h-11 px-5 text-xs font-semibold gap-2 shadow-xs"
                  >
                    <span>Browse Gadgets</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onNavigatePricing}
                    className="w-full sm:w-auto h-11 px-5 text-xs font-medium border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#020617]"
                  >
                    <span>Fee Calculator</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
