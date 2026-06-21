"use client";

type ServerMutationResponse<T> = {
  data?: T;
  error?: string;
};

export async function mutateSignedInRecord<T>(
  entity: string,
  operation: "update" | "delete",
  payload: Record<string, unknown>
) {
  const response = await fetch("/api/data/mutate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, operation, payload }),
  });
  const result = (await response.json()) as ServerMutationResponse<T>;

  if (!response.ok) {
    throw new Error(result.error || `Unable to ${operation} ${entity}.`);
  }

  return result.data;
}
