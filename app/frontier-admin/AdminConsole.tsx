"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { storageKeys, writeStoredString } from "@/lib/clientStorage";

type PlatformAdminSummary = {
  admin_email: string;
  auth_user_count: number;
  profile_count: number;
  workspace_count: number;
  client_count: number;
  job_count: number;
  invoice_count: number;
  document_count: number;
  route_plan_count: number;
};

type AdminUserResult = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  workspaceCount: number;
};

type AdminWorkspaceResult = {
  id: string;
  name: string;
  type: string;
  createdBy: string | null;
  createdAt: string | null;
  companyName: string | null;
  businessType: string | null;
};

type UserWorkspacesResponse = {
  user: AdminUserResult;
  workspaces: Array<{
    id: string;
    name: string;
    type: string;
    createdAt: string | null;
    role: string;
    status: string;
  }>;
};

type WorkspaceDetail = {
  workspace: {
    id: string;
    name: string;
    type: string;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  settings: {
    company_name: string | null;
    business_type: string | null;
    workspace_nickname: string | null;
    company_email: string | null;
  } | null;
  members: Array<{
    id: string;
    user_id: string | null;
    role: string;
    status: string;
    invited_email: string | null;
    created_at: string | null;
    profiles?: { email: string | null; display_name: string | null } | null;
  }>;
  clients: Array<{ id: string; name: string; status: string; email: string | null; created_at: string | null }>;
  jobs: Array<{ id: string; name: string; status: string; client_name_snapshot: string | null; scheduled_date: string | null; created_at: string | null }>;
  invoices: Array<{ id: string; invoice_number: string; status: string; bill_to_name: string | null; bill_to_email: string | null; invoice_date: string | null; created_at: string | null }>;
  inventory: Array<{ id: string; name: string; current_qty: number | null; target_qty: number | null; created_at: string | null }>;
  documents: Array<{ id: string; name: string; file_name: string | null; status?: string | null; extraction_status: string | null; detected_type: string | null; uploaded_by?: string | null; mime_type: string | null; size_bytes: number | null; storage_bucket: string | null; storage_path: string | null; created_at: string | null }>;
  routePlans: Array<{ id: string; name: string; total_distance_meters: number | null; total_duration_seconds: number | null; google_maps_url: string | null; created_at: string | null }>;
};

type AdminAuditLog = {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  target_workspace_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type BusinessTypeSuggestion = {
  id: string;
  normalized_name: string;
  display_name: string;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatSize(value: number | null) {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      {message}
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-3 text-3xl font-bold text-gray-950 dark:text-gray-100">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function AdminConsole({ summary }: { summary: PlatformAdminSummary }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserResult[]>([]);
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWorkspacesResponse | null>(null);
  const [workspaceDetail, setWorkspaceDetail] = useState<WorkspaceDetail | null>(null);
  const [message, setMessage] = useState("");
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [businessTypeSuggestions, setBusinessTypeSuggestions] = useState<
    BusinessTypeSuggestion[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const counts = [
    { label: "Auth Users", value: summary.auth_user_count },
    { label: "Profiles", value: summary.profile_count },
    { label: "Workspaces", value: summary.workspace_count },
    { label: "Clients", value: summary.client_count },
    { label: "Jobs", value: summary.job_count },
    { label: "Invoices", value: summary.invoice_count },
    { label: "Documents", value: summary.document_count },
    { label: "Route Plans", value: summary.route_plan_count },
  ];

  async function readJson<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error ?? "Admin request failed.");
    }
    return data as T;
  }

  async function search(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsSearching(true);
    setMessage("");

    try {
      const data = await readJson<{
        users: AdminUserResult[];
        workspaces: AdminWorkspaceResult[];
      }>(await fetch(`/api/frontier-admin/search?q=${encodeURIComponent(query)}`));

      setUsers(data.users);
      setWorkspaces(data.workspaces);
      setSelectedUser(null);
      setWorkspaceDetail(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsSearching(false);
    }
  }

  async function loadUserWorkspaces(userId: string) {
    setIsLoadingDetail(true);
    setMessage("");

    try {
      const data = await readJson<UserWorkspacesResponse>(
        await fetch(`/api/frontier-admin/users/${userId}/workspaces`)
      );
      setSelectedUser(data);
      setWorkspaceDetail(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load user.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function loadWorkspace(workspaceId: string) {
    setIsLoadingDetail(true);
    setMessage("");

    try {
      const data = await readJson<WorkspaceDetail>(
        await fetch(`/api/frontier-admin/workspaces/${workspaceId}`)
      );
      setWorkspaceDetail(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load workspace.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function enterAdminView(workspace: { id: string; name: string; type: string }, userId?: string | null) {
    setMessage("");

    try {
      const data = await readJson<{
        adminUserId: string;
        targetUserId: string | null;
        workspace: { id: string; name: string; type: string };
      }>(
        await fetch("/api/frontier-admin/view-mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "enter",
            workspaceId: workspace.id,
            userId,
          }),
        })
      );

      writeStoredString(storageKeys.adminViewAdminUserId, data.adminUserId);
      writeStoredString(storageKeys.adminViewWorkspaceId, data.workspace.id);
      writeStoredString(storageKeys.adminViewWorkspaceName, data.workspace.name);
      writeStoredString(storageKeys.adminViewWorkspaceType, data.workspace.type);
      if (data.targetUserId) {
        writeStoredString(storageKeys.adminViewUserId, data.targetUserId);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to enter admin view.");
    }
  }

  async function loadAuditLogs() {
    setIsLoadingAudit(true);
    setMessage("");

    try {
      const data = await readJson<{ logs: AdminAuditLog[] }>(
        await fetch("/api/frontier-admin/audit-logs")
      );
      setAuditLogs(data.logs);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load audit logs.");
    } finally {
      setIsLoadingAudit(false);
    }
  }

  async function loadBusinessTypeSuggestions() {
    setIsLoadingSuggestions(true);
    setMessage("");
    try {
      const data = await readJson<{ suggestions: BusinessTypeSuggestion[] }>(
        await fetch("/api/frontier-admin/business-types")
      );
      setBusinessTypeSuggestions(data.suggestions);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load business types."
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  async function reviewBusinessTypeSuggestion(
    id: string,
    action: "approve" | "reject"
  ) {
    setMessage("");
    try {
      await readJson<{ suggestion: BusinessTypeSuggestion }>(
        await fetch("/api/frontier-admin/business-types", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        })
      );
      await loadBusinessTypeSuggestions();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to review suggestion."
      );
    }
  }

  return (
    <main className="space-y-6 text-gray-950 dark:text-gray-100">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Frontier Admin</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Signed in as {summary.admin_email}
            </p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
            Platform access
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <CountCard key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-xl font-bold">Search</h2>
        <form onSubmit={search} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Email, user id, workspace, or business name"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
        {message && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{message}</div>}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="p-3">Email</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Workspaces</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Last Sign-In</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3">{user.email ?? "-"}</td>
                    <td className="max-w-48 truncate p-3 font-mono text-xs">{user.id}</td>
                    <td className="p-3">{user.workspaceCount}</td>
                    <td className="p-3">{formatDate(user.createdAt)}</td>
                    <td className="p-3">{formatDate(user.lastSignInAt)}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => loadUserWorkspaces(user.id)}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-gray-950"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <div className="mt-4"><EmptyState message="No users loaded yet." /></div>}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">Workspaces</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr><th className="p-3">Name</th><th className="p-3">Business</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {workspaces.map((workspace) => (
                  <tr key={workspace.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3">{workspace.companyName || workspace.name}</td>
                    <td className="p-3">{workspace.businessType || workspace.type}</td>
                    <td className="p-3">{formatDate(workspace.createdAt)}</td>
                    <td className="space-x-2 p-3 text-right">
                      <button type="button" onClick={() => loadWorkspace(workspace.id)} className="rounded-lg bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-gray-950">Inspect</button>
                      <button type="button" onClick={() => enterAdminView(workspace)} className="rounded-lg bg-blue-600 px-3 py-2 text-white">View As</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {workspaces.length === 0 && <div className="mt-4"><EmptyState message="No workspaces loaded yet." /></div>}
        </div>
      </section>

      {isLoadingDetail && <div className="rounded-lg bg-blue-50 p-4 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">Loading admin detail...</div>}

      {selectedUser && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">Selected User Workspaces</h2>
          <p className="mt-2 break-all text-sm text-gray-500 dark:text-gray-400">{selectedUser.user.email ?? selectedUser.user.id}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr><th className="p-3">Workspace</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {selectedUser.workspaces.map((workspace) => (
                  <tr key={workspace.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3">{workspace.name}</td>
                    <td className="p-3">{workspace.role}</td>
                    <td className="p-3">{workspace.status}</td>
                    <td className="p-3">{formatDate(workspace.createdAt)}</td>
                    <td className="space-x-2 p-3 text-right">
                      <button type="button" onClick={() => loadWorkspace(workspace.id)} className="rounded-lg bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-gray-950">Inspect</button>
                      <button type="button" onClick={() => enterAdminView(workspace, selectedUser.user.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-white">View As</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedUser.workspaces.length === 0 && <div className="mt-4"><EmptyState message="This user has no active workspaces." /></div>}
        </section>
      )}

      {workspaceDetail && (
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">{workspaceDetail.settings?.workspace_nickname || workspaceDetail.workspace.name}</h2>
              <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">{workspaceDetail.workspace.id}</p>
            </div>
            <button type="button" onClick={() => enterAdminView(workspaceDetail.workspace)} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">View As Workspace</button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="font-bold">Settings</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Company: {workspaceDetail.settings?.company_name ?? "-"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Business: {workspaceDetail.settings?.business_type ?? workspaceDetail.workspace.type}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email: {workspaceDetail.settings?.company_email ?? "-"}</p>
            </div>
            <CountCard label="Members" value={workspaceDetail.members.length} />
            <CountCard label="Documents" value={workspaceDetail.documents.length} />
          </div>

          <AdminSimpleTable title="Members" empty="No members found." rows={workspaceDetail.members.map((member) => [member.profiles?.email || member.invited_email || member.user_id || "-", member.role, member.status, formatDate(member.created_at)])} headers={["Email", "Role", "Status", "Created"]} />
          <AdminSimpleTable title="Clients" empty="No clients found." rows={workspaceDetail.clients.map((client) => [client.name, client.status, client.email ?? "-", formatDate(client.created_at)])} headers={["Name", "Status", "Email", "Created"]} />
          <AdminSimpleTable title="Jobs" empty="No jobs found." rows={workspaceDetail.jobs.map((job) => [job.name, job.status, job.client_name_snapshot ?? "-", job.scheduled_date ?? "-", formatDate(job.created_at)])} headers={["Name", "Status", "Client", "Scheduled", "Created"]} />
          <AdminSimpleTable title="Invoices" empty="No invoices found." rows={workspaceDetail.invoices.map((invoice) => [invoice.invoice_number, invoice.status, invoice.bill_to_name ?? "-", invoice.bill_to_email ?? "-", invoice.invoice_date ?? "-"])} headers={["Number", "Status", "Bill To", "Email", "Date"]} />
          <AdminSimpleTable title="Inventory" empty="No inventory found." rows={workspaceDetail.inventory.map((item) => [item.name, String(item.current_qty ?? "-"), String(item.target_qty ?? "-"), formatDate(item.created_at)])} headers={["Name", "Current", "Target", "Created"]} />
          <AdminSimpleTable title="Route Plans" empty="No route plans found." rows={workspaceDetail.routePlans.map((route) => [route.name, route.total_distance_meters ? `${route.total_distance_meters} m` : "-", route.total_duration_seconds ? `${route.total_duration_seconds} sec` : "-", route.google_maps_url ? "Available" : "-", formatDate(route.created_at)])} headers={["Name", "Distance", "Duration", "Google Maps", "Created"]} />
          <AdminSimpleTable title="Document Metadata" empty="No documents found." rows={workspaceDetail.documents.map((document) => [document.file_name || document.name, document.status || document.extraction_status || "Metadata available", document.mime_type ?? "-", formatSize(document.size_bytes), document.uploaded_by ?? "-", document.storage_path ?? "-", "File preview/download coming later", formatDate(document.created_at)])} headers={["File", "Status", "MIME", "Size", "Uploaded By", "Storage Path", "Preview", "Created"]} />
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Audit Logs</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Recent platform admin actions.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAuditLogs}
            disabled={isLoadingAudit}
            className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-gray-100 dark:text-gray-950"
          >
            {isLoadingAudit ? "Loading..." : "Load Audit Logs"}
          </button>
        </div>
        <AdminSimpleTable
          title=""
          empty="No audit logs loaded yet."
          rows={auditLogs.map((log) => [
            log.action,
            log.admin_user_id,
            log.target_user_id ?? "-",
            log.target_workspace_id ?? "-",
            JSON.stringify(log.metadata),
            formatDate(log.created_at),
          ])}
          headers={["Action", "Admin User", "Target User", "Target Workspace", "Metadata", "Created"]}
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Business Type Moderation</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Approved suggestions appear in workspace creation for all users.
            </p>
          </div>
          <button
            type="button"
            onClick={loadBusinessTypeSuggestions}
            disabled={isLoadingSuggestions}
            className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-gray-100 dark:text-gray-950"
          >
            {isLoadingSuggestions ? "Loading..." : "Load Suggestions"}
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="p-3">Suggestion</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Reviewed</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businessTypeSuggestions.map((suggestion) => (
                <tr key={suggestion.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3">
                    <div className="font-semibold">{suggestion.display_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.normalized_name}
                    </div>
                  </td>
                  <td className="p-3">{suggestion.status}</td>
                  <td className="p-3">{formatDate(suggestion.submitted_at)}</td>
                  <td className="p-3">{formatDate(suggestion.reviewed_at)}</td>
                  <td className="space-x-2 p-3 text-right">
                    <button
                      type="button"
                      disabled={suggestion.status === "approved"}
                      onClick={() => reviewBusinessTypeSuggestion(suggestion.id, "approve")}
                      className="rounded-lg bg-green-600 px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-500"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={suggestion.status === "rejected"}
                      onClick={() => reviewBusinessTypeSuggestion(suggestion.id, "reject")}
                      className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-500"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {businessTypeSuggestions.length === 0 && (
          <div className="mt-4">
            <EmptyState message="No business type suggestions loaded yet." />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-bold">Roadmap Hold</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Support tools and customer inspection are not built yet.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Owner view", "Employee view", "Client portal view", "Customer view toggle"].map((label) => (
            <span key={label} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">{label}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminSimpleTable({
  title,
  headers,
  rows,
  empty,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      {rows.length === 0 ? (
        <div className="mt-3"><EmptyState message={empty} /></div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-gray-500 dark:text-gray-400">
              <tr>{headers.map((header) => <th key={header} className="p-3">{header}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join(":")} className="border-t border-gray-200 dark:border-gray-800">
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className="max-w-80 truncate p-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
