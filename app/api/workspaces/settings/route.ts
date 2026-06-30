import { NextRequest, NextResponse } from "next/server";

import { geocodeAddress } from "@/lib/geocoding/provider";
import { GeocodeProviderError } from "@/lib/geocoding/types";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type WorkspaceSettingsPayload = {
  workspaceId?: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  defaultInvoiceTerms?: string;
  defaultFooterMessage?: string;
  defaultContactMessage?: string;
  defaultInvoiceStatus?: "Draft" | "Sent";
  taxState?: string;
  defaultTaxRate?: string;
  taxLocationMode?: "Business location" | "Job location";
  discountBeforeTax?: boolean;
  workspaceNickname?: string;
  businessType?: string;
  notes?: string;
  previousAddressKey?: string;
};

type DbWorkspaceSettings = {
  workspace_id: string;
  company_name: string | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  default_invoice_terms: string | null;
  default_footer_message: string | null;
  default_contact_message: string | null;
  default_invoice_status: "Draft" | "Sent" | null;
  tax_state: string | null;
  default_tax_rate: number | null;
  tax_location_mode: "Business location" | "Job location" | null;
  discount_before_tax: boolean | null;
  workspace_nickname: string | null;
  business_type: string | null;
  notes: string | null;
  business_latitude?: number | null;
  business_longitude?: number | null;
  business_geocoded_at?: string | null;
};

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

function addressKey(settings: {
  companyAddress?: string | null;
  companyCity?: string | null;
  companyState?: string | null;
  companyZip?: string | null;
}) {
  return [
    settings.companyAddress,
    settings.companyCity,
    settings.companyState,
    settings.companyZip,
  ]
    .map((part) =>
      String(part ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    )
    .join("|");
}

function dbToSettings(row: DbWorkspaceSettings) {
  return {
    workspaceId: row.workspace_id,
    companyName: row.company_name ?? "",
    companyAddress: row.company_address ?? "",
    companyCity: row.company_city ?? "",
    companyState: row.company_state ?? "",
    companyZip: row.company_zip ?? "",
    companyPhone: row.company_phone ?? "",
    companyEmail: row.company_email ?? "",
    companyWebsite: row.company_website ?? "",
    defaultInvoiceTerms: row.default_invoice_terms ?? "Due upon receipt",
    defaultFooterMessage: row.default_footer_message ?? "",
    defaultContactMessage: row.default_contact_message ?? "",
    defaultInvoiceStatus: row.default_invoice_status ?? "Draft",
    taxState: row.tax_state ?? "",
    defaultTaxRate: String(row.default_tax_rate ?? ""),
    taxLocationMode: row.tax_location_mode ?? "Business location",
    discountBeforeTax: row.discount_before_tax ?? true,
    workspaceNickname: row.workspace_nickname ?? "",
    businessType: row.business_type ?? "",
    notes: row.notes ?? "",
    businessLatitude: row.business_latitude ?? undefined,
    businessLongitude: row.business_longitude ?? undefined,
    businessGeocodedAt: row.business_geocoded_at ?? undefined,
  };
}

const baseSettingsColumns = [
    "workspace_id",
    "company_name",
    "company_address",
    "company_city",
    "company_state",
    "company_zip",
    "company_phone",
    "company_email",
    "company_website",
    "default_invoice_terms",
    "default_footer_message",
    "default_contact_message",
    "default_invoice_status",
    "tax_state",
    "default_tax_rate",
    "tax_location_mode",
    "discount_before_tax",
    "workspace_nickname",
    "business_type",
    "notes",
  ].join(", ");

const settingsColumnsWithLocation = [
    baseSettingsColumns,
    "business_latitude",
    "business_longitude",
    "business_geocoded_at",
  ].join(", ");

function isMissingLocationColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("business_latitude") ||
      error?.message?.includes("business_longitude") ||
      error?.message?.includes("business_geocoded_at")
  );
}

function cleanGeocodeError(error: unknown) {
  if (error instanceof RateLimitError) return error.message;
  if (error instanceof GeocodeProviderError) return error.message;
  return "Business address saved, but it could not be geocoded.";
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;

  let { data, error } = await access.serviceClient
    .from("workspace_settings")
    .select(settingsColumnsWithLocation)
    .eq("workspace_id", access.workspaceId)
    .maybeSingle();

  if (isMissingLocationColumn(error)) {
    const retry = await access.serviceClient
      .from("workspace_settings")
      .select(baseSettingsColumns)
      .eq("workspace_id", access.workspaceId)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) return jsonError(error.message || "Unable to load settings.", 500);
  return NextResponse.json({
    settings: data ? dbToSettings(data as unknown as DbWorkspaceSettings) : null,
  });
}

