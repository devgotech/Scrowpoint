"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InstitutionalHeroProps {
  className?: string;
  onExploreClick?: () => void;
  onWaitlistJoined?: (email: string) => void;
}

export function InstitutionalHero({
  className,
  onExploreClick,
  onWaitlistJoined,
}: InstitutionalHeroProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onWaitlistJoined?.(email);
    }, 600);
  };

  return (
    <div
      className={cn(
        "w-full bg-paper text-ink font-secondary selection:bg-accent-orange selection:text-paper border-b border-ink-faint",
        className
      )}
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Dual-column institutional grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] min-h-[600px]">
          {/* =================================================================
              LEFT COLUMN: HERO CONTENT
              ================================================================= */}
          <section className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 lg:border-r border-ink-faint">
            {/* Upper Protocol Label */}
            <div className="flex items-center gap-2 mb-6">
              <span className="label">
                [ P2P Escrow Engine v.2026 ]
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent-orange animate-pulse" />
            </div>

            {/* Space Grotesk Headline */}
            <h1 className="font-primary text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-[-0.04em] leading-[0.92] text-ink uppercase mb-6">
              SECURE EXCHANGE.{" "}
              <span className="text-accent-orange">
                VERIFIED TECH.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-[560px] text-base sm:text-lg text-ink/70 font-normal leading-relaxed mb-8">
              Nigeria&apos;s institutional-grade escrow platform. We secure your funds
              in custodial vaults until you verify the hardware. No fraud, no
              dead-on-arrival devices, just seamless commerce.
            </p>

            {/* Waitlist Form or Access CTA */}
            <div className="max-w-[520px] mb-10">
              {isSubmitted ? (
                <div className="flex items-center gap-3 p-4 bg-trust/10 border border-trust/30 text-trust-strong animate-in fade-in duration-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-trust" />
                  <div className="text-xs font-secondary">
                    <span className="font-semibold block text-sm">
                      Access Requested — Priority Queue #849
                    </span>
                    Invitation key will be dispatched to <strong>{email}</strong>.
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-2.5 w-full"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for private beta"
                    required
                    className="flex-1 h-12 px-4 border border-ink/15 bg-surface text-sm font-secondary text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink transition-all rounded-ui"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-6 rounded-full bg-ink text-white font-semibold text-xs uppercase tracking-[0.08em] hover:bg-accent-orange transition-colors duration-200 ease-out shrink-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? "Securing..." : "Secure Access"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}

              {/* Direct Marketplace Exploration Shortcuts */}
              <div className="flex items-center gap-4 mt-4 text-xs font-secondary text-ink/65">
                <span>Or explore live:</span>
                <Link
                  href="/marketplace"
                  onClick={onExploreClick}
                  className="font-semibold text-ink hover:text-accent-orange underline underline-offset-4 flex items-center gap-1"
                >
                  <span>Verified Listings (140+ active)</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span>•</span>
                <Link
                  href="/pricing"
                  className="font-semibold text-ink hover:text-accent-orange underline underline-offset-4"
                >
                  Fee Calculator
                </Link>
              </div>
            </div>

            {/* Stat Blocks */}
            <div className="pt-8 border-t border-ink-faint grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-[560px]">
              <div className="space-y-1">
                <div className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-ink leading-none">
                  48H
                </div>
                <div className="label">
                  Hardware Inspection SLA
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-trust-strong leading-none">
                  100%
                </div>
                <div className="label">
                  Escrow Guarantee
                </div>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <div className="font-primary text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-ink leading-none">
                  ₦0
                </div>
                <div className="label">
                  Buyer Fraud Loss
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              RIGHT COLUMN: INSTITUTIONAL PROTOCOL SIDE-PANE
              ================================================================= */}
          <aside className="bg-surface-muted p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 border-t lg:border-t-0 border-ink-faint">
            <div className="space-y-6">
              {/* Protocol 01 Card */}
              <div className="v7-card space-y-2 hover:border-ink/40 transition-colors">
                <div className="label">
                  [01] Vault
                </div>
                <h3 className="font-primary text-2xl font-bold tracking-[-0.04em] text-ink">
                  Paystack Custody
                </h3>
                <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
                  Funds are held in secure escrow vaults, ensuring sellers only
                  get paid when you are satisfied.
                </p>
                <div className="pt-2 font-mono text-caption uppercase tracking-[0.1em] text-trust-strong flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>CBN-Partner Segregated Balance</span>
                </div>
              </div>

              {/* Protocol 02 Card */}
              <div className="v7-card space-y-2 hover:border-ink/40 transition-colors">
                <div className="label">
                  [02] Verification
                </div>
                <h3 className="font-primary text-2xl font-bold tracking-[-0.04em] text-ink">
                  SmileID KYC
                </h3>
                <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
                  Every seller must pass biometric government ID verification to
                  prevent anonymous fraud.
                </p>
                <div className="pt-2 font-mono text-caption uppercase tracking-[0.1em] text-trust-strong flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  <span>NIN & Liveness Authentication</span>
                </div>
              </div>

              {/* Protocol 03 Card */}
              <div className="v7-card space-y-2 hover:border-ink/40 transition-colors">
                <div className="label">
                  [03] Assurance
                </div>
                <h3 className="font-primary text-2xl font-bold tracking-[-0.04em] text-ink">
                  48H Audit SLA
                </h3>
                <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
                  You have 48 hours after delivery to perform hardware diagnostics.
                  Failure triggers automatic mediation.
                </p>
                <div className="pt-2 font-mono text-caption uppercase tracking-[0.1em] text-trust-strong flex items-center gap-1.5 font-semibold">
                  <Clock className="h-3 w-3" />
                  <span>Automatic 48H Diagnostic Timer</span>
                </div>
              </div>
            </div>

            {/* Waitlist / Protocol Progress */}
            <div className="pt-6 border-t border-ink-faint space-y-2">
              <div className="flex items-center justify-between label">
                <span>Waitlist Progress</span>
                <span className="font-bold text-trust-strong opacity-100!">72% Capacity</span>
              </div>
              <div className="h-1.5 w-full bg-ink/12 rounded-full overflow-hidden relative">
                <div className="h-full bg-accent-orange rounded-full w-[72%]" />
              </div>
              <div className="label text-right">
                25k+ Traders Secured
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default InstitutionalHero;
