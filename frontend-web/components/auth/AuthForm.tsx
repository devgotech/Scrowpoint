"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAuth,
  type OAuthProviderType,
  type UserRole,
} from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * AuthForm Component (Phase 2 §1)
 *
 * Complete Authentication Lifecycle synced with Go Backend (`auth_handler.go` & `auth_service.go`):
 * 1. Third-Party OAuth (`POST /api/auth/oauth/google` & `POST /api/auth/oauth/facebook`)
 * 2. Manual Registration Multi-Stage Flow:
 *    - Stage 1: Account Credentials (`POST /api/auth/register`)
 *    - Stage 2: 6-Digit Email OTP Verification (`POST /api/auth/verify-email` & `POST /api/auth/resend-verification`)
 *    - Stage 3: Account Activated & SmileID KYC Onboarding Handoff (`/verify-identity`)
 * 3. Login Flow (`POST /api/auth/login`) + Quick Role Presets + Forgot Password navigation (`/forgot-password`)
 */

export interface AuthFormProps {
  mode: "login" | "register";
  onSubmitSuccess?: (email: string) => void;
  onForgotPasswordClick?: (email?: string) => void;
  className?: string;
}

type RegistrationStage = "credentials" | "verify_email_otp" | "onboarding_ready";

const DEMO_EMAIL_OTP = "492810";

const TRADING_LOCATIONS = [
  "Lagos — Ikeja / Computer Village",
  "Lagos — Lekki Phase 1 / VI",
  "Lagos — Yaba / Surulere",
  "Abuja (FCT) — Wuse 2 / Maitama",
  "Port Harcourt — GRA Phase 2",
  "Ibadan — Bodija / Ring Road",
  "Enugu / Onitsha",
];

interface OAuthPresetAccount {
  name: string;
  email: string;
  role: UserRole;
  badge: string;
  providerUid: string;
  avatarUrl: string;
}

const OAUTH_PRESET_ACCOUNTS: Record<OAuthProviderType, OAuthPresetAccount[]> = {
  google: [
    {
      name: "Chidi Okafor",
      email: "chidi.okafor@gmail.com",
      role: "seller",
      badge: "Verified Merchant • Ikeja, Lagos",
      providerUid: "google-oauth2|109482716501928374",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Fatima Bello",
      email: "fatima.bello@gmail.com",
      role: "buyer",
      badge: "Verified Buyer • Wuse 2, Abuja",
      providerUid: "google-oauth2|104829103847561920",
      avatarUrl:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
    },
  ],
  facebook: [
    {
      name: "Babatunde Adeleke",
      email: "b.adeleke@facebook.com",
      role: "seller",
      badge: "Facebook Verified • Lekki Phase 1",
      providerUid: "facebook|10228491029384756",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Ngozi Madu",
      email: "ngozi.madu@yahoo.com",
      role: "buyer",
      badge: "Facebook Verified • Victoria Island",
      providerUid: "facebook|10159384726152940",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    },
  ],
};

function GoogleLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

function FacebookLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"
      />
    </svg>
  );
}

