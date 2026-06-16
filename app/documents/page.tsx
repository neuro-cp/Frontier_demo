"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function DocumentsPage() {
  const { activeWorkspace } = useWorkspace();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-100">
            Document Extraction
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Upload documents for {activeWorkspace.name}. Extraction and verification pipeline comes later.
          </p>
        </div>

        <button onClick={() => setIsUploadOpen(true)} className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-white shadow hover:bg-blue-700 sm:w-auto">
          + Upload Document
        </button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Future flow: upload once → extract intended use and data → verify → choose whether to create a client, job, quote, invoice, expense, or calendar item.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[650px] w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Detected Type</th>
              <th className="px-6 py-4">Extraction Status</th>
              <th className="px-6 py-4 text-right">File</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center text-2xl text-gray-500 dark:text-gray-400">
                No documents uploaded for {activeWorkspace.name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl sm:p-6 lg:p-8 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">Upload for Extraction</h2>
              <button onClick={() => setIsUploadOpen(false)} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">Workspace</label>
                <input value={activeWorkspace.name} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-lg text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">Document Name</label>
                <input type="text" placeholder="Quote, invoice, receipt, handwritten note..." className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-lg text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">File</label>
                <input type="file" className="block w-full text-sm text-gray-900 dark:text-gray-100" />
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-gray-900 dark:text-gray-100">Notes</label>
                <textarea rows={3} placeholder="Optional context for later extraction." className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="w-full rounded-lg border border-gray-200 px-6 py-3 text-lg text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto">Cancel</button>
                <button type="button" onClick={() => setIsUploadOpen(false)} className="w-full rounded-lg bg-blue-500 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-600 sm:w-auto">Save Upload Placeholder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
