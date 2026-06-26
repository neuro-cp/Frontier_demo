import { NextRequest, NextResponse } from "next/server";

import {
  sanitizeBusinessPayload,
  withoutWorkspaceKeys,
} from "@/lib/api/businessPayloads";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MutationRequest = {
  entity?: string;
  operation?: "update" | "delete";
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

async function mutateSimpleRow({
  entity,
  table,
  select = "*",
  payload,
  operation,
  values,
}: {
  entity: string;
  table: string;
  select?: string;
  payload: Record<string, unknown>;
  operation: "update" | "delete";
  values: Record<string, unknown>;
}) {
  const id = payload.id;
  const workspaceId = payload.workspace_id;
  if (typeof id !== "string" || !id) return jsonError(`${entity} id is required.`, 400);
  if (typeof workspaceId !== "string" || !workspaceId) {
    return jsonError("Workspace is required.", 400);
  }

  const serviceClient = createServiceRoleClient();

  if (operation === "delete") {
    const { error } = await serviceClient
      .from(table)
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    if (error) throw error;
    return NextResponse.json({ data: true });
  }

  const { data, error } = await serviceClient
    .from(table)
    .update(values)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select(select)
    .single();
  if (error) throw error;
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  let body: MutationRequest;
  try {
    body = (await request.json()) as MutationRequest;
  } catch {
    return jsonError("Invalid mutation request.", 400);
  }

  const payload = asRecord(body.payload);
  if (!body.entity || !body.operation || !payload) {
    return jsonError("Entity, operation, and payload are required.", 400);
  }

  const access = await verifyWorkspaceAccess(
    getWorkspaceId(body.entity, payload),
    user.id
  );
  if (!access.ok) return access.response;

  const { serviceClient, workspaceId } = access;

  try {
    if (body.entity === "client") {
      return await mutateSimpleRow({
        entity: "Client",
        table: "clients",
        select: "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude",
        payload,
        operation: body.operation,
        values: withoutWorkspaceKeys(sanitizeBusinessPayload("client", payload, workspaceId)),
      });
    }

    if (body.entity === "inventory_item") {
      const id = typeof payload.id === "string" ? payload.id : "";
      if (body.operation === "delete") {
        let query = serviceClient
          .from("inventory_items")
          .delete()
          .eq("workspace_id", workspaceId);
        query = id ? query.eq("id", id) : query.eq("name", String(payload.name ?? ""));
        const { error } = await query;
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      let query = serviceClient
        .from("inventory_items")
        .update({
          name: payload.name,
          current_qty: payload.current_qty,
          target_qty: payload.target_qty,
        })
        .eq("workspace_id", workspaceId);
      query = id ? query.eq("id", id) : query.ilike("name", String(payload.name ?? ""));
      const { data, error } = await query.select("*").single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "material_catalog_item") {
      return await mutateSimpleRow({
        entity: "Material catalog item",
        table: "material_catalog_items",
        payload,
        operation: body.operation,
        values: withoutWorkspaceKeys(
          sanitizeBusinessPayload("material_catalog_item", payload, workspaceId)
        ),
      });
    }

    if (body.entity === "material_vendor_sku") {
      return await mutateSimpleRow({
        entity: "Material vendor SKU",
        table: "material_vendor_skus",
        payload,
        operation: body.operation,
        values: withoutWorkspaceKeys(
          sanitizeBusinessPayload("material_vendor_sku", payload, workspaceId)
        ),
      });
    }

    if (body.entity === "expense") {
      return await mutateSimpleRow({
        entity: "Expense",
        table: "expenses",
        payload,
        operation: body.operation,
        values: withoutWorkspaceKeys(sanitizeBusinessPayload("expense", payload, workspaceId)),
      });
    }

    if (body.entity === "document") {
      return await mutateSimpleRow({
        entity: "Document",
        table: "documents",
        payload,
        operation: body.operation,
        values: withoutWorkspaceKeys(sanitizeBusinessPayload("document", payload, workspaceId)),
      });
    }

    if (body.entity === "calendar_event") {
      return await mutateSimpleRow({
        entity: "Calendar event",
        table: "client_calendar_events",
        payload,
        operation: body.operation,
        values: withoutWorkspaceKeys(sanitizeBusinessPayload("calendar_event", payload, workspaceId)),
      });
    }

    if (body.entity === "job") {
      const job = asRecord(payload.job);
      const materials = Array.isArray(payload.materials)
        ? (payload.materials as Record<string, unknown>[])
        : [];
      if (!job) return jsonError("Job payload is required.", 400);
      const jobPayload = sanitizeBusinessPayload("job", job, workspaceId);

      if (body.operation === "delete") {
        const { error } = await serviceClient
          .from("jobs")
          .delete()
          .eq("id", String(job.id ?? ""))
          .eq("workspace_id", workspaceId);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      const jobId = String(job.id ?? "");
      if (!jobId) return jsonError("Job id is required.", 400);

      const { data: existingJob, error: existingJobError } = await serviceClient
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (existingJobError) throw existingJobError;
      if (!existingJob) return jsonError("Job not found in this workspace.", 404);

      const { error: jobError } = await serviceClient
        .from("jobs")
        .update(withoutWorkspaceKeys(jobPayload))
        .eq("id", jobId)
        .eq("workspace_id", workspaceId);
      if (jobError) throw jobError;

      const { error: deleteMaterialsError } = await serviceClient
        .from("job_materials")
        .delete()
        .eq("job_id", jobId)
        .eq("workspace_id", workspaceId);
      if (deleteMaterialsError) throw deleteMaterialsError;

      if (materials.length > 0) {
        const { error: insertMaterialsError } = await serviceClient
          .from("job_materials")
          .insert(
            materials.map((material) => ({
              ...sanitizeBusinessPayload("job_material", material, workspaceId),
              job_id: jobId,
            }))
          );
        if (insertMaterialsError) throw insertMaterialsError;
      }

      const { data, error: loadError } = await serviceClient
        .from("jobs")
        .select("*, job_materials(*)")
        .eq("id", jobId)
        .eq("workspace_id", workspaceId)
        .single();
      if (loadError) throw loadError;
      return NextResponse.json({ data });
    }

    if (body.entity === "job_materials") {
      const jobId = payload.job_id;
      const materials = Array.isArray(payload.materials)
        ? (payload.materials as Record<string, unknown>[])
        : [];
      if (typeof jobId !== "string" || !jobId) {
        return jsonError("Job is required.", 400);
      }

      const { error: deleteError } = await serviceClient
        .from("job_materials")
        .delete()
        .eq("job_id", jobId)
        .eq("workspace_id", workspaceId);
      if (deleteError) throw deleteError;

      if (body.operation === "delete" || materials.length === 0) {
        return NextResponse.json({ data: true });
      }

      const { error } = await serviceClient
        .from("job_materials")
        .insert(
          materials.map((material) => ({
            ...sanitizeBusinessPayload("job_material", material, workspaceId),
            job_id: jobId,
          }))
        );
      if (error) throw error;
      return NextResponse.json({ data: true });
    }

    if (body.entity === "invoice") {
      const invoice = asRecord(payload.invoice);
      const lineItems = Array.isArray(payload.lineItems)
        ? (payload.lineItems as Record<string, unknown>[])
        : [];
      if (!invoice) return jsonError("Invoice payload is required.", 400);
      const invoicePayload = sanitizeBusinessPayload("invoice", invoice, workspaceId);

      if (body.operation === "delete") {
        const { error } = await serviceClient
          .from("invoices")
          .delete()
          .eq("id", String(invoice.id ?? ""))
          .eq("workspace_id", workspaceId);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      const invoiceId = String(invoice.id ?? "");
      if (!invoiceId) return jsonError("Invoice id is required.", 400);

      const { data: existingInvoice, error: existingInvoiceError } = await serviceClient
        .from("invoices")
        .select("id")
        .eq("id", invoiceId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (existingInvoiceError) throw existingInvoiceError;
      if (!existingInvoice) return jsonError("Invoice not found in this workspace.", 404);

      const { error: invoiceError } = await serviceClient
        .from("invoices")
        .update(withoutWorkspaceKeys(invoicePayload))
        .eq("id", invoiceId)
        .eq("workspace_id", workspaceId);
      if (invoiceError) throw invoiceError;

      const { error: deleteLinesError } = await serviceClient
        .from("invoice_line_items")
        .delete()
        .eq("invoice_id", invoiceId)
        .eq("workspace_id", workspaceId);
      if (deleteLinesError) throw deleteLinesError;

      if (lineItems.length > 0) {
        const { error: insertLinesError } = await serviceClient
          .from("invoice_line_items")
          .insert(
            lineItems.map((lineItem, index) => ({
              ...sanitizeBusinessPayload("invoice_line", lineItem, workspaceId),
              invoice_id: invoiceId,
              sort_order: index,
            }))
          );
        if (insertLinesError) throw insertLinesError;
      }

      const { data, error: loadError } = await serviceClient
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", invoiceId)
        .eq("workspace_id", workspaceId)
        .single();
      if (loadError) throw loadError;
      return NextResponse.json({ data });
    }

    if (body.entity === "route_plan") {
      const route = asRecord(payload.route);
      const stops = Array.isArray(payload.stops)
        ? (payload.stops as Record<string, unknown>[])
        : [];
      if (!route) return jsonError("Route payload is required.", 400);
      const routePayload = sanitizeBusinessPayload("route_plan", route, workspaceId);

      if (body.operation === "delete") {
        const { error } = await serviceClient
          .from("route_plans")
          .delete()
          .eq("id", String(route.id ?? ""))
          .eq("workspace_id", workspaceId);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      const { error } = await serviceClient.rpc("upsert_route_with_stops", {
        route_payload: routePayload,
        stops_payload: stops.map((stop) =>
          sanitizeBusinessPayload("route_stop", stop, workspaceId)
        ),
      });
      if (error) throw error;

      const { data, error: loadError } = await serviceClient
        .from("route_plans")
        .select("*, route_plan_stops(*)")
        .eq("id", String(route.id ?? ""))
        .eq("workspace_id", workspaceId)
        .single();
      if (loadError) throw loadError;
      return NextResponse.json({ data });
    }

    return jsonError("Unsupported mutation entity.", 400);
  } catch (error) {
    return jsonError(errorMessage(error, "Mutation failed."), 500);
  }
}
