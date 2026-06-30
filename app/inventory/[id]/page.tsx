"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { InventoryRow } from "@/lib/db/inventory";
import { isUuid } from "@/lib/db/ids";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type MaterialDetail = {
  inventory: { id: string; name: string; current_qty: number | null; target_qty: number | null; unit?: string | null; notes?: string | null; reorder_threshold?: number | null; storage_location?: string | null };
  catalog: { id: string; description: string | null; category: string | null; unit: string | null; default_cost_cents: number | null; retail_price_cents?: number | null; preferred_vendor?: string | null; vendor_sku?: string | null; variant_name?: string | null } | null;
  vendorSkus: Array<{ id: string; vendor_name: string; sku: string; unit_cost_cents: number | null; retail_price_cents?: number | null; variant_name?: string | null; notes?: string | null }>;
  lots: Array<{ id: string; quantity: number; lot_reference: string | null; received_at: string | null }>;
  allocations: Array<{ id: string; quantity: number; mode: string; status: string; job_id: string | null }>;
  jobMaterials: Array<{ jobId: string; jobName: string; jobStatus: string; clientName: string | null; quantity: number; materialName: string }>;
  documents: Array<{ id: string; name: string; file_name: string | null; created_at: string }>;
};

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspace();
  const { user, isSupabaseConfigured } = useAuthSession();
  const [localItems] = useStoredJsonState<InventoryRow[]>(storageKeys.inventory, []);
  const [detail, setDetail] = useState<MaterialDetail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCurrentQty, setEditCurrentQty] = useState("");
  const [editTargetQty, setEditTargetQty] = useState("");
  const [editReorderThreshold, setEditReorderThreshold] = useState("");
  const [editStorageLocation, setEditStorageLocation] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDefaultCost, setEditDefaultCost] = useState("");
  const [editRetailPrice, setEditRetailPrice] = useState("");
  const [editPreferredVendor, setEditPreferredVendor] = useState("");
  const [editVendorSku, setEditVendorSku] = useState("");
  const [editVariantName, setEditVariantName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorSku, setVendorSku] = useState("");
  const [vendorVariantName, setVendorVariantName] = useState("");
  const [vendorUnitCost, setVendorUnitCost] = useState("");
  const [vendorRetailPrice, setVendorRetailPrice] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");
  const [selectedVendorSkuId, setSelectedVendorSkuId] = useState("");
  const [vendorEditName, setVendorEditName] = useState("");
  const [vendorEditSku, setVendorEditSku] = useState("");
  const [vendorEditVariantName, setVendorEditVariantName] = useState("");
  const [vendorEditUnitCost, setVendorEditUnitCost] = useState("");
  const [vendorEditRetailPrice, setVendorEditRetailPrice] = useState("");
  const [vendorEditNotes, setVendorEditNotes] = useState("");
  const isDatabaseMode = Boolean(user && isSupabaseConfigured);
  const supabase = useMemo(() => isDatabaseMode ? createBrowserSupabaseClient() : null, [isDatabaseMode]);

  useEffect(() => {
    if (!isDatabaseMode || !supabase || !isUuid(id) || !isUuid(activeWorkspace.id)) return;
    let cancelled = false;
    const client = supabase;

    async function load() {
      const { data: inventory, error: inventoryError } = await client
        .from("inventory_items")
        .select("id, name, current_qty, target_qty, unit, notes, reorder_threshold, storage_location")
        .eq("id", id)
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();
      if (inventoryError || !inventory) throw new Error(inventoryError?.message || "Material not found.");

      const { data: catalog, error: catalogError } = await client
        .from("material_catalog_items")
        .select("id, description, category, unit, default_cost_cents, retail_price_cents, preferred_vendor, vendor_sku, variant_name")
        .eq("inventory_item_id", id)
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();
      if (catalogError) throw new Error(catalogError.message);

      const materialId = catalog?.id;
      const [vendorResult, lotResult, allocationResult, documentResult] = materialId
        ? await Promise.all([
            client.from("material_vendor_skus").select("id, vendor_name, sku, unit_cost_cents, retail_price_cents, variant_name, notes").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
            client.from("inventory_lots").select("id, quantity, lot_reference, received_at").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
            client.from("job_material_allocations").select("id, quantity, mode, status, job_id").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
            client.from("documents").select("id, name, file_name, created_at").eq("workspace_id", activeWorkspace.id).eq("material_catalog_item_id", materialId),
          ])
        : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
      const relatedError = vendorResult.error || lotResult.error || allocationResult.error || documentResult.error;
      if (relatedError) throw new Error(relatedError.message);

      const { data: jobs, error: jobsError } = await client
        .from("jobs")
        .select("id, name, status, client_name_snapshot, job_materials(name, quantity)")
        .eq("workspace_id", activeWorkspace.id);
      if (jobsError) throw new Error(jobsError.message);

      const matchTokens = [
        inventory.name,
        catalog?.vendor_sku,
        catalog?.variant_name,
        ...(vendorResult.data ?? []).flatMap((sku) => [sku.sku, sku.variant_name]),
      ]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase())
        .filter((value) => value.length >= 2);

      const jobMaterials = (jobs ?? []).flatMap((job) =>
        ((job.job_materials ?? []) as Array<{ name: string; quantity: number }>).flatMap((material) => {
          const materialName = material.name.trim().toLowerCase();
          const matches = matchTokens.some(
            (token) => materialName.includes(token) || token.includes(materialName)
          );
          return matches
            ? [{
                jobId: job.id,
                jobName: job.name,
                jobStatus: job.status,
                clientName: job.client_name_snapshot,
                quantity: Number(material.quantity),
                materialName: material.name,
              }]
            : [];
        })
      );

      if (!cancelled) {
        setDetail({
          inventory,
          catalog: catalog ?? null,
          vendorSkus: vendorResult.data ?? [],
          lots: lotResult.data ?? [],
          allocations: allocationResult.data ?? [],
          jobMaterials,
          documents: documentResult.data ?? [],
        });
      }
    }

    load().catch((loadError) => {
      if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load material.");
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, id, isDatabaseMode, supabase]);

  const inventory = useMemo(() => {
    const localItem = !isDatabaseMode ? localItems.find((item) => item.id === id) : null;
    return detail?.inventory ?? (localItem ? { id: localItem.id ?? id, name: localItem.name, current_qty: localItem.currentQty, target_qty: localItem.targetQty, unit: localItem.unit, notes: localItem.notes, reorder_threshold: localItem.reorderThreshold, storage_location: localItem.storageLocation } : null);
  }, [detail?.inventory, id, isDatabaseMode, localItems]);

  useEffect(() => {
    if (!inventory) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setEditName(inventory.name);
      setEditCurrentQty(inventory.current_qty == null ? "" : String(inventory.current_qty));
      setEditTargetQty(inventory.target_qty == null ? "" : String(inventory.target_qty));
      setEditReorderThreshold(inventory.reorder_threshold == null ? "" : String(inventory.reorder_threshold));
      setEditStorageLocation(inventory.storage_location ?? "");
      setEditCategory(detail?.catalog?.category ?? "");
      setEditUnit(detail?.catalog?.unit ?? inventory.unit ?? "");
      setEditDescription(detail?.catalog?.description ?? inventory.notes ?? "");
      setEditDefaultCost(detail?.catalog?.default_cost_cents == null ? "" : String(detail.catalog.default_cost_cents / 100));
      setEditRetailPrice(detail?.catalog?.retail_price_cents == null ? "" : String(detail.catalog.retail_price_cents / 100));
      setEditPreferredVendor(detail?.catalog?.preferred_vendor ?? "");
      setEditVendorSku(detail?.catalog?.vendor_sku ?? "");
      setEditVariantName(detail?.catalog?.variant_name ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [detail, inventory]);

  function moneyToCents(value: string) {
    if (!value.trim()) return null;
    const amount = Number(value.replace(/[$,]/g, ""));
    return Number.isFinite(amount) ? Math.round(amount * 100) : null;
  }

  async function postJson(path: string, body: Record<string, unknown>) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to save material.");
    return payload.data;
  }

  async function saveMaterialDetails() {
    if (!inventory || !isUuid(activeWorkspace.id)) return;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const savedInventory = await postJson("/api/data/mutate", {
        entity: "inventory_item",
        operation: "update",
        payload: {
          id: inventory.id,
          workspace_id: activeWorkspace.id,
          name: editName.trim(),
          current_qty: editCurrentQty.trim() ? Number(editCurrentQty) : null,
          target_qty: editTargetQty.trim() ? Number(editTargetQty) : null,
          unit: editUnit.trim() || null,
          notes: editDescription.trim() || null,
          reorder_threshold: editReorderThreshold.trim() ? Number(editReorderThreshold) : null,
          storage_location: editStorageLocation.trim() || null,
        },
      });

      const catalogPayload = {
        id: detail?.catalog?.id,
        workspace_id: activeWorkspace.id,
        inventory_item_id: inventory.id,
        name: editName.trim(),
        category: editCategory.trim() || null,
        unit: editUnit.trim() || null,
        description: editDescription.trim() || null,
        default_cost_cents: moneyToCents(editDefaultCost),
        retail_price_cents: moneyToCents(editRetailPrice),
        preferred_vendor: editPreferredVendor.trim() || null,
        vendor_sku: editVendorSku.trim() || null,
        variant_name: editVariantName.trim() || null,
      };
      const savedCatalog = detail?.catalog?.id
        ? await postJson("/api/data/mutate", {
            entity: "material_catalog_item",
            operation: "update",
            payload: catalogPayload,
          })
        : await postJson("/api/data/create", {
            entity: "material_catalog_item",
            payload: catalogPayload,
          });

      setDetail((current) => current ? { ...current, inventory: savedInventory, catalog: savedCatalog } : current);
      setNotice("Material details saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save material.");
    } finally {
      setIsSaving(false);
    }
  }

  async function addVendorSku() {
    if (!detail?.catalog?.id || !vendorName.trim() || !vendorSku.trim()) return;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const savedSku = await postJson("/api/data/create", {
        entity: "material_vendor_sku",
        payload: {
          workspace_id: activeWorkspace.id,
          material_id: detail.catalog.id,
          vendor_name: vendorName.trim(),
          sku: vendorSku.trim(),
          variant_name: vendorVariantName.trim() || null,
          unit_cost_cents: moneyToCents(vendorUnitCost),
          retail_price_cents: moneyToCents(vendorRetailPrice),
          notes: vendorNotes.trim() || null,
        },
      });
      setDetail((current) => current ? { ...current, vendorSkus: [...current.vendorSkus, savedSku] } : current);
      setVendorName("");
      setVendorSku("");
      setVendorVariantName("");
      setVendorUnitCost("");
      setVendorRetailPrice("");
      setVendorNotes("");
      setSelectedVendorSkuId("");
      setNotice("Supplier SKU added.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add supplier SKU.");
    } finally {
      setIsSaving(false);
    }
  }

  function isSupplierUnavailable(row: MaterialDetail["vendorSkus"][number]) {
    return (row.notes ?? "").includes("[Unavailable]");
  }

  function setSupplierAvailabilityNote(notes: string | null | undefined, unavailable: boolean) {
    const cleanNotes = (notes ?? "").replace(/\s*\[Unavailable\]\s*/g, " ").replace(/\s+/g, " ").trim();
    return unavailable ? `[Unavailable]${cleanNotes ? ` ${cleanNotes}` : ""}` : cleanNotes || null;
  }

  function displaySupplierNotes(notes: string | null | undefined) {
    return (notes ?? "").replace(/\s*\[Unavailable\]\s*/g, " ").replace(/\s+/g, " ").trim();
  }

  async function updateVendorSkuStatus(row: MaterialDetail["vendorSkus"][number], status: "Available" | "Unavailable") {
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const savedSku = await postJson("/api/data/mutate", {
        entity: "material_vendor_sku",
        operation: "update",
        payload: {
          ...row,
          workspace_id: activeWorkspace.id,
          material_id: detail?.catalog?.id,
          notes: setSupplierAvailabilityNote(row.notes, status === "Unavailable"),
        },
      });
      setDetail((current) => current ? { ...current, vendorSkus: current.vendorSkus.map((sku) => sku.id === row.id ? savedSku : sku) } : current);
      setNotice(status === "Unavailable" ? "Supplier marked unavailable." : "Supplier marked available.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update supplier.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveSelectedVendorSku(row: MaterialDetail["vendorSkus"][number]) {
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const savedSku = await postJson("/api/data/mutate", {
        entity: "material_vendor_sku",
        operation: "update",
        payload: {
          id: row.id,
          workspace_id: activeWorkspace.id,
          material_id: detail?.catalog?.id,
          vendor_name: vendorEditName.trim(),
          sku: vendorEditSku.trim(),
          variant_name: vendorEditVariantName.trim() || null,
          unit_cost_cents: moneyToCents(vendorEditUnitCost),
          retail_price_cents: moneyToCents(vendorEditRetailPrice),
          notes: setSupplierAvailabilityNote(vendorEditNotes.trim() || null, isSupplierUnavailable(row)),
        },
      });
      setDetail((current) => current ? { ...current, vendorSkus: current.vendorSkus.map((sku) => sku.id === row.id ? savedSku : sku) } : current);
      setNotice("Supplier details saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update supplier.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSelectedVendorSku(row: MaterialDetail["vendorSkus"][number]) {
    if (!window.confirm(`Delete supplier ${row.vendor_name} SKU ${row.sku}?`)) return;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      await postJson("/api/data/mutate", {
        entity: "material_vendor_sku",
        operation: "delete",
        payload: {
          id: row.id,
          workspace_id: activeWorkspace.id,
        },
      });
      setDetail((current) => current ? { ...current, vendorSkus: current.vendorSkus.filter((sku) => sku.id !== row.id) } : current);
      setSelectedVendorSkuId("");
      setNotice("Supplier deleted.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to delete supplier.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <Link href="/inventory" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">Back to Inventory</Link>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">{notice}</div>}
      {!inventory ? <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">Loading material...</div> : (
        <>
          <header>
            <h1 className="text-3xl font-bold">{inventory.name}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Current {inventory.current_qty ?? "-"} - Target {inventory.target_qty ?? "-"} - Reorder {inventory.reorder_threshold ?? "-"}
            </p>
          </header>
          <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <h2 className="text-xl font-bold">Material Details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">Name<input value={editName} onChange={(event) => setEditName(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Category<input value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Unit<input value={editUnit} onChange={(event) => setEditUnit(event.target.value)} placeholder="bag, gallon, sq ft" className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Storage Location<input value={editStorageLocation} onChange={(event) => setEditStorageLocation(event.target.value)} placeholder="Warehouse, Truck 1, Trailer" className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Current Qty<input type="number" value={editCurrentQty} onChange={(event) => setEditCurrentQty(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Target Qty<input type="number" value={editTargetQty} onChange={(event) => setEditTargetQty(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Reorder Threshold<input type="number" value={editReorderThreshold} onChange={(event) => setEditReorderThreshold(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Default Unit Cost<input value={editDefaultCost} onChange={(event) => setEditDefaultCost(event.target.value)} placeholder="0.00" className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Retail Price<input value={editRetailPrice} onChange={(event) => setEditRetailPrice(event.target.value)} placeholder="0.00" className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Preferred Supplier<input value={editPreferredVendor} onChange={(event) => setEditPreferredVendor(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Supplier SKU / Part Number<input value={editVendorSku} onChange={(event) => setEditVendorSku(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Variant / Color / Size<input value={editVariantName} onChange={(event) => setEditVariantName(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Description<textarea rows={3} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
            </div>
            <button type="button" onClick={saveMaterialDetails} disabled={isSaving} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Save Material Details</button>
          </section>
          <section>
            <h2 className="text-xl font-bold">Supplier / SKU Variants</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              {detail?.vendorSkus.length ? detail.vendorSkus.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setSelectedVendorSkuId(row.id);
                    setVendorEditName(row.vendor_name);
                    setVendorEditSku(row.sku);
                    setVendorEditVariantName(row.variant_name ?? "");
                    setVendorEditUnitCost(row.unit_cost_cents == null ? "" : String(row.unit_cost_cents / 100));
                    setVendorEditRetailPrice(row.retail_price_cents == null ? "" : String(row.retail_price_cents / 100));
                    setVendorEditNotes(displaySupplierNotes(row.notes));
                  }}
                  className="flex w-full items-center justify-between gap-4 border-b border-gray-200 p-4 text-left last:border-0 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-950/30"
                >
                  <span>
                    {row.vendor_name} - SKU {row.sku}{row.variant_name ? ` - ${row.variant_name}` : ""} - Cost {row.unit_cost_cents == null ? "Not set" : `$${(row.unit_cost_cents / 100).toFixed(2)}`} - Retail {row.retail_price_cents == null ? "Not set" : `$${(row.retail_price_cents / 100).toFixed(2)}`}
                    {isSupplierUnavailable(row) && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">Unavailable</span>}
                  </span>
                  <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                    {detail.jobMaterials.length} linked job{detail.jobMaterials.length === 1 ? "" : "s"}
                  </span>
                </button>
              )) : <div className="p-6 text-gray-500 dark:text-gray-400">No supplier SKUs.</div>}
            </div>
          </section>
          {detail?.catalog?.id && (
            <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-xl font-bold">Add Supplier / SKU Variant</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="Supplier" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorSku} onChange={(event) => setVendorSku(event.target.value)} placeholder="SKU" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorVariantName} onChange={(event) => setVendorVariantName(event.target.value)} placeholder="Variant / Color / Size" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorUnitCost} onChange={(event) => setVendorUnitCost(event.target.value)} placeholder="Unit cost" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorRetailPrice} onChange={(event) => setVendorRetailPrice(event.target.value)} placeholder="Retail price" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorNotes} onChange={(event) => setVendorNotes(event.target.value)} placeholder="Notes" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
              </div>
              <button type="button" onClick={addVendorSku} disabled={isSaving || !vendorName.trim() || !vendorSku.trim()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Add Supplier SKU</button>
            </section>
          )}
          <RelatedTable title="Inventory Lots" empty="No inventory lots." rows={detail?.lots.map((row) => `${row.quantity} - ${row.lot_reference || "No reference"} - ${row.received_at || "No received date"}`) ?? []} />
          <RelatedTable title="Assigned Jobs / Usage History" empty="No material allocations or matching job materials." rows={[
            ...(detail?.allocations.map((row) => `${row.quantity} - ${row.mode} - ${row.status} - Job ${row.job_id || "unassigned"}`) ?? []),
            ...(detail?.jobMaterials.map((row) => `${row.quantity} - ${row.materialName} - ${row.jobName} (${row.jobStatus})${row.clientName ? ` - ${row.clientName}` : ""}`) ?? []),
          ]} />
          <RelatedTable title="Linked Documents" empty="No linked documents." rows={detail?.documents.map((row) => `${row.file_name || row.name} - ${new Date(row.created_at).toLocaleDateString()}`) ?? []} />
          {selectedVendorSkuId && (
            <VendorSkuModal
              row={detail?.vendorSkus.find((sku) => sku.id === selectedVendorSkuId) ?? null}
              linkedJobs={detail?.jobMaterials ?? []}
              isSaving={isSaving}
              editName={vendorEditName}
              editSku={vendorEditSku}
              editVariantName={vendorEditVariantName}
              editUnitCost={vendorEditUnitCost}
              editRetailPrice={vendorEditRetailPrice}
              editNotes={vendorEditNotes}
              onEditName={setVendorEditName}
              onEditSku={setVendorEditSku}
              onEditVariantName={setVendorEditVariantName}
              onEditUnitCost={setVendorEditUnitCost}
              onEditRetailPrice={setVendorEditRetailPrice}
              onEditNotes={setVendorEditNotes}
              onSave={saveSelectedVendorSku}
              onDelete={deleteSelectedVendorSku}
              onStatusChange={updateVendorSkuStatus}
              onClose={() => setSelectedVendorSkuId("")}
            />
          )}
        </>
      )}
    </div>
  );
}

