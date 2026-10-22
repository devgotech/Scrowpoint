"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalSidebarNav } from "@/components/marketing/LegalSidebarNav";
import { ProseTypography } from "@/components/marketing/ProseTypography";
import { LiveChatWidget } from "@/components/support/LiveChatWidget";

/**
 * Screen 3: Legal & Trust Shield Documents (Phase 1 §3)
 * Route: app/(marketing)/legal/[slug]/page.tsx
 *
 * Supported Slugs:
 * - buyer-protection, dispute-resolution, escrow-agreement, escrow-rules,
 *   kyc-policy, privacy, prohibited-items, seller-guarantee, terms.
 *
 * Architecture Requirements:
 * - Components: LegalSidebarNav, ProseTypography (Roboto typography).
 * - Architecture Link: Static policy content with zero database load on hit.
 * - Mobile Responsiveness: Collapsible/dropdown sidebar on mobile, full side-by-side
 *   layout on desktop.
 */

export interface LegalPageProps {
  slug?: string;
  onNavigateHome?: () => void;
}

export default function LegalDocumentPage({
  slug = "buyer-protection",
  onNavigateHome,
}: LegalPageProps) {
  const [currentSlug, setCurrentSlug] = useState<string>(slug);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-[#e2e8f0] py-6 sm:py-8">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs text-[#64748b]">Trust & Legal</span>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a] capitalize">
                {currentSlug.replace("-", " ")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                  Buyer's High Trust & Legal Registry
                </h1>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-1">
                  Enforceable statutory guidelines, custodial escrow protections, and diagnostic rules.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-[4px] border border-[#22c55e]/30 bg-[#22c55e]/15 px-3 py-1.5 text-xs font-mono font-semibold text-[#15803d]">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>Paystack Custodial Hold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Sidebar + Document */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Sidebar */}
              <LegalSidebarNav
                activeSlug={currentSlug}
                onSelectSlug={(newSlug) => setCurrentSlug(newSlug)}
              />

              {/* Document Prose View */}
              <div className="flex-1 w-full min-w-0">
                <ProseTypography slug={currentSlug} />
              </div>
            </div>
          </div>
        </section>
      </main>
          
      <Footer />
    </div>
  );
}
