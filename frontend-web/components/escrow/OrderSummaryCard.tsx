"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, CreditCard, Lock, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * OrderSummaryCard Component (Phase 3 §1)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays active trade snapshot in the Escrow Room.
 * - Device spec, agreed price, segregated vault balance, courier tracking number.
 * - Mobile responsive: compact collapsed summary by default with expandable ledger breakdown.
 * - Token Compliance: 8px card radius, 4px controls, Roboto headings, Geist Mono metrics.
 */

export interface EscrowOrderData {
  orderId: string;
  gadgetId: string;
  gadgetTitle: string;
  gadgetImage: string;
  condition: string;
  amount: number;
  escrowFee: number;
  logisticsFee: number;
  totalDeposit: number;
  buyerName: string;
  sellerName: string;
  status: "PENDING_PAYMENT" | "FUNDED" | "SHIPPED" | "DELIVERED" | "DISPUTED" | "SETTLED";
  courierWaybill?: string;
  courierPartner?: string;
  inspectionRemainingSeconds?: number;
}

export interface OrderSummaryCardProps {
  order: EscrowOrderData;
  className?: string;
}

export function OrderSummaryCard({ order, className }: OrderSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "border border-ink-faint bg-surface p-5 space-y-4 rounded-card",
        className
      )}
    >
      {/* Top Strip: Order ID & Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-ink-faint">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-ink">
            {order.orderId}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="text-ink/60 hover:text-ink p-1 transition-colors"
            title="Copy Order ID"
          >
            <Copy className="h-3 w-3" />
          </button>
          {copied && (
            <span className="font-mono text-caption text-trust-strong">Copied!</span>
          )}
        </div>

        <Badge
          variant={
            order.status === "PENDING_PAYMENT"
              ? "warning"
              : order.status === "DISPUTED"
              ? "destructive"
              : order.status === "SETTLED"
              ? "trust"
              : "outline"
          }
          className="text-caption font-mono tracking-wider"
        >
          {order.status === "DISPUTED" ? "DISPUTE FROZEN" : `ESCROW ${order.status}`}
        </Badge>
      </div>

      {/* Gadget Snippet */}
      <div className="flex items-center gap-3">
        <img
          src={order.gadgetImage}
          alt={order.gadgetTitle}
          className="h-16 w-16 object-cover border border-ink-faint bg-surface-muted rounded-ui"
        />
        <div className="min-w-0 flex-1">
          <span className="label block">
            {order.condition} Grade
          </span>
          <h3 className="font-primary text-sm font-bold tracking-[-0.02em] text-ink truncate mt-0.5">
            {order.gadgetTitle}
          </h3>
          <div className="font-mono text-sm font-bold text-ink mt-0.5">
            ₦{(order.amount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Primary Vault Balance Callout */}
      <div
        className={cn(
          "border p-3 flex items-center justify-between",
          order.status === "PENDING_PAYMENT"
            ? "border-state-warning/40 bg-state-warning/10"
            : "border-trust/30 bg-trust/10"
        )}
      >
        <div className="flex items-center gap-2">
          {order.status === "PENDING_PAYMENT" ? (
            <CreditCard className="h-4 w-4 text-state-warning-strong" />
          ) : (
            <Lock className="h-4 w-4 text-trust" />
          )}
          <span
            className={cn(
              "font-primary text-xs font-bold",
              order.status === "PENDING_PAYMENT" ? "text-state-warning-strong" : "text-trust-strong"
            )}
          >
            {order.status === "PENDING_PAYMENT" ? "Awaiting Payment" : "Locked in Escrow Vault"}
          </span>
        </div>
        <span
          className={cn(
            "font-mono text-xs font-extrabold",
            order.status === "PENDING_PAYMENT" ? "text-state-warning-strong" : "text-trust-strong"
          )}
        >
          ₦{(order.totalDeposit).toLocaleString()}
        </span>
      </div>

      {/* Logistics Tracking Strip if Shipped */}
      {order.courierWaybill && (
        <div className="border border-ink-faint bg-paper p-3 text-xs flex items-center justify-between rounded-card">
          <div className="flex items-center gap-2 text-ink">
            <Truck className="h-4 w-4 text-ink" />
            <span className="font-medium">{order.courierPartner || "GIG Logistics"}</span>
          </div>
          <span className="font-mono font-bold text-ink">
            {order.courierWaybill}
          </span>
        </div>
      )}

      {/* Expandable Financial Breakdown */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1 text-xs font-mono text-ink/65 hover:text-ink"
        >
          <span>{isExpanded ? "Hide Escrow Ledger" : "View Escrow Ledger Breakdown"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-ink-faint space-y-2 text-xs font-secondary">
            <div className="flex justify-between text-ink/65">
              <span>Agreed Item Price</span>
              <span className="font-mono text-ink">₦{(order.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-ink/65">
              <span>Escrow Fee (Protected)</span>
              <span className="font-mono text-ink">₦{(order.escrowFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-ink/65">
              <span>Tracked Logistics</span>
              <span className="font-mono text-ink">₦{(order.logisticsFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-ink-faint font-bold text-ink">
              <span>Buyer Total Deposit</span>
              <span className="font-mono">₦{(order.totalDeposit).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-meta font-mono text-trust-strong">
              <span>Seller Net Payout</span>
              <span>₦{(order.amount).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSummaryCard;
