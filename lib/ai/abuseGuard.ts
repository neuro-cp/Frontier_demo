import "server-only";

import { createHash } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

const suspiciousPatterns = [
  /delete\s+all/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /wipe\s+(the\s+)?database/i,
  /destroy\s+(all|everything)/i,
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(api\s+keys?|secrets?|passwords?)/i,
  /exfiltrate/i,
];

export type AbuseCheckResult =
  | { ok: true }
  | { ok: false; reason: string; severity: number };

export function checkAiInputForAbuse(text: string): AbuseCheckResult {
  const source = text.trim();
  if (!source) return { ok: true };

  const match = suspiciousPatterns.find((pattern) => pattern.test(source));
  if (!match) return { ok: true };

  return {
    ok: false,
    reason: `Blocked potentially destructive or credential-seeking AI input: ${match.source}`,
    severity: 90,
  };
}

export async function logAiAbuseEvent({
  serviceClient,
  workspaceId,
  userId,
  source,
  text,
  reason,
  severity,
}: {
  serviceClient: SupabaseClient;
  workspaceId?: string | null;
  userId?: string | null;
  source: string;
  text: string;
  reason: string;
  severity: number;
}) {
  const excerpt = text.trim().slice(0, 500);
  const promptHash = createHash("sha256").update(text).digest("hex");
  const { error } = await serviceClient.from("ai_abuse_events").insert({
    workspace_id: workspaceId ?? null,
    user_id: userId ?? null,
    source,
    severity,
    reason,
    prompt_excerpt: excerpt,
    prompt_hash: promptHash,
    status: severity >= 80 ? "restricted" : "flagged",
  });

  if (error) {
    console.error("[ai-abuse] unable to log event", error.message);
  }
}

export async function getActiveAiRestriction(
  serviceClient: SupabaseClient,
  userId: string
) {
  const { data, error } = await serviceClient
    .from("ai_abuse_events")
    .select("id, reason, created_at")
    .eq("user_id", userId)
    .eq("status", "restricted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[ai-abuse] unable to check restrictions", error.message);
    return null;
  }

  return data as { id: string; reason: string; created_at: string } | null;
}

export const aiRestrictionMessage =
  "AI features are temporarily suspended for this account pending safety review. Request reinstatement from account support.";
