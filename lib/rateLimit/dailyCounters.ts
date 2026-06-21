import "server-only";

import { getUtcDayKey, RateLimitError } from "@/lib/rateLimit/policy";

type CounterRecord = {
  day: string;
  count: number;
};

const counters = new Map<string, CounterRecord>();

export function checkDailyLimit(key: string, limit: number, message: string) {
  const day = getUtcDayKey();
  const counter = counters.get(key);
  const nextCount = counter?.day === day ? counter.count + 1 : 1;

  if (nextCount > limit) {
    throw new RateLimitError(message);
  }

  counters.set(key, { day, count: nextCount });
}

export function checkUserAndWorkspaceDailyLimits({
  service,
  userId,
  workspaceId,
  userLimit,
  workspaceLimit,
}: {
  service: string;
  userId: string;
  workspaceId: string;
  userLimit: number;
  workspaceLimit: number;
}) {
  checkDailyLimit(
    `${service}:user:${userId}`,
    userLimit,
    "Daily request limit reached. Try again tomorrow."
  );
  checkDailyLimit(
    `${service}:workspace:${workspaceId}`,
    workspaceLimit,
    "Workspace daily request limit reached. Try again tomorrow."
  );
}
