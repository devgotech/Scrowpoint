"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EscrowFeeCalculator } from "@/components/marketing/EscrowFeeCalculator";
import {
  PricingTierCards,
  PRICING_TIERS,
} from "@/components/marketing/PricingTierCards";

/**
 * Screen 2: Fee Calculator & Pricing Tiers (Phase 1 §2)
 * Route: app/(marketing)/pricing/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - Sharp 0px architectural cards (border-[#111113]/12) paired with 999px pill primary CTAs
 */

export interface PricingPageProps {
  onBackToHome?: () => void;
  onExploreMarketplace?: () => void;
  onInitiateEscrow?: (amount: number) => void;
}

export default function PricingPage({
  onBackToHome,
  onInitiateEscrow,
}: PricingPageProps) {
  const [activeAmount, setActiveAmount] = useState<number>(450000);

  const handleSelectTier = (tier: (typeof PRICING_TIERS)[0]) => {
    if (tier.id === "tier-1") setActiveAmount(75000);
    else if (tier.id === "tier-2") setActiveAmount(350000);
    else setActiveAmount(850000);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      {/* 1. Global Navbar */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* Header Breadcrumb & Title */}
        <div className="bg-white border-b border-[#111113]/12 py-10 sm:py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-4">
              <Link
                href="/"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="font-bold text-[#111113]">
                Pricing &amp; Calculator
              </span>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#15803d] font-bold">
                <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>No Hidden Margins • Pure Custodial Settlement</span>
              </div>
              <h1 className="font-primary text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#111113] uppercase leading-[0.95]">
                TRANSPARENT ESCROW FEE STRUCTURE
                <span className="text-[#FF5A25]">.</span>
              </h1>
              <p className="font-secondary text-sm sm:text-base text-[#111113]/70 leading-relaxed max-w-2xl">
                We charge a low tiered fee on successful transactions. Sellers
                always receive 100% of their asking price, while buyer funds
                lock in segregated Paystack custody with an enforceable 48-hour
                hardware diagnostic SLA.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Dynamic Interactive Calculator */}
        <section aria-label="Fee Calculator" className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-6">
            <div>
              <span className="label block mb-1">
                [01] Custodial Math Simulator
              </span>
              <h2 className="font-primary text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                Instant Protection Simulation
                <span className="text-[#FF5A25]">.</span>
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
                Adjust the gadget price to calculate buyer deposit and 100%
                merchant net payout.
              </p>
            </div>

            <EscrowFeeCalculator
              initialAmount={activeAmount}
              onProceedToTrade={(details) =>
                onInitiateEscrow?.(details.amount)
              }
            />
          </div>
        </section>

        {/* Section 2: Pricing Tier Cards */}
        <section
          aria-label="Pricing Tiers"
          className="border-t border-[#111113]/12 bg-white py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="label block">[02] Tiered Custodial Rates</span>
              <h2 className="font-primary text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                Every Gadget Category Covered
                <span className="text-[#FF5A25]">.</span>
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70">
                Select any tier below to simulate representative values in the
                calculator above.
              </p>
            </div>

            <PricingTierCards onSelectTier={handleSelectTier} />
          </div>
        </section>

        {/* Section 3: FAQ & Settlement Terms */}
        <section className="border-t border-[#111113]/12 bg-[#F8F7F4] py-14 sm:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10 space-y-2">
              <span className="label block">[03] Settlement FAQ</span>
              <h3 className="font-primary text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                Frequently Asked Escrow Questions
                <span className="text-[#FF5A25]">.</span>
              </h3>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70">
                How custody, payouts, and chargeback protection work on
                Scrowpoint.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border border-[#111113]/12 bg-white divide-y md:divide-x divide-[#111113]/12 max-w-5xl mx-auto">
              {[
                {
                  q: "When does the seller get paid?",
                  a: "The seller receives payout automatically once the buyer completes the 48-hour hardware diagnostic and clicks 'Approve Payout', or if the 48-hour SLA expires with no open dispute.",
                },
                {
                  q: "What happens if the gadget is defective?",
                  a: "The buyer clicks 'Report Issue' before the 48-hour countdown ends. Funds are instantly hard-frozen in Paystack escrow, and an arbitration case is opened with our mediation desk.",
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
                <div key={i} className="p-6 space-y-2.5">
                  <div className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113] flex items-start gap-2.5">
                    <HelpCircle className="h-4 w-4 text-[#FF5A25] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </div>
                  <p className="font-secondary text-xs text-[#111113]/70 leading-relaxed pl-6">
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
