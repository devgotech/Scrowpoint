"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MarketingFatFooter for Scrowpoint — Design Variation 7.
 *
 * Combines Variation 7's clean Swiss editorial footer bar (`© 2026 Scrowpoint Technologies`,
 * `Terms of Service`, `Buyer Protection`, `Security` in `.label` uppercase monospace)
 * with the expandable directory & newsletter for complete app navigation.
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
      { label: "About Scrowpoint", href: "/trust-and-safety" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy & Data Protection", href: "/legal/privacy" },
      { label: "Buyer Protection", href: "/legal/buyer-protection" },
      { label: "Security", href: "/trust-and-safety" },
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
        "w-full border-t border-[#111113]/12 bg-[#F8F7F4] text-[#111113] font-secondary antialiased",
        className
      )}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 pt-16 pb-10">
        {/* Directory & Newsletter Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-14 border-b border-[#111113]/12">
          {/* Left Column: Wordmark & Newsletter */}
          <div className="space-y-6 lg:col-span-4">
            <Link
              href="/"
              onClick={() => onNavigate?.("/")}
              className="font-primary text-2xl font-extrabold tracking-[-0.05em] text-[#111113] inline-block"
            >
              SCROWPOINT<span className="text-[#FF5A25]">.</span>
            </Link>

            <p className="font-secondary text-sm text-[#111113]/70 leading-relaxed max-w-sm">
              Nigeria’s trusted platform for secure gadget exchange. Funds locked in custody until your 48-hour hardware inspection is complete.
            </p>

            {/* Newsletter */}
            <div className="v7-card !p-5 space-y-3">
              <span className="label block">Security &amp; Market Alerts</span>
              {newsletterSubscribed ? (
                <div className="p-2.5 bg-[#22c55e]/15 text-xs font-mono font-bold text-[#15803d] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Subscribed to Scrowpoint updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email..."
                    className="h-10 flex-1 border border-[#111113]/15 bg-[#F8F7F4] px-3 text-xs text-[#111113] focus:outline-none focus:border-[#111113]"
                  />
                  <button
                    type="submit"
                    className="btn-primary !py-2 !px-5 text-xs"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="h-9 w-9 border border-[#111113]/15 bg-white flex items-center justify-center text-[#111113]/70 hover:text-[#111113] hover:border-[#111113] transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="h-9 w-9 border border-[#111113]/15 bg-white flex items-center justify-center text-[#111113]/70 hover:text-[#111113] hover:border-[#111113] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 border border-[#111113]/15 bg-white flex items-center justify-center text-[#111113]/70 hover:text-[#111113] hover:border-[#111113] transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:compliance@scrowpoint.com"
                aria-label="Email Compliance"
                className="h-9 w-9 border border-[#111113]/15 bg-white flex items-center justify-center text-[#111113]/70 hover:text-[#111113] hover:border-[#111113] transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Desktop 4 Columns Directory */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 lg:col-span-8">
            {FAT_FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="space-y-4">
                <span className="label block !opacity-90 font-bold">
                  {column.title}
                </span>
                <ul className="space-y-2.5 text-xs font-secondary">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => onNavigate?.(link.href)}
                        className="text-[#111113]/70 hover:text-[#111113] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="font-mono text-[9px] bg-[#111113] text-white px-1.5 py-0.5">
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

          {/* Mobile Accordion */}
          <div className="block md:hidden border-t border-[#111113]/12 divide-y divide-[#111113]/12">
            {FAT_FOOTER_COLUMNS.map((column, index) => {
              const isOpen = openAccordion === index;
              return (
                <div key={column.title} className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between py-1 text-left font-primary text-sm font-bold text-[#111113]"
                    aria-expanded={isOpen}
                  >
                    <span>{column.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-[#111113]/60 transition-transform duration-200",
                        isOpen && "rotate-180 text-[#111113]"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <ul className="mt-3 space-y-2.5 pl-2 text-xs font-secondary">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={() => onNavigate?.(link.href)}
                            className="text-[#111113]/70 hover:text-[#111113] inline-flex items-center gap-1.5 py-1"
                          >
                            <span>{link.label}</span>
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
            VARIATION 7 SIGNATURE BOTTOM BAR
            ==================================================================== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="label">© 2026 Scrowpoint Technologies</div>
          <div className="flex flex-wrap items-center justify-center gap-8 label">
            <Link
              href="/legal/terms"
              onClick={() => onNavigate?.("/legal/terms")}
              className="hover:opacity-100 transition-opacity"
            >
              Terms of Service
            </Link>
            <Link
              href="/legal/buyer-protection"
              onClick={() => onNavigate?.("/legal/buyer-protection")}
              className="hover:opacity-100 transition-opacity"
            >
              Buyer Protection
            </Link>
            <Link
              href="/trust-and-safety"
              onClick={() => onNavigate?.("/trust-and-safety")}
              className="hover:opacity-100 transition-opacity"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFatFooter;
