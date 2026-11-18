import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Alert Component adhering to 4_ui_system.md:
 * - Radius: --radius-card (8px -> rounded-ui)
 * - Colors:
 *   - destructive: Verification Failed (#f56565 border & tint)
 *   - warning: Dispute Open / Action Required (#ecc94b border & tint)
 *   - trust: Escrow Signal (#22c55e border, #15803d text contrast on light)
 * - Typography: font-primary for Title, font-secondary for Description
 * - Motion: duration-200 ease-out
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "trust";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-surface text-ink border-ink-faint",
      destructive:
        "border-state-error/40 text-state-error-strong [&>svg]:text-state-error bg-state-error/10",
      warning:
        "border-state-warning/50 text-state-warning-strong [&>svg]:text-state-warning bg-state-warning/15",
      trust:
        "border-trust/40 text-trust-strong [&>svg]:text-trust bg-trust/10",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-card border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 transition-colors duration-200 ease-out",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-primary font-medium text-sm leading-5 tracking-[-0.03em] text-ink", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-secondary text-xs font-normal leading-5 text-ink/70 [&_p]:leading-5", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
