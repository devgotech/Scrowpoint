"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GadgetVectorPatternProps {
  className?: string;
  /** Unique ID prefix so multiple instances on different pages never collide */
  idPrefix?: string;
  /** Optional mask style override depending on centered vs two-column hero layout */
  variant?: "centered" | "split";
  /** Radius in pixels of the circular hover reveal spotlight (default: 220) */
  spotlightRadius?: number;
}

/**
 * Shared SVG Gadget Tile Geometry
 * Renders the 8 flagship hardware illustrations inside a 440x440 <pattern>
 * with configurable opacity multipliers for the quiet base layer vs. the
 * illuminated cursor-spotlight layer.
 */
function renderGadgetTileContents(mode: "base" | "spotlight") {
  const isSpotlight = mode === "spotlight";

  const inkOpacity = isSpotlight ? "0.24" : "0.05";
  const inkStrongOpacity = isSpotlight ? "0.28" : "0.055";
  const dotOpacity = isSpotlight ? "0.22" : "0.04";
  const vermilionStrokeOpacity = isSpotlight ? "0.3" : "0.1";
  const vermilionFillOpacity = isSpotlight ? "0.3" : "0.1";
  const trustStrokeOpacity = isSpotlight ? "0.45" : "0.12";
  const trustFillOpacity = isSpotlight ? "0.45" : "0.12";
  const outerStrokeWidth = isSpotlight ? "2.4" : "2.2";

  return (
    <>
      {/* Subtle architectural registration micro-dots between gadgets */}
      <circle cx="110" cy="110" r="1.5" fill="#111113" fillOpacity={dotOpacity} />
      <circle cx="330" cy="110" r="1.5" fill="#111113" fillOpacity={dotOpacity} />
      <circle cx="110" cy="330" r="1.5" fill="#111113" fillOpacity={dotOpacity} />
      <circle cx="330" cy="330" r="1.5" fill="#111113" fillOpacity={dotOpacity} />

      {/* ---------------------------------------------------------------
          1. MACBOOK PRO LAPTOP (Top Center: x=220, y=68)
          Open laptop with camera notch, keyboard well, and trackpad
          --------------------------------------------------------------- */}
      <g
        transform="translate(220, 68)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Outer Display Lid */}
        <rect x="-46" y="-34" width="92" height="58" rx="6" />
        {/* Inner Screen Bezel */}
        <rect x="-40" y="-28" width="80" height="46" rx="2.5" strokeWidth="1.6" />
        {/* Camera Notch */}
        <path d="M -9 -28 L -7 -24 L 7 -24 L 9 -28" strokeWidth="1.6" />
        {/* Subtle Screen Reflection Lines */}
        <line
          x1="-24"
          y1="-12"
          x2="-12"
          y2="-20"
          stroke={isSpotlight ? "#FF5A25" : "#111113"}
          strokeOpacity={isSpotlight ? "0.3" : inkOpacity}
          strokeWidth="1.6"
        />
        <line x1="-18" y1="-6" x2="-2" y2="-17" strokeWidth="1.6" />
        {/* Unibody Base Deck */}
        <path d="M -58 24 L 58 24 L 52 33 C 50 35 46 36 42 36 L -42 36 C -46 36 -50 35 -52 33 Z" />
        {/* Thumb Opener Lip */}
        <path d="M -10 24 L -8 28 L 8 28 L 10 24" strokeWidth="1.6" />
      </g>

      {/* ---------------------------------------------------------------
          2. IPHONE 16 PRO (Mid-Left: x=76, y=178)
          Smartphone with Dynamic Island, side buttons, & screen detail
          --------------------------------------------------------------- */}
      <g
        transform="translate(76, 178) rotate(-6)"
        stroke="#111113"
        strokeOpacity={inkStrongOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Outer Titanium Frame */}
        <rect x="-28" y="-50" width="56" height="100" rx="11" />
        {/* Inner Display */}
        <rect x="-23" y="-45" width="46" height="90" rx="7" strokeWidth="1.5" />
        {/* Dynamic Island Pill */}
        <rect x="-9" y="-39" width="18" height="5" rx="2.5" strokeWidth="1.6" />
        {/* Side Action & Volume Buttons */}
        <line x1="-30" y1="-26" x2="-30" y2="-18" strokeWidth="2.2" />
        <line x1="-30" y1="-10" x2="-30" y2="2" strokeWidth="2.2" />
        <line x1="30" y1="-14" x2="30" y2="4" strokeWidth="2.2" />
        {/* Center Verified Shield / Diagnostic Circle on Screen */}
        <circle cx="0" cy="2" r="11" strokeWidth="1.6" />
        <path
          d="M -4 2 L -1 5 L 5 -2"
          stroke="#15803d"
          strokeOpacity={trustStrokeOpacity}
          strokeWidth="2.2"
        />
        {/* Bottom Home Bar */}
        <line x1="-10" y1="39" x2="10" y2="39" strokeWidth="1.8" />
      </g>

      {/* ---------------------------------------------------------------
          3. GAME CONSOLE CONTROLLER (Center: x=224, y=206)
          PlayStation / Pro Wireless Gamepad with D-pad, thumbsticks & buttons
          --------------------------------------------------------------- */}
      <g
        transform="translate(224, 206)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Controller Body Silhouette */}
        <path d="M -26 -24 L 26 -24 C 42 -24 52 -10 55 12 C 57 26 52 38 42 40 C 33 42 27 32 21 20 L -21 20 C -27 32 -33 42 -42 40 C -52 38 -57 26 -55 12 C -52 -10 -42 -24 -26 -24 Z" />
        {/* Center Touchpad */}
        <path d="M -14 -24 L -12 -8 C -12 -6 -10 -5 -8 -5 L 8 -5 C 10 -5 12 -6 12 -8 L 14 -24" strokeWidth="1.6" />
        {/* Left D-Pad */}
        <path d="M -32 -12 L -32 0 M -38 -6 L -26 -6" strokeWidth="2.2" />
        {/* Right Action Buttons */}
        <circle cx="32" cy="-12" r="2.2" strokeWidth="1.6" />
        <circle cx="32" cy="0" r="2.2" strokeWidth="1.6" />
        <circle cx="26" cy="-6" r="2.2" strokeWidth="1.6" />
        <circle
          cx="38"
          cy="-6"
          r="2.2"
          stroke="#FF5A25"
          strokeOpacity={vermilionStrokeOpacity}
          strokeWidth="2"
        />
        {/* Dual Analog Thumbsticks */}
        <circle cx="-15" cy="8" r="6.5" strokeWidth="1.8" />
        <circle cx="15" cy="8" r="6.5" strokeWidth="1.8" />
        {/* Shoulder Bumpers */}
        <path d="M -38 -22 C -34 -28 -24 -29 -18 -24" strokeWidth="1.6" />
        <path d="M 18 -24 C 24 -29 34 -28 38 -22" strokeWidth="1.6" />
      </g>

      {/* ---------------------------------------------------------------
          4. IPAD PRO + APPLE PENCIL (Mid-Right: x=368, y=174)
          Tablet with thin bezel, split-view UI lines, & magnetic stylus
          --------------------------------------------------------------- */}
      <g
        transform="translate(368, 174) rotate(5)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* iPad Chassis */}
        <rect x="-38" y="-48" width="72" height="94" rx="8" />
        {/* Inner Liquid Retina Screen */}
        <rect x="-32" y="-42" width="60" height="82" rx="4" strokeWidth="1.5" />
        {/* Top Front Camera Dot */}
        <circle
          cx="-2"
          cy="-45"
          r="1.2"
          fill="#111113"
          fillOpacity={isSpotlight ? "0.3" : "0.08"}
        />
        {/* Screen Widget / Note Sketch Detail */}
        <rect x="-24" y="-32" width="20" height="24" rx="2.5" strokeWidth="1.5" />
        <line x1="2" y1="-28" x2="20" y2="-28" strokeWidth="1.6" />
        <line x1="2" y1="-20" x2="16" y2="-20" strokeWidth="1.6" />
        <path
          d="M -24 8 C -14 0 -4 14 8 2 C 14 -4 18 6 20 4"
          stroke={isSpotlight ? "#FF5A25" : "#111113"}
          strokeOpacity={isSpotlight ? "0.3" : inkOpacity}
          strokeWidth="1.6"
        />
        {/* Apple Pencil Floating Alongside Right Edge */}
        <path d="M 42 -36 L 42 28 L 44.5 36 L 47 28 L 47 -36 C 47 -38 42 -38 42 -36 Z" strokeWidth="1.6" />
        <line x1="42" y1="-28" x2="47" y2="-28" strokeWidth="1.5" />
      </g>

      {/* ---------------------------------------------------------------
          5. STUDIO OVER-EAR HEADPHONES (Bottom-Left: x=96, y=346)
          AirPods Max / Studio Headphone silhouette with anodized cups
          --------------------------------------------------------------- */}
      <g
        transform="translate(96, 346) rotate(-4)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Headband Arch */}
        <path d="M -34 4 L -34 -8 C -34 -28 -19 -42 0 -42 C 19 -42 34 -28 34 -8 L 34 4" />
        {/* Inner Mesh Canopy Band */}
        <path d="M -26 -10 C -22 -26 -12 -34 0 -34 C 12 -34 22 -26 26 -10" strokeWidth="1.5" />
        {/* Left & Right Ear Cups */}
        <rect x="-42" y="2" width="16" height="32" rx="8" />
        <rect x="26" y="2" width="16" height="32" rx="8" />
        {/* Inner Ear Cushions */}
        <line x1="-26" y1="8" x2="-26" y2="28" strokeWidth="1.8" />
        <line x1="26" y1="8" x2="26" y2="28" strokeWidth="1.8" />
      </g>

      {/* ---------------------------------------------------------------
          6. PRO MIRRORLESS CAMERA (Bottom-Center-Right: x=254, y=352)
          Rangefinder / Mirrorless body with prime lens rings & hot-shoe
          --------------------------------------------------------------- */}
      <g
        transform="translate(254, 352) rotate(3)"
        stroke="#111113"
        strokeOpacity={inkStrongOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Camera Body */}
        <rect x="-44" y="-22" width="88" height="58" rx="8" />
        {/* Top EVF Viewfinder Hump */}
        <path d="M -18 -22 L -13 -32 L 13 -32 L 18 -22" />
        {/* Shutter Button & Dial */}
        <rect x="22" y="-27" width="12" height="5" rx="1.5" strokeWidth="1.6" />
        {/* Hand Grip Line */}
        <line x1="-28" y1="-22" x2="-28" y2="36" strokeWidth="1.6" />
        {/* Outer & Inner Prime Lens Barrel */}
        <circle cx="4" cy="7" r="21" />
        <circle cx="4" cy="7" r="13" strokeWidth="1.6" />
        {/* Lens Reflex Glint */}
        <path d="M -2 0 A 8 8 0 0 1 8 -1" strokeWidth="1.6" />
        {/* AF Assist Lamp Dot (Vermilion Accent) */}
        <circle
          cx="-18"
          cy="-10"
          r="2.5"
          fill="#FF5A25"
          fillOpacity={vermilionFillOpacity}
          stroke="none"
        />
      </g>

      {/* ---------------------------------------------------------------
          7. SMARTWATCH ULTRA (Top-Left / Edge Wrap: x=0 & x=440, y=64)
          Wrapped across left/right tile seam just like the reference image!
          --------------------------------------------------------------- */}
      <g
        transform="translate(0, 64)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M -12 -38 L -9 -24 L 9 -24 L 12 -38 Z" strokeWidth="1.8" />
        <path d="M -12 38 L -9 24 L 9 24 L 12 38 Z" strokeWidth="1.8" />
        <rect x="-20" y="-24" width="40" height="48" rx="10" />
        <rect x="-15" y="-19" width="30" height="38" rx="6" strokeWidth="1.5" />
        <rect x="20" y="-10" width="3.5" height="10" rx="1.5" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="8" strokeWidth="1.6" />
      </g>
      <g
        transform="translate(440, 64)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M -12 -38 L -9 -24 L 9 -24 L 12 -38 Z" strokeWidth="1.8" />
        <path d="M -12 38 L -9 24 L 9 24 L 12 38 Z" strokeWidth="1.8" />
        <rect x="-20" y="-24" width="40" height="48" rx="10" />
        <rect x="-15" y="-19" width="30" height="38" rx="6" strokeWidth="1.5" />
        <rect x="20" y="-10" width="3.5" height="10" rx="1.5" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="8" strokeWidth="1.6" />
      </g>

      {/* ---------------------------------------------------------------
          8. WIRELESS EARBUDS CASE (Bottom-Right / Seam Balance: x=388, y=354)
          AirPods Pro charging case with hinge line & status LED
          --------------------------------------------------------------- */}
      <g
        transform="translate(388, 354) rotate(-5)"
        stroke="#111113"
        strokeOpacity={inkOpacity}
        strokeWidth={outerStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Rounded Charging Case */}
        <rect x="-26" y="-22" width="52" height="44" rx="16" />
        {/* Lid Split Line */}
        <line x1="-26" y1="-4" x2="26" y2="-4" strokeWidth="1.6" />
        {/* Center Hinge Pill */}
        <rect x="-7" y="-6.5" width="14" height="5" rx="2.5" strokeWidth="1.5" />
        {/* Status LED Dot */}
        <circle
          cx="0"
          cy="9"
          r="2.2"
          fill="#22c55e"
          fillOpacity={trustFillOpacity}
          stroke="none"
        />
      </g>
    </>
  );
}

