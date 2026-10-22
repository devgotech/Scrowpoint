"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GadgetListingCard, type GadgetListingData } from "@/components/GadgetListingCard";
import { GadgetListingSkeleton } from "@/components/GadgetListingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { FilterSidebar, type FilterState } from "@/components/marketplace/FilterSidebar";
import { Button } from "@/components/ui/button";

/**
 * Screen 4: Public Marketplace Catalog (Phase 1 §4)
 * Route: app/(public)/marketplace/page.tsx
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Components: SearchInput, FilterSidebar, GadgetListingCard, TrustBadge.
 * - Architecture Link: Calls public gadget feed. Media served from Python/S3.
 * - States: LoadingSkeleton for the masonry grid, EmptyState ("No gadgets found").
 * - Responsive: Mobile-first layout with slide-out filter drawer, 1-col on mobile,
 *   2-col on sm/md, 3-col on lg/xl.
 */

export const INITIAL_GADGETS: GadgetListingData[] = [
  {
    id: "g-001",
    title: "Apple iPhone 14 Pro Max 256GB Deep Purple",
    brand: "Apple",
    model: "iPhone 14 Pro Max",
    category: "smartphone",
    price: 85000000, // ₦850,000 in kobo
    isPriceInKobo: true,
    condition: "mint",
    batteryHealth: 98,
    storage: "256GB",
    location: "Ikeja, Lagos",
    sellerName: "Adeola Tech Hub",
    sellerVerified: true,
    images: [
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "g-002",
    title: "Apple MacBook Air 13-inch M2 512GB Space Gray",
    brand: "Apple",
    model: "MacBook Air M2",
    category: "laptop",
    price: 68000000, // ₦680,000 in kobo
    isPriceInKobo: true,
    condition: "good",
    batteryHealth: 92,
    storage: "512GB",
    location: "Lekki Phase 1, Lagos",
    sellerName: "Chidi Gadgets",
    sellerVerified: true,
    images: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: "g-003",
    title: "Samsung Galaxy S23 Ultra 512GB Phantom Black",
    brand: "Samsung",
    model: "Galaxy S23 Ultra",
    category: "smartphone",
    price: 49000000, // ₦490,000 in kobo
    isPriceInKobo: true,
    condition: "fair",
    batteryHealth: 88,
    storage: "512GB",
    location: "Yaba, Lagos",
    sellerName: "Emeka Verified Store",
    sellerVerified: true,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: "g-004",
    title: "Google Pixel 7 Pro 128GB Obsidian Black",
    brand: "Google",
    model: "Pixel 7 Pro",
    category: "smartphone",
    price: 32000000, // ₦320,000 in kobo
    isPriceInKobo: true,
    condition: "mint",
    batteryHealth: 96,
    storage: "128GB",
    location: "Garki, Abuja",
    sellerName: "Zainab Mobile Deals",
    sellerVerified: true,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
  },
  {
    id: "g-005",
    title: "Apple iPad Pro 11-inch M1 256GB Wi-Fi + Cellular",
    brand: "Apple",
    model: "iPad Pro 11 M1",
    category: "tablet",
    price: 42000000, // ₦420,000 in kobo
    isPriceInKobo: true,
    condition: "good",
    batteryHealth: 94,
    storage: "256GB",
    location: "Victoria Island, Lagos",
    sellerName: "Prime Apple Exchange",
    sellerVerified: true,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
  {
    id: "g-006",
    title: "Dell XPS 15 9520 Intel i7 32GB RAM 1TB SSD RTX 3050",
    brand: "Dell",
    model: "XPS 15 9520",
    category: "laptop",
    price: 92000000, // ₦920,000 in kobo
    isPriceInKobo: true,
    condition: "mint",
    batteryHealth: 95,
    storage: "1TB",
    location: "Port Harcourt, Rivers",
    sellerName: "TechPro Systems",
    sellerVerified: true,
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];

export interface MarketplacePageProps {
  onSelectGadget?: (gadgetId: string) => void;
  onNavigateHome?: () => void;
}

export default function MarketplacePage({
  onSelectGadget,
  onNavigateHome,
}: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    brand: "all",
    condition: "all",
    minPrice: 50000,
    maxPrice: 1500000,
    kycOnly: true,
  });

  const handleResetFilters = () => {
    setFilters({
      category: "all",
      brand: "all",
      condition: "all",
      minPrice: 50000,
      maxPrice: 1500000,
      kycOnly: false,
    });
    setSearchQuery("");
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return INITIAL_GADGETS.filter((item) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesBrand = (item.brand || "").toLowerCase().includes(q);
        const matchesModel = (item.model || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesModel) return false;
      }

      // Category
      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }

      // Brand
      if (filters.brand !== "all" && item.brand !== filters.brand) {
        return false;
      }

      // Condition
      if (filters.condition !== "all" && item.condition !== filters.condition) {
        return false;
      }

      // KYC
      if (filters.kycOnly && !item.sellerVerified) {
        return false;
      }

      // Price
      const itemPriceNaira = item.price / 100;
      if (itemPriceNaira > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#020617] flex flex-col font-secondary antialiased">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Marketplace Header Strip */}
        <div className="bg-white border-b border-[#e2e8f0] py-6 sm:py-8">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#64748b] text-xs">/</span>
              <span className="font-mono text-xs font-semibold text-[#0f172a]">
                Verified Marketplace
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-primary text-2xl sm:text-3xl font-bold tracking-tight text-[#020617]">
                  Verified Secondhand Gadgets
                </h1>
                <p className="font-secondary text-xs sm:text-sm text-[#64748b] mt-1">
                  100% Escrow Protected • 48-Hour Hardware Diagnostic SLA • SmileID Checked Sellers
                </p>
              </div>

              {/* Mobile Filter Toggle Button */}
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="h-10 px-4 rounded-[4px] border-[#e2e8f0] text-xs font-medium gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#0f172a]" />
                  <span>Filter Options</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f172a] text-white text-[10px] font-mono">
                    {[
                      filters.category !== "all",
                      filters.brand !== "all",
                      filters.condition !== "all",
                      filters.kycOnly,
                    ].filter(Boolean).length}
                  </span>
                </Button>
              </div>
            </div>

            {/* Live Search Input Bar */}
            <div className="mt-5 relative max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, model, SKU or condition (e.g. iPhone 14 Pro, M2 MacBook)..."
                className="w-full h-11 pl-10 pr-4 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] text-xs font-secondary text-[#020617] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748b] hover:text-[#020617]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Body: Filters + Grid */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Filter Sidebar */}
              <FilterSidebar
                filters={filters}
                onChangeFilters={setFilters}
                onResetFilters={handleResetFilters}
                isOpenOnMobile={isMobileFilterOpen}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />

              {/* Main Catalog View Area */}
              <div className="flex-1 w-full min-w-0">
                {/* Result Status Strip */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#e2e8f0]">
                  <span className="font-mono text-xs text-[#64748b]">
                    Showing{" "}
                    <strong className="text-[#020617]">{filteredListings.length}</strong> verified
                    gadgets
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#15803d] bg-[#22c55e]/15 px-2 py-0.5 rounded-[4px] border border-[#22c55e]/30 font-semibold">
                      Vault Protection Active
                    </span>
                  </div>
                </div>

                {/* Loading State Check */}
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <GadgetListingSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredListings.length === 0 ? (
                  /* Empty State when zero results match */
                  <EmptyState
                    title="No Verified Gadgets Found"
                    description="We couldn't find any gadgets matching your filter criteria. Try broadening your price range or clearing manufacturer filters."
                    actionLabel="Reset All Filters"
                    onAction={handleResetFilters}
                  />
                ) : (
                  /* Grid of Verified Gadget Listings */
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((item) => (
                      <GadgetListingCard
                        key={item.id}
                        listing={item}
                        onSelect={onSelectGadget}
                        href={`/gadget/${item.id}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
