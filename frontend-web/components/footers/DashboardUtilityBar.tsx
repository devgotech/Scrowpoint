"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Command,
  ExternalLink,
  FileText,
  HelpCircle,
  Keyboard,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Strategy 3: The Compact Utility Bar (Dashboard / Protected Level)
 *
 * Applies to: Main App Dashboards, Feed Views, User Workspaces, and Project Settings
 * (Seller Dashboard, Wallet & Payouts, Escrow Room, Settings/Profile, Notifications, Admin Triage).
 *
 * UX Strategy: Once logged in, vertical screen real estate is premium currency.
 * Replaces heavy doormat footers with an ultra-compact utility bar that never forces unnecessary
 * scrolling, while keeping operational status, versioning, and productivity shortcuts accessible.
 *
 * Key Components:
 * - System operational status indicator ("All systems operational • Escrow Vault 99.99%").
 * - App version number & build metadata ("v2.4.1 • Build 2026.10").
 * - Interactive Keyboard Shortcuts dialog ("⌘K Shortcuts").
 * - Quick links to Platform Docs, Release Notes, and Live Support.
 */

export interface DashboardUtilityBarProps {
  className?: string;
  appVersion?: string;
  buildId?: string;
}

type BackendHealth = {
  state: "checking" | "online" | "down";
  checkedAt: string | null;
  paystackMode: "not_configured" | "mock" | "test" | "live" | "configured" | "unknown";
};

