"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ShieldCheck, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { SellerStatsOverview } from "@/components/seller/SellerStatsOverview";
import { RecentOrdersTable } from "@/components/seller/RecentOrdersTable";
import { QuickActionBanner } from "@/components/seller/QuickActionBanner";
import { Button } from "@/components/ui/button";

/**
 * Screen: Seller Dashboard (Phase 3 §1)
 * Route: app/(protected)/seller/dashboard/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: SellerStatsOverview, RecentOrdersTable, QuickActionBanner.
 * - Architecture Link: Aggregates metrics from Postgres orders and listings tables.
 * - Responsive: Desktop 1280px container, smooth stacking on tablet/mobile.
 */

export interface SellerDashboardPageProps {
  onNavigateHome?: () => void;
  onNavigateEscrowRoom?: (orderNumber: string) => void;
  onNavigateWallet?: () => void;
}

export default function SellerDashboardPage({
  onNavigateHome,
  onNavigateEscrowRoom,
  onNavigateWallet,
}: SellerDashboardPageProps) {
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
                  href="/"
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Marketplace</span>
                </Link>
                <span className="text-[#64748b] text-xs">/</span>
                <span className="font-mono text-xs font-semibold text-[#0f172a]">
                  Seller Portal
                </span>
              </div>
              <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                Merchant Trade & Escrow Console
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
                Manage active deliveries, review 48-hour hardware inspections, and monitor vault disbursements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateWallet}
                className="h-10 px-4 rounded-[4px] border-[#e2e8f0] bg-white text-xs font-mono font-semibold gap-2"
              >
                <Wallet className="h-4 w-4 text-[#0f172a]" />
                <span>Wallet (₦420,000)</span>
              </Button>

              <div className="flex items-center gap-1.5 bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1.5 rounded-[4px] font-mono text-xs font-bold text-[#15803d]">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>SmileID Verified Merchant</span>
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <QuickActionBanner
            onNewListing={() => {
              if (typeof window !== "undefined") {
                window.history.pushState({}, "", "/seller/post-gadget");
                window.dispatchEvent(new Event("sp_route_change"));
              }
            }}
            onOpenWallet={onNavigateWallet}
          />

          {/* Stats Overview */}
          <SellerStatsOverview />

          {/* Recent Orders Table */}
          <RecentOrdersTable onSelectOrder={onNavigateEscrowRoom} />
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Dashboards */}
      <DashboardUtilityBar />
    </div>
  );
}
