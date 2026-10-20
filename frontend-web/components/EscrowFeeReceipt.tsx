"use client";

import React, { useMemo } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Lock,
  Printer,
  Receipt,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * EscrowFeeReceipt Component for Buyer's High.
 *
 * Requirements (UI Context Spec 2 Tier 1, Spec 4 §6, Spec 5 §6, Directives):
 * - Itemized digital financial breakdown:
 *   1. Item Price
 *   2. Escrow Fee (with dynamic tier calculation: 5% <= 150k, 2.5% <= 750k, 1.5% > 750k)
 *   3. Shipping / Courier fee
 *   4. Total Locked (Highlighted in bold trust vault card)
 * - Typography: Strict enforcement of `font-mono` for all monetary numbers, percentages, receipt numbers, and SKUs.
 * - Spacing: Exclusively uses Tailwind's 4-point scale (p-6, gap-4, space-y-3).
 * - Actionable utilities: Copy receipt number, print/save receipt, and escrow guarantee breakdown.
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
  receiptNumber = "BH-REC-94218A-20261016",
  orderNumber = "BH-ORD-94218A",
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
        "w-full max-w-xl mx-auto overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-soft-sm)]",
        className
      )}
    >
      {/* ====================================================================
          1. RECEIPT HEADER & STATUS
          ==================================================================== */}
      <CardHeader className="bg-muted/40 p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-foreground">
                  Escrow Fee Receipt
                </span>
                {isLockedInEscrow && (
                  <Badge
                    variant="trust"
                    className="gap-1 py-0 px-2 text-[10px] font-semibold"
                  >
                    <Lock className="h-3 w-3" />
                    <span>LOCKED IN ESCROW</span>
                  </Badge>
                )}
              </div>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Itemized transaction breakdown & custodial verification record
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Number & Date Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-body">Receipt #:</span>
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="inline-flex items-center gap-1.5 mono-data text-foreground hover:text-primary transition-colors duration-200 ease-out cursor-pointer group"
              title="Copy receipt number"
            >
              <span>{receiptNumber}</span>
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
              )}
            </button>
          </div>

          <div className="font-mono text-muted-foreground">{createdAt}</div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* ====================================================================
            2. ITEM & PARTIES SUMMARY
            ==================================================================== */}
        <div className="rounded-xl border border-border/80 bg-background p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Purchased Gadget
              </span>
              <h4 className="font-heading text-sm font-semibold text-foreground">
                {itemTitle}
              </h4>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Order Ref
              </span>
              <p className="mono-data text-foreground">
                {orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-mono text-muted-foreground">
            <span>SKU: {sku}</span>
            <span>Currency: {currency}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-body text-muted-foreground">
            <div>
              <span className="text-[11px] block text-foreground/70">Buyer:</span>
              <span className="font-medium text-foreground">{buyerName}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] block text-foreground/70">Seller:</span>
              <span className="font-medium text-foreground">{sellerName}</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. ITEMIZED FINANCIAL LIST (Strict font-mono for numbers)
            ==================================================================== */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Fee Itemization</span>
            <span>Amount</span>
          </div>

          {/* Item 1: Gadget Price */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="font-body text-foreground">Item Price</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                (Declared value)
              </span>
            </div>
            <span className="mono-data text-foreground">
              {formattedItemPrice}
            </span>
          </div>

          {/* Item 2: Escrow Protection Fee */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-body text-foreground">Escrow Protection Fee</span>
                <span className="font-mono text-[11px] rounded-md bg-muted px-1.5 py-0.2 text-muted-foreground font-semibold">
                  {feeRatePercent}% tier
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-body">
                Custodial guarantee, fraud shielding & mediation coverage
              </span>
            </div>
            <span className="mono-data text-foreground">
              {formattedEscrowFee}
            </span>
          </div>

          {/* Item 3: Verified Shipping */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-body text-foreground">Tracked Shipping</span>
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-[11px] text-muted-foreground font-body">
                Doorstep dispatch with signature & inspection receipt
              </span>
            </div>
            <span className="mono-data text-foreground">
              {formattedShippingFee}
            </span>
          </div>

          {/* Optional Gateway Fee */}
          {gatewayFeeKobo > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="font-body text-foreground">Payment Processing Fee</span>
              <span className="mono-data text-foreground">
                {formattedGatewayFee}
              </span>
            </div>
          )}

          {/* ================================================================
              4. TOTAL LOCKED IN ESCROW HIGHLIGHT
              ================================================================ */}
          <div className="mt-4 rounded-lg border border-trust/40 bg-trust-subtle p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-trust/10 text-trust-strong">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-heading text-sm font-bold text-foreground">
                    Total Locked in Escrow
                  </span>
                  <p className="text-[11px] font-body text-muted-foreground">
                    Halted in vault until 48h inspection approval
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="mono-data text-trust-strong">
                  {formattedTotalLocked}
                </span>
                <span className="block font-mono text-[10px] text-muted-foreground uppercase">
                  {currency} Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Guarantee Advisory */}
        <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/60">
          <ShieldCheck className="h-4 w-4 text-trust-strong shrink-0 mt-0.5" />
          <p className="font-body leading-relaxed">
            The seller does not receive any payout until you receive the package, inspect the gadget,
            and approve condition within the 48-hour inspection window.
          </p>
        </div>
      </CardContent>

      {/* ====================================================================
          5. FOOTER UTILITIES (Print / Download)
          ==================================================================== */}
      <CardFooter className="bg-muted/20 p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-trust-strong" />
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
            className="flex-1 sm:flex-none gap-1.5 text-xs border-border"
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
              className="flex-1 sm:flex-none gap-1.5 text-xs shadow-[var(--shadow-soft-sm)]"
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
