"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import { ReadonlyChatTranscript } from "@/components/admin/ReadonlyChatTranscript";
import { EvidenceViewer } from "@/components/admin/EvidenceViewer";
import { VerdictActionGroup } from "@/components/admin/VerdictActionGroup";
import { Button } from "@/components/ui/button";

/**
 * Screen: The Arbitration Room (Phase 6 §1)
 * Route: app/(admin)/disputes/[case_id]/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: ReadonlyChatTranscript, EvidenceViewer (Split-pane layout), VerdictActionGroup.
 * - Architecture Link: Pulls immutable chat history from Go DB and media from Python S3. Processes financial refunds or payouts.
 * - Responsive: Split-pane 2-column on desktop, stacked on mobile.
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

  const handleExecuteVerdict = (type: "refund_buyer" | "release_seller" | "split") => {
    if (type === "refund_buyer") {
      setVerdictMessage("Ruling Executed: 100% Full Refund issued to Buyer Adeola Fashola upon return waybill receipt.");
    } else if (type === "release_seller") {
      setVerdictMessage("Ruling Executed: Escrow funds released to Seller Chidi Tech Hub.");
    } else {
      setVerdictMessage("Ruling Executed: 50/50 Split compromise settlement disbursed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/admin/dashboard"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Dispute Queue</span>
                </Link>
                <span className="text-[#64748b] text-xs">/</span>
                <span className="font-mono text-xs font-semibold text-[#0f172a]">
                  Arbitration Chamber ({caseId})
                </span>
              </div>
              <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                Dispute Adjudication: iPhone 14 Pro Max (BH-ORD-9421)
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
                Buyer: Adeola Fashola • Seller: Chidi Tech Hub • Vault Balance: ₦850,000 NGN
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-[#f56565]/15 text-[#c53030] border border-[#f56565]/30 px-3 py-1.5 rounded-[4px] font-bold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-[#f56565]" />
                <span>Vault Frozen in Paystack Custody</span>
              </span>
            </div>
          </div>

          {/* Verdict Banner Feedback */}
          {verdictMessage && (
            <div className="p-4 rounded-[4px] border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#15803d] font-mono text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
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
