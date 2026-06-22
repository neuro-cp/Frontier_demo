"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import type {
  AiReviewDraft,
  AiReviewDraftStatus,
} from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";

type ReviewDraftsResponse = {
  reviewDrafts?: AiReviewDraft[];
  reviewDraft?: AiReviewDraft;
  executionResult?: unknown;
  error?: string;
};

type ReviewFilter =
  | "All"
  | "Pending"
  | "Approved"
  | "Needs Changes"
  | "Rejected"
  | "Executed";

function formatConfidence(confidence: number | null) {
  if (typeof confidence !== "number") return "Unscored";
  return `${Math.round(confidence * 100)}%`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusClass(status: AiReviewDraftStatus) {
  if (status === "Approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "Rejected") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  }
  if (status === "Needs Changes") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
}

function executionClass(status: AiReviewDraft["executionStatus"]) {
  if (status === "Executed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "Failed") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  }
  return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300";
}

export default function ReviewQueuePage() {
  const { activeWorkspace, canDeleteBusinessRecords, isLoadingWorkspaces } =
    useWorkspace();
  const { user } = useAuthSession();
  const [reviewDrafts, setReviewDrafts] = useState<AiReviewDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [executingId, setExecutingId] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("All");
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptLabel, setTranscriptLabel] = useState("");
  const [isGeneratingTranscriptDraft, setIsGeneratingTranscriptDraft] =
    useState(false);
  const [error, setError] = useState("");

  const workspaceReady = isUuid(activeWorkspace.id);
  const pendingCount = useMemo(
    () => reviewDrafts.filter((draft) => draft.status === "Pending").length,
    [reviewDrafts]
  );
  const filteredReviewDrafts = useMemo(() => {
    if (filter === "All") return reviewDrafts;
    if (filter === "Executed") {
      return reviewDrafts.filter((draft) => draft.executionStatus === "Executed");
    }
    return reviewDrafts.filter((draft) => draft.status === filter);
  }, [filter, reviewDrafts]);

  const loadReviewDrafts = useCallback(async () => {
    if (!user || !workspaceReady) {
      setReviewDrafts([]);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/ai/review-drafts?workspaceId=${encodeURIComponent(activeWorkspace.id)}`
      );
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load review drafts.");
      }
      setReviewDrafts(payload.reviewDrafts ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load review drafts."
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace.id, user, workspaceReady]);

  useEffect(() => {
    queueMicrotask(loadReviewDrafts);
  }, [loadReviewDrafts]);

  async function updateStatus(id: string, status: AiReviewDraftStatus) {
    if (!workspaceReady || updatingId || executingId) return;

    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch("/api/ai/review-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          workspaceId: activeWorkspace.id,
          status,
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to update review draft.");
      }
      setReviewDrafts((current) =>
        current.map((draft) =>
          draft.id === payload.reviewDraft?.id ? payload.reviewDraft : draft
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update review draft."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function executeDraft(id: string) {
    if (!workspaceReady || updatingId || executingId) return;

    const confirmed = window.confirm(
      "Execute this approved draft now? This will create the proposed Frontier record."
    );
    if (!confirmed) return;

    setExecutingId(id);
    setError("");
    try {
      const response = await fetch("/api/ai/review-drafts/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          workspaceId: activeWorkspace.id,
          confirmExecution: true,
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to execute review draft.");
      }
      setReviewDrafts((current) =>
        current.map((draft) =>
          draft.id === payload.reviewDraft?.id ? payload.reviewDraft : draft
        )
      );
    } catch (executeError) {
      setError(
        executeError instanceof Error
          ? executeError.message
          : "Unable to execute review draft."
      );
    } finally {
      setExecutingId("");
    }
  }

  async function generateTranscriptDraft() {
    if (!workspaceReady || !transcriptText.trim() || isGeneratingTranscriptDraft) {
      return;
    }

    setIsGeneratingTranscriptDraft(true);
    setError("");
    try {
      const response = await fetch("/api/ai/interpret-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          transcript: transcriptText.trim(),
          sourceLabel: transcriptLabel.trim() || "Transcript",
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to generate transcript draft.");
      }
      setReviewDrafts((current) => [payload.reviewDraft as AiReviewDraft, ...current]);
      setTranscriptText("");
      setTranscriptLabel("");
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to generate transcript draft."
      );
    } finally {
      setIsGeneratingTranscriptDraft(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
          AI Review
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="mt-2 max-w-3xl text-gray-600 dark:text-gray-400">
              Review AI-generated action drafts before anything reaches the
              Frontier action layer.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-gray-500 dark:text-gray-400">Pending</div>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </div>
        </div>
      </section>

      {!user && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Sign in to review AI drafts.
        </div>
      )}

      {user && !workspaceReady && !isLoadingWorkspaces && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Create or select a workspace before reviewing drafts.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {user && workspaceReady && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold">
                Transcript
              </label>
              <textarea
                rows={3}
                value={transcriptText}
                onChange={(event) => setTranscriptText(event.target.value)}
                placeholder="Paste a transcript or command..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
            <div className="lg:w-64">
              <label className="mb-2 block text-sm font-semibold">
                Source Label
              </label>
              <input
                value={transcriptLabel}
                onChange={(event) => setTranscriptLabel(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
            <button
              type="button"
              onClick={generateTranscriptDraft}
              disabled={
                !canDeleteBusinessRecords ||
                !transcriptText.trim() ||
                isGeneratingTranscriptDraft
              }
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingTranscriptDraft ? "Generating..." : "Generate Draft"}
            </button>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {(["All", "Pending", "Approved", "Needs Changes", "Rejected", "Executed"] as const).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg border px-4 py-2 text-sm font-bold ${
                filter === item
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          Loading review drafts...
        </div>
      ) : filteredReviewDrafts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          No AI review drafts for {activeWorkspace.name}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviewDrafts.map((draft) => (
            <article
              key={draft.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(draft.status)}`}
                    >
                      {draft.status}
                    </span>
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      {draft.sourceType}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Confidence {formatConfidence(draft.confidence)}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${executionClass(draft.executionStatus)}`}
                    >
                      {draft.executionStatus}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold">
                    {draft.sourceLabel || "AI Review Draft"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Created {formatDate(draft.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Source {draft.sourceId || "inline transcript"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={
                      !canDeleteBusinessRecords ||
                      Boolean(updatingId) ||
                      Boolean(executingId)
                    }
                    onClick={() => updateStatus(draft.id, "Approved")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={
                      !canDeleteBusinessRecords ||
                      Boolean(updatingId) ||
                      Boolean(executingId)
                    }
                    onClick={() => updateStatus(draft.id, "Rejected")}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={
                      !canDeleteBusinessRecords ||
                      Boolean(updatingId) ||
                      Boolean(executingId)
                    }
                    onClick={() => updateStatus(draft.id, "Needs Changes")}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Mark Needs Changes
                  </button>
                  {draft.status === "Approved" &&
                    draft.executionStatus !== "Executed" && (
                      <button
                        type="button"
                        disabled={
                          !canDeleteBusinessRecords ||
                          Boolean(updatingId) ||
                          Boolean(executingId)
                        }
                        onClick={() => executeDraft(draft.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {executingId === draft.id
                          ? "Executing..."
                          : "Execute Approved Draft"}
                      </button>
                    )}
                </div>
              </div>

              {!canDeleteBusinessRecords && (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Owner or Manager access is required to update draft status.
                </p>
              )}

              {draft.executionError && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  {draft.executionError}
                </p>
              )}

              {Object.keys(draft.executionResult).length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold">Execution Result</h3>
                  <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                    {JSON.stringify(draft.executionResult, null, 2)}
                  </pre>
                </div>
              )}

              {draft.warnings.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold">Warnings</h3>
                  <ul className="mt-2 space-y-2">
                    {draft.warnings.map((warning, index) => (
                      <li
                        key={`${warning.code}-${index}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                      >
                        <span className="font-semibold">{warning.code}</span>:{" "}
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5">
                <h3 className="font-bold">Action Drafts</h3>
                <div className="mt-3 space-y-3">
                  {draft.actions.map((action, index) => (
                    <div
                      key={`${action.type}-${index}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{action.type}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatConfidence(action.confidence)}
                        </span>
                      </div>
                      <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                        {JSON.stringify(action.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
