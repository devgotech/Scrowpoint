"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Eye,
  FileText,
  Lock,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { AdminDisputeData } from "@/types/dispute";
import { cn } from "@/lib/utils";

/**
 * StackedCard Component for Scrowpoint.
 *
 * Requirements (UI Context Spec 2 Tier 3, Master Prompt §2 Sandbox & Directives):
 * - Mobile glance-and-approve moderation view for admin disputes.
 * - Responsive Visibility: Visible strictly on screens under 768px (`md:hidden`).
 * - Displays locked amount in `font-mono`, status pill, buyer/seller parties, and SLA countdown timer.
 * - Highlights dispute reason and evidence count.
 * - Provides immediate CTA to triage case at `/admin/disputes/[id]`.
 */

export interface StackedCardProps {
  dispute: AdminDisputeData;
  className?: string;
  onQuickAssign?: (id: string) => void;
}

export function StackedCard({
  dispute,
  className,
  onQuickAssign,
}: StackedCardProps) {
  const formattedLockedAmount = formatCurrency(dispute.lockedAmountKobo);

  const statusConfig = {
    open: {
      label: "Open Dispute",
      variant: "secondary" as const,
      className: "bg-muted text-foreground border-border",
    },
    evidence_collection: {
      label: "Evidence Gathering",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/40",
    },
    seller_review: {
      label: "Seller Review",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/40",
    },
    admin_mediation: {
      label: "Admin Arbitration",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/50 font-bold",
    },
    resolved: {
      label: "Settled / Closed",
      variant: "secondary" as const,
      className: "bg-muted text-muted-foreground border-border",
    },
    appealed: {
      label: "Under Appeal",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/40 font-bold",
    },
  }[dispute.status] || {
    label: dispute.status,
    variant: "secondary" as const,
    className: "bg-muted text-foreground border-border",
  };

  return (
    <div
      role="article"
      aria-label={`Dispute case ${dispute.id}`}
      className={cn(
        "block md:hidden w-full rounded-lg border border-border bg-card p-4 shadow-xs space-y-3 transition-colors duration-200 ease-out hover:border-border/90",
        dispute.isUrgentSla && "border-warning/80 bg-warning/10",
        className
      )}
    >
      {/* 1. Header: Dispute Reference + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="mono-data text-muted-foreground">
            Dispute #{dispute.id.slice(0, 8)}
          </span>
          <h4 className="font-heading text-sm font-semibold text-foreground line-clamp-1">
            {dispute.gadgetTitle}
          </h4>
        </div>

        <Badge
          variant={statusConfig.variant}
          className={cn("gap-1 py-0.5 px-2 text-[10px] font-semibold shrink-0", statusConfig.className)}
        >
          <Scale className="h-3 w-3" />
          <span>{statusConfig.label}</span>
        </Badge>
      </div>

      {/* 2. Dispute Reason Callout */}
      <div className="rounded-lg bg-muted/50 p-2.5 text-xs border border-border/60 space-y-1">
        <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground block">
          Reported Issue:
        </span>
        <p className="font-body text-foreground line-clamp-2 leading-relaxed">
          {dispute.reason}
        </p>
      </div>

      {/* 3. Middle Metrics: Locked Amount + Evidence + SLA */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-xs">
        <div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground block">
            Locked in Vault
          </span>
          <span className="mono-data text-foreground flex items-center gap-1">
            <Lock className="h-3 w-3 text-trust-strong" />
            {formattedLockedAmount}
          </span>
        </div>

        <div className="text-right">
          <span className="font-mono text-[10px] uppercase text-muted-foreground block">
            Mediation SLA
          </span>
          <span
            className={cn(
              "mono-data flex items-center justify-end gap-1",
              dispute.isUrgentSla
                ? "text-warning-text font-bold"
                : "text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3" />
            {dispute.slaRemainingString}
          </span>
        </div>
      </div>

      {/* 4. Parties & Evidence Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div className="truncate max-w-[180px]">
          <span className="font-medium text-foreground">{dispute.buyerName}</span>
          <span className="mx-1">vs</span>
          <span className="font-medium text-foreground">{dispute.sellerName}</span>
        </div>

        <span className="font-mono text-[11px] inline-flex items-center gap-1 text-muted-foreground">
          <FileText className="h-3 w-3" />
          {dispute.evidenceCount} files
        </span>
      </div>

      {/* 5. Mobile Actions */}
      <div className="pt-2 flex items-center gap-2">
        <Link href={`/admin/disputes/${dispute.id}`} className="flex-1">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Review Case</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>

        {onQuickAssign && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onQuickAssign(dispute.id)}
            className="text-xs border-border shrink-0"
          >
            Assign
          </Button>
        )}
      </div>
    </div>
  );
}

export default StackedCard;
