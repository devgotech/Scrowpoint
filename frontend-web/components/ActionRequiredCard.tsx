"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  PackageCheck,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ActionRequiredCard Component for Buyer's High.
 *
 * Requirements (UI Context Spec 2 Tier 1, Spec 4 §5 Dashboard, Spec 5 §2):
 * - Wrapper using the Shadcn Alert primitive.
 * - Used on `/dashboard` and `/escrow/[id]/status` to highlight blocking steps.
 * - Primary Action Button: Immediately unblocks the transaction (e.g. "Approve Item", "Submit Tracking Waybill").
 * - Secondary Action Button: Optional secondary route (e.g. "Raise Dispute").
 * - Critical timer badge if time-bound (e.g., "48h inspection countdown: 02h 15m remaining").
 * - Strict adherence to the 4-point spacing scale (p-4, gap-3, etc.) and semantic colors (`warning`, `trust`, `destructive`).
 */

export type ActionRequiredType =
  | "APPROVE_DELIVERY"
  | "SHIP_ITEM"
  | "FUND_ESCROW"
  | "SUBMIT_EVIDENCE"
  | "RESPOND_TO_DISPUTE"
  | "COMPLETE_KYC";

export interface ActionRequiredCardProps {
  type?: ActionRequiredType;
  title?: string;
  description?: string;
  orderNumber?: string;
  /** Primary button text (e.g. "Approve Item & Release Funds") */
  primaryActionLabel?: string;
  /** Callback fired when primary button is clicked */
  onPrimaryAction?: () => void | Promise<void>;
  /** Secondary button text (e.g. "Report Issue / Dispute") */
  secondaryActionLabel?: string;
  /** Callback fired when secondary button is clicked */
  onSecondaryAction?: () => void;
  /** Time remaining formatted string in font-mono (e.g., "01h 48m") */
  countdownString?: string;
  isLoading?: boolean;
  className?: string;
}

export function ActionRequiredCard({
  type = "APPROVE_DELIVERY",
  title,
  description,
  orderNumber = "BH-ORD-94218A",
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  countdownString = "01h 54m 20s",
  isLoading = false,
  className,
}: ActionRequiredCardProps) {
  // Config presets for core blocking marketplace scenarios
  const config = useMemo(() => {
    switch (type) {
      case "APPROVE_DELIVERY":
        return {
          title: title || "Action Required: Inspect & Approve Delivery",
          description:
            description ||
            `Your gadget has arrived. You have an active 48-hour inspection period to verify device hardware, screen condition, and iCloud/carrier status before funds auto-release.`,
          primaryLabel: primaryActionLabel || "Approve Item & Release Funds",
          secondaryLabel: secondaryActionLabel || "Report Issue / Dispute",
          variant: "warning" as const,
          icon: Clock,
          urgent: true,
        };
      case "SHIP_ITEM":
        return {
          title: title || "Action Required: Package & Ship Gadget",
          description:
            description ||
            `Buyer has deposited funds into escrow. Funds are 100% secured in vault. Please dispatch the package via courier and upload your tracking number.`,
          primaryLabel: primaryActionLabel || "Upload Tracking Waybill",
          secondaryLabel: secondaryActionLabel || "View Shipping Label",
          variant: "trust" as const,
          icon: PackageCheck,
          urgent: false,
        };
      case "SUBMIT_EVIDENCE":
        return {
          title: title || "Action Required: Submit Dispute Evidence",
          description:
            description ||
            `A dispute was initiated on ${orderNumber}. Please submit photos, video, or courier waybill receipts to our mediation officer within 24 hours.`,
          primaryLabel: primaryActionLabel || "Upload Dispute Evidence",
          secondaryLabel: secondaryActionLabel || "View Case Details",
          variant: "destructive" as const,
          icon: ShieldAlert,
          urgent: true,
        };
      case "COMPLETE_KYC":
        return {
          title: title || "Action Required: Identity Verification Needed",
          description:
            description ||
            `To unlock high-volume escrow trades and seller bank payouts, please submit a valid government ID and selfie.`,
          primaryLabel: primaryActionLabel || "Verify Identity with SmileID",
          secondaryLabel: secondaryActionLabel || "Learn More",
          variant: "default" as const,
          icon: ShieldCheck,
          urgent: false,
        };
      case "FUND_ESCROW":
      default:
        return {
          title: title || "Action Required: Complete Escrow Deposit",
          description:
            description ||
            `Listing has been reserved for your account. Complete Paystack escrow deposit to initiate seller dispatch.`,
          primaryLabel: primaryActionLabel || "Deposit Escrow Funds",
          secondaryLabel: secondaryActionLabel || "Cancel Reservation",
          variant: "warning" as const,
          icon: Lock,
          urgent: false,
        };
    }
  }, [type, title, description, orderNumber, primaryActionLabel, secondaryActionLabel]);

  const Icon = config.icon;

  return (
    <Alert
      variant={config.variant}
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-200",
        config.urgent && "border-amber-400 dark:border-amber-500/80 shadow-md",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Icon, Title, and Description */}
        <div className="flex items-start gap-3.5 flex-1">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              config.variant === "warning"
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : config.variant === "trust"
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : config.variant === "destructive"
                ? "bg-destructive/20 text-destructive"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5 fill-current/20" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <AlertTitle className="font-heading text-base font-bold text-foreground">
                {config.title}
              </AlertTitle>

              {/* Order Reference Pill */}
              <span className="font-mono text-[10px] rounded-md bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
                {orderNumber}
              </span>
            </div>

            <AlertDescription className="font-body text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {config.description}
            </AlertDescription>

            {/* Countdown Warning Bar if Active */}
            {countdownString && (
              <div className="mt-2 flex items-center gap-2 text-xs font-mono font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                <span className="text-muted-foreground">Time Remaining:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {countdownString}
                </span>
                <span className="text-[10px] text-muted-foreground font-body">
                  (auto-resolves upon expiration)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Primary and Optional Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
          {config.secondaryLabel && onSecondaryAction && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
              className="text-xs h-9 border-border text-foreground hover:bg-muted"
            >
              <span>{config.secondaryLabel}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={onPrimaryAction}
            className={cn(
              "gap-2 text-xs h-9 font-semibold shadow-xs transition-transform active:scale-95",
              config.variant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600",
              config.variant === "trust" && "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{config.primaryLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Alert>
  );
}

export default ActionRequiredCard;
