"use client";

import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * UserAvatar Component for Scrowpoint.
 *
 * Requirements (UI Context Spec 2, Tier 1):
 * - Wrapper around Shadcn Avatar primitive.
 * - Accepts a name string and calculates initials fallback if image is missing or fails to load.
 * - Handles single-name, multi-name, special characters, and empty names cleanly.
 * - Supports sizes (xs, sm, md, lg, xl) and custom classNames.
 * - Respects the 4-point scale and design system typography (font-heading).
 */

export type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The full name or display name of the user (e.g. "Chidi Okonkwo") */
  name?: string | null;
  /** Image source URL for the avatar photo */
  src?: string | null;
  /** Alt text for accessibility. Defaults to the user's name */
  alt?: string;
  /** Size preset for the avatar */
  size?: UserAvatarSize;
  /** Optional custom fallback initials to override automatic calculation */
  fallbackInitials?: string;
}

const SIZE_STYLES: Record<UserAvatarSize, { container: string; text: string }> = {
  xs: { container: "h-6 w-6 border", text: "text-[10px]" },
  sm: { container: "h-8 w-8 border", text: "text-xs" },
  md: { container: "h-9 w-9 border", text: "text-xs" },
  lg: { container: "h-12 w-12 border-2", text: "text-sm" },
  xl: { container: "h-16 w-16 border-2", text: "text-base font-bold" },
  "2xl": { container: "h-24 w-24 border-2", text: "text-2xl font-bold" },
};

export function UserAvatar({
  name,
  src,
  alt,
  size = "md",
  fallbackInitials,
  className,
  ...props
}: UserAvatarProps) {
  // Compute initials algorithmically from the user's name
  const initials = useMemo(() => {
    if (fallbackInitials) {
      return fallbackInitials.toUpperCase().slice(0, 2);
    }

    if (!name || typeof name !== "string") {
      return "SP";
    }

    // Clean whitespace and filter empty parts
    const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, "");
    if (!cleanName) {
      return "SP";
    }

    const segments = cleanName.split(/\s+/).filter(Boolean);

    if (segments.length >= 2) {
      // First letter of first name + first letter of last name (e.g., "Chidi Okonkwo" -> "CO")
      return (segments[0][0] + segments[segments.length - 1][0]).toUpperCase();
    }

    // Single name: Take first two characters (e.g., "Chidi" -> "CH")
    return segments[0].slice(0, 2).toUpperCase();
  }, [name, fallbackInitials]);

  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;
  const avatarAlt = alt || name || "User Avatar";

  return (
    <Avatar
      className={cn(sizeConfig.container, "border-[#111113]/15 bg-[#F0EFEA]", className)}
      {...props}
    >
      {src ? (
        <AvatarImage
          src={src}
          alt={avatarAlt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "font-primary font-bold text-[#111113] bg-[#F0EFEA] tracking-wide select-none",
          sizeConfig.text
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
