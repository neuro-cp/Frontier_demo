"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
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
  return {
    async getJobs(workspaceId: string) {
      if (!useDb) return localJobs.filter((j) => j.workspaceId === workspaceId);
      const { data, error } = await supabase.from("jobs").select("*, job_materials(*)").eq("workspace_id", workspaceId).order("scheduled_date", { ascending: true });
      if (error) return console.error("Unable to load jobs.", error), [];
      return ((data ?? []) as DbJob[]).map(dbToJob);
    },
    async getJobById(id: string) {
      if (!useDb) return localJobs.find((j) => j.id === id) ?? null;
      const { data, error } = await supabase.from("jobs").select("*, job_materials(*)").eq("id", id).maybeSingle();
      if (error) return console.error("Unable to load job.", error), null;
      return data ? dbToJob(data as DbJob) : null;
    },
    async createJob(job: Job) {
      if (!useDb) return setLocalJobs((c) => [...c, job]), job;
      const { error } = await supabase.from("jobs").insert(jobToDb(job));
      if (error) return console.error("Unable to create job.", error), null;
      await this.saveJobMaterials(job.id, job.workspaceId, job.materials);
      return job;
    },
    async updateJob(id: string, job: Job) {
      if (!useDb) return setLocalJobs((c) => c.map((j) => (j.id === id ? job : j))), job;
      const values = jobToDb(job); delete (values as { id?: string }).id;
      const { error } = await supabase.from("jobs").update(values).eq("id", id).eq("workspace_id", job.workspaceId);
      if (error) return console.error("Unable to update job.", error), null;
      await this.saveJobMaterials(id, job.workspaceId, job.materials);
      return job;
    },
    async deleteJob(id: string) {
      if (!useDb) return setLocalJobs((c) => c.filter((j) => j.id !== id)), true;
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) return console.error("Unable to delete job.", error), false;
      return true;
    },
    async getJobMaterials(jobId: string) {
      if (!useDb) return localJobs.find((j) => j.id === jobId)?.materials ?? [];
      const { data, error } = await supabase.from("job_materials").select("*").eq("job_id", jobId);
      if (error) return console.error("Unable to load job materials.", error), [];
      return ((data ?? []) as DbMaterial[]).map((m) => ({ name: m.name, quantity: Number(m.quantity) }));
    },
    async saveJobMaterials(jobId: string, workspaceId: string, materials: JobMaterial[]) {
      if (!useDb) return true;
      await supabase.from("job_materials").delete().eq("job_id", jobId);
      if (materials.length === 0) return true;
      const { error } = await supabase.from("job_materials").insert(materials.map((m) => ({ workspace_id: workspaceId, job_id: jobId, name: m.name, quantity: m.quantity })));
      if (error) return console.error("Unable to save job materials.", error), false;
      return true;
    },
    async deleteJobMaterials(jobId: string) {
      if (!useDb) return true;
      const { error } = await supabase.from("job_materials").delete().eq("job_id", jobId);
      if (error) return console.error("Unable to delete job materials.", error), false;
      return true;
    },
  };
}
