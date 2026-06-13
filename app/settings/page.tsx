"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

const roles = [
  {
    name: "Owner",
    color: "text-purple-600",
    description:
      "Full access to all features. Manage workspace settings, billing, and team members.",
  },
  {
    name: "Manager",
    color: "text-blue-600",
    description:
      "Can manage clients, inventory, and scheduling. Cannot change workspace settings.",
  },
  {
    name: "Employee",
    color: "text-gray-700 dark:text-gray-300",
    description:
      "Can view assigned jobs and notes. Read-only access to other sections.",
  },
];

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();

  const [tab, setTab] = useState<"general" | "permissions">("general");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Invite sent to:", inviteEmail);
    console.log("Workspace:", activeWorkspace.name);

    setInviteEmail("");
    setInviteOpen(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
          Settings
        </h1>

        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Manage configuration for {activeWorkspace.name}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 rounded-xl bg-gray-100 p-1 sm:inline-flex sm:w-auto sm:flex-row dark:bg-gray-800">
        <button
          onClick={() => setTab("general")}
          className={`rounded-lg px-4 py-2 text-lg ${
            tab === "general"
              ? "bg-white text-gray-950 shadow dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          General
        </button>

        <button
          onClick={() => setTab("permissions")}
          className={`rounded-lg px-4 py-2 text-lg ${
            tab === "permissions"
              ? "bg-white text-gray-950 shadow dark:bg-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Permissions
        </button>
      </div>

      {tab === "general" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-lg font-medium text-gray-900 dark:text-gray-100">
                Workspace Name
              </label>

              <input
                value={activeWorkspace.name}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-xl text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-3 block text-lg font-medium text-gray-900 dark:text-gray-100">
                Business Type
              </label>

              <select
                defaultValue={activeWorkspace.name}
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 text-lg text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option>Landscaping</option>
                <option>Snow Removal</option>
                <option>Properties</option>
                <option>Construction</option>
                <option>Cleaning</option>
                <option>Property Maintenance</option>
                <option>Other</option>
              </select>
            </div>

            <button 
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
            >  
              Save Changes
            </button>
          </div>
        </div>
      )}

      {tab === "permissions" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                  Team Members
                </h2>

                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                  {activeWorkspace.name}
                </p>

                <p className="mt-8 text-lg text-gray-500 dark:text-gray-400">
                  No team members yet
                </p>
              </div>

              <button
                onClick={() => setInviteOpen(true)}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
              >
                Invite
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-6 text-2xl font-bold text-gray-950 dark:text-gray-100">
              Role Permissions
            </h2>

            <div className="space-y-5">
              {roles.map((role) => (
                <div
                  key={role.name}
                  className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                >
                  <h3 className={`text-lg font-bold ${role.color}`}>
                    {role.name}
                  </h3>

                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                Invite Team Member
              </h2>

              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                  Email Address *
                </label>

                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                  required
                  className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-lg text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setInviteEmail("");
                    setInviteOpen(false);
                  }}
                  className="w-full rounded-lg border border-gray-200 px-6 py-3 text-lg text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}