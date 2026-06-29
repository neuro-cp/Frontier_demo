import { NextRequest, NextResponse } from "next/server";

import { sanitizeBusinessPayload } from "@/lib/api/businessPayloads";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateRequest = {
  entity?: string;
  payload?: Record<string, unknown>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message || fallback);
  }
  return fallback;
}

function getWorkspaceId(entity: string, payload: Record<string, unknown>) {
  if (entity === "job") return asRecord(payload.job)?.workspace_id;
  if (entity === "invoice") return asRecord(payload.invoice)?.workspace_id;
  if (entity === "route_plan") return asRecord(payload.route)?.workspace_id;
  return payload.workspace_id;
}

async function verifyWorkspaceAccess(workspaceId: unknown, userId: string) {
  if (typeof workspaceId !== "string" || !workspaceId) {
    return { ok: false as const, response: jsonError("Workspace is required.", 400) };
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "Active")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  if (data.role !== "Owner" && data.role !== "Manager") {
    return {
      ok: false as const,
      response: jsonError("Only Owners and Managers can change workspace records.", 403),
    };
  }

  return { ok: true as const, serviceClient, workspaceId };
}

async function ensureInventoryItemsForMaterials(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  workspaceId: string,
  materials: Record<string, unknown>[]
) {
  const names = Array.from(
    new Set(
      materials
        .map((material) => String(material.name ?? "").trim())
        .filter(Boolean)
    )
  );

  for (const name of names) {
    const { data: existing, error: existingError } = await serviceClient
      .from("inventory_items")
      .select("id")
      .eq("workspace_id", workspaceId)
      .ilike("name", name)
      .limit(1);
    if (existingError) throw existingError;
    if (existing && existing.length > 0) continue;

    const { error } = await serviceClient
      .from("inventory_items")
      .insert({ workspace_id: workspaceId, name, current_qty: null, target_qty: null });
    if (error) throw error;
  }
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required.", 401);
  }

  let body: CreateRequest;
  try {
    body = (await request.json()) as CreateRequest;
  } catch {
    return jsonError("Invalid create request.", 400);
  }

  const payload = asRecord(body.payload);
  if (!body.entity || !payload) {
    return jsonError("Entity and payload are required.", 400);
  }

  const access = await verifyWorkspaceAccess(
    getWorkspaceId(body.entity, payload),
    user.id
  );
  if (!access.ok) return access.response;

  const { serviceClient, workspaceId } = access;

  try {
    if (body.entity === "client") {
      const clientPayload = sanitizeBusinessPayload("client", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("clients")
        .insert(clientPayload)
        .select("id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "inventory_item") {
      const itemPayload = sanitizeBusinessPayload("inventory_item", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("inventory_items")
        .insert(itemPayload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "material_catalog_item") {
      const catalogPayload = sanitizeBusinessPayload("material_catalog_item", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("material_catalog_items")
        .insert(catalogPayload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "material_vendor_sku") {
      const skuPayload = sanitizeBusinessPayload("material_vendor_sku", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("material_vendor_skus")
        .insert(skuPayload)
        .select("*")
        .single();
      if (error) {
        if (error.code === "23505") return jsonError("This vendor and SKU already exist for this material.", 409);
        throw error;
      }
      return NextResponse.json({ data });
    }

    if (body.entity === "calendar_event") {
      const eventPayload = sanitizeBusinessPayload("calendar_event", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("client_calendar_events")
        .insert(eventPayload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "expense") {
      const expensePayload = sanitizeBusinessPayload("expense", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("expenses")
        .insert(expensePayload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "document") {
      const documentPayload = sanitizeBusinessPayload("document", payload, workspaceId);
      const { data, error } = await serviceClient
        .from("documents")
        .insert(documentPayload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "job") {
      const job = asRecord(payload.job);
      const materials = Array.isArray(payload.materials)
        ? (payload.materials as Record<string, unknown>[])
        : [];
      if (!job) return jsonError("Job payload is required.", 400);
      const jobPayload = sanitizeBusinessPayload("job", job, workspaceId);

      const { data: insertedJob, error: jobError } = await serviceClient
        .from("jobs")
        .insert(jobPayload)
        .select("*")
        .single();
      if (jobError || !insertedJob) throw jobError;

      try {
        if (materials.length > 0) {
          const { error: materialsError } = await serviceClient
            .from("job_materials")
            .insert(
              materials.map((material) => ({
                ...sanitizeBusinessPayload("job_material", material, workspaceId),
                job_id: insertedJob.id,
              }))
            );
          if (materialsError) throw materialsError;
        }
        await ensureInventoryItemsForMaterials(serviceClient, workspaceId, materials);
      } catch (error) {
        await serviceClient.from("jobs").delete().eq("id", insertedJob.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("jobs")
        .select("*, job_materials(*)")
        .eq("id", insertedJob.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "invoice") {
      const invoice = asRecord(payload.invoice);
      const lineItems = Array.isArray(payload.lineItems)
        ? (payload.lineItems as Record<string, unknown>[])
        : [];
      if (!invoice) return jsonError("Invoice payload is required.", 400);
      const invoicePayload = sanitizeBusinessPayload("invoice", invoice, workspaceId);

      const { data: insertedInvoice, error: invoiceError } = await serviceClient
        .from("invoices")
        .insert(invoicePayload)
        .select("*")
        .single();
      if (invoiceError || !insertedInvoice) throw invoiceError;

      try {
        if (lineItems.length > 0) {
          const { error: lineItemsError } = await serviceClient
            .from("invoice_line_items")
            .insert(
              lineItems.map((lineItem, index) => ({
                ...sanitizeBusinessPayload("invoice_line", lineItem, workspaceId),
                invoice_id: insertedInvoice.id,
                sort_order: index,
              }))
            );
          if (lineItemsError) throw lineItemsError;
        }
      } catch (error) {
        await serviceClient.from("invoices").delete().eq("id", insertedInvoice.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", insertedInvoice.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "route_plan") {
      const route = asRecord(payload.route);
      const stops = Array.isArray(payload.stops)
        ? (payload.stops as Record<string, unknown>[])
        : [];
      if (!route) return jsonError("Route payload is required.", 400);
      const routePayload = sanitizeBusinessPayload("route_plan", route, workspaceId);

      const { data: insertedRoute, error: routeError } = await serviceClient
        .from("route_plans")
        .insert(routePayload)
        .select("*")
        .single();
      if (routeError || !insertedRoute) throw routeError;

      try {
        if (stops.length > 0) {
          const { error: stopsError } = await serviceClient
            .from("route_plan_stops")
            .insert(
              stops.map((stop) => ({
                ...sanitizeBusinessPayload("route_stop", stop, workspaceId),
                route_plan_id: insertedRoute.id,
              }))
            );
          if (stopsError) throw stopsError;
        }
      } catch (error) {
        await serviceClient.from("route_plans").delete().eq("id", insertedRoute.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("route_plans")
        .select("*, route_plan_stops(*)")
        .eq("id", insertedRoute.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return jsonError("Unsupported create entity.", 400);
  } catch (error) {
    const message = errorMessage(error, "Create failed.");
    if (message.toLowerCase().includes("duplicate")) {
      return jsonError("A duplicate record already exists. Use a different SKU or edit the existing item.", 409);
    }
    return jsonError(message, 500);
  }
}
