import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
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
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground border-border",
    trust:
      "rounded-[var(--radius-badge)] border-transparent bg-trust-subtle text-trust-strong font-medium",
    "trust-solid":
      "border-transparent bg-[#22c55e] text-white font-semibold shadow-xs",
    warning:
      "border-transparent bg-warning/20 text-warning-text font-medium",
    "success":
      "border-transparent bg-success/20 text-success-text font-medium",
    "transit":
      "border border-[#0f172a]/20 bg-[#0f172a] text-white font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
