"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ClientLinkedJob = Job & {
  clientId?: string;
};

type StoredDocument = {
  id: string;
  workspaceId: string;
  clientId: string;
};

type ClientCalendarEvent = {
  id: string;
  workspaceId: string;
  clientId: string;
};

const clientStatuses = ["Lead", "Active", "Inactive"] as const;

type ClientStatusPriority = "default" | (typeof clientStatuses)[number];

function formatMoney(value: string) {
  const numericValue = Number(value.replace(/[$,]/g, ""));

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return `$${numericValue.toLocaleString()}`;
}

function getStatusClasses(status: string) {
  if (status === "Active") {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }

  if (status === "Lead") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  }

  if (status === "Inactive") {
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function isJobLinkedToClient(job: ClientLinkedJob, client: ClientRow) {
  if (job.workspaceId !== client.workspaceId) return false;
  if (job.clientId) return job.clientId === client.id;

  // Legacy localStorage jobs may only have a client name snapshot.
  return normalizeName(job.client) === normalizeName(client.name);
}

function isInvoiceLinkedToClient(invoice: InvoiceRow, client: ClientRow) {
  if (invoice.workspaceId !== client.workspaceId) return false;
  if (invoice.sourceClientId) return invoice.sourceClientId === client.id;

  // Legacy/manual invoices may only have bill-to names.
  const clientName = normalizeName(client.name);

  return (
    normalizeName(invoice.billToName ?? "") === clientName ||
    normalizeName(invoice.billToCompany ?? "") === clientName
  );
}

export default function ClientsPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientLoadError, setClientLoadError] = useState<string | null>(null);
  const [jobItems] = useStoredJsonState<ClientLinkedJob[]>(
    storageKeys.jobs,
    []
  );
  const [invoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [documentItems] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [clientEventItems] = useStoredJsonState<ClientCalendarEvent[]>(
    storageKeys.clientCalendarEvents,
    []
  );
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [statusPriority, setStatusPriority] =
    useState<ClientStatusPriority>("default");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientStatus, setClientStatus] =
    useState<(typeof clientStatuses)[number]>("Active");
  const [clientBalance, setClientBalance] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const clientsRepository = useMemo(
    () =>
      createClientsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localClients: localClientItems,
        setLocalClients: setLocalClientItems,
      }),
    [isDatabaseMode, localClientItems, setLocalClientItems, supabase]
  );
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;

  useEffect(() => {
    if (!isDatabaseMode) {
      return;
    }

    let cancelled = false;

    async function loadClients() {
      setIsLoadingClients(true);
      setClientLoadError(null);
      const clients = await clientsRepository.getClients(activeWorkspace.id);

      if (!cancelled) {
        setDatabaseClientItems(clients);
      }
    }

    loadClients().catch((error) => {
      console.error("Unable to load clients.", error);

      if (!cancelled) {
        setClientLoadError(
          error instanceof Error ? error.message : "Unable to load clients."
        );
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoadingClients(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, clientsRepository, isDatabaseMode]);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const sortedWorkspaceClients = [...workspaceClients].sort((a, b) => {
    if (statusPriority === "default") {
      return a.name.localeCompare(b.name);
    }

    if (a.status === statusPriority && b.status !== statusPriority) {
      return -1;
    }

    if (a.status !== statusPriority && b.status === statusPriority) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  const allWorkspaceClientsSelected =
    workspaceClients.length > 0 &&
    workspaceClients.every((client) => selectedClients.includes(client.id));

  const selectedClientRows = workspaceClients.filter((client) =>
    selectedClients.includes(client.id)
  );

  const deleteDependencyWarnings = selectedClientRows
    .map((client) => {
      const jobs = jobItems.filter((job) =>
        isJobLinkedToClient(job, client)
      ).length;
      const invoices = invoiceItems.filter((invoice) =>
        isInvoiceLinkedToClient(invoice, client)
      ).length;
      const documents = documentItems.filter(
        (document) =>
          document.workspaceId === client.workspaceId &&
          document.clientId === client.id
      ).length;
      const events = clientEventItems.filter(
        (event) =>
          event.workspaceId === client.workspaceId && event.clientId === client.id
      ).length;

      return {
        client,
        jobs,
        invoices,
        documents,
        events,
        total: jobs + invoices + documents + events,
      };
    })
    .filter((warning) => warning.total > 0);

  const totalOrphanedItems = deleteDependencyWarnings.reduce(
    (total, warning) => total + warning.total,
    0
  );

  function cycleStatusPriority() {
    setStatusPriority((current) => {
      if (current === "default") return "Active";
      if (current === "Active") return "Lead";
      if (current === "Lead") return "Inactive";
      return "default";
    });
  }

  function getStatusSortLabel() {
    if (statusPriority === "default") {
      return "Default";
    }

    return `${statusPriority} first`;
  }

  function resetClientForm() {
    setClientName("");
    setClientStatus("Active");
    setClientBalance("");
    setClientEmail("");
    setClientPhone("");
    setClientAddress("");
    setClientCity("");
    setClientState("");
    setClientZip("");
    setClientNotes("");
    setEditingClientId("");
  }

  function closeClientModals() {
    setNewClientOpen(false);
    setEditClientOpen(false);
    resetClientForm();
  }

  function toggleClient(clientId: string) {
    setSelectedClients((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId]
    );
  }

  function toggleAllWorkspaceClients() {
    if (allWorkspaceClientsSelected) {
      setSelectedClients((current) =>
        current.filter(
          (clientId) =>
            !workspaceClients.some((client) => client.id === clientId)
        )
      );

      return;
    }

    setSelectedClients((current) => {
      const workspaceClientIds = workspaceClients.map((client) => client.id);

      const preservedOtherWorkspaceSelections = current.filter(
        (clientId) => !workspaceClientIds.includes(clientId)
      );

      return [...preservedOtherWorkspaceSelections, ...workspaceClientIds];
    });
  }

  function clientNameAlreadyExists(name: string, ignoredClientId?: string) {
    return workspaceClients.some(
      (client) =>
        client.id !== ignoredClientId &&
        client.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  }

  async function addClient() {
    if (!clientName.trim()) return;
    if (clientNameAlreadyExists(clientName)) return;

    const newClient: ClientRow = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: clientName.trim(),
      status: clientStatus,
      balance: formatMoney(clientBalance || "0"),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim(),
      city: clientCity.trim(),
      state: clientState.trim(),
      zip: clientZip.trim(),
      notes: clientNotes.trim(),
    };

    try {
      const createdClient = await clientsRepository.createClient(newClient);

      if (!createdClient) return;

      if (isDatabaseMode) {
        setDatabaseClientItems((current) => [...current, createdClient]);
      }

      setClientLoadError(null);
      closeClientModals();
    } catch (error) {
      setClientLoadError(
        error instanceof Error ? error.message : "Unable to create client."
      );
    }
  }

  function openEditClient(client: ClientRow) {
    setEditingClientId(client.id);
    setClientName(client.name);
    setClientStatus(
      clientStatuses.includes(client.status as (typeof clientStatuses)[number])
        ? (client.status as (typeof clientStatuses)[number])
        : "Active"
    );
    setClientBalance(client.balance.replace(/[$,]/g, ""));
    setClientEmail(client.email ?? "");
    setClientPhone(client.phone ?? "");
    setClientAddress(client.address ?? "");
    setClientCity(client.city ?? "");
    setClientState(client.state ?? "");
    setClientZip(client.zip ?? "");
    setClientNotes(client.notes ?? "");
    setEditClientOpen(true);
  }

  async function saveEditedClient() {
    if (!editingClientId) return;
    if (!clientName.trim()) return;
    if (clientNameAlreadyExists(clientName, editingClientId)) return;

    const existingClient = clientItems.find(
      (client) => client.id === editingClientId
    );

    if (!existingClient) return;

    const updatedClient = {
      ...existingClient,
      name: clientName.trim(),
      status: clientStatus,
      balance: formatMoney(clientBalance || "0"),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim(),
      city: clientCity.trim(),
      state: clientState.trim(),
      zip: clientZip.trim(),
      notes: clientNotes.trim(),
    };

    try {
      const savedClient = await clientsRepository.updateClient(updatedClient);

      if (!savedClient) return;

      if (isDatabaseMode) {
        setDatabaseClientItems((current) =>
          current.map((client) =>
            client.id === savedClient.id ? savedClient : client
          )
        );
      }

      setClientLoadError(null);
      closeClientModals();
    } catch (error) {
      setClientLoadError(
        error instanceof Error ? error.message : "Unable to update client."
      );
    }
  }

  async function removeSelectedClients() {
    try {
      const deleteResults = await Promise.all(
        selectedClientRows.map(async (client) => ({
          id: client.id,
          deleted: await clientsRepository.deleteClient(
            client.id,
            client.workspaceId
          ),
        }))
      );
      const deletedClientIds = deleteResults
        .filter((result) => result.deleted)
        .map((result) => result.id);

      if (isDatabaseMode) {
        setDatabaseClientItems((current) =>
          current.filter((client) => !deletedClientIds.includes(client.id))
        );
      }

      setSelectedClients((current) =>
        current.filter((clientId) => !deletedClientIds.includes(clientId))
      );
      setClientLoadError(null);
      setShowDeleteModal(false);
    } catch (error) {
      setClientLoadError(
        error instanceof Error ? error.message : "Unable to delete clients."
      );
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewClientOpen(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            + Add Client
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={selectedClients.length === 0}
            className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Client
          </button>
        </div>
      </div>

      {selectedClients.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedClients.length} client
          {selectedClients.length === 1 ? "" : "s"} selected
        </div>
      )}

      {clientLoadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {clientLoadError}
        </div>
      )}

      {isLoadingClients && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading clients...
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[1050px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allWorkspaceClientsSelected}
                  onChange={toggleAllWorkspaceClients}
                  disabled={workspaceClients.length === 0}
                  className="h-4 w-4"
                />
              </th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">
                <button
                  type="button"
                  onClick={cycleStatusPriority}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Cycle status priority"
                >
                  <span>Status</span>
                  <span className="text-xs">
                    {statusPriority === "default" ? "-" : "-"}
                  </span>
                </button>

                <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                  {getStatusSortLabel()}
                </div>
              </th>

              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedWorkspaceClients.length > 0 ? (
              sortedWorkspaceClients.map((client) => {
                const addressParts = [
                  client.address,
                  client.city,
                  client.state,
                  client.zip,
                ].filter(Boolean);

                return (
                  <tr
                    key={client.id}
                    className="border-t border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-4 font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {client.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="p-4">{client.phone || "-"}</td>

                    <td className="p-4">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {client.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-4">
                      {addressParts.length > 0 ? addressParts.join(", ") : "-"}
                    </td>

                    <td className="p-4 text-right font-medium">
                      {client.balance}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditClient(client)}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No clients found for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(newClientOpen || editClientOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                {editClientOpen ? "Edit Client" : "Add Client"}
              </h2>

              <button
                type="button"
                onClick={closeClientModals}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                -
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Client Name *
                </label>

                <input
                  type="text"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Jones Family"
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={clientStatus}
                    onChange={(event) =>
                      setClientStatus(
                        event.target.value as (typeof clientStatuses)[number]
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {clientStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Starting Balance
                  </label>

                  <input
                    type="number"
                    value={clientBalance}
                    onChange={(event) => setClientBalance(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Street Address
                </label>

                <input
                  type="text"
                  value={clientAddress}
                  onChange={(event) => setClientAddress(event.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_140px]">
                <div>
                  <label className="mb-2 block text-sm font-medium">City</label>

                  <input
                    type="text"
                    value={clientCity}
                    onChange={(event) => setClientCity(event.target.value)}
                    placeholder="Rochester Hills"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">State</label>

                  <input
                    type="text"
                    value={clientState}
                    onChange={(event) => setClientState(event.target.value)}
                    placeholder="MI"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">ZIP</label>

                  <input
                    type="text"
                    value={clientZip}
                    onChange={(event) => setClientZip(event.target.value)}
                    placeholder="48307"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>

                <textarea
                  rows={4}
                  value={clientNotes}
                  onChange={(event) => setClientNotes(event.target.value)}
                  placeholder="Gate code, preferred contact method, billing notes..."
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeClientModals}
                  className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={editClientOpen ? saveEditedClient : addClient}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editClientOpen ? "Save Changes" : "Add Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Remove Clients
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to remove the selected client(s)?
            </p>

            {deleteDependencyWarnings.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="font-semibold">
                  This will leave linked records orphaned.
                </div>

                <p className="mt-1">
                  Deletion is still allowed, but these records will no longer
                  have an active client:
                </p>

                <div className="mt-3 space-y-2">
                  {deleteDependencyWarnings.map((warning) => (
                    <div
                      key={warning.client.id}
                      className="rounded-md bg-white/70 p-3 dark:bg-gray-900/60"
                    >
                      <div className="font-semibold">
                        {warning.client.name}
                      </div>

                      <div className="mt-1 text-xs">
                        {warning.jobs} job(s), {warning.invoices} invoice(s),{" "}
                        {warning.documents} document(s), {warning.events}{" "}
                        calendar event(s)
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 font-semibold">
                  {totalOrphanedItems} linked record(s) affected.
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={removeSelectedClients}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
