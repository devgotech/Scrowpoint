"use client";

import React, { useState } from "react";
import { KeyRound, Lock, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SecuritySettings Component (Phase 5 §1 - Settings & Profile)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Two-Factor Authentication (2FA) toggle, SMS / Authenticator app.
 * - Password update section.
 * - Token Compliance: 8px container radius, 4px controls, 200ms ease-out transitions.
 */

export interface SecuritySettingsProps {
  className?: string;
}

export function SecuritySettings({ className }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionProtection, setSessionProtection] = useState(true);

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white p-6 space-y-6",
        className
      )}
    >
      <div className="pb-4 border-b border-[#111113]/12">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#111113]" />
          <h3 className="font-primary text-base font-bold text-[#111113] tracking-[-0.03em]">
            Security & Authentication
          </h3>
        </div>
        <p className="font-secondary text-xs text-[#111113]/65 mt-1">
          Manage multi-factor authentication and active escrow authorization protocols.
        </p>
      </div>

      {/* 2FA Toggle */}
      <div className="border border-[#111113]/12 bg-[#F8F7F4] p-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-white border border-[#111113]/12 text-[#111113] shrink-0 mt-0.5">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="font-primary text-xs font-bold text-[#111113]">
              Two-Factor Authentication (2FA)
            </div>
            <div className="font-secondary text-[11px] text-[#111113]/65 leading-relaxed">
              Require SMS / Authenticator confirmation when releasing escrow funds or withdrawing.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            twoFactorEnabled ? "bg-[#22c55e]" : "bg-[#111113]/25"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out",
              twoFactorEnabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Session Protection */}
      <div className="border border-[#111113]/12 bg-[#F8F7F4] p-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-white border border-[#111113]/12 text-[#111113] shrink-0 mt-0.5">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="font-primary text-xs font-bold text-[#111113]">
              Strict Escrow Session Locking
            </div>
            <div className="font-secondary text-[11px] text-[#111113]/65 leading-relaxed">
              Automatically logs out sessions after 30 minutes of inactivity to protect vault funds.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSessionProtection(!sessionProtection)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            sessionProtection ? "bg-[#22c55e]" : "bg-[#111113]/25"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out",
              sessionProtection ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;
