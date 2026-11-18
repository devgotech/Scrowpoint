"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, FileText, Film, Loader2, Trash2, Upload, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToPresignedUrl, type UploadResult } from "@/lib/s3";
import { cn } from "@/lib/utils";

/**
 * FileUploader Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 2 Tier 2, Spec 5 §4):
 * - Desktop: Drag-and-drop dropzone with file picker fallback.
 * - Mobile (<768px): Record a video or select an existing clip.
 * - Corner Radius: --radius-card (8px -> rounded-ui) for dropzone & queue cards; --radius-control (4px -> rounded-ui) for buttons and controls.
 * - Loading States:
 *   - "Requesting secure upload authorization..." (presigned URL request from Go backend)
 *   - Direct-to-storage video upload with transfer progress.
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
  /** Maximum direct-to-storage video size, in MB. */
  maxVideoSizeMB?: number;
  /** Maximum video duration, in seconds. */
  maxVideoDurationSeconds?: number;
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
  /** Callback fired when transfer begins or all selected uploads finish. */
  onUploadStateChange?: (uploading: boolean) => void;
  /** Callback fired on error */
  onError?: (err: Error) => void;
  className?: string;
}

function readVideoDuration(file: File): Promise<number> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = objectUrl;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
      } else {
        reject(new Error("Video duration metadata is unavailable."));
      }
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Video metadata could not be read."));
    };
  });
}

export function FileUploader({
  referenceId = "upload-ref-default",
  accept = "video/mp4,video/quicktime,video/webm",
  maxVideoSizeMB = 100,
  maxVideoDurationSeconds = 60,
  multiple = true,
  maxFiles = 5,
  title = "Upload Device Video Evidence",
  description = "Upload a short device walkthrough. Show the device condition and important details clearly.",
  onUploadComplete,
  onUploadStateChange,
  onError,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFileState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // File input refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const maxVideoSizeBytes = maxVideoSizeMB * 1024 * 1024;

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
      const isVideo = file.type.startsWith("video/");
      if (!isVideo || file.size > maxVideoSizeBytes) {
        setGlobalError(
          !isVideo
            ? `File "${file.name}" is not a supported video. Upload images through the image uploader.`
            : `File "${file.name}" exceeds the ${maxVideoSizeMB}MB video limit.`
        );
        continue;
      }

      if (isVideo) {
        try {
          const duration = await readVideoDuration(file);
          if (duration > maxVideoDurationSeconds) {
            setGlobalError(
              `"${file.name}" is ${Math.ceil(duration)} seconds long. Videos must be ${maxVideoDurationSeconds} seconds or shorter.`
            );
            continue;
          }
        } catch {
          setGlobalError(`Could not read the duration of "${file.name}". Try an MP4 or MOV video.`);
          continue;
        }
      }

      validatedNewFiles.push({
        file,
        previewUrl: "",
        status: "idle",
      });
    }

    if (validatedNewFiles.length === 0) return;

    setFiles((prev) => [...prev, ...validatedNewFiles]);

    // Begin upload lifecycle for each newly added file
    const completedResults: UploadResult[] = [];
    onUploadStateChange?.(true);
    try {
      for (const item of validatedNewFiles) {
        updateFileStatus(item.file.name, "presigning");

        try {
          updateFileStatus(item.file.name, "uploading");
          const result = await uploadToPresignedUrl(item.file, referenceId, {
            onProgress: (progress) => updateFileProgress(item.file.name, progress),
          });

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
    } finally {
      onUploadStateChange?.(false);
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

  const updateFileProgress = (fileName: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.file.name === fileName ? { ...f, progress } : f))
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
        accept="video/*"
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
            ? "border-ink bg-ink/5"
            : "border-ink/20 bg-surface hover:border-ink/45 hover:bg-paper"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center bg-surface-muted text-ink/65 group-hover:text-ink group-hover:bg-ink/10 transition-colors duration-200 ease-out">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="mt-3 font-primary text-sm font-bold tracking-[-0.03em] text-ink">
          {title}
        </h4>

        <p className="mt-1 max-w-sm font-secondary text-xs text-ink/65 leading-relaxed">
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
          <span className="text-meta font-mono text-ink/60">
            Videos up to {maxVideoSizeMB}MB / {maxVideoDurationSeconds}s
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
          <span>Record Video</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => galleryInputRef.current?.click()}
          className="h-11 gap-2 text-xs font-medium"
        >
          <Film className="h-4 w-4" />
          <span>Choose Video</span>
        </Button>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="flex items-center gap-2 bg-state-error/10 border border-state-error/30 p-3 text-xs text-state-error-strong">
          <AlertCircle className="h-4 w-4 shrink-0 text-state-error" />
          <span>{globalError}</span>
        </div>
      )}

      {/* ====================================================================
          3. UPLOADED FILE QUEUE & PRESIGNED STATUS LIST
          ==================================================================== */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-ink/65">
            <span className="font-primary font-bold text-ink">
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
                  className="flex items-center justify-between gap-3 p-3 border border-ink-faint bg-surface rounded-card"
                >
                  {/* File Thumbnail or Icon */}
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center bg-surface-muted overflow-hidden border border-ink-faint rounded-ui">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : isVideo ? (
                        <Film className="h-5 w-5 text-ink/60" />
                      ) : (
                        <FileText className="h-5 w-5 text-ink/60" />
                      )}
                    </div>

                    {/* Metadata & Status */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="font-primary text-xs font-medium text-ink truncate">
                        {item.file.name}
                      </p>

                      <div className="flex items-center gap-2 text-meta font-mono text-ink/60">
                        <span>{fileSizeMB} MB</span>
                        <span>•</span>
                        {/* Dynamic Status Badges */}
                        {item.status === "presigning" && (
                          <span className="flex items-center gap-1 text-state-warning-strong">
                            <Loader2 className="h-3 w-3 animate-spin text-state-warning" />
                            <span>Authorizing presigned URL...</span>
                          </span>
                        )}

                        {item.status === "uploading" && (
                          <span className="flex items-center gap-1 text-ink">
                            <Loader2 className="h-3 w-3 animate-spin text-ink" />
                            <span>Uploading {item.progress ?? 0}%...</span>
                          </span>
                        )}

                        {item.status === "success" && (
                          <span className="flex items-center gap-1 text-trust-strong font-semibold">
                            <CheckCircle2 className="h-3 w-3 text-trust" />
                            <span>Uploaded</span>
                          </span>
                        )}

                        {item.status === "error" && (
                          <span className="flex items-center gap-1 text-state-error-strong font-semibold">
                            <AlertCircle className="h-3 w-3 text-state-error" />
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center text-ink/60 hover:text-state-error-strong hover:bg-state-error/10 transition-colors duration-200 ease-out"
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
