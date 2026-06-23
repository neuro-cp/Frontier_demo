import type { ClientRow } from "@/lib/clientTypes";
import type { Job } from "@/lib/jobTypes";
import type { DraftPayload, SuggestedAction } from "@/lib/ai/types";

export type VoiceSessionMode =
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "waiting_for_answer"
  | "draft_ready"
  | "error";

export type MaterialMode = "append" | "merge" | "replace";

export type VoiceDraftType = "job" | "calendar_event" | "material_allocation";

export type VoiceSessionState = {
  sessionId: string;
  mode: VoiceSessionMode;
  transcriptHistory: string[];
  assistantMessages: string[];
  currentIntent: string;
  missingFields: string[];
  candidateClients: ClientRow[];
  candidateJobs: Job[];
  draftType: VoiceDraftType | "";
  draftPayload: DraftPayload;
  sourceTranscripts: string[];
  selectedClientId: string;
  selectedJobId: string;
  materialMode: MaterialMode | "";
};

export type VoiceClarificationResponse = {
  assistantMessage: string;
  needsFollowup: boolean;
  missingFields: string[];
  candidateClients: ClientRow[];
  candidateJobs: Job[];
  draftReady: boolean;
  draftType: VoiceDraftType | "";
  draftPayload: DraftPayload;
  action?: SuggestedAction;
  session: VoiceSessionState;
};

export function createVoiceSession(): VoiceSessionState {
  return {
    sessionId: crypto.randomUUID(),
    mode: "idle",
    transcriptHistory: [],
    assistantMessages: [],
    currentIntent: "",
    missingFields: [],
    candidateClients: [],
    candidateJobs: [],
    draftType: "",
    draftPayload: {},
    sourceTranscripts: [],
    selectedClientId: "",
    selectedJobId: "",
    materialMode: "",
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function distance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = old;
    }
  }
  return previous[b.length];
}

function bigrams(value: string) {
  const compact = value.replace(/\s+/g, "");
  return Array.from({ length: Math.max(0, compact.length - 1) }, (_, index) =>
    compact.slice(index, index + 2)
  );
}

function diceSimilarity(a: string, b: string) {
  const aPairs = bigrams(a);
  const bPairs = bigrams(b);
  if (!aPairs.length || !bPairs.length) return 0;
  const remaining = [...bPairs];
  let matches = 0;
  for (const pair of aPairs) {
    const index = remaining.indexOf(pair);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  }
  return (2 * matches) / (aPairs.length + bPairs.length);
}

function closeMatch(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = left.split(" ").filter((part) => part.length > 2);
  const rightTokens = right.split(" ").filter((part) => part.length > 2);
  return leftTokens.some((leftToken) =>
    rightTokens.some((rightToken) => {
      const shortest = Math.min(leftToken.length, rightToken.length);
      if (shortest < 5) return leftToken === rightToken;
      const maxDistance = Math.max(2, Math.floor(shortest * 0.3));
      return (
        distance(leftToken, rightToken) <= maxDistance ||
        diceSimilarity(leftToken, rightToken) >= 0.55
      );
    })
  );
}

