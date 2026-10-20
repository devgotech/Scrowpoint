"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Lock,
  MapPin,
  Package,
  Receipt,
  Shield,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
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
  status: "FUNDED" | "SHIPPED" | "DELIVERED" | "DISPUTED" | "SETTLED";
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
        "rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.06)] space-y-4",
        className
      )}
    >
      {/* Top Strip: Order ID & Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#0f172a]">
            {order.orderId}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="text-[#64748b] hover:text-[#020617] p-1 transition-colors"
            title="Copy Order ID"
          >
            <Copy className="h-3 w-3" />
          </button>
          {copied && (
            <span className="font-mono text-[10px] text-[#15803d]">Copied!</span>
          )}
        </div>

        <Badge
          variant={
            order.status === "DISPUTED"
              ? "destructive"
              : order.status === "SETTLED"
              ? "trust"
              : "outline"
          }
          className="text-[10px] font-mono tracking-wider"
        >
          {order.status === "DISPUTED" ? "DISPUTE FROZEN" : `ESCROW ${order.status}`}
        </Badge>
      </div>

      {/* Gadget Snippet */}
      <div className="flex items-center gap-3">
        <img
          src={order.gadgetImage}
          alt={order.gadgetTitle}
          className="h-16 w-16 rounded-[4px] object-cover border border-[#e2e8f0] bg-[#f8fafc]"
        />
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[#64748b] block">
            {order.condition} Grade
          </span>
          <h3 className="font-primary text-sm font-bold text-[#020617] truncate">
            {order.gadgetTitle}
          </h3>
          <div className="font-mono text-sm font-extrabold text-[#020617] mt-0.5">
            ₦{(order.amount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Primary Vault Balance Callout */}
      <div className="rounded-[4px] border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#22c55e]" />
          <span className="font-primary text-xs font-bold text-[#15803d]">
            Locked in Escrow Vault
          </span>
        </div>
        <span className="font-mono text-xs font-extrabold text-[#15803d]">
          ₦{(order.totalDeposit).toLocaleString()}
        </span>
      </div>

      {/* Logistics Tracking Strip if Shipped */}
      {order.courierWaybill && (
        <div className="rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#020617]">
            <Truck className="h-4 w-4 text-[#0f172a]" />
            <span className="font-medium">{order.courierPartner || "GIG Logistics"}</span>
          </div>
          <span className="font-mono font-bold text-[#020617]">
            {order.courierWaybill}
          </span>
        </div>
      )}

      {/* Expandable Financial Breakdown */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1 text-xs font-mono text-[#64748b] hover:text-[#020617]"
        >
          <span>{isExpanded ? "Hide Escrow Ledger" : "View Escrow Ledger Breakdown"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[#e2e8f0] space-y-2 text-xs font-secondary">
            <div className="flex justify-between text-[#64748b]">
              <span>Agreed Item Price</span>
              <span className="font-mono text-[#020617]">₦{(order.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>Escrow Fee (Protected)</span>
              <span className="font-mono text-[#020617]">₦{(order.escrowFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>Tracked Logistics</span>
              <span className="font-mono text-[#020617]">₦{(order.logisticsFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#e2e8f0] font-bold text-[#020617]">
              <span>Buyer Total Deposit</span>
              <span className="font-mono">₦{(order.totalDeposit).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#15803d]">
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
