"use client";

import React from "react";
import { Lock, MessageSquare, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ReadonlyChatTranscript Component (Phase 6 §1 - Arbitration Room)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - Displays immutable forensic chat ledger between buyer & seller for arbitration.
 * - Shows masked contact violations, milestone bubbles, and messages.
 * - Token Compliance: 8px container radius, 4px badges, Geist Mono timestamps.
 */

export interface TranscriptMessage {
  id: string;
  sender: "buyer" | "seller" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  hasMaskedContent?: boolean;
}

export const SAMPLE_TRANSCRIPT: TranscriptMessage[] = [
  {
    id: "tr-1",
    sender: "system",
    senderName: "SYSTEM LEDGER",
    text: "🟢 ₦850,000 locked in Paystack Escrow Vault by Buyer Adeola Fashola.",
    timestamp: "10:14 AM",
  },
  {
    id: "tr-2",
    sender: "seller",
    senderName: "Chidi Tech Hub (Seller)",
    text: "Thanks Adeola, packing the iPhone 14 Pro Max now. Original box, 97% battery health.",
    timestamp: "10:18 AM",
  },
  {
    id: "tr-3",
    sender: "seller",
    senderName: "Chidi Tech Hub (Seller)",
    text: "You can also text me on [CONTACT INFO HIDDEN] if courier delays.",
    timestamp: "10:20 AM",
    hasMaskedContent: true,
  },
  {
    id: "tr-4",
    sender: "system",
    senderName: "SYSTEM LEDGER",
    text: "🚚 GIG Logistics Waybill #GIG-948102-LOS Dispatched with tamper-evident seal.",
    timestamp: "11:45 AM",
  },
  {
    id: "tr-5",
    sender: "buyer",
    senderName: "Adeola Fashola (Buyer)",
    text: "Package received today, but battery health is showing 78% in iOS Settings and 3uTools!",
    timestamp: "Yesterday 04:30 PM",
  },
  {
    id: "tr-6",
    sender: "system",
    senderName: "SYSTEM LEDGER",
    text: "⚠️ DISPUTE OPENED by Buyer: Screen & Battery Misrepresentation. Funds frozen in escrow.",
    timestamp: "Yesterday 04:35 PM",
  },
];

export interface ReadonlyChatTranscriptProps {
  messages?: TranscriptMessage[];
  className?: string;
}

export function ReadonlyChatTranscript({
  messages = SAMPLE_TRANSCRIPT,
  className,
}: ReadonlyChatTranscriptProps) {
  return (
    <div
      className={cn(
        "border border-[#111113]/12 bg-white flex flex-col h-[520px] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#111113]/12 bg-[#F8F7F4]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#111113]" />
          <h4 className="font-primary text-xs font-bold text-[#111113] tracking-[-0.02em]">
            Forensic P2P Chat Transcript
          </h4>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider bg-[#111113] text-white px-2 py-0.5 font-bold">
          Immutable Evidence Record
        </span>
      </div>

      {/* Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F4]/60">
        {messages.map((m) => {
          const isSystem = m.sender === "system";
          const isBuyer = m.sender === "buyer";

          return (
            <div
              key={m.id}
              className={cn(
                "p-3 text-xs font-secondary space-y-1",
                isSystem
                  ? "bg-[#ecc94b]/20 border border-[#ecc94b]/40 text-[#975a16]"
                  : isBuyer
                  ? "bg-[#111113] text-white ml-6"
                  : "bg-white text-[#111113] border border-[#111113]/12 mr-6"
              )}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold">{m.senderName}</span>
                <span className="opacity-75 font-mono">{m.timestamp}</span>
              </div>

              <div className="leading-relaxed">{m.text}</div>

              {m.hasMaskedContent && (
                <div className="mt-1 font-mono text-[9px] text-[#f56565] font-bold">
                  [Trust Shield Flag: Off-Platform Contact Attempt Detected]
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReadonlyChatTranscript;
