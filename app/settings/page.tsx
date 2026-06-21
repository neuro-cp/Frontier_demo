"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { deleteWorkspaceAction } from "@/lib/actions/workspaces";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import { defaultBusinessTypes } from "@/lib/workspaceOptions";
import DataMigrationSettings from "./DataMigrationSettings";
import PermissionsSettings from "./PermissionsSettings";
import StorageSettings from "./StorageSettings";

type SettingsTab =
  | "business"
  | "invoice"
  | "tax"
  | "workspace"
  | "permissions"
  | "migration"
  | "storage";

type WorkspaceSettings = {
  workspaceId: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;

  defaultInvoiceTerms: string;
  defaultFooterMessage: string;
  defaultContactMessage: string;
  defaultInvoiceStatus: "Draft" | "Sent";

  taxState: string;
  defaultTaxRate: string;
  taxLocationMode: "Business location" | "Job location";
  discountBeforeTax: boolean;

  workspaceNickname: string;
  businessType: string;
  notes: string;
};

function getDefaultSettings(
  workspaceId: string,
  workspaceName: string
): WorkspaceSettings {
  return {
    workspaceId,

    companyName: `${workspaceName} Company`,
    companyAddress: "123 Business Street",
    companyCity: "Rochester Hills",
    companyState: "MI",
    companyZip: "48307",
    companyPhone: "(555) 123-4567",
    companyEmail: "billing@example.com",
    companyWebsite: "",

    defaultInvoiceTerms: "Due upon receipt",
    defaultFooterMessage: "Thank you for your business!",
    defaultContactMessage:
      "Please contact us with any questions about this invoice.",
    defaultInvoiceStatus: "Draft",

    taxState: "MI",
    defaultTaxRate: "6",
    taxLocationMode: "Business location",
    discountBeforeTax: true,

    workspaceNickname: workspaceName,
    businessType: workspaceName,
    notes: "",
  };
}

export default function SettingsPage() {
  const { activeWorkspace, canManageWorkspace, deleteWorkspace } = useWorkspace();
  const [allSettings, setAllSettings] = useStoredJsonState<WorkspaceSettings[]>(
    storageKeys.settings,
    []
  );

  const initialSettings =
    allSettings.find((item) => item.workspaceId === activeWorkspace.id) ??
    getDefaultSettings(activeWorkspace.id, getWorkspaceDisplayName(activeWorkspace));

  return (
    <SettingsWorkspacePanel
      key={activeWorkspace.id}
      activeWorkspaceId={activeWorkspace.id}
      activeWorkspaceName={getWorkspaceDisplayName(activeWorkspace)}
      allSettings={allSettings}
      initialSettings={initialSettings}
      setAllSettings={setAllSettings}
      canManageWorkspace={canManageWorkspace}
      deleteWorkspace={deleteWorkspace}
    />
  );
}

