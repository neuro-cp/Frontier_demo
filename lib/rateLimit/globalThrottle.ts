import "server-only";

import { RateLimitError, readPositiveInt } from "@/lib/rateLimit/policy";

type QueuedTask<T> = {
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  enqueuedAt: number;
};

export class GlobalThrottle {
  private queue: QueuedTask<unknown>[] = [];
  private isRunning = false;
  private lastRunAt = 0;

  constructor(
    private readonly options: {
      minIntervalMs: () => number;
      maxQueueSize: () => number;
      maxWaitMs: () => number;
      busyMessage: string;
    }
  ) {}

  enqueue<T>(run: () => Promise<T>) {
    if (this.queue.length >= this.options.maxQueueSize()) {
      throw new RateLimitError(this.options.busyMessage);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        run,
        resolve: resolve as (value: unknown) => void,
        reject,
        enqueuedAt: Date.now(),
      });
      void this.drain();
    });
  }

  private async drain() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      while (this.queue.length > 0) {
        const task = this.queue.shift();
        if (!task) continue;

        if (Date.now() - task.enqueuedAt > this.options.maxWaitMs()) {
          task.reject(new RateLimitError(this.options.busyMessage));
          continue;
        }

        const elapsed = Date.now() - this.lastRunAt;
        const delay = this.options.minIntervalMs() - elapsed;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        this.lastRunAt = Date.now();

        try {
          task.resolve(await task.run());
        } catch (error) {
          task.reject(error);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}

export const nominatimThrottle = new GlobalThrottle({
  minIntervalMs: () => Math.max(readPositiveInt("GEOCODE_RATE_LIMIT_MS", 1100), 1100),
  maxQueueSize: () => 5,
  maxWaitMs: () => 10000,
  busyMessage: "Geocoding is busy. Try again shortly.",
});
