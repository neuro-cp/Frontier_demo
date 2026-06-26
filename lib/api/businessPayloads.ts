import "server-only";

const CLIENT_FIELDS = [
  "id",
  "workspace_id",
  "name",
  "status",
  "balance_cents",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "zip",
  "notes",
  "latitude",
  "longitude",
] as const;

const INVENTORY_FIELDS = [
  "id",
  "workspace_id",
  "name",
  "current_qty",
  "target_qty",
  "unit",
  "notes",
] as const;

const MATERIAL_CATALOG_FIELDS = [
  "id",
  "workspace_id",
  "inventory_item_id",
  "name",
  "description",
  "category",
  "unit",
  "default_cost_cents",
] as const;

const MATERIAL_VENDOR_SKU_FIELDS = [
  "id",
  "workspace_id",
  "material_id",
  "vendor_name",
  "sku",
  "unit_cost_cents",
  "notes",
] as const;

const EXPENSE_FIELDS = [
  "id",
  "workspace_id",
  "description",
  "category",
  "amount_cents",
  "expense_date",
  "notes",
] as const;

const DOCUMENT_FIELDS = [
  "id",
  "workspace_id",
  "client_id",
  "job_id",
  "invoice_id",
  "name",
  "detected_type",
  "extraction_status",
  "file_name",
  "storage_bucket",
  "storage_path",
  "mime_type",
  "size_bytes",
  "notes",
  "uploaded_by",
  "extracted_text",
  "extracted_json",
  "document_type",
  "confidence",
  "ocr_status",
  "ocr_error",
  "ocr_retry_count",
  "ocr_started_at",
  "ocr_completed_at",
  "ocr_provider",
  "ocr_metadata",
  "ai_review_draft_id",
  "image_status",
  "image_error",
  "image_retry_count",
  "image_started_at",
  "image_completed_at",
  "image_provider",
  "image_metadata",
  "original_file_name",
  "original_mime_type",
  "original_size_bytes",
  "normalized_file_name",
  "normalized_mime_type",
  "normalized_size_bytes",
  "normalization_status",
] as const;

const CALENDAR_FIELDS = [
  "id",
  "workspace_id",
  "client_id",
  "client_name_snapshot",
  "title",
  "event_date",
  "event_time",
  "notes",
] as const;

const JOB_FIELDS = [
  "id",
  "workspace_id",
  "client_id",
  "client_name_snapshot",
  "name",
  "status",
  "estimated_value_cents",
  "scheduled_date",
  "scheduled_time",
  "completed_at",
  "notes",
] as const;

const JOB_MATERIAL_FIELDS = [
  "id",
  "workspace_id",
  "job_id",
  "name",
  "quantity",
  "unit_cost_cents",
  "total_cost_cents",
  "notes",
] as const;

const INVOICE_FIELDS = [
  "id",
  "workspace_id",
  "client_id",
  "job_id",
  "invoice_number",
  "invoice_date",
  "due_date",
  "status",
  "company_name",
  "company_address",
  "company_city",
  "company_state",
  "company_zip",
  "company_phone",
  "company_email",
  "bill_to_name",
  "bill_to_company",
  "bill_to_address",
  "bill_to_city",
  "bill_to_state",
  "bill_to_zip",
  "bill_to_phone",
  "bill_to_email",
  "discount_type",
  "discount_value",
  "tax_rate",
  "footer_message",
  "contact_message",
  "notes",
  "paid_at",
  "source_estimate_id",
] as const;

const INVOICE_LINE_FIELDS = [
  "id",
  "workspace_id",
  "invoice_id",
  "description",
  "quantity",
  "unit_price_cents",
  "sort_order",
] as const;

const ROUTE_FIELDS = [
  "id",
  "workspace_id",
  "name",
  "route_date",
  "status",
  "notes",
  "google_maps_url",
  "total_distance_meters",
  "total_duration_seconds",
  "provider",
  "route_path",
  "vehicle_assignment",
  "driver_assignment",
  "route_capacity",
  "route_territory",
  "route_group",
] as const;

const ROUTE_STOP_FIELDS = [
  "id",
  "workspace_id",
  "route_plan_id",
  "client_id",
  "job_id",
  "stop_order",
  "address_snapshot",
  "latitude",
  "longitude",
  "notes",
] as const;

export function pickAllowed(
  record: Record<string, unknown>,
  fields: readonly string[]
) {
  return Object.fromEntries(
    fields
      .filter((field) => record[field] !== undefined)
      .map((field) => [field, record[field]])
  );
}

export function withWorkspace(
  record: Record<string, unknown>,
  workspaceId: string
) {
  return { ...record, workspace_id: workspaceId };
}

export function sanitizeBusinessPayload(
  entity: string,
  record: Record<string, unknown>,
  workspaceId: string
) {
  if (entity === "client") return withWorkspace(pickAllowed(record, CLIENT_FIELDS), workspaceId);
  if (entity === "inventory_item") return withWorkspace(pickAllowed(record, INVENTORY_FIELDS), workspaceId);
  if (entity === "material_catalog_item") return withWorkspace(pickAllowed(record, MATERIAL_CATALOG_FIELDS), workspaceId);
  if (entity === "material_vendor_sku") return withWorkspace(pickAllowed(record, MATERIAL_VENDOR_SKU_FIELDS), workspaceId);
  if (entity === "expense") return withWorkspace(pickAllowed(record, EXPENSE_FIELDS), workspaceId);
  if (entity === "document") return withWorkspace(pickAllowed(record, DOCUMENT_FIELDS), workspaceId);
  if (entity === "calendar_event") return withWorkspace(pickAllowed(record, CALENDAR_FIELDS), workspaceId);
  if (entity === "job") return withWorkspace(pickAllowed(record, JOB_FIELDS), workspaceId);
  if (entity === "job_material") return withWorkspace(pickAllowed(record, JOB_MATERIAL_FIELDS), workspaceId);
  if (entity === "invoice") return withWorkspace(pickAllowed(record, INVOICE_FIELDS), workspaceId);
  if (entity === "invoice_line") return withWorkspace(pickAllowed(record, INVOICE_LINE_FIELDS), workspaceId);
  if (entity === "route_plan") return withWorkspace(pickAllowed(record, ROUTE_FIELDS), workspaceId);
  if (entity === "route_stop") return withWorkspace(pickAllowed(record, ROUTE_STOP_FIELDS), workspaceId);
  return {};
}

export function withoutWorkspaceKeys(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([key]) => key !== "id" && key !== "workspace_id"
    )
  );
}
