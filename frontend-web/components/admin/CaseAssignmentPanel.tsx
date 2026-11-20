"use client";

import { useEffect, useState } from "react";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi, type StaffMemberDTO } from "@/lib/api";

/**
 * Admin-only control to hand a dispute to a specific mediator (or admin).
 * Mediators can only see and rule on cases assigned to them.
 */
export function CaseAssignmentPanel({ caseId }: { caseId: string }) {
  const [staff, setStaff] = useState<StaffMemberDTO[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    adminApi.listStaff().then((result) => {
      if (!active || !result.ok || !result.data) return;
      setStaff(result.data.staff.filter((member) => member.isActive));
    });
    return () => {
      active = false;
    };
  }, []);

  const assign = async () => {
    if (!assigneeId) return;
    setIsSaving(true);
    const result = await adminApi.assignDispute(caseId, assigneeId);
    setIsSaving(false);
    const assignee = staff.find((member) => member.id === assigneeId);
    setMessage(
      result.ok
        ? { tone: "ok", text: `Case assigned to ${assignee?.name ?? "the selected staff member"}.` }
        : { tone: "error", text: result.error || "Could not assign this case." }
    );
  };

  return (
    <div className="border border-ink-faint bg-surface p-5 space-y-3 rounded-card">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 text-ink" aria-hidden="true" />
        <h4 className="font-primary text-sm font-bold text-ink tracking-[-0.02em]">Assign case</h4>
      </div>
      <p className="text-xs text-ink/65">
        Only the assigned mediator can see this case and rule on it. Staff who are the buyer or
        seller on the order can&apos;t be assigned.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor={`assign-${caseId}`}>
          Assign to
        </label>
        <select
          id={`assign-${caseId}`}
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          className="h-10 flex-1 border border-ink/15 bg-surface px-3 text-sm text-ink rounded-ui focus:border-ink focus:outline-none"
        >
          <option value="">Choose a mediator…</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.role})
            </option>
          ))}
        </select>
        <Button onClick={() => void assign()} disabled={!assigneeId || isSaving}>
          {isSaving ? "Assigning…" : "Assign"}
        </Button>
      </div>
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={message.tone === "error" ? "text-xs text-state-error-strong" : "text-xs text-trust-strong"}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

export default CaseAssignmentPanel;
