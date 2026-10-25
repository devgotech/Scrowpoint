"use client";

import React, { useState } from "react";
import { Camera, Check, ExternalLink, Eye, FileText, Image as ImageIcon, ShieldAlert, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EvidenceViewer Component (Phase 6 §1 - Arbitration Room)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Split-pane image & diagnostic report inspector for mediator rulings.
 * - Displays unboxing video clips, IMEI screenshots, battery health diagnostics.
 * - Token Compliance: 8px container radius, 4px thumbnail controls.
 */

export interface EvidenceAsset {
  id: string;
  title: string;
  source: "buyer" | "seller";
  type: "diagnostic" | "photo" | "waybill";
  url: string;
  notes: string;
}

export const SAMPLE_EVIDENCE: EvidenceAsset[] = [
  {
    id: "ev-1",
    title: "Buyer Unboxing Battery Diagnostic",
    source: "buyer",
    type: "diagnostic",
    url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    notes: "Screenshot shows iOS Settings > Battery Health reporting 78% Maximum Capacity Service warning.",
  },
  {
    id: "ev-2",
    title: "Seller Pre-Shipment IMEI Proof",
    source: "seller",
    type: "photo",
    url: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80",
    notes: "Photo of clean rear housing and box serial number PHN-APL-IP14PM.",
  },
  {
    id: "ev-3",
    title: "GIG Logistics Tamper-Seal Photo",
    source: "seller",
    type: "waybill",
    url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
    notes: "Signed courier handoff waybill with intact security seal.",
  },
];

export interface EvidenceViewerProps {
  evidence?: EvidenceAsset[];
  className?: string;
}

export function EvidenceViewer({
  evidence = SAMPLE_EVIDENCE,
  className,
}: EvidenceViewerProps) {
  const [activeAssetId, setActiveAssetId] = useState<string>(evidence[0]?.id || "ev-1");
  const activeAsset = evidence.find((e) => e.id === activeAssetId) || evidence[0];

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)] flex flex-col h-[520px] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#0f172a]" />
          <h4 className="font-primary text-xs font-bold text-[#020617]">
            Submitted Forensic Evidence ({evidence.length} Assets)
          </h4>
        </div>
        <span className="font-mono text-[10px] text-[#64748b]">
          High-Res Cloud Archive
        </span>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-black/95 relative flex items-center justify-center p-4 overflow-hidden">
        {activeAsset && (
          <img
            src={activeAsset.url}
            alt={activeAsset.title}
            className="max-h-full max-w-full object-contain rounded-[4px]"
          />
        )}

        <div className="absolute bottom-3 inset-x-3 bg-black/80 backdrop-blur-xs text-white p-2.5 rounded-[4px] text-xs font-secondary flex items-center justify-between gap-2">
          <div>
            <span className="font-primary font-bold text-xs block">
              {activeAsset?.title}
            </span>
            <span className="text-[11px] text-slate-300">
              {activeAsset?.notes}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-[2px] bg-slate-800 text-[#22c55e]">
            {activeAsset?.source} evidence
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="p-3 bg-white border-t border-[#e2e8f0] flex items-center gap-2 overflow-x-auto">
        {evidence.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveAssetId(item.id)}
            className={cn(
              "h-16 w-20 rounded-[4px] border overflow-hidden shrink-0 relative transition-all duration-200 ease-out",
              activeAssetId === item.id
                ? "border-[#0f172a] ring-2 ring-[#0f172a]"
                : "border-[#e2e8f0] opacity-75 hover:opacity-100"
            )}
          >
            <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-mono text-white text-center py-0.5 uppercase">
              {item.source}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EvidenceViewer;
