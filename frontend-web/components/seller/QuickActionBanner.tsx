"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Plus, ShieldCheck, Smartphone, Sparkles, UploadCloud, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * QuickActionBanner Component (Phase 3 §1 - Seller Dashboard)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Call-to-action banner enabling sellers to create new gadget listings, manage payout bank accounts, and view escrow rules.
 * - Token Compliance: 8px container radius, 4px buttons, Roboto headings.
 */

export interface QuickActionBannerProps {
  onNewListing?: () => void;
  onOpenWallet?: () => void;
  className?: string;
}

export function QuickActionBanner({
  onNewListing,
  onOpenWallet,
  className,
}: QuickActionBannerProps) {
  return (
    <div
      className={cn(
        "border border-[#111113] bg-[#111113] text-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden",
        className
      )}
    >
      <div className="space-y-1.5 z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] font-bold text-[#FF5A25]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ZERO CHARGEBACK PLATFORM</span>
        </div>
        <h3 className="font-primary text-xl font-bold tracking-[-0.04em] text-white">
          List Another Verified Gadget in Seconds
        </h3>
        <p className="font-secondary text-xs sm:text-sm text-white/75 leading-relaxed">
          Upload device photos, IMEI check, and set your 48-hour escrow terms. 100% payout guarantee on every confirmed trade.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onNewListing}
          className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#FF5A25] hover:bg-[#FF5A25]/90 text-white font-primary font-bold text-xs gap-2 transition-colors"
        >
          <Plus className="h-4 w-4 text-white" />
          <span>Post New Gadget</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onOpenWallet}
          className="w-full sm:w-auto h-11 px-6 rounded-full border-white/25 bg-white/5 hover:bg-white/15 text-white font-primary font-semibold text-xs gap-2 transition-colors"
        >
          <Wallet className="h-4 w-4 text-white/80" />
          <span>Wallet & Payouts</span>
        </Button>
      </div>
    </div>
  );
}

export default QuickActionBanner;
