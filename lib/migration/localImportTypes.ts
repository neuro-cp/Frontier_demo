"use client";

export type LocalImportCounts = {
  clients: number;
  jobs: number;
  jobMaterials: number;
  invoices: number;
  invoiceLineItems: number;
  expenses: number;
  inventory: number;
  clientCalendarEvents: number;
  documents: number;
  routes: number;
  workspaceSettings: number;
};

export type LocalImportSummary = {
  created: number;
  skipped: number;
  failed: number;
  warnings: string[];
};
