"use client";

import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCheck,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquareHeart,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import {
  SystemMilestoneBubble,
  type SystemMilestone,
} from "./SystemMilestoneBubble";
import { cn } from "@/lib/utils";

/**
 * ChatMessageList Component (Phase 3 §2)
 *
 * Friendly, welcoming P2P Trade Conversation & Milestone Stream.
 * Design Variation 7 Compliance (4_ui_system.md):
 * - Warm Editorial Paper (#F8F7F4) & Crisp White (#FFFFFF) surfaces with 0px sharp architectural cards
 * - Deep Carbon Ink (#111113) & Vermilion Orange (#FF5A25) accents
 * - Friendly participant presence bar, one-tap quick replies, unboxing photo attachments,
 *   and polite Trust Shield contact-masking assistance.
 */

export interface ChatMessage {
  id: string;
  sender: "buyer" | "seller" | "admin";
  senderName: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentCaption?: string;
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

const QUICK_REPLIES = [
  "Package just arrived! Unboxing now 📦",
  "Battery health & FaceID match 100% ✅",
  "What time will the GIG rider arrive?",
  "Everything works great — releasing payout now!",
];

export function ChatMessageList({
  orderId,
  isDisputed = false,
  buyerName = "Adeola (Buyer)",
  sellerName = "Chidi Gadgets (Seller)",
  className,
  onOpenEvidenceModal,
}: ChatMessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "admin",
      senderName: "Scrowpoint Concierge",
      text: "",
      timestamp: "10:14 AM",
      isMilestone: true,
      milestoneData: {
        id: "ms-1",
        type: "FUNDED",
        title: "₦850,000 Safely Locked in Paystack Escrow",
        description:
          "Adeola's payment is secured in the segregated vault. Chidi Gadgets can now package and hand off the iPhone 14 Pro Max with full peace of mind.",
        nextStepHint:
          "Seller dispatches the gadget via GIG Logistics and shares the waybill.",
        timestamp: "10:14 AM",
      },
    },
    {
      id: "m-2",
      sender: "seller",
      senderName: sellerName,
      text: "Hi Adeola! Thanks for the prompt deposit. I've just wrapped your iPhone 14 Pro Max in bubble wrap along with the original Apple 20W brick and USB-C cable. Heading to the GIG Ikeja hub now!",
      timestamp: "10:18 AM",
    },
    {
      id: "m-3",
      sender: "admin",
      senderName: "Scrowpoint Concierge",
      text: "",
      timestamp: "11:45 AM",
      isMilestone: true,
      milestoneData: {
        id: "ms-2",
        type: "SHIPPED",
        title: "Gadget Dispatched via GIG Logistics (#GIG-948102-LOS)",
        description:
          "The package has been sealed with tamper-evident tape and is on its way from Ikeja GRA.",
        nextStepHint:
          "Once delivered, Adeola gets a full 48-hour window to test the device at home.",
        timestamp: "11:45 AM",
      },
    },
    {
      id: "m-4",
      sender: "buyer",
      senderName: buyerName,
      text: "Awesome, thank you Chidi! I'll let you know as soon as the rider drops it off so I can test FaceID and battery health.",
      timestamp: "11:52 AM",
    },
    {
      id: "m-5",
      sender: "admin",
      senderName: "Scrowpoint Concierge",
      text: "",
      timestamp: "Yesterday • 03:20 PM",
      isMilestone: true,
      milestoneData: {
        id: "ms-3",
        type: "INSPECTION_ACTIVE",
        title: "Delivered! Your 48-Hour Home Inspection Window is Open",
        description:
          "Take your time to check the screen, TrueTone, cameras, SIM signal, and battery health (97%).",
        nextStepHint:
          "Happy with the gadget? Tap 'Approve Payout' on the left to pay Chidi immediately.",
        timestamp: "Yesterday • 03:20 PM",
      },
    },
    {
      id: "m-6",
      sender: "seller",
      senderName: sellerName,
      text: "Glad the courier delivered safely! Take your time testing everything, and let me know if you have any questions about the setup.",
      timestamp: "Yesterday • 03:25 PM",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [regexWarning, setRegexWarning] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync order conversation & milestones with GET /api/orders/{id}/messages
  React.useEffect(() => {
    let isMounted = true;
    const loadOrderMessages = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("sp_access_token") ||
              localStorage.getItem("bh_access_token")
            : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}/messages`,
          { headers }
        );
        if (!res.ok || !isMounted) return;
        const payload = await res.json();
        const items = payload?.data || payload;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: ChatMessage[] = items.map((m: Record<string, unknown>, idx: number) => ({
            id: String(m.id || `srv-m-${idx}`),
            sender:
              m.sender === "seller" || m.sender === "admin"
                ? (m.sender as "seller" | "admin")
                : "buyer",
            senderName: String(m.senderName || buyerName),
            text: String(m.text || ""),
            timestamp: String(m.timestamp || "Just now"),
            attachmentUrl: m.attachmentUrl ? String(m.attachmentUrl) : undefined,
            attachmentCaption: m.attachmentCaption
              ? String(m.attachmentCaption)
              : undefined,
            isMilestone: Boolean(m.isMilestone),
            milestoneData: m.isMilestone
              ? {
                  id: String(m.id || `ms-${idx}`),
                  type: (m.milestoneType as SystemMilestone["type"]) || "FUNDED",
                  title: String(m.milestoneTitle || "Escrow Milestone"),
                  description: String(m.milestoneDescription || ""),
                  nextStepHint: m.milestoneNextStepHint
                    ? String(m.milestoneNextStepHint)
                    : undefined,
                  timestamp: String(m.timestamp || "Just now"),
                }
              : undefined,
          }));
          setMessages(mapped);
        }
      } catch {
        // Retain local seeded milestone & trade chat stream when backend is unreachable
      }
    };

    loadOrderMessages();
    return () => {
      isMounted = false;
    };
  }, [orderId, buyerName]);

  // Regex patterns to protect both parties from off-platform diversion
  const PHONE_REGEX = /(?:(?:\+?234)|0)[789][01]\d{8}/g;
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const LINK_REGEX = /(?:https?:\/\/|www\.|wa\.me\/|whatsapp\.com\/)[^\s]+/gi;

  const maskForbiddenData = (content: string) => {
    let masked = content;
    let foundViolation = false;

    if (PHONE_REGEX.test(masked)) {
      masked = masked.replace(PHONE_REGEX, "[PHONE HIDDEN FOR SAFETY]");
      foundViolation = true;
    }
    if (EMAIL_REGEX.test(masked)) {
      masked = masked.replace(EMAIL_REGEX, "[EMAIL HIDDEN FOR SAFETY]");
      foundViolation = true;
    }
    if (LINK_REGEX.test(masked)) {
      masked = masked.replace(LINK_REGEX, "[EXTERNAL LINK HIDDEN]");
      foundViolation = true;
    }

    return { masked, foundViolation };
  };

  const pushMessage = async (rawText: string, attachmentUrl?: string) => {
    if ((!rawText.trim() && !attachmentUrl) || isDisputed) return;

    const { masked, foundViolation } = maskForbiddenData(rawText);

    if (foundViolation) {
      setRegexWarning(
        "Friendly heads-up: We hid a phone number, email, or external link in your message. Keeping all chat inside Scrowpoint ensures your 48-hour money-back guarantee stays 100% valid!"
      );
    } else {
      setRegexWarning(null);
    }

    const attachmentCaption = attachmentUrl
      ? "Unboxing & Settings > About verification photo"
      : undefined;

    const optimisticMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "buyer",
      senderName: buyerName,
      text: masked,
      attachmentUrl,
      attachmentCaption,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 80);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("sp_access_token") ||
            localStorage.getItem("bh_access_token")
          : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            sender: "buyer",
            senderName: buyerName,
            text: rawText,
            attachmentUrl,
            attachmentCaption,
          }),
        }
      );
      if (res.ok) {
        const payload = await res.json();
        const saved = payload?.data || payload;
        if (saved?.sanitized && saved?.sanitizedReason) {
          setRegexWarning(String(saved.sanitizedReason));
        }
      }
    } catch {
      // Optimistic message already rendered in chat stream
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    pushMessage(inputText);
  };

  const handleShareUnboxingPhoto = () => {
    pushMessage(
      "Just unboxed it! Here is a quick photo of the Settings screen — IMEI and 97% battery health match your listing.",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80"
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[680px] border border-[#111113]/12 bg-white overflow-hidden",
        className
      )}
    >
      {/* 1. Friendly Trade Conversation Header */}
      <div className="p-4 sm:px-5 border-b border-[#111113]/12 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Overlapping Participant Avatars */}
          <div className="flex -space-x-2">
            <div
              className="h-9 w-9 rounded-full bg-[#111113] text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-white"
              title={sellerName}
            >
              CG
            </div>
            <div
              className="h-9 w-9 rounded-full bg-[#FF5A25] text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-white"
              title={buyerName}
            >
              AD
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-primary text-sm font-bold tracking-[-0.02em] text-[#111113]">
                Trade Chat &amp; Live Milestones
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#15803d] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                <span>Seller Online</span>
              </span>
            </div>
            <p className="font-secondary text-xs text-[#111113]/65">
              Chat directly with{" "}
              <strong className="font-semibold text-[#111113]">
                {sellerName.replace(" (Seller)", "")}
              </strong>{" "}
              • Typically replies in 2 mins
            </p>
          </div>
        </div>

        {/* Friendly Protection Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#15803d]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
          <Shield className="h-3 w-3 text-[#22c55e]" />
          <span>Protected Chat • {orderId}</span>
        </div>
      </div>

      {/* Reassuring Welcome Strip */}
      <div className="bg-[#F0EFEA] border-b border-[#111113]/10 px-4 sm:px-5 py-2 flex items-center justify-between gap-2 text-[11px] font-secondary text-[#111113]/75">
        <div className="flex items-center gap-2">
          <MessageSquareHeart className="h-3.5 w-3.5 text-[#FF5A25] shrink-0" />
          <span>
            Ask questions, share unboxing photos, or confirm delivery right here.
            Everything is saved to protect both of you.
          </span>
        </div>
      </div>

      {/* 2. Dispute Read-Only Banner */}
      {isDisputed && (
        <div className="bg-[#c53030] text-white px-5 py-3 flex items-center justify-between text-xs font-secondary">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              <strong>Mediation Specialist Joined:</strong> Chat is paused while
              our team reviews your hardware report. Your ₦850,000 remains safe.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider bg-black/25 px-2.5 py-0.5 shrink-0">
            Under Review
          </span>
        </div>
      )}

      {/* 3. Polite Trust Shield Toast */}
      {regexWarning && (
        <div className="bg-[#ecc94b]/20 border-b border-[#ecc94b]/50 text-[#975a16] px-5 py-3 flex items-start justify-between gap-3 text-xs font-secondary">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#975a16]" />
            <span>{regexWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setRegexWarning(null)}
            className="text-[#975a16] hover:text-[#111113] p-0.5"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 4. Message & Milestone Stream */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8F7F4]"
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
          const initials = isMe ? "AD" : "CG";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-end gap-2.5 max-w-[88%] sm:max-w-[80%]",
                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Sender Avatar */}
              <div
                className={cn(
                  "h-7 w-7 rounded-full shrink-0 font-mono text-[10px] font-bold flex items-center justify-center",
                  isMe
                    ? "bg-[#FF5A25] text-white"
                    : "bg-[#111113] text-white"
                )}
              >
                {initials}
              </div>

              <div
                className={cn(
                  "flex flex-col",
                  isMe ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-1 px-0.5">
                  <span className="font-primary text-[11px] font-bold text-[#111113]/75">
                    {isMe ? "You (Adeola)" : msg.senderName}
                  </span>
                  <span className="font-mono text-[10px] text-[#111113]/50">
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  className={cn(
                    "p-3.5 text-xs sm:text-[13px] font-secondary leading-relaxed",
                    isMe
                      ? "bg-[#111113] text-white"
                      : "bg-white text-[#111113] border border-[#111113]/12"
                  )}
                >
                  <p>{msg.text}</p>

                  {msg.attachmentUrl && (
                    <div className="mt-2.5 border border-white/15 bg-black/20 overflow-hidden">
                      <img
                        src={msg.attachmentUrl}
                        alt={msg.attachmentCaption || "Shared gadget photo"}
                        className="h-36 w-full object-cover"
                      />
                      {msg.attachmentCaption && (
                        <div className="px-2.5 py-1.5 text-[10px] font-mono text-white/80 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
                          <span>{msg.attachmentCaption}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isMe && (
                  <div className="flex items-center gap-1 mt-1 px-0.5 text-[10px] font-mono text-[#15803d]">
                    <CheckCheck className="h-3 w-3" />
                    <span>Delivered • Saved to Trade Record</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Quick Replies & Friendly Input Dock */}
      <div className="bg-white border-t border-[#111113]/12 p-3.5 sm:p-4 space-y-3">
        {isDisputed ? (
          <div className="bg-[#F0EFEA] border border-[#111113]/12 p-3 text-center font-secondary text-xs text-[#111113]/75">
            Direct chat is paused while your dedicated mediation officer reviews
            the inspection photos.
          </div>
        ) : (
          <>
            {/* One-Tap Quick Reply Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#111113]/50 shrink-0 flex items-center gap-1 pr-1">
                <Sparkles className="h-3 w-3 text-[#FF5A25]" />
                <span>Quick reply:</span>
              </span>
              {QUICK_REPLIES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => pushMessage(suggestion)}
                  className="shrink-0 px-2.5 py-1 border border-[#111113]/15 bg-[#F8F7F4] hover:bg-[#111113] hover:text-white hover:border-[#111113] text-[11px] font-secondary text-[#111113]/80 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleShareUnboxingPhoto}
                title="Share a quick unboxing photo in chat"
                className="h-11 px-3 border border-[#111113]/15 bg-[#F8F7F4] text-[#111113] hover:border-[#111113] transition-colors inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-bold shrink-0"
              >
                <ImageIcon className="h-4 w-4 text-[#FF5A25]" />
                <span className="hidden sm:inline">Share Photo</span>
              </button>

              {onOpenEvidenceModal && (
                <button
                  type="button"
                  onClick={onOpenEvidenceModal}
                  title="Report a hardware issue"
                  className="h-11 w-11 border border-[#111113]/15 bg-[#F8F7F4] text-[#111113]/70 hover:text-[#111113] hover:border-[#111113] transition-colors flex items-center justify-center shrink-0"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a message to Chidi Gadgets..."
                className="flex-1 h-11 px-3.5 rounded-none border border-[#111113]/15 bg-white text-xs sm:text-sm font-secondary text-[#111113] outline-none focus:border-[#111113] focus:ring-1 focus:ring-[#111113]"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn-primary h-11 px-5 rounded-full bg-[#111113] text-white hover:bg-[#FF5A25] disabled:opacity-40 text-xs font-mono uppercase tracking-wider font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatMessageList;
