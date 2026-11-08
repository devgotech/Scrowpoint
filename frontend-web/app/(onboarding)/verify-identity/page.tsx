"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import { kycApi } from "@/lib/api";

/**
 * Screen 6: Identity Verification (KYC) (Phase 2 §2)
 * Route: app/(onboarding)/verify-identity/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Warm Stone (#F0EFEA)
 * - Deep Carbon Ink (#111113), Vermilion Orange (#FF5A25), Forest Trust Green (#15803d)
 * - 0px sharp architectural cards (border-[#111113]/12) paired with 999px pill primary CTAs
 */

export type KycFlowState =
  | "active_form"
  | "pending_review"
  | "rejected_retry"
  | "approved";

interface SmileIdentityResult {
  status: "success" | "failure" | "cancelled";
  error?: { message?: string };
}

declare global {
  interface Window {
    SmileIdentity?: (options: {
      token: string;
      product: "biometric_kyc";
      environment: "sandbox" | "production";
      callback_url: string;
      partner_details: {
        partner_id: string;
        name: string;
        logo_url: string;
        policy_url: string;
        theme_color: string;
      };
      partner_params: Record<string, string>;
      onResult: (result: SmileIdentityResult) => void;
    }) => void;
  }
}

export interface VerifyIdentityPageProps {
  onCompleteKyc?: () => void;
  onNavigateHome?: () => void;
}

