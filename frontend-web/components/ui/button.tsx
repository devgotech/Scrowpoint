import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Button component configured to Design Variation 7 (4_ui_system.md):
 * - Radius: --radius-control (rounded-full pill for primary actions)
 * - Typography: Plus Jakarta Sans Semibold (font-secondary font-semibold)
 * - Transitions: duration-200 ease-out
 * - Primary Fill: --ink (#111113 / bg-ink) with --accent (#FF5A25) hover state
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-secondary font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles = {
      default:
        "bg-ink text-white hover:bg-accent-orange active:bg-ink",
      destructive:
        "bg-state-error text-white hover:bg-state-error/90 active:bg-state-error-hover",
      outline:
        "border border-ink/15 bg-surface text-ink hover:bg-paper hover:border-ink/40 rounded-card",
      secondary:
        "bg-surface-muted text-ink hover:bg-surface-muted-alt",
      ghost: "hover:bg-ink/5 text-ink",
      link: "text-ink underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      default: "h-10 px-5 py-2 text-sm",
      sm: "h-9 px-4 text-xs",
      lg: "h-12 px-8 text-sm",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
