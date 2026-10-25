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
          "rounded-[4px] border border-[#22c55e]/30 bg-[#22c55e]/10 p-4 flex items-center justify-between",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#22c55e] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-primary text-xs font-bold text-[#15803d]">
                Government ID Verified
              </span>
              <span className="font-mono text-[9px] bg-white border border-[#22c55e]/30 text-[#15803d] px-1.5 py-0.2 rounded-[2px] font-bold">
                SmileID NIN
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#64748b] mt-0.5">
              NIN: •••••••{ninLast4} • Verified {verifiedAt}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-[#15803d]">Active Seal</span>
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
