import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobs";

export function getStoredJobs() {
  return readStoredJson(storageKeys.jobs, [] as Job[]);
}

export function saveStoredJobs(jobs: Job[]) {
  writeStoredJson(storageKeys.jobs, jobs);
}
