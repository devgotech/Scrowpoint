"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { EscrowStatusBar } from "@/components/EscrowStatusBar";
import {
  EscrowTrackerStepper,
  type EscrowState,
} from "@/components/EscrowTrackerStepper";
import {
  OrderSummaryCard,
  type EscrowOrderData,
} from "@/components/escrow/OrderSummaryCard";
import { ChatMessageList } from "@/components/escrow/ChatMessageList";
import { EvidenceUploadForm } from "@/components/escrow/EvidenceUploadForm";
import { ordersApi } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Screen 7: The Active Escrow Room & P2P Ledger (Phase 3 §1, §2, §3)
 * Route: app/(protected)/escrow/[order_id]/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4) canvas, Deep Carbon Ink (#111113), Vermilion Orange (#FF5A25)
 * - Sharp 0px architectural cards (border-[#111113]/12 bg-white)
 * - 999px pill primary CTAs (.btn-primary / rounded-full)
 * - Friendly, welcoming Trade Conversation & Milestone stream
 */

export interface EscrowRoomPageProps {
  orderId?: string;
  onNavigateHome?: () => void;
  onNavigateDisputes?: () => void;
}

export default function EscrowRoomPage({
  orderId = "sp-ord-94218a",
  onNavigateHome,
  onNavigateDisputes,
}: EscrowRoomPageProps) {
  const [currentState, setCurrentState] =
    useState<EscrowState>("inspection_period");
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isSettledModalOpen, setIsSettledModalOpen] = useState(false);
  const [liveWaybill, setLiveWaybill] = useState<string>("GIG-948102-LOS");

  useEffect(() => {
    let mounted = true;
    ordersApi.getById(orderId).then((res) => {
      if (!mounted || !res.ok || !res.data) return;
      const st = (res.data.status || "").toUpperCase();
      if (res.data.tracking_number) {
        setLiveWaybill(res.data.tracking_number);
      }
      if (st === "FUNDED") {
        setCurrentState("funds_held");
      } else if (st === "SHIPPED" || st === "IN_TRANSIT") {
        setCurrentState("in_transit");
      } else if (st === "DELIVERED" || st === "INSPECTION") {
        setCurrentState("inspection_period");
      } else if (st === "DISPUTED") {
        setCurrentState("disputed");
      } else if (st === "COMPLETED" || st === "SETTLED") {
        setCurrentState("completed");
      }
    });
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const orderData: EscrowOrderData = {
    orderId: "SP-ORD-9421",
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
    courierWaybill: liveWaybill,
    courierPartner: "GIG Logistics Express",
    inspectionRemainingSeconds: 6840, // 1h 54m left
  };

  const handleReleaseFunds = async () => {
    await ordersApi.confirmRelease(orderId, { delivery_otp: "482910" });
    setCurrentState("completed");
    setIsSettledModalOpen(true);
  };

  const handleDisputeSubmitted = () => {
    setCurrentState("disputed");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
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

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Top Breadcrumb & Interactive Stage Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#111113]/12">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em]">
              <Link
                href="/marketplace"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Marketplace</span>
              </Link>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="font-bold text-[#111113]">
                Active Escrow Room ({orderData.orderId})
              </span>
            </div>

            {/* Interactive Stage Selector */}
            <div className="flex items-center gap-1 bg-white border border-[#111113]/12 p-1 self-start sm:self-auto overflow-x-auto max-w-full">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#111113]/55 px-2.5">
                Preview Stage:
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
                    "px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
                    currentState === s.id
                      ? "bg-[#111113] text-white font-bold"
                      : "text-[#111113]/65 hover:text-[#111113] hover:bg-[#F8F7F4]"
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
              <div className="border border-[#111113]/12 bg-white p-6 space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#111113]/12">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center bg-[#111113] text-white">
                      <Scale className="h-4 w-4 text-[#FF5A25]" />
                    </div>
                    <div>
                      <span className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113] block">
                        Buyer Decision Desk
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/60">
                        48-Hour Home Inspection Decision
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#15803d]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
                    <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                    <span>Protected</span>
                  </span>
                </div>

                {currentState === "completed" ? (
                  <div className="border border-[#15803d]/30 bg-[#22c55e]/10 p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#15803d]">
                      <CheckCircle2 className="h-4 w-4 text-[#15803d]" />
                      <span>Escrow Trade Successfully Settled</span>
                    </div>
                    <p className="font-secondary text-xs text-[#111113]/80">
                      <span className="font-mono font-bold">₦850,000</span> has
                      been disbursed directly to Chidi Gadgets&apos; verified
                      bank account.
                    </p>
                  </div>
                ) : currentState === "disputed" ? (
                  <div className="border border-[#f56565]/40 bg-[#f56565]/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#c53030]">
                      <ShieldAlert className="h-4 w-4 text-[#c53030]" />
                      <span>Dispute Active — Funds Safely Frozen</span>
                    </div>
                    <p className="font-secondary text-xs text-[#111113]/80 leading-relaxed">
                      Your <span className="font-mono font-bold">₦875,750</span>{" "}
                      deposit is safely locked in Paystack custody while our
                      mediation specialist reviews the inspection evidence.
                    </p>
                    <button
                      type="button"
                      onClick={onNavigateDisputes}
                      className="w-full h-10 border border-[#c53030] bg-white text-xs font-mono uppercase tracking-wider font-bold text-[#c53030] hover:bg-[#c53030] hover:text-white transition-colors"
                    >
                      View Arbitration Case File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Primary Pill CTA: Approve & Release Funds */}
                    <div>
                      <button
                        type="button"
                        onClick={handleReleaseFunds}
                        className="btn-primary w-full h-12 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                        <span>Everything Works — Approve Payout</span>
                      </button>
                      <p className="font-secondary text-[11px] text-[#111113]/65 text-center mt-2">
                        Releases{" "}
                        <span className="font-mono font-bold text-[#111113]">
                          ₦850,000
                        </span>{" "}
                        to {orderData.sellerName.replace(" (Seller)", "")}{" "}
                        instantly.
                      </p>
                    </div>

                    {/* Secondary Warning Button: Report Hardware Issue */}
                    <div className="pt-2 border-t border-[#111113]/10">
                      <button
                        type="button"
                        onClick={() => setIsDisputeModalOpen(true)}
                        className="w-full h-11 border border-[#ecc94b] bg-[#ecc94b]/15 hover:bg-[#ecc94b]/25 text-[#975a16] text-xs font-mono uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4 text-[#975a16]" />
                        <span>Something&apos;s Wrong — Pause &amp; Report</span>
                      </button>
                      <p className="font-secondary text-[11px] text-[#111113]/60 text-center mt-1.5">
                        Pauses the 48-hour timer and keeps your money locked
                        until resolved.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===============================================================
                RIGHT COLUMN: FRIENDLY P2P TRADE CONVERSATION (7 Cols)
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111113]/75 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md border border-[#111113] bg-white p-6 sm:p-8 text-center space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#15803d]/10 border border-[#15803d]/25 text-[#15803d]">
              <CheckCircle2 className="h-6 w-6 text-[#15803d]" />
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center rounded-full bg-[#15803d]/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#15803d]">
                Escrow Settlement Complete
              </span>
              <h3 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                Payout Disbursed<span className="text-[#FF5A25]">.</span>
              </h3>
            </div>
            <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 leading-relaxed">
              You confirmed the device passed your home inspection.{" "}
              <span className="font-mono font-bold text-[#111113]">
                ₦850,000
              </span>{" "}
              has been transferred to {orderData.sellerName}. Your warranty
              receipt has been emailed to you.
            </p>
            <button
              type="button"
              onClick={() => setIsSettledModalOpen(false)}
              className="btn-primary w-full h-11 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Strategy 3: Compact Utility Bar for Active Escrow Workspace */}
      <DashboardUtilityBar />
    </div>
  );
}
