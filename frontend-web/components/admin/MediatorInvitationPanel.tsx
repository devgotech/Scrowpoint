"use client";

import { FormEvent, useState } from "react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function MediatorInvitationPanel() {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setInviteUrl("");
    setIsSubmitting(true);

    const result = await adminApi.createMediatorInvitation({ email });
    setIsSubmitting(false);
    if (!result.ok || !result.data) {
      setError(result.error || "Unable to create the mediator invitation.");
      return;
    }

    const url = new URL("/mediator-invite", window.location.origin);
    url.searchParams.set("token", result.data.token);
    setInviteUrl(url.toString());
    setEmail("");
    setMessage(`One-time invitation created for ${result.data.email}. It expires in 24 hours.`);
  };

  const copyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage("Invitation link copied. Share it directly with the invited mediator.");
    } catch (copyError) {
      console.error("Unable to copy the mediator invitation link.", copyError);
      setError("Could not copy the link. Select and copy it manually.");
    }
  };

  return (
    <section className="border border-[#111113]/12 bg-white p-5 space-y-4">
      <div>
        <h2 className="font-primary text-base font-bold tracking-[-0.03em]">
          Invite a mediator
        </h2>
        <p className="mt-1 text-xs text-[#111113]/65">
          Mediators can review and resolve disputes, but cannot manage accounts or KYC.
          The invitation link is single-use and expires after 24 hours.
        </p>
      </div>

      <form onSubmit={createInvitation} className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor="mediator-invite-email">
          Mediator email
        </label>
        <input
          id="mediator-invite-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mediator@example.com"
          className="min-w-0 flex-1 border border-[#111113]/20 px-3 py-2 text-sm outline-none focus:border-[#FF5A25]"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create invitation"}
        </Button>
      </form>

      {message && <p role="status" className="text-xs text-[#15803d]">{message}</p>}
      {error && <p role="alert" className="text-xs text-[#b91c1c]">{error}</p>}

      {inviteUrl && (
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="sr-only" htmlFor="mediator-invite-link">
            One-time mediator invitation link
          </label>
          <input
            id="mediator-invite-link"
            readOnly
            value={inviteUrl}
            className="min-w-0 flex-1 border border-[#111113]/20 bg-[#F8F7F4] px-3 py-2 text-xs"
          />
          <Button type="button" variant="outline" onClick={copyInvitation}>
            Copy link
          </Button>
        </div>
      )}
    </section>
  );
}
