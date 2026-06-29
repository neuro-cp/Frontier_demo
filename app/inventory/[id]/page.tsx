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

      if (!cancelled) {
        setDetail({
          inventory,
          catalog: catalog ?? null,
          vendorSkus: vendorResult.data ?? [],
          lots: lotResult.data ?? [],
          allocations: allocationResult.data ?? [],
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
      setNotice("Vendor SKU added.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add vendor SKU.");
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
              <label className="text-sm font-semibold">Preferred Vendor<input value={editPreferredVendor} onChange={(event) => setEditPreferredVendor(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Vendor SKU / Part Number<input value={editVendorSku} onChange={(event) => setEditVendorSku(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold">Variant / Color / Size<input value={editVariantName} onChange={(event) => setEditVariantName(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Description<textarea rows={3} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" /></label>
            </div>
            <button type="button" onClick={saveMaterialDetails} disabled={isSaving} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Save Material Details</button>
          </section>
          <RelatedTable title="Vendor / SKU Variants" empty="No vendor SKUs." rows={detail?.vendorSkus.map((row) => `${row.vendor_name} - SKU ${row.sku}${row.variant_name ? ` - ${row.variant_name}` : ""} - Cost ${row.unit_cost_cents == null ? "Not set" : `$${(row.unit_cost_cents / 100).toFixed(2)}`} - Retail ${row.retail_price_cents == null ? "Not set" : `$${(row.retail_price_cents / 100).toFixed(2)}`}`) ?? []} />
          {detail?.catalog?.id && (
            <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-xl font-bold">Add Vendor / SKU Variant</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="Vendor" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorSku} onChange={(event) => setVendorSku(event.target.value)} placeholder="SKU" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorVariantName} onChange={(event) => setVendorVariantName(event.target.value)} placeholder="Variant / Color / Size" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorUnitCost} onChange={(event) => setVendorUnitCost(event.target.value)} placeholder="Unit cost" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorRetailPrice} onChange={(event) => setVendorRetailPrice(event.target.value)} placeholder="Retail price" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                <input value={vendorNotes} onChange={(event) => setVendorNotes(event.target.value)} placeholder="Notes" className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
              </div>
              <button type="button" onClick={addVendorSku} disabled={isSaving || !vendorName.trim() || !vendorSku.trim()} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Add Vendor SKU</button>
            </section>
          )}
          <RelatedTable title="Inventory Lots" empty="No inventory lots." rows={detail?.lots.map((row) => `${row.quantity} - ${row.lot_reference || "No reference"} - ${row.received_at || "No received date"}`) ?? []} />
          <RelatedTable title="Assigned Jobs / Usage History" empty="No material allocations." rows={detail?.allocations.map((row) => `${row.quantity} - ${row.mode} - ${row.status} - Job ${row.job_id || "unassigned"}`) ?? []} />
          <RelatedTable title="Linked Documents" empty="No linked documents." rows={detail?.documents.map((row) => `${row.file_name || row.name} - ${new Date(row.created_at).toLocaleDateString()}`) ?? []} />
        </>
      )}
    </div>
  );
}

function RelatedTable({ title, empty, rows }: { title: string; empty: string; rows: string[] }) {
  return <section><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">{rows.length ? rows.map((row, index) => <div key={`${row}-${index}`} className="border-b border-gray-200 p-4 last:border-0 dark:border-gray-800">{row}</div>) : <div className="p-6 text-gray-500 dark:text-gray-400">{empty}</div>}</div></section>;
}
