"use client";

import React, { useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * SearchBar Component for Scrowpoint.
 *
 * Requirements (UI Context Spec 2, Tier 2 & Spec 4, §4):
 * - Text search input with icon, clear action, and enter submission.
 * - Horizontally scrolling row of filter chips on mobile, wrapping flex container on desktop.
 * - Filter chips (e.g., "All", "iPhone", "Samsung", "MacBook", "Mint Condition", "Verified Seller").
 * - Single/Multi-selection support with distinct active state styling.
 * - Strict 4-point spacing scale (gap-2, p-4, h-10, etc.) and semantic color tokens.
 */

export interface FilterChipOption {
  id: string;
  label: string;
  category?: "brand" | "condition" | "status" | "general";
  count?: number;
}

export const DEFAULT_FILTER_CHIPS: FilterChipOption[] = [
  { id: "all", label: "All Gadgets", category: "general" },
  { id: "iphone", label: "iPhone", category: "brand" },
  { id: "samsung", label: "Samsung Galaxy", category: "brand" },
  { id: "macbook", label: "MacBook", category: "brand" },
  { id: "pixel", label: "Google Pixel", category: "brand" },
  { id: "gaming", label: "PS5 & Consoles", category: "general" },
  { id: "mint", label: "Mint Condition", category: "condition" },
  { id: "verified", label: "Verified Sellers", category: "status" },
  { id: "under200k", label: "Under ₦200,000", category: "general" },
];

export interface SearchBarProps {
  /** Initial or controlled query string */
  query?: string;
  /** Callback fired on query change or submit */
  onQueryChange?: (newQuery: string) => void;
  /** Active selected chip ID or IDs */
  selectedChipId?: string;
  /** Callback fired when a chip is toggled */
  onChipSelect?: (chipId: string) => void;
  /** Optional custom chip list to override defaults */
  chips?: FilterChipOption[];
  /** Placeholder text for input */
  placeholder?: string;
  /** Optional filter modal toggle callback */
  onOpenAdvancedFilters?: () => void;
  className?: string;
}

export function SearchBar({
  query = "",
  onQueryChange,
  selectedChipId = "all",
  onChipSelect,
  chips = DEFAULT_FILTER_CHIPS,
  placeholder = "Search gadgets by brand, model, or condition (e.g., iPhone 14 Pro Max, M2 Mac)...",
  onOpenAdvancedFilters,
  className,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState(query);
  const chipsContainerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    onQueryChange?.(val);
  };

  const handleClear = () => {
    setInternalQuery("");
    onQueryChange?.("");
  };

  const handleChipClick = (chipId: string) => {
    onChipSelect?.(chipId);
  };

  const scrollChips = (direction: "left" | "right") => {
    if (chipsContainerRef.current) {
      const offset = direction === "left" ? -200 : 200;
      chipsContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* ====================================================================
          1. PRIMARY SEARCH INPUT ROW
          ==================================================================== */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={internalQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="h-11 pl-10 pr-10 text-sm bg-background border-border shadow-xs focus-visible:ring-1 focus-visible:ring-ring"
          />
          {internalQuery && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Optional Filter Button */}
        {onOpenAdvancedFilters && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onOpenAdvancedFilters}
            className="h-11 gap-2 shrink-0 border-border text-foreground hover:bg-accent"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        )}
      </div>

      {/* ====================================================================
          2. HORIZONTALLY SCROLLING FILTER CHIPS ROW
          - Mobile (<768px): Horizontal swipeable row with scroll fading.
          - Desktop (>=768px): Flex container with navigation hints.
          ==================================================================== */}
      <div className="relative flex items-center">
        {/* Left Scroll Trigger Button (Desktop) */}
        <button
          type="button"
          onClick={() => scrollChips("left")}
          aria-label="Scroll filters left"
          className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground shadow-xs transition-colors mr-1 z-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={chipsContainerRef}
          className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {chips.map((chip) => {
            const isSelected = selectedChipId === chip.id;
            const isMint = chip.id === "mint";
            const isVerified = chip.id === "verified";

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip.id)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[4px] px-3 text-xs font-secondary font-medium transition-colors duration-200 ease-out select-none cursor-pointer border",
                  isSelected
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-xs font-semibold"
                    : isMint || isVerified
                    ? "bg-[#22c55e]/15 text-[#15803d] border-[#22c55e]/30 hover:bg-[#22c55e]/25 font-semibold"
                    : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#020617]"
                )}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={cn(
                      "font-mono text-[10px] rounded-[2px] px-1.5 py-0.2",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#f1f5f9] text-[#64748b]"
                    )}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Trigger Button (Desktop) */}
        <button
          type="button"
          onClick={() => scrollChips("right")}
          aria-label="Scroll filters right"
          className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground shadow-xs transition-colors ml-1 z-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
