"use client";

import React from "react";
import { Check, Filter, RotateCcw, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * FilterSidebar Component (Phase 1 §4)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Marketplace filter drawer/sidebar.
 * - Categories, Brands, Condition (Mint, Good, Fair), Price Range, Verified Seller Only.
 * - Responsive: Sticky sidebar on desktop (>= lg), drawer on mobile (< lg).
 * - Token Compliance: 8px card radius, 4px button/input controls, 200ms ease-out transitions.
 */

export interface FilterState {
  category: string;
  brand: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  kycOnly: boolean;
}

export interface FilterSidebarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export function FilterSidebar({
  filters,
  onChangeFilters,
  onResetFilters,
  isOpenOnMobile = false,
  onCloseMobile,
  className,
}: FilterSidebarProps) {
  const categories = [
    { id: "all", label: "All Gadgets" },
    { id: "smartphone", label: "Smartphones" },
    { id: "laptop", label: "Laptops & MacBooks" },
    { id: "tablet", label: "Tablets & iPads" },
    { id: "audio", label: "Audio & Wearables" },
  ];

  const brands = [
    { id: "all", label: "All Brands" },
    { id: "Apple", label: "Apple" },
    { id: "Samsung", label: "Samsung" },
    { id: "Google", label: "Google" },
    { id: "Dell", label: "Dell" },
    { id: "HP", label: "HP" },
  ];

  const conditions = [
    { id: "all", label: "Any Grade" },
    { id: "mint", label: "Mint (Like New 95%+)" },
    { id: "good", label: "Good (Minor Blemishes)" },
    { id: "fair", label: "Fair (Visible Scuffs)" },
  ];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#111113]" />
          <span className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">Filter Catalog</span>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Trust Filter: Verified Sellers Only */}
      <div className="border border-[#22c55e]/30 bg-[#22c55e]/10 p-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.kycOnly}
            onChange={(e) => onChangeFilters({ ...filters, kycOnly: e.target.checked })}
            className="mt-0.5 h-4 w-4 border-[#111113]/25 text-[#22c55e] focus:ring-[#22c55e]"
          />
          <div>
            <span className="font-primary text-xs font-bold text-[#15803d] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>SmileID Verified Only</span>
            </span>
            <span className="font-secondary text-[10px] text-[#111113]/65 leading-tight block mt-0.5">
              Exclude sellers who haven't passed biometric Government ID checks.
            </span>
          </div>
        </label>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="label block">
          Device Category
        </label>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChangeFilters({ ...filters, category: cat.id })}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all duration-200 ease-out text-left",
                filters.category === cat.id
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#111113]/70 hover:bg-[#F8F7F4] hover:text-[#111113]"
              )}
            >
              <span>{cat.label}</span>
              {filters.category === cat.id && <Check className="h-3.5 w-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="label block">
          Manufacturer
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onChangeFilters({ ...filters, brand: b.id })}
              className={cn(
                "px-2 py-1.5 text-xs font-medium border text-center transition-all duration-200 ease-out",
                filters.brand === b.id
                  ? "bg-[#111113] text-white border-[#111113] font-semibold"
                  : "bg-white border-[#111113]/12 text-[#111113] hover:bg-[#F8F7F4]"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Grade */}
      <div className="space-y-2">
        <label className="label block">
          Hardware Condition
        </label>
        <div className="space-y-1">
          {conditions.map((cond) => (
            <button
              key={cond.id}
              type="button"
              onClick={() => onChangeFilters({ ...filters, condition: cond.id })}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all duration-200 ease-out text-left",
                filters.condition === cond.id
                  ? "bg-[#111113] text-white font-semibold"
                  : "text-[#111113]/70 hover:bg-[#F8F7F4] hover:text-[#111113]"
              )}
            >
              <span>{cond.label}</span>
              {filters.condition === cond.id && <Check className="h-3.5 w-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <label className="label block">
          Max Price (₦ NGN)
        </label>
        <div className="flex items-center justify-between font-mono text-xs font-bold text-[#111113] mb-1">
          <span>₦50,000</span>
          <span>₦{(filters.maxPrice).toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={1500000}
          step={50000}
          value={filters.maxPrice}
          onChange={(e) =>
            onChangeFilters({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-[#111113] cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg:block) */}
      <aside
        className={cn(
          "hidden lg:block w-64 shrink-0 border border-[#111113]/12 bg-white p-5",
          className
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenOnMobile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#111113]/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Pane */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#111113]/12">
                <span className="font-primary text-base font-bold tracking-[-0.03em] text-[#111113]">
                  Filter Gadgets
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 hover:bg-[#F0EFEA] text-[#111113]/65"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {content}
            </div>

            <div className="pt-6 mt-6 border-t border-[#111113]/12">
              <Button
                variant="default"
                size="lg"
                onClick={onCloseMobile}
                className="w-full h-11 text-xs font-medium"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FilterSidebar;
