"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Component,
  CreditCard,
  Database,
  Eye,
  FileText,
  Filter,
  Grid,
  Heart,
  HelpCircle,
  Laptop,
  Layers,
  Lock,
  Package,
  Receipt,
  RotateCcw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Truck,
  Upload,
  User,
  Wallet,
} from "lucide-react";

// Atomic Primitives
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Custom Domain & Shell Components
import { UserAvatar } from "@/components/UserAvatar";
import { EmptyState } from "@/components/EmptyState";
import { EscrowStatusBar } from "@/components/EscrowStatusBar";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { GadgetListingCard, type GadgetListingData } from "@/components/GadgetListingCard";
import { GadgetListingSkeleton, GadgetListingGridSkeleton } from "@/components/GadgetListingSkeleton";
import { SearchBar } from "@/components/SearchBar";
import { EscrowTrackerStepper } from "@/components/EscrowTrackerStepper";
import { EscrowFeeReceipt } from "@/components/EscrowFeeReceipt";
import { ActionRequiredCard } from "@/components/ActionRequiredCard";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { FileUploader } from "@/components/FileUploader";
import { AdminDisputeRow } from "@/components/AdminDisputeRow";
import { StackedCard } from "@/components/StackedCard";

import { AuthProvider } from "@/components/providers/AuthContext";
import { formatCurrency } from "@/lib/currency";
import type { AdminDisputeData } from "@/types/dispute";
import { cn } from "@/lib/utils";

/**
 * Live Design System and Component Documentation Registry for Buyer's High.
 *
 * Requirements (UI Context Specs 1 through 5, Master Prompt Directives):
 * - Two-column layout:
 *   - Left: Fixed navigation sidebar with category filtering.
 *     Categories: "All", "Tier 1 Atoms", "Tier 2 Marketplace", "Tier 3 Escrow", "Forms", "Overlays"
 *   - Right: Main component viewing area.
 * - Strongly-typed COMPONENT_REGISTRY array defining each component, its category, description, and render function.
 * - Each item rendered in a Shadcn <Card> with header, tier tag, and subtle border.
 * - Enforces --background, --card, and --muted semantic variables.
 */

export type ComponentCategory =
  | "all"
  | "Tier 1 Atoms"
  | "Tier 2 Marketplace"
  | "Tier 3 Escrow"
  | "Forms"
  | "Overlays";

export interface ComponentRegistryItem {
  id: string;
  title: string;
  category: "Tier 1 Atoms" | "Tier 2 Marketplace" | "Tier 3 Escrow" | "Forms" | "Overlays";
  tierLabel: string;
  description: string;
  tags: string[];
  render: () => React.ReactNode;
}

// ============================================================================
// MOCK DATA FIXTURES
// ============================================================================

const MOCK_LISTING: GadgetListingData = {
  id: "lst-macbook-pro-m2",
  title: "Apple MacBook Pro 14' M2 Max 32GB 1TB",
  brand: "Apple",
  model: "MacBook Pro 14-inch",
  category: "Laptops & MacBooks",
  price: 185000000, // ₦1,850,000 in kobo
  isPriceInKobo: true,
  currency: "NGN",
  condition: "mint",
  images: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
  ],
  location: "Ikeja, Lagos",
  batteryHealth: 98,
  storage: "1TB SSD",
  sellerName: "Adeola Tech Hub",
  sellerVerified: true,
  isSaved: false,
};

const MOCK_ADMIN_DISPUTE: AdminDisputeData = {
  id: "dsp-8942-bc89",
  orderId: "bh-ord-94218a",
  orderNumber: "BH-ORD-94218A",
  buyerName: "Tunde Adeleke",
  buyerEmail: "tunde@example.ng",
  sellerName: "Adeola Tech Hub",
  sellerEmail: "adeola@techhub.ng",
  gadgetTitle: "iPhone 14 Pro Max 256GB Space Black",
  reason: "Battery capacity shows 81% on 3uTools diagnostic audit despite listing claiming 97% mint condition.",
  lockedAmountKobo: 85000000, // ₦850,000 in kobo
  status: "admin_mediation",
  evidenceCount: 4,
  slaRemainingString: "01h 48m",
  isUrgentSla: true,
  createdAt: "Oct 16, 10:14 AM",
};

