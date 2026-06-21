import "server-only";

export class RateLimitError extends Error {
  status: number;

  constructor(message: string, status = 429) {
    super(message);
    this.name = "RateLimitError";
    this.status = status;
  }
}

export function readPositiveInt(name: string, fallback: number) {
  const value = Number(process.env[name] ?? "");
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function getUtcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
