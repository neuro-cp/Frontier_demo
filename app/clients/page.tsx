"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/WorkspaceContext";

const clients = [
  {
    id: 1,
    name: "John Smith",
    status: "Active",
    balance: "$450",
    workspaceId: "landscaping",
  },
  {
    id: 2,
    name: "Acme HOA",
    status: "Active",
    balance: "$1,200",
    workspaceId: "properties",
  },
  {
    id: 3,
    name: "Sunset Apartments",
    status: "Lead",
    balance: "$0",
    workspaceId: "properties",
  },
  {
    id: 4,
    name: "City Snow Contract",
    status: "Active",
    balance: "$2,800",
    workspaceId: "snow-removal",
  },
];

export default function ClientsPage() {
  const { activeWorkspace } = useWorkspace();

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activeWorkspace.name} clients
          </p>
        </div>

        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 sm:w-auto">
          + Add Client
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[600px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-gray-700 dark:text-gray-300">
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
                  colSpan={3}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No clients found for {activeWorkspace.name}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}