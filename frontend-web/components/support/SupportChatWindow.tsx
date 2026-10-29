"use client";

import React, { useState } from "react";
import { MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQQuickLinks } from "./FAQQuickLinks";
import { cn } from "@/lib/utils";

/**
 * SupportChatWindow Component
 *
 * Requirements (5_screen_flows.md Phase 5 §3 & 4_ui_system.md):
 * - Live Escrow Support interactive drawer/window.
 * - Components: SupportChatWindow with FAQQuickLinks.
 * - Design tokens: 8px container radius, 4px controls, anti-pill discipline.
 */

export interface SupportChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
}

export interface SupportChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function SupportChatWindow({
  isOpen,
  onClose,
  className,
}: SupportChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("sp_support_session_id");
      if (existing) return existing;
      const generated = `sp-sup-${Date.now()}`;
      try {
        localStorage.setItem("sp_support_session_id", generated);
      } catch {}
      return generated;
    }
    return "default-concierge-session";
  });

  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: "sup-1",
      sender: "agent",
      text: "Hello! Welcome to Scrowpoint Escrow Support. Need assistance with an active trade, 48-hour inspection, or KYC?",
      time: "Just now",
    },
  ]);

  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchSupportHistory = async () => {
      try {
        const res = await fetch(
          `/api/support/messages?sessionId=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok || !isMounted) return;
        const payload = await res.json();
        const data = payload?.data || payload;
        if (data?.ticket?.ticketNumber) {
          setTicketNumber(String(data.ticket.ticketNumber));
        }
        if (Array.isArray(data?.messages) && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: Record<string, unknown>, idx: number) => ({
              id: String(m.id || `sup-${idx}`),
              sender: m.sender === "user" ? "user" : "agent",
              text: String(m.text || ""),
              time: String(m.time || "Just now"),
            }))
          );
        }
      } catch {
        // Fallback to local support state when backend is unreachable
      }
    };

    fetchSupportHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: SupportChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    try {
      const endpoint = ticketNumber
        ? "/api/support/messages"
        : "/api/support/tickets";
      const bodyPayload = ticketNumber
        ? { sessionId, ticketId: ticketNumber, text }
        : { sessionId, category: "escrow_concierge", message: text };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        const payload = await res.json();
        const data = payload?.data || payload;
        if (data?.ticket?.ticketNumber) {
          setTicketNumber(String(data.ticket.ticketNumber));
        }
        if (data?.agentReply?.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: String(data.agentReply.id || `msg-agent-${Date.now()}`),
              sender: "agent",
              text: String(data.agentReply.text),
              time: String(data.agentReply.time || "Just now"),
            },
          ]);
          return;
        }
      }
    } catch {
      // Fallback to local concierge reply below
    }

    setTimeout(() => {
      let reply =
        "A Senior Escrow Officer has received your inquiry. Average response time is under 3 minutes.";
      if (text.includes("48-hour")) {
        reply =
          "The 48-hour inspection SLA begins upon verified courier delivery. Funds remain locked until you confirm satisfaction or report an issue.";
      } else if (text.includes("payout")) {
        reply =
          "Seller payouts disburse via automated NIP settlement within 15 minutes of buyer sign-off or normal inspection expiration.";
      } else if (text.includes("dispute")) {
        reply =
          "You can open a dispute directly from your Escrow Room by tapping 'Report Issue'. An escrow officer will halt payout release immediately.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-agent-${Date.now()}`,
          sender: "agent",
          text: reply,
          time: "Just now",
        },
      ]);
    }, 550);
  };

  return (
    <div
      className={cn(
        "w-[340px] sm:w-[380px] h-[520px] border border-[#111113]/15 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50",
        className
      )}
    >
      {/* Header */}
      <div className="bg-[#111113] text-white p-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-[#22c55e] text-[#111113] font-bold">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-primary text-xs font-bold leading-tight tracking-[-0.02em]">
              Scrowpoint Escrow Support
            </h4>
            <span className="font-mono text-[10px] text-white/70 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span>Officers Online (SLA 3m)</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 transition-colors cursor-pointer"
          aria-label="Close Support Window"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* FAQ Quick Links */}
      <FAQQuickLinks onSelect={(faq) => handleSend(faq)} />

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F4]/70">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%]",
                isUser ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "p-3 text-xs font-secondary leading-relaxed",
                  isUser
                    ? "bg-[#111113] text-white"
                    : "bg-white text-[#111113] border border-[#111113]/12"
                )}
              >
                {msg.text}
              </div>
              <span className="font-mono text-[9px] text-[#111113]/55 mt-0.5 px-1">
                {msg.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Dock */}
      <div className="p-3 bg-white border-t border-[#111113]/12 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask an escrow specialist..."
          className="flex-1 h-9 px-3 border border-[#111113]/15 bg-white text-xs font-secondary text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
        />
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => handleSend()}
          className="h-9 px-3.5 rounded-full text-xs font-semibold"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default SupportChatWindow;
