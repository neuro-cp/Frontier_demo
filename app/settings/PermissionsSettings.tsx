"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { isUuid } from "@/lib/db/ids";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PermissionsSettingsProps = {
  activeWorkspaceId: string;
  activeWorkspaceName: string;
  setSavedNotice: (message: string) => void;
};

type WorkspaceRole = "Owner" | "Manager" | "Employee";
type MemberRow = {
  id: string;
  user_id: string | null;
  role: WorkspaceRole;
  status: "Active" | "Invited" | "Removed";
  invited_email: string | null;
  created_at: string;
  profiles?: { email: string | null; display_name: string | null } | null;
};

const roles = [
  {
    name: "Owner",
    color: "text-purple-600",
    description:
      "Full access. Can manage settings, billing, team members, clients, invoices, jobs, inventory, and documents.",
  },
  {
    name: "Manager",
    color: "text-blue-600",
    description:
      "Can manage daily operations, clients, jobs, invoices, calendar, inventory, logistics, and documents.",
  },
  {
    name: "Employee",
    color: "text-gray-700 dark:text-gray-300",
    description:
      "Can view assigned jobs, update job notes, view calendar, and access limited client/job information.",
  },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100";

export default function PermissionsSettings({
  activeWorkspaceId,
  activeWorkspaceName,
  setSavedNotice,
}: PermissionsSettingsProps) {
  const { user } = useAuthSession();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("Employee");
  const [inviteInstruction, setInviteInstruction] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [memberLoadError, setMemberLoadError] = useState("");

  const supabase = useMemo(() => (user ? createBrowserSupabaseClient() : null), [user]);
  const currentMember = members.find((member) => member.user_id === user?.id);
  const canManageMembers =
    currentMember?.role === "Owner" || currentMember?.role === "Manager";

  useEffect(() => {
    if (!supabase) return;
    if (!isUuid(activeWorkspaceId)) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setMembers((current) => (current.length > 0 ? [] : current));
        setMemberLoadError((current) => (current ? "" : current));
      });
      return () => {
        cancelled = true;
      };
    }
    let cancelled = false;
    supabase
      .from("workspace_members")
      .select("id, user_id, role, status, invited_email, created_at")
      .eq("workspace_id", activeWorkspaceId)
      .neq("status", "Removed")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setMemberLoadError(error.message || "Unable to load members.");
          setMembers([]);
          return;
        }
        setMemberLoadError("");
        setMembers((data ?? []) as unknown as MemberRow[]);
      });
    return () => { cancelled = true; };
  }, [activeWorkspaceId, supabase]);

  if (!user) {
    return <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">Sign in to manage members.</section>;
  }

  function closeInviteModal() {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("Employee");
    setInviteInstruction("");
    setIsInviting(false);
  }

  function buildInviteInstruction(email: string) {
    const origin = window.location.origin;
    return [
      `${activeWorkspaceName} invited you to Frontier.`,
      `Use this email address: ${email}`,
      `Create an account or sign in here: ${origin}/signup`,
      "After login, Frontier will automatically connect you to the invited workspace.",
    ].join("\n");
  }

  async function copyInviteInstruction() {
    if (!inviteInstruction) return;
    await navigator.clipboard.writeText(inviteInstruction);
    setSavedNotice("Invite instructions copied.");
  }

  async function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    if (!isUuid(activeWorkspaceId)) {
      setSavedNotice("Create a workspace before inviting members.");
      return;
    }
    if (!canManageMembers) {
      setSavedNotice("Only Owners and Managers can invite members.");
      return;
    }

    setIsInviting(true);
    setInviteInstruction("");

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    const response = await fetch("/api/workspace-members/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        email: normalizedEmail,
        role: inviteRole,
      }),
    });
    const payload = (await response.json()) as {
      member?: MemberRow;
      error?: string;
    };

    if (!response.ok || !payload.member) {
      setSavedNotice(payload.error || "Unable to save invite.");
      setIsInviting(false);
      return;
    }

    setMembers((current) => {
      const nextMember = payload.member as MemberRow;
      const withoutExisting = current.filter(
        (member) => member.id !== nextMember.id
      );
      return [nextMember, ...withoutExisting];
    });

    const fallbackInstruction = buildInviteInstruction(normalizedEmail);
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setIsInviting(false);

    if (emailError) {
      setInviteInstruction(fallbackInstruction);
      setSavedNotice(
        "Invite saved. Email could not be sent, so use the copyable instructions."
      );
      return;
    }

    setInviteEmail("");
    setInviteRole("Employee");
    setInviteOpen(false);
    setSavedNotice("Invite saved and email sent.");
  }

  async function updateRole(member: MemberRow, role: WorkspaceRole) {
    if (!isUuid(activeWorkspaceId)) return setSavedNotice("Create a workspace first.");
    const ownerCount = members.filter((item) => item.role === "Owner" && item.status !== "Removed").length;
    if (member.role === "Owner" && role !== "Owner" && ownerCount <= 1) {
      setSavedNotice("Cannot change the last Owner.");
      return;
    }
    const response = await fetch("/api/workspace-members/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        memberId: member.id,
        role,
      }),
    });
    const payload = (await response.json()) as {
      member?: MemberRow;
      error?: string;
    };
    if (!response.ok || !payload.member) {
      setSavedNotice(payload.error || "Unable to update member role.");
      return;
    }
    setMembers((current) =>
      current.map((item) => item.id === member.id ? payload.member as MemberRow : item)
    );
  }

  async function removeMember(member: MemberRow) {
    if (!isUuid(activeWorkspaceId)) return setSavedNotice("Create a workspace first.");
    const ownerCount = members.filter((item) => item.role === "Owner" && item.status !== "Removed").length;
    if (member.role === "Owner" && ownerCount <= 1) {
      setSavedNotice("Cannot remove the last Owner.");
      return;
    }
    const response = await fetch("/api/workspace-members/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        memberId: member.id,
        status: "Removed",
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setSavedNotice(payload.error || "Unable to remove member.");
      return;
    }
    setMembers((current) => current.filter((item) => item.id !== member.id));
  }

  function getMemberLabel(member: MemberRow) {
    if (member.profiles?.email) return member.profiles.email;
    if (member.invited_email) return member.invited_email;
    if (member.user_id === user?.id && user.email) return user.email;
    return member.user_id || "-";
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Team Members</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Invite and manage access for {activeWorkspaceName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={!canManageMembers}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Invite Member
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          {memberLoadError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {memberLoadError}
            </div>
          )}

          <table className="w-full min-w-[760px]">
            <thead><tr className="text-left text-sm text-gray-500"><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3">{getMemberLabel(member)}</td>
                  <td className="p-3">
                    <select value={member.role} onChange={(e) => updateRole(member, e.target.value as WorkspaceRole)} disabled={!canManageMembers} className={inputClass}>
                      <option>Owner</option><option>Manager</option><option>Employee</option>
                    </select>
                  </td>
                  <td className="p-3">{member.status}</td>
                  <td className="p-3">{new Date(member.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right"><button type="button" onClick={() => removeMember(member)} disabled={!canManageMembers} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">Remove</button></td>
                </tr>
              ))}
              {members.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No team members saved yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-2xl font-bold">Role Permissions</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.name}
              className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
            >
              <h3 className={`text-lg font-bold ${role.color}`}>
                {role.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Invite Team Member</h2>

              <button
                type="button"
                onClick={closeInviteModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                -
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as WorkspaceRole)}
                  className={inputClass}
                >
                  <option>Owner</option>
                  <option>Manager</option>
                  <option>Employee</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isInviting}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>

              {inviteInstruction && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Email delivery is not available yet. Share this instead.
                  </p>
                  <textarea
                    readOnly
                    value={inviteInstruction}
                    className="mt-3 h-32 w-full rounded-lg border border-amber-200 bg-white p-3 text-sm text-gray-950 dark:border-amber-900 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={copyInviteInstruction}
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Copy Instructions
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
