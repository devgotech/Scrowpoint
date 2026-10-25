import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Button component configured to 4_ui_system.md:
 * - Radius: --radius-control (4px -> rounded-[4px])
 * - Typography: Geist Medium (font-secondary font-medium)
 * - Transitions: duration-200 ease-out (NEVER bouncy physics)
 * - Primary Fill: --brand-1000 (#0f172a / bg-[#0f172a])
 * - Focus Style: focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-[4px] text-sm font-secondary font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles = {
      default: "bg-[#0f172a] text-white shadow-xs hover:bg-[#0f172a]/90 active:bg-[#020617]",
      destructive:
        "bg-[#f56565] text-white shadow-xs hover:bg-[#f56565]/90 active:bg-[#e53e3e]",
      outline:
        "border border-[#e2e8f0] bg-white text-[#020617] shadow-xs hover:bg-[#f8fafc] hover:border-[#cbd5e1]",
      secondary:
        "bg-[#f1f5f9] text-[#0f172a] shadow-xs hover:bg-[#e2e8f0]",
      ghost: "hover:bg-[#f1f5f9] text-[#020617]",
      link: "text-[#0f172a] underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6 text-sm",
      icon: "h-9 w-9",
      "icon-sm": "h-8 w-8",
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
