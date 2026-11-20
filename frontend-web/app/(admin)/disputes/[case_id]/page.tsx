"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import { ReadonlyChatTranscript } from "@/components/admin/ReadonlyChatTranscript";
import { EvidenceViewer } from "@/components/admin/EvidenceViewer";
import { VerdictActionGroup } from "@/components/admin/VerdictActionGroup";
import { CaseAssignmentPanel } from "@/components/admin/CaseAssignmentPanel";
import { adminApi, type AdminDisputeEvidenceResponseDTO } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";

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
  caseId: providedCaseId,
  onBackToDashboard,
}: ArbitrationRoomPageProps) {
  const routeParams = useParams<{ case_id?: string }>();
  const caseId = providedCaseId ?? routeParams.case_id ?? "dsp-101";
  const { isAdmin } = useAuth();
  const [verdictMessage, setVerdictMessage] = useState<string | null>(null);
  const [verdictError, setVerdictError] = useState<string | null>(null);
  const [evidenceState, setEvidenceState] = useState<{
    caseId: string;
    data: AdminDisputeEvidenceResponseDTO | null;
    error: string | null;
  }>({ caseId: "", data: null, error: null });

  useEffect(() => {
    let active = true;
    adminApi.getDisputeEvidence(caseId).then((result) => {
      if (!active) return;
      if (!result.ok || !result.data) {
        setEvidenceState({
          caseId,
          data: null,
          error: result.error || "Could not load dispute evidence.",
        });
      } else {
        setEvidenceState({ caseId, data: result.data, error: null });
      }
    });
    return () => {
      active = false;
    };
  }, [caseId]);

  const isEvidenceLoading = evidenceState.caseId !== caseId;
  const evidenceError =
    evidenceState.caseId === caseId ? evidenceState.error : null;
  const disputeEvidence =
    evidenceState.caseId === caseId ? evidenceState.data : null;
  const evidenceAssets = disputeEvidence?.evidence.map((item, index) => ({
    id: item.id,
    title: `Submitted ${item.evidenceType} ${index + 1}`,
    source: "buyer" as const,
    type: item.evidenceType === "video" ? "video" as const : "photo" as const,
    url: item.downloadUrl,
    notes: item.description || "No additional description provided.",
  }));

  const handleExecuteVerdict = async (
    type: "refund_buyer" | "release_seller" | "split"
  ) => {
    const outcomeMap = {
      refund_buyer: "refund_buyer" as const,
      release_seller: "release_to_seller" as const,
      split: "split" as const,
    };

    setVerdictError(null);
    const result = await adminApi.resolveDispute(caseId, {
      outcome: outcomeMap[type],
      notes: `Executed binding arbitration ruling (${outcomeMap[type]}) for ${caseId}`,
    });
    if (!result.ok) {
      setVerdictMessage(null);
      setVerdictError(
        result.status === 403
          ? "You can only rule on cases assigned to you, and never on a trade you are part of."
          : result.error || "The ruling could not be executed."
      );
      return;
    }

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
    <div className="min-h-screen bg-paper text-ink flex flex-col font-secondary antialiased selection:bg-accent-orange selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Top Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-ink-faint">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-2">
                <Link
                  href="/admin/dashboard"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1.5 text-ink/65 hover:text-accent-orange transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Dispute Queue</span>
                </Link>
                <span aria-hidden="true" className="text-ink/25">
                  /
                </span>
                <span className="font-bold text-ink">
                  Arbitration Chamber ({caseId})
                </span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-ink uppercase">
                DISPUTE ADJUDICATION: IPHONE 14 PRO MAX
                <span className="text-accent-orange">.</span>
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-ink/70 mt-1">
                Order:{" "}
                <span className="font-mono font-bold text-ink">
                  SP-ORD-9421
                </span>{" "}
                • Buyer: Adeola Fashola • Seller: Chidi Tech Hub • Vault
                Balance:{" "}
                <span className="font-mono font-bold text-ink">
                  ₦850,000 NGN
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-state-error/15 border border-state-error/30 text-state-error-strong px-3.5 py-1.5 font-mono text-caption font-bold uppercase tracking-wider">
                <ShieldAlert className="h-3.5 w-3.5 text-state-error-strong" />
                <span>Vault Frozen in Paystack Custody</span>
              </span>
            </div>
          </div>

          {/* Verdict Banner Feedback */}
          {verdictMessage && (
            <div className="p-4 border border-trust-strong/40 bg-trust/10 text-trust-strong font-mono text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-trust-strong" />
              <span>{verdictMessage}</span>
            </div>
          )}
          {verdictError && (
            <div role="alert" className="p-4 border border-state-error/40 bg-state-error/10 text-state-error-strong font-mono text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-state-error-strong" />
              <span>{verdictError}</span>
            </div>
          )}

          {/* Split Pane: Transcript (Left 6 Cols) & Evidence Viewer (Right 6 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-6">
              <ReadonlyChatTranscript />
              {isAdmin && <CaseAssignmentPanel caseId={caseId} />}
            </div>

            <div className="lg:col-span-6 space-y-6">
              <EvidenceViewer
                evidence={evidenceAssets ?? []}
                isLoading={isEvidenceLoading}
                error={evidenceError}
              />
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