export function AuthForm({
  mode,
  onSubmitSuccess,
  onForgotPasswordClick,
  className,
}: AuthFormProps) {
  const router = useRouter();
  const [regStage, setRegStage] = useState<RegistrationStage>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(TRADING_LOCATIONS[0]);
  const [role, setRole] = useState<UserRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewAccount, setIsPreviewAccount] = useState(false);

  // Email OTP state (Stage 2 of Manual Registration)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpStatusBanner, setOtpStatusBanner] = useState<string | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OAuth Modal state
  const [oauthProviderModal, setOauthProviderModal] =
    useState<OAuthProviderType | null>(null);
  const [oauthCustomEmail, setOauthCustomEmail] = useState("");
  const [oauthCustomName, setOauthCustomName] = useState("");
  const [isOauthSubmitting, setIsOauthSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    login,
    oauthLogin,
    verifyEmailToken,
    resendVerificationEmail,
    setUser,
    user,
  } = useAuth();

  const continueAfterLogin = (authenticatedEmail: string, authenticatedRole: UserRole) => {
    if (onSubmitSuccess) {
      onSubmitSuccess(authenticatedEmail);
      return;
    }

    const defaultPath =
      authenticatedRole === "admin"
        ? "/admin/dashboard"
        : authenticatedRole === "seller"
          ? "/seller/dashboard"
          : "/marketplace";
    const requestedPath = new URLSearchParams(window.location.search).get("redirect");
    const safeRequestedPath =
      requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : null;
    const roleMatchesPath =
      authenticatedRole === "admin"
        ? safeRequestedPath?.startsWith("/admin/")
        : authenticatedRole === "seller"
          ? safeRequestedPath?.startsWith("/seller/")
          : safeRequestedPath === "/marketplace";

    router.push(roleMatchesPath && safeRequestedPath ? safeRequestedPath : defaultPath);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  // Password policy checks for registration
  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // OTP Box Handlers
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

  /**
   * Dispatches POST /api/auth/oauth/{provider} with { email, name, providerUid }
   */
  const handleExecuteOAuth = async (
    provider: OAuthProviderType,
    account: {
      email: string;
      name: string;
      providerUid: string;
      role?: UserRole;
      avatarUrl?: string;
    }
  ) => {
    setErrorMessage(null);
    setIsOauthSubmitting(true);

    try {
      const authenticatedUser = await oauthLogin(provider, {
        email: account.email,
        name: account.name,
        providerUid: account.providerUid,
        role: mode === "register" ? role : account.role || "seller",
        avatarUrl: account.avatarUrl,
      });

      setOauthProviderModal(null);
      setEmail(authenticatedUser.email);
      setFullName(authenticatedUser.name);

      if (mode === "register") {
        // OAuth auto-verifies email in Go backend (`EmailVerifiedAt: &now`),
        // so jump straight to Stage 3 (Onboarding & KYC Readiness)!
        setRegStage("onboarding_ready");
      } else {
        continueAfterLogin(authenticatedUser.email, authenticatedUser.role);
      }
    } catch {
      setErrorMessage(
        `Unable to complete ${
          provider === "google" ? "Google" : "Facebook"
        } OAuth handshake. Please try again.`
      );
    } finally {
      setIsOauthSubmitting(false);
    }
  };

  const handleCustomOAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthProviderModal) return;

    const cleanEmail = oauthCustomEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address for OAuth sign-in.");
      return;
    }

    const derivedName =
      oauthCustomName.trim() ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    void handleExecuteOAuth(oauthProviderModal, {
      email: cleanEmail,
      name: derivedName,
      providerUid: `${oauthProviderModal}-oauth2|${Date.now()}`,
      role,
    });
  };

  /**
   * Stage 1 Submit -> Calls POST /api/auth/login or POST /api/auth/register
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (mode === "register" && !fullName.trim()) {
      setErrorMessage(
        "Please enter your legal full name as shown on your Government ID."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split("@")[0];
    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const requestBody =
      mode === "login"
        ? { email: cleanEmail, password }
        : {
            email: cleanEmail,
            password,
            name: cleanName,
            fullName: cleanName,
            phone: phone.trim() || undefined,
            location,
            role,
          };

    let response: Response | null = null;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch {
      // Use the local preview account when the API is unreachable.
    }

    if (response && response.status !== 404) {
      let payload: {
        data?: { user?: Record<string, unknown>; token?: string };
        error?: string;
        message?: string;
      };
      try {
        payload = await response.json();
      } catch {
        setErrorMessage("The authentication service returned an invalid response.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setErrorMessage(
          payload.error || payload.message || "Unable to authenticate. Please try again."
        );
        setIsLoading(false);
        return;
      }

      const backendUser = payload.data?.user;
      if (!backendUser || typeof backendUser.id !== "string") {
        setErrorMessage("The authentication service did not return an account.");
        setIsLoading(false);
        return;
      }

      const backendRole: UserRole =
        backendUser.role === "admin" || backendUser.role === "seller"
          ? backendUser.role
          : "buyer";
      const authenticatedEmail =
        typeof backendUser.email === "string" ? backendUser.email : cleanEmail;
      const authenticatedName =
        typeof backendUser.name === "string" ? backendUser.name : cleanName;

      if (typeof window !== "undefined" && payload.data?.token) {
        localStorage.setItem("sp_auth_token", payload.data.token);
      }
      setIsPreviewAccount(false);
      setUser({
        id: backendUser.id,
        email: authenticatedEmail,
        name: authenticatedName,
        role: backendRole,
        phone: typeof backendUser.phone === "string" ? backendUser.phone : undefined,
        location:
          typeof backendUser.location === "string" ? backendUser.location : undefined,
        kycStatus:
          backendUser.kycStatus === "approved" ||
          backendUser.kycStatus === "rejected" ||
          backendUser.kycStatus === "manual_review_required"
            ? backendUser.kycStatus
            : "pending",
        emailVerifiedAt:
          typeof backendUser.emailVerifiedAt === "string"
            ? backendUser.emailVerifiedAt
            : null,
      });
      setIsLoading(false);

      if (mode === "register") {
        setResendCooldown(60);
        setOtpStatusBanner(
          `We sent a 6-digit verification code to ${cleanEmail}.`
        );
        setRegStage("verify_email_otp");
      } else {
        continueAfterLogin(authenticatedEmail, backendRole);
      }
      return;
    }

    setIsPreviewAccount(true);
    setTimeout(() => {
      const resolvedRole: UserRole =
        mode === "register"
          ? role
          : cleanEmail.includes("admin")
          ? "admin"
          : cleanEmail.includes("buyer")
          ? "buyer"
          : "seller";

      login(cleanEmail, cleanName, resolvedRole, {
        phone: phone.trim() || "+234 803 456 7890",
        location,
        emailVerifiedAt: mode === "register" ? null : new Date().toISOString(),
        kycStatus: mode === "register" ? "pending" : "approved",
      });
      setIsLoading(false);

      if (mode === "register") {
        setResendCooldown(60);
        setOtpStatusBanner(
          `We sent a 6-digit verification code to ${cleanEmail}.`
        );
        setRegStage("verify_email_otp");
      } else {
        continueAfterLogin(cleanEmail, resolvedRole);
      }
    }, 400);
  };

  /**
   * Stage 2 of Manual Registration: Verify Email OTP (`POST /api/auth/verify-email`)
   */
  const handleVerifyEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const code = otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter the full 6-digit verification code sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      if (isPreviewAccount && code === DEMO_EMAIL_OTP) {
        if (user) {
          setUser({ ...user, emailVerifiedAt: new Date().toISOString() });
        }
      } else {
        await verifyEmailToken(code);
      }
      setRegStage("onboarding_ready");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Email verification failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    try {
      await resendVerificationEmail();
      setResendCooldown(60);
      setOtpStatusBanner(`New verification code dispatched to ${email.trim()}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to resend the verification code."
      );
    }
  };

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white p-6 sm:p-8 w-full max-w-md mx-auto relative",
        className
      )}
    >
      {/* =====================================================================
          MULTI-STEP REGISTRATION PROGRESS BAR (Shown in Register Mode)
          ===================================================================== */}
      {mode === "register" && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#111113]/60 mb-2">
            <span
              className={cn(
                regStage === "credentials" && "text-[#111113] font-bold"
              )}
            >
              01. Account
            </span>
            <span>→</span>
            <span
              className={cn(
                regStage === "verify_email_otp" && "text-[#FF5A25] font-bold"
              )}
            >
              02. Email OTP
            </span>
            <span>→</span>
            <span
              className={cn(
                regStage === "onboarding_ready" && "text-[#15803d] font-bold"
              )}
            >
              03. KYC Setup
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-1">
            <div className="bg-[#111113]" />
            <div
              className={cn(
                "transition-colors",
                regStage === "verify_email_otp" ||
                  regStage === "onboarding_ready"
                  ? "bg-[#FF5A25]"
                  : "bg-[#111113]/12"
              )}
            />
            <div
              className={cn(
                "transition-colors",
                regStage === "onboarding_ready"
                  ? "bg-[#22c55e]"
                  : "bg-[#111113]/12"
              )}
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          STAGE 2 (REGISTER): EMAIL OTP VERIFICATION (`POST /api/auth/verify-email`)
          ===================================================================== */}
      {mode === "register" && regStage === "verify_email_otp" && (
        <div className="space-y-5">
          <div className="space-y-2 text-center pb-5 border-b border-[#111113]/12">
            <div className="mx-auto flex h-10 w-10 items-center justify-center bg-[#111113] text-white">
              <Mail className="h-5 w-5 text-[#FF5A25]" />
            </div>

            <h1 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
              Verify Your Email
            </h1>

            <p className="font-secondary text-xs text-[#111113]/70">
              Enter the 6-digit security code dispatched to{" "}
              <span className="font-mono font-semibold text-[#111113]">
                {email}
              </span>{" "}
              to activate your escrow ledger.
            </p>
          </div>

          {otpStatusBanner && (
            <div className="border border-[#15803d]/30 bg-[#22c55e]/10 p-3 flex items-center gap-2 text-xs text-[#15803d]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{otpStatusBanner}</span>
            </div>
          )}

          {errorMessage && (
            <div className="border border-[#f56565]/40 bg-[#f56565]/10 p-3 flex items-start gap-2.5 text-xs text-[#c53030]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyEmailOtpSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label">6-Digit Email OTP</label>
                {isPreviewAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(DEMO_EMAIL_OTP.split(""));
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FF5A25] hover:underline cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-Fill Demo OTP ({DEMO_EMAIL_OTP})</span>
                  </button>
                )}
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
                    aria-label={`Email OTP digit ${idx + 1}`}
                    className="h-12 w-full text-center font-mono text-lg font-bold text-[#111113] border border-[#111113]/20 bg-[#F8F7F4]/60 focus:bg-white focus:border-[#111113] focus:ring-1 focus:ring-[#111113] outline-none transition-colors"
                  />
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-[#111113]/60">
                <button
                  type="button"
                  onClick={() => setRegStage("credentials")}
                  className="hover:text-[#111113] underline underline-offset-4 cursor-pointer"
                >
                  Edit email address
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendEmailOtp}
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
                      : "Resend OTP"}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F8F7F4] border border-[#111113]/12 text-xs font-secondary text-[#111113]/75 space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#111113] font-bold">
                Why Email OTP is Mandatory
              </p>
              <p>
                Every Paystack escrow deposit receipt, 48-hour inspection alert,
                and courier waybill is cryptographically bound to this verified
                email address.
              </p>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isLoading}
              className="w-full h-12 rounded-full text-xs font-semibold gap-2"
            >
              {isLoading ? (
                <span>Verifying Email Token...</span>
              ) : (
                <>
                  <span>Verify Email &amp; Activate Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* =====================================================================
          STAGE 3 (REGISTER): ACCOUNT ACTIVATED & SMILEID KYC ONBOARDING READY
          ===================================================================== */}
      {mode === "register" && regStage === "onboarding_ready" && (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#22c55e]/15 border border-[#15803d]/30 text-[#15803d]">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#15803d] font-bold">
              EMAIL_VERIFIED // ESCROW_ACCOUNT_READY
            </span>
            <h1 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
              Welcome, {fullName || email.split("@")[0]}
            </h1>
            <p className="font-secondary text-xs text-[#111113]/70">
              Your Scrowpoint account is active. Complete your 60-second SmileID
              NIN/BVN biometric check to unlock full escrow limits.
            </p>
          </div>

          {/* Account Summary Ledger */}
          <div className="p-4 bg-[#F8F7F4] border border-[#111113]/12 text-left space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#111113]/60">Verified Email:</span>
              <span className="text-[#111113] font-semibold truncate max-w-[200px]">
                {email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111113]/60">Trading Role:</span>
              <span className="uppercase text-[#111113] font-bold">
                {role === "seller" ? "Verified Seller" : "Gadget Buyer"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#111113]/60">Primary Hub:</span>
              <span className="text-[#111113] truncate max-w-[200px]">
                {location}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-[#111113]/10">
              <span className="text-[#111113]/60">SmileID KYC Tier:</span>
              <span className="text-[#FF5A25] font-bold">
                Step 2 — Ready for Biometrics
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => {
                if (onSubmitSuccess) {
                  onSubmitSuccess(email);
                } else {
                  router.push("/verify-identity");
                }
              }}
              className="w-full h-12 rounded-full text-xs font-semibold gap-2"
            >
              <Fingerprint className="h-4 w-4 text-[#FF5A25]" />
              <span>Proceed to SmileID KYC Verification</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => {
                router.push(
                  role === "seller" ? "/seller/dashboard" : "/marketplace"
                );
              }}
              className="w-full py-2.5 border border-[#111113]/15 bg-white hover:bg-[#F8F7F4] text-xs font-mono uppercase tracking-wider text-[#111113]/75 hover:text-[#111113] transition-colors cursor-pointer"
            >
              {role === "seller"
                ? "Skip for Now & Open Seller Hub →"
                : "Skip for Now & Browse Marketplace →"}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STAGE 1: LOGIN OR MANUAL REGISTRATION CREDENTIALS
          ===================================================================== */}
      {(mode === "login" || regStage === "credentials") && (
        <>
          {/* Form Header */}
          <div className="space-y-2 text-center pb-6 border-b border-[#111113]/12">
            <div className="mx-auto flex h-10 w-10 items-center justify-center bg-[#111113] text-white">
              <Lock className="h-5 w-5" />
            </div>

            <h1 className="font-primary text-2xl font-bold tracking-[-0.04em] text-[#111113]">
              {mode === "login"
                ? "Sign in to Scrowpoint"
                : "Create Protected Account"}
            </h1>

            <p className="font-secondary text-sm text-[#111113]/65">
              {mode === "login"
                ? "Access your active escrow rooms and transaction ledger."
                : "Trade secondhand smartphones and laptops with zero fraud risk."}
            </p>
          </div>

          {/* Error Callout */}
          {errorMessage && (
            <div className="mt-4 border border-[#f56565]/40 bg-[#f56565]/10 p-3 flex items-start gap-2.5 text-xs text-[#c53030]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Third-Party OAuth Section (`POST /api/auth/oauth/{provider}`) */}
          <div className="pt-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="label">Instant OAuth Handshake</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#15803d]">
                Auto-Verifies Email
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isLoading || isOauthSubmitting}
                onClick={() => {
                  setErrorMessage(null);
                  setOauthProviderModal("google");
                }}
                className="h-11 px-4 border border-[#111113]/15 bg-[#F8F7F4]/70 hover:bg-[#111113] hover:text-white hover:border-[#111113] text-[#111113] transition-colors duration-200 flex items-center justify-center gap-2.5 text-xs font-primary font-semibold tracking-[-0.01em] cursor-pointer"
              >
                <GoogleLogoSvg />
                <span>
                  {mode === "login" ? "Google Sign In" : "Sign up with Google"}
                </span>
              </button>

              <button
                type="button"
                disabled={isLoading || isOauthSubmitting}
                onClick={() => {
                  setErrorMessage(null);
                  setOauthProviderModal("facebook");
                }}
                className="h-11 px-4 border border-[#111113]/15 bg-[#F8F7F4]/70 hover:bg-[#111113] hover:text-white hover:border-[#111113] text-[#111113] transition-colors duration-200 flex items-center justify-center gap-2.5 text-xs font-primary font-semibold tracking-[-0.01em] cursor-pointer"
              >
                <FacebookLogoSvg />
                <span>
                  {mode === "login"
                    ? "Facebook Sign In"
                    : "Sign up with Facebook"}
                </span>
              </button>
            </div>

            {/* Inline OAuth Account Picker / Consent Drawer */}
            {oauthProviderModal && (
              <div className="mt-3 border border-[#111113] bg-[#F8F7F4] p-4 space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#111113]/12 pb-2.5">
                  <div className="flex items-center gap-2">
                    {oauthProviderModal === "google" ? (
                      <GoogleLogoSvg />
                    ) : (
                      <FacebookLogoSvg />
                    )}
                    <div>
                      <p className="font-primary text-xs font-bold uppercase tracking-wider text-[#111113]">
                        {oauthProviderModal === "google"
                          ? "Google OAuth 2.0"
                          : "Facebook OAuth 2.0"}
                      </p>
                      <p className="font-mono text-[10px] text-[#111113]/60">
                        POST /api/auth/oauth/{oauthProviderModal}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOauthProviderModal(null)}
                    aria-label="Close OAuth account chooser"
                    className="h-7 w-7 flex items-center justify-center text-[#111113]/60 hover:text-[#111113] hover:bg-white border border-transparent hover:border-[#111113]/15 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="font-secondary text-xs text-[#111113]/75">
                  Select a verified{" "}
                  {oauthProviderModal === "google" ? "Google" : "Facebook"}{" "}
                  profile or enter your own account to authenticate:
                </p>

                <div className="space-y-2">
                  {OAUTH_PRESET_ACCOUNTS[oauthProviderModal].map((acct) => (
                    <button
                      key={acct.providerUid}
                      type="button"
                      disabled={isOauthSubmitting}
                      onClick={() =>
                        handleExecuteOAuth(oauthProviderModal, {
                          email: acct.email,
                          name: acct.name,
                          providerUid: acct.providerUid,
                          role: acct.role,
                          avatarUrl: acct.avatarUrl,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-[#111113]/15 hover:border-[#111113] transition-colors flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acct.avatarUrl}
                          alt={acct.name}
                          className="h-8 w-8 object-cover border border-[#111113]/15 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-primary text-xs font-bold text-[#111113] truncate group-hover:text-[#FF5A25] transition-colors">
                            {acct.name}
                          </p>
                          <p className="font-mono text-[11px] text-[#111113]/65 truncate">
                            {acct.email}
                          </p>
                          <p className="font-secondary text-[10px] text-[#15803d] truncate">
                            {acct.badge}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#111113]/40 group-hover:text-[#FF5A25] shrink-0 ml-2 transition-colors" />
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleCustomOAuthSubmit}
                  className="pt-2 border-t border-[#111113]/12 space-y-2"
                >
                  <label className="label block">
                    Or use another{" "}
                    {oauthProviderModal === "google" ? "Google" : "Facebook"}{" "}
                    email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={oauthCustomEmail}
                      onChange={(e) => setOauthCustomEmail(e.target.value)}
                      placeholder={
                        oauthProviderModal === "google"
                          ? "you@gmail.com"
                          : "you@facebook.com"
                      }
                      className="flex-1 h-9 px-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113]"
                    />
                    <button
                      type="submit"
                      disabled={isOauthSubmitting}
                      className="px-3.5 h-9 bg-[#111113] hover:bg-[#FF5A25] text-white font-primary text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      {isOauthSubmitting ? "Linking..." : "Continue"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={oauthCustomName}
                    onChange={(e) => setOauthCustomName(e.target.value)}
                    placeholder="Display Name (optional — e.g. Tunde Bakare)"
                    className="w-full h-8 px-3 border border-[#111113]/12 bg-white text-[11px] font-secondary text-[#111113] outline-none focus:border-[#111113]"
                  />
                </form>
              </div>
            )}
          </div>

          {/* Architectural Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[#111113]/12" />
            <span className="bg-white px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#111113]/50 shrink-0">
              {mode === "login"
                ? "Or sign in with email"
                : "Or register manually"}
            </span>
            <div className="w-full border-t border-[#111113]/12" />
          </div>

          {/* Quick Demo Credentials Bar in Login Mode (Matches api_tests.http) */}
          {mode === "login" && (
            <div className="mb-4 p-2.5 bg-[#F8F7F4] border border-[#111113]/12 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/60">
                Quick Fill:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("buyer@example.com");
                    setPassword("Password123!");
                  }}
                  className="px-2 py-1 bg-white border border-[#111113]/15 hover:border-[#111113] font-mono text-[10px] uppercase text-[#111113] transition-colors cursor-pointer"
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("seller@example.com");
                    setPassword("Password123!");
                  }}
                  className="px-2 py-1 bg-white border border-[#111113]/15 hover:border-[#111113] font-mono text-[10px] uppercase text-[#111113] transition-colors cursor-pointer"
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@buyershigh.com");
                    setPassword("AdminPassword123!");
                  }}
                  className="px-2 py-1 bg-white border border-[#111113]/15 hover:border-[#111113] font-mono text-[10px] uppercase text-[#111113] transition-colors cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Standard Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                {/* Primary Trading Role Selector */}
                <div>
                  <span className="label block mb-1.5">
                    Primary Account Role
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={cn(
                        "h-10 px-3 border text-xs font-primary font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                        role === "buyer"
                          ? "border-[#111113] bg-[#111113] text-white"
                          : "border-[#111113]/15 bg-[#F8F7F4]/60 text-[#111113]/75 hover:border-[#111113]/40"
                      )}
                    >
                      <CheckCircle2
                        className={cn(
                          "h-3.5 w-3.5",
                          role === "buyer" ? "text-[#FF5A25]" : "opacity-30"
                        )}
                      />
                      <span>Gadget Buyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={cn(
                        "h-10 px-3 border text-xs font-primary font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                        role === "seller"
                          ? "border-[#111113] bg-[#111113] text-white"
                          : "border-[#111113]/15 bg-[#F8F7F4]/60 text-[#111113]/75 hover:border-[#111113]/40"
                      )}
                    >
                      <CheckCircle2
                        className={cn(
                          "h-3.5 w-3.5",
                          role === "seller" ? "text-[#FF5A25]" : "opacity-30"
                        )}
                      />
                      <span>Verified Seller</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-fullname" className="label block mb-1.5">
                    Legal Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111113]/50" />
                    <input
                      id="auth-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Must match your NIN / BVN name"
                      className="w-full h-11 pl-9 pr-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                    />
                  </div>
                  <p className="font-secondary text-xs text-[#111113]/60 mt-1">
                    Required for SmileID identity verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-phone" className="label block mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#111113]/50" />
                      <input
                        id="auth-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className="w-full h-11 pl-8 pr-3 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-location"
                      className="label block mb-1.5"
                    >
                      Primary Trading Hub
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#111113]/50 pointer-events-none" />
                      <select
                        id="auth-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-11 pl-8 pr-2 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113]"
                      >
                        {TRADING_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="label block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111113]/50" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. adeola@gmail.com"
                  className="w-full h-11 pl-9 pr-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                />
              </div>
              <p className="font-secondary text-xs text-[#111113]/60 mt-1">
                {mode === "register"
                  ? "We will send a 6-digit OTP to verify this email in the next step."
                  : "We send real-time escrow milestone receipts here."}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="label">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onForgotPasswordClick) {
                        onForgotPasswordClick(email);
                      } else {
                        router.push("/forgot-password");
                      }
                    }}
                    className="font-mono text-xs text-[#111113]/65 hover:text-[#FF5A25] underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-3 pr-10 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111113]/50 hover:text-[#111113]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {mode === "register" && password.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 gap-1.5 p-2.5 bg-[#F8F7F4] border border-[#111113]/10 text-[11px] font-mono">
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      hasMinLength
                        ? "text-[#15803d] font-semibold"
                        : "text-[#111113]/50"
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
                      hasNumber
                        ? "text-[#15803d] font-semibold"
                        : "text-[#111113]/50"
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Number (0–9)</span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      hasSymbol
                        ? "text-[#15803d] font-semibold"
                        : "text-[#111113]/50"
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Symbol (!@#$)</span>
                  </div>
                </div>
              ) : (
                <p className="font-secondary text-xs text-[#111113]/60 mt-1">
                  Minimum 8 characters with numbers and symbols.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isLoading || isOauthSubmitting}
              className="w-full h-12 rounded-full text-xs font-semibold gap-2 mt-2"
            >
              {isLoading ? (
                <span>
                  {mode === "login"
                    ? "Securing Session..."
                    : "Dispatching Email OTP..."}
                </span>
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Sign In & Unlock Vault"
                      : "Continue to Email OTP Verification"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-6 mt-6 border-t border-[#111113]/12 text-center font-secondary text-xs text-[#111113]/65">
            {mode === "login" ? (
              <div>
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#111113] hover:text-[#FF5A25] hover:underline underline-offset-4 transition-colors"
                >
                  Register for Free
                </Link>
              </div>
            ) : (
              <div>
                Already verified on Scrowpoint?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#111113] hover:text-[#FF5A25] hover:underline underline-offset-4 transition-colors"
                >
                  Sign In Here
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Trust Guarantee Note */}
      <div className="mt-6 pt-4 border-t border-[#111113]/12 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#15803d]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
        <span>End-to-End Encrypted Authentication</span>
      </div>
    </div>
  );
}

export default AuthForm;
