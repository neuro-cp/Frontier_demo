"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createInventoryItemAction,
  deleteInventoryItemAction,
  updateInventoryItemAction,
} from "@/lib/actions/inventory";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createInventoryRepository, type InventoryRow } from "@/lib/db/inventory";
import { createJobsRepository } from "@/lib/db/jobs";
import type { Job } from "@/lib/jobTypes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import {
  consumeAiFormHydration,
  payloadNumber,
  payloadString,
  saveAiFormHydration,
  type AiFormHydration,
} from "@/lib/ai/formHydration";

type AllocationMaterial = { name: string; quantity: number; notes?: string };
type InventoryFormMode = "create" | "edit";

type InventoryFormState = {
  itemId: string;
  name: string;
  category: string;
  unit: string;
  description: string;
  currentQty: string;
  targetQty: string;
  reorderThreshold: string;
  preferredVendor: string;
  vendorSku: string;
  variantName: string;
  unitCost: string;
  retailPrice: string;
  storageLocation: string;
};

const emptyInventoryForm: InventoryFormState = {
  itemId: "",
  name: "",
  category: "",
  unit: "",
  description: "",
  currentQty: "",
  targetQty: "",
  reorderThreshold: "",
  preferredVendor: "",
  vendorSku: "",
  variantName: "",
  unitCost: "",
  retailPrice: "",
  storageLocation: "",
};

