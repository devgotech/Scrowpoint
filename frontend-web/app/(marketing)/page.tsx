"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ValuePropGrid } from "@/components/marketing/ValuePropGrid";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Screen 1: Landing Page & Marketing (Phase 1 §1)
 * Route: app/(marketing)/page.tsx
 *
 * Architecture Requirements:
 * - Components: Navbar (Public), HeroSection, ValuePropGrid, Trust Pillars, Footer.
 * - Architecture Link: Fully static/ISR. No database calls on initial load.
 * - States: Standard responsive layout, highly optimized for mobile touch targets (>= 44px)
 *   and desktop 1280px container bounds.
 * - Compliance: 4_ui_system.md tokens (--radius-card: 8px, --radius-control: 4px,
 *   brand dark #0f172a, trust green #22c55e / #15803d, 200ms ease-out transitions).
 */

export interface LandingPageProps {
  onNavigateToPricing?: () => void;
  onNavigateToMarketplace?: () => void;
  onNavigateToEscrow?: (orderId?: string) => void;
}

export default function LandingPage({
  onNavigateToPricing,
  onNavigateToMarketplace,
  onNavigateToEscrow,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased selection:bg-[#22c55e]/20 selection:text-[#15803d]">
      {/* 1. Public Top Navigation */}
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <HeroSection onExploreClick={onNavigateToMarketplace} />

        {/* 3. 3-Step "How It Works" Flow Banner (Essential for First-Time Nigerian Buyers/Sellers) */}
        <section
          aria-label="How Escrow Works"
          className="border-b border-[#e2e8f0] bg-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Trade Protocol
              </span>
              <h2 className="font-primary text-2xl sm:text-3xl font-bold text-[#020617] mt-1 tracking-tight">
                How Buyer's High Protects Your Money
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-2">
                Three tamper-proof steps ensure you never pay for a damaged gadget or get cheated out of a sale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-6 flex flex-col justify-between shadow-[0_2px_4px_rgba(15,23,42,0.04)] relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0f172a] text-white font-mono text-xs font-bold">
                      01
                    </span>
                    <Badge variant="trust" className="text-[10px] font-mono">
                      Paystack Vault
                    </Badge>
                  </div>
                  <h3 className="font-primary text-base font-bold text-[#020617]">
                    Buyer Locks Funds in Escrow
                  </h3>
                  <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                    You transfer funds to an isolated, automated escrow account. The seller is notified that 100% of the payment is safely locked, but they cannot touch it yet.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e2e8f0] font-mono text-[11px] text-[#15803d] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>Zero chargeback risk for seller</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-6 flex flex-col justify-between shadow-[0_2px_4px_rgba(15,23,42,0.04)] relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0f172a] text-white font-mono text-xs font-bold">
                      02
                    </span>
                    <span className="font-mono text-[10px] bg-white border border-[#e2e8f0] px-2 py-0.5 rounded-[4px] text-[#64748b] font-semibold">
                      Tracked Courier
                    </span>
                  </div>
                  <h3 className="font-primary text-base font-bold text-[#020617]">
                    Seller Dispatches Insured Device
                  </h3>
                  <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                    Seller ships via registered logistics partner (DHL/GIG/Fez) with waybill verification. Both parties track package transit in real-time within the Escrow Room.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e2e8f0] font-mono text-[11px] text-[#020617] flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#64748b]" />
                  <span>Waybill tracked end-to-end</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-6 flex flex-col justify-between shadow-[0_2px_4px_rgba(15,23,42,0.04)] relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0f172a] text-white font-mono text-xs font-bold">
                      03
                    </span>
                    <span className="font-mono text-[10px] bg-[#ecc94b]/20 text-[#975a16] border border-[#ecc94b]/40 px-2 py-0.5 rounded-[4px] font-semibold">
                      48-Hour SLA
                    </span>
                  </div>
                  <h3 className="font-primary text-base font-bold text-[#020617]">
                    48H Inspection & Payout Release
                  </h3>
                  <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                    Buyer receives the gadget and has 48 hours to inspect screen, battery health, and iCloud/carrier status. Once approved, funds release to seller automatically.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e2e8f0] font-mono text-[11px] text-[#15803d] flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>Dispute lock if device fails audit</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Value Propositions Grid */}
        <ValuePropGrid />

        {/* 5. Pricing / Fee Teaser Section */}
        <section
          aria-label="Pricing Teaser"
          className="border-t border-[#e2e8f0] bg-[#f8fafc] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 sm:p-10 shadow-[0_4px_8px_rgba(15,23,42,0.06)] flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#15803d]">
                  <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>TRANSPARENT TIERED ESCROW FEES</span>
                </div>
                <h3 className="font-primary text-2xl sm:text-3xl font-bold text-[#020617] tracking-tight">
                  Calculate Your Escrow Protection Fee in Seconds
                </h3>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  No hidden margins. Dynamic tiered pricing starting at 2.5% for high-value smartphones and laptops. Test real gadget values before you start a trade.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={onNavigateToPricing}
                    className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-medium shadow-xs"
                  >
                    <Zap className="h-4 w-4 text-[#ecc94b]" />
                    <span>Open Interactive Fee Calculator</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onNavigateToMarketplace}
                    className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-medium bg-white border-[#e2e8f0] text-[#020617] hover:bg-[#f8fafc]"
                  >
                    <Search className="h-4 w-4" />
                    <span>Explore Marketplace</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Authoritative Footer */}
      <Footer />
    </div>
  );
}
