"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import { ReadonlyChatTranscript } from "@/components/admin/ReadonlyChatTranscript";
import { EvidenceViewer } from "@/components/admin/EvidenceViewer";
import { VerdictActionGroup } from "@/components/admin/VerdictActionGroup";
import { adminApi } from "@/lib/api";

/**
 * Screen: The Arbitration Room (Phase 6 §1)
 * Route: app/(admin)/disputes/[case_id]/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 */

export interface ArbitrationRoomPageProps {
  caseId?: string;
  onBackToDashboard?: () => void;
}

export default function ArbitrationRoomPage({
  caseId = "dsp-101",
  onBackToDashboard,
}: ArbitrationRoomPageProps) {
  const [verdictMessage, setVerdictMessage] = useState<string | null>(null);

  const handleExecuteVerdict = async (
    type: "refund_buyer" | "release_seller" | "split"
  ) => {
    const verdictMap = {
      refund_buyer: "REFUND_TO_BUYER" as const,
      release_seller: "RELEASE_TO_SELLER" as const,
      split: "SPLIT_SETTLEMENT" as const,
    };

    await adminApi.resolveDispute(caseId, {
      verdict: verdictMap[type],
      seller_split_pct: type === "split" ? 50 : type === "release_seller" ? 100 : 0,
      admin_notes: `Executed binding arbitration ruling (${verdictMap[type]}) for ${caseId}`,
    });

    if (type === "refund_buyer") {
      setVerdictMessage(
        "Ruling Executed: 100% Full Refund issued to Buyer Adeola Fashola upon return waybill receipt."
      );
    } else if (type === "release_seller") {
      setVerdictMessage(
        "Ruling Executed: Escrow funds released to Seller Chidi Tech Hub."
      );
    } else {
      setVerdictMessage(
        "Ruling Executed: 50/50 Split compromise settlement disbursed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Top Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#111113]/12">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-2">
                <Link
                  href="/admin/dashboard"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Dispute Queue</span>
                </Link>
                <span aria-hidden="true" className="text-[#111113]/25">
                  /
                </span>
                <span className="font-bold text-[#111113]">
                  Arbitration Chamber ({caseId})
                </span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                DISPUTE ADJUDICATION: IPHONE 14 PRO MAX
                <span className="text-[#FF5A25]">.</span>
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
                Order:{" "}
                <span className="font-mono font-bold text-[#111113]">
                  SP-ORD-9421
                </span>{" "}
                • Buyer: Adeola Fashola • Seller: Chidi Tech Hub • Vault
                Balance:{" "}
                <span className="font-mono font-bold text-[#111113]">
                  ₦850,000 NGN
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f56565]/15 border border-[#f56565]/30 text-[#c53030] px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                <ShieldAlert className="h-3.5 w-3.5 text-[#c53030]" />
                <span>Vault Frozen in Paystack Custody</span>
              </span>
            </div>
          </div>

          {/* Verdict Banner Feedback */}
          {verdictMessage && (
            <div className="p-4 border border-[#15803d]/40 bg-[#22c55e]/10 text-[#15803d] font-mono text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#15803d]" />
              <span>{verdictMessage}</span>
            </div>
          )}

          {/* Split Pane: Transcript (Left 6 Cols) & Evidence Viewer (Right 6 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-6">
              <ReadonlyChatTranscript />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <EvidenceViewer />
            </div>
          </div>

          {/* Verdict Action Console */}
          <VerdictActionGroup
            orderAmount={850000}
            caseId={caseId}
            onExecuteVerdict={handleExecuteVerdict}
          />
        </div>
      </main>

      {/* Strategy 2: Minimalist High-Focus Admin Wizard Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
