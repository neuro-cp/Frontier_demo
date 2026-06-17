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
  writeStoredString,
  useStoredJsonState,
  useStoredStringState,
} from "@/lib/clientStorage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type Workspace = {
  id: string;
  name: string;
  type: string;
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
  addWorkspace: (workspace: Workspace) => void;
  isLoadingWorkspaces: boolean;
  workspaceError: string | null;
};

const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

type WorkspaceMemberWithWorkspace = {
  workspace_id: string;
  workspaces:
    | {
        id: string;
        name: string;
        type: string;
      }
    | {
        id: string;
        name: string;
        type: string;
      }[]
    | null;
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

function normalizeJoinedWorkspace(
  row: WorkspaceMemberWithWorkspace
): Workspace | null {
  const workspace = Array.isArray(row.workspaces)
    ? row.workspaces[0]
    : row.workspaces;

  if (!workspace) return null;

  return {
    id: workspace.id,
    name: workspace.name,
    type: workspace.type,
  };
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

      const { data: membershipRows, error: membershipError } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(id, name, type)")
        .eq("user_id", supabaseUser.id)
        .eq("status", "Active");

      if (membershipError) throw membershipError;

      const loadedWorkspaces = ((membershipRows ??
        []) as WorkspaceMemberWithWorkspace[])
        .map(normalizeJoinedWorkspace)
        .filter((workspace): workspace is Workspace => Boolean(workspace));

      if (loadedWorkspaces.length > 0) return loadedWorkspaces;

      const firstWorkspace: Workspace = {
        id: crypto.randomUUID(),
        name: "Local Workspace",
        type: "Other",
      };

      const { error: workspaceErrorResult } = await supabase
        .from("workspaces")
        .insert({
          id: firstWorkspace.id,
          name: firstWorkspace.name,
          type: firstWorkspace.type,
          created_by: supabaseUser.id,
        });

      if (workspaceErrorResult) throw workspaceErrorResult;

      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: firstWorkspace.id,
          user_id: supabaseUser.id,
          role: "Owner",
          status: "Active",
        });

      if (memberError) throw memberError;

      const { error: settingsError } = await supabase
        .from("workspace_settings")
        .insert({
          workspace_id: firstWorkspace.id,
          workspace_nickname: firstWorkspace.name,
          business_type: firstWorkspace.type,
        });

      if (settingsError) throw settingsError;

      return [firstWorkspace];
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
          ) ?? loadedWorkspaces[0] ?? defaultWorkspaces[0];

        setDatabaseWorkspaces(loadedWorkspaces);
        setDatabaseActiveWorkspaceId(nextActiveWorkspace.id);
        writeStoredString(storageKeys.activeWorkspace, nextActiveWorkspace.id);
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

  const visibleWorkspaces = isDatabaseMode ? databaseWorkspaces : workspaces;
  const visibleActiveWorkspaceId = isDatabaseMode
    ? databaseActiveWorkspaceId
    : activeWorkspaceId;

  const activeWorkspace =
    useMemo(
      () =>
        visibleWorkspaces.find(
          (workspace) => workspace.id === visibleActiveWorkspaceId
        ) ?? visibleWorkspaces[0] ?? defaultWorkspaces[0],
      [visibleActiveWorkspaceId, visibleWorkspaces]
    );

  const addWorkspace = useCallback(async (workspace: Workspace) => {
    if (!isDatabaseMode || !user) {
      setWorkspaces((current) => [
        ...current,
        workspace,
      ]);

      setActiveWorkspaceId(workspace.id);
      return;
    }

    const supabase = createBrowserSupabaseClient();

    setWorkspaceError(null);

    const { error: workspaceErrorResult } = await supabase
      .from("workspaces")
      .insert({
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        created_by: user.id,
      });

    if (workspaceErrorResult) {
      setWorkspaceError(workspaceErrorResult.message);
      return;
    }

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "Owner",
        status: "Active",
      });

    if (memberError) {
      setWorkspaceError(memberError.message);
      return;
    }

    const { error: settingsError } = await supabase
      .from("workspace_settings")
      .insert({
        workspace_id: workspace.id,
        workspace_nickname: workspace.name,
        business_type: workspace.type,
      });

    if (settingsError) {
      setWorkspaceError(settingsError.message);
      return;
    }

    setDatabaseWorkspaces((current) => [
      ...current,
      workspace,
    ]);
    setDatabaseActiveWorkspaceId(workspace.id);
    writeStoredString(storageKeys.activeWorkspace, workspace.id);
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
      isLoadingWorkspaces,
      workspaceError,
    }),
    [
      activeWorkspace,
      addWorkspace,
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
