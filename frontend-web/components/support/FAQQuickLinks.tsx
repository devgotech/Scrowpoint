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
    <div className={cn("bg-[#F8F7F4] border-b border-[#111113]/12 p-3 space-y-2", className)}>
      <div className="flex items-center gap-1.5 label">
        <HelpCircle className="h-3 w-3 text-[#22c55e]" />
        <span>Quick FAQ Suggestions:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((faq, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(faq)}
            className="text-[11px] font-secondary text-[#111113] bg-white border border-[#111113]/15 hover:bg-[#111113] hover:text-white px-2.5 py-1 rounded-full text-left transition-colors duration-150 cursor-pointer"
          >
            {faq}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FAQQuickLinks;
