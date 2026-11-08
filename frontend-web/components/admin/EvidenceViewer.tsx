"use client";

import React, { useState } from "react";
import { Camera, Film } from "lucide-react";
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
  type: "diagnostic" | "photo" | "waybill" | "video";
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
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function EvidenceViewer({
  evidence,
  isLoading = false,
  error,
  className,
}: EvidenceViewerProps) {
  const assets = evidence ?? SAMPLE_EVIDENCE;
  const [activeAssetId, setActiveAssetId] = useState<string>(assets[0]?.id || "");
  const activeAsset = assets.find((e) => e.id === activeAssetId) || assets[0];

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white flex flex-col h-[520px] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#111113]/12 bg-[#F8F7F4]">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#111113]" />
          <h4 className="font-primary text-xs font-bold text-[#111113] tracking-[-0.02em]">
            Submitted Forensic Evidence ({assets.length} Assets)
          </h4>
        </div>
        <span className="label">
          High-Res Cloud Archive
        </span>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-[#111113] relative flex items-center justify-center p-4 overflow-hidden">
        {isLoading ? (
          <p role="status" className="text-sm text-white/75">Loading private evidence...</p>
        ) : error ? (
          <p role="alert" className="max-w-sm text-center text-sm text-white/80">{error}</p>
        ) : !activeAsset ? (
          <p className="text-sm text-white/75">No evidence has been submitted for this dispute.</p>
        ) : activeAsset.type === "video" ? (
          <video
            key={activeAsset.id}
            src={activeAsset.url}
            controls
            playsInline
            preload="metadata"
            className="max-h-full max-w-full"
          />
        ) : (
          <img
            src={activeAsset.url}
            alt={activeAsset.title}
            className="max-h-full max-w-full object-contain"
          />
        )}

        {activeAsset && !isLoading && !error && (
          <div className="absolute bottom-3 inset-x-3 bg-[#111113]/85 backdrop-blur-xs text-white p-2.5 text-xs font-secondary flex items-center justify-between gap-2">
            <div>
              <span className="font-primary font-bold text-xs block">
                {activeAsset.title}
              </span>
              <span className="text-[11px] text-white/75">
                {activeAsset.notes}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-white/15 text-[#22c55e]">
              {activeAsset.source} evidence
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {assets.length > 0 && (
        <div className="p-3 bg-white border-t border-[#111113]/12 flex items-center gap-2 overflow-x-auto">
          {assets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveAssetId(item.id)}
              className={cn(
                "h-16 w-20 border overflow-hidden shrink-0 relative transition-all duration-200 ease-out cursor-pointer",
                activeAssetId === item.id
                  ? "border-[#111113] ring-2 ring-[#111113]"
                  : "border-[#111113]/15 opacity-75 hover:opacity-100"
              )}
            >
              {item.type === "video" ? (
                <div className="h-full w-full flex items-center justify-center bg-[#111113] text-white">
                  <Film className="h-5 w-5" />
                </div>
              ) : (
                <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
              )}
              <span className="absolute bottom-0 inset-x-0 bg-[#111113]/75 text-[8px] font-mono text-white text-center py-0.5 uppercase">
                {item.source}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EvidenceViewer;
