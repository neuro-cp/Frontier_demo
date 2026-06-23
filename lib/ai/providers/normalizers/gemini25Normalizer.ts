import { isAllowedAiActionType } from "@/lib/ai/actionDrafts";
import type { SuggestedAction } from "@/lib/ai/types";

type RawAiObject = { actions?: unknown };

export function rawGemini25ActionArray(raw: RawAiObject) {
  const candidates = [
    raw.actions,
    (raw as { actionDrafts?: unknown }).actionDrafts,
    (raw as { suggestedActions?: unknown }).suggestedActions,
    (raw as { drafts?: unknown }).drafts,
    (raw as { reviewDraft?: { actions?: unknown } }).reviewDraft?.actions,
  ];
  return candidates.find(Array.isArray) ?? raw.actions;
}

export function normalizeGemini25Actions(value: unknown): SuggestedAction[] {
  if (!Array.isArray(value)) return [];
  const actions = value.map(normalizeSuggestedAction).filter((action): action is SuggestedAction => {
    return (
      typeof action === "object" &&
      action !== null &&
      typeof (action as SuggestedAction).type === "string" &&
      isAllowedAiActionType((action as SuggestedAction).type) &&
      typeof (action as SuggestedAction).confidence === "number" &&
      typeof (action as SuggestedAction).payload === "object" &&
      (action as SuggestedAction).payload !== null
    );
  });
  return collapseMaterialAllocationActions(actions);
}

export function getGemini25ActionDiagnostics(value: unknown) {
  if (!Array.isArray(value)) {
    return {
      rawActionTypes: [] as string[],
      normalizedActionTypes: [] as string[],
      rejectedActions: [] as Array<{ rawType: string; normalizedType: string; reason: string }>,
    };
  }

  const rejectedActions: Array<{
    rawType: string;
    normalizedType: string;
    reason: string;
  }> = [];
  const normalizedActionTypes: string[] = [];

  for (const rawAction of value) {
    const rawType = rawActionType(rawAction);
    const normalized = normalizeSuggestedAction(rawAction);
    if (typeof normalized !== "object" || normalized === null) {
      rejectedActions.push({ rawType, normalizedType: "", reason: "action was not an object" });
      continue;
    }

    const action = normalized as SuggestedAction;
    const normalizedType = String(action.type ?? "");
    if (!isAllowedAiActionType(normalizedType)) {
      rejectedActions.push({ rawType, normalizedType, reason: "unsupported action type" });
      continue;
    }
    if (typeof action.confidence !== "number") {
      rejectedActions.push({ rawType, normalizedType, reason: "missing numeric confidence" });
      continue;
    }
    if (typeof action.payload !== "object" || action.payload === null) {
      rejectedActions.push({ rawType, normalizedType, reason: "payload was not an object" });
      continue;
    }
    normalizedActionTypes.push(normalizedType);
  }

  return {
    rawActionTypes: value.map(rawActionType).filter(Boolean),
    normalizedActionTypes,
    rejectedActions,
  };
}

function rawActionType(action: unknown) {
  if (typeof action !== "object" || action === null) return "";
  const raw = action as { type?: unknown; action?: unknown; intent?: unknown };
  return String(raw.type ?? raw.action ?? raw.intent ?? "").trim();
}

function normalizeActionType(value: unknown) {
  const type = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (type === "invoice" || type === "invoice_draft" || type === "create_invoice_draft") return "create_invoice";
  if (type === "receipt" || type === "expense" || type === "expense_draft" || type === "create_expense_draft") return "create_expense";
  if (type === "job" || type === "job_draft" || type === "create_job_draft") return "create_job";
  if (type === "material_allocation" || type === "materials" || type === "apply_materials") return "create_material_allocation";
  if (type === "apply_materials_to_job") return "create_material_allocation";
  if (type === "create_inventory_item") return "update_inventory";
  if (type === "create_calendar_item") return "create_calendar_event";
  return type;
}

