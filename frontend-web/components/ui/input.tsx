import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input component adhering to 4_ui_system.md:
 * - Radius: Strictly 4px (--radius-control -> rounded-ui)
 * - Text: Geist 16px (text-base / 16px to prevent iOS auto-zoom)
 * - Validation: --color-state-error (#f56565) for destructive borders on invalid fields
 * - Focus Style: focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
 * - Motion: duration-200 ease-out
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-ui border border-ink/15 bg-surface px-3.5 py-2 text-base md:text-sm font-secondary text-ink placeholder:text-ink/45 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-state-error focus-visible:ring-state-error",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : props["aria-invalid"]}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
