import Link from "next/link";
import { Home, Search, ShieldCheck } from "lucide-react";

/**
 * 404 Not Found Page for Scrowpoint.
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - 0px sharp architectural cards (border-ink-faint) paired with 999px pill primary CTAs
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center bg-paper p-4 sm:p-6 lg:p-8 text-ink font-secondary">
      <div className="w-full max-w-lg border border-ink/15 bg-surface text-center overflow-hidden rounded-card">
        <div className="h-1.5 w-full bg-ink" />

        <div className="p-8 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-ink/15 bg-surface-muted rounded-ui">
            <span className="font-mono text-2xl font-bold tracking-[-0.04em] text-ink">
              404
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-primary text-2xl font-bold tracking-[-0.03em] text-ink uppercase">
              Page or Gadget Not Found<span className="text-accent-orange">.</span>
            </h1>

            <p className="font-secondary text-xs sm:text-sm text-ink/70 max-w-sm mx-auto leading-relaxed">
              The gadget listing, escrow room, or destination you requested may
              have been settled, removed, or does not exist at this URL.
            </p>
          </div>

          <div className="border border-trust-strong/30 bg-trust/10 p-3.5 text-xs text-trust-strong font-secondary flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-trust-strong shrink-0" />
            <span>
              All active escrow funds and balances remain safe in Paystack
              custody.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/marketplace"
              className="btn-primary w-full sm:w-auto h-11 px-6 rounded-full bg-ink hover:bg-accent-orange text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Browse Marketplace</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto h-11 px-6 border border-ink/15 bg-surface hover:border-ink text-ink text-xs font-mono uppercase tracking-wider font-bold transition-colors inline-flex items-center justify-center gap-2 rounded-ui"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
