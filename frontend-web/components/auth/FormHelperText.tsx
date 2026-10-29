"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FormHelperText Component
 *
 * Requirements (5_screen_flows.md Phase 1 §4 & 4_ui_system.md):
 * - Displays contextual form validation feedback, password strength rules, and field requirements.
 * - Variants: "default" | "error" | "success" | "warning"
 * - Typography: Geist font, 11px / line-height 16px.
 * - Icon integration for clear accessibility.
 */

export interface FormHelperTextProps {
  children: React.ReactNode;
  variant?: "default" | "error" | "success" | "warning";
  className?: string;
  icon?: boolean;
}

export function FormHelperText({
  children,
  variant = "default",
  className,
  icon = true,
}: FormHelperTextProps) {
  const variantStyles = {
    default: "text-[#111113]/65",
    error: "text-[#c53030]",
    success: "text-[#15803d]",
    warning: "text-[#975a16]",
  }[variant];

  const IconComponent = {
    default: Info,
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertCircle,
  }[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[11px] font-secondary mt-1 transition-colors duration-150",
        variantStyles,
        className
      )}
    >
      {icon && <IconComponent className="h-3 w-3 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

export default FormHelperText;
