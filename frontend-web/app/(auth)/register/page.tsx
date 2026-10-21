"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

/**
 * Screen 5 (Variant): Authentication Entry - Register (Phase 2 §1)
 * Route: app/(auth)/register/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Legal name verification requirement.
 * - Geist 14px helper notes.
 * - Responsive layout with mobile touch safety.
 */

export interface RegisterPageProps {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export default function RegisterPage({
  onSuccess,
  onNavigateLogin,
  onNavigateHome,
}: RegisterPageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col justify-between p-4 sm:p-6 antialiased font-secondary">
      {/* Top Bar with Home Link & Logo */}
      <div className="mx-auto w-full max-w-md flex items-center justify-between py-4">
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

      {/* Main Card */}
      <div className="my-auto py-6">
        <AuthForm mode="register" onSubmitSuccess={onSuccess} />
      </div>

      {/* Footer Assurance */}
      <div className="mx-auto w-full max-w-md text-center py-4 text-xs font-mono text-[#64748b]">
        Zero Tolerance for Counterfeit Gadgets • Powered by SmileID Biometrics
      </div>
    </div>
  );
}
