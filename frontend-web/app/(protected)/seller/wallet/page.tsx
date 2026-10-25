"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { BalanceCard } from "@/components/seller/BalanceCard";
import { BankAccList } from "@/components/seller/BankAccList";
import { TransactionHistoryLedger } from "@/components/seller/TransactionHistoryLedger";
import { Button } from "@/components/ui/button";

/**
 * Screen: Wallet & Payouts (Phase 3 §2)
 * Route: app/(protected)/seller/wallet/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: BalanceCard, BankAccList, WithdrawButton, TransactionHistoryLedger.
 * - Architecture Link: Go backend communicates with payment gateways to process bulk payouts.
 */

export interface SellerWalletPageProps {
  onBackToDashboard?: () => void;
  onNavigateHome?: () => void;
}

export default function SellerWalletPage({
  onBackToDashboard,
  onNavigateHome,
}: SellerWalletPageProps) {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleExecuteWithdraw = () => {
    setWithdrawSuccess(true);
    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      setWithdrawSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/seller/dashboard"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Seller Dashboard</span>
                </Link>
                <span className="text-[#64748b] text-xs">/</span>
                <span className="font-mono text-xs font-semibold text-[#0f172a]">
                  Wallet & Payouts
                </span>
              </div>
              <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                Escrow Settlement Wallet
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
                Manage NUBAN bank accounts, initiate instant payouts, and view audit records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-3 py-1.5 rounded-[4px] font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>NIP Automated Rails</span>
              </span>
            </div>
          </div>

          {/* Balance Card */}
          <BalanceCard onWithdrawClick={() => setIsWithdrawModalOpen(true)} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: Bank Accounts */}
            <div className="lg:col-span-6 space-y-6">
              <BankAccList onAddAccount={() => alert("Open NUBAN Bank Account Link Modal")} />
            </div>

            {/* Right 6 cols: Transaction History */}
            <div className="lg:col-span-6 space-y-6">
              <TransactionHistoryLedger />
            </div>
          </div>
        </div>
      </main>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-2xl space-y-4">
            {withdrawSuccess ? (
              <div className="text-center py-4 space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#15803d]">
                  <CheckCircle2 className="h-6 w-6 text-[#22c55e]" />
                </div>
                <h3 className="font-primary text-lg font-bold text-[#020617]">
                  ₦420,000 Dispatched to GTBank
                </h3>
                <p className="font-secondary text-xs text-[#64748b]">
                  Payment reference NIP-49102-CBN confirmed. Funds should reflect in 5-15 minutes.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#64748b]">
                    Confirm Bank Transfer
                  </span>
                  <h3 className="font-primary text-lg font-bold text-[#020617] mt-0.5">
                    Withdraw ₦420,000 NGN
                  </h3>
                  <p className="font-secondary text-xs text-[#64748b] mt-1">
                    Funds will be settled directly to Guaranty Trust Bank (0238491029).
                  </p>
                </div>

                <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Withdrawal Amount:</span>
                    <span className="font-bold text-[#020617]">₦420,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">NIP Transfer Fee:</span>
                    <span className="text-[#15803d]">₦0 (Waived)</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-[#e2e8f0]">
                    <span>Net Received:</span>
                    <span>₦420,000</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 h-10 text-xs border-[#e2e8f0]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleExecuteWithdraw}
                    className="flex-1 h-10 text-xs font-semibold"
                  >
                    Confirm Payout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Strategy 3: Compact Utility Bar for Dashboards */}
      <DashboardUtilityBar />
    </div>
  );
}
