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
        "border border-[#111113]/12 bg-white p-5 space-y-4",
        className
      )}
    >
      {/* Top Strip: Order ID & Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#111113]">
            {order.orderId}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="text-[#111113]/60 hover:text-[#111113] p-1 transition-colors"
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
          className="h-16 w-16 object-cover border border-[#111113]/12 bg-[#F0EFEA]"
        />
        <div className="min-w-0 flex-1">
          <span className="label block">
            {order.condition} Grade
          </span>
          <h3 className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113] truncate mt-0.5">
            {order.gadgetTitle}
          </h3>
          <div className="font-mono text-sm font-bold text-[#111113] mt-0.5">
            ₦{(order.amount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Primary Vault Balance Callout */}
      <div className="border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 flex items-center justify-between">
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
        <div className="border border-[#111113]/12 bg-[#F8F7F4] p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#111113]">
            <Truck className="h-4 w-4 text-[#111113]" />
            <span className="font-medium">{order.courierPartner || "GIG Logistics"}</span>
          </div>
          <span className="font-mono font-bold text-[#111113]">
            {order.courierWaybill}
          </span>
        </div>
      )}

      {/* Expandable Financial Breakdown */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1 text-xs font-mono text-[#111113]/65 hover:text-[#111113]"
        >
          <span>{isExpanded ? "Hide Escrow Ledger" : "View Escrow Ledger Breakdown"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[#111113]/12 space-y-2 text-xs font-secondary">
            <div className="flex justify-between text-[#111113]/65">
              <span>Agreed Item Price</span>
              <span className="font-mono text-[#111113]">₦{(order.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#111113]/65">
              <span>Escrow Fee (Protected)</span>
              <span className="font-mono text-[#111113]">₦{(order.escrowFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#111113]/65">
              <span>Tracked Logistics</span>
              <span className="font-mono text-[#111113]">₦{(order.logisticsFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#111113]/12 font-bold text-[#111113]">
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
