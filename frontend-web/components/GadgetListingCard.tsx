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

export type DeviceCondition = "mint" | "good" | "fair" | "salvage";

export interface GadgetListingData {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  category?: string;
  price: number;
  isPriceInKobo?: boolean;
  currency?: string;
  condition: DeviceCondition;
  images: string[];
  location?: string;
  batteryHealth?: number | null;
  storage?: string;
  sellerName?: string;
  sellerVerified?: boolean;
  isSaved?: boolean;
}

export interface GadgetListingCardProps {
  listing: GadgetListingData;
  className?: string;
  onSaveToggle?: (id: string, isSaved: boolean) => void;
  showSaveButton?: boolean;
}

export function GadgetListingCard({
  listing,
  className,
  onSaveToggle,
  showSaveButton = true,
}: GadgetListingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(listing.isSaved));

  const conditionConfig = {
    mint: {
      label: "Mint Condition",
      variant: "trust" as const,
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    good: {
      label: "Good Condition",
      variant: "secondary" as const,
      className: "bg-secondary text-secondary-foreground border-border",
    },
    fair: {
      label: "Fair / Used",
      variant: "warning" as const,
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    salvage: {
      label: "Salvage / Parts",
      variant: "outline" as const,
      className: "bg-muted/70 text-muted-foreground border-border",
    },
  }[listing.condition] || {
    label: listing.condition,
    variant: "secondary" as const,
    className: "bg-secondary text-secondary-foreground border-border",
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

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-200 hover:shadow-md hover:border-border/80",
        className
      )}
    >
      <Link href={`/marketplace/${listing.id}`} className="flex flex-1 flex-col">
        {/* 4:3 Aspect Ratio Image */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/60 text-muted-foreground">
              <Smartphone className="h-12 w-12 stroke-[1.5]" />
              <span className="mt-2 text-xs font-mono uppercase tracking-wider">
                Photo Unavailable
              </span>
            </div>
          )}

          {/* Condition Badge (Top-Left) */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={conditionConfig.variant}
              className={cn("gap-1 py-0.5 px-2.5 text-xs font-semibold shadow-xs backdrop-blur-xs", conditionConfig.className)}
            >
              <span>{conditionConfig.label}</span>
            </Badge>
          </div>

          {/* Save Action */}
          {showSaveButton && (
            <button
              type="button"
              onClick={handleHeartClick}
              aria-label={isSaved ? "Remove from wishlist" : "Save gadget"}
              className={cn(
                "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-xs transition-colors hover:bg-background",
                isSaved ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-transform active:scale-125",
                  isSaved && "fill-current"
                )}
              />
            </button>
          )}

          {listing.batteryHealth ? (
            <div className="absolute bottom-2.5 right-2.5 z-10 rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-mono font-medium text-white backdrop-blur-xs">
              {listing.batteryHealth}% Battery
            </div>
          ) : null}
        </div>

        {/* Card Content & Metadata */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium truncate max-w-[140px]">
              {listing.category || listing.brand || "Secondhand Gadget"}
            </span>

            {listing.sellerVerified ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 fill-current/20" />
                <span>Verified Seller</span>
              </span>
            ) : listing.location ? (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[120px]">
                <MapPin className="h-3 w-3" />
                <span>{listing.location}</span>
              </span>
            ) : null}
          </div>

          <h3 className="mt-2 font-heading text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {listing.storage && (
            <p className="mt-0.5 text-xs font-mono text-muted-foreground">
              {listing.storage} {listing.model ? `• ${listing.model}` : ""}
            </p>
          )}

          {/* Price & Escrow Protection Footer */}
          <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Escrow Price
              </span>
              <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                {formattedPrice}
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3 w-3" />
              <span>Escrow Protected</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default GadgetListingCard;