export function DashboardUtilityBar({
  className,
  appVersion = "v2.4.1",
  buildId = "Build 2026.10",
}: DashboardUtilityBarProps) {
  const [health, setHealth] = useState<BackendHealth>({
    state: "checking",
    checkedAt: null,
    paystackMode: "unknown",
  });
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await response.json();
        const data = payload?.data ?? payload;
        if (!response.ok || data?.status !== "healthy") {
          throw new Error("Backend health check failed.");
        }
        if (!active) return;
        const mode = data.paystack?.mode;
        setHealth({
          state: "online",
          checkedAt: new Date().toISOString(),
          paystackMode:
            mode === "live" || mode === "test" || mode === "configured" || mode === "mock"
              ? mode
              : mode === "not_configured"
                ? mode
                : "unknown",
        });
      } catch {
        if (active) {
          setHealth((current) => ({
            ...current,
            state: "down",
            checkedAt: new Date().toISOString(),
          }));
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void checkHealth();
    const interval = window.setInterval(checkHealth, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const backendStatusLabel =
    health.state === "online"
      ? "Core API online"
      : health.state === "down"
        ? "Core API down"
        : "Checking core API";
  const paystackStatusLabel =
    health.state === "down" && health.paystackMode === "unknown"
      ? "Paystack status unavailable"
      : health.paystackMode === "live"
        ? "Paystack live keys configured"
        : health.paystackMode === "test"
          ? "Paystack test keys configured"
          : health.paystackMode === "mock"
            ? "Paystack mock mode; keys pending"
          : health.paystackMode === "configured"
            ? "Paystack credentials configured"
            : health.paystackMode === "not_configured"
              ? "Paystack setup pending"
              : "Paystack status unknown";
  const statusColor =
    health.state === "online"
      ? "bg-[#22c55e]"
      : health.state === "down"
        ? "bg-[#c53030]"
        : "bg-[#ecc94b]";

  return (
    <>
      <footer
        className={cn(
          "w-full border-t border-[#111113]/12 bg-[#F8F7F4] text-[#111113]/65 text-xs font-mono py-2.5 px-4 sm:px-6 lg:px-8 shrink-0 transition-colors z-20",
          className
        )}
      >
        <div className="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-3 min-h-[32px]">
          {/* Left: Live System Operational Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsStatusOpen(true)}
              className="flex items-center gap-2 hover:text-[#111113] transition-colors group text-left"
              title="Click to view detailed system health"
            >
              <span className="relative flex h-2 w-2">
                {health.state === "online" && (
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusColor)} />
                )}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", statusColor)} />
              </span>
              <span className="font-semibold text-[#111113] text-[11px] group-hover:underline">
                {backendStatusLabel}
              </span>
              <span className="hidden md:inline text-[10px] text-[#111113]/65 bg-white px-2 py-0.5 border border-[#111113]/12">
                {paystackStatusLabel}
              </span>
            </button>
          </div>

          {/* Center: App Version & Build Metadata */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#111113]/60">
            <span className="font-bold text-[#111113]">{appVersion}</span>
            <span className="text-[#111113]/25">•</span>
            <span>{buildId}</span>
            <span className="text-[#111113]/25">•</span>
            <span className={health.state === "online" ? "text-[#15803d]" : "text-[#c53030]"}>
              {backendStatusLabel}
            </span>
          </div>

          {/* Right: Productivity Shortcuts & Utility Links */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[11px]">
            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 border border-[#111113]/15 hover:border-[#111113]/40 bg-white text-[#111113] transition-colors"
              title="View Keyboard Shortcuts"
            >
              <Keyboard className="h-3 w-3 text-[#111113]/60" />
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="text-[9px] bg-[#F8F7F4] border border-[#111113]/12 px-1 text-[#111113]/65">
                ⌘K
              </kbd>
            </button>

            {/* Release Notes */}
            <button
              type="button"
              onClick={() => setIsReleaseNotesOpen(true)}
              className="hover:text-[#FF5A25] transition-colors hidden md:inline"
            >
              Release Notes
            </button>

            {/* Platform Docs */}
            <Link
              href="/legal/escrow-agreement"
              className="hover:text-[#FF5A25] transition-colors"
            >
              Docs
            </Link>

            {/* Support Trigger */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("sp_open_live_chat"));
                  window.dispatchEvent(new CustomEvent("bh_open_live_chat"));
                }
              }}
              className="hover:text-[#FF5A25] transition-colors flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3 text-[#22c55e]" />
              <span className="hidden sm:inline">Support</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          KEYBOARD SHORTCUTS MODAL DIALOG (⌘K)
          ==================================================================== */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 bg-[#111113]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md border border-[#111113]/15 bg-white p-5 shadow-2xl text-[#111113] font-secondary space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-[#111113] text-white flex items-center justify-center">
                  <Keyboard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-primary text-sm font-bold tracking-[-0.03em] text-[#111113]">
                    Trader Keyboard Shortcuts
                  </h3>
                  <p className="text-[11px] text-[#111113]/60 font-mono">
                    Boost productivity across workspaces
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="h-7 w-7 hover:bg-[#F0EFEA] flex items-center justify-center text-[#111113]/60 hover:text-[#111113]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { key: "G then M", desc: "Jump to Public Marketplace" },
                { key: "G then D", desc: "Open Seller Dashboard" },
                { key: "G then W", desc: "Open Wallet & Payouts" },
                { key: "G then P", desc: "Post New Gadget Listing" },
                { key: "G then E", desc: "Active Escrow Room" },
                { key: "/", desc: "Focus Global Search Bar" },
                { key: "Esc", desc: "Dismiss Modals / Drawers" },
              ].map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-2 bg-[#F8F7F4] border border-[#111113]/12"
                >
                  <span className="font-secondary text-xs text-[#111113]/75">
                    {shortcut.desc}
                  </span>
                  <kbd className="px-2 py-0.5 bg-white border border-[#111113]/20 font-mono text-[11px] font-bold text-[#111113]">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#111113]/12 flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsShortcutsOpen(false)}
                className="text-xs font-semibold"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SYSTEM OPERATIONAL STATUS DETAIL MODAL
          ==================================================================== */}
      {isStatusOpen && (
        <div className="fixed inset-0 z-50 bg-[#111113]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md border border-[#111113]/15 bg-white p-5 shadow-2xl text-[#111113] font-secondary space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-[#22c55e]/15 text-[#15803d] flex items-center justify-center">
                  <Activity className="h-4 w-4 text-[#22c55e]" />
                </div>
                <div>
                  <h3 className="font-primary text-sm font-bold tracking-[-0.03em] text-[#111113]">
                    System Infrastructure Health
                  </h3>
                  <p className={cn(
                    "text-[11px] font-mono font-bold flex items-center gap-1",
                    health.state === "online" ? "text-[#15803d]" : health.state === "down" ? "text-[#c53030]" : "text-[#975a16]"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusColor)} />
                    <span>{backendStatusLabel}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusOpen(false)}
                className="h-7 w-7 hover:bg-[#F0EFEA] flex items-center justify-center text-[#111113]/60 hover:text-[#111113]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-[#F8F7F4] border border-[#111113]/12">
                <div>
                  <div className="font-primary text-xs font-bold text-[#111113]">Core Backend API</div>
                  <div className="text-[10px] text-[#111113]/60">GET /api/health</div>
                </div>
                <Badge
                  variant={health.state === "online" ? "trust" : health.state === "down" ? "destructive" : "warning"}
                  className="text-[10px] py-0 font-mono"
                >
                  {health.state === "online" ? "Operational" : health.state === "down" ? "Unavailable" : "Checking"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#F8F7F4] border border-[#111113]/12">
                <div>
                  <div className="font-primary text-xs font-bold text-[#111113]">Paystack Configuration</div>
                  <div className="text-[10px] text-[#111113]/60">Key presence only; gateway not probed</div>
                </div>
                <Badge
                  variant={health.paystackMode === "live" || health.paystackMode === "test" ? "trust" : "warning"}
                  className="text-[10px] py-0 font-mono"
                >
                  {paystackStatusLabel}
                </Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-[#111113]/12 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#111113]/60">
                {health.checkedAt
                  ? `Last checked ${new Date(health.checkedAt).toLocaleTimeString()}`
                  : "Waiting for first health check"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusOpen(false)}
                className="text-xs font-mono"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          RELEASE NOTES MODAL (v2.4.1)
          ==================================================================== */}
      {isReleaseNotesOpen && (
        <div className="fixed inset-0 z-50 bg-[#111113]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md border border-[#111113]/15 bg-white p-5 shadow-2xl text-[#111113] font-secondary space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
              <div>
                <span className="font-mono text-[10px] bg-[#22c55e]/15 text-[#15803d] font-bold px-1.5 py-0.5">
                  NEW RELEASE
                </span>
                <h3 className="font-primary text-sm font-bold tracking-[-0.03em] text-[#111113] mt-1">
                  Scrowpoint {appVersion} Changelog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReleaseNotesOpen(false)}
                className="h-7 w-7 hover:bg-[#F0EFEA] flex items-center justify-center text-[#111113]/60 hover:text-[#111113]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-secondary text-[#111113]/75">
              <div className="p-2.5 bg-[#F8F7F4] border border-[#111113]/12">
                <div className="font-bold text-[#111113] font-primary text-xs">
                  Context-Aware Footer Architecture
                </div>
                <p className="mt-1 text-[11px]">
                  Deployed 3 distinct footer strategies: Marketing Directory for public pages, Minimalist for auth &amp; onboarding, and Compact Utility Bar for dashboards.
                </p>
              </div>

              <div className="p-2.5 bg-[#F8F7F4] border border-[#111113]/12">
                <div className="font-bold text-[#111113] font-primary text-xs">
                  Gadget Inspection Video Player
                </div>
                <p className="mt-1 text-[11px]">
                  Added mandatory 30-second hardware diagnostic video sweeps to listing details and seller creation wizard.
                </p>
              </div>

              <div className="p-2.5 bg-[#F8F7F4] border border-[#111113]/12">
                <div className="font-bold text-[#111113] font-primary text-xs">
                  Adaptive Guest vs. Trader Navigation
                </div>
                <p className="mt-1 text-[11px]">
                  Navbar dynamically updates based on session state with KYC status pills and unread notification alerts.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#111113]/12 flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsReleaseNotesOpen(false)}
                className="text-xs font-semibold"
              >
                Close Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardUtilityBar;
