"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MinimalistAuthFooter } from "@/components/footers";
import { useAuth } from "@/src/context/AuthContext";
import { navigate } from "@/next/navigation";
import { cn } from "@/lib/utils";

/**
 * Screen: Forgot Password & Cryptographic Password Reset Flow
 * Route: app/(auth)/forgot-password/page.tsx
 *
 * Backend Endpoints (`core-backend/internal/api/handlers/auth_handler.go`):
 * - Stage 1: `POST /api/auth/request-password-reset` -> `{ email }`
 * - Stage 2: `POST /api/auth/reset-password` -> `{ token, newPassword }`
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113), Vermilion (#FF5A25)
 */

export interface ForgotPasswordPageProps {
  initialEmail?: string;
  onBackToLogin?: () => void;
  onResetSuccess?: (email: string) => void;
  onNavigateHome?: () => void;
}

type RecoveryStep = "request" | "verify_and_reset" | "completed";

const DEMO_RESET_OTP = "842915";

export default function ForgotPasswordPage({
  initialEmail = "",
  onBackToLogin,
  onResetSuccess,
  onNavigateHome,
}: ForgotPasswordPageProps) {
  const { requestPasswordReset, resetPasswordWithToken, login } = useAuth();

  const [step, setStep] = useState<RecoveryStep>("request");
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  // Password policy checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperAndLower =
    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  // Stage 1: Dispatch Reset Token (`POST /api/auth/request-password-reset`)
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusBanner(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter the email address linked to your Scrowpoint account.");
      return;
    }

    setIsSubmitting(true);
    await requestPasswordReset(cleanEmail);
    setIsSubmitting(false);
    setResendCooldown(60);
    setStep("verify_and_reset");
    setStatusBanner(
      `A 6-digit recovery code has been dispatched to ${cleanEmail}.`
    );
  };

  // OTP Box Change & Keyboard Navigation
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleFillDemoOtp = () => {
    setOtpDigits(DEMO_RESET_OTP.split(""));
    setErrorMessage(null);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    await requestPasswordReset(email);
    setResendCooldown(60);
    setStatusBanner(`New recovery code dispatched to ${email.trim()}.`);
  };

  // Stage 2: Verify OTP & Update Password (`POST /api/auth/reset-password`)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const tokenCode = otpDigits.join("");
    if (tokenCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit recovery code sent to your email.");
      return;
    }

    if (!hasMinLength) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password do not match.");
      return;
    }

    setIsSubmitting(true);
    await resetPasswordWithToken(tokenCode, newPassword);
    setIsSubmitting(false);
    setStep("completed");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col justify-between antialiased font-secondary selection:bg-[#FF5A25] selection:text-white">
      {/* Top Bar with Back Link & Wordmark */}
      <div className="w-full border-b border-[#111113]/12 bg-white py-3.5 px-4 sm:px-6">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (onBackToLogin) {
                onBackToLogin();
              } else {
                navigate("/login");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-[#111113]/65 hover:text-[#FF5A25] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </button>

          <Link
            href="/"
            onClick={onNavigateHome}
            className="font-primary text-xl font-extrabold tracking-[-0.05em] text-[#111113] select-none hover:opacity-80 transition-opacity"
          >
            SCROWPOINT<span className="text-[#FF5A25]">.</span>
          </Link>
        </div>
      </div>

      {/* Main Recovery Card */}
      <div className="my-auto py-8 px-4 sm:px-6">
        <div className="border border-[#111113]/12 bg-white p-6 sm:p-8 w-full max-w-md mx-auto">
          {/* Step Progress Strip */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#111113]/60 mb-2">
              <span
                className={cn(
                  step === "request" && "text-[#111113] font-bold"
                )}
              >
                01. Request Code
              </span>
              <span>→</span>
              <span
                className={cn(
                  step === "verify_and_reset" && "text-[#FF5A25] font-bold"
                )}
              >
                02. Verify OTP &amp; Reset
              </span>
              <span>→</span>
              <span
                className={cn(
                  step === "completed" && "text-[#15803d] font-bold"
                )}
              >
                03. Vault Unlocked
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 h-1">
              <div className="bg-[#111113]" />
              <div
                className={cn(
                  "transition-colors",
                  step === "verify_and_reset" || step === "completed"
                    ? "bg-[#FF5A25]"
                    : "bg-[#111113]/12"
                )}
              />
              <div
                className={cn(
                  "transition-colors",
                  step === "completed" ? "bg-[#22c55e]" : "bg-[#111113]/12"
                )}
              />
            </div>
          </div>

          {/* =================================================================
              STAGE 1: REQUEST PASSWORD RESET (`POST /api/auth/request-password-reset`)
              ================================================================= */}
          {step === "request" && (
            <>
              <div className="space-y-2 text-center pb-6 border-b border-[#111113]/12">
                <div className="mx-auto flex h-10 w-10 items-center justify-center bg-[#111113] text-white">
                  <KeyRound className="h-5 w-5 text-[#FF5A25]" />
                </div>

                <h1 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
                  Recover Escrow Account
                </h1>

                <p className="font-secondary text-sm text-[#111113]/65">
                  Enter your registered email address to receive a 6-digit
                  cryptographic recovery code.
                </p>
              </div>

              {errorMessage && (
                <div className="mt-4 border border-[#f56565]/40 bg-[#f56565]/10 p-3 flex items-start gap-2.5 text-xs text-[#c53030]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-4 pt-6">
                <div>
                  <label htmlFor="reset-email" className="label block mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111113]/50" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. chidi.okafor@scrowpoint.ng"
                      className="w-full h-11 pl-9 pr-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                    />
                  </div>
                  <p className="font-secondary text-xs text-[#111113]/60 mt-1.5">
                    Note: For security, active escrow payouts are paused for 24h
                    following a password reset.
                  </p>
                </div>

                {/* Quick Fill Demo Account Email */}
                <div className="p-3 bg-[#F8F7F4] border border-[#111113]/12 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/60">
                      Testing Recovery Flow?
                    </p>
                    <p className="font-mono text-xs text-[#111113] truncate">
                      chidi.okafor@scrowpoint.ng
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmail("chidi.okafor@scrowpoint.ng")}
                    className="px-2.5 py-1.5 bg-white border border-[#111113]/15 hover:border-[#111113] text-[11px] font-mono uppercase tracking-wider text-[#111113] transition-colors shrink-0 cursor-pointer"
                  >
                    Use Email
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full text-xs font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <span>Dispatching Recovery Code...</span>
                  ) : (
                    <>
                      <span>Send 6-Digit Recovery Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* =================================================================
              STAGE 2: VERIFY 6-DIGIT OTP & SET NEW PASSWORD (`POST /api/auth/reset-password`)
              ================================================================= */}
          {step === "verify_and_reset" && (
            <>
              <div className="space-y-2 text-center pb-5 border-b border-[#111113]/12">
                <div className="mx-auto flex h-10 w-10 items-center justify-center bg-[#111113] text-white">
                  <Lock className="h-5 w-5 text-[#FF5A25]" />
                </div>

                <h1 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
                  Enter Recovery OTP
                </h1>

                <p className="font-secondary text-xs text-[#111113]/70">
                  We sent a 6-digit verification code to{" "}
                  <span className="font-mono font-semibold text-[#111113]">
                    {email}
                  </span>
                </p>
              </div>

              {statusBanner && (
                <div className="mt-4 border border-[#15803d]/30 bg-[#22c55e]/10 p-3 flex items-center justify-between gap-2 text-xs text-[#15803d]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{statusBanner}</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 border border-[#f56565]/40 bg-[#f56565]/10 p-3 flex items-start gap-2.5 text-xs text-[#c53030]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-5 pt-5">
                {/* 6-Digit OTP Input Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label">6-Digit Recovery Code</label>
                    <button
                      type="button"
                      onClick={handleFillDemoOtp}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FF5A25] hover:underline cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Auto-Fill Demo OTP ({DEMO_RESET_OTP})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        aria-label={`Recovery code digit ${idx + 1}`}
                        className="h-12 w-full text-center font-mono text-lg font-bold text-[#111113] border border-[#111113]/20 bg-[#F8F7F4]/60 focus:bg-white focus:border-[#111113] focus:ring-1 focus:ring-[#111113] outline-none transition-colors"
                      />
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#111113]/60">
                    <button
                      type="button"
                      onClick={() => setStep("request")}
                      className="hover:text-[#111113] underline underline-offset-4 cursor-pointer"
                    >
                      Change email address
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendCode}
                      className={cn(
                        "inline-flex items-center gap-1",
                        resendCooldown > 0
                          ? "opacity-50 cursor-not-allowed"
                          : "text-[#111113] hover:text-[#FF5A25] cursor-pointer"
                      )}
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Code"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* New Password Input */}
                <div>
                  <label htmlFor="new-password" className="label block mb-1.5">
                    New Vault Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-3 pr-10 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111113]/50 hover:text-[#111113]"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Live 4-Checkpoint Password Policy Checklist */}
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-2.5 bg-[#F8F7F4] border border-[#111113]/10 text-[11px] font-mono">
                    <div
                      className={cn(
                        "flex items-center gap-1.5",
                        hasMinLength ? "text-[#15803d] font-semibold" : "text-[#111113]/50"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>8+ Characters</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5",
                        hasUpperAndLower
                          ? "text-[#15803d] font-semibold"
                          : "text-[#111113]/50"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>Upper &amp; Lower</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5",
                        hasNumber ? "text-[#15803d] font-semibold" : "text-[#111113]/50"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>Number (0–9)</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5",
                        hasSymbol ? "text-[#15803d] font-semibold" : "text-[#111113]/50"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>Symbol (!@#$)</span>
                    </div>
                  </div>
                </div>

                {/* Confirm New Password Input */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="label block mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full h-11 px-3 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                  />
                  {confirmPassword.length > 0 && (
                    <p
                      className={cn(
                        "mt-1 font-mono text-[11px]",
                        passwordsMatch ? "text-[#15803d]" : "text-[#c53030]"
                      )}
                    >
                      {passwordsMatch
                        ? "✓ Passwords match"
                        : "Passwords do not match yet"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full text-xs font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <span>Updating Cryptographic Hash...</span>
                  ) : (
                    <>
                      <span>Verify Code &amp; Update Password</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* =================================================================
              STAGE 3: PASSWORD RESET COMPLETED
              ================================================================= */}
          {step === "completed" && (
            <div className="space-y-6 pt-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#22c55e]/15 border border-[#15803d]/30 text-[#15803d]">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#15803d] font-bold">
                  PASSWORD_HASH_ROTATED // 200 OK
                </span>
                <h1 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
                  Vault Password Updated
                </h1>
                <p className="font-secondary text-sm text-[#111113]/70">
                  Your password for{" "}
                  <span className="font-mono font-semibold text-[#111113]">
                    {email}
                  </span>{" "}
                  has been reset and all older device sessions have been
                  revoked.
                </p>
              </div>

              <div className="p-4 bg-[#F8F7F4] border border-[#111113]/12 text-left space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#111113]/60">Account ID:</span>
                  <span className="text-[#111113] font-semibold">{email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#111113]/60">Previous Sessions:</span>
                  <span className="text-[#15803d] font-semibold">
                    Revoked &amp; Cleared
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#111113]/60">Encryption:</span>
                  <span className="text-[#111113]">bcrypt cost=10 + JWT</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  onClick={() => {
                    login(email, email.split("@")[0], "seller");
                    if (onResetSuccess) {
                      onResetSuccess(email);
                    } else {
                      navigate("/marketplace");
                    }
                  }}
                  className="w-full h-12 rounded-full text-xs font-semibold gap-2"
                >
                  <span>Sign In Now &amp; Open Vault</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    if (onBackToLogin) {
                      onBackToLogin();
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="w-full py-2.5 text-xs font-mono uppercase tracking-wider text-[#111113]/70 hover:text-[#111113] cursor-pointer"
                >
                  Return to Sign In Screen
                </button>
              </div>
            </div>
          )}

          {/* Footer Security Note */}
          <div className="mt-6 pt-4 border-t border-[#111113]/12 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#15803d]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
            <span>Zero-Knowledge Password Recovery Protocol</span>
          </div>
        </div>
      </div>

      <MinimalistAuthFooter />
    </div>
  );
}
