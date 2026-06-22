import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createClientAction, type ClientActionsRepository } from "@/lib/actions/clients";
import type { SuggestedAction } from "@/lib/ai/types";
import type { ClientRow } from "@/lib/clientTypes";
import type { AiReviewDraft } from "@/lib/db/aiReviewDrafts";

export type ReviewDraftExecutionResult = {
  executedActions: Array<{
    type: string;
    recordId: string;
    label: string;
  }>;
};

type ExecuteReviewDraftInput = {
  draft: AiReviewDraft;
  serviceClient: SupabaseClient;
};

const executableActionTypes = new Set([
  "create_client",
  "update_client",
  "create_job",
  "update_job",
  "create_invoice",
  "update_invoice",
  "create_expense",
  "update_inventory",
  "create_calendar_event",
]);

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalTextValue(value: unknown) {
  const text = textValue(value);
  return text || "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numericValue = Number(value.replace(/[$,%\s,]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  return 0;
}

function moneyStringToCents(value: unknown) {
  return Math.round(numberValue(value) * 100);
}

function mapDatabaseClientToClientRow(client: {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}): ClientRow {
  const balanceCents = client.balance_cents ?? 0;
  return {
    id: client.id,
    workspaceId: client.workspace_id,
    name: client.name,
    status: client.status,
    balance: (balanceCents / 100).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: balanceCents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }),
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    zip: client.zip ?? "",
    notes: client.notes ?? "",
    latitude: client.latitude ?? undefined,
    longitude: client.longitude ?? undefined,
  };
}

function createServerClientRepository(
  serviceClient: SupabaseClient
): ClientActionsRepository {
  return {
    async createClient(client) {
      const { data, error } = await serviceClient
        .from("clients")
        .insert({
          id: client.id,
          workspace_id: client.workspaceId,
          name: client.name,
          status: client.status,
          balance_cents: moneyStringToCents(client.balance),
          email: client.email?.trim() || null,
          phone: client.phone?.trim() || null,
          address: client.address?.trim() || null,
          city: client.city?.trim() || null,
          state: client.state?.trim() || null,
          zip: client.zip?.trim() || null,
          notes: client.notes?.trim() || null,
          latitude: client.latitude ?? null,
          longitude: client.longitude ?? null,
        })
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .single();

      if (error || !data) {
        throw new Error(error?.message || "Unable to create client.");
      }

      return mapDatabaseClientToClientRow(data);
    },
    async updateClient() {
      throw new Error("update_client execution is not enabled yet.");
    },
    async deleteClient() {
      throw new Error("delete_client execution is forbidden.");
    },
  };
}

function validateAction(action: SuggestedAction) {
  if (!executableActionTypes.has(action.type)) {
    throw new Error(`Action type ${action.type} is not allowed for execution.`);
  }
  if (action.type.startsWith("delete_")) {
    throw new Error("Delete actions are forbidden.");
  }
  if (action.type !== "create_client") {
    throw new Error(`${action.type} execution is not enabled yet.`);
  }
}

async function executeCreateClient(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const name = textValue(payload.name);
  if (!name) throw new Error("Client name is required.");

  const client: ClientRow = {
    id: crypto.randomUUID(),
    workspaceId,
    name,
    status: optionalTextValue(payload.status) || "Active",
    balance: String(numberValue(payload.balance)),
    email: optionalTextValue(payload.email),
    phone: optionalTextValue(payload.phone),
    address: optionalTextValue(payload.address),
    city: optionalTextValue(payload.city),
    state: optionalTextValue(payload.state),
    zip: optionalTextValue(payload.zip),
    notes: optionalTextValue(payload.notes),
  };

  const result = await createClientAction(
    createServerClientRepository(serviceClient),
    client
  );

  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.name,
  };
}

export async function executeReviewDraft({
  draft,
  serviceClient,
}: ExecuteReviewDraftInput): Promise<ReviewDraftExecutionResult> {
  if (draft.status !== "Approved") {
    throw new Error("Only approved review drafts can be executed.");
  }
  if (draft.executionStatus === "Executed") {
    throw new Error("Review draft has already been executed.");
  }
  if (draft.actions.length !== 1) {
    throw new Error("Execution currently requires exactly one action draft.");
  }

  const action = draft.actions[0];
  validateAction(action);

  const executedAction = await executeCreateClient(
    serviceClient,
    draft.workspaceId,
    action
  );

  return {
    executedActions: [executedAction],
  };
}
