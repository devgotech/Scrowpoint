"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FAQQuickLinks Component
 *
 * Requirements (5_screen_flows.md Phase 5 §3 & 4_ui_system.md):
 * - Renders tap-friendly suggested FAQ pill items for instant inquiry routing.
 * - Controls: 4px radius (rounded-[4px]), 44px min-touch boundary friendly.
 */

export interface FAQQuickLinksProps {
  questions?: string[];
  onSelect: (question: string) => void;
  className?: string;
}

const DEFAULT_FAQS = [
  "How does the 48-hour inspection work?",
  "When does the seller receive payout?",
  "How do I open a dispute?",
  "What if the gadget has hidden carrier lock?",
];

export function FAQQuickLinks({
  questions = DEFAULT_FAQS,
  onSelect,
  className,
}: FAQQuickLinksProps) {
  return (
    <div className={cn("bg-[#f8fafc] border-b border-[#e2e8f0] p-3 space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#64748b]">
        <HelpCircle className="h-3 w-3 text-[#22c55e]" />
        <span>Quick FAQ Suggestions:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((faq, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(faq)}
            className="text-[11px] font-secondary text-[#0f172a] bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e1] px-2.5 py-1 rounded-[4px] text-left transition-colors duration-150 shadow-2xs"
          >
            {faq}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FAQQuickLinks;
