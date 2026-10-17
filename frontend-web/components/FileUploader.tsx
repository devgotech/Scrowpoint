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
 * FileUploader Component for Buyer's High.
 *
 * Requirements (UI Context Spec 2 Tier 2, Spec 5 §4 Direct S3 Upload):
 * - Desktop: Drag-and-drop dropzone with file picker fallback.
 * - Mobile (<768px): Dual buttons for "Take Photo / Camera Capture" (`capture="environment"`) and "Choose from Gallery".
 * - Loading States:
 *   - "Requesting secure upload authorization..." (presigned URL request from Go backend)
 *   - "Streaming directly to secure storage..." (PUT to S3)
 * - Supported Use Cases:
 *   - Gadget Listing photos
 *   - KYC Identity documents & selfies
 *   - Dispute unboxing video & photo evidence
 * - Error Handling: Surface friendly validation messages (size limit, file type).
 * - Typography: font-mono for file sizes and S3 keys.
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
          "group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center select-none",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.005]"
            : "border-border bg-card hover:border-border/80 hover:bg-muted/20"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80 transition-colors shadow-xs">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="mt-3 font-heading text-sm font-semibold text-foreground">
          {title}
        </h4>

        <p className="mt-1 max-w-sm font-body text-xs text-muted-foreground leading-relaxed">
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
            className="text-xs h-8 gap-1.5 border-border"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Select Files</span>
          </Button>
          <span className="text-[11px] font-mono text-muted-foreground">
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
          className="h-11 gap-2 text-xs font-semibold shadow-xs"
        >
          <Camera className="h-4 w-4" />
          <span>Take Photo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => galleryInputRef.current?.click()}
          className="h-11 gap-2 text-xs font-semibold border-border"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Photo Gallery</span>
        </Button>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* ====================================================================
          3. UPLOADED FILE QUEUE & PRESIGNED STATUS LIST
          ==================================================================== */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-heading font-semibold text-foreground">
              Uploaded Files ({files.length}/{maxFiles})
            </span>
            <span className="font-mono text-[11px]">S3 Presigned Direct</span>
          </div>

          <div className="space-y-2">
            {files.map((item) => {
              const isVideo = item.file.type.startsWith("video/");
              const fileSizeMB = (item.file.size / (1024 * 1024)).toFixed(2);

              return (
                <div
                  key={item.file.name}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-xs"
                >
                  {/* File Thumbnail or Icon */}
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden border border-border">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : isVideo ? (
                        <Film className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Metadata & Status */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-heading text-xs font-semibold text-foreground truncate">
                        {item.file.name}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                        <span>{fileSizeMB} MB</span>
                        <span>•</span>
                        {/* Dynamic Status Badges */}
                        {item.status === "presigning" && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Authorizing presigned URL...</span>
                          </span>
                        )}

                        {item.status === "uploading" && (
                          <span className="flex items-center gap-1 text-primary">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Streaming to S3...</span>
                          </span>
                        )}

                        {item.status === "success" && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Uploaded</span>
                          </span>
                        )}

                        {item.status === "error" && (
                          <span className="flex items-center gap-1 text-destructive font-semibold">
                            <AlertCircle className="h-3 w-3" />
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
