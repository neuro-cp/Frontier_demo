import type { AiActionType } from "@/lib/ai/types";

export type PayloadFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "currency"
  | "array"
  | "object";

export type PayloadFieldSchema = {
  type: PayloadFieldType;
  required?: boolean;
};

export type ActionPayloadSchema = {
  actionType: AiActionType;
  requiredFields: string[];
  fields: Record<string, PayloadFieldSchema>;
};

export const CONFIDENCE_THRESHOLDS = {
  reviewDraft: 0.5,
  suggestedAction: 0.65,
  highConfidence: 0.85,
} as const;

export const ACTION_PAYLOAD_SCHEMAS: Record<AiActionType, ActionPayloadSchema> = {
  create_client: {
    actionType: "create_client",
    requiredFields: ["name"],
    fields: {
      name: { type: "string", required: true },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      zip: { type: "string" },
      notes: { type: "string" },
    },
  },
  update_client: {
    actionType: "update_client",
    requiredFields: ["clientId"],
    fields: {
      clientId: { type: "string", required: true },
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
      notes: { type: "string" },
    },
  },
  create_job: {
    actionType: "create_job",
    requiredFields: ["title"],
    fields: {
      title: { type: "string", required: true },
      clientId: { type: "string" },
      date: { type: "date" },
      status: { type: "string" },
      notes: { type: "string" },
      materials: { type: "array" },
    },
  },
  update_job: {
    actionType: "update_job",
    requiredFields: ["jobId"],
    fields: {
      jobId: { type: "string", required: true },
      title: { type: "string" },
      clientId: { type: "string" },
      date: { type: "date" },
      status: { type: "string" },
      notes: { type: "string" },
      materials: { type: "array" },
    },
  },
  create_invoice: {
    actionType: "create_invoice",
    requiredFields: ["lineItems"],
    fields: {
      clientId: { type: "string" },
      jobId: { type: "string" },
      invoiceNumber: { type: "string" },
      status: { type: "string" },
      lineItems: { type: "array", required: true },
      subtotal: { type: "currency" },
      tax: { type: "currency" },
      total: { type: "currency" },
      notes: { type: "string" },
    },
  },
  update_invoice: {
    actionType: "update_invoice",
    requiredFields: ["invoiceId"],
    fields: {
      invoiceId: { type: "string", required: true },
      clientId: { type: "string" },
      jobId: { type: "string" },
      status: { type: "string" },
      lineItems: { type: "array" },
      subtotal: { type: "currency" },
      tax: { type: "currency" },
      total: { type: "currency" },
      notes: { type: "string" },
    },
  },
  create_expense: {
    actionType: "create_expense",
    requiredFields: ["amount"],
    fields: {
      vendor: { type: "string" },
      amount: { type: "currency", required: true },
      date: { type: "date" },
      category: { type: "string" },
      notes: { type: "string" },
      documentId: { type: "string" },
    },
  },
  update_inventory: {
    actionType: "update_inventory",
    requiredFields: ["itemId"],
    fields: {
      itemId: { type: "string", required: true },
      name: { type: "string" },
      quantity: { type: "number" },
      targetQuantity: { type: "number" },
      unit: { type: "string" },
      notes: { type: "string" },
    },
  },
  create_material_allocation: {
    actionType: "create_material_allocation",
    requiredFields: ["materials"],
    fields: {
      jobId: { type: "string" },
      jobName: { type: "string" },
      mode: { type: "string" },
      materials: { type: "array", required: true },
      notes: { type: "string" },
      sourceDocumentId: { type: "string" },
    },
  },
  create_calendar_event: {
    actionType: "create_calendar_event",
    requiredFields: ["title", "date"],
    fields: {
      title: { type: "string", required: true },
      date: { type: "date", required: true },
      clientId: { type: "string" },
      jobId: { type: "string" },
      notes: { type: "string" },
    },
  },
};
