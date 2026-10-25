"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { SupportChatWindow } from "./SupportChatWindow";
import { cn } from "@/lib/utils";

/**
 * LiveChatWidget Component (Phase 5 §3 - Customer Support)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Floating Action Button (FAB) + Collapsible Support Chat Window.
 * - Components: SupportChatWindow, FAQQuickLinks.
 * - Token Compliance: 8px container radius, 4px controls, anti-pill discipline.
 * - Responsive: Placed bottom-20 on mobile to not obscure MobileBottomNav, bottom-6 on desktop.
 */

export interface LiveChatWidgetProps {
  className?: string;
}

export function LiveChatWidget({ className }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end",
        className
      )}
    >
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f172a] text-white shadow-xl hover:bg-slate-800 transition-all duration-200 ease-out hover:scale-105 active:scale-95 border border-slate-700"
          title="Live Escrow Support Chat"
          aria-label="Open Escrow Support Chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Support Chat Window */}
      <SupportChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export default LiveChatWidget;
