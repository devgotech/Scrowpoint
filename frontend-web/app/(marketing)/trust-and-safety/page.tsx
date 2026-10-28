"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrustPillarsGrid } from "@/components/marketing/TrustPillarsGrid";
import { PolicyAccordion } from "@/components/marketing/PolicyAccordion";
import { EscrowTimelineExplainer } from "@/components/marketing/EscrowTimelineExplainer";
import { ProtocolComparisonWidget } from "@/components/marketing/ProtocolComparisonWidget";

/**
 * Screen: Trust & Safety Hub (Phase 1 §3) — Design Variation 7
 * Route: app/(marketing)/trust-and-safety/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: ProtocolComparisonWidget, TrustPillarsGrid, EscrowTimelineExplainer, PolicyAccordion.
 * - Architecture Link: Static marketing page outlining 48-hour SLA, anti-fraud measures, and verification rules.
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-[#F8F7F4]">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Header Breadcrumb & Editorial Hero */}
        <div className="bg-[#F8F7F4] border-b border-[#111113]/12 py-12 sm:py-20">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
            <div className="flex items-center gap-2 mb-5">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#111113]/60 hover:text-[#111113] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#111113]/30 text-xs">/</span>
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#111113]">
                Trust &amp; Safety Hub
              </span>
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-[#15803d] font-bold">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>Institutional Fraud Prevention Protocol</span>
              </div>
              <h1 className="font-primary text-4xl sm:text-6xl font-bold tracking-[-0.04em] text-[#111113] leading-[0.95] uppercase">
                TRUST &amp; SAFETY AT SCROWPOINT<span className="text-[#FF5A25]">.</span>
              </h1>
              <p className="font-secondary text-base sm:text-lg text-[#111113]/70 leading-relaxed max-w-2xl">
                We engineered Nigeria&apos;s custodial escrow framework for high-value secondhand gadgets. Every trade is fortified with SmileID biometric KYC, segregated Paystack holding vaults, and an enforceable 48-hour hardware diagnostic SLA.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Interactive Single-Focus Comparison (Unprotected P2P vs. Scrowpoint Custody) */}
        <section
          aria-label="Unprotected P2P vs Scrowpoint Custody"
          className="py-14 sm:py-20 border-b border-[#111113]/12 bg-[#F8F7F4]"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="label block mb-2">Interactive Risk Comparison</span>
                <h2 className="font-primary text-2xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                  UNPROTECTED P2P CHANNELS VS. SCROWPOINT CUSTODY<span className="text-[#FF5A25]">.</span>
                </h2>
              </div>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 max-w-md">
                Select any of the 4 trade stages below to see how Scrowpoint eliminates counterparty fraud compared to direct WhatsApp or classified transfers.
              </p>
            </div>

            <ProtocolComparisonWidget />
          </div>
        </section>

        {/* Section 2: 4 Core Pillars */}
        <section
          aria-label="Trust Pillars"
          className="py-14 sm:py-20 border-b border-[#111113]/12 bg-[#F8F7F4]"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-8">
            <div className="max-w-xl space-y-2">
              <span className="label block">Pillars of Integrity</span>
              <h2 className="font-primary text-2xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                HOW WE ELIMINATE COUNTERPARTY FRAUD<span className="text-[#FF5A25]">.</span>
              </h2>
            </div>

            <TrustPillarsGrid />
          </div>
        </section>

        {/* Section 3: Escrow Timeline Explainer */}
        <section
          aria-label="Escrow Timeline"
          className="py-14 sm:py-20 bg-white border-b border-[#111113]/12"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
            <EscrowTimelineExplainer />
          </div>
        </section>

        {/* Section 4: Detailed Policy Accordion */}
        <section aria-label="Policy Details" className="py-14 sm:py-20 bg-[#F8F7F4]">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-8">
            <div className="max-w-2xl">
              <span className="label block mb-2">Statutory Guidelines</span>
              <h2 className="font-primary text-2xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                FREQUENTLY CLARIFIED TRUST POLICIES<span className="text-[#FF5A25]">.</span>
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-2">
                Transparent rules governing inspection claims, counterfeit devices, and payment releases.
              </p>
            </div>

            <PolicyAccordion />

            {/* Bottom CTA Banner */}
            <div className="mt-12 v7-card flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="label block mb-1">Zero Counterparty Exposure</span>
                <h3 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113]">
                  Ready to trade with 100% escrow protection?
                </h3>
                <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
                  Browse verified gadgets in the marketplace or calculate your escrow fee in seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onNavigateMarketplace}
                    className="btn-primary w-full sm:w-auto text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2"
                  >
                    <span>Browse Marketplace</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link href="/pricing" className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onNavigatePricing}
                    className="w-full sm:w-auto rounded-full border border-[#111113]/20 bg-white px-6 py-3.5 text-xs font-mono uppercase tracking-wider font-bold text-[#111113] hover:border-[#111113] transition-colors cursor-pointer"
                  >
                    <span>Fee Calculator</span>
                  </button>
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
