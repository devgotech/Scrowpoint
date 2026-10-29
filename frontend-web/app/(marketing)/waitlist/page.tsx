"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Fingerprint,
  Gift,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Percent,
  RefreshCw,
  Scale,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtocolComparisonWidget } from "@/components/marketing/ProtocolComparisonWidget";
import { GadgetVectorPattern } from "@/components/marketing/GadgetVectorPattern";

/**
 * Screen: Founding Waitlist & Cohort 01 Priority Allocation Portal
 * Route: app/(marketing)/waitlist/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper canvas (#F8F7F4), Deep Carbon Ink (#111113), Vermilion Orange accent (#FF5A25).
 * - Space Grotesk headings (tracking-[-0.04em]), Plus Jakarta Sans body copy, Space Grotesk Mono (.label / font-mono) for ledger metadata, queue IDs, and NGN figures.
 * - Sharp 0px architectural cards (border-[#111113]/12 bg-white) paired with 999px pill primary CTAs (.btn-primary).
 * - Unboxed typographic metadata lines (no compound pill slop).
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
  {
    id: "SP-C1-412",
    name: "Chidi Okafor",
    location: "Computer Village, Ikeja",
    role: "Verified Merchant",
    volume: "₦1M+ / mo",
    time: "3m ago",
  },
  {
    id: "SP-C1-411",
    name: "Fatima Bello",
    location: "Wuse 2, Abuja",
    role: "Gadget Buyer",
    volume: "₦200k–₦1M",
    time: "8m ago",
  },
  {
    id: "SP-C1-410",
    name: "Babatunde Adeleke",
    location: "Lekki Phase 1, Lagos",
    role: "Buyer & Seller",
    volume: "₦1M+ / mo",
    time: "14m ago",
  },
  {
    id: "SP-C1-409",
    name: "David Kalu",
    location: "GRA, Port Harcourt",
    role: "Verified Merchant",
    volume: "₦1M+ / mo",
    time: "22m ago",
  },
  {
    id: "SP-C1-408",
    name: "Ngozi Madu",
    location: "Bodija, Ibadan",
    role: "Gadget Buyer",
    volume: "₦200k–₦1M",
    time: "34m ago",
  },
];

const GADGET_OPTIONS = [
  "iPhones & iPads",
  "MacBooks & Pro Laptops",
  "PlayStation 5 & Consoles",
  "Mirrorless Cameras & Lenses",
  "Apple Watch & Audio",
  "Starlink & Creator Gear",
];

const LOCATION_PRESETS = [
  { value: "Lagos (Ikeja / Computer Village)", label: "Lagos — Ikeja / Computer Village" },
  { value: "Lagos (Lekki / Victoria Island / Ajah)", label: "Lagos — Lekki / VI / Ajah" },
  { value: "Lagos (Surulere / Yaba / Mainland)", label: "Lagos — Yaba / Surulere / Mainland" },
  { value: "Abuja (Wuse / Maitama / Garki)", label: "Abuja (FCT) — Wuse / Maitama / Garki" },
  { value: "Port Harcourt (Rivers State)", label: "Port Harcourt (Rivers State)" },
  { value: "Ibadan (Oyo State)", label: "Ibadan (Oyo State)" },
  { value: "Enugu / Onitsha / Southeast", label: "Enugu / Onitsha (Southeast)" },
  { value: "Kano / Kaduna / North", label: "Kano / Kaduna (North)" },
  { value: "other", label: "Other City / State (Specify below)" },
];

const COMPARISON_ROWS = [
  {
    dimension: "01. Payment Security",
    unprotected: "Buyer sends direct bank transfer hoping seller ships; or seller falls for a fake SMS alert / reversed transfer.",
    scrowpoint: "Buyer funds lock in a segregated Paystack custodial vault. Seller receives cryptographic proof of funds before dispatch.",
  },
  {
    dimension: "02. Hardware Integrity",
    unprotected: "Buyer discovers swapped screens, boosted 3uTools battery health, or hidden iCloud MDM locks after cash is gone.",
    scrowpoint: "Mandatory 48-Hour Hardware Diagnostic Window starts upon courier delivery. Funds remain frozen until buyer approves.",
  },
  {
    dimension: "03. Counterparty Identity",
    unprotected: "Anonymous Jiji/WhatsApp accounts and burner SIM cards that block you immediately after payment.",
    scrowpoint: "Every participant passes SmileID 3D biometric liveness + government NIN/BVN verification before trading.",
  },
  {
    dimension: "04. Dispute Resolution",
    unprotected: "Zero recourse, police station delays, or unmoderated social media callouts when a device arrives defective.",
    scrowpoint: "1-click dispute freeze within 48 hours. Hardware engineers arbitrate using unboxing video, IMEI serials, and diagnostic logs.",
  },
];

const WAITLIST_FAQS = [
  {
    index: "01",
    question: "How does the Founding Cohort 0% escrow fee waiver work?",
    answer:
      "Standard Scrowpoint escrow fees range from 2.5% (trades above ₦500,000) to 5.0% (trades under ₦100,000). The first 500 founding members receive a fee waiver across their first 5 settled transactions—saving up to ₦125,000 in platform fees when buying or selling MacBooks, iPhones, or cameras.",
  },
  {
    index: "02",
    question: "How does Scrowpoint protect both the buyer and the gadget seller?",
    answer:
      "Buyers never lose money to 'what I ordered vs. what I got' because funds stay locked in our Paystack custodial vault until they physically inspect the device for 48 hours. Sellers never lose inventory to fake bank alerts or payment-on-delivery no-shows because 100% of the buyer's deposit is verified in escrow before the courier picks up the package.",
  },
  {
    index: "03",
    question: "What happens during the 48-hour hardware diagnostic window?",
    answer:
      "The moment our logistics partner (DHL, GIG, or Fez) logs delivery at your address, a 48-hour countdown begins. You can test FaceID, TrueTone, cellular baseband, battery cycle count, and iCloud status. Tapping 'Confirm & Release' triggers an instant NIBSS NIP payout to the seller. If a hidden defect is found, tapping 'Raise Dispute' freezes the vault for engineering arbitration.",
  },
  {
    index: "04",
    question: "When will Cohort 01 invitation tokens be dispatched?",
    answer:
      "Founding Cohort 01 access tokens are dispatched in rolling waves based on queue position. Once your slot is called, you will receive an email and WhatsApp link to complete your 2-minute SmileID biometric KYC and activate your Founding Merchant or Buyer seal.",
  },
];

export interface WaitlistPageProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
}

export default function WaitlistPage({ onNavigateHome }: WaitlistPageProps) {
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
    favoriteGadgets: ["iPhones & iPads", "MacBooks & Pro Laptops"],
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

  const [liveClaimedCount, setLiveClaimedCount] = useState<number>(INITIAL_CLAIMED);

  // Restore saved waitlist reservation from localStorage and sync live queue telemetry from GET /api/waitlist/status
  useEffect(() => {
    let savedEmail = "";
    if (typeof window !== "undefined") {
      try {
        const saved =
          localStorage.getItem("sp_waitlist_user") ||
          localStorage.getItem("bh_waitlist_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          setSubmittedData(parsed);
          savedEmail = parsed?.email || "";
        }
      } catch {}
    }

    const fetchWaitlistStatus = async () => {
      try {
        const query = savedEmail ? `?email=${encodeURIComponent(savedEmail)}` : "";
        const res = await fetch(`/api/waitlist/status${query}`);
        if (res.ok) {
          const payload = await res.json();
          const data = payload?.data || payload;
          if (typeof data?.claimedSlots === "number") {
            setLiveClaimedCount(data.claimedSlots);
          }
          if (data?.entry) {
            setSubmittedData((prev) =>
              prev
                ? {
                    ...prev,
                    queuePosition: data.entry.queuePosition ?? prev.queuePosition,
                    referralCode: data.entry.referralCode ?? prev.referralCode,
                    referralCount: data.entry.referralCount ?? prev.referralCount,
                  }
                : prev
            );
          }
        }
      } catch {
        // Fallback to local waitlist state when offline
      }
    };

    fetchWaitlistStatus();
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
      errors.fullName = "Enter your full legal or registered merchant name";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email address to receive your Cohort 01 token";
    }

    if (locationPreset === "other" && !customCity.trim()) {
      errors.customCity = "Specify your primary trading city and state";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const resolvedCity =
      locationPreset === "other"
        ? customCity.trim() || "Other Location"
        : locationPreset;

    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const referredBy = urlParams?.get("ref") || undefined;

    let newQueueNumber = liveClaimedCount + 1;
    let refCode = `SP-C1-${Math.floor(1000 + Math.random() * 9000)}`;
    let referralCount = 0;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          city: resolvedCity,
          favoriteGadgets: formData.favoriteGadgets,
          monthlyVolume: formData.monthlyVolume,
          referredBy,
        }),
      });
      if (res.ok) {
        const payload = await res.json();
        const data = payload?.data || payload;
        const entry = data?.entry || data;
        if (entry?.queuePosition) newQueueNumber = entry.queuePosition;
        if (entry?.referralCode) refCode = entry.referralCode;
        if (typeof entry?.referralCount === "number") referralCount = entry.referralCount;
        if (typeof data?.claimedSlots === "number") {
          setLiveClaimedCount(data.claimedSlots);
        }
      }
    } catch {
      // Fallback to local generation when offline
    }

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
      referralCount,
    };

    setSubmittedData(record);
    setIsSubmitting(false);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sp_waitlist_user", JSON.stringify(record));
      } catch {}
    }

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCopyReferral = () => {
    if (!submittedData) return;
    const shareUrl = `https://scrowpoint.ng/waitlist?ref=${submittedData.referralCode}`;
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
      favoriteGadgets: ["iPhones & iPads", "MacBooks & Pro Laptops"],
      monthlyVolume: "₦200k - ₦1,000,000",
    });
    setLocationPreset("Lagos (Ikeja / Computer Village)");
    setCustomCity("");
    setFormErrors({});
  };

  const currentClaimed = submittedData ? submittedData.queuePosition : INITIAL_CLAIMED;
  const remainingSlots = TOTAL_SLOTS - currentClaimed;
  const capacityPercentage = Math.min(100, Math.round((currentClaimed / TOTAL_SLOTS) * 100));

  const referralUrl = submittedData
    ? `https://scrowpoint.ng/waitlist?ref=${submittedData.referralCode}`
    : "https://scrowpoint.ng/waitlist";

  const whatsappShareText = encodeURIComponent(
    `I just secured my Founding Cohort 01 spot on Scrowpoint — Nigeria's P2P gadget escrow engine with Paystack custody & a 48-hour hardware diagnostic window. First 500 traders get 0% escrow fees on their first 5 trades: ${referralUrl}`
  );

  const twitterShareText = encodeURIComponent(
    `No more fake bank alerts or defective gadget deliveries. Just joined @scrowpoint Founding Cohort 01! 48H hardware inspection SLA + segregated Paystack escrow: ${referralUrl}`
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-[#F8F7F4]">
      {/* =====================================================================
          1. VARIATION 7 EDITORIAL WAITLIST HEADER
          ===================================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-[#111113]/12 bg-[#F8F7F4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 sm:px-8">
          {/* Left: Brand Wordmark + Back to Overview */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              onClick={onNavigateHome}
              className="flex items-center gap-2 focus:outline-none"
            >
              <span className="font-primary text-2xl font-extrabold tracking-[-0.05em] text-[#111113] leading-none">
                SCROWPOINT<span className="text-[#FF5A25]">.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2.5 pl-6 border-l border-[#111113]/15">
              <span className="h-2 w-2 rounded-full bg-[#FF5A25] animate-pulse" />
              <span className="label !opacity-80">
                Founding Cohort 01
              </span>
              <span className="text-[#111113]/25">•</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#15803d] font-bold">
                {remainingSlots} of {TOTAL_SLOTS} Slots Open
              </span>
            </div>
          </div>

          {/* Right: Navigation & Primary Pill Action */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 nav-link text-[#111113]/70 hover:text-[#111113] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Platform Overview</span>
            </Link>

            {!submittedData ? (
              <button
                type="button"
                onClick={scrollToForm}
                className="btn-primary !py-2.5 !px-5 text-xs uppercase tracking-wider inline-flex items-center gap-2"
              >
                <span>Reserve Founding Slot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="font-mono text-xs uppercase tracking-wider text-[#15803d] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                <span>Queue #{submittedData.queuePosition} Secured</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN CONTENT
          ===================================================================== */}
      <main className="flex-1 w-full">
        {/* ===================================================================
            2. ASYMMETRIC TWO-COLUMN HERO & FOUNDING RESERVATION DESK
            Left (7 cols): Editorial Pitch, Core Business Model, & Cohort Perks
            Right (5 cols): Sticky Architectural Reservation Form / Pass
            =================================================================== */}
        <section className="relative overflow-hidden border-b border-[#111113]/12 py-12 sm:py-20">
          {/* Seamless Repeating Gadget Vector Pattern Background */}
          <GadgetVectorPattern idPrefix="sp-waitlist-hero" variant="split" />

          <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
              {/* -------------------------------------------------------------
                  LEFT COLUMN (7 COLS): EDITORIAL HIERARCHY & BUSINESS MODEL
                  ------------------------------------------------------------- */}
              <div className="lg:col-span-7 space-y-8">
                {/* Unboxed Editorial Kicker & Metadata Line */}
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono uppercase tracking-[0.15em] text-[#111113]/70">
                    <span className="text-[#111113] font-bold">P2P Escrow Engine v.2026</span>
                    <span aria-hidden="true" className="text-[#111113]/25">•</span>
                    <span>Wave 1 Priority Access</span>
                    <span aria-hidden="true" className="text-[#111113]/25">•</span>
                    <span className="text-[#FF5A25] font-bold">
                      {remainingSlots} Founding Slots Remaining
                    </span>
                  </div>

                  <h1 className="font-primary text-5xl sm:text-6xl xl:text-[5.25rem] font-bold tracking-[-0.04em] text-[#111113] leading-[0.92] uppercase">
                    END FAKE ALERTS.
                    <br />
                    END DEFECTIVE TECH<span className="text-[#FF5A25]">.</span>
                  </h1>

                  <p className="font-secondary text-base sm:text-lg text-[#111113]/75 max-w-xl leading-relaxed">
                    Buyer funds lock in segregated Paystack custody while sellers dispatch via tracked courier—releasing payout only after a{" "}
                    <strong className="font-semibold text-[#111113]">
                      48-hour hardware inspection
                    </strong>
                    .
                  </p>
                </div>

                {/* Compact 3-Pillar Protocol Strip */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="label">Core Protocol Architecture</span>
                    <span className="label !opacity-100 text-[#15803d]">Zero Counterparty Risk</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#111113]/12 bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#111113]/12">
                    <div className="p-4 flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 border border-[#111113]/12 bg-[#F8F7F4] flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-[#111113]" />
                      </div>
                      <div>
                        <p className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                          Paystack Custody
                        </p>
                        <p className="font-mono text-[11px] text-[#111113]/60 uppercase tracking-wider">
                          100% Locked Upfront
                        </p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 border border-[#111113]/12 bg-[#F8F7F4] flex items-center justify-center">
                        <Fingerprint className="h-4 w-4 text-[#FF5A25]" />
                      </div>
                      <div>
                        <p className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                          SmileID Biometrics
                        </p>
                        <p className="font-mono text-[11px] text-[#111113]/60 uppercase tracking-wider">
                          Mandatory NIN / BVN
                        </p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 border border-[#111113]/12 bg-[#F8F7F4] flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#15803d]" />
                      </div>
                      <div>
                        <p className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                          48H Diagnostic SLA
                        </p>
                        <p className="font-mono text-[11px] text-[#111113]/60 uppercase tracking-wider">
                          Verify Before Payout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Founding Cohort 01 Value Metrics Strip */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="label">Cohort 01 Value Proposition (First 500)</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#FF5A25] font-bold">
                      Priority Allocation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#111113]/12 bg-white divide-y sm:divide-y-0 divide-x divide-[#111113]/12">
                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#15803d] font-bold">
                          Fee Waiver
                        </span>
                        <Percent className="h-3.5 w-3.5 text-[#15803d]" />
                      </div>
                      <p className="font-mono text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                        0% FEE
                      </p>
                      <p className="font-secondary text-[11px] text-[#111113]/65">
                        On first 5 trades
                      </p>
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF5A25] font-bold">
                          Max Savings
                        </span>
                        <Award className="h-3.5 w-3.5 text-[#FF5A25]" />
                      </div>
                      <p className="font-mono text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                        ₦125K
                      </p>
                      <p className="font-secondary text-[11px] text-[#111113]/65">
                        Escrow fee cap saved
                      </p>
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#111113]/60 font-bold">
                          Settlement
                        </span>
                        <Truck className="h-3.5 w-3.5 text-[#111113]" />
                      </div>
                      <p className="font-mono text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                        INSTANT
                      </p>
                      <p className="font-secondary text-[11px] text-[#111113]/65">
                        Direct NIBSS payout
                      </p>
                    </div>

                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#15803d] font-bold">
                          Trust Badge
                        </span>
                        <ShieldCheck className="h-3.5 w-3.5 text-[#15803d]" />
                      </div>
                      <p className="font-mono text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                        TIER 01
                      </p>
                      <p className="font-secondary text-[11px] text-[#111113]/65">
                        Founding profile seal
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------
                  RIGHT COLUMN (5 COLS): FOUNDING RESERVATION DESK / PASS
                  ------------------------------------------------------------- */}
              <div
                ref={formRef}
                id="waitlist-form"
                className="lg:col-span-5 lg:sticky lg:top-28 scroll-mt-24"
              >
                {!submittedData ? (
                  /* ARCHITECTURAL RESERVATION FORM CARD */
                  <div className="border border-[#111113]/15 bg-white">
                    {/* Top Ledger Header Bar */}
                    <div className="border-b border-[#111113]/12 bg-[#111113] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#FF5A25]" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold">
                          Cohort 01 Reservation Desk
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-white/80">
                        {currentClaimed}/{TOTAL_SLOTS} Claimed
                      </span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="px-6 pt-5 pb-4 border-b border-[#111113]/12 bg-[#F8F7F4]">
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-[#111113] font-bold uppercase tracking-wider">
                          0% Fee Allocation Capacity
                        </span>
                        <span className="text-[#FF5A25] font-bold">
                          {capacityPercentage}% Filled ({remainingSlots} left)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#111113]/10 overflow-hidden">
                        <div
                          className="h-full bg-[#111113] transition-all duration-500"
                          style={{ width: `${capacityPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                      <div>
                        <h2 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113]">
                          Reserve Your Founding Position
                        </h2>
                        <p className="font-secondary text-xs text-[#111113]/65 mt-1">
                          Lock in your 0% fee voucher for your first 5 escrow trades. No credit card required.
                        </p>
                      </div>

                      {/* Role Selector */}
                      <div>
                        <label className="label !opacity-90 block mb-2">
                          01. Primary Trading Role
                        </label>
                        <div className="grid grid-cols-3 border border-[#111113]/15 bg-[#F8F7F4] p-1 gap-1">
                          {[
                            { value: "buyer" as UserRoleChoice, label: "Buy Tech" },
                            { value: "seller" as UserRoleChoice, label: "Sell Tech" },
                            { value: "both" as UserRoleChoice, label: "Both / Merchant" },
                          ].map((option) => {
                            const active = formData.role === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, role: option.value })}
                                className={cn(
                                  "min-h-[40px] px-2 py-2 text-xs font-secondary font-semibold transition-colors cursor-pointer text-center",
                                  active
                                    ? "bg-[#111113] text-white"
                                    : "text-[#111113]/70 hover:text-[#111113] hover:bg-white/60"
                                )}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Full Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label !opacity-90 block mb-1.5">
                            02. Full Name / Store Name <span className="text-[#FF5A25]">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => {
                              setFormData({ ...formData, fullName: e.target.value });
                              if (formErrors.fullName) {
                                setFormErrors({ ...formErrors, fullName: undefined });
                              }
                            }}
                            placeholder="e.g. Adeola Tech Hub"
                            className={cn(
                              "w-full h-11 px-3.5 border bg-white text-xs font-secondary text-[#111113] placeholder:text-[#111113]/40 transition-colors outline-none",
                              formErrors.fullName
                                ? "border-[#f56565] focus:border-[#c53030]"
                                : "border-[#111113]/15 focus:border-[#111113]"
                            )}
                          />
                          {formErrors.fullName && (
                            <p className="font-secondary text-[11px] text-[#c53030] mt-1">
                              {formErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="label !opacity-90 block mb-1.5">
                            03. Email Address <span className="text-[#FF5A25]">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (formErrors.email) {
                                setFormErrors({ ...formErrors, email: undefined });
                              }
                            }}
                            placeholder="you@domain.ng"
                            className={cn(
                              "w-full h-11 px-3.5 border bg-white text-xs font-secondary text-[#111113] placeholder:text-[#111113]/40 transition-colors outline-none",
                              formErrors.email
                                ? "border-[#f56565] focus:border-[#c53030]"
                                : "border-[#111113]/15 focus:border-[#111113]"
                            )}
                          />
                          {formErrors.email && (
                            <p className="font-secondary text-[11px] text-[#c53030] mt-1">
                              {formErrors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp Phone & Primary Trading Hub */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label !opacity-90 block mb-1.5">
                            04. WhatsApp Alert Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+234 803 000 0000"
                            className="w-full h-11 px-3.5 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] placeholder:text-[#111113]/40 focus:border-[#111113] outline-none"
                          />
                        </div>

                        <div>
                          <label className="label !opacity-90 block mb-1.5">
                            05. Primary Trading Hub
                          </label>
                          <select
                            value={locationPreset}
                            onChange={(e) => {
                              setLocationPreset(e.target.value);
                              if (formErrors.customCity) {
                                setFormErrors({ ...formErrors, customCity: undefined });
                              }
                            }}
                            className="w-full h-11 px-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] focus:border-[#111113] outline-none cursor-pointer"
                          >
                            {LOCATION_PRESETS.map((preset) => (
                              <option key={preset.value} value={preset.value}>
                                {preset.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Custom City Input */}
                      {locationPreset === "other" && (
                        <div className="border border-[#111113]/20 bg-[#F8F7F4] p-4 space-y-2">
                          <label className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#111113] flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#FF5A25]" />
                            <span>
                              Specify Trading City &amp; State <span className="text-[#FF5A25]">*</span>
                            </span>
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
                            placeholder="e.g. Benin City, Edo State / Uyo, Akwa Ibom"
                            className={cn(
                              "w-full h-10 px-3 border bg-white text-xs font-secondary text-[#111113] placeholder:text-[#111113]/40 outline-none",
                              formErrors.customCity
                                ? "border-[#f56565]"
                                : "border-[#111113]/15 focus:border-[#111113]"
                            )}
                            autoFocus
                          />
                          {formErrors.customCity && (
                            <p className="font-secondary text-[11px] text-[#c53030]">
                              {formErrors.customCity}
                            </p>
                          )}
                          <p className="font-secondary text-[11px] text-[#111113]/65">
                            Used to prioritize DHL/GIG dispatch hubs in your state for Wave 1.
                          </p>
                        </div>
                      )}

                      {/* Hardware Categories Checklist */}
                      <div>
                        <label className="label !opacity-90 block mb-2">
                          06. Hardware Categories Traded
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
                                  "flex items-center gap-2.5 px-3 py-2.5 border text-left text-xs font-secondary transition-colors cursor-pointer",
                                  checked
                                    ? "border-[#111113] bg-[#F8F7F4] text-[#111113] font-semibold"
                                    : "border-[#111113]/12 bg-white text-[#111113]/65 hover:border-[#111113]/30"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                                    checked
                                      ? "border-[#111113] bg-[#111113] text-white"
                                      : "border-[#111113]/25 bg-white"
                                  )}
                                >
                                  {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                </span>
                                <span className="truncate">{gadget}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Monthly Trade Volume */}
                      <div>
                        <label className="label !opacity-90 block mb-2">
                          07. Estimated Monthly Escrow Volume
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {["< ₦200,000", "₦200k - ₦1,000,000", "₦1,000,000+"].map((tier) => {
                            const active = formData.monthlyVolume === tier;
                            return (
                              <button
                                type="button"
                                key={tier}
                                onClick={() => setFormData({ ...formData, monthlyVolume: tier })}
                                className={cn(
                                  "py-2.5 px-2 text-[11px] border font-mono transition-colors text-center cursor-pointer",
                                  active
                                    ? "border-[#111113] bg-[#111113] text-white font-bold"
                                    : "border-[#111113]/15 bg-white text-[#111113]/70 hover:bg-[#F8F7F4]"
                                )}
                              >
                                {tier}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Submit Pill CTA */}
                      <div className="pt-2 space-y-2.5">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Locking Founding Slot...</span>
                            </>
                          ) : (
                            <>
                              <span>Claim Founding Cohort Slot</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-center text-[#111113]/60">
                          0% Fee Voucher • SmileID Priority • NDPR Protected
                        </p>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ===========================================================
                     CONFIRMED FOUNDING COHORT ALLOCATION PASS
                     =========================================================== */
                  <div className="border border-[#111113] bg-white">
                    {/* Pass Header */}
                    <div className="bg-[#111113] text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                        <span className="font-mono text-xs uppercase tracking-[0.15em] font-bold">
                          Founding Pass Issued
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#FF5A25] font-bold">
                        REF: {submittedData.referralCode}
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Queue Number Ledger Box */}
                      <div className="border border-[#111113]/15 bg-[#F8F7F4] p-6 text-center space-y-2">
                        <span className="label block">
                          Verified Cohort 01 Queue Position
                        </span>
                        <div className="font-mono text-5xl sm:text-6xl font-bold text-[#111113] tracking-[-0.04em]">
                          #{submittedData.queuePosition}
                        </div>
                        <div className="pt-1 flex items-center justify-center gap-2 text-xs font-mono text-[#15803d] font-bold">
                          <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                          <span>0% Escrow Fee Waiver Locked (First 5 Trades)</span>
                        </div>
                      </div>

                      {/* Holder Metadata Ledger */}
                      <div className="border border-[#111113]/12 divide-y divide-[#111113]/12 text-xs">
                        <div className="flex items-center justify-between py-2.5 px-3.5">
                          <span className="font-mono uppercase text-[#111113]/60">Registered Holder</span>
                          <span className="font-primary font-bold text-[#111113]">{submittedData.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5 px-3.5">
                          <span className="font-mono uppercase text-[#111113]/60">Token Delivery</span>
                          <span className="font-mono font-semibold text-[#111113]">{submittedData.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5 px-3.5">
                          <span className="font-mono uppercase text-[#111113]/60">Primary Hub</span>
                          <span className="font-secondary font-semibold text-[#111113]">{submittedData.city}</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5 px-3.5">
                          <span className="font-mono uppercase text-[#111113]/60">Est. Volume</span>
                          <span className="font-mono font-bold text-[#15803d]">{submittedData.monthlyVolume}</span>
                        </div>
                      </div>

                      {/* Referral Priority Boost */}
                      <div className="border border-[#111113]/15 bg-[#F8F7F4] p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#111113] flex items-center gap-1.5">
                              <Gift className="h-3.5 w-3.5 text-[#FF5A25]" />
                              <span>Priority Queue Jump (+25 Spots)</span>
                            </span>
                            <p className="font-secondary text-xs text-[#111113]/70 mt-1">
                              Invite fellow gadget buyers or Computer Village merchants to advance into Wave 1 immediate access.
                            </p>
                          </div>
                          <span className="font-mono text-[11px] font-bold bg-white border border-[#111113]/15 px-2 py-0.5 text-[#111113] shrink-0">
                            {submittedData.referralCount} Referred
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={referralUrl}
                            className="flex-1 h-10 px-3 bg-white border border-[#111113]/15 font-mono text-xs text-[#111113] select-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyReferral}
                            className="h-10 px-4 bg-[#111113] text-white hover:bg-[#FF5A25] transition-colors font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedLink ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={`https://wa.me/?text=${whatsappShareText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-secondary font-semibold transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Share via WhatsApp</span>
                          </a>

                          <a
                            href={`https://twitter.com/intent/tweet?text=${twitterShareText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 border border-[#111113]/20 bg-white hover:border-[#111113] text-[#111113] text-xs font-secondary font-semibold transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Post on X</span>
                          </a>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={handleResetForNew}
                          className="font-mono text-[11px] uppercase tracking-wider text-[#111113]/65 hover:text-[#111113] underline inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Register Another Trader</span>
                        </button>

                        <Link
                          href="/pricing"
                          className="font-mono text-[11px] uppercase tracking-wider text-[#FF5A25] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Preview Fee Calculator</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. THE BUSINESS MODEL LEDGER: WHY SCROWPOINT REPLACES DIRECT P2P
            =================================================================== */}
        <section className="border-b border-[#111113]/12 py-16 sm:py-24 bg-[#F8F7F4]">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="label block mb-3">Market Problem vs. Custodial Protocol</span>
                <h2 className="font-primary text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#111113] leading-none uppercase">
                  UNPROTECTED P2P VS. SCROWPOINT CUSTODY<span className="text-[#FF5A25]">.</span>
                </h2>
              </div>
              <p className="font-secondary text-sm sm:text-base text-[#111113]/70 max-w-md">
                Click through the 4 trade stages below to see how Scrowpoint protects each step compared to direct WhatsApp or classified transfers.
              </p>
            </div>

            <ProtocolComparisonWidget />
          </div>
        </section>

        {/* ===================================================================
            4. LIVE COHORT 01 ENROLLMENT LEDGER
            =================================================================== */}
        <section className="border-b border-[#111113]/12 py-16 bg-[#F8F7F4]">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="label block mb-1">Live Enrollment Feed</span>
                <h3 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113]">
                  Recent Nigerian Buyers &amp; Merchants in Cohort 01
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#15803d] font-bold">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>Verified Pre-Launch Queue</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border border-[#111113]/12 bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#111113]/12">
              {RECENT_SIGNUPS.map((signup) => (
                <div key={signup.id} className="p-5 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#111113]/55">
                      <span>{signup.id}</span>
                      <span>{signup.time}</span>
                    </div>
                    <div className="font-primary text-sm font-bold text-[#111113] tracking-[-0.02em]">
                      {signup.name}
                    </div>
                    <p className="font-secondary text-xs text-[#111113]/65">
                      {signup.location}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#111113]/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="text-[#111113] font-semibold">{signup.role}</span>
                    <span className="text-[#15803d] font-bold">{signup.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. FOUNDING COHORT FAQ LEDGER
            =================================================================== */}
        <section className="py-16 sm:py-24 bg-[#F8F7F4]">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="label block mb-3">Protocol Clarifications</span>
                <h2 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                  FOUNDING WAITLIST &amp; ESCROW FAQ<span className="text-[#FF5A25]">.</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToForm}
                className="btn-primary self-start md:self-auto text-xs uppercase tracking-wider inline-flex items-center gap-2"
              >
                <span>Claim Your 0% Fee Slot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WAITLIST_FAQS.map((faq) => (
                <div
                  key={faq.index}
                  className="border border-[#111113]/12 bg-white p-6 sm:p-8 space-y-3"
                >
                  <span className="label block text-[#FF5A25] !opacity-100">
                    [FAQ {faq.index}]
                  </span>
                  <h4 className="font-primary text-lg sm:text-xl font-bold tracking-[-0.03em] text-[#111113]">
                    {faq.question}
                  </h4>
                  <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          6. VARIATION 7 EDITORIAL FOOTER
          ===================================================================== */}
      <footer className="border-t border-[#111113]/12 bg-[#F8F7F4] py-12">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 space-y-8">
          {/* Top Compliance Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#111113]/12">
            <div className="flex items-center gap-3">
              <span className="font-primary text-xl font-extrabold tracking-[-0.05em] text-[#111113]">
                SCROWPOINT<span className="text-[#FF5A25]">.</span>
              </span>
              <span className="text-[#111113]/25">•</span>
              <span className="label">P2P Gadget Escrow Engine</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-[#111113]/75">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>Paystack Segregated Custody</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4 text-[#FF5A25]" />
                <span>SmileID Biometric KYC</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[#111113]" />
                <span>48H Hardware Audit SLA</span>
              </span>
            </div>
          </div>

          {/* Bottom Copyright & Desk Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="label">
              © {new Date().getFullYear()} Scrowpoint Technologies Limited. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-wider">
              <Link href="/pricing" className="text-[#111113]/70 hover:text-[#111113] transition-colors">
                Fee Calculator
              </Link>
              <Link href="/trust-and-safety" className="text-[#111113]/70 hover:text-[#111113] transition-colors">
                Trust &amp; Safety
              </Link>
              <a
                href="mailto:early@scrowpoint.ng?subject=Founding%20Cohort%2001%20Inquiry"
                className="text-[#111113]/70 hover:text-[#111113] transition-colors inline-flex items-center gap-1"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>early@scrowpoint.ng</span>
              </a>
              <a
                href="https://wa.me/2348000000000?text=Hello%20Scrowpoint%20Team%2C%20I%20have%20an%20inquiry%20about%20Founding%20Cohort%2001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#15803d] font-bold hover:underline inline-flex items-center gap-1"
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
