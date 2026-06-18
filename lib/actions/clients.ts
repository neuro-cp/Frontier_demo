import type { ClientRow } from "@/lib/clientTypes";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type ClientActionsRepository = {
  createClient: (client: ClientRow) => Promise<ClientRow | null>;
  updateClient: (client: ClientRow) => Promise<ClientRow | null>;
  deleteClient: (clientId: string) => Promise<boolean>;
};

export async function createClient(
  repository: ClientActionsRepository,
  client: ClientRow
): Promise<ActionResult<ClientRow>> {
  try {
    const normalizedClient = {
      ...client,
      name: requireText(client.name, "Client name"),
      workspaceId: requireText(client.workspaceId, "Workspace"),
    };
    const created = await repository.createClient(normalizedClient);
    return created ? ok(created) : fail("Unable to create client.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create client.");
  }
}

export async function updateClient(
  repository: ClientActionsRepository,
  client: ClientRow
): Promise<ActionResult<ClientRow>> {
  try {
    requireText(client.id, "Client");
    requireText(client.workspaceId, "Workspace");
    requireText(client.name, "Client name");
    const updated = await repository.updateClient(client);
    return updated ? ok(updated) : fail("Unable to update client.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update client.");
  }
}

export async function deleteClient(
  repository: ClientActionsRepository,
  clientId: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteClient(requireText(clientId, "Client"));
    return deleted ? ok(true) : fail("Unable to delete client.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete client.");
  }
}
