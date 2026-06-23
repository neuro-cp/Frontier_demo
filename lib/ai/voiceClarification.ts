import type { ClientRow } from "@/lib/clientTypes";
import type { Job } from "@/lib/jobTypes";
import type { DraftPayload, SuggestedAction } from "@/lib/ai/types";
import { FRONTIER_COMPACT_AI_PARSER_CONTRACT } from "./parserContract";

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

export const VOICE_CLARIFICATION_CONTRACT =
  FRONTIER_COMPACT_AI_PARSER_CONTRACT;

const CLIENT_NAME_STOPWORDS = new Set([
  "new",
  "create",
  "update",
  "schedule",
  "visit",
  "job",
  "client",
  "customer",
  "appointment",
  "inspection",
  "quote",
  "estimate",
  "service",
  "follow",
  "follow-up",
  "tomorrow",
  "today",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "the",
  "a",
  "an",
  "and",
  "in",
  "on",
  "with",
  "for",
  "her",
  "him",
  "them",
]);

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

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

function isUnsafeClientName(value: string) {
  const normalized = normalize(value);
  if (!normalized) return true;
  const tokens = normalized.split(" ");
  return tokens.every((token) => CLIENT_NAME_STOPWORDS.has(token));
}

export function cleanupVoiceTranscript(input: string, assistantMessages: string[] = []) {
  let text = input
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\bfrom to your to\b/gi, "")
    .replace(/\bfrontier\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const promptEchoes = [
    "tell me what you want to create or update",
    "tell me what you want from to your to create or update",
    "tell me what you want to your to create or update",
    ...assistantMessages,
  ];

  for (const prompt of promptEchoes) {
    const cleanedPrompt = normalize(prompt);
    if (!cleanedPrompt) continue;
    const escaped = cleanedPrompt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = normalize(text).replace(new RegExp(escaped, "gi"), " ");
  }

  const pieces = text
    .split(/\b(?=create |schedule |update |materials )/i)
    .map((piece) => piece.trim())
    .filter(Boolean);
  const uniquePieces = pieces.filter(
    (piece, index) => pieces.findIndex((candidate) => normalize(candidate) === normalize(piece)) === index
  );

  return (uniquePieces.length ? uniquePieces.join(". ") : text)
    .replace(/\b(uh|um|like|please)\b/gi, " ")
    .replace(/\b(\w+)(\s+\1\b)+/gi, "$1")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
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
  const explicitClient =
    normalized.match(/\bcreate\s+(?:a\s+)?new\s+client(?:\s+named)?\s+([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,2}?)(?=\s+(?:and|schedule|visit|on|at|with|for)\b|$)/)?.[1] ??
    normalized.match(/\bschedule\s+(?:a\s+)?(?:visit|appointment|inspection|quote|service visit)?\s*(?:with\s+)?([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,2}?)(?=\s+(?:and|on|at|for|with|visit)\b|$)/)?.[1] ??
    normalized.match(/\bschedule\s+([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,2})/)?.[1];
  if (explicitClient && !isUnsafeClientName(explicitClient)) {
    return explicitClient
      .split(" ")
      .filter((token) => !CLIENT_NAME_STOPWORDS.has(token))
      .join(" ");
  }

  const jobNameMatch = normalized.match(/\b(?:the\s+)?([a-z0-9'-]+)\s+(?:job|client)\b/);
  if (jobNameMatch && !isUnsafeClientName(jobNameMatch[1])) return jobNameMatch[1];

  const forMatch = normalized.match(/\b(?:for|update|schedule|materials for)\s+(?:the\s+)?([a-z0-9'-]+)/);
  if (forMatch && !isUnsafeClientName(forMatch[1])) return forMatch[1];

  return normalized.split(" ").find((part) => part.length > 3 && !CLIENT_NAME_STOPWORDS.has(part)) ?? "";
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextWeekdayDate(dayName: string, now = new Date()) {
  const target = WEEKDAYS.indexOf(dayName.toLowerCase() as (typeof WEEKDAYS)[number]);
  if (target < 0) return "";
  const result = new Date(now);
  const delta = (target - result.getDay() + 7) % 7 || 7;
  result.setDate(result.getDate() + delta);
  return dateOnly(result);
}

function resolveDayOfMonth(day: number, weekday?: string, now = new Date()) {
  const candidates = [0, 1, -1].map((monthOffset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
    return date;
  });
  const matchingWeekday = weekday
    ? candidates.find((date) => WEEKDAYS[date.getDay()] === weekday.toLowerCase())
    : undefined;
  const future = candidates.find((date) => date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  return dateOnly(matchingWeekday ?? future ?? candidates[0]);
}

function extractTimePhrase(text: string) {
  const numeric = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (numeric) {
    return `${numeric[1]}${numeric[2] ? `:${numeric[2]}` : ""} ${numeric[3].toUpperCase()}`;
  }
  const loose = text.match(/\bat\s+(\d{1,2})(?!\d)\b/i);
  return loose ? `${loose[1]}:00` : "";
}

function extractDateInfo(text: string) {
  const iso = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (iso) return { phrase: iso, resolvedDate: iso, time: extractTimePhrase(text), needsConfirmation: false };

  const lowered = text.toLowerCase();
  const today = new Date();
  if (/\btoday\b/.test(lowered)) return { phrase: "today", resolvedDate: dateOnly(today), time: extractTimePhrase(text), needsConfirmation: false };
  if (/\btomorrow\b/.test(lowered)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { phrase: "tomorrow", resolvedDate: dateOnly(tomorrow), time: extractTimePhrase(text), needsConfirmation: false };
  }

  const weekday = WEEKDAYS.find((day) => lowered.includes(day));
  const dayOfMonth = lowered.match(/\b(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/)?.[1];
  if (weekday && dayOfMonth) {
    const resolvedDate = resolveDayOfMonth(Number(dayOfMonth), weekday);
    return {
      phrase: `${weekday} the ${dayOfMonth}`,
      resolvedDate,
      time: extractTimePhrase(text),
      needsConfirmation: true,
    };
  }
  if (weekday) {
    const resolvedDate = nextWeekdayDate(weekday);
    return { phrase: weekday, resolvedDate, time: extractTimePhrase(text), needsConfirmation: true };
  }
  if (dayOfMonth) {
    const resolvedDate = resolveDayOfMonth(Number(dayOfMonth));
    return { phrase: `the ${dayOfMonth}`, resolvedDate, time: extractTimePhrase(text), needsConfirmation: true };
  }
  return { phrase: "", resolvedDate: "", time: extractTimePhrase(text), needsConfirmation: false };
}

function extractEventType(text: string) {
  const match = text.match(/\b(quote|inspection|service visit|follow-up|follow up|job|visit)\b/i);
  return match?.[1]?.replace("follow up", "follow-up") ?? "";
}

function extractEstimate(text: string) {
  const wordAmount = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+hundred\b/i);
  if (wordAmount) return NUMBER_WORDS[wordAmount[1].toLowerCase()] * 100;
  const match = text.match(/\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks)?/i);
  return match ? Number(match[1]) : undefined;
}

function extractPhone(text: string) {
  return text.match(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/)?.[0] ?? "";
}

function extractEmail(text: string) {
  return text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] ?? "";
}

function extractIsoDate(text: string) {
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
}

function parseMaterials(text: string) {
  const normalized = text.replace(/\btwo\b/gi, "2").replace(/\bone\b/gi, "1");
  const matches = [...normalized.matchAll(/(\d+)\s+([a-z][a-z0-9 -]*?)(?=\s+and\s+|\s*,|\.|$)/gi)];
  return matches
    .map((match) => ({
      quantity: Number(match[1]),
      name: match[2].trim(),
    }))
    .filter((material) => !/^(am|pm|at|rd|st|nd|th)\b/i.test(material.name));
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
  return [
    client.name,
    client.address,
    [client.city, client.state, client.zip].filter(Boolean).join(", "),
    client.phone,
    client.email,
  ]
    .filter(Boolean)
    .join(" - ");
}

function jobLabel(job: Job) {
  return [
    job.name,
    job.status,
    [job.date, job.time].filter(Boolean).join(" "),
    job.client,
  ]
    .filter(Boolean)
    .join(" - ");
}

function askClientSelection(session: VoiceSessionState, name: string) {
  if (session.candidateClients.length === 1) {
    const client = session.candidateClients[0];
    return response(
      session,
      `I found 1 possible client match for ${name || client.name}: ${clientLabel(client)}. Would you like to: 1. Use this client, 2. Create a new client named ${name || client.name}, or 3. Search again?`
    );
  }

  return response(
    session,
    `I found multiple possible client matches. Which client should I use? ${session.candidateClients.map((client, index) => `${index + 1}. ${clientLabel(client)}`).join(", ")}. You can also say create new client or search again.`
  );
}

function askJobSelection(session: VoiceSessionState) {
  if (session.candidateJobs.length === 1) {
    const job = session.candidateJobs[0];
    return response(
      session,
      `I found 1 possible job match: ${jobLabel(job)}. Would you like to: 1. Use this job, 2. Create a new job draft, or 3. Search again?`
    );
  }

  return response(
    session,
    `I found multiple possible job matches. Which job should I use? ${session.candidateJobs.map((job, index) => `${index + 1}. ${jobLabel(job)}`).join(", ")}.`
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
  const text = cleanupVoiceTranscript(transcript, current.assistantMessages);
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

  if (session.missingFields.includes("clientContact")) {
    const phone = extractPhone(text);
    const email = extractEmail(text);
    const skip = lower.includes("skip") || lower.includes("later") || lower.includes("no");
    session.draftPayload = {
      ...session.draftPayload,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
    };
    if (skip || phone || email) {
      session.missingFields = [];
    } else {
      return response(session, "You can provide address, phone, or email, or say skip for now.");
    }
  }

  if (session.missingFields.includes("dateConfirmation")) {
    const confirmedDate = extractIsoDate(text);
    if (confirmedDate) {
      session.draftPayload = { ...session.draftPayload, date: confirmedDate, dateConfirmed: true };
      session.missingFields = [];
    } else if (lower.includes("yes") || lower.includes("correct") || lower.includes("confirm")) {
      session.draftPayload = { ...session.draftPayload, dateConfirmed: true };
      session.missingFields = [];
    } else {
      return response(session, "Please confirm the exact date as YYYY-MM-DD, or say a clearer date.");
    }
  }

  if (session.missingFields.includes("materialCosts")) {
    const amount = extractEstimate(text);
    const costType = lower.includes("per") || lower.includes("unit") ? "unit" : lower.includes("total") ? "total" : "";
    if (amount !== undefined && costType) {
      session.draftPayload = {
        ...session.draftPayload,
        materialCostNote: text,
        materialCostType: costType,
      };
      session.missingFields = [];
    } else {
      return response(session, "Is that total cost or cost per unit? Include the amount.");
    }
  }

  if (session.missingFields.includes("replaceConfirmation")) {
    if (lower.includes("yes") || lower.includes("confirm") || lower.includes("replace")) {
      session.draftPayload = { ...session.draftPayload, replaceConfirmed: true };
      session.missingFields = [];
    } else {
      session.materialMode = "";
      session.missingFields = ["materialMode"];
      return response(session, "What material mode should I use: append, merge, or replace?");
    }
  }

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
      session.missingFields = ["clientContact"];
      session.draftPayload = { ...session.draftPayload, clientName: existingName };
      return response(session, `Client name will be ${existingName}. Would you like to provide address, phone, or email now, or skip for now?`);
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
  const isMaterial = lower.includes("material");
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
    if (!session.draftPayload.materialCostNote) {
      session.missingFields = ["materialCosts"];
      return response(session, `What is the cost of ${materials.map((material) => material.name).join(" and ")}? Say whether it is total cost or cost per unit.`);
    }
    if (session.materialMode === "replace" && !session.draftPayload.replaceConfirmed) {
      session.missingFields = ["replaceConfirmation"];
      return response(session, "Replacing materials will overwrite the current material plan. Please confirm replace, or choose append or merge.");
    }
    session.missingFields = [];
    session.draftPayload = {
      jobId: session.selectedJobId,
      mode: session.materialMode,
      materials,
      ...(session.draftPayload.materialCostNote ? { materialCostNote: session.draftPayload.materialCostNote } : {}),
      ...(session.draftPayload.materialCostType ? { materialCostType: session.draftPayload.materialCostType } : {}),
      clarificationHistory: session.sourceTranscripts,
      notes: session.sourceTranscripts.join("\n"),
    };
    return response(session, "I have enough information. Please review this material allocation draft.", true);
  }

  const eventType = extractEventType(session.sourceTranscripts.join(" "));
  const dateInfo = extractDateInfo(session.sourceTranscripts.join(" "));
  if (!eventType) {
    session.missingFields = ["eventType"];
    return response(session, "Is this for a quote, inspection, service visit, follow-up, or job?");
  }
  if (!dateInfo.resolvedDate && session.draftType === "calendar_event") {
    session.missingFields = ["date"];
    return response(session, "What date and time should I use?");
  }
  if (dateInfo.resolvedDate && dateInfo.needsConfirmation && !session.draftPayload.dateConfirmed) {
    session.draftPayload = { ...session.draftPayload, date: dateInfo.resolvedDate, time: dateInfo.time };
    session.missingFields = ["dateConfirmation"];
    return response(session, `I heard ${dateInfo.phrase}, which resolves to ${dateInfo.resolvedDate}${dateInfo.time ? ` at ${dateInfo.time}` : ""}. Is that correct? If not, answer with YYYY-MM-DD.`);
  }

  const client = selectedClient(session, clients);
  const job = selectedJob(session, jobs);
  const finalDate = typeof session.draftPayload.date === "string" ? session.draftPayload.date : dateInfo.resolvedDate;
  const finalTime = typeof session.draftPayload.time === "string" ? session.draftPayload.time : dateInfo.time;
  session.missingFields = [];
  if (session.draftType === "job") {
    const estimate = extractEstimate(session.sourceTranscripts.join(" "));
    session.draftPayload = {
      ...(session.selectedJobId ? { jobId: session.selectedJobId } : {}),
      title: job?.name || `${client?.name ?? "Client"} ${eventType}`,
      ...(session.selectedClientId ? { clientId: session.selectedClientId } : {}),
      ...(!session.selectedClientId && session.draftPayload.clientName ? { clientName: session.draftPayload.clientName } : {}),
      status: "Scheduled",
      date: finalDate,
      ...(finalTime ? { time: finalTime } : {}),
      clarificationHistory: session.sourceTranscripts,
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
    date: finalDate,
    ...(finalTime ? { time: finalTime } : {}),
    clarificationHistory: session.sourceTranscripts,
    notes: session.sourceTranscripts.join("\n"),
  };
  return response(session, "I have enough information. Please review this calendar draft.", true);
}
