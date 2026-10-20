"use client";

import React, { useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Lock,
  Paperclip,
  Send,
  Shield,
  ShieldAlert,
  Smile,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SystemMilestoneBubble, type SystemMilestone } from "./SystemMilestoneBubble";
import { cn } from "@/lib/utils";

/**
 * ChatMessageList Component (Phase 3 §2)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Bybit-Style P2P Escrow Ledger Chat.
 * - Real-time Regex Data Masking (Trust Shield): Filters out Nigerian phone numbers,
 *   emails, WhatsApp links, replacing them with [CONTACT INFO HIDDEN].
 * - RegexWarningToast: Informs user that off-platform communication void escrow rights.
 * - System-Injected Milestones: Distinct, un-deletable chat events.
 * - Read-Only Freeze Mode: Freezes input if order enters DISPUTED state.
 * - Token Compliance: 8px container radius, 4px controls, Geist Mono timestamps.
 */

export interface ChatMessage {
  id: string;
  sender: "buyer" | "seller" | "admin";
  senderName: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  isMilestone?: boolean;
  milestoneData?: SystemMilestone;
}

export interface ChatMessageListProps {
  orderId: string;
  isDisputed?: boolean;
  buyerName?: string;
  sellerName?: string;
  className?: string;
  onOpenEvidenceModal?: () => void;
}

