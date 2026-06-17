import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";
import { jobs as defaultJobs } from "@/lib/jobs";

export function getStoredJobs() {
  return readStoredJson(storageKeys.jobs, defaultJobs);
}

export function saveStoredJobs(jobs: typeof defaultJobs) {
  writeStoredJson(storageKeys.jobs, jobs);
}
