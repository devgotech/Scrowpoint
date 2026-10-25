
"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Grid,
  Heart,
  HelpCircle,
  Home,
  Laptop,
  Layers,
  Lock,
  Maximize2,
  MessageSquare,
  Monitor,
  Package,
  RotateCcw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Truck,
  User,
  UserCheck,
  Wallet,
  Zap,
} from "lucide-react";

// Phase 1 Screens
import LandingPage from "../(marketing)/page";
import PricingPage from "../(marketing)/pricing/page";
import LegalDocumentPage from "../(marketing)/legal/[slug]/page";
import TrustAndSafetyPage from "../(marketing)/trust-and-safety/page";
import MarketplacePage from "../(public)/marketplace/page";
import GadgetDetailPage from "../(public)/gadget/[id]/page";

// Phase 2 Screens
import LoginPage from "../(auth)/login/page";
import RegisterPage from "../(auth)/register/page";
import VerifyIdentityPage from "../(onboarding)/verify-identity/page";
import CheckoutPage from "../(protected)/checkout/[order_id]/page";

// Phase 3 Screens
import SellerDashboardPage from "../(protected)/seller/dashboard/page";
import SellerWalletPage from "../(protected)/seller/wallet/page";

// Phase 4 Screens
import EscrowRoomPage from "../(protected)/escrow/[order_id]/page";

// Phase 5 Screens
import SettingsProfilePage from "../(protected)/settings/profile/page";
import NotificationsPage from "../(protected)/notifications/page";

// Phase 6 Screens
import AdminDashboardPage from "../(admin)/dashboard/page";
import ArbitrationRoomPage from "../(admin)/disputes/[case_id]/page";

// Design System Sandbox
import SandboxPage from "../sandbox/page";

const CheckoutScreen = CheckoutPage as React.ComponentType<any>;

// Shared Shell Components
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LiveChatWidget } from "@/components/support/LiveChatWidget";
import { AuthProvider } from "@/components/providers/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { cn } from "@/lib/utils";

function navigate(path: string) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("sp_route_change"));
}

export type ScreenRoute =
  | "phase1_landing"
  | "phase1_marketplace"
  | "phase1_gadget_detail"
  | "phase1_trust_and_safety"
  | "phase1_pricing"
  | "phase1_legal"
  | "phase2_login"
  | "phase2_register"
  | "phase2_kyc"
  | "phase2_checkout"
  | "phase3_seller_dashboard"
  | "phase3_seller_wallet"
  | "phase4_escrow_room"
  | "phase5_settings_profile"
  | "phase5_notifications"
  | "phase6_admin_dashboard"
  | "phase6_admin_dispute"
  | "design_sandbox";

export type ViewportMode = "desktop" | "tablet" | "mobile";

export interface ScreenConfig {
  id: ScreenRoute;
  phase: string;
  label: string;
  routePath: string;
  urlPath: string;
  badge?: string;
}

export interface CheckoutScreenProps {
  orderId: string;
  onPaymentSuccess: (ordId: string) => void;
  onBackToGadget: () => void;
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<ScreenRoute>("phase1_landing");
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [selectedGadgetId, setSelectedGadgetId] = useState<string>("g-001");
  const [selectedLegalSlug, setSelectedLegalSlug] = useState<string>("buyer-protection");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("SP-ORD-9421");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("dsp-101");

