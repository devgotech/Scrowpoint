"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  PhoneOff,
  RotateCcw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  User,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { EscrowStatusBar } from "@/components/EscrowStatusBar";
import { EscrowTrackerStepper, type EscrowState } from "@/components/EscrowTrackerStepper";
import { OrderSummaryCard, type EscrowOrderData } from "@/components/escrow/OrderSummaryCard";
import { ChatMessageList } from "@/components/escrow/ChatMessageList";
import { EvidenceUploadForm } from "@/components/escrow/EvidenceUploadForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Screen 7: The Active Escrow Room & P2P Ledger (Phase 3 §1, §2, §3)
 * Route: app/(protected)/escrow/[order_id]/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: EscrowTrackerStepper (5-step timeline), EscrowStatusBar (Locked at top),
 *   OrderSummaryCard, ChatMessageList (Bybit-style ledger with regex contact masking),
 *   SystemMilestoneBubble, EvidenceUploadForm.
 * - Action Engine:
 *   - ReleaseFundsButton (Trust Green #22c55e / #15803d)
 *   - ReportIssueButton (Warning Amber #ecc94b / #975a16)
 * - Dispute State: Freezes Escrow Room & Chat into READ-ONLY mode, triggers arbitration.
 * - Responsive: Desktop dual-column, mobile stacked layout with touch-friendly 44px buttons.
 */

export interface EscrowRoomPageProps {
  orderId?: string;
  onNavigateHome?: () => void;
  onNavigateDisputes?: () => void;
}

export default function EscrowRoomPage({
  orderId = "bh-ord-94218a",
  onNavigateHome,
  onNavigateDisputes,
}: EscrowRoomPageProps) {
  // Escrow state management
  const [currentState, setCurrentState] = useState<EscrowState>("inspection_period");
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isSettledModalOpen, setIsSettledModalOpen] = useState(false);

  const orderData: EscrowOrderData = {
    orderId: "BH-ORD-9421",
    gadgetId: "g-001",
    gadgetTitle: "Apple iPhone 14 Pro Max 256GB Deep Purple",
    gadgetImage:
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80",
    condition: "mint",
    amount: 850000,
    escrowFee: 21250, // 2.5%
    logisticsFee: 4500,
    totalDeposit: 875750,
    buyerName: "Adeola (Buyer)",
    sellerName: "Chidi Gadgets (Seller)",
    status:
      currentState === "disputed"
        ? "DISPUTED"
        : currentState === "completed"
        ? "SETTLED"
        : currentState === "in_transit"
        ? "SHIPPED"
        : "DELIVERED",
    courierWaybill: "GIG-948102-LOS",
    courierPartner: "GIG Logistics Express",
    inspectionRemainingSeconds: 6840, // 1h 54m left
  };

  const handleReleaseFunds = () => {
    setCurrentState("completed");
    setIsSettledModalOpen(true);
  };

  const handleDisputeSubmitted = (disputeDetails: {
    category: string;
    description: string;
    evidenceCount: number;
  }) => {
    setCurrentState("disputed");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* 2. Micro Escrow Status Bar Locked to Viewport Top */}
      <EscrowStatusBar
        orderId={orderId}
        orderShortId={orderData.orderId}
        state={
          currentState === "disputed"
            ? "DISPUTED"
            : currentState === "funds_held"
            ? "FUNDS_HELD"
            : currentState === "in_transit"
            ? "IN_TRANSIT"
            : "INSPECTION_PERIOD"
        }
        initialSecondsRemaining={6840}
        itemTitle={orderData.gadgetTitle}
      />

      <main className="flex-1 w-full py-6 sm:py-8">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Breadcrumb & Interactive Stage Switcher for Reviewing Architecture */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Marketplace</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a]">
                Active Escrow Room ({orderData.orderId})
              </span>
            </div>

            {/* Stage Selector for Reviewing Go Backend WebSocket Transitions */}
            <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] p-1 rounded-[4px] self-start sm:self-auto overflow-x-auto max-w-full">
              <span className="font-mono text-[10px] uppercase font-bold text-[#64748b] px-2">
                Simulate State:
              </span>
              {(
                [
                  { id: "funds_held", label: "Funded" },
                  { id: "in_transit", label: "Shipped" },
                  { id: "inspection_period", label: "48H Inspection" },
                  { id: "disputed", label: "Disputed" },
                  { id: "completed", label: "Settled" },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentState(s.id as EscrowState)}
                  className={cn(
                    "px-2.5 py-1 rounded-[2px] text-xs font-mono font-medium transition-all duration-200 ease-out whitespace-nowrap",
                    currentState === s.id
                      ? "bg-[#0f172a] text-white shadow-2xs"
                      : "text-[#64748b] hover:text-[#020617] hover:bg-[#f8fafc]"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Escrow Tracker Stepper (5-step timeline) */}
          <EscrowTrackerStepper
            currentState={currentState}
            trackingNumber={orderData.courierWaybill}
            orderNumber={orderData.orderId}
          />

          {/* 4. Active Escrow Room Workspace: Dual Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ===============================================================
                LEFT COLUMN: ORDER SNAPSHOT & ACTION ENGINE (5 Cols)
                =============================================================== */}
            <div className="lg:col-span-5 space-y-6">
              {/* Order Summary Card */}
              <OrderSummaryCard order={orderData} />

              {/* Action Engine: Release Funds or Report Issue */}
              <div className="rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
                      <Scale className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-primary text-xs font-bold text-[#020617]">
                      Escrow Action Engine
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748b]">
                    Buyer Authorization
                  </span>
                </div>

                {currentState === "completed" ? (
                  <div className="rounded-[4px] border border-[#22c55e]/40 bg-[#22c55e]/10 p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#15803d]">
                      <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                      <span>Escrow Trade Successfully Settled</span>
                    </div>
                    <p className="font-secondary text-xs text-[#15803d]/90">
                      ₦850,000 has been disbursed to the seller's verified bank account.
                    </p>
                  </div>
                ) : currentState === "disputed" ? (
                  <div className="rounded-[4px] border border-[#f56565]/40 bg-[#f56565]/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#c53030]">
                      <ShieldAlert className="h-4 w-4 text-[#f56565]" />
                      <span>Dispute Active — Funds Locked</span>
                    </div>
                    <p className="font-secondary text-xs text-[#7f1d1d] leading-relaxed">
                      Escrow vault funds are frozen in Paystack custody. A Senior Mediation Officer has been assigned and is reviewing the submitted evidence.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateDisputes}
                      className="w-full h-9 text-xs font-mono border-[#f56565]/40 text-[#c53030] hover:bg-[#f56565]/10"
                    >
                      <span>View Arbitration Case File</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Primary Button: Release Funds (Trust Green) */}
                    <div>
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleReleaseFunds}
                        className="w-full h-12 text-xs font-bold gap-2 bg-[#15803d] hover:bg-[#166534] text-white shadow-xs"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>I Have Inspected & Approve Payout</span>
                      </Button>
                      <p className="font-secondary text-[11px] text-[#64748b] text-center mt-1.5">
                        Immediately settles ₦850,000 to seller. Irreversible once confirmed.
                      </p>
                    </div>

                    {/* Secondary Button: Report Issue (Warning Amber) */}
                    <div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="w-full h-11 text-xs font-bold gap-2 border-[#ecc94b] bg-[#ecc94b]/15 text-[#975a16] hover:bg-[#ecc94b]/25 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4 text-[#ecc94b]" />
                        <span>Report Hardware Issue / Defect</span>
                      </Button>
                      <p className="font-secondary text-[11px] text-[#64748b] text-center mt-1.5">
                        Freezes escrow vault and opens dispute investigation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===============================================================
                RIGHT COLUMN: BYBIT-STYLE P2P CHAT LEDGER (7 Cols)
                =============================================================== */}
            <div className="lg:col-span-7">
              <ChatMessageList
                orderId={orderData.orderId}
                isDisputed={currentState === "disputed"}
                buyerName={orderData.buyerName}
                sellerName={orderData.sellerName}
                onOpenEvidenceModal={() => setIsDisputeModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Dispute Modal */}
      <EvidenceUploadForm
        orderId={orderData.orderId}
        orderAmount={orderData.amount}
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSubmitDispute={handleDisputeSubmitted}
      />

      {/* Success Payout Modal */}
      {isSettledModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-[8px] border border-[#22c55e]/40 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#22c55e]/15 text-[#15803d]">
              <CheckCircle2 className="h-6 w-6 text-[#22c55e]" />
            </div>
            <h3 className="font-primary text-xl font-bold text-[#020617]">
              Escrow Payout Disbursed
            </h3>
            <p className="font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed">
              You confirmed the device passed hardware inspection. ₦850,000 has been sent to {orderData.sellerName}. An immutable financial receipt has been emailed to you.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => setIsSettledModalOpen(false)}
              className="w-full h-11 text-xs font-semibold"
            >
              Close Confirmation
            </Button>
          </div>
        </div>
      )}

      {/* Strategy 3: Compact Utility Bar for Active Escrow Workspace */}
      <DashboardUtilityBar />
    </div>
  );
}
