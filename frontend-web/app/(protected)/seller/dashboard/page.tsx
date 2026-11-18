"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
 * - Sharp 0px architectural cards (border-ink-faint) paired with 999px pill primary CTAs
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
  const router = useRouter();
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

  const handleNavigateWallet = () => {
    if (onNavigateWallet) {
      onNavigateWallet();
      return;
    }
    router.push("/seller/wallet");
  };

  const handleNavigateEscrow = (orderNumber: string) => {
    if (onNavigateEscrowRoom) {
      onNavigateEscrowRoom(orderNumber);
      return;
    }
    router.push(`/escrow/${encodeURIComponent(orderNumber)}`);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-secondary antialiased selection:bg-accent-orange selection:text-white">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 space-y-8">
          {/* Top Bar */}
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
                <span className="font-bold text-ink">Merchant Desk</span>
              </div>
              <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-ink uppercase">
                MERCHANT ESCROW CONSOLE<span className="text-accent-orange">.</span>
              </h1>
              <p className="font-secondary text-xs sm:text-sm text-ink/70 mt-1">
                Manage active courier dispatches, monitor 48-hour hardware
                inspections, and track Paystack split-settlement disbursements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleNavigateWallet}
                className="h-10 px-4 border border-ink/15 bg-surface text-xs font-mono uppercase tracking-wider font-bold text-ink hover:border-ink transition-colors inline-flex items-center gap-2 rounded-ui"
              >
                <Wallet className="h-4 w-4 text-accent-orange" />
                <span>Wallet (₦{walletBalanceNaira.toLocaleString("en-NG")})</span>
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-trust-strong/10 px-3.5 py-1.5 font-mono text-caption font-bold uppercase tracking-wider text-trust-strong">
                <ShieldCheck className="h-3.5 w-3.5 text-trust" />
                <span>SmileID Verified Merchant</span>
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <QuickActionBanner
            onNewListing={() => router.push("/seller/post-gadget")}
            onOpenWallet={handleNavigateWallet}
          />

          {/* Stats Overview */}
          <SellerStatsOverview />

          {/* Recent Orders Table */}
          <RecentOrdersTable
            orders={sellerOrders}
            onSelectOrder={handleNavigateEscrow}
          />
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Dashboards */}
      <DashboardUtilityBar />
    </div>
  );
}
