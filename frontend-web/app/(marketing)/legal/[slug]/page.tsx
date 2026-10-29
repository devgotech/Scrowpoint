"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalSidebarNav } from "@/components/marketing/LegalSidebarNav";
import { ProseTypography } from "@/components/marketing/ProseTypography";

/**
 * Screen 3: Legal & Trust Shield Documents (Phase 1 §3)
 * Route: app/(marketing)/legal/[slug]/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 */

export interface LegalPageProps {
  slug?: string;
  onNavigateHome?: () => void;
}

export default function LegalDocumentPage({
  slug: providedSlug,
  onNavigateHome,
}: LegalPageProps) {
  const routeParams = useParams<{ slug?: string }>();
  const router = useRouter();
  const currentSlug = providedSlug ?? routeParams.slug ?? "buyer-protection";

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-[#111113]/12 py-8 sm:py-10">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-3">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="text-[#111113]/65">Trust &amp; Legal</span>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="font-bold text-[#111113]">
                {currentSlug.replace("-", " ")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                  SCROWPOINT TRUST &amp; LEGAL REGISTRY
                  <span className="text-[#FF5A25]">.</span>
                </h1>
                <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-1.5">
                  Enforceable statutory guidelines, custodial escrow
                  protections, and diagnostic rules.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#15803d]/10 px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#15803d]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>Paystack Custodial Hold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Sidebar + Document */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Sidebar */}
              <LegalSidebarNav
                activeSlug={currentSlug}
                onSelectSlug={(newSlug) => router.push(`/legal/${newSlug}`)}
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