  // Synchronize route with URL pathname
  useEffect(() => {
    function parseRouteFromUrl() {
      if (typeof window === "undefined") return;
      const pathname = window.location.pathname || "/";

      if (pathname === "/" || pathname === "/landing") {
        setActiveRoute("phase1_landing");
      } else if (pathname === "/marketplace") {
        setActiveRoute("phase1_marketplace");
      } else if (pathname.startsWith("/gadget/")) {
        const id = pathname.replace("/gadget/", "");
        if (id) setSelectedGadgetId(id);
        setActiveRoute("phase1_gadget_detail");
      } else if (pathname === "/trust-and-safety" || pathname.startsWith("/trust")) {
        setActiveRoute("phase1_trust_and_safety");
      } else if (pathname === "/pricing") {
        setActiveRoute("phase1_pricing");
      } else if (pathname.startsWith("/legal")) {
        const parts = pathname.split("/");
        if (parts[2]) setSelectedLegalSlug(parts[2]);
        setActiveRoute("phase1_legal");
      } else if (pathname === "/login" || pathname === "/auth/login") {
        setActiveRoute("phase2_login");
      } else if (pathname === "/register" || pathname === "/signup" || pathname === "/auth/register") {
        setActiveRoute("phase2_register");
      } else if (pathname.startsWith("/verify-identity") || pathname.startsWith("/kyc")) {
        setActiveRoute("phase2_kyc");
      } else if (pathname.startsWith("/checkout")) {
        const parts = pathname.split("/");
        if (parts[2]) setSelectedOrderId(parts[2]);
        setActiveRoute("phase2_checkout");
      } else if (pathname === "/seller/dashboard" || pathname === "/dashboard") {
        setActiveRoute("phase3_seller_dashboard");
      } else if (pathname === "/seller/wallet" || pathname === "/dashboard/wallet") {
        setActiveRoute("phase3_seller_wallet");
      } else if (pathname.startsWith("/escrow")) {
        const parts = pathname.split("/");
        if (parts[2]) setSelectedOrderId(parts[2]);
        setActiveRoute("phase4_escrow_room");
      } else if (pathname.startsWith("/settings")) {
        setActiveRoute("phase5_settings_profile");
      } else if (pathname.startsWith("/notifications")) {
        setActiveRoute("phase5_notifications");
      } else if (pathname.startsWith("/admin/disputes")) {
        const parts = pathname.split("/");
        if (parts[3]) setSelectedCaseId(parts[3]);
        setActiveRoute("phase6_admin_dispute");
      } else if (pathname.startsWith("/admin")) {
        setActiveRoute("phase6_admin_dashboard");
      } else if (pathname === "/sandbox") {
        setActiveRoute("design_sandbox");
      }
    }

    parseRouteFromUrl();

    const handleRouteChange = () => {
      parseRouteFromUrl();
    };

    window.addEventListener("sp_route_change", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("sp_route_change", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Screen configuration for the Master Architecture Switcher
  const screensConfig: {
    id: ScreenRoute;
    phase: string;
    label: string;
    routePath: string;
    urlPath: string;
    badge?: string;
  }[] = [
    {
      id: "phase1_landing",
      phase: "Phase 1: Marketing",
      label: "1. Landing Page",
      routePath: "app/(marketing)/page.tsx",
      urlPath: "/",
    },
    {
      id: "phase1_marketplace",
      phase: "Phase 1: Public",
      label: "2. Marketplace",
      routePath: "app/(public)/marketplace/page.tsx",
      urlPath: "/marketplace",
    },
    {
      id: "phase1_gadget_detail",
      phase: "Phase 1: Public",
      label: "2b. Gadget Detail",
      routePath: "app/(public)/gadget/[id]/page.tsx",
      urlPath: `/gadget/${selectedGadgetId}`,
    },
    {
      id: "phase1_trust_and_safety",
      phase: "Phase 1: Marketing",
      label: "3. Trust & Safety",
      routePath: "app/(marketing)/trust-and-safety/page.tsx",
      urlPath: "/trust-and-safety",
      badge: "SLA 48H",
    },
    {
      id: "phase1_pricing",
      phase: "Phase 1: Marketing",
      label: "4. Fee Calculator",
      routePath: "app/(marketing)/pricing/page.tsx",
      urlPath: "/pricing",
    },
    {
      id: "phase1_legal",
      phase: "Phase 1: Marketing",
      label: "5. Legal Docs",
      routePath: "app/(marketing)/legal/[slug]/page.tsx",
      urlPath: `/legal/${selectedLegalSlug}`,
    },
    {
      id: "phase2_login",
      phase: "Phase 2: Auth",
      label: "6. Login",
      routePath: "app/(auth)/login/page.tsx",
      urlPath: "/login",
    },
    {
      id: "phase2_register",
      phase: "Phase 2: Auth",
      label: "6b. Register",
      routePath: "app/(auth)/register/page.tsx",
      urlPath: "/register",
    },
    {
      id: "phase2_kyc",
      phase: "Phase 2: Onboarding",
      label: "7. SmileID KYC",
      routePath: "app/(onboarding)/verify-identity/page.tsx",
      urlPath: "/verify-identity",
      badge: "Biometric",
    },
    {
      id: "phase2_checkout",
      phase: "Phase 2: Payment",
      label: "8. Escrow Checkout",
      routePath: "app/(protected)/checkout/[order_id]/page.tsx",
      urlPath: `/checkout/${selectedOrderId}`,
    },
    {
      id: "phase3_seller_dashboard",
      phase: "Phase 3: Seller",
      label: "9. Seller Dashboard",
      routePath: "app/(protected)/seller/dashboard/page.tsx",
      urlPath: "/seller/dashboard",
    },
    {
      id: "phase3_seller_wallet",
      phase: "Phase 3: Seller",
      label: "10. Wallet & Payouts",
      routePath: "app/(protected)/seller/wallet/page.tsx",
      urlPath: "/seller/wallet",
    },
    {
      id: "phase4_escrow_room",
      phase: "Phase 4: Escrow",
      label: "11. Escrow Room",
      routePath: "app/(protected)/escrow/[order_id]/page.tsx",
      urlPath: `/escrow/${selectedOrderId}`,
      badge: "Flagship",
    },
    {
      id: "phase5_settings_profile",
      phase: "Phase 5: User",
      label: "12. Profile & Security",
      routePath: "app/(protected)/settings/profile/page.tsx",
      urlPath: "/settings/profile",
    },
    {
      id: "phase5_notifications",
      phase: "Phase 5: User",
      label: "13. Notifications",
      routePath: "app/(protected)/notifications/page.tsx",
      urlPath: "/notifications",
    },
    {
      id: "phase6_admin_dashboard",
      phase: "Phase 6: Admin",
      label: "14. Admin Triage",
      routePath: "app/(admin)/dashboard/page.tsx",
      urlPath: "/admin/dashboard",
    },
    {
      id: "phase6_admin_dispute",
      phase: "Phase 6: Admin",
      label: "15. Arbitration Room",
      routePath: "app/(admin)/disputes/[case_id]/page.tsx",
      urlPath: `/admin/disputes/${selectedCaseId}`,
      badge: "Mediation",
    },
    {
      id: "design_sandbox",
      phase: "System",
      label: "Design Registry",
      routePath: "app/sandbox/page.tsx",
      urlPath: "/sandbox",
    },
  ];

  const handleSelectScreen = (screen: (typeof screensConfig)[number]) => {
    setActiveRoute(screen.id);
    navigate(screen.urlPath);
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-secondary flex flex-col relative">
          {/* =================================================================
              TOP MASTER SCREEN FLOW & RESPONSIVE ARCHITECTURE CONTROLLER
              ================================================================= */}
          <header className="border-b border-slate-800 bg-[#020617] sticky top-0 z-50 text-white shadow-md">
            <div className="max-w-[1440px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
              {/* Brand & Document Anchor */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#22c55e] text-[#020617] font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-primary text-xs font-bold tracking-tight flex items-center gap-1.5">
                    <span>Scrowpoint</span>
                    <span className="font-mono text-[9px] bg-slate-800 text-[#22c55e] px-1.5 py-0.2 rounded-[2px] font-semibold border border-slate-700">
                      5_SCREEN_FLOWS
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    Full Responsive Screen Flow Architecture
                  </div>
                </div>
              </div>

              {/* Responsive Device Viewport Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-[4px]">
                <button
                  type="button"
                  onClick={() => setViewportMode("desktop")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-xs font-mono transition-colors",
                    viewportMode === "desktop"
                      ? "bg-slate-700 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  )}
                  title="Full Desktop View (Fluid 100%)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewportMode("tablet")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-xs font-mono transition-colors",
                    viewportMode === "tablet"
                      ? "bg-slate-700 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  )}
                  title="Tablet View (768px Width Breakpoint)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tablet 768px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewportMode("mobile")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-xs font-mono transition-colors",
                    viewportMode === "mobile"
                      ? "bg-[#22c55e] text-[#020617] font-bold"
                      : "text-slate-400 hover:text-white"
                  )}
                  title="Mobile View (390px iPhone Viewport)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile 390px</span>
                </button>
              </div>

              {/* Active Route & URL Bar */}
              <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500">Route:</span>
                <span className="text-[#22c55e] bg-slate-900 px-2 py-0.5 rounded-[2px] border border-slate-800 font-semibold truncate max-w-[260px]">
                  {screensConfig.find((s) => s.id === activeRoute)?.routePath}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-[2px] border border-slate-700">
                  {screensConfig.find((s) => s.id === activeRoute)?.urlPath}
                </span>
              </div>
            </div>

            {/* Horizontal Screen Selector Strip (Scrollable) */}
            <div className="border-t border-slate-800/80 bg-slate-950/70 overflow-x-auto scrollbar-thin">
              <div className="max-w-[1440px] mx-auto px-4 flex items-center gap-1 py-1.5">
                {screensConfig.map((sc) => {
                  const isActive = activeRoute === sc.id;

                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScreen(sc)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-mono whitespace-nowrap transition-all duration-150 shrink-0",
                        isActive
                          ? "bg-white text-[#020617] font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                      )}
                    >
                      <span>{sc.label}</span>
                      {sc.badge && (
                        <span
                          className={cn(
                            "text-[9px] px-1 py-0.2 rounded-[2px] font-semibold",
                            isActive
                              ? "bg-[#22c55e] text-[#020617]"
                              : "bg-slate-800 text-[#22c55e]"
                          )}
                        >
                          {sc.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* =================================================================
              MAIN VIEWPORT CANVAS
              ================================================================= */}
          <main className="flex-1 w-full bg-[#e2e8f0]/40 flex justify-center items-start py-4 sm:py-6 overflow-x-auto">
            <div
              className={cn(
                "transition-all duration-300 ease-out bg-[#f8fafc] text-[#020617] shadow-xl overflow-hidden",
                viewportMode === "desktop" && "w-full min-h-[calc(100vh-110px)]",
                viewportMode === "tablet" &&
                  "w-[768px] min-h-[900px] rounded-[16px] border-8 border-slate-800 shadow-2xl my-4",
                viewportMode === "mobile" &&
                  "w-[390px] min-h-[820px] rounded-[36px] border-[10px] border-slate-900 shadow-2xl my-4 flex flex-col relative"
              )}
            >
              {/* Simulated Mobile Status Bar */}
              {viewportMode === "mobile" && (
                <div className="bg-[#020617] text-white px-6 py-2.5 flex items-center justify-between text-[11px] font-mono shrink-0 select-none sticky top-0 z-50">
                  <span>9:41</span>
                  <div className="h-4 w-24 bg-black rounded-full" />
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <div className="h-2.5 w-5 border border-white rounded-[2px] p-0.5 flex items-center">
                      <div className="h-full w-full bg-[#22c55e] rounded-[1px]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Inner Screen Content Rendering */}
              <div className="flex-1 w-full flex flex-col overflow-y-auto relative pb-16 md:pb-0">
                {/* 1. Landing Page Screen */}
                {activeRoute === "phase1_landing" && (
                  <LandingPage
                    onNavigateToPricing={() => {
                      setActiveRoute("phase1_pricing");
                      navigate("/pricing");
                    }}
                    onNavigateToMarketplace={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigateToEscrow={() => {
                      setActiveRoute("phase4_escrow_room");
                      navigate(`/escrow/${selectedOrderId}`);
                    }}
                  />
                )}

                {/* 2. Public Marketplace Catalog */}
                {activeRoute === "phase1_marketplace" && (
                  <MarketplacePage
                    onSelectGadget={(id) => {
                      setSelectedGadgetId(id);
                      setActiveRoute("phase1_gadget_detail");
                      navigate(`/gadget/${id}`);
                    }}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_landing");
                      navigate("/");
                    }}
                  />
                )}

                {/* 2b. Gadget Detail Page */}
                {activeRoute === "phase1_gadget_detail" && (
                  <GadgetDetailPage
                    gadgetId={selectedGadgetId}
                    onBackToMarketplace={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onLockEscrow={() => {
                      setActiveRoute("phase2_checkout");
                      navigate(`/checkout/${selectedOrderId}`);
                    }}
                  />
                )}

                {/* 3. Trust & Safety Hub */}
                {activeRoute === "phase1_trust_and_safety" && (
                  <TrustAndSafetyPage
                    onNavigateHome={() => {
                      setActiveRoute("phase1_landing");
                      navigate("/");
                    }}
                    onNavigateMarketplace={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigatePricing={() => {
                      setActiveRoute("phase1_pricing");
                      navigate("/pricing");
                    }}
                  />
                )}

                {/* 4. Pricing & Fee Calculator Screen */}
                {activeRoute === "phase1_pricing" && (
                  <PricingPage
                    onBackToHome={() => {
                      setActiveRoute("phase1_landing");
                      navigate("/");
                    }}
                    onExploreMarketplace={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onInitiateEscrow={() => {
                      setActiveRoute("phase4_escrow_room");
                      navigate(`/escrow/${selectedOrderId}`);
                    }}
                  />
                )}

                {/* 5. Legal & Trust Shield Documents */}
                {activeRoute === "phase1_legal" && (
                  <LegalDocumentPage
                    slug={selectedLegalSlug}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_landing");
                      navigate("/");
                    }}
                  />
                )}

                {/* 6. Auth Login Screen */}
                {activeRoute === "phase2_login" && (
                  <LoginPage />
                )}

                {/* 6b. Auth Register Screen */}
                {activeRoute === "phase2_register" && (
                  <RegisterPage
                    onSuccess={() => {
                      setActiveRoute("phase2_kyc");
                      navigate("/verify-identity");
                    }}
                    onNavigateLogin={() => {
                      setActiveRoute("phase2_login");
                      navigate("/login");
                    }}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_landing");
                      navigate("/");
                    }}
                  />
                )}

                {/* 7. SmileID KYC Identity Verification Screen */}
                {activeRoute === "phase2_kyc" && (
                  <VerifyIdentityPage
                    onCompleteKyc={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_landing");
                      navigate("/");
                    }}
                  />
                )}

                {/* 8. Escrow Payment & Checkout */}
                {activeRoute === "phase2_checkout" && (
                  <CheckoutScreen
                    key={selectedOrderId}
                    orderId={selectedOrderId}
                    onPaymentSuccess={(ordId: string) => {
                      setSelectedOrderId(ordId);
                      setActiveRoute("phase4_escrow_room");
                      navigate(`/escrow/${ordId}`);
                    }}
                    onBackToGadget={() => {
                      setActiveRoute("phase1_gadget_detail");
                      navigate(`/gadget/${selectedGadgetId}`);
                    }}
                  />
                )}

                {/* 9. Seller Dashboard */}
                {activeRoute === "phase3_seller_dashboard" && (
                  <SellerDashboardPage
                    onNavigateHome={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigateEscrowRoom={(orderNum) => {
                      setSelectedOrderId(orderNum);
                      setActiveRoute("phase4_escrow_room");
                      navigate(`/escrow/${orderNum}`);
                    }}
                    onNavigateWallet={() => {
                      setActiveRoute("phase3_seller_wallet");
                      navigate("/seller/wallet");
                    }}
                  />
                )}

                {/* 10. Wallet & Payouts */}
                {activeRoute === "phase3_seller_wallet" && (
                  <SellerWalletPage
                    onBackToDashboard={() => {
                      setActiveRoute("phase3_seller_dashboard");
                      navigate("/seller/dashboard");
                    }}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                  />
                )}

                {/* 11. Active Escrow Room & P2P Ledger Screen */}
                {activeRoute === "phase4_escrow_room" && (
                  <EscrowRoomPage
                    orderId={selectedOrderId}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigateDisputes={() => {
                      setActiveRoute("phase6_admin_dashboard");
                      navigate("/admin/dashboard");
                    }}
                  />
                )}

                {/* 12. Dashboard Settings & Profile */}
                {activeRoute === "phase5_settings_profile" && (
                  <SettingsProfilePage
                    onNavigateHome={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigateVerifyIdentity={() => {
                      setActiveRoute("phase2_kyc");
                      navigate("/verify-identity");
                    }}
                  />
                )}

                {/* 13. Global Notifications Center */}
                {activeRoute === "phase5_notifications" && (
                  <NotificationsPage
                    onNavigateHome={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                    onNavigateOrder={(ordNum) => {
                      setSelectedOrderId(ordNum);
                      setActiveRoute("phase4_escrow_room");
                      navigate(`/escrow/${ordNum}`);
                    }}
                  />
                )}

                {/* 14. Dispute Triage & Pending KYC (Admin Dashboard) */}
                {activeRoute === "phase6_admin_dashboard" && (
                  <AdminDashboardPage
                    onSelectCase={(caseId) => {
                      setSelectedCaseId(caseId);
                      setActiveRoute("phase6_admin_dispute");
                      navigate(`/admin/disputes/${caseId}`);
                    }}
                    onNavigateHome={() => {
                      setActiveRoute("phase1_marketplace");
                      navigate("/marketplace");
                    }}
                  />
                )}

                {/* 15. The Arbitration Room (Case Review) */}
                {activeRoute === "phase6_admin_dispute" && (
                  <ArbitrationRoomPage
                    caseId={selectedCaseId}
                    onBackToDashboard={() => {
                      setActiveRoute("phase6_admin_dashboard");
                      navigate("/admin/dashboard");
                    }}
                  />
                )}

                {/* 16. Live Design System & Component Documentation Registry */}
                {activeRoute === "design_sandbox" && <SandboxPage />}

                {/* Mobile Bottom Navigation (Visible in mobile viewport mode or on screens < 768px) */}
                <MobileBottomNav
                  onNavigate={(href) => {
                    navigate(href);
                  }}
                  className={cn(
                    viewportMode === "mobile"
                      ? "sticky bottom-0 z-40"
                      : "fixed bottom-0 z-40"
                  )}
                />
              </div>
            </div>
          </main>

          {/* Customer Support Floating Live Chat Widget (Phase 5 §3) */}
          <LiveChatWidget />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
