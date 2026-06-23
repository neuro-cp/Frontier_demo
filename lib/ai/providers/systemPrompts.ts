import "server-only";

import { FRONTIER_COMPACT_AI_PARSER_CONTRACT } from "@/lib/ai/parserContract";

export const AI_JSON_SYSTEM_PROMPT =
  `${FRONTIER_COMPACT_AI_PARSER_CONTRACT} Allowed actions: create_client, update_client, create_job, update_job, create_invoice, update_invoice, create_expense, update_inventory, create_material_allocation, create_calendar_event. No delete/destructive actions. Receipts -> create_expense. Vendor quotes -> update_inventory. Material lists/sticky notes -> create_material_allocation. Required JSON: {"confidence":0,"warnings":[],"actions":[{"type":"create_client","confidence":0,"payload":{}}]}` as const;

export function buildInterpretationUserPrompt(input: {
  sourceType: "ocr" | "transcript";
  text: string;
}) {
  return `Source: ${input.sourceType}
Text: ${input.text}
Return JSON only.`;
}

export function buildImageAnalysisUserPrompt(input: {
  mimeType: string;
  sourceLabel?: string;
}) {
  return `Source: image
File: ${input.sourceLabel || "uploaded image"}
MIME: ${input.mimeType}
Identify visible text, receipts/invoices, jobsite notes, materials, quantities, vendor/SKU if visible, damage/condition notes, and equipment/material objects.
Return JSON only.`;
}