function normalizeSuggestedAction(action: unknown): unknown {
  if (typeof action !== "object" || action === null) return action;
  const draft = action as {
    type?: unknown;
    action?: unknown;
    intent?: unknown;
    confidence?: unknown;
    payload?: unknown;
    fields?: unknown;
    data?: unknown;
  };
  const type = normalizeActionType(draft.type ?? draft.action ?? draft.intent);
  const explicitPayload = draft.payload ?? draft.fields ?? draft.data;
  const payload =
    typeof explicitPayload === "object" && explicitPayload !== null
      ? ({ ...(explicitPayload as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  if (!Object.keys(payload).length) {
    for (const [key, value] of Object.entries(action as Record<string, unknown>)) {
      if (["type", "action", "intent", "confidence", "payload", "fields", "data"].includes(key)) {
        continue;
      }
      payload[key] = value;
    }
  }

  if (type === "create_invoice") normalizeInvoicePayload(payload);
  if (type === "create_material_allocation") normalizeMaterialAllocationPayload(payload);
  if (type === "create_expense" && !payload.amount) {
    payload.amount = numberValue(payload.total) || numberValue(payload.totalDue);
  }

  return {
    type,
    confidence: typeof draft.confidence === "number" ? draft.confidence : 0.7,
    payload,
  };
}

function normalizeInvoicePayload(payload: Record<string, unknown>) {
  copyFirstStringAlias(payload, "invoiceNumber", ["invoice_number", "number"]);
  copyFirstStringAlias(payload, "invoiceDate", ["invoice_date", "date", "issuedDate"]);
  copyFirstStringAlias(payload, "dueDate", ["due_date", "paymentDueDate"]);
  copyFirstStringAlias(payload, "clientName", ["customerName", "billToName", "bill_to_name"]);
  copyFirstStringAlias(payload, "billToName", ["clientName", "customerName", "bill_to_name"]);
  copyFirstStringAlias(payload, "billToCompany", ["customerCompany", "bill_to_company"]);
  copyFirstStringAlias(payload, "billToAddress", ["address", "clientAddress", "customerAddress", "bill_to_address"]);
  copyFirstStringAlias(payload, "billToCity", ["city", "clientCity", "customerCity", "bill_to_city"]);
  copyFirstStringAlias(payload, "billToState", ["state", "clientState", "customerState", "bill_to_state"]);
  copyFirstStringAlias(payload, "billToZip", ["zip", "postalCode", "clientZip", "customerZip", "bill_to_zip"]);
  copyFirstStringAlias(payload, "billToPhone", ["phone", "clientPhone", "customerPhone", "bill_to_phone"]);
  copyFirstStringAlias(payload, "billToEmail", ["email", "clientEmail", "customerEmail", "bill_to_email"]);
  copyFirstStringAlias(payload, "companyName", ["vendorName", "supplierName", "fromCompany"]);
  copyFirstStringAlias(payload, "companyAddress", ["vendorAddress", "supplierAddress", "fromAddress"]);
  copyFirstStringAlias(payload, "companyPhone", ["vendorPhone", "supplierPhone", "fromPhone"]);
  copyFirstStringAlias(payload, "companyEmail", ["vendorEmail", "supplierEmail", "fromEmail"]);
  copyFirstStringAlias(payload, "jobName", ["jobSiteName", "projectName"]);
  copyFirstStringAlias(payload, "jobSiteAddress", ["siteAddress", "projectAddress"]);
  copyFirstStringAlias(payload, "notes", ["paymentInstructions", "terms"]);

  for (const field of ["subtotal", "tax", "discount", "total"]) {
    const value = numberValue(payload[field]);
    if (value || payload[field] === 0 || payload[field] === "0") payload[field] = value;
  }

  payload.lineItems = normalizeInvoiceLineItems(payload);
}

function normalizeInvoiceLineItems(payload: Record<string, unknown>) {
  const value = payload.lineItems ?? payload.items ?? payload.lines;
  if (!Array.isArray(value)) {
    const description = stringValue(payload.description) || stringValue(payload.notes);
    const amount = numberValue(payload.total) || numberValue(payload.amount);
    return amount
      ? [{ description: description || "Visible invoice total", quantity: 1, unitPrice: amount }]
      : [];
  }
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const row = item as Record<string, unknown>;
      const description = stringValue(row.description) || stringValue(row.name) || stringValue(row.item) || "Visible invoice line";
      if (isInvoiceSummaryLine(description)) return null;
      const parsedLine = parseInvoiceLineDescription(description);
      const quantity = numberValue(row.quantity) || numberValue(row.qty) || parsedLine.quantity || 1;
      const unitPrice =
        numberValue(row.unitPrice) ||
        numberValue(row.rate) ||
        numberValue(row.price) ||
        parsedLine.unitPrice ||
        numberValue(row.amount);
      return { description, quantity, unitPrice };
    })
    .filter((item): item is { description: string; quantity: number; unitPrice: number } =>
      Boolean(item && item.description && item.unitPrice > 0)
    );
}

function normalizeMaterialAllocationPayload(payload: Record<string, unknown>) {
  const source = Array.isArray(payload.materials)
    ? payload.materials
    : Array.isArray(payload.materialRows)
      ? payload.materialRows
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.lines)
          ? payload.lines
          : [payload];
  payload.materials = source
    .map(normalizeMaterialRow)
    .filter((item): item is { description: string; quantity: number; unitCost: number; totalCost: number } =>
      Boolean(item)
    );
}

