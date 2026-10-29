"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  DollarSign,
  HelpCircle,
  Info,
  Lock,
  Percent,
  RefreshCw,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * EscrowFeeCalculator Component (Phase 1 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Pure client-side React component.
 * - Dynamic formula: calculates amount * fee_percentage, instantly rendering:
 *   - Buyer Escrow Protection Fee
 *   - Seller Net Payout
 *   - Gateway Processing (Paystack 1.5% max ₦2,000)
 *   - Optional Tracked Insured Waybill
 * - Split options: Buyer Pays 100%, Seller Pays 100%, 50/50 Shared.
 * - Token Compliance: 8px card radius, 4px controls, Geist headers, Inter body, Inter Tabular currency.
 */

export type FeePayer = "buyer" | "seller" | "split";

export interface EscrowFeeCalculatorProps {
  initialAmount?: number;
  className?: string;
  onProceedToTrade?: (details: {
    amount: number;
    escrowFee: number;
    payer: FeePayer;
    sellerPayout: number;
    buyerDeposit: number;
  }) => void;
}

export function EscrowFeeCalculator({
  initialAmount = 450000,
  className,
  onProceedToTrade,
}: EscrowFeeCalculatorProps) {
  const [rawAmount, setRawAmount] = useState<string>(String(initialAmount));
  const [payer, setPayer] = useState<FeePayer>("buyer");
  const [includeShipping, setIncludeShipping] = useState<boolean>(true);
  const [shippingFee, setShippingFee] = useState<number>(4500); // Standard Lagos/Nationwide tracked waybill
  const [copied, setCopied] = useState<boolean>(false);

  // Parse numerical value safely
  const amount = useMemo(() => {
    const cleaned = Number(rawAmount.replace(/[^0-9]/g, ""));
    return isNaN(cleaned) ? 0 : cleaned;
  }, [rawAmount]);

  // Determine active fee tier
  const tierInfo = useMemo(() => {
    if (amount <= 100000) {
      return {
        tierName: "Tier 1: Entry / Accessories",
        percentage: 5.0,
        minFee: 1500,
        badgeColor: "default" as const,
      };
    } else if (amount <= 500000) {
      return {
        tierName: "Tier 2: Mid-Range Gadgets",
        percentage: 3.5,
        minFee: 2500,
        badgeColor: "trust" as const,
      };
    } else {
      return {
        tierName: "Tier 3: Flagships & Laptops",
        percentage: 2.5,
        minFee: 5000,
        badgeColor: "trust" as const,
      };
    }
  }, [amount]);

  // Calculated Escrow Fee
  const calculatedFee = useMemo(() => {
    if (amount <= 0) return 0;
    const raw = (amount * tierInfo.percentage) / 100;
    return Math.max(raw, tierInfo.minFee);
  }, [amount, tierInfo]);

  // Payment Gateway processing fee (Paystack standard: 1.5% capped at ₦2,000; waived on large bank transfer)
  const gatewayFee = useMemo(() => {
    if (amount <= 0) return 0;
    const raw = amount * 0.015;
    return Math.min(raw, 2000);
  }, [amount]);

  // Fee distribution according to payer toggle
  const buyerFeeContribution = useMemo(() => {
    if (payer === "buyer") return calculatedFee;
    if (payer === "seller") return 0;
    return calculatedFee / 2;
  }, [calculatedFee, payer]);

  const sellerFeeContribution = useMemo(() => {
    if (payer === "seller") return calculatedFee;
    if (payer === "buyer") return 0;
    return calculatedFee / 2;
  }, [calculatedFee, payer]);

  // Buyer Total Out-of-Pocket
  const totalBuyerDeposit = useMemo(() => {
    const base = amount;
    const fee = buyerFeeContribution;
    const ship = includeShipping ? shippingFee : 0;
    const gw = payer === "buyer" ? gatewayFee : gatewayFee / 2;
    return base + fee + ship + gw;
  }, [amount, buyerFeeContribution, includeShipping, shippingFee, gatewayFee, payer]);

  // Seller Total Received Payout
  const totalSellerPayout = useMemo(() => {
    const base = amount;
    const fee = sellerFeeContribution;
    const gw = payer === "seller" ? gatewayFee : 0;
    return Math.max(0, base - fee - gw);
  }, [amount, sellerFeeContribution, gatewayFee, payer]);

  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const setPreset = (val: number) => {
    setRawAmount(String(val));
  };

  const handleCopySummary = () => {
    const summary = `Scrowpoint Escrow Breakdown:
Gadget Price: ${formatNaira(amount)}
Escrow Rate: ${tierInfo.percentage}% (${formatNaira(calculatedFee)})
Fee Payer: ${payer.toUpperCase()}
Tracked Logistics: ${includeShipping ? formatNaira(shippingFee) : "None"}
Buyer Deposits: ${formatNaira(totalBuyerDeposit)}
Seller Receives: ${formatNaira(totalSellerPayout)}
Inspection Window: 48 Hours Guarantee`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 items-start", className)}>
      {/* =====================================================================
          LEFT: INPUTS & CUSTOMIZATION (7 Cols)
          ===================================================================== */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-[#111113]/12 bg-white">
          <CardHeader className="pb-4 border-b border-[#111113]/12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center bg-[#111113] text-white">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="font-primary text-base font-bold tracking-[-0.03em] text-[#111113]">
                    Escrow Protection Calculator
                  </CardTitle>
                  <p className="font-secondary text-xs text-[#111113]/65">
                    Instant client-side mathematical simulation of escrow splits.
                  </p>
                </div>
              </div>
              <Badge variant="trust" className="text-[10px] font-mono">
                Live Formula
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* 1. Gadget Selling Price Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="gadget-price-input"
                  className="label text-[#111113]! opacity-80!"
                >
                  Agreed Gadget Price (NGN)
                </label>
                <span className="font-mono text-xs text-[#15803d] font-semibold">
                  {tierInfo.tierName}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-[#111113]/55">
                  ₦
                </span>
                <input
                  id="gadget-price-input"
                  type="text"
                  value={rawAmount ? Number(rawAmount).toLocaleString() : ""}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                    setRawAmount(onlyNums);
                  }}
                  placeholder="e.g. 450,000"
                  className="h-12 w-full border border-[#111113]/15 bg-white pl-8 pr-4 font-mono text-lg font-bold text-[#111113] focus:border-[#111113] focus:ring-1 focus:ring-[#111113] outline-none transition-colors"
                />
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] font-secondary text-[#111113]/60 mr-1">Presets:</span>
                {[85000, 250000, 450000, 850000, 1400000].map((presetVal) => (
                  <button
                    key={presetVal}
                    type="button"
                    onClick={() => setPreset(presetVal)}
                    className={cn(
                      "px-3 py-1 rounded-full border text-[11px] font-mono transition-all duration-200 ease-out",
                      amount === presetVal
                        ? "bg-[#111113] text-white border-[#111113] font-semibold"
                        : "bg-[#F8F7F4] border-[#111113]/12 text-[#111113] hover:border-[#111113]/40"
                    )}
                  >
                    ₦{(presetVal / 1000).toLocaleString()}k
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Fee Payer Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label text-[#111113]! opacity-80!">
                  Who Pays the Escrow Fee?
                </label>
                <span className="text-[11px] font-secondary text-[#111113]/60">
                  Customizable prior to locking
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "buyer", label: "Buyer Pays (100%)", sub: "Standard for classifieds" },
                  { id: "seller", label: "Seller Pays (100%)", sub: "Deducted at payout" },
                  { id: "split", label: "50 / 50 Split", sub: "Shared protection" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPayer(opt.id as FeePayer)}
                    className={cn(
                      "flex flex-col text-left p-3 border transition-all duration-200 ease-out min-h-[56px] justify-center",
                      payer === opt.id
                        ? "bg-[#111113] text-white border-[#111113]"
                        : "bg-white border-[#111113]/12 text-[#111113] hover:bg-[#F8F7F4]"
                    )}
                  >
                    <span className="font-primary text-xs font-bold tracking-[-0.02em] leading-tight">
                      {opt.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] mt-0.5",
                        payer === opt.id ? "text-white/70" : "text-[#111113]/60"
                      )}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tracked Courier Toggle */}
            <div className="border border-[#111113]/12 bg-[#F8F7F4] p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center bg-white border border-[#111113]/12 text-[#111113] mt-0.5 shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-primary text-xs font-bold tracking-[-0.02em] text-[#111113]">
                    Include Insured Tracked Courier Waybill
                  </div>
                  <div className="font-secondary text-[11px] text-[#111113]/65 leading-relaxed">
                    Doorstep verification by GIG/DHL with tamper-evident seal and live signature capture.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIncludeShipping(!includeShipping)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    includeShipping ? "bg-[#22c55e]" : "bg-[#111113]/25"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
                      includeShipping ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================================
          RIGHT: LIVE LEDGER BREAKDOWN & SETTLEMENT RECEIPT (5 Cols)
          ===================================================================== */}
      <div className="lg:col-span-5 space-y-4">
        <div className="border border-[#111113]/12 bg-white p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#111113]/12">
            <div>
              <span className="label">
                Estimated Payout & Deposit
              </span>
              <h3 className="font-primary text-base font-bold tracking-[-0.03em] text-[#111113] mt-0.5">
                Escrow Settlement Ledger
              </h3>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#15803d] bg-[#22c55e]/15 px-2.5 py-1 border border-[#22c55e]/30">
              <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>{tierInfo.percentage.toFixed(1)}% Rate</span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-3 font-secondary text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#111113]/65">Gadget Agreed Price</span>
              <span className="font-mono font-bold text-[#111113]">
                {formatNaira(amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#111113]/65">
                <span>Escrow Protection Fee</span>
                <span className="font-mono text-[10px] text-[#111113]">
                  ({tierInfo.percentage}%)
                </span>
              </div>
              <span className="font-mono font-medium text-[#111113]">
                {formatNaira(calculatedFee)}
              </span>
            </div>

            <div className="flex items-center justify-between pl-3 border-l-2 border-[#111113]/15 text-[11px] text-[#111113]/65">
              <span>Buyer Contribution</span>
              <span className="font-mono text-[#111113]">
                {formatNaira(buyerFeeContribution)}
              </span>
            </div>

            <div className="flex items-center justify-between pl-3 border-l-2 border-[#111113]/15 text-[11px] text-[#111113]/65">
              <span>Seller Contribution</span>
              <span className="font-mono text-[#111113]">
                {formatNaira(sellerFeeContribution)}
              </span>
            </div>

            {includeShipping && (
              <div className="flex items-center justify-between">
                <span className="text-[#111113]/65">Tracked Insured Courier</span>
                <span className="font-mono font-medium text-[#111113]">
                  +{formatNaira(shippingFee)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#111113]/65">Paystack Custody Fee (Capped)</span>
              <span className="font-mono text-[#111113]">
                +{formatNaira(gatewayFee)}
              </span>
            </div>
          </div>

          {/* Dual Big Result Cards */}
          <div className="pt-4 border-t border-[#111113]/12 space-y-3">
            {/* Buyer Total Card */}
            <div className="border border-[#111113]/12 bg-[#F8F7F4] p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-secondary text-xs text-[#111113]/65">
                  Buyer Total Locked Deposit:
                </span>
                <span className="font-mono text-xs text-[#111113] font-semibold">
                  (In Escrow)
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#111113] mt-1">
                {formatNaira(totalBuyerDeposit)}
              </div>
              <div className="font-secondary text-[11px] text-[#15803d] flex items-center gap-1 mt-1">
                <Lock className="h-3 w-3 text-[#22c55e]" />
                <span>Protected until 48H hardware inspection passes</span>
              </div>
            </div>

            {/* Seller Net Payout Card */}
            <div className="border border-[#22c55e]/30 bg-[#22c55e]/10 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-secondary text-xs text-[#15803d]">
                  Seller Net Payout:
                </span>
                <span className="font-mono text-xs text-[#15803d] font-bold">
                  (To Bank Account)
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#15803d] mt-1">
                {formatNaira(totalSellerPayout)}
              </div>
              <div className="font-secondary text-[11px] text-[#111113]/65 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-[#111113]/60" />
                <span>Direct payout within 15 mins of buyer approval</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={() =>
                onProceedToTrade?.({
                  amount,
                  escrowFee: calculatedFee,
                  payer,
                  sellerPayout: totalSellerPayout,
                  buyerDeposit: totalBuyerDeposit,
                })
              }
              className="w-full h-11 text-xs font-semibold gap-2"
            >
              <span>Initiate Protected Escrow Order</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full h-9 rounded-full border border-[#111113]/15 bg-white text-[#111113] hover:bg-[#F8F7F4] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span className="text-[#15803d]">Breakdown Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#111113]/60" />
                  <span>Copy Settlement Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EscrowFeeCalculator;
