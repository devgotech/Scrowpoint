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
        "border border-ink-faint bg-surface flex flex-col h-[520px] overflow-hidden rounded-ui",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ink-faint bg-paper">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-ink" />
          <h4 className="font-primary text-xs font-bold text-ink tracking-[-0.02em]">
            Submitted Forensic Evidence ({assets.length} Assets)
          </h4>
        </div>
        <span className="label">
          High-Res Cloud Archive
        </span>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-ink relative flex items-center justify-center p-4 overflow-hidden">
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
          <div className="absolute bottom-3 inset-x-3 bg-ink/85 backdrop-blur-xs text-white p-2.5 text-xs font-secondary flex items-center justify-between gap-2">
            <div>
              <span className="font-primary font-bold text-xs block">
                {activeAsset.title}
              </span>
              <span className="text-meta text-white/75">
                {activeAsset.notes}
              </span>
            </div>
            <span className="font-mono text-caption uppercase font-bold px-2 py-0.5 bg-white/15 text-trust">
              {activeAsset.source} evidence
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {assets.length > 0 && (
        <div className="p-3 bg-surface border-t border-ink-faint flex items-center gap-2 overflow-x-auto">
          {assets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveAssetId(item.id)}
              className={cn(
                "h-16 w-20 border overflow-hidden shrink-0 relative transition-all duration-200 ease-out cursor-pointer",
                activeAssetId === item.id
                  ? "border-ink ring-2 ring-ink"
                  : "border-ink/15 opacity-75 hover:opacity-100"
              )}
            >
              {item.type === "video" ? (
                <div className="h-full w-full flex items-center justify-center bg-ink text-white">
                  <Film className="h-5 w-5" />
                </div>
              ) : (
                <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
              )}
              <span className="absolute bottom-0 inset-x-0 bg-ink/75 text-[8px] font-mono text-white text-center py-0.5 uppercase">
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