/**
 * GadgetVectorPattern
 *
 * Dual-layer seamless repeating monoline vector illustration pattern of flagship
 * hardware (iPhones, MacBooks, Game Console Controllers, iPads + Stylus, Mirrorless
 * Cameras, Studio Headphones, Smartwatches, and Wireless Earbuds):
 * - Layer 1 (Base): Whisper-quiet 5% opacity across the hero canvas so foreground
 *   text stays 100% legible.
 * - Layer 2 (Interactive Circular Spotlight): Tracks the user's cursor across the
 *   parent hero section and smoothly increases vector opacity & Vermilion/Trust Green
 *   accents exclusively within a circular region around the pointer.
 */
export function GadgetVectorPattern({
  className,
  idPrefix = "sp-gadget-pattern",
  variant = "centered",
  spotlightRadius = 220,
}: GadgetVectorPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightLayerRef = useRef<HTMLDivElement>(null);
  const auraLayerRef = useRef<HTMLDivElement>(null);

  const basePatternId = `${idPrefix}-base-tile`;
  const spotlightPatternId = `${idPrefix}-spotlight-tile`;
  const glowId = `${idPrefix}-glow`;

  useEffect(() => {
    const container = containerRef.current;
    const spotlightEl = spotlightLayerRef.current;
    const auraEl = auraLayerRef.current;
    if (!container || !spotlightEl) return;

    // Attach pointer listeners to the parent <section> so moving over text,
    // buttons, or cards inside the hero smoothly drives the spotlight without
    // interfering with clicks or text selection.
    const parentSection = container.parentElement ?? container;

    let rafId: number | null = null;
    let targetX = -999;
    let targetY = -999;
    let currentX = -999;
    let currentY = -999;
    let isInside = false;

    const updateSpotlightMask = (x: number, y: number) => {
      const maskValue = `radial-gradient(${spotlightRadius}px circle at ${x.toFixed(
        1
      )}px ${y.toFixed(
        1
      )}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 42%, rgba(0,0,0,0.2) 72%, transparent 100%)`;
      spotlightEl.style.maskImage = maskValue;
      spotlightEl.style.webkitMaskImage = maskValue;

      if (auraEl) {
        auraEl.style.background = `radial-gradient(${spotlightRadius}px circle at ${x.toFixed(
          1
        )}px ${y.toFixed(
          1
        )}px, rgba(255, 90, 37, 0.025) 0%, rgba(255, 90, 37, 0.008) 55%, transparent 100%)`;
      }
    };

    const tick = () => {
      // Smooth spring-like interpolation toward the cursor
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
      updateSpotlightMask(currentX, currentY);

      if (
        isInside &&
        (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4)
      ) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Snap immediately on first entry so the spotlight doesn't fly in from (-999, -999)
      if (!isInside) {
        currentX = x;
        currentY = y;
        isInside = true;
        spotlightEl.style.opacity = "1";
        if (auraEl) auraEl.style.opacity = "1";
      }

      targetX = x;
      targetY = y;

      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerLeave = () => {
      isInside = false;
      spotlightEl.style.opacity = "0";
      if (auraEl) auraEl.style.opacity = "0";
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    parentSection.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    parentSection.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });

    return () => {
      parentSection.removeEventListener("pointermove", handlePointerMove);
      parentSection.removeEventListener("pointerleave", handlePointerLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [spotlightRadius]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden select-none",
        variant === "centered"
          ? "[mask-image:radial-gradient(ellipse_95%_88%_at_50%_42%,black_55%,transparent_100%)]"
          : "[mask-image:radial-gradient(ellipse_95%_90%_at_45%_45%,black_60%,transparent_100%)]",
        className
      )}
    >
      {/* =====================================================================
          LAYER 1: QUIET BASE VECTOR PATTERN (5% OPACITY)
          ===================================================================== */}
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="35%" r="48%">
            <stop offset="0%" stopColor="#FF5A25" stopOpacity="0.03" />
            <stop offset="60%" stopColor="#FF5A25" stopOpacity="0.008" />
            <stop offset="100%" stopColor="#FF5A25" stopOpacity="0" />
          </radialGradient>

          <pattern
            id={basePatternId}
            width="440"
            height="440"
            patternUnits="userSpaceOnUse"
          >
            {renderGadgetTileContents("base")}
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#${basePatternId})`} />
        <rect width="100%" height="100%" fill={`url(#${glowId})`} />
      </svg>

      {/* =====================================================================
          LAYER 2: CIRCULAR CURSOR AURA & HIGH-OPACITY SPOTLIGHT REVEAL
          Only visible inside the circular region around the user's pointer
          ===================================================================== */}
      <div
        ref={auraLayerRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out"
      />

      <div
        ref={spotlightLayerRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out"
      >
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id={spotlightPatternId}
              width="440"
              height="440"
              patternUnits="userSpaceOnUse"
            >
              {renderGadgetTileContents("spotlight")}
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill={`url(#${spotlightPatternId})`} />
        </svg>
      </div>
    </div>
  );
}

export default GadgetVectorPattern;