export default function InventoryPage() {
  const router = useRouter();
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInventoryItems, setLocalInventoryItems] = useStoredJsonState<InventoryRow[]>(
    storageKeys.inventory,
    []
  );
  const [databaseInventoryItems, setDatabaseInventoryItems] = useState<InventoryRow[]>([]);
  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [editTargetOpen, setEditTargetOpen] = useState(false);
  const [inventoryFormMode, setInventoryFormMode] = useState<InventoryFormMode>("create");
  const [inventoryForm, setInventoryForm] = useState<InventoryFormState>(emptyInventoryForm);
  const [inventoryFormError, setInventoryFormError] = useState("");
  const [allocationHydration, setAllocationHydration] = useState<AiFormHydration | null>(null);
  const [allocationJobId, setAllocationJobId] = useState("");
  const [allocationMode, setAllocationMode] = useState("Append");
  const [allocationMaterials, setAllocationMaterials] = useState<AllocationMaterial[]>([]);
  const [isSavingAllocation, setIsSavingAllocation] = useState(false);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const inventoryRepo = useMemo(() => createInventoryRepository({ isSignedIn: isDatabaseMode, supabase, localItems: localInventoryItems, setLocalItems: setLocalInventoryItems }), [isDatabaseMode, localInventoryItems, setLocalInventoryItems, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const inventoryItems = isDatabaseMode ? databaseInventoryItems : localInventoryItems;
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;

  useEffect(() => {
    const hydration = consumeAiFormHydration("material", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      if (hydration.actionType === "create_material_allocation") {
        const rawMaterials = hydration.payload.materials;
        const parsedMaterials = Array.isArray(rawMaterials)
          ? rawMaterials.flatMap((item) => {
              if (!item || typeof item !== "object" || Array.isArray(item)) return [];
              const name = typeof item.name === "string" ? item.name : "";
              const quantity = typeof item.quantity === "number" ? item.quantity : 1;
              const notes = typeof item.notes === "string" ? item.notes : "";
              return name ? [{ name, quantity, notes }] : [];
            })
          : [];
        setAllocationHydration(hydration);
        setAllocationJobId(payloadString(hydration.payload, "jobId"));
        const mode = payloadString(hydration.payload, "mode");
        setAllocationMode(["Append", "Merge", "Replace"].includes(mode) ? mode : "Append");
        setAllocationMaterials(parsedMaterials);
        return;
      }
      const quantity = payloadNumber(hydration.payload, "quantity");
      const target = payloadNumber(hydration.payload, "targetQuantity");
      setInventoryForm({
        ...emptyInventoryForm,
        name: payloadString(hydration.payload, "name"),
        currentQty: quantity === null ? "" : String(quantity),
        targetQty: target === null ? "" : String(target),
      });
      setInventoryFormMode("create");
      setNewItemOpen(true);
    });
  }, [activeWorkspace.id]);

  async function saveAllocationDraft() {
    if (!allocationHydration || !allocationJobId || allocationMaterials.length === 0) return;
    setIsSavingAllocation(true);
    setDataError("");
    try {
      const response = await fetch("/api/material-allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          jobId: allocationJobId,
          mode: allocationMode,
          materials: allocationMaterials,
          sourceDocumentId: allocationHydration.sourceId,
          reviewDraftId: allocationHydration.reviewDraftId,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to save material allocation draft.");
      setAllocationHydration(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to save material allocation draft.");
    } finally {
      setIsSavingAllocation(false);
    }
  }

  function openNewJobFromAllocation() {
    if (!allocationHydration) return;
    saveAiFormHydration(
      {
        workspaceId: allocationHydration.workspaceId,
        reviewDraftId: allocationHydration.reviewDraftId,
        sourceId: allocationHydration.sourceId,
        sourceType: allocationHydration.sourceType,
      },
      {
        type: "create_job",
        confidence: 1,
        payload: {
          title: payloadString(allocationHydration.payload, "jobName") || "Material work",
          materials: allocationMaterials,
          notes: "Created from an AI material allocation draft.",
        },
      }
    );
    router.push("/jobs?aiDraft=1");
  }

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([
      inventoryRepo.getInventoryItems(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
    ]).then(([items, jobs]) => {
      if (!cancelled) {
        setDatabaseInventoryItems(items);
        setDatabaseJobItems(jobs);
      }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load inventory.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, inventoryRepo, isDatabaseMode, jobsRepo]);

  const workspaceInventory = inventoryItems.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const activeMaterialJobs = jobItems.filter(
    (job) =>
      job.workspaceId === activeWorkspace.id &&
      (job.status === "Scheduled" || job.status === "Completed")
  );

  const autoMaterialRows: InventoryRow[] = activeMaterialJobs
    .flatMap((job) =>
      job.materials.map((material) => ({
        name: material.name.trim(),
        currentQty: null,
        targetQty: null,
        warning: true,
        workspaceId: activeWorkspace.id,
        autoGenerated: true,
      }))
    )
    .filter((material, index, materials) => {
      const normalizedName = material.name.toLowerCase();
      return (
        material.name.length > 0 &&
        materials.findIndex((candidate) => candidate.name.toLowerCase() === normalizedName) === index
      );
    });

  const mergedInventory = [
    ...workspaceInventory,
    ...autoMaterialRows.filter(
      (material) =>
        !workspaceInventory.some(
          (item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase()
        )
    ),
  ];

  function saveInventory(updatedItems: InventoryRow[]) {
    const persistedItems = updatedItems.filter((item) => !item.autoGenerated);
    if (isDatabaseMode) setDatabaseInventoryItems(persistedItems);
    else setLocalInventoryItems(persistedItems);
  }

  function setInventoryField(field: keyof InventoryFormState, value: string) {
    setInventoryForm((current) => ({ ...current, [field]: value }));
  }

  function nullableNumber(value: string) {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function moneyToCents(value: string) {
    if (!value.trim()) return null;
    const amount = Number(value.replace(/[$,]/g, ""));
    return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
  }

  function centsToMoney(value?: number | null) {
    return value == null ? "" : String(value / 100);
  }

  async function postJson(path: string, body: Record<string, unknown>) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { data?: unknown; error?: string };
    if (!response.ok) throw new Error(payload.error || "Inventory request failed.");
    return payload.data;
  }

  function getReservedForItem(itemName: string) {
    return activeMaterialJobs.flatMap((job) =>
      job.materials
        .filter((material) => material.name.trim().toLowerCase() === itemName.trim().toLowerCase())
        .map((material) => ({
          jobId: job.id,
          jobName: job.name,
          jobStatus: job.status,
          quantity: material.quantity,
        }))
    );
  }

  function getItemKey(item: InventoryRow) {
    return item.id ?? `${item.workspaceId}:${item.name.trim().toLowerCase()}`;
  }

  function toggleItem(item: InventoryRow) {
    const itemKey = getItemKey(item);
    setSelectedItems((current) =>
      current.includes(itemKey)
        ? current.filter((key) => key !== itemKey)
        : [...current, itemKey]
    );
  }

  async function removeSelectedItems() {
    if (!canDeleteBusinessRecords) return;

    try {
      const selected = inventoryItems.filter((item) => selectedItems.includes(getItemKey(item)));
      const results = await Promise.all(
        selected.map((item) => deleteInventoryItemAction(inventoryRepo, item))
      );
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !results.some((result) => result.ok)) {
        setDataError(failedDelete.ok ? "Unable to delete inventory." : failedDelete.error);
        return;
      }
      saveInventory(inventoryItems.filter((item) => !selectedItems.includes(getItemKey(item))));
      setSelectedItems([]);
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to delete inventory.");
    }
  }

  function resetNewItemForm() {
    setInventoryForm(emptyInventoryForm);
    setInventoryFormMode("create");
    setInventoryFormError("");
  }

  function closeNewItemModal() {
    setNewItemOpen(false);
    resetNewItemForm();
  }

  async function addInventoryItem() {
    return saveInventoryForm();
  }

  async function saveInventoryForm() {
    setInventoryFormError("");
    const form = inventoryForm;
    if (!form.name.trim()) {
      setInventoryFormError("Item name is required.");
      return;
    }

    const duplicateName = inventoryItems.some(
      (item) =>
        item.workspaceId === activeWorkspace.id &&
        !item.autoGenerated &&
        item.id !== form.itemId &&
        item.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );
    if (duplicateName && !form.vendorSku.trim()) {
      setInventoryFormError("This item name already exists. Open the existing item or use a different SKU variant.");
      return;
    }

    const current = nullableNumber(form.currentQty);
    const target = nullableNumber(form.targetQty);
    const reorderThreshold = nullableNumber(form.reorderThreshold);
    const unitCostCents = moneyToCents(form.unitCost);
    const retailPriceCents = moneyToCents(form.retailPrice);
    if ([current, target, reorderThreshold, unitCostCents, retailPriceCents].some(Number.isNaN)) {
      setInventoryFormError("Quantities and prices must be valid numbers.");
      return;
    }

    const nextItem: InventoryRow = {
      id: form.itemId || undefined,
      name: form.name.trim(),
      currentQty: current,
      targetQty: target,
      reorderThreshold,
      unit: form.unit.trim() || undefined,
      notes: form.description.trim() || undefined,
      storageLocation: form.storageLocation.trim() || undefined,
      warning: (current ?? 0) < (reorderThreshold ?? target ?? 0),
      workspaceId: activeWorkspace.id,
    };

    try {
      const result =
        inventoryFormMode === "edit" && form.itemId
          ? await updateInventoryItemAction(inventoryRepo, nextItem)
          : await createInventoryItemAction(inventoryRepo, nextItem);
      if (!result.ok) {
        setInventoryFormError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) {
        const catalogPayload = {
          workspace_id: activeWorkspace.id,
          inventory_item_id: created.id,
          name: form.name.trim(),
          category: form.category.trim() || null,
          unit: form.unit.trim() || null,
          description: form.description.trim() || null,
          default_cost_cents: unitCostCents,
          retail_price_cents: retailPriceCents,
          preferred_vendor: form.preferredVendor.trim() || null,
          vendor_sku: form.vendorSku.trim() || null,
          variant_name: form.variantName.trim() || null,
        };

        const existingCatalog = created.id ? await loadCatalogForInventoryItem(created.id) : null;
        const savedCatalog = existingCatalog?.id
          ? await postJson("/api/data/mutate", {
              entity: "material_catalog_item",
              operation: "update",
              payload: { ...catalogPayload, id: existingCatalog.id },
            })
          : await postJson("/api/data/create", {
              entity: "material_catalog_item",
              payload: catalogPayload,
            });

        if (form.preferredVendor.trim() && form.vendorSku.trim() && savedCatalog && typeof savedCatalog === "object" && "id" in savedCatalog) {
          await postJson("/api/data/create", {
            entity: "material_vendor_sku",
            payload: {
              workspace_id: activeWorkspace.id,
              material_id: String((savedCatalog as { id: string }).id),
              vendor_name: form.preferredVendor.trim(),
              sku: form.vendorSku.trim(),
              variant_name: form.variantName.trim() || null,
              unit_cost_cents: unitCostCents,
              retail_price_cents: retailPriceCents,
              notes: null,
            },
          }).catch((error) => {
            if (!(error instanceof Error) || !error.message.toLowerCase().includes("already exist")) throw error;
          });
        }

        setDatabaseInventoryItems((current) =>
          inventoryFormMode === "edit"
            ? current.map((item) => item.id === created.id ? created : item)
            : [...current, created]
        );
      } else {
        saveInventory(
          inventoryFormMode === "edit"
            ? inventoryItems.map((item) => getItemKey(item) === getItemKey(created) ? created : item)
            : [...inventoryItems, created]
        );
      }
      setDataError("");
      closeNewItemModal();
    } catch (error) {
      setInventoryFormError(error instanceof Error ? error.message : "Unable to create inventory item.");
    }
  }

  async function loadCatalogForInventoryItem(itemId: string) {
    if (!supabase || !isDatabaseMode) return null;
    const { data, error } = await supabase
      .from("material_catalog_items")
      .select("id, category, unit, description, default_cost_cents, retail_price_cents, preferred_vendor, vendor_sku, variant_name")
      .eq("workspace_id", activeWorkspace.id)
      .eq("inventory_item_id", itemId)
      .maybeSingle();
    if (error) throw error;
    return data as {
      id: string;
      category: string | null;
      unit: string | null;
      description: string | null;
      default_cost_cents: number | null;
      retail_price_cents: number | null;
      preferred_vendor: string | null;
      vendor_sku: string | null;
      variant_name: string | null;
    } | null;
  }

  async function openTargetEditor(item: InventoryRow) {
    setInventoryFormMode("edit");
    setInventoryFormError("");
    setInventoryForm({
      ...emptyInventoryForm,
      itemId: item.id ?? "",
      name: item.name,
      currentQty: item.currentQty === null ? "" : String(item.currentQty),
      targetQty: item.targetQty === null ? "" : String(item.targetQty),
      reorderThreshold: item.reorderThreshold == null ? "" : String(item.reorderThreshold),
      unit: item.unit ?? "",
      description: item.notes ?? "",
      storageLocation: item.storageLocation ?? "",
    });
    if (item.id && isDatabaseMode) {
      try {
        const catalog = await loadCatalogForInventoryItem(item.id);
        if (catalog) {
          setInventoryForm((current) => ({
            ...current,
            category: catalog.category ?? "",
            unit: catalog.unit ?? current.unit,
            description: catalog.description ?? current.description,
            unitCost: centsToMoney(catalog.default_cost_cents),
            retailPrice: centsToMoney(catalog.retail_price_cents),
            preferredVendor: catalog.preferred_vendor ?? "",
            vendorSku: catalog.vendor_sku ?? "",
            variantName: catalog.variant_name ?? "",
          }));
        }
      } catch (error) {
        setInventoryFormError(error instanceof Error ? error.message : "Unable to load material details.");
      }
    }
    setEditTargetOpen(true);
  }

  function closeTargetEditor() {
    setEditTargetOpen(false);
    resetNewItemForm();
  }

  async function saveTargetEditor() {
    return saveInventoryForm();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setNewItemOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
            + Add Item
          </button>
          <button type="button" onClick={removeSelectedItems} disabled={selectedItems.length === 0 || !canDeleteBusinessRecords} className="rounded-lg bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            Remove Item
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Use the Actions column to update inventory quantities and thresholds.
      </div>

      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading inventory...
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[1180px] w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="w-12 px-4 py-4"></th>
              <th className="px-6 py-4 text-left">Item Name</th>
              <th className="px-6 py-4 text-center">Current Qty</th>
              <th className="px-6 py-4 text-center">Reserved</th>
              <th className="px-6 py-4 text-center">Available Qty</th>
              <th className="px-6 py-4 text-center">Target Qty</th>
              <th className="px-6 py-4 text-left">Tied Jobs</th>
              <th className="px-6 py-4 text-right">Suggested Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {mergedInventory.length > 0 ? (
              mergedInventory.map((item) => {
                const reservedJobs = getReservedForItem(item.name);
                const reservedQty = reservedJobs.reduce((total, reserved) => total + reserved.quantity, 0);
                const availableAfterJobs = item.currentQty === null ? null : item.currentQty - reservedQty;
                const suggestedOrder = item.targetQty === null || availableAfterJobs === null ? null : Math.max(item.targetQty - availableAfterJobs, 0);
                const warning = item.currentQty === null || item.targetQty === null || (availableAfterJobs !== null && availableAfterJobs < item.targetQty);

                return (
                  <tr key={getItemKey(item)} className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg">
                    <td className="px-4 py-5 text-center">
                      <input type="checkbox" checked={selectedItems.includes(getItemKey(item))} onChange={() => toggleItem(item)} disabled={item.autoGenerated} className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40" />
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {warning && <span className="text-orange-500">-</span>}
                        {item.id ? (
                          <Link href={`/inventory/${item.id}`} className="text-blue-600 hover:underline dark:text-blue-400">{item.name}</Link>
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {item.autoGenerated && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Job material</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-gray-900 dark:text-gray-100">{item.currentQty ?? "-"}</td>
                    <td className="px-6 py-5 text-center text-blue-600 dark:text-blue-400">{reservedQty}</td>
                    <td className={`px-6 py-5 text-center ${warning ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{availableAfterJobs ?? "-"}</td>
                    <td className="px-6 py-5 text-center text-gray-900 dark:text-gray-100">{item.targetQty ?? "-"}</td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                      {reservedJobs.length > 0 ? (
                        <div className="space-y-1">
                          {reservedJobs.map((reserved) => (
                            <div key={`${reserved.jobId}-${reserved.quantity}`}>{reserved.quantity} - {reserved.jobName} ({reserved.jobStatus})</div>
                          ))}
                        </div>
                      ) : "-"}
                    </td>
                    <td className={`px-6 py-5 text-right ${warning ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}>{suggestedOrder ?? "-"}</td>
                    <td className="px-6 py-5 text-right">
                      <button type="button" onClick={() => openTargetEditor(item)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={9} className="px-6 py-16 text-center text-xl text-gray-500 dark:text-gray-400">No inventory items or scheduled job materials for {workspaceDisplayName}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(newItemOpen || editTargetOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">{editTargetOpen ? `Edit Inventory Item: ${inventoryForm.name}` : "Add Inventory Item"}</h2>
              <button type="button" onClick={editTargetOpen ? closeTargetEditor : closeNewItemModal} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
            </div>

            <div className="space-y-5">
              <FormSection title="Basic Information">
                <FormInput label="Item Name" value={inventoryForm.name} onChange={(value) => setInventoryField("name", value)} required />
                <FormInput label="Category" value={inventoryForm.category} onChange={(value) => setInventoryField("category", value)} placeholder="Roofing, mulch, pipe, fittings" />
                <FormInput label="Unit" value={inventoryForm.unit} onChange={(value) => setInventoryField("unit", value)} placeholder="bag, bundle, gallon, sq ft" />
                <label className="block text-sm font-medium text-gray-700 sm:col-span-2 dark:text-gray-300">
                  Description
                  <textarea value={inventoryForm.description} onChange={(event) => setInventoryField("description", event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                </label>
              </FormSection>
              <FormSection title="Inventory">
                <FormInput label="Current Quantity" type="number" value={inventoryForm.currentQty} onChange={(value) => setInventoryField("currentQty", value)} />
                <FormInput label="Target Quantity" type="number" value={inventoryForm.targetQty} onChange={(value) => setInventoryField("targetQty", value)} />
                <FormInput label="Reorder Threshold" type="number" value={inventoryForm.reorderThreshold} onChange={(value) => setInventoryField("reorderThreshold", value)} />
              </FormSection>
              <FormSection title="Purchasing">
                <FormInput label="Preferred Supplier" value={inventoryForm.preferredVendor} onChange={(value) => setInventoryField("preferredVendor", value)} />
                <FormInput label="Supplier SKU / Part Number" value={inventoryForm.vendorSku} onChange={(value) => setInventoryField("vendorSku", value)} />
                <FormInput label="Variant / Color / Size" value={inventoryForm.variantName} onChange={(value) => setInventoryField("variantName", value)} placeholder="Charcoal, 2 inch, left-hand" />
                <FormInput label="Unit Cost" value={inventoryForm.unitCost} onChange={(value) => setInventoryField("unitCost", value)} placeholder="0.00" />
                <FormInput label="Retail Price" value={inventoryForm.retailPrice} onChange={(value) => setInventoryField("retailPrice", value)} placeholder="0.00" />
              </FormSection>
              <FormSection title="Storage">
                <FormInput label="Storage Location" value={inventoryForm.storageLocation} onChange={(value) => setInventoryField("storageLocation", value)} placeholder="Warehouse, Truck 1, Trailer, Shelf A" />
              </FormSection>
              {inventoryFormError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {inventoryFormError}
                </div>
              )}
              <button type="button" onClick={editTargetOpen ? saveTargetEditor : addInventoryItem} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">
                {editTargetOpen ? "Save Inventory Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
      {allocationHydration && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Material Allocation Draft</h2>
              <button type="button" onClick={() => setAllocationHydration(null)} className="text-2xl text-gray-500">x</button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Choose a job and how these reviewed materials should be handled. Saving creates a draft allocation only.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Job
                <select value={allocationJobId} onChange={(event) => setAllocationJobId(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <option value="">Choose job</option>
                  {jobItems.filter((job) => job.workspaceId === activeWorkspace.id).map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Mode
                <select value={allocationMode} onChange={(event) => setAllocationMode(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <option>Append</option><option>Merge</option><option>Replace</option>
                </select>
              </label>
            </div>
            <div className="mt-5 space-y-3">
              {allocationMaterials.map((material, index) => (
                <div key={`${material.name}-${index}`} className="grid gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_8rem] dark:border-gray-800">
                  <input value={material.name} onChange={(event) => setAllocationMaterials((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                  <input type="number" min="0.01" step="0.01" value={material.quantity} onChange={(event) => setAllocationMaterials((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item))} className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={openNewJobFromAllocation} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700">Create New Job</button>
              <button type="button" disabled={!allocationJobId || isSavingAllocation} onClick={saveAllocationDraft} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-50">{isSavingAllocation ? "Saving..." : "Save Draft Allocation"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="font-bold text-gray-950 dark:text-gray-100">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}{required ? " *" : ""}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
    </label>
  );
}
