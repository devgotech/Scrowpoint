"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Fingerprint,
  Lock,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GadgetVectorPattern } from "@/components/marketing/GadgetVectorPattern";

/**
 * HeroSection Component for Scrowpoint Landing Page — Design Variation 7 (Option 5 Minimalist).
 *
 * Implements Design Variation 7:
 * - Warm Editorial Paper background (`#F8F7F4`) and Deep Carbon Ink (`#111113`) with Vermilion (`#FF5A25`) accents.
 * - Seamless Monoline Gadget Vector Pattern Background (`GadgetVectorPattern`):
 *   Staggered line-art illustrations of iPhones, MacBooks, Game Console Controllers, iPads, Cameras,
 *   Headphones, Smartwatches, and Earbuds with subtle Vermilion & Trust Green micro-accents.
 * - Centered monumental header (`SECURE EXCHANGE.` / `VERIFIED TECH.`) + Pill Primary CTA.
 * - 3 Core Business Model Cards (`[01] Vault`, `[02] Verification`, `[03] Assurance`).
 * - Infinite Left-to-Right Trusted Partners Strip.
 */

const TRUSTED_PARTNERS = [
  {
    name: "Paystack",
    role: "Custodial Escrow",
    icon: <CreditCard className="h-3.5 w-3.5 text-[#111113]" />,
  },
  {
    name: "SmileID",
    role: "Biometric KYC",
    icon: <Fingerprint className="h-3.5 w-3.5 text-[#FF5A25]" />,
  },
  {
    name: "DHL Express",
    role: "Insured Transit",
    icon: <Truck className="h-3.5 w-3.5 text-[#111113]" />,
  },
  {
    name: "GIG Logistics",
    role: "Hub Delivery",
    icon: <Truck className="h-3.5 w-3.5 text-[#111113]" />,
  },
  {
    name: "NIBSS",
    role: "Instant Settlement",
    icon: <Building2 className="h-3.5 w-3.5 text-[#111113]" />,
  },
  {
    name: "Apple GSMA",
    role: "IMEI Diagnostic",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" />,
  },
  {
    name: "Interswitch",
    role: "Direct Settlement",
    icon: <CreditCard className="h-3.5 w-3.5 text-[#111113]" />,
  },
];

export interface HeroSectionProps {
  className?: string;
  onExploreClick?: () => void;
}

