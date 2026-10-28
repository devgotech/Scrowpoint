"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";

/**
 * Screen: Global Notifications Center (Phase 5 §2)
 * Route: app/(protected)/notifications/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[920px] px-4 sm:px-8 space-y-8">
          <div className="pb-6 border-b border-[#111113]/12">
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
              <span className="font-bold text-[#111113]">Notifications</span>
            </div>
            <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
              ESCROW &amp; SECURITY ALERTS
              <span className="text-[#FF5A25]">.</span>
            </h1>
            <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
              Live updates on custodial deposit locks, courier transit
              milestones, and 48-hour hardware diagnostic countdowns.
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
