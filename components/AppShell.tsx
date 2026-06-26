"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createWorkspaceAction } from "@/lib/actions/workspaces";
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
  name: "Account",
  email: "Sign in to save and sync workspaces",
};

const welcomeDismissedKey = "frontier-welcome-dismissed";

function getWorkspaceInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getUserInitials(name: string) {
  const initials = getWorkspaceInitials(name);
  return initials.slice(0, 2) || "A";
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
  const [newWorkspaceError, setNewWorkspaceError] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [platformAdminCheck, setPlatformAdminCheck] = useState<{
    userId: string;
    isAdmin: boolean;
  } | null>(null);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState<string>(
    defaultBusinessTypes[0]
  );
  const [customWorkspaceType, setCustomWorkspaceType] = useState("");
  const [businessTypes, setBusinessTypes] = useState<string[]>([
    ...defaultBusinessTypes,
  ]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [neverShowWelcome, setNeverShowWelcome] = useState(false);

  const {
    workspaces,
    activeWorkspace,
    adminViewWorkspace,
    setActiveWorkspace,
    addWorkspace,
    workspaceError,
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
    queueMicrotask(() => {
      if (!cancelled) {
        setUserOpen(false);
      }
    });

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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/business-types")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { businessTypes?: string[] } | null) => {
        if (!cancelled && Array.isArray(data?.businessTypes)) {
          setBusinessTypes(data.businessTypes);
        }
      })
      .catch(() => {
        if (!cancelled) setBusinessTypes([...defaultBusinessTypes]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (window.localStorage.getItem(welcomeDismissedKey) === "true") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setShowWelcome(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const localVisibleWorkspaces = user
    ? workspaces
    : workspaces.filter((workspace) => workspace.id !== "local-workspace");

  const displayedWorkspaceName =
    !user && activeWorkspace.id === "local-workspace"
      ? "Create Workspace"
      : displaySettings?.workspaceNickname?.trim() || activeWorkspace.name;

  const displayedWorkspaceType =
    !user && activeWorkspace.id === "local-workspace"
      ? "Setup"
      : displaySettings?.businessType?.trim() || activeWorkspace.type;

  const displayedUserName =
    user?.email || displaySettings?.userDisplayName?.trim() || localUserFallback.name;

  const displayedUserEmail =
    user?.email || displaySettings?.userEmail?.trim() || localUserFallback.email;

  const displayedWorkspaceInitials =
    getWorkspaceInitials(displayedWorkspaceName);
  const displayedUserInitials = getUserInitials(displayedUserName);
  const hasWorkspaces = localVisibleWorkspaces.length > 0;
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
    setNewWorkspaceError("");
  }

  function closeNewWorkspaceModal() {
    setNewWorkspaceOpen(false);
    setWorkspaceOpen(false);
    setUserOpen(false);
    resetNewWorkspaceForm();
  }

  async function createWorkspace() {
    if (!workspaceName.trim()) return;
    if (isCreatingWorkspace) return;

    const resolvedType =
      workspaceType === "Other"
        ? customWorkspaceType.trim()
        : workspaceType;

    if (!resolvedType) return;
    setNewWorkspaceError("");
    setIsCreatingWorkspace(true);

    const newWorkspace = {
      id: crypto.randomUUID(),
      name: workspaceName.trim(),
      type: workspaceType,
      customType: workspaceType === "Other" ? resolvedType : undefined,
    };

    let created = false;
    try {
      const result = await createWorkspaceAction(
        { addWorkspace },
        newWorkspace
      );
      if (!result.ok) {
        setIsCreatingWorkspace(false);
        setNewWorkspaceError(result.error);
        return;
      }
      created = true;
    } catch (error) {
      setIsCreatingWorkspace(false);
      setNewWorkspaceError(
        error instanceof Error
          ? error.message
          : workspaceError || "Unable to create workspace."
      );
      return;
    }
    setIsCreatingWorkspace(false);
    if (!created) {
      setNewWorkspaceError(workspaceError || "Unable to create workspace.");
      return;
    }

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

  function closeWelcome() {
    if (neverShowWelcome) {
      window.localStorage.setItem(welcomeDismissedKey, "true");
    }
    setShowWelcome(false);
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

                {hasWorkspaces ? localVisibleWorkspaces.map((workspace) => (
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
                )) : (
                  <div className="px-4 py-5 text-sm text-gray-500 dark:text-gray-400">
                    Create a workspace to start using Frontier.
                  </div>
                )}

                <button
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setNewWorkspaceOpen(true);
                  }}
                  className="flex w-full items-center gap-4 border-t border-gray-200 px-4 py-4 text-left hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">+</span>
                  <span className="font-medium">Create Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <NotificationBell />

          <button
            onClick={toggleDarkMode}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen(!userOpen);
                  setWorkspaceOpen(false);
                }}
                className="flex items-center gap-2 rounded-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950">
                  {displayedUserInitials}
                </span>
                <span className="hidden max-w-48 truncate font-semibold lg:block">
                  {displayedUserName}
                </span>
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
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-100 dark:text-gray-950"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-800"
              >
                Sign up for free
              </Link>
            </div>
          )}
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
                {businessTypes.map((type) => (
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

              {newWorkspaceError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {newWorkspaceError}
                </div>
              )}

              <button
                onClick={createWorkspace}
                disabled={isCreatingWorkspace}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingWorkspace ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWelcome && (
        <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-2xl font-bold">Welcome to Frontier</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Start by creating a workspace for your business. After that you can add clients,
              jobs, estimates, invoices, documents, routes, and portal access from one place.
            </p>
            <label className="mt-5 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={neverShowWelcome}
                onChange={(event) => setNeverShowWelcome(event.target.checked)}
              />
              Do not show this message again
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  closeWelcome();
                  setNewWorkspaceOpen(true);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Create Workspace
              </button>
              <button
                type="button"
                onClick={closeWelcome}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold dark:border-gray-700"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
