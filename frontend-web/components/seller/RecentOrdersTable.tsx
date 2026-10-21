"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Lock, Package, ShieldAlert, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * RecentOrdersTable Component (Phase 3 §1 - Seller Dashboard)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays seller's recent transactions with active escrow states.
 * - Responsive: Full table on desktop (>= md), stacked cards on mobile (< md).
 * - Token Compliance: 8px container radius, 4px controls, Geist Mono currency and order IDs.
 */

export interface SellerOrderRecord {
  id: string;
  orderNumber: string;
  gadgetTitle: string;
  condition: string;
  buyerName: string;
  buyerCity: string;
  amountNaira: number;
  status: "FUNDED" | "SHIPPED" | "INSPECTION" | "SETTLED" | "DISPUTED";
  timeRemaining?: string;
  trackingNumber?: string;
  createdAt: string;
}

export const SAMPLE_SELLER_ORDERS: SellerOrderRecord[] = [
  {
    id: "ord-01",
    orderNumber: "BH-ORD-9421",
    gadgetTitle: "iPhone 14 Pro Max 256GB Deep Purple",
    condition: "Mint",
    buyerName: "Adeola Fashola",
    buyerCity: "Ikeja, Lagos",
    amountNaira: 850000,
    status: "INSPECTION",
    timeRemaining: "14h 20m left",
    trackingNumber: "GIG-948102-LOS",
    createdAt: "Yesterday",
  },
  {
    id: "ord-02",
    orderNumber: "BH-ORD-9104",
    gadgetTitle: "MacBook Air M2 512GB Space Gray",
    condition: "Good",
    buyerName: "Emeka Okafor",
    buyerCity: "Yaba, Lagos",
    amountNaira: 680000,
    status: "SHIPPED",
    trackingNumber: "DHL-NG-884102",
    createdAt: "2 days ago",
  },
  {
    id: "ord-03",
    orderNumber: "BH-ORD-8812",
    gadgetTitle: "Samsung Galaxy S23 Ultra 512GB",
    condition: "Fair",
    buyerName: "Fatima Bello",
    buyerCity: "Garki, Abuja",
    amountNaira: 490000,
    status: "FUNDED",
    createdAt: "3 days ago",
  },
  {
    id: "ord-04",
    orderNumber: "BH-ORD-8210",
    gadgetTitle: "Google Pixel 7 Pro 128GB Obsidian",
    condition: "Mint",
    buyerName: "Tunde Bakare",
    buyerCity: "Lekki, Lagos",
    amountNaira: 320000,
    status: "SETTLED",
    createdAt: "1 week ago",
  },
];

export interface RecentOrdersTableProps {
  orders?: SellerOrderRecord[];
  onSelectOrder?: (orderNumber: string) => void;
  className?: string;
}

export function RecentOrdersTable({
  orders = SAMPLE_SELLER_ORDERS,
  onSelectOrder,
  className,
}: RecentOrdersTableProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: SellerOrderRecord["status"], time?: string) => {
    switch (status) {
      case "FUNDED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-2 py-0.5 rounded-[4px]">
            <Lock className="h-3 w-3 text-[#22c55e]" />
            <span>FUNDS HELD</span>
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] px-2 py-0.5 rounded-[4px]">
            <Truck className="h-3 w-3 text-[#64748b]" />
            <span>IN TRANSIT</span>
          </span>
        );
      case "INSPECTION":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-[#ecc94b]/20 text-[#975a16] border border-[#ecc94b]/40 px-2 py-0.5 rounded-[4px]">
            <Clock className="h-3 w-3 text-[#ecc94b]" />
            <span>{time || "48H SLA"}</span>
          </span>
        );
      case "SETTLED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-2 py-0.5 rounded-[4px]">
            <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
            <span>SETTLED</span>
          </span>
        );
      case "DISPUTED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-[#f56565]/15 text-[#c53030] border border-[#f56565]/30 px-2 py-0.5 rounded-[4px]">
            <ShieldAlert className="h-3 w-3 text-[#f56565]" />
            <span>DISPUTED</span>
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)] overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
        <div>
          <h3 className="font-primary text-base font-bold text-[#020617]">
            Active & Recent Escrow Trades
          </h3>
          <p className="font-secondary text-xs text-[#64748b] mt-0.5">
            Real-time status of orders awaiting dispatch, in transit, or undergoing 48h inspection.
          </p>
        </div>

        <span className="font-mono text-xs bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded-[4px] font-bold text-[#0f172a]">
          {orders.length} Trades
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] font-mono text-[11px] uppercase font-bold text-[#64748b]">
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Gadget Item</th>
              <th className="p-3.5">Buyer</th>
              <th className="p-3.5">Escrow Amount</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Escrow Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="p-3.5 font-mono font-bold text-[#0f172a]">
                  {ord.orderNumber}
                  <span className="block font-secondary text-[10px] text-[#64748b] font-normal">
                    {ord.createdAt}
                  </span>
                </td>

                <td className="p-3.5">
                  <span className="font-primary font-bold text-[#020617] block">
                    {ord.gadgetTitle}
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">
                    {ord.condition} Grade {ord.trackingNumber ? `• ${ord.trackingNumber}` : ""}
                  </span>
                </td>

                <td className="p-3.5">
                  <span className="font-medium text-[#020617] block">{ord.buyerName}</span>
                  <span className="font-secondary text-[11px] text-[#64748b]">
                    {ord.buyerCity}
                  </span>
                </td>

                <td className="p-3.5 font-mono font-bold text-[#020617] text-sm">
                  {formatNaira(ord.amountNaira)}
                </td>

                <td className="p-3.5">
                  {getStatusBadge(ord.status, ord.timeRemaining)}
                </td>

                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectOrder?.(ord.orderNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0f172a] text-white hover:bg-slate-800 font-mono text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <span>Open Room</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="md:hidden divide-y divide-[#e2e8f0]">
        {orders.map((ord) => (
          <div key={ord.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-[#0f172a]">
                {ord.orderNumber}
              </span>
              {getStatusBadge(ord.status, ord.timeRemaining)}
            </div>

            <div>
              <h4 className="font-primary text-sm font-bold text-[#020617]">
                {ord.gadgetTitle}
              </h4>
              <p className="font-secondary text-xs text-[#64748b]">
                Buyer: {ord.buyerName} ({ord.buyerCity})
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
              <span className="font-mono font-bold text-sm text-[#020617]">
                {formatNaira(ord.amountNaira)}
              </span>

              <button
                type="button"
                onClick={() => onSelectOrder?.(ord.orderNumber)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-[#0f172a] text-white text-xs font-mono font-semibold"
              >
                <span>Escrow Room</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentOrdersTable;
