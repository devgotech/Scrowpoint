"use client";

import React from "react";
import { Lock, Printer, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProseTypography Component (Phase 1 §3)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Roboto font (font-primary) for long-form legal readability.
 * - Strict contrast ratios (WCAG AAA compliant: #020617 on #ffffff / #f8fafc).
 * - Metadata header: Effective Date, Legal Jurisdiction, Document ID, Version.
 * - Highlighting of Escrow Custody, 48-Hour SLA, and Dispute Arbitration.
 */

export interface ProseTypographyProps {
  slug: string;
  className?: string;
}

export function ProseTypography({ slug, className }: ProseTypographyProps) {
  const contentMap: Record<
    string,
    {
      title: string;
      docId: string;
      effectiveDate: string;
      jurisdiction: string;
      summary: string;
      clauses: { title: string; body: string; callout?: string }[];
    }
  > = {
    "buyer-protection": {
      title: "Buyer Protection Policy & 48-Hour Hardware SLA",
      docId: "SPP-POL-2026-001",
      effectiveDate: "January 15, 2026",
      jurisdiction: "Lagos State & Federal Republic of Nigeria",
      summary:
        "Every transaction initiated on Scrowpoint is guaranteed by our custodial escrow protocol. Buyer funds are segregated and held securely by our CBN-licensed custodial partner (Paystack) until the buyer receives and validates the gadget within a strict 48-hour diagnostic window.",
      clauses: [
        {
          title: "1. Scope of 48-Hour Hardware Inspection",
          body: "Upon courier delivery confirmation, a 48-hour countdown timer begins. The buyer is granted unconditional rights to test all hardware functions including: screen digitizer, TrueTone/OLED uniformity, biometric modules (FaceID/TouchID), battery health percentage, cellular connectivity, and OEM iCloud/Google account status.",
          callout: "IMPORTANT: Cosmetic or hardware defects not disclosed in the listing MUST be reported before the 48-hour timer expires.",
        },
        {
          title: "2. Automatic Funds Release Trigger",
          body: "If the buyer confirms satisfaction by clicking 'Release Funds', or if the 48-hour inspection SLA elapses without a formal dispute report, the smart escrow ledger automatically finalizes the trade and settles net funds to the seller's verified bank account.",
        },
        {
          title: "3. Disputed Condition & Quarantine",
          body: "Filing a dispute within the 48-hour window instantly hard-freezes the escrow vault. Neither party can withdraw the funds until our Dispute Arbitration Desk inspects the unboxing and diagnostic evidence.",
        },
      ],
    },
    "seller-guarantee": {
      title: "Seller Payout Guarantee & Anti-Reversal Protection",
      docId: "SPP-POL-2026-002",
      effectiveDate: "January 15, 2026",
      jurisdiction: "Federal Republic of Nigeria",
      summary:
        "Legitimate secondhand gadget merchants often fall victim to fake alerts, fraudulent bank reversals, and abusive buyers. Scrowpoint guarantees 100% payout security once funds are confirmed locked in escrow prior to dispatch.",
      clauses: [
        {
          title: "1. Zero Chargeback Liability",
          body: "All buyer deposits are cleared in advance into dedicated custodial accounts. Sellers are shielded against retroactive debit card chargebacks or bank recall requests once goods are verified as shipped with waybill tracking.",
        },
        {
          title: "2. Fast-Track Payout Execution",
          body: "Upon buyer sign-off or normal expiration of the 48-hour inspection period, payout disbursement to your registered NUBAN bank account executes within 15 minutes via automated NIP settlement rails.",
        },
        {
          title: "3. Seller Protection Against Malicious Returns",
          body: "In the event of a return, the buyer must return the EXACT device with intact anti-tamper security stickers and matching serial/IMEI records as verified in our pre-shipment archive.",
        },
      ],
    },
    "dispute-resolution": {
      title: "Dispute Arbitration & Mediation Rules",
      docId: "SPP-POL-2026-003",
      effectiveDate: "February 1, 2026",
      jurisdiction: "Arbitration Laws of Lagos State",
      summary:
        "When buyer and seller disagree on device condition, functionality, or logistics damage, Scrowpoint Arbitration Desk acts as an impartial adjudicator bound by photographic and video proof.",
      clauses: [
        {
          title: "1. 24-Hour Evidence Submission SLA",
          body: "Both parties have exactly 24 hours from dispute initiation to upload unboxing footage, IMEI screenshots, 3uTools / diagnostic reports, and courier handoff waybills.",
        },
        {
          title: "2. Sub-Case Adjudication Types",
          body: "Cases are categorized into: Not As Described (NAD), Dead on Arrival (DOA), Transit Damage, or Counterfeit Device. Counterfeit claims result in immediate police/regulatory escalation and permanent seller ban.",
        },
        {
          title: "3. Binding Arbitration Ruling",
          body: "The decision of the Senior Mediation Officer is final and automatically instructs the Escrow Ledger to execute either a 100% buyer refund, full seller release, or partial split settlement.",
        },
      ],
    },
    "escrow-agreement": {
      title: "Custodial Escrow Agreement & Legal Structure",
      docId: "SPP-AGR-2026-004",
      effectiveDate: "January 1, 2026",
      jurisdiction: "Federal Republic of Nigeria",
      summary:
        "This Agreement governs the tri-partite custodial relationship between Buyer, Seller, and Scrowpoint (acting through our CBN-licensed payment partner Paystack Payments Limited).",
      clauses: [
        {
          title: "1. Tri-Party Escrow Holding",
          body: "Scrowpoint acts solely as an independent custodial agent. Funds deposited do not form part of the operational assets of Scrowpoint and are protected against insolvency.",
        },
        {
          title: "2. Irrevocable Deposit",
          body: "Once deposited, buyer funds can only be released upon mutual authorization, successful timer expiration, or arbitration outcome.",
        },
      ],
    },
    "escrow-rules": {
      title: "48-Hour Inspection Window Protocol",
      docId: "SPP-POL-2026-005",
      effectiveDate: "January 10, 2026",
      jurisdiction: "Federal Republic of Nigeria",
      summary:
        "Detailed step-by-step diagnostic checklist for inspecting secondhand smartphones, laptops, and tablets upon delivery.",
      clauses: [
        {
          title: "1. Verification Checklist for Smartphones",
          body: "Buyers must check: Screen digitizer responsiveness, FaceID/TouchID functionality, Camera focus on all lenses, Battery Maximum Capacity, and SIM/Network unlock status.",
        },
        {
          title: "2. Verification Checklist for Laptops",
          body: "Buyers must verify: Keyboard keys, trackpad gestures, charging port speed, battery cycle count, screen backlighting, and MDM / BIOS lock status.",
        },
      ],
    },
    "kyc-policy": {
      title: "Biometric Identity (KYC) & SmileID Policy",
      docId: "SPP-POL-2026-006",
      effectiveDate: "January 5, 2026",
      jurisdiction: "National Identity Management Commission (NIMC) Standards",
      summary:
        "To eliminate anonymous fraud, all sellers must complete identity verification using real-time biometric liveness checks powered by SmileID.",
      clauses: [
        {
          title: "1. Government Identity Verification",
          body: "Sellers must provide a valid National Identification Number (NIN) or Bank Verification Number (BVN) validated against national databases.",
        },
        {
          title: "2. Biometric Selfie Liveness",
          body: "Static uploaded photos are rejected. Sellers must complete an active 3D selfie liveness challenge to detect deepfakes, masks, and printed photos.",
        },
      ],
    },
    "prohibited-items": {
      title: "Blacklisted & Prohibited Gadgets Policy",
      docId: "SPP-POL-2026-007",
      effectiveDate: "January 1, 2026",
      jurisdiction: "Federal Republic of Nigeria",
      summary:
        "Scrowpoint maintains zero tolerance for stolen goods, iCloud-locked devices, and counterfeit knock-offs.",
      clauses: [
        {
          title: "1. Strict Prohibition of iCloud / MDM Locked Devices",
          body: "Any gadget with active activation lock, remote enterprise enrollment, or bypass software is strictly banned and reported to authorities.",
        },
        {
          title: "2. Stolen Goods Registry Check",
          body: "All reported IMEIs are checked against police loss registries and telecom carrier blacklists.",
        },
      ],
    },
    "privacy": {
      title: "Data Masking & P2P Chat Privacy Policy",
      docId: "SPP-POL-2026-008",
      effectiveDate: "January 1, 2026",
      jurisdiction: "Nigeria Data Protection Regulation (NDPR)",
      summary:
        "Our Trust Shield automatically redacts off-platform contact details (phone numbers, personal emails, off-site payment links) to protect users from social engineering scams.",
      clauses: [
        {
          title: "1. Real-Time Regex Masking",
          body: "Any communication containing phone numbers (e.g. 080..., +234...) or WhatsApp handles is obscured to prevent off-platform diversion where escrow cannot protect you.",
        },
      ],
    },
    "terms": {
      title: "General Terms of Service",
      docId: "SPP-TOS-2026-009",
      effectiveDate: "January 1, 2026",
      jurisdiction: "Federal Republic of Nigeria",
      summary:
        "Terms and conditions governing the use of the Scrowpoint marketplace, escrow protocol, and platform services.",
      clauses: [
        {
          title: "1. Acceptance of Terms",
          body: "By creating an account or depositing funds, you agree to comply with all platform protocols, anti-money laundering regulations, and arbitration rules.",
        },
      ],
    },
  };

  const doc = contentMap[slug] || contentMap["buyer-protection"];

  return (
    <article
      className={cn(
        "border border-ink-faint bg-surface p-6 sm:p-10 rounded-card",
        className
      )}
    >
      {/* Document Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-ink-faint">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center bg-ink text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="font-mono text-xs font-bold text-ink">{doc.docId}</span>
        </div>

        <div className="flex items-center gap-4 label">
          <span>Effective: {doc.effectiveDate}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{doc.jurisdiction}</span>
        </div>
      </div>

      {/* Main Title & Executive Summary */}
      <div className="py-6 space-y-4">
        <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-ink leading-snug">
          {doc.title}
        </h1>

        <div className="border border-trust/30 bg-trust/10 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-trust shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-caption uppercase font-bold text-trust-strong tracking-[0.12em] block mb-1">
                Executive Trust Summary
              </span>
              <p className="font-secondary text-xs sm:text-sm text-ink leading-relaxed">
                {doc.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-8 pt-4">
        {doc.clauses.map((clause, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="font-primary text-base sm:text-lg font-bold tracking-[-0.03em] text-ink">
              {clause.title}
            </h2>
            <p className="font-secondary text-xs sm:text-sm text-ink/75 leading-relaxed">
              {clause.body}
            </p>

            {clause.callout && (
              <div className="border border-state-warning/40 bg-state-warning/15 p-3.5 font-secondary text-xs text-state-warning-strong font-medium leading-relaxed">
                {clause.callout}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Document Footer Verification */}
      <div className="mt-12 pt-6 border-t border-ink-faint flex flex-col sm:flex-row items-center justify-between gap-4 label">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-trust" />
          <span>Legally binding under Nigerian Commercial Law</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 hover:text-accent-orange hover:opacity-100 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Policy</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProseTypography;
