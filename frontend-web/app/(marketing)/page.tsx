"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ValuePropGrid } from "@/components/marketing/ValuePropGrid";
import { Footer } from "@/components/Footer";

/**
 * Screen 1: Landing Page & Marketing — Design Variation 7
 * Route: app/(marketing)/page.tsx
 */

export interface LandingPageProps {
  onNavigateToPricing?: () => void;
  onNavigateToMarketplace?: () => void;
  onNavigateToEscrow?: (orderId?: string) => void;
}

export default function LandingPage({
  onNavigateToPricing,
  onNavigateToMarketplace,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-[#F8F7F4]">
      {/* 1. Variation 7 Public Top Navigation */}
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 w-full">
        {/* 2. Variation 7 Hero Section & 3 Core Cards */}
        <HeroSection onExploreClick={onNavigateToMarketplace} />

        {/* 3. 3-Step Escrow Execution Protocol */}
        <section
          aria-label="How Escrow Works"
          className="border-b border-[#111113]/12 bg-[#F8F7F4] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <span className="label block mb-3">Escrow Execution Protocol</span>
                <h2 className="font-primary text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#111113] leading-none">
                  HOW SCROWPOINT PROTECTS EVERY TRADE.
                </h2>
              </div>
              <p className="font-secondary text-sm sm:text-base text-[#111113]/70 max-w-md">
                Three deterministic stages ensure you never pay for a faulty device or ship to an unverified buyer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="v7-card flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="label">[STEP 01]</span>
                    <span className="label !opacity-100 text-[#FF5A25]">Paystack Vault</span>
                  </div>
                  <h3 className="font-primary text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                    Lock Funds in Custody
                  </h3>
                  <p className="font-secondary text-sm text-[#111113]/70 leading-relaxed">
                    You transfer funds to an isolated escrow vault. The seller is notified that 100% of the payment is locked, eliminating fake bank alert scams.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#111113]/12 font-mono text-xs text-[#15803d] flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" />
                  <span>Zero chargeback risk for seller</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="v7-card flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="label">[STEP 02]</span>
                    <span className="label !opacity-100">Tracked Courier</span>
                  </div>
                  <h3 className="font-primary text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                    Insured Dispatch
                  </h3>
                  <p className="font-secondary text-sm text-[#111113]/70 leading-relaxed">
                    Seller ships via registered logistics partner (DHL, GIG, or Fez) with waybill verification and mandatory pre-shipment video proof.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#111113]/12 font-mono text-xs text-[#111113]/75 flex items-center gap-2 font-semibold">
                  <Truck className="h-4 w-4 text-[#111113] shrink-0" />
                  <span>Waybill tracked end-to-end</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="v7-card flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="label">[STEP 03]</span>
                    <span className="label !opacity-100 text-[#15803d]">48-Hour SLA</span>
                  </div>
                  <h3 className="font-primary text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                    Inspect &amp; Release
                  </h3>
                  <p className="font-secondary text-sm text-[#111113]/70 leading-relaxed">
                    Buyer receives the gadget and has 48 hours to verify screen, battery health, and iCloud status. Once approved, payout releases automatically.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#111113]/12 font-mono text-xs text-[#15803d] flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[#22c55e] shrink-0" />
                  <span>Instant freeze if device fails audit</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Value Propositions Grid */}
        <ValuePropGrid />

        {/* 5. Pricing / Fee Calculator Teaser Section */}
        <section
          aria-label="Pricing Teaser"
          className="border-t border-[#111113]/12 bg-[#F8F7F4] py-20"
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
            <div className="v7-card flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center lg:text-left">
                <span className="label block">Transparent Tiered Escrow Fees</span>
                <h3 className="font-primary text-3xl sm:text-4xl font-bold text-[#111113] tracking-[-0.04em]">
                  CALCULATE YOUR PROTECTION FEE IN SECONDS.
                </h3>
                <p className="font-secondary text-sm sm:text-base text-[#111113]/70 leading-relaxed">
                  No hidden margins. Dynamic tiered pricing starting at 2.5% for high-value smartphones and laptops. Test real gadget values before you start a trade.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Link href="/pricing" className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onNavigateToPricing}
                    className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
                  >
                    <Zap className="h-4 w-4 text-[#FF5A25]" />
                    <span>Open Fee Calculator</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onNavigateToMarketplace}
                    className="w-full sm:w-auto rounded-full border border-[#111113]/20 bg-white px-7 py-4 text-sm font-secondary font-semibold text-[#111113] hover:border-[#111113] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                    <span>Explore Marketplace</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Authoritative Variation 7 Footer */}
      <Footer />
    </div>
  );
}
