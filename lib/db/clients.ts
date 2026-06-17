"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ClientRow } from "@/lib/clientTypes";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";

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

      const { data, error } = await supabase
        .from("clients")
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Unable to load clients.", error);
        return [];
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
        console.error("Unable to load client.", error);
        return null;
      }

      return data ? mapDatabaseClientToClientRow(data as ClientDatabaseRow) : null;
    },

    async createClient(client: ClientRow) {
      if (!useDatabase) {
        setLocalClients((current) => [...current, client]);
        return client;
      }

      const { data, error } = await supabase
        .from("clients")
        .insert(mapClientRowToDatabaseWrite(client))
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .single();

      if (error) {
        console.error("Unable to create client.", error);
        return null;
      }

      return mapDatabaseClientToClientRow(data as ClientDatabaseRow);
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

      const updateValues = mapClientRowToDatabaseWrite(client);
      delete updateValues.id;
      const { data, error } = await supabase
        .from("clients")
        .update(updateValues)
        .eq("id", client.id)
        .eq("workspace_id", client.workspaceId)
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .single();

      if (error) {
        console.error("Unable to update client.", error);
        return null;
      }

      return mapDatabaseClientToClientRow(data as ClientDatabaseRow);
    },

    async deleteClient(clientId: string, workspaceId?: string) {
      if (!useDatabase) {
        setLocalClients((current) =>
          current.filter((client) => client.id !== clientId)
        );
        return true;
      }

      let query = supabase.from("clients").delete().eq("id", clientId);

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      const { error } = await query;

      if (error) {
        console.error("Unable to delete client.", error);
        return false;
      }

      return true;
    },
  };
}
