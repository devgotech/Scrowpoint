"use client";

import React, { useRef, useState } from "react";
import { Camera, Check, RefreshCw, Trash2, Upload, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Curated preset avatar headshots for gadget traders & merchants.
 * High-quality, professional portraits suitable for verified electronics sellers.
 */
export const PRESET_AVATARS = [
  {
    id: "preset-1",
    label: "Professional Merchant (Adeola)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-2",
    label: "Tech Specialist (Chidi)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-3",
    label: "Certified Hardware Trader",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-4",
    label: "Gadget Store Lead",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-5",
    label: "Electronics Auditor",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-6",
    label: "Device Operations Lead",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
  },
];

export interface AvatarChangeCardProps {
  className?: string;
  onAvatarUpdated?: (newUrl: string | null) => void;
}

export function AvatarChangeCard({
  className,
  onAvatarUpdated,
}: AvatarChangeCardProps) {
  const { user, setUser, isKYCVerified } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentAvatarUrl = user?.avatarUrl || null;
  const displayName = user?.name || "Merchant";

  const triggerSuccessFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  const updateAvatar = (newUrl: string | null, message: string) => {
    if (user) {
      setUser({
        ...user,
        avatarUrl: newUrl || undefined,
      });
    }
    onAvatarUpdated?.(newUrl);
    triggerSuccessFeedback(message);
  };

  // Handle native file selection (from camera or gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5MB limit. Please choose a smaller photo.");
      return;
    }

    // Validate image MIME type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Invalid format. Please select an image (JPG, PNG, WEBP).");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setIsUploading(false);
      updateAvatar(dataUrl, "Avatar updated successfully from your device.");
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrorMessage("Could not read image file. Please try another.");
    };

    reader.readAsDataURL(file);

    // Reset input value so re-uploading the same file still triggers onChange
    e.target.value = "";
  };

  const handleSelectPreset = (presetUrl: string) => {
    updateAvatar(presetUrl, "Preset trader avatar selected and saved.");
  };

  const handleRemovePhoto = () => {
    updateAvatar(null, "Avatar photo removed. Reverted to cryptographic initials.");
  };

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#e2e8f0] bg-white p-5 sm:p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] space-y-6 transition-all duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e2e8f0]">
        <div>
          <h3 className="font-primary text-base font-bold text-[#020617] flex items-center gap-2">
            <User className="h-4 w-4 text-[#0f172a]" />
            <span>Profile Photo & Avatar</span>
          </h3>
          <p className="font-secondary text-xs text-[#64748b] mt-0.5">
            Your avatar represents your verified store on gadget listings, escrow rooms, and buyer chats.
          </p>
        </div>

        {isKYCVerified && (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#15803d] text-xs font-mono font-medium">
            <Check className="h-3 w-3 text-[#22c55e]" />
            <span>Verified Merchant Photo</span>
          </span>
        )}
      </div>

      {/* Main Avatar Controls: Responsive Layout */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Display with Camera Button Overlay */}
        <div className="relative group shrink-0">
          <div
            className={cn(
              "relative rounded-full p-1 transition-all duration-200",
              isKYCVerified
                ? "ring-2 ring-[#22c55e] ring-offset-2 ring-offset-white"
                : "ring-2 ring-[#e2e8f0]"
            )}
          >
            <UserAvatar
              name={displayName}
              src={currentAvatarUrl}
              size="xl"
              className="h-24 w-24 sm:h-28 sm:w-28 text-xl font-bold rounded-full shadow-xs object-cover"
            />

            {/* Quick Upload Action Button floating on bottom-right of avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload new avatar photo"
              title="Upload new avatar"
              disabled={isUploading}
              className="absolute bottom-1 right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#0f172a] text-white shadow-md hover:bg-slate-800 transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2 cursor-pointer"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="avatar-file-upload-input"
          />
        </div>

        {/* Text & Primary Actions */}
        <div className="flex-1 text-center sm:text-left space-y-3 w-full">
          <div>
            <h4 className="font-primary text-sm font-bold text-[#020617]">
              {displayName}
            </h4>
            <p className="font-secondary text-xs text-[#64748b] leading-relaxed mt-0.5">
              PNG, JPG, or WEBP. Max file size: 5MB. Recommended dimension: 400×400px.
            </p>
          </div>

          {/* Action Buttons: Responsive Grid / Wrap */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2 text-xs font-semibold h-9 px-4 rounded-[4px] shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? "Reading Image..." : "Upload New Photo"}</span>
            </Button>

            {currentAvatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                className="gap-1.5 text-xs text-[#c53030] hover:text-[#9b2c2c] hover:bg-[#f56565]/10 border-[#e2e8f0] h-9 px-3.5 rounded-[4px]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Photo</span>
              </Button>
            )}
          </div>

          {/* Inline Feedback Messages */}
          {successMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#15803d] text-xs font-secondary animate-in fade-in duration-200">
              <Check className="h-4 w-4 shrink-0 text-[#22c55e]" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-[4px] bg-[#f56565]/10 border border-[#f56565]/20 text-[#c53030] text-xs font-secondary animate-in fade-in duration-200">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preset Headshots Library */}
      <div className="pt-4 border-t border-[#e2e8f0] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-[#64748b] font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#0f172a]" />
            <span>Or Choose A Verified Merchant Preset</span>
          </span>
          <span className="text-[11px] text-[#64748b] font-secondary hidden sm:inline">
            Tap to preview immediately
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = currentAvatarUrl === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                title={preset.label}
                aria-label={`Select ${preset.label}`}
                className={cn(
                  "group relative aspect-square rounded-[8px] overflow-hidden border-2 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-1 p-0.5 bg-[#f8fafc]",
                  isSelected
                    ? "border-[#0f172a] shadow-xs"
                    : "border-[#e2e8f0] hover:border-[#94a3b8]"
                )}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="h-full w-full object-cover rounded-[6px] group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />

                {isSelected && (
                  <div className="absolute inset-0 bg-[#0f172a]/40 rounded-[6px] flex items-center justify-center text-white">
                    <Check className="h-5 w-5 drop-shadow-md stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AvatarChangeCard;