function normalizeMaterialRow(value: unknown) {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  const description =
    stringValue(row.description) ||
    stringValue(row.material_description) ||
    stringValue(row.materialDescription) ||
    stringValue(row.name) ||
    stringValue(row.item) ||
    stringValue(row.material);
  if (!description) return null;

  return {
    description,
    quantity: parseQuantity(row.quantity ?? row.qty),
    unitCost:
      numberValue(row.unitCost) ||
      numberValue(row.unit_price) ||
      numberValue(row.unitPrice) ||
      numberValue(row.price) ||
      numberValue(row.rate),
    totalCost:
      numberValue(row.totalCost) ||
      numberValue(row.total_value) ||
      numberValue(row.totalValue) ||
      numberValue(row.total) ||
      numberValue(row.amount),
  };
}

function collapseMaterialAllocationActions(actions: SuggestedAction[]) {
  const materialActions = actions.filter((action) => action.type === "create_material_allocation");
  if (materialActions.length <= 1) return actions;

  const materials = materialActions.flatMap((action) => {
    const rows = (action.payload as Record<string, unknown>).materials;
    return Array.isArray(rows) ? rows : [];
  });
  const firstMaterialAction = materialActions[0];
  const mergedMaterialAction: SuggestedAction = {
    ...firstMaterialAction,
    confidence: Math.max(...materialActions.map((action) => action.confidence)),
    payload: { ...firstMaterialAction.payload, materials },
  };

  let inserted = false;
  return actions.flatMap((action) => {
    if (action.type !== "create_material_allocation") return [action];
    if (inserted) return [];
    inserted = true;
    return [mergedMaterialAction];
  });
}

function isInvoiceSummaryLine(description: string) {
  const normalized = description.trim().toLowerCase();
  return (
    normalized === "tax" ||
    normalized.startsWith("tax ") ||
    normalized.includes("tax (") ||
    normalized.includes("discount") ||
    normalized.includes("subtotal") ||
    normalized.includes("total due") ||
    normalized === "total"
  );
}

function parseInvoiceLineDescription(description: string) {
  const match = description.match(/-\s*(\d+(?:\.\d+)?)\s*-\s*\$?(\d+(?:\.\d+)?)/);
  return {
    quantity: match ? Number(match[1]) : 0,
    unitPrice: match ? Number(match[2]) : 0,
  };
}

function copyFirstStringAlias(payload: Record<string, unknown>, target: string, aliases: string[]) {
  if (stringValue(payload[target])) return;
  for (const alias of aliases) {
    const value = stringValue(payload[alias]);
    if (value) {
      payload[target] = value;
      return;
    }
  }
}

function parseQuantity(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.match(/\d+(?:\.\d+)?/)?.[0] ?? "");
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[$,%\s,()]/g, ""));
    return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
  }
  return 0;
}