function VendorSkuModal({
  row,
  linkedJobs,
  isSaving,
  editName,
  editSku,
  editVariantName,
  editUnitCost,
  editRetailPrice,
  editNotes,
  onEditName,
  onEditSku,
  onEditVariantName,
  onEditUnitCost,
  onEditRetailPrice,
  onEditNotes,
  onSave,
  onDelete,
  onStatusChange,
  onClose,
}: {
  row: MaterialDetail["vendorSkus"][number] | null;
  linkedJobs: MaterialDetail["jobMaterials"];
  isSaving: boolean;
  editName: string;
  editSku: string;
  editVariantName: string;
  editUnitCost: string;
  editRetailPrice: string;
  editNotes: string;
  onEditName: (value: string) => void;
  onEditSku: (value: string) => void;
  onEditVariantName: (value: string) => void;
  onEditUnitCost: (value: string) => void;
  onEditRetailPrice: (value: string) => void;
  onEditNotes: (value: string) => void;
  onSave: (row: MaterialDetail["vendorSkus"][number]) => Promise<void>;
  onDelete: (row: MaterialDetail["vendorSkus"][number]) => Promise<void>;
  onStatusChange: (row: MaterialDetail["vendorSkus"][number], status: "Available" | "Unavailable") => Promise<void>;
  onClose: () => void;
}) {
  if (!row) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Supplier / SKU Details</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{row.vendor_name} - SKU {row.sku}</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">x</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Supplier<input value={editName} onChange={(event) => onEditName(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
          <label className="text-sm font-semibold">SKU<input value={editSku} onChange={(event) => onEditSku(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
          <label className="text-sm font-semibold">Variant / Color / Size<input value={editVariantName} onChange={(event) => onEditVariantName(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
          <label className="text-sm font-semibold">Unit Cost<input value={editUnitCost} onChange={(event) => onEditUnitCost(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
          <label className="text-sm font-semibold">Retail<input value={editRetailPrice} onChange={(event) => onEditRetailPrice(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
          <div className="text-sm"><span className="font-semibold">Linked Jobs</span><div className="mt-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">{linkedJobs.length}</div></div>
          <label className="text-sm font-semibold sm:col-span-2">Contact / Notes<input value={editNotes} onChange={(event) => onEditNotes(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={isSaving || !editName.trim() || !editSku.trim()} onClick={() => onSave(row)} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Save Supplier</button>
          <button type="button" disabled={isSaving} onClick={() => onStatusChange(row, (row.notes ?? "").includes("[Unavailable]") ? "Available" : "Unavailable")} className="rounded-lg border border-yellow-500 px-4 py-2 font-semibold text-yellow-700 hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-950/30">
            {(row.notes ?? "").includes("[Unavailable]") ? "Mark Available" : "Mark Unavailable"}
          </button>
          <button type="button" disabled={isSaving} onClick={() => onDelete(row)} className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Delete Supplier</button>
        </div>
        <div className="mt-5">
          <h3 className="font-semibold">Matching Job Usage</h3>
          {linkedJobs.length ? (
            <ul className="mt-2 space-y-2 text-sm">
              {linkedJobs.map((job, index) => (
                <li key={`${job.jobId}-${job.materialName}-${index}`} className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  {job.quantity} - {job.materialName} - {job.jobName} ({job.jobStatus})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No linked job usage found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RelatedTable({ title, empty, rows }: { title: string; empty: string; rows: string[] }) {
  return <section><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">{rows.length ? rows.map((row, index) => <div key={`${row}-${index}`} className="border-b border-gray-200 p-4 last:border-0 dark:border-gray-800">{row}</div>) : <div className="p-6 text-gray-500 dark:text-gray-400">{empty}</div>}</div></section>;
}
