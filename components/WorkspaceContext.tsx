"use client";

import { createContext, useContext, useState } from "react";

export type Workspace = {
  id: string;
  name: string;
  type: string;
};

export const workspaces: Workspace[] = [
  {
    id: "landscaping",
    name: "Landscaping",
    type: "Landscaping",
  },
  {
    id: "snow-removal",
    name: "Thompson Snow Removal",
    type: "Snow Removal",
  },
  {
    id: "properties",
    name: "Thompson Properties",
    type: "Property Management",
  },
];

type WorkspaceContextValue = {
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        setActiveWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}