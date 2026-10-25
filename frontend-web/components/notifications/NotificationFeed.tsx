"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Lock,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NotificationFeed Component (Phase 5 §2 - Global Notifications Center)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Renders real-time escrow milestone alerts, shipping tracking updates, and dispute notices.
 * - Token Compliance: 8px container radius, 4px badges, Geist Mono timestamps.
 */

export interface NotificationItem {
  id: string;
  type: "ESCROW_LOCKED" | "SHIPPED" | "INSPECTION_ALERT" | "DISPUTE" | "PAYOUT";
  title: string;
  message: string;
  orderNumber?: string;
  timestamp: string;
  isRead: boolean;
  linkHref?: string;
}

export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "INSPECTION_ALERT",
    title: "48-Hour Hardware Inspection Active",
    message: "GIG Logistics confirmed delivery of iPhone 14 Pro Max. You have 14h 20m remaining to audit hardware.",
    orderNumber: "SP-ORD-9421",
    timestamp: "2h ago",
    isRead: false,
    linkHref: "/escrow/SP-ORD-9421",
  },
  {
    id: "notif-2",
    type: "ESCROW_LOCKED",
    title: "₦850,000 Locked in Paystack Vault",
    message: "Buyer funded the custodial escrow vault for your iPhone 14 Pro Max. You may now dispatch package.",
    orderNumber: "SP-ORD-9421",
    timestamp: "Yesterday",
    isRead: true,
    linkHref: "/escrow/SP-ORD-9421",
  },
  {
    id: "notif-3",
    type: "SHIPPED",
    title: "Waybill Generated & Tracked",
    message: "Package shipped via GIG Logistics tracking #GIG-948102-LOS with tamper-evident seal.",
    orderNumber: "SP-ORD-9421",
    timestamp: "Yesterday",
    isRead: true,
    linkHref: "/escrow/SP-ORD-9421",
  },
  {
    id: "notif-4",
    type: "PAYOUT",
    title: "₦320,000 Settled to GTBank",
    message: "Buyer approved Google Pixel 7 Pro. NIP settlement transferred to your linked bank account.",
    orderNumber: "SP-ORD-8210",
    timestamp: "3 days ago",
    isRead: true,
    linkHref: "/seller/wallet",
  },
];

export interface NotificationFeedProps {
  notifications?: NotificationItem[];
  onSelectNotification?: (item: NotificationItem) => void;
  className?: string;
}

export function NotificationFeed({
  notifications = SAMPLE_NOTIFICATIONS,
  onSelectNotification,
  className,
}: NotificationFeedProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<NotificationItem[]>(notifications);

  const filteredItems = items.filter((item) => (filter === "unread" ? !item.isRead : true));

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "INSPECTION_ALERT":
        return <Clock className="h-4 w-4 text-[#ecc94b]" />;
      case "ESCROW_LOCKED":
        return <Lock className="h-4 w-4 text-[#22c55e]" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4 text-[#0f172a]" />;
      case "PAYOUT":
        return <ShieldCheck className="h-4 w-4 text-[#22c55e]" />;
      case "DISPUTE":
        return <ShieldAlert className="h-4 w-4 text-[#f56565]" />;
    }
  };

  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#0f172a]" />
          <h3 className="font-primary text-sm font-bold text-[#020617]">
            Notification Activity
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-[#e2e8f0] p-0.5 rounded-[4px] text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-2 py-0.5 rounded-[2px]",
                filter === "all" ? "bg-[#0f172a] text-white font-bold" : "text-[#64748b]"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "px-2 py-0.5 rounded-[2px]",
                filter === "unread" ? "bg-[#0f172a] text-white font-bold" : "text-[#64748b]"
              )}
            >
              Unread
            </button>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            className="text-[11px] font-mono text-[#64748b] hover:text-[#0f172a]"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="divide-y divide-[#e2e8f0]">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs font-secondary text-[#64748b]">
            No unread notifications.
          </div>
        ) : (
          filteredItems.map((n) => (
            <div
              key={n.id}
              onClick={() => onSelectNotification?.(n)}
              className={cn(
                "p-4 flex items-start gap-3 transition-colors cursor-pointer",
                !n.isRead ? "bg-[#f8fafc] hover:bg-[#f1f5f9]" : "bg-white hover:bg-[#f8fafc]"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-white border border-[#e2e8f0] shrink-0 mt-0.5 shadow-2xs">
                {getIcon(n.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-primary text-xs font-bold text-[#020617] flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    )}
                  </h4>
                  <span className="font-mono text-[10px] text-[#64748b]">
                    {n.timestamp}
                  </span>
                </div>

                <p className="font-secondary text-xs text-[#64748b] leading-relaxed">
                  {n.message}
                </p>

                {n.orderNumber && (
                  <div className="mt-2 flex items-center gap-1 font-mono text-[10px] font-bold text-[#0f172a]">
                    <span>Order {n.orderNumber}</span>
                    <ArrowRight className="h-3 w-3 text-[#64748b]" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationFeed;
