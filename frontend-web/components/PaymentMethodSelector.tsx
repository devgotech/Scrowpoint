"use client";

import React, { useState } from "react";
import {
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
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Select Escrow Funding Method
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Funds remain locked in custodial vault until you inspect the device.
          </p>
        </div>

        <Badge
          variant="secondary"
          className="hidden sm:inline-flex gap-1 py-0 px-2 text-[11px] font-semibold"
        >
          <Lock className="h-3 w-3" />
          <span>Paystack Custody Vault</span>
        </Badge>
      </div>

      {/* 4-Card Selectable Grid */}
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
                "group relative flex flex-col justify-between p-4 rounded-lg border transition-colors duration-200 ease-out cursor-pointer select-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  {method.isRecommended && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border rounded-md px-2 py-0.5">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </span>
                  )}

                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 bg-background"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-heading text-sm font-semibold text-foreground">
                    {method.name}
                  </h4>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    {method.subtitle}
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {method.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  {method.speedBadge}
                </span>

                <span
                  className={cn(
                    "font-semibold",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {method.feeBadge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contextual Instructions Container */}
      {showDetailsForm && currentConfig && (
        <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Selected Channel: {currentConfig.name}</span>
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {currentConfig.trustBadge}
            </span>
          </div>

          {activeMethod === "card" && (
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Clicking <strong className="text-foreground">&quot;Proceed to Paystack&quot;</strong> will invoke
              a secure popup iframe to tokenize your card and place the escrow reservation hold. No card PIN or CVV is ever stored on Scrowpoint servers.
            </p>
          )}

          {activeMethod === "bank" && (
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              A unique Wema / Sterling virtual bank account number will be generated for your order. Funds transferred will be credited to escrow automatically within 60 seconds.
            </p>
          )}

          {activeMethod === "crypto" && (
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Deposit address for USDT (TRC-20 / ERC-20) will be provided with an exact conversion rate locked for 30 minutes. Once confirmed by 12 network blocks, escrow is marked funded.
            </p>
          )}

          {activeMethod === "wallet" && (
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Instant deduction from your available Scrowpoint balance with zero gateway surcharge. Instant transition to <span className="font-mono font-semibold text-trust-strong">funds_held</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelector;