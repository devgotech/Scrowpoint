"use client";

import React, { useMemo } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Info,
  Lock,
  Printer,
  Receipt,
  Shield,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * EscrowFeeReceipt Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & Spec 2 Tier 1, Spec 4 §6, Spec 5 §6):
 * - Itemized digital financial breakdown:
 *   1. Item Price
 *   2. Escrow Fee (with dynamic tier calculation: 5% <= 150k, 2.5% <= 750k, 1.5% > 750k)
 *   3. Shipping / Courier fee
 *   4. Total Locked (Highlighted in bold trust vault card)
 * - Corner Radius: --radius-card (8px -> rounded-[8px]) for Card; --radius-control (4px -> rounded-[4px]) for inner boxes & buttons.
 * - Typography: Strict enforcement of `font-mono` for all monetary numbers, percentages, receipt numbers, and SKUs.
 * - Spacing: Exclusively uses the 4-point spacing scale (p-6, gap-4, space-y-3).
 * - Trust Signals: Trust Green (#22c55e) strictly for escrow signals; text on light background uses --color-trust-strong (#15803d).
 * - Transitions: strict duration-200 ease-out transitions.
 */

export interface EscrowFeeReceiptProps {
  receiptNumber?: string;
  orderNumber?: string;
  sku?: string;
  itemTitle?: string;
  /** Amount in base kobo (e.g. 15000000 = ₦150,000) or major Naira if isKobo=false */
  itemPrice: number;
  /** Custom escrow platform fee in kobo or major Naira. If omitted, calculated automatically */
  escrowFee?: number;
  /** Shipping fee in kobo or major Naira */
  shippingFee?: number;
  /** Payment gateway processing fee (defaults to 0.00) */
  gatewayFee?: number;
  /** Whether the passed amounts are in base kobo. Defaults to true */
  isKobo?: boolean;
  currency?: string;
  createdAt?: string;
  buyerName?: string;
  sellerName?: string;
  isLockedInEscrow?: boolean;
  className?: string;
  onDownloadReceipt?: () => void;
}

export function EscrowFeeReceipt({
  receiptNumber = "SP-REC-94218A-20261016",
  orderNumber = "SP-ORD-94218A",
  sku = "APL-IPHONE-14PRO-256GB-MINT",
  itemTitle = "Apple iPhone 14 Pro 256GB (Space Black)",
  itemPrice = 65000000, // ₦650,000 in kobo
  escrowFee,
  shippingFee = 450000, // ₦4,500 in kobo
  gatewayFee = 0,
  isKobo = true,
  currency = "NGN",
  createdAt = "Oct 16, 2026 • 10:15 AM",
  buyerName = "Tunde Adeleke",
  sellerName = "Emeka Tech Hub",
  isLockedInEscrow = true,
  className,
  onDownloadReceipt,
}: EscrowFeeReceiptProps) {
  const [copied, setCopied] = React.useState(false);

  // Normalize all figures to base kobo integers
  const itemPriceKobo = isKobo ? itemPrice : Math.round(itemPrice * 100);
  const shippingFeeKobo = isKobo ? shippingFee : Math.round(shippingFee * 100);
  const gatewayFeeKobo = isKobo ? gatewayFee : Math.round(gatewayFee * 100);

  // Calculate tiered escrow fee if not explicitly passed
  // Tier 1: <= ₦150,000 -> 5.0%
  // Tier 2: <= ₦750,000 -> 2.5%
  // Tier 3: >  ₦750,000 -> 1.5%
  const { calculatedEscrowFeeKobo, feeRatePercent } = useMemo(() => {
    const itemPriceNaira = itemPriceKobo / 100;
    let rate = 0.025;

    if (itemPriceNaira <= 150000) {
      rate = 0.05;
    } else if (itemPriceNaira > 750000) {
      rate = 0.015;
    }

    const calculatedKobo =
      escrowFee !== undefined
        ? isKobo
          ? escrowFee
          : Math.round(escrowFee * 100)
        : Math.round(itemPriceKobo * rate);

    return {
      calculatedEscrowFeeKobo: calculatedKobo,
      feeRatePercent: (rate * 100).toFixed(1),
    };
  }, [itemPriceKobo, escrowFee, isKobo]);

  // Total funds locked in escrow
  const totalLockedKobo =
    itemPriceKobo + calculatedEscrowFeeKobo + shippingFeeKobo + gatewayFeeKobo;

  // Format strings using standard currency utility
  const formattedItemPrice = formatCurrency(itemPriceKobo);
  const formattedEscrowFee = formatCurrency(calculatedEscrowFeeKobo);
  const formattedShippingFee = formatCurrency(shippingFeeKobo);
  const formattedGatewayFee = formatCurrency(gatewayFeeKobo);
  const formattedTotalLocked = formatCurrency(totalLockedKobo);

  const handleCopyReceipt = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(receiptNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      {/* ====================================================================
          1. RECEIPT HEADER & STATUS
          ==================================================================== */}
      <CardHeader className="bg-[#f8fafc] p-6 border-b border-[#e2e8f0]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[4px] bg-[#0f172a] text-white shadow-xs">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-primary text-lg font-medium text-[#020617]">
                  Escrow Fee Receipt
                </span>
                {isLockedInEscrow && (
                  <Badge
                    variant="trust"
                    className="gap-1 py-0 px-2 text-[10px] font-mono tracking-wider font-semibold"
                  >
                    <Lock className="h-3 w-3 text-[#22c55e]" />
                    <span>LOCKED IN ESCROW</span>
                  </Badge>
                )}
              </div>
              <p className="font-secondary text-xs text-[#64748b] mt-0.5">
                Itemized transaction breakdown & custodial verification record
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Number & Date Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e2e8f0] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#64748b] font-secondary">Receipt #:</span>
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="inline-flex items-center gap-1.5 font-mono font-medium text-[#020617] hover:text-[#0f172a] transition-colors cursor-pointer group"
              title="Copy receipt number"
            >
              <span>{receiptNumber}</span>
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#15803d]" />
              ) : (
                <Copy className="h-3 w-3 text-[#64748b] group-hover:text-[#020617]" />
              )}
            </button>
          </div>

          <div className="font-mono text-[#64748b]">{createdAt}</div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* ====================================================================
            2. ITEM & PARTIES SUMMARY
            ==================================================================== */}
        <div className="rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                Purchased Gadget
              </span>
              <h4 className="font-primary text-sm font-medium text-[#020617]">
                {itemTitle}
              </h4>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748b]">
                Order Ref
              </span>
              <p className="font-mono text-xs font-semibold text-[#020617]">
                {orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] text-xs font-mono text-[#64748b]">
            <span>SKU: {sku}</span>
            <span>Currency: {currency}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-secondary text-[#64748b]">
            <div>
              <span className="text-[11px] block text-[#64748b]">Buyer:</span>
              <span className="font-medium text-[#020617]">{buyerName}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] block text-[#64748b]">Seller:</span>
              <span className="font-medium text-[#020617]">{sellerName}</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. ITEMIZED FINANCIAL LIST (Strict font-mono for numbers)
            ==================================================================== */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0] text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">
            <span>Fee Itemization</span>
            <span>Amount</span>
          </div>

          {/* Item 1: Gadget Price */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="font-secondary text-[#020617]">Item Price</span>
              <span className="text-[11px] text-[#64748b] font-mono">
                (Declared value)
              </span>
            </div>
            <span className="font-mono text-[#020617] font-semibold">
              {formattedItemPrice}
            </span>
          </div>

          {/* Item 2: Escrow Protection Fee */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-secondary text-[#020617]">Escrow Protection Fee</span>
                <span className="font-mono text-[11px] rounded-[4px] bg-[#f1f5f9] px-1.5 py-0.2 text-[#64748b] font-semibold">
                  {feeRatePercent}% tier
                </span>
              </div>
              <span className="text-[11px] text-[#64748b] font-secondary">
                Custodial guarantee, fraud shielding & mediation coverage
              </span>
            </div>
            <span className="font-mono text-[#020617] font-semibold">
              {formattedEscrowFee}
            </span>
          </div>

          {/* Item 3: Verified Shipping */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-secondary text-[#020617]">Tracked Shipping</span>
                <Truck className="h-3.5 w-3.5 text-[#64748b]" />
              </div>
              <span className="text-[11px] text-[#64748b] font-secondary">
                Doorstep dispatch with signature & inspection receipt
              </span>
            </div>
            <span className="font-mono text-[#020617] font-semibold">
              {formattedShippingFee}
            </span>
          </div>

          {/* Optional Gateway Fee */}
          {gatewayFeeKobo > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="font-secondary text-[#020617]">Payment Processing Fee</span>
              <span className="font-mono text-[#020617] font-semibold">
                {formattedGatewayFee}
              </span>
            </div>
          )}

          {/* ================================================================
              4. TOTAL LOCKED IN ESCROW HIGHLIGHT (Strict Contrast Rule)
              ================================================================ */}
          <div className="mt-4 rounded-[4px] border border-[#22c55e]/30 bg-[#22c55e]/15 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#22c55e]/25 text-[#15803d]">
                  <Lock className="h-4 w-4 text-[#22c55e]" />
                </div>
                <div>
                  <span className="font-primary text-sm font-semibold text-[#020617]">
                    Total Locked in Escrow
                  </span>
                  <p className="text-[11px] font-secondary text-[#64748b]">
                    Halted in vault until 48h inspection approval
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xl font-bold tracking-tight text-[#15803d]">
                  {formattedTotalLocked}
                </span>
                <span className="block font-mono text-[10px] text-[#64748b] uppercase">
                  {currency} Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Guarantee Advisory */}
        <div className="flex items-start gap-2.5 rounded-[4px] bg-[#f8fafc] p-3 text-xs text-[#64748b] border border-[#e2e8f0]">
          <ShieldCheck className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
          <p className="font-secondary leading-relaxed">
            The seller does not receive any payout until you receive the package, inspect the gadget,
            and approve condition within the 48-hour inspection window.
          </p>
        </div>
      </CardContent>

      {/* ====================================================================
          5. FOOTER UTILITIES (Print / Download)
          ==================================================================== */}
      <CardFooter className="bg-[#f8fafc] p-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#64748b]">
          <Lock className="h-3.5 w-3.5 text-[#22c55e]" />
          <span>Paystack Escrow Custody Hash: Verified</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            className="flex-1 sm:flex-none gap-1.5 text-xs h-8"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>

          {onDownloadReceipt && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onDownloadReceipt}
              className="flex-1 sm:flex-none gap-1.5 text-xs h-8 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default EscrowFeeReceipt;
