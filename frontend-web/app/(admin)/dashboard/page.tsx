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
import { KYCManualApprovalQueue } from "@/components/admin/KYCManualApprovalQueue";
import { adminApi } from "@/lib/api";

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
  const [kycActionNotice, setKycActionNotice] = useState<string | null>(null);
  const [disputeCases, setDisputeCases] =
    useState<DisputeQueueRecord[]>(SAMPLE_DISPUTE_QUEUE);

  useEffect(() => {
    let mounted = true;
    adminApi.listDisputes().then((res) => {
      if (!mounted || !res.ok || !Array.isArray(res.data) || res.data.length === 0) {
        return;
      }
      const mapped: DisputeQueueRecord[] = res.data.map((d) => ({
        id: d.id,
        orderNumber: d.order_id,
        gadgetTitle: "Escrow Disputed Device",
        buyerName: "Verified Buyer",
        sellerName: "Verified Merchant",
        lockedAmountNaira: 850000,
        reason: d.description || d.reason,
        slaRemaining: "04h 00m",
        isUrgent: true,
        status: "MEDIATION",
      }));
      setDisputeCases([...mapped, ...SAMPLE_DISPUTE_QUEUE]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleReviewKyc = async (id: string, decision: "APPROVE" | "REJECT") => {
    await adminApi.reviewKYC(id, {
      decision,
      reason:
        decision === "APPROVE"
          ? "Cleared by Senior Compliance Officer"
          : "Document glare / biometric recapture required",
    });
    if (decision === "APPROVE") {
      setKycActionNotice(`Approved SmileID KYC record for ${id}`);
    } else {
      setKycActionNotice(`Flagged KYC record ${id} for biometric recapture`);
    }
  };

  const handleSelectCase = (caseId: string) => {
    if (onSelectCase) {
      onSelectCase(caseId);
      return;
    }
    router.push(`/admin/disputes/${encodeURIComponent(caseId)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#111113]/12">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-2">
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
                  Admin Moderation
                </span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                SENIOR MEDIATION &amp; COMPLIANCE DESK
                <span className="text-[#FF5A25]">.</span>
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
                Execute binding arbitration, review 48-hour diagnostic disputes,
                and clear manual SmileID identity verifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111113] text-white px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                <Scale className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>Arbitration Officers Active</span>
              </span>
            </div>
          </div>

          {kycActionNotice && (
            <div className="border border-[#15803d]/30 bg-[#22c55e]/10 p-4 flex items-center justify-between text-xs font-mono text-[#15803d] font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#15803d]" />
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

          {/* KYC Manual Review Queue */}
          <KYCManualApprovalQueue
            onApprove={(id) => handleReviewKyc(id, "APPROVE")}
            onReject={(id) => handleReviewKyc(id, "REJECT")}
          />
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Admin Operations */}
      <DashboardUtilityBar />
    </div>
  );
}
