"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { disputesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * EvidenceUploadForm Component (Phase 3 §3)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Sub-modal / Action drawer inside the Escrow Room.
 * - Sub-case types: Not As Described (NAD), Dead on Arrival (DOA), Transit Damage, Counterfeit.
 * - Private direct-to-storage upload for device inspection video evidence.
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
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [pendingDisputeId, setPendingDisputeId] = useState<string | null>(null);
  const [linkedEvidenceKeys, setLinkedEvidenceKeys] = useState<string[]>([]);
  const [isEvidenceUploading, setIsEvidenceUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: "not_as_described", label: "Not As Described", desc: "Significant cosmetic scratches or altered storage" },
    { id: "dead_on_arrival", label: "Dead On Arrival (DOA)", desc: "Will not power on or reboot looping" },
    { id: "hardware_defect", label: "Hardware Defect", desc: "FaceID failure, battery service, broken speakers" },
    { id: "transit_damage", label: "Courier Transit Damage", desc: "Cracked box or broken screen upon unboxing" },
    { id: "counterfeit", label: "Counterfeit / Locked", desc: "iCloud locked, blacklisted IMEI or fake clone" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isEvidenceUploading) return;
    if (evidenceFiles.length === 0) {
      setSubmitError("Upload at least one video before submitting the dispute.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let disputeId = pendingDisputeId;
      if (!disputeId) {
        const created = await disputesApi.create({
          orderId,
          issueType: category,
          notes: description.trim(),
        });
        if (!created.ok || !created.data?.id) {
          throw new Error(created.error || "Could not open the dispute. Please try again.");
        }
        disputeId = created.data.id;
        setPendingDisputeId(disputeId);
      }

      const linkedKeys = new Set(linkedEvidenceKeys);
      for (const mediaUrl of evidenceFiles) {
        if (linkedKeys.has(mediaUrl)) continue;
        const added = await disputesApi.addEvidence(disputeId, {
          mediaUrl,
          evidenceType: "video",
          description: `${category}: ${description.trim()}`,
        });
        if (!added.ok) {
          throw new Error(added.error || "Could not attach the uploaded video to the dispute.");
        }
        linkedKeys.add(mediaUrl);
        setLinkedEvidenceKeys(Array.from(linkedKeys));
      }

      const finalized = await disputesApi.finalizeEvidence(disputeId);
      if (!finalized.ok) {
        throw new Error(finalized.error || "Could not finalize the dispute evidence.");
      }

      onSubmitDispute({
        category,
        description,
        evidenceCount: evidenceFiles.length,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not submit the dispute. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg border border-ink/15 bg-surface p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 rounded-card">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ink-faint">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-state-warning/20 border border-state-warning/40 text-state-warning-strong">
              <ShieldAlert className="h-5 w-5 text-state-warning" />
            </div>
            <div>
              <span className="font-mono text-caption font-bold uppercase tracking-wider text-state-warning-strong">
                48-Hour Inspection Safeguard
              </span>
              <h2 className="font-primary text-lg font-bold tracking-[-0.03em] text-ink">
                Open Dispute & Freeze Escrow
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink/60 hover:bg-surface-muted hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Legal Freeze Warning Banner */}
        <div className="border border-state-error/40 bg-state-error/10 p-3.5 flex items-start gap-2.5 text-xs text-state-error-strong">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-state-error" />
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
                      ? "border-ink bg-paper ring-1 ring-ink"
                      : "border-ink-faint bg-surface hover:bg-paper"
                  )}
                >
                  <input
                    type="radio"
                    name="dispute-category"
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id)}
                    className="mt-0.5 text-ink focus:ring-ink"
                  />
                  <div>
                    <span className="font-primary text-xs font-bold text-ink block">
                      {cat.label}
                    </span>
                    <span className="font-secondary text-meta text-ink/65 block mt-0.5">
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
              className="w-full p-3 border border-ink/15 bg-surface text-xs font-secondary text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink rounded-card"
            />
          </div>

          {/* Private Video Evidence */}
          <div className="space-y-2">
            <label className="label block">
              Device Inspection Video
            </label>
            <p className="font-secondary text-xs text-ink/65">
              Up to 60 seconds and 100 MB. Record at 1080p/30fps when possible; the original is kept in private storage.
            </p>
            <FileUploader
              referenceId={orderId}
              accept="video/mp4,video/quicktime,video/webm"
              maxFiles={2}
              multiple
              onUploadStateChange={setIsEvidenceUploading}
              onUploadComplete={(results) =>
                setEvidenceFiles((existing) => [
                  ...existing,
                  ...results.map((result) => result.s3Key),
                ])
              }
              onError={(error) => setSubmitError(error.message)}
            />
          </div>

          {submitError && (
            <p role="alert" className="text-xs text-state-error-strong">
              {submitError}
            </p>
          )}

          {/* Action CTAs */}
          <div className="pt-4 border-t border-ink-faint flex items-center justify-end gap-3">
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
              disabled={isSubmitting || isEvidenceUploading || !description.trim() || evidenceFiles.length === 0}
              className="h-10 px-5 text-xs font-semibold gap-2 bg-state-error hover:bg-state-error-hover text-white"
            >
              <Scale className="h-4 w-4" />
              <span>{isSubmitting ? "Submitting Evidence..." : "Confirm & Freeze Escrow"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EvidenceUploadForm;
