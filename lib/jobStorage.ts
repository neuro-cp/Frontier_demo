import { jobs as defaultJobs } from "@/lib/jobs";

export function getStoredJobs() {
  if (typeof window === "undefined") {
    return defaultJobs;
  }

  const savedJobs = localStorage.getItem("frontier-jobs");

  if (!savedJobs) {
    return defaultJobs;
  }

  try {
    return JSON.parse(savedJobs);
  } catch {
    return defaultJobs;
  }
}

export function saveStoredJobs(jobs: typeof defaultJobs) {
  localStorage.setItem("frontier-jobs", JSON.stringify(jobs));
}