function extractClientSearch(text: string) {
  const normalized = normalize(text);
  const jobNameMatch = normalized.match(/\b(?:the\s+)?([a-z0-9'-]+)\s+(?:job|client)\b/);
  if (jobNameMatch) return jobNameMatch[1];

  const forMatch = normalized.match(/\b(?:for|update|schedule|materials for)\s+(?:the\s+)?([a-z0-9'-]+)/);
  if (forMatch) return forMatch[1];

  const ignored = new Set(["create", "update", "schedule", "materials", "client", "job", "visit"]);
  return normalized.split(" ").find((part) => part.length > 3 && !ignored.has(part)) ?? "";
}

function extractDatePhrase(text: string) {
  return (
    text.match(/\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b[^.]*?(?:\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b)?/i)?.[0] ??
    text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ??
    ""
  );
}

function extractEventType(text: string) {
  const match = text.match(/\b(quote|inspection|service visit|follow-up|follow up|job|visit)\b/i);
  return match?.[1]?.replace("follow up", "follow-up") ?? "";
}

function extractEstimate(text: string) {
  const match = text.match(/\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks)?/i);
  return match ? Number(match[1]) : undefined;
}

function parseMaterials(text: string) {
  const matches = [...text.matchAll(/(\d+)\s+([a-z][a-z0-9 -]*?)(?=\s+and\s+|\s*,|\.|$)/gi)];
  return matches.map((match) => ({
    quantity: Number(match[1]),
    name: match[2].trim(),
  }));
}

function matchClients(text: string, clients: ClientRow[]) {
  const search = extractClientSearch(text);
  if (!search) return [];
  return clients.filter((client) => closeMatch(search, client.name));
}

function matchJobs(text: string, jobs: Job[], clientId: string) {
  const normalized = normalize(text);
  return jobs.filter((job) => {
    const clientTokens = normalize(job.client).split(" ").filter((part) => part.length > 2);
    const clientMatches = clientId
      ? job.clientId === clientId
      : clientTokens.some((part) => normalized.includes(part) || closeMatch(normalized, part));
    return clientMatches || closeMatch(normalized, job.name);
  });
}

function selectedClient(session: VoiceSessionState, clients: ClientRow[]) {
  return clients.find((client) => client.id === session.selectedClientId) ?? null;
}

function selectedJob(session: VoiceSessionState, jobs: Job[]) {
  return jobs.find((job) => job.id === session.selectedJobId) ?? null;
}

function clientLabel(client: ClientRow) {
  return [client.name, client.address, [client.city, client.state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" - ");
}

function jobLabel(job: Job) {
  return [job.name, job.status, job.date].filter(Boolean).join(" - ");
}

function askClientSelection(session: VoiceSessionState, name: string) {
  if (session.candidateClients.length === 1) {
    const client = session.candidateClients[0];
    return response(
      session,
      `I found 1 existing client named ${name || client.name}: ${clientLabel(client)}. Would you like to: 1. Use this client, 2. Create a new client named ${name || client.name}, or 3. Search again?`
    );
  }

  return response(
    session,
    `I found multiple possible clients. Which client should I use? ${session.candidateClients.map((client, index) => `${index + 1}. ${clientLabel(client)}`).join(", ")}. You can also say create new client or search again.`
  );
}

function askJobSelection(session: VoiceSessionState) {
  if (session.candidateJobs.length === 1) {
    const job = session.candidateJobs[0];
    return response(
      session,
      `I found 1 matching job: ${jobLabel(job)}. Would you like to: 1. Use this job, 2. Create a new job draft, or 3. Search again?`
    );
  }

  return response(
    session,
    `I found multiple matching jobs. Which job should I use? ${session.candidateJobs.map((job, index) => `${index + 1}. ${jobLabel(job)}`).join(", ")}.`
  );
}

function response(session: VoiceSessionState, assistantMessage: string, draftReady = false): VoiceClarificationResponse {
  return {
    assistantMessage,
    needsFollowup: !draftReady,
    missingFields: session.missingFields,
    candidateClients: session.candidateClients,
    candidateJobs: session.candidateJobs,
    draftReady,
    draftType: session.draftType,
    draftPayload: session.draftPayload,
    action: draftReady ? buildVoiceAction(session) : undefined,
    session: {
      ...session,
      mode: draftReady ? "draft_ready" : "waiting_for_answer",
      assistantMessages: [...session.assistantMessages, assistantMessage],
    },
  };
}

export function buildVoiceAction(session: VoiceSessionState): SuggestedAction | undefined {
  if (session.draftType === "material_allocation") {
    return { type: "create_material_allocation", confidence: 0.82, payload: session.draftPayload };
  }
  if (session.draftType === "calendar_event") {
    return { type: "create_calendar_event", confidence: 0.82, payload: session.draftPayload };
  }
  if (session.draftType === "job") {
    const actionType = session.selectedJobId ? "update_job" : "create_job";
    return { type: actionType, confidence: 0.82, payload: session.draftPayload };
  }
  return undefined;
}

export function advanceVoiceSession(
  current: VoiceSessionState,
  transcript: string,
  clients: ClientRow[],
  jobs: Job[]
): VoiceClarificationResponse {
  const text = transcript.trim();
  const lower = normalize(text);
  const session: VoiceSessionState = {
    ...current,
    mode: "thinking",
    transcriptHistory: [...current.transcriptHistory, text],
    sourceTranscripts: [...current.sourceTranscripts, text],
  };

  if (lower.includes("append")) session.materialMode = "append";
  if (lower.includes("merge")) session.materialMode = "merge";
  if (lower.includes("replace")) session.materialMode = "replace";

  const choiceNumber = lower.match(/\b(?:number\s*)?(\d+)\b/)?.[1];

  if (session.missingFields.includes("clientId") && !session.selectedClientId) {
    const wantsSearch = lower.includes("search") || (session.candidateClients.length === 0 && choiceNumber === "2");
    const wantsCreate =
      lower.includes("create") ||
      lower.includes("new") ||
      (session.candidateClients.length === 0 && (choiceNumber === "1" || lower.includes("yes"))) ||
      (session.candidateClients.length === 1 && choiceNumber === "2");
    const wantsUseSingle =
      session.candidateClients.length === 1 &&
      (choiceNumber === "1" || lower.includes("use") || lower.includes("yes") || lower.includes("that"));

    if (wantsSearch || (session.candidateClients.length === 1 && choiceNumber === "3")) {
      session.candidateClients = [];
      session.missingFields = ["clientId"];
      return response(session, "What client name, address, phone, or email should I search for?");
    }

    if (wantsCreate) {
      const existingName = String(session.draftPayload.clientName ?? extractClientSearch(session.sourceTranscripts[0] ?? text));
      session.candidateClients = [];
      session.missingFields = [];
      session.draftPayload = { ...session.draftPayload, clientName: existingName };
    } else if (wantsUseSingle) {
      session.selectedClientId = session.candidateClients[0].id;
      session.candidateClients = [];
      session.missingFields = [];
    } else if (choiceNumber && session.candidateClients.length > 1) {
      const picked = session.candidateClients[Number(choiceNumber) - 1];
      if (picked) {
        session.selectedClientId = picked.id;
        session.candidateClients = [];
        session.missingFields = [];
      }
    }
  }

  if (session.missingFields.includes("jobId") && !session.selectedJobId) {
    const wantsSearch = lower.includes("search");
    const wantsCreate = lower.includes("create") || lower.includes("new") || (session.candidateJobs.length === 1 && choiceNumber === "2");
    const wantsUseSingle =
      session.candidateJobs.length === 1 &&
      (choiceNumber === "1" || lower.includes("use") || lower.includes("yes") || lower.includes("that"));

    if (wantsSearch || (session.candidateJobs.length === 1 && choiceNumber === "3")) {
      session.candidateJobs = [];
      session.missingFields = ["jobId"];
      return response(session, "What job name, client, date, or description should I search for?");
    }

    if (wantsUseSingle) {
      session.selectedJobId = session.candidateJobs[0].id;
      session.candidateJobs = [];
      session.missingFields = [];
    } else if (choiceNumber && session.candidateJobs.length > 1) {
      const picked = session.candidateJobs[Number(choiceNumber) - 1];
      if (picked) {
        session.selectedJobId = picked.id;
        session.candidateJobs = [];
        session.missingFields = [];
      }
    } else if (wantsCreate) {
      session.candidateJobs = [];
      session.missingFields = [];
    }
  }

  const materials = parseMaterials(session.sourceTranscripts.join(" "));
  const isMaterial = lower.includes("material") || materials.length > 0;
  const isJobUpdate = lower.includes("update") || lower.includes("estimated") || lower.includes("cost");
  session.draftType = isMaterial ? "material_allocation" : isJobUpdate ? "job" : "calendar_event";

  if (!session.selectedClientId && !session.draftPayload.clientName) {
    const candidates = matchClients(text, clients);
    session.candidateClients = candidates;
    if (candidates.length > 0) {
      session.missingFields = ["clientId"];
      return askClientSelection(session, extractClientSearch(text));
    }
    if (!candidates.length) {
      const name = extractClientSearch(text);
      session.missingFields = ["clientId"];
      session.draftPayload = { ...session.draftPayload, clientName: name };
      return response(session, `I could not find ${name || "that client"}. Would you like to: 1. Create a new client named ${name || "that"}, or 2. Search again?`);
    }
  }

  if (session.draftType === "material_allocation" || isJobUpdate) {
    if (!session.selectedJobId) {
      const candidates = matchJobs(text, jobs, session.selectedClientId);
      session.candidateJobs = candidates;
      if (candidates.length > 0) {
        session.missingFields = ["jobId"];
        return askJobSelection(session);
      }
      if (!candidates.length && session.draftType === "material_allocation") {
        session.missingFields = ["jobId"];
        return response(session, "Which job should these materials be attached to?");
      }
      if (!candidates.length && isJobUpdate) {
        session.missingFields = ["jobId"];
        return response(session, "I could not find a matching job. Should I create a new job draft?");
      }
    }
  }

  if (session.draftType === "material_allocation") {
    if (!session.selectedJobId) {
      session.missingFields = ["jobId"];
      return response(session, "Which job should these materials be attached to?");
    }
    if (!materials.length) {
      session.missingFields = ["materials"];
      return response(session, "What materials and quantities should I add?");
    }
    if (!session.materialMode) {
      session.missingFields = ["materialMode"];
      return response(session, "Do you want to append, merge, or replace the job materials?");
    }
    session.missingFields = [];
    session.draftPayload = {
      jobId: session.selectedJobId,
      mode: session.materialMode,
      materials,
      notes: session.sourceTranscripts.join("\n"),
    };
    return response(session, "I have enough information. Please review this material allocation draft.", true);
  }

  const eventType = extractEventType(session.sourceTranscripts.join(" "));
  const datePhrase = extractDatePhrase(session.sourceTranscripts.join(" "));
  if (!eventType) {
    session.missingFields = ["eventType"];
    return response(session, "Is this for a quote, inspection, service visit, follow-up, or job?");
  }
  if (!datePhrase && session.draftType === "calendar_event") {
    session.missingFields = ["date"];
    return response(session, "What date and time should I use?");
  }

  const client = selectedClient(session, clients);
  const job = selectedJob(session, jobs);
  session.missingFields = [];
  if (session.draftType === "job") {
    const estimate = extractEstimate(session.sourceTranscripts.join(" "));
    session.draftPayload = {
      ...(session.selectedJobId ? { jobId: session.selectedJobId } : {}),
      title: job?.name || `${client?.name ?? "Client"} ${eventType}`,
      ...(session.selectedClientId ? { clientId: session.selectedClientId } : {}),
      ...(!session.selectedClientId && session.draftPayload.clientName ? { clientName: session.draftPayload.clientName } : {}),
      status: "Scheduled",
      date: datePhrase,
      notes: session.sourceTranscripts.join("\n"),
      ...(estimate !== undefined ? { estimatedValue: estimate } : {}),
    };
    return response(session, "I have enough information. Please review this job draft.", true);
  }

  session.draftPayload = {
    title: `${client?.name ?? "Client"} ${eventType}`,
    ...(session.selectedClientId ? { clientId: session.selectedClientId } : {}),
    ...(!session.selectedClientId && session.draftPayload.clientName ? { clientName: session.draftPayload.clientName } : {}),
    ...(session.selectedJobId ? { jobId: session.selectedJobId } : {}),
    date: datePhrase,
    notes: session.sourceTranscripts.join("\n"),
  };
  return response(session, "I have enough information. Please review this calendar draft.", true);
}
