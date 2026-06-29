"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [editingItemId, setEditingItemId] = useState("");
  const [editingItemName, setEditingItemName] = useState("");
  const [editingCurrentQty, setEditingCurrentQty] = useState("");
  const [editingTargetQty, setEditingTargetQty] = useState("");

  const [itemName, setItemName] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [targetQty, setTargetQty] = useState("");
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
      setItemName(payloadString(hydration.payload, "name"));
      const quantity = payloadNumber(hydration.payload, "quantity");
      const target = payloadNumber(hydration.payload, "targetQuantity");
      setCurrentQty(quantity === null ? "" : String(quantity));
      setTargetQty(target === null ? "" : String(target));
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
    setItemName("");
    setCurrentQty("");
    setTargetQty("");
  }

  function closeNewItemModal() {
    setNewItemOpen(false);
    resetNewItemForm();
  }

  async function addInventoryItem() {
    if (!itemName.trim()) return;

    const current = Number(currentQty);
    const target = Number(targetQty);
    if (Number.isNaN(current) || Number.isNaN(target)) return;

    const newItem: InventoryRow = {
      name: itemName.trim(),
      currentQty: current,
      targetQty: target,
      warning: current < target,
      workspaceId: activeWorkspace.id,
    };

    try {
      const result = await createInventoryItemAction(inventoryRepo, newItem);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseInventoryItems((current) => [...current, created]);
      else saveInventory([...inventoryItems, created]);
      setDataError("");
      closeNewItemModal();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to create inventory item.");
    }
  }

  function openTargetEditor(item: InventoryRow) {
    setEditingItemId(item.id ?? "");
    setEditingItemName(item.name);
    setEditingCurrentQty(item.currentQty === null ? "" : String(item.currentQty));
    setEditingTargetQty(item.targetQty === null ? "" : String(item.targetQty));
    setEditTargetOpen(true);
  }

  function closeTargetEditor() {
    setEditTargetOpen(false);
    setEditingItemId("");
    setEditingItemName("");
    setEditingCurrentQty("");
    setEditingTargetQty("");
  }

  async function saveTargetEditor() {
    if (!editingItemName.trim()) return;
    if (!editingCurrentQty.trim() || !editingTargetQty.trim()) return;

    const current = Number(editingCurrentQty);
    const target = Number(editingTargetQty);
    if (Number.isNaN(current) || Number.isNaN(target)) return;

    const existingItem = inventoryItems.find(
      (item) =>
        item.workspaceId === activeWorkspace.id &&
        (editingItemId ? item.id === editingItemId : item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase())
    );

    const updatedItem: InventoryRow = {
      ...(existingItem ?? {
        name: editingItemName.trim(),
        workspaceId: activeWorkspace.id,
      }),
      currentQty: current,
      targetQty: target,
      warning: current < target,
      autoGenerated: false,
    };

    const updatedItems = existingItem
      ? inventoryItems.map((item) =>
          item.workspaceId === activeWorkspace.id &&
          (editingItemId ? item.id === editingItemId : item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase())
            ? updatedItem
            : item
        )
      : [...inventoryItems, updatedItem];

    try {
      const shouldCreate = !existingItem || existingItem.autoGenerated || !existingItem.id;
      const result = shouldCreate
        ? await createInventoryItemAction(inventoryRepo, updatedItem)
        : await updateInventoryItemAction(inventoryRepo, updatedItem);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const saved = result.data;
      if (isDatabaseMode) {
        setDatabaseInventoryItems((current) =>
          !shouldCreate
            ? current.map((item) => (editingItemId ? item.id === editingItemId : item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase()) ? saved : item)
            : [...current, saved]
        );
      } else {
        saveInventory(updatedItems);
      }
      setDataError("");
      closeTargetEditor();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to update inventory.");
    }
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
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">{editTargetOpen ? `Edit Inventory Item: ${editingItemName}` : "Add Inventory Item"}</h2>
              <button type="button" onClick={editTargetOpen ? closeTargetEditor : closeNewItemModal} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
            </div>

            <div className="space-y-4">
              {!editTargetOpen && <input type="text" value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Item Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Qty
                <input type="number" value={editTargetOpen ? editingCurrentQty : currentQty} onChange={(event) => editTargetOpen ? setEditingCurrentQty(event.target.value) : setCurrentQty(event.target.value)} placeholder="Current Qty" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Qty
                <input type="number" value={editTargetOpen ? editingTargetQty : targetQty} onChange={(event) => editTargetOpen ? setEditingTargetQty(event.target.value) : setTargetQty(event.target.value)} placeholder="Target Qty" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              </label>
              <button type="button" onClick={editTargetOpen ? saveTargetEditor : addInventoryItem} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">
                {editTargetOpen ? "Save Quantity Targets" : "Add Item"}
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
