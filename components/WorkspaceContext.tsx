"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import {
  storageKeys,
  readStoredString,
  removeStoredValue,
  writeStoredString,
  useStoredJsonState,
  useStoredStringState,
} from "@/lib/clientStorage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type Workspace = {
  id: string;
  name: string;
  type: string;
  customType?: string;
  role?: WorkspaceRole;
};

export type WorkspaceRole = "Owner" | "Manager" | "Employee";

const createWorkspacePlaceholder: Workspace = {
  id: "create-workspace",
  name: "Create Workspace",
  type: "Setup",
};

const defaultWorkspaces: Workspace[] = [
  {
    id: "local-workspace",
    name: "Local Workspace",
    type: "Other",
  },
];

type WorkspaceContextValue = {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => Promise<boolean>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  adminViewWorkspace: Workspace | null;
  activeWorkspaceRole: WorkspaceRole;
  canManageWorkspace: boolean;
  canDeleteBusinessRecords: boolean;
  isLoadingWorkspaces: boolean;
  workspaceError: string | null;
};

const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

type WorkspacesResponse = {
  workspaces?: Workspace[];
  error?: string;
};

function getUserDisplayName(user: { email?: string; user_metadata?: object }) {
  const metadata = user.user_metadata as
    | {
        full_name?: string;
        name?: string;
      }
    | undefined;

  return metadata?.full_name || metadata?.name || user.email || "Frontier User";
}

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSupabaseConfigured, user } = useAuthSession();
  const [workspaces, setWorkspaces] = useStoredJsonState<Workspace[]>(
    storageKeys.workspaces,
    defaultWorkspaces
  );
  const [activeWorkspaceId, setActiveWorkspaceId] = useStoredStringState(
    storageKeys.activeWorkspace,
    defaultWorkspaces[0].id
  );
  const [databaseWorkspaces, setDatabaseWorkspaces] = useState<Workspace[]>([]);
  const [databaseActiveWorkspaceId, setDatabaseActiveWorkspaceId] = useState<
    string | null
  >(null);
  const [adminViewWorkspaceId] = useStoredStringState(
    storageKeys.adminViewWorkspaceId,
    ""
  );
  const [adminViewWorkspaceName] = useStoredStringState(
    storageKeys.adminViewWorkspaceName,
    ""
  );
  const [adminViewWorkspaceType] = useStoredStringState(
    storageKeys.adminViewWorkspaceType,
    ""
  );
  const [adminViewAdminUserId] = useStoredStringState(
    storageKeys.adminViewAdminUserId,
    ""
  );
  const [isPlatformAdminForViewMode, setIsPlatformAdminForViewMode] =
    useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const ensureSignedInWorkspace = useCallback(
    async (supabaseUser: NonNullable<typeof user>) => {
      const supabase = createBrowserSupabaseClient();
      const displayName = getUserDisplayName(supabaseUser);

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: supabaseUser.id,
          display_name: displayName,
          email: supabaseUser.email ?? null,
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      const { error: inviteError } = await supabase.rpc(
        "accept_workspace_invites_for_current_user"
      );

      if (inviteError) throw inviteError;

      const response = await fetch("/api/workspaces");
      const payload = (await response.json()) as WorkspacesResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load workspaces.");
      }

      const loadedWorkspaces = payload.workspaces ?? [];

      return loadedWorkspaces;
    },
    []
  );

  useEffect(() => {
    if (!isDatabaseMode || !user) {
      return;
    }

    let cancelled = false;
    const signedInUser = user;

    async function loadDatabaseWorkspaces() {
      setIsLoadingWorkspaces(true);
      setWorkspaceError(null);

      try {
        const loadedWorkspaces = await ensureSignedInWorkspace(signedInUser);
        if (cancelled) return;

        const savedActiveWorkspaceId = readStoredString(
          storageKeys.activeWorkspace,
          defaultWorkspaces[0].id
        );
        const nextActiveWorkspace =
          loadedWorkspaces.find(
            (workspace) => workspace.id === savedActiveWorkspaceId
          ) ?? loadedWorkspaces[0] ?? null;

        setDatabaseWorkspaces(loadedWorkspaces);
        setDatabaseActiveWorkspaceId(nextActiveWorkspace?.id ?? null);
        if (nextActiveWorkspace) {
          writeStoredString(storageKeys.activeWorkspace, nextActiveWorkspace.id);
        }
      } catch (error) {
        if (cancelled) return;

        setWorkspaceError(
          error instanceof Error
            ? error.message
            : "Unable to load workspaces."
        );
      } finally {
        if (!cancelled) {
          setIsLoadingWorkspaces(false);
        }
      }
    }

    loadDatabaseWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [ensureSignedInWorkspace, isDatabaseMode, user]);

  useEffect(() => {
    if (!isDatabaseMode || !user || !adminViewWorkspaceId) {
      return;
    }

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    supabase.rpc("is_platform_admin").then(({ data, error }) => {
      if (error) console.error("Unable to verify admin view mode.", error);
      if (!cancelled) setIsPlatformAdminForViewMode(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [adminViewWorkspaceId, isDatabaseMode, user]);

  const adminViewWorkspace = useMemo(() => {
    if (
      !isDatabaseMode ||
      !user ||
      adminViewAdminUserId !== user.id ||
      !isPlatformAdminForViewMode ||
      !adminViewWorkspaceId
    ) {
      return null;
    }

    return {
      id: adminViewWorkspaceId,
      name: adminViewWorkspaceName || "Admin View Workspace",
      type: adminViewWorkspaceType || "Other",
    };
  }, [
    adminViewAdminUserId,
    adminViewWorkspaceId,
    adminViewWorkspaceName,
    adminViewWorkspaceType,
    isDatabaseMode,
    isPlatformAdminForViewMode,
    user,
  ]);

  const visibleWorkspaces = isDatabaseMode ? databaseWorkspaces : workspaces;
  const visibleActiveWorkspaceId = isDatabaseMode
    ? databaseActiveWorkspaceId
    : activeWorkspaceId;

  const activeWorkspace: Workspace =
    useMemo<Workspace>(
      () =>
        adminViewWorkspace ??
        visibleWorkspaces.find(
          (workspace) => workspace.id === visibleActiveWorkspaceId
        ) ??
        visibleWorkspaces[0] ??
        (isDatabaseMode ? createWorkspacePlaceholder : defaultWorkspaces[0]),
      [adminViewWorkspace, isDatabaseMode, visibleActiveWorkspaceId, visibleWorkspaces]
    );
  const activeWorkspaceRole = (adminViewWorkspace
    ? "Owner"
    : activeWorkspace.role) ?? "Owner";
  const canManageWorkspace = activeWorkspaceRole === "Owner";
  const canDeleteBusinessRecords =
    activeWorkspaceRole === "Owner" || activeWorkspaceRole === "Manager";

  const addWorkspace = useCallback(async (workspace: Workspace) => {
    if (!isDatabaseMode || !user) {
      setWorkspaces((current) => [
        ...current,
        workspace,
      ]);

      setActiveWorkspaceId(workspace.id);
      return true;
    }

    setWorkspaceError(null);

    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        customType: workspace.customType,
      }),
    });
    const payload = (await response.json()) as {
      workspace?: Workspace;
      error?: string;
    };

    if (!response.ok || !payload.workspace) {
      const message = payload.error || "Unable to create workspace.";
      setWorkspaceError(message);
      throw new Error(message);
    }

    const createdWorkspace = payload.workspace;
    const loadedWorkspaces = await ensureSignedInWorkspace(user);
    const nextWorkspaces = loadedWorkspaces.some(
      (item) => item.id === createdWorkspace.id
    )
      ? loadedWorkspaces
      : [...loadedWorkspaces, createdWorkspace];

    setDatabaseWorkspaces(nextWorkspaces);
    setDatabaseActiveWorkspaceId(createdWorkspace.id);
    writeStoredString(storageKeys.activeWorkspace, createdWorkspace.id);
    return true;
  }, [ensureSignedInWorkspace, isDatabaseMode, setActiveWorkspaceId, setWorkspaces, user]);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    if (!isDatabaseMode || !user) {
      let nextActiveWorkspace = defaultWorkspaces[0];
      setWorkspaces((current) => {
        const nextWorkspaces = current.filter(
          (workspace) => workspace.id !== workspaceId
        );
        nextActiveWorkspace = nextWorkspaces[0] ?? defaultWorkspaces[0];
        return nextWorkspaces.length > 0 ? nextWorkspaces : defaultWorkspaces;
      });
      setActiveWorkspaceId(nextActiveWorkspace.id);
      return true;
    }

    const response = await fetch(`/api/workspaces?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setWorkspaceError(payload.error || "Unable to delete workspace.");
      return false;
    }

    let nextActiveWorkspaceId: string | null = null;
    setDatabaseWorkspaces((current) => {
      const nextWorkspaces = current.filter(
        (workspace) => workspace.id !== workspaceId
      );
      nextActiveWorkspaceId = nextWorkspaces[0]?.id ?? null;
      return nextWorkspaces;
    });
    setDatabaseActiveWorkspaceId(nextActiveWorkspaceId);
    if (nextActiveWorkspaceId) {
      writeStoredString(storageKeys.activeWorkspace, nextActiveWorkspaceId);
    } else {
      removeStoredValue(storageKeys.activeWorkspace);
    }

    return true;
  }, [isDatabaseMode, setActiveWorkspaceId, setWorkspaces, user]);

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    if (isDatabaseMode) {
      setDatabaseActiveWorkspaceId(workspace.id);
      writeStoredString(storageKeys.activeWorkspace, workspace.id);
      return;
    }

    setActiveWorkspaceId(workspace.id);
  }, [isDatabaseMode, setActiveWorkspaceId]);

  const contextValue = useMemo(
    () => ({
      workspaces: visibleWorkspaces,
      activeWorkspace,
      setActiveWorkspace,
      addWorkspace,
      deleteWorkspace,
      adminViewWorkspace,
      activeWorkspaceRole,
      canManageWorkspace,
      canDeleteBusinessRecords,
      isLoadingWorkspaces,
      workspaceError,
    }),
    [
      activeWorkspace,
      addWorkspace,
      activeWorkspaceRole,
      deleteWorkspace,
      adminViewWorkspace,
      canDeleteBusinessRecords,
      canManageWorkspace,
      isLoadingWorkspaces,
      setActiveWorkspace,
      visibleWorkspaces,
      workspaceError,
    ]
  );

  return (
    <WorkspaceContext.Provider
      value={contextValue}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider"
    );
  }

  return context;
}
