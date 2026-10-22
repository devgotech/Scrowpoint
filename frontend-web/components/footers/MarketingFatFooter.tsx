"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Strategy 1: The "Fat" Footer (Comprehensive Directory)
 *
 * Applies to: Public Marketing Pages, Landing Pages, Pricing, Blogs, Resource Centers.
 * UX Strategy: Safety net for anonymous visitors who scroll to the very bottom without converting.
 * Provides a complete roadmap of the ecosystem, builds trust, and offers one final push to sign up.
 *
 * Key Components:
 * - Multi-column doormat navigation (Product Features, Company, Resources, Support).
 * - Prominent secondary CTA banner ("Get Started for Free" / "Protect Your Next Gadget Trade").
 * - Interactive newsletter signup box with confirmation state.
 * - Social media icons (X/Twitter, LinkedIn, Instagram, Discord).
 * - Security badges, trust certificates, and copyright/legal links.
 * - Mobile responsive accordion with 44px touch targets.
 */

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FAT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Gadget Marketplace",
    links: [
      { label: "Browse All Gadgets", href: "/marketplace" },
      { label: "Apple iPhones & iPads", href: "/marketplace?category=smartphone" },
      { label: "MacBooks & Ultrabooks", href: "/marketplace?category=laptop" },
      { label: "Samsung Galaxy & Android", href: "/marketplace?category=smartphone" },
      { label: "Gaming Consoles & PS5", href: "/marketplace?category=gaming" },
      { label: "Post a Gadget for Sale", href: "/seller/post-gadget", badge: "0% Fee" },
    ],
  },
  {
    title: "Escrow Shield & Trust",
    links: [
      { label: "How Escrow Works", href: "/trust-and-safety" },
      { label: "48-Hour Inspection Rules", href: "/legal/buyer-protection" },
      { label: "Buyer 100% Fraud Shield", href: "/legal/buyer-protection" },
      { label: "Seller Payout Guarantee", href: "/pricing" },
      { label: "SmileID Biometric Verification", href: "/verify-identity", badge: "NIN/BVN" },
      { label: "Dispute Arbitration Engine", href: "/trust-and-safety" },
    ],
  },
  {
    title: "Resources & Tools",
    links: [
      { label: "Escrow Fee Calculator", href: "/pricing" },
      { label: "Hardware Diagnostic Checklist", href: "/legal/buyer-protection" },
      { label: "IMEI & iCloud Check Guide", href: "/legal/buyer-protection" },
      { label: "Battery Health Grading Standard", href: "/pricing" },
      { label: "Nigerian P2P Scam Prevention", href: "/trust-and-safety" },
      { label: "Design System & Sandbox", href: "/sandbox", badge: "Registry" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About Buyer's High", href: "/trust-and-safety" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy & Data Protection", href: "/legal/privacy" },
      { label: "Escrow Rules Agreement", href: "/legal/buyer-protection" },
      { label: "Prohibited & Blacklisted Items", href: "/legal/terms" },
      { label: "Security & Bug Bounty", href: "/trust-and-safety" },
    ],
  },
];

export interface MarketingFatFooterProps {
  className?: string;
  onNavigate?: (href: string) => void;
}

