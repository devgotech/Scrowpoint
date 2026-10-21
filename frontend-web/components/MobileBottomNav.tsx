"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lock, Package, Search, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * MobileBottomNav Component for Buyer's High.
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Fixed to the bottom of the viewport: `fixed bottom-0 z-40 w-full`.
 * - Visible ONLY on screens under 768px: `md:hidden`.
 * - Background: `bg-[#f8fafc]/95 backdrop-blur-md border-t border-[#e2e8f0]`.
 * - Exact height: `h-16`.
 * - Reconciled Routes:
 *   1. Marketplace: /marketplace
 *   2. Trust & Safety: /trust-and-safety
 *   3. Active Escrow: /escrow/BH-ORD-9421
 *   4. Seller Hub: /seller/dashboard
 *   5. Profile: /settings/profile
 * - Active State Indication + touch targets >= 44px.
 */

export interface MobileBottomNavProps {
  className?: string;
  activeEscrowTradesCount?: number;
  onNavigate?: (href: string) => void;
  activePath?: string;
}

export function MobileBottomNav({
  className,
  activeEscrowTradesCount = 1,
  onNavigate,
  activePath,
}: MobileBottomNavProps) {
  const routerPathname = usePathname();
  const currentPath = activePath || routerPathname || "/";
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      label: "Market",
      icon: Home,
      href: "/marketplace",
      isActive: currentPath === "/" || currentPath.startsWith("/marketplace") || currentPath.startsWith("/gadget"),
    },
    {
      label: "Trust Hub",
      icon: ShieldCheck,
      href: "/trust-and-safety",
      isActive: currentPath.startsWith("/trust-and-safety") || currentPath.startsWith("/legal"),
    },
    {
      label: "Escrow",
      icon: Lock,
      href: "/escrow/BH-ORD-9421",
      isActive: currentPath.startsWith("/escrow") || currentPath.startsWith("/checkout"),
      badgeCount: activeEscrowTradesCount,
    },
    {
      label: "Seller Hub",
      icon: Package,
      href: "/seller/dashboard",
      isActive: currentPath.startsWith("/seller"),
    },
    {
      label: "Profile",
      icon: User,
      href: "/settings/profile",
      isActive:
        currentPath.startsWith("/settings") ||
        currentPath.startsWith("/notifications") ||
        currentPath === "/login" ||
        currentPath === "/register" ||
        currentPath.startsWith("/verify-identity"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur-md md:hidden px-1 pb-safe",
        className
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive;

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={false}
            onClick={() => {
              if (onNavigate) {
                onNavigate(item.href);
              }
            }}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center py-1 transition-colors duration-200 ease-out select-none min-h-[44px]",
              isActive
                ? "text-[#0f172a] font-semibold"
                : "text-[#64748b] hover:text-[#020617]"
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e] text-[9px] font-mono font-bold text-[#020617] shadow-xs">
                  {item.badgeCount}
                </span>
              ) : null}
            </div>

            <span className="mt-1 text-[10px] font-secondary leading-none tracking-tight">
              {item.label}
            </span>

            {/* Active Indicator Bar */}
            {isActive && (
              <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-[#0f172a]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
