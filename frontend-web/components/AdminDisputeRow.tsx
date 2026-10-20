"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
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
 * AdminDisputeRow Component for Buyer's High.
 *
 * Requirements (UI Context Spec 2 Tier 3, Master Prompt §2 Sandbox & Directives):
 * - Standard Table Row for Admin Dispute Queue on Desktop.
 * - Responsive Visibility: Visible strictly on desktop screens `md:table-row`.
 * - Hidden on mobile screens (`hidden md:table-row`), where `StackedCard` renders instead.
 * - Displays:
 *   1. Case ID & Created Date (font-mono)
 *   2. Gadget Title & Reason summary
 *   3. Buyer vs Seller identity
 *   4. Locked Escrow Amount (font-mono formatted NGN)
 *   5. Dispute Status Badge
 *   6. SLA Countdown timer (font-mono)
 *   7. Direct Review action button
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
      className: "bg-muted text-foreground border-border",
    },
    evidence_collection: {
      label: "Evidence",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/40",
    },
    seller_review: {
      label: "Seller Review",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/40",
    },
    admin_mediation: {
      label: "Mediation",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/50 font-bold",
    },
    resolved: {
      label: "Resolved",
      variant: "secondary" as const,
      className: "bg-muted text-muted-foreground border-border",
    },
    appealed: {
      label: "Appealed",
      variant: "warning" as const,
      className: "bg-warning/20 text-warning-text border-warning/40 font-bold",
    },
  }[dispute.status] || {
    label: dispute.status,
    variant: "secondary" as const,
    className: "bg-muted text-foreground border-border",
  };

  return (
    <tr
      className={cn(
        "hidden md:table-row border-b border-border/80 transition-colors duration-200 ease-out hover:bg-muted/40",
        dispute.isUrgentSla && "bg-warning/10",
        className
      )}
    >
      {/* 1. Case ID & Date */}
      <td className="px-4 py-3 align-middle text-xs">
        <div className="flex flex-col">
          <span className="mono-data text-foreground">
            #{dispute.id.slice(0, 8)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {dispute.createdAt}
          </span>
        </div>
      </td>

      {/* 2. Gadget & Issue Description */}
      <td className="px-4 py-3 align-middle text-xs">
        <div className="flex flex-col max-w-xs space-y-0.5">
          <span className="font-heading font-semibold text-foreground truncate">
            {dispute.gadgetTitle}
          </span>
          <span className="font-body text-muted-foreground truncate">
            {dispute.reason}
          </span>
        </div>
      </td>

      {/* 3. Buyer vs Seller */}
      <td className="px-4 py-3 align-middle text-xs font-body">
        <div className="flex flex-col space-y-0.5">
          <span className="text-foreground font-medium truncate max-w-[140px]">
            B: {dispute.buyerName}
          </span>
          <span className="text-muted-foreground truncate max-w-[140px]">
            S: {dispute.sellerName}
          </span>
        </div>
      </td>

      {/* 4. Locked Escrow Value */}
      <td className="px-4 py-3 align-middle text-xs">
        <div className="mono-data flex items-center gap-1.5 text-foreground">
          <Lock className="h-3 w-3 text-trust-strong shrink-0" />
          <span>{formattedLockedAmount}</span>
        </div>
      </td>

      {/* 5. Evidence Count */}
      <td className="px-4 py-3 align-middle text-xs">
        <span className="font-mono text-muted-foreground inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span>{dispute.evidenceCount}</span>
        </span>
      </td>

      {/* 6. Dispute Status Badge */}
      <td className="px-4 py-3 align-middle text-xs">
        <Badge
          variant={statusConfig.variant}
          className={cn("gap-1 py-0 px-2 text-[10px] font-semibold", statusConfig.className)}
        >
          <Scale className="h-3 w-3" />
          <span>{statusConfig.label}</span>
        </Badge>
      </td>

      {/* 7. SLA Deadline */}
      <td className="px-4 py-3 align-middle text-xs">
        <span
          className={cn(
            "font-mono inline-flex items-center gap-1 font-medium",
            dispute.isUrgentSla
              ? "text-warning-text font-bold"
              : "text-muted-foreground"
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{dispute.slaRemainingString}</span>
        </span>
      </td>

      {/* 8. Action Trigger */}
      <td className="px-4 py-3 align-middle text-right text-xs">
        <div className="flex items-center justify-end gap-2">
          {onQuickAssign && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onQuickAssign(dispute.id)}
              className="text-xs px-2 text-muted-foreground hover:text-foreground"
            >
              Assign
            </Button>
          )}

          <Link href={`/admin/disputes/${dispute.id}`}>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="text-xs px-2.5 gap-1 font-semibold shadow-[var(--shadow-soft-sm)]"
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
