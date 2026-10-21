"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Clock,
  ExternalLink,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Footer Component for Buyer's High.
 *
 * Requirements (4_ui_system.md & UI Context Spec 1, §2 & §4):
 * - 4-Column Layout on Desktop (1280px / max-w-[1280px] centered).
 * - Responsive Isolation: Collapses into clean touch-friendly expandable accordion items on Mobile (<768px).
 * - Corner Radius: --radius-card (8px -> rounded-[8px]); --radius-control (4px -> rounded-[4px]).
 * - Non-trust badge rule: NEVER use pill radius on non-trust badges.
 * - Trust Metrics:
 *   - 100% Escrow Protection Guarantee (--color-trust #22c55e, --color-trust-strong #15803d).
 *   - 48-Hour Inspection Window SLA (--color-state-warning #ecc94b).
 *   - Government ID Verified.
 * - Typography: font-primary for headings, font-secondary for links, font-mono for metrics.
 * - Transitions: strict duration-200 ease-out (NEVER bouncy).
 */

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Marketplace & Trades",
    links: [
      { label: "Browse Gadgets", href: "/marketplace" },
      { label: "Sell a Device", href: "/dashboard/listings/create" },
      { label: "Escrow Fee Calculator", href: "/pricing" },
      { label: "Popular iPhones & MacBooks", href: "/marketplace?category=apple" },
      { label: "Android & Gaming Consoles", href: "/marketplace?category=gaming" },
    ],
  },
  {
    title: "Trust & Escrow Shield",
    links: [
      { label: "How Escrow Works", href: "/escrow/how-it-works" },
      { label: "48-Hour Inspection Rules", href: "/legal/escrow-rules" },
      { label: "Buyer Protection Policy", href: "/legal/buyer-protection" },
      { label: "Seller Payout Guarantee", href: "/legal/seller-guarantee" },
      { label: "Dispute Arbitration Process", href: "/legal/dispute-resolution" },
    ],
  },
  {
    title: "Compliance & Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Escrow Agreement", href: "/legal/escrow-agreement" },
      { label: "Prohibited Items Policy", href: "/legal/prohibited-items" },
      { label: "KYC & AML Compliance", href: "/legal/kyc-policy" },
    ],
  },
  {
    title: "Support & Community",
    links: [
      { label: "Help Center & FAQs", href: "/support" },
      { label: "Report Fraud or Scam", href: "/support/report" },
      { label: "Platform Status & SLA", href: "/status", badge: "99.9% Uptime" },
      { label: "Contact Compliance Team", href: "mailto:support@buyershigh.com" },
      { label: "Pre-Launch Waitlist", href: "/waitlist" },
    ],
  },
];

export function Footer() {
  // Mobile accordion state for collapsing columns
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  };

  return (
    <footer className="w-full bg-[#f8fafc] text-[#020617]">
      {/* ====================================================================
          1. TRUST METRICS BANNER (Desktop & Mobile)
          ==================================================================== */}
      <div className="mx-4 border-y border-[#0f172a] bg-[#f8fafc]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Trust Metric 1 */}
            <div className="flex items-start gap-4 rounded-[8px] border border-[#0f172a] bg-[#f8fafc] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#0f172a]">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-primary text-sm font-semibold text-[#020617]">
                  100% Escrow Protection
                </h4>
                <p className="font-secondary text-xs leading-relaxed text-[#0f172a]">
                  Seller gets paid only after you inspect and verify the gadget. Zero unauthorized chargebacks.
                </p>
              </div>
            </div>

            {/* Trust Metric 2 */}
            <div className="flex items-start gap-4 rounded-[8px] border border-[#0f172a] bg-[#f8fafc] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#0f172a]">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-primary text-sm font-semibold text-[#020617]">
                  48-Hour Inspection SLA
                </h4>
                <p className="font-secondary text-xs leading-relaxed text-[#0f172a]">
                  Test battery health, screen condition, and iCloud/carrier locks with a guaranteed return window.
                </p>
              </div>
            </div>

            {/* Trust Metric 3 */}
            <div className="flex items-start gap-4 rounded-[8px] border border-[#0f172a] bg-[#f8fafc] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#15803d]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-primary text-sm font-semibold text-[#020617]">
                  Government ID Verified
                </h4>
                <p className="font-secondary text-xs leading-relaxed text-[#0f172a]">
                  Every active seller passes SmileID biometric verification against national identity databases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MAIN NAVIGATION LINKS
          - Desktop: 4 Columns with Brand Column
          - Mobile: Stacked Accordion
          ==================================================================== */}
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Brand & Mission Statement Column */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e2e8f0] bg-white text-[#0f172a] shadow-[0_2px_4px_rgba(15,23,42,0.06)]">
                <Shield className="h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-primary text-lg font-bold tracking-tight text-[#020617] leading-none">
                  Buyer's High
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase text-[#0f172a]">
                  P2P Escrow
                </span>
              </div>
            </Link>
            <p className="font-secondary text-xs leading-relaxed text-[#0f172a] max-w-xs">
              Nigeria's highest-trust secondhand gadget marketplace. Eliminating marketplace fraud with institutional escrow safeguards.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-[#0f172a]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span>Paystack & Escrow Vault Online</span>
            </div>
          </div>

          {/* Desktop 4-Column Navigation (Visible on md+) */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 lg:col-span-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="space-y-3">
                <h4 className="font-primary text-sm font-semibold text-[#020617]">
                  {column.title}
                </h4>
                <ul className="space-y-2.5 text-xs font-secondary">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[#0f172a] hover:text-[#64748b] transition-colors duration-200 ease-out inline-flex items-center gap-1.5"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="font-mono text-[10px] bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] px-1.5 py-0.2 rounded-[4px] font-semibold">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Stacked Accordion (Visible on <md) */}
          <div className="block md:hidden border-t border-[#0f172a] divide-y divide-[#0f172a]/20">
            {FOOTER_COLUMNS.map((column, index) => {
              const isOpen = openAccordion === index;
              return (
                <div key={column.title} className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between py-1 text-left font-primary text-sm font-semibold text-[#020617]"
                    aria-expanded={isOpen}
                  >
                    <span>{column.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-[#64748b] transition-transform duration-200 ease-out",
                        isOpen && "rotate-180 text-[#020617]"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <ul className="mt-3 space-y-2.5 pl-2 text-xs font-secondary animate-in fade-in-50 duration-200">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-[#0f172a] hover:text-[#64748b] transition-colors duration-200 ease-out inline-flex items-center gap-1.5 py-0.5"
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="font-mono text-[10px] bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] px-1.5 py-0.2 rounded-[4px] font-semibold">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            3. BOTTOM LEGAL DISCLAIMER & COPYRIGHT
            ==================================================================== */}
        <div className="mt-12 border-t border-[#0f172a] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-secondary text-[#0f172a]">
          <p>© {new Date().getFullYear()} Buyer's High Escrow Technologies Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/legal/terms" className="hover:text-[#64748b] transition-colors duration-200 ease-out">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#64748b] transition-colors duration-200 ease-out">
              Privacy Policy
            </Link>
            <Link href="/legal/escrow-agreement" className="hover:text-[#64748b] transition-colors duration-200 ease-out">
              Escrow Agreement
            </Link>
            <Link href="/legal/prohibited-items" className="hover:text-[#64748b] transition-colors duration-200 ease-out">
              Prohibited Items
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
