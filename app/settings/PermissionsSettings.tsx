"use client";

import { useState } from "react";

type PermissionsSettingsProps = {
  activeWorkspaceName: string;
  setSavedNotice: (message: string) => void;
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
  activeWorkspaceName,
  setSavedNotice,
}: PermissionsSettingsProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Employee");

  function closeInviteModal() {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("Employee");
  }

  function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setInviteEmail("");
    setInviteRole("Employee");
    setInviteOpen(false);

    setSavedNotice("Invite placeholder saved.");
    window.setTimeout(() => setSavedNotice(""), 2500);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Team Members</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Invite placeholder for {activeWorkspaceName}. Real auth comes later.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Invite Member
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No team members saved yet.
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
                  onChange={(event) => setInviteRole(event.target.value)}
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
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Save Invite Placeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}