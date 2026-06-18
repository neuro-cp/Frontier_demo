"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  removeStoredValue,
  storageKeys,
  useStoredJsonState,
  useStoredStringState,
} from "@/lib/clientStorage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { defaultBusinessTypes } from "@/lib/workspaceOptions";

type WorkspaceDisplaySettings = {
  workspaceId: string;
  workspaceNickname?: string;
  businessType?: string;
  userDisplayName?: string;
  userEmail?: string;
};

const localUserFallback = {
  name: "Local User",
  email: "local.user@frontier.local",
};

function getWorkspaceInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getUserInitials(name: string) {
  const initials = getWorkspaceInitials(name);
  return initials.slice(0, 2) || "LU";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthSession();
  const [theme, setTheme] = useStoredStringState(storageKeys.theme, "dark");
  const [allDisplaySettings] = useStoredJsonState<WorkspaceDisplaySettings[]>(
    storageKeys.settings,
    []
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [platformAdminCheck, setPlatformAdminCheck] = useState<{
    userId: string;
    isAdmin: boolean;
  } | null>(null);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState<string>(
    defaultBusinessTypes[0]
  );
  const [customWorkspaceType, setCustomWorkspaceType] = useState("");

  const {
    workspaces,
    activeWorkspace,
    adminViewWorkspace,
    setActiveWorkspace,
    addWorkspace,
  } = useWorkspace();

  const darkMode = theme !== "light";

  const displaySettings =
    allDisplaySettings.find(
      (item) => item.workspaceId === activeWorkspace.id
    ) ?? null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    supabase.rpc("is_platform_admin").then(({ data, error }) => {
      if (error) console.error("Unable to verify platform admin access.", error);
      if (!cancelled) {
        setPlatformAdminCheck({
          userId: user.id,
          isAdmin: Boolean(data),
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayedWorkspaceName =
    displaySettings?.workspaceNickname?.trim() || activeWorkspace.name;

  const displayedWorkspaceType =
    displaySettings?.businessType?.trim() || activeWorkspace.type;

  const displayedUserName =
    user?.email || displaySettings?.userDisplayName?.trim() || localUserFallback.name;

  const displayedUserEmail =
    user?.email || displaySettings?.userEmail?.trim() || localUserFallback.email;

  const displayedWorkspaceInitials =
    getWorkspaceInitials(displayedWorkspaceName);
  const displayedUserInitials = getUserInitials(displayedUserName);
  const isPlatformAdmin =
    Boolean(user) &&
    platformAdminCheck?.userId === user?.id &&
    Boolean(platformAdminCheck?.isAdmin);

  function toggleDarkMode() {
    const nextMode = !darkMode;
    setTheme(nextMode ? "dark" : "light");
  }

  function resetNewWorkspaceForm() {
    setWorkspaceName("");
    setWorkspaceType(defaultBusinessTypes[0]);
    setCustomWorkspaceType("");
  }

  function closeNewWorkspaceModal() {
    setNewWorkspaceOpen(false);
    setWorkspaceOpen(false);
    setUserOpen(false);
    resetNewWorkspaceForm();
  }

  function createWorkspace() {
    if (!workspaceName.trim()) return;

    const resolvedType =
      workspaceType === "Other"
        ? customWorkspaceType.trim()
        : workspaceType;

    if (!resolvedType) return;

    const newWorkspace = {
      id: crypto.randomUUID(),
      name: workspaceName.trim(),
      type: resolvedType,
    };

    addWorkspace(newWorkspace);
    setActiveWorkspace(newWorkspace);

    resetNewWorkspaceForm();
    setNewWorkspaceOpen(false);
    setWorkspaceOpen(false);
  }

  function getWorkspaceDisplayName(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = allDisplaySettings.find(
      (item) => item.workspaceId === workspace.id
    );
    return saved?.workspaceNickname?.trim() || workspace.name;
  }

  function getWorkspaceDisplayType(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = allDisplaySettings.find(
      (item) => item.workspaceId === workspace.id
    );
    return saved?.businessType?.trim() || workspace.type;
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function exitAdminView() {
    const workspaceId = adminViewWorkspace?.id ?? null;
    const targetUserId =
      window.localStorage.getItem(storageKeys.adminViewUserId) || null;

    try {
      await fetch("/api/frontier-admin/view-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "exit",
          workspaceId,
          userId: targetUserId,
        }),
      });
    } finally {
      removeStoredValue(storageKeys.adminViewAdminUserId);
      removeStoredValue(storageKeys.adminViewWorkspaceId);
      removeStoredValue(storageKeys.adminViewWorkspaceName);
      removeStoredValue(storageKeys.adminViewWorkspaceType);
      removeStoredValue(storageKeys.adminViewUserId);
      window.location.href = "/frontier-admin";
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      {adminViewWorkspace && (
        <div className="relative z-[2100] flex flex-col gap-2 border-b border-amber-300 bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="font-semibold">
            Admin View Mode: {adminViewWorkspace.name}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/frontier-admin"
              className="rounded-lg bg-amber-700 px-3 py-2 font-semibold text-white hover:bg-amber-800"
            >
              Back to Admin
            </Link>
            <button
              type="button"
              onClick={exitAdminView}
              className="rounded-lg bg-gray-900 px-3 py-2 font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950"
            >
              Exit Admin View
            </button>
          </div>
        </div>
      )}

      <header className="relative z-[2000] flex h-20 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-0">
            <button
              onClick={() => {
                setWorkspaceOpen(!workspaceOpen);
                setUserOpen(false);
              }}
              className="flex max-w-[150px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 sm:max-w-[260px]"
            >


              {/* Mobile: initials only */}
              <span className="font-semibold sm:hidden">
                {displayedWorkspaceInitials}
              </span>

              {/* Tablet/Desktop: full workspace name */}
              <span className="hidden truncate font-semibold sm:inline">
                {displayedWorkspaceName}
              </span>

            </button>

            {workspaceOpen && (
              <div className="absolute left-0 top-14 z-[2100] w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Workspaces
                </div>

                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setActiveWorkspace(workspace);
                      setWorkspaceOpen(false);
                    }}
                    className={`flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      activeWorkspace.id === workspace.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >


                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {getWorkspaceDisplayName(workspace)}
                      </span>
                      <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                        {getWorkspaceDisplayType(workspace)}
                      </span>
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setNewWorkspaceOpen(true);
                  }}
                  className="flex w-full items-center gap-4 border-t border-gray-200 px-4 py-4 text-left hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">+</span>
                  <span className="font-medium">New Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={toggleDarkMode}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setUserOpen(!userOpen);
                setWorkspaceOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950">
                {displayedUserInitials}
              </span>
              <span className="hidden max-w-32 truncate font-semibold lg:block">
                {displayedUserName}
              </span>
              <span className="hidden text-gray-500 sm:inline"></span>
            </button>

            {userOpen && (
              <div className="absolute right-0 top-14 z-[2100] w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                  <div className="font-semibold">{displayedUserName}</div>
                  <div className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                    {displayedUserEmail}
                  </div>
                </div>

                <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  {displayedWorkspaceName}
                  <br />
                  {displayedWorkspaceType}
                </div>

                {user ? (
                  <div className="grid grid-cols-1">
                    {isPlatformAdmin && (
                      <Link
                        href="/frontier-admin"
                        className="px-4 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserOpen(false)}
                      >
                        Frontier Admin
                      </Link>
                    )}
                    {isPlatformAdmin && adminViewWorkspace && (
                      <button
                        type="button"
                        onClick={exitAdminView}
                        className="px-4 py-3 text-left font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Exit Admin View
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1">
                    <Link href="/login" className="px-4 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Sign In</Link>
                    <Link href="/signup" className="px-4 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Create Account</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {newWorkspaceOpen && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">New Workspace</h2>

              <button
                onClick={closeNewWorkspaceModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                x
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Workspace Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <select
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                {defaultBusinessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              {workspaceType === "Other" && (
                <input
                  type="text"
                  value={customWorkspaceType}
                  onChange={(e) => setCustomWorkspaceType(e.target.value)}
                  placeholder="Specify Business Type"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              <button
                onClick={createWorkspace}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
