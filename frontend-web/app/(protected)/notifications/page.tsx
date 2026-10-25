"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Bell, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";

/**
 * Screen: Global Notifications Center (Phase 5 §2)
 * Route: app/(protected)/notifications/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: NotificationFeed, UnreadBadge.
 * - Architecture Link: Real-time push via Go WebSockets for escrow state changes & P2P alerts.
 */

export interface NotificationsPageProps {
  onNavigateHome?: () => void;
  onNavigateOrder?: (orderNumber: string) => void;
}

export default function NotificationsPage({
  onNavigateHome,
  onNavigateOrder,
}: NotificationsPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="pb-4 border-b border-[#e2e8f0]">
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
                Notifications
              </span>
            </div>
            <h1 className="font-primary text-2xl font-bold tracking-tight text-[#020617]">
              Escrow & Security Alerts
            </h1>
            <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
              Live updates on escrow lock events, courier transit milestones, and 48-hour hardware diagnostic countdowns.
            </p>
          </div>

          <NotificationFeed
            onSelectNotification={(n) => {
              if (n.orderNumber && onNavigateOrder) {
                onNavigateOrder(n.orderNumber);
              }
            }}
          />
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Feed/Notification Workspace */}
      <DashboardUtilityBar />
    </div>
  );
}
