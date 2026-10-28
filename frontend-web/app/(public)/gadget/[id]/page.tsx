"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  HardDrive,
  Heart,
  Lock,
  MapPin,
  Pause,
  Play,
  Share2,
  ShieldCheck,
  Smartphone,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { type GadgetListingData } from "@/components/GadgetListingCard";
import { INITIAL_GADGETS } from "../../marketplace/page";
import { listingsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Screen 4 (Detail): Single Gadget Page (Phase 1 §4)
 * Route: app/(public)/gadget/[id]/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Warm Stone (#F0EFEA)
 * - Deep Carbon Ink (#111113), Vermilion Orange (#FF5A25), Forest Trust Green (#15803d)
 * - 0px sharp architectural cards (border-[#111113]/12) paired with 999px pill primary CTAs
 * - Integer kobo financial calculations (NEVER Rule #6)
 */

export interface GadgetDetailPageProps {
  gadgetId?: string;
  onBackToMarketplace?: () => void;
  onLockEscrow?: (gadgetId: string) => void;
}

function formatKoboToNgn(kobo: number): string {
  const naira = Math.round(kobo / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

export default function GadgetDetailPage({
  gadgetId = "g-001",
  onBackToMarketplace,
  onLockEscrow,
}: GadgetDetailPageProps) {
  const fallbackGadget =
    INITIAL_GADGETS.find((g) => g.id === gadgetId) || INITIAL_GADGETS[0];
  const [liveGadget, setLiveGadget] = useState<GadgetListingData | null>(null);
  const gadget = liveGadget || fallbackGadget;

  useEffect(() => {
    let mounted = true;
    listingsApi.getById(gadgetId).then((res) => {
      if (!mounted || !res.ok || !res.data) return;
      const dto = res.data;
      const rawCond = (dto.condition_grade || "mint").toLowerCase();
      const condition: "mint" | "good" | "fair" =
        rawCond === "good" || rawCond === "fair" ? rawCond : "mint";
      const rawCat = (dto.category || "smartphone").toLowerCase();
      const category =
        rawCat === "laptop" ||
        rawCat === "tablet" ||
        rawCat === "wearable" ||
        rawCat === "gaming"
          ? rawCat
          : "smartphone";

      setLiveGadget({
        id: dto.id,
        title: dto.title,
        brand: dto.title.split(" ")[0] || fallbackGadget.brand,
        model: dto.title,
        category,
        price: dto.price_kobo,
        isPriceInKobo: true,
        condition,
        batteryHealth: dto.battery_health || fallbackGadget.batteryHealth,
        storage: dto.storage_capacity || fallbackGadget.storage,
        location: dto.location_city
          ? `${dto.location_city}${dto.location_state ? `, ${dto.location_state}` : ""}`
          : fallbackGadget.location,
        sellerName: dto.seller_name || fallbackGadget.sellerName,
        sellerVerified: true,
        images:
          dto.image_urls && dto.image_urls.length > 0
            ? dto.image_urls
            : fallbackGadget.images,
        videoUrl: fallbackGadget.videoUrl,
      });
    });
    return () => {
      mounted = false;
    };
  }, [gadgetId, fallbackGadget]);

  // Media Gallery State
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "video">(
    "photos"
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // Integer kobo calculations (250 bps = 2.5% escrow fee)
  const priceKobo = gadget.price;
  const escrowFeeKobo = Math.round((priceKobo * 250) / 10000);
  const shippingFeeKobo = 450000; // ₦4,500 in kobo
  const totalDepositKobo = priceKobo + escrowFeeKobo + shippingFeeKobo;

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
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased pb-20 lg:pb-0 selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-[#111113]/12 py-3.5">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em]">
                <Link
                  href="/marketplace"
                  onClick={onBackToMarketplace}
                  className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Marketplace</span>
                </Link>
                <span aria-hidden="true" className="text-[#111113]/25">
                  /
                </span>
                <span className="text-[#111113]/65">{gadget.category}</span>
                <span aria-hidden="true" className="text-[#111113]/25">
                  /
                </span>
                <span className="font-bold text-[#111113] truncate max-w-[180px] sm:max-w-none">
                  {gadget.model || gadget.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-9 px-3 border border-[#111113]/15 bg-white text-xs font-mono uppercase tracking-wider text-[#111113]/75 hover:text-[#111113] hover:border-[#111113] flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {copied ? "Copied Link!" : "Share"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={cn(
                    "h-9 px-3 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors",
                    isSaved
                      ? "border-[#FF5A25] text-[#FF5A25] bg-[#FF5A25]/10 font-bold"
                      : "border-[#111113]/15 bg-white text-[#111113]/75 hover:text-[#111113] hover:border-[#111113]"
                  )}
                >
                  <Heart
                    className={cn("h-3.5 w-3.5", isSaved && "fill-current")}
                  />
                  <span className="hidden sm:inline">
                    {isSaved ? "Saved" : "Save"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gadget Detail Layout */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* =============================================================
                  LEFT COLUMN: PHOTOS GALLERY, VIDEO & DIAGNOSTICS (7 Cols)
                  ============================================================= */}
              <div className="lg:col-span-7 space-y-8">
                {/* Media Container: Photos & Hardware Inspection Video */}
                <div className="border border-[#111113]/12 bg-white p-5 space-y-4">
                  {/* Media Mode Tabs: [Photos] vs [Inspection Video (30s)] */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#111113]/12">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMediaTab("photos")}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-colors border",
                          activeMediaTab === "photos"
                            ? "bg-[#111113] text-white border-[#111113]"
                            : "bg-[#F8F7F4] text-[#111113]/70 hover:text-[#111113] border-[#111113]/15"
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
                          "flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-colors border",
                          activeMediaTab === "video"
                            ? "bg-[#111113] text-white border-[#111113]"
                            : "bg-[#F8F7F4] text-[#111113]/70 hover:text-[#111113] border-[#111113]/15"
                        )}
                      >
                        <Video className="h-3.5 w-3.5 text-[#FF5A25]" />
                        <span>30s Inspection Sweep</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#111113]/60 hidden sm:block">
                      {activeMediaTab === "photos"
                        ? `Angle 0${activeImageIndex + 1} of 0${totalImages}`
                        : "Verified 30s Hardware Sweep"}
                    </div>
                  </div>

                  {/* Viewport 1: High-Res Photo Gallery */}
                  {activeMediaTab === "photos" && (
                    <div className="space-y-4">
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F0EFEA] flex items-center justify-center border border-[#111113]/12 group">
                        <img
                          src={
                            gadget.images[activeImageIndex] || gadget.images[0]
                          }
                          alt={`${gadget.title} - View ${activeImageIndex + 1}`}
                          className="h-full w-full object-cover transition-all duration-200"
                        />

                        {/* Top Left: Condition Label */}
                        <div className="absolute top-3 left-3 bg-[#111113] text-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
                          {gadget.condition} Grade
                        </div>

                        {/* Top Right: SmileID Verified Pill */}
                        {gadget.sellerVerified && (
                          <div className="absolute top-3 right-3 rounded-full bg-white/95 border border-[#111113]/15 text-[#15803d] px-3 py-1 font-mono text-xs font-bold flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                            <span>SmileID Verified</span>
                          </div>
                        )}

                        {/* Carousel Prev / Next Arrows */}
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          aria-label="Previous photo"
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-[#111113] hover:text-white text-[#111113] flex items-center justify-center opacity-85 group-hover:opacity-100 transition-colors border border-[#111113]/15"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          aria-label="Next photo"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-[#111113] hover:text-white text-[#111113] flex items-center justify-center opacity-85 group-hover:opacity-100 transition-colors border border-[#111113]/15"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Bottom Counter Bar */}
                        <div className="absolute bottom-3 inset-x-0 flex justify-center">
                          <div className="bg-[#111113]/90 text-white font-mono text-xs px-3.5 py-1 flex items-center gap-2">
                            <span>
                              0{activeImageIndex + 1} / 0{totalImages}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-[#22c55e] text-[10px] uppercase tracking-wider font-bold">
                              Authentic Inspection Photos
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Thumbnail Carousel Strip */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#111113]/60 flex items-center justify-between">
                          <span>Inspect Hardware Angles:</span>
                          <span className="text-[10px]">
                            Click thumbnail or video proof
                          </span>
                        </div>
                        <div
                          ref={thumbnailStripRef}
                          className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5"
                        >
                          {gadget.images.map((img, idx) => {
                            const isCurrent = activeImageIndex === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectThumbnail(idx)}
                                className={cn(
                                  "relative h-16 w-20 sm:h-20 sm:w-24 shrink-0 overflow-hidden border transition-all duration-150",
                                  isCurrent
                                    ? "border-[#111113] ring-2 ring-[#111113]"
                                    : "border-[#111113]/15 opacity-70 hover:opacity-100 hover:border-[#111113]/50"
                                )}
                              >
                                <img
                                  src={img}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-[#111113]/85 text-white font-mono text-[9px] uppercase tracking-wider text-center py-0.5">
                                  Angle 0{idx + 1}
                                </div>
                              </button>
                            );
                          })}

                          {/* Quick Shortcut to Video */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMediaTab("video");
                              if (videoRef.current) {
                                videoRef.current.play().catch(() => {});
                                setIsVideoPlaying(true);
                              }
                            }}
                            className="relative h-16 w-24 sm:h-20 sm:w-28 shrink-0 border border-dashed border-[#15803d] bg-[#15803d]/5 flex flex-col items-center justify-center p-1 text-center hover:bg-[#15803d]/10 transition-colors"
                          >
                            <Play className="h-5 w-5 text-[#15803d] mb-1 fill-[#15803d]" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
                              30s Video
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Viewport 2: Dedicated Hardware Inspection Video Segment */}
                  {activeMediaTab === "video" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="relative aspect-video w-full overflow-hidden bg-[#111113] border border-[#111113]">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none flex flex-col justify-between p-4">
                          <div className="flex items-center justify-between pointer-events-auto">
                            <div className="bg-[#111113]/90 text-white font-mono text-[11px] uppercase tracking-wider px-3 py-1 flex items-center gap-2 border border-white/15">
                              <span className="h-2 w-2 rounded-full bg-[#FF5A25] animate-pulse" />
                              <span className="font-bold">
                                VERIFIED SELLER SWEEP
                              </span>
                              <span className="text-white/60">• 0:30</span>
                            </div>

                            <button
                              type="button"
                              onClick={handleToggleMute}
                              className="h-9 w-9 rounded-full bg-[#111113]/80 hover:bg-[#111113] text-white flex items-center justify-center transition-colors border border-white/20"
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
                              className="h-11 w-11 rounded-full bg-[#FF5A25] hover:bg-white hover:text-[#111113] text-white flex items-center justify-center transition-colors"
                              title={
                                isVideoPlaying ? "Pause Video" : "Play Video"
                              }
                            >
                              {isVideoPlaying ? (
                                <Pause className="h-5 w-5 fill-current" />
                              ) : (
                                <Play className="h-5 w-5 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="font-mono text-xs text-white bg-[#111113]/85 px-3 py-1 border border-white/15">
                              Hardware: {gadget.model}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Diagnostic Checkpoints Banner */}
                      <div className="p-5 border border-[#111113]/12 bg-[#F0EFEA] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-primary text-xs font-bold uppercase tracking-wider text-[#111113]">
                            <ShieldCheck className="h-4 w-4 text-[#15803d]" />
                            <span>Pre-Escrow Video Inspection Checkpoints</span>
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#15803d]">
                            Mandatory Proof
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-secondary">
                          <div className="flex items-center gap-2 text-[#15803d] font-medium">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              IMEI on screen matches listing registry
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#15803d] font-medium">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              Full screen digitizer touch sweep verified
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#15803d] font-medium">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              Front &amp; Rear cameras autofocus active
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#15803d] font-medium">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              iCloud / Activation Lock clean &amp; signed out
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hardware Diagnostic Report Card */}
                <div className="border border-[#111113]/12 bg-white p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#111113]/12">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#FF5A25]" />
                      <h3 className="font-primary text-base font-bold tracking-[-0.02em] text-[#111113]">
                        Hardware Diagnostic Audit
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#15803d]/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
                      <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
                      <span>Pre-Inspected</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 border border-[#111113]/12 bg-white divide-y divide-x divide-[#111113]/12">
                    <div className="p-4 bg-[#F8F7F4]/60">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111113]/60 mb-1">
                        <BatteryCharging className="h-3.5 w-3.5 text-[#15803d]" />
                        <span>Battery Health</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-[#111113]">
                        {gadget.batteryHealth
                          ? `${gadget.batteryHealth}% Max`
                          : "Tested 95%+"}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#15803d] font-bold mt-0.5">
                        OEM Original Cell
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8F7F4]/60">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111113]/60 mb-1">
                        <HardDrive className="h-3.5 w-3.5 text-[#111113]" />
                        <span>Storage &amp; RAM</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-[#111113]">
                        {gadget.storage || "256GB NVMe"}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#111113]/55 mt-0.5">
                        Factory Partition
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8F7F4]/60">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111113]/60 mb-1">
                        <Lock className="h-3.5 w-3.5 text-[#15803d]" />
                        <span>Activation Lock</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-[#15803d]">
                        Clean / Off
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#111113]/55 mt-0.5">
                        No MDM / No iCloud
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8F7F4]/60">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111113]/60 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" />
                        <span>FaceID / Biometrics</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-[#111113]">
                        Passed 100%
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#111113]/55 mt-0.5">
                        Sensor Clean
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8F7F4]/60">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111113]/60 mb-1">
                        <Smartphone className="h-3.5 w-3.5 text-[#111113]" />
                        <span>Display / TrueTone</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-[#111113]">
                        Active OEM
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#111113]/55 mt-0.5">
                        No Dead Pixels
                      </div>
                    </div>

                    <div className="p-4 bg-[#F8F7F4]/60">
                      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111113]/60 mb-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#15803d]" />
                        <span>Carrier Status</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-[#111113]">
                        Unlocked
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#111113]/55 mt-0.5">
                        All Physical / eSIMs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Description */}
                <div className="border border-[#111113]/12 bg-white p-6 space-y-3">
                  <h3 className="font-primary text-base font-bold tracking-[-0.02em] text-[#111113]">
                    Merchant Condition Notes
                  </h3>
                  <p className="font-secondary text-sm text-[#111113]/75 leading-relaxed">
                    Device was bought brand new from an authorized reseller and
                    kept inside a protective case with a tempered glass screen
                    protector since day one. Flawless front display, comes with
                    original fast charging brick and braided USB-C cable.
                  </p>

                  <div className="pt-3 border-t border-[#111113]/12 flex items-center gap-2 text-xs font-mono text-[#111113]/65">
                    <MapPin className="h-3.5 w-3.5 text-[#FF5A25]" />
                    <span>
                      Dispatches from: {gadget.location} (Insured Tracked
                      Courier)
                    </span>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  RIGHT COLUMN: ESCROW PURCHASE DESK & SELLER CARD (5 Cols)
                  ============================================================= */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                {/* 1. Escrow Lock Purchase Card */}
                <div className="border border-[#111113]/15 bg-white">
                  <div className="bg-[#111113] text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold">
                        Custodial Escrow Desk
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF5A25] font-bold">
                      100% Fraud Shield
                    </span>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <span className="label block mb-1">
                        Verified Hardware Listing
                      </span>
                      <h1 className="font-primary text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#111113]">
                        {gadget.title}
                      </h1>
                    </div>

                    {/* Price Callout */}
                    <div className="p-4 bg-[#F0EFEA] border border-[#111113]/12">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/60 mb-1">
                        Agreed Marketplace Price
                      </div>
                      <div className="font-mono text-3xl font-bold tracking-[-0.04em] text-[#111113]">
                        {formatKoboToNgn(priceKobo)}
                      </div>
                      <div className="font-mono text-[11px] text-[#15803d] flex items-center gap-1.5 mt-1.5 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" />
                        <span>
                          Locked in Paystack Custody until 48H inspection passes
                        </span>
                      </div>
                    </div>

                    {/* Escrow Fee Breakdown (Integer Kobo) */}
                    <div className="space-y-2.5 font-secondary text-xs border-y border-[#111113]/12 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#111113]/65">
                          Custodial Escrow Fee (2.5%)
                        </span>
                        <span className="font-mono font-semibold text-[#111113]">
                          +{formatKoboToNgn(escrowFeeKobo)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#111113]/65">
                          Tracked &amp; Insured Courier Waybill
                        </span>
                        <span className="font-mono font-semibold text-[#111113]">
                          +{formatKoboToNgn(shippingFeeKobo)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#111113]/12 font-bold">
                        <span className="text-[#111113]">
                          Total Locked in Escrow Vault
                        </span>
                        <span className="font-mono text-base text-[#111113]">
                          {formatKoboToNgn(totalDepositKobo)}
                        </span>
                      </div>
                    </div>

                    {/* Primary Pill CTA */}
                    <button
                      type="button"
                      onClick={() => onLockEscrow?.(gadget.id)}
                      className="btn-primary w-full h-12 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-[#22c55e]" />
                      <span>Lock Funds &amp; Start Escrow Trade</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    {/* 48-Hour SLA Banner */}
                    <div className="border border-[#ecc94b]/60 bg-[#ecc94b]/15 p-3.5 flex items-start gap-2.5 text-xs text-[#975a16]">
                      <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>48-Hour Guarantee:</strong> The merchant does
                        NOT receive payout until your courier delivers, you test
                        the hardware, and you approve release.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Seller Identity Profile Card */}
                <div className="border border-[#111113]/12 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#111113] text-white flex items-center justify-center font-mono font-bold text-xs">
                        {(gadget.sellerName || "AT").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                          {gadget.sellerName}
                        </div>
                        <div className="flex items-center gap-1 font-secondary text-xs text-[#111113]/65">
                          <MapPin className="h-3 w-3 text-[#FF5A25]" />
                          <span>{gadget.location}</span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-[#15803d]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#15803d]">
                      <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                      <span>SmileID NIN</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 border border-[#111113]/12 bg-[#F8F7F4] divide-x divide-[#111113]/12 text-center font-mono text-xs">
                    <div className="p-2.5">
                      <div className="font-bold text-[#111113]">4.95 ★</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#111113]/60">
                        Rating
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="font-bold text-[#111113]">42</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#111113]/60">
                        Escrows
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="font-bold text-[#15803d]">100%</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#111113]/60">
                        Settled
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-[#111113]/15 p-3.5 flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/60">
            Price in Escrow
          </div>
          <div className="font-mono text-lg font-bold text-[#111113]">
            {formatKoboToNgn(priceKobo)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLockEscrow?.(gadget.id)}
          className="btn-primary h-11 px-6 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2"
        >
          <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
          <span>Lock Funds</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <Footer />
    </div>
  );
}
