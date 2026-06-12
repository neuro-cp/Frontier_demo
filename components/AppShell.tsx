"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  useWorkspace,
  workspaces,
} from "@/components/WorkspaceContext";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const { activeWorkspace, setActiveWorkspace } = useWorkspace();

  useEffect(() => {
    const savedTheme = localStorage.getItem("frontier-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

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

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <button
              onClick={() => {
                setWorkspaceOpen(!workspaceOpen);
                setUserOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <span className="text-blue-600">
                ▤
              </span>

              <span className="font-semibold">
                {activeWorkspace.name}
              </span>

              <span className="text-gray-500">
                ⌄
              </span>
            </button>

            {workspaceOpen && (
              <div className="absolute left-0 top-14 z-50 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
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
                    <span className="mt-1 text-xl">
                      ▤
                    </span>

                    <span>
                      <span className="block font-semibold">
                        {workspace.name}
                      </span>

                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {workspace.type}
                      </span>
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => setWorkspaceOpen(false)}
                  className="flex w-full items-center gap-4 border-t border-gray-200 px-4 py-4 text-left hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">
                    +
                  </span>

                  <span className="font-medium">
                    New Workspace
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-8">
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

                <span className="font-semibold">
                  Nicholas Thompson
                </span>

                <span className="text-gray-500">
                  ⌄
                </span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 px-4 py-4 font-semibold dark:border-gray-700">
                    thomp3ns@gmail.com
                  </div>

                  <button className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="text-xl">
                      ↪
                    </span>

                    <span className="font-medium">
                      Sign Out
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}