// ============================================================================
// COMPONENT REGISTRY DEFINITIONS
// ============================================================================

export const COMPONENT_REGISTRY: ComponentRegistryItem[] = [
  // --------------------------------------------------------------------------
  // TIER 1 ATOMS
  // --------------------------------------------------------------------------
  {
    id: "atom-buttons",
    title: "Button Primitives",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Standard Shadcn button component with default, secondary, outline, destructive, and ghost variants.",
    tags: ["Buttons", "Variants", "Interactive"],
    render: () => (
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default">Primary Action</Button>
        <Button variant="secondary">Secondary Action</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost Trigger</Button>
        <Button variant="default" size="sm">Small</Button>
        <Button variant="default" size="lg">Large CTA</Button>
        <Button variant="default" disabled>Disabled State</Button>
      </div>
    ),
  },
  {
    id: "atom-badges",
    title: "Status Badges & Trust Pills",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Enforces the design system rule: green (#22c55e) strictly reserved for trust/escrow states. Amber for pending.",
    tags: ["Badges", "Trust Color", "Warning Color"],
    render: () => (
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge variant="trust" className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span>FUNDS_HELD (Trust State)</span>
        </Badge>
        <Badge variant="trust" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>KYC Verified Seller</span>
        </Badge>
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>INSPECTION_PERIOD (Warning State)</span>
        </Badge>
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Dispute Raised</span>
        </Badge>
        <Badge variant="default">Primary Pill</Badge>
        <Badge variant="secondary">Draft / Neutral</Badge>
        <Badge variant="outline">Outline Filter</Badge>
      </div>
    ),
  },
  {
    id: "atom-user-avatar",
    title: "UserAvatar with Initials Fallback",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Wrapper around Shadcn Avatar primitive with automated initials calculation, size presets, and graceful image error recovery.",
    tags: ["Avatar", "Initials Fallback", "Accessibility"],
    render: () => (
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <UserAvatar name="Chidi Okonkwo" size="xl" />
          <UserAvatar name="Adeola Johnson" size="lg" />
          <UserAvatar name="Tunde Adeleke" size="md" />
          <UserAvatar name="Zainab Mobile" size="sm" />
          <UserAvatar name="Emeka" size="xs" />
        </div>
        <div className="flex items-center gap-3">
          <UserAvatar
            name="Verified Trader"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            size="lg"
          />
          <UserAvatar
            name="Broken Image Test"
            src="https://invalid-broken-url.example/404.jpg"
            size="lg"
          />
        </div>
      </div>
    ),
  },
  {
    id: "atom-empty-state",
    title: "Actionable Empty State",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Standardized empty screen with subtle monochrome icon, bold heading, muted description, and primary CTA button.",
    tags: ["Empty State", "Call to Action", "Premium States"],
    render: () => (
      <EmptyState
        title="No Active Escrow Trades Found"
        description="You have no gadgets currently held in escrow. Explore verified secondhand iPhones, MacBooks, and consoles in our marketplace."
        actionLabel="Browse Marketplace"
        actionHref="/marketplace"
        icon={Package}
      />
    ),
  },

  // --------------------------------------------------------------------------
  // TIER 2 MARKETPLACE
  // --------------------------------------------------------------------------
  {
    id: "market-search-bar",
    title: "SearchBar with Filter Chips Carousel",
    category: "Tier 2 Marketplace",
    tierLabel: "Tier 2 Flow-Specific",
    description: "Search input with clear action, filter trigger, and horizontally swipeable filter chips row with left/right scroll navigation.",
    tags: ["Search", "Carousel", "Filter Chips"],
    render: () => (
      <div className="w-full max-w-2xl">
        <SearchBar
          placeholder="Search iPhones, MacBooks, Samsung Galaxy, PS5..."
          selectedChipId="all"
          onOpenAdvancedFilters={() => {}}
        />
      </div>
    ),
  },
  {
    id: "market-listing-card",
    title: "GadgetListingCard & Skeleton",
    category: "Tier 2 Marketplace",
    tierLabel: "Tier 2 Flow-Specific",
    description: "4:3 aspect ratio image container, condition badge, bold title, and font-mono formatted NGN price with exact layout parity skeleton.",
    tags: ["Listing Card", "4:3 Image", "Skeleton Parity", "Currency"],
    render: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase block mb-2">
            Loaded State (Masonry Ready)
          </span>
          <GadgetListingCard listing={MOCK_LISTING} />
        </div>
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase block mb-2">
            Skeleton State (Zero CLS Parity)
          </span>
          <GadgetListingSkeleton />
        </div>
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // TIER 3 ESCROW
  // --------------------------------------------------------------------------
  {
    id: "escrow-status-bar",
    title: "EscrowStatusBar (Micro-Summary Trust Bar)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Domain-Specific",
    description: "Sticky micro-summary bar residing below top navigation. Features Slate 900 styling, live countdown timer, and critical warning pulse under 2 hours.",
    tags: ["Trust Bar", "Micro-Summary", "Urgent Alert Pulse", "Timer"],
    render: () => (
      <div className="w-full space-y-4">
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase block mb-1">
            Urgent State (&lt;2h Inspection Window - Amber Pulse)
          </span>
          <EscrowStatusBar
            orderShortId="BH-ORD-9421"
            state="INSPECTION_PERIOD"
            initialSecondsRemaining={6480} // 1h 48m
            itemTitle="MacBook Pro 14' M2 Max"
          />
        </div>
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase block mb-1">
            Standard Vault State (Funds Held - Emerald Trust)
          </span>
          <EscrowStatusBar
            orderShortId="BH-ORD-8812"
            state="FUNDS_HELD"
            initialSecondsRemaining={86400} // 24h
            itemTitle="Samsung Galaxy S23 Ultra"
          />
        </div>
      </div>
    ),
  },
  {
    id: "escrow-stepper",
    title: "EscrowTrackerStepper (Macro Timeline)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Domain-Specific",
    description: "Macro-view timeline for /escrow/[id]/status. Full horizontal connector on desktop; vertical accordion history on mobile. FUNDS_HELD pulses in trust color.",
    tags: ["Timeline", "Macro Stepper", "Responsive Isolation", "Pulsing State"],
    render: () => (
      <div className="w-full">
        <EscrowTrackerStepper
          currentState="funds_held"
          orderNumber="BH-ORD-94218A"
          trackingNumber="GIG-89421092-NG"
          courierName="GIG Logistics"
        />
      </div>
    ),
  },
  {
    id: "escrow-receipt",
    title: "EscrowFeeReceipt (Itemized Financial Receipt)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Domain-Specific",
    description: "Itemized financial breakdown of Item Price, Tiered Escrow Fee (5% / 2.5% / 1.5%), Shipping, and Total Locked with font-mono enforcement.",
    tags: ["Receipt", "Tiered Fee Math", "Financial Transparency", "font-mono"],
    render: () => (
      <div className="w-full flex justify-center">
        <EscrowFeeReceipt
          orderNumber="BH-ORD-94218A"
          itemTitle="Apple iPhone 14 Pro 256GB (Space Black)"
          itemPrice={65000000} // ₦650,000 in kobo
          shippingFee={450000} // ₦4,500 in kobo
          currency="NGN"
          isLockedInEscrow={true}
        />
      </div>
    ),
  },
  {
    id: "escrow-action-card",
    title: "ActionRequiredCard (Transaction Unblocker)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Domain-Specific",
    description: "Alert primitive card featuring urgent countdown timer, context details, and high-visibility button to approve delivery or ship device.",
    tags: ["Alert Primitive", "Action Required", "Unblock Transaction"],
    render: () => (
      <div className="w-full space-y-4">
        <ActionRequiredCard
          type="APPROVE_DELIVERY"
          orderNumber="BH-ORD-94218A"
          countdownString="01h 48m 12s"
          onPrimaryAction={() => {}}
          onSecondaryAction={() => {}}
        />
        <ActionRequiredCard
          type="SHIP_ITEM"
          orderNumber="BH-ORD-77123B"
          countdownString="22h 15m 00s"
          onPrimaryAction={() => {}}
        />
      </div>
    ),
  },
  {
    id: "escrow-admin-dispute-views",
    title: "AdminDisputeRow & StackedCard (Responsive Isolation)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Domain-Specific",
    description: "Demonstrates Master Prompt Directive §2: Desktop table row (md:table-row) swaps conditionally with mobile glance-and-approve StackedCard (md:hidden).",
    tags: ["Admin Table", "StackedCard", "Responsive Swapping"],
    render: () => (
      <div className="w-full space-y-4">
        {/* Desktop View Table */}
        <div className="hidden md:block w-full overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Case ID</th>
                <th className="px-4 py-2.5">Item & Reason</th>
                <th className="px-4 py-2.5">Parties</th>
                <th className="px-4 py-2.5">Locked Vault</th>
                <th className="px-4 py-2.5">Files</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">SLA</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <AdminDisputeRow dispute={MOCK_ADMIN_DISPUTE} />
            </tbody>
          </table>
        </div>

        {/* Mobile View StackedCard */}
        <div className="block md:hidden">
          <span className="font-mono text-[11px] text-muted-foreground uppercase block mb-1.5">
            Mobile Screen Active (&lt;768px Viewport)
          </span>
          <StackedCard dispute={MOCK_ADMIN_DISPUTE} />
        </div>
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // FORMS
  // --------------------------------------------------------------------------
  {
    id: "form-payment-methods",
    title: "PaymentMethodSelector",
    category: "Forms",
    tierLabel: "Tier 3 Domain-Specific",
    description: "Selectable card grid for Card (Paystack), Bank (Virtual Account), Crypto (USDT/USDC), and Wallet with primary border highlight.",
    tags: ["Payment Grid", "Paystack Vault", "Radio Select"],
    render: () => (
      <div className="w-full max-w-3xl">
        <PaymentMethodSelector selectedMethodId="card" />
      </div>
    ),
  },
  {
    id: "form-file-uploader",
    title: "FileUploader (Direct S3 Presigned Upload)",
    category: "Forms",
    tierLabel: "Tier 2 Flow-Specific",
    description: "Desktop drag-and-drop dropzone with mobile camera capture triggers (capture='environment'). Granular loading states for presigned URL authorization.",
    tags: ["Direct S3", "Presigned URL", "Camera Capture", "Drag and Drop"],
    render: () => (
      <div className="w-full max-w-2xl">
        <FileUploader
          referenceId="demo-dispute-evidence"
          title="Upload Diagnostic Proof & Photos"
          description="Drag and drop 3uTools screenshots, IMEI photos, or unboxing video up to 50MB."
        />
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // OVERLAYS & SHELL
  // --------------------------------------------------------------------------
  {
    id: "overlay-navbar",
    title: "Navbar (Global Header Shell)",
    category: "Overlays",
    tierLabel: "Tier 1 Foundation",
    description: "Sticky h-16 blur header featuring guest login/signup state and authenticated state with notification bell and avatar dropdown with KYC verification pill.",
    tags: ["Sticky Header", "Backdrop Blur", "Auth Gate"],
    render: () => (
      <div className="w-full rounded-xl overflow-hidden border border-border shadow-sm">
        <Navbar unreadNotificationsCount={3} />
      </div>
    ),
  },
  {
    id: "overlay-mobile-bottom-nav",
    title: "MobileBottomNav (Fixed App Navigation)",
    category: "Overlays",
    tierLabel: "Tier 1 Foundation",
    description: "Fixed bottom navigation for mobile screens (<768px) with Home, Search, Escrows (active trade counter), and Profile links.",
    tags: ["Mobile Bottom Bar", "Webapp Nav", "Touch Friendly"],
    render: () => (
      <div className="w-full max-w-md mx-auto relative h-20 rounded-xl overflow-hidden border border-border bg-card p-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase block text-center mb-1">
          Simulated Mobile Screen Nav Bar
        </span>
        <div className="relative">
          <MobileBottomNav className="relative bottom-auto" />
        </div>
      </div>
    ),
  },
];

// ============================================================================
// MAIN SANDBOX COMPONENT
// ============================================================================

export default function SandboxPage() {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: { label: string; value: ComponentCategory; count: number }[] = [
    { label: "All Components", value: "all", count: COMPONENT_REGISTRY.length },
    {
      label: "Tier 1 Atoms",
      value: "Tier 1 Atoms",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Tier 1 Atoms").length,
    },
    {
      label: "Tier 2 Marketplace",
      value: "Tier 2 Marketplace",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Tier 2 Marketplace").length,
    },
    {
      label: "Tier 3 Escrow",
      value: "Tier 3 Escrow",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Tier 3 Escrow").length,
    },
    {
      label: "Forms & Media",
      value: "Forms",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Forms").length,
    },
    {
      label: "Overlays & Shell",
      value: "Overlays",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Overlays").length,
    },
  ];

  const filteredComponents = useMemo(() => {
    return COMPONENT_REGISTRY.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-background text-foreground antialiased font-body">
        {/* Sandbox Top Branded Strip */}
        <div className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Boxes className="h-4 w-4" />
              </div>
              <div>
                <h1 className="font-heading text-base font-bold text-foreground leading-none">
                  Buyer's High Component Registry
                </h1>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  Live Design System & Sandbox Architecture
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="trust" className="text-[10px] font-mono py-0">
                Next.js 16 App Router
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono py-0">
                Tailwind v4 • 4pt Scale
              </Badge>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row min-h-[calc(100vh-57px)]">
          {/* ==================================================================
              LEFT COLUMN: FIXED / STICKY SIDEBAR NAVIGATION
              ================================================================== */}
          <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border bg-card p-4 sm:p-6 space-y-6">
            {/* Filter Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter registry..."
                className="h-8 w-full rounded-md border border-input bg-muted/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>

            {/* Navigation Categories */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-2">
                Categories
              </span>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.value;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left select-none cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={cn(
                        "font-mono text-[10px] rounded-full px-1.5 py-0.2",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Design System Rules Reference Box */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-heading font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Enforced Directives</span>
              </div>
              <ul className="space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li>Strict 4-point spacing scale</li>
                <li>Green #22c55e strictly for trust/escrow</li>
                <li>Amber #ecc94b for pending/dispute</li>
                <li>font-mono for numbers & IDs</li>
                <li>Zero arbitrary px values</li>
              </ul>
            </div>
          </aside>

          {/* ==================================================================
              RIGHT COLUMN: MAIN COMPONENT DISPLAY VIEWPORT
              ================================================================== */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                  {categories.find((c) => c.value === activeCategory)?.label}
                </h2>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  Displaying {filteredComponents.length} production-ready React components with responsive isolation.
                </p>
              </div>

              <span className="font-mono text-xs text-muted-foreground">
                Registry Items: {filteredComponents.length} / {COMPONENT_REGISTRY.length}
              </span>
            </div>

            {/* Component Cards Display Grid */}
            {filteredComponents.length === 0 ? (
              <EmptyState
                title="No Components Found"
                description={`We couldn't find any components matching "${searchQuery}".`}
                actionLabel="Clear Filter"
                onAction={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              />
            ) : (
              <div className="space-y-8">
                {filteredComponents.map((item) => (
                  <Card
                    key={item.id}
                    id={item.id}
                    className="w-full rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all hover:border-border/90"
                  >
                    {/* Component Card Header */}
                    <CardHeader className="bg-muted/30 p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="font-heading text-base font-bold text-foreground">
                            {item.title}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px] py-0 tracking-wider uppercase"
                          >
                            {item.tierLabel}
                          </Badge>
                        </div>
                        <CardDescription className="font-body text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] bg-background border border-border px-2 py-0.5 rounded-md text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardHeader>

                    {/* Component Live Render Canvas */}
                    <CardContent className="p-6 bg-background flex flex-col items-center justify-center min-h-36">
                      <div className="w-full">{item.render()}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
