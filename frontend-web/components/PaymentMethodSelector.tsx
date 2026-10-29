"use client";

import React, { useState } from "react";
import {
  Banknote,
  Bitcoin,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * PaymentMethodSelector Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 2 Tier 3, Spec 4 §6):
 * - Grid of selectable UI cards for:
 *   1. Card (Debit/Credit Card via Paystack - Visa, Mastercard, Verve)
 *   2. Bank (Direct Bank Transfer via Dedicated Virtual Account)
 *   3. Crypto (USDT / USDC Escrow Stablecoin settlement)
 *   4. Wallet (Scrowpoint In-App Balance & Payout Vault)
 * - Corner Radius: --radius-card (8px -> rounded-[8px]) for cards, --radius-control (4px -> rounded-[4px]) for inner elements.
 * - Highlights the active selected method with a primary border (`border-[#0f172a] ring-2 ring-[#0f172a]/20 bg-[#0f172a]/5`).
 * - Displays escrow security badges (Trust Green #22c55e with --color-trust-strong #15803d text contrast).
 * - Transitions: strict duration-200 ease-out (NEVER bouncy).
 * - Typography: font-primary for headings, font-secondary for body, font-mono for metrics and badges.
 */

export type PaymentMethodId = "card" | "bank" | "crypto" | "wallet";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  speedBadge: string;
  feeBadge: string;
  trustBadge?: string;
  isRecommended?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card",
    name: "Debit / Credit Card",
    subtitle: "Paystack Vault",
    description: "Instant card reservation with 3D-Secure biometric authorization (Visa, Mastercard, Verve).",
    icon: CreditCard,
    speedBadge: "Instant",
    feeBadge: "1.5% Cap",
    trustBadge: "3DS Protected",
    isRecommended: true,
  },
  {
    id: "bank",
    name: "Direct Bank Transfer",
    subtitle: "Virtual Account",
    description: "Dynamic NIP virtual account generated specifically for this order reference. Auto-reconciled.",
    icon: Building2,
    speedBadge: "< 60 seconds",
    feeBadge: "₦100 Flat",
    trustBadge: "Central Bank Regulated",
  },
  {
    id: "crypto",
    name: "Crypto Stablecoin",
    subtitle: "USDT / USDC",
    description: "Multi-chain institutional escrow lock (Polygon, Tron, Ethereum). Eliminates FX volatility.",
    icon: Bitcoin,
    speedBadge: "1 Network Block",
    feeBadge: "Zero FX Markup",
    trustBadge: "Smart Contract Escrow",
  },
  {
    id: "wallet",
    name: "Scrowpoint Wallet",
    subtitle: "Platform Balance",
    description: "One-click settlement using proceeds from previous sales or refunded escrow deposits.",
    icon: Wallet,
    speedBadge: "Zero Latency",
    feeBadge: "0.0% Fee",
    trustBadge: "Instant Hold",
  },
];

export interface PaymentMethodSelectorProps {
  selectedMethodId?: PaymentMethodId;
  onSelectMethod?: (methodId: PaymentMethodId) => void;
  className?: string;
  showDetailsForm?: boolean;
}

