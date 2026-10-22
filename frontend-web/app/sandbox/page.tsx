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
  MessageCircle,
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
  Zap,
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

// Marketing & Trust Components (Phase 1)
import { TrustPillarsGrid } from "@/components/marketing/TrustPillarsGrid";
import { PolicyAccordion } from "@/components/marketing/PolicyAccordion";
import { EscrowTimelineExplainer } from "@/components/marketing/EscrowTimelineExplainer";
import { PricingTierCards } from "@/components/marketing/PricingTierCards";
import { EscrowFeeCalculator } from "@/components/marketing/EscrowFeeCalculator";
import { LegalSidebarNav } from "@/components/marketing/LegalSidebarNav";

// Auth & Onboarding Components (Phase 1 & Phase 2)
import { AuthForm } from "@/components/auth/AuthForm";
import { FormHelperText } from "@/components/auth/FormHelperText";
import { CameraCaptureWidget } from "@/components/onboarding/CameraCaptureWidget";
import { DocumentUploadArea } from "@/components/onboarding/DocumentUploadArea";

// Escrow & Checkout Components (Phase 2 & Phase 4)
import { OrderSummaryCard, type EscrowOrderData } from "@/components/escrow/OrderSummaryCard";
import { SecureCheckoutButton } from "@/components/escrow/SecureCheckoutButton";
import { SystemMilestoneBubble } from "@/components/escrow/SystemMilestoneBubble";
import { EvidenceUploadForm } from "@/components/escrow/EvidenceUploadForm";

// Seller Components (Phase 3)
import { SellerStatsOverview } from "@/components/seller/SellerStatsOverview";
import { RecentOrdersTable } from "@/components/seller/RecentOrdersTable";
import { QuickActionBanner } from "@/components/seller/QuickActionBanner";
import { BalanceCard } from "@/components/seller/BalanceCard";
import { BankAccList } from "@/components/seller/BankAccList";
import { TransactionHistoryLedger } from "@/components/seller/TransactionHistoryLedger";

// User & Support Components (Phase 5)
import { ProfileDetailsForm } from "@/components/settings/ProfileDetailsForm";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { KYCStatusBadge } from "@/components/settings/KYCStatusBadge";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";
import { SupportChatWindow } from "@/components/support/SupportChatWindow";
import { FAQQuickLinks } from "@/components/support/FAQQuickLinks";

// Admin Mediation Components (Phase 6)
import { DisputeQueueDataTable } from "@/components/admin/DisputeQueueDataTable";
import { KYCManualApprovalQueue } from "@/components/admin/KYCManualApprovalQueue";
import { EvidenceViewer } from "@/components/admin/EvidenceViewer";
import { ReadonlyChatTranscript } from "@/components/admin/ReadonlyChatTranscript";
import { VerdictActionGroup } from "@/components/admin/VerdictActionGroup";

import { AuthProvider } from "@/components/providers/AuthContext";
import { formatCurrency } from "@/lib/currency";
import type { AdminDisputeData } from "@/types/dispute";
import { cn } from "@/lib/utils";

