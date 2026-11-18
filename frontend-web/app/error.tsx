"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";

/**
 * Root Error Boundary Component for Scrowpoint.
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - 0px sharp architectural cards paired with 999px pill primary CTAs
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Scrowpoint Client Exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center bg-paper p-4 md:p-8 text-ink font-secondary">
      <div className="w-full max-w-lg border border-state-error/50 bg-surface p-8 text-center space-y-6 rounded-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-state-error/15 text-state-error-strong">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-primary text-2xl font-bold tracking-[-0.03em] text-ink uppercase">
            Connection Interrupted<span className="text-accent-orange">.</span>
          </h1>
          <p className="font-secondary text-xs sm:text-sm text-ink/70 leading-relaxed">
            An unexpected error occurred while communicating with our services.
            Your escrow transactions and wallet balances remain protected.
          </p>
        </div>

        <div className="bg-surface-muted p-4 text-xs font-mono text-ink/75 border border-ink-faint space-y-1 rounded-card">
          <div className="flex items-center justify-center gap-2 text-ink font-bold">
            <ShieldAlert className="h-4 w-4 text-state-warning-strong" />
            <span>Escrow State Safeguard Active</span>
          </div>
          <div>Reference ID: {error.digest || "ERR_SP_TRANSACTION_RETRY"}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto h-11 px-6 rounded-full bg-ink hover:bg-accent-orange text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto h-11 px-6 border border-ink/15 bg-surface hover:border-ink text-ink text-xs font-mono uppercase tracking-wider font-bold transition-colors inline-flex items-center justify-center gap-2 rounded-ui"
          >
            <Home className="h-4 w-4" />
            <span>Go to Marketplace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
