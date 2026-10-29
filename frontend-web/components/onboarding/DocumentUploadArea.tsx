"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileText,
  IdCard,
  Lock,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * DocumentUploadArea Component (Phase 2 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Government ID upload (NIN Slip, International Passport, Driver's License, Voter's Card).
 * - Document number validation.
 * - Front and Back image upload dropzones.
 * - Token Compliance: 8px container radius, 4px controls, 200ms ease-out transitions.
 */

export type DocumentType = "nin" | "passport" | "drivers_license" | "voters_card";

export interface DocumentUploadAreaProps {
  onComplete?: (data: { docType: DocumentType; docNumber: string; frontFile: string | null }) => void;
  className?: string;
}

export function DocumentUploadArea({ onComplete, className }: DocumentUploadAreaProps) {
  const [docType, setDocType] = useState<DocumentType>("nin");
  const [docNumber, setDocNumber] = useState("");
  const [frontFile, setFrontFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const docOptions: { id: DocumentType; label: string; placeholder: string }[] = [
    { id: "nin", label: "National ID (NIN)", placeholder: "Enter 11-digit National Identity Number" },
    { id: "passport", label: "International Passport", placeholder: "Enter Passport Number (e.g. A12345678)" },
    { id: "drivers_license", label: "Driver's License", placeholder: "Enter FRSC License Number" },
    { id: "voters_card", label: "Voter's Card (INEC)", placeholder: "Enter Voter Identification Number (VIN)" },
  ];

  const currentOption = docOptions.find((d) => d.id === docType) || docOptions[0];

  const handleSimulateUpload = () => {
    // Simulated upload of verified slip
    setFrontFile("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80");
    onComplete?.({
      docType,
      docNumber,
      frontFile: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    });
  };

  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white p-6 space-y-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-[#111113] text-white">
            <IdCard className="h-3.5 w-3.5" />
          </div>
          <span className="font-primary text-xs font-bold text-[#111113] tracking-[-0.02em]">
            Government Identity Verification
          </span>
        </div>
        <Badge variant="trust" className="text-[10px] font-mono">
          NIMC / SmileID
        </Badge>
      </div>

      {/* 1. Document Type Selector */}
      <div className="space-y-2">
        <label className="label block">
          Select Identity Document
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {docOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setDocType(opt.id);
                setDocNumber("");
              }}
              className={cn(
                "p-2.5 border text-center text-xs font-medium transition-all duration-200 ease-out cursor-pointer",
                docType === opt.id
                  ? "bg-[#111113] text-white border-[#111113]"
                  : "bg-white border-[#111113]/15 text-[#111113] hover:bg-[#F8F7F4]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Document Number Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="doc-num-input"
          className="label block"
        >
          {docType === "nin" ? "11-Digit NIN Number" : "Document Reference Number"}
        </label>
        <div className="relative">
          <input
            id="doc-num-input"
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder={currentOption.placeholder}
            maxLength={docType === "nin" ? 11 : 20}
            className="w-full h-11 pl-3 pr-4 border border-[#111113]/15 bg-white font-mono text-xs font-bold text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
          />
        </div>
        <p className="font-secondary text-[11px] text-[#111113]/60">
          Verified against national databases in real-time.
        </p>
      </div>

      {/* 3. Document Front Dropzone */}
      <div className="space-y-1.5">
        <label className="label block">
          Upload Clear Photo of {currentOption.label}
        </label>

        {frontFile ? (
          <div className="relative border border-[#22c55e]/40 bg-[#22c55e]/10 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#22c55e] text-white">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-primary text-xs font-bold text-[#15803d] block">
                  Document Captured & Scanned
                </span>
                <span className="font-mono text-[10px] text-[#111113]/65">
                  {docType.toUpperCase()}_SCAN_VERIFIED.JPEG (1.4 MB)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFrontFile(null)}
              className="p-1 hover:bg-black/10 text-[#111113]/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleSimulateUpload}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleSimulateUpload();
            }}
            className={cn(
              "border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ease-out",
              isDragging
                ? "border-[#111113] bg-[#F8F7F4]"
                : "border-[#111113]/25 hover:border-[#111113] hover:bg-[#F8F7F4]"
            )}
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center bg-[#F0EFEA] text-[#111113] mb-2">
              <UploadCloud className="h-5 w-5" />
            </div>
            <span className="font-primary text-xs font-bold text-[#111113] block">
              Click to select or drop {currentOption.label} photo
            </span>
            <span className="font-secondary text-[11px] text-[#111113]/60 block mt-1">
              Supports JPEG, PNG or PDF up to 10MB. Must not be blurry or cut off.
            </span>
          </div>
        )}
      </div>

      {/* Anti-Glare Advice */}
      <div className="border border-[#ecc94b]/40 bg-[#ecc94b]/15 p-3 flex items-start gap-2.5 text-xs text-[#975a16]">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Avoid Rejection:</strong> Place your card on a flat surface in good lighting. Flash glare or cropped corners will cause the automated OCR validator to fail.
        </span>
      </div>
    </div>
  );
}

export default DocumentUploadArea;
