"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  DollarSign,
  FileText,
  HardDrive,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Lock,
  MapPin,
  Play,
  Plus,
  RotateCcw,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  Truck,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Screen: Post a Gadget / Sell Device Flow (Phase 3 §3)
 * Route: app/(protected)/seller/post-gadget/page.tsx
 *
 * Requirements (5_screen_flows.md, 1_product_requirements.md, 4_ui_system.md):
 * - Step 1: Device Category & Core Specs (Category, Brand, Model, Storage, Color, Serial/IMEI).
 * - Step 2: Diagnostic Condition Audit (Condition grade, Battery health %, Screen, FaceID, iCloud/MDM status).
 * - Step 3: High-Res Photos & Mandatory 30s Inspection Video.
 * - Step 4: Escrow Pricing Engine (0% Seller fee, 100% asking price payout, 2.5% Buyer escrow fee).
 * - Step 5: Logistics & Handoff Waybill (Pickup location, Courier preferences).
 * - Step 6: Publish Success Modal / Instant Live Preview.
 */

export interface PostGadgetPageProps {
  onSuccess?: (listingId: string) => void;
  onNavigateDashboard?: () => void;
  onNavigateMarketplace?: () => void;
}

export default function PostGadgetPage({
  onSuccess,
  onNavigateDashboard,
  onNavigateMarketplace,
}: PostGadgetPageProps) {
  const { user } = useAuth();

  // Wizard Steps: 1: Specs, 2: Diagnostics, 3: Media & Video, 4: Pricing & Logistics, 5: Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<"smartphone" | "laptop" | "tablet" | "wearable" | "gaming">("smartphone");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("iPhone 15 Pro Max");
  const [storage, setStorage] = useState("256GB");
  const [ram, setRam] = useState("8GB");
  const [color, setColor] = useState("Natural Titanium");
  const [imei, setImei] = useState("358941092837461");

  // Diagnostics
  const [condition, setCondition] = useState<"mint" | "good" | "fair">("mint");
  const [batteryHealth, setBatteryHealth] = useState<number>(97);
  const [screenCondition, setScreenCondition] = useState<"flawless" | "micro_scratches" | "replaced">("flawless");
  const [biometricsStatus, setBiometricsStatus] = useState<"functional" | "disabled">("functional");
  const [icloudStatus, setIcloudStatus] = useState<"clean_unlocked" | "locked">("clean_unlocked");
  const [carrierStatus, setCarrierStatus] = useState<"unlocked" | "locked">("unlocked");
  const [description, setDescription] = useState(
    "Purchased brand new 7 months ago. Handled exclusively with silicon case and sapphire screen protector. TrueTone, 120Hz ProMotion and cameras operate perfectly. Comes with original packaging, braided USB-C cable and 35W brick."
  );

  // Media
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80",
  ]);
  const [videoUrl, setVideoUrl] = useState<string>(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  );
  const [videoFilename, setVideoFilename] = useState("iphone15_pro_max_inspection_sweep.mp4");
  const [videoUploaded, setVideoUploaded] = useState(true);

  // Pricing & Logistics
  const [askingPriceNaira, setAskingPriceNaira] = useState<number>(980000);
  const [stateRegion, setStateRegion] = useState("Lagos State");
  const [pickupCity, setPickupCity] = useState("Ikeja GRA, Lagos");
  const [courierProvider, setCourierProvider] = useState<"gig" | "dhl" | "kwik">("gig");

  // Calculations
  const escrowFee = askingPriceNaira * 0.025;
  const shippingFee = 4500;
  const buyerTotal = askingPriceNaira + escrowFee + shippingFee;
  const sellerNetPayout = askingPriceNaira; // Zero fee for seller

  // Handle Photo Addition
  const handleAddSamplePhoto = () => {
    const samples = [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    ];
    const nextPhoto = samples[images.length % samples.length];
    setImages([...images, nextPhoto]);
  };

  const handleRemovePhoto = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Submit Listing
  const handlePublish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newId = `g-${Math.floor(100 + Math.random() * 900)}`;
      setPublishedListingId(newId);
      onSuccess?.(newId);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full pb-16">
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-[#e2e8f0] py-4">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href="/seller/dashboard"
                  onClick={onNavigateDashboard}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Seller Dashboard</span>
                </Link>
                <span className="text-[#64748b] text-xs">/</span>
                <span className="font-mono text-xs font-semibold text-[#0f172a]">
                  Post a Gadget for Escrow Sale
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold text-[#15803d]">
                  <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                  <span>SmileID Verified Seller</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Header & Progress Bar */}
        <div className="bg-[#0f172a] text-white py-8 border-b border-slate-800">
          <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#22c55e] font-semibold mb-1">
                  <span>STEP {currentStep} OF 4</span>
                  <span>•</span>
                  <span>PRE-VERIFIED LISTING ENGINE</span>
                </div>
                <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  List Gadget with 100% Escrow Protection
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-secondary">
                  Complete our hardware diagnostic checklist and provide a 30-second inspection video. Buyers lock funds safely in Paystack escrow before you ship.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-3 rounded-[8px] bg-slate-900 border border-slate-800 text-right">
                  <div className="text-[10px] font-mono text-slate-400">Seller Fee</div>
                  <div className="font-mono text-lg font-bold text-[#22c55e]">0.00%</div>
                  <div className="text-[10px] font-mono text-slate-400">100% Payout</div>
                </div>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
              {[
                { num: 1, title: "Device Specs", desc: "Model & IMEI" },
                { num: 2, title: "Diagnostics", desc: "Condition & Battery" },
                { num: 3, title: "Media & Video", desc: "Photos + 30s Proof" },
                { num: 4, title: "Pricing & Ship", desc: "Escrow & Payout" },
              ].map((step) => {
                const isCompleted = currentStep > step.num;
                const isCurrent = currentStep === step.num;

                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className={cn(
                      "text-left p-2 sm:p-3 rounded-[6px] transition-all border",
                      isCurrent
                        ? "bg-slate-800/90 border-[#22c55e] text-white"
                        : isCompleted
                        ? "bg-slate-900/60 border-slate-700/80 text-slate-300"
                        : "bg-transparent border-transparent text-slate-500 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[11px] mb-0.5">
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                      ) : (
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                            isCurrent
                              ? "bg-[#22c55e] text-[#020617]"
                              : "bg-slate-700 text-white"
                          )}
                        >
                          {step.num}
                        </span>
                      )}
                      <span className="font-semibold">{step.title}</span>
                    </div>
                    <div className="hidden sm:block text-[11px] text-slate-400 font-secondary truncate">
                      {step.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wizard Body Container */}
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Steps (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* ============================================================
                  STEP 1: DEVICE IDENTITY & HARDWARE SPECS
                  ============================================================ */}
              {currentStep === 1 && (
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-6">
                  <div>
                    <h2 className="font-primary text-lg font-bold text-[#020617]">
                      1. Device Category & Identification
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Specify the precise model and serial identity so our escrow agreement is legally binding.
                    </p>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-[#020617] mb-2 uppercase">
                      Device Category
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: "smartphone", label: "Phone", icon: Smartphone },
                        { id: "laptop", label: "Laptop", icon: HardDrive },
                        { id: "tablet", label: "Tablet", icon: Layers },
                        { id: "wearable", label: "Watch", icon: BatteryCharging },
                        { id: "gaming", label: "Console", icon: Zap },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = category === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCategory(item.id as any)}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-[6px] border text-center transition-all",
                              isSelected
                                ? "border-[#0f172a] bg-[#0f172a] text-white shadow-xs"
                                : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-slate-300 hover:text-[#020617]"
                            )}
                          >
                            <Icon className="h-5 w-5 mb-1" />
                            <span className="text-xs font-mono font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Brand & Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                        Brand Manufacturer
                      </label>
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                      >
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Google">Google</option>
                        <option value="Sony">Sony</option>
                        <option value="Dell">Dell</option>
                        <option value="Lenovo">Lenovo</option>
                        <option value="HP">HP</option>
                        <option value="Asus">Asus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                        Model Name & Variant
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
                        className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Storage, RAM & Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                        Storage Capacity
                      </label>
                      <select
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                      >
                        <option value="128GB">128GB</option>
                        <option value="256GB">256GB</option>
                        <option value="512GB">512GB</option>
                        <option value="1TB">1TB</option>
                        <option value="2TB">2TB</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                        System RAM
                      </label>
                      <input
                        type="text"
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        placeholder="e.g. 8GB Unified, 16GB LPDDR5"
                        className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                        Factory Finish / Color
                      </label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g. Space Black, Titanium"
                        className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Serial / IMEI Number */}
                  <div className="p-4 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>IMEI or Hardware Serial Number</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748b]">
                        Stored Encrypted • Shown to Buyer in Escrow
                      </span>
                    </div>
                    <input
                      type="text"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      placeholder="e.g. 358941092837461 (15-digit IMEI)"
                      className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 font-mono text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                    />
                    <p className="text-[11px] text-[#64748b] font-secondary">
                      The buyer must verify this exact IMEI match upon unboxing to approve fund release.
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================================
                  STEP 2: DIAGNOSTIC AUDIT & CONDITION
                  ============================================================ */}
              {currentStep === 2 && (
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-6">
                  <div>
                    <h2 className="font-primary text-lg font-bold text-[#020617]">
                      2. Hardware Diagnostic & Condition Audit
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Accurate disclosure prevents disputes during the 48-hour inspection period.
                    </p>
                  </div>

                  {/* Overall Condition Grade */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-[#020617] mb-2 uppercase">
                      Physical Cosmetic Condition
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "mint",
                          name: "Mint / Flawless",
                          badge: "Grade A+",
                          desc: "Zero dents or scratches. Indistinguishable from brand new in box.",
                        },
                        {
                          id: "good",
                          name: "Good / Minor Wear",
                          badge: "Grade B",
                          desc: "Clean display, faint hairline scuffs on bezel only visible under direct light.",
                        },
                        {
                          id: "fair",
                          name: "Fair / Working",
                          badge: "Grade C",
                          desc: "Noticeable scratches or casing wear, 100% operational hardware.",
                        },
                      ].map((item) => {
                        const isSelected = condition === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCondition(item.id as any)}
                            className={cn(
                              "p-3.5 rounded-[6px] border text-left transition-all",
                              isSelected
                                ? "border-[#0f172a] bg-[#0f172a]/5 ring-1 ring-[#0f172a]"
                                : "border-[#e2e8f0] bg-white hover:border-slate-300"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-primary font-bold text-xs text-[#020617]">
                                {item.name}
                              </span>
                              <span className="font-mono text-[10px] bg-slate-100 text-[#0f172a] px-1.5 py-0.5 rounded-[2px] font-semibold">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748b] leading-tight">
                              {item.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Battery Health Slider & Status */}
                  <div className="p-4 rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BatteryCharging className="h-4 w-4 text-[#22c55e]" />
                        <span className="font-mono text-xs font-bold uppercase text-[#020617]">
                          Battery Health Capacity
                        </span>
                      </div>
                      <span className="font-mono text-base font-bold text-[#020617] bg-white border border-[#e2e8f0] px-2.5 py-0.5 rounded-[4px]">
                        {batteryHealth}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="70"
                      max="100"
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(Number(e.target.value))}
                      className="w-full accent-[#22c55e] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
                      <span>70% (Service Recommended)</span>
                      <span>85% (Healthy)</span>
                      <span>100% (Brand New Battery)</span>
                    </div>
                  </div>

                  {/* Verification Checkpoints (4-Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-[6px] border border-[#e2e8f0] bg-white space-y-2">
                      <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>iCloud / Activation Lock</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIcloudStatus("clean_unlocked")}
                          className={cn(
                            "flex-1 py-1.5 px-2 text-xs font-mono rounded-[4px] border text-center transition-colors",
                            icloudStatus === "clean_unlocked"
                              ? "bg-[#22c55e] text-white border-[#22c55e] font-bold"
                              : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
                          )}
                        >
                          Clean / Logged Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setIcloudStatus("locked")}
                          className={cn(
                            "py-1.5 px-2 text-xs font-mono rounded-[4px] border text-center transition-colors",
                            icloudStatus === "locked"
                              ? "bg-red-600 text-white border-red-600 font-bold"
                              : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
                          )}
                        >
                          MDM / Locked
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-[6px] border border-[#e2e8f0] bg-white space-y-2">
                      <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>FaceID / TouchID Sensor</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBiometricsStatus("functional")}
                          className={cn(
                            "flex-1 py-1.5 px-2 text-xs font-mono rounded-[4px] border text-center transition-colors",
                            biometricsStatus === "functional"
                              ? "bg-[#22c55e] text-white border-[#22c55e] font-bold"
                              : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
                          )}
                        >
                          100% Functional
                        </button>
                        <button
                          type="button"
                          onClick={() => setBiometricsStatus("disabled")}
                          className={cn(
                            "py-1.5 px-2 text-xs font-mono rounded-[4px] border text-center transition-colors",
                            biometricsStatus === "disabled"
                              ? "bg-red-600 text-white border-red-600 font-bold"
                              : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
                          )}
                        >
                          Damaged / Off
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-[6px] border border-[#e2e8f0] bg-white space-y-2">
                      <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-[#0f172a]" />
                        <span>Display Glass Condition</span>
                      </label>
                      <select
                        value={screenCondition}
                        onChange={(e) => setScreenCondition(e.target.value as any)}
                        className="h-9 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-2 text-xs font-mono text-[#020617] focus:ring-1 focus:ring-[#0f172a] focus:outline-none"
                      >
                        <option value="flawless">Flawless Original OEM</option>
                        <option value="micro_scratches">Micro Scratches (Unnoticeable On)</option>
                        <option value="replaced">Aftermarket Screen Replaced</option>
                      </select>
                    </div>

                    <div className="p-3.5 rounded-[6px] border border-[#e2e8f0] bg-white space-y-2">
                      <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>Carrier Lock Status</span>
                      </label>
                      <select
                        value={carrierStatus}
                        onChange={(e) => setCarrierStatus(e.target.value as any)}
                        className="h-9 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-2 text-xs font-mono text-[#020617] focus:ring-1 focus:ring-[#0f172a] focus:outline-none"
                      >
                        <option value="unlocked">Factory Unlocked (All SIMs)</option>
                        <option value="locked">Network Locked / Chip Required</option>
                      </select>
                    </div>
                  </div>

                  {/* Written Description */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                      Detailed Seller Description & Accessories Included
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mention any included charger cables, original box, receipts, cases, or cosmetic blemishes..."
                      className="w-full rounded-[4px] border border-[#e2e8f0] bg-white p-3 text-xs sm:text-sm text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ============================================================
                  STEP 3: MEDIA & MANDATORY INSPECTION VIDEO
                  ============================================================ */}
              {currentStep === 3 && (
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="font-primary text-lg font-bold text-[#020617]">
                        3. Visual Evidence & Hardware Inspection Video
                      </h2>
                      <Badge variant="trust" className="text-[10px] font-mono">
                        Escrow Proof Required
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      High-resolution photos from multiple angles plus a 30-second inspection video video-recording screen touch, IMEI and cameras drastically reduces dispute rates.
                    </p>
                  </div>

                  {/* Multi-Photo Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center gap-1.5">
                        <Camera className="h-4 w-4 text-[#0f172a]" />
                        <span>High-Resolution Photos ({images.length} Added)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSamplePhoto}
                        className="text-xs font-mono text-[#0f172a] hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Angle Photo</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-4/3 rounded-[6px] overflow-hidden border border-[#e2e8f0] bg-[#f8fafc] group"
                        >
                          <img
                            src={img}
                            alt={`Device angle ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                              title="Remove photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-[2px]">
                            Photo {idx + 1}
                          </div>
                        </div>
                      ))}

                      {/* Dropzone Placeholder */}
                      <button
                        type="button"
                        onClick={handleAddSamplePhoto}
                        className="aspect-4/3 rounded-[6px] border-2 border-dashed border-[#cbd5e1] hover:border-[#0f172a] bg-[#f8fafc] flex flex-col items-center justify-center p-2 text-center transition-colors"
                      >
                        <Upload className="h-5 w-5 text-[#64748b] mb-1" />
                        <span className="text-[11px] font-mono font-semibold text-[#020617]">
                          Upload Photo
                        </span>
                        <span className="text-[9px] text-[#64748b]">Front, Back, Ports</span>
                      </button>
                    </div>
                  </div>

                  {/* Dedicated Mandatory Inspection Video Segment */}
                  <div className="rounded-[8px] border-2 border-[#22c55e]/40 bg-[#22c55e]/5 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center">
                          <Video className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-primary text-sm font-bold text-[#020617] flex items-center gap-1.5">
                            <span>Hardware Inspection Video Segment</span>
                            <span className="bg-[#22c55e] text-[#020617] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-[2px]">
                              REQUIRED
                            </span>
                          </div>
                          <div className="text-xs text-[#64748b] font-secondary">
                            Must demonstrate device boot, settings screen with IMEI, and touch digitizer response.
                          </div>
                        </div>
                      </div>

                      {videoUploaded && (
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#15803d] bg-white border border-[#22c55e]/40 px-2.5 py-1 rounded-[4px] self-start sm:self-auto">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                          <span>Video Attached (30s)</span>
                        </div>
                      )}
                    </div>

                    {/* Inspection Video Player Preview */}
                    <div className="relative aspect-video w-full rounded-[6px] overflow-hidden bg-[#020617] border border-slate-800 shadow-md">
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        poster={images[0]}
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-[#020617]/80 backdrop-blur-xs text-white font-mono text-[10px] px-2 py-0.5 rounded-[2px] flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span>Live Inspection Recording Preview</span>
                      </div>
                    </div>

                    {/* Inspection Guidelines Checklist */}
                    <div className="p-3 bg-white rounded-[6px] border border-[#e2e8f0] text-xs font-secondary space-y-1.5">
                      <div className="font-mono text-[11px] font-bold text-[#020617] uppercase mb-1">
                        What to show in the 30-Second Sweep:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#475569]">
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-[#22c55e]" />
                          <span>1. Show device physically 360°</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-[#22c55e]" />
                          <span>2. Open Settings &gt; General &gt; About (IMEI)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-[#22c55e]" />
                          <span>3. Show Battery Health percentage screen</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-[#22c55e]" />
                          <span>4. Drag an app icon across full screen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  STEP 4: PRICING & LOGISTICS
                  ============================================================ */}
              {currentStep === 4 && (
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-6">
                  <div>
                    <h2 className="font-primary text-lg font-bold text-[#020617]">
                      4. Escrow Pricing & Courier Logistics
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Transparent math. You receive 100% of your listed asking price. The buyer pays the 2.5% escrow fee.
                    </p>
                  </div>

                  {/* Asking Price Input */}
                  <div className="p-4 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                    <label className="text-xs font-mono font-semibold text-[#020617] uppercase flex items-center justify-between">
                      <span>Your Listed Asking Price (NGN)</span>
                      <span className="text-[#15803d] font-bold">100% Seller Net Payout</span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-[#64748b]">
                        ₦
                      </span>
                      <input
                        type="number"
                        step="5000"
                        value={askingPriceNaira}
                        onChange={(e) => setAskingPriceNaira(Math.max(0, Number(e.target.value)))}
                        className="h-12 w-full rounded-[4px] border border-[#cbd5e1] bg-white pl-8 pr-4 font-mono text-xl font-bold text-[#020617] focus:ring-2 focus:ring-[#0f172a] focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1 font-mono text-xs">
                      {[350000, 650000, 850000, 980000, 1250000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAskingPriceNaira(preset)}
                          className={cn(
                            "px-2 py-1 rounded-[4px] border text-[11px] transition-colors",
                            askingPriceNaira === preset
                              ? "bg-[#0f172a] text-white border-[#0f172a]"
                              : "bg-white text-[#64748b] border-[#e2e8f0] hover:text-[#020617]"
                          )}
                        >
                          ₦{(preset / 1000).toLocaleString()}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payout Breakdown Breakdown Card */}
                  <div className="p-4 rounded-[6px] border border-[#e2e8f0] bg-white space-y-3 font-secondary text-xs">
                    <div className="font-mono text-xs font-bold uppercase text-[#020617] pb-2 border-b border-[#e2e8f0] flex items-center justify-between">
                      <span>Automated Escrow Financial Breakdown</span>
                      <span className="text-[10px] text-[#22c55e]">P&amp;L Compliant</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#475569]">Your Net Seller Payout (Direct to Bank)</span>
                      <span className="font-mono font-bold text-sm text-[#15803d]">
                        ₦{sellerNetPayout.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">Buyer Escrow Protection Fee (2.5% tier)</span>
                      <span className="font-mono text-[#64748b]">
                        +₦{escrowFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">Tracked & Insured Courier Waybill</span>
                      <span className="font-mono text-[#64748b]">
                        +₦{shippingFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between font-bold text-[#020617]">
                      <span>Total Amount Buyer Locks into Escrow Vault</span>
                      <span className="font-mono text-base text-[#0f172a]">
                        ₦{buyerTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Logistics Pickup Section */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-primary text-sm font-bold text-[#020617] flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[#0f172a]" />
                      <span>Pickup Location & Courier Handoff</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                          State / Region
                        </label>
                        <select
                          value={stateRegion}
                          onChange={(e) => setStateRegion(e.target.value)}
                          className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-xs font-mono text-[#020617] focus:ring-1 focus:ring-[#0f172a] focus:outline-none"
                        >
                          <option value="Lagos State">Lagos State</option>
                          <option value="Abuja FCT">Abuja FCT</option>
                          <option value="Rivers State">Rivers State (Port Harcourt)</option>
                          <option value="Oyo State">Oyo State (Ibadan)</option>
                          <option value="Enugu State">Enugu State</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-semibold text-[#020617] mb-1.5 uppercase">
                          Pickup Address / Area
                        </label>
                        <input
                          type="text"
                          value={pickupCity}
                          onChange={(e) => setPickupCity(e.target.value)}
                          placeholder="e.g. 14 Joel Ogunnaike St, Ikeja GRA"
                          className="h-10 w-full rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-xs text-[#020617] focus:ring-1 focus:ring-[#0f172a] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-[#020617] mb-2 uppercase">
                        Preferred Insured Courier Partner
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { id: "gig", name: "GIG Logistics", badge: "Same-Day Dispatch" },
                          { id: "dhl", name: "DHL Express", badge: "Nationwide Insured" },
                          { id: "kwik", name: "Kwik Delivery", badge: "Intra-City Express" },
                        ].map((item) => {
                          const isSelected = courierProvider === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setCourierProvider(item.id as any)}
                              className={cn(
                                "p-2.5 rounded-[4px] border text-left transition-colors",
                                isSelected
                                  ? "bg-[#0f172a] text-white border-[#0f172a]"
                                  : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:text-[#020617]"
                              )}
                            >
                              <div className="font-mono text-xs font-bold">{item.name}</div>
                              <div className="text-[10px] opacity-80">{item.badge}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="gap-1.5 text-xs font-mono"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </Button>
                ) : (
                  <Link href="/seller/dashboard">
                    <Button variant="ghost" className="text-xs font-mono text-[#64748b]">
                      Cancel
                    </Button>
                  </Link>
                )}

                {currentStep < 4 ? (
                  <Button
                    variant="default"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="gap-2 text-xs font-semibold"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="gap-2 text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-[#020617]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-[#020617] border-t-transparent rounded-full animate-spin" />
                        <span>Verifying &amp; Publishing...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Publish Verified Escrow Listing</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Column: Live Listing Preview Desk (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-4 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                  <span className="font-mono text-xs uppercase font-bold text-[#64748b]">
                    Live Marketplace Preview
                  </span>
                  <Badge variant="trust" className="text-[10px] font-mono">
                    Escrow Ready
                  </Badge>
                </div>

                {/* Card Preview */}
                <div className="rounded-[8px] border border-[#e2e8f0] overflow-hidden bg-white shadow-xs">
                  <div className="relative aspect-4/3 bg-[#f8fafc]">
                    <img
                      src={images[0]}
                      alt="Device preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#0f172a]/90 text-white font-mono text-[10px] px-2 py-0.5 rounded-[4px] uppercase font-bold">
                      {condition} Grade
                    </div>
                    <div className="absolute top-2 right-2 bg-[#22c55e] text-[#020617] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="h-3 w-3" />
                      <span>SmileID NIN</span>
                    </div>

                    {videoUploaded && (
                      <div className="absolute bottom-2 left-2 bg-[#020617]/85 text-white font-mono text-[9px] px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                        <Video className="h-3 w-3 text-[#22c55e]" />
                        <span>30s Video Proof</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="font-primary font-bold text-sm text-[#020617] truncate">
                      {brand} {model} {storage}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg font-bold text-[#020617]">
                        ₦{askingPriceNaira.toLocaleString()}
                      </div>
                      <div className="font-mono text-[11px] text-[#22c55e] font-semibold flex items-center gap-1">
                        <BatteryCharging className="h-3.5 w-3.5" />
                        <span>{batteryHealth}% Battery</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[130px]">{pickupCity}</span>
                      </div>
                      <span>{user?.name || "Adeola Tech Hub"}</span>
                    </div>
                  </div>
                </div>

                {/* Seller Trust Checkpoints */}
                <div className="space-y-2 pt-2 text-xs font-secondary text-[#475569]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                    <span>Funds stay safely locked with Paystack until the buyer approves delivery.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                    <span>48-hour inspection timer auto-releases payout if no dispute is opened.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          PUBLISH SUCCESS MODAL
          ============================================================ */}
      {publishedListingId && (
        <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-xl text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#15803d] flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-[#22c55e]" />
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#15803d] font-bold bg-[#22c55e]/10 px-2 py-0.5 rounded-[4px]">
                LISTING LIVE ON MARKETPLACE
              </span>
              <h3 className="font-primary text-xl font-bold text-[#020617] mt-2">
                Gadget Listed Successfully!
              </h3>
              <p className="font-secondary text-xs text-[#64748b] mt-1">
                Your gadget listing <span className="font-mono font-bold text-[#020617]">#{publishedListingId}</span> is now active with pre-verified hardware diagnostics and inspection video proof.
              </p>
            </div>

            <div className="p-3 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] text-left text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Device:</span>
                <span className="font-bold text-[#020617]">{brand} {model} {storage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Asking Price:</span>
                <span className="font-bold text-[#15803d]">₦{askingPriceNaira.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Inspection Video:</span>
                <span className="font-bold text-[#22c55e]">Verified (30s attached)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href={`/gadget/${publishedListingId}`} className="w-full">
                <Button variant="outline" className="w-full text-xs font-mono">
                  View Listing
                </Button>
              </Link>
              <Link href="/seller/dashboard" className="w-full">
                <Button variant="default" className="w-full text-xs font-semibold">
                  Seller Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Strategy 2: Minimalist Wizard Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
