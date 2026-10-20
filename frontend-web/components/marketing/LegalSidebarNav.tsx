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
      <div className="md:hidden bg-white p-3 rounded-[8px] border border-[#e2e8f0] shadow-xs">
        <label
          htmlFor="legal-select"
          className="block font-mono text-[10px] uppercase font-bold text-[#64748b] mb-1.5"
        >
          Select Policy Document
        </label>
        <select
          id="legal-select"
          value={activeSlug}
          onChange={(e) => onSelectSlug?.(e.target.value)}
          className="w-full h-11 px-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] text-xs font-medium text-[#020617] outline-none focus:border-[#0f172a]"
        >
          {LEGAL_DOCUMENTS.map((doc) => (
            <option key={doc.slug} value={doc.slug}>
              {doc.title} {doc.badge ? `(${doc.badge})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Vertical Nav (Hidden on mobile < md) */}
      <div className="hidden md:block rounded-[8px] border border-[#e2e8f0] bg-white p-3 shadow-[0_2px_4px_rgba(15,23,42,0.04)]">
        <div className="px-3 py-2 border-b border-[#e2e8f0] mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase font-bold text-[#64748b]">
            Legal & Trust Shield
          </span>
          <span className="font-mono text-[10px] text-[#15803d] font-semibold bg-[#22c55e]/15 px-1.5 py-0.5 rounded-[2px]">
            v2.4
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
                  "group flex items-center justify-between px-3 py-2.5 rounded-[4px] text-xs font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#020617]"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#64748b] group-hover:text-[#0f172a]"
                    )}
                  />
                  <span className="truncate">{doc.title}</span>
                </div>

                {doc.badge && (
                  <span
                    className={cn(
                      "font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold shrink-0 ml-1.5",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#f1f5f9] text-[#64748b] group-hover:bg-[#e2e8f0]"
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
