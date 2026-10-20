"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthContext";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  className?: string;
  unreadNotificationsCount?: number;
}

export function Navbar({ className, unreadNotificationsCount = 2 }: NavbarProps) {
  const { user, isAuthenticated, isAdmin, isKYCVerified, kycTier, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Click outside to dismiss menus
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
    if (!name) return "BH";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Core Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground leading-none">
                Buyer&apos;s High
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                P2P Escrow
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/marketplace"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Fee Calculator
            </Link>
            <Link
              href="/escrow/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Trust & Safety
            </Link>
          </nav>
        </div>

        {/* Global Search Input (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones, laptops, consoles..."
              className="h-11 w-full rounded-md border border-input bg-muted/40 pl-9 pr-4 font-body text-base text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-200 ease-out"
            />
          </div>
        </div>

        {/* Right Section: Guest vs Authenticated States */}
        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated && user ? (
            <>
              {/* "Sell Gadget" Action */}
              <Link href="/dashboard/listings/create" className="hidden sm:block">
                <Button variant="default" size="sm" className="gap-2 font-medium">
                  <PlusCircle className="h-4 w-4" />
                  <span>Sell Gadget</span>
                </Button>
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label="Notifications"
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50 text-foreground animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="font-heading font-semibold text-sm">Notifications</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {unreadNotificationsCount} unread
                      </span>
                    </div>
                    <div className="py-2 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground">Escrow Funded</span>
                          <span className="text-[10px] text-muted-foreground">10m ago</span>
                        </div>
                        <p className="text-muted-foreground">
                          Order #BH-8921 funds are held securely. You may now ship the gadget.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View all activity
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex min-h-11 items-center gap-2 rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-200 ease-out"
                  aria-expanded={isDropdownOpen}
                >
                  <Avatar className="h-9 w-9 border-2 border-border">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={cn(
                      "hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      isDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl z-50 text-foreground animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="font-heading font-semibold text-sm truncate text-foreground">
                        {user.name || "Authenticated Trader"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {user.email}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        {isKYCVerified ? (
                          <Badge variant="trust" className="gap-1 text-[11px] py-0">
                            <ShieldCheck className="h-3 w-3" />
                            <span>KYC Verified</span>
                          </Badge>
                        ) : kycTier === "manual_review_required" ? (
                          <Badge variant="warning" className="gap-1 text-[11px] py-0">
                            <ShieldAlert className="h-3 w-3" />
                            <span>In Manual Review</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-[11px] py-0">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span>KYC Pending</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span>Trades Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard/wallet"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground transition-colors"
                      >
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span>Wallet & Payouts</span>
                      </Link>
                      <Link
                        href="/kyc/document"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span>Identity Verification</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex min-h-11 items-center gap-2.5 px-3 py-2 text-sm rounded-md bg-warning/20 text-warning-text font-medium transition-colors duration-200 ease-out"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>Admin Dispute Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-border">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsDropdownOpen(false);
                          await logout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
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
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="font-medium shadow-sm">
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