function SettingsWorkspacePanel({
  activeWorkspaceId,
  activeWorkspaceName,
  allSettings,
  initialSettings,
  setAllSettings,
  canManageWorkspace,
  deleteWorkspace,
}: {
  activeWorkspaceId: string;
  activeWorkspaceName: string;
  allSettings: WorkspaceSettings[];
  initialSettings: WorkspaceSettings;
  setAllSettings: (settings: WorkspaceSettings[]) => void;
  canManageWorkspace: boolean;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
}) {

  const [tab, setTab] = useState<SettingsTab>("business");
  const [settings, setSettings] = useState<WorkspaceSettings>(initialSettings);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const [savedNotice, setSavedNotice] = useState("");

  function updateSetting<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function showSavedNotice(message: string) {
    setSavedNotice(message);
    window.setTimeout(() => setSavedNotice(""), 2500);
  }

  function saveSettings() {
    const withoutCurrentWorkspace = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspaceId
    );

    const updatedSettings = [...withoutCurrentWorkspace, settings];

    setAllSettings(updatedSettings);

    showSavedNotice("Settings saved.");

    window.dispatchEvent(new Event("frontier-settings-updated"));
  }

  function resetWorkspaceSettings() {
    const resetSettings = getDefaultSettings(
      activeWorkspaceId,
      activeWorkspaceName
    );

    const updatedSettings = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspaceId
    );

    setSettings(resetSettings);
    setAllSettings(updatedSettings);

    showSavedNotice("Settings reset.");

    window.dispatchEvent(new Event("frontier-settings-updated"));
  }

  async function handleDeleteWorkspace() {
    if (activeWorkspaceId === "create-workspace") return;
    if (!canManageWorkspace) {
      showSavedNotice("Only workspace owners can delete a workspace.");
      return;
    }

    if (deleteConfirmation !== activeWorkspaceName) {
      showSavedNotice("Type the workspace name exactly before deleting.");
      return;
    }

    const confirmed = window.confirm(
      `Delete workspace "${activeWorkspaceName}" and its related data? This cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeletingWorkspace(true);
    const result = await deleteWorkspaceAction(
      { addWorkspace: () => undefined, deleteWorkspace },
      activeWorkspaceId
    );
    setIsDeletingWorkspace(false);

    if (!result.ok) {
      showSavedNotice(result.error);
      return;
    }

    setDeleteConfirmation("");
    showSavedNotice("Workspace deleted.");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100";

  const tabClass = (target: SettingsTab) =>
    `rounded-lg px-4 py-2 text-xs font-semibold ${
      tab === target
        ? "bg-blue-600 text-white shadow"
        : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-8 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetWorkspaceSettings}
            className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {savedNotice}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
        <button
          onClick={() => setTab("business")}
          className={tabClass("business")}
        >
          Business Profile
        </button>

        <button
          onClick={() => setTab("invoice")}
          className={tabClass("invoice")}
        >
          Invoice Defaults
        </button>

        <button onClick={() => setTab("tax")} className={tabClass("tax")}>
          Tax
        </button>

        <button
          onClick={() => setTab("workspace")}
          className={tabClass("workspace")}
        >
          Workspace
        </button>

        <button
          onClick={() => setTab("permissions")}
          className={tabClass("permissions")}
        >
          Permissions
        </button>
        <button onClick={() => setTab("migration")} className={tabClass("migration")}>
          Data Migration
        </button>
        <button onClick={() => setTab("storage")} className={tabClass("storage")}>
          Storage
        </button>
      </div>

      {tab === "business" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Business Profile</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This should later feed the invoice -From- section automatically.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                value={settings.companyName}
                onChange={(event) =>
                  updateSetting("companyName", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(event) =>
                  updateSetting("companyEmail", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Phone</label>
              <input
                value={settings.companyPhone}
                onChange={(event) =>
                  updateSetting("companyPhone", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Website</label>
              <input
                value={settings.companyWebsite}
                onChange={(event) =>
                  updateSetting("companyWebsite", event.target.value)
                }
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input
                value={settings.companyAddress}
                onChange={(event) =>
                  updateSetting("companyAddress", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                value={settings.companyCity}
                onChange={(event) =>
                  updateSetting("companyCity", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State</label>
                <input
                  value={settings.companyState}
                  onChange={(event) =>
                    updateSetting(
                      "companyState",
                      event.target.value.toUpperCase()
                    )
                  }
                  maxLength={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>ZIP</label>
                <input
                  value={settings.companyZip}
                  onChange={(event) =>
                    updateSetting("companyZip", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "invoice" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Invoice Defaults</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            These values should be connected to the invoice builder next.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Default Invoice Status</label>
              <select
                value={settings.defaultInvoiceStatus}
                onChange={(event) =>
                  updateSetting(
                    "defaultInvoiceStatus",
                    event.target
                      .value as WorkspaceSettings["defaultInvoiceStatus"]
                  )
                }
                className={inputClass}
              >
                <option>Draft</option>
                <option>Sent</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Default Terms</label>
              <input
                value={settings.defaultInvoiceTerms}
                onChange={(event) =>
                  updateSetting("defaultInvoiceTerms", event.target.value)
                }
                placeholder="Due upon receipt"
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Default Footer Message</label>
              <input
                value={settings.defaultFooterMessage}
                onChange={(event) =>
                  updateSetting("defaultFooterMessage", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Default Contact Message</label>
              <input
                value={settings.defaultContactMessage}
                onChange={(event) =>
                  updateSetting("defaultContactMessage", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {tab === "tax" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Tax Settings</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discount is currently set to apply before tax, which is the normal
            invoice calculation flow.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Tax State</label>
              <input
                value={settings.taxState}
                onChange={(event) =>
                  updateSetting("taxState", event.target.value.toUpperCase())
                }
                maxLength={2}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Default Tax Rate %</label>
              <input
                type="number"
                value={settings.defaultTaxRate}
                onChange={(event) =>
                  updateSetting("defaultTaxRate", event.target.value)
                }
                placeholder="6"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tax Location Basis</label>
              <select
                value={settings.taxLocationMode}
                onChange={(event) =>
                  updateSetting(
                    "taxLocationMode",
                    event.target.value as WorkspaceSettings["taxLocationMode"]
                  )
                }
                className={inputClass}
              >
                <option>Business location</option>
                <option>Job location</option>
              </select>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.discountBeforeTax}
                  onChange={(event) =>
                    updateSetting("discountBeforeTax", event.target.checked)
                  }
                  className="mt-1 h-4 w-4"
                />

                <span>
                  <span className="block font-semibold">
                    Apply discount before tax
                  </span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                    Keeps invoice totals consistent with the current calculation
                    helper.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>
      )}

      {tab === "workspace" && (
        <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div>
            <h2 className="text-2xl font-bold">Workspace Configuration</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The Reset button only resets settings for this workspace. It does not delete or reset workspaces.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Workspace Name</label>
              <input
                value={activeWorkspaceName}
                readOnly
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Display Nickname</label>
              <input
                value={settings.workspaceNickname}
                onChange={(event) =>
                  updateSetting("workspaceNickname", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Business Type</label>
              <select
                value={settings.businessType}
                onChange={(event) =>
                  updateSetting("businessType", event.target.value)
                }
                className={inputClass}
              >
                {defaultBusinessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Workspace ID</label>
              <input
                value={activeWorkspaceId}
                readOnly
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Internal Notes</label>
              <textarea
                rows={5}
                value={settings.notes}
                onChange={(event) =>
                  updateSetting("notes", event.target.value)
                }
                placeholder="Internal workspace notes, default operating procedures, billing notes..."
                className={inputClass}
              />
            </div>
          </div>

          {activeWorkspaceId !== "create-workspace" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                Delete Workspace
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-200">
                This permanently deletes the workspace and database records tied to it. Type the workspace name to enable deletion.
              </p>
              {!canManageWorkspace && (
                <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-200">
                  Only workspace owners can delete this workspace.
                </p>
              )}
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                <input
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder={activeWorkspaceName}
                  disabled={!canManageWorkspace}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleDeleteWorkspace}
                  disabled={
                    isDeletingWorkspace ||
                    !canManageWorkspace ||
                    deleteConfirmation !== activeWorkspaceName
                  }
                  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isDeletingWorkspace ? "Deleting..." : "Delete Workspace"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "permissions" && (
        <PermissionsSettings
          activeWorkspaceId={activeWorkspaceId}
          activeWorkspaceName={activeWorkspaceName}
          setSavedNotice={showSavedNotice}
        />
      )}

      {tab === "migration" && <DataMigrationSettings />}

      {tab === "storage" && <StorageSettings workspaceId={activeWorkspaceId} />}
    </div>
  );
}
