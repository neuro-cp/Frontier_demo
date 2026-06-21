import { NextRequest, NextResponse } from "next/server";

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
    .select("id")
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

  return { ok: true as const, serviceClient, workspaceId };
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
      const { data, error } = await serviceClient
        .from("clients")
        .insert(payload)
        .select("id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "inventory_item") {
      const { data, error } = await serviceClient
        .from("inventory_items")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "calendar_event") {
      const { data, error } = await serviceClient
        .from("client_calendar_events")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "expense") {
      const { data, error } = await serviceClient
        .from("expenses")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "document") {
      const { data, error } = await serviceClient
        .from("documents")
        .insert(payload)
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

      const { data: insertedJob, error: jobError } = await serviceClient
        .from("jobs")
        .insert(job)
        .select("*")
        .single();
      if (jobError || !insertedJob) throw jobError;

      try {
        if (materials.length > 0) {
          const { error: materialsError } = await serviceClient
            .from("job_materials")
            .insert(
              materials.map((material) => ({
                ...material,
                workspace_id: workspaceId,
                job_id: insertedJob.id,
              }))
            );
          if (materialsError) throw materialsError;
        }
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

      const { data: insertedInvoice, error: invoiceError } = await serviceClient
        .from("invoices")
        .insert(invoice)
        .select("*")
        .single();
      if (invoiceError || !insertedInvoice) throw invoiceError;

      try {
        if (lineItems.length > 0) {
          const { error: lineItemsError } = await serviceClient
            .from("invoice_line_items")
            .insert(
              lineItems.map((lineItem) => ({
                ...lineItem,
                workspace_id: workspaceId,
                invoice_id: insertedInvoice.id,
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

      const { data: insertedRoute, error: routeError } = await serviceClient
        .from("route_plans")
        .insert(route)
        .select("*")
        .single();
      if (routeError || !insertedRoute) throw routeError;

      try {
        if (stops.length > 0) {
          const { error: stopsError } = await serviceClient
            .from("route_plan_stops")
            .insert(
              stops.map((stop) => ({
                ...stop,
                workspace_id: workspaceId,
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
    const message = error instanceof Error ? error.message : "Create failed.";
    return jsonError(message, 500);
  }
}
