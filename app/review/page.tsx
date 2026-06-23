"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import type {
  AiReviewDraft,
  AiReviewDraftRevision,
  AiReviewDraftStatus,
} from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import type { SuggestedAction } from "@/lib/ai/types";
import type { ClientRow } from "@/lib/clientTypes";
import type { Job } from "@/lib/jobTypes";
import { getAiFormTarget, saveAiFormHydration } from "@/lib/ai/formHydration";
import {
  advanceVoiceSession,
  createVoiceSession,
  type VoiceClarificationResponse,
  type VoiceSessionState,
} from "@/lib/ai/voiceClarification";
import type { SpeechWorkerSuccess } from "@/lib/speech/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ReviewDraftsResponse = {
  reviewDrafts?: AiReviewDraft[];
  reviewDraft?: AiReviewDraft;
  executionResult?: unknown;
  revisions?: AiReviewDraftRevision[];
  error?: string;
};

type TranscriptionResponse = {
  transcription?: SpeechWorkerSuccess["data"];
  error?: string;
};

type VoiceTurn = {
  speaker: "Frontier" | "User";
  text: string;
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
  const router = useRouter();
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const [isRecorderSupported, setIsRecorderSupported] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedAudioUrlRef = useRef("");
  const voiceAutoProcessRef = useRef(false);
  const [transcription, setTranscription] = useState<
    SpeechWorkerSuccess["data"] | null
  >(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingTranscriptDraft, setIsGeneratingTranscriptDraft] =
    useState(false);
  const [voiceTurns, setVoiceTurns] = useState<VoiceTurn[]>([]);
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceSession, setVoiceSession] = useState<VoiceSessionState>(() =>
    createVoiceSession()
  );
  const [voiceDraftAction, setVoiceDraftAction] = useState<SuggestedAction | null>(
    null
  );
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [voiceClients, setVoiceClients] = useState<ClientRow[]>([]);
  const [voiceJobs, setVoiceJobs] = useState<Job[]>([]);
  const [isCreatingVoiceDraft, setIsCreatingVoiceDraft] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const [error, setError] = useState("");
  const [editingDraftId, setEditingDraftId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editActions, setEditActions] = useState("");
  const [editRevisions, setEditRevisions] = useState<AiReviewDraftRevision[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  function openActionInForm(draft: AiReviewDraft, action: SuggestedAction) {
    const hydration = saveAiFormHydration(
      {
        workspaceId: draft.workspaceId,
        reviewDraftId: draft.id,
        sourceId: draft.sourceId ?? undefined,
        sourceType: draft.sourceType,
      },
      action
    );
    if (!hydration) return;

    const routes = {
      client: "/clients?aiDraft=1",
      job: "/jobs?aiDraft=1",
      invoice: "/invoices/new?aiDraft=1",
      expense: "/financials?aiDraft=1",
      material: "/inventory?aiDraft=1",
    } as const;
    router.push(routes[hydration.target]);
  }

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

  useEffect(() => {
    if (!user || !workspaceReady) {
      queueMicrotask(() => {
        setVoiceClients([]);
        setVoiceJobs([]);
      });
      return;
    }

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    async function loadVoiceContext() {
      const [{ data: clients }, { data: jobs }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude")
          .eq("workspace_id", activeWorkspace.id)
          .order("name", { ascending: true }),
        supabase
          .from("jobs")
          .select("id, workspace_id, client_id, client_name_snapshot, name, status, estimated_value_cents, scheduled_date, scheduled_time, notes")
          .eq("workspace_id", activeWorkspace.id)
          .order("scheduled_date", { ascending: true }),
      ]);
      if (cancelled) return;
      setVoiceClients(
        (clients ?? []).map((client) => ({
          id: client.id,
          workspaceId: client.workspace_id,
          name: client.name,
          status: client.status,
          balance: String((client.balance_cents ?? 0) / 100),
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          city: client.city ?? "",
          state: client.state ?? "",
          zip: client.zip ?? "",
          notes: client.notes ?? "",
          latitude: client.latitude ?? undefined,
          longitude: client.longitude ?? undefined,
        }))
      );
      setVoiceJobs(
        (jobs ?? []).map((job) => ({
          id: job.id,
          workspaceId: job.workspace_id,
          clientId: job.client_id ?? undefined,
          client: job.client_name_snapshot ?? "",
          name: job.name,
          status: job.status,
          value: String((job.estimated_value_cents ?? 0) / 100),
          date: job.scheduled_date ?? "",
          time: job.scheduled_time?.slice(0, 5) ?? "",
          notes: job.notes ?? "",
          materials: [],
        }))
      );
    }

    queueMicrotask(loadVoiceContext);
    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, user, workspaceReady]);

  useEffect(() => {
    queueMicrotask(() => {
      setIsRecorderSupported(
        typeof MediaRecorder !== "undefined" &&
          Boolean(navigator.mediaDevices?.getUserMedia)
      );
    });

    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === "recording") recorder.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordedAudioUrlRef.current) URL.revokeObjectURL(recordedAudioUrlRef.current);
    };
  }, []);

  function addVoiceTurn(speaker: VoiceTurn["speaker"], text: string) {
    setVoiceTurns((current) => [...current.slice(-5), { speaker, text }]);
  }

  function speakAssistant(text: string) {
    addVoiceTurn("Frontier", text);
    setVoiceStatus(text);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      if (autoListen && voiceSession.mode === "waiting_for_answer") {
        void startRecording();
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function applyClarificationResponse(result: VoiceClarificationResponse) {
    setVoiceSession(result.session);
    setVoiceDraftAction(result.action ?? null);
    speakAssistant(result.assistantMessage);
  }

  function advanceClarificationWithText(text: string) {
    if (!text.trim()) return;
    addVoiceTurn("User", text.trim());
    const result = advanceVoiceSession(
      voiceSession,
      text.trim(),
      voiceClients,
      voiceJobs
    );
    applyClarificationResponse(result);
  }

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

  async function generateTranscriptDraft(
    transcriptOverride?: string,
    sourceLabelOverride?: string,
    clearAfterCreate = true
  ) {
    const transcript = transcriptOverride?.trim() || transcriptText.trim();
    if (!workspaceReady || !transcript || isGeneratingTranscriptDraft) {
      return null;
    }

    setIsGeneratingTranscriptDraft(true);
    setError("");
    try {
      const response = await fetch("/api/ai/interpret-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          transcript,
          sourceLabel:
            sourceLabelOverride?.trim() || transcriptLabel.trim() || "Transcript",
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to generate transcript draft.");
      }
      setReviewDrafts((current) => [payload.reviewDraft as AiReviewDraft, ...current]);
      if (clearAfterCreate) {
        setTranscriptText("");
        setTranscriptLabel("");
      }
      return payload.reviewDraft as AiReviewDraft;
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to generate transcript draft."
      );
      return null;
    } finally {
      setIsGeneratingTranscriptDraft(false);
    }
  }

  async function transcribeAudioSource(file: File, sourceLabel: string) {
    if (!workspaceReady || isTranscribing) return null;

    setIsTranscribing(true);
    setError("");
    setTranscription(null);
    try {
      const formData = new FormData();
      formData.append("workspaceId", activeWorkspace.id);
      formData.append("file", file);

      const response = await fetch("/api/speech/transcribe", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as TranscriptionResponse;
      if (!response.ok || !payload.transcription) {
        throw new Error(payload.error || "Unable to transcribe audio.");
      }

      setTranscription(payload.transcription);
      setTranscriptText(payload.transcription.text);
      if (!transcriptLabel.trim()) setTranscriptLabel(sourceLabel);
      return payload.transcription;
    } catch (transcriptionError) {
      setError(
        transcriptionError instanceof Error
          ? transcriptionError.message
          : "Unable to transcribe audio."
      );
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }

  async function transcribeAudio() {
    if (!audioFile) return;
    await transcribeAudioSource(audioFile, audioFile.name);
  }

  function stopRecordingTimer() {
    if (!recordingTimer.current) return;
    clearInterval(recordingTimer.current);
    recordingTimer.current = null;
  }

  function releaseMicrophone() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }

  async function startRecording() {
    if (!isRecorderSupported || isRecording) return;

    setRecordingError("");
    setRecordedBlob(null);
    setRecordingDurationSeconds(0);
    setTranscription(null);
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
      recordedAudioUrlRef.current = "";
      setRecordedAudioUrl("");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordingChunksRef.current = [];

      const preferredMimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setRecordingError("The browser could not complete this recording.");
      };
      recorder.onstop = () => {
        stopRecordingTimer();
        releaseMicrophone();
        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size === 0) {
          setRecordingError("No audio was captured. Try recording again.");
          return;
        }
        const previewUrl = URL.createObjectURL(blob);
        recordedAudioUrlRef.current = previewUrl;
        setRecordedBlob(blob);
        setRecordedAudioUrl(previewUrl);
        if (voiceAutoProcessRef.current) {
          voiceAutoProcessRef.current = false;
          queueMicrotask(() => processVoiceBlob(blob));
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      recordingTimer.current = setInterval(() => {
        setRecordingDurationSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch (recordingFailure) {
      releaseMicrophone();
      setIsRecording(false);
      setRecordingError(
        recordingFailure instanceof DOMException && recordingFailure.name === "NotAllowedError"
          ? "Microphone permission was denied. Upload an audio file instead."
          : "Unable to access the microphone. Upload an audio file instead."
      );
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
    setIsRecording(false);
    stopRecordingTimer();
  }

  function clearRecording() {
    if (isRecording) stopRecording();
    if (recordedAudioUrlRef.current) URL.revokeObjectURL(recordedAudioUrlRef.current);
    recordedAudioUrlRef.current = "";
    setRecordedAudioUrl("");
    setRecordedBlob(null);
    setRecordingDurationSeconds(0);
    setRecordingError("");
  }

  async function transcribeRecording() {
    if (!recordedBlob) return;
    const extension = recordedBlob.type.includes("mp4") ? "mp4" : recordedBlob.type.includes("wav") ? "wav" : "webm";
    const file = new File([recordedBlob], `frontier-recording.${extension}`, {
      type: recordedBlob.type || "audio/webm",
    });
    await transcribeAudioSource(file, file.name);
  }

  async function startVoiceAssistant() {
    if (!canDeleteBusinessRecords || !isRecorderSupported || isRecording) return;
    const nextSession = createVoiceSession();
    setVoiceSession(nextSession);
    setVoiceDraftAction(null);
    setIsVoiceSessionActive(true);
    setVoiceTurns([]);
    speakAssistant("Tell me what you want Frontier to create or update.");
    await startRecording();
  }

  function stopVoiceAssistantRecording() {
    if (!isRecording) return;
    voiceAutoProcessRef.current = true;
    stopRecording();
    speakAssistant("Got it. I am transcribing and preparing a review draft.");
  }

  async function processVoiceBlob(blob: Blob) {
    const extension = blob.type.includes("mp4") ? "mp4" : blob.type.includes("wav") ? "wav" : "webm";
    const file = new File([blob], `frontier-voice-command.${extension}`, {
      type: blob.type || "audio/webm",
    });
    const result = await transcribeAudioSource(file, "Voice command");
    if (!result?.text) {
      speakAssistant("I could not hear enough to create a draft. Please try again.");
      return;
    }
    advanceClarificationWithText(result.text);
  }

  async function createVoiceReviewDraft() {
    if (!workspaceReady || !voiceDraftAction || isCreatingVoiceDraft) return;
    setIsCreatingVoiceDraft(true);
    setError("");
    try {
      const response = await fetch("/api/ai/voice-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          sourceLabel: "Voice clarification",
          rawInput: voiceSession.sourceTranscripts.join("\n"),
          action: voiceDraftAction,
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to create voice review draft.");
      }
      setReviewDrafts((current) => [payload.reviewDraft as AiReviewDraft, ...current]);
      speakAssistant("The review draft is ready. Approve it and execute it when you are ready.");
      setVoiceSession((current) => ({ ...current, mode: "draft_ready" }));
    } catch (voiceDraftError) {
      setError(
        voiceDraftError instanceof Error
          ? voiceDraftError.message
          : "Unable to create voice review draft."
      );
    } finally {
      setIsCreatingVoiceDraft(false);
    }
  }

  function cancelVoiceSession() {
    window.speechSynthesis?.cancel();
    if (isRecording) stopRecording();
    setVoiceSession(createVoiceSession());
    setVoiceDraftAction(null);
    setVoiceAnswer("");
    setVoiceStatus("");
    setVoiceTurns([]);
    setIsVoiceSessionActive(false);
  }

  async function openDraftEditor(draft: AiReviewDraft) {
    setEditingDraftId(draft.id);
    setEditTitle(draft.sourceLabel ?? "");
    setEditSummary(draft.summary ?? "");
    setEditActions(JSON.stringify(draft.actions, null, 2));
    setEditRevisions([]);
    try {
      const response = await fetch(`/api/ai/review-drafts?workspaceId=${encodeURIComponent(activeWorkspace.id)}&draftId=${encodeURIComponent(draft.id)}`);
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (response.ok) setEditRevisions(payload.revisions ?? []);
    } catch {
      setEditRevisions([]);
    }
  }

  async function saveDraftEdit() {
    if (!editingDraftId || isSavingEdit) return;
    setIsSavingEdit(true);
    setError("");
    try {
      const actions = JSON.parse(editActions) as SuggestedAction[];
      const response = await fetch("/api/ai/review-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "content", id: editingDraftId, workspaceId: activeWorkspace.id, sourceLabel: editTitle, summary: editSummary, actions }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) throw new Error(payload.error || "Unable to save review draft changes.");
      setReviewDrafts((current) => current.map((draft) => draft.id === payload.reviewDraft?.id ? payload.reviewDraft : draft));
      setEditingDraftId("");
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Unable to save review draft changes.");
    } finally {
      setIsSavingEdit(false);
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
        <section className="space-y-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">Voice Assistant</h2>
                <p className="mt-1 text-sm text-blue-900/80 dark:text-blue-100/80">
                  Speak a Frontier command. Frontier will transcribe it, create a review draft, and wait for your approval before anything is executed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startVoiceAssistant}
                  disabled={
                    !canDeleteBusinessRecords ||
                    isRecording ||
                    isTranscribing ||
                    isGeneratingTranscriptDraft ||
                    isRecorderSupported !== true
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Voice Command
                </button>
                <button
                  type="button"
                  onClick={stopVoiceAssistantRecording}
                  disabled={!isVoiceSessionActive || !isRecording}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Stop & Prepare Draft
                </button>
              </div>
            </div>
            {isRecorderSupported === false && (
              <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-200">
                Browser microphone recording is unavailable. Use file upload or manual transcript instead.
              </p>
            )}
            {voiceStatus && (
              <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm dark:bg-gray-950/60">
                <span className="font-bold">Frontier:</span> {voiceStatus}
              </div>
            )}
            {voiceTurns.length > 0 && (
              <div className="mt-3 grid gap-2">
                {voiceTurns.map((turn, index) => (
                  <div
                    key={`${turn.speaker}-${index}`}
                    className="rounded-lg border border-blue-100 bg-white/70 p-3 text-sm dark:border-blue-900 dark:bg-gray-950/60"
                  >
                    <span className="font-bold">{turn.speaker}:</span> {turn.text}
                  </div>
                ))}
              </div>
            )}
            {isVoiceSessionActive && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-950">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-bold">Clarification Session</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Mode: {voiceSession.mode}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={autoListen}
                      onChange={(event) => setAutoListen(event.target.checked)}
                    />
                    Auto-listen after prompts
                  </label>
                </div>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-bold">Intent</dt>
                    <dd>{voiceSession.draftType || "Detecting"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Missing Fields</dt>
                    <dd>{voiceSession.missingFields.join(", ") || "None"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Matched Client</dt>
                    <dd>
                      {voiceClients.find((client) => client.id === voiceSession.selectedClientId)?.name || "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">Matched Job</dt>
                    <dd>
                      {voiceJobs.find((job) => job.id === voiceSession.selectedJobId)?.name || "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">Material Mode</dt>
                    <dd>{voiceSession.materialMode || "Not selected"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Transcript Count</dt>
                    <dd>{voiceSession.transcriptHistory.length}</dd>
                  </div>
                </dl>
                {voiceSession.candidateClients.length > 0 && !voiceSession.selectedClientId && (
                  <div className="mt-4 text-sm">
                    <div className="font-bold">Candidate Clients</div>
                    <ol className="mt-1 list-decimal pl-5">
                      {voiceSession.candidateClients.map((client) => (
                        <li key={client.id}>{client.name}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {voiceSession.candidateJobs.length > 0 && !voiceSession.selectedJobId && (
                  <div className="mt-4 text-sm">
                    <div className="font-bold">Candidate Jobs</div>
                    <ol className="mt-1 list-decimal pl-5">
                      {voiceSession.candidateJobs.map((job) => (
                        <li key={job.id}>{job.name}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="mt-4">
                  <div className="mb-2 text-sm font-bold">Draft Payload</div>
                  <pre className="max-h-56 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                    {JSON.stringify(voiceSession.draftPayload, null, 2)}
                  </pre>
                </div>
                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
                  <label className="flex-1">
                    <span className="mb-2 block text-sm font-bold">Answer or Correction</span>
                    <input
                      value={voiceAnswer}
                      onChange={(event) => setVoiceAnswer(event.target.value)}
                      placeholder="Example: use option 1, append, or inspection"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      advanceClarificationWithText(voiceAnswer);
                      setVoiceAnswer("");
                    }}
                    disabled={!voiceAnswer.trim()}
                    className="rounded-lg border border-blue-600 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={createVoiceReviewDraft}
                    disabled={!voiceDraftAction || isCreatingVoiceDraft}
                    className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreatingVoiceDraft ? "Creating..." : "Create Review Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelVoiceSession}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-bold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div id="audio-intake" className="scroll-mt-24 border-b border-gray-200 pb-5 dark:border-gray-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold">
                  Choose File
                </label>
                <input
                  type="file"
                  accept=".wav,.mp3,.m4a,.ogg,.flac,.webm,.mp4,audio/*"
                  onChange={(event) => {
                    setAudioFile(event.target.files?.[0] ?? null);
                    setTranscription(null);
                  }}
                  className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-semibold dark:file:bg-gray-800"
                />
              </div>
              <button
                type="button"
                onClick={transcribeAudio}
                disabled={!canDeleteBusinessRecords || !audioFile || isTranscribing}
                className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                {isTranscribing ? "Transcribing..." : "Transcribe File"}
              </button>
            </div>
            <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              Or
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Record from Microphone</div>
              {isRecorderSupported === false ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Microphone recording is not supported in this browser. Upload an audio file instead.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={startRecording} disabled={!canDeleteBusinessRecords || isRecording || isTranscribing || isRecorderSupported !== true} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Start Recording</button>
                    <button type="button" onClick={stopRecording} disabled={!isRecording} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">Stop Recording</button>
                    <span className="min-w-14 font-mono text-sm" aria-live="polite">
                      {String(Math.floor(recordingDurationSeconds / 60)).padStart(2, "0")}:{String(recordingDurationSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>
                  {isRecording && <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">Recording...</p>}
                  {recordedAudioUrl && (
                    <div className="mt-3 space-y-3">
                      <audio controls src={recordedAudioUrl} className="w-full" aria-label="Recorded audio preview" />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={transcribeRecording} disabled={!recordedBlob || isTranscribing || isRecording} className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40">{isTranscribing ? "Transcribing..." : "Transcribe Recording"}</button>
                        <button type="button" onClick={clearRecording} disabled={isRecording} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800">Clear Recording</button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {recordingError && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">{recordingError}</p>}
            </div>
            {transcription && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-950">
                <div className="font-semibold">
                  {transcription.provider} · {transcription.language} · {transcription.durationSeconds.toFixed(1)}s
                </div>
                <p className="mt-1 line-clamp-3 text-gray-600 dark:text-gray-400">
                  {transcription.text}
                </p>
              </div>
            )}
          </div>
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
              onClick={() => {
                void generateTranscriptDraft();
              }}
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
                  {draft.summary && <p className="mt-3 max-w-3xl text-sm text-gray-700 dark:text-gray-300">{draft.summary}</p>}
                  {draft.sourceType === "ocr" && draft.sourceId && (
                    <a href={`/documents#document-${draft.sourceId}`} className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">View source document</a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(draft.status === "Pending" || draft.status === "Needs Changes") && draft.executionStatus !== "Executed" && (
                    <button type="button" disabled={!canDeleteBusinessRecords || Boolean(updatingId) || Boolean(executingId)} onClick={() => openDraftEditor(draft)} className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950/30">Edit Draft</button>
                  )}
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
                        {getAiFormTarget(action) && (
                          <button
                            type="button"
                            onClick={() => openActionInForm(draft, action)}
                            className="ml-auto rounded-lg border border-blue-600 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                          >
                            Open {getAiFormTarget(action)} draft
                          </button>
                        )}
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
      {editingDraftId && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/75 p-4">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Edit Review Draft</h2><button type="button" onClick={() => setEditingDraftId("")} className="text-2xl text-gray-500">x</button></div>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-semibold">Title</span><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Summary</span><textarea rows={3} value={editSummary} onChange={(event) => setEditSummary(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Action Fields (JSON)</span><textarea rows={14} value={editActions} onChange={(event) => setEditActions(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-950 px-4 py-3 font-mono text-xs text-gray-100 dark:border-gray-700" /></label>
              {editRevisions.length > 0 && <div><h3 className="text-sm font-bold">Revision History</h3><div className="mt-2 space-y-2">{editRevisions.map((revision) => <div key={revision.id} className="rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-800"><div className="font-semibold">{formatDate(revision.createdAt)}</div><div className="text-gray-500 dark:text-gray-400">Previous title: {revision.sourceLabel || "Untitled"}</div></div>)}</div></div>}
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditingDraftId("")} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700">Cancel</button><button type="button" onClick={saveDraftEdit} disabled={isSavingEdit} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-50">{isSavingEdit ? "Saving..." : "Save Revision"}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
