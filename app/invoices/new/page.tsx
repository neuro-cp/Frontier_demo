"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState, writeStoredJson } from "@/lib/clientStorage";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import { InvoiceRow, InvoiceSetupDraft } from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

type WorkspaceInvoiceSettings = {
  workspaceId: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyPhone?: string;
  companyEmail?: string;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNextInvoiceNumber(savedInvoices: InvoiceRow[]) {
  const highestExistingNumber = savedInvoices.reduce((highest, invoice) => {
    const match = invoice.invoiceNumber.match(/^INV-(\d+)$/i);
    if (!match) return highest;

    return Math.max(highest, Number(match[1]));
  }, 0);

  const nextNumber = highestExistingNumber + 1;

  return `INV-${String(nextNumber).padStart(3, "0")}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startingJobId = searchParams.get("jobId") || "";
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localSavedInvoices, setLocalSavedInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [databaseSavedInvoices, setDatabaseSavedInvoices] = useState<InvoiceRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [workspaceSettings] = useStoredJsonState<WorkspaceInvoiceSettings[]>(
    storageKeys.settings,
    []
  );

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localSavedInvoices, setLocalInvoices: setLocalSavedInvoices }), [isDatabaseMode, localSavedInvoices, setLocalSavedInvoices, supabase]);
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;
  const savedInvoices = isDatabaseMode ? databaseSavedInvoices : localSavedInvoices;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([clientsRepo.getClients(activeWorkspace.id), jobsRepo.getJobs(activeWorkspace.id), invoicesRepo.getInvoices(activeWorkspace.id)]).then(([clients, jobs, invoices]) => {
      if (!cancelled) { setDatabaseClientItems(clients); setDatabaseJobItems(jobs); setDatabaseSavedInvoices(invoices); }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load invoice setup data.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const activeWorkspaceClients = workspaceClients.filter(
    (client) => client.status === "Active"
  );

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  function getClientForJob(job: Job) {
    if (job.clientId) {
      const matchedById = workspaceClients.find(
        (client) => client.id === job.clientId
      );

      if (matchedById) return matchedById;
    }

    return workspaceClients.find(
      (client) =>
        client.name.trim().toLowerCase() === job.client.trim().toLowerCase()
    );
  }

  const startingJob = workspaceJobs.find((job) => job.id === startingJobId);
  const startingClient = startingJob ? getClientForJob(startingJob) : undefined;

  const [selectedClientId, setSelectedClientId] = useState(
    startingClient?.id ?? "new"
  );
  const [selectedJobId, setSelectedJobId] = useState(startingJob?.id ?? "");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());

  const [billToName, setBillToName] = useState(
    startingClient?.name ?? startingJob?.client ?? ""
  );
  const [billToCompany, setBillToCompany] = useState("");
  const [billToAddress, setBillToAddress] = useState(
    startingClient?.address ?? ""
  );
  const [billToCity, setBillToCity] = useState(startingClient?.city ?? "");
  const [billToState, setBillToState] = useState(
    (startingClient?.state ?? "").toUpperCase()
  );
  const [billToZip, setBillToZip] = useState(startingClient?.zip ?? "");
  const [billToPhone, setBillToPhone] = useState(
    formatPhone(startingClient?.phone ?? "")
  );
  const [billToEmail, setBillToEmail] = useState(startingClient?.email ?? "");

  useEffect(() => {
    if (!startingJob || selectedJobId === startingJob.id) return;

    queueMicrotask(() => {
      setSelectedJobId(startingJob.id);
      if (startingClient) {
        setSelectedClientId(startingClient.id);
        setBillToName(startingClient.name ?? "");
        setBillToCompany("");
        setBillToAddress(startingClient.address ?? "");
        setBillToCity(startingClient.city ?? "");
        setBillToState((startingClient.state ?? "").toUpperCase());
        setBillToZip(startingClient.zip ?? "");
        setBillToPhone(formatPhone(startingClient.phone ?? ""));
        setBillToEmail(startingClient.email ?? "");
      } else {
        setSelectedClientId("new");
        setBillToName(startingJob.client);
      }
    });
  }, [selectedJobId, startingClient, startingJob]);

  const [footerMessage, setFooterMessage] = useState("Thank you for your business!");
  const [contactMessage, setContactMessage] = useState("Please contact us with any questions about this invoice.");

  const savedWorkspaceSettings = workspaceSettings.find(
    (settings) => settings.workspaceId === activeWorkspace.id
  );

  const companyPlaceholder = {
    companyName:
      savedWorkspaceSettings?.companyName ||
      `${getWorkspaceDisplayName(activeWorkspace)} Company`,
    companyAddress:
      savedWorkspaceSettings?.companyAddress || "123 Business Street",
    companyCity: savedWorkspaceSettings?.companyCity || "Rochester Hills",
    companyState: savedWorkspaceSettings?.companyState || "MI",
    companyZip: savedWorkspaceSettings?.companyZip || "48307",
    companyPhone: savedWorkspaceSettings?.companyPhone || "(555) 123-4567",
    companyEmail: savedWorkspaceSettings?.companyEmail || "billing@example.com",
  };

  function clearBillToForm() {
    setSelectedClientId("new");
    setBillToName("");
    setBillToCompany("");
    setBillToAddress("");
    setBillToCity("");
    setBillToState("");
    setBillToZip("");
    setBillToPhone("");
    setBillToEmail("");
  }

  function populateBillToFromClient(clientId: string) {
    if (clientId === "new") {
      clearBillToForm();
      return;
    }

    const selectedClient = workspaceClients.find((client) => client.id === clientId);

    if (!selectedClient) return;

    setSelectedClientId(clientId);
    setBillToName(selectedClient.name ?? "");
    setBillToCompany("");
    setBillToAddress(selectedClient.address ?? "");
    setBillToCity(selectedClient.city ?? "");
    setBillToState((selectedClient.state ?? "").toUpperCase());
    setBillToZip(selectedClient.zip ?? "");
    setBillToPhone(formatPhone(selectedClient.phone ?? ""));
    setBillToEmail(selectedClient.email ?? "");
  }

  function populateFromJob(jobId: string) {
    if (!jobId) {
      setSelectedJobId("");
      return;
    }

    const selectedJob = workspaceJobs.find((job) => job.id === jobId);

    if (!selectedJob) return;

    setSelectedJobId(selectedJob.id);

    const matchedClient = getClientForJob(selectedJob);

    if (matchedClient) {
      populateBillToFromClient(matchedClient.id);
    } else {
      setSelectedClientId("new");
      setBillToName(selectedJob.client);
    }
  }

  function markManualBillToEdit() {
    setSelectedClientId("new");
  }

  function continueToBuilder() {
    const resolvedInvoiceNumber =
      invoiceNumber.trim() || getNextInvoiceNumber(savedInvoices);
    const attachedJob = workspaceJobs.find((job) => job.id === selectedJobId);

    if (!invoiceDate.trim()) return;
    if (!billToName.trim() && !billToCompany.trim()) return;

    const draft: InvoiceSetupDraft = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      invoiceNumber: resolvedInvoiceNumber,
      invoiceDate,

      jobId: attachedJob?.id,
      jobName: attachedJob?.name,
      sourceClientId: selectedClientId !== "new" ? selectedClientId : undefined,

      ...companyPlaceholder,

      billToName: billToName.trim(),
      billToCompany: billToCompany.trim(),
      billToAddress: billToAddress.trim(),
      billToCity: billToCity.trim(),
      billToState: billToState.trim().toUpperCase(),
      billToZip: billToZip.trim(),
      billToPhone: billToPhone.trim(),
      billToEmail: billToEmail.trim(),

      footerMessage: footerMessage.trim(),
      contactMessage: contactMessage.trim(),
    };

    writeStoredJson(storageKeys.invoiceDraft, draft);
    router.push("/invoices/new/build");
  }

  const inputClass =
    "rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-800";
  const labelClass = "mb-2 block text-sm font-medium";

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">


        <Link
          href="/invoices"
          className="w-fit rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back to Invoices
        </Link>
      </div>

      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        {dataError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {dataError}
          </div>
        )}
        {isLoadingData && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            Loading invoice setup...
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_180px]">
          <div>
            <label className={labelClass}>Attach to Job</label>
            <select
              value={selectedJobId}
              onChange={(event) => populateFromJob(event.target.value)}
              className={`${inputClass} w-full bg-white`}
            >
              <option value="">No attached job</option>
              {workspaceJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name} - {job.client}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Invoice #</label>
            <input
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              placeholder="Leave blank for auto-number"
              className={`${inputClass} w-full`}
            />
          </div>

          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">From</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Uses the saved business profile for this workspace. You can edit this information from the settings tab.
          </p>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-800">
            <p className="font-semibold">{companyPlaceholder.companyName}</p>
            <p>{companyPlaceholder.companyAddress}</p>
            <p>
              {companyPlaceholder.companyCity}, {companyPlaceholder.companyState}{" "}
              {companyPlaceholder.companyZip}
            </p>
            <p className="mt-2">{companyPlaceholder.companyPhone}</p>
            <p>{companyPlaceholder.companyEmail}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Bill To</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Active clients show in the dropdown. Manually typed matching leads are promoted to Active when saved.
              </p>
            </div>

            <select
              value={selectedClientId}
              onChange={(event) => populateBillToFromClient(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="new">New Client</option>
              {activeWorkspaceClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                value={billToName}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToName(event.target.value);
                }}
                placeholder="Name"
                className={inputClass}
              />

              <input
                value={billToCompany}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToCompany(event.target.value);
                }}
                placeholder="Company Name"
                className={inputClass}
              />
            </div>

            <input
              value={billToAddress}
              onChange={(event) => {
                markManualBillToEdit();
                setBillToAddress(event.target.value);
              }}
              placeholder="Street Address"
              className={`${inputClass} w-full`}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_160px]">
              <input
                value={billToCity}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToCity(event.target.value);
                }}
                placeholder="City"
                className={inputClass}
              />

              <input
                value={billToState}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToState(event.target.value.toUpperCase());
                }}
                placeholder="State"
                maxLength={2}
                className={inputClass}
              />

              <input
                value={billToZip}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToZip(event.target.value);
                }}
                placeholder="ZIP"
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
              <input
                type="tel"
                inputMode="tel"
                value={billToPhone}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToPhone(formatPhone(event.target.value));
                }}
                placeholder="Phone"
                className={inputClass}
              />

              <input
                type="email"
                value={billToEmail}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToEmail(event.target.value);
                }}
                placeholder="Email"
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        <h2 className="text-xl font-bold">Messages</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className={labelClass}>Footer Message</label>
            <input
              value={footerMessage}
              onChange={(event) => setFooterMessage(event.target.value)}
              placeholder="Thank you message"
              className={`${inputClass} w-full`}
            />
          </div>

          <div>
            <label className={labelClass}>Contact Message</label>
            <input
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              placeholder="Contact message"
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/invoices"
          className="rounded-lg border border-gray-300 px-5 py-3 text-center hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={continueToBuilder}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Continue to Itemization
        </button>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 text-gray-950 dark:text-gray-100">
          Loading invoice setup...
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