export function ChatMessageList({
  orderId,
  isDisputed = false,
  buyerName = "Adeola (Buyer)",
  sellerName = "Chidi (Seller)",
  className,
  onOpenEvidenceModal,
}: ChatMessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "admin",
      senderName: "System Escrow Ledger",
      text: "",
      timestamp: "10:14 AM",
      isMilestone: true,
      milestoneData: {
        id: "ms-1",
        type: "FUNDED",
        title: "₦850,000 Locked in Paystack Segregated Vault",
        description:
          "Buyer completed deposit via Instant Bank Transfer. Funds are safely held. Seller is authorized to dispatch gadget with insured tracked courier.",
        timestamp: "10:14 AM",
      },
    },
    {
      id: "m-2",
      sender: "seller",
      senderName: sellerName,
      text: "Hello Adeola! Payment confirmed in escrow. I'm packing the iPhone 14 Pro Max now with the original box and charger.",
      timestamp: "10:18 AM",
    },
    {
      id: "m-3",
      sender: "admin",
      senderName: "System Escrow Ledger",
      text: "",
      timestamp: "11:45 AM",
      isMilestone: true,
      milestoneData: {
        id: "ms-2",
        type: "SHIPPED",
        title: "Tracked Courier Dispatch — GIG Logistics #GIG-948102",
        description:
          "Waybill verified. Package is in transit from Ikeja, Lagos with tamper-evident seal and delivery signature confirmation.",
        timestamp: "11:45 AM",
      },
    },
    {
      id: "m-4",
      sender: "buyer",
      senderName: buyerName,
      text: "Thanks! Will test battery health and FaceID immediately courier arrives.",
      timestamp: "11:52 AM",
    },
    {
      id: "m-5",
      sender: "admin",
      senderName: "System Escrow Ledger",
      text: "",
      timestamp: "Yesterday 03:20 PM",
      isMilestone: true,
      milestoneData: {
        id: "ms-3",
        type: "INSPECTION_ACTIVE",
        title: "Package Delivered — 48-Hour Inspection Active",
        description:
          "Courier handoff confirmed. Buyer has 48 hours to inspect display, TrueTone, and hardware before funds release.",
        timestamp: "Yesterday 03:20 PM",
      },
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [regexWarning, setRegexWarning] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Regex patterns to block off-platform diversion
  const PHONE_REGEX = /(?:(?:\+?234)|0)[789][01]\d{8}/g;
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const LINK_REGEX = /(?:https?:\/\/|www\.|wa\.me\/|whatsapp\.com\/)[^\s]+/gi;

  const maskForbiddenData = (content: string) => {
    let masked = content;
    let foundViolation = false;

    if (PHONE_REGEX.test(masked)) {
      masked = masked.replace(PHONE_REGEX, "[CONTACT INFO HIDDEN]");
      foundViolation = true;
    }
    if (EMAIL_REGEX.test(masked)) {
      masked = masked.replace(EMAIL_REGEX, "[EMAIL HIDDEN]");
      foundViolation = true;
    }
    if (LINK_REGEX.test(masked)) {
      masked = masked.replace(LINK_REGEX, "[LINK BLOCKED]");
      foundViolation = true;
    }

    return { masked, foundViolation };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isDisputed) return;

    const { masked, foundViolation } = maskForbiddenData(inputText);

    if (foundViolation) {
      setRegexWarning(
        "Trust Shield: Off-platform contact details (phone numbers, WhatsApp, emails) were masked. Off-platform trades void your 48-hour escrow protection."
      );
    } else {
      setRegexWarning(null);
    }

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "buyer",
      senderName: buyerName,
      text: masked,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[600px] rounded-[8px] border border-[#e2e8f0] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06)] overflow-hidden",
        className
      )}
    >
      {/* 1. Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#0f172a] text-white">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-primary text-xs font-bold text-[#020617] flex items-center gap-1.5">
              <span>P2P Escrow Communication Ledger</span>
              <span className="font-mono text-[10px] text-[#64748b]">({orderId})</span>
            </h3>
            <p className="font-secondary text-[11px] text-[#64748b]">
              Direct between {buyerName} & {sellerName} • Encrypted & Arbitrated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-bold text-[#15803d]">
          <Shield className="h-3 w-3 text-[#22c55e]" />
          <span>Trust Shield Active</span>
        </div>
      </div>

      {/* 2. Dispute Read-Only Banner */}
      {isDisputed && (
        <div className="bg-[#f56565] text-white px-4 py-2.5 flex items-center justify-between text-xs font-mono font-semibold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>ARBITRATION FREEZE: Chat is in READ-ONLY mode. Funds locked in Paystack custody.</span>
          </div>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-[2px]">Admin Assigned</span>
        </div>
      )}

      {/* 3. Regex Masking Warning Toast */}
      {regexWarning && (
        <div className="bg-[#ecc94b]/20 border-b border-[#ecc94b]/40 text-[#975a16] p-3 flex items-start justify-between gap-2 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#ecc94b]" />
            <span>{regexWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setRegexWarning(null)}
            className="text-[#975a16] hover:text-[#020617]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4. Message Stream */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]/50"
      >
        {messages.map((msg) => {
          if (msg.isMilestone && msg.milestoneData) {
            return (
              <SystemMilestoneBubble
                key={msg.id}
                milestone={msg.milestoneData}
              />
            );
          }

          const isMe = msg.sender === "buyer";

          return (
            <div
              key={msg.id}
              className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="font-primary text-[10px] font-bold text-[#64748b]">
                  {msg.senderName}
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">{msg.timestamp}</span>
              </div>

              <div
                className={cn(
                  "p-3 rounded-[8px] text-xs font-secondary leading-relaxed shadow-2xs",
                  isMe
                    ? "bg-[#0f172a] text-white rounded-br-[2px]"
                    : "bg-white text-[#020617] border border-[#e2e8f0] rounded-bl-[2px]"
                )}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Input Dock (Disabled in Read-Only Mode) */}
      <div className="p-3 bg-white border-t border-[#e2e8f0]">
        {isDisputed ? (
          <div className="rounded-[4px] bg-[#f8fafc] border border-[#e2e8f0] p-3 text-center font-mono text-xs text-[#64748b]">
            Direct messaging paused during formal dispute mediation.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenEvidenceModal}
              title="Upload unboxing evidence photo"
              className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message... (phone numbers & off-platform links will be masked)"
              className="flex-1 h-10 px-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
            />

            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!inputText.trim()}
              className="h-10 px-4 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChatMessageList;
