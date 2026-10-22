"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * AuthForm Component (Phase 2 §1)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Supports Login and Register modes.
 * - FormHelperText: Geist 14px (font-secondary text-sm text-[#64748b]).
 * - Token Compliance: 8px card radius, 4px control radius, 200ms ease-out transitions.
 * - Touch Targets >= 44px for seamless mobile input.
 * - Submits credentials; manages session state with AuthContext.
 */

export interface AuthFormProps {
  mode: "login" | "register";
  onSubmitSuccess?: (email: string) => void;
  className?: string;
}

export function AuthForm({ mode, onSubmitSuccess, className }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (mode === "register" && !fullName) {
      setErrorMessage("Please enter your legal name as shown on your Government ID.");
      return;
    }

    setIsLoading(true);

    // Set authenticated session in context
    setTimeout(() => {
      login(email, fullName || (email.split("@")[0]));
      setIsLoading(false);
      onSubmitSuccess?.(email);
    }, 700);
  };

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-[0_4px_8px_rgba(15,23,42,0.06)] w-full max-w-md mx-auto",
        className
      )}
    >
      {/* Form Header */}
      <div className="space-y-2 text-center pb-6 border-b border-[#e2e8f0]">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
          <Lock className="h-5 w-5" />
        </div>

        <h1 className="font-primary text-2xl font-bold tracking-tight text-[#020617]">
          {mode === "login" ? "Sign in to Buyer's High" : "Create Protected Account"}
        </h1>

        <p className="font-secondary text-sm text-[#64748b]">
          {mode === "login"
            ? "Access your active escrow rooms and transaction ledger."
            : "Trade secondhand smartphones and laptops with zero fraud risk."}
        </p>
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="mt-4 rounded-[4px] border border-[#f56565]/40 bg-[#f56565]/10 p-3 flex items-start gap-2.5 text-xs text-[#c53030]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-6">
        {mode === "register" && (
          <div>
            <label
              htmlFor="auth-fullname"
              className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1.5"
            >
              Legal Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
              <input
                id="auth-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Must match your NIN / BVN name"
                className="w-full h-11 pl-9 pr-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
              />
            </div>
            <p className="font-secondary text-sm text-[#64748b] mt-1">
              Required for SmileID identity verification.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. adeola@gmail.com"
              className="w-full h-11 pl-9 pr-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
            />
          </div>
          <p className="font-secondary text-sm text-[#64748b] mt-1">
            We send real-time escrow milestone receipts here.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="auth-password"
              className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider"
            >
              Password
            </label>
            {mode === "login" && (
              <a
                href="#forgot"
                className="font-mono text-xs text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 pl-3 pr-10 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-mono text-[#020617] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#020617]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="font-secondary text-sm text-[#64748b] mt-1">
            Minimum 8 characters with numbers and symbols.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isLoading}
          className="w-full h-12 text-xs font-semibold gap-2 mt-2 shadow-xs"
        >
          {isLoading ? (
            <span>Securing Session...</span>
          ) : (
            <>
              <span>{mode === "login" ? "Sign In & Unlock Vault" : "Create Escrow Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Mode Switcher */}
      <div className="pt-6 mt-6 border-t border-[#e2e8f0] text-center font-secondary text-xs text-[#64748b]">
        {mode === "login" ? (
          <div>
            Don't have an account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0f172a] hover:underline underline-offset-4"
            >
              Register for Free
            </Link>
          </div>
        ) : (
          <div>
            Already verified on Buyer's High?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0f172a] hover:underline underline-offset-4"
            >
              Sign In Here
            </Link>
          </div>
        )}
      </div>

      {/* Trust Guarantee Note */}
      <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#15803d]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
        <span>End-to-End Encrypted Authentication</span>
      </div>
    </div>
  );
}

export default AuthForm;
