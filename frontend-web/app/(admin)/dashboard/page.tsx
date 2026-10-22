"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, IdCard, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DisputeQueueDataTable } from "@/components/admin/DisputeQueueDataTable";
import { KYCManualApprovalQueue } from "@/components/admin/KYCManualApprovalQueue";

/**
 * Screen: Dispute Triage & Pending KYC (Phase 6 §2)
 * Route: app/(admin)/dashboard/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: DisputeQueueDataTable, KYCManualApprovalQueue.
 * - Architecture Link: Sorts high-value and overdue cases automatically based on Postgres timestamp and price fields.
 */

export interface AdminDashboardPageProps {
  onSelectCase?: (caseId: string) => void;
  onNavigateHome?: () => void;
}

export default function AdminDashboardPage({
  onSelectCase,
  onNavigateHome,
}: AdminDashboardPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
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
                  Admin Moderation
                </span>
              </div>
              <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                Senior Mediation & Compliance Desk
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
                Execute binding arbitration, review 48-hour diagnostic disputes, and clear manual identity verifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-[#0f172a] text-white px-3 py-1.5 rounded-[4px] font-bold flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-[#22c55e]" />
                <span>Arbitration Officers Active</span>
              </span>
            </div>
          </div>

          {/* Dispute Queue */}
          <DisputeQueueDataTable onSelectCase={onSelectCase} />

          {/* KYC Manual Review Queue */}
          <KYCManualApprovalQueue
            onApprove={(id) => alert(`Approved KYC for ${id}`)}
            onReject={(id) => alert(`Rejected KYC for ${id}`)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
