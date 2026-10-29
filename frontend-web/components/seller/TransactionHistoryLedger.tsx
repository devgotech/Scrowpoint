"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TransactionHistoryLedger Component (Phase 3 §2 - Wallet & Payouts)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays append-only immutable financial records for the seller.
 * - Token Compliance: 8px container radius, font-mono reference and amounts.
 */

export interface LedgerEntry {
  id: string;
  type: "ESCROW_RELEASE" | "WITHDRAWAL" | "ESCROW_HOLD" | "PLATFORM_FEE";
  title: string;
  ref: string;
  amountNaira: number;
  date: string;
  status: "COMPLETED" | "PENDING";
}

export const SAMPLE_LEDGER: LedgerEntry[] = [
  {
    id: "tx-1",
    type: "ESCROW_RELEASE",
    title: "iPhone 14 Pro Max (SP-ORD-9421) Payout Released",
    ref: "REL-PAY-9421-LOS",
    amountNaira: 850000,
    date: "Today, 11:20 AM",
    status: "COMPLETED",
  },
  {
    id: "tx-2",
    type: "WITHDRAWAL",
    title: "Bank Settlement to GTBank (0238491029)",
    ref: "WTH-NIP-9941-CBN",
    amountNaira: -450000,
    date: "Yesterday, 04:15 PM",
    status: "COMPLETED",
  },
  {
    id: "tx-3",
    type: "ESCROW_HOLD",
    title: "MacBook Air M2 (SP-ORD-9104) Vault Hold",
    ref: "HLD-SEC-9104-PST",
    amountNaira: 680000,
    date: "2 days ago",
    status: "PENDING",
  },
];

export interface TransactionHistoryLedgerProps {
  entries?: LedgerEntry[];
  className?: string;
}

export function TransactionHistoryLedger({
  entries = SAMPLE_LEDGER,
  className,
}: TransactionHistoryLedgerProps) {
  const formatNaira = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Math.abs(val));
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
          <h3 className="font-primary text-base font-bold text-[#111113] tracking-[-0.03em]">
            Immutable Payout Ledger
          </h3>
          <p className="font-secondary text-xs text-[#111113]/65">
            Cryptographically sealed settlement entries verified by Paystack and Go backend.
          </p>
        </div>

        <span className="font-mono text-[10px] uppercase tracking-[0.12em] bg-[#F8F7F4] border border-[#111113]/12 px-2 py-0.5 font-bold text-[#111113]/70">
          Audit-Grade
        </span>
      </div>

      <div className="divide-y divide-[#111113]/12">
        {entries.map((entry) => {
          const isCredit = entry.amountNaira > 0;

          return (
            <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-[#F8F7F4] transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center border",
                    isCredit ? "bg-[#22c55e]/15 text-[#15803d] border-[#22c55e]/30" : "bg-[#F0EFEA] text-[#111113] border-[#111113]/12"
                  )}
                >
                  {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>

                <div>
                  <h4 className="font-primary text-xs font-bold text-[#111113]">
                    {entry.title}
                  </h4>
                  <div className="font-mono text-[10px] text-[#111113]/60 mt-0.5">
                    Ref: {entry.ref} • {entry.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={cn(
                    "font-mono text-sm font-bold",
                    isCredit ? "text-[#15803d]" : "text-[#111113]"
                  )}
                >
                  {isCredit ? `+${formatNaira(entry.amountNaira)}` : `-${formatNaira(entry.amountNaira)}`}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/60 block">
                  {entry.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TransactionHistoryLedger;
