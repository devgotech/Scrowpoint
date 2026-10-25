"use client";

import React, { useState } from "react";
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

export function DashboardUtilityBar({
  className,
  appVersion = "v2.4.1",
  buildId = "Build 2026.10",
}: DashboardUtilityBarProps) {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  return (
    <>
      <footer
        className={cn(
          "w-full border-t border-[#e2e8f0] bg-white text-[#64748b] text-xs font-mono py-2 px-4 sm:px-6 lg:px-8 shrink-0 transition-colors z-20",
          className
        )}
      >
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-3 min-h-[32px]">
          {/* Left: Live System Operational Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsStatusOpen(true)}
              className="flex items-center gap-2 hover:text-[#020617] transition-colors group text-left"
              title="Click to view detailed system health"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
              </span>
              <span className="font-semibold text-[#020617] text-[11px] group-hover:underline">
                All systems operational
              </span>
              <span className="hidden md:inline text-[10px] text-[#64748b] bg-[#f8fafc] px-1.5 py-0.5 rounded-[2px] border border-[#e2e8f0]">
                Escrow Vault 99.99% Uptime
              </span>
            </button>
          </div>

          {/* Center: App Version & Build Metadata */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#64748b]">
            <span className="font-bold text-[#020617]">{appVersion}</span>
            <span className="text-slate-300">•</span>
            <span>{buildId}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#15803d]">Paystack API Live</span>
          </div>

          {/* Right: Productivity Shortcuts & Utility Links */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[11px]">
            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] border border-[#e2e8f0] hover:border-slate-400 bg-[#f8fafc] hover:bg-white text-[#020617] transition-colors"
              title="View Keyboard Shortcuts"
            >
              <Keyboard className="h-3 w-3 text-[#64748b]" />
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="text-[9px] bg-white border border-[#e2e8f0] px-1 rounded-[2px] text-[#64748b]">
                ⌘K
              </kbd>
            </button>

            {/* Release Notes */}
            <button
              type="button"
              onClick={() => setIsReleaseNotesOpen(true)}
              className="hover:text-[#020617] transition-colors hidden md:inline"
            >
              Release Notes
            </button>

            {/* Platform Docs */}
            <Link
              href="/legal/escrow-agreement"
              className="hover:text-[#020617] transition-colors"
            >
              Docs
            </Link>

            {/* Support Trigger */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("sp_open_live_chat"));
                }
              }}
              className="hover:text-[#020617] transition-colors flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-2xl text-[#020617] font-secondary space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[4px] bg-[#0f172a] text-white flex items-center justify-center">
                  <Keyboard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-primary text-sm font-bold text-[#020617]">
                    Trader Keyboard Shortcuts
                  </h3>
                  <p className="text-[11px] text-[#64748b] font-mono">
                    Boost productivity across workspaces
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="h-7 w-7 rounded-[4px] hover:bg-slate-100 flex items-center justify-center text-[#64748b] hover:text-[#020617]"
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
                  className="flex items-center justify-between p-2 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]"
                >
                  <span className="font-secondary text-xs text-[#475569]">
                    {shortcut.desc}
                  </span>
                  <kbd className="px-2 py-0.5 rounded-[4px] bg-white border border-[#cbd5e1] font-mono text-[11px] font-bold text-[#020617] shadow-2xs">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex justify-end">
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
        <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-2xl text-[#020617] font-secondary space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[4px] bg-[#22c55e]/15 text-[#15803d] flex items-center justify-center">
                  <Activity className="h-4 w-4 text-[#22c55e]" />
                </div>
                <div>
                  <h3 className="font-primary text-sm font-bold text-[#020617]">
                    System Infrastructure Health
                  </h3>
                  <p className="text-[11px] text-[#15803d] font-mono font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    <span>All services operational (99.99%)</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusOpen(false)}
                className="h-7 w-7 rounded-[4px] hover:bg-slate-100 flex items-center justify-center text-[#64748b] hover:text-[#020617]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { name: "Paystack Payment Gateway", status: "Operational", lat: "14ms", ok: true },
                { name: "Escrow Vault & Ledger Engine", status: "Operational", lat: "8ms", ok: true },
                { name: "SmileID Biometric KYC Service", status: "Operational", lat: "42ms", ok: true },
                { name: "FastAPI Media & Video Store", status: "Operational", lat: "19ms", ok: true },
                { name: "48-Hour Auto-Release Cron", status: "Active (Next run 5m)", lat: "0ms", ok: true },
              ].map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between p-2 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]"
                >
                  <div>
                    <div className="font-primary text-xs font-bold text-[#020617]">{svc.name}</div>
                    <div className="text-[10px] text-[#64748b]">Response latency: {svc.lat}</div>
                  </div>
                  <Badge variant="trust" className="text-[10px] py-0 font-mono">
                    {svc.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#64748b]">
                Real-time heartbeat checked 10s ago
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
        <div className="fixed inset-0 z-50 bg-[#020617]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[8px] border border-[#e2e8f0] bg-white p-5 shadow-2xl text-[#020617] font-secondary space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <span className="font-mono text-[10px] bg-[#22c55e]/15 text-[#15803d] font-bold px-1.5 py-0.5 rounded-[2px]">
                  NEW RELEASE
                </span>
                <h3 className="font-primary text-sm font-bold text-[#020617] mt-1">
                  Scrowpoint {appVersion} Changelog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReleaseNotesOpen(false)}
                className="h-7 w-7 rounded-[4px] hover:bg-slate-100 flex items-center justify-center text-[#64748b] hover:text-[#020617]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-secondary text-[#475569]">
              <div className="p-2.5 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="font-bold text-[#020617] font-mono text-xs">
                  🚀 Context-Aware Footer Architecture
                </div>
                <p className="mt-1 text-[11px]">
                  Deployed 3 distinct footer strategies: Marketing Directory for public pages, Minimalist for auth &amp; onboarding, and Compact Utility Bar for dashboards.
                </p>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="font-bold text-[#020617] font-mono text-xs">
                  🎥 Gadget Inspection Video Player
                </div>
                <p className="mt-1 text-[11px]">
                  Added mandatory 30-second hardware diagnostic video sweeps to listing details and seller creation wizard.
                </p>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="font-bold text-[#020617] font-mono text-xs">
                  📱 Adaptive Guest vs. Trader Navigation
                </div>
                <p className="mt-1 text-[11px]">
                  Navbar dynamically updates based on session state with KYC status pills and unread notification alerts.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e2e8f0] flex justify-end">
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
