"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DashboardUtilityBar } from "@/components/footers";
import { AvatarChangeCard } from "@/components/settings/AvatarChangeCard";
import { KYCStatusBadge } from "@/components/settings/KYCStatusBadge";
import { ProfileDetailsForm } from "@/components/settings/ProfileDetailsForm";
import { SecuritySettings } from "@/components/settings/SecuritySettings";

/**
 * Screen: Dashboard Settings & Profile (Phase 5 §1)
 * Route: app/(protected)/settings/profile/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: AvatarChangeCard, ProfileDetailsForm, SecuritySettings (2FA), KYCStatusBadge.
 * - Architecture Link: CRUD REST endpoints on Go core to update user Postgres records.
 * - Responsive: Works across mobile (<640px), tablet (640-1024px), and desktop.
 */

export interface SettingsProfilePageProps {
  onNavigateHome?: () => void;
  onNavigateVerifyIdentity?: () => void;
}

export default function SettingsProfilePage({
  onNavigateHome,
  onNavigateVerifyIdentity,
}: SettingsProfilePageProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12 pb-24 md:pb-12">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* Breadcrumb Header */}
          <div className="pb-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Marketplace</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a]">
                Account Settings
              </span>
            </div>
            <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
              User Profile & Security
            </h1>
            <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-0.5">
              Manage your verified merchant identity, avatar headshot, bank settlements, and multi-factor authentication.
            </p>
          </div>

          {/* 1. Responsive Avatar Changer Card */}
          <AvatarChangeCard />

          {/* 2. KYC Status Badge */}
          <KYCStatusBadge status="verified" ninLast4="8492" verifiedAt="Oct 15, 2026" />

          {/* 3. Profile & Store Identity Form */}
          <ProfileDetailsForm onSave={(data) => console.log("Profile updated:", data)} />

          {/* 4. Security & 2FA */}
          <SecuritySettings />
        </div>
      </main>

      {/* Strategy 3: Compact Utility Bar for Account Settings */}
      <DashboardUtilityBar />
    </div>
  );
}
