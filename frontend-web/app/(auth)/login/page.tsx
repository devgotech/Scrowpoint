"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { MinimalistAuthFooter } from "@/components/footers";

/**
 * Screen 5: Authentication Entry - Login (Phase 2 §1)
 * Route: app/(auth)/login/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 */

export interface LoginPageProps {
  onSuccess?: () => void;
  onNavigateRegister?: () => void;
  onNavigateForgotPassword?: (email?: string) => void;
  onNavigateHome?: () => void;
}

export default function LoginPage({
  onSuccess,
  onNavigateForgotPassword,
  onNavigateHome,
}: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col justify-between antialiased font-secondary selection:bg-[#FF5A25] selection:text-white">
      {/* Top Bar with Home Link & Logo */}
      <div className="w-full border-b border-[#111113]/12 bg-white py-3.5 px-4 sm:px-6">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <Link
            href="/"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </Link>

          <Link
            href="/"
            onClick={onNavigateHome}
            className="font-primary text-xl font-extrabold tracking-[-0.05em] text-[#111113] select-none hover:opacity-80 transition-opacity"
          >
            SCROWPOINT<span className="text-[#FF5A25]">.</span>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="my-auto py-8 px-4 sm:px-6">
        <AuthForm
          mode="login"
          onSubmitSuccess={onSuccess}
          onForgotPasswordClick={onNavigateForgotPassword}
        />
      </div>

      {/* Strategy 2: Clean & Distraction-Free Minimalist Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
