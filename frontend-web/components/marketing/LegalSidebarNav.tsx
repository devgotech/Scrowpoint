"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Lock,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LegalSidebarNav Component (Phase 1 §3)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Renders navigation for all 9 legal & trust shield documents.
 * - Supported Slugs: buyer-protection, dispute-resolution, escrow-agreement,
 *   escrow-rules, kyc-policy, privacy, prohibited-items, seller-guarantee, terms.
 * - Mobile responsive: compact dropdown or scrollable pills on small viewports,
 *   authoritative vertical sidebar on desktop (>= md).
 * - Styling: 4px rounded active control, 200ms ease-out hover.
 */

export interface LegalDocumentLink {
  slug: string;
  title: string;
  category: "Trust Shield" | "Financial Custody" | "Policies";
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const LEGAL_DOCUMENTS: LegalDocumentLink[] = [
  {
    slug: "buyer-protection",
    title: "Buyer Protection Policy",
    category: "Trust Shield",
    icon: ShieldCheck,
    badge: "48h SLA",
  },
  {
    slug: "seller-guarantee",
    title: "Seller Payout Guarantee",
    category: "Trust Shield",
    icon: Lock,
    badge: "Anti-Fraud",
  },
  {
    slug: "dispute-resolution",
    title: "Dispute Arbitration Rules",
    category: "Trust Shield",
    icon: Scale,
  },
  {
    slug: "escrow-agreement",
    title: "Custodial Escrow Agreement",
    category: "Financial Custody",
    icon: FileText,
    badge: "Paystack",
  },
  {
    slug: "escrow-rules",
    title: "48-Hour Inspection Protocol",
    category: "Financial Custody",
    icon: BookOpen,
  },
  {
    slug: "kyc-policy",
    title: "Biometric Identity (KYC)",
    category: "Policies",
    icon: UserCheck,
    badge: "SmileID",
  },
  {
    slug: "prohibited-items",
    title: "Blacklisted & Stolen Devices",
    category: "Policies",
    icon: ShieldAlert,
  },
  {
    slug: "privacy",
    title: "Data Masking & Privacy",
    category: "Policies",
    icon: Shield,
  },
  {
    slug: "terms",
    title: "General Terms of Service",
    category: "Policies",
    icon: FileText,
  },
];

export interface LegalSidebarNavProps {
  activeSlug: string;
  onSelectSlug?: (slug: string) => void;
  className?: string;
}

export function LegalSidebarNav({
  activeSlug,
  onSelectSlug,
  className,
}: LegalSidebarNavProps) {
  return (
    <aside className={cn("w-full md:w-64 shrink-0 space-y-6", className)}>
      {/* Mobile Select Dropdown (Visible on mobile only < md) */}
      <div className="md:hidden bg-white p-3 border border-[#111113]/12">
        <label
          htmlFor="legal-select"
          className="block label mb-1.5"
        >
          Select Policy Document
        </label>
        <select
          id="legal-select"
          value={activeSlug}
          onChange={(e) => onSelectSlug?.(e.target.value)}
          className="w-full h-11 px-3 border border-[#111113]/15 bg-[#F8F7F4] text-xs font-medium text-[#111113] outline-none focus:border-[#111113]"
        >
          {LEGAL_DOCUMENTS.map((doc) => (
            <option key={doc.slug} value={doc.slug}>
              {doc.title} {doc.badge ? `(${doc.badge})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Vertical Nav (Hidden on mobile < md) */}
      <div className="hidden md:block border border-[#111113]/12 bg-white p-3">
        <div className="px-3 py-2 border-b border-[#111113]/12 mb-2 flex items-center justify-between">
          <span className="label">
            Legal & Trust Shield
          </span>
          <span className="font-mono text-[10px] text-[#15803d] font-semibold bg-[#22c55e]/15 px-1.5 py-0.5">
            v2.026
          </span>
        </div>

        <nav aria-label="Legal Documents Navigation" className="space-y-1">
          {LEGAL_DOCUMENTS.map((doc) => {
            const isActive = activeSlug === doc.slug;
            const Icon = doc.icon;

            return (
              <Link
                key={doc.slug}
                href={`/legal/${doc.slug}`}
                onClick={(e) => {
                  if (onSelectSlug) {
                    e.preventDefault();
                    onSelectSlug(doc.slug);
                  }
                }}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-[#111113] text-white font-semibold"
                    : "text-[#111113]/70 hover:bg-[#F8F7F4] hover:text-[#111113]"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#111113]/60 group-hover:text-[#111113]"
                    )}
                  />
                  <span className="truncate">{doc.title}</span>
                </div>

                {doc.badge && (
                  <span
                    className={cn(
                      "font-mono text-[9px] px-1.5 py-0.5 font-bold shrink-0 ml-1.5",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#F0EFEA] text-[#111113]/70"
                    )}
                  >
                    {doc.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default LegalSidebarNav;
