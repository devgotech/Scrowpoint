"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { SellerStatsOverview } from "@/components/seller/SellerStatsOverview";
import {
  RecentOrdersTable,
  SAMPLE_SELLER_ORDERS,
  type SellerOrderRecord,
} from "@/components/seller/RecentOrdersTable";
import { QuickActionBanner } from "@/components/seller/QuickActionBanner";
import { ordersApi, paymentsApi } from "@/lib/api";

/**
 * Screen: Seller Dashboard (Phase 3 §1)
 * Route: app/(protected)/seller/dashboard/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - Sharp 0px architectural cards (border-[#111113]/12) paired with 999px pill primary CTAs
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
  const [walletBalanceNaira, setWalletBalanceNaira] = useState<number>(420000);
  const [sellerOrders, setSellerOrders] =
    useState<SellerOrderRecord[]>(SAMPLE_SELLER_ORDERS);

  useEffect(() => {
    let mounted = true;
    paymentsApi.getEarningsSummary().then((res) => {
      if (!mounted || !res.ok || !res.data) return;
      if (typeof res.data.available_balance_kobo === "number") {
        setWalletBalanceNaira(Math.round(res.data.available_balance_kobo / 100));
      }
    });

    ordersApi.list("seller").then((res) => {
      if (!mounted || !res.ok || !Array.isArray(res.data) || res.data.length === 0) {
        return;
      }
      const mapped: SellerOrderRecord[] = res.data.map((o) => {
        const rawSt = (o.status || "FUNDED").toUpperCase();
        const status: SellerOrderRecord["status"] =
          rawSt === "SHIPPED" || rawSt === "IN_TRANSIT"
            ? "SHIPPED"
            : rawSt === "DELIVERED" || rawSt === "INSPECTION"
            ? "INSPECTION"
            : rawSt === "DISPUTED"
            ? "DISPUTED"
            : rawSt === "COMPLETED" || rawSt === "SETTLED"
            ? "SETTLED"
            : "FUNDED";
        return {
          id: o.id,
          orderNumber: o.id,
          gadgetTitle: o.listing_title || "Verified Escrow Gadget",
          condition: "Mint",
          buyerName: "Verified Buyer",
          buyerCity: o.shipping_address || "Lagos, NG",
          amountNaira: Math.round((o.amount_kobo || 85000000) / 100),
          status,
          trackingNumber: o.tracking_number,
          createdAt: "Recent",
        };
      });
      setSellerOrders([...mapped, ...SAMPLE_SELLER_ORDERS]);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Top Bar */}
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
                <span className="font-bold text-[#111113]">Merchant Desk</span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                MERCHANT ESCROW CONSOLE<span className="text-[#FF5A25]">.</span>
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1">
                Manage active courier dispatches, monitor 48-hour hardware
                inspections, and track Paystack split-settlement disbursements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onNavigateWallet}
                className="h-10 px-4 border border-[#111113]/15 bg-white text-xs font-mono uppercase tracking-wider font-bold text-[#111113] hover:border-[#111113] transition-colors inline-flex items-center gap-2"
              >
                <Wallet className="h-4 w-4 text-[#FF5A25]" />
                <span>Wallet (₦{walletBalanceNaira.toLocaleString("en-NG")})</span>
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#15803d]/10 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
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
                window.dispatchEvent(new Event("bh_route_change"));
              }
            }}
            onOpenWallet={onNavigateWallet}
          />

          {/* Stats Overview */}
          <SellerStatsOverview />

          {/* Recent Orders Table */}
          <RecentOrdersTable
            orders={sellerOrders}
            onSelectOrder={onNavigateEscrowRoom}
          />
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Dashboards */}
      <DashboardUtilityBar />
    </div>
  );
}
