import type { Job } from "@/lib/jobTypes";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type JobActionsRepository = {
  createJob: (job: Job) => Promise<Job | null>;
  updateJob: (jobId: string, job: Job) => Promise<Job | null>;
  deleteJob: (jobId: string, workspaceId?: string) => Promise<boolean>;
};

function validateJob(job: Job) {
  return {
    ...job,
    workspaceId: requireText(job.workspaceId, "Workspace"),
    name: requireText(job.name, "Job name"),
  };
}

export async function createJobAction(
  repository: JobActionsRepository,
  job: Job
): Promise<ActionResult<Job>> {
  try {
    const created = await repository.createJob(validateJob(job));
    return created ? ok(created) : fail("Unable to create job.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create job.");
  }
}

export async function updateJobAction(
  repository: JobActionsRepository,
  job: Job
): Promise<ActionResult<Job>> {
  try {
    requireText(job.id, "Job");
    const updated = await repository.updateJob(job.id, validateJob(job));
    return updated ? ok(updated) : fail("Unable to update job.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update job.");
  }
}

export async function deleteJobAction(
  repository: JobActionsRepository,
  jobId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteJob(requireText(jobId, "Job"), workspaceId);
    return deleted ? ok(true) : fail("Unable to delete job.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete job.");
  }
}

export const createJob = createJobAction;
export const updateJob = updateJobAction;
export const deleteJob = deleteJobAction;
