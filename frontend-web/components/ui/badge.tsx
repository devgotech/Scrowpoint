import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Trust & Status Badge adhering to 4_ui_system.md:
 * - Radius: ONLY Trust Badges use --radius-badge (rounded-full / 9999px). Other status items use 4px.
 * - Colors:
 *   - trust: Background #22c55e (15% tint), Text #15803d (--color-trust-strong for WCAG contrast on white)
 *   - success: Escrow Funded #088235
 *   - warning: #ecc94b (Dispute Open / Action Required)
 *   - destructive: #f56565 (Verification Failed)
 * - Typography: type-label-caps (Geist Mono, 600, 12px, tracking-[0.04em], uppercase)
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "trust"
    | "trust-solid"
    | "warning"
    | "success"
    | "transit";
  isPill?: boolean;
}

function Badge({
  className,
  variant = "default",
  isPill,
  ...props
}: BadgeProps) {
  // 4_ui_system.md Rule 3: NEVER use --radius-badge (pill) on anything except trust badges.
  const isTrustBadge = variant === "trust" || variant === "trust-solid";
  const usePillRadius = isPill !== undefined ? isPill : isTrustBadge;

  const variantStyles = {
    // Trust Green Badge: Backgrounds, badges, icons with --color-trust-strong text on white
    trust:
      "border border-trust/30 bg-trust/15 text-trust-strong font-semibold",
    "trust-solid":
      "border-transparent bg-trust text-white font-semibold",
    // Semantic Success: Escrow Funded (#088235)
    success:
      "border border-state-success/30 bg-state-success/15 text-state-success font-semibold",
    // Semantic Warning: Dispute Open / Action Required (#ecc94b)
    warning:
      "border border-state-warning/50 bg-state-warning/20 text-state-warning-strong font-semibold",
    // Semantic Error: Verification Failed (#f56565)
    destructive:
      "border border-state-error/40 bg-state-error/15 text-state-error-strong font-semibold",
    // In Transit: Courier Item (#111113)
    transit:
      "border border-ink/20 bg-ink text-white font-semibold",
    // Default / Secondary / Outline (Variation 7)
    default:
      "border-transparent bg-ink text-white",
    secondary:
      "border border-ink-faint bg-surface-muted text-ink/75 rounded-card",
    outline:
      "border border-ink/15 text-ink bg-surface rounded-card",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.12em] uppercase transition-colors duration-200 ease-out select-none",
        usePillRadius ? "rounded-full" : "rounded-ui",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