export async function PATCH(request: NextRequest) {
  let body: WorkspaceSettingsPayload;
  try {
    body = (await request.json()) as WorkspaceSettingsPayload;
  } catch {
    return jsonError("Invalid settings request.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) {
    return managerRequiredError("update workspace settings");
  }

  const nextAddressKey = addressKey(body);
  const addressChanged = nextAddressKey !== (body.previousAddressKey ?? "");
  const values: Record<string, unknown> = {
    workspace_id: access.workspaceId,
    company_name: emptyToNull(body.companyName),
    company_address: emptyToNull(body.companyAddress),
    company_city: emptyToNull(body.companyCity),
    company_state: emptyToNull(body.companyState),
    company_zip: emptyToNull(body.companyZip),
    company_phone: emptyToNull(body.companyPhone),
    company_email: emptyToNull(body.companyEmail),
    company_website: emptyToNull(body.companyWebsite),
    default_invoice_terms: emptyToNull(body.defaultInvoiceTerms),
    default_footer_message: emptyToNull(body.defaultFooterMessage),
    default_contact_message: emptyToNull(body.defaultContactMessage),
    default_invoice_status: body.defaultInvoiceStatus ?? "Draft",
    tax_state: emptyToNull(body.taxState),
    default_tax_rate: Number(body.defaultTaxRate) || 0,
    tax_location_mode: body.taxLocationMode ?? "Business location",
    discount_before_tax: body.discountBeforeTax ?? true,
    workspace_nickname: emptyToNull(body.workspaceNickname),
    business_type: emptyToNull(body.businessType),
    notes: emptyToNull(body.notes),
  };

  let geocodeWarning = "";
  if (addressChanged && nextAddressKey.replace(/\|/g, "")) {
    try {
      checkUserAndWorkspaceDailyLimits({
        service: "geocode",
        userId: access.userId,
        workspaceId: access.workspaceId,
        userLimit: serviceLimits.geocode.maxRequestsPerUserPerDay(),
        workspaceLimit: serviceLimits.geocode.maxRequestsPerWorkspacePerDay(),
      });
      const geocode = await geocodeAddress({
        street: body.companyAddress ?? "",
        city: body.companyCity ?? "",
        state: body.companyState ?? "",
        zip: body.companyZip ?? "",
        country: "US",
      });
      values.business_latitude = geocode.latitude;
      values.business_longitude = geocode.longitude;
      values.business_geocoded_at = new Date().toISOString();
    } catch (error) {
      geocodeWarning = cleanGeocodeError(error);
      values.business_latitude = null;
      values.business_longitude = null;
      values.business_geocoded_at = null;
    }
  }

  let { data, error } = await access.serviceClient
    .from("workspace_settings")
    .upsert(values, { onConflict: "workspace_id" })
    .select(settingsColumnsWithLocation)
    .single();

  if (isMissingLocationColumn(error)) {
    const valuesWithoutLocation = { ...values };
    delete valuesWithoutLocation.business_latitude;
    delete valuesWithoutLocation.business_longitude;
    delete valuesWithoutLocation.business_geocoded_at;
    const retry = await access.serviceClient
      .from("workspace_settings")
      .upsert(valuesWithoutLocation, { onConflict: "workspace_id" })
      .select(baseSettingsColumns)
      .single();
    data = retry.data;
    error = retry.error;
    geocodeWarning =
      geocodeWarning ||
      "Business address saved. Apply the business location migration to store coordinates.";
  }

  if (error) return jsonError(error.message || "Unable to save settings.", 500);
  const savedSettings = dbToSettings(data as unknown as DbWorkspaceSettings);
  return NextResponse.json({
    settings: {
      ...savedSettings,
      businessLatitude:
        typeof values.business_latitude === "number"
          ? values.business_latitude
          : savedSettings.businessLatitude,
      businessLongitude:
        typeof values.business_longitude === "number"
          ? values.business_longitude
          : savedSettings.businessLongitude,
      businessGeocodedAt:
        typeof values.business_geocoded_at === "string"
          ? values.business_geocoded_at
          : savedSettings.businessGeocodedAt,
    },
    warning: geocodeWarning || undefined,
  });
}
