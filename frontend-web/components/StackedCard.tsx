"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Eye, FileText, Lock, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { AdminDisputeData } from "@/types/dispute";
import { cn } from "@/lib/utils";

/**
 * StackedCard Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 2 Tier 3):
 * - Mobile glance-and-approve moderation view for admin disputes.
 * - Responsive Visibility: Visible strictly on screens under 768px (`md:hidden`).
 * - Corner Radius: --radius-card (8px -> rounded-ui). Inner elements: 4px.
 * - Displays locked amount in `font-mono`, status badge, buyer/seller parties, and SLA countdown timer.
 * - Highlights dispute reason and evidence count.
 * - Transitions: strict duration-200 ease-out (NEVER bouncy).
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
      className: "bg-surface-muted text-ink border-ink/15",
    },
    evidence_collection: {
      label: "Evidence Gathering",
      variant: "warning" as const,
      className: "bg-state-warning/20 text-state-warning-strong border-state-warning/40",
    },
    seller_review: {
      label: "Seller Review",
      variant: "warning" as const,
      className: "bg-state-warning/20 text-state-warning-strong border-state-warning/40",
    },
    admin_mediation: {
      label: "Admin Arbitration",
      variant: "warning" as const,
      className: "bg-state-warning/25 text-state-warning-strong border-state-warning/50 font-bold",
    },
    resolved: {
      label: "Settled / Closed",
      variant: "trust" as const,
      className: "bg-trust/15 text-trust-strong border-trust/30",
    },
    appealed: {
      label: "Under Appeal",
      variant: "destructive" as const,
      className: "bg-state-error/15 text-state-error-strong border-state-error/40 font-bold",
    },
  }[dispute.status] || {
    label: dispute.status,
    variant: "secondary" as const,
    className: "bg-surface-muted text-ink border-ink/15",
  };

  return (
    <div
      role="article"
      aria-label={`Dispute case ${dispute.id}`}
      className={cn(
        "block md:hidden w-full border border-ink-faint bg-surface p-4 space-y-3 transition-colors duration-200 ease-out hover:border-ink/35 rounded-card",
        dispute.isUrgentSla && "border-state-warning/80 bg-state-warning/5",
        className
      )}
    >
      {/* 1. Header: Dispute Reference + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="label">
            Dispute #{dispute.id.slice(0, 8)}
          </span>
          <h4 className="font-primary text-sm font-bold tracking-[-0.03em] text-ink line-clamp-1 mt-0.5">
            {dispute.gadgetTitle}
          </h4>
        </div>

        <Badge
          variant={statusConfig.variant}
          className={cn("gap-1 py-0.5 px-2 text-caption font-mono tracking-wider font-semibold shrink-0", statusConfig.className)}
        >
          <Scale className="h-3 w-3" />
          <span>{statusConfig.label}</span>
        </Badge>
      </div>

      {/* 2. Dispute Reason Callout */}
      <div className="bg-paper p-2.5 text-xs border border-ink/10 space-y-1 rounded-card">
        <span className="label block">
          Reported Issue:
        </span>
        <p className="font-secondary text-ink line-clamp-2 leading-relaxed">
          {dispute.reason}
        </p>
      </div>

      {/* 3. Middle Metrics: Locked Amount + Evidence + SLA */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink/10 text-xs">
        <div>
          <span className="label block">
            Locked in Vault
          </span>
          <span className="font-mono text-sm font-bold text-ink flex items-center gap-1 mt-0.5">
            <Lock className="h-3 w-3 text-trust" />
            {formattedLockedAmount}
          </span>
        </div>

        <div className="text-right">
          <span className="label block">
            Mediation SLA
          </span>
          <span
            className={cn(
              "font-mono text-xs font-medium flex items-center justify-end gap-1 mt-0.5",
              dispute.isUrgentSla
                ? "text-state-warning-strong animate-pulse font-bold"
                : "text-ink/65"
            )}
          >
            <Clock className="h-3 w-3 text-state-warning" />
            {dispute.slaRemainingString}
          </span>
        </div>
      </div>

      {/* 4. Parties & Evidence Metadata */}
      <div className="flex items-center justify-between text-xs text-ink/65 pt-1">
        <div className="truncate max-w-[180px] font-secondary">
          <span className="font-medium text-ink">{dispute.buyerName}</span>
          <span className="mx-1">vs</span>
          <span className="font-medium text-ink">{dispute.sellerName}</span>
        </div>

        <span className="font-mono text-meta inline-flex items-center gap-1 text-ink/65">
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
            className="w-full h-8 text-xs font-medium gap-1.5"
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
            className="h-8 text-xs shrink-0"
          >
            Assign
          </Button>
        )}
      </div>
    </div>
  );
}

export default StackedCard;
