"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserX, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adminApi,
  type PendingStaffInvitationDTO,
  type StaffMemberDTO,
} from "@/lib/api";
import { useAuth } from "@/components/providers/AuthContext";

/**
 * Admin-only list of admins and mediators. Deactivating someone signs them out
 * everywhere at once and returns their open cases to the unassigned queue.
 */
export function StaffManagementPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMemberDTO[]>([]);
  const [pending, setPending] = useState<PendingStaffInvitationDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const applyResult = useCallback(
    (result: Awaited<ReturnType<typeof adminApi.listStaff>>) => {
      if (!result.ok || !result.data) {
        setError(result.error || "Could not load staff.");
        return;
      }
      setError(null);
      setStaff(result.data.staff);
      setPending(result.data.pendingInvitations);
    },
    []
  );

  const load = useCallback(() => adminApi.listStaff().then(applyResult), [applyResult]);

  // Initial load, and reload whenever a new invitation is created.
  useEffect(() => {
    let active = true;
    adminApi.listStaff().then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyResult, refreshKey]);

  const toggleActive = async (member: StaffMemberDTO) => {
    const deactivating = member.isActive;
    if (
      deactivating &&
      !window.confirm(
        `Deactivate ${member.name}? They will be signed out immediately and their open cases returned to the queue.`
      )
    ) {
      return;
    }
    setBusyId(member.id);
    setNotice(null);
    const result = await adminApi.setStaffActive(member.id, !deactivating);
    setBusyId(null);
    if (!result.ok || !result.data) {
      setError(result.error || "Could not update this staff member.");
      return;
    }
    setError(null);
    setNotice(
      deactivating
        ? `${member.name} deactivated. ${result.data.casesUnassigned} open case(s) returned to the queue.`
        : `${member.name} reactivated.`
    );
    void load();
  };

  const revokeInvitation = async (email: string) => {
    setBusyId(email);
    const result = await adminApi.revokeMediatorInvitation(email);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error || "Could not cancel the invitation.");
      return;
    }
    setNotice(`Invitation for ${email} cancelled.`);
    void load();
  };

  return (
    <section className="border border-ink-faint bg-surface p-5 space-y-4 rounded-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-primary text-base font-bold tracking-[-0.03em]">Staff access</h2>
          <p className="mt-1 text-xs text-ink/65">
            Admins and mediators who can work disputes. Deactivating someone signs them out
            everywhere and returns their open cases to the queue.
          </p>
        </div>
        <ShieldCheck className="h-5 w-5 shrink-0 text-trust" aria-hidden="true" />
      </div>

      {error && <p role="alert" className="text-xs text-state-error-strong">{error}</p>}
      {notice && <p role="status" className="text-xs text-trust-strong">{notice}</p>}

      <ul className="divide-y divide-ink-faint border border-ink-faint rounded-card">
        {staff.length === 0 && !error && (
          <li className="p-4 text-xs text-ink/60">Loading staff…</li>
        )}
        {staff.map((member) => {
          const isSelf = member.id === user?.id;
          return (
            <li key={member.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-primary text-sm font-bold text-ink truncate">{member.name}</span>
                  <span className="font-mono text-caption uppercase tracking-wider bg-surface-muted text-ink/70 px-1.5 py-0.5">
                    {member.role}
                  </span>
                  {!member.isActive && (
                    <span className="font-mono text-caption uppercase tracking-wider bg-state-error/15 text-state-error-strong px-1.5 py-0.5">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-ink/65 truncate">{member.email}</p>
              </div>
              {!isSelf && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === member.id}
                  onClick={() => void toggleActive(member)}
                  className={cn(
                    "gap-1.5 rounded-full",
                    member.isActive && "text-state-error-strong border-state-error/40"
                  )}
                >
                  {member.isActive ? (
                    <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{member.isActive ? "Deactivate" : "Reactivate"}</span>
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {pending.length > 0 && (
        <div className="space-y-2">
          <span className="label block">Pending invitations</span>
          <ul className="divide-y divide-ink-faint border border-ink-faint rounded-card">
            {pending.map((inv) => (
              <li key={inv.email} className="flex items-center justify-between gap-4 p-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-ink truncate">{inv.email}</p>
                  <p className="text-meta text-ink/60">
                    Expires {new Date(inv.expiresAt).toLocaleString("en-NG")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === inv.email}
                  onClick={() => void revokeInvitation(inv.email)}
                  className="gap-1 text-xs"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Cancel</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default StaffManagementPanel;
