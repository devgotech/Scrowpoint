"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { MinimalistAuthFooter } from "@/components/footers";

/**
 * Screen 5: Authentication Entry - Login (Phase 2 §1)
 * Route: app/(auth)/login/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - AuthForm with Geist 14px FormHelperText.
 * - Mobile responsive centered layout with brand badge.
 * - Strategy 2: Minimalist Auth Footer (Single row, locale selector, privacy/terms).
 */

export interface LoginPageProps {
  onSuccess?: () => void;
  onNavigateRegister?: () => void;
  onNavigateHome?: () => void;
}

export default function LoginPage({
  onSuccess,
  onNavigateRegister,
  onNavigateHome,
}: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col justify-between antialiased font-secondary">
      {/* Top Bar with Home Link & Logo */}
      <div className="w-full border-b border-[#e2e8f0] bg-white py-3.5 px-4 sm:px-6">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <Link
            href="/"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
              <Shield className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-primary text-xs font-bold text-[#020617]">Buyer's High</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="my-auto py-8 px-4 sm:px-6">
        <AuthForm mode="login" onSubmitSuccess={onSuccess} />
      </div>

      {/* Strategy 2: Clean & Distraction-Free Minimalist Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
