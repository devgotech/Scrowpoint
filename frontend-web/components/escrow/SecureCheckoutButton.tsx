"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SecureCheckoutButton Component (Phase 2 §2 - Escrow Payment & Checkout)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Primary authorization button initiating Paystack/Flutterwave escrow session.
 * - Displays exact amount to lock, padlock icon, and trust guarantee.
 * - Loading and processing state simulation.
 * - Token Compliance: 4px control radius, 200ms ease-out transitions, brand primary fill.
 */

export interface SecureCheckoutButtonProps {
  amount: number;
  currency?: string;
  isProcessing?: boolean;
  disabled?: boolean;
  onPay?: () => void;
  className?: string;
}

export function SecureCheckoutButton({
  amount,
  currency = "NGN",
  isProcessing = false,
  disabled = false,
  onPay,
  className,
}: SecureCheckoutButtonProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant="default"
        size="lg"
        disabled={disabled || isProcessing}
        onClick={onPay}
        className="w-full h-12 px-6 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white font-primary font-bold text-sm flex items-center justify-between gap-3 transition-all duration-200 ease-out"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e] text-[#111113]">
            <Lock className="h-3.5 w-3.5 fill-current" />
          </div>
          <span>{isProcessing ? "Connecting to Paystack Vault..." : "Lock in Escrow"}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span>{formatNaira(amount)}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#15803d]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
        <span>Funds protected in segregated vault until 48H inspection passes</span>
      </div>
    </div>
  );
}

export default SecureCheckoutButton;