export default function VerifyIdentityPage({
  onCompleteKyc,
  onNavigateHome,
}: VerifyIdentityPageProps) {
  const router = useRouter();
  const [kycState, setKycState] = useState<KycFlowState>("active_form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const refreshStatus = () => kycApi.getStatus().then((res) => {
      if (!mounted || !res.ok || !res.data) return;
      const st = (res.data.status || "").toLowerCase();
      if (st === "approved" || st === "verified") {
        setKycState("approved");
      } else if (st === "rejected") {
        setKycState("rejected_retry");
      } else if (
        st === "pending" ||
        st === "pending_review" ||
        st === "manual_review_required"
      ) {
        setKycState("pending_review");
      }
    });
    void refreshStatus();
    const timer = window.setInterval(() => void refreshStatus(), 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleStartVerification = async () => {
    setErrorMessage(null);
    if (!window.SmileIdentity) {
      setErrorMessage("Smile ID could not be loaded. Check your connection and try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await kycApi.startSmileIDSession();
      if (!response.ok || !response.data) {
        throw new Error(response.error || "Unable to start Smile ID verification.");
      }
      const session = response.data;
      window.SmileIdentity({
        token: session.token,
        product: "biometric_kyc",
        environment: session.environment,
        callback_url: session.callbackUrl,
        partner_details: {
          partner_id: session.partnerId,
          name: session.partnerName,
          logo_url: session.logoUrl,
          policy_url: session.policyUrl,
          theme_color: session.themeColor,
        },
        partner_params: {
          internal_reference: session.sessionId,
        },
        onResult: (result) => {
          setIsSubmitting(false);
          if (result.status === "success") {
            setKycState("pending_review");
            setErrorMessage(null);
          } else if (result.status === "failure") {
            setErrorMessage(result.error?.message || "Smile ID could not submit the verification.");
          }
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start Smile ID verification."
      );
      setIsSubmitting(false);
    }
  };

  const handleCompleteKyc = () => {
    if (onCompleteKyc) {
      onCompleteKyc();
      return;
    }
    router.push("/seller/post-gadget");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Script
        src="https://cdn.usesmileid.com/inline/v12/js/script.min.js"
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
        onError={() => setErrorMessage("Smile ID could not be loaded. Check your connection and retry.")}
      />
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          {/* Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#111113]/12">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em]">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="font-bold text-[#111113]">
                SmileID Biometric KYC
              </span>
            </div>

          </div>

          {/* =================================================================
              STATE 1: ACTIVE FORM (Document Upload + Camera Selfie)
              ================================================================= */}
          {kycState === "active_form" && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Unboxed Editorial Header */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#15803d] font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                  <span>SmileID Biometric Protocol</span>
                </div>
                <h1 className="font-primary text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#111113] uppercase">
                  VERIFY IDENTITY TO LIST GADGETS
                  <span className="text-[#FF5A25]">.</span>
                </h1>
                <p className="font-secondary text-sm sm:text-base text-[#111113]/70 max-w-xl mx-auto leading-relaxed">
                  To protect buyers from stolen devices and fraudulent bank
                  reversals, all merchants complete mandatory NIMC/BVN and 3D
                  liveness verification.
                </p>
              </div>

              <div className="mx-auto max-w-xl border border-[#111113]/12 bg-white p-6 sm:p-8 text-center space-y-5">
                <p className="font-secondary text-sm text-[#111113]/70 leading-relaxed">
                  Smile ID will securely guide you through identity document capture,
                  biometric liveness, and consent. Scrowpoint receives the final result
                  directly from Smile ID and will not mark verification complete from
                  the browser alone.
                </p>
                {errorMessage && (
                  <p role="alert" className="text-sm text-red-700">
                    {errorMessage}
                  </p>
                )}
                <button
                  type="button"
                  disabled={isSubmitting || !sdkReady}
                  onClick={handleStartVerification}
                  className="btn-primary h-11 px-7 rounded-full bg-[#111113] hover:bg-[#FF5A25] disabled:opacity-50 text-xs font-mono uppercase tracking-wider font-bold text-white transition-colors inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Opening secure verification...</span>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                      <span>{sdkReady ? "Start Smile ID Verification" : "Loading Smile ID..."}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              STATE 2: PENDING REVIEW
              ================================================================= */}
          {kycState === "pending_review" && (
            <div className="max-w-xl mx-auto border border-[#111113]/12 bg-white p-8 text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#ecc94b]/20 border border-[#ecc94b]/50 text-[#975a16]">
                <Clock className="h-7 w-7 text-[#975a16] animate-spin" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-[#ecc94b]/20 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#975a16]">
                  Verification Pending
                </span>
                <h2 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                  Identity In Review with SmileID
                  <span className="text-[#FF5A25]">.</span>
                </h2>
                <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 leading-relaxed">
                  Your National Identity document and 3D biometric selfie have
                  been streamed to our validation engine. Typical turnaround is
                  under 5 minutes.
                </p>
              </div>

              {/* Locked State Notice */}
              <div className="border border-[#111113]/12 bg-[#F0EFEA] p-4 text-left flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#111113] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-primary text-xs font-bold text-[#111113] block">
                    Marketplace Listing Locked
                  </span>
                  <span className="font-secondary text-xs text-[#111113]/70 leading-relaxed block">
                    You cannot publish gadget listings or withdraw escrow
                    balances until your identity is verified.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setKycState("active_form")}
                  className="flex-1 h-11 border border-[#111113]/15 bg-white text-xs font-mono uppercase tracking-wider font-bold text-[#111113] hover:border-[#111113] transition-colors"
                >
                  Edit Submission
                </button>

                <button
                  type="button"
                  onClick={() => setKycState("approved")}
                  className="btn-primary flex-1 h-11 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
                >
                  Check Status Refresh
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              STATE 3: REJECTED / RETRY (Uses --destructive #f56565 / #c53030)
              ================================================================= */}
          {kycState === "rejected_retry" && (
            <div className="max-w-xl mx-auto border-2 border-[#f56565] bg-white p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#111113]/12">
                <div className="flex h-12 w-12 items-center justify-center bg-[#f56565]/15 text-[#c53030]">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c53030]">
                    Verification Failed
                  </span>
                  <h2 className="font-primary text-xl font-bold tracking-[-0.03em] text-[#111113]">
                    Biometric Check Rejected
                  </h2>
                </div>
              </div>

              {/* Exact Rejection Reasons Callout */}
              <div className="border border-[#f56565]/40 bg-[#f56565]/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c53030]">
                  <AlertCircle className="h-4 w-4" />
                  <span>SmileID Flagged 2 Quality Issues:</span>
                </div>
                <ul className="list-disc list-inside text-xs font-secondary text-[#111113]/85 space-y-1.5 pl-1 leading-relaxed">
                  <li>
                    <strong>Excessive Lighting Glare:</strong> Specular
                    highlights obscured your date of birth and NIN registration
                    number.
                  </li>
                  <li>
                    <strong>Selfie Motion Blur:</strong> The 3D selfie was
                    captured while moving, preventing facial landmark match.
                  </li>
                </ul>
              </div>

              <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 leading-relaxed">
                Please retake your documents in an evenly lit room without
                flash, and keep your face stationary inside the oval.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setKycState("active_form")}
                  className="w-full h-12 rounded-full bg-[#c53030] hover:bg-[#9b2c2c] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Biometric Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              STATE 4: APPROVED / VERIFIED
              ================================================================= */}
          {kycState === "approved" && (
            <div className="max-w-xl mx-auto border border-[#111113]/15 bg-white p-8 text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#15803d]/10 border border-[#15803d]/30 text-[#15803d]">
                <ShieldCheck className="h-7 w-7 text-[#15803d]" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-[#15803d]/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#15803d]">
                  Government ID Verified
                </span>
                <h2 className="font-primary text-2xl font-bold tracking-[-0.03em] text-[#111113] uppercase">
                  Verified Merchant Status Active
                  <span className="text-[#FF5A25]">.</span>
                </h2>
                <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 leading-relaxed">
                  Your NIMC records and biometric selfie have been sealed in
                  your audit record. You can now post gadget listings with the
                  Verified Merchant Badge.
                </p>
              </div>

              <div className="border border-[#111113]/12 bg-[#F0EFEA] p-4 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#111113]/65">
                    Verification Method:
                  </span>
                  <span className="font-bold text-[#111113]">
                    SmileID 3D Liveness (NIN)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#111113]/65">
                    Trust Badge Granted:
                  </span>
                  <span className="font-bold text-[#15803d]">
                    Government ID Verified
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#111113]/65">48H Inspection SLA:</span>
                  <span className="font-bold text-[#111113]">
                    Active on All Sales
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCompleteKyc}
                  className="btn-primary w-full h-12 rounded-full bg-[#111113] hover:bg-[#FF5A25] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Go to Merchant Desk &amp; Post Gadget</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Strategy 2: Minimalist Auth & Onboarding Footer */}
      <MinimalistAuthFooter />
    </div>
  );
}
