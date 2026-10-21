"use client";

import React, { useState } from "react";
import { Check, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ProfileDetailsForm Component (Phase 5 §1 - Settings & Profile)
 *
 * Requirements (5_screen_flows.md & 4_ui_system.md):
 * - User legal profile name, business display name, verified email, phone.
 * - FormHelperText: Geist 14px.
 * - Token Compliance: 8px container radius, 4px controls, 200ms ease-out transitions.
 */

export interface ProfileDetailsFormProps {
  className?: string;
  onSave?: (data: any) => void;
}

export function ProfileDetailsForm({ className, onSave }: ProfileDetailsFormProps) {
  const [legalName, setLegalName] = useState("Adeola Fashola");
  const [storeName, setStoreName] = useState("Adeola Tech Hub");
  const [email, setEmail] = useState("adeola.fashola@gmail.com");
  const [phone, setPhone] = useState("+234 803 849 1029");
  const [location, setLocation] = useState("Ikeja, Lagos State");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    onSave?.({ legalName, storeName, email, phone, location });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-[8px] border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.06)] space-y-6",
        className
      )}
    >
      <div className="pb-4 border-b border-[#e2e8f0]">
        <h3 className="font-primary text-base font-bold text-[#020617]">
          Profile & Store Identity
        </h3>
        <p className="font-secondary text-xs text-[#64748b] mt-1">
          Your legal name is locked to your SmileID NIN verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Legal Name (Locked to KYC) */}
        <div>
          <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
            Legal Name (NIN Locked)
          </label>
          <input
            type="text"
            value={legalName}
            disabled
            className="w-full h-11 px-3 rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] text-xs font-secondary text-[#64748b] cursor-not-allowed outline-none"
          />
          <p className="font-secondary text-[11px] text-[#64748b] mt-1">
            Verified by National Identity Management Commission.
          </p>
        </div>

        {/* Store Name */}
        <div>
          <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
            Marketplace Merchant Name
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full h-11 px-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none"
          />
          <p className="font-secondary text-[11px] text-[#64748b] mt-1">
            Displayed publicly on your gadget listings.
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
            Notification Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="font-primary text-xs font-semibold text-[#020617] uppercase tracking-wider block mb-1">
            Pickup & Dispatch City
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-11 px-3 rounded-[4px] border border-[#e2e8f0] bg-white text-xs font-secondary text-[#020617] focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="default"
          size="sm"
          className="h-10 px-5 text-xs font-semibold gap-1.5 shadow-xs"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 text-[#22c55e]" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Update Profile</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default ProfileDetailsForm;
