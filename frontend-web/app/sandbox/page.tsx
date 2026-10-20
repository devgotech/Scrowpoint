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
import { ToastItem, ToastProvider, useToast } from "@/components/Toast";
import GlobalError from "@/app/error";
import NotFound from "@/app/not-found";
import { AdminDisputeRow } from "@/components/AdminDisputeRow";
import { StackedCard } from "@/components/StackedCard";

import { AuthProvider } from "@/components/providers/AuthContext";
import { formatCurrency } from "@/lib/currency";
import type { AdminDisputeData } from "@/types/dispute";
import { cn } from "@/lib/utils";

/**
 * Live Design System and Component Documentation Registry for Buyer's High.
 *
 * Requirements (4_ui_system.md & UI Context Specs 1 through 5):
 * - Two-column layout:
 *   - Left: Fixed navigation sidebar with category filtering.
 *     Categories: "All", "Tokens & Rules", "Tier 1 Atoms", "Tier 2 Marketplace", "Tier 3 Escrow", "Forms", "Overlays"
 *   - Right: Main component viewing area.
 * - Corner Radius: strictly 8px on cards (rounded-[8px]), 4px on controls (rounded-[4px]), rounded-full on trust badges only.
 * - Enforces --color-bg-base (#f8fafc), --color-bg-card (#ffffff), --color-text-primary (#020617).
 * - Typography: Roboto for headings (font-primary), Geist for body/UI (font-secondary), Geist Mono for numbers/IDs (font-mono).
 */

export type ComponentCategory =
  | "all"
  | "Tokens & Rules"
  | "Tier 1 Atoms"
  | "Tier 2 Marketplace"
  | "Tier 3 Escrow"
  | "Forms"
  | "Overlays";

