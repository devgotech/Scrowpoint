"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  GadgetListingCard,
  type GadgetListingData,
} from "@/components/GadgetListingCard";
import { GadgetListingSkeleton } from "@/components/GadgetListingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  FilterSidebar,
  type FilterState,
} from "@/components/marketplace/FilterSidebar";
import { listingsApi, type BackendListingDTO } from "@/lib/api";

/**
 * Screen 4: Public Marketplace Catalog (Phase 1 §4)
 * Route: app/(public)/marketplace/page.tsx
 *
 * Design System Compliance (4_ui_system.md — Design Variation 7):
 * - Warm Editorial Paper (#F8F7F4), Crisp Editorial White (#FFFFFF), Deep Carbon Ink (#111113)
 * - Sharp 0px architectural cards (border-[#111113]/12) paired with 999px pill primary CTAs
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
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
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
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
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
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
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
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
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
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
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
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];

function mapBackendListingToCard(dto: BackendListingDTO): GadgetListingData {
  const rawCond = (dto.condition_grade || "mint").toLowerCase();
  const condition: "mint" | "good" | "fair" =
    rawCond === "good" || rawCond === "fair" ? rawCond : "mint";
  const rawCat = (dto.category || "smartphone").toLowerCase();
  const category =
    rawCat === "laptop" || rawCat === "tablet" || rawCat === "wearable" || rawCat === "gaming"
      ? rawCat
      : "smartphone";

  return {
    id: dto.id,
    title: dto.title,
    brand: dto.title.split(" ")[0] || "Apple",
    model: dto.title,
    category,
    price: dto.price_kobo,
    isPriceInKobo: true,
    condition,
    batteryHealth: dto.battery_health || 96,
    storage: dto.storage_capacity || "256GB",
    location: dto.location_city
      ? `${dto.location_city}${dto.location_state ? `, ${dto.location_state}` : ""}`
      : "Ikeja, Lagos",
    sellerName: dto.seller_name || "SmileID Verified Seller",
    sellerVerified: true,
    images:
      dto.image_urls && dto.image_urls.length > 0
        ? dto.image_urls
        : INITIAL_GADGETS[0].images,
    videoUrl: INITIAL_GADGETS[0].videoUrl,
  };
}

export interface MarketplacePageProps {
  onSelectGadget?: (gadgetId: string) => void;
  onNavigateHome?: () => void;
}

export default function MarketplacePage({
  onSelectGadget,
  onNavigateHome,
}: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [catalogListings, setCatalogListings] =
    useState<GadgetListingData[]>(INITIAL_GADGETS);

  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    brand: "all",
    condition: "all",
    minPrice: 50000,
    maxPrice: 1500000,
    kycOnly: true,
  });

  useEffect(() => {
    let mounted = true;
    listingsApi.list().then((res) => {
      if (!mounted || !res.ok || !Array.isArray(res.data) || res.data.length === 0) {
        return;
      }
      const mapped = res.data.map(mapBackendListingToCard);
      const existingIds = new Set(mapped.map((m) => m.id));
      const combined = [
        ...mapped,
        ...INITIAL_GADGETS.filter((g) => !existingIds.has(g.id)),
      ];
      setCatalogListings(combined);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
    return catalogListings.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesBrand = (item.brand || "").toLowerCase().includes(q);
        const matchesModel = (item.model || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesModel) return false;
      }

      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }

      if (filters.brand !== "all" && item.brand !== filters.brand) {
        return false;
      }

      if (filters.condition !== "all" && item.condition !== filters.condition) {
        return false;
      }

      if (filters.kycOnly && !item.sellerVerified) {
        return false;
      }

      const itemPriceNaira = item.price / 100;
      if (itemPriceNaira > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [catalogListings, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111113] flex flex-col font-secondary antialiased selection:bg-[#FF5A25] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Marketplace Header Strip */}
        <div className="bg-white border-b border-[#111113]/12 py-8 sm:py-10">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.12em] mb-3">
              <Link
                href="/"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-[#111113]/65 hover:text-[#FF5A25] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <span aria-hidden="true" className="text-[#111113]/25">
                /
              </span>
              <span className="font-bold text-[#111113]">
                Verified Marketplace
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-primary text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#111113] uppercase leading-[0.95]">
                  VERIFIED SECONDHAND GADGETS
                  <span className="text-[#FF5A25]">.</span>
                </h1>
                <p className="font-secondary text-xs sm:text-sm text-[#111113]/70 mt-2">
                  100% Paystack Escrow Custody • 48-Hour Hardware Diagnostic SLA
                  • SmileID Biometric Merchants
                </p>
              </div>

              {/* Mobile Filter Toggle Button */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="h-11 px-4 border border-[#111113]/15 bg-white text-xs font-mono uppercase tracking-wider font-bold text-[#111113] flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#FF5A25]" />
                  <span>Filter Catalog</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111113] text-white text-[10px] font-mono">
                    {
                      [
                        filters.category !== "all",
                        filters.brand !== "all",
                        filters.condition !== "all",
                        filters.kycOnly,
                      ].filter(Boolean).length
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* Live Search Input Bar */}
            <div className="mt-6 relative max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111113]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, model, SKU or condition (e.g. iPhone 14 Pro, M2 MacBook)..."
                className="w-full h-11 pl-10 pr-16 rounded-none border border-[#111113]/15 bg-[#F8F7F4] text-xs sm:text-sm font-secondary text-[#111113] placeholder:text-[#111113]/45 focus:bg-white focus:border-[#111113] focus:ring-1 focus:ring-[#111113] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono uppercase tracking-wider font-bold text-[#FF5A25] hover:text-[#111113]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Body: Filters + Grid */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
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
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#111113]/12">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#111113]/65">
                    Showing{" "}
                    <strong className="text-[#111113] font-bold">
                      {filteredListings.length}
                    </strong>{" "}
                    verified gadgets
                  </span>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#15803d]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span>Vault Protection Active</span>
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
                  <EmptyState
                    title="No Verified Gadgets Found"
                    description="We couldn't find any gadgets matching your filter criteria. Try broadening your price range or clearing manufacturer filters."
                    actionLabel="Reset All Filters"
                    onAction={handleResetFilters}
                  />
                ) : (
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
