"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/WorkspaceContext";
import { clients as defaultClients } from "@/lib/clients";

export default function ClientsPage() {
const { activeWorkspace } = useWorkspace();

const [clientItems, setClientItems] = useState(defaultClients);
const [selectedClients, setSelectedClients] = useState<string[]>([]);
const [showDeleteModal, setShowDeleteModal] = useState(false);

const workspaceClients = clientItems.filter(
(client) => client.workspaceId === activeWorkspace.id
);

function toggleClient(clientId: string) {
setSelectedClients((current) =>
current.includes(clientId)
? current.filter((id) => id !== clientId)
: [...current, clientId]
);
}

function removeSelectedClients() {
setClientItems(
clientItems.filter(
(client) => !selectedClients.includes(client.id)
)
);


setSelectedClients([]);
setShowDeleteModal(false);


}

return ( <div className="space-y-6 text-gray-950 dark:text-gray-100"> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <h1 className="text-3xl font-bold">Clients</h1>

```
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        {activeWorkspace.name} clients
      </p>
    </div>

    <div className="flex flex-col gap-2 sm:flex-row">
      <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 sm:w-auto">
        + Add Client
      </button>

      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={selectedClients.length === 0}
        className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
      >
        Remove Selected
      </button>
    </div>
  </div>

  <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
    <table className="min-w-[650px] w-full">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr className="text-gray-700 dark:text-gray-300">
          <th className="p-4 w-12">
            <input
              type="checkbox"
              checked={
                workspaceClients.length > 0 &&
                selectedClients.length === workspaceClients.length
              }
              onChange={(e) =>
                setSelectedClients(
                  e.target.checked
                    ? workspaceClients.map((client) => client.id)
                    : []
                )
              }
            />
          </th>

          <th className="p-4 text-left">Name</th>
          <th className="p-4 text-left">Status</th>
          <th className="p-4 text-left">Balance</th>
        </tr>
      </thead>

      <tbody>
        {workspaceClients.length > 0 ? (
          workspaceClients.map((client) => (
            <tr
              key={client.id}
              className="border-t border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                />
              </td>

              <td className="p-4 break-words">
                <Link
                  href={`/clients/${client.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {client.name}
                </Link>
              </td>

              <td className="p-4">{client.status}</td>

              <td className="p-4">{client.balance}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={4}
              className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
            >
              No clients found for {activeWorkspace.name}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {showDeleteModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Remove Clients
        </h2>

        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Are you sure you want to remove the selected client(s)?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={removeSelectedClients}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )}
</div>


);
}