/**
 * Live Design System and Component Documentation Registry for Buyer's High.
 *
 * Requirements (4_ui_system.md & UI Context Specs 1 through 6):
 * - Two-column layout:
 *   - Left: Fixed navigation sidebar with category filtering.
 *     Categories: "All", "Tokens & Rules", "Tier 1 Atoms", "Tier 2 Marketplace", "Tier 3 Escrow", "Marketing & Trust", "Seller & Wallet", "User & Support", "Admin Mediation", "Forms", "Overlays"
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
  | "Marketing & Trust"
  | "Seller & Wallet"
  | "User & Support"
  | "Admin Mediation"
  | "Forms"
  | "Overlays";

export interface ComponentRegistryItem {
  id: string;
  title: string;
  category: ComponentCategory;
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
  evidenceCount: 5,
  slaRemainingString: "04h 18m",
  isUrgentSla: true,
  createdAt: "3 hours ago",
};

const MOCK_ORDER_DATA: EscrowOrderData = {
  orderId: "BH-ORD-9421",
  gadgetId: "g-001",
  gadgetTitle: "Apple iPhone 14 Pro Max 256GB Deep Purple",
  gadgetImage:
    "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80",
  condition: "mint",
  amount: 850000,
  escrowFee: 21250,
  logisticsFee: 4500,
  totalDeposit: 875750,
  buyerName: "Adeola Fashola",
  sellerName: "Chidi Tech Hub",
  status: "FUNDED",
};

function EvidenceUploadSandboxDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-[8px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] text-center space-y-3 w-full max-w-md mx-auto">
      <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#f56565]/15 text-[#c53030]">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-primary text-sm font-bold text-[#020617]">Dispute Evidence Submission Modal</h4>
        <p className="font-secondary text-xs text-[#64748b] mt-0.5">
          Modal stays closed by default. Tap the button below to test opening, reviewing, and dismissing the arbitration drawer.
        </p>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-[#0f172a] text-white hover:bg-slate-800"
      >
        <AlertTriangle className="h-4 w-4 text-[#ecc94b]" />
        <span>Open Dispute Modal Preview</span>
      </Button>

      <EvidenceUploadForm
        orderId="BH-ORD-9421"
        orderAmount={850000}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmitDispute={() => {
          alert("Evidence submitted successfully. Order placed into DISPUTED state.");
          setIsOpen(false);
        }}
      />
    </div>
  );
}

// ============================================================================
// COMPONENT REGISTRY CATALOG
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
            <li><strong>NEVER</strong> write money values in major units directly if stored in base kobo/cents.</li>
          </ol>
        </div>
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // MARKETING & TRUST (Phase 1)
  // --------------------------------------------------------------------------
  {
    id: "marketing-trust-pillars",
    title: "TrustPillarsGrid (Phase 1 §3)",
    category: "Marketing & Trust",
    tierLabel: "Phase 1: Marketing",
    description: "4 Core pillars of trust: Biometric KYC, Segregated Vaults, Tracked Logistics, and 48-Hour SLA.",
    tags: ["Trust Hub", "Pillars", "Fraud Prevention"],
    render: () => <TrustPillarsGrid />,
  },
  {
    id: "marketing-policy-accordion",
    title: "PolicyAccordion (Phase 1 §3)",
    category: "Marketing & Trust",
    tierLabel: "Phase 1: Marketing",
    description: "Expandable policy questions detailing the 48-hour hardware diagnostic SLA and inspection guarantees.",
    tags: ["Policy", "FAQ", "Accordion", "Legal SLA"],
    render: () => <PolicyAccordion />,
  },
  {
    id: "marketing-escrow-timeline",
    title: "EscrowTimelineExplainer (Phase 1 §3)",
    category: "Marketing & Trust",
    tierLabel: "Phase 1: Marketing",
    description: "Visual 4-step escrow timeline walkthrough for buyers and sellers.",
    tags: ["Escrow Flow", "Timeline", "Milestones"],
    render: () => <EscrowTimelineExplainer />,
  },
  {
    id: "marketing-pricing-tier-cards",
    title: "PricingTierCards (Phase 1 §2)",
    category: "Marketing & Trust",
    tierLabel: "Phase 1: Marketing",
    description: "Transparent fee tiers: 2.5% Premium (>₦500k), 3.5% Standard (₦100k-₦500k), and 5.0% Basic (<₦100k).",
    tags: ["Pricing", "Fee Tiers", "Escrow Calculator"],
    render: () => <PricingTierCards />,
  },
  {
    id: "marketing-fee-calculator",
    title: "EscrowFeeCalculator (Phase 1 §2)",
    category: "Marketing & Trust",
    tierLabel: "Phase 1: Marketing",
    description: "Interactive real-time client arithmetic fee calculator with exact kobo precision and buyer/seller toggles.",
    tags: ["Fee Calculator", "Client Math", "Kobo Precision"],
    render: () => <EscrowFeeCalculator />,
  },
  {
    id: "marketing-legal-sidebar-nav",
    title: "LegalSidebarNav (Phase 1 §3)",
    category: "Marketing & Trust",
    tierLabel: "Phase 1: Marketing",
    description: "Compliance document navigation sidebar linking all 9 statutory escrow agreements and SLA policies.",
    tags: ["Legal Docs", "Compliance", "Sidebar"],
    render: () => (
      <div className="max-w-xs">
        <LegalSidebarNav activeSlug="buyer-protection" />
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // TIER 1 ATOMIC COMPONENTS
  // --------------------------------------------------------------------------
  {
    id: "atom-button-variants",
    title: "Buttons & Control Semantics (4px Radius)",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Button variants conforming to 4_ui_system.md: 4px radius (rounded-[4px]), 44px min-touch target, duration-200 transitions.",
    tags: ["Button", "Controls", "4px Radius"],
    render: () => (
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default">Primary CTA (#0f172a)</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="destructive">Destructive (Dispute)</Button>
        <Button className="bg-[#22c55e] text-[#020617] hover:bg-[#16a34a] font-semibold">Trust Action (Release)</Button>
      </div>
    ),
  },
  {
    id: "atom-badge-variants",
    title: "Badges & Trust Signal Discipline",
    category: "Tier 1 Atoms",
    tierLabel: "Tier 1 Foundation",
    description: "Strict anti-pill discipline: Trust Green is strictly reserved for escrow signals (rounded-full). Non-trust chips use rounded-[4px].",
    tags: ["Badges", "Trust Green", "Zero Pill Slop"],
    render: () => (
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="trust" className="gap-1.5 font-mono text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#22c55e]" />
          <span>Escrow Active (Pill Allowed)</span>
        </Badge>
        <Badge variant="secondary" isPill={false} className="font-mono text-xs">
          Mint Condition (4px)
        </Badge>
        <Badge variant="warning" isPill={false} className="font-mono text-xs">
          Inspection Window (4px)
        </Badge>
        <Badge variant="destructive" isPill={false} className="font-mono text-xs">
          Verification Rejected (4px)
        </Badge>
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // TIER 2 MARKETPLACE COMPONENTS
  // --------------------------------------------------------------------------
  {
    id: "marketplace-listing-card",
    title: "GadgetListingCard (Masonry Grid Ready)",
    category: "Tier 2 Marketplace",
    tierLabel: "Tier 2 Public Feed",
    description: "4:3 media aspect ratio, Roboto title, Geist Mono price, location, condition chips, and verified trust badge slot.",
    tags: ["Listing Card", "Gadget", "Price Kobo", "4:3 Aspect"],
    render: () => (
      <div className="w-full max-w-sm mx-auto">
        <GadgetListingCard listing={MOCK_LISTING} />
      </div>
    ),
  },
  {
    id: "marketplace-skeleton",
    title: "GadgetListingSkeleton & Grid Loader",
    category: "Tier 2 Marketplace",
    tierLabel: "Tier 2 Public Feed",
    description: "Low-contrast skeleton state matching the exact card aspect ratio and metadata structure without layout shifts.",
    tags: ["Skeleton", "Loading State", "Feed Placeholder"],
    render: () => (
      <div className="w-full max-w-sm mx-auto">
        <GadgetListingSkeleton />
      </div>
    ),
  },
  {
    id: "marketplace-search-bar",
    title: "SearchBar with Category Dropdown",
    category: "Tier 2 Marketplace",
    tierLabel: "Tier 2 Public Feed",
    description: "Global search input with auto-filtering and category selectors.",
    tags: ["Search", "Filters", "Input Control"],
    render: () => <SearchBar onQueryChange={() => {}} />,
  },

  // --------------------------------------------------------------------------
  // TIER 3 ESCROW COMPONENTS
  // --------------------------------------------------------------------------
  {
    id: "escrow-order-summary-card",
    title: "OrderSummaryCard (Phase 2 & 4)",
    category: "Tier 3 Escrow",
    tierLabel: "Phase 4: Escrow",
    description: "Collapsible order details showing gadget thumbnail, serial/condition, segregated vault balance, and fee breakdown.",
    tags: ["Order Summary", "Escrow Vault", "Fee Breakdown"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <OrderSummaryCard order={MOCK_ORDER_DATA} />
      </div>
    ),
  },
  {
    id: "escrow-secure-checkout-btn",
    title: "SecureCheckoutButton (Phase 2 §2)",
    category: "Tier 3 Escrow",
    tierLabel: "Phase 2: Payment",
    description: "Locked escrow checkout trigger with Paystack/Flutterwave gateway status and SSL encryption guarantee.",
    tags: ["Checkout", "Payment CTA", "Vault Lock"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <SecureCheckoutButton amount={875750} />
      </div>
    ),
  },
  {
    id: "escrow-stepper",
    title: "EscrowTrackerStepper (Horizontal Ledger)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Escrow Ledger",
    description: "5-stage progression: Agreement Created, Funds Locked, Courier In-Transit, 48H Diagnostic Window, Funds Settled.",
    tags: ["Stepper", "Escrow Milestones", "Inspection SLA"],
    render: () => <EscrowTrackerStepper currentState="funds_held" />,
  },
  {
    id: "escrow-status-bar",
    title: "EscrowStatusBar (Sticky Room Top Bar)",
    category: "Tier 3 Escrow",
    tierLabel: "Tier 3 Escrow Ledger",
    description: "Sticky contextual banner showing Order ID in Geist Mono, 48-Hour Inspection Countdown timer, and quick action.",
    tags: ["Status Bar", "Countdown", "Inspection Window"],
    render: () => (
      <EscrowStatusBar
        orderShortId="BH-ORD-9421"
        state="INSPECTION_PERIOD"
        initialSecondsRemaining={6840}
      />
    ),
  },
  {
    id: "escrow-system-milestone",
    title: "SystemMilestoneBubble (Phase 4 §2)",
    category: "Tier 3 Escrow",
    tierLabel: "Phase 4: Escrow",
    description: "Permanent, immutable system-injected milestone event bubbles for the P2P chat ledger.",
    tags: ["Milestone", "P2P Ledger", "Immutable Event"],
    render: () => (
      <div className="w-full max-w-md mx-auto space-y-2">
        <SystemMilestoneBubble
          milestone={{
            id: "ms-1",
            type: "FUNDED",
            title: "Escrow Funded",
            description: "Buyer locked ₦850,000 in segregated escrow account. Safe to dispatch package.",
            timestamp: "10:14 AM",
          }}
        />
        <SystemMilestoneBubble
          milestone={{
            id: "ms-2",
            type: "DELIVERED",
            title: "Device Delivered",
            description: "Courier delivered device. 48-Hour Hardware Diagnostic SLA has commenced.",
            timestamp: "02:30 PM",
          }}
        />
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // SELLER & WALLET (Phase 3)
  // --------------------------------------------------------------------------
  {
    id: "seller-stats-overview",
    title: "SellerStatsOverview (Phase 3 §1)",
    category: "Seller & Wallet",
    tierLabel: "Phase 3: Seller",
    description: "Metric cards: Active Listings, Settled Sales Volume, and Locked Escrow Balance in Geist Mono.",
    tags: ["Seller Metrics", "Volume", "Escrow Balance"],
    render: () => <SellerStatsOverview />,
  },
  {
    id: "seller-recent-orders-table",
    title: "RecentOrdersTable (Phase 3 §1)",
    category: "Seller & Wallet",
    tierLabel: "Phase 3: Seller",
    description: "Live merchant orders table with order IDs, buyers, amounts in kobo, and status indicators.",
    tags: ["Orders Table", "Merchant Console", "Order Status"],
    render: () => <RecentOrdersTable />,
  },
  {
    id: "seller-quick-action-banner",
    title: "QuickActionBanner (Phase 3 §1)",
    category: "Seller & Wallet",
    tierLabel: "Phase 3: Seller",
    description: "Verified seller callout to list new gadgets under verified escrow protections.",
    tags: ["Sell CTA", "Quick Action", "Listing"],
    render: () => <QuickActionBanner />,
  },
  {
    id: "seller-balance-card",
    title: "BalanceCard (Phase 3 §2)",
    category: "Seller & Wallet",
    tierLabel: "Phase 3: Seller",
    description: "Split ledger displaying Available Withdrawable Balance vs. Pending Escrow Balance with instant NIP payout button.",
    tags: ["Wallet Balance", "Payouts", "NIP Settlement"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <BalanceCard onWithdrawClick={() => {}} />
      </div>
    ),
  },
  {
    id: "seller-bank-acc-list",
    title: "BankAccList (Phase 3 §2)",
    category: "Seller & Wallet",
    tierLabel: "Phase 3: Seller",
    description: "Saved NIP settlement bank accounts with primary badge and add-account trigger.",
    tags: ["Bank Accounts", "NIP Transfer", "Settlement"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <BankAccList />
      </div>
    ),
  },
  {
    id: "seller-transaction-ledger",
    title: "TransactionHistoryLedger (Phase 3 §2)",
    category: "Seller & Wallet",
    tierLabel: "Phase 3: Seller",
    description: "Audit ledger of payouts, escrow credits, and gateway transaction references.",
    tags: ["Ledger", "Transaction History", "Audit Trail"],
    render: () => <TransactionHistoryLedger />,
  },

  // --------------------------------------------------------------------------
  // USER & SUPPORT (Phase 5)
  // --------------------------------------------------------------------------
  {
    id: "user-profile-details",
    title: "ProfileDetailsForm (Phase 5 §1)",
    category: "User & Support",
    tierLabel: "Phase 5: User",
    description: "Merchant contact details, verified phone number, and location management.",
    tags: ["Profile", "Settings", "Account Details"],
    render: () => (
      <div className="w-full max-w-lg mx-auto">
        <ProfileDetailsForm />
      </div>
    ),
  },
  {
    id: "user-security-settings",
    title: "SecuritySettings (Phase 5 §1)",
    category: "User & Support",
    tierLabel: "Phase 5: User",
    description: "Two-factor authentication (2FA) toggle, password updates, and session termination.",
    tags: ["Security", "2FA", "Authentication"],
    render: () => (
      <div className="w-full max-w-lg mx-auto">
        <SecuritySettings />
      </div>
    ),
  },
  {
    id: "user-kyc-status-badge",
    title: "KYCStatusBadge (Phase 5 §1)",
    category: "User & Support",
    tierLabel: "Phase 5: User",
    description: "SmileID verification tier badge with compliance status and upgrade triggers.",
    tags: ["KYC Badge", "SmileID", "Compliance Status"],
    render: () => (
      <div className="flex flex-wrap items-center gap-4">
        <KYCStatusBadge status="verified" ninLast4="8492" verifiedAt="Oct 2026" />
        <KYCStatusBadge status="pending" ninLast4="1029" />
        <KYCStatusBadge status="unverified" />
      </div>
    ),
  },
  {
    id: "user-notification-feed",
    title: "NotificationFeed (Phase 5 §2)",
    category: "User & Support",
    tierLabel: "Phase 5: User",
    description: "Live escrow alerts feed: payment confirmations, courier transit milestones, and 48-hour inspection countdown alerts.",
    tags: ["Notifications", "Push Alerts", "Escrow Updates"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <NotificationFeed />
      </div>
    ),
  },
  {
    id: "user-faq-quick-links",
    title: "FAQQuickLinks (Phase 5 §3)",
    category: "User & Support",
    tierLabel: "Phase 5: Support",
    description: "Touch-friendly instant suggestion pills for prompt dispute and escrow queries.",
    tags: ["FAQ", "Suggestions", "Support Assistance"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <FAQQuickLinks onSelect={() => {}} />
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // ADMIN MEDIATION (Phase 6)
  // --------------------------------------------------------------------------
  {
    id: "admin-dispute-queue-table",
    title: "DisputeQueueDataTable (Phase 6 §2)",
    category: "Admin Mediation",
    tierLabel: "Phase 6: Admin",
    description: "Arbitration queue automatically sorted by SLA urgency and locked vault amount.",
    tags: ["Dispute Queue", "SLA Sorting", "Admin Triage"],
    render: () => <DisputeQueueDataTable onSelectCase={() => {}} />,
  },
  {
    id: "admin-kyc-approval-queue",
    title: "KYCManualApprovalQueue (Phase 6 §2)",
    category: "Admin Mediation",
    tierLabel: "Phase 6: Admin",
    description: "Manual biometric KYC document verification queue with approve/reject actions.",
    tags: ["KYC Triage", "Manual Review", "Biometric Audit"],
    render: () => <KYCManualApprovalQueue />,
  },
  {
    id: "admin-evidence-viewer",
    title: "EvidenceViewer (Phase 6 §1)",
    category: "Admin Mediation",
    tierLabel: "Phase 6: Admin",
    description: "Split-pane diagnostic evidence viewer: unboxing video, 3uTools diagnostic logs, and serial receipt photos.",
    tags: ["Evidence", "Diagnostic Viewer", "Arbitration"],
    render: () => <EvidenceViewer />,
  },
  {
    id: "admin-readonly-chat",
    title: "ReadonlyChatTranscript (Phase 6 §1)",
    category: "Admin Mediation",
    tierLabel: "Phase 6: Admin",
    description: "Immutable, audit-logged P2P chat transcript with timestamps and masked contact info warnings.",
    tags: ["Chat Transcript", "Immutable Ledger", "Audit Trail"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <ReadonlyChatTranscript />
      </div>
    ),
  },
  {
    id: "admin-verdict-action-group",
    title: "VerdictActionGroup (Phase 6 §1)",
    category: "Admin Mediation",
    tierLabel: "Phase 6: Admin",
    description: "Binding arbitration rulings: Rule in favor of Buyer (Refund), Seller (Release), or 50/50 Split.",
    tags: ["Ruling", "Arbitration Decision", "Payout Instruction"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <VerdictActionGroup orderAmount={850000} caseId="dsp-101" onExecuteVerdict={() => {}} />
      </div>
    ),
  },

  // --------------------------------------------------------------------------
  // FORMS & ONBOARDING (Phase 1 & Phase 2)
  // --------------------------------------------------------------------------
  {
    id: "form-auth-form",
    title: "AuthForm (Phase 1 §4)",
    category: "Forms",
    tierLabel: "Phase 1: Auth",
    description: "Login and registration form with password visibility toggle, 2FA prompt, and validation states.",
    tags: ["Auth Form", "Login", "Register", "Inputs"],
    render: () => (
      <div className="w-full max-w-sm mx-auto">
        <AuthForm mode="login" />
      </div>
    ),
  },
  {
    id: "form-helper-text",
    title: "FormHelperText (Phase 1 §4)",
    category: "Forms",
    tierLabel: "Phase 1: Auth",
    description: "Contextual input validation helper text with icons for error, success, warning, and default states.",
    tags: ["Helper Text", "Validation", "Field Status"],
    render: () => (
      <div className="space-y-2 max-w-sm mx-auto">
        <FormHelperText variant="default">Must be at least 8 characters</FormHelperText>
        <FormHelperText variant="error">Password must contain at least one numeral</FormHelperText>
        <FormHelperText variant="success">Government ID format verified</FormHelperText>
        <FormHelperText variant="warning">Phone number requires international +234 format</FormHelperText>
      </div>
    ),
  },
  {
    id: "form-camera-capture",
    title: "CameraCaptureWidget (Phase 1 §5)",
    category: "Forms",
    tierLabel: "Phase 2: KYC",
    description: "SmileID biometric liveness detection and live selfie capture interface with alignment oval.",
    tags: ["Camera", "Biometrics", "Liveness Detection", "Selfie"],
    render: () => (
      <div className="w-full max-w-sm mx-auto">
        <CameraCaptureWidget onCaptureComplete={() => {}} />
      </div>
    ),
  },
  {
    id: "form-document-upload",
    title: "DocumentUploadArea (Phase 1 §5)",
    category: "Forms",
    tierLabel: "Phase 2: KYC",
    description: "NIN/Voters Card/Passport upload area with drag-and-drop file preview and upload progress indicator.",
    tags: ["KYC Upload", "Government ID", "File Drop"],
    render: () => (
      <div className="w-full max-w-md mx-auto">
        <DocumentUploadArea onComplete={() => {}} />
      </div>
    ),
  },
  {
    id: "form-evidence-upload",
    title: "EvidenceUploadForm (Phase 4 §3)",
    category: "Forms",
    tierLabel: "Phase 4: Dispute",
    description: "Dispute evidence submission form: select defect type, upload diagnostic video, and submit for arbitration.",
    tags: ["Dispute Form", "Evidence Upload", "Report Issue"],
    render: () => <EvidenceUploadSandboxDemo />,
  },

  // --------------------------------------------------------------------------
  // OVERLAYS & SHELL
  // --------------------------------------------------------------------------
  {
    id: "overlay-navbar",
    title: "Navbar (Authenticated & Guest Header)",
    category: "Overlays",
    tierLabel: "Tier 1 Foundation",
    description: "Exact 64px (h-16) header with brand mark, marketplace search, notification dropdown, and KYC status pill.",
    tags: ["Navbar", "Header", "Navigation Bar"],
    render: () => (
      <div className="w-full">
        <Navbar unreadNotificationsCount={3} />
      </div>
    ),
  },
  {
    id: "overlay-mobile-bottom-nav",
    title: "MobileBottomNav (Fixed App Navigation)",
    category: "Overlays",
    tierLabel: "Tier 1 Foundation",
    description: "Reconciled bottom navigation for mobile screens (<768px): Market, Trust Hub, Escrow, Seller Hub, and Profile.",
    tags: ["Mobile Bottom Bar", "Webapp Nav", "Touch Friendly", "44px Targets"],
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
      label: "Marketing & Trust",
      value: "Marketing & Trust",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Marketing & Trust").length,
    },
    {
      label: "Seller & Wallet",
      value: "Seller & Wallet",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Seller & Wallet").length,
    },
    {
      label: "User & Support",
      value: "User & Support",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "User & Support").length,
    },
    {
      label: "Admin Mediation",
      value: "Admin Mediation",
      count: COMPONENT_REGISTRY.filter((c) => c.category === "Admin Mediation").length,
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
          <div className="border-b border-[#e2e8f0] bg-white sticky top-0 z-30 shadow-[0_2px_4px_rgba(15,23,42,0.06)]">
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
              <aside className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-20">
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
