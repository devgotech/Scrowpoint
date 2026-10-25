"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Lock,
  LogOut,
  PlusCircle,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Navbar Component for Scrowpoint.
 *
 * Requirements (4_ui_system.md & UI Context Spec 1, §2 & §3):
 * - Sticky at top, exact height: `h-16`.
 * - Semi-transparent background with backdrop blur: `bg-[#f8fafc]/90 backdrop-blur-md border-b border-[#e2e8f0]`.
 * - Maximum layout width: `max-w-[1280px]` with `mx-auto` and `px-4 sm:px-6 lg:px-8`.
 * - Radius semantics: controls/buttons use 4px (`rounded-[4px]`), dropdown cards use 8px (`rounded-[8px]`).
 * - Guest State:
 *   - "Log in" (Ghost) and "Sign up" (Primary Fill: #0f172a) buttons.
 *   - Marketplace search bar & public discovery links.
 * - Authenticated State:
 *   - Notification Bell with unread counter dot in --color-trust (#22c55e).
 *   - "Sell Gadget" primary CTA.
 *   - User Avatar with initials fallback and dropdown (matching current page context).
 * - Transitions: strict duration-200 ease-out transitions. NEVER bouncy scaling animations.
 */

export interface NavbarProps {
  className?: string;
  unreadNotificationsCount?: number;
  onNavigate?: (href: string) => void;
  activePath?: string;
}

export function Navbar({
  className,
  unreadNotificationsCount = 2,
  onNavigate,
  activePath,
}: NavbarProps) {
  const routerPathname = usePathname();
  const currentPath = activePath || routerPathname || "/";

  const { user, isAuthenticated, isAdmin, isKYCVerified, kycTier, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Active page detection for dropdown navigation focus matching
  const isProfileActive =
    currentPath === "/settings/profile" || currentPath.startsWith("/settings");
  const isDashboardActive =
    currentPath === "/seller/dashboard" || currentPath === "/dashboard";
  const isPostGadgetActive =
    currentPath === "/seller/post-gadget" || currentPath === "/post-gadget";
  const isWalletActive =
    currentPath === "/seller/wallet" || currentPath.startsWith("/seller/wallet");
  const isEscrowActive = currentPath.startsWith("/escrow");
  const isKYCActive =
    currentPath.startsWith("/verify-identity") || currentPath.startsWith("/kyc");
  const isAdminActive = currentPath.startsWith("/admin");

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Compute initials for avatar fallback (e.g., "John Doe" -> "JD")
  const getInitials = (name?: string) => {
    if (!name) return "SP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-[#f8fafc]/90 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#0f172a] text-white shadow-xs transition-colors duration-200 ease-out">
              <Shield className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-primary text-lg font-bold tracking-tight text-[#020617] leading-none">
                Scrowpoint
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-secondary font-medium">
            <Link
              href="/marketplace"
              onClick={() => onNavigate?.("/marketplace")}
              className="text-[#020617] hover:text-[#0f172a] transition-colors duration-200 ease-out"
            >
              Marketplace
            </Link>
            <Link
              href="/pricing"
              onClick={() => onNavigate?.("/pricing")}
              className="text-[#64748b] hover:text-[#020617] transition-colors duration-200 ease-out"
            >
              Fee Calculator
            </Link>
            <Link
              href="/trust-and-safety"
              onClick={() => onNavigate?.("/trust-and-safety")}
              className="text-[#64748b] hover:text-[#020617] transition-colors duration-200 ease-out"
            >
              Trust & Safety
            </Link>
            {isAuthenticated && user && (
              <Link
                href="/seller/dashboard"
                onClick={() => onNavigate?.("/seller/dashboard")}
                className="text-[#64748b] hover:text-[#020617] transition-colors duration-200 ease-out"
              >
                Seller Hub
              </Link>
            )}
            <Link
              href="/waitlist"
              onClick={() => onNavigate?.("/waitlist")}
            >
              <Button
                variant={currentPath === "/waitlist" ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs font-medium rounded-[4px] border-[#e2e8f0] text-[#020617] hover:bg-[#f1f5f9] transition-colors duration-200 ease-out"
              >
                Waitlist
              </Button>
            </Link>
          </nav>
        </div>

        {/* Center: Global Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones, laptops, consoles..."
              className="h-9 w-full rounded-[4px] border border-[#e2e8f0] bg-white pl-9 pr-4 text-sm font-secondary text-[#020617] placeholder:text-[#64748b] transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Right Section: Guest vs Authenticated States */}
        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated && user ? (
            /* ===============================================================
               AUTHENTICATED STATE
               =============================================================== */
            <>
              {/* "Sell Gadget" CTA */}
              <Link href="/seller/post-gadget" className="hidden sm:block">
                <Button variant="default" size="sm" className="gap-2 font-medium">
                  <PlusCircle className="h-4 w-4" />
                  <span>Sell Gadget</span>
                </Button>
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label="Notifications"
                  className="relative h-9 w-9 text-[#64748b] hover:text-[#020617]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                  )}
                </Button>

                {/* Notifications Flyout */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-[8px] border border-[#e2e8f0] bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.06)] z-50 text-[#020617] transition-all duration-200 ease-out">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                      <span className="font-primary font-medium text-sm">
                        Notifications
                      </span>
                      <span className="text-xs text-[#64748b] font-mono">
                        {unreadNotificationsCount} unread
                      </span>
                    </div>
                    <div className="py-2 space-y-2 text-xs font-secondary">
                      <div className="p-2.5 rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#020617]">
                            Escrow Funded
                          </span>
                          <span className="text-[10px] text-[#64748b] font-mono">
                            10m ago
                          </span>
                        </div>
                        <p className="text-[#64748b]">
                          Order #SP-8921 funds are held securely. You may now ship
                          the gadget.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-[4px] hover:bg-[#f8fafc] transition-colors duration-200 ease-out">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#020617]">
                            KYC Verification
                          </span>
                          <span className="text-[10px] text-[#64748b] font-mono">
                            2h ago
                          </span>
                        </div>
                        <p className="text-[#64748b]">
                          Your tier-1 identity documents were reviewed and approved.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#e2e8f0] text-center">
                      <Link
                        href="/notifications"
                        onClick={(e) => {
                          setIsNotificationsOpen(false);
                          if (onNavigate) {
                            e.preventDefault();
                            onNavigate("/notifications");
                          }
                        }}
                        className="text-xs font-medium text-[#64748b] hover:text-[#020617] transition-colors duration-200 ease-out"
                      >
                        View all activity
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  title="Profile & Account Menu"
                  aria-label="Open profile dropdown"
                  className={cn(
                    "flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0f172a] transition-all duration-200 ease-out cursor-pointer",
                    isProfileActive && "ring-2 ring-[#0f172a] ring-offset-2 ring-offset-white"
                  )}
                  aria-expanded={isDropdownOpen}
                >
                  <Avatar className="h-9 w-9 border-2 border-[#e2e8f0]">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={cn(
                      "hidden sm:block h-3.5 w-3.5 text-[#64748b] transition-transform duration-200 ease-out",
                      isDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-[8px] border border-[#e2e8f0] bg-white p-2 shadow-[0_8px_16px_rgba(15,23,42,0.08)] z-50 text-[#020617] transition-all duration-200 ease-out animate-in fade-in zoom-in-95">
                    {/* User Identity Header -> Direct Link to Profile */}
                    <Link
                      href="/settings/profile"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate?.("/settings/profile");
                      }}
                      className={cn(
                        "block px-3 py-2.5 border-b border-[#e2e8f0] rounded-[6px] transition-colors duration-200 group mb-1",
                        isProfileActive
                          ? "bg-[#f1f5f9] border-[#cbd5e1]"
                          : "hover:bg-[#f8fafc]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-primary font-bold text-sm truncate text-[#020617] group-hover:text-[#0f172a]">
                          {user.name || "Authenticated Trader"}
                        </p>
                        <span
                          className={cn(
                            "font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] transition-colors",
                            isProfileActive
                              ? "bg-[#0f172a] text-white"
                              : "bg-[#e2e8f0] text-[#0f172a] group-hover:bg-[#0f172a] group-hover:text-white"
                          )}
                        >
                          {isProfileActive ? "Current Page" : "Manage →"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] truncate font-mono mt-0.5">
                        {user.email}
                      </p>

                      {/* KYC Status Badge (Spec Rule: Green strictly for verified) */}
                      <div className="mt-2 flex items-center gap-2">
                        {isKYCVerified ? (
                          <Badge variant="trust" className="gap-1 text-[11px] py-0 font-mono tracking-wider">
                            <ShieldCheck className="h-3 w-3 text-[#22c55e]" />
                            <span>KYC Verified</span>
                          </Badge>
                        ) : kycTier === "manual_review_required" ? (
                          <Badge variant="warning" className="gap-1 text-[11px] py-0 font-mono tracking-wider">
                            <ShieldAlert className="h-3 w-3 text-[#ecc94b]" />
                            <span>In Manual Review</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-[11px] py-0 font-mono tracking-wider">
                            <Shield className="h-3 w-3 text-[#64748b]" />
                            <span>KYC Pending</span>
                          </Badge>
                        )}
                      </div>
                    </Link>

                    {/* Navigation Links with Active Page Focus */}
                    <div className="py-1 space-y-0.5">
                      {/* 1. Profile & Settings */}
                      <Link
                        href="/settings/profile"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/settings/profile");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                          isProfileActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#020617] hover:bg-[#f8fafc] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <User
                            className={cn(
                              "h-4 w-4",
                              isProfileActive ? "text-white" : "text-[#64748b]"
                            )}
                          />
                          <span>Profile & Settings</span>
                        </div>
                        {isProfileActive ? (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                            Active
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded-[3px]">
                            Avatar
                          </span>
                        )}
                      </Link>

                      {/* 2. Trades Dashboard */}
                      <Link
                        href="/seller/dashboard"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/seller/dashboard");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                          isDashboardActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#020617] hover:bg-[#f8fafc] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <LayoutDashboard
                            className={cn(
                              "h-4 w-4",
                              isDashboardActive ? "text-white" : "text-[#64748b]"
                            )}
                          />
                          <span>Trades Dashboard</span>
                        </div>
                        {isDashboardActive && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                            Active
                          </span>
                        )}
                      </Link>

                      {/* 3. Post New Gadget */}
                      <Link
                        href="/seller/post-gadget"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/seller/post-gadget");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                          isPostGadgetActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#020617] hover:bg-[#f8fafc] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <PlusCircle
                            className={cn(
                              "h-4 w-4",
                              isPostGadgetActive ? "text-white" : "text-[#22c55e]"
                            )}
                          />
                          <span>Post New Gadget</span>
                        </div>
                        {isPostGadgetActive && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                            Active
                          </span>
                        )}
                      </Link>

                      {/* 4. Wallet & Payouts */}
                      <Link
                        href="/seller/wallet"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/seller/wallet");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                          isWalletActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#020617] hover:bg-[#f8fafc] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet
                            className={cn(
                              "h-4 w-4",
                              isWalletActive ? "text-white" : "text-[#64748b]"
                            )}
                          />
                          <span>Wallet & Payouts</span>
                        </div>
                        {isWalletActive && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                            Active
                          </span>
                        )}
                      </Link>

                      {/* 5. Active Escrow Room */}
                      <Link
                        href="/escrow/SP-ORD-9421"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/escrow/SP-ORD-9421");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                          isEscrowActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#020617] hover:bg-[#f8fafc] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Lock
                            className={cn(
                              "h-4 w-4",
                              isEscrowActive ? "text-white" : "text-[#64748b]"
                            )}
                          />
                          <span>Active Escrow Room</span>
                        </div>
                        {isEscrowActive && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                            Active
                          </span>
                        )}
                      </Link>

                      {/* 6. Identity Verification */}
                      <Link
                        href="/verify-identity"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/verify-identity");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                          isKYCActive
                            ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                            : "text-[#020617] hover:bg-[#f8fafc] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className={cn(
                              "h-4 w-4",
                              isKYCActive ? "text-white" : "text-[#64748b]"
                            )}
                          />
                          <span>Identity Verification</span>
                        </div>
                        {isKYCActive && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                            Active
                          </span>
                        )}
                      </Link>

                      {/* 7. Admin Dispute Portal */}
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onNavigate?.("/admin/dashboard");
                          }}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm rounded-[4px] transition-all duration-200 ease-out",
                            isAdminActive
                              ? "bg-[#0f172a] text-white font-semibold shadow-xs"
                              : "bg-[#ecc94b]/15 text-[#975a16] hover:bg-[#ecc94b]/25 font-semibold"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldAlert
                              className={cn(
                                "h-4 w-4",
                                isAdminActive ? "text-white" : "text-[#ecc94b]"
                              )}
                            />
                            <span>Admin Dispute Portal</span>
                          </div>
                          {isAdminActive && (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-[#22c55e] font-semibold bg-white/15 px-1.5 py-0.5 rounded-[3px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                              Active
                            </span>
                          )}
                        </Link>
                      )}
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 border-t border-[#e2e8f0]">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await logout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-[4px] text-[#c53030] hover:bg-[#f56565]/10 transition-colors duration-200 ease-out"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ===============================================================
               GUEST STATE
               =============================================================== */
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="font-medium shadow-xs">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
