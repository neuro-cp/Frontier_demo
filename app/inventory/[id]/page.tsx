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
  inventory: { id: string; name: string; current_qty: number | null; target_qty: number | null };
  catalog: { id: string; description: string | null; category: string | null; unit: string | null } | null;
  vendorSkus: Array<{ id: string; vendor_name: string; sku: string; unit_cost_cents: number | null }>;
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
  const isDatabaseMode = Boolean(user && isSupabaseConfigured);
  const supabase = useMemo(() => isDatabaseMode ? createBrowserSupabaseClient() : null, [isDatabaseMode]);

  useEffect(() => {
    if (!isDatabaseMode || !supabase || !isUuid(id) || !isUuid(activeWorkspace.id)) return;
    let cancelled = false;
    const client = supabase;

    async function load() {
      const { data: inventory, error: inventoryError } = await client
        .from("inventory_items")
        .select("id, name, current_qty, target_qty")
        .eq("id", id)
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();
      if (inventoryError || !inventory) throw new Error(inventoryError?.message || "Material not found.");

      const { data: catalog, error: catalogError } = await client
        .from("material_catalog_items")
        .select("id, description, category, unit")
        .eq("inventory_item_id", id)
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();
      if (catalogError) throw new Error(catalogError.message);

      const materialId = catalog?.id;
      const [vendorResult, lotResult, allocationResult, documentResult] = materialId
        ? await Promise.all([
            client.from("material_vendor_skus").select("id, vendor_name, sku, unit_cost_cents").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
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

  const localItem = !isDatabaseMode ? localItems.find((item) => item.id === id) : null;
  const inventory = detail?.inventory ?? (localItem ? { id: localItem.id ?? id, name: localItem.name, current_qty: localItem.currentQty, target_qty: localItem.targetQty } : null);

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <Link href="/inventory" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">Back to Inventory</Link>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      {!inventory ? <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">Loading material...</div> : (
        <>
          <header><h1 className="text-3xl font-bold">{inventory.name}</h1><p className="mt-2 text-gray-500 dark:text-gray-400">Current {inventory.current_qty ?? "-"} - Target {inventory.target_qty ?? "-"}</p></header>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"><div className="text-sm text-gray-500">Category</div><div className="mt-2 font-semibold">{detail?.catalog?.category || "Not set"}</div></div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"><div className="text-sm text-gray-500">Unit</div><div className="mt-2 font-semibold">{detail?.catalog?.unit || "Not set"}</div></div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"><div className="text-sm text-gray-500">Description</div><div className="mt-2 font-semibold">{detail?.catalog?.description || "Not set"}</div></div>
          </section>
          <RelatedTable title="Vendor / SKU Variants" empty="No vendor SKUs." rows={detail?.vendorSkus.map((row) => `${row.vendor_name} - ${row.sku} - ${row.unit_cost_cents == null ? "No cost" : `$${(row.unit_cost_cents / 100).toFixed(2)}`}`) ?? []} />
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
