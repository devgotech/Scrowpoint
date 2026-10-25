"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Expand,
  Eye,
  HardDrive,
  Heart,
  Lock,
  MapPin,
  Maximize2,
  MessageSquare,
  Package,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Star,
  Truck,
  UserCheck,
  Video,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_GADGETS } from "../../marketplace/page";
import { cn } from "@/lib/utils";

/**
 * Screen 4 (Detail): Single Gadget Page (Phase 1 §4)
 * Route: app/(public)/gadget/[id]/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Authoritative inspection presentation before buyer locks funds in escrow.
 * - Scrollable high-resolution image gallery with thumbnail carousel & active counter.
 * - Hardware inspection video segment with verified diagnostic sweeps (IMEI, Digitizer, TrueTone, Battery).
 * - SmileID KYC verified seller badge.
 * - Sticky mobile bottom bar with 44px touch targets.
 * - Token Compliance: 8px card radius, 4px controls, Roboto headings, Geist Mono metrics.
 */

export interface GadgetDetailPageProps {
  gadgetId?: string;
  onBackToMarketplace?: () => void;
  onLockEscrow?: (gadgetId: string) => void;
}

export default function GadgetDetailPage({
  gadgetId = "g-001",
  onBackToMarketplace,
  onLockEscrow,
}: GadgetDetailPageProps) {
  const gadget =
    INITIAL_GADGETS.find((g) => g.id === gadgetId) || INITIAL_GADGETS[0];

  // Media Gallery State
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "video">("photos");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const priceNaira = gadget.price / 100;
  const escrowFee = priceNaira * 0.025; // Tier 3 rate for premium
  const shippingFee = 4500;
  const totalDeposit = priceNaira + escrowFee + shippingFee;

  const totalImages = gadget.images.length;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleSelectThumbnail = (index: number) => {
    setActiveImageIndex(index);
    setActiveMediaTab("photos");
  };

  const handleToggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-[#e2e8f0] py-4">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href="/marketplace"
                  onClick={onBackToMarketplace}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Marketplace</span>
                </Link>
                <span className="text-[#64748b] text-xs">/</span>
                <span className="font-mono text-xs text-[#64748b] capitalize">
                  {gadget.category}
                </span>
                <span className="text-[#64748b] text-xs">/</span>
                <span className="font-mono text-xs font-semibold text-[#0f172a] truncate max-w-[180px] sm:max-w-none">
                  {gadget.model || gadget.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-8 px-2.5 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-mono text-[#64748b] hover:text-[#020617] flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{copied ? "Copied Link!" : "Share"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={cn(
                    "h-8 px-2.5 rounded-[4px] border text-xs font-mono flex items-center gap-1.5 transition-colors",
                    isSaved
                      ? "border-[#f56565] text-[#f56565] bg-[#f56565]/10"
                      : "border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#020617]"
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                  <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gadget Detail Layout */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* =============================================================
                  LEFT COLUMN: PHOTOS GALLERY & VIDEO SEGMENT & HARDWARE DIAGNOSTICS (7 Cols)
                  ============================================================= */}
              <div className="lg:col-span-7 space-y-6">
                {/* Media Container: Photos & Hardware Inspection Video */}
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-4 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-3">
                  {/* Media Mode Tabs: [Photos (5)] vs [Inspection Video (30s)] */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMediaTab("photos")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-all",
                          activeMediaTab === "photos"
                            ? "bg-[#0f172a] text-white shadow-xs"
                            : "bg-[#f8fafc] text-[#64748b] hover:text-[#020617] border border-[#e2e8f0]"
                        )}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Photos ({totalImages})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMediaTab("video");
                          if (videoRef.current && !isVideoPlaying) {
                            videoRef.current.play().catch(() => {});
                            setIsVideoPlaying(true);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono font-semibold transition-all",
                          activeMediaTab === "video"
                            ? "bg-[#22c55e] text-[#020617] shadow-xs"
                            : "bg-[#f8fafc] text-[#64748b] hover:text-[#020617] border border-[#e2e8f0]"
                        )}
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Inspection Video (30s)</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#15803d] animate-pulse" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#64748b] hidden sm:block">
                      {activeMediaTab === "photos"
                        ? `Photo ${activeImageIndex + 1} of ${totalImages}`
                        : "Verified 30s Hardware Sweep"}
                    </div>
                  </div>

                  {/* Viewport 1: High-Res Photo Gallery */}
                  {activeMediaTab === "photos" && (
                    <div className="space-y-3">
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded-[6px] bg-[#f8fafc] flex items-center justify-center border border-[#e2e8f0] group">
                        <img
                          src={gadget.images[activeImageIndex] || gadget.images[0]}
                          alt={`${gadget.title} - View ${activeImageIndex + 1}`}
                          className="h-full w-full object-cover transition-all duration-200"
                        />

                        {/* Top Left: Condition Badge */}
                        <div className="absolute top-3 left-3 bg-[#0f172a]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-[4px] font-mono text-xs font-semibold uppercase tracking-wider shadow-xs">
                          {gadget.condition} Grade
                        </div>

                        {/* Top Right: SmileID Verified Badge */}
                        {gadget.sellerVerified && (
                          <div className="absolute top-3 right-3 bg-[#22c55e]/95 backdrop-blur-xs text-[#020617] px-2.5 py-1 rounded-[4px] font-mono text-xs font-bold flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>SmileID Verified</span>
                          </div>
                        )}

                        {/* Carousel Prev / Next Chevron Arrows */}
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          aria-label="Previous photo"
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-[#0f172a] shadow-md flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all border border-[#e2e8f0]"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          aria-label="Next photo"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-[#0f172a] shadow-md flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all border border-[#e2e8f0]"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Bottom Floating Counter Strip */}
                        <div className="absolute bottom-3 inset-x-0 flex justify-center">
                          <div className="bg-[#020617]/80 backdrop-blur-xs text-white font-mono text-xs px-3 py-1 rounded-full flex items-center gap-2">
                            <span>
                              {activeImageIndex + 1} / {totalImages}
                            </span>
                            <span>•</span>
                            <span className="text-[#22c55e] text-[10px] font-semibold">
                              Authentic Inspection Photos
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Thumbnail Carousel Strip */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-[#64748b] flex items-center justify-between">
                          <span>Scroll or click to inspect angles:</span>
                          <span className="text-[10px]">Use arrows or swipe</span>
                        </div>
                        <div
                          ref={thumbnailStripRef}
                          className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth"
                        >
                          {gadget.images.map((img, idx) => {
                            const isCurrent = activeImageIndex === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectThumbnail(idx)}
                                className={cn(
                                  "relative h-16 w-20 sm:h-20 sm:w-24 shrink-0 rounded-[4px] overflow-hidden border-2 transition-all duration-150",
                                  isCurrent
                                    ? "border-[#0f172a] ring-2 ring-[#0f172a]/20 scale-[1.02]"
                                    : "border-[#e2e8f0] opacity-70 hover:opacity-100 hover:border-slate-400"
                                )}
                              >
                                <img
                                  src={img}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white font-mono text-[9px] text-center py-0.5">
                                  Angle {idx + 1}
                                </div>
                              </button>
                            );
                          })}

                          {/* Quick Shortcut to Video in the thumbnail strip */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMediaTab("video");
                              if (videoRef.current) {
                                videoRef.current.play().catch(() => {});
                                setIsVideoPlaying(true);
                              }
                            }}
                            className="relative h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-[4px] overflow-hidden border-2 border-dashed border-[#22c55e] bg-[#22c55e]/10 flex flex-col items-center justify-center p-1 text-center hover:bg-[#22c55e]/20 transition-colors"
                          >
                            <Play className="h-5 w-5 text-[#15803d] mb-1 fill-[#15803d]" />
                            <span className="font-mono text-[10px] font-bold text-[#15803d]">
                              Play Video
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Viewport 2: Dedicated Hardware Inspection Video Segment */}
                  {activeMediaTab === "video" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="relative aspect-video w-full rounded-[6px] overflow-hidden bg-[#020617] border border-slate-800 shadow-md">
                        <video
                          ref={videoRef}
                          src={
                            gadget.videoUrl ||
                            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                          }
                          playsInline
                          loop
                          muted={isVideoMuted}
                          poster={gadget.images[0]}
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                          className="h-full w-full object-contain"
                        />

                        {/* Video Controls Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none flex flex-col justify-between p-3">
                          <div className="flex items-center justify-between pointer-events-auto">
                            <div className="bg-[#020617]/90 backdrop-blur-xs text-white font-mono text-[11px] px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 border border-slate-700">
                              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="font-bold">VERIFIED SELLER INSPECTION</span>
                              <span className="text-slate-400">• 0:30 Diagnostic Sweep</span>
                            </div>

                            <button
                              type="button"
                              onClick={handleToggleMute}
                              className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-slate-700"
                              title={isVideoMuted ? "Unmute" : "Mute"}
                            >
                              {isVideoMuted ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between pointer-events-auto">
                            <button
                              type="button"
                              onClick={handleToggleVideoPlay}
                              className="h-10 w-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-[#020617] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                              title={isVideoPlaying ? "Pause Video" : "Play Video"}
                            >
                              {isVideoPlaying ? (
                                <Pause className="h-5 w-5 fill-current" />
                              ) : (
                                <Play className="h-5 w-5 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="font-mono text-xs text-white/90 bg-black/60 px-2.5 py-1 rounded-[4px] border border-slate-700">
                              Device: {gadget.model}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Diagnostic Checkpoints Banner */}
                      <div className="p-4 rounded-[6px] border border-[#22c55e]/30 bg-[#22c55e]/5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-primary text-xs font-bold text-[#020617]">
                            <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                            <span>Pre-Escrow Video Inspection Checkpoints</span>
                          </div>
                          <Badge variant="trust" className="text-[10px] font-mono">
                            Mandatory Proof
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-secondary">
                          <div className="flex items-center gap-2 text-[#15803d]">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>IMEI on screen matches listing registry</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#15803d]">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>Full screen digitizer touch sweep verified</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#15803d]">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>Front &amp; Rear cameras autofocus active</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#15803d]">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>iCloud / Activation Lock clean &amp; logged out</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#64748b] pt-1 border-t border-[#22c55e]/20">
                          <strong>Escrow Protection Rule:</strong> When courier delivers your package, inspect and verify this video's exact condition before approving funds release.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hardware Diagnostic Report Card */}
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#0f172a]" />
                      <h3 className="font-primary text-sm font-bold text-[#020617]">
                        Hardware Diagnostic Audit
                      </h3>
                    </div>
                    <Badge variant="trust" className="text-[10px] font-mono">
                      Pre-Inspected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                        <BatteryCharging className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>Battery Health</span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#020617]">
                        {gadget.batteryHealth ? `${gadget.batteryHealth}% Max` : "Tested 95%+"}
                      </div>
                      <div className="text-[10px] font-mono text-[#15803d]">OEM Original Cell</div>
                    </div>

                    <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                        <HardDrive className="h-3.5 w-3.5 text-[#0f172a]" />
                        <span>Storage & RAM</span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#020617]">
                        {gadget.storage || "256GB NVMe"}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748b]">Factory Partition</div>
                    </div>

                    <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                        <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>Activation Lock</span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#15803d]">Clean / Off</div>
                      <div className="text-[10px] font-mono text-[#64748b]">No MDM / No iCloud</div>
                    </div>

                    <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>FaceID / Biometrics</span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#020617]">Passed 100%</div>
                      <div className="text-[10px] font-mono text-[#64748b]">Sensor Clean</div>
                    </div>

                    <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                        <Smartphone className="h-3.5 w-3.5 text-[#0f172a]" />
                        <span>Display / TrueTone</span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#020617]">Active</div>
                      <div className="text-[10px] font-mono text-[#64748b]">No Dead Pixels</div>
                    </div>

                    <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                        <span>Carrier Status</span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#020617]">Unlocked</div>
                      <div className="text-[10px] font-mono text-[#64748b]">All Nigerian SIMs</div>
                    </div>
                  </div>
                </div>

                {/* Seller Description & Escrow Rules */}
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-3">
                  <h3 className="font-primary text-sm font-bold text-[#020617]">
                    Seller Device Description
                  </h3>
                  <p className="font-secondary text-xs sm:text-sm text-[#334155] leading-relaxed">
                    Device was bought brand new from Apple authorized reseller and kept inside an otterbox case with tempered glass screen protector since day one. Flawless front display, minor hairline scratch on bottom speaker grille only visible under direct light. Comes with original fast charging brick and USB-C braided cable.
                  </p>

                  <div className="pt-3 border-t border-[#e2e8f0] flex items-center gap-2 text-xs font-mono text-[#64748b]">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Dispatches from: {gadget.location} (Insured Tracked Courier)</span>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  RIGHT COLUMN: ESCROW PURCHASE DESK & SELLER CARD (5 Cols)
                  ============================================================= */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Escrow Lock Purchase Card */}
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_4px_8px_rgba(15,23,42,0.06)] space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase font-bold text-[#64748b]">
                        Buy with Escrow Vault
                      </span>
                      <span className="font-mono text-[10px] text-[#15803d] font-bold bg-[#22c55e]/15 px-2 py-0.5 rounded-[4px] border border-[#22c55e]/30">
                        100% FRAUD SHIELD
                      </span>
                    </div>
                    <h1 className="font-primary text-xl sm:text-2xl font-bold text-[#020617] mt-1">
                      {gadget.title}
                    </h1>
                  </div>

                  {/* Price */}
                  <div className="p-4 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="font-secondary text-xs text-[#64748b] mb-1">
                      Agreed Marketplace Price
                    </div>
                    <div className="font-mono text-3xl font-extrabold text-[#020617]">
                      ₦{priceNaira.toLocaleString()}
                    </div>
                    <div className="font-mono text-[11px] text-[#15803d] flex items-center gap-1 mt-1 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                      <span>Held in Paystack Escrow until 48H Inspection passes</span>
                    </div>
                  </div>

                  {/* Escrow Fee Breakdown */}
                  <div className="space-y-2.5 font-secondary text-xs border-y border-[#e2e8f0] py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">Escrow Protection Fee (2.5%)</span>
                      <span className="font-mono font-medium text-[#020617]">
                        +₦{escrowFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748b]">Tracked & Insured Courier Waybill</span>
                      <span className="font-mono font-medium text-[#020617]">
                        +₦{shippingFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] font-bold">
                      <span className="text-[#020617]">Total Locked in Escrow</span>
                      <span className="font-mono text-sm text-[#020617]">
                        ₦{totalDeposit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Primary Escrow Trigger CTA */}
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => onLockEscrow?.(gadget.id)}
                    className="w-full h-12 text-sm font-semibold gap-2 shadow-xs"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Lock Funds &amp; Start Escrow Trade</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* Guarantee Disclaimer */}
                  <div className="rounded-[4px] border border-[#ecc94b]/40 bg-[#ecc94b]/15 p-3 flex items-start gap-2.5 text-xs text-[#975a16]">
                    <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>48-Hour Guarantee:</strong> The seller does NOT receive payout until you receive the package, inspect the device, and approve funds release.
                    </span>
                  </div>
                </div>

                {/* 2. Seller Identity Profile Card */}
                <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.04)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-primary font-bold text-sm">
                        {(gadget.sellerName || "Adeola Tech Hub").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-primary text-sm font-bold text-[#020617]">
                          {gadget.sellerName}
                        </div>
                        <div className="flex items-center gap-1 font-secondary text-[11px] text-[#64748b]">
                          <MapPin className="h-3 w-3" />
                          <span>{gadget.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold text-[#15803d]">
                      <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                      <span>SmileID NIN Checked</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#e2e8f0] font-mono text-xs">
                    <div className="p-2 rounded-[4px] bg-[#f8fafc]">
                      <div className="font-bold text-[#020617]">4.95 ★</div>
                      <div className="text-[10px] text-[#64748b]">Rating</div>
                    </div>
                    <div className="p-2 rounded-[4px] bg-[#f8fafc]">
                      <div className="font-bold text-[#020617]">42</div>
                      <div className="text-[10px] text-[#64748b]">Escrows</div>
                    </div>
                    <div className="p-2 rounded-[4px] bg-[#f8fafc]">
                      <div className="font-bold text-[#15803d]">100%</div>
                      <div className="text-[10px] text-[#64748b]">Completion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Mobile Bottom Bar (Visible on mobile screens < lg) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-[#e2e8f0] p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] text-[#64748b]">Price in Escrow</div>
          <div className="font-mono text-lg font-bold text-[#020617]">
            ₦{priceNaira.toLocaleString()}
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={() => onLockEscrow?.(gadget.id)}
          className="h-11 px-5 text-xs font-semibold gap-2 shadow-xs"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Lock Funds</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Footer />
    </div>
  );
}
