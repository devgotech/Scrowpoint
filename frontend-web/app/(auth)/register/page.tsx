"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { MinimalistAuthFooter } from "@/components/footers";

/**
 * Screen 5 (Variant): Authentication Entry - Register (Phase 2 §1)
 * Route: app/(auth)/register/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 */

export interface RegisterPageProps {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export default function RegisterPage({
  onSuccess,
  onNavigateHome,
}: RegisterPageProps) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between antialiased font-secondary selection:bg-accent-orange selection:text-white">
      {/* Top Bar with Home Link & Logo */}
      <div className="w-full border-b border-ink-faint bg-surface py-3.5 px-4 sm:px-6">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <Link
            href="/"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-ink/65 hover:text-accent-orange transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </Link>

          <Link
            href="/"
            onClick={onNavigateHome}
            className="font-primary text-xl font-extrabold tracking-[-0.05em] text-ink select-none hover:opacity-80 transition-opacity"
          >
            SCROWPOINT<span className="text-accent-orange">.</span>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="my-auto py-8 px-4 sm:px-6">
        <AuthForm mode="register" onSubmitSuccess={onSuccess} />
      </div>

      {/* Strategy 2: Clean & Distraction-Free Minimalist Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
