"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * MobileBottomNav Component for Buyer's High.
 *
 * Requirements (UI Context Spec 1, §2 & §3.B, Spec 2 Tier 1 & Directives):
 * - Fixed to the bottom of the viewport: `fixed bottom-0 z-40 w-full`.
 * - Visible ONLY on screens under 768px: `md:hidden`.
 * - Semi-transparent background with backdrop blur: `bg-background/90 backdrop-blur-md border-t border-border`.
 * - Exact height: `h-16`.
 * - Navigation Items:
 *   1. Home (Marketplace) -> `/marketplace` or `/`
 *   2. Search (Browse & Filter) -> `/marketplace/search` (or `/marketplace`)
 *   3. Escrows (Active Trades) -> `/dashboard` or `/escrow`
 *   4. Profile (User Profile / Auth Gate) -> `/dashboard/settings` or `/login`
 * - Active State Indication:
 *   - Matches current route using `usePathname()`.
 *   - Active icon + label highlighted in `text-primary` (Slate 900).
 *   - Inactive items rendered in `text-muted-foreground`.
 * - Gated Action Handling:
 *   - Directs to `/login` if unauthenticated when tapping Escrows or Profile.
 */

export interface MobileBottomNavProps {
  className?: string;
  activeEscrowTradesCount?: number;
}

export function MobileBottomNav({
  className,
  activeEscrowTradesCount = 1,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/marketplace",
      isActive: pathname === "/" || pathname === "/marketplace",
    },
    {
      label: "Search",
      icon: Search,
      href: "/marketplace?search=open",
      isActive:
        pathname.startsWith("/marketplace") &&
        pathname !== "/marketplace" &&
        !pathname.startsWith("/marketplace/escrow"),
    },
    {
      label: "Escrows",
      icon: ShieldCheck,
      href: isAuthenticated ? "/dashboard" : "/login?redirect=/dashboard",
      isActive:
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/escrow") ||
        pathname.startsWith("/dispute"),
      badgeCount: isAuthenticated ? activeEscrowTradesCount : 0,
    },
    {
      label: "Profile",
      icon: User,
      href: isAuthenticated ? "/dashboard/settings" : "/login",
      isActive:
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname.startsWith("/dashboard/settings") ||
        pathname.startsWith("/kyc"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-background/90 backdrop-blur-md md:hidden px-2 pb-safe",
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
            className={cn(
              "relative flex min-h-11 flex-1 flex-col items-center justify-center py-1 transition-colors duration-200 ease-out select-none",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "h-5 w-5"
                )}
              />
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-[var(--shadow-soft-sm)]">
                  {item.badgeCount}
                </span>
              ) : null}
            </div>

            <span className="mt-1 text-[11px] leading-none tracking-tight">
              {item.label}
            </span>

            {/* Subtle Active Pill Indicator */}
            {isActive && (
              <span className="absolute bottom-1 h-0.5 w-6 rounded-md bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
