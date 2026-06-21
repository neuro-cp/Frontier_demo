import type { InventoryRow } from "@/lib/db/inventory";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type InventoryActionsRepository = {
  createInventoryItem: (item: InventoryRow) => Promise<InventoryRow | null>;
  updateInventoryItem: (item: InventoryRow) => Promise<InventoryRow | null>;
  deleteInventoryItem: (item: InventoryRow) => Promise<boolean>;
};

function validateInventoryItem(item: InventoryRow) {
  return {
    ...item,
    workspaceId: requireText(item.workspaceId, "Workspace"),
    name: requireText(item.name, "Item name"),
  };
}

export async function createInventoryItemAction(
  repository: InventoryActionsRepository,
  item: InventoryRow
): Promise<ActionResult<InventoryRow>> {
  try {
    const created = await repository.createInventoryItem(validateInventoryItem(item));
    return created ? ok(created) : fail("Unable to create inventory item.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create inventory item.");
  }
}

export async function updateInventoryItemAction(
  repository: InventoryActionsRepository,
  item: InventoryRow
): Promise<ActionResult<InventoryRow>> {
  try {
    const updated = await repository.updateInventoryItem(validateInventoryItem(item));
    return updated ? ok(updated) : fail("Unable to update inventory item.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update inventory item.");
  }
}

export async function deleteInventoryItemAction(
  repository: InventoryActionsRepository,
  item: InventoryRow
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteInventoryItem(validateInventoryItem(item));
    return deleted ? ok(true) : fail("Unable to delete inventory item.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete inventory item.");
  }
}

export const createInventoryItem = createInventoryItemAction;
export const updateInventoryItem = updateInventoryItemAction;
export const deleteInventoryItem = deleteInventoryItemAction;
