"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Lock, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { AdminDisputeData } from "@/types/dispute";
import { cn } from "@/lib/utils";

/**
 * AdminDisputeRow Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 2 Tier 3):
 * - Standard Table Row for Admin Dispute Queue on Desktop.
 * - Responsive Visibility: Visible strictly on desktop screens `md:table-row`.
 * - Hidden on mobile screens (`hidden md:table-row`), where `StackedCard` renders instead.
 * - Displays:
 *   1. Case ID & Created Date (font-mono)
 *   2. Gadget Title & Reason summary (font-primary / font-secondary)
 *   3. Buyer vs Seller identity
 *   4. Locked Escrow Amount (font-mono formatted NGN)
 *   5. Dispute Status Badge (semantic warning / error / trust colors)
 *   6. SLA Countdown timer (font-mono)
 *   7. Direct Review action button (rounded-ui, duration-200 ease-out)
 */

export interface AdminDisputeRowProps {
  dispute: AdminDisputeData;
  className?: string;
  onQuickAssign?: (id: string) => void;
}

export function AdminDisputeRow({
  dispute,
  className,
  onQuickAssign,
}: AdminDisputeRowProps) {
  const formattedLockedAmount = formatCurrency(dispute.lockedAmountKobo);

  const statusConfig = {
    open: {
      label: "Open",
      variant: "secondary" as const,
      className: "bg-surface-muted text-ink border-ink/15",
    },
    evidence_collection: {
      label: "Evidence",
      variant: "warning" as const,
      className: "bg-state-warning/20 text-state-warning-strong border-state-warning/40",
    },
    seller_review: {
      label: "Seller Review",
      variant: "warning" as const,
      className: "bg-state-warning/20 text-state-warning-strong border-state-warning/40",
    },
    admin_mediation: {
      label: "Mediation",
      variant: "warning" as const,
      className: "bg-state-warning/25 text-state-warning-strong border-state-warning/50 font-bold",
    },
    resolved: {
      label: "Resolved",
      variant: "trust" as const,
      className: "bg-trust/15 text-trust-strong border-trust/30",
    },
    appealed: {
      label: "Appealed",
      variant: "destructive" as const,
      className: "bg-state-error/15 text-state-error-strong border-state-error/40 font-bold",
    },
  }[dispute.status] || {
    label: dispute.status,
    variant: "secondary" as const,
    className: "bg-surface-muted text-ink border-ink/15",
  };

  return (
    <tr
      className={cn(
        "hidden md:table-row border-b border-ink/10 transition-colors duration-200 ease-out hover:bg-paper",
        dispute.isUrgentSla && "bg-state-warning/5",
        className
      )}
    >
      {/* 1. Case ID & Date */}
      <td className="px-4 py-3.5 align-middle text-xs">
        <div className="flex flex-col">
          <span className="font-mono font-bold text-ink">
            #{dispute.id.slice(0, 8)}
          </span>
          <span className="font-mono text-caption text-ink/55">
            {dispute.createdAt}
          </span>
        </div>
      </td>

      {/* 2. Gadget & Issue Description */}
      <td className="px-4 py-3.5 align-middle text-xs">
        <div className="flex flex-col max-w-xs space-y-0.5">
          <span className="font-primary font-bold tracking-[-0.02em] text-ink truncate">
            {dispute.gadgetTitle}
          </span>
          <span className="font-secondary text-ink/65 truncate">
            {dispute.reason}
          </span>
        </div>
      </td>

      {/* 3. Buyer vs Seller */}
      <td className="px-4 py-3.5 align-middle text-xs font-secondary">
        <div className="flex flex-col space-y-0.5">
          <span className="text-ink font-medium truncate max-w-[140px]">
            B: {dispute.buyerName}
          </span>
          <span className="text-ink/65 truncate max-w-[140px]">
            S: {dispute.sellerName}
          </span>
        </div>
      </td>

      {/* 4. Locked Escrow Value */}
      <td className="px-4 py-3.5 align-middle text-xs">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-ink">
          <Lock className="h-3 w-3 text-trust shrink-0" />
          <span>{formattedLockedAmount}</span>
        </div>
      </td>

      {/* 5. Evidence Count */}
      <td className="px-4 py-3.5 align-middle text-xs">
        <span className="font-mono text-ink/65 inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span>{dispute.evidenceCount}</span>
        </span>
      </td>

      {/* 6. Dispute Status Badge */}
      <td className="px-4 py-3.5 align-middle text-xs">
        <Badge
          variant={statusConfig.variant}
          className={cn("gap-1 py-0 px-2 text-caption font-mono tracking-wider font-semibold", statusConfig.className)}
        >
          <Scale className="h-3 w-3" />
          <span>{statusConfig.label}</span>
        </Badge>
      </td>

      {/* 7. SLA Deadline */}
      <td className="px-4 py-3.5 align-middle text-xs">
        <span
          className={cn(
            "font-mono inline-flex items-center gap-1 font-medium",
            dispute.isUrgentSla
              ? "text-state-warning-strong font-bold animate-pulse"
              : "text-ink/65"
          )}
        >
          <Clock className="h-3 w-3 text-state-warning" />
          <span>{dispute.slaRemainingString}</span>
        </span>
      </td>

      {/* 8. Action Trigger */}
      <td className="px-4 py-3.5 align-middle text-right text-xs">
        <div className="flex items-center justify-end gap-2">
          {onQuickAssign && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onQuickAssign(dispute.id)}
              className="h-7 text-xs px-2 text-ink/65 hover:text-ink"
            >
              Assign
            </Button>
          )}

          <Link href={`/admin/disputes/${dispute.id}`}>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-7 text-xs px-3 gap-1 font-medium"
            >
              <span>Review</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default AdminDisputeRow;