export function MarketingFatFooter({ className, onNavigate }: MarketingFatFooterProps) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const toggleAccordion = (index: number) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubscribed(true);
      setEmailInput("");
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <footer
      className={cn(
        "w-full border-t border-[#e2e8f0] bg-white text-[#020617] font-secondary antialiased",
        className
      )}
    >
      {/* ====================================================================
          1. PROMINENT SECONDARY CALL TO ACTION (CTA) BANNER
          Strategy: Final conversion push for users who scrolled to the bottom
          ==================================================================== */}
      <div className="border-b border-[#e2e8f0] bg-gradient-to-b from-[#f8fafc] to-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[8px] border border-[#0f172a] bg-[#0f172a] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            {/* Subtle background grid pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#22c55e 1px, transparent 1px), radial-gradient(#22c55e 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#22c55e]/15 border border-[#22c55e]/30 px-2.5 py-1 text-xs font-mono font-bold text-[#22c55e]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>START TRADING WITH INSTITUTIONAL SAFETY</span>
                </div>
                <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Never get scammed on a secondhand gadget again.
                </h2>
                <p className="font-secondary text-sm sm:text-base text-slate-300 leading-relaxed">
                  Join over 25,000 verified buyers and merchants across Lagos, Abuja, and Port Harcourt.
                  Funds stay safely locked in our Paystack vault until you personally test and approve the hardware.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-6 rounded-[4px] bg-[#22c55e] hover:bg-[#16a34a] text-[#020617] font-primary font-bold text-sm gap-2 shadow-md transition-all"
                  >
                    <span>Get Started for Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-6 rounded-[4px] border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-primary font-semibold text-sm transition-all"
                  >
                    <span>Calculate Escrow Fees</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. TRUST & SECURITY BADGES ROW
          ==================================================================== */}
      <div className="border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-[6px] bg-white border border-[#e2e8f0]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#22c55e]/15 text-[#15803d]">
                <Lock className="h-4 w-4 text-[#22c55e]" />
              </div>
              <div className="text-left">
                <div className="font-primary text-xs font-bold text-[#020617]">
                  100% Escrow Vault
                </div>
                <div className="font-secondary text-[11px] text-[#64748b]">
                  Zero chargeback risk
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[6px] bg-white border border-[#e2e8f0]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#ecc94b]/20 text-[#975a16]">
                <Clock className="h-4 w-4 text-[#ecc94b]" />
              </div>
              <div className="text-left">
                <div className="font-primary text-xs font-bold text-[#020617]">
                  48-Hour Inspection SLA
                </div>
                <div className="font-secondary text-[11px] text-[#64748b]">
                  Full hardware diagnostic
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[6px] bg-white border border-[#e2e8f0]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#0f172a]/10 text-[#0f172a]">
                <ShieldCheck className="h-4 w-4 text-[#0f172a]" />
              </div>
              <div className="text-left">
                <div className="font-primary text-xs font-bold text-[#020617]">
                  SmileID Verified
                </div>
                <div className="font-secondary text-[11px] text-[#64748b]">
                  Govt NIN biometric check
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[6px] bg-white border border-[#e2e8f0]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[#22c55e]/15 text-[#15803d]">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
              </div>
              <div className="text-left">
                <div className="font-primary text-xs font-bold text-[#020617]">
                  NDPR &amp; PCI-DSS Level 1
                </div>
                <div className="font-secondary text-[11px] text-[#64748b]">
                  Paystack banking rails
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. MULTI-COLUMN DOORMAT DIRECTORY & NEWSLETTER SIGNUP
          ==================================================================== */}
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand, Mission & Newsletter Column (4 Cols on desktop) */}
          <div className="space-y-6 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#0f172a] text-white shadow-xs">
                <Shield className="h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-primary text-lg font-bold tracking-tight text-[#020617] leading-none">
                  Buyer&apos;s High
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase text-[#64748b]">
                  Peer-to-Peer Escrow
                </span>
              </div>
            </Link>

            <p className="font-secondary text-xs sm:text-sm text-[#475569] leading-relaxed">
              Nigeria&apos;s most secure secondhand gadget exchange. We bridge buyers and sellers with
              institutional escrow accounts, mandatory 30-second inspection video audits, and legally binding 48-hour dispute arbitration.
            </p>

            {/* Newsletter Subscription Box */}
            <div className="p-4 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
              <div className="font-primary text-xs font-bold text-[#020617] flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#0f172a]" />
                <span>Gadget Price Drops &amp; Security Alerts</span>
              </div>
              <p className="text-[11px] text-[#64748b] leading-tight">
                Get weekly market updates on verified device deals and fraud prevention guides.
              </p>

              {newsletterSubscribed ? (
                <div className="p-2.5 rounded-[4px] bg-[#22c55e]/15 border border-[#22c55e]/30 text-xs font-mono font-bold text-[#15803d] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Subscribed! Check your inbox for security tips.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address..."
                    className="h-9 flex-1 rounded-[4px] border border-[#e2e8f0] bg-white px-3 text-xs text-[#020617] focus:outline-none focus:ring-1 focus:ring-[#0f172a]"
                  />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    className="h-9 px-3 text-xs font-medium bg-[#0f172a] hover:bg-slate-800 text-white rounded-[4px]"
                  >
                    <span>Subscribe</span>
                  </Button>
                </form>
              )}
            </div>

            {/* Social Media Links */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#64748b]">
                Connect with our Community
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X"
                  className="h-8 w-8 rounded-[4px] border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:border-slate-400 transition-colors"
                >
                  <IconBrandTwitter className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="h-8 w-8 rounded-[4px] border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:border-slate-400 transition-colors"
                >
                  <IconBrandLinkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="h-8 w-8 rounded-[4px] border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:border-slate-400 transition-colors"
                >
                  <IconBrandInstagram className="h-4 w-4" />
                </a>
                <a
                  href="mailto:compliance@buyershigh.com"
                  aria-label="Email Compliance"
                  className="h-8 w-8 rounded-[4px] border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:border-slate-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Desktop 4 Columns Doormat Directory (8 Cols on desktop) */}
          <div className="hidden md:grid md:grid-cols-4 gap-6 lg:col-span-8">
            {FAT_FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="space-y-3.5">
                <h3 className="font-primary text-xs font-bold uppercase tracking-wider text-[#020617]">
                  {column.title}
                </h3>
                <ul className="space-y-2 text-xs font-secondary">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => onNavigate?.(link.href)}
                        className="text-[#64748b] hover:text-[#0f172a] transition-colors duration-150 inline-flex items-center gap-1.5 py-0.5"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="font-mono text-[9px] bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-1 py-0.2 rounded-[2px] font-semibold">
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

          {/* Mobile Stacked Accordion for Small Screens (<md) */}
          <div className="block md:hidden border-t border-[#e2e8f0] divide-y divide-[#e2e8f0]">
            {FAT_FOOTER_COLUMNS.map((column, index) => {
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
                        "h-4 w-4 text-[#64748b] transition-transform duration-200",
                        isOpen && "rotate-180 text-[#0f172a]"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <ul className="mt-3 space-y-2.5 pl-2 text-xs font-secondary animate-in fade-in-50 duration-150">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={() => onNavigate?.(link.href)}
                            className="text-[#64748b] hover:text-[#020617] inline-flex items-center gap-1.5 py-1 min-h-[36px]"
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="font-mono text-[9px] bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-1 py-0.2 rounded-[2px] font-semibold">
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
            4. BOTTOM LEGAL DISCLAIMER & COPYRIGHT
            ==================================================================== */}
        <div className="mt-12 border-t border-[#e2e8f0] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-secondary text-[#64748b]">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Buyer&apos;s High Escrow Technologies Ltd. (RC: 1984210).</span>
            <span className="hidden sm:inline">•</span>
            <span>All escrow deposits segregated with CBN-licensed bank partners.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
            <Link href="/legal/terms" className="hover:text-[#0f172a] transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#0f172a] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/buyer-protection" className="hover:text-[#0f172a] transition-colors">
              Escrow Agreement
            </Link>
            <Link href="/trust-and-safety" className="hover:text-[#0f172a] transition-colors">
              Trust &amp; Safety
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFatFooter;
