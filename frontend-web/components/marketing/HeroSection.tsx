"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * HeroSection Component for Buyer's High Landing Page.
 *
 * Requirements (5_screen_flows.md Phase 1 §1 & 4_ui_system.md):
 * - Authoritative, transparent, and frictionless trust-first marketplace presentation.
 * - Headline: type-headline-xl (Roboto 700, 48px/56px on desktop, scaled down responsively on mobile).
 * - Primary CTA: #0f172a fill, 4px corner radius, strict 200ms ease-out transition.
 * - Trust Signals: Green (#22c55e) strictly reserved for escrow/verification; text on white uses #15803d.
 * - Live stats in Geist Mono: 100% Escrow Protection, 48H Inspection Window, SmileID Verified Sellers.
 * - Mobile-first responsive hierarchy: stack vertically on mobile, dual columns on lg screens.
 */

export interface HeroSectionProps {
  className?: string;
  onExploreClick?: () => void;
}

export function HeroSection({ className, onExploreClick }: HeroSectionProps) {
  return (
    <section
      aria-label="Hero Section"
      className={cn(
        "relative overflow-hidden bg-[#f8fafc] pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-[#e2e8f0]",
        className
      )}
    >
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* =================================================================
              LEFT COLUMN: HERO COPY & CTAS (7 Cols)
              ================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Trust Pill Announcement */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 px-3 py-1 text-xs font-mono font-semibold text-[#15803d]">
              <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>INSTITUTIONAL P2P GADGET ESCROW</span>
              <span className="hidden sm:inline text-[#22c55e]">•</span>
              <span className="hidden sm:inline font-mono">100% SECURED</span>
            </div>

            {/* Main Headline: Roboto 700 */}
            <h1 className="font-primary text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#020617] leading-[1.15]">
              Buy & Sell Secondhand Gadgets with{" "}
              <span className="relative inline-block text-[#0f172a] underline decoration-[#22c55e] decoration-4 underline-offset-4">
                Zero Fraud
              </span>
              .
            </h1>

            {/* Subtext: Geist font-secondary */}
            <p className="font-secondary text-sm sm:text-base text-[#64748b] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Nigeria's trust-first escrow marketplace. Buyer funds remain securely locked
              in our custodial vault until delivery and a guaranteed{" "}
              <strong className="text-[#020617] font-semibold">48-hour hardware inspection</strong>.
              No fake receipts, no dead on arrival devices.
            </p>

            {/* Call to Actions (Touch targets ≥ 44px for mobile) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button
                  variant="default"
                  size="lg"
                  onClick={onExploreClick}
                  className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-medium shadow-xs"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse Verified Gadgets</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/pricing" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 gap-2 text-sm font-medium bg-white border-[#e2e8f0] text-[#020617] hover:bg-[#f8fafc]"
                >
                  <Zap className="h-4 w-4 text-[#ecc94b]" />
                  <span>Calculate Escrow Fee</span>
                </Button>
              </Link>
            </div>

            {/* Live Trust Metrics Strip */}
            <div className="pt-6 border-t border-[#e2e8f0] grid grid-cols-3 gap-2 sm:gap-6 text-left">
              <div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#020617]">
                  100%
                </div>
                <div className="font-secondary text-[11px] sm:text-xs text-[#64748b]">
                  Escrow Vault Guarantee
                </div>
              </div>

              <div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#020617]">
                  48 Hours
                </div>
                <div className="font-secondary text-[11px] sm:text-xs text-[#64748b]">
                  Hardware Inspection SLA
                </div>
              </div>

              <div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#15803d]">
                  SmileID
                </div>
                <div className="font-secondary text-[11px] sm:text-xs text-[#64748b]">
                  Biometric KYC Verified
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: INTERACTIVE VISUAL TRUST CARD (5 Cols)
              ================================================================= */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_4px_8px_rgba(15,23,42,0.06)] space-y-4">
              {/* Card Header Strip */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
                    <Shield className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <span className="font-primary text-xs font-semibold text-[#020617]">
                    Live Vault Protocol
                  </span>
                </div>
                <Badge variant="trust" className="text-[10px] py-0 px-2 font-mono tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse mr-1" />
                  <span>VAULT LOCKED</span>
                </Badge>
              </div>

              {/* Sample Verified Listing Item Preview */}
              <div className="rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] p-3 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=200&auto=format&fit=crop&q=80"
                  alt="iPhone 14 Pro Max"
                  className="h-16 w-16 object-cover rounded-[4px] border border-[#e2e8f0]"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#64748b]">PHN-APL-IP14PM</span>
                    <span className="font-mono text-[9px] bg-white border border-[#e2e8f0] px-1.5 py-0.2 rounded-[2px] text-[#0f172a] font-semibold">
                      Mint Grade
                    </span>
                  </div>
                  <h4 className="font-primary text-xs font-medium text-[#020617] truncate">
                    Apple iPhone 14 Pro Max 256GB
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-xs font-bold text-[#020617]">
                      ₦850,000 NGN
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-[#15803d]">
                      <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                      <span>Verified Seller</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Trust Progression Simulation */}
              <div className="space-y-2 pt-1 font-secondary text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#15803d]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    <span className="font-medium">1. Escrow Funded</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">₦850,000 HELD</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-[4px] bg-white border border-[#e2e8f0] text-[#020617]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    <span className="font-medium">2. Tracked Courier Dispatch</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748b]">DHL-NG-9482</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#ecc94b]/15 border border-[#ecc94b]/40 text-[#975a16]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#ecc94b] animate-spin" />
                    <span className="font-medium">3. 48-Hour Inspection Active</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">42h 15m left</span>
                </div>
              </div>

              {/* Guarantee Disclaimer Footer */}
              <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b] font-secondary">
                <span>Buyer approval required for payout</span>
                <span className="font-mono font-medium text-[#0f172a]">Paystack Custody</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
