"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, HelpCircle, Lock, ShieldCheck, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EscrowFeeCalculator } from "@/components/marketing/EscrowFeeCalculator";
import { PricingTierCards, PRICING_TIERS } from "@/components/marketing/PricingTierCards";
import { Button } from "@/components/ui/button";

/**
 * Screen 2: Fee Calculator & Pricing Tiers (Phase 1 §2)
 * Route: app/(marketing)/pricing/page.tsx
 *
 * Architecture Requirements:
 * - Components: EscrowFeeCalculator, PricingTierCards.
 * - Architecture Link: Pure client-side React component. Calculates amount * fee_percentage
 *   to instantly display buyer protection fee and seller payout without hitting the Go backend.
 * - States: Responsive layout, mobile calculator drawer / full-stack cards.
 * - Strict Compliance: 4_ui_system.md tokens and layout boundaries (1280px max-width).
 */

export interface PricingPageProps {
  onBackToHome?: () => void;
  onExploreMarketplace?: () => void;
  onInitiateEscrow?: (amount: number) => void;
}

export default function PricingPage({
  onBackToHome,
  onExploreMarketplace,
  onInitiateEscrow,
}: PricingPageProps) {
  const [activeAmount, setActiveAmount] = useState<number>(450000);

  const handleSelectTier = (tier: (typeof PRICING_TIERS)[0]) => {
    if (tier.id === "tier-1") setActiveAmount(75000);
    else if (tier.id === "tier-2") setActiveAmount(350000);
    else setActiveAmount(850000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      {/* 1. Global Navbar */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* Header Breadcrumb & Title */}
        <div className="bg-white border-b border-[#e2e8f0] py-8 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a]">Pricing & Calculator</span>
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 px-3 py-1 text-xs font-mono font-semibold text-[#15803d] mb-3">
                <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>NO HIDDEN MARGINS • PURE CUSTODY</span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-tight text-[#020617]">
                Transparent Escrow Fee Structure
              </h1>
              <p className="font-secondary text-sm sm:text-base text-[#64748b] mt-2 leading-relaxed">
                We charge a low tiered fee on successful transactions. Funds are held in a segregated Paystack vault with an enforceable 48-hour hardware diagnostic SLA.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Dynamic Interactive Calculator */}
        <section aria-label="Fee Calculator" className="py-10 sm:py-14">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-primary text-xl font-bold text-[#020617]">
                  Instant Protection Simulation
                </h2>
                <p className="font-secondary text-xs text-[#64748b]">
                  Adjust the gadget price to calculate buyer deposit and seller take-home.
                </p>
              </div>
            </div>

            <EscrowFeeCalculator
              initialAmount={activeAmount}
              onProceedToTrade={(details) => onInitiateEscrow?.(details.amount)}
            />
          </div>
        </section>

        {/* Section 2: Pricing Tier Cards */}
        <section
          aria-label="Pricing Tiers"
          className="border-t border-[#e2e8f0] bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Tiered Rates
              </span>
              <h2 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                Every Gadget Category Covered
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b]">
                Select any tier below to simulate representative values in the calculator above.
              </p>
            </div>

            <PricingTierCards onSelectTier={handleSelectTier} />
          </div>
        </section>

        {/* Section 3: FAQ & Settlement Terms */}
        <section className="border-t border-[#e2e8f0] bg-[#f8fafc] py-12 sm:py-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h3 className="font-primary text-xl font-bold text-[#020617]">
                Frequently Asked Escrow Questions
              </h3>
              <p className="font-secondary text-xs text-[#64748b] mt-1">
                How custody, payouts, and chargeback protection work on Scrowpoint.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {[
                {
                  q: "When does the seller get paid?",
                  a: "The seller receives payout automatically once the buyer completes the 48-hour hardware diagnostic and clicks 'Release Funds', or if the 48-hour SLA expires with no open dispute.",
                },
                {
                  q: "What happens if the gadget is defective?",
                  a: "The buyer clicks 'Report Issue' before the 48-hour countdown ends. Funds are instantly hard-frozen in Paystack escrow, and an arbitration case is opened with our human mediation desk.",
                },
                {
                  q: "Can a buyer do a bank chargeback?",
                  a: "No. Buyer funds are settled via direct Paystack NUBAN bank transfer or debit card into an institutional escrow vault. Bank chargebacks are legally preempted by the signed escrow agreement.",
                },
                {
                  q: "Who pays for return shipping if disputed?",
                  a: "If the seller misrepresented device condition (e.g. counterfeit screen, failed FaceID), the seller forfeits return transit fees. If the buyer simply changed their mind on an accurate item, the buyer pays.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-xs space-y-2"
                >
                  <div className="font-primary text-sm font-bold text-[#020617] flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-[#0f172a] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </div>
                  <p className="font-secondary text-xs text-[#64748b] leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