export function HeroSection({ className, onExploreClick }: HeroSectionProps) {
  return (
    <section
      aria-label="Hero Section"
      className={cn(
        "relative overflow-hidden bg-[#F8F7F4] pt-14 pb-20 sm:pt-20 sm:pb-28 border-b border-[#111113]/12",
        className
      )}
    >
      {/* Seamless Repeating Gadget Vector Pattern Background */}
      <GadgetVectorPattern idPrefix="sp-landing-hero" variant="centered" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-8">
        {/* =================================================================
            1. VARIATION 7 MONUMENTAL EDITORIAL HEADER
            ================================================================= */}
        <header className="text-center mb-20 sm:mb-28">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 mb-4">
            <span className="label">P2P Escrow Engine v.2026</span>
            <span className="text-[#111113]/25">•</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#111113]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A25] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A25]" />
              </span>
              <span>Waitlist is Active</span>
            </span>
          </div>

          <h1 className="font-primary font-bold tracking-[-0.04em] text-[#111113] text-5xl sm:text-7xl md:text-8xl lg:text-[7.25rem] xl:text-[8rem] leading-[0.9] my-6 uppercase">
            SECURE EXCHANGE.
            <br />
            VERIFIED TECH<span className="text-[#FF5A25]">.</span>
          </h1>

          <p className="font-secondary text-base sm:text-xl text-[#111113]/70 max-w-[600px] mx-auto mb-10 leading-relaxed">
            Nigeria’s trusted platform for secure gadget exchange. Funds locked in
            custody until your inspection is complete.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/marketplace">
              <button
                type="button"
                onClick={onExploreClick}
                className="btn-primary text-[1.05rem] sm:text-[1.1rem] inline-flex items-center gap-2.5 group"
              >
                <span>Start Secure Trade</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/pricing">
              <button
                type="button"
                className="rounded-full border border-[#111113]/20 bg-white px-7 py-4 text-[0.95rem] font-secondary font-semibold text-[#111113] hover:border-[#111113] transition-colors cursor-pointer"
              >
                Calculate Escrow Fee
              </button>
            </Link>
          </div>
        </header>

        {/* =================================================================
            2. VARIATION 7 THREE CORE BUSINESS MODEL CARDS
            [01] Vault — Paystack Custody
            [02] Verification — SmileID KYC
            [03] Assurance — 48H Audit SLA
            ================================================================= */}
        <div
          aria-label="Core Business Model Metrics"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left"
        >
          {/* Card 01: Vault */}
          <div className="v7-card flex flex-col justify-between transition-colors duration-200 hover:border-[#111113]/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="label">[01] Vault</span>
                <span className="font-mono text-xs font-bold text-[#111113]">
                  100% CUSTODY
                </span>
              </div>
              <h3 className="font-primary text-[1.85rem] sm:text-[2rem] font-bold tracking-[-0.04em] text-[#111113] my-4 leading-none">
                Paystack Custody
              </h3>
              <p className="font-secondary text-[0.95rem] text-[#111113]/70 leading-relaxed">
                Funds are held in secure escrow vaults, ensuring sellers only
                get paid when you are satisfied.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#111113]/12 flex items-center justify-between">
              <span className="label">Segregated Settlement</span>
              <Lock className="h-4 w-4 text-[#111113]/60" />
            </div>
          </div>

          {/* Card 02: Verification */}
          <div className="v7-card flex flex-col justify-between transition-colors duration-200 hover:border-[#111113]/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="label">[02] Verification</span>
                <span className="font-mono text-xs font-bold text-[#FF5A25]">
                  BIOMETRIC ID
                </span>
              </div>
              <h3 className="font-primary text-[1.85rem] sm:text-[2rem] font-bold tracking-[-0.04em] text-[#111113] my-4 leading-none">
                SmileID KYC
              </h3>
              <p className="font-secondary text-[0.95rem] text-[#111113]/70 leading-relaxed">
                Every seller must pass biometric government ID verification to
                prevent anonymous fraud.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#111113]/12 flex items-center justify-between">
              <span className="label">NIN / BVN Liveness</span>
              <Fingerprint className="h-4 w-4 text-[#FF5A25]" />
            </div>
          </div>

          {/* Card 03: Assurance */}
          <div className="v7-card flex flex-col justify-between transition-colors duration-200 hover:border-[#111113]/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="label">[03] Assurance</span>
                <span className="font-mono text-xs font-bold text-[#15803d]">
                  48-HOUR WINDOW
                </span>
              </div>
              <h3 className="font-primary text-[1.85rem] sm:text-[2rem] font-bold tracking-[-0.04em] text-[#111113] my-4 leading-none">
                48H Audit SLA
              </h3>
              <p className="font-secondary text-[0.95rem] text-[#111113]/70 leading-relaxed">
                You have 48 hours after delivery to perform hardware
                diagnostics. Failure triggers automatic mediation.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#111113]/12 flex items-center justify-between">
              <span className="label">Automated Arbitration</span>
              <Clock className="h-4 w-4 text-[#111113]/60" />
            </div>
          </div>
        </div>

        {/* =================================================================
            3. INTEGRATED PARTNERS MARQUEE (Moves infinitely left to right)
            ================================================================= */}
        <div className="mt-12 pt-6 border-t border-[#111113]/12">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="label shrink-0">Integrated Infrastructure:</span>

            <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)]">
              <div className="flex w-max items-center gap-10 animate-marquee-ltr py-1">
                {[...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS].map(
                  (partner, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 shrink-0 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      {partner.icon}
                      <span className="font-primary text-xs font-bold tracking-[-0.02em] text-[#111113]">
                        {partner.name}
                      </span>
                      <span className="label border border-[#111113]/12 bg-white px-2 py-0.5">
                        {partner.role}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
