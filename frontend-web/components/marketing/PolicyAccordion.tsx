"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, HelpCircle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PolicyAccordion Component (Phase 1 §3 - Trust & Safety Hub)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Collapsible policy accordion explaining 48h SLA, anti-fraud rules, and arbitration.
 * - Token Compliance: 8px container radius, 4px controls, Roboto headings, Geist body.
 */

export interface PolicyItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
}

export const POLICIES: PolicyItem[] = [
  {
    id: "pol-inspection",
    title: "48-Hour Hardware Diagnostic SLA Protocol",
    category: "Inspection",
    summary:
      "When the courier delivers your package, you have exactly 48 hours to inspect and test all internal components before funds release.",
    details: [
      "Check FaceID / TouchID biometric sensor authenticity.",
      "Inspect battery maximum health percentage against listing statement.",
      "Confirm device has zero iCloud / Google activation lock or enterprise MDM profile.",
      "Test touch digitizer uniformity, TrueTone, and cellular calling on Nigerian carrier SIMs.",
      "If any defect is found, clicking 'Report Issue' halts the countdown and freezes funds immediately.",
    ],
  },
  {
    id: "pol-fraud",
    title: "Anti-Fraud & Contact Information Masking Shield",
    category: "Protection",
    summary:
      "Our Trust Shield automatically scans and masks phone numbers, WhatsApp links, and personal emails inside the P2P chat.",
    details: [
      "Off-platform trades completely void Scrowpoint escrow coverage.",
      "Scammers often request buyers to 'send a WhatsApp message' or 'pay directly to account' to bypass protections.",
      "By masking off-platform contact details, Scrowpoint guarantees full legal recourse and reimbursement if goods fail inspection.",
    ],
  },
  {
    id: "pol-blacklist",
    title: "Stolen & Blacklisted Device Zero Tolerance",
    category: "Compliance",
    summary:
      "Scrowpoint maintains zero tolerance for stolen goods, blacklisted IMEIs, or iCloud-locked hardware.",
    details: [
      "All devices must be verified clean before shipment.",
      "Sellers listing stolen phones face immediate law enforcement handover, police report filing, and permanent biometric account freeze.",
      "Buyer receives 100% immediate escrow refund if a phone is identified as carrier-blacklisted or MDM locked.",
    ],
  },
  {
    id: "pol-payout",
    title: "Seller Payout Guarantee & Anti-Reversal Rule",
    category: "Sellers",
    summary:
      "Legitimate merchants are protected against fraudulent chargebacks, fake alerts, or abusive returns.",
    details: [
      "Funds are verified in advance into our segregated Paystack vault prior to seller dispatching.",
      "Buyer cannot issue a fraudulent debit card chargeback once goods are handed over to tracked logistics.",
      "On buyer approval or 48-hour SLA completion, payouts disburse to your NUBAN account in under 15 minutes.",
    ],
  },
];

export interface PolicyAccordionProps {
  className?: string;
}

export function PolicyAccordion({ className }: PolicyAccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(["pol-inspection"]);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {POLICIES.map((policy) => {
        const isOpen = openIds.includes(policy.id);

        return (
          <div
            key={policy.id}
            className="rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.04)] overflow-hidden transition-all duration-200 ease-out"
          >
            <button
              type="button"
              onClick={() => toggle(policy.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[#f8fafc] transition-colors"
            >
              <div className="flex items-center gap-3 pr-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#f1f5f9] text-[#0f172a] shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#64748b] block">
                    {policy.category}
                  </span>
                  <h4 className="font-primary text-sm font-bold text-[#020617]">
                    {policy.title}
                  </h4>
                </div>
              </div>

              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-[#64748b] shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#64748b] shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-[#e2e8f0] bg-[#f8fafc]/50 space-y-3">
                <p className="font-secondary text-xs sm:text-sm text-[#020617] font-medium leading-relaxed">
                  {policy.summary}
                </p>

                <ul className="space-y-2 pt-1 font-secondary text-xs text-[#64748b]">
                  {policy.details.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#22c55e] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PolicyAccordion;
