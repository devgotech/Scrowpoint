"use client";

import React, { useState } from "react";
import { Building2, Check, CheckCircle2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * BankAccList Component (Phase 3 §2 - Wallet & Payouts)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays verified Nigerian NUBAN bank accounts linked to seller's SmileID identity.
 * - Token Compliance: 8px container radius, 4px controls, font-mono account numbers.
 */

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

export const SAMPLE_BANKS: BankAccount[] = [
  {
    id: "bnk-1",
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0238491029",
    accountName: "CHIDI TECH ENTERPRISES",
    isPrimary: true,
  },
  {
    id: "bnk-2",
    bankName: "Zenith Bank Plc",
    accountNumber: "2194810291",
    accountName: "CHIDI TECH ENTERPRISES",
    isPrimary: false,
  },
];

export interface BankAccListProps {
  accounts?: BankAccount[];
  onAddAccount?: () => void;
  className?: string;
}

export function BankAccList({
  accounts = SAMPLE_BANKS,
  onAddAccount,
  className,
}: BankAccListProps) {
  const [selectedId, setSelectedId] = useState<string>("bnk-1");

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
        <div>
          <h3 className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
            Linked Settlement Accounts
          </h3>
          <p className="font-secondary text-xs text-[#111113]/65">
            Must match your verified SmileID legal name for instant NIP clearance.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddAccount}
          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#111113] hover:text-[#FF5A25] underline underline-offset-4 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Account</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {accounts.map((acc) => {
          const isSelected = selectedId === acc.id;

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedId(acc.id)}
              className={cn(
                "p-4 border flex items-center justify-between cursor-pointer transition-all duration-200 ease-out",
                isSelected
                  ? "border-[#111113] bg-[#F8F7F4] ring-1 ring-[#111113]"
                  : "border-[#111113]/12 bg-white hover:bg-[#F8F7F4]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[#F0EFEA] text-[#111113]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-primary text-xs font-bold text-[#111113]">
                      {acc.bankName}
                    </span>
                    {acc.isPrimary && (
                      <span className="font-mono text-[9px] bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-1.5 py-0.2 font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-[#111113]/65 mt-0.5">
                    {acc.accountNumber} • {acc.accountName}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111113] text-white">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BankAccList;
