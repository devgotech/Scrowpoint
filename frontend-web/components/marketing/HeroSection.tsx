"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  CreditCard,
  Eye,
  Fingerprint,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * HeroSection Component for Scrowpoint Landing Page.
 *
 * Compliant with 4_ui_system.md & User Specs:
 * - Top Row: Hero text & CTAs (Left) and Interactive Live Protocol Card (Right).
 * - Ample whitespace between headline, subtext, and buttons to give room and vertical balance.
 * - Waitlist Cohort 1 is an indicator / info pill (not a button) with concise text.
 * - Metrics Section: Stretches full-width beneath both hero text and card like its own dedicated section.
 * - Strictly measures the 3 core business model areas:
 *    1. 100% Custodial Vault (Locked segregated escrow)
 *    2. 48-Hour Hardware SLA (Testing & diagnostic window before payout)
 *    3. SmileID Biometric KYC (ID & face-matched sellers)
 * - Trusted Partner Section: Small, subtle marquee moving infinitely from left to right.
 */

const TRUSTED_PARTNERS = [
  { name: "Paystack", role: "Custodial Escrow", icon: <CreditCard className="h-3.5 w-3.5 text-[#020617]" /> },
  { name: "SmileID", role: "Biometric KYC", icon: <Fingerprint className="h-3.5 w-3.5 text-[#15803d]" /> },
  { name: "DHL Express", role: "Insured Transit", icon: <Truck className="h-3.5 w-3.5 text-[#020617]" /> },
  { name: "GIG Logistics", role: "Hub Delivery", icon: <Truck className="h-3.5 w-3.5 text-[#020617]" /> },
  { name: "NIBSS", role: "Instant Settlement", icon: <Building2 className="h-3.5 w-3.5 text-[#020617]" /> },
  { name: "Apple GSMA", role: "IMEI Diagnostic", icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" /> },
  { name: "Interswitch", role: "Direct Settlement", icon: <CreditCard className="h-3.5 w-3.5 text-[#020617]" /> },
];

export interface HeroSectionProps {
  className?: string;
  onExploreClick?: () => void;
}

export function HeroSection({ className, onExploreClick }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "checklist">("checklist");
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  return (
    <section
      aria-label="Hero Section"
      className={cn(
        "relative overflow-hidden bg-[#f8fafc] pt-10 pb-14 sm:pt-16 sm:pb-20 border-b border-[#e2e8f0]",
        className
      )}
    >
      {/* Background Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* =================================================================
            TOP ROW: HERO COPY & CTAS (7 Cols) + VISUAL TRUST CARD (5 Cols)
            ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* LEFT COLUMN: HERO TEXT & CTAS */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-7 sm:space-y-8 text-center lg:text-left">
            {/* 1. Waitlist Cohort 1 Indicator / Info (Not a button, concise text) */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50/80 px-3 py-1 text-xs font-mono font-medium text-[#15803d]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                </span>
                <span>Waitlist is Active</span>
              </div>
            </div>

            {/* 2. Punchy, Minimal Headline (Geist 700 - font-primary) */}
            <h1 className="font-primary text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-bold tracking-tight text-[#020617] leading-[1.15]">
              Secondhand Gadgets, Protected by{" "}
              <span className="relative inline-block text-[#15803d] whitespace-nowrap">
                Escrow
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#22c55e] rounded-full" />
                <span className="absolute -bottom-3 left-0 right-0 h-[3px] bg-[#22c55e] rounded-full" />
              </span>
              .
            </h1>

            {/* 3. Streamlined, Non-Chunky Subtext (Inter - font-secondary) */}
            <p className="font-secondary text-base sm:text-lg text-[#64748b] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Nigeria’s verified peer-to-peer exchange. Buyer funds stay locked in custodial
              trust until delivery and a guaranteed 48-hour hardware inspection.
            </p>

            {/* 4. Action Buttons with Micro-Interactions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 sm:pt-3">
              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button
                  variant="default"
                  size="lg"
                  onClick={onExploreClick}
                  className="group relative w-full sm:w-auto h-12 px-6 rounded-[4px] bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.99] gap-2"
                >
                  <Search className="h-4 w-4 text-slate-300" />
                  <span>Browse Verified Gadgets</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>

              <Link href="/pricing" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="group w-full sm:w-auto h-12 px-6 rounded-[4px] bg-white hover:bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] text-[#020617] text-sm font-medium transition-all duration-200 shadow-2xs active:scale-[0.99] gap-2"
                >
                  <Zap className="h-4 w-4 text-[#ecc94b] group-hover:scale-110 transition-transform duration-200" />
                  <span>Calculate Escrow Fee</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE ESCROW GADGET INSPECTION SHOWCASE */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md lg:max-w-lg rounded-[8px] border border-[#e2e8f0] bg-white p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] space-y-3.5 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              {/* Card Header with Protocol Badge & Micro-tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
                    <Shield className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <div>
                    <span className="font-primary text-xs font-semibold text-[#020617] block leading-none">
                      Live Inspection Protocol
                    </span>
                    <span className="font-mono text-[10px] text-[#64748b] leading-none">
                      SP-ORD-7842
                    </span>
                  </div>
                </div>

                {/* Micro Tab Selector */}
                <div className="flex items-center rounded-[4px] bg-[#f1f5f9] p-0.5 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab("checklist")}
                    className={cn(
                      "px-2.5 py-1 rounded-[3px] transition-all duration-150 cursor-pointer",
                      activeTab === "checklist"
                        ? "bg-white text-[#020617] shadow-2xs font-semibold"
                        : "text-[#64748b] hover:text-[#020617]"
                    )}
                  >
                    48h Diagnostic
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("timeline")}
                    className={cn(
                      "px-2.5 py-1 rounded-[3px] transition-all duration-150 cursor-pointer",
                      activeTab === "timeline"
                        ? "bg-white text-[#020617] shadow-2xs font-semibold"
                        : "text-[#64748b] hover:text-[#020617]"
                    )}
                  >
                    Vault State
                  </button>
                </div>
              </div>

              {/* HERO GADGET MEDIA SHOWCASE: Crisp, High-Resolution Hardware Inspection Photo */}
              <div className="relative h-48 sm:h-52 w-full rounded-[6px] overflow-hidden border border-[#e2e8f0] bg-slate-950 group">
                {/* High-res authentic titanium iPhone gadget photography */}
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85"
                  alt="Apple iPhone 15 Pro Max Titanium Hardware Inspection"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle vignette gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35 pointer-events-none" />

                {/* Top-Left: Mint Grade Certification Seal */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#0f172a]/90 backdrop-blur-md text-white text-[11px] font-mono font-semibold shadow-xs border border-white/15">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>Grade A+ Mint</span>
                </div>

                {/* Top-Right: 48h Inspection SLA Live Countdown */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white/95 backdrop-blur-md text-[#020617] text-[11px] font-mono font-semibold shadow-xs border border-[#e2e8f0]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ecc94b] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ecc94b]" />
                  </span>
                  <span>48h SLA: 36h 42m</span>
                </div>

                {/* Interactive Hardware Checkpoint Hotspots on Device */}
                {/* Hotspot 1: Camera Array */}
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(selectedHotspot === "camera" ? null : "camera")}
                  title="Click to inspect 48MP Triple Camera System"
                  className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group/hotspot focus:outline-none"
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-md border border-[#0f172a]" />
                  </span>
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[3px] bg-[#0f172a]/95 px-2 py-0.5 text-[10px] font-mono text-white opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none shadow-md">
                    Triple 48MP OEM Lenses: Passed
                  </span>
                </button>

                {/* Hotspot 2: Battery & Logic */}
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(selectedHotspot === "battery" ? null : "battery")}
                  title="Click to inspect Battery & Logic Board"
                  className="absolute top-[68%] left-[48%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group/hotspot focus:outline-none"
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e] shadow-md border border-white" />
                  </span>
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[3px] bg-[#0f172a]/95 px-2 py-0.5 text-[10px] font-mono text-white opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none shadow-md">
                    Battery: 94% OEM Peak
                  </span>
                </button>

                {/* Bottom-Left: Custodial Escrow Vault Pill */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white/95 backdrop-blur-md text-[#0f172a] text-[11px] font-mono font-bold shadow-xs border border-[#e2e8f0]">
                  <Lock className="h-3 w-3 text-[#15803d]" />
                  <span>₦850,000 Custody Vault</span>
                </div>

                {/* Bottom-Right: Clean IMEI Micro-Tag */}
                <div className="absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1 px-2 py-1 rounded-[4px] bg-black/75 backdrop-blur-md text-white/90 text-[10px] font-mono border border-white/10">
                  <Fingerprint className="h-3 w-3 text-[#22c55e]" />
                  <span>IMEI: 354892***841 Clean</span>
                </div>
              </div>

              {/* Device Metadata Bar */}
              <div className="flex items-center justify-between px-0.5">
                <div className="min-w-0 pr-2">
                  <h4 className="font-primary text-xs font-semibold text-[#020617] truncate">
                    Apple iPhone 15 Pro Max 256GB — Natural Titanium
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] font-secondary">
                    <span className="truncate">Seller: Tunde A.</span>
                    <span>•</span>
                    <span className="text-[#15803d] font-medium flex items-center gap-0.5 font-mono text-[10px]">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      SmileID NIN
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-[#020617]">
                    ₦850,000
                  </div>
                  <div className="font-mono text-[9px] text-[#15803d] font-medium">
                    100% Payout Guaranteed
                  </div>
                </div>
              </div>

              {/* Tabbed Interactive Content: 48h Inspection Diagnostics vs Escrow Vault State */}
              {activeTab === "checklist" ? (
                <div className="space-y-1.5 pt-0.5 font-secondary text-xs">
                  <div
                    className={cn(
                      "flex items-center justify-between p-2 rounded-[4px] bg-[#f8fafc] border transition-colors",
                      selectedHotspot === "battery" ? "border-emerald-500 bg-emerald-50/60" : "border-[#e2e8f0]"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[#020617]">
                      <BatteryCharging className="h-3.5 w-3.5 text-[#15803d]" />
                      <span className="font-medium">Battery Health Verification</span>
                    </div>
                    <span className="font-mono text-[10.5px] text-[#15803d] font-semibold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-[2px]">
                      94% OEM Peak
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-2 text-[#020617]">
                      <Lock className="h-3.5 w-3.5 text-[#15803d]" />
                      <span className="font-medium">iCloud & Carrier Activation Lock</span>
                    </div>
                    <span className="font-mono text-[10.5px] text-[#15803d] font-semibold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-[2px]">
                      Clean & Unlocked
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between p-2 rounded-[4px] bg-[#f8fafc] border transition-colors",
                      selectedHotspot === "camera" ? "border-emerald-500 bg-emerald-50/60" : "border-[#e2e8f0]"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[#020617]">
                      <Eye className="h-3.5 w-3.5 text-[#15803d]" />
                      <span className="font-medium">Face ID & TrueTone OLED Display</span>
                    </div>
                    <span className="font-mono text-[10.5px] text-[#15803d] font-semibold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-[2px]">
                      OEM Verified
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pt-0.5 font-secondary text-xs">
                  {/* Step 1: Escrow Vault Funded */}
                  <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#15803d]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
                      <span className="font-medium">1. Escrow Vault Locked</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">₦850,000 HELD</span>
                  </div>

                  {/* Step 2: Tracked Courier Dispatch */}
                  <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0] text-[#020617]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
                      <span className="font-medium">2. Tracked Courier Dispatch</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#64748b]">DHL-NG-9482</span>
                  </div>

                  {/* Step 3: 48-Hour Inspection Active */}
                  <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#ecc94b]/15 border border-[#ecc94b]/40 text-[#975a16]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#ecc94b] animate-spin" />
                      <span className="font-medium">3. 48h Inspection Active</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">36h 42m left</span>
                  </div>
                </div>
              )}

              {/* Guarantee Disclaimer Footer */}
              <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b] font-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  Buyer approval required for payout
                </span>
                <span className="font-mono font-medium text-[#0f172a]">Paystack Custody</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            METRICS SECTION: Stretched beneath the hero image and hero text,
            like it has its own section
            ================================================================= */}
        <div className="mt-14 sm:mt-18 pt-10 sm:pt-12 border-t border-[#e2e8f0]">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span className="font-primary text-xs font-bold uppercase tracking-wider text-[#020617]">
                Core Trust Architecture
              </span>
            </div>
            <span className="font-mono text-xs text-[#64748b]">
              Standard SLA Guarantee for Every Transaction
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 text-left">
            {/* Metric 1: Custodial Escrow Vault */}
            <div className="group relative rounded-[8px] border border-[#e2e8f0] bg-white p-5 transition-all duration-200 hover:border-[#cbd5e1] hover:shadow-xs hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#020617] group-hover:text-[#15803d] transition-colors">
                  100%
                </span>
                <div className="h-8 w-8 rounded-[4px] bg-emerald-50 flex items-center justify-center text-[#15803d] group-hover:bg-[#22c55e]/20 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              <div className="font-primary text-sm font-semibold text-[#020617]">
                Custodial Vault
              </div>
              <div className="font-secondary text-xs text-[#64748b] mt-1 leading-relaxed">
                Funds locked in segregated escrow until buyer approval
              </div>
            </div>

            {/* Metric 2: 48-Hour Hardware Inspection SLA */}
            <div className="group relative rounded-[8px] border border-[#e2e8f0] bg-white p-5 transition-all duration-200 hover:border-[#cbd5e1] hover:shadow-xs hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#020617] group-hover:text-[#15803d] transition-colors">
                  48h
                </span>
                <div className="h-8 w-8 rounded-[4px] bg-slate-100 flex items-center justify-center text-[#0f172a] group-hover:bg-emerald-50 group-hover:text-[#15803d] transition-colors">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="font-primary text-sm font-semibold text-[#020617]">
                Hardware SLA
              </div>
              <div className="font-secondary text-xs text-[#64748b] mt-1 leading-relaxed">
                Comprehensive diagnostic window before payout release
              </div>
            </div>

            {/* Metric 3: SmileID Biometric KYC */}
            <div className="group relative rounded-[8px] border border-[#e2e8f0] bg-white p-5 transition-all duration-200 hover:border-[#cbd5e1] hover:shadow-xs hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#15803d]">
                  SmileID
                </span>
                <div className="h-8 w-8 rounded-[4px] bg-emerald-50 flex items-center justify-center text-[#15803d] group-hover:bg-[#22c55e]/20 transition-colors">
                  <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                </div>
              </div>
              <div className="font-primary text-sm font-semibold text-[#020617]">
                Biometric KYC
              </div>
              <div className="font-secondary text-xs text-[#64748b] mt-1 leading-relaxed">
                ID & face-matched sellers
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            TRUSTED PARTNERS: Small & moves infinitely from left to right
            ================================================================= */}
        <div className="mt-8 pt-6 border-t border-[#e2e8f0]/80">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="shrink-0 flex items-center gap-2 text-[#64748b]">
              <Building2 className="h-3.5 w-3.5 text-[#15803d]" />
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#64748b]">
                Integrated Partners:
              </span>
            </div>

            {/* Marquee Container with smooth edge masks */}
            <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)]">
              <div className="flex w-max items-center gap-8 sm:gap-10 animate-marquee-ltr py-1">
                {/* Render 2 sets for seamless infinite loop */}
                {[...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS].map((partner, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 shrink-0 opacity-75 hover:opacity-100 transition-opacity duration-150 cursor-default"
                  >
                    {partner.icon}
                    <span className="font-primary text-xs font-semibold text-[#0f172a]">
                      {partner.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#64748b] bg-white border border-[#e2e8f0] px-1.5 py-0.5 rounded-[3px]">
                      {partner.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
