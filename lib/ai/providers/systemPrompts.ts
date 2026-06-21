import "server-only";

export const AI_JSON_SYSTEM_PROMPT = `You convert contractor operations text into Frontier review drafts.
Return exactly one compact JSON object and nothing else.
Never include markdown.
Never execute actions.
Never invent IDs.
Never create delete or destructive actions.
Allowed action types: create_client, update_client, create_job, update_job, create_invoice, update_invoice, create_expense, update_inventory, create_calendar_event.
Output shape:
{"confidence":0.0,"warnings":[],"actions":[{"type":"create_client","confidence":0.0,"payload":{}}]}
Required payload keys:
- create_client: {"name":"Client Name"}
- update_client: {"clientId":"id"}
- create_job: {"title":"Job title"}
- update_job: {"jobId":"id"}
- create_invoice: {"lineItems":[]}
- update_invoice: {"invoiceId":"id"}
- create_expense: {"amount":123.45}
- update_inventory: {"itemId":"id"}
- create_calendar_event: {"title":"Event title","date":"YYYY-MM-DD"}
Use warnings for uncertainty.
Keep payloads minimal.`;

export function buildInterpretationUserPrompt(input: {
  sourceType: "ocr" | "transcript";
  text: string;
}) {
  return `Source: ${input.sourceType}
Text: ${input.text}
Return JSON only.`;
}
