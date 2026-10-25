"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Gift,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Percent,
  RefreshCw,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Screen: Early Access Waitlist & Pre-Launch Founding Cohort Portal
 * Route: app/(marketing)/waitlist/page.tsx
 *
 * Pre-Launch Isolated Sandbox Rules:
 * - The rest of the app is still in private production development.
 * - This waitlist is public-facing: visitors must NOT access core parts of the business
 *   (e.g., marketplace catalog, seller hub, auth logins, active escrow room).
 * - Focused Pre-Launch Navbar & Footer containing only what is needed during the waitlist phase.
 * - Flexible Trading Location selector with custom dynamic input when "Other" is chosen.
 */

export type UserRoleChoice = "buyer" | "seller" | "both";

export interface WaitlistFormData {
  fullName: string;
  email: string;
  phone: string;
  role: UserRoleChoice;
  city: string;
  favoriteGadgets: string[];
  monthlyVolume: string;
}

export interface WaitlistRecord extends WaitlistFormData {
  queuePosition: number;
  referralCode: string;
  joinedAt: string;
  referralCount: number;
}

const TOTAL_SLOTS = 500;
const INITIAL_CLAIMED = 412;

const RECENT_SIGNUPS = [
  { name: "Chidi O.", location: "Computer Village, Ikeja", role: "Seller", time: "3m ago" },
  { name: "Fatima B.", location: "Wuse 2, Abuja", role: "Buyer", time: "8m ago" },
  { name: "Babatunde A.", location: "Lekki Phase 1, Lagos", role: "Power Trader", time: "14m ago" },
  { name: "David K.", location: "GRA, Port Harcourt", role: "Seller", time: "22m ago" },
  { name: "Ngozi M.", location: "Bodija, Ibadan", role: "Buyer", time: "34m ago" },
];

const GADGET_OPTIONS = [
  "iPhones & iPads",
  "MacBooks & Windows Laptops",
  "PlayStation 5 & Xbox Series",
  "Mirrorless Cameras & Lenses",
  "Smartwatches & AirPods",
  "Drones & Audio Equipment",
];

const LOCATION_PRESETS = [
  { value: "Lagos (Ikeja / Computer Village)", label: "Lagos (Ikeja / Computer Village)" },
  { value: "Lagos (Lekki / Victoria Island / Ajah)", label: "Lagos (Lekki / VI / Ajah)" },
  { value: "Lagos (Surulere / Yaba / Mainland)", label: "Lagos (Yaba / Surulere / Mainland)" },
  { value: "Abuja (Wuse / Maitama / Garki)", label: "Abuja (FCT)" },
  { value: "Port Harcourt (Rivers State)", label: "Port Harcourt (Rivers State)" },
  { value: "Ibadan (Oyo State)", label: "Ibadan (Oyo State)" },
  { value: "Enugu / Onitsha / Southeast", label: "Enugu / Onitsha (Southeast)" },
  { value: "Kano / Kaduna / North", label: "Kano / Kaduna (North)" },
  { value: "other", label: "Other City / State (Specify below)" },
];

export interface WaitlistPageProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
}

