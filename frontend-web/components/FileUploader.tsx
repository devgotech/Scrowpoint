"use client";

import React, { useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Lock,
  RefreshCw,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToPresignedUrl, type UploadResult } from "@/lib/s3";
import { cn } from "@/lib/utils";

/**
 * FileUploader Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 2 Tier 2, Spec 5 §4):
 * - Desktop: Drag-and-drop dropzone with file picker fallback.
 * - Mobile (<768px): Dual buttons for "Take Photo / Camera Capture" (`capture="environment"`) and "Choose from Gallery".
 * - Corner Radius: --radius-card (8px -> rounded-[8px]) for dropzone & queue cards; --radius-control (4px -> rounded-[4px]) for buttons and controls.
 * - Loading States:
 *   - "Requesting secure upload authorization..." (presigned URL request from Go backend)
 *   - "Streaming directly to secure storage..." (PUT to S3)
 * - Error Handling: Surface friendly validation messages (size limit, file type) in --color-state-error (#f56565).
 * - Transitions: strict duration-200 ease-out transitions. Zero bouncy scaling animations.
 * - Typography: font-primary for headings, font-secondary for body, font-mono for file sizes and S3 keys.
 */

export interface UploadedFileState {
  file: File;
  previewUrl: string;
  result?: UploadResult;
  status: "idle" | "presigning" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

export interface FileUploaderProps {
  /** Identifier for upload context (e.g. Dispute ID, Listing SKU, KYC Job ID) */
  referenceId?: string;
  /** Accepted MIME types (e.g., "image/*,video/mp4") */
  accept?: string;
  /** Maximum file size allowed in MegaBytes. Default 50MB */
  maxSizeMB?: number;
  /** Allow multiple file selection. Default true */
  multiple?: boolean;
  /** Maximum number of files. Default 5 */
  maxFiles?: number;
  /** Heading prompt */
  title?: string;
  /** Subtitle instruction */
  description?: string;
  /** Callback fired when all files are successfully uploaded */
  onUploadComplete?: (results: UploadResult[]) => void;
  /** Callback fired on error */
  onError?: (err: Error) => void;
  className?: string;
}

export function FileUploader({
  referenceId = "upload-ref-default",
  accept = "image/*,video/mp4,video/quicktime",
  maxSizeMB = 50,
  multiple = true,
  maxFiles = 5,
  title = "Upload Media & Evidence",
  description = "Drag and drop high-resolution gadget photos, KYC documents, or unboxing video evidence.",
  onUploadComplete,
  onError,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFileState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // File input refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Process selected files and trigger direct presigned S3 upload
  const handleFilesSelected = async (newRawFiles: FileList | File[]) => {
    setGlobalError(null);
    const fileArray = Array.from(newRawFiles);

    if (files.length + fileArray.length > maxFiles) {
      setGlobalError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    const validatedNewFiles: UploadedFileState[] = [];

    for (const file of fileArray) {
      if (file.size > maxSizeBytes) {
        setGlobalError(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
        continue;
      }

      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "";

      validatedNewFiles.push({
        file,
        previewUrl,
        status: "idle",
      });
    }

    if (validatedNewFiles.length === 0) return;

    setFiles((prev) => [...prev, ...validatedNewFiles]);

    // Begin upload lifecycle for each newly added file
    const completedResults: UploadResult[] = [];

    for (const item of validatedNewFiles) {
      updateFileStatus(item.file.name, "presigning");

      try {
        // Step 1 & 2: Get presigned URL and stream to S3
        updateFileStatus(item.file.name, "uploading");
        const result = await uploadToPresignedUrl(item.file, referenceId);

        updateFileSuccess(item.file.name, result);
        completedResults.push(result);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to upload file.";
        updateFileError(item.file.name, errorMsg);
        onError?.(err instanceof Error ? err : new Error(errorMsg));
      }
    }

    if (completedResults.length > 0) {
      onUploadComplete?.(completedResults);
    }
  };

  const updateFileStatus = (
    fileName: string,
    status: UploadedFileState["status"]
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.file.name === fileName ? { ...f, status } : f))
    );
  };

  const updateFileSuccess = (fileName: string, result: UploadResult) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file.name === fileName
          ? { ...f, status: "success", result }
          : f
      )
    );
  };

  const updateFileError = (fileName: string, error: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file.name === fileName
          ? { ...f, status: "error", error }
          : f
      )
    );
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => {
        if (f.file.name === fileName && f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
        return f.file.name !== fileName;
      });
      return filtered;
    });
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Hidden Native File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Dedicated Mobile Camera Capture Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ====================================================================
          1. DESKTOP DRAG & DROP DROPZONE (md:flex)
          ==================================================================== */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => galleryInputRef.current?.click()}
        className={cn(
          "group relative flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all duration-200 ease-out cursor-pointer text-center select-none",
          isDragOver
            ? "border-[#111113] bg-[#111113]/5"
            : "border-[#111113]/20 bg-white hover:border-[#111113]/45 hover:bg-[#F8F7F4]"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center bg-[#F0EFEA] text-[#111113]/65 group-hover:text-[#111113] group-hover:bg-[#111113]/10 transition-colors duration-200 ease-out">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="mt-3 font-primary text-sm font-bold tracking-[-0.03em] text-[#111113]">
          {title}
        </h4>

        <p className="mt-1 max-w-sm font-secondary text-xs text-[#111113]/65 leading-relaxed">
          {description}
        </p>

        {/* Desktop Quick Triggers */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              galleryInputRef.current?.click();
            }}
            className="text-xs h-8 gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Select Files</span>
          </Button>
          <span className="text-[11px] font-mono text-[#111113]/60">
            Max {maxSizeMB}MB per file
          </span>
        </div>
      </div>

      {/* ====================================================================
          2. MOBILE CAMERA & GALLERY BUTTONS (md:hidden)
          ==================================================================== */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Button
          type="button"
          variant="default"
          size="default"
          onClick={() => cameraInputRef.current?.click()}
          className="h-11 gap-2 text-xs font-medium"
        >
          <Camera className="h-4 w-4" />
          <span>Take Photo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => galleryInputRef.current?.click()}
          className="h-11 gap-2 text-xs font-medium"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Photo Gallery</span>
        </Button>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="flex items-center gap-2 bg-[#f56565]/10 border border-[#f56565]/30 p-3 text-xs text-[#c53030]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#f56565]" />
          <span>{globalError}</span>
        </div>
      )}

      {/* ====================================================================
          3. UPLOADED FILE QUEUE & PRESIGNED STATUS LIST
          ==================================================================== */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-[#111113]/65">
            <span className="font-primary font-bold text-[#111113]">
              Uploaded Files ({files.length}/{maxFiles})
            </span>
            <span className="label">S3 Presigned Direct</span>
          </div>

          <div className="space-y-2">
            {files.map((item) => {
              const isVideo = item.file.type.startsWith("video/");
              const fileSizeMB = (item.file.size / (1024 * 1024)).toFixed(2);

              return (
                <div
                  key={item.file.name}
                  className="flex items-center justify-between gap-3 p-3 border border-[#111113]/12 bg-white"
                >
                  {/* File Thumbnail or Icon */}
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center bg-[#F0EFEA] overflow-hidden border border-[#111113]/12">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : isVideo ? (
                        <Film className="h-5 w-5 text-[#111113]/60" />
                      ) : (
                        <FileText className="h-5 w-5 text-[#111113]/60" />
                      )}
                    </div>

                    {/* Metadata & Status */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-primary text-xs font-medium text-[#111113] truncate">
                        {item.file.name}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#111113]/60">
                        <span>{fileSizeMB} MB</span>
                        <span>•</span>
                        {/* Dynamic Status Badges */}
                        {item.status === "presigning" && (
                          <span className="flex items-center gap-1 text-[#975a16]">
                            <Loader2 className="h-3 w-3 animate-spin text-[#ecc94b]" />
                            <span>Authorizing presigned URL...</span>
                          </span>
                        )}

                        {item.status === "uploading" && (
                          <span className="flex items-center gap-1 text-[#111113]">
                            <Loader2 className="h-3 w-3 animate-spin text-[#111113]" />
                            <span>Streaming to S3...</span>
                          </span>
                        )}

                        {item.status === "success" && (
                          <span className="flex items-center gap-1 text-[#15803d] font-semibold">
                            <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
                            <span>Uploaded</span>
                          </span>
                        )}

                        {item.status === "error" && (
                          <span className="flex items-center gap-1 text-[#c53030] font-semibold">
                            <AlertCircle className="h-3 w-3 text-[#f56565]" />
                            <span>{item.error || "Upload failed"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove File Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(item.file.name)}
                    aria-label={`Remove ${item.file.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center text-[#111113]/60 hover:text-[#c53030] hover:bg-[#f56565]/10 transition-colors duration-200 ease-out"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
