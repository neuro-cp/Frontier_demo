export type AiSourceType = "ocr" | "transcript";

export type InterpretationConfidence = number;

export type AiActionType =
  | "create_client"
  | "update_client"
  | "create_job"
  | "update_job"
  | "create_invoice"
  | "update_invoice"
  | "create_expense"
  | "update_inventory"
  | "create_calendar_event";

export type InterpretationWarningCode =
  | "low_confidence"
  | "missing_required_field"
  | "invalid_payload"
  | "possible_duplicate"
  | "workspace_unverified"
  | "permission_unverified"
  | "unsupported_intent"
  | "needs_human_review";

export type InterpretationWarning = {
  code: InterpretationWarningCode;
  message: string;
  path?: string;
};

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type DraftPayload = Record<string, JsonValue>;

export type SuggestedAction<TPayload extends DraftPayload = DraftPayload> = {
  type: AiActionType;
  confidence: InterpretationConfidence;
  payload: TPayload;
  warnings?: InterpretationWarning[];
};

export type InterpretationInput = {
  workspaceId: string;
  sourceId?: string;
  text: string;
  sourceType: AiSourceType;
};

export type InterpretationResult = {
  sourceType: AiSourceType;
  sourceId?: string;
  workspaceId: string;
  confidence: InterpretationConfidence;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
};

export type InterpretationProvider = {
  name: string;
  interpret(input: InterpretationInput): Promise<InterpretationResult>;
};
