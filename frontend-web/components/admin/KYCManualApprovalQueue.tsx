"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, FileText, IdCard, ShieldAlert, ShieldCheck, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * KYCManualApprovalQueue Component (Phase 6 §2 - Dispute Triage & Pending KYC)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Moderation queue for edge-case KYC submissions flagged for manual check.
 * - Displays applicant name, NIN number, document scan, and quick Approve / Reject actions.
 * - Token Compliance: 8px container radius, 4px controls, font-mono NIN and timestamps.
 */

export interface PendingKYCRecord {
  id: string;
  userName: string;
  userEmail: string;
  ninNumber: string;
  docType: "NIN Slip" | "Passport" | "Driver's License";
  flagReason: string;
  submittedAt: string;
}

export const SAMPLE_PENDING_KYC: PendingKYCRecord[] = [
  {
    id: "kyc-01",
    userName: "Babatunde Alabi",
    userEmail: "babatunde.a@gmail.com",
    ninNumber: "49102910482",
    docType: "NIN Slip",
    flagReason: "Minor flash glare on document serial number",
    submittedAt: "10 mins ago",
  },
  {
    id: "kyc-02",
    userName: "Ngozi Eze",
    userEmail: "ngozi.eze@techhub.ng",
    ninNumber: "88219401920",
    docType: "Driver's License",
    flagReason: "FRSC database timeout on first query",
    submittedAt: "25 mins ago",
  },
];

export interface KYCManualApprovalQueueProps {
  items?: PendingKYCRecord[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

export function KYCManualApprovalQueue({
  items = SAMPLE_PENDING_KYC,
  onApprove,
  onReject,
  className,
}: KYCManualApprovalQueueProps) {
  const [queue, setQueue] = useState<PendingKYCRecord[]>(items);

  const handleApprove = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    onApprove?.(id);
  };

  const handleReject = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    onReject?.(id);
  };

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-[#111113]/12">
        <div>
          <div className="flex items-center gap-2">
            <IdCard className="h-4 w-4 text-[#111113]" />
            <h3 className="font-primary text-base font-bold text-[#111113] tracking-[-0.03em]">
              SmileID Biometric Review Queue
            </h3>
          </div>
          <p className="font-secondary text-xs text-[#111113]/65 mt-0.5">
            Manual inspection for ambiguous document crops or glare detections.
          </p>
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.12em] bg-[#F8F7F4] border border-[#111113]/12 px-2.5 py-1 font-bold text-[#111113]">
          {queue.length} Pending
        </span>
      </div>

      <div className="divide-y divide-[#111113]/12">
        {queue.length === 0 ? (
          <div className="p-8 text-center text-xs font-secondary text-[#111113]/60">
            All identity submissions cleared.
          </div>
        ) : (
          queue.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F7F4] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-primary font-bold text-xs text-[#111113]">
                    {item.userName}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-[#F0EFEA] text-[#111113]/70 px-1.5 py-0.5">
                    {item.docType}
                  </span>
                </div>
                <div className="font-mono text-xs text-[#111113]/65">
                  NIN: {item.ninNumber} • {item.userEmail}
                </div>
                <div className="font-secondary text-[11px] text-[#975a16] bg-[#ecc94b]/15 px-2 py-0.5 inline-block">
                  Flag: {item.flagReason}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(item.id)}
                  className="h-9 px-3.5 rounded-full text-xs font-mono border-[#f56565]/40 text-[#c53030] hover:bg-[#f56565]/10 gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(item.id)}
                  className="h-9 px-3.5 rounded-full text-xs font-mono font-bold bg-[#15803d] hover:bg-[#166534] text-white gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve KYC</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default KYCManualApprovalQueue;