export default function WaitlistPage({}: WaitlistPageProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    role: UserRoleChoice;
    favoriteGadgets: string[];
    monthlyVolume: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    role: "both",
    favoriteGadgets: ["iPhones & iPads", "MacBooks & Windows Laptops"],
    monthlyVolume: "₦200k - ₦1,000,000",
  });

  const [locationPreset, setLocationPreset] = useState<string>("Lagos (Ikeja / Computer Village)");
  const [customCity, setCustomCity] = useState<string>("");

  const [submittedData, setSubmittedData] = useState<WaitlistRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    customCity?: string;
  }>({});

  // Restore saved waitlist reservation from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sp_waitlist_user") || localStorage.getItem("bh_waitlist_user");
        if (saved) {
          setSubmittedData(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  const handleGadgetToggle = (gadget: string) => {
    setFormData((prev) => {
      const exists = prev.favoriteGadgets.includes(gadget);
      return {
        ...prev,
        favoriteGadgets: exists
          ? prev.favoriteGadgets.filter((g) => g !== gadget)
          : [...prev.favoriteGadgets, gadget],
      };
    });
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = (): boolean => {
    const errors: { fullName?: string; email?: string; customCity?: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full legal or trade name";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address for queue alerts";
    }

    if (locationPreset === "other" && !customCity.trim()) {
      errors.customCity = "Please enter your city and state name";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const resolvedCity =
      locationPreset === "other"
        ? customCity.trim() || "Other Location"
        : locationPreset;

    setTimeout(() => {
      const newQueueNumber = INITIAL_CLAIMED + Math.floor(Math.random() * 4) + 1;
      const refCode = `SP-${Math.floor(1000 + Math.random() * 9000)}`;

      const record: WaitlistRecord = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        city: resolvedCity,
        favoriteGadgets: formData.favoriteGadgets,
        monthlyVolume: formData.monthlyVolume,
        queuePosition: newQueueNumber,
        referralCode: refCode,
        joinedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        referralCount: 0,
      };

      setSubmittedData(record);
      setIsSubmitting(false);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sp_waitlist_user", JSON.stringify(record));
        } catch {}
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  const handleCopyReferral = () => {
    if (!submittedData) return;
    const shareUrl = `https://scrowpoint.com/waitlist?ref=${submittedData.referralCode}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleResetForNew = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sp_waitlist_user");
      localStorage.removeItem("bh_waitlist_user");
    }
    setSubmittedData(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "both",
      favoriteGadgets: ["iPhones & iPads", "MacBooks & Windows Laptops"],
      monthlyVolume: "₦200k - ₦1,000,000",
    });
    setLocationPreset("Lagos (Ikeja / Computer Village)");
    setCustomCity("");
    setFormErrors({});
  };

  const referralUrl = submittedData
    ? `https://scrowpoint.com/waitlist?ref=${submittedData.referralCode}`
    : "https://scrowpoint.com/waitlist";

  const whatsappShareText = encodeURIComponent(
    `I just reserved my early spot on Scrowpoint — Nigeria's zero-fraud secondhand gadget escrow with a 48-hour hardware diagnostic countdown! The first 500 traders get 0% escrow fees on their first 5 transactions: ${referralUrl}`
  );

  const twitterShareText = encodeURIComponent(
    `No more fake bank alerts or bad phone deliveries. Just joined @scrowpoint founding waitlist! 48h hardware inspection + CBN-licensed vault escrow: ${referralUrl}`
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased selection:bg-[#22c55e]/20 selection:text-[#15803d]">
      {/* =====================================================================
          PRE-LAUNCH WAITLIST NAVBAR
          Strictly contained: No links to marketplace, seller dashboard, or auth.
          ===================================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#0f172a] text-white shadow-xs">
              <Shield className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-8">
                <span className="font-primary text-lg font-bold tracking-tight text-[#020617] leading-none">
                  Scrowpoint
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider bg-[#22c55e]/15 text-[#15803d] font-bold px-2 py-0.5 rounded-[3px] border border-[#22c55e]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  Pre-Launch
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Status / Action */}
          <div className="flex items-center gap-3">
            {/* Live Capacity Tracker */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-white border border-[#e2e8f0] text-xs font-mono text-[#64748b]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span>
                Cohort 1 •{" "}
                <strong className="text-[#020617]">
                  {submittedData ? submittedData.queuePosition : INITIAL_CLAIMED}/{TOTAL_SLOTS}
                </strong>{" "}
                Slots Claimed
              </span>
            </div>

            {!submittedData && (
              <Button
                variant="default"
                size="sm"
                onClick={scrollToForm}
                className="h-9 px-4 text-xs font-semibold gap-1.5 bg-[#0f172a] text-white hover:bg-slate-800 rounded-[4px] shadow-xs cursor-pointer"
              >
                <span>Join Waitlist</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN CONTENT
          ===================================================================== */}
      <main className="flex-1 w-full py-8 sm:py-14">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Pre-launch Status Pill (No leaking backlink to app) */}
          <div className="flex flex-col items-start gap-1.5 pb-2 text-left">
            <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-[4px] bg-white border border-[#e2e8f0] text-xs font-mono text-[#64748b] text-left">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-[#22c55e]" />
                <span>Invite-Only Protocol</span>
              </div>
              <span className="text-[#cbd5e1] hidden sm:inline">•</span>
              <span className="text-[#020617] font-semibold">Founding Cohort Registration</span>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-left max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs font-mono font-semibold text-[#15803d] shadow-2xs text-left">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
              </span>
              <span>
                Early Access • {TOTAL_SLOTS - (submittedData ? submittedData.queuePosition : INITIAL_CLAIMED)} Slots Remaining
              </span>
            </div>

            <h1 className="font-primary text-4xl sm:text-5xl font-extrabold text-[#020617] tracking-tight leading-tight text-left">
              Trade Secondhand Gadgets With <span className="text-[#15803d]">Zero Risk</span>.
            </h1>

            <p className="font-secondary text-sm sm:text-base text-[#64748b] max-w-2xl leading-relaxed text-left">
              We&apos;re preparing the public release of Nigeria&apos;s first escrow marketplace with 48-hour hardware diagnostic verification. The first 500 traders get 0% escrow fees on their first 5 high-value trades.
            </p>
          </div>

          {/* Founding Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#22c55e]/15 text-[#15803d]">
                <Percent className="h-5 w-5 text-[#22c55e]" />
              </div>
              <h3 className="font-primary text-sm font-bold text-[#020617]">
                0% Escrow Fee Waiver
              </h3>
              <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                Enjoy 100% free platform escrow on your first 5 high-value trades (save up to ₦125,000 in fees).
              </p>
            </div>

            <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
                <Award className="h-5 w-5 text-[#ecc94b]" />
              </div>
              <h3 className="font-primary text-sm font-bold text-[#020617]">
                Founding Merchant Seal
              </h3>
              <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                Permanent cryptographic gold seal on your profile and listings, signaling day-one verified authenticity.
              </p>
            </div>

            <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#22c55e]/15 text-[#15803d]">
                <Clock className="h-5 w-5 text-[#22c55e]" />
              </div>
              <h3 className="font-primary text-sm font-bold text-[#020617]">
                Priority 48-Hour SLA
              </h3>
              <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                Fast-track diagnostic reviews and dedicated hardware arbitration officers for quick dispute turnaround.
              </p>
            </div>

            <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
                <ShieldCheck className="h-5 w-5 text-[#22c55e]" />
              </div>
              <h3 className="font-primary text-sm font-bold text-[#020617]">
                SmileID VIP Fast-Track
              </h3>
              <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                Skip standard identity review queues with priority 3D biometric NIN liveness clearance.
              </p>
            </div>
          </div>

          {/* ===================================================================
              MAIN WAITLIST CARD: FORM OR SUCCESS STATE
              =================================================================== */}
          <div ref={formRef} id="waitlist-form" className="max-w-2xl mx-auto scroll-mt-24">
            {!submittedData ? (
              /* FORM STATE */
              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-[0_4px_12px_rgba(15,23,42,0.06)] space-y-6">
                <div className="pb-4 border-b border-[#e2e8f0] text-center sm:text-left">
                  <h2 className="font-primary text-xl font-bold text-[#020617]">
                    Reserve Your Founding Position
                  </h2>
                  <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-1">
                    Takes 30 seconds. No credit card required. Invitation codes roll out for early access.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Trader Role Selector */}
                  <div>
                    <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-2">
                      I Primarily Plan To
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "buyer" })}
                        className={cn(
                          "py-2.5 px-3 rounded-[4px] text-xs font-medium border text-center transition-all duration-200 cursor-pointer",
                          formData.role === "buyer"
                            ? "border-[#0f172a] bg-[#0f172a] text-white shadow-xs"
                            : "border-[#e2e8f0] bg-[#f8fafc] text-[#020617] hover:bg-slate-100"
                        )}
                      >
                        Buy Gadgets
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "seller" })}
                        className={cn(
                          "py-2.5 px-3 rounded-[4px] text-xs font-medium border text-center transition-all duration-200 cursor-pointer",
                          formData.role === "seller"
                            ? "border-[#0f172a] bg-[#0f172a] text-white shadow-xs"
                            : "border-[#e2e8f0] bg-[#f8fafc] text-[#020617] hover:bg-slate-100"
                        )}
                      >
                        Sell Gadgets
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "both" })}
                        className={cn(
                          "py-2.5 px-3 rounded-[4px] text-xs font-medium border text-center transition-all duration-200 cursor-pointer",
                          formData.role === "both"
                            ? "border-[#0f172a] bg-[#0f172a] text-white shadow-xs"
                            : "border-[#e2e8f0] bg-[#f8fafc] text-[#020617] hover:bg-slate-100"
                        )}
                      >
                        Both / Merchant
                      </button>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
                        Full Name <span className="text-[#c53030]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                        }}
                        placeholder="e.g. Babatunde Adeleke"
                        className={cn(
                          "w-full h-11 px-3.5 rounded-[4px] border bg-white text-xs font-secondary text-[#020617] placeholder:text-[#94a3b8] transition-colors outline-none",
                          formErrors.fullName
                            ? "border-[#f56565] focus:ring-1 focus:ring-[#f56565]"
                            : "border-[#e2e8f0] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                        )}
                      />
                      {formErrors.fullName && (
                        <p className="font-secondary text-[11px] text-[#c53030] mt-1">
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
                        Email Address <span className="text-[#c53030]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                        }}
                        placeholder="you@company.ng"
                        className={cn(
                          "w-full h-11 px-3.5 rounded-[4px] border bg-white text-xs font-secondary text-[#020617] placeholder:text-[#94a3b8] transition-colors outline-none",
                          formErrors.email
                            ? "border-[#f56565] focus:ring-1 focus:ring-[#f56565]"
                            : "border-[#e2e8f0] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                        )}
                      />
                      {formErrors.email && (
                        <p className="font-secondary text-[11px] text-[#c53030] mt-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 803 000 0000"
                        className="w-full h-11 px-3.5 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] placeholder:text-[#94a3b8] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none"
                      />
                    </div>

                    {/* Flexible Trading Location Selector */}
                    <div>
                      <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
                        Trading Location
                      </label>
                      <select
                        value={locationPreset}
                        onChange={(e) => {
                          setLocationPreset(e.target.value);
                          if (formErrors.customCity) {
                            setFormErrors({ ...formErrors, customCity: undefined });
                          }
                        }}
                        className="w-full h-11 px-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none cursor-pointer"
                      >
                        {LOCATION_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DYNAMIC TEXT INPUT WHEN USER CHOOSES 'OTHER' */}
                  {locationPreset === "other" && (
                    <div className="rounded-[6px] border border-[#22c55e]/30 bg-[#22c55e]/5 p-3.5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="font-primary text-xs font-bold text-[#15803d] flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>Specify Your Trading City / State / Region <span className="text-[#c53030]">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => {
                          setCustomCity(e.target.value);
                          if (formErrors.customCity) {
                            setFormErrors({ ...formErrors, customCity: undefined });
                          }
                        }}
                        placeholder="e.g. Asaba, Delta State (or London, UK / Accra, Ghana)"
                        className={cn(
                          "w-full h-10 px-3 rounded-[4px] border bg-white text-xs font-secondary text-[#020617] placeholder:text-[#94a3b8] outline-none",
                          formErrors.customCity
                            ? "border-[#f56565] focus:ring-1 focus:ring-[#f56565]"
                            : "border-[#22c55e]/40 focus:border-[#15803d] focus:ring-1 focus:ring-[#15803d]"
                        )}
                        autoFocus
                      />
                      {formErrors.customCity && (
                        <p className="font-secondary text-[11px] text-[#c53030]">
                          {formErrors.customCity}
                        </p>
                      )}
                      <p className="font-secondary text-[10px] text-[#64748b]">
                        We use this to establish localized courier pickup hubs and hardware diagnostic depots in your area.
                      </p>
                    </div>
                  )}

                  {/* Favorite Gadgets Checklist */}
                  <div>
                    <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1.5">
                      Gadgets You Frequently Buy or Sell
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {GADGET_OPTIONS.map((gadget) => {
                        const checked = formData.favoriteGadgets.includes(gadget);
                        return (
                          <button
                            type="button"
                            key={gadget}
                            onClick={() => handleGadgetToggle(gadget)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-[4px] border text-left text-xs transition-colors cursor-pointer",
                              checked
                                ? "border-[#22c55e] bg-[#22c55e]/10 text-[#15803d] font-semibold"
                                : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors",
                                checked
                                  ? "border-[#22c55e] bg-[#22c55e] text-white"
                                  : "border-[#cbd5e1] bg-white"
                              )}
                            >
                              {checked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{gadget}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Volume */}
                  <div>
                    <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
                      Estimated Monthly Trade Volume
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["< ₦200,000", "₦200k - ₦1,000,000", "₦1,000,000+"].map((tier) => (
                        <button
                          type="button"
                          key={tier}
                          onClick={() => setFormData({ ...formData, monthlyVolume: tier })}
                          className={cn(
                            "py-2 px-2 text-[11px] rounded-[4px] border font-mono transition-colors text-center cursor-pointer",
                            formData.monthlyVolume === tier
                              ? "border-[#0f172a] bg-[#0f172a] text-white font-bold"
                              : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]"
                          )}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full h-12 text-sm font-semibold gap-2 bg-[#0f172a] text-white hover:bg-slate-800 rounded-[4px] shadow-sm cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Securing Your Queue Spot...</span>
                        </>
                      ) : (
                        <>
                          <span>Claim Founding Slot</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="font-secondary text-[11px] text-center text-[#64748b] mt-2">
                      🔒 Pre-launch reservation. You will receive an invitation code prior to Wave 1 onboarding.
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* ===============================================================
                 SUCCESS / QUEUE CONFIRMATION STATE (No leaking app navigation)
                 =============================================================== */
              <div className="rounded-[8px] border border-[#22c55e]/40 bg-white p-6 sm:p-8 shadow-[0_8px_20px_rgba(34,197,94,0.08)] space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                {/* Success Icon */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#15803d]">
                  <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#15803d] font-bold bg-[#22c55e]/10 px-3 py-1 rounded-full">
                    Founding Cohort Confirmed
                  </span>
                  <h2 className="font-primary text-2xl sm:text-3xl font-extrabold text-[#020617] tracking-tight">
                    You&apos;re On The Waitlist!
                  </h2>
                  <p className="font-secondary text-xs sm:text-sm text-[#64748b] max-w-md mx-auto">
                    Welcome aboard, <strong className="text-[#020617]">{submittedData.fullName}</strong>. A confirmation has been registered for <span className="font-mono text-[#0f172a] font-semibold">{submittedData.email}</span>.
                  </p>
                </div>

                {/* Queue Position Ticket */}
                <div className="rounded-[8px] border-2 border-dashed border-[#22c55e]/50 bg-[#22c55e]/5 p-5 text-center space-y-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748b] block font-semibold">
                    Your Queue Position
                  </span>
                  <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#020617]">
                    #{submittedData.queuePosition}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#15803d] font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span>Eligible for Wave 1 VIP Launch Access</span>
                  </div>
                  <p className="font-secondary text-[11px] text-[#64748b]">
                    Trading Location: <span className="font-semibold text-[#020617]">{submittedData.city}</span>
                  </p>
                </div>

                {/* Viral Referral Mechanic: Move up the queue */}
                <div className="rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-primary text-xs font-bold text-[#020617] flex items-center gap-1.5">
                        <Gift className="h-4 w-4 text-[#0f172a]" />
                        <span>Move Up 25 Spots Per Colleague Referred</span>
                      </h4>
                      <p className="font-secondary text-[11px] text-[#64748b] mt-0.5">
                        Share your unique invite link with friends, tech enthusiasts, or gadget merchants.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0f172a] bg-white border border-[#e2e8f0] px-2 py-1 rounded-[4px]">
                      {submittedData.referralCount} referred
                    </span>
                  </div>

                  {/* Share Link Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralUrl}
                      className="flex-1 h-10 px-3 bg-white border border-[#e2e8f0] rounded-[4px] font-mono text-xs text-[#0f172a] select-all outline-none"
                    />
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleCopyReferral}
                      className="gap-1.5 h-10 px-4 text-xs font-semibold bg-[#0f172a] text-white hover:bg-slate-800 rounded-[4px]"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* 1-Click Social Triggers */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <a
                      href={`https://wa.me/?text=${whatsappShareText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5 fill-current" />
                      <span>Share on WhatsApp (+25 Spots)</span>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${twitterShareText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-black/5 hover:bg-black/10 text-[#020617] text-xs font-semibold transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share on X</span>
                    </a>
                  </div>
                </div>

                {/* Pre-launch Next Steps (No leaking marketplace buttons) */}
                <div className="rounded-[6px] border border-[#e2e8f0] bg-white p-4 text-xs text-left space-y-2">
                  <div className="font-primary font-bold text-[#020617] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#22c55e]" />
                    <span>What Happens Next?</span>
                  </div>
                  <ul className="space-y-1.5 text-[#64748b] list-disc list-inside">
                    <li>Your 0% escrow fee voucher has been reserved under your email.</li>
                    <li>As Wave 1 draws near, we will send an exclusive VIP registration token to your inbox.</li>
                    <li>SmileID biometric verification takes under 2 minutes when your cohort is called.</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleResetForNew}
                    className="text-xs text-[#64748b] hover:text-[#020617] underline transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Register another trader or business partner</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===================================================================
              LIVE SOCIAL PROOF TICKER
              =================================================================== */}
          <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0f172a]" />
                <h3 className="font-primary text-xs font-bold uppercase tracking-wider text-[#020617]">
                  Recent Nigerian Traders Joining The Waitlist
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#22c55e] font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                Live Pre-Launch Feed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {RECENT_SIGNUPS.map((signup, idx) => (
                <div
                  key={idx}
                  className="rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-primary font-bold text-[#020617] truncate">
                      {signup.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#64748b]">
                      {signup.time}
                    </span>
                  </div>
                  <p className="font-secondary text-[11px] text-[#64748b] truncate">
                    {signup.location}
                  </p>
                  <span className="inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-[2px] bg-white border border-[#e2e8f0] text-[#0f172a]">
                    {signup.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ===================================================================
              FAQ ACCORDION SECTION
              =================================================================== */}
          <div className="max-w-3xl mx-auto space-y-6 pt-4">
            <div className="text-center space-y-1.5">
              <h2 className="font-primary text-2xl font-bold text-[#020617] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b]">
                Everything you need to know about the Scrowpoint pre-launch waitlist.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2">
                <h4 className="font-primary text-sm font-bold text-[#020617]">
                  How does the 0% escrow fee waiver work?
                </h4>
                <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                  The first 500 waitlist members receive a permanent waiver voucher for their first 5 transactions. When you buy or sell a gadget (e.g., iPhone 15 Pro or MacBook Pro), the standard 2.5% platform fee is completely ₦0.
                </p>
              </div>

              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2">
                <h4 className="font-primary text-sm font-bold text-[#020617]">
                  What happens when Wave 1 unlocks?
                </h4>
                <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                  You will receive an exclusive VIP onboarding token via email and WhatsApp. You will be able to complete your SmileID biometric KYC in under 2 minutes and begin posting or purchasing verified gadgets.
                </p>
              </div>

              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2">
                <h4 className="font-primary text-sm font-bold text-[#020617]">
                  How does the 48-hour inspection countdown work?
                </h4>
                <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                  When a courier delivers the gadget to your doorstep, a 48-hour hardware diagnostic timer starts. Your funds remain locked in our segregated CBN partner vault. If the device passes hardware tests (battery health, TrueTone, FaceID, iCloud unlock), you release the funds. If defective, you open a 1-click dispute.
                </p>
              </div>

              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 space-y-2">
                <h4 className="font-primary text-sm font-bold text-[#020617]">
                  Can merchants outside Lagos or major hubs apply?
                </h4>
                <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                  Yes! By selecting &quot;Other&quot; and specifying your city, our logistics operations team assesses parcel routing and trusted diagnostic hubs for your region before Wave 1 goes live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================================
          FOCUSED PRE-LAUNCH WAITLIST FOOTER
          Contains only essential pre-launch trust badges and contact info.
          Does not leak links to core unlaunched pages.
          ===================================================================== */}
      <footer className="border-t border-[#e2e8f0] bg-white py-8">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Trust Badges Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pb-6 border-b border-[#e2e8f0] text-xs font-mono text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <span>CBN-Licensed Escrow Partner</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <span>SmileID Biometric KYC</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <span>NDPR Data Privacy Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#22c55e]" />
              <span>256-Bit Bank-Grade Encryption</span>
            </span>
          </div>

          {/* Bottom Bar: Copyright & Inquiries */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs font-secondary text-[#64748b]">
            <div>
              <p className="font-medium text-[#020617]">
                Scrowpoint
              </p>
              <p className="text-[11px] mt-0.5">
                Pre-launch enrollment phase. All rights reserved &copy; {new Date().getFullYear()}.
              </p>
            </div>

            {/* Inquiries */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <a
                href="mailto:early@scrowpoint.com?subject=Founding%20Waitlist%20Inquiry"
                className="hover:text-[#0f172a] transition-colors flex items-center gap-1"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>early@scrowpoint.com</span>
              </a>
              <span className="text-[#cbd5e1]">•</span>
              <a
                href="https://wa.me/2348103202050?text=Hello%20Scrowpoint%20Team%2C%20I%20have%20an%20inquiry%20about%20the%20Waitlist"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#15803d] transition-colors flex items-center gap-1 text-[#15803d]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
