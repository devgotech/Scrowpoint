"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CookieConsentModal — NDPR cookie notice and preferences dialog.
 *
 * Presentational only: it renders the two views from the Figma
 * "CookieConsentModal" component (Summary and Preferences) and reports the
 * visitor's choice through callbacks. Persisting consent, deciding when to
 * show the dialog, and loading optional scripts are left to the caller.
 *
 * Optional categories default to off, and "Reject non-essential" sits
 * beside "Accept all" with equal weight, so declining is as easy as agreeing.
 */

export type CookieCategoryId = "necessary" | "preferences" | "analytics" | "marketing";

export interface CookieConsentChoices {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const REJECT_NON_ESSENTIAL: CookieConsentChoices = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export const ACCEPT_ALL: CookieConsentChoices = {
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: true,
};

const CATEGORIES: {
  id: CookieCategoryId;
  title: string;
  description: string;
  locked?: boolean;
}[] = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description:
      "Keeps you signed in, secures checkout and protects your escrow vault sessions.",
    locked: true,
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Remembers your region, currency and display settings between visits.",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Anonymous usage statistics that help us improve listings and checkout.",
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Personalised gadget recommendations and campaign measurement.",
  },
];

export interface CookieConsentModalProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Choices to pre-fill the Preferences view (e.g. a previously saved consent). */
  initialChoices?: CookieConsentChoices;
  /** Open straight into the Preferences view (e.g. from a "Cookie settings" footer link). */
  initialView?: "summary" | "preferences";
  /** Called with the final choices for every button: accept all, reject non-essential, or save. */
  onConsent: (choices: CookieConsentChoices) => void;
  className?: string;
}

function CategorySwitch({
  checked,
  disabled,
  onChange,
  labelledBy,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  labelledBy: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-trust" : "bg-ink/25"
      )}
    >
      <span
        className={cn(
          "h-[18px] w-[18px] rounded-full bg-surface shadow-soft-sm transition-transform duration-200 ease-out",
          checked ? "translate-x-[18px]" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function CookieConsentModal({ open, ...props }: CookieConsentModalProps) {
  // Mounting the dialog only while open means every opening starts fresh
  // from initialView / initialChoices.
  if (!open) return null;
  return <CookieConsentDialog {...props} />;
}

function CookieConsentDialog({
  initialChoices = REJECT_NON_ESSENTIAL,
  initialView = "summary",
  onConsent,
  className,
}: Omit<CookieConsentModalProps, "open">) {
  const [view, setView] = useState<"summary" | "preferences">(initialView);
  const [choices, setChoices] = useState<CookieConsentChoices>(initialChoices);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const rowId = useId();

  // Move keyboard focus into the dialog when it appears.
  useEffect(() => {
    firstActionRef.current?.focus();
  }, []);

  const isPreferences = view === "preferences";

  return (
    // z-[60] keeps the dialog above the live-chat bubble and mobile bottom nav (both z-50).
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 text-left">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col gap-6 overflow-y-auto rounded-card border border-ink-faint bg-surface p-6 shadow-soft-lg",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-ink">
            <Cookie className="h-5 w-5 text-accent-orange" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <span className="label block">
              {isPreferences ? "NDPR • Cookie Preferences" : "NDPR • Cookie Notice"}
            </span>
            <h2
              id={titleId}
              className="font-primary text-xl font-bold tracking-[-0.03em] text-ink"
            >
              {isPreferences
                ? "Choose what we can use."
                : "Your privacy, protected like your escrow."}
            </h2>
          </div>
        </div>

        <p id={descriptionId} className="font-secondary text-sm leading-relaxed text-ink/70">
          {isPreferences
            ? "Strictly necessary cookies keep Scrowpoint secure and can't be switched off. Everything else is your call, and you can change it any time from the footer."
            : "We use cookies to keep you signed in, secure every escrow session and understand how the marketplace is used. Optional cookies stay off until you turn them on."}
        </p>

        {/* Category switches */}
        {isPreferences && (
          <ul className="space-y-3">
            {CATEGORIES.map((category) => {
              const labelId = `${rowId}-${category.id}`;
              const checked = category.locked ? true : choices[category.id];
              return (
                <li
                  key={category.id}
                  className={cn(
                    "flex items-start gap-4 rounded-card border border-ink-faint p-4",
                    category.locked ? "bg-paper" : "bg-surface"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        id={labelId}
                        className="font-primary text-sm font-bold tracking-[-0.02em] text-ink"
                      >
                        {category.title}
                      </span>
                      {category.locked && (
                        <span className="rounded-full bg-trust-strong/10 px-2 py-0.5 font-mono text-caption font-bold uppercase tracking-[0.1em] text-trust-strong">
                          Always on
                        </span>
                      )}
                    </div>
                    <p className="font-secondary text-xs leading-relaxed text-ink/65">
                      {category.description}
                    </p>
                  </div>
                  <CategorySwitch
                    checked={checked}
                    disabled={category.locked}
                    labelledBy={labelId}
                    onChange={(next) =>
                      setChoices((prev) => ({ ...prev, [category.id]: next }))
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/legal/privacy"
          className="inline-flex items-center gap-1.5 self-start font-secondary text-xs font-semibold text-ink underline underline-offset-4 hover:text-accent-orange"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-trust" aria-hidden="true" />
          <span>Read our Data Masking &amp; Privacy Policy</span>
        </Link>

        {/* Actions */}
        <div className="space-y-3 border-t border-ink-faint pt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              ref={firstActionRef}
              variant="outline"
              onClick={() => onConsent(REJECT_NON_ESSENTIAL)}
            >
              Reject non-essential
            </Button>
            <Button onClick={() => onConsent(ACCEPT_ALL)}>Accept all</Button>
          </div>
          {isPreferences ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onConsent({ ...choices, necessary: true })}
            >
              Save my choices
            </Button>
          ) : (
            <Button variant="ghost" className="w-full" onClick={() => setView("preferences")}>
              Customize preferences
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookieConsentModal;
