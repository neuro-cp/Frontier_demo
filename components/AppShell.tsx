"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useWorkspace } from "@/components/WorkspaceContext";

type WorkspaceDisplaySettings = {
  workspaceId: string;
  workspaceNickname?: string;
  businessType?: string;
  userDisplayName?: string;
  userEmail?: string;
};

const businessTypes = [
  "Landscaping",
  "Tree Service",
  "Lawn Care",
  "Snow Removal",
  "Property Management",
  "Construction",
  "Auto Repair",
  "IT Services",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Restaurant",
  "Property Maintenance",
  "Other",
];

function loadWorkspaceSettings(workspaceId: string): WorkspaceDisplaySettings | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem("frontier-settings");
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return null;

    return (
      parsed.find(
        (item: WorkspaceDisplaySettings) => item.workspaceId === workspaceId
      ) ?? null
    );
  } catch {
    return null;
  }
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("Landscaping");
  const [customWorkspaceType, setCustomWorkspaceType] = useState("");
  const [displaySettings, setDisplaySettings] =
    useState<WorkspaceDisplaySettings | null>(null);

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    addWorkspace,
  } = useWorkspace();

  useEffect(() => {
    const savedTheme = localStorage.getItem("frontier-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    function refreshDisplaySettings() {
      setDisplaySettings(loadWorkspaceSettings(activeWorkspace.id));
    }

    refreshDisplaySettings();

    window.addEventListener("storage", refreshDisplaySettings);
    window.addEventListener("frontier-settings-updated", refreshDisplaySettings);

    return () => {
      window.removeEventListener("storage", refreshDisplaySettings);
      window.removeEventListener(
        "frontier-settings-updated",
        refreshDisplaySettings
      );
    };
  }, [activeWorkspace.id]);

  const displayedWorkspaceName =
    displaySettings?.workspaceNickname?.trim() || activeWorkspace.name;

  const displayedWorkspaceType =
    displaySettings?.businessType?.trim() || activeWorkspace.type;

  const displayedUserName =
    displaySettings?.userDisplayName?.trim() || "Nicholas Thompson";

  const displayedUserEmail =
    displaySettings?.userEmail?.trim() || "thomp3ns@gmail.com";

  function toggleDarkMode() {
    const nextMode = !darkMode;

    setDarkMode(nextMode);

    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("frontier-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("frontier-theme", "light");
    }
  }

  function resetNewWorkspaceForm() {
    setWorkspaceName("");
    setWorkspaceType("Landscaping");
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
      workspaceType === "Other" ? customWorkspaceType.trim() : workspaceType;

    if (!resolvedType) return;

    addWorkspace({
      id: crypto.randomUUID(),
      name: workspaceName.trim(),
      type: resolvedType,
    });

    resetNewWorkspaceForm();
    setNewWorkspaceOpen(false);
  }

  function getWorkspaceDisplayName(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = loadWorkspaceSettings(workspace.id);
    return saved?.workspaceNickname?.trim() || workspace.name;
  }

  function getWorkspaceDisplayType(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = loadWorkspaceSettings(workspace.id);
    return saved?.businessType?.trim() || workspace.type;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-gray-100 dark:bg-gray-950">
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6 lg:px-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <button
              onClick={() => {
                setWorkspaceOpen(!workspaceOpen);
                setUserOpen(false);
              }}
              className="flex max-w-[52vw] items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 sm:max-w-none"
            >
              <span className="text-blue-600">▤</span>

              <span className="truncate font-semibold">
                {displayedWorkspaceName}
              </span>

              <span className="text-gray-500">⌄</span>
            </button>

            {workspaceOpen && (
              <div className="absolute left-0 top-14 z-50 w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
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
                    <span className="mt-1 text-xl">▤</span>

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

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
            <button
              onClick={toggleDarkMode}
              className="rounded-full px-3 py-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950">
                  ♙
                </span>

                <span className="hidden max-w-48 truncate font-semibold md:block">
                  {displayedUserName}
                </span>

                <span className="text-gray-500">⌄</span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-14 z-50 w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
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

                  <button className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="text-xl">↪</span>

                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>

        {newWorkspaceOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">New Workspace</h2>

                <button
                  onClick={closeNewWorkspaceModal}
                  className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="Workspace Name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                />

                <select
                  value={workspaceType}
                  onChange={(event) => setWorkspaceType(event.target.value)}
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
                    onChange={(event) =>
                      setCustomWorkspaceType(event.target.value)
                    }
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
    </div>
  );
}