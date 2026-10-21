import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Alert Component adhering to 4_ui_system.md:
 * - Radius: --radius-card (8px -> rounded-[8px])
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
      default: "bg-white text-[#020617] border-[#e2e8f0]",
      destructive:
        "border-[#f56565]/40 text-[#c53030] [&>svg]:text-[#f56565] bg-[#f56565]/10",
      warning:
        "border-[#ecc94b]/50 text-[#975a16] [&>svg]:text-[#ecc94b] bg-[#ecc94b]/15",
      trust:
        "border-[#22c55e]/40 text-[#15803d] [&>svg]:text-[#22c55e] bg-[#22c55e]/10",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-[8px] border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 transition-colors duration-200 ease-out",
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
    className={cn("mb-1 font-primary font-medium text-sm leading-5 tracking-normal text-[#020617]", className)}
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
    className={cn("font-secondary text-xs font-normal leading-5 text-[#64748b] [&_p]:leading-5", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
