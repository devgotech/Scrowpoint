"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Globe,
  HelpCircle,
  Lock,
  MessageSquare,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Strategy 2: The Minimalist Footer (Clean & Distraction-Free)
 *
 * Applies to: Login/Signup pages, Onboarding Flows (KYC), Checkout, Post Gadget Wizard,
 * and High-Focus Admin Wizards (Arbitration Case Review).
 *
 * UX Strategy: Eliminate funnel leaks and unnecessary visual noise. Focus user 100% on
 * completing the auth/transaction step.
 *
 * Key Components:
 * - Single-row aligned layout with clean divider.
 * - Copyright notice.
 * - Compact legal links (Privacy, Terms, Escrow Rules).
 * - Language/locale selector with interactive currency & locale switcher.
 * - Help / Support quick link.
 * - Institutional security assurance (Paystack PCI-DSS • SmileID).
 */

export interface LocaleOption {
  code: string;
  label: string;
  flag: string;
  currency: string;
}

const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en-NG", label: "English (Nigeria)", flag: "🇳🇬", currency: "₦ NGN" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧", currency: "£ GBP" },
  { code: "en-US", label: "English (US)", flag: "🇺🇸", currency: "$ USD" },
  { code: "fr-AF", label: "Français (Afrique)", flag: "🇫🇷", currency: "CFA" },
];

export interface MinimalistAuthFooterProps {
  className?: string;
  onHelpClick?: () => void;
}

export function MinimalistAuthFooter({ className, onHelpClick }: MinimalistAuthFooterProps) {
  const [selectedLocale, setSelectedLocale] = useState<LocaleOption>(SUPPORTED_LOCALES[0]);
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);
  const localeRef = useRef<HTMLDivElement>(null);

  // Close locale menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
        setIsLocaleMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTriggerHelp = () => {
    if (onHelpClick) {
      onHelpClick();
      return;
    }
    // Dispatch event to open floating live chat widget if present
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sp_open_live_chat"));
      window.dispatchEvent(new CustomEvent("bh_open_live_chat"));
    }
  };

  return (
    <footer
      className={cn(
        "w-full border-t border-[#111113]/12 bg-[#F8F7F4] text-[#111113]/65 text-xs font-secondary py-4 px-4 sm:px-6 lg:px-8 transition-colors",
        className
      )}
    >
      <div className="mx-auto max-w-[1600px] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Copyright & Trust Micro-Copy */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="label">
            © {new Date().getFullYear()} Scrowpoint Technologies
          </span>
          <span className="hidden md:inline text-[#111113]/25">•</span>
          <span className="hidden md:flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#15803d]">
            <Lock className="h-3 w-3 text-[#22c55e]" />
            <span>256-Bit SSL Escrow Protected</span>
          </span>
        </div>

        {/* Center: Compact Legal Links */}
        <div className="flex items-center gap-4 sm:gap-6 label">
          <Link
            href="/legal/terms"
            className="hover:text-[#FF5A25] hover:opacity-100 transition-colors duration-150"
          >
            Terms of Service
          </Link>
          <Link
            href="/legal/privacy"
            className="hover:text-[#FF5A25] hover:opacity-100 transition-colors duration-150"
          >
            Privacy
          </Link>
          <Link
            href="/legal/buyer-protection"
            className="hover:text-[#FF5A25] hover:opacity-100 transition-colors duration-150"
          >
            Escrow Rules
          </Link>
        </div>

        {/* Right: Language/Locale Selector & Help Trigger */}
        <div className="flex items-center gap-3">
          {/* Interactive Language/Locale Selector Dropdown */}
          <div className="relative" ref={localeRef}>
            <button
              type="button"
              onClick={() => setIsLocaleMenuOpen(!isLocaleMenuOpen)}
              className="flex items-center gap-1.5 h-7 px-2.5 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] hover:border-[#111113]/40 transition-colors"
              aria-label="Select Language and Currency"
              aria-expanded={isLocaleMenuOpen}
            >
              <Globe className="h-3.5 w-3.5 text-[#111113]/60" />
              <span className="text-xs">{selectedLocale.flag}</span>
              <span className="hidden sm:inline text-[11px]">{selectedLocale.currency}</span>
              <ChevronDown className={cn("h-3 w-3 text-[#111113]/60 transition-transform", isLocaleMenuOpen && "rotate-180")} />
            </button>

            {isLocaleMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-52 border border-[#111113]/15 bg-white p-1.5 shadow-lg z-50 text-[#111113] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 label border-b border-[#111113]/12 mb-1">
                  Region &amp; Currency
                </div>
                {SUPPORTED_LOCALES.map((loc) => {
                  const isSelected = selectedLocale.code === loc.code;
                  return (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setSelectedLocale(loc);
                        setIsLocaleMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono transition-colors text-left",
                        isSelected
                          ? "bg-[#111113] text-white font-bold"
                          : "hover:bg-[#F8F7F4] text-[#111113]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{loc.flag}</span>
                        <span className="text-[11px]">{loc.label}</span>
                      </div>
                      <span className={cn("text-[10px]", isSelected ? "text-[#22c55e]" : "text-[#111113]/60")}>
                        {loc.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Help / Support Trigger */}
          <button
            type="button"
            onClick={handleTriggerHelp}
            className="flex items-center gap-1.5 h-7 px-2.5 border border-[#111113]/15 bg-white text-xs font-mono text-[#111113] hover:border-[#111113]/40 transition-colors"
            title="Chat with Support or read KYC FAQ"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#22c55e]" />
            <span className="text-[11px]">Help</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default MinimalistAuthFooter;
