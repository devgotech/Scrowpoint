"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Lock, MapPin, ShieldCheck, Smartphone } from "lucide-react";
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
 * - Radius: --radius-card (8px -> rounded-ui)
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

  // Condition Badge Config
  const conditionConfig = {
    mint: {
      label: "Mint Condition",
      variant: "secondary" as const,
      className: "border-ink/15 bg-white/95 text-ink",
    },
    good: {
      label: "Good Condition",
      variant: "secondary" as const,
      className: "border-ink/15 bg-white/95 text-ink/75",
    },
    fair: {
      label: "Fair / Used",
      variant: "warning" as const,
      className: "border-state-warning/50 bg-state-warning/20 text-state-warning-strong",
    },
    salvage: {
      label: "Salvage / Parts",
      variant: "secondary" as const,
      className: "border-ink/15 bg-paper text-ink/65",
    },
  }[listing.condition] || {
    label: listing.condition,
    variant: "secondary" as const,
    className: "border-ink/15 bg-white/95 text-ink/75",
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

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(listing.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden border border-ink-faint bg-surface text-ink transition-all duration-200 ease-out hover:-translate-y-1 hover:border-ink/40 rounded-card",
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
        <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-muted border-b border-ink/10">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-surface-muted text-ink/50">
              <Smartphone className="h-10 w-10 stroke-[1.5]" />
              <span className="mt-2 label">
                Photo Unavailable
              </span>
            </div>
          )}

          {/* Condition Badge (Top-Left) */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={conditionConfig.variant}
              isPill={false}
              className={cn("px-2 py-0.5 text-caption", conditionConfig.className)}
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
                "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-ink-faint bg-white/95 backdrop-blur-xs transition-colors duration-200 ease-out hover:bg-surface",
                isSaved ? "text-accent-orange" : "text-ink/60 hover:text-ink"
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
            <div className="absolute bottom-2.5 right-2.5 z-10 bg-ink/90 px-2 py-0.5 font-mono text-caption font-medium uppercase tracking-[0.1em] text-white backdrop-blur-xs">
              {listing.batteryHealth}% Battery
            </div>
          ) : null}
        </div>

        {/* ====================================================================
            2. CARD CONTENT & METADATA
            [title] → [condition · location] → [amount] → [badge slot]
            ==================================================================== */}
        <div className="flex flex-1 flex-col p-5 space-y-2.5">
          {/* Title: Space Grotesk */}
          <h3 className="font-primary text-base font-bold leading-6 tracking-[-0.03em] text-ink line-clamp-1 group-hover:text-accent-orange transition-colors">
            {listing.title}
          </h3>

          {/* Condition & Location meta row */}
          <div className="flex items-center justify-between text-xs font-secondary text-ink/65">
            <span className="truncate max-w-[150px]">
              {listing.storage ? `${listing.storage} • ` : ""}
              {listing.category || "Gadget"}
            </span>

            {listing.sellerVerified ? (
              <span className="flex items-center gap-1 font-mono text-caption font-semibold uppercase tracking-[0.1em] text-trust-strong">
                <ShieldCheck className="h-3.5 w-3.5 text-trust" />
                <span>Verified</span>
              </span>
            ) : listing.location ? (
              <span className="flex items-center gap-1 font-secondary text-meta text-ink/60 truncate max-w-[120px]">
                <MapPin className="h-3 w-3" />
                <span>{listing.location}</span>
              </span>
            ) : null}
          </div>

          {/* ====================================================================
               3. FOOTER: AMOUNT & BADGE SLOT
              ==================================================================== */}
          <div className="mt-auto pt-3.5 border-t border-ink-faint flex items-center justify-between">
            <div className="flex flex-col">
              <span className="label text-micro!">
                Escrow Price
              </span>
              <span className="font-mono text-base font-bold leading-5 text-ink mt-0.5">
                {formattedPrice}
              </span>
            </div>

            {/* Trust Badge Slot */}
            <Badge
              variant="trust"
              className="gap-1 py-0.5 px-2.5 text-caption font-mono tracking-[0.1em]"
            >
              <Lock className="h-3 w-3 text-trust" />
              <span>Escrow Active</span>
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default GadgetListingCard;