export function PaymentMethodSelector({
  selectedMethodId = "card",
  onSelectMethod,
  className,
  showDetailsForm = true,
}: PaymentMethodSelectorProps) {
  const [activeMethod, setActiveMethod] = useState<PaymentMethodId>(selectedMethodId);

  const handleSelect = (id: PaymentMethodId) => {
    setActiveMethod(id);
    onSelectMethod?.(id);
  };

  const currentConfig = PAYMENT_METHODS.find((m) => m.id === activeMethod);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-primary text-sm font-bold tracking-[-0.03em] text-[#111113]">
            Select Escrow Funding Method
          </h3>
          <p className="font-secondary text-xs text-[#111113]/65 mt-0.5">
            Funds remain locked in custodial vault until you inspect the device.
          </p>
        </div>

        {/* Trust badge with rounded-full radius */}
        <Badge
          variant="trust"
          className="hidden sm:inline-flex gap-1 py-0 px-2 text-[11px] font-mono tracking-wider font-semibold"
        >
          <Lock className="h-3 w-3 text-[#22c55e]" />
          <span>Paystack Custody Vault</span>
        </Badge>
      </div>

      {/* ====================================================================
          1. 4-CARD SELECTABLE GRID
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = activeMethod === method.id;
          const Icon = method.icon;

          return (
            <div
              key={method.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(method.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(method.id);
                }
              }}
              className={cn(
                "group relative flex flex-col justify-between p-4 border transition-all duration-200 ease-out cursor-pointer select-none",
                isSelected
                  ? "border-[#111113] bg-[#F8F7F4] ring-1 ring-[#111113]"
                  : "border-[#111113]/12 bg-white hover:border-[#111113]/40 hover:bg-[#F8F7F4]/60"
              )}
            >
              {/* Top Row: Icon + Recommendation / Selection Radio */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-200 ease-out",
                    isSelected
                      ? "bg-[#111113] text-white"
                      : "bg-[#F0EFEA] text-[#111113]/65 group-hover:text-[#111113]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  {method.isRecommended && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#15803d] bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5">
                      <Sparkles className="h-3 w-3 text-[#22c55e]" />
                      Popular
                    </span>
                  )}

                  {/* Radio Indicator */}
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-200 ease-out",
                      isSelected
                        ? "border-[#111113] bg-[#111113] text-white"
                        : "border-[#111113]/25 bg-white"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>

              {/* Middle: Method Identity */}
              <div className="mt-3 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-primary text-sm font-bold tracking-[-0.03em] text-[#111113]">
                    {method.name}
                  </h4>
                  <span className="label text-[9.5px]!">
                    {method.subtitle}
                  </span>
                </div>
                <p className="font-secondary text-xs text-[#111113]/65 leading-relaxed line-clamp-2">
                  {method.description}
                </p>
              </div>

              {/* Bottom: Speed & Fee Badges */}
              <div className="mt-4 pt-3 border-t border-[#111113]/12 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#111113]/65 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#FF5A25]" />
                  {method.speedBadge}
                </span>

                <span
                  className={cn(
                    "font-medium",
                    isSelected ? "text-[#111113] font-bold" : "text-[#111113]/65"
                  )}
                >
                  {method.feeBadge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          2. CONDITIONAL CONTEXTUAL FORM / INSTRUCTIONS CONTAINER
          ==================================================================== */}
      {showDetailsForm && currentConfig && (
        <div className="mt-4 border border-[#111113]/12 bg-[#F8F7F4] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-primary text-xs font-bold tracking-[-0.02em] text-[#111113] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <span>Selected Channel: {currentConfig.name}</span>
            </span>
            <span className="label">
              {currentConfig.trustBadge}
            </span>
          </div>

          {activeMethod === "card" && (
            <p className="font-secondary text-xs text-[#111113]/70 leading-relaxed">
              Clicking <strong className="text-[#111113]">"Proceed to Paystack"</strong> will invoke
              a secure popup iframe to tokenize your card and place the escrow reservation hold. No card PIN or CVV is ever stored on Scrowpoint servers.
            </p>
          )}

          {activeMethod === "bank" && (
            <p className="font-secondary text-xs text-[#111113]/70 leading-relaxed">
              A unique Wema / Sterling virtual bank account number will be generated for your order. Funds transferred will be credited to escrow automatically within 60 seconds.
            </p>
          )}

          {activeMethod === "crypto" && (
            <p className="font-secondary text-xs text-[#111113]/70 leading-relaxed">
              Deposit address for USDT (TRC-20 / ERC-20) will be provided with an exact conversion rate locked for 30 minutes. Once confirmed by 12 network blocks, escrow is marked funded.
            </p>
          )}

          {activeMethod === "wallet" && (
            <p className="font-secondary text-xs text-[#111113]/70 leading-relaxed">
              Instant deduction from your available Scrowpoint balance with zero gateway surcharge. Instant transition to <span className="font-mono font-semibold text-[#15803d]">funds_held</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
