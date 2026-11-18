"use client";

import React, { useState } from "react";
import { KeyRound, Lock, Smartphone } from "lucide-react";
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
        "border border-ink-faint bg-surface p-6 space-y-6 rounded-card",
        className
      )}
    >
      <div className="pb-4 border-b border-ink-faint">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-ink" />
          <h3 className="font-primary text-base font-bold text-ink tracking-[-0.03em]">
            Security & Authentication
          </h3>
        </div>
        <p className="font-secondary text-xs text-ink/65 mt-1">
          Manage multi-factor authentication and active escrow authorization protocols.
        </p>
      </div>

      {/* 2FA Toggle */}
      <div className="border border-ink-faint bg-paper p-4 flex items-center justify-between rounded-card">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-surface border border-ink-faint text-ink shrink-0 mt-0.5 rounded-ui">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="font-primary text-xs font-bold text-ink">
              Two-Factor Authentication (2FA)
            </div>
            <div className="font-secondary text-meta text-ink/65 leading-relaxed">
              Require SMS / Authenticator confirmation when releasing escrow funds or withdrawing.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            twoFactorEnabled ? "bg-trust" : "bg-ink/25"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out",
              twoFactorEnabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Session Protection */}
      <div className="border border-ink-faint bg-paper p-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-surface border border-ink-faint text-ink shrink-0 mt-0.5 rounded-ui">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="font-primary text-xs font-bold text-ink">
              Strict Escrow Session Locking
            </div>
            <div className="font-secondary text-meta text-ink/65 leading-relaxed">
              Automatically logs out sessions after 30 minutes of inactivity to protect vault funds.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSessionProtection(!sessionProtection)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            sessionProtection ? "bg-trust" : "bg-ink/25"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out",
              sessionProtection ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;
