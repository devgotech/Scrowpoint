"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Heart,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * GadgetListingCard Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md, §5.2 Listing Card):
 * - Anatomy: [media] → [title] → [condition · location] → [amount] → [badge slot]
 * - Title: headline-md (Roboto, Medium, 16px / line-height 24px)
 * - Price: mono-data (Geist Mono, Medium, 14px / line-height 20px)
 * - Radius: --radius-card (8px -> rounded-[8px])
 * - Hover State: Apply --shadow-soft-md and snappy -translate-y-1 transform.
 *   DO NOT alter the background color on hover.
 * - Trust Signals: Trust Green (#22c55e) strictly reserved for escrow signals: Escrow Active, Verified.
 * - Text on white: Uses --color-trust-strong (#15803d) for high-contrast accessibility.
 * - Motion: duration-200 ease-out.
 */

export type DeviceCondition = "mint" | "good" | "fair" | "salvage";

export interface GadgetListingData {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  category?: string;
  /** Amount in base kobo (e.g. 15000000 = ₦150,000) or standard major Naira if kobo flag is set */
  price: number;
  /** True if price is in base kobo/cents. Defaults to true per Spec 5 §6 */
  isPriceInKobo?: boolean;
  currency?: string;
  condition: DeviceCondition;
  images: string[];
  location?: string;
  batteryHealth?: number | null;
  storage?: string;
  sellerName?: string;
  sellerVerified?: boolean;
  videoUrl?: string;
  isSaved?: boolean;
}

export interface GadgetListingCardProps {
  listing: GadgetListingData;
  className?: string;
  onSaveToggle?: (id: string, isSaved: boolean) => void;
  showSaveButton?: boolean;
  onSelect?: (id: string) => void;
  href?: string;
}

export function GadgetListingCard({
  listing,
  className,
  onSaveToggle,
  showSaveButton = true,
  onSelect,
  href,
}: GadgetListingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(listing.isSaved));

  // Condition Badge Config (Non-trust badges do NOT use pill radius)
  const conditionConfig = {
    mint: {
      label: "Mint Condition",
      variant: "secondary" as const,
      className: "border-[#e2e8f0] bg-[#f1f5f9] text-[#0f172a]",
    },
    good: {
      label: "Good Condition",
      variant: "secondary" as const,
      className: "border-[#e2e8f0] bg-[#f1f5f9] text-[#64748b]",
    },
    fair: {
      label: "Fair / Used",
      variant: "warning" as const,
      className: "border-[#ecc94b]/50 bg-[#ecc94b]/20 text-[#975a16]",
    },
    salvage: {
      label: "Salvage / Parts",
      variant: "secondary" as const,
      className: "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
    },
  }[listing.condition] || {
    label: listing.condition,
    variant: "secondary" as const,
    className: "border-[#e2e8f0] bg-[#f1f5f9] text-[#64748b]",
  };

  const priceInKobo = listing.isPriceInKobo ?? true ? listing.price : listing.price * 100;
  const formattedPrice = formatCurrency(priceInKobo);

  const primaryImage =
    !imageError && listing.images && listing.images.length > 0
      ? listing.images[0]
      : null;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onSaveToggle) {
      onSaveToggle(listing.id, nextSaved);
    }
  };

  const targetHref = href || `/gadget/${listing.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) {
      onSelect(listing.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white text-[#020617] shadow-[0_2px_4px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_4px_8px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <Link
        href={targetHref}
        onClick={handleCardClick}
        className="flex flex-1 flex-col"
      >
        {/* ====================================================================
            1. 4:3 ASPECT RATIO IMAGE CONTAINER
            ==================================================================== */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-[#f1f5f9]">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#f1f5f9] text-[#64748b]">
              <Smartphone className="h-10 w-10 stroke-[1.5]" />
              <span className="mt-2 font-mono text-[11px] uppercase tracking-wider">
                Photo Unavailable
              </span>
            </div>
          )}

          {/* Condition Badge (Top-Left) */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={conditionConfig.variant}
              isPill={false}
              className={cn("px-2 py-0.5 text-[10px]", conditionConfig.className)}
            >
              <span>{conditionConfig.label}</span>
            </Badge>
          </div>

          {/* Save Action Button (Top-Right) */}
          {showSaveButton && (
            <button
              type="button"
              onClick={handleHeartClick}
              aria-label={isSaved ? "Remove from wishlist" : "Save gadget"}
              className={cn(
                "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-[4px] bg-white/90 backdrop-blur-xs shadow-xs transition-colors duration-200 ease-out hover:bg-white",
                isSaved ? "text-[#f56565]" : "text-[#64748b] hover:text-[#020617]"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform active:scale-110",
                  isSaved && "fill-current"
                )}
              />
            </button>
          )}

          {/* Battery Health Pill (Bottom-Right overlay) */}
          {listing.batteryHealth ? (
            <div className="absolute bottom-2.5 right-2.5 z-10 rounded-[4px] bg-[#0f172a]/90 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
              {listing.batteryHealth}% Battery
            </div>
          ) : null}
        </div>

        {/* ====================================================================
            2. CARD CONTENT & METADATA
            [title] → [condition · location] → [amount] → [badge slot]
            ==================================================================== */}
        <div className="flex flex-1 flex-col p-4 space-y-2">
          {/* Title: headline-md (Roboto Medium 16px / 24px) */}
          <h3 className="font-primary text-base font-medium leading-6 tracking-normal text-[#020617] line-clamp-1 group-hover:text-[#0f172a]">
            {listing.title}
          </h3>

          {/* Condition & Location meta row */}
          <div className="flex items-center justify-between text-xs font-secondary text-[#64748b]">
            <span className="truncate max-w-[150px]">
              {listing.storage ? `${listing.storage} • ` : ""}
              {listing.category || "Gadget"}
            </span>

            {listing.sellerVerified ? (
              <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-[#15803d]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>Verified</span>
              </span>
            ) : listing.location ? (
              <span className="flex items-center gap-1 font-secondary text-[11px] text-[#64748b] truncate max-w-[120px]">
                <MapPin className="h-3 w-3" />
                <span>{listing.location}</span>
              </span>
            ) : null}
          </div>

          {/* ====================================================================
              3. FOOTER: AMOUNT & BADGE SLOT
              Price: mono-data (Geist Mono, Medium, 14px)
              Badge: Trust Green reserved for Escrow Signals
              ==================================================================== */}
          <div className="mt-auto pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                Escrow Price
              </span>
              <span className="font-mono text-sm font-medium leading-5 text-[#020617]">
                {formattedPrice}
              </span>
            </div>

            {/* Trust Badge Slot (Uses --radius-badge rounded-full and --color-trust-strong text on white) */}
            <Badge
              variant="trust"
              className="gap-1 py-0.5 px-2 text-[10px] font-mono tracking-wider"
            >
              <Lock className="h-3 w-3 text-[#22c55e]" />
              <span>Escrow Active</span>
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default GadgetListingCard;