export interface ComponentRegistryItem {
  id: string;
  title: string;
  category: "Tokens & Rules" | "Tier 1 Atoms" | "Tier 2 Marketplace" | "Tier 3 Escrow" | "Forms" | "Overlays";
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
  // DESIGN SYSTEM TOKENS & RULES (4_ui_system.md)
  // --------------------------------------------------------------------------
  {
    id: "tokens-quick-reference",
    title: "4_ui_system.md Design Tokens & Strict Rules",
    category: "Tokens & Rules",
    tierLabel: "Design System Core",
    description: "System colors, corner radius semantics, font stacks, and the 6 NEVER rules from 4_ui_system.md.",
    tags: ["Tokens", "CSS Variables", "Rules", "WCAG Contrast"],
    render: () => (
      <div className="w-full space-y-6">
        {/* Colors Palette Grid */}
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#64748b] block mb-3 font-semibold">
            Color Palette & Semantic Tokens
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
              <div className="h-6 w-full rounded-[2px] bg-[#f8fafc] border border-[#e2e8f0] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-bg-base</div>
              <div className="font-mono text-[10px] text-[#64748b]">#f8fafc (Page Bg)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#0f172a] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-action-primary</div>
              <div className="font-mono text-[10px] text-[#64748b]">#0f172a (CTA Button)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#22c55e] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-trust</div>
              <div className="font-mono text-[10px] text-[#64748b]">#22c55e (Escrow Only)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#15803d] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-trust-strong</div>
              <div className="font-mono text-[10px] text-[#64748b]">#15803d (Text Contrast)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#088235] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-state-success</div>
              <div className="font-mono text-[10px] text-[#64748b]">#088235 (Escrow Funded)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#ecc94b] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-state-warning</div>
              <div className="font-mono text-[10px] text-[#64748b]">#ecc94b (Dispute Open)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#f56565] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-state-error</div>
              <div className="font-mono text-[10px] text-[#64748b]">#f56565 (Verification Fail)</div>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-white">
              <div className="h-6 w-full rounded-[2px] bg-[#e2e8f0] mb-2" />
              <div className="font-mono font-bold text-[#020617]">--color-border-default</div>
              <div className="font-mono text-[10px] text-[#64748b]">#e2e8f0 (Border)</div>
            </div>
          </div>
        </div>

        {/* Radius Semantics */}
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#64748b] block mb-3 font-semibold">
            Corner Radius Semantics
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
              <span className="font-mono font-bold text-[#020617] block">--radius-control: 4px</span>
              <p className="font-secondary text-[#64748b] text-[11px] mt-1">
                Buttons, form inputs, selects, filter chips, action pills.
              </p>
            </div>
            <div className="p-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc]">
              <span className="font-mono font-bold text-[#020617] block">--radius-card: 8px</span>
              <p className="font-secondary text-[#64748b] text-[11px] mt-1">
                Listing cards, containers, dialogs, dropdown menus.
              </p>
            </div>
            <div className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc]">
              <span className="font-mono font-bold text-[#020617] block">--radius-badge: 9999px</span>
              <p className="font-secondary text-[#64748b] text-[11px] mt-1">
                Trust badges ONLY (Escrow Active, Verified Seller).
              </p>
            </div>
          </div>
        </div>

        {/* The 6 NEVER Rules */}
        <div className="rounded-[4px] border border-[#ecc94b]/50 bg-[#ecc94b]/10 p-4">
          <span className="font-mono text-xs uppercase tracking-wider text-[#975a16] block font-bold mb-2">
            The 6 NEVER Rules (4_ui_system.md)
          </span>
          <ol className="space-y-1.5 text-xs font-secondary text-[#020617] list-decimal list-inside leading-relaxed">
            <li><strong>NEVER</strong> use Trust Green for anything except escrow signals (Escrow Active, Verified, funds released).</li>
            <li><strong>NEVER</strong> place Trust Green text on white background (fails WCAG). Always use <code className="font-mono bg-white px-1 py-0.5 rounded text-[#15803d]">--color-trust-strong (#15803d)</code>.</li>
            <li><strong>NEVER</strong> use pill radius (9999px) on anything except trust badges. Condition chips and status pills use 4px.</li>
            <li><strong>NEVER</strong> use Warning amber for failures or Error red for disputes. Dispute Open = warning (#ecc94b), Verification Failed = error (#f56565), Escrow Funded = success (#088235).</li>
            <li><strong>NEVER</strong> set money amounts, IDs or reference numbers in primary font — use <code className="font-mono bg-white px-1 py-0.5 rounded">Geist Mono</code>.</li>
            <li><strong>NEVER</strong> use bouncy animations. Use strict <code className="font-mono bg-white px-1 py-0.5 rounded">duration-200 ease-out</code> transitions.</li>
          </ol>
        </div>
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // TIER 1 ATOMS
  // --------------------------------------------------------------------------
  {
    id: "atom-buttons",
    title: "Button Primitives",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Buttons configured to 4_ui_system.md: 4px radius, Geist Medium font, #0f172a primary fill, and strict 200ms ease-out transitions.",
    tags: ["Buttons", "4px Radius", "Geist Medium", "duration-200"],
    render: () => (
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default">Primary Action</Button>
        <Button variant="secondary">Secondary Action</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost Trigger</Button>
        <Button variant="default" size="sm">Small (h-8)</Button>
        <Button variant="default" size="lg">Large CTA (h-10)</Button>
        <Button variant="default" disabled>Disabled State</Button>
      </div>
    ),
  },
  {
    id: "atom-badges",
    title: "Trust Badges & Status Pills",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Strict enforcement of 4_ui_system.md §5.3: Only trust badges use rounded-full (pill). Status indicators use 4px radius.",
    tags: ["Badges", "Trust Badges", "Pill Rule", "WCAG Contrast"],
    render: () => (
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge variant="trust" className="gap-1">
          <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
          <span>FUNDS_HELD (Trust Pill)</span>
        </Badge>
        <Badge variant="trust" className="gap-1">
          <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
          <span>KYC Verified (Trust Pill)</span>
        </Badge>
        <Badge variant="success" className="gap-1">
          <span>Escrow Funded (#088235)</span>
        </Badge>
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3 text-[#ecc94b]" />
          <span>INSPECTION_PERIOD (4px)</span>
        </Badge>
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3 text-[#ecc94b]" />
          <span>Dispute Raised (4px)</span>
        </Badge>
        <Badge variant="destructive" className="gap-1">
          <span>Verification Failed (4px)</span>
        </Badge>
        <Badge variant="transit" className="gap-1">
          <Truck className="h-3 w-3" />
          <span>Item In Transit (4px)</span>
        </Badge>
        <Badge variant="secondary">Condition Mint (4px)</Badge>
      </div>
    ),
  },
  {
    id: "atom-inputs",
    title: "Form Inputs (4px Radius)",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Input fields with strict 4px radius, 16px text on mobile (prevents iOS zoom), and #f56565 validation error state.",
    tags: ["Input", "Forms", "4px Radius", "iOS Safe"],
    render: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        <div className="space-y-1">
          <label className="font-secondary text-xs font-medium text-[#020617]">Standard Input</label>
          <Input placeholder="Enter gadget serial number..." />
        </div>
        <div className="space-y-1">
          <label className="font-secondary text-xs font-medium text-[#c53030]">Validation Error State</label>
          <Input error defaultValue="INVALID-IMEI-CHECK" />
        </div>
      </div>
    ),
  },
  {
    id: "atom-user-avatar",
    title: "UserAvatar with Initials Fallback",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Shadcn Avatar primitive wrapper with algorithmic initials calculation and graceful image error fallback.",
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
    description: "Standardized empty screen with 8px radius card, subtle monochrome icon, Roboto heading, and primary CTA button.",
    tags: ["Empty State", "Call to Action", "8px Radius"],
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
  {
    id: "atom-toast-notifications",
    title: "Toast Notifications (Info, Error, Warning, Success)",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Toasts mapped to semantic colors: #22c55e (success/trust), #ecc94b (warning), #f56565 (error), and #0f172a (info).",
    tags: ["Toasts", "Notifications", "Info", "Error", "Warning", "Success"],
    render: () => {
      const ToastTriggerDemo = () => {
        const { info, error, warning, success } = useToast();
        return (
          <div className="space-y-4 w-full">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => info("Order Tracking Updated", "Tracking number GIG-89421092-NG assigned by seller.")}
                className="text-xs gap-1.5"
              >
                Trigger Info Toast
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => error("Payment Declined", "Your bank declined the card authorization. Please retry or switch to direct bank transfer.")}
                className="text-xs gap-1.5"
              >
                Trigger Error Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => warning("Inspection Expiring Soon", "Only 1 hour 48 minutes remain before funds auto-release to seller.")}
                className="text-xs gap-1.5 border-[#ecc94b]/50 text-[#975a16] hover:bg-[#ecc94b]/10"
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => success("Escrow Funds Secured", "₦850,000 deposited into custodial vault. Seller has been notified to ship.")}
                className="text-xs gap-1.5 bg-[#0f172a] text-white"
              >
                Trigger Success Toast
              </Button>
            </div>

            {/* Static Visual Showcase of All 4 Variants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <ToastItem
                toast={{
                  id: "showcase-info",
                  type: "info",
                  title: "KYC Document Submitted",
                  description: "SmileID verification is processing in background (usually < 2 minutes).",
                }}
              />
              <ToastItem
                toast={{
                  id: "showcase-error",
                  type: "error",
                  title: "Direct S3 Upload Rejected",
                  description: "File size exceeds 50MB maximum limit. Please compress unboxing video.",
                }}
              />
              <ToastItem
                toast={{
                  id: "showcase-warning",
                  type: "warning",
                  title: "48-Hour Inspection Active",
                  description: "Device delivered. Please approve or open dispute before auto-release.",
                }}
              />
              <ToastItem
                toast={{
                  id: "showcase-success",
                  type: "success",
                  title: "Escrow Deposit Completed",
                  description: "Payment verified by Paystack webhook. Order transitioned to funds_held.",
                }}
              />
            </div>
          </div>
        );
      };
      return <ToastTriggerDemo />;
    },
  },
  {
    id: "atom-error-boundary-preview",
    title: "Global Error Boundary & Recovery",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "app/error.tsx boundary view with 8px radius card, 'Try Again' reset trigger, safe error digest reference, and escrow safeguard badge.",
    tags: ["Error Page", "Boundary", "Try Again Recovery", "Safeguard"],
    render: () => (
      <div className="w-full max-w-xl mx-auto rounded-[8px] border border-dashed border-[#e2e8f0] p-2 bg-[#f8fafc]">
        <GlobalError
          error={Object.assign(new Error("Unable to establish handshake with Paystack Escrow Gateway"), {
            digest: "ERR_BH_TRANSACTION_RETRY_948",
          })}
          reset={() => {}}
        />
      </div>
    ),
  },
  {
    id: "atom-not-found-preview",
    title: "404 Not Found Page",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "app/not-found.tsx branded missing page with custody vault safety assurance, 8px card radius, and marketplace browse action.",
    tags: ["404 Page", "Not Found", "Recovery Navigation"],
    render: () => (
      <div className="w-full max-w-xl mx-auto rounded-[8px] border border-dashed border-[#e2e8f0] p-2 bg-[#f8fafc]">
        <NotFound />
      </div>
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
    description: "Search input with 4px radius filter chips (rule 3: non-trust badges NEVER use pill radius). Horizontal scrolling on mobile.",
    tags: ["Search", "Carousel", "Filter Chips", "4px Radius"],
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
    description: "Anatomy: [media] → [title] → [condition · location] → [amount] → [badge slot]. Title in Roboto 16px, Price in Geist Mono 14px, 8px card radius.",
    tags: ["Listing Card", "4:3 Image", "Skeleton Parity", "Currency"],
    render: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <div>
          <span className="font-mono text-[11px] text-[#64748b] uppercase block mb-2">
            Loaded State (Masonry Ready)
          </span>
          <GadgetListingCard listing={MOCK_LISTING} />
        </div>
        <div>
          <span className="font-mono text-[11px] text-[#64748b] uppercase block mb-2">
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
          <span className="font-mono text-[11px] text-[#64748b] uppercase block mb-1">
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
          <span className="font-mono text-[11px] text-[#64748b] uppercase block mb-1">
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
    description: "Macro-view timeline for /escrow/[id]/status. 8px card radius, FUNDS_HELD pulses in trust green (#22c55e), completed checkmarks in solid trust.",
    tags: ["Timeline", "Macro Stepper", "8px Card Radius", "Pulsing State"],
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
    description: "Itemized financial breakdown of Item Price, Tiered Escrow Fee (5% / 2.5% / 1.5%), Shipping, and Total Locked in Geist Mono with WCAG contrast text.",
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
    description: "Alert primitive card featuring 8px card radius, urgent countdown timer, context details, and high-visibility 4px button without bouncy transforms.",
    tags: ["Alert Primitive", "Action Required", "Unblock Transaction", "8px Radius"],
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
    description: "Demonstrates Responsive Isolation: Desktop table row (md:table-row) swaps conditionally with mobile glance-and-approve StackedCard (md:hidden) with 8px radius.",
    tags: ["Admin Table", "StackedCard", "Responsive Swapping"],
    render: () => (
      <div className="w-full space-y-4">
        {/* Desktop View Table */}
        <div className="hidden md:block w-full overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase font-mono text-[10px]">
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
          <span className="font-mono text-[11px] text-[#64748b] uppercase block mb-1.5">
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
    description: "Selectable card grid for Card (Paystack), Bank (Virtual Account), Crypto (USDT/USDC), and Wallet with 8px card radius and primary border highlight.",
    tags: ["Payment Grid", "Paystack Vault", "Radio Select", "8px Radius"],
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
    description: "Desktop drag-and-drop dropzone (8px radius) with mobile camera capture triggers (capture='environment'). Zero bouncy transforms, strict 200ms ease-out transitions.",
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
    description: "Sticky h-16 blur header (1280px max width) featuring guest state and authenticated state with notification bell and avatar dropdown with KYC verification pill.",
    tags: ["Sticky Header", "Backdrop Blur", "Auth Gate"],
    render: () => (
      <div className="w-full rounded-[8px] overflow-hidden border border-[#e2e8f0] shadow-xs">
        <Navbar unreadNotificationsCount={3} />
      </div>
    ),
  },
  {
    id: "overlay-mobile-bottom-nav",
    title: "MobileBottomNav (Fixed App Navigation)",
    category: "Overlays",
    tierLabel: "Tier 1 Foundation",
    description: "Fixed bottom navigation for mobile screens (<768px) with Home, Search, Escrows (active trade counter), and Profile links. Zero bouncy scaling.",
    tags: ["Mobile Bottom Bar", "Webapp Nav", "Touch Friendly"],
    render: () => (
      <div className="w-full max-w-md mx-auto relative h-20 rounded-[8px] overflow-hidden border border-[#e2e8f0] bg-white p-2">
        <span className="font-mono text-[10px] text-[#64748b] uppercase block text-center mb-1">
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
      label: "Tokens & Rules",
      value: "Tokens & Rules",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Tokens & Rules").length,
    },
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
      label: "Forms",
      value: "Forms",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Forms").length,
    },
    {
      label: "Overlays",
      value: "Overlays",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Overlays").length,
    },
  ];

  const filteredComponents = useMemo(() => {
    return COMPONENT_REGISTRY.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#f8fafc] text-[#020617] font-secondary">
          {/* Header Banner */}
          <div className="border-b border-[#e2e8f0] bg-white sticky top-16 z-30 shadow-[0_2px_4px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="font-primary text-sm font-semibold tracking-tight text-[#020617] flex items-center gap-2">
                    <span>Buyer's High Component Sandbox</span>
                    <span className="font-mono text-[10px] bg-[#22c55e]/15 text-[#15803d] border border-[#22c55e]/30 px-2 py-0.5 rounded-full font-bold">
                      4_ui_system.md Compliant
                    </span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex font-mono text-xs text-[#64748b]">
                  {COMPONENT_REGISTRY.length} Documented Components
                </span>
              </div>
            </div>
          </div>

          {/* Two-Column Layout Container */}
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* ==================================================================
                  LEFT COLUMN: FIXED CATEGORY NAVIGATION SIDEBAR
                  ================================================================== */}
              <aside className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-36">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748b]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter registry..."
                    className="h-8 w-full rounded-[4px] border border-[#e2e8f0] bg-white pl-8 pr-3 text-xs text-[#020617] placeholder:text-[#64748b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f172a] transition-colors duration-200 ease-out"
                  />
                </div>

                {/* Navigation Categories */}
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748b] px-2 block mb-2">
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
                          "flex w-full items-center justify-between rounded-[4px] px-2.5 py-2 text-xs font-medium transition-colors duration-200 ease-out text-left select-none cursor-pointer",
                          isActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#020617]"
                        )}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={cn(
                            "font-mono text-[10px] rounded-[4px] px-1.5 py-0.2",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#f1f5f9] text-[#64748b]"
                          )}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Design System Rules Reference Box */}
                <div className="rounded-[4px] border border-[#e2e8f0] bg-white p-3 space-y-2 text-xs text-[#64748b] shadow-[0_2px_4px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-1.5 font-primary font-semibold text-[#020617]">
                    <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                    <span>Enforced Directives</span>
                  </div>
                  <ul className="space-y-1 text-[11px] leading-relaxed list-disc list-inside font-secondary">
                    <li>Strict 4-point spacing base</li>
                    <li>Green #22c55e strictly for trust</li>
                    <li>#15803d text on white (WCAG)</li>
                    <li>Amber #ecc94b for disputes</li>
                    <li>Cards: 8px, Controls: 4px</li>
                    <li>font-mono for numbers & IDs</li>
                    <li>Zero bouncy animations</li>
                  </ul>
                </div>
              </aside>

              {/* ==================================================================
                  RIGHT COLUMN: MAIN COMPONENT DISPLAY VIEWPORT
                  ================================================================== */}
              <main className="flex-1 space-y-8 overflow-y-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e2e8f0]">
                  <div>
                    <h2 className="font-primary text-xl font-medium tracking-tight text-[#020617]">
                      {categories.find((c) => c.value === activeCategory)?.label}
                    </h2>
                    <p className="font-secondary text-xs text-[#64748b] mt-0.5">
                      Displaying {filteredComponents.length} production-ready React components complying with 4_ui_system.md.
                    </p>
                  </div>

                  <span className="font-mono text-xs text-[#64748b]">
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
                        className="w-full rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-200 ease-out hover:border-[#cbd5e1]"
                      >
                        {/* Component Card Header */}
                        <CardHeader className="bg-[#f8fafc] p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="font-primary text-base font-medium text-[#020617]">
                                {item.title}
                              </CardTitle>
                              <Badge
                                variant="secondary"
                                className="font-mono text-[10px] py-0 tracking-wider uppercase"
                              >
                                {item.tierLabel}
                              </Badge>
                            </div>
                            <CardDescription className="font-secondary text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
                              {item.description}
                            </CardDescription>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[10px] bg-white border border-[#e2e8f0] px-2 py-0.5 rounded-[4px] text-[#64748b]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardHeader>

                        {/* Component Live Render Canvas */}
                        <CardContent className="p-6 bg-white flex flex-col items-center justify-center min-h-36">
                          <div className="w-full">{item.render()}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
