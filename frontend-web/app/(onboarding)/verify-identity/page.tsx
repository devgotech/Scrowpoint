"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  IdCard,
  Lock,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MinimalistAuthFooter } from "@/components/footers";
import { DocumentUploadArea } from "@/components/onboarding/DocumentUploadArea";
import { CameraCaptureWidget } from "@/components/onboarding/CameraCaptureWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Screen 6: Identity Verification (KYC) (Phase 2 §2)
 * Route: app/(onboarding)/verify-identity/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: CameraCaptureWidget, DocumentUploadArea, StatusToast.
 * - Architecture Link: Streams biometric/document data to Python microservice,
 *   updates Postgres user record via Go.
 * - States:
 *   1. Form State (Document + Biometric Selfie)
 *   2. Pending Review: Locked state; user cannot list items.
 *   3. Rejected/Retry: Uses --destructive (#f56565) color to explain rejection
 *      (e.g., blur, glare) with a retry CTA.
 *   4. Verified / Approved: Trust badge granted.
 */

export type KycFlowState = "active_form" | "pending_review" | "rejected_retry" | "approved";

export interface VerifyIdentityPageProps {
  onCompleteKyc?: () => void;
  onNavigateHome?: () => void;
}

export default function VerifyIdentityPage({
  onCompleteKyc,
  onNavigateHome,
}: VerifyIdentityPageProps) {
  const [kycState, setKycState] = useState<KycFlowState>("active_form");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [hasDoc, setHasDoc] = useState(false);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForReview = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setKycState("pending_review");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Flow State Inspector (For Reviewing All Required States) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a]">
                SmileID Verification
              </span>
            </div>

            {/* State Switcher for Reviewing All 4 Specification States */}
            <div className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] p-1 rounded-[4px] self-start sm:self-auto overflow-x-auto max-w-full">
              <span className="font-mono text-[10px] uppercase font-bold text-[#64748b] px-2">
                Simulate State:
              </span>
              {(
                [
                  { id: "active_form", label: "Upload & Selfie" },
                  { id: "pending_review", label: "Pending Review" },
                  { id: "rejected_retry", label: "Rejected/Retry" },
                  { id: "approved", label: "Approved" },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setKycState(s.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-[2px] text-xs font-mono font-medium transition-all duration-200 ease-out whitespace-nowrap",
                    kycState === s.id
                      ? "bg-[#0f172a] text-white shadow-2xs"
                      : "text-[#64748b] hover:text-[#020617] hover:bg-[#f8fafc]"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================================
              STATE 1: ACTIVE FORM (Document Upload + Camera Selfie)
              ================================================================= */}
          {kycState === "active_form" && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header Box */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#15803d] bg-[#22c55e]/15 px-3 py-1 rounded-full border border-[#22c55e]/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span>SMILEID BIOMETRIC PROTOCOL</span>
                </div>
                <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                  Verify Your Identity to List Gadgets
                </h1>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] max-w-xl mx-auto">
                  To protect buyers from stolen gadgets and fraudulent bank reversals, all sellers must complete biometric government ID validation.
                </p>
              </div>

              {/* 2-Step Progress Strip */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={cn(
                    "p-3 rounded-[4px] border text-left transition-all duration-200 ease-out",
                    currentStep === 1
                      ? "bg-[#0f172a] text-white border-[#0f172a]"
                      : "bg-white border-[#e2e8f0] text-[#020617]"
                  )}
                >
                  <span className="font-mono text-[10px] uppercase font-bold block opacity-70">
                    Step 1
                  </span>
                  <span className="font-primary text-xs font-bold">Government ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={cn(
                    "p-3 rounded-[4px] border text-left transition-all duration-200 ease-out",
                    currentStep === 2
                      ? "bg-[#0f172a] text-white border-[#0f172a]"
                      : "bg-white border-[#e2e8f0] text-[#020617]"
                  )}
                >
                  <span className="font-mono text-[10px] uppercase font-bold block opacity-70">
                    Step 2
                  </span>
                  <span className="font-primary text-xs font-bold">3D Liveness Selfie</span>
                </button>
              </div>

              {/* Step Content */}
              {currentStep === 1 ? (
                <div className="space-y-4">
                  <DocumentUploadArea
                    onComplete={(res) => {
                      if (res.frontFile) setHasDoc(true);
                    }}
                  />

                  <div className="flex justify-end">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                      className="h-11 px-6 text-xs font-semibold gap-2 shadow-xs"
                    >
                      <span>Proceed to Biometric Selfie</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <CameraCaptureWidget
                    onCaptureComplete={() => setHasSelfie(true)}
                  />

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep(1)}
                      className="h-11 text-xs font-medium border-[#e2e8f0]"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      <span>Back to Document</span>
                    </Button>

                    <Button
                      variant="default"
                      size="lg"
                      disabled={isSubmitting}
                      onClick={handleSubmitForReview}
                      className="h-11 px-6 text-xs font-semibold gap-2 shadow-xs"
                    >
                      {isSubmitting ? (
                        <span>Validating with SmileID...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Submit Verification</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              STATE 2: PENDING REVIEW (Locked State; Cannot List Items)
              ================================================================= */}
          {kycState === "pending_review" && (
            <div className="max-w-xl mx-auto rounded-[8px] border border-[#e2e8f0] bg-white p-8 shadow-[0_4px_8px_rgba(15,23,42,0.06)] text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#ecc94b]/20 border border-[#ecc94b]/40 text-[#975a16]">
                <Clock className="h-7 w-7 text-[#ecc94b] animate-spin" />
              </div>

              <div className="space-y-2">
                <div className="inline-block bg-[#ecc94b]/20 text-[#975a16] border border-[#ecc94b]/40 px-2.5 py-0.5 rounded-[4px] font-mono text-xs font-bold uppercase tracking-wider">
                  Verification Pending
                </div>
                <h2 className="font-primary text-2xl font-bold text-[#020617]">
                  Identity In Review with SmileID
                </h2>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  Your National Identity document and 3D biometric selfie have been streamed to our automated validation engine. Typical turnaround is under 5 minutes.
                </p>
              </div>

              {/* Locked State Notice */}
              <div className="rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#64748b] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-primary text-xs font-bold text-[#020617] block">
                    Marketplace Listing Locked
                  </span>
                  <span className="font-secondary text-xs text-[#64748b] leading-relaxed block">
                    You cannot publish gadget listings or withdraw escrow balances until your identity is verified.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setKycState("active_form")}
                  className="flex-1 h-11 text-xs font-medium border-[#e2e8f0] text-[#020617]"
                >
                  Edit Submission
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setKycState("approved")}
                  className="flex-1 h-11 text-xs font-semibold"
                >
                  Check Status Refresh
                </Button>
              </div>
            </div>
          )}

          {/* =================================================================
              STATE 3: REJECTED / RETRY (Uses --destructive #f56565)
              ================================================================= */}
          {kycState === "rejected_retry" && (
            <div className="max-w-xl mx-auto rounded-[8px] border-2 border-[#f56565] bg-white p-8 shadow-[0_4px_8px_rgba(245,101,101,0.08)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#f56565]/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#f56565]/15 text-[#f56565]">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c53030]">
                    Verification Failed
                  </span>
                  <h2 className="font-primary text-xl font-bold text-[#020617]">
                    Biometric Check Rejected
                  </h2>
                </div>
              </div>

              {/* Exact Rejection Reasons Callout */}
              <div className="rounded-[4px] border border-[#f56565]/30 bg-[#f56565]/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c53030]">
                  <AlertCircle className="h-4 w-4" />
                  <span>SmileID AI Flagged 2 Quality Issues:</span>
                </div>
                <ul className="list-disc list-inside text-xs font-secondary text-[#7f1d1d] space-y-1.5 pl-1 leading-relaxed">
                  <li>
                    <strong>Excessive Lighting Glare:</strong> Specular highlights obscured your date of birth and NIN registration number.
                  </li>
                  <li>
                    <strong>Selfie Motion Blur:</strong> The 3D selfie was captured while moving, preventing facial landmark match.
                  </li>
                </ul>
              </div>

              <p className="font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed">
                Please retake your documents in an evenly lit room without flash, and keep your face stationary inside the oval.
              </p>

              {/* Retry CTA with --destructive style */}
              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setKycState("active_form")}
                  className="w-full h-12 text-xs font-semibold gap-2 shadow-xs bg-[#f56565] hover:bg-[#e53e3e] text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Biometric Verification</span>
                </Button>
              </div>
            </div>
          )}

          {/* =================================================================
              STATE 4: APPROVED / VERIFIED
              ================================================================= */}
          {kycState === "approved" && (
            <div className="max-w-xl mx-auto rounded-[8px] border border-[#22c55e]/40 bg-white p-8 shadow-[0_4px_8px_rgba(34,197,94,0.06)] text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#15803d]">
                <ShieldCheck className="h-7 w-7 text-[#22c55e]" />
              </div>

              <div className="space-y-2">
                <div className="inline-block bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-2.5 py-0.5 rounded-[4px] font-mono text-xs font-bold uppercase tracking-wider">
                  Government ID Verified
                </div>
                <h2 className="font-primary text-2xl font-bold text-[#020617]">
                  Welcome to Verified Seller Status
                </h2>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  Your NIMC records and biometric selfie have been permanently sealed in your immutable audit record. You can now post gadget listings with the Verified Badge.
                </p>
              </div>

              <div className="rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Verification Method:</span>
                  <span className="font-bold text-[#020617]">SmileID 3D Liveness (NIN)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Trust Badge Granted:</span>
                  <span className="font-bold text-[#15803d]">Government ID Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">48H Inspection SLA:</span>
                  <span className="font-bold text-[#020617]">Active on All Sales</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="default"
                  size="lg"
                  onClick={onCompleteKyc}
                  className="w-full h-12 text-xs font-semibold gap-2 shadow-xs"
                >
                  <span>Go to Seller Dashboard & Post Gadget</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
