"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Scale } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import {
  DisputeQueueDataTable,
  SAMPLE_DISPUTE_QUEUE,
  type DisputeQueueRecord,
} from "@/components/admin/DisputeQueueDataTable";
import {
  KYCManualApprovalQueue,
  SAMPLE_PENDING_KYC,
  type PendingKYCRecord,
} from "@/components/admin/KYCManualApprovalQueue";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";
import { MediatorInvitationPanel } from "@/components/admin/MediatorInvitationPanel";
import { StaffManagementPanel } from "@/components/admin/StaffManagementPanel";

/**
 * Screen: Dispute Triage & Pending KYC (Phase 6 §2)
 * Route: app/(admin)/dashboard/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 */

export interface AdminDashboardPageProps {
  onSelectCase?: (caseId: string) => void;
  onNavigateHome?: () => void;
}

export default function AdminDashboardPage({
  onSelectCase,
  onNavigateHome,
}: AdminDashboardPageProps) {
  const router = useRouter();
  const { isAdmin, isMediator } = useAuth();
  const [kycActionNotice, setKycActionNotice] = useState<string | null>(null);
  const [disputeCases, setDisputeCases] = useState<DisputeQueueRecord[]>([]);
  const [pendingKyc, setPendingKyc] = useState<PendingKYCRecord[] | null>(null);

  // Sample rows appear only when the backend is unreachable (offline previews).
  // A real response, even an empty one, always wins: mediators only receive
  // their assigned cases, and admins must never act on placeholder records.
  useEffect(() => {
    let mounted = true;
    adminApi.listDisputes().then((res) => {
      if (!mounted) return;
      const items = res.data?.items;
      if (!res.ok || !Array.isArray(items)) {
        if (res.status === 0) setDisputeCases(SAMPLE_DISPUTE_QUEUE);
        return;
      }
      const mapped: DisputeQueueRecord[] = items.map((d) => ({
        id: d.id,
        orderNumber: d.orderId,
        gadgetTitle: "Escrow Disputed Device",
        buyerName: "Verified Buyer",
        sellerName: "Verified Merchant",
        lockedAmountNaira: 850000,
        reason: d.mediatorNotes || d.issueType,
        slaRemaining: "04h 00m",
        isUrgent: true,
        status: "MEDIATION",
      }));
      setDisputeCases(mapped);
    });
    if (isAdmin) {
      adminApi.listPendingKYC().then((res) => {
        if (!mounted) return;
        if (!res.ok || !Array.isArray(res.data)) {
          setPendingKyc(res.status === 0 ? SAMPLE_PENDING_KYC : []);
          return;
        }
        setPendingKyc(
          res.data.map((review) => ({
            id: review.id,
            userName: review.fullName || review.email,
            userEmail: review.email,
            docType: review.idType || "Identity document",
            submittedAt: new Date(review.submittedAt).toLocaleString("en-NG"),
          }))
        );
      });
    }
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const handleReviewKyc = async (id: string, decision: "APPROVE" | "REJECT") => {
    const record = pendingKyc?.find((item) => item.id === id);
    const who = record?.userName ?? "this applicant";
    const result = await adminApi.reviewKYC(id, {
      decision,
      reason:
        decision === "APPROVE"
          ? "Cleared by Senior Compliance Officer"
          : "Document glare / biometric recapture required",
    });
    if (!result.ok) {
      setKycActionNotice(`Could not record the decision for ${who}: ${result.error || "request failed"}`);
      return;
    }
    setKycActionNotice(
      decision === "APPROVE"
        ? `Approved identity verification for ${who}.`
        : `Rejected identity verification for ${who}; they will need to resubmit.`
    );
  };

  const handleSelectCase = (caseId: string) => {
    if (onSelectCase) {
      onSelectCase(caseId);
      return;
    }
    router.push(`/admin/disputes/${encodeURIComponent(caseId)}`);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-secondary antialiased selection:bg-accent-orange selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-ink-faint">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-2">
                <Link
                  href="/marketplace"
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-1.5 text-ink/65 hover:text-accent-orange transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Marketplace</span>
                </Link>
                <span aria-hidden="true" className="text-ink/25">
                  /
                </span>
                <span className="font-bold text-ink">
                  Admin Moderation
                </span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-ink uppercase">
                {isMediator
                  ? "MEDIATION DESK"
                  : "SENIOR MEDIATION & COMPLIANCE DESK"}
                <span className="text-accent-orange">.</span>
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-ink/70 mt-1">
                {isMediator
                  ? "Review evidence and resolve assigned customer disputes."
                  : "Execute binding arbitration, review disputes, and clear manual SmileID identity verifications."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-4 py-1.5 font-mono text-caption font-bold uppercase tracking-wider">
                <Scale className="h-3.5 w-3.5 text-trust" />
                <span>Arbitration Officers Active</span>
              </span>
            </div>
          </div>

          {kycActionNotice && (
            <div className="border border-trust-strong/30 bg-trust/10 p-4 flex items-center justify-between text-xs font-mono text-trust-strong font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-trust-strong" />
                <span>{kycActionNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setKycActionNotice(null)}
                className="uppercase tracking-wider underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Dispute Queue */}
          <DisputeQueueDataTable
            cases={disputeCases}
            onSelectCase={handleSelectCase}
          />

          {isAdmin && <MediatorInvitationPanel />}

          {isAdmin && <StaffManagementPanel />}

          {isAdmin && (
            <KYCManualApprovalQueue
              key={pendingKyc === null ? "loading" : "loaded"}
              items={pendingKyc ?? []}
              onApprove={(id) => handleReviewKyc(id, "APPROVE")}
              onReject={(id) => handleReviewKyc(id, "REJECT")}
            />
          )}
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Admin Operations */}
      <DashboardUtilityBar />
    </div>
  );
}
