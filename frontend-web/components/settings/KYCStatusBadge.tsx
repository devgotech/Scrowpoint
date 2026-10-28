"use client";

import React from "react";
import { CheckCircle2, Clock, Shield, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * KYCStatusBadge Component (Phase 5 §1 - Settings & Profile)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Renders verified, pending, or unverified biometric status badge.
 * - Token Compliance: 4px badges, trust green (#22c55e) or warning amber (#ecc94b).
 */

export type KycStatus = "verified" | "pending" | "rejected" | "unverified";

export interface KYCStatusBadgeProps {
  status: KycStatus;
  ninLast4?: string;
  verifiedAt?: string;
  className?: string;
}

export function KYCStatusBadge({
  status = "verified",
  ninLast4 = "8492",
  verifiedAt = "Oct 2026",
  className,
}: KYCStatusBadgeProps) {
  if (status === "verified") {
    return (
      <div
        className={cn(
          "grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 gap-y-3 rounded-[4px] border border-[#22c55e]/30 bg-[#22c55e]/10 p-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-y-1",
          className
        )}
      >
        {/* Verification icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#22c55e] text-white sm:row-span-2">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>

        {/* Title and provider */}
        <div className="col-start-2 flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="font-primary text-xs font-bold leading-4 text-[#15803d]">
            Government ID Verified
          </span>

          <span className="shrink-0 whitespace-nowrap rounded-[2px] border border-[#22c55e]/30 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold leading-3 text-[#15803d]">
            SmileID NIN
          </span>
        </div>

        {/* Details: separate lines on mobile, single line on desktop */}
        <div className="col-span-2 m-0 flex min-w-0 flex-col gap-1 font-mono text-[11px] leading-4 text-[#64748b] sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:flex-row sm:flex-wrap sm:gap-x-1.5">
          <span className="whitespace-nowrap">NIN: •••••••{ninLast4}</span>
          <span className="hidden sm:inline" aria-hidden="true">
            •
          </span>
          <span className="whitespace-nowrap">Verified {verifiedAt}</span>
        </div>

        {/* Status footer on mobile; trailing status on desktop */}
        <div className="col-span-2 flex items-center gap-1.5 border-t border-[#22c55e]/20 pt-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:row-span-2 sm:ml-3 sm:border-0 sm:pt-0">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap font-mono text-xs font-bold text-[#15803d]">
            Active Seal
          </span>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        className={cn(
          "rounded-[4px] border border-[#ecc94b]/40 bg-[#ecc94b]/15 p-4 flex items-center justify-between",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#ecc94b] text-[#020617]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="font-primary text-xs font-bold text-[#975a16]">
              Verification Under Review
            </span>
            <p className="font-secondary text-[11px] text-[#64748b] mt-0.5">
              SmileID is processing your 3D selfie and NIN records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[4px] border border-[#f56565]/30 bg-[#f56565]/10 p-4 flex items-center justify-between",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#f56565] text-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <span className="font-primary text-xs font-bold text-[#c53030]">
            Identity Unverified
          </span>
          <p className="font-secondary text-[11px] text-[#64748b] mt-0.5">
            Complete biometric KYC to enable gadget listings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default KYCStatusBadge;
