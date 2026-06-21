"use client";

type ServerCreateResponse<T> = {
  data?: T;
  error?: string;
};

export async function createSignedInRecord<T>(
  entity: string,
  payload: Record<string, unknown>
) {
  const response = await fetch("/api/data/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, payload }),
  });
  const result = (await response.json()) as ServerCreateResponse<T>;

  if (!response.ok || !result.data) {
    throw new Error(result.error || `Unable to create ${entity}.`);
  }

  return result.data;
}
