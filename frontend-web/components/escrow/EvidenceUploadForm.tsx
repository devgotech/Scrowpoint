"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Lock,
  Scale,
  ShieldAlert,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { disputesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * EvidenceUploadForm Component (Phase 3 §3)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Sub-modal / Action drawer inside the Escrow Room.
 * - Sub-case types: Not As Described (NAD), Dead on Arrival (DOA), Transit Damage, Counterfeit.
 * - Media evidence uploader (photos, diagnostic screenshots).
 * - Triggers state change in Postgres (DISPUTED), locks funds, pushes to Admin Dispute Queue.
 * - Token Compliance: 8px modal radius, 4px controls, Warning Amber (#ecc94b) and Destructive (#f56565).
 */

export interface EvidenceUploadFormProps {
  orderId: string;
  orderAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispute: (data: {
    category: string;
    description: string;
    evidenceCount: number;
  }) => void;
}

export function EvidenceUploadForm({
  orderId,
  orderAmount,
  isOpen,
  onClose,
  onSubmitDispute,
}: EvidenceUploadFormProps) {
  const [category, setCategory] = useState("not_as_described");
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&auto=format&fit=crop&q=80",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: "not_as_described", label: "Not As Described", desc: "Significant cosmetic scratches or altered storage" },
    { id: "dead_on_arrival", label: "Dead On Arrival (DOA)", desc: "Will not power on or reboot looping" },
    { id: "hardware_defect", label: "Hardware Defect", desc: "FaceID failure, battery service, broken speakers" },
    { id: "transit_damage", label: "Courier Transit Damage", desc: "Cracked box or broken screen upon unboxing" },
    { id: "counterfeit", label: "Counterfeit / Locked", desc: "iCloud locked, blacklisted IMEI or fake clone" },
  ];

  const handleAddSampleEvidence = () => {
    setEvidenceFiles((prev) => [
      ...prev,
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80",
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    await disputesApi.create({
      order_id: orderId,
      reason: category,
      description: description.trim(),
      evidence_urls: evidenceFiles,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitDispute({
        category,
        description,
        evidenceCount: evidenceFiles.length,
      });
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111113]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg border border-[#111113]/15 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#111113]/12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#ecc94b]/20 border border-[#ecc94b]/40 text-[#975a16]">
              <ShieldAlert className="h-5 w-5 text-[#ecc94b]" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#975a16]">
                48-Hour Inspection Safeguard
              </span>
              <h2 className="font-primary text-lg font-bold tracking-[-0.03em] text-[#111113]">
                Open Dispute & Freeze Escrow
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#111113]/60 hover:bg-[#F0EFEA] hover:text-[#111113]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Legal Freeze Warning Banner */}
        <div className="border border-[#f56565]/40 bg-[#f56565]/10 p-3.5 flex items-start gap-2.5 text-xs text-[#c53030]">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#f56565]" />
          <div>
            <strong className="block mb-0.5">Automated Escrow Lock:</strong>
            Submitting this report immediately hard-freezes ₦{orderAmount.toLocaleString()} in Paystack custody and transitions this trade to formal arbitration.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dispute Category Radio Group */}
          <div className="space-y-2">
            <label className="label block">
              Issue Classification
            </label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={cn(
                    "flex items-start gap-3 p-3 border cursor-pointer transition-all duration-200 ease-out",
                    category === cat.id
                      ? "border-[#111113] bg-[#F8F7F4] ring-1 ring-[#111113]"
                      : "border-[#111113]/12 bg-white hover:bg-[#F8F7F4]"
                  )}
                >
                  <input
                    type="radio"
                    name="dispute-category"
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id)}
                    className="mt-0.5 text-[#111113] focus:ring-[#111113]"
                  />
                  <div>
                    <span className="font-primary text-xs font-bold text-[#111113] block">
                      {cat.label}
                    </span>
                    <span className="font-secondary text-[11px] text-[#111113]/65 block mt-0.5">
                      {cat.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label
              htmlFor="dispute-desc"
              className="label block"
            >
              Detailed Defect Description
            </label>
            <textarea
              id="dispute-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain exactly what is wrong (e.g. Battery health is 78% instead of 97% stated, screen digitizer has dead touch line)..."
              className="w-full p-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
            />
          </div>

          {/* Evidence Photo Strip */}
          <div className="space-y-2">
            <label className="label block">
              Diagnostic & Photographic Evidence
            </label>

            <div className="grid grid-cols-4 gap-2">
              {evidenceFiles.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden border border-[#111113]/12"
                >
                  <img src={url} alt="Dispute evidence" className="h-full w-full object-cover" />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSampleEvidence}
                className="aspect-square border border-dashed border-[#111113]/25 hover:border-[#111113] flex flex-col items-center justify-center text-[#111113]/65 hover:text-[#111113] text-[10px] font-mono gap-1"
              >
                <Upload className="h-4 w-4" />
                <span>Add Proof</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#111113]/12 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-10 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting || !description.trim()}
              className="h-10 px-5 text-xs font-semibold gap-2 bg-[#f56565] hover:bg-[#e53e3e] text-white"
            >
              <Scale className="h-4 w-4" />
              <span>{isSubmitting ? "Locking Escrow..." : "Confirm & Freeze Escrow"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EvidenceUploadForm;
