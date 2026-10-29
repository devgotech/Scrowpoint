import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Button component configured to Design Variation 7 (4_ui_system.md):
 * - Radius: --radius-control (rounded-full pill for primary actions)
 * - Typography: Plus Jakarta Sans Semibold (font-secondary font-semibold)
 * - Transitions: duration-200 ease-out
 * - Primary Fill: --ink (#111113 / bg-[#111113]) with --accent (#FF5A25) hover state
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-secondary font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111113] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles = {
      default:
        "bg-[#111113] text-white hover:bg-[#FF5A25] active:bg-[#111113]",
      destructive:
        "bg-[#f56565] text-white hover:bg-[#f56565]/90 active:bg-[#e53e3e]",
      outline:
        "border border-[#111113]/15 bg-white text-[#111113] hover:bg-[#F8F7F4] hover:border-[#111113]/40",
      secondary:
        "bg-[#F0EFEA] text-[#111113] hover:bg-[#E5E3DC]",
      ghost: "hover:bg-[#111113]/5 text-[#111113]",
      link: "text-[#111113] underline-offset-4 hover:underline",
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
