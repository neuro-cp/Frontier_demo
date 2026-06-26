export type JobStatus =
  | "Lead"
  | "Quoted"
  | "Scheduled"
  | "Completed"
  | "Paid";

export type JobMaterial = {
  name: string;
  quantity: number;
};

export type Job = {
  id: string;
  workspaceId: string;
  name: string;
  clientId?: string;
  client: string;
  status: JobStatus;
  value: string;
  date: string;
  time?: string;
  completedAt?: string;
  materials: JobMaterial[];
  notes?: string;
};
