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
 * Navbar Component for Scrowpoint — Design Variation 7.
 *
 * Matches Variation 7 Specification:
 * - Warm Editorial Paper canvas (`#F8F7F4`) with `1px solid rgba(17, 17, 19, 0.12)` hairline border.
 * - Bold architectural wordmark: `SCROWPOINT.` (`font-size: 1.5rem; font-weight: 800; letter-spacing: -0.05em`).
 * - Navigation links: `.nav-link` (`0.8rem`, `font-weight: 500`, `uppercase`, `letter-spacing: 0.05em`).
 * - Primary CTA: `.btn-primary` (`background: #111113; color: #FFF; padding: 0.75rem 1.5rem; border-radius: 999px; font-size: 0.85rem`).
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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
        "sticky top-0 z-40 w-full border-b border-[#111113]/12 bg-[#F8F7F4]/95 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 sm:px-8">
        {/* Left: Variation 7 Wordmark */}
        <Link
          href="/"
          onClick={() => onNavigate?.("/")}
          className="font-primary text-2xl font-extrabold tracking-[-0.05em] text-[#111113] select-none hover:opacity-80 transition-opacity"
        >
          SCROWPOINT<span className="text-[#FF5A25]">.</span>
        </Link>

        {/* Center: Variation 7 Uppercase Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 nav-link">
          <Link
            href="/marketplace"
            onClick={() => onNavigate?.("/marketplace")}
            className={cn(
              "transition-colors duration-200",
              currentPath === "/marketplace"
                ? "text-[#FF5A25] font-semibold"
                : "text-[#111113]/80 hover:text-[#111113]"
            )}
          >
            Marketplace
          </Link>
          <Link
            href="/trust-and-safety"
            onClick={() => onNavigate?.("/trust-and-safety")}
            className={cn(
              "transition-colors duration-200",
              currentPath === "/trust-and-safety"
                ? "text-[#FF5A25] font-semibold"
                : "text-[#111113]/80 hover:text-[#111113]"
            )}
          >
            Trust &amp; Safety
          </Link>
          <Link
            href="/pricing"
            onClick={() => onNavigate?.("/pricing")}
            className={cn(
              "transition-colors duration-200",
              currentPath === "/pricing"
                ? "text-[#FF5A25] font-semibold"
                : "text-[#111113]/80 hover:text-[#111113]"
            )}
          >
            Calculator
          </Link>
          {isAuthenticated && user && (
            <Link
              href="/seller/dashboard"
              onClick={() => onNavigate?.("/seller/dashboard")}
              className={cn(
                "transition-colors duration-200",
                isDashboardActive
                  ? "text-[#FF5A25] font-semibold"
                  : "text-[#111113]/80 hover:text-[#111113]"
              )}
            >
              Seller Hub
            </Link>
          )}
          <Link
            href="/waitlist"
            onClick={() => onNavigate?.("/waitlist")}
            className={cn(
              "px-3 py-1.5 border border-[#111113]/15 bg-white/80 hover:bg-white hover:border-[#111113]/40 transition-colors duration-200",
              currentPath === "/waitlist"
                ? "border-[#111113] bg-[#111113] text-white"
                : "text-[#111113]"
            )}
          >
            Waitlist
          </Link>
        </nav>

        {/* Right Section: Guest vs Authenticated States */}
        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated && user ? (
            /* AUTHENTICATED STATE */
            <>
              <Link href="/seller/post-gadget" className="hidden sm:block">
                <button
                  type="button"
                  className="btn-primary flex items-center gap-2 !py-2.5 !px-5 text-[0.8rem]"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Sell Gadget</span>
                </button>
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label="Notifications"
                  className="relative h-9 w-9 text-[#111113]/70 hover:text-[#111113]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-[#FF5A25]" />
                  )}
                </Button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 border border-[#111113]/12 bg-white p-4 shadow-lg z-50 text-[#111113]">
                    <div className="flex items-center justify-between pb-3 border-b border-[#111113]/12">
                      <span className="font-primary font-bold text-sm">
                        Notifications
                      </span>
                      <span className="label">
                        {unreadNotificationsCount} unread
                      </span>
                    </div>
                    <div className="py-2 space-y-2 text-xs font-secondary">
                      <div className="p-2.5 bg-[#F8F7F4] border border-[#111113]/12">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#111113]">
                            Escrow Funded
                          </span>
                          <span className="text-[10px] text-[#111113]/60 font-mono">
                            10m ago
                          </span>
                        </div>
                        <p className="text-[#111113]/70">
                          Order #SP-8921 funds are held securely. You may now ship
                          the gadget.
                        </p>
                      </div>
                      <div className="p-2.5 hover:bg-[#F8F7F4] transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#111113]">
                            KYC Verification
                          </span>
                          <span className="text-[10px] text-[#111113]/60 font-mono">
                            2h ago
                          </span>
                        </div>
                        <p className="text-[#111113]/70">
                          Your tier-1 identity documents were reviewed and approved.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#111113]/12 text-center">
                      <Link
                        href="/notifications"
                        onClick={(e) => {
                          setIsNotificationsOpen(false);
                          if (onNavigate) {
                            e.preventDefault();
                            onNavigate("/notifications");
                          }
                        }}
                        className="text-xs font-semibold text-[#111113]/70 hover:text-[#111113]"
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
                    "flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-[#111113]/20 focus:outline-none focus:ring-2 focus:ring-[#111113] transition-all cursor-pointer",
                    isProfileActive && "ring-2 ring-[#111113] ring-offset-2 ring-offset-[#F8F7F4]"
                  )}
                  aria-expanded={isDropdownOpen}
                >
                  <Avatar className="h-9 w-9 border border-[#111113]/20">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={cn(
                      "hidden sm:block h-3.5 w-3.5 text-[#111113]/60 transition-transform duration-200",
                      isDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 border border-[#111113]/12 bg-white p-2 shadow-xl z-50 text-[#111113]">
                    <Link
                      href="/settings/profile"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate?.("/settings/profile");
                      }}
                      className={cn(
                        "block px-3 py-2.5 border-b border-[#111113]/12 transition-colors group mb-1",
                        isProfileActive
                          ? "bg-[#F8F7F4]"
                          : "hover:bg-[#F8F7F4]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-primary font-bold text-sm truncate text-[#111113]">
                          {user.name || "Authenticated Trader"}
                        </p>
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 bg-[#111113] text-white">
                          {isProfileActive ? "Current" : "Manage →"}
                        </span>
                      </div>
                      <p className="text-xs text-[#111113]/60 truncate font-mono mt-0.5">
                        {user.email}
                      </p>

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
                            <Shield className="h-3 w-3 text-[#111113]/60" />
                            <span>KYC Pending</span>
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/settings/profile"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/settings/profile");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                          isProfileActive
                            ? "bg-[#111113] text-white font-semibold"
                            : "text-[#111113] hover:bg-[#F8F7F4] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4" />
                          <span>Profile &amp; Settings</span>
                        </div>
                      </Link>

                      <Link
                        href="/seller/dashboard"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/seller/dashboard");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                          isDashboardActive
                            ? "bg-[#111113] text-white font-semibold"
                            : "text-[#111113] hover:bg-[#F8F7F4] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Trades Dashboard</span>
                        </div>
                      </Link>

                      <Link
                        href="/seller/post-gadget"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/seller/post-gadget");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                          isPostGadgetActive
                            ? "bg-[#111113] text-white font-semibold"
                            : "text-[#111113] hover:bg-[#F8F7F4] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <PlusCircle className="h-4 w-4 text-[#FF5A25]" />
                          <span>Post New Gadget</span>
                        </div>
                      </Link>

                      <Link
                        href="/seller/wallet"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/seller/wallet");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                          isWalletActive
                            ? "bg-[#111113] text-white font-semibold"
                            : "text-[#111113] hover:bg-[#F8F7F4] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet className="h-4 w-4" />
                          <span>Wallet &amp; Payouts</span>
                        </div>
                      </Link>

                      <Link
                        href="/escrow/SP-ORD-9421"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/escrow/SP-ORD-9421");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                          isEscrowActive
                            ? "bg-[#111113] text-white font-semibold"
                            : "text-[#111113] hover:bg-[#F8F7F4] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Lock className="h-4 w-4" />
                          <span>Active Escrow Room</span>
                        </div>
                      </Link>

                      <Link
                        href="/verify-identity"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate?.("/verify-identity");
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                          isKYCActive
                            ? "bg-[#111113] text-white font-semibold"
                            : "text-[#111113] hover:bg-[#F8F7F4] font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Identity Verification</span>
                        </div>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onNavigate?.("/admin/dashboard");
                          }}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm transition-colors",
                            isAdminActive
                              ? "bg-[#111113] text-white font-semibold"
                              : "bg-[#ecc94b]/15 text-[#975a16] hover:bg-[#ecc94b]/25 font-semibold"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldAlert className="h-4 w-4 text-[#ecc94b]" />
                            <span>Admin Dispute Portal</span>
                          </div>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#111113]/12">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await logout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#c53030] hover:bg-[#f56565]/10 transition-colors"
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
            /* GUEST STATE — Variation 7 Pill "Sign In" Button */
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="hidden sm:inline-block nav-link text-[#111113]/70 hover:text-[#111113] transition-colors"
              >
                Register
              </Link>
              <Link href="/login">
                <button
                  type="button"
                  className="btn-primary !py-3 !px-6 text-[0.85rem]"
                >
                  Sign In
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
