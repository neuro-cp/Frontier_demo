"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ClientRow } from "@/lib/clientTypes";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";

type StoredStateSetter<T> = T | ((current: T) => T);

type ClientsRepositoryOptions = {
  isSignedIn: boolean;
  supabase: SupabaseClient | null;
  localClients: ClientRow[];
  setLocalClients: (value: StoredStateSetter<ClientRow[]>) => void;
};

type ClientDatabaseRow = {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ClientDatabaseWrite = {
  id?: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

function emptyToNull(value: string | undefined) {
  const trimmedValue = value?.trim() ?? "";
  return trimmedValue || null;
}

export function mapDatabaseClientToClientRow(
  client: ClientDatabaseRow
): ClientRow {
  return {
    id: client.id,
    workspaceId: client.workspace_id,
    name: client.name,
    status: client.status,
    balance: centsToMoneyString(client.balance_cents),
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

function mapClientRowToDatabaseWrite(client: ClientRow): ClientDatabaseWrite {
  return {
    id: client.id,
    workspace_id: client.workspaceId,
    name: client.name,
    status: client.status,
    balance_cents: moneyStringToCents(client.balance),
    email: emptyToNull(client.email),
    phone: emptyToNull(client.phone),
    address: emptyToNull(client.address),
    city: emptyToNull(client.city),
    state: emptyToNull(client.state),
    zip: emptyToNull(client.zip),
    notes: emptyToNull(client.notes),
    latitude: client.latitude ?? null,
    longitude: client.longitude ?? null,
  };
}

export function createClientsRepository({
  isSignedIn,
  supabase,
  localClients,
  setLocalClients,
}: ClientsRepositoryOptions) {
  const useDatabase = isSignedIn && supabase;

  return {
    async getClients(workspaceId: string) {
      if (!useDatabase) {
        return localClients.filter((client) => client.workspaceId === workspaceId);
      }
      if (!isUuid(workspaceId)) return [];

      const { data, error } = await supabase
        .from("clients")
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message || "Unable to load clients.");
      }

      return ((data ?? []) as ClientDatabaseRow[]).map(
        mapDatabaseClientToClientRow
      );
    },

    async getClientById(clientId: string, workspaceId?: string) {
      if (!useDatabase) {
        return (
          localClients.find(
            (client) =>
              client.id === clientId &&
              (!workspaceId || client.workspaceId === workspaceId)
          ) ?? null
        );
      }
      if (workspaceId && !isUuid(workspaceId)) return null;
      if (!isUuid(clientId)) return null;

      let query = supabase
        .from("clients")
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .eq("id", clientId)
        .limit(1);

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw new Error(error.message || "Unable to load client.");
      }

      return data ? mapDatabaseClientToClientRow(data as ClientDatabaseRow) : null;
    },

    async createClient(client: ClientRow) {
      if (!useDatabase) {
        setLocalClients((current) => [...current, client]);
        return client;
      }
      assertUuid(client.workspaceId, "Workspace");

      const data = await createSignedInRecord<ClientDatabaseRow>(
        "client",
        mapClientRowToDatabaseWrite(client)
      );
      return mapDatabaseClientToClientRow(data);
    },

    async updateClient(client: ClientRow) {
      if (!useDatabase) {
        setLocalClients((current) =>
          current.map((currentClient) =>
            currentClient.id === client.id ? client : currentClient
          )
        );
        return client;
      }
      assertUuid(client.workspaceId, "Workspace");

      const updateValues = mapClientRowToDatabaseWrite(client);
      delete updateValues.id;
      const data = await mutateSignedInRecord<ClientDatabaseRow>("client", "update", {
        ...updateValues,
        id: client.id,
        workspace_id: client.workspaceId,
      });
      if (!data) throw new Error("Unable to update client.");
      return mapDatabaseClientToClientRow(data);
    },

    async deleteClient(clientId: string, workspaceId?: string) {
      if (!useDatabase) {
        setLocalClients((current) =>
          current.filter((client) => client.id !== clientId)
        );
        return true;
      }
      if (!isUuid(clientId)) return true;
      if (workspaceId && !isUuid(workspaceId)) return true;

      await mutateSignedInRecord<boolean>("client", "delete", {
        id: clientId,
        workspace_id: workspaceId,
      });

      return true;
    },
  };
}
