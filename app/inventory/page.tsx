"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { inventory as defaultInventory } from "@/lib/inventory";

export default function InventoryPage() {
  const { activeWorkspace } = useWorkspace();

  const [inventoryItems, setInventoryItems] =
    useState(defaultInventory);

  const [selectedItems, setSelectedItems] =
    useState<string[]>([]);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [targetQty, setTargetQty] = useState("");

  const workspaceInventory = inventoryItems.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  function toggleItem(itemName: string) {
    setSelectedItems((current) =>
      current.includes(itemName)
        ? current.filter((name) => name !== itemName)
        : [...current, itemName]
    );
  }

  function removeSelectedItems() {
    setInventoryItems((current) =>
      current.filter(
        (item) => !selectedItems.includes(item.name)
      )
    );

    setSelectedItems([]);
  }

  function resetNewItemForm() {
    setItemName("");
    setCurrentQty("");
    setTargetQty("");
  }

  function closeNewItemModal() {
    setNewItemOpen(false);
    resetNewItemForm();
  }

  function addInventoryItem() {
    if (!itemName.trim()) return;

    const current = Number(currentQty);
    const target = Number(targetQty);

    if (Number.isNaN(current) || Number.isNaN(target)) {
      return;
    }

    setInventoryItems((existing) => [
      ...existing,
      {
        name: itemName.trim(),
        currentQty: current,
        targetQty: target,
        warning: current < target,
        workspaceId: activeWorkspace.id,
      },
    ]);

    closeNewItemModal();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Inventory
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Track supplies and materials for {activeWorkspace.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setNewItemOpen(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            + Add Item
          </button>

          <button
            onClick={removeSelectedItems}
            disabled={selectedItems.length === 0}
            className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Item
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="rounded-xl bg-gray-900 p-4 text-white">
          {selectedItems.length} item
          {selectedItems.length !== 1 ? "s" : ""} selected
        </div>
      )}

      {newItemOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Add Inventory Item
              </h2>

              <button
                onClick={closeNewItemModal}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={itemName}
                onChange={(event) =>
                  setItemName(event.target.value)
                }
                placeholder="Item Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <input
                type="number"
                value={currentQty}
                onChange={(event) =>
                  setCurrentQty(event.target.value)
                }
                placeholder="Current Quantity"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <input
                type="number"
                value={targetQty}
                onChange={(event) =>
                  setTargetQty(event.target.value)
                }
                placeholder="Target Quantity"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <button
                onClick={addInventoryItem}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="w-12 px-4 py-4"></th>
              <th className="px-6 py-4 text-left">Item Name</th>
              <th className="px-6 py-4 text-center">Current Qty</th>
              <th className="px-6 py-4 text-center">Target Qty</th>
              <th className="px-6 py-4 text-right">Suggested Order</th>
            </tr>
          </thead>

          <tbody>
            {workspaceInventory.length > 0 ? (
              workspaceInventory.map((item) => {
                const suggestedOrder =
                  item.targetQty - item.currentQty;

                return (
                  <tr
                    key={`${item.workspaceId}-${item.name}`}
                    className="border-b border-gray-200 text-base lg:text-lg last:border-b-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.name)}
                        onChange={() => toggleItem(item.name)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {item.warning && (
                          <span className="text-orange-500">
                            ⚠
                          </span>
                        )}

                        <span>{item.name}</span>
                      </div>
                    </td>

                    <td
                      className={`px-6 py-5 text-center ${
                        item.warning
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {item.currentQty}
                    </td>

                    <td className="px-6 py-5 text-center text-gray-500 dark:text-gray-400">
                      {item.targetQty}
                    </td>

                    <td
                      className={`px-6 py-5 text-right ${
                        item.warning
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {item.warning ? suggestedOrder : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-xl text-gray-500 dark:text-gray-400"
                >
                  No inventory items for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}