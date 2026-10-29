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
      "border border-[#22c55e]/30 bg-[#22c55e]/15 text-[#15803d] font-semibold",
    "trust-solid":
      "border-transparent bg-[#22c55e] text-white font-semibold",
    // Semantic Success: Escrow Funded (#088235)
    success:
      "border border-[#088235]/30 bg-[#088235]/15 text-[#088235] font-semibold",
    // Semantic Warning: Dispute Open / Action Required (#ecc94b)
    warning:
      "border border-[#ecc94b]/50 bg-[#ecc94b]/20 text-[#975a16] font-semibold",
    // Semantic Error: Verification Failed (#f56565)
    destructive:
      "border border-[#f56565]/40 bg-[#f56565]/15 text-[#c53030] font-semibold",
    // In Transit: Courier Item (#111113)
    transit:
      "border border-[#111113]/20 bg-[#111113] text-white font-semibold",
    // Default / Secondary / Outline (Variation 7)
    default:
      "border-transparent bg-[#111113] text-white",
    secondary:
      "border border-[#111113]/12 bg-[#F0EFEA] text-[#111113]/75",
    outline:
      "border border-[#111113]/15 text-[#111113] bg-white",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.12em] uppercase transition-colors duration-200 ease-out select-none",
        usePillRadius ? "rounded-full" : "rounded-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
