"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import PermissionsSettings from "./PermissionsSettings";

type SettingsTab =
  | "business"
  | "invoice"
  | "tax"
  | "workspace"
  | "permissions";

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

function loadAllSettings() {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("frontier-settings");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllSettings(settings: WorkspaceSettings[]) {
  localStorage.setItem("frontier-settings", JSON.stringify(settings));
}

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();

  const [tab, setTab] = useState<SettingsTab>("business");
  const [allSettings, setAllSettings] = useState<WorkspaceSettings[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings>(
    getDefaultSettings(activeWorkspace.id, activeWorkspace.name)
  );

  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    const loadedSettings = loadAllSettings();
    const currentSettings =
      loadedSettings.find((item) => item.workspaceId === activeWorkspace.id) ??
      getDefaultSettings(activeWorkspace.id, activeWorkspace.name);

    setAllSettings(loadedSettings);
    setSettings(currentSettings);
    setSavedNotice("");
  }, [activeWorkspace.id, activeWorkspace.name]);

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
      (item) => item.workspaceId !== activeWorkspace.id
    );

    const updatedSettings = [...withoutCurrentWorkspace, settings];

    setAllSettings(updatedSettings);
    saveAllSettings(updatedSettings);

    showSavedNotice("Settings saved.");

    window.dispatchEvent(new Event("frontier-settings-updated"));
  }

  function resetWorkspaceSettings() {
    const resetSettings = getDefaultSettings(
      activeWorkspace.id,
      activeWorkspace.name
    );

    const updatedSettings = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspace.id
    );

    setSettings(resetSettings);
    setAllSettings(updatedSettings);
    saveAllSettings(updatedSettings);

    showSavedNotice("Settings reset.");

    window.dispatchEvent(new Event("frontier-settings-updated"));
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
      </div>

      {tab === "business" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Business Profile</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This should later feed the invoice “From” section automatically.
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
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Workspace Configuration</h2>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Workspace Name</label>
              <input
                value={activeWorkspace.name}
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
                {businessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Workspace ID</label>
              <input
                value={activeWorkspace.id}
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
        </section>
      )}

      {tab === "permissions" && (
        <PermissionsSettings
          activeWorkspaceName={activeWorkspace.name}
          setSavedNotice={showSavedNotice}
        />
      )}
    </div>
  );
}