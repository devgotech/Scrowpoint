"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Clock,
  Lock,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Footer Component for Buyer's High.
 *
 * Requirements (UI Context Spec 1, §2 & §4, Spec 4, §2, Directives):
 * - 4-Column Layout on Desktop (1200px / max-w-7xl centered).
 * - Responsive Isolation: Collapses into clean touch-friendly expandable accordion items on Mobile (<768px).
 * - Trust Metrics:
 *   - 100% Escrow Protection Guarantee.
 *   - 48-Hour Inspection Window SLA.
 *   - SmileID Tier-1 Biometric KYC Verification.
 * - Legal & Compliance Links:
 *   - Terms of Service, Privacy Policy, Escrow Rules/Agreement, and Prohibited Items Policy.
 * - Strictly 4-point spacing scale (p-4, p-6, p-8, gap-6, gap-8).
 * - Typography: font-heading for section titles, font-mono for metrics/numbers.
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

const CURRENT_YEAR = new Date().getFullYear();

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
    <footer className="w-full border-t border-border bg-card text-card-foreground">
      {/* ====================================================================
          1. TRUST METRICS BANNER (Desktop & Mobile)
          ==================================================================== */}
      <div className="border-b border-border/70 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Trust Metric 1 */}
            <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-semibold text-foreground">
                  100% Escrow Protection
                </h4>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Seller gets paid only after you inspect and verify the gadget. Zero unauthorized chargebacks.
                </p>
              </div>
            </div>

            {/* Trust Metric 2 */}
            <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warning/20 text-warning-text">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-semibold text-foreground">
                  48-Hour Inspection SLA
                </h4>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Test battery health, screen condition, and iCloud/carrier locks with a guaranteed return window.
                </p>
              </div>
            </div>

            {/* Trust Metric 3 */}
            <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-trust-subtle text-trust-strong">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-semibold text-foreground">
                  Government ID Verified
                </h4>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Brand & Mission Statement Column */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Shield className="h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold tracking-tight text-foreground leading-none">
                  Buyer&apos;s High
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                  P2P Escrow
                </span>
              </div>
            </Link>
            <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-xs">
              Nigeria&apos;s highest-trust secondhand gadget marketplace. Eliminating marketplace fraud with institutional escrow safeguards.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Paystack & Escrow Vault Online</span>
            </div>
          </div>

          {/* Desktop 4-Column Navigation (Visible on md+) */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 lg:col-span-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="space-y-3">
                <h4 className="font-heading text-sm font-semibold text-foreground tracking-tight">
                  {column.title}
                </h4>
                <ul className="space-y-2.5 text-xs font-body">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="font-mono text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md font-semibold">
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
          <div className="block md:hidden border-t border-border/80 divide-y divide-border/80">
            {FOOTER_COLUMNS.map((column, index) => {
              const isOpen = openAccordion === index;
              return (
                <div key={column.title} className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex min-h-11 w-full items-center justify-between py-1 text-left font-heading text-sm font-semibold text-foreground transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-expanded={isOpen}
                  >
                    <span>{column.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-foreground"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <ul className="mt-3 space-y-2.5 pl-2 text-xs font-body animate-in fade-in-50 duration-200">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 py-0.5"
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="font-mono text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md font-semibold">
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
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body text-muted-foreground">
          <p>© {CURRENT_YEAR} Buyer&apos;s High Escrow Technologies Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/escrow-agreement" className="hover:text-foreground transition-colors">
              Escrow Agreement
            </Link>
            <Link href="/legal/prohibited-items" className="hover:text-foreground transition-colors">
              Prohibited Items
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
