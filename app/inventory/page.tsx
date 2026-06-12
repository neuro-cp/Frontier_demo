"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

const inventory = [
  {
    name: "Gasoline (gallons)",
    currentQty: 20,
    targetQty: 40,
    warning: false,
    workspaceId: "landscaping",
  },
  {
    name: "Mulch (cubic yards)",
    currentQty: 12,
    targetQty: 50,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Fertilizer (50lb bags)",
    currentQty: 8,
    targetQty: 25,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Salt Bags",
    currentQty: 18,
    targetQty: 80,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Ice Melt Buckets",
    currentQty: 10,
    targetQty: 30,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Snow Shovels",
    currentQty: 14,
    targetQty: 12,
    warning: false,
    workspaceId: "snow-removal",
  },
  {
    name: "HVAC Filters",
    currentQty: 22,
    targetQty: 40,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Light Bulbs",
    currentQty: 60,
    targetQty: 50,
    warning: false,
    workspaceId: "properties",
  },
];

export default function InventoryPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceInventory = inventory.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Inventory
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Track supplies and materials for {activeWorkspace.name}
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700">
          + Add Item
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="px-6 py-4 text-left">Item Name</th>
              <th className="px-6 py-4 text-center">Current Qty</th>
              <th className="px-6 py-4 text-center">Target Qty</th>
              <th className="px-6 py-4 text-right">Suggested Order</th>
            </tr>
          </thead>

          <tbody>
            {workspaceInventory.length > 0 ? (
              workspaceInventory.map((item) => {
                const suggestedOrder = item.targetQty - item.currentQty;

                return (
                  <tr
                    key={item.name}
                    className="border-b border-gray-200 text-lg last:border-b-0 dark:border-gray-800"
                  >
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {item.warning && (
                          <span className="text-orange-500">⚠</span>
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
                  colSpan={4}
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