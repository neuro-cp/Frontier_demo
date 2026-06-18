"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { moneyStringToCents, centsToMoneyString } from "@/lib/db/money";
import type { Job, JobMaterial } from "@/lib/jobTypes";

type Setter<T> = (value: T | ((current: T) => T)) => void;
type Options = { isSignedIn: boolean; supabase: SupabaseClient | null; localJobs: Job[]; setLocalJobs: Setter<Job[]> };

type DbJob = { id: string; workspace_id: string; client_id: string | null; client_name_snapshot: string | null; name: string; status: Job["status"]; estimated_value_cents: number; scheduled_date: string | null; notes: string | null; job_materials?: DbMaterial[] };
type DbMaterial = { id?: string; workspace_id: string; job_id: string; name: string; quantity: number };

function dbToJob(row: DbJob): Job {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    clientId: row.client_id ?? undefined,
    client: row.client_name_snapshot ?? "",
    name: row.name,
    status: row.status,
    value: centsToMoneyString(row.estimated_value_cents),
    date: row.scheduled_date ?? "",
    notes: row.notes ?? "",
    materials: (row.job_materials ?? []).map((m) => ({ name: m.name, quantity: Number(m.quantity) })),
  };
}

function jobToDb(job: Job) {
  return {
    id: job.id,
    workspace_id: job.workspaceId,
    client_id: job.clientId ?? null,
    client_name_snapshot: job.client,
    name: job.name,
    status: job.status,
    estimated_value_cents: moneyStringToCents(job.value),
    scheduled_date: job.date || null,
    notes: job.notes ?? null,
  };
}

export function createJobsRepository({ isSignedIn, supabase, localJobs, setLocalJobs }: Options) {
  const useDb = isSignedIn && supabase;
  function materialsToRpcPayload(materials: JobMaterial[]) {
    return materials.map((material) => ({
      name: material.name,
      quantity: material.quantity,
    }));
  }
  async function saveJobWithMaterials(job: Job) {
    if (!useDb) return job;
    const { error } = await supabase.rpc("upsert_job_with_materials", {
      job_payload: jobToDb(job),
      materials_payload: materialsToRpcPayload(job.materials ?? []),
    });
    if (error) throw new Error(error.message || "Unable to save job.");
    return job;
  }
  return {
    async getJobs(workspaceId: string) {
      if (!useDb) return localJobs.filter((j) => j.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("jobs").select("*, job_materials(*)").eq("workspace_id", workspaceId).order("scheduled_date", { ascending: true });
      if (error) throw new Error(error.message || "Unable to load jobs.");
      return ((data ?? []) as DbJob[]).map(dbToJob);
    },
    async getJobById(id: string, workspaceId?: string) {
      if (!useDb) return localJobs.find((j) => j.id === id && (!workspaceId || j.workspaceId === workspaceId)) ?? null;
      if (!isUuid(id)) return null;
      if (workspaceId && !isUuid(workspaceId)) return null;
      let query = supabase.from("jobs").select("*, job_materials(*)").eq("id", id);
      if (workspaceId) query = query.eq("workspace_id", workspaceId);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message || "Unable to load job.");
      return data ? dbToJob(data as DbJob) : null;
    },
    async createJob(job: Job) {
      if (!useDb) return setLocalJobs((c) => [...c, job]), job;
      assertUuid(job.workspaceId, "Workspace");
      return saveJobWithMaterials(job);
    },
    async updateJob(id: string, job: Job) {
      if (!useDb) return setLocalJobs((c) => c.map((j) => (j.id === id ? job : j))), job;
      assertUuid(job.workspaceId, "Workspace");
      assertUuid(id, "Job");
      return saveJobWithMaterials({ ...job, id });
    },
    async deleteJob(id: string) {
      if (!useDb) return setLocalJobs((c) => c.filter((j) => j.id !== id)), true;
      if (!isUuid(id)) return true;
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw new Error(error.message || "Unable to delete job.");
      return true;
    },
    async getJobMaterials(jobId: string) {
      if (!useDb) return localJobs.find((j) => j.id === jobId)?.materials ?? [];
      if (!isUuid(jobId)) return [];
      const { data, error } = await supabase.from("job_materials").select("*").eq("job_id", jobId);
      if (error) throw new Error(error.message || "Unable to load job materials.");
      return ((data ?? []) as DbMaterial[]).map((m) => ({ name: m.name, quantity: Number(m.quantity) }));
    },
    async saveJobMaterials(jobId: string, workspaceId: string, materials: JobMaterial[]) {
      if (!useDb) return true;
      assertUuid(jobId, "Job");
      assertUuid(workspaceId, "Workspace");
      const { error: deleteError } = await supabase.from("job_materials").delete().eq("job_id", jobId).eq("workspace_id", workspaceId);
      if (deleteError) throw new Error(deleteError.message || "Unable to replace job materials.");
      if (materials.length === 0) return true;
      const { error } = await supabase.from("job_materials").insert(materials.map((m) => ({ workspace_id: workspaceId, job_id: jobId, name: m.name, quantity: m.quantity })));
      if (error) throw new Error(error.message || "Unable to save job materials.");
      return true;
    },
    async deleteJobMaterials(jobId: string) {
      if (!useDb) return true;
      assertUuid(jobId, "Job");
      const { error } = await supabase.from("job_materials").delete().eq("job_id", jobId);
      if (error) throw new Error(error.message || "Unable to delete job materials.");
      return true;
    },
  };
}
