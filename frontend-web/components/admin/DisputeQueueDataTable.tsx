"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Scale, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DisputeQueueDataTable Component (Phase 6 §2 - Dispute Triage)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Table sorted by dispute value and SLA urgency.
 * - Displays parties, gadget item, locked amount, reason, and SLA countdown timer.
 * - Token Compliance: 8px container radius, 4px controls, font-mono currency and timer.
 */

export interface DisputeQueueRecord {
  id: string;
  orderNumber: string;
  gadgetTitle: string;
  buyerName: string;
  sellerName: string;
  lockedAmountNaira: number;
  reason: string;
  slaRemaining: string;
  isUrgent?: boolean;
  status: "OPEN" | "REVIEW" | "MEDIATION";
}

export const SAMPLE_DISPUTE_QUEUE: DisputeQueueRecord[] = [
  {
    id: "dsp-101",
    orderNumber: "SP-ORD-9421",
    gadgetTitle: "iPhone 14 Pro Max 256GB Deep Purple",
    buyerName: "Adeola Fashola",
    sellerName: "Chidi Tech Hub",
    lockedAmountNaira: 850000,
    reason: "Battery Health 78% (Stated 97%) & Digitizer Lag",
    slaRemaining: "02h 45m",
    isUrgent: true,
    status: "MEDIATION",
  },
  {
    id: "dsp-102",
    orderNumber: "SP-ORD-9104",
    gadgetTitle: "MacBook Air M2 512GB Space Gray",
    buyerName: "Emeka Okafor",
    sellerName: "Zainab Mobile Deals",
    lockedAmountNaira: 680000,
    reason: "Hairline Crack on Display Bezel",
    slaRemaining: "08h 12m",
    status: "REVIEW",
  },
  {
    id: "dsp-103",
    orderNumber: "SP-ORD-8812",
    gadgetTitle: "Google Pixel 7 Pro 128GB Obsidian",
    buyerName: "Fatima Bello",
    sellerName: "Adeola Tech Hub",
    lockedAmountNaira: 320000,
    reason: "Rear Camera Lens Scratched in Transit",
    slaRemaining: "21h 30m",
    status: "OPEN",
  },
];

export interface DisputeQueueDataTableProps {
  cases?: DisputeQueueRecord[];
  onSelectCase?: (caseId: string) => void;
  className?: string;
}

export function DisputeQueueDataTable({
  cases = SAMPLE_DISPUTE_QUEUE,
  onSelectCase,
  className,
}: DisputeQueueDataTableProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-[#111113]/12">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#111113]" />
            <h3 className="font-primary text-base font-bold text-[#111113] tracking-[-0.03em]">
              Arbitration Case Triage Queue
            </h3>
          </div>
          <p className="font-secondary text-xs text-[#111113]/65 mt-0.5">
            Ranked by priority SLA urgency and locked escrow capital.
          </p>
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.12em] bg-[#f56565]/15 text-[#c53030] border border-[#f56565]/30 px-2.5 py-1 font-bold">
          {cases.length} Open Cases
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#111113]/12 bg-[#F8F7F4] font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-[#111113]/60">
              <th className="p-3.5">Case / Order</th>
              <th className="p-3.5">Device & Reason</th>
              <th className="p-3.5">Parties</th>
              <th className="p-3.5">Locked Value</th>
              <th className="p-3.5">SLA Timer</th>
              <th className="p-3.5 text-right">Adjudicate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111113]/12">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-[#F8F7F4] transition-colors">
                <td className="p-3.5">
                  <span className="font-mono font-bold text-[#111113] block">
                    {c.id}
                  </span>
                  <span className="font-mono text-[10px] text-[#111113]/60">
                    {c.orderNumber}
                  </span>
                </td>

                <td className="p-3.5 max-w-xs">
                  <span className="font-primary font-bold text-[#111113] tracking-[-0.02em] block truncate">
                    {c.gadgetTitle}
                  </span>
                  <span className="font-secondary text-[11px] text-[#c53030] block truncate">
                    {c.reason}
                  </span>
                </td>

                <td className="p-3.5">
                  <span className="font-medium text-[#111113] block">B: {c.buyerName}</span>
                  <span className="font-secondary text-[11px] text-[#111113]/65 block">
                    S: {c.sellerName}
                  </span>
                </td>

                <td className="p-3.5 font-mono font-bold text-[#111113] text-sm">
                  {formatNaira(c.lockedAmountNaira)}
                </td>

                <td className="p-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 border",
                      c.isUrgent
                        ? "bg-[#f56565]/15 text-[#c53030] border-[#f56565]/30 animate-pulse"
                        : "bg-[#ecc94b]/20 text-[#975a16] border-[#ecc94b]/40"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{c.slaRemaining}</span>
                  </span>
                </td>

                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectCase?.(c.id)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#111113] text-white hover:bg-[#FF5A25] font-mono text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DisputeQueueDataTable;
