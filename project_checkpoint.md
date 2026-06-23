# Frontier Project Checkpoint

## Project Tree

```text
📁 .agents
📁 .codex
  📄 config.toml
📄 .codex-speech-voice.wav
📄 .codex-speech-voice.webm
📄 .env.example
📄 .env.local
📄 .gitignore
📄 1.pdf
📄 AGENTS.md
📁 app
  📁 api
    📁 ai
      📁 interpret-document
        📄 route.ts
      📁 interpret-transcript
        📄 route.ts
      📁 review-drafts
        📁 execute
          📄 route.ts
        📄 route.ts
      📁 voice-draft
        📄 route.ts
    📁 data
      📁 create
        📄 route.ts
      📁 mutate
        📄 route.ts
    📁 documents
      📁 ocr
        📄 route.ts
      📁 storage
        📄 route.ts
    📁 frontier-admin
      📁 audit-logs
        📄 route.ts
      📁 search
        📄 route.ts
      📁 users
        📁 [userId]
          📁 workspaces
            📄 route.ts
      📁 view-mode
        📄 route.ts
      📁 workspaces
        📁 [workspaceId]
          📄 route.ts
    📁 geocode
      📄 route.ts
    📁 images
      📁 analyze
        📄 route.ts
    📁 logistics
      📁 matrix
        📄 route.ts
      📁 route
        📄 route.ts
    📁 material-allocations
      📄 route.ts
    📁 speech
      📁 transcribe
        📄 route.ts
    📁 workspace-members
      📁 invite
        📄 route.ts
      📁 mutate
        📄 route.ts
    📁 workspaces
      📄 route.ts
  📁 calendar
    📄 page.tsx
  📁 clients
    📁 [id]
      📄 page.tsx
    📄 page.tsx
  📁 dashboard
    📄 page.tsx
  📁 documents
    📄 DocumentAttachments.tsx
    📄 page.tsx
  📄 favicon.ico
  📁 financials
    📄 page.tsx
  📁 frontier-admin
    📄 AdminConsole.tsx
    📄 page.tsx
  📄 globals.css
  📁 inventory
    📁 [id]
      📄 page.tsx
    📄 page.tsx
  📁 invoices
    📁 [id]
      📄 page.tsx
    📁 new
      📄 page.tsx
    📄 page.tsx
  📁 jobs
    📁 [id]
      📄 page.tsx
    📄 page.tsx
  📄 layout.tsx
  📁 login
    📄 page.tsx
  📁 logistics
    📄 logisticsData.ts
    📄 LogisticsMap.tsx
    📄 page.tsx
  📄 page.tsx
  📁 reset-password
    📄 page.tsx
  📁 review
    📄 page.tsx
  📁 settings
    📄 DataMigrationSettings.tsx
    📄 page.tsx
    📄 PermissionsSettings.tsx
    📄 StorageSettings.tsx
  📁 signup
    📄 page.tsx
📄 CLAUDE.md
📁 components
  📄 AppShell.tsx
  📄 AuthSessionProvider.tsx
  📄 Sidebar.tsx
  📄 Statcard.tsx
  📄 WorkspaceContext.tsx
📁 docs
  📄 access-plans.md
  📄 action-layer.md
  📄 admin-console.md
  📄 ai-interpretation-layer.md
  📄 ai-model-contract.md
  📄 ai-provider-layer.md
  📄 ai-readiness.md
  📄 ai-review-draft-persistence.md
  📄 database-plan.md
  📄 invoice-hardening-audit.md
  📄 logistics-api-readiness.md
  📄 logistics-next.md
  📄 ocr-command-workflow.md
  📄 ocr-next.md
  📄 ocr-readiness.md
  📄 permissions-hardening.md
  📄 portal-architecture.md
  📄 review-queue.md
  📄 rls-audit.md
  📄 schema-drift-report.md
  📄 service-compliance.md
  📄 storage-strategy.md
  📄 supabase-env.md
  📄 testing-checklist.md
  📄 transaction-integrity-audit.md
  📄 voice-next.md
  📄 workflow-integrity-audit.md
📄 eslint.config.mjs
📁 lib
  📁 actions
    📄 calendar.ts
    📄 clients.ts
    📄 commandTypes.ts
    📄 documents.ts
    📄 expenses.ts
    📄 inventory.ts
    📄 invoices.ts
    📄 jobs.ts
    📄 routes.ts
    📄 shared.ts
    📄 workspaces.ts
  📁 ai
    📄 actionDrafts.ts
    📄 documentInterpreter.ts
    📄 executeReviewDraft.ts
    📄 formHydration.ts
    📄 parserContract.ts
    📁 providers
      📄 jsonExtraction.ts
      📄 openaiProvider.ts
      📄 openrouterProvider.ts
      📄 providerFactory.ts
      📄 systemPrompts.ts
      📄 types.ts
    📄 reviewTypes.ts
    📄 schemas.ts
    📄 transcriptInterpreter.ts
    📄 types.ts
    📄 validators.ts
    📄 voiceClarification.ts
  📁 auth
    📄 messages.ts
    📄 session.ts
  📄 clients.ts
  📄 clientStorage.ts
  📄 clientTypes.ts
  📁 db
    📄 aiReviewDrafts.ts
    📄 calendarEvents.ts
    📄 clients.ts
    📄 documents.ts
    📄 expenses.ts
    📄 ids.ts
    📄 inventory.ts
    📄 invoices.ts
    📄 jobs.ts
    📄 money.ts
    📄 routes.ts
    📄 serverCreate.ts
    📄 serverMutate.ts
  📁 demo
    📄 inventory.ts
  📄 expenses.ts
  📄 expenseTypes.ts
  📄 frontierClients.ts
  📄 frontierInvoices.ts
  📁 geocoding
    📄 address.ts
    📄 cache.ts
    📄 geocodeFarm.ts
    📄 nominatim.ts
    📄 provider.ts
    📄 types.ts
  📄 jobs.ts
  📄 jobStorage.ts
  📄 jobTypes.ts
  📁 logistics
    📄 nearestNeighbor.ts
    📄 openRouteService.ts
    📄 providers.ts
  📁 migration
    📄 localImport.ts
    📄 localImportTypes.ts
  📁 ocr
    📄 provider.ts
    📄 types.ts
    📄 workerClient.ts
  📁 plans
    📄 capabilities.ts
    📄 server.ts
    📄 types.ts
  📁 platformAdmin
    📄 server.ts
  📁 rateLimit
    📄 dailyCounters.ts
    📄 globalThrottle.ts
    📄 policy.ts
  📁 services
    📄 attribution.ts
    📄 routeProtection.ts
    📄 serviceLimits.ts
  📁 speech
    📄 types.ts
    📄 workerClient.ts
  📁 storage
    📄 documents.ts
    📄 index.ts
  📁 supabase
    📄 client.ts
    📄 env.ts
    📄 proxy.ts
    📄 server.ts
  📄 workspaceDisplay.ts
  📄 workspaceOptions.ts
📄 next-env.d.ts
📄 next.config.ts
📄 package-lock.json
📄 package.json
📄 postcss.config.mjs
📄 project_checkpoint.md
📄 proxy.ts
📁 public
  📄 file.svg
  📄 globe.svg
  📄 next.svg
  📄 vercel.svg
  📄 window.svg
📄 README.md
📁 scripts
  📄 verify-ai-providers.mjs
📁 supabase
  📁 .temp
    📄 cli-latest
    📄 gotrue-version
    📄 linked-project.json
    📄 pooler-url
    📄 postgres-version
    📄 project-ref
    📄 rest-version
    📄 storage-version
  📁 migrations
    📄 0001_frontier_foundation.sql
    📄 0002_workspace_member_invites.sql
    📄 0003_workspace_invite_acceptance.sql
    📄 0004_platform_admin_groundwork.sql
    📄 0005_admin_audit_logs.sql
    📄 0006_profiles_and_document_storage_foundation.sql
    📄 0007_clients_supabase_first.sql
    📄 0008_core_business_supabase_first.sql
    📄 0009_document_storage_policies.sql
    📄 0010_transaction_hardening.sql
    📄 0011_ai_ocr_logistics_readiness.sql
    📄 0012_role_level_delete_hardening.sql
    📄 0013_ai_review_drafts.sql
    📄 0014_ai_review_draft_needs_changes.sql
    📄 0015_ai_review_draft_execution.sql
    📄 0016_calendar_scheduling_times.sql
    📄 0017_ai_review_draft_revisions.sql
    📄 0018_material_catalog_foundation.sql
    📄 0019_ai_review_drafts_image_source.sql
  📄 schema-current.sql
📄 tsconfig.json
📁 worker-ocr
  📄 .dockerignore
  📄 Dockerfile
  📄 main.py
  📄 README.md
  📄 requirements.txt
  📄 SMOKE_TEST.md
📁 worker-speech
  📄 .dockerignore
  📁 __pycache__
    📄 main.cpython-311.pyc
  📄 Dockerfile
  📄 main.py
  📄 README.md
  📄 requirements.txt
  📄 SMOKE_TEST.md
```

## Source Files

## AGENTS.md

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
```

## app\api\ai\interpret-document\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { interpretDocumentWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { resolveWorkspacePlan } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InterpretDocumentRequest = {
  workspaceId?: string;
  documentId?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to interpret documents.", 401);
  }

  let body: InterpretDocumentRequest;
  try {
    body = (await request.json()) as InterpretDocumentRequest;
  } catch {
    return jsonError("Invalid document interpretation request.", 400);
  }

  const workspaceId = body.workspaceId;
  const documentId = body.documentId;

  if (!workspaceId || !documentId || !isUuid(workspaceId) || !isUuid(documentId)) {
    return jsonError("Workspace and document are required.", 400);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (!canUseAiDrafts(resolveWorkspacePlan())) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ai-draft",
      userId: user.id,
      workspaceId,
      userLimit: serviceLimits.aiDrafts.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.aiDrafts.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "AI draft quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, workspace_id, name, file_name, extracted_text")
    .eq("id", documentId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (documentError) {
    return jsonError(documentError.message || "Unable to load document.", 500);
  }

  if (!document) return jsonError("Document not found.", 404);

  const extractedText =
    typeof document.extracted_text === "string" ? document.extracted_text.trim() : "";
  if (!extractedText) {
    return jsonError("Document does not have extracted text to interpret.", 400);
  }

  try {
    const interpretation = await interpretDocumentWithAI({
      workspaceId,
      sourceId: documentId,
      text: extractedText,
    });
    const reviewDraft = await createReviewDraft(supabase, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: document.file_name ?? document.name ?? "Document",
      rawInput: extractedText,
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: user.id,
    });

    return NextResponse.json({ reviewDraft });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to interpret document.",
      500
    );
  }
}
```

## app\api\ai\interpret-transcript\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { interpretTranscriptWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { resolveWorkspacePlan } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InterpretTranscriptRequest = {
  workspaceId?: string;
  transcript?: string;
  sourceLabel?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to interpret transcripts.", 401);
  }

  let body: InterpretTranscriptRequest;
  try {
    body = (await request.json()) as InterpretTranscriptRequest;
  } catch {
    return jsonError("Invalid transcript interpretation request.", 400);
  }

  const workspaceId = body.workspaceId;

  if (!workspaceId || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  const transcript = body.transcript?.trim() ?? "";
  if (!transcript) return jsonError("Transcript is required.", 400);

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (!canUseAiDrafts(resolveWorkspacePlan())) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ai-draft",
      userId: user.id,
      workspaceId,
      userLimit: serviceLimits.aiDrafts.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.aiDrafts.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "AI draft quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  try {
    const interpretation = await interpretTranscriptWithAI({
      workspaceId,
      text: transcript,
    });
    const reviewDraft = await createReviewDraft(supabase, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: body.sourceLabel?.trim() || "Transcript",
      rawInput: transcript,
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: user.id,
    });

    return NextResponse.json({ reviewDraft });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to interpret transcript.",
      500
    );
  }
}
```

## app\api\ai\review-drafts\execute\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { executeReviewDraft } from "@/lib/ai/executeReviewDraft";
import {
  getReviewDraftById,
  updateReviewDraftExecution,
} from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ExecuteReviewDraftRequest = {
  id?: string;
  workspaceId?: string;
  confirmExecution?: boolean;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireExecutableWorkspace(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: jsonError("Sign in required to execute review drafts.", 401),
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  const role = membership.role as string;
  if (role !== "Owner" && role !== "Manager") {
    return {
      ok: false as const,
      response: jsonError("Only Owners and Managers can execute approved drafts.", 403),
    };
  }

  return {
    ok: true as const,
    user,
    serviceClient: createServiceRoleClient(),
  };
}

export async function POST(request: NextRequest) {
  let body: ExecuteReviewDraftRequest;
  try {
    body = (await request.json()) as ExecuteReviewDraftRequest;
  } catch {
    return jsonError("Invalid review draft execution request.", 400);
  }

  const workspaceId = body.workspaceId;
  const draftId = body.id;

  if (!workspaceId || !draftId || !isUuid(workspaceId) || !isUuid(draftId)) {
    return jsonError("Workspace and review draft are required.", 400);
  }

  if (body.confirmExecution !== true) {
    return jsonError("Final execution confirmation is required.", 400);
  }

  const auth = await requireExecutableWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  const draft = await getReviewDraftById(
    auth.serviceClient,
    workspaceId,
    draftId
  );

  if (!draft) return jsonError("Review draft not found.", 404);
  if (draft.status !== "Approved") {
    return jsonError("Only approved review drafts can be executed.", 400);
  }
  if (draft.executionStatus === "Executed") {
    return jsonError("Review draft has already been executed.", 400);
  }

  try {
    const executionResult = await executeReviewDraft({
      draft,
      serviceClient: auth.serviceClient,
    });
    const reviewDraft = await updateReviewDraftExecution(auth.serviceClient, {
      id: draft.id,
      workspaceId,
      executionStatus: "Executed",
      executedBy: auth.user.id,
      executionResult,
      executionError: null,
    });
    return NextResponse.json({ reviewDraft, executionResult });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to execute review draft.";
    const reviewDraft = await updateReviewDraftExecution(auth.serviceClient, {
      id: draft.id,
      workspaceId,
      executionStatus: "Failed",
      executedBy: auth.user.id,
      executionResult: {},
      executionError: message,
    });
    return NextResponse.json({ error: message, reviewDraft }, { status: 400 });
  }
}
```

## app\api\ai\review-drafts\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import {
  getReviewDraftById,
  getReviewDraftRevisions,
  getReviewDrafts,
  updateReviewDraftContent,
  updateReviewDraftStatus,
  type AiReviewDraftStatus,
} from "@/lib/db/aiReviewDrafts";
import type { SuggestedAction } from "@/lib/ai/types";
import { validateSuggestedAction } from "@/lib/ai/validators";
import { isUuid } from "@/lib/db/ids";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedStatuses: AiReviewDraftStatus[] = [
  "Pending",
  "Approved",
  "Rejected",
  "Needs Changes",
];

type UpdateReviewDraftRequest = {
  id?: string;
  workspaceId?: string;
  status?: AiReviewDraftStatus;
  mode?: "status" | "content";
  sourceLabel?: string;
  summary?: string;
  actions?: SuggestedAction[];
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireUserAndWorkspace(workspaceId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: jsonError("Sign in required to access review drafts.", 401),
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
    role: membership.role as string,
  };
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  const auth = await requireUserAndWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  try {
    const draftId = request.nextUrl.searchParams.get("draftId");
    if (draftId) {
      if (!isUuid(draftId)) return jsonError("Review draft is invalid.", 400);
      const [reviewDraft, revisions] = await Promise.all([
        getReviewDraftById(auth.supabase, workspaceId, draftId),
        getReviewDraftRevisions(auth.supabase, workspaceId, draftId),
      ]);
      if (!reviewDraft) return jsonError("Review draft not found.", 404);
      return NextResponse.json({ reviewDraft, revisions });
    }
    const reviewDrafts = await getReviewDrafts(auth.supabase, workspaceId);
    return NextResponse.json({ reviewDrafts });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load review drafts.",
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  let body: UpdateReviewDraftRequest;
  try {
    body = (await request.json()) as UpdateReviewDraftRequest;
  } catch {
    return jsonError("Invalid review draft request.", 400);
  }

  const workspaceId = body.workspaceId;
  const draftId = body.id;

  if (!workspaceId || !draftId || !isUuid(workspaceId) || !isUuid(draftId)) {
    return jsonError("Workspace and review draft are required.", 400);
  }

  const auth = await requireUserAndWorkspace(workspaceId);
  if (!auth.ok) return auth.response;

  if (auth.role !== "Owner" && auth.role !== "Manager") {
    return jsonError("Only Owners and Managers can update review drafts.", 403);
  }

  try {
    if (body.mode === "content") {
      if (!Array.isArray(body.actions) || body.actions.length === 0) {
        return jsonError("At least one action draft is required.", 400);
      }
      const invalidAction = body.actions.find(
        (action) => !validateSuggestedAction(action).ok
      );
      if (invalidAction) {
        return jsonError(`Action ${invalidAction.type} has invalid fields.`, 400);
      }
      const reviewDraft = await updateReviewDraftContent(auth.supabase, {
        id: draftId,
        workspaceId,
        sourceLabel: body.sourceLabel ?? "",
        summary: body.summary ?? "",
        actions: body.actions,
      });
      return NextResponse.json({ reviewDraft });
    }

    if (!body.status || !allowedStatuses.includes(body.status)) {
      return jsonError("Review draft status is invalid.", 400);
    }
    const reviewDraft = await updateReviewDraftStatus(auth.supabase, {
      id: draftId,
      workspaceId,
      status: body.status,
      reviewedBy: auth.user.id,
    });
    return NextResponse.json({ reviewDraft });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update review draft.",
      500
    );
  }
}
```

## app\api\ai\voice-draft\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { validateSuggestedAction } from "@/lib/ai/validators";
import { createReviewDraft as makeReviewDraft } from "@/lib/ai/reviewTypes";
import type { SuggestedAction } from "@/lib/ai/types";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type VoiceDraftRequest = {
  workspaceId?: string;
  sourceLabel?: string;
  rawInput?: string;
  action?: SuggestedAction;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return jsonError("Sign in required to create voice drafts.", 401);

  let body: VoiceDraftRequest;
  try {
    body = (await request.json()) as VoiceDraftRequest;
  } catch {
    return jsonError("Invalid voice draft request.", 400);
  }

  if (!body.workspaceId || !isUuid(body.workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }
  if (!body.action) return jsonError("Action draft is required.", 400);

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  const validation = validateSuggestedAction(body.action);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Voice draft is missing required fields.", warnings: validation.warnings },
      { status: 400 }
    );
  }

  const reviewDraft = await createReviewDraft(supabase, {
    reviewDraft: makeReviewDraft({
      workspaceId: body.workspaceId,
      sourceType: "transcript",
      confidence: body.action.confidence,
      warnings: validation.warnings,
      actions: [body.action],
    }),
    sourceLabel: body.sourceLabel?.trim() || "Voice command",
    rawInput: body.rawInput ?? null,
    modelProvider: "frontier-voice-clarification",
    modelName: "deterministic-v1",
    createdBy: user.id,
  });

  return NextResponse.json({ reviewDraft });
}
```

## app\api\data\create\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateRequest = {
  entity?: string;
  payload?: Record<string, unknown>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getWorkspaceId(entity: string, payload: Record<string, unknown>) {
  if (entity === "job") return asRecord(payload.job)?.workspace_id;
  if (entity === "invoice") return asRecord(payload.invoice)?.workspace_id;
  if (entity === "route_plan") return asRecord(payload.route)?.workspace_id;
  return payload.workspace_id;
}

async function verifyWorkspaceAccess(workspaceId: unknown, userId: string) {
  if (typeof workspaceId !== "string" || !workspaceId) {
    return { ok: false as const, response: jsonError("Workspace is required.", 400) };
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "Active")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  return { ok: true as const, serviceClient, workspaceId };
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required.", 401);
  }

  let body: CreateRequest;
  try {
    body = (await request.json()) as CreateRequest;
  } catch {
    return jsonError("Invalid create request.", 400);
  }

  const payload = asRecord(body.payload);
  if (!body.entity || !payload) {
    return jsonError("Entity and payload are required.", 400);
  }

  const access = await verifyWorkspaceAccess(
    getWorkspaceId(body.entity, payload),
    user.id
  );
  if (!access.ok) return access.response;

  const { serviceClient, workspaceId } = access;

  try {
    if (body.entity === "client") {
      const { data, error } = await serviceClient
        .from("clients")
        .insert(payload)
        .select("id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "inventory_item") {
      const { data, error } = await serviceClient
        .from("inventory_items")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "calendar_event") {
      const { data, error } = await serviceClient
        .from("client_calendar_events")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "expense") {
      const { data, error } = await serviceClient
        .from("expenses")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "document") {
      const { data, error } = await serviceClient
        .from("documents")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "job") {
      const job = asRecord(payload.job);
      const materials = Array.isArray(payload.materials)
        ? (payload.materials as Record<string, unknown>[])
        : [];
      if (!job) return jsonError("Job payload is required.", 400);

      const { data: insertedJob, error: jobError } = await serviceClient
        .from("jobs")
        .insert(job)
        .select("*")
        .single();
      if (jobError || !insertedJob) throw jobError;

      try {
        if (materials.length > 0) {
          const { error: materialsError } = await serviceClient
            .from("job_materials")
            .insert(
              materials.map((material) => ({
                ...material,
                workspace_id: workspaceId,
                job_id: insertedJob.id,
              }))
            );
          if (materialsError) throw materialsError;
        }
      } catch (error) {
        await serviceClient.from("jobs").delete().eq("id", insertedJob.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("jobs")
        .select("*, job_materials(*)")
        .eq("id", insertedJob.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "invoice") {
      const invoice = asRecord(payload.invoice);
      const lineItems = Array.isArray(payload.lineItems)
        ? (payload.lineItems as Record<string, unknown>[])
        : [];
      if (!invoice) return jsonError("Invoice payload is required.", 400);

      const { data: insertedInvoice, error: invoiceError } = await serviceClient
        .from("invoices")
        .insert(invoice)
        .select("*")
        .single();
      if (invoiceError || !insertedInvoice) throw invoiceError;

      try {
        if (lineItems.length > 0) {
          const { error: lineItemsError } = await serviceClient
            .from("invoice_line_items")
            .insert(
              lineItems.map((lineItem) => ({
                ...lineItem,
                workspace_id: workspaceId,
                invoice_id: insertedInvoice.id,
              }))
            );
          if (lineItemsError) throw lineItemsError;
        }
      } catch (error) {
        await serviceClient.from("invoices").delete().eq("id", insertedInvoice.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", insertedInvoice.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "route_plan") {
      const route = asRecord(payload.route);
      const stops = Array.isArray(payload.stops)
        ? (payload.stops as Record<string, unknown>[])
        : [];
      if (!route) return jsonError("Route payload is required.", 400);

      const { data: insertedRoute, error: routeError } = await serviceClient
        .from("route_plans")
        .insert(route)
        .select("*")
        .single();
      if (routeError || !insertedRoute) throw routeError;

      try {
        if (stops.length > 0) {
          const { error: stopsError } = await serviceClient
            .from("route_plan_stops")
            .insert(
              stops.map((stop) => ({
                ...stop,
                workspace_id: workspaceId,
                route_plan_id: insertedRoute.id,
              }))
            );
          if (stopsError) throw stopsError;
        }
      } catch (error) {
        await serviceClient.from("route_plans").delete().eq("id", insertedRoute.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("route_plans")
        .select("*, route_plan_stops(*)")
        .eq("id", insertedRoute.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return jsonError("Unsupported create entity.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed.";
    return jsonError(message, 500);
  }
}
```

## app\api\data\mutate\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MutationRequest = {
  entity?: string;
  operation?: "update" | "delete";
  payload?: Record<string, unknown>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function withoutKeys(record: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !keys.includes(key))
  );
}

function getWorkspaceId(entity: string, payload: Record<string, unknown>) {
  if (entity === "job") return asRecord(payload.job)?.workspace_id;
  if (entity === "invoice") return asRecord(payload.invoice)?.workspace_id;
  if (entity === "route_plan") return asRecord(payload.route)?.workspace_id;
  return payload.workspace_id;
}

async function verifyWorkspaceAccess(workspaceId: unknown, userId: string) {
  if (typeof workspaceId !== "string" || !workspaceId) {
    return { ok: false as const, response: jsonError("Workspace is required.", 400) };
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "Active")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  return { ok: true as const, serviceClient, workspaceId };
}

async function mutateSimpleRow({
  entity,
  table,
  select = "*",
  payload,
  operation,
}: {
  entity: string;
  table: string;
  select?: string;
  payload: Record<string, unknown>;
  operation: "update" | "delete";
}) {
  const id = payload.id;
  const workspaceId = payload.workspace_id;
  if (typeof id !== "string" || !id) return jsonError(`${entity} id is required.`, 400);
  if (typeof workspaceId !== "string" || !workspaceId) {
    return jsonError("Workspace is required.", 400);
  }

  const serviceClient = createServiceRoleClient();

  if (operation === "delete") {
    const { error } = await serviceClient
      .from(table)
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    if (error) throw error;
    return NextResponse.json({ data: true });
  }

  const values = withoutKeys(payload, ["id", "workspace_id"]);
  const { data, error } = await serviceClient
    .from(table)
    .update(values)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select(select)
    .single();
  if (error) throw error;
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  let body: MutationRequest;
  try {
    body = (await request.json()) as MutationRequest;
  } catch {
    return jsonError("Invalid mutation request.", 400);
  }

  const payload = asRecord(body.payload);
  if (!body.entity || !body.operation || !payload) {
    return jsonError("Entity, operation, and payload are required.", 400);
  }

  const access = await verifyWorkspaceAccess(
    getWorkspaceId(body.entity, payload),
    user.id
  );
  if (!access.ok) return access.response;

  const { serviceClient, workspaceId } = access;

  try {
    if (body.entity === "client") {
      return await mutateSimpleRow({
        entity: "Client",
        table: "clients",
        select: "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude",
        payload,
        operation: body.operation,
      });
    }

    if (body.entity === "inventory_item") {
      const id = typeof payload.id === "string" ? payload.id : "";
      if (body.operation === "delete") {
        let query = serviceClient
          .from("inventory_items")
          .delete()
          .eq("workspace_id", workspaceId);
        query = id ? query.eq("id", id) : query.eq("name", String(payload.name ?? ""));
        const { error } = await query;
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      let query = serviceClient
        .from("inventory_items")
        .update({
          name: payload.name,
          current_qty: payload.current_qty,
          target_qty: payload.target_qty,
        })
        .eq("workspace_id", workspaceId);
      query = id ? query.eq("id", id) : query.ilike("name", String(payload.name ?? ""));
      const { data, error } = await query.select("*").single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (body.entity === "expense") {
      return await mutateSimpleRow({
        entity: "Expense",
        table: "expenses",
        payload,
        operation: body.operation,
      });
    }

    if (body.entity === "document") {
      return await mutateSimpleRow({
        entity: "Document",
        table: "documents",
        payload,
        operation: body.operation,
      });
    }

    if (body.entity === "calendar_event") {
      return await mutateSimpleRow({
        entity: "Calendar event",
        table: "client_calendar_events",
        payload,
        operation: body.operation,
      });
    }

    if (body.entity === "job") {
      const job = asRecord(payload.job);
      const materials = Array.isArray(payload.materials)
        ? (payload.materials as Record<string, unknown>[])
        : [];
      if (!job) return jsonError("Job payload is required.", 400);

      if (body.operation === "delete") {
        const { error } = await serviceClient
          .from("jobs")
          .delete()
          .eq("id", String(job.id ?? ""))
          .eq("workspace_id", workspaceId);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      const { error } = await serviceClient.rpc("upsert_job_with_materials", {
        job_payload: job,
        materials_payload: materials,
      });
      if (error) throw error;

      const { data, error: loadError } = await serviceClient
        .from("jobs")
        .select("*, job_materials(*)")
        .eq("id", String(job.id ?? ""))
        .eq("workspace_id", workspaceId)
        .single();
      if (loadError) throw loadError;
      return NextResponse.json({ data });
    }

    if (body.entity === "job_materials") {
      const jobId = payload.job_id;
      const materials = Array.isArray(payload.materials)
        ? (payload.materials as Record<string, unknown>[])
        : [];
      if (typeof jobId !== "string" || !jobId) {
        return jsonError("Job is required.", 400);
      }

      const { error: deleteError } = await serviceClient
        .from("job_materials")
        .delete()
        .eq("job_id", jobId)
        .eq("workspace_id", workspaceId);
      if (deleteError) throw deleteError;

      if (body.operation === "delete" || materials.length === 0) {
        return NextResponse.json({ data: true });
      }

      const { error } = await serviceClient
        .from("job_materials")
        .insert(
          materials.map((material) => ({
            ...material,
            workspace_id: workspaceId,
            job_id: jobId,
          }))
        );
      if (error) throw error;
      return NextResponse.json({ data: true });
    }

    if (body.entity === "invoice") {
      const invoice = asRecord(payload.invoice);
      const lineItems = Array.isArray(payload.lineItems)
        ? (payload.lineItems as Record<string, unknown>[])
        : [];
      if (!invoice) return jsonError("Invoice payload is required.", 400);

      if (body.operation === "delete") {
        const { error } = await serviceClient
          .from("invoices")
          .delete()
          .eq("id", String(invoice.id ?? ""))
          .eq("workspace_id", workspaceId);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      const { error } = await serviceClient.rpc("upsert_invoice_with_lines", {
        invoice_payload: invoice,
        line_items_payload: lineItems,
      });
      if (error) throw error;

      const { data, error: loadError } = await serviceClient
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", String(invoice.id ?? ""))
        .eq("workspace_id", workspaceId)
        .single();
      if (loadError) throw loadError;
      return NextResponse.json({ data });
    }

    if (body.entity === "route_plan") {
      const route = asRecord(payload.route);
      const stops = Array.isArray(payload.stops)
        ? (payload.stops as Record<string, unknown>[])
        : [];
      if (!route) return jsonError("Route payload is required.", 400);

      if (body.operation === "delete") {
        const { error } = await serviceClient
          .from("route_plans")
          .delete()
          .eq("id", String(route.id ?? ""))
          .eq("workspace_id", workspaceId);
        if (error) throw error;
        return NextResponse.json({ data: true });
      }

      const { error } = await serviceClient.rpc("upsert_route_with_stops", {
        route_payload: route,
        stops_payload: stops,
      });
      if (error) throw error;

      const { data, error: loadError } = await serviceClient
        .from("route_plans")
        .select("*, route_plan_stops(*)")
        .eq("id", String(route.id ?? ""))
        .eq("workspace_id", workspaceId)
        .single();
      if (loadError) throw loadError;
      return NextResponse.json({ data });
    }

    return jsonError("Unsupported mutation entity.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mutation failed.";
    return jsonError(message, 500);
  }
}
```

## app\api\documents\ocr\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { getOcrProviderMode, runOcrExtraction } from "@/lib/ocr/provider";
import { canUseOcr } from "@/lib/plans/capabilities";
import { resolveWorkspacePlan } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type OcrRequestBody = {
  documentId?: string;
  workspaceId?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to run OCR.", 401);
  }

  let body: OcrRequestBody;
  try {
    body = (await request.json()) as OcrRequestBody;
  } catch {
    return jsonError("Invalid OCR request.", 400);
  }

  if (!body.documentId || !body.workspaceId) {
    return jsonError("Document and workspace are required.", 400);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (!canUseOcr(resolveWorkspacePlan())) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ocr",
      userId: user.id,
      workspaceId: body.workspaceId,
      userLimit: serviceLimits.ocr.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.ocr.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "OCR quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, workspace_id, name, file_name, mime_type, storage_bucket, storage_path, notes, document_type, detected_type")
    .eq("id", body.documentId)
    .eq("workspace_id", body.workspaceId)
    .maybeSingle();

  if (documentError) {
    return jsonError(documentError.message || "Unable to load document.", 500);
  }

  if (!document) {
    return jsonError("Document not found.", 404);
  }

  const providerMode = getOcrProviderMode();

  const { data: aiJob, error: jobError } = await supabase
    .from("ai_jobs")
    .insert({
      workspace_id: body.workspaceId,
      document_id: body.documentId,
      workflow_name: "document_ocr",
      job_type: "document_ocr",
      status: "Queued",
      model_provider: "frontier",
      model_name: providerMode === "worker" ? "ocrmypdf-tesseract" : `${providerMode}-ocr`,
      prompt_version: "ocr-foundation-v1",
      created_by: user.id,
      input_ref: document.storage_path,
      input_json: {
        fileName: document.file_name,
        mimeType: document.mime_type,
        storagePath: document.storage_path,
      },
    })
    .select("id")
    .single();

  if (jobError || !aiJob) {
    return jsonError(jobError?.message || "Unable to create OCR job.", 500);
  }

  const failJob = async (message: string) => {
    await Promise.all([
      supabase
        .from("ai_jobs")
        .update({
          status: "Failed",
          error_message: message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", aiJob.id),
      supabase
        .from("documents")
        .update({
          processing_status: "failed",
          extraction_status: "OCR failed",
          ai_job_id: aiJob.id,
        })
        .eq("id", body.documentId)
        .eq("workspace_id", body.workspaceId),
    ]);
  };

  try {
    await supabase
      .from("documents")
      .update({
        processing_status: "processing",
        extraction_status: "Processing OCR",
        ai_job_id: aiJob.id,
      })
      .eq("id", body.documentId)
      .eq("workspace_id", body.workspaceId);

    await supabase
      .from("ai_jobs")
      .update({
        status: "Processing",
        started_at: new Date().toISOString(),
      })
      .eq("id", aiJob.id);

    let storedFile: Blob | undefined;
    if (providerMode === "worker") {
      if (!document.storage_path) {
        throw new Error("This document does not have a stored file to process.");
      }

      const { data, error } = await supabase.storage
        .from(document.storage_bucket || DOCUMENT_STORAGE_BUCKET)
        .download(document.storage_path);

      if (error || !data) {
        throw new Error(error?.message || "Unable to load the stored document for OCR.");
      }
      storedFile = data;
    }

    const extraction = await runOcrExtraction({
      documentId: document.id,
      workspaceId: document.workspace_id,
      fileName: document.file_name ?? document.name,
      mimeType: document.mime_type,
      storagePath: document.storage_path,
      notes: document.notes,
      documentType: document.document_type ?? document.detected_type,
      file: storedFile,
    });

    const extractedJson = {
      ...extraction.structuredData,
      safety: "Review extracted information before using it.",
    };

    const { data: updatedDocument, error: updateError } = await supabase
      .from("documents")
      .update({
        processing_status: "needs_review",
        extraction_status: "Needs Review",
        extracted_text: extraction.text,
        extracted_json: extractedJson,
        ocr_provider: extraction.provider,
        confidence: extraction.confidence,
        document_type: extraction.structuredData.documentType,
        ai_job_id: aiJob.id,
      })
      .eq("id", body.documentId)
      .eq("workspace_id", body.workspaceId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    await supabase
      .from("ai_jobs")
      .update({
        status: "Needs Review",
        result_json: extractedJson,
        output_json: extractedJson,
        confidence: extraction.confidence,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiJob.id);

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed.";
    await failJob(message);
    return jsonError(message, 500);
  }
}
```

## app\api\documents\storage\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { canUseCloudStorage } from "@/lib/plans/capabilities";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage/documents";

function validWorkspacePath(workspaceId: string, path: string) {
  return path.startsWith(`${workspaceId}/`) && !path.includes("..") && !path.includes("\\");
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid document upload request.", 400);
  }

  const workspaceId = formData.get("workspaceId");
  const path = formData.get("path");
  const file = formData.get("file");
  if (typeof workspaceId !== "string" || typeof path !== "string" || !(file instanceof File)) {
    return jsonError("Workspace, path, and file are required.", 400);
  }

  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseCloudStorage(access.plan)) return planUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  const { error } = await access.serviceClient.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) return jsonError(error.message || "Unable to upload document.", 500);
  return NextResponse.json({ stored: true });
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseCloudStorage(access.plan)) return planUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  const { data, error } = await access.serviceClient.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data) return jsonError(error?.message || "Unable to create download link.", 500);
  return NextResponse.json({ url: data.signedUrl });
}

export async function DELETE(request: NextRequest) {
  let body: { workspaceId?: string; path?: string };
  try {
    body = (await request.json()) as { workspaceId?: string; path?: string };
  } catch {
    return jsonError("Invalid document deletion request.", 400);
  }

  const workspaceId = body.workspaceId ?? "";
  const path = body.path ?? "";
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseCloudStorage(access.plan)) return planUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  const { error } = await access.serviceClient.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .remove([path]);
  if (error) return jsonError(error.message || "Unable to delete document file.", 500);
  return NextResponse.json({ deleted: true });
}
```

## app\api\frontier-admin\audit-logs\route.ts

```typescript
import { NextResponse } from "next/server";

import {
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { data, error } = await admin.context.serviceClient
      .from("admin_audit_logs")
      .select("id, admin_user_id, target_user_id, target_workspace_id, action, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ logs: data ?? [] });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
```

## app\api\frontier-admin\search\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

type AuthUserSummary = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
};

function includesQuery(value: unknown, query: string) {
  return String(value ?? "").toLowerCase().includes(query);
}

export async function GET(request: NextRequest) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  try {
    const { serviceClient } = admin.context;
    const { data: userPage, error: usersError } =
      await serviceClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) throw usersError;

    const { data: workspaces, error: workspacesError } = await serviceClient
      .from("workspaces")
      .select("id, name, type, created_by, created_at, workspace_settings(company_name, business_type)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (workspacesError) throw workspacesError;

    const { data: memberships, error: membershipsError } = await serviceClient
      .from("workspace_members")
      .select("user_id, workspace_id, status")
      .neq("status", "Removed")
      .limit(5000);

    if (membershipsError) throw membershipsError;

    const workspaceCountByUser = new Map<string, number>();
    for (const membership of memberships ?? []) {
      if (!membership.user_id) continue;
      workspaceCountByUser.set(
        membership.user_id,
        (workspaceCountByUser.get(membership.user_id) ?? 0) + 1
      );
    }

    const workspaceMatches = (workspaces ?? []).filter((workspace) => {
      if (!query) return true;
      const settings = Array.isArray(workspace.workspace_settings)
        ? workspace.workspace_settings[0]
        : workspace.workspace_settings;

      return [
        workspace.id,
        workspace.name,
        workspace.type,
        settings?.company_name,
        settings?.business_type,
      ].some((value) => includesQuery(value, query));
    });

    const workspaceUserIds = new Set(
      (memberships ?? [])
        .filter((membership) =>
          workspaceMatches.some(
            (workspace) => workspace.id === membership.workspace_id
          )
        )
        .map((membership) => membership.user_id)
        .filter((userId): userId is string => Boolean(userId))
    );

    const users = (userPage.users as AuthUserSummary[])
      .filter((user) => {
        if (!query) return true;
        return (
          includesQuery(user.email, query) ||
          includesQuery(user.id, query) ||
          workspaceUserIds.has(user.id)
        );
      })
      .map((user) => ({
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        workspaceCount: workspaceCountByUser.get(user.id) ?? 0,
      }));

    await logAdminAction(admin.context, "user_search", {
      metadata: {
        query,
        userResultCount: users.length,
        workspaceResultCount: workspaceMatches.length,
      },
    });

    return NextResponse.json({
      users,
      workspaces: workspaceMatches.map((workspace) => {
        const settings = Array.isArray(workspace.workspace_settings)
          ? workspace.workspace_settings[0]
          : workspace.workspace_settings;

        return {
          id: workspace.id,
          name: workspace.name,
          type: workspace.type,
          createdBy: workspace.created_by,
          createdAt: workspace.created_at,
          companyName: settings?.company_name ?? null,
          businessType: settings?.business_type ?? workspace.type,
        };
      }),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
```

## app\api\frontier-admin\users\[userId]\workspaces\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const { userId } = await params;

  try {
    const { data: userData, error: userError } =
      await admin.context.serviceClient.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { data, error } = await admin.context.serviceClient
      .from("workspace_members")
      .select("role, status, created_at, workspaces(id, name, type, created_at)")
      .eq("user_id", userId)
      .neq("status", "Removed")
      .order("created_at", { ascending: false });

    if (error) throw error;

    await logAdminAction(admin.context, "view_user", {
      targetUserId: userId,
    });

    return NextResponse.json({
      user: {
        id: userData.user.id,
        email: userData.user.email ?? null,
        createdAt: userData.user.created_at,
        lastSignInAt: userData.user.last_sign_in_at ?? null,
      },
      workspaces: (data ?? []).map((membership) => {
        const workspace = Array.isArray(membership.workspaces)
          ? membership.workspaces[0]
          : membership.workspaces;

        return {
          id: workspace?.id ?? "",
          name: workspace?.name ?? "Unknown Workspace",
          type: workspace?.type ?? "Other",
          createdAt: workspace?.created_at ?? null,
          role: membership.role,
          status: membership.status,
        };
      }),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
```

## app\api\frontier-admin\view-mode\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function POST(request: NextRequest) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as {
      action?: "enter" | "exit";
      workspaceId?: string | null;
      userId?: string | null;
    };

    if (body.action === "exit") {
      await logAdminAction(admin.context, "exit_admin_view_mode", {
        targetUserId: body.userId ?? null,
        targetWorkspaceId: body.workspaceId ?? null,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action !== "enter" || !body.workspaceId) {
      return NextResponse.json({ error: "Invalid admin view request." }, { status: 400 });
    }

    const { data: workspace, error } = await admin.context.serviceClient
      .from("workspaces")
      .select("id, name, type, created_by")
      .eq("id", body.workspaceId)
      .single();

    if (error || !workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    if (body.userId) {
      const { data: member, error: memberError } = await admin.context.serviceClient
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", body.workspaceId)
        .eq("user_id", body.userId)
        .neq("status", "Removed")
        .maybeSingle();

      if (memberError) throw memberError;
      if (!member) {
        return NextResponse.json(
          { error: "User is not a member of that workspace." },
          { status: 400 }
        );
      }
    }

    await logAdminAction(admin.context, "enter_admin_view_mode", {
      targetUserId: body.userId ?? workspace.created_by,
      targetWorkspaceId: workspace.id,
    });

    return NextResponse.json({
      ok: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
      },
      adminUserId: admin.context.adminUserId,
      targetUserId: body.userId ?? workspace.created_by,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
```

## app\api\frontier-admin\workspaces\[workspaceId]\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const { workspaceId } = await params;

  try {
    const { serviceClient } = admin.context;
    const { data: workspace, error: workspaceError } = await serviceClient
      .from("workspaces")
      .select("id, name, type, created_by, created_at, updated_at")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    const [
      membersResult,
      clientsResult,
      jobsResult,
      invoicesResult,
      inventoryResult,
      documentsResult,
      routePlansResult,
      settingsResult,
    ] = await Promise.all([
      serviceClient
        .from("workspace_members")
        .select("id, user_id, role, status, invited_email, created_at, profiles!workspace_members_user_id_fkey(email, display_name)")
        .eq("workspace_id", workspaceId)
        .neq("status", "Removed")
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("clients")
        .select("id, name, status, email, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("jobs")
        .select("id, name, status, client_name_snapshot, scheduled_date, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("invoices")
        .select("id, invoice_number, status, bill_to_name, bill_to_email, invoice_date, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("inventory_items")
        .select("id, name, current_qty, target_qty, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("documents")
        .select("id, name, file_name, status, extraction_status, detected_type, uploaded_by, mime_type, size_bytes, storage_bucket, storage_path, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("route_plans")
        .select("id, name, total_distance_meters, total_duration_seconds, google_maps_url, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("workspace_settings")
        .select("workspace_id, company_name, business_type, workspace_nickname, company_email, created_at, updated_at")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
    ]);

    const results = [
      membersResult,
      clientsResult,
      jobsResult,
      invoicesResult,
      inventoryResult,
      documentsResult,
      routePlansResult,
      settingsResult,
    ];
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    await logAdminAction(admin.context, "view_workspace", {
      targetUserId: workspace.created_by,
      targetWorkspaceId: workspaceId,
    });

    return NextResponse.json({
      workspace,
      settings: settingsResult.data,
      members: membersResult.data ?? [],
      clients: clientsResult.data ?? [],
      jobs: jobsResult.data ?? [],
      invoices: invoicesResult.data ?? [],
      inventory: inventoryResult.data ?? [],
      documents: documentsResult.data ?? [],
      routePlans: routePlansResult.data ?? [],
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
```

## app\api\geocode\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { GeocodeProviderError, type GeocodeInput } from "@/lib/geocoding/types";
import { geocodeAddress } from "@/lib/geocoding/provider";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { canUseExternalRouting } from "@/lib/plans/capabilities";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type GeocodeRequest = {
  workspaceId?: string;
  clientId?: string;
  address?: GeocodeInput;
};

function cleanGeocodeError(error: unknown) {
  if (error instanceof RateLimitError) return error.message;
  if (error instanceof GeocodeProviderError) return error.message;
  return "Address could not be geocoded.";
}

export async function POST(request: NextRequest) {
  let body: GeocodeRequest;
  try {
    body = (await request.json()) as GeocodeRequest;
  } catch {
    return jsonError("Invalid geocode request.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canUseExternalRouting(access.plan)) return planUpgradeError();

  const { serviceClient, userId, workspaceId } = access;

  try {
    if (body.clientId) {
      const { data: client, error } = await serviceClient
        .from("clients")
        .select("id, workspace_id, address, city, state, zip, latitude, longitude")
        .eq("id", body.clientId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error || !client) return jsonError("Client not found.", 404);

      if (typeof client.latitude === "number" && typeof client.longitude === "number") {
        return NextResponse.json({
          data: {
            clientId: client.id,
            latitude: client.latitude,
            longitude: client.longitude,
            cached: true,
          },
        });
      }

      checkUserAndWorkspaceDailyLimits({
        service: "geocode",
        userId,
        workspaceId,
        userLimit: serviceLimits.geocode.maxRequestsPerUserPerDay(),
        workspaceLimit: serviceLimits.geocode.maxRequestsPerWorkspacePerDay(),
      });

      const result = await geocodeAddress({
        street: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zip: client.zip ?? "",
        country: "US",
      });

      const { error: updateError } = await serviceClient
        .from("clients")
        .update({
          latitude: result.latitude,
          longitude: result.longitude,
        })
        .eq("id", client.id)
        .eq("workspace_id", workspaceId);

      if (updateError) throw updateError;

      return NextResponse.json({
        data: {
          clientId: client.id,
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
          provider: result.provider,
          cached: false,
        },
      });
    }

    if (!body.address) return jsonError("Missing address fields.", 400);
    checkUserAndWorkspaceDailyLimits({
      service: "geocode",
      userId,
      workspaceId,
      userLimit: serviceLimits.geocode.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.geocode.maxRequestsPerWorkspacePerDay(),
    });

    const result = await geocodeAddress(body.address);
    return NextResponse.json({
      data: {
        latitude: result.latitude,
        longitude: result.longitude,
        displayName: result.displayName,
        provider: result.provider,
      },
    });
  } catch (error) {
    return jsonError(
      cleanGeocodeError(error),
      error instanceof RateLimitError ? error.status : 400
    );
  }
}
```

## app\api\images\analyze\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { interpretImageWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage/documents";

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const maxImageBytes = 10 * 1024 * 1024;

function isSupportedImageType(value: string) {
  return supportedImageTypes.has(value.toLowerCase());
}

function toDataUrl(mimeType: string, bytes: ArrayBuffer) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid image analysis request.", 400);
  }

  const workspaceId = formData.get("workspaceId");
  const documentId = formData.get("documentId");
  const sourceLabel = formData.get("sourceLabel");
  const file = formData.get("file");

  if (typeof workspaceId !== "string") {
    return jsonError("Workspace is required.", 400);
  }

  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseAiDrafts(access.plan)) return planUpgradeError();

  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ai-image",
      userId: access.userId,
      workspaceId,
      userLimit: serviceLimits.aiDrafts.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.aiDrafts.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "AI image quota exceeded.",
      error instanceof RateLimitError ? error.status : 429
    );
  }

  let imageBytes: ArrayBuffer;
  let mimeType = "";
  let label =
    typeof sourceLabel === "string" && sourceLabel.trim()
      ? sourceLabel.trim()
      : "Image upload";
  let sourceId: string | undefined;

  if (file instanceof File) {
    mimeType = file.type || "";
    if (!isSupportedImageType(mimeType)) {
      return jsonError("Only JPG, PNG, and WebP images are supported.", 400);
    }
    if (file.size > maxImageBytes) {
      return jsonError("Image must be 10 MB or smaller.", 413);
    }
    imageBytes = await file.arrayBuffer();
    label = sourceLabel?.toString().trim() || file.name || label;
  } else if (typeof documentId === "string" && documentId.trim()) {
    const { data: document, error } = await access.serviceClient
      .from("documents")
      .select("id, workspace_id, name, file_name, mime_type, storage_bucket, storage_path")
      .eq("id", documentId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (error) return jsonError(error.message || "Unable to load image document.", 500);
    if (!document) return jsonError("Image document not found.", 404);

    mimeType = document.mime_type ?? "";
    if (!isSupportedImageType(mimeType)) {
      return jsonError("Stored document is not a supported image.", 400);
    }
    if (!document.storage_path) {
      return jsonError("Stored image does not have a file path.", 400);
    }

    const { data: storageObject, error: downloadError } = await access.serviceClient.storage
      .from(document.storage_bucket || DOCUMENT_STORAGE_BUCKET)
      .download(document.storage_path);
    if (downloadError || !storageObject) {
      return jsonError(downloadError?.message || "Unable to load stored image.", 500);
    }
    if (storageObject.size > maxImageBytes) {
      return jsonError("Image must be 10 MB or smaller.", 413);
    }
    imageBytes = await storageObject.arrayBuffer();
    sourceId = document.id;
    label = document.file_name ?? document.name ?? label;
  } else {
    return jsonError("Image file or document id is required.", 400);
  }

  try {
    const interpretation = await interpretImageWithAI({
      workspaceId,
      sourceId,
      imageDataUrl: toDataUrl(mimeType, imageBytes),
      mimeType,
      sourceLabel: label,
    });
    const reviewDraft = await createReviewDraft(access.serviceClient, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: label,
      rawInput: `Image analysis: ${label}`,
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: access.userId,
    });

    return NextResponse.json({
      reviewDraft,
      analysis: {
        provider: interpretation.provider,
        model: interpretation.model,
        usedFallback: interpretation.usedFallback,
        confidence: interpretation.result.confidence,
        warnings: interpretation.result.warnings,
        actions: interpretation.result.actions,
      },
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to analyze image.",
      500
    );
  }
}
```

## app\api\logistics\matrix\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { getOpenRouteServiceMatrix } from "@/lib/logistics/openRouteService";
import type { LogisticsCoordinate } from "@/lib/logistics/providers";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { canUseExternalRouting } from "@/lib/plans/capabilities";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type MatrixRequest = {
  workspaceId?: string;
  locations?: LogisticsCoordinate[];
};

function hasValidLocations(locations: unknown): locations is LogisticsCoordinate[] {
  return (
    Array.isArray(locations) &&
    locations.length >= 2 &&
    locations.every(
      (location) =>
        typeof location?.latitude === "number" &&
        typeof location?.longitude === "number"
    )
  );
}

export async function POST(request: NextRequest) {
  let body: MatrixRequest;
  try {
    body = (await request.json()) as MatrixRequest;
  } catch {
    return jsonError("Invalid matrix request.", 400);
  }

  if (!body.workspaceId) return jsonError("Workspace is required.", 400);
  if (!hasValidLocations(body.locations)) {
    return jsonError("At least two route locations are required.", 400);
  }
  if (body.locations.length > serviceLimits.matrix.maxLocations()) {
    return jsonError("Too many locations for route distance lookup.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canUseExternalRouting(access.plan)) return planUpgradeError();

  try {
    checkUserAndWorkspaceDailyLimits({
      service: "route",
      userId: access.userId,
      workspaceId: access.workspaceId,
      userLimit: serviceLimits.route.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.route.maxRequestsPerWorkspacePerDay(),
    });
    const matrix = await getOpenRouteServiceMatrix(body.locations);
    return NextResponse.json({ data: matrix });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Route distance provider is temporarily unavailable.",
      400
    );
  }
}
```

## app\api\logistics\route\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { orderStopsNearestNeighbor } from "@/lib/logistics/nearestNeighbor";
import { buildGoogleMapsDirectionsUrl, type LogisticsCoordinate } from "@/lib/logistics/providers";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { canUseLogistics } from "@/lib/plans/capabilities";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type RouteStopInput = LogisticsCoordinate & {
  id: string;
  addressSnapshot?: string;
};

type RouteRequest = {
  workspaceId?: string;
  stops?: RouteStopInput[];
};

function hasValidStops(stops: unknown): stops is RouteStopInput[] {
  return (
    Array.isArray(stops) &&
    stops.length >= 2 &&
    stops.every(
      (stop) =>
        typeof stop?.id === "string" &&
        typeof stop.latitude === "number" &&
        typeof stop.longitude === "number"
    )
  );
}

export async function POST(request: NextRequest) {
  let body: RouteRequest;
  try {
    body = (await request.json()) as RouteRequest;
  } catch {
    return jsonError("Invalid route request.", 400);
  }

  if (!body.workspaceId) return jsonError("Workspace is required.", 400);
  if (!hasValidStops(body.stops)) {
    return jsonError("At least two route stops are required.", 400);
  }
  if (body.stops.length > serviceLimits.route.absoluteMaxStops()) {
    return jsonError("Route has too many stops.", 400);
  }
  if (body.stops.length > serviceLimits.route.maxStops()) {
    return jsonError("Too many route stops. Reduce stop count.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canUseLogistics(access.plan)) return planUpgradeError();

  checkUserAndWorkspaceDailyLimits({
    service: "route",
    userId: access.userId,
    workspaceId: access.workspaceId,
    userLimit: serviceLimits.route.maxRequestsPerUserPerDay(),
    workspaceLimit: serviceLimits.route.maxRequestsPerWorkspacePerDay(),
  });

  const orderedStops = orderStopsNearestNeighbor(body.stops);
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(orderedStops);
  if (googleMapsUrl.length > serviceLimits.googleMaps.maxUrlLength) {
    return jsonError("Too many route stops for Google Maps export. Reduce stop count.", 400);
  }

  return NextResponse.json({
    data: {
      orderedStopIds: orderedStops.map((stop) => stop.id),
      googleMapsUrl,
    },
  });
}
```

## app\api\material-allocations\route.ts

```typescript
import { NextResponse } from "next/server";

import { isUuid } from "@/lib/db/ids";
import { jsonError, requireWorkspaceAccess } from "@/lib/services/routeProtection";

type MaterialRow = { name?: string; quantity?: number; notes?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workspaceId?: string;
    jobId?: string;
    mode?: string;
    materials?: MaterialRow[];
    sourceDocumentId?: string;
    reviewDraftId?: string;
  } | null;

  if (!body?.workspaceId || !isUuid(body.workspaceId)) return jsonError("Workspace is required.", 400);
  if (!body.jobId || !isUuid(body.jobId)) return jsonError("Choose a job for these materials.", 400);
  if (!Array.isArray(body.materials) || body.materials.length === 0) return jsonError("At least one material is required.", 400);
  if (body.sourceDocumentId && !isUuid(body.sourceDocumentId)) return jsonError("Source document is invalid.", 400);
  if (body.reviewDraftId && !isUuid(body.reviewDraftId)) return jsonError("Review draft is invalid.", 400);

  const materials = body.materials.map((material) => ({
    name: typeof material.name === "string" ? material.name.trim() : "",
    quantity: typeof material.quantity === "number" ? material.quantity : 0,
    notes: typeof material.notes === "string" ? material.notes.trim() : "",
  }));
  if (materials.some((material) => !material.name || material.quantity <= 0)) {
    return jsonError("Each material requires a name and positive quantity.", 400);
  }

  const auth = await requireWorkspaceAccess(body.workspaceId);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.serviceClient.rpc("create_material_allocation_draft", {
    target_workspace_id: body.workspaceId,
    target_job_id: body.jobId,
    allocation_mode: ["Append", "Merge", "Replace"].includes(body.mode ?? "") ? body.mode : "Append",
    material_rows: materials,
    source_document_id: body.sourceDocumentId || null,
    source_review_draft_id: body.reviewDraftId || null,
  });

  if (error) return jsonError(error.message || "Unable to save material allocation draft.", 400);
  return NextResponse.json({ allocations: data ?? [] });
}
```

## app\api\speech\transcribe\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { isUuid } from "@/lib/db/ids";
import { canUseSpeech } from "@/lib/plans/capabilities";
import { resolveWorkspacePlan } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
import { runSpeechWorker } from "@/lib/speech/workerClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const AUDIO_EXTENSIONS = new Set([
  "wav",
  "mp3",
  "m4a",
  "ogg",
  "flac",
  "webm",
  "mp4",
]);

function jsonError(message: string, status: number, code = "request_failed") {
  return NextResponse.json({ error: message, errorCode: code }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to transcribe audio.", 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid transcription request.", 400);
  }

  const workspaceId = formData.get("workspaceId");
  const file = formData.get("file");

  if (typeof workspaceId !== "string" || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("An audio file is required.", 400);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!AUDIO_EXTENSIONS.has(extension)) {
    return jsonError("Supported audio types are WAV, MP3, M4A, OGG, FLAC, WebM, and MP4.", 400, "invalid_file_type");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (!canUseSpeech(resolveWorkspacePlan())) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "speech",
      userId: user.id,
      workspaceId,
      userLimit: serviceLimits.speech.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.speech.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Speech quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  const normalizedContentType = file.type.split(";", 1)[0].trim() || "application/octet-stream";
  console.info("[speech] transcribe request", {
    fileName: file.name,
    contentType: normalizedContentType,
    fileSize: file.size,
    workerUrlConfigured: Boolean(process.env.SPEECH_WORKER_URL?.trim()),
  });

  const result = await runSpeechWorker({
    file,
    fileName: file.name,
    // MediaRecorder commonly adds codec parameters (for example,
    // audio/webm;codecs=opus), while the worker validates the base MIME type.
    contentType: normalizedContentType,
  });

  if (!result.ok) {
    const status =
      result.error.code === "file_too_large"
        ? 413
        : result.error.code === "invalid_file_type"
          ? 415
          : result.error.code === "missing_config"
            ? 503
            : 502;
    return jsonError(result.error.message, status, result.error.code);
  }

  return NextResponse.json({ transcription: result.data });
}
```

## app\api\workspace-members\invite\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InviteRequest = {
  workspaceId?: string;
  email?: string;
  role?: "Owner" | "Manager" | "Employee";
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required.", 401);
  }

  let body: InviteRequest;
  try {
    body = (await request.json()) as InviteRequest;
  } catch {
    return jsonError("Invalid invite request.", 400);
  }

  const workspaceId = body.workspaceId;
  const email = body.email?.trim().toLowerCase();
  const role = body.role || "Employee";

  if (!workspaceId || !email) {
    return jsonError("Workspace and email are required.", 400);
  }

  const serviceClient = createServiceRoleClient();
  const { data: inviter, error: inviterError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (inviterError || !inviter) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  if (inviter.role !== "Owner" && inviter.role !== "Manager") {
    return jsonError("Only Owners and Managers can invite members.", 403);
  }

  const inviteToken = crypto.randomUUID();
  const inviteExpiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: existingRows, error: lookupError } = await serviceClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("status", "Invited")
    .eq("invited_email", email)
    .limit(1);

  if (lookupError) {
    return jsonError(lookupError.message, 500);
  }

  const existingInvite = existingRows?.[0] as { id: string } | undefined;
  const query = existingInvite
    ? serviceClient
        .from("workspace_members")
        .update({
          role,
          invite_token: inviteToken,
          invite_expires_at: inviteExpiresAt,
          invited_by: user.id,
        })
        .eq("id", existingInvite.id)
    : serviceClient.from("workspace_members").insert({
        workspace_id: workspaceId,
        invited_email: email,
        invited_by: user.id,
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        role,
        status: "Invited",
      });

  const { data, error } = await query
    .select("id, user_id, role, status, invited_email, created_at")
    .single();

  if (error) {
    return jsonError(error.message || "Unable to create invite.", 500);
  }

  return NextResponse.json({ member: data });
}
```

## app\api\workspace-members\mutate\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedRoles = new Set(["Owner", "Manager", "Employee"]);
const allowedStatuses = new Set(["Active", "Invited", "Removed"]);

type MemberMutationBody = {
  workspaceId?: string;
  memberId?: string;
  role?: string;
  status?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  let body: MemberMutationBody;
  try {
    body = (await request.json()) as MemberMutationBody;
  } catch {
    return jsonError("Invalid member mutation request.", 400);
  }

  if (!body.workspaceId || !body.memberId) {
    return jsonError("Workspace and member are required.", 400);
  }

  if (body.role && !allowedRoles.has(body.role)) {
    return jsonError("Unsupported role.", 400);
  }

  if (body.status && !allowedStatuses.has(body.status)) {
    return jsonError("Unsupported status.", 400);
  }

  if (!body.role && !body.status) {
    return jsonError("Role or status is required.", 400);
  }

  const serviceClient = createServiceRoleClient();

  const { data: actor, error: actorError } = await serviceClient
    .from("workspace_members")
    .select("id, role, status")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (actorError || !actor) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  if (actor.role !== "Owner" && actor.role !== "Manager") {
    return jsonError("Only Owners and Managers can manage members.", 403);
  }

  const { data: target, error: targetError } = await serviceClient
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, status, invited_email, created_at")
    .eq("id", body.memberId)
    .eq("workspace_id", body.workspaceId)
    .maybeSingle();

  if (targetError || !target) return jsonError("Member not found.", 404);

  const demotesOwner = target.role === "Owner" && body.role && body.role !== "Owner";
  const removesOwner = target.role === "Owner" && body.status === "Removed";

  if (demotesOwner || removesOwner) {
    const { count, error: countError } = await serviceClient
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", body.workspaceId)
      .eq("role", "Owner")
      .neq("status", "Removed");

    if (countError) return jsonError("Unable to verify workspace owners.", 500);
    if ((count ?? 0) <= 1) return jsonError("Cannot change the last Owner.", 400);
  }

  const updates: Record<string, string> = {};
  if (body.role) updates.role = body.role;
  if (body.status) updates.status = body.status;

  const { data, error } = await serviceClient
    .from("workspace_members")
    .update(updates)
    .eq("id", body.memberId)
    .eq("workspace_id", body.workspaceId)
    .select("id, user_id, role, status, invited_email, created_at")
    .single();

  if (error) return jsonError(error.message || "Unable to update member.", 500);

  return NextResponse.json({ member: data });
}
```

## app\api\workspaces\route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateWorkspaceRequest = {
  id?: string;
  name?: string;
  type?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to create a workspace.", 401);
  }

  let body: CreateWorkspaceRequest;
  try {
    body = (await request.json()) as CreateWorkspaceRequest;
  } catch {
    return jsonError("Invalid workspace request.", 400);
  }

  const workspaceId = body.id || crypto.randomUUID();
  const workspaceName = body.name?.trim();
  const workspaceType = body.type?.trim() || "Other";

  if (!workspaceName) {
    return jsonError("Workspace name is required.", 400);
  }

  const serviceClient = createServiceRoleClient();

  const { data: workspace, error: workspaceError } = await serviceClient
    .from("workspaces")
    .insert({
      id: workspaceId,
      name: workspaceName,
      type: workspaceType,
      created_by: user.id,
    })
    .select("id, name, type")
    .single();

  if (workspaceError || !workspace) {
    return jsonError(workspaceError?.message || "Unable to create workspace.", 500);
  }

  const { error: memberError } = await serviceClient
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "Owner",
      status: "Active",
    });

  if (memberError) {
    await serviceClient.from("workspaces").delete().eq("id", workspace.id);
    return jsonError(memberError.message || "Unable to create owner membership.", 500);
  }

  const { error: settingsError } = await serviceClient
    .from("workspace_settings")
    .insert({
      workspace_id: workspace.id,
      workspace_nickname: workspace.name,
      business_type: workspace.type,
    });

  if (settingsError) {
    await serviceClient.from("workspaces").delete().eq("id", workspace.id);
    return jsonError(settingsError.message || "Unable to initialize workspace settings.", 500);
  }

  return NextResponse.json({ workspace });
}

export async function GET() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to load workspaces.", 401);
  }

  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, type)")
    .eq("user_id", user.id)
    .eq("status", "Active")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message || "Unable to load workspaces.", 500);
  }

  const workspaces = (data ?? [])
    .map((row) => {
      const workspace = Array.isArray(row.workspaces)
        ? row.workspaces[0]
        : row.workspaces;
      return workspace
        ? { id: workspace.id, name: workspace.name, type: workspace.type, role: row.role }
        : null;
    })
    .filter(Boolean);

  return NextResponse.json({ workspaces });
}

export async function DELETE(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to delete a workspace.", 401);
  }

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const serviceClient = createServiceRoleClient();
  const { data: membership, error: membershipError } = await serviceClient
    .from("workspace_members")
    .select("id, role, status")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  if (membership.role !== "Owner") {
    return jsonError("Only Owners can delete a workspace.", 403);
  }

  const { error } = await serviceClient
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) return jsonError(error.message || "Unable to delete workspace.", 500);

  return NextResponse.json({ deleted: true });
}
```

## app\calendar\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import type { Job } from "@/lib/jobTypes";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createCalendarEventAction } from "@/lib/actions/calendar";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createCalendarEventsRepository, type ClientCalendarEvent } from "@/lib/db/calendarEvents";
import { createClientsRepository } from "@/lib/db/clients";
import { createJobsRepository } from "@/lib/db/jobs";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

function getJobColor(status: string) {
  switch (status) {
    case "Lead":
      return "bg-gray-500";
    case "Quoted":
      return "bg-yellow-500";
    case "Scheduled":
      return "bg-blue-500";
    case "Completed":
      return "bg-green-500";
    case "Paid":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(value?: string) {
  if (!value) return "Unscheduled time";
  const [hourValue, minute = "00"] = value.split(":");
  const hour = Number(hourValue);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function scheduleKey(date: string, time?: string) {
  return `${date}T${time || "23:59"}`;
}

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [view, setView] = useState("month");
  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localClientEvents, setLocalClientEvents] = useStoredJsonState<
    ClientCalendarEvent[]
  >(storageKeys.clientCalendarEvents, []);
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [databaseClientEvents, setDatabaseClientEvents] = useState<ClientCalendarEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => formatDateString(new Date()));

  const [clientEventOpen, setClientEventOpen] = useState(false);
  const [clientEventClientId, setClientEventClientId] = useState("");
  const [clientEventTitle, setClientEventTitle] = useState("");
  const [clientEventDate, setClientEventDate] = useState("");
  const [clientEventTime, setClientEventTime] = useState("");
  const clientEventClientRef = useRef<HTMLSelectElement | null>(null);
  const clientEventTitleRef = useRef<HTMLInputElement | null>(null);
  const clientEventDateRef = useRef<HTMLInputElement | null>(null);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const eventsRepo = useMemo(() => createCalendarEventsRepository({ isSignedIn: isDatabaseMode, supabase, localEvents: localClientEvents, setLocalEvents: setLocalClientEvents }), [isDatabaseMode, localClientEvents, setLocalClientEvents, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const clientEvents = isDatabaseMode ? databaseClientEvents : localClientEvents;
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([
      clientsRepo.getClients(activeWorkspace.id),
      eventsRepo.getEvents(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
    ]).then(([clients, events, jobs]) => {
      if (!cancelled) { setDatabaseClientItems(clients); setDatabaseClientEvents(events); setDatabaseJobItems(jobs); }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load calendar.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, eventsRepo, isDatabaseMode, jobsRepo]);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .filter((job) => job.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const workspaceClientEvents = clientEvents
    .filter((event) => event.workspaceId === activeWorkspace.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthYear = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const firstDayOfMonth = new Date(monthYear, monthIndex, 1);
  const firstWeekdayIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstWeekdayIndex + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return new Date(monthYear, monthIndex, dayNumber);
  });

  function goToPreviousMonth() {
    if (view === "day") {
      const date = new Date(`${selectedDay}T00:00:00`);
      date.setDate(date.getDate() - 1);
      setSelectedDay(formatDateString(date));
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }
    setCurrentMonth(new Date(monthYear, monthIndex - 1, 1));
  }

  function goToNextMonth() {
    if (view === "day") {
      const date = new Date(`${selectedDay}T00:00:00`);
      date.setDate(date.getDate() + 1);
      setSelectedDay(formatDateString(date));
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }
    setCurrentMonth(new Date(monthYear, monthIndex + 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(formatDateString(today));
  }

  function saveClientEvents(updatedEvents: ClientCalendarEvent[]) {
    if (isDatabaseMode) setDatabaseClientEvents(updatedEvents);
    else setLocalClientEvents(updatedEvents);
  }

  function closeClientEventModal() {
    setClientEventOpen(false);
    setClientEventClientId("");
    setClientEventTitle("");
    setClientEventDate("");
    setClientEventTime("");
  }

  async function addClientEvent() {
    const selectedClientId = clientEventClientId || clientEventClientRef.current?.value || "";
    const selectedDate = clientEventDate || clientEventDateRef.current?.value || "";
    const selectedTitle = clientEventTitle || clientEventTitleRef.current?.value || "";
    const selectedClient = workspaceClients.find((client) => client.id === selectedClientId);
    if (!selectedClient || !selectedDate) {
      setDataError("Choose a client and date before adding a calendar event.");
      return;
    }

    const newEvent: ClientCalendarEvent = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      title: selectedTitle.trim() || "Client Follow-up",
      date: selectedDate,
      time: clientEventTime,
    };

    try {
      const result = await createCalendarEventAction(eventsRepo, newEvent);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseClientEvents((current) => [...current, created]);
      else saveClientEvents([...clientEvents, created]);
      setDataError("");
      closeClientEventModal();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to create calendar event.");
    }
  }

  function getClientEventDisplayName(event: ClientCalendarEvent) {
    const client = workspaceClients.find((item) => item.id === event.clientId);
    return client?.name ?? event.clientName;
  }

  const currentMonthJobs = workspaceJobs.filter((job) => {
    const jobDate = new Date(`${job.date}T00:00:00`);
    return jobDate.getFullYear() === monthYear && jobDate.getMonth() === monthIndex;
  });

  const currentMonthClientEvents = workspaceClientEvents.filter((event) => {
    const eventDate = new Date(`${event.date}T00:00:00`);
    return eventDate.getFullYear() === monthYear && eventDate.getMonth() === monthIndex;
  });

  const agendaItems = [
    ...workspaceJobs.map((job) => ({ type: "job" as const, date: job.date, time: job.time, job })),
    ...workspaceClientEvents.map((event) => ({ type: "client" as const, date: event.date, time: event.time, event })),
  ].sort((a, b) => scheduleKey(a.date, a.time).localeCompare(scheduleKey(b.date, b.time)));

  const weekItems = agendaItems.slice(0, 7);
  const dayItems = agendaItems.filter((item) => item.date === selectedDay);

  function openDay(dayString: string) {
    setSelectedDay(dayString);
    setView("day");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={goToPreviousMonth} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Prev</button>
          <button type="button" onClick={goToToday} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Today</button>
          <button type="button" onClick={goToNextMonth} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">Next</button>
          <select value={view} onChange={(event) => setView(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
            <option value="month">Month View</option>
            <option value="day">Day View</option>
            <option value="week">Week View</option>
            <option value="agenda">Agenda View</option>
          </select>
          <button type="button" onClick={() => setClientEventOpen(true)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Client Event</button>
        </div>
      </div>

      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading calendar...
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        {view === "month" && (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-gray-100">{formatMonthLabel(currentMonth)}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentMonthJobs.length} job(s), {currentMonthClientEvents.length} client event(s)
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[900px] grid-cols-7 gap-1 lg:gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => <div key={dayName} className="p-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{dayName}</div>)}

                {calendarDays.map((day, index) => {
                  const dayString = day ? formatDateString(day) : "";
                  const dayJobs = workspaceJobs.filter((job) => job.date === dayString);
                  const dayClientEvents = workspaceClientEvents.filter((event) => event.date === dayString);

                  return (
                    <div key={index} className="min-h-24 rounded-lg border border-gray-200 p-2 dark:border-gray-800 lg:min-h-28">
                      {day ? (
                        <button type="button" onClick={() => openDay(dayString)} className="font-semibold text-gray-950 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400">{day.getDate()}</button>
                      ) : null}
                      {[...dayJobs.map((job) => ({ type: "job" as const, time: job.time, job })), ...dayClientEvents.map((event) => ({ type: "client" as const, time: event.time, event }))]
                        .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"))
                        .slice(0, 2)
                        .map((item) => item.type === "job" ? (
                          <Link key={item.job.id} href={`/jobs/${item.job.id}`} className={`mt-1 block truncate rounded px-2 py-1 text-xs font-medium text-white hover:opacity-90 ${getJobColor(item.job.status)}`}>{item.job.time ? `${formatTime(item.job.time)} · ` : ""}{item.job.name}</Link>
                        ) : (
                          <Link key={item.event.id} href={`/clients/${item.event.clientId}`} className="mt-1 block truncate rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:opacity-90">{item.event.time ? `${formatTime(item.event.time)} · ` : ""}{item.event.title}</Link>
                        ))}
                      {dayJobs.length + dayClientEvents.length > 2 && (
                        <button type="button" onClick={() => openDay(dayString)} className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-800">+{dayJobs.length + dayClientEvents.length - 2} more</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view === "day" && (
          <div>
            <div className="mb-5 flex flex-col gap-1 border-b border-gray-200 pb-4 dark:border-gray-800">
              <h2 className="text-2xl font-bold">{new Date(`${selectedDay}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{dayItems.length} scheduled item(s)</p>
            </div>
            <div className="space-y-3">
              {dayItems.length ? dayItems.map((item) => item.type === "job" ? (
                <Link key={`day-job-${item.job.id}`} href={`/jobs/${item.job.id}`} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 sm:flex-row sm:items-center">
                  <div className="w-28 shrink-0 font-bold text-blue-600 dark:text-blue-400">{formatTime(item.job.time)}</div>
                  <div className="min-w-0 flex-1"><div className="font-semibold">{item.job.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{item.job.client}</div></div>
                  <span className={`self-start rounded px-3 py-1 text-xs font-medium text-white sm:self-auto ${getJobColor(item.job.status)}`}>{item.job.status}</span>
                </Link>
              ) : (
                <Link key={`day-client-${item.event.id}`} href={`/clients/${item.event.clientId}`} className="flex flex-col gap-3 rounded-lg border border-teal-200 p-4 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30 sm:flex-row sm:items-center">
                  <div className="w-28 shrink-0 font-bold text-teal-700 dark:text-teal-300">{formatTime(item.event.time)}</div>
                  <div><div className="font-semibold">{item.event.title}</div><div className="text-sm text-gray-500 dark:text-gray-400">{getClientEventDisplayName(item.event)}</div></div>
                </Link>
              )) : <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">Nothing scheduled for this day.</div>}
            </div>
          </div>
        )}

        {view !== "month" && view !== "day" && (
          <div className="space-y-3">
            {(view === "week" ? weekItems : agendaItems).length > 0 ? (
              (view === "week" ? weekItems : agendaItems).map((item) =>
                item.type === "job" ? (
                  <Link key={`job-${item.job.id}`} href={`/jobs/${item.job.id}`} className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-blue-600 hover:underline dark:text-blue-400">{item.job.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{item.job.date} · {formatTime(item.job.time)}</div></div>
                      <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getJobColor(item.job.status)}`}>{item.job.status}</span>
                    </div>
                  </Link>
                ) : (
                  <Link key={`client-${item.event.id}`} href={`/clients/${item.event.clientId}`} className="block rounded-xl border border-teal-200 p-4 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30">
                    <div className="font-semibold text-teal-700 dark:text-teal-300">{item.event.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{getClientEventDisplayName(item.event)} - {item.event.date} · {formatTime(item.event.time)}</div>
                  </Link>
                )
              )
            ) : (
              <div className="text-center text-lg text-gray-500 dark:text-gray-400">No calendar items for {workspaceDisplayName}</div>
            )}
          </div>
        )}
      </div>

      {clientEventOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Add Client to Calendar</h2>
              <button type="button" onClick={closeClientEventModal} className="text-2xl text-gray-500">-</button>
            </div>
            <div className="space-y-4">
              <select ref={clientEventClientRef} value={clientEventClientId} onChange={(event) => setClientEventClientId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <option value="">Select Client</option>
                {workspaceClients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
              <input ref={clientEventTitleRef} type="text" value={clientEventTitle} onChange={(event) => setClientEventTitle(event.target.value)} placeholder="Follow-up, estimate, walkthrough..." className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input ref={clientEventDateRef} type="date" value={clientEventDate} onChange={(event) => setClientEventDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <input type="time" value={clientEventTime} onChange={(event) => setClientEventTime(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <button type="button" onClick={addClientEvent} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">Add to Calendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\clients\[id]\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import DocumentAttachments from "@/app/documents/DocumentAttachments";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ClientPage() {
  const params = useParams();
  const id = String(params.id);
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localClients, setLocalClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClient, setDatabaseClient] = useState<ClientRow | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [clientLoadError, setClientLoadError] = useState<string | null>(null);
  const [localJobs, setLocalJobs] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseJobs, setDatabaseJobs] = useState<Job[]>([]);
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const clientsRepository = useMemo(
    () =>
      createClientsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localClients,
        setLocalClients,
      }),
    [isDatabaseMode, localClients, setLocalClients, supabase]
  );
  const jobsRepository = useMemo(
    () =>
      createJobsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localJobs,
        setLocalJobs,
      }),
    [isDatabaseMode, localJobs, setLocalJobs, supabase]
  );
  const invoicesRepository = useMemo(
    () =>
      createInvoicesRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localInvoices,
        setLocalInvoices,
      }),
    [isDatabaseMode, localInvoices, setLocalInvoices, supabase]
  );

  useEffect(() => {
    if (!isDatabaseMode) {
      return;
    }

    let cancelled = false;

    async function loadClient() {
      setIsLoadingClient(true);
      const loadedClient = await clientsRepository.getClientById(
        id,
        activeWorkspace.id
      );

      if (!cancelled) {
        setDatabaseClient(loadedClient);
        setClientLoadError(null);
        if (loadedClient) {
          const [jobs, invoices] = await Promise.all([
            jobsRepository.getJobs(loadedClient.workspaceId),
            invoicesRepository.getInvoices(loadedClient.workspaceId),
          ]);
          if (!cancelled) {
            setDatabaseJobs(jobs);
            setDatabaseInvoices(invoices);
          }
        }
      }
    }

    loadClient()
      .catch((error) => {
        console.error("Unable to load client.", error);

        if (!cancelled) {
          setClientLoadError("Unable to load client.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingClient(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, clientsRepository, id, invoicesRepository, isDatabaseMode, jobsRepository]);

  const client = isDatabaseMode
    ? databaseClient
    : localClients.find((clientItem) => clientItem.id === id);
  const jobs = isDatabaseMode ? databaseJobs : localJobs;
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;

  const clientJobs = useMemo(() => {
    if (!client) return [];
    return jobs.filter(
      (job) =>
        job.workspaceId === client.workspaceId &&
        (job.clientId === client.id ||
          (!job.clientId &&
            job.client.trim().toLowerCase() ===
              client.name.trim().toLowerCase()))
    );
  }, [client, jobs]);

  const clientInvoices = useMemo(() => {
    if (!client) return [];
    return invoices.filter(
      (invoice) =>
        invoice.workspaceId === client.workspaceId &&
        (invoice.sourceClientId === client.id ||
          invoice.billToName.trim().toLowerCase() === client.name.trim().toLowerCase() ||
          invoice.billToCompany.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [client, invoices]);

  const invoiceTotal = clientInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  if (isLoadingClient) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>
        <h1 className="text-3xl font-bold">Loading client...</h1>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>
        <h1 className="text-3xl font-bold">Client not found</h1>
        {clientLoadError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {clientLoadError}
          </p>
        )}
      </div>
    );
  }

  const addressParts = [client.address, client.city, client.state, client.zip].filter(Boolean);

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <Link href="/clients" className="text-blue-600 hover:underline dark:text-blue-400">- Back to Clients</Link>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{client.status}</p>
          </div>
          <div className="text-right text-lg font-bold">{client.balance}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p><strong>Phone:</strong> {client.phone || "-"}</p>
          <p><strong>Email:</strong> {client.email || "-"}</p>
          <p className="sm:col-span-2"><strong>Address:</strong> {addressParts.length > 0 ? addressParts.join(", ") : "-"}</p>
          {client.notes && <p className="sm:col-span-2"><strong>Notes:</strong> {client.notes}</p>}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Jobs</h2>
        {clientJobs.length > 0 ? (
          <div className="space-y-3">
            {clientJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{job.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.status} - {job.date || "No date"}</div>
                  </div>
                  <div className="font-bold">{job.value}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No jobs found for this client.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <div className="font-bold">Total: {formatCurrency(invoiceTotal)}</div>
        </div>

        {clientInvoices.length > 0 ? (
          <div className="space-y-3">
            {clientInvoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.status} - {invoice.invoiceDate}</div>
                  </div>
                  <div className="font-bold">{formatCurrency(getInvoiceTotals(invoice).total)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No invoices found for this client.</p>
        )}
      </div>

      <DocumentAttachments
        workspaceId={client.workspaceId}
        clientId={client.id}
        title="Client Documents"
      />
    </div>
  );
}
```

## app\clients\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/lib/actions/clients";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { consumeAiFormHydration, payloadNumber, payloadString } from "@/lib/ai/formHydration";
import { createClientsRepository } from "@/lib/db/clients";
import { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

type ClientLinkedJob = Job & {
  clientId?: string;
};

type StoredDocument = {
  id: string;
  workspaceId: string;
  clientId: string;
};

type ClientCalendarEvent = {
  id: string;
  workspaceId: string;
  clientId: string;
};

const clientStatuses = ["Lead", "Active", "Inactive"] as const;

type ClientStatusPriority = "default" | (typeof clientStatuses)[number];

function formatMoney(value: string) {
  const numericValue = Number(value.replace(/[$,]/g, ""));

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return `$${numericValue.toLocaleString()}`;
}

function getStatusClasses(status: string) {
  if (status === "Active") {
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  }

  if (status === "Lead") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  }

  if (status === "Inactive") {
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function isJobLinkedToClient(job: ClientLinkedJob, client: ClientRow) {
  if (job.workspaceId !== client.workspaceId) return false;
  if (job.clientId) return job.clientId === client.id;

  // Legacy localStorage jobs may only have a client name snapshot.
  return normalizeName(job.client) === normalizeName(client.name);
}

function isInvoiceLinkedToClient(invoice: InvoiceRow, client: ClientRow) {
  if (invoice.workspaceId !== client.workspaceId) return false;
  if (invoice.sourceClientId) return invoice.sourceClientId === client.id;

  // Legacy/manual invoices may only have bill-to names.
  const clientName = normalizeName(client.name);

  return (
    normalizeName(invoice.billToName ?? "") === clientName ||
    normalizeName(invoice.billToCompany ?? "") === clientName
  );
}

export default function ClientsPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientLoadError, setClientLoadError] = useState<string | null>(null);
  const [jobItems] = useStoredJsonState<ClientLinkedJob[]>(
    storageKeys.jobs,
    []
  );
  const [invoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [documentItems] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [clientEventItems] = useStoredJsonState<ClientCalendarEvent[]>(
    storageKeys.clientCalendarEvents,
    []
  );
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [statusPriority, setStatusPriority] =
    useState<ClientStatusPriority>("default");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientStatus, setClientStatus] =
    useState<(typeof clientStatuses)[number]>("Active");
  const [clientBalance, setClientBalance] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const clientsRepository = useMemo(
    () =>
      createClientsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localClients: localClientItems,
        setLocalClients: setLocalClientItems,
      }),
    [isDatabaseMode, localClientItems, setLocalClientItems, supabase]
  );
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;

  useEffect(() => {
    const hydration = consumeAiFormHydration("client", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      setClientName(payloadString(hydration.payload, "name"));
      setClientEmail(payloadString(hydration.payload, "email"));
      setClientPhone(payloadString(hydration.payload, "phone"));
      setClientAddress(payloadString(hydration.payload, "address"));
      setClientCity(payloadString(hydration.payload, "city"));
      setClientState(payloadString(hydration.payload, "state"));
      setClientZip(payloadString(hydration.payload, "zip"));
      setClientNotes(payloadString(hydration.payload, "notes"));
      const balance = payloadNumber(hydration.payload, "balance");
      setClientBalance(balance === null ? "" : String(balance));
      setNewClientOpen(true);
    });
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (!isDatabaseMode) {
      return;
    }

    let cancelled = false;

    async function loadClients() {
      setIsLoadingClients(true);
      setClientLoadError(null);
      const clients = await clientsRepository.getClients(activeWorkspace.id);

      if (!cancelled) {
        setDatabaseClientItems(clients);
      }
    }

    loadClients().catch((error) => {
      console.error("Unable to load clients.", error);

      if (!cancelled) {
        setClientLoadError(
          error instanceof Error ? error.message : "Unable to load clients."
        );
      }
    }).finally(() => {
      if (!cancelled) {
        setIsLoadingClients(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, clientsRepository, isDatabaseMode]);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const sortedWorkspaceClients = [...workspaceClients].sort((a, b) => {
    if (statusPriority === "default") {
      return a.name.localeCompare(b.name);
    }

    if (a.status === statusPriority && b.status !== statusPriority) {
      return -1;
    }

    if (a.status !== statusPriority && b.status === statusPriority) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  const allWorkspaceClientsSelected =
    workspaceClients.length > 0 &&
    workspaceClients.every((client) => selectedClients.includes(client.id));

  const selectedClientRows = workspaceClients.filter((client) =>
    selectedClients.includes(client.id)
  );

  const deleteDependencyWarnings = selectedClientRows
    .map((client) => {
      const jobs = jobItems.filter((job) =>
        isJobLinkedToClient(job, client)
      ).length;
      const invoices = invoiceItems.filter((invoice) =>
        isInvoiceLinkedToClient(invoice, client)
      ).length;
      const documents = documentItems.filter(
        (document) =>
          document.workspaceId === client.workspaceId &&
          document.clientId === client.id
      ).length;
      const events = clientEventItems.filter(
        (event) =>
          event.workspaceId === client.workspaceId && event.clientId === client.id
      ).length;

      return {
        client,
        jobs,
        invoices,
        documents,
        events,
        total: jobs + invoices + documents + events,
      };
    })
    .filter((warning) => warning.total > 0);

  const totalOrphanedItems = deleteDependencyWarnings.reduce(
    (total, warning) => total + warning.total,
    0
  );

  function cycleStatusPriority() {
    setStatusPriority((current) => {
      if (current === "default") return "Active";
      if (current === "Active") return "Lead";
      if (current === "Lead") return "Inactive";
      return "default";
    });
  }

  function getStatusSortLabel() {
    if (statusPriority === "default") {
      return "Default";
    }

    return `${statusPriority} first`;
  }

  function resetClientForm() {
    setClientName("");
    setClientStatus("Active");
    setClientBalance("");
    setClientEmail("");
    setClientPhone("");
    setClientAddress("");
    setClientCity("");
    setClientState("");
    setClientZip("");
    setClientNotes("");
    setEditingClientId("");
  }

  function closeClientModals() {
    setNewClientOpen(false);
    setEditClientOpen(false);
    resetClientForm();
  }

  function toggleClient(clientId: string) {
    setSelectedClients((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId]
    );
  }

  function toggleAllWorkspaceClients() {
    if (allWorkspaceClientsSelected) {
      setSelectedClients((current) =>
        current.filter(
          (clientId) =>
            !workspaceClients.some((client) => client.id === clientId)
        )
      );

      return;
    }

    setSelectedClients((current) => {
      const workspaceClientIds = workspaceClients.map((client) => client.id);

      const preservedOtherWorkspaceSelections = current.filter(
        (clientId) => !workspaceClientIds.includes(clientId)
      );

      return [...preservedOtherWorkspaceSelections, ...workspaceClientIds];
    });
  }

  function clientNameAlreadyExists(name: string, ignoredClientId?: string) {
    return workspaceClients.some(
      (client) =>
        client.id !== ignoredClientId &&
        client.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  }

  async function addClient() {
    if (!clientName.trim()) return;
    if (clientNameAlreadyExists(clientName)) return;

    const newClient: ClientRow = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: clientName.trim(),
      status: clientStatus,
      balance: formatMoney(clientBalance || "0"),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim(),
      city: clientCity.trim(),
      state: clientState.trim(),
      zip: clientZip.trim(),
      notes: clientNotes.trim(),
    };

    try {
      const result = await createClientAction(clientsRepository, newClient);

      if (!result.ok) {
        setClientLoadError(result.error);
        return;
      }

      const createdClient = result.data;

      if (isDatabaseMode) {
        setDatabaseClientItems((current) => [...current, createdClient]);
      }

      setClientLoadError(null);
      closeClientModals();
    } catch (error) {
      setClientLoadError(
        error instanceof Error ? error.message : "Unable to create client."
      );
    }
  }

  function openEditClient(client: ClientRow) {
    setEditingClientId(client.id);
    setClientName(client.name);
    setClientStatus(
      clientStatuses.includes(client.status as (typeof clientStatuses)[number])
        ? (client.status as (typeof clientStatuses)[number])
        : "Active"
    );
    setClientBalance(client.balance.replace(/[$,]/g, ""));
    setClientEmail(client.email ?? "");
    setClientPhone(client.phone ?? "");
    setClientAddress(client.address ?? "");
    setClientCity(client.city ?? "");
    setClientState(client.state ?? "");
    setClientZip(client.zip ?? "");
    setClientNotes(client.notes ?? "");
    setEditClientOpen(true);
  }

  async function saveEditedClient() {
    if (!editingClientId) return;
    if (!clientName.trim()) return;
    if (clientNameAlreadyExists(clientName, editingClientId)) return;

    const existingClient = clientItems.find(
      (client) => client.id === editingClientId
    );

    if (!existingClient) return;

    const updatedClient = {
      ...existingClient,
      name: clientName.trim(),
      status: clientStatus,
      balance: formatMoney(clientBalance || "0"),
      email: clientEmail.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim(),
      city: clientCity.trim(),
      state: clientState.trim(),
      zip: clientZip.trim(),
      notes: clientNotes.trim(),
    };

    try {
      const result = await updateClientAction(clientsRepository, updatedClient);

      if (!result.ok) {
        setClientLoadError(result.error);
        return;
      }

      const savedClient = result.data;

      if (isDatabaseMode) {
        setDatabaseClientItems((current) =>
          current.map((client) =>
            client.id === savedClient.id ? savedClient : client
          )
        );
      }

      setClientLoadError(null);
      closeClientModals();
    } catch (error) {
      setClientLoadError(
        error instanceof Error ? error.message : "Unable to update client."
      );
    }
  }

  async function removeSelectedClients() {
    if (!canDeleteBusinessRecords) return;

    try {
      const deleteResults = await Promise.all(
        selectedClientRows.map(async (client) => ({
          id: client.id,
          result: await deleteClientAction(
            clientsRepository,
            client.id,
            client.workspaceId
          ),
        }))
      );
      const deletedClientIds = deleteResults
        .filter((result) => result.result.ok)
        .map((result) => result.id);
      const failedDelete = deleteResults.find((result) => !result.result.ok);

      if (failedDelete && !deletedClientIds.length) {
        setClientLoadError(
          failedDelete.result.ok
            ? "Unable to delete clients."
            : failedDelete.result.error
        );
        return;
      }

      if (isDatabaseMode) {
        setDatabaseClientItems((current) =>
          current.filter((client) => !deletedClientIds.includes(client.id))
        );
      }

      setSelectedClients((current) =>
        current.filter((clientId) => !deletedClientIds.includes(clientId))
      );
      setClientLoadError(null);
      setShowDeleteModal(false);
    } catch (error) {
      setClientLoadError(
        error instanceof Error ? error.message : "Unable to delete clients."
      );
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewClientOpen(true)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            + Add Client
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={selectedClients.length === 0 || !canDeleteBusinessRecords}
            className="rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Client
          </button>
        </div>
      </div>

      {selectedClients.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedClients.length} client
          {selectedClients.length === 1 ? "" : "s"} selected
        </div>
      )}

      {clientLoadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {clientLoadError}
        </div>
      )}

      {isLoadingClients && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading clients...
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[1050px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allWorkspaceClientsSelected}
                  onChange={toggleAllWorkspaceClients}
                  disabled={workspaceClients.length === 0}
                  className="h-4 w-4"
                />
              </th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">
                <button
                  type="button"
                  onClick={cycleStatusPriority}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Cycle status priority"
                >
                  <span>Status</span>
                  <span className="text-xs">
                    {statusPriority === "default" ? "-" : "-"}
                  </span>
                </button>

                <div className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                  {getStatusSortLabel()}
                </div>
              </th>

              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedWorkspaceClients.length > 0 ? (
              sortedWorkspaceClients.map((client) => {
                const addressParts = [
                  client.address,
                  client.city,
                  client.state,
                  client.zip,
                ].filter(Boolean);

                return (
                  <tr
                    key={client.id}
                    className="border-t border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-4 font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {client.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="p-4">{client.phone || "-"}</td>

                    <td className="p-4">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {client.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-4">
                      {addressParts.length > 0 ? addressParts.join(", ") : "-"}
                    </td>

                    <td className="p-4 text-right font-medium">
                      {client.balance}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditClient(client)}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No clients found for {workspaceDisplayName}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(newClientOpen || editClientOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                {editClientOpen ? "Edit Client" : "Add Client"}
              </h2>

              <button
                type="button"
                onClick={closeClientModals}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                -
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Client Name *
                </label>

                <input
                  type="text"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Jones Family"
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={clientStatus}
                    onChange={(event) =>
                      setClientStatus(
                        event.target.value as (typeof clientStatuses)[number]
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {clientStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Starting Balance
                  </label>

                  <input
                    type="number"
                    value={clientBalance}
                    onChange={(event) => setClientBalance(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Street Address
                </label>

                <input
                  type="text"
                  value={clientAddress}
                  onChange={(event) => setClientAddress(event.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_140px]">
                <div>
                  <label className="mb-2 block text-sm font-medium">City</label>

                  <input
                    type="text"
                    value={clientCity}
                    onChange={(event) => setClientCity(event.target.value)}
                    placeholder="Rochester Hills"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">State</label>

                  <input
                    type="text"
                    value={clientState}
                    onChange={(event) => setClientState(event.target.value)}
                    placeholder="MI"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">ZIP</label>

                  <input
                    type="text"
                    value={clientZip}
                    onChange={(event) => setClientZip(event.target.value)}
                    placeholder="48307"
                    className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>

                <textarea
                  rows={4}
                  value={clientNotes}
                  onChange={(event) => setClientNotes(event.target.value)}
                  placeholder="Gate code, preferred contact method, billing notes..."
                  className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeClientModals}
                  className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={editClientOpen ? saveEditedClient : addClient}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editClientOpen ? "Save Changes" : "Add Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Remove Clients
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to remove the selected client(s)?
            </p>

            {deleteDependencyWarnings.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="font-semibold">
                  This will leave linked records orphaned.
                </div>

                <p className="mt-1">
                  Deletion is still allowed, but these records will no longer
                  have an active client:
                </p>

                <div className="mt-3 space-y-2">
                  {deleteDependencyWarnings.map((warning) => (
                    <div
                      key={warning.client.id}
                      className="rounded-md bg-white/70 p-3 dark:bg-gray-900/60"
                    >
                      <div className="font-semibold">
                        {warning.client.name}
                      </div>

                      <div className="mt-1 text-xs">
                        {warning.jobs} job(s), {warning.invoices} invoice(s),{" "}
                        {warning.documents} document(s), {warning.events}{" "}
                        calendar event(s)
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 font-semibold">
                  {totalOrphanedItems} linked record(s) affected.
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={removeSelectedClients}
                disabled={!canDeleteBusinessRecords}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\dashboard\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import StatCard from "../../components/Statcard";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import type { Expense } from "@/lib/expenseTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createExpensesRepository, type ExpenseRow } from "@/lib/db/expenses";
import { createInventoryRepository, type InventoryRow } from "@/lib/db/inventory";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import { getInvoiceTotals, InvoiceRow } from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localInvoiceItems, setLocalInvoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [localInventoryItems, setLocalInventoryItems] = useStoredJsonState<InventoryRow[]>(
    storageKeys.inventory,
    []
  );
  const [localExpenseItems, setLocalExpenseItems] = useStoredJsonState<Expense[]>(
    storageKeys.expenses,
    []
  );
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [databaseInvoiceItems, setDatabaseInvoiceItems] = useState<InvoiceRow[]>([]);
  const [databaseInventoryItems, setDatabaseInventoryItems] = useState<InventoryRow[]>([]);
  const [databaseExpenseItems, setDatabaseExpenseItems] = useState<ExpenseRow[]>([]);
  const [dataError, setDataError] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localInvoiceItems, setLocalInvoices: setLocalInvoiceItems }), [isDatabaseMode, localInvoiceItems, setLocalInvoiceItems, supabase]);
  const inventoryRepo = useMemo(() => createInventoryRepository({ isSignedIn: isDatabaseMode, supabase, localItems: localInventoryItems, setLocalItems: setLocalInventoryItems }), [isDatabaseMode, localInventoryItems, setLocalInventoryItems, supabase]);
  const expensesRepo = useMemo(() => createExpensesRepository({ isSignedIn: isDatabaseMode, supabase, localExpenses: localExpenseItems as ExpenseRow[], setLocalExpenses: setLocalExpenseItems as (value: ExpenseRow[] | ((current: ExpenseRow[]) => ExpenseRow[])) => void }), [isDatabaseMode, localExpenseItems, setLocalExpenseItems, supabase]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([
      jobsRepo.getJobs(activeWorkspace.id),
      clientsRepo.getClients(activeWorkspace.id),
      invoicesRepo.getInvoices(activeWorkspace.id),
      inventoryRepo.getInventoryItems(activeWorkspace.id),
      expensesRepo.getExpenses(activeWorkspace.id),
    ]).then(([jobs, clients, invoices, inventory, expenses]) => {
      if (!cancelled) {
        setDatabaseJobItems(jobs);
        setDatabaseClientItems(clients);
        setDatabaseInvoiceItems(invoices);
        setDatabaseInventoryItems(inventory);
        setDatabaseExpenseItems(expenses);
        setDataError("");
      }
    }).catch((error) => {
      if (!cancelled) {
        setDataError(error instanceof Error ? error.message : "Unable to load dashboard data.");
      }
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, expensesRepo, inventoryRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const invoiceItems = isDatabaseMode ? databaseInvoiceItems : localInvoiceItems;
  const inventoryItems = isDatabaseMode ? databaseInventoryItems : localInventoryItems;
  const expenseItems = isDatabaseMode ? databaseExpenseItems : localExpenseItems;

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );

  const workspaceInvoices = invoiceItems.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const workspaceInventory = inventoryItems.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );

  const activeClients = workspaceClients.length;

  const openQuotes = workspaceJobs.filter(
    (job) => job.status === "Quoted"
  ).length;

  const scheduledJobs = workspaceJobs.filter(
    (job) => job.status === "Scheduled"
  ).length;

  const outstandingInvoices = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  const inventoryAlerts = workspaceInventory.filter(
    (item) => item.warning
  ).length;

  const recentActivity = [
    `- ${activeClients} active client(s)`,
    `- ${workspaceJobs.length} total job(s)`,
    `- ${openQuotes} open quote(s)`,
    `- ${scheduledJobs} scheduled job(s)`,
    `- ${inventoryAlerts} inventory alert(s)`,
    `- ${workspaceInvoices.length} invoice(s) in system`,
    `- ${formatMoney(totalExpenses)} tracked expense(s)`,
  ];

  return (
    <div className="w-full max-w-full">
      {!user && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Local demo mode stores data only in this browser. Sign in to use cloud storage, OCR, speech, AI drafts, and external route services.
        </div>
      )}
      {dataError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}


      <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold text-gray-950 dark:text-gray-100">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/clients"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Client
          </Link>

          <Link
            href="/jobs"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Job
          </Link>

          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Invoice
          </Link>

          {user ? (
            <Link
              href="/review#audio-intake"
              title="Upload audio for transcription and review"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Speech
            </Link>
          ) : (
            <button type="button" disabled title="Sign in to use speech transcription" className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Speech</button>
          )}
          <Link
            href="/documents"
            title="Upload a document for OCR extraction"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Image
          </Link>
        </div>
      </div>

      <div
        className="mb-8"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "8px",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <StatCard title="Active Clients" value={String(activeClients)} />

        <StatCard title="Open Quotes" value={String(openQuotes)} />

        <StatCard
          title="Outstanding Invoices"
          value={formatMoney(outstandingInvoices)}
        />

        <StatCard title="Inventory Alerts" value={String(inventoryAlerts)} />
      </div>

      <div className="mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-950 dark:text-gray-100">
          Recent Activity
        </h2>

        <ul className="space-y-3 break-words text-gray-900 dark:text-gray-100">
          {recentActivity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## app\documents\DocumentAttachments.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { deleteDocumentAction } from "@/lib/actions/documents";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createDocumentsRepository, type StoredDocument } from "@/lib/db/documents";
import { createDocumentDownloadUrl, removeDocumentFile } from "@/lib/storage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type DocumentAttachmentsProps = {
  workspaceId: string;
  clientId?: string;
  jobId?: string;
  invoiceId?: string;
  title?: string;
};

function formatSize(value?: number) {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentAttachments({
  workspaceId,
  clientId = "",
  jobId = "",
  invoiceId = "",
  title = "Documents",
}: DocumentAttachmentsProps) {
  const { isSupabaseConfigured, user } = useAuthSession();
  const { canDeleteBusinessRecords } = useWorkspace();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const [error, setError] = useState("");

  const supabase = useMemo(
    () => (isDatabaseMode ? createBrowserSupabaseClient() : null),
    [isDatabaseMode]
  );
  const documentsRepo = useMemo(
    () =>
      createDocumentsRepository({
        isSignedIn: isDatabaseMode,
        supabase,
        localDocuments,
        setLocalDocuments,
      }),
    [isDatabaseMode, localDocuments, setLocalDocuments, supabase]
  );

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    documentsRepo
      .getDocuments(workspaceId)
      .then((items) => {
        if (!cancelled) setDatabaseDocuments(items);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load documents.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [documentsRepo, isDatabaseMode, workspaceId]);

  const documents = (isDatabaseMode ? databaseDocuments : localDocuments).filter((document) => {
    if (document.workspaceId !== workspaceId) return false;
    if (invoiceId) return document.invoiceId === invoiceId;
    if (jobId) return document.jobId === jobId;
    if (clientId) return document.clientId === clientId;
    return false;
  });

  async function downloadDocument(document: StoredDocument) {
    setError("");
    if (!isDatabaseMode || !supabase || !document.storagePath) {
      setError("This document does not have a stored cloud file yet.");
      return;
    }

    try {
      const url = await createDocumentDownloadUrl({ workspaceId: document.workspaceId, path: document.storagePath });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Unable to download document.");
    }
  }

  async function deleteDocument(document: StoredDocument) {
    if (!canDeleteBusinessRecords) return;

    setError("");
    if (!window.confirm(`Delete "${document.fileName || document.name}"? This cannot be undone.`)) return;

    try {
      if (isDatabaseMode && supabase && document.storagePath) {
        await removeDocumentFile({ workspaceId: document.workspaceId, path: document.storagePath });
      }
      const result = await deleteDocumentAction(
        documentsRepo,
        document.id,
        document.workspaceId
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (isDatabaseMode) {
        setDatabaseDocuments((current) => current.filter((item) => item.id !== document.id));
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete document.");
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      {documents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No documents attached.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{document.fileName || document.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {document.mimeType || "Unknown type"} - {formatSize(document.sizeBytes)} - {document.status || document.storageStatus || "Metadata available"}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => downloadDocument(document)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                  Download
                </button>
                <button type="button" onClick={() => deleteDocument(document)} disabled={!canDeleteBusinessRecords} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## app\documents\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
} from "@/lib/actions/documents";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import {
  createDocumentsRepository,
  type DocumentProcessingStatus,
  type StoredDocument,
} from "@/lib/db/documents";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import {
  DOCUMENT_STORAGE_BUCKET,
  buildDocumentStoragePath,
  createDocumentDownloadUrl,
  getDocumentEntity,
  removeDocumentFile,
  uploadDocumentFile,
} from "@/lib/storage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

type ApiDocument = {
  id: string;
  workspace_id: string;
  client_id: string | null;
  job_id: string | null;
  invoice_id?: string | null;
  name: string;
  detected_type: string | null;
  extraction_status: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
  uploaded_by?: string | null;
  status?: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  processing_status?: DocumentProcessingStatus | null;
  extracted_text?: string | null;
  extracted_json?: Record<string, unknown> | null;
  ocr_provider?: string | null;
  ai_job_id?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  confidence?: number | null;
  document_type?: string | null;
};

function getJobDisplayName(job: Job) {
  return job.name || "Untitled job";
}

function apiDocumentToStoredDocument(document: ApiDocument): StoredDocument {
  return {
    id: document.id,
    workspaceId: document.workspace_id,
    clientId: document.client_id ?? "",
    jobId: document.job_id ?? "",
    invoiceId: document.invoice_id ?? "",
    name: document.name,
    detectedType: document.detected_type ?? "Pending",
    extractionStatus: document.extraction_status ?? "Waiting for extraction",
    fileName: document.file_name ?? "No file selected",
    notes: document.notes ?? "",
    createdAt: document.created_at,
    uploadedBy: document.uploaded_by ?? "",
    status: document.status ?? "Metadata available",
    storageBucket: document.storage_bucket ?? "",
    storagePath: document.storage_path ?? "",
    mimeType: document.mime_type ?? "",
    sizeBytes: document.size_bytes ?? 0,
    storageStatus: document.storage_path ? "Stored" : "Pending storage setup",
    processingStatus: document.processing_status ?? "uploaded",
    extractedText: document.extracted_text ?? "",
    extractedJson: document.extracted_json ?? null,
    ocrProvider: document.ocr_provider ?? "",
    aiJobId: document.ai_job_id ?? "",
    reviewedAt: document.reviewed_at ?? "",
    reviewedBy: document.reviewed_by ?? "",
    confidence: document.confidence ?? null,
    documentType: document.document_type ?? document.detected_type ?? "",
  };
}

export default function DocumentsPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const [localClients, setLocalClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClients, setDatabaseClients] = useState<ClientRow[]>([]);
  const [localJobs, setLocalJobs] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [databaseJobs, setDatabaseJobs] = useState<Job[]>([]);
  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);

  const [documentName, setDocumentName] = useState("");
  const [detectedType, setDetectedType] = useState("Pending");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sizeBytes, setSizeBytes] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [jobId, setJobId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [documentNotice, setDocumentNotice] = useState("");
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [processingDocumentIds, setProcessingDocumentIds] = useState<string[]>([]);
  const [draftingDocumentIds, setDraftingDocumentIds] = useState<string[]>([]);
  const [analyzingImageDocumentIds, setAnalyzingImageDocumentIds] = useState<string[]>([]);
  const [reviewDocumentId, setReviewDocumentId] = useState("");
  const [reviewDocumentType, setReviewDocumentType] = useState("unknown");
  const [reviewText, setReviewText] = useState("");
  const [reviewJsonText, setReviewJsonText] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const documentsRepo = useMemo(() => createDocumentsRepository({ isSignedIn: isDatabaseMode, supabase, localDocuments, setLocalDocuments }), [isDatabaseMode, localDocuments, setLocalDocuments, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients, setLocalClients }), [isDatabaseMode, localClients, setLocalClients, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs, setLocalJobs }), [isDatabaseMode, localJobs, setLocalJobs, supabase]);
  const documents = isDatabaseMode ? databaseDocuments : localDocuments;
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;
  const clients = isDatabaseMode ? databaseClients : localClients;
  const jobs = isDatabaseMode ? databaseJobs : localJobs;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([
      documentsRepo.getDocuments(activeWorkspace.id),
      invoicesRepo.getInvoices(activeWorkspace.id),
      clientsRepo.getClients(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
    ])
      .then(([items, invoiceItems, clientItems, jobItems]) => {
        if (!cancelled) {
          setDatabaseDocuments(items);
          setDatabaseInvoices(invoiceItems);
          setDatabaseClients(clientItems);
          setDatabaseJobs(jobItems);
        }
      })
      .catch((error) => {
        if (!cancelled) setDocumentError(error instanceof Error ? error.message : "Unable to load documents.");
      });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, documentsRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const workspaceDocuments = documents.filter(
    (document) => document.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const workspaceClients = clients.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobs.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );
  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );

  const selectedClient = workspaceClients.find(
    (client) => client.id === clientId
  );

  const jobsForSelectedClient = selectedClient
    ? workspaceJobs.filter((job) => {
        if (job.clientId) {
          return job.clientId === selectedClient.id;
        }

        // Legacy localStorage jobs may only have a client name snapshot.
        return (
          (job.client ?? "").trim().toLowerCase() ===
          selectedClient.name.trim().toLowerCase()
        );
      })
    : [];

  function resetUploadForm() {
    setDocumentName("");
    setDetectedType("Pending");
    setFileName("");
    setMimeType("");
    setSizeBytes(0);
    setSelectedFile(null);
    setNotes("");
    setClientId("");
    setJobId("");
    setInvoiceId("");
  }

  function closeUploadModal() {
    setIsUploadOpen(false);
    resetUploadForm();
  }

  function handleClientChange(nextClientId: string) {
    setClientId(nextClientId);
    setJobId("");
  }

  async function saveUploadPlaceholder() {
    if (!documentName.trim()) return;
    setDocumentError("");
    setDocumentNotice("");
    setIsSavingDocument(true);

    const documentId = crypto.randomUUID();
    const entity = getDocumentEntity({ clientId, jobId, invoiceId });
    const storageFileName = selectedFile ? `${documentId}-${selectedFile.name}` : fileName;
    const storagePath = isDatabaseMode && storageFileName
      ? buildDocumentStoragePath({
          workspaceId: activeWorkspace.id,
          entityType: entity.entityType,
          entityId: entity.entityId,
          fileName: storageFileName,
        })
      : "";

    const newDocument: StoredDocument = {
      id: documentId,
      workspaceId: activeWorkspace.id,
      name: documentName.trim(),
      detectedType,
      extractionStatus: "Waiting for extraction",
      fileName: selectedFile?.name || fileName || "No file selected",
      mimeType: selectedFile?.type || mimeType,
      sizeBytes: selectedFile?.size || sizeBytes,
      storageBucket: storagePath ? DOCUMENT_STORAGE_BUCKET : "",
      storagePath,
      storageStatus: storagePath ? "Stored" : "Pending storage setup",
      processingStatus: "uploaded",
      documentType: detectedType,
      notes: notes.trim(),
      clientId,
      jobId,
      invoiceId,
      createdAt: new Date().toISOString(),
      uploadedBy: user?.id,
    };

    try {
      if (isDatabaseMode && supabase && selectedFile && storagePath) {
        await uploadDocumentFile({ workspaceId: activeWorkspace.id, path: storagePath, file: selectedFile });
      }

      const result = await createDocumentAction(documentsRepo, newDocument);
      if (!result.ok) {
        throw new Error(result.error);
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseDocuments((current) => [created, ...current]);
      closeUploadModal();
    } catch (error) {
      if (isDatabaseMode && supabase && storagePath) {
        try {
          await removeDocumentFile({ workspaceId: activeWorkspace.id, path: storagePath });
        } catch (cleanupError) {
          console.error("Unable to clean up failed document upload.", cleanupError);
        }
      }
      setDocumentError(error instanceof Error ? error.message : "Unable to save document.");
    } finally {
      setIsSavingDocument(false);
    }
  }

  async function deleteDocument(documentId: string) {
    if (!canDeleteBusinessRecords) return;

    setDocumentError("");
    setDocumentNotice("");
    const document = workspaceDocuments.find((item) => item.id === documentId);
    if (!window.confirm(`Delete "${document?.fileName || document?.name || "this document"}"? This cannot be undone.`)) return;

    try {
      if (isDatabaseMode && supabase && document?.storagePath) {
        await removeDocumentFile({ workspaceId: document.workspaceId, path: document.storagePath });
      }
      const result = await deleteDocumentAction(
        documentsRepo,
        documentId,
        document?.workspaceId
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      if (isDatabaseMode) setDatabaseDocuments((current) => current.filter((document) => document.id !== documentId));
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to delete document.");
    }
  }

  async function downloadDocument(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    try {
      if (!isDatabaseMode || !supabase || !document.storagePath) {
        setDocumentError("This document does not have a stored cloud file yet.");
        return;
      }

      const url = await createDocumentDownloadUrl({ workspaceId: document.workspaceId, path: document.storagePath });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to download document.");
    }
  }

  function replaceDocument(updatedDocument: StoredDocument) {
    if (isDatabaseMode) {
      setDatabaseDocuments((current) =>
        current.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document
        )
      );
      return;
    }

    setLocalDocuments((current) =>
      current.map((document) =>
        document.id === updatedDocument.id ? updatedDocument : document
      )
    );
  }

  async function runOcr(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    if (!isDatabaseMode) {
      setDocumentError("OCR requires a signed-in cloud workspace.");
      return;
    }

    setProcessingDocumentIds((current) => [...current, document.id]);

    try {
      const response = await fetch("/api/documents/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          workspaceId: document.workspaceId,
        }),
      });
      const payload = (await response.json()) as {
        document?: ApiDocument;
        error?: string;
      };

      if (!response.ok || !payload.document) {
        throw new Error(payload.error || "Unable to run OCR.");
      }

      const updatedDocument = apiDocumentToStoredDocument(payload.document);
      replaceDocument(updatedDocument);
      openReview(updatedDocument);
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to run OCR.");
    } finally {
      setProcessingDocumentIds((current) =>
        current.filter((documentId) => documentId !== document.id)
      );
    }
  }

  async function generateDraft(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    if (!isDatabaseMode) {
      setDocumentError("AI drafts require a signed-in cloud workspace.");
      return;
    }

    if (!document.extractedText?.trim()) {
      setDocumentError("Run OCR before generating an AI review draft.");
      return;
    }

    setDraftingDocumentIds((current) => [...current, document.id]);

    try {
      const response = await fetch("/api/ai/interpret-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          workspaceId: document.workspaceId,
        }),
      });
      const payload = (await response.json()) as {
        reviewDraft?: { id: string };
        error?: string;
      };

      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to generate review draft.");
      }

      setDocumentNotice("AI review draft created. Open Review Queue to approve it.");
    } catch (error) {
      setDocumentError(
        error instanceof Error ? error.message : "Unable to generate review draft."
      );
    } finally {
      setDraftingDocumentIds((current) =>
        current.filter((documentId) => documentId !== document.id)
      );
    }
  }

  function isImageDocument(document: StoredDocument) {
    return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
      (document.mimeType || "").toLowerCase()
    );
  }

  async function analyzeImageDocument(document: StoredDocument) {
    setDocumentError("");
    setDocumentNotice("");

    if (!isDatabaseMode) {
      setDocumentError("Image analysis requires a signed-in cloud workspace.");
      return;
    }
    if (!isImageDocument(document)) {
      setDocumentError("Only JPG, PNG, and WebP image documents can be analyzed.");
      return;
    }

    setAnalyzingImageDocumentIds((current) => [...current, document.id]);

    try {
      const formData = new FormData();
      formData.append("workspaceId", document.workspaceId);
      formData.append("documentId", document.id);
      formData.append("sourceLabel", document.fileName || document.name);

      const response = await fetch("/api/images/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        reviewDraft?: { id: string };
        error?: string;
      };
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to analyze image.");
      }
      setDocumentNotice("Image analysis draft created. Open Review Queue to approve it.");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to analyze image.");
    } finally {
      setAnalyzingImageDocumentIds((current) =>
        current.filter((documentId) => documentId !== document.id)
      );
    }
  }

  function openReview(document: StoredDocument) {
    setReviewDocumentId(document.id);
    setReviewDocumentType(document.documentType || "unknown");
    setReviewText(document.extractedText || "");
    setReviewJsonText(JSON.stringify(document.extractedJson ?? {}, null, 2));
  }

  function closeReview() {
    setReviewDocumentId("");
    setReviewDocumentType("unknown");
    setReviewText("");
    setReviewJsonText("");
  }

  async function saveReview() {
    const document = workspaceDocuments.find((item) => item.id === reviewDocumentId);
    if (!document) return;

    let parsedJson: Record<string, unknown>;
    try {
      parsedJson = JSON.parse(reviewJsonText || "{}") as Record<string, unknown>;
    } catch {
      setDocumentError("Reviewed extraction JSON is not valid.");
      return;
    }

    try {
      const result = await updateDocumentAction(documentsRepo, {
        ...document,
        documentType: reviewDocumentType,
        detectedType: reviewDocumentType,
        extractionStatus: "Reviewed",
        processingStatus: "reviewed",
        extractedText: reviewText,
        extractedJson: parsedJson,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.id,
      });
      if (!result.ok) {
        setDocumentError(result.error);
        return;
      }
      const updatedDocument = result.data;
      replaceDocument(updatedDocument);
      closeReview();
      setDocumentError("");
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "Unable to save OCR review.");
    }
  }

  function getClientName(documentClientId: string) {
    if (!documentClientId) return "-";

    const client = clients.find((item) => item.id === documentClientId);
    return client?.name ?? "Unknown client";
  }

  function getJobName(documentJobId: string) {
    if (!documentJobId) return "-";

    const job = jobs.find((item) => item.id === documentJobId);
    return job ? getJobDisplayName(job) : "Unknown job";
  }

  const reviewDocument = workspaceDocuments.find(
    (document) => document.id === reviewDocumentId
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
        >
          + Upload Document
        </button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Review extracted information before using it. OCR drafts never create
        clients, jobs, invoices, expenses, or calendar items automatically.
        {!isDatabaseMode && (
          <span className="mt-2 block font-semibold">
            Sign in to use cloud OCR and AI drafts. Local document metadata remains available in demo mode.
          </span>
        )}
      </div>

      {documentError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {documentError}
        </div>
      )}

      {documentNotice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {documentNotice}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[900px] w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Detected Type</th>
              <th className="px-6 py-4">Extraction Status</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Job</th>
              <th className="px-6 py-4">File</th>
              <th className="px-6 py-4">Storage</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {workspaceDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center text-2xl text-gray-500 dark:text-gray-400"
                >
                  No documents uploaded for {workspaceDisplayName}
                </td>
              </tr>
            ) : (
              workspaceDocuments.map((document) => (
                <tr
                  key={document.id}
                  id={`document-${document.id}`}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-6 py-4 font-semibold">{document.name}</td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {document.detectedType}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300">
                      {document.extractionStatus}
                    </span>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      OCR: {document.processingStatus || "uploaded"}
                    </div>
                    {document.ocrProvider && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Provider: {document.ocrProvider}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {getClientName(document.clientId)}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {getJobName(document.jobId)}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {document.fileName}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div>{document.storageStatus || "Pending storage setup"}</div>
                    <div className="text-xs text-gray-500">
                      {document.mimeType || "No MIME type"} {document.sizeBytes ? `- ${document.sizeBytes} bytes` : ""}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => runOcr(document)}
                        disabled={
                          !isDatabaseMode ||
                          processingDocumentIds.includes(document.id) ||
                          document.processingStatus === "processing"
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingDocumentIds.includes(document.id) ||
                        document.processingStatus === "processing"
                          ? "Processing..."
                          : "Run OCR"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openReview(document)}
                        disabled={!document.extractedText && !document.extractedJson}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={() => generateDraft(document)}
                        disabled={
                          !isDatabaseMode ||
                          !document.extractedText ||
                          draftingDocumentIds.includes(document.id)
                        }
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {draftingDocumentIds.includes(document.id)
                          ? "Generating..."
                          : "Generate Draft"}
                      </button>
                      <button
                        type="button"
                        onClick={() => analyzeImageDocument(document)}
                        disabled={
                          !isDatabaseMode ||
                          !isImageDocument(document) ||
                          analyzingImageDocumentIds.includes(document.id)
                        }
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {analyzingImageDocumentIds.includes(document.id)
                          ? "Analyzing..."
                          : "Analyze Image"}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadDocument(document)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocument(document.id)}
                        disabled={!canDeleteBusinessRecords}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reviewDocument && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
                Review Extraction
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Review extracted information before using it. Saving this review
                only updates the document metadata.
              </p>
            </div>
            <button
              type="button"
              onClick={closeReview}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Document Type
              </label>
              <select
                value={reviewDocumentType}
                onChange={(event) => setReviewDocumentType(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="receipt">receipt</option>
                <option value="invoice">invoice</option>
                <option value="estimate">estimate</option>
                <option value="contract">contract</option>
                <option value="unknown">unknown</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {reviewDocument.name}
              </p>
              <p>Status: {reviewDocument.processingStatus || "uploaded"}</p>
              <p>Confidence: {reviewDocument.confidence ?? "unscored"}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Extracted Text
              </label>
              <textarea
                rows={12}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                Extracted Fields Draft
              </label>
              <textarea
                rows={12}
                value={reviewJsonText}
                onChange={(event) => setReviewJsonText(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={saveReview}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Reviewed Extraction
            </button>
          </div>
        </section>
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-3 sm:items-center sm:p-4">
          <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl dark:bg-gray-900 sm:my-0 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100 sm:text-2xl">
                Upload for Extraction
              </h2>

              <button
                type="button"
                onClick={closeUploadModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                -
              </button>
            </div>

            <form className="space-y-5 sm:space-y-6">
              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Workspace
                </label>

                <input
                  value={workspaceDisplayName}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:text-lg"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Document Name
                </label>

                <input
                  type="text"
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  placeholder="Quote, invoice, receipt, handwritten note..."
                  className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Detected Type
                </label>

                <select
                  value={detectedType}
                  onChange={(event) => setDetectedType(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                >
                  <option>Pending</option>
                  <option>Invoice</option>
                  <option>Quote</option>
                  <option>Receipt</option>
                  <option>Contract</option>
                  <option>Job Note</option>
                  <option>Client Document</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                    Link Client
                  </label>

                  <select
                    value={clientId}
                    onChange={(event) => handleClientChange(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                  >
                    <option value="">No client</option>
                    {workspaceClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                    Link Job
                  </label>

                  <select
                    value={jobId}
                    onChange={(event) => setJobId(event.target.value)}
                    disabled={!clientId}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-950 dark:disabled:text-gray-600"
                  >
                    <option value="">No job</option>
                    {jobsForSelectedClient.map((job) => (
                      <option key={job.id} value={job.id}>
                        {getJobDisplayName(job)}
                      </option>
                    ))}
                  </select>

                  {!clientId && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Select a client first to show linked jobs.
                    </p>
                  )}

                  {clientId && jobsForSelectedClient.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No jobs found for the selected client.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Link Invoice
                </label>

                <select
                  value={invoiceId}
                  onChange={(event) => setInvoiceId(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                >
                  <option value="">No invoice</option>
                  {workspaceInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  File
                </label>

                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFile(file ?? null);
                    setFileName(file?.name ?? "");
                    setMimeType(file?.type ?? "");
                    setSizeBytes(file?.size ?? 0);
                  }}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional context for later extraction."
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-lg"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="w-full rounded-lg border border-gray-200 px-6 py-3 text-base text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto sm:text-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveUploadPlaceholder}
                  disabled={isSavingDocument}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto sm:text-lg"
                >
                  {isSavingDocument ? "Uploading..." : "Save Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\financials\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createExpenseAction, deleteExpenseAction } from "@/lib/actions/expenses";
import { deleteInvoiceAction, updateInvoiceAction } from "@/lib/actions/invoices";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createExpensesRepository, type ExpenseRow } from "@/lib/db/expenses";
import { createInvoicesRepository } from "@/lib/db/invoices";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  InvoiceStatus,
  invoiceStatuses,
  moneyToNumber,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import { consumeAiFormHydration, payloadNumber, payloadString } from "@/lib/ai/formHydration";

type FinancialInvoice = { id: string; invoice: InvoiceRow };

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
  note,
}: {
  title: string;
  value: string;
  icon: string;
  iconClass: string;
  note?: string;
}) {
  return (
    <div className="flex min-h-36 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-lg text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-2 text-4xl font-bold text-gray-950 dark:text-gray-100">
          {value}
        </p>
        {note && <p className="mt-3 text-green-600">{note}</p>}
      </div>

      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconClass}`}>
        {icon}
      </div>
    </div>
  );
}

function getFinancialInvoiceNumber(row: FinancialInvoice) {
  return row.invoice.invoiceNumber;
}

function getFinancialInvoiceClient(row: FinancialInvoice) {
  return getInvoiceClientName(row.invoice);
}

function getFinancialInvoiceStatus(row: FinancialInvoice): InvoiceStatus {
  return row.invoice.status as InvoiceStatus;
}

function getFinancialInvoiceTotal(row: FinancialInvoice) {
  return getInvoiceTotals(row.invoice).total;
}

export default function FinancialsPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [localExpenses, setLocalExpenses] = useStoredJsonState<ExpenseRow[]>(
    storageKeys.expenses,
    []
  );
  const [dbInvoices, setDbInvoices] = useState<InvoiceRow[]>([]);
  const [dbExpenses, setDbExpenses] = useState<ExpenseRow[]>([]);
  const [dataError, setDataError] = useState("");

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Materials");
  const [expenseAmount, setExpenseAmount] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);
  const expensesRepo = useMemo(() => createExpensesRepository({ isSignedIn: isDatabaseMode, supabase, localExpenses, setLocalExpenses }), [isDatabaseMode, localExpenses, setLocalExpenses, supabase]);
  const savedInvoices = isDatabaseMode ? dbInvoices : localInvoices;
  const expenseItems = isDatabaseMode ? dbExpenses : localExpenses;

  useEffect(() => {
    const hydration = consumeAiFormHydration("expense", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      const vendor = payloadString(hydration.payload, "vendor");
      const notes = payloadString(hydration.payload, "notes");
      setExpenseDescription(notes || vendor);
      setExpenseCategory(payloadString(hydration.payload, "category") || "Materials");
      const amount = payloadNumber(hydration.payload, "amount");
      setExpenseAmount(amount === null ? "" : String(amount));
      setNewExpenseOpen(true);
    });
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setDataError("");
    });
    Promise.all([invoicesRepo.getInvoices(activeWorkspace.id), expensesRepo.getExpenses(activeWorkspace.id)]).then(([invoices, expenses]) => {
      if (!cancelled) { setDbInvoices(invoices); setDbExpenses(expenses); }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load financials.");
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, expensesRepo, invoicesRepo, isDatabaseMode]);

  const generatedInvoiceRows: FinancialInvoice[] = savedInvoices
    .filter((invoice) => invoice.workspaceId === activeWorkspace.id)
    .map((invoice) => ({
      id: invoice.id,
      invoice,
    }));

  const workspaceInvoices = generatedInvoiceRows;

  const workspaceExpenses = expenseItems.filter(
    (expense) => expense.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  function saveSavedInvoiceItems(updatedInvoices: InvoiceRow[]) {
    if (isDatabaseMode) setDbInvoices(updatedInvoices);
    else setLocalInvoices(updatedInvoices);
  }

  function toggleInvoice(rowId: string) {
    setSelectedInvoices((current) =>
      current.includes(rowId)
        ? current.filter((invoiceId) => invoiceId !== rowId)
        : [...current, rowId]
    );
  }

  function toggleExpense(id: string) {
    setSelectedExpenses((current) =>
      current.includes(id)
        ? current.filter((expenseId) => expenseId !== id)
        : [...current, id]
    );
  }

  async function removeSelectedInvoices() {
    if (!canDeleteBusinessRecords) return;

    try {
      if (isDatabaseMode) {
        const results = await Promise.all(
          selectedInvoices.map((id) =>
            deleteInvoiceAction(invoicesRepo, id, activeWorkspace.id)
          )
        );
        const failedDelete = results.find((result) => !result.ok);
        if (failedDelete && !results.some((result) => result.ok)) {
          setDataError(failedDelete.ok ? "Unable to remove invoices." : failedDelete.error);
          return;
        }
      }
      saveSavedInvoiceItems(
        savedInvoices.filter((invoice) => !selectedInvoices.includes(invoice.id))
      );

      setSelectedInvoices([]);
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to remove invoices.");
    }
  }

  async function removeSelectedExpenses() {
    if (!canDeleteBusinessRecords) return;

    try {
      const selected = workspaceExpenses.filter((expense) => selectedExpenses.includes(expense.id ?? `${expense.workspaceId}-${expense.description}`));
      const results = await Promise.all(
        selected.map((expense) => deleteExpenseAction(expensesRepo, expense))
      );
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !results.some((result) => result.ok)) {
        setDataError(failedDelete.ok ? "Unable to remove expenses." : failedDelete.error);
        return;
      }
      const deletedIds = selected.filter((_, i) => results[i].ok).map((e) => e.id ?? `${e.workspaceId}-${e.description}`);
      if (isDatabaseMode) setDbExpenses((current) => current.filter((expense) => !deletedIds.includes(expense.id ?? `${expense.workspaceId}-${expense.description}`)));
      setSelectedExpenses([]);
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to remove expenses.");
    }
  }

  async function updateInvoiceStatus(row: FinancialInvoice, status: InvoiceStatus) {
    const updated = { ...row.invoice, status };
    try {
      const result = await updateInvoiceAction(invoicesRepo, updated);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const saved = result.data;
      saveSavedInvoiceItems(savedInvoices.map((invoice) => invoice.id === saved.id ? saved : invoice));
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to update invoice.");
    }
  }

  function closeExpenseModal() {
    setNewExpenseOpen(false);
    setExpenseDescription("");
    setExpenseCategory("Materials");
    setExpenseAmount("");
  }

  async function addExpense() {
    if (!expenseDescription.trim()) return;

    const amount = Number(expenseAmount);
    if (Number.isNaN(amount) || amount <= 0) return;

    try {
      const result = await createExpenseAction(expensesRepo, { description: expenseDescription.trim(), category: expenseCategory, amount: formatCurrency(amount), workspaceId: activeWorkspace.id });
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDbExpenses((current) => [created, ...current]);
      setDataError("");
      closeExpenseModal();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to add expense.");
    }
  }

  const revenue = workspaceInvoices
    .filter((row) => getFinancialInvoiceStatus(row) === "Paid")
    .reduce((total, row) => total + getFinancialInvoiceTotal(row), 0);

  const outstanding = workspaceInvoices
    .filter((row) => getFinancialInvoiceStatus(row) !== "Paid")
    .reduce((total, row) => total + getFinancialInvoiceTotal(row), 0);

  const totalExpenses = workspaceExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );

  const profit = revenue - totalExpenses;

  return (
    <div className="space-y-8">
      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Revenue"
          value={formatCurrency(revenue)}
          icon="$"
          iconClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
          note="Paid invoices"
        />

        <SummaryCard
          title="Expenses"
          value={formatCurrency(totalExpenses)}
          icon="-"
          iconClass="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        />

        <SummaryCard
          title="Outstanding"
          value={formatCurrency(outstanding)}
          icon="-"
          iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
        />

        <SummaryCard
          title="Profit"
          value={formatCurrency(profit)}
          icon="-"
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Invoices
            </h2>

            <div className="flex gap-2">
              <Link
                href="/invoices/new"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Create Invoice
              </Link>

              <button
                type="button"
                onClick={removeSelectedInvoices}
                disabled={selectedInvoices.length === 0 || !canDeleteBusinessRecords}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[820px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="w-12 px-4 py-4"></th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceInvoices.length > 0 ? (
                workspaceInvoices.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg"
                  >
                    <td className="px-4 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(row.id)}
                        onChange={() => toggleInvoice(row.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <Link
                        href={`/invoices/${row.invoice.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {getFinancialInvoiceNumber(row)}
                      </Link>
                    </td>

                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {getFinancialInvoiceClient(row)}
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={getFinancialInvoiceStatus(row)}
                        onChange={(event) =>
                          updateInvoiceStatus(row, event.target.value as InvoiceStatus)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {invoiceStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 text-right font-medium text-gray-950 dark:text-gray-100">
                      {formatCurrency(getFinancialInvoiceTotal(row))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400">
                    No invoices for {workspaceDisplayName}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-gray-100">
              Recent Expenses
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setNewExpenseOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Expense
              </button>

              <button
                onClick={removeSelectedExpenses}
                disabled={selectedExpenses.length === 0 || !canDeleteBusinessRecords}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <table className="min-w-[700px] w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="w-12 px-4 py-4"></th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {workspaceExpenses.length > 0 ? (
                workspaceExpenses.map((expense) => {
                  const expenseId = expense.id ?? `${expense.workspaceId}-${expense.description}`;

                  return (
                    <tr key={expenseId} className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg">
                      <td className="px-4 py-5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expenseId)}
                          onChange={() => toggleExpense(expenseId)}
                          className="h-4 w-4"
                        />
                      </td>

                      <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                        {expense.description}
                      </td>
                      <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                        {expense.category}
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-red-600 dark:text-red-400">
                        {expense.amount}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-lg text-gray-500 dark:text-gray-400">
                    No expenses for {workspaceDisplayName}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newExpenseOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Add Expense</h2>
              <button onClick={closeExpenseModal} className="text-2xl text-gray-500">-</button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={expenseDescription}
                onChange={(event) => setExpenseDescription(event.target.value)}
                placeholder="Description"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <select
                value={expenseCategory}
                onChange={(event) => setExpenseCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option>Materials</option>
                <option>Fuel</option>
                <option>Equipment</option>
                <option>Insurance</option>
                <option>Maintenance</option>
                <option>Labor</option>
                <option>Other</option>
              </select>

              <input
                type="number"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
                placeholder="Amount"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <button
                onClick={addExpense}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\frontier-admin\AdminConsole.tsx

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { storageKeys, writeStoredString } from "@/lib/clientStorage";

type PlatformAdminSummary = {
  admin_email: string;
  auth_user_count: number;
  profile_count: number;
  workspace_count: number;
  client_count: number;
  job_count: number;
  invoice_count: number;
  document_count: number;
  route_plan_count: number;
};

type AdminUserResult = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  workspaceCount: number;
};

type AdminWorkspaceResult = {
  id: string;
  name: string;
  type: string;
  createdBy: string | null;
  createdAt: string | null;
  companyName: string | null;
  businessType: string | null;
};

type UserWorkspacesResponse = {
  user: AdminUserResult;
  workspaces: Array<{
    id: string;
    name: string;
    type: string;
    createdAt: string | null;
    role: string;
    status: string;
  }>;
};

type WorkspaceDetail = {
  workspace: {
    id: string;
    name: string;
    type: string;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  settings: {
    company_name: string | null;
    business_type: string | null;
    workspace_nickname: string | null;
    company_email: string | null;
  } | null;
  members: Array<{
    id: string;
    user_id: string | null;
    role: string;
    status: string;
    invited_email: string | null;
    created_at: string | null;
    profiles?: { email: string | null; display_name: string | null } | null;
  }>;
  clients: Array<{ id: string; name: string; status: string; email: string | null; created_at: string | null }>;
  jobs: Array<{ id: string; name: string; status: string; client_name_snapshot: string | null; scheduled_date: string | null; created_at: string | null }>;
  invoices: Array<{ id: string; invoice_number: string; status: string; bill_to_name: string | null; bill_to_email: string | null; invoice_date: string | null; created_at: string | null }>;
  inventory: Array<{ id: string; name: string; current_qty: number | null; target_qty: number | null; created_at: string | null }>;
  documents: Array<{ id: string; name: string; file_name: string | null; status?: string | null; extraction_status: string | null; detected_type: string | null; uploaded_by?: string | null; mime_type: string | null; size_bytes: number | null; storage_bucket: string | null; storage_path: string | null; created_at: string | null }>;
  routePlans: Array<{ id: string; name: string; total_distance_meters: number | null; total_duration_seconds: number | null; google_maps_url: string | null; created_at: string | null }>;
};

type AdminAuditLog = {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  target_workspace_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatSize(value: number | null) {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      {message}
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-3 text-3xl font-bold text-gray-950 dark:text-gray-100">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function AdminConsole({ summary }: { summary: PlatformAdminSummary }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserResult[]>([]);
  const [workspaces, setWorkspaces] = useState<AdminWorkspaceResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWorkspacesResponse | null>(null);
  const [workspaceDetail, setWorkspaceDetail] = useState<WorkspaceDetail | null>(null);
  const [message, setMessage] = useState("");
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const counts = [
    { label: "Auth Users", value: summary.auth_user_count },
    { label: "Profiles", value: summary.profile_count },
    { label: "Workspaces", value: summary.workspace_count },
    { label: "Clients", value: summary.client_count },
    { label: "Jobs", value: summary.job_count },
    { label: "Invoices", value: summary.invoice_count },
    { label: "Documents", value: summary.document_count },
    { label: "Route Plans", value: summary.route_plan_count },
  ];

  async function readJson<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error ?? "Admin request failed.");
    }
    return data as T;
  }

  async function search(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsSearching(true);
    setMessage("");

    try {
      const data = await readJson<{
        users: AdminUserResult[];
        workspaces: AdminWorkspaceResult[];
      }>(await fetch(`/api/frontier-admin/search?q=${encodeURIComponent(query)}`));

      setUsers(data.users);
      setWorkspaces(data.workspaces);
      setSelectedUser(null);
      setWorkspaceDetail(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsSearching(false);
    }
  }

  async function loadUserWorkspaces(userId: string) {
    setIsLoadingDetail(true);
    setMessage("");

    try {
      const data = await readJson<UserWorkspacesResponse>(
        await fetch(`/api/frontier-admin/users/${userId}/workspaces`)
      );
      setSelectedUser(data);
      setWorkspaceDetail(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load user.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function loadWorkspace(workspaceId: string) {
    setIsLoadingDetail(true);
    setMessage("");

    try {
      const data = await readJson<WorkspaceDetail>(
        await fetch(`/api/frontier-admin/workspaces/${workspaceId}`)
      );
      setWorkspaceDetail(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load workspace.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function enterAdminView(workspace: { id: string; name: string; type: string }, userId?: string | null) {
    setMessage("");

    try {
      const data = await readJson<{
        adminUserId: string;
        targetUserId: string | null;
        workspace: { id: string; name: string; type: string };
      }>(
        await fetch("/api/frontier-admin/view-mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "enter",
            workspaceId: workspace.id,
            userId,
          }),
        })
      );

      writeStoredString(storageKeys.adminViewAdminUserId, data.adminUserId);
      writeStoredString(storageKeys.adminViewWorkspaceId, data.workspace.id);
      writeStoredString(storageKeys.adminViewWorkspaceName, data.workspace.name);
      writeStoredString(storageKeys.adminViewWorkspaceType, data.workspace.type);
      if (data.targetUserId) {
        writeStoredString(storageKeys.adminViewUserId, data.targetUserId);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to enter admin view.");
    }
  }

  async function loadAuditLogs() {
    setIsLoadingAudit(true);
    setMessage("");

    try {
      const data = await readJson<{ logs: AdminAuditLog[] }>(
        await fetch("/api/frontier-admin/audit-logs")
      );
      setAuditLogs(data.logs);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load audit logs.");
    } finally {
      setIsLoadingAudit(false);
    }
  }

  return (
    <main className="space-y-6 text-gray-950 dark:text-gray-100">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Frontier Admin</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Signed in as {summary.admin_email}
            </p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
            Platform access
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <CountCard key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-xl font-bold">Search</h2>
        <form onSubmit={search} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Email, user id, workspace, or business name"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
        {message && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{message}</div>}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="p-3">Email</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Workspaces</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Last Sign-In</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3">{user.email ?? "-"}</td>
                    <td className="max-w-48 truncate p-3 font-mono text-xs">{user.id}</td>
                    <td className="p-3">{user.workspaceCount}</td>
                    <td className="p-3">{formatDate(user.createdAt)}</td>
                    <td className="p-3">{formatDate(user.lastSignInAt)}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => loadUserWorkspaces(user.id)}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-gray-950"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <div className="mt-4"><EmptyState message="No users loaded yet." /></div>}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">Workspaces</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr><th className="p-3">Name</th><th className="p-3">Business</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {workspaces.map((workspace) => (
                  <tr key={workspace.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3">{workspace.companyName || workspace.name}</td>
                    <td className="p-3">{workspace.businessType || workspace.type}</td>
                    <td className="p-3">{formatDate(workspace.createdAt)}</td>
                    <td className="space-x-2 p-3 text-right">
                      <button type="button" onClick={() => loadWorkspace(workspace.id)} className="rounded-lg bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-gray-950">Inspect</button>
                      <button type="button" onClick={() => enterAdminView(workspace)} className="rounded-lg bg-blue-600 px-3 py-2 text-white">View As</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {workspaces.length === 0 && <div className="mt-4"><EmptyState message="No workspaces loaded yet." /></div>}
        </div>
      </section>

      {isLoadingDetail && <div className="rounded-lg bg-blue-50 p-4 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">Loading admin detail...</div>}

      {selectedUser && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">Selected User Workspaces</h2>
          <p className="mt-2 break-all text-sm text-gray-500 dark:text-gray-400">{selectedUser.user.email ?? selectedUser.user.id}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr><th className="p-3">Workspace</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {selectedUser.workspaces.map((workspace) => (
                  <tr key={workspace.id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3">{workspace.name}</td>
                    <td className="p-3">{workspace.role}</td>
                    <td className="p-3">{workspace.status}</td>
                    <td className="p-3">{formatDate(workspace.createdAt)}</td>
                    <td className="space-x-2 p-3 text-right">
                      <button type="button" onClick={() => loadWorkspace(workspace.id)} className="rounded-lg bg-gray-900 px-3 py-2 text-white dark:bg-gray-100 dark:text-gray-950">Inspect</button>
                      <button type="button" onClick={() => enterAdminView(workspace, selectedUser.user.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-white">View As</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedUser.workspaces.length === 0 && <div className="mt-4"><EmptyState message="This user has no active workspaces." /></div>}
        </section>
      )}

      {workspaceDetail && (
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">{workspaceDetail.settings?.workspace_nickname || workspaceDetail.workspace.name}</h2>
              <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">{workspaceDetail.workspace.id}</p>
            </div>
            <button type="button" onClick={() => enterAdminView(workspaceDetail.workspace)} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">View As Workspace</button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="font-bold">Settings</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Company: {workspaceDetail.settings?.company_name ?? "-"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Business: {workspaceDetail.settings?.business_type ?? workspaceDetail.workspace.type}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email: {workspaceDetail.settings?.company_email ?? "-"}</p>
            </div>
            <CountCard label="Members" value={workspaceDetail.members.length} />
            <CountCard label="Documents" value={workspaceDetail.documents.length} />
          </div>

          <AdminSimpleTable title="Members" empty="No members found." rows={workspaceDetail.members.map((member) => [member.profiles?.email || member.invited_email || member.user_id || "-", member.role, member.status, formatDate(member.created_at)])} headers={["Email", "Role", "Status", "Created"]} />
          <AdminSimpleTable title="Clients" empty="No clients found." rows={workspaceDetail.clients.map((client) => [client.name, client.status, client.email ?? "-", formatDate(client.created_at)])} headers={["Name", "Status", "Email", "Created"]} />
          <AdminSimpleTable title="Jobs" empty="No jobs found." rows={workspaceDetail.jobs.map((job) => [job.name, job.status, job.client_name_snapshot ?? "-", job.scheduled_date ?? "-", formatDate(job.created_at)])} headers={["Name", "Status", "Client", "Scheduled", "Created"]} />
          <AdminSimpleTable title="Invoices" empty="No invoices found." rows={workspaceDetail.invoices.map((invoice) => [invoice.invoice_number, invoice.status, invoice.bill_to_name ?? "-", invoice.bill_to_email ?? "-", invoice.invoice_date ?? "-"])} headers={["Number", "Status", "Bill To", "Email", "Date"]} />
          <AdminSimpleTable title="Inventory" empty="No inventory found." rows={workspaceDetail.inventory.map((item) => [item.name, String(item.current_qty ?? "-"), String(item.target_qty ?? "-"), formatDate(item.created_at)])} headers={["Name", "Current", "Target", "Created"]} />
          <AdminSimpleTable title="Route Plans" empty="No route plans found." rows={workspaceDetail.routePlans.map((route) => [route.name, route.total_distance_meters ? `${route.total_distance_meters} m` : "-", route.total_duration_seconds ? `${route.total_duration_seconds} sec` : "-", route.google_maps_url ? "Available" : "-", formatDate(route.created_at)])} headers={["Name", "Distance", "Duration", "Google Maps", "Created"]} />
          <AdminSimpleTable title="Document Metadata" empty="No documents found." rows={workspaceDetail.documents.map((document) => [document.file_name || document.name, document.status || document.extraction_status || "Metadata available", document.mime_type ?? "-", formatSize(document.size_bytes), document.uploaded_by ?? "-", document.storage_path ?? "-", "File preview/download coming later", formatDate(document.created_at)])} headers={["File", "Status", "MIME", "Size", "Uploaded By", "Storage Path", "Preview", "Created"]} />
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Audit Logs</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Recent platform admin actions.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAuditLogs}
            disabled={isLoadingAudit}
            className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-gray-100 dark:text-gray-950"
          >
            {isLoadingAudit ? "Loading..." : "Load Audit Logs"}
          </button>
        </div>
        <AdminSimpleTable
          title=""
          empty="No audit logs loaded yet."
          rows={auditLogs.map((log) => [
            log.action,
            log.admin_user_id,
            log.target_user_id ?? "-",
            log.target_workspace_id ?? "-",
            JSON.stringify(log.metadata),
            formatDate(log.created_at),
          ])}
          headers={["Action", "Admin User", "Target User", "Target Workspace", "Metadata", "Created"]}
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-bold">Roadmap Hold</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Support tools and customer inspection are not built yet.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Owner view", "Employee view", "Client portal view", "Customer view toggle"].map((label) => (
            <span key={label} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">{label}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminSimpleTable({
  title,
  headers,
  rows,
  empty,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      {rows.length === 0 ? (
        <div className="mt-3"><EmptyState message={empty} /></div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-gray-500 dark:text-gray-400">
              <tr>{headers.map((header) => <th key={header} className="p-3">{header}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join(":")} className="border-t border-gray-200 dark:border-gray-800">
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className="max-w-80 truncate p-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

## app\frontier-admin\page.tsx

```tsx
import Link from "next/link";

import AdminConsole from "@/app/frontier-admin/AdminConsole";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PlatformAdminSummary = {
  admin_email: string;
  auth_user_count: number;
  profile_count: number;
  workspace_count: number;
  client_count: number;
  job_count: number;
  invoice_count: number;
  document_count: number;
  route_plan_count: number;
};

function AccessPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{message}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}

export default async function FrontierAdminPage() {
  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return (
      <AccessPanel
        title="Admin Unavailable"
        message="Supabase is not configured for this environment."
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AccessPanel
        title="Sign In Required"
        message="You must be signed in before Frontier can verify platform admin access."
      />
    );
  }

  const { data, error } = await supabase
    .rpc("get_platform_admin_summary")
    .returns<PlatformAdminSummary[]>()
    .maybeSingle();

  if (error) {
    console.error("Unable to load platform admin summary.", error);
  }

  if (!data) {
    return (
      <AccessPanel
        title="Access Denied"
        message="This account is not a Frontier platform admin."
      />
    );
  }

  return <AdminConsole summary={data} />;
}
```

## app\globals.css

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #f3f4f6;
  --foreground: #111827;
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  background-color: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
}

html.dark,
html.dark body {
  background-color: #030712;
}

* {
  box-sizing: border-box;
}

.dark .bg-white {
  background-color: #111827;
}

.dark .text-gray-950,
.dark .text-gray-900,
.dark .text-gray-800,
.dark .text-gray-700 {
  color: #f9fafb;
}

.dark .text-gray-600,
.dark .text-gray-500 {
  color: #9ca3af;
}

.dark .border-gray-200,
.dark .border-gray-100 {
  border-color: #374151;
}

.dark input,
.dark select,
.dark textarea {
  background-color: #111827;
  color: #f9fafb;
  border-color: #374151;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0);
}

.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

@media print {
  aside,
  header,
  .print-hidden {
    display: none !important;
  }

  main {
    padding: 0 !important;
    overflow: visible !important;
  }

  body {
    background: white !important;
  }

  .invoice-print-page {
    
    margin: 0.7in auto 0 auto !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    width: 100% !important;
    max-width: none !important;
  }
}
```

## app\inventory\[id]\page.tsx

```tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { InventoryRow } from "@/lib/db/inventory";
import { isUuid } from "@/lib/db/ids";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type MaterialDetail = {
  inventory: { id: string; name: string; current_qty: number | null; target_qty: number | null };
  catalog: { id: string; description: string | null; category: string | null; unit: string | null } | null;
  vendorSkus: Array<{ id: string; vendor_name: string; sku: string; unit_cost_cents: number | null }>;
  lots: Array<{ id: string; quantity: number; lot_reference: string | null; received_at: string | null }>;
  allocations: Array<{ id: string; quantity: number; mode: string; status: string; job_id: string | null }>;
  documents: Array<{ id: string; name: string; file_name: string | null; created_at: string }>;
};

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspace();
  const { user, isSupabaseConfigured } = useAuthSession();
  const [localItems] = useStoredJsonState<InventoryRow[]>(storageKeys.inventory, []);
  const [detail, setDetail] = useState<MaterialDetail | null>(null);
  const [error, setError] = useState("");
  const isDatabaseMode = Boolean(user && isSupabaseConfigured);
  const supabase = useMemo(() => isDatabaseMode ? createBrowserSupabaseClient() : null, [isDatabaseMode]);

  useEffect(() => {
    if (!isDatabaseMode || !supabase || !isUuid(id) || !isUuid(activeWorkspace.id)) return;
    let cancelled = false;
    const client = supabase;

    async function load() {
      const { data: inventory, error: inventoryError } = await client
        .from("inventory_items")
        .select("id, name, current_qty, target_qty")
        .eq("id", id)
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();
      if (inventoryError || !inventory) throw new Error(inventoryError?.message || "Material not found.");

      const { data: catalog, error: catalogError } = await client
        .from("material_catalog_items")
        .select("id, description, category, unit")
        .eq("inventory_item_id", id)
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();
      if (catalogError) throw new Error(catalogError.message);

      const materialId = catalog?.id;
      const [vendorResult, lotResult, allocationResult, documentResult] = materialId
        ? await Promise.all([
            client.from("material_vendor_skus").select("id, vendor_name, sku, unit_cost_cents").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
            client.from("inventory_lots").select("id, quantity, lot_reference, received_at").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
            client.from("job_material_allocations").select("id, quantity, mode, status, job_id").eq("workspace_id", activeWorkspace.id).eq("material_id", materialId),
            client.from("documents").select("id, name, file_name, created_at").eq("workspace_id", activeWorkspace.id).eq("material_catalog_item_id", materialId),
          ])
        : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
      const relatedError = vendorResult.error || lotResult.error || allocationResult.error || documentResult.error;
      if (relatedError) throw new Error(relatedError.message);

      if (!cancelled) {
        setDetail({
          inventory,
          catalog: catalog ?? null,
          vendorSkus: vendorResult.data ?? [],
          lots: lotResult.data ?? [],
          allocations: allocationResult.data ?? [],
          documents: documentResult.data ?? [],
        });
      }
    }

    load().catch((loadError) => {
      if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load material.");
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, id, isDatabaseMode, supabase]);

  const localItem = !isDatabaseMode ? localItems.find((item) => item.id === id) : null;
  const inventory = detail?.inventory ?? (localItem ? { id: localItem.id ?? id, name: localItem.name, current_qty: localItem.currentQty, target_qty: localItem.targetQty } : null);

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <Link href="/inventory" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">Back to Inventory</Link>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      {!inventory ? <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">Loading material...</div> : (
        <>
          <header><h1 className="text-3xl font-bold">{inventory.name}</h1><p className="mt-2 text-gray-500 dark:text-gray-400">Current {inventory.current_qty ?? "-"} - Target {inventory.target_qty ?? "-"}</p></header>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"><div className="text-sm text-gray-500">Category</div><div className="mt-2 font-semibold">{detail?.catalog?.category || "Not set"}</div></div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"><div className="text-sm text-gray-500">Unit</div><div className="mt-2 font-semibold">{detail?.catalog?.unit || "Not set"}</div></div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"><div className="text-sm text-gray-500">Description</div><div className="mt-2 font-semibold">{detail?.catalog?.description || "Not set"}</div></div>
          </section>
          <RelatedTable title="Vendor / SKU Variants" empty="No vendor SKUs." rows={detail?.vendorSkus.map((row) => `${row.vendor_name} - ${row.sku} - ${row.unit_cost_cents == null ? "No cost" : `$${(row.unit_cost_cents / 100).toFixed(2)}`}`) ?? []} />
          <RelatedTable title="Inventory Lots" empty="No inventory lots." rows={detail?.lots.map((row) => `${row.quantity} - ${row.lot_reference || "No reference"} - ${row.received_at || "No received date"}`) ?? []} />
          <RelatedTable title="Assigned Jobs / Usage History" empty="No material allocations." rows={detail?.allocations.map((row) => `${row.quantity} - ${row.mode} - ${row.status} - Job ${row.job_id || "unassigned"}`) ?? []} />
          <RelatedTable title="Linked Documents" empty="No linked documents." rows={detail?.documents.map((row) => `${row.file_name || row.name} - ${new Date(row.created_at).toLocaleDateString()}`) ?? []} />
        </>
      )}
    </div>
  );
}

function RelatedTable({ title, empty, rows }: { title: string; empty: string; rows: string[] }) {
  return <section><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">{rows.length ? rows.map((row, index) => <div key={`${row}-${index}`} className="border-b border-gray-200 p-4 last:border-0 dark:border-gray-800">{row}</div>) : <div className="p-6 text-gray-500 dark:text-gray-400">{empty}</div>}</div></section>;
}
```

## app\inventory\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createInventoryItemAction,
  deleteInventoryItemAction,
  updateInventoryItemAction,
} from "@/lib/actions/inventory";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createInventoryRepository, type InventoryRow } from "@/lib/db/inventory";
import { createJobsRepository } from "@/lib/db/jobs";
import type { Job } from "@/lib/jobTypes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import {
  consumeAiFormHydration,
  payloadNumber,
  payloadString,
  saveAiFormHydration,
  type AiFormHydration,
} from "@/lib/ai/formHydration";

type AllocationMaterial = { name: string; quantity: number; notes?: string };

export default function InventoryPage() {
  const router = useRouter();
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInventoryItems, setLocalInventoryItems] = useStoredJsonState<InventoryRow[]>(
    storageKeys.inventory,
    []
  );
  const [databaseInventoryItems, setDatabaseInventoryItems] = useState<InventoryRow[]>([]);
  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [editTargetOpen, setEditTargetOpen] = useState(false);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingCurrentQty, setEditingCurrentQty] = useState("");
  const [editingTargetQty, setEditingTargetQty] = useState("");

  const [itemName, setItemName] = useState("");
  const [currentQty, setCurrentQty] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [allocationHydration, setAllocationHydration] = useState<AiFormHydration | null>(null);
  const [allocationJobId, setAllocationJobId] = useState("");
  const [allocationMode, setAllocationMode] = useState("Append");
  const [allocationMaterials, setAllocationMaterials] = useState<AllocationMaterial[]>([]);
  const [isSavingAllocation, setIsSavingAllocation] = useState(false);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const inventoryRepo = useMemo(() => createInventoryRepository({ isSignedIn: isDatabaseMode, supabase, localItems: localInventoryItems, setLocalItems: setLocalInventoryItems }), [isDatabaseMode, localInventoryItems, setLocalInventoryItems, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const inventoryItems = isDatabaseMode ? databaseInventoryItems : localInventoryItems;
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;

  useEffect(() => {
    const hydration = consumeAiFormHydration("material", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      if (hydration.actionType === "create_material_allocation") {
        const rawMaterials = hydration.payload.materials;
        const parsedMaterials = Array.isArray(rawMaterials)
          ? rawMaterials.flatMap((item) => {
              if (!item || typeof item !== "object" || Array.isArray(item)) return [];
              const name = typeof item.name === "string" ? item.name : "";
              const quantity = typeof item.quantity === "number" ? item.quantity : 1;
              const notes = typeof item.notes === "string" ? item.notes : "";
              return name ? [{ name, quantity, notes }] : [];
            })
          : [];
        setAllocationHydration(hydration);
        setAllocationJobId(payloadString(hydration.payload, "jobId"));
        const mode = payloadString(hydration.payload, "mode");
        setAllocationMode(["Append", "Merge", "Replace"].includes(mode) ? mode : "Append");
        setAllocationMaterials(parsedMaterials);
        return;
      }
      setItemName(payloadString(hydration.payload, "name"));
      const quantity = payloadNumber(hydration.payload, "quantity");
      const target = payloadNumber(hydration.payload, "targetQuantity");
      setCurrentQty(quantity === null ? "" : String(quantity));
      setTargetQty(target === null ? "" : String(target));
      setNewItemOpen(true);
    });
  }, [activeWorkspace.id]);

  async function saveAllocationDraft() {
    if (!allocationHydration || !allocationJobId || allocationMaterials.length === 0) return;
    setIsSavingAllocation(true);
    setDataError("");
    try {
      const response = await fetch("/api/material-allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          jobId: allocationJobId,
          mode: allocationMode,
          materials: allocationMaterials,
          sourceDocumentId: allocationHydration.sourceId,
          reviewDraftId: allocationHydration.reviewDraftId,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to save material allocation draft.");
      setAllocationHydration(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to save material allocation draft.");
    } finally {
      setIsSavingAllocation(false);
    }
  }

  function openNewJobFromAllocation() {
    if (!allocationHydration) return;
    saveAiFormHydration(
      {
        workspaceId: allocationHydration.workspaceId,
        reviewDraftId: allocationHydration.reviewDraftId,
        sourceId: allocationHydration.sourceId,
        sourceType: allocationHydration.sourceType,
      },
      {
        type: "create_job",
        confidence: 1,
        payload: {
          title: payloadString(allocationHydration.payload, "jobName") || "Material work",
          materials: allocationMaterials,
          notes: "Created from an AI material allocation draft.",
        },
      }
    );
    router.push("/jobs?aiDraft=1");
  }

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([
      inventoryRepo.getInventoryItems(activeWorkspace.id),
      jobsRepo.getJobs(activeWorkspace.id),
    ]).then(([items, jobs]) => {
      if (!cancelled) {
        setDatabaseInventoryItems(items);
        setDatabaseJobItems(jobs);
      }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load inventory.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, inventoryRepo, isDatabaseMode, jobsRepo]);

  const workspaceInventory = inventoryItems.filter(
    (item) => item.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const activeMaterialJobs = jobItems.filter(
    (job) =>
      job.workspaceId === activeWorkspace.id &&
      (job.status === "Scheduled" || job.status === "Completed")
  );

  const autoMaterialRows: InventoryRow[] = activeMaterialJobs
    .flatMap((job) =>
      job.materials.map((material) => ({
        name: material.name.trim(),
        currentQty: null,
        targetQty: null,
        warning: true,
        workspaceId: activeWorkspace.id,
        autoGenerated: true,
      }))
    )
    .filter((material, index, materials) => {
      const normalizedName = material.name.toLowerCase();
      return (
        material.name.length > 0 &&
        materials.findIndex((candidate) => candidate.name.toLowerCase() === normalizedName) === index
      );
    });

  const mergedInventory = [
    ...workspaceInventory,
    ...autoMaterialRows.filter(
      (material) =>
        !workspaceInventory.some(
          (item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase()
        )
    ),
  ];

  function saveInventory(updatedItems: InventoryRow[]) {
    const persistedItems = updatedItems.filter((item) => !item.autoGenerated);
    if (isDatabaseMode) setDatabaseInventoryItems(persistedItems);
    else setLocalInventoryItems(persistedItems);
  }

  function getReservedForItem(itemName: string) {
    return activeMaterialJobs.flatMap((job) =>
      job.materials
        .filter((material) => material.name.trim().toLowerCase() === itemName.trim().toLowerCase())
        .map((material) => ({
          jobId: job.id,
          jobName: job.name,
          jobStatus: job.status,
          quantity: material.quantity,
        }))
    );
  }

  function toggleItem(itemName: string) {
    setSelectedItems((current) =>
      current.includes(itemName)
        ? current.filter((name) => name !== itemName)
        : [...current, itemName]
    );
  }

  async function removeSelectedItems() {
    if (!canDeleteBusinessRecords) return;

    try {
      const selected = inventoryItems.filter((item) => selectedItems.includes(item.name));
      const results = await Promise.all(
        selected.map((item) => deleteInventoryItemAction(inventoryRepo, item))
      );
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !results.some((result) => result.ok)) {
        setDataError(failedDelete.ok ? "Unable to delete inventory." : failedDelete.error);
        return;
      }
      saveInventory(inventoryItems.filter((item) => !selectedItems.includes(item.name)));
      setSelectedItems([]);
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to delete inventory.");
    }
  }

  function resetNewItemForm() {
    setItemName("");
    setCurrentQty("");
    setTargetQty("");
  }

  function closeNewItemModal() {
    setNewItemOpen(false);
    resetNewItemForm();
  }

  async function addInventoryItem() {
    if (!itemName.trim()) return;

    const current = Number(currentQty);
    const target = Number(targetQty);
    if (Number.isNaN(current) || Number.isNaN(target)) return;

    const newItem: InventoryRow = {
      name: itemName.trim(),
      currentQty: current,
      targetQty: target,
      warning: current < target,
      workspaceId: activeWorkspace.id,
    };

    try {
      const result = await createInventoryItemAction(inventoryRepo, newItem);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseInventoryItems((current) => [...current, created]);
      else saveInventory([...inventoryItems, created]);
      setDataError("");
      closeNewItemModal();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to create inventory item.");
    }
  }

  function openTargetEditor(item: InventoryRow) {
    setEditingItemName(item.name);
    setEditingCurrentQty(item.currentQty === null ? "" : String(item.currentQty));
    setEditingTargetQty(item.targetQty === null ? "" : String(item.targetQty));
    setEditTargetOpen(true);
  }

  function closeTargetEditor() {
    setEditTargetOpen(false);
    setEditingItemName("");
    setEditingCurrentQty("");
    setEditingTargetQty("");
  }

  async function saveTargetEditor() {
    if (!editingItemName.trim()) return;
    if (!editingCurrentQty.trim() || !editingTargetQty.trim()) return;

    const current = Number(editingCurrentQty);
    const target = Number(editingTargetQty);
    if (Number.isNaN(current) || Number.isNaN(target)) return;

    const existingItem = inventoryItems.find(
      (item) =>
        item.workspaceId === activeWorkspace.id &&
        item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase()
    );

    const updatedItem: InventoryRow = {
      ...(existingItem ?? {
        name: editingItemName.trim(),
        workspaceId: activeWorkspace.id,
      }),
      currentQty: current,
      targetQty: target,
      warning: current < target,
      autoGenerated: false,
    };

    const updatedItems = existingItem
      ? inventoryItems.map((item) =>
          item.workspaceId === activeWorkspace.id &&
          item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase()
            ? updatedItem
            : item
        )
      : [...inventoryItems, updatedItem];

    try {
      const result = await updateInventoryItemAction(inventoryRepo, updatedItem);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const saved = result.data;
      if (isDatabaseMode) {
        setDatabaseInventoryItems((current) =>
          existingItem
            ? current.map((item) => item.name.trim().toLowerCase() === editingItemName.trim().toLowerCase() ? saved : item)
            : [...current, saved]
        );
      } else {
        saveInventory(updatedItems);
      }
      setDataError("");
      closeTargetEditor();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to update inventory.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setNewItemOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
            + Add Item
          </button>
          <button type="button" onClick={removeSelectedItems} disabled={selectedItems.length === 0 || !canDeleteBusinessRecords} className="rounded-lg bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            Remove Item
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        Use the Actions column to update inventory quantities and thresholds.
      </div>

      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading inventory...
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-[1180px] w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-sm uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="w-12 px-4 py-4"></th>
              <th className="px-6 py-4 text-left">Item Name</th>
              <th className="px-6 py-4 text-center">Current Qty</th>
              <th className="px-6 py-4 text-center">Reserved</th>
              <th className="px-6 py-4 text-center">Available Qty</th>
              <th className="px-6 py-4 text-center">Target Qty</th>
              <th className="px-6 py-4 text-left">Tied Jobs</th>
              <th className="px-6 py-4 text-right">Suggested Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {mergedInventory.length > 0 ? (
              mergedInventory.map((item) => {
                const reservedJobs = getReservedForItem(item.name);
                const reservedQty = reservedJobs.reduce((total, reserved) => total + reserved.quantity, 0);
                const availableAfterJobs = item.currentQty === null ? null : item.currentQty - reservedQty;
                const suggestedOrder = item.targetQty === null || availableAfterJobs === null ? null : Math.max(item.targetQty - availableAfterJobs, 0);
                const warning = item.currentQty === null || item.targetQty === null || (availableAfterJobs !== null && availableAfterJobs < item.targetQty);

                return (
                  <tr key={`${item.workspaceId}-${item.name}`} className="border-b border-gray-200 text-base last:border-b-0 dark:border-gray-800 lg:text-lg">
                    <td className="px-4 py-5 text-center">
                      <input type="checkbox" checked={selectedItems.includes(item.name)} onChange={() => toggleItem(item.name)} disabled={item.autoGenerated} className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40" />
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-950 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        {warning && <span className="text-orange-500">-</span>}
                        {item.id ? (
                          <Link href={`/inventory/${item.id}`} className="text-blue-600 hover:underline dark:text-blue-400">{item.name}</Link>
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {item.autoGenerated && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Job material</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-gray-900 dark:text-gray-100">{item.currentQty ?? "-"}</td>
                    <td className="px-6 py-5 text-center text-blue-600 dark:text-blue-400">{reservedQty}</td>
                    <td className={`px-6 py-5 text-center ${warning ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{availableAfterJobs ?? "-"}</td>
                    <td className="px-6 py-5 text-center text-gray-900 dark:text-gray-100">{item.targetQty ?? "-"}</td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                      {reservedJobs.length > 0 ? (
                        <div className="space-y-1">
                          {reservedJobs.map((reserved) => (
                            <div key={`${reserved.jobId}-${reserved.quantity}`}>{reserved.quantity} - {reserved.jobName} ({reserved.jobStatus})</div>
                          ))}
                        </div>
                      ) : "-"}
                    </td>
                    <td className={`px-6 py-5 text-right ${warning ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}>{suggestedOrder ?? "-"}</td>
                    <td className="px-6 py-5 text-right">
                      <button type="button" onClick={() => openTargetEditor(item)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={9} className="px-6 py-16 text-center text-xl text-gray-500 dark:text-gray-400">No inventory items or scheduled job materials for {workspaceDisplayName}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(newItemOpen || editTargetOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">{editTargetOpen ? `Edit Inventory Item: ${editingItemName}` : "Add Inventory Item"}</h2>
              <button type="button" onClick={editTargetOpen ? closeTargetEditor : closeNewItemModal} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
            </div>

            <div className="space-y-4">
              {!editTargetOpen && <input type="text" value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Item Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Qty
                <input type="number" value={editTargetOpen ? editingCurrentQty : currentQty} onChange={(event) => editTargetOpen ? setEditingCurrentQty(event.target.value) : setCurrentQty(event.target.value)} placeholder="Current Qty" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Qty
                <input type="number" value={editTargetOpen ? editingTargetQty : targetQty} onChange={(event) => editTargetOpen ? setEditingTargetQty(event.target.value) : setTargetQty(event.target.value)} placeholder="Target Qty" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              </label>
              <button type="button" onClick={editTargetOpen ? saveTargetEditor : addInventoryItem} className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700">
                {editTargetOpen ? "Save Quantity Targets" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
      {allocationHydration && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Material Allocation Draft</h2>
              <button type="button" onClick={() => setAllocationHydration(null)} className="text-2xl text-gray-500">x</button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Choose a job and how these reviewed materials should be handled. Saving creates a draft allocation only.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Job
                <select value={allocationJobId} onChange={(event) => setAllocationJobId(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <option value="">Choose job</option>
                  {jobItems.filter((job) => job.workspaceId === activeWorkspace.id).map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Mode
                <select value={allocationMode} onChange={(event) => setAllocationMode(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <option>Append</option><option>Merge</option><option>Replace</option>
                </select>
              </label>
            </div>
            <div className="mt-5 space-y-3">
              {allocationMaterials.map((material, index) => (
                <div key={`${material.name}-${index}`} className="grid gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_8rem] dark:border-gray-800">
                  <input value={material.name} onChange={(event) => setAllocationMaterials((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                  <input type="number" min="0.01" step="0.01" value={material.quantity} onChange={(event) => setAllocationMaterials((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item))} className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={openNewJobFromAllocation} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700">Create New Job</button>
              <button type="button" disabled={!allocationJobId || isSavingAllocation} onClick={saveAllocationDraft} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-50">{isSavingAllocation ? "Saving..." : "Save Draft Allocation"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
```

## app\invoices\[id]\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import DocumentAttachments from "@/app/documents/DocumentAttachments";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import {
  createInvoiceAction,
  deleteInvoiceAction,
  updateInvoiceAction,
} from "@/lib/actions/invoices";
import { storageKeys, useStoredJsonState, writeStoredJson } from "@/lib/clientStorage";
import { createInvoicesRepository } from "@/lib/db/invoices";
import {
  formatMoneyNumber,
  getInvoiceTotals,
  getInvoiceClientName,
  getLineTotal,
  InvoiceRow,
  invoiceStatuses,
  InvoiceStatus,
  moneyToNumber,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const borderColor = "#9ca3af";
const headerBlue = "#dbeafe";
const amountColumnWidth = "144px";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params.id);
  const { canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoice, setDatabaseInvoice] = useState<InvoiceRow | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);

  const invoice = useMemo(() => {
    return isDatabaseMode ? databaseInvoice : localInvoices.find((item) => item.id === invoiceId);
  }, [databaseInvoice, invoiceId, isDatabaseMode, localInvoices]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingInvoice(true);
        setInvoiceError("");
      }
    });
    invoicesRepo.getInvoiceById(invoiceId).then((item) => { if (!cancelled) setDatabaseInvoice(item); }).catch((error) => {
      if (!cancelled) setInvoiceError(error instanceof Error ? error.message : "Unable to load invoice.");
    }).finally(() => {
      if (!cancelled) setIsLoadingInvoice(false);
    });
    return () => { cancelled = true; };
  }, [invoiceId, invoicesRepo, isDatabaseMode]);

  async function updateInvoiceStatus(nextStatus: InvoiceStatus) {
    if (!invoice) return;

    try {
      const result = await updateInvoiceAction(invoicesRepo, { ...invoice, status: nextStatus });
      if (!result.ok) {
        setInvoiceError(result.error);
        return;
      }
      const saved = result.data;
      if (isDatabaseMode) setDatabaseInvoice(saved);
      else setLocalInvoices((current) => current.map((item) => item.id === invoice.id ? saved : item));
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to update invoice status.");
    }
  }

  function getNextInvoiceNumber() {
    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    return `INV-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async function duplicateInvoice() {
    if (!invoice) return;

    const duplicated: InvoiceRow = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: getNextInvoiceNumber(),
      invoiceDate: new Date().toISOString().slice(0, 10),
      status: invoice.status === "Estimate" ? "Estimate" : "Draft",
      lineItems: invoice.lineItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    };

    try {
      const result = await createInvoiceAction(invoicesRepo, duplicated);
      if (!result.ok) {
        setInvoiceError(result.error);
        return;
      }
      const saved = result.data;
      setInvoiceError("");
      router.push(`/invoices/${saved.id}`);
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to duplicate invoice.");
    }
  }

  function editInvoice() {
    if (!invoice) return;
    writeStoredJson(storageKeys.invoiceDraft, {
      ...invoice,
      editExisting: true,
    });
    router.push("/invoices/new/build");
  }

  async function deleteInvoice() {
    if (!canDeleteBusinessRecords) return;
    if (!invoice || isDeletingInvoice) return;
    const confirmed = window.confirm(
      `Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeletingInvoice(true);
    try {
      const result = await deleteInvoiceAction(
        invoicesRepo,
        invoice.id,
        invoice.workspaceId
      );
      if (!result.ok) {
        setInvoiceError(result.error);
        setIsDeletingInvoice(false);
        return;
      }
      setInvoiceError("");
      router.push("/invoices");
    } catch (error) {
      setInvoiceError(
        error instanceof Error ? error.message : "Unable to delete invoice."
      );
      setIsDeletingInvoice(false);
    }
  }

  if (isLoadingInvoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
          - Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold">Loading invoice...</h1>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
          - Back to Invoices
        </Link>

        <h1 className="text-3xl font-bold">Invoice not found</h1>
        {invoiceError && (
          <p className="text-sm text-red-600 dark:text-red-400">{invoiceError}</p>
        )}
      </div>
    );
  }

  const totals = getInvoiceTotals(invoice);
  const billToDisplay = getInvoiceClientName(invoice);

  const mailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`);
  const mailBody = encodeURIComponent(
    `Hello,\n\nPlease see invoice ${invoice.invoiceNumber} for $${formatMoneyNumber(
      totals.total
    )}.\n\nPlease attach the saved PDF before sending.\n\nThank you.`
  );

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    invoice.billToEmail
  )}&su=${mailSubject}&body=${mailBody}`;

  const displayRows = [
    ...invoice.lineItems.map((item) => ({
      id: item.id,
      description:
        item.quantity > 1
          ? `${item.description} - ${item.quantity} - $${formatMoneyNumber(
              moneyToNumber(item.unitPrice)
            )}`
          : item.description,
      amount: formatMoneyNumber(getLineTotal(item)),
    })),
    ...(totals.discount > 0
      ? [
          {
            id: "discount",
            description:
              invoice.discountType === "Percent"
                ? `Discount (${invoice.discountValue}%)`
                : "Discount",
            amount: `(${formatMoneyNumber(totals.discount)})`,
          },
        ]
      : []),
    ...(totals.tax > 0
      ? [
          {
            id: "tax",
            description: `Tax (${invoice.taxRate}% after discount)`,
            amount: formatMoneyNumber(totals.tax),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      {invoiceError && (
        <div className="print-hidden rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 print:hidden dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {invoiceError}
        </div>
      )}
      <div className="print-hidden flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
            - Back to Invoices
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h1>

          {invoice.jobId && (
            <Link
              href={`/jobs/${invoice.jobId}`}
              className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Linked job: {invoice.jobName || invoice.jobId}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={editInvoice}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={duplicateInvoice}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Duplicate
          </button>

          <button
            type="button"
            onClick={deleteInvoice}
            disabled={isDeletingInvoice || !canDeleteBusinessRecords}
            className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {isDeletingInvoice ? "Deleting..." : "Delete"}
          </button>

          {invoice.status === "Estimate" && (
            <button
              type="button"
              onClick={() => updateInvoiceStatus("Draft")}
              className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              Convert to Invoice
            </button>
          )}

          {invoiceStatuses.filter((status) => status !== "Estimate").map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => updateInvoiceStatus(status)}
              disabled={invoice.status === status}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Mark {status}
            </button>
          ))}

          <a
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Send Email
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="invoice-print-page mx-auto max-w-4xl rounded-xl bg-[#ffffff] p-8 text-gray-950 shadow dark:bg-gray-900 dark:text-gray-100 print:max-w-none print:rounded-none print:bg-white print:p-0 print:text-black print:shadow-none">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-sm leading-5">
            <p className="font-bold">{invoice.companyName}</p>
            <p>{invoice.companyAddress}</p>
            <p>
              {invoice.companyCity}, {invoice.companyState} {invoice.companyZip}
            </p>
            <p>{invoice.companyPhone}</p>
            <p>{invoice.companyEmail}</p>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-blue-500">
              {invoice.status === "Estimate" ? "ESTIMATE" : "INVOICE"}
            </h2>

            <div
              className="mt-4 grid text-sm"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr",
                borderTop: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {[
                invoice.status === "Estimate" ? "ESTIMATE #" : "INVOICE #",
                "DATE",
                "STATUS",
                invoice.invoiceNumber,
                invoice.invoiceDate,
                invoice.status,
              ].map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className={`px-3 py-1 ${index < 3 ? "font-bold text-gray-950" : ""}`}
                  style={{
                    background: index < 3 ? headerBlue : undefined,
                    borderRight: `1px solid ${borderColor}`,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-sm text-sm leading-5">
          <div
            className="px-2 py-1 font-bold text-gray-950"
            style={{ background: headerBlue, border: `1px solid ${borderColor}` }}
          >
            BILL TO
          </div>

          <div className="px-2 py-2">
            <p>{billToDisplay}</p>
            {invoice.billToAddress && <p>{invoice.billToAddress}</p>}
            {(invoice.billToCity || invoice.billToState || invoice.billToZip) && (
              <p>
                {invoice.billToCity}, {invoice.billToState} {invoice.billToZip}
              </p>
            )}
            {invoice.billToPhone && <p>{invoice.billToPhone}</p>}
            {invoice.billToEmail && <p>{invoice.billToEmail}</p>}
          </div>
        </div>

        <div className="mt-8 text-sm">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `1fr ${amountColumnWidth}`,
              borderTop: `1px solid ${borderColor}`,
              borderLeft: `1px solid ${borderColor}`,
              borderRight: `1px solid ${borderColor}`,
            }}
          >
            <div
              className="px-3 py-2 font-bold text-gray-950"
              style={{
                background: headerBlue,
                borderRight: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              DESCRIPTION
            </div>

            <div
              className="px-3 py-2 text-right font-bold text-gray-950"
              style={{ background: headerBlue, borderBottom: `1px solid ${borderColor}` }}
            >
              AMOUNT
            </div>

            {displayRows.map((row) => (
              <div key={`${row.id}-description`} className="contents invoice-row">
                <div
                  className="px-3 py-1"
                  style={{ borderRight: `1px solid ${borderColor}` }}
                >
                  {row.description}
                </div>

                <div className="px-3 py-1 text-right">{row.amount}</div>
              </div>
            ))}

            {displayRows.length < 8 && (
              <>
                <div style={{ minHeight: "224px", borderRight: `1px solid ${borderColor}` }} />
                <div />
              </>
            )}

            <div
              className="px-3 py-3 text-center italic"
              style={{
                borderTop: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              {invoice.footerMessage || "Thank you for your business!"}
            </div>

            <div
              className="px-3 py-3"
              style={{
                borderTop: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex justify-between gap-3 font-bold">
                <span>TOTAL</span>
                <span>${formatMoneyNumber(totals.total)}</span>
              </div>
              <div className="mt-2 space-y-1 text-xs font-normal">
                <div className="flex justify-between gap-3">
                  <span>Subtotal</span>
                  <span>${formatMoneyNumber(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span>Discount</span>
                    <span>-${formatMoneyNumber(totals.discount)}</span>
                  </div>
                )}
                {totals.tax > 0 && (
                  <div className="flex justify-between gap-3">
                    <span>Tax</span>
                    <span>${formatMoneyNumber(totals.tax)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm">
          <p>
            {invoice.contactMessage ||
              "If you have any questions about this invoice, please contact us."}
          </p>
          <p>
            {invoice.companyPhone}
            {invoice.companyPhone && invoice.companyEmail ? ", " : ""}
            {invoice.companyEmail}
          </p>
        </div>
      </div>

      <div className="print-hidden print:hidden">
        <DocumentAttachments
          workspaceId={invoice.workspaceId}
          invoiceId={invoice.id}
          title="Invoice Documents"
        />
      </div>
    </div>
  );
}
```

## app\invoices\new\page.tsx

```tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { storageKeys, useStoredJsonState, writeStoredJson } from "@/lib/clientStorage";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { Job } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import { InvoiceRow, InvoiceSetupDraft } from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import { consumeAiFormHydration, payloadString } from "@/lib/ai/formHydration";
import type { DraftPayload } from "@/lib/ai/types";

type WorkspaceInvoiceSettings = {
  workspaceId: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyPhone?: string;
  companyEmail?: string;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNextInvoiceNumber(savedInvoices: InvoiceRow[]) {
  const highestExistingNumber = savedInvoices.reduce((highest, invoice) => {
    const match = invoice.invoiceNumber.match(/^INV-(\d+)$/i);
    if (!match) return highest;

    return Math.max(highest, Number(match[1]));
  }, 0);

  const nextNumber = highestExistingNumber + 1;

  return `INV-${String(nextNumber).padStart(3, "0")}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startingJobId = searchParams.get("jobId") || "";
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(storageKeys.jobs, []);
  const [localSavedInvoices, setLocalSavedInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [databaseSavedInvoices, setDatabaseSavedInvoices] = useState<InvoiceRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [workspaceSettings] = useStoredJsonState<WorkspaceInvoiceSettings[]>(
    storageKeys.settings,
    []
  );

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const jobsRepo = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localSavedInvoices, setLocalInvoices: setLocalSavedInvoices }), [isDatabaseMode, localSavedInvoices, setLocalSavedInvoices, supabase]);
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;
  const savedInvoices = isDatabaseMode ? databaseSavedInvoices : localSavedInvoices;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([clientsRepo.getClients(activeWorkspace.id), jobsRepo.getJobs(activeWorkspace.id), invoicesRepo.getInvoices(activeWorkspace.id)]).then(([clients, jobs, invoices]) => {
      if (!cancelled) { setDatabaseClientItems(clients); setDatabaseJobItems(jobs); setDatabaseSavedInvoices(invoices); }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load invoice setup data.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, invoicesRepo, isDatabaseMode, jobsRepo]);

  const workspaceClients = clientItems.filter(
    (client) => client.workspaceId === activeWorkspace.id
  );

  const activeWorkspaceClients = workspaceClients.filter(
    (client) => client.status === "Active"
  );

  const workspaceJobs = jobItems
    .filter((job) => job.workspaceId === activeWorkspace.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  function getClientForJob(job: Job) {
    if (job.clientId) {
      const matchedById = workspaceClients.find(
        (client) => client.id === job.clientId
      );

      if (matchedById) return matchedById;
    }

    return workspaceClients.find(
      (client) =>
        client.name.trim().toLowerCase() === job.client.trim().toLowerCase()
    );
  }

  const startingJob = workspaceJobs.find((job) => job.id === startingJobId);
  const startingClient = startingJob ? getClientForJob(startingJob) : undefined;

  const [selectedClientId, setSelectedClientId] = useState(
    startingClient?.id ?? "new"
  );
  const [selectedJobId, setSelectedJobId] = useState(startingJob?.id ?? "");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());

  const [billToName, setBillToName] = useState(
    startingClient?.name ?? startingJob?.client ?? ""
  );
  const [billToCompany, setBillToCompany] = useState("");
  const [billToAddress, setBillToAddress] = useState(
    startingClient?.address ?? ""
  );
  const [billToCity, setBillToCity] = useState(startingClient?.city ?? "");
  const [billToState, setBillToState] = useState(
    (startingClient?.state ?? "").toUpperCase()
  );
  const [billToZip, setBillToZip] = useState(startingClient?.zip ?? "");
  const [billToPhone, setBillToPhone] = useState(
    formatPhone(startingClient?.phone ?? "")
  );
  const [billToEmail, setBillToEmail] = useState(startingClient?.email ?? "");
  const [aiInvoicePayload, setAiInvoicePayload] = useState<DraftPayload | null>(null);
  const [footerMessage, setFooterMessage] = useState("Thank you for your business!");
  const [contactMessage, setContactMessage] = useState("Please contact us with any questions about this invoice.");

  useEffect(() => {
    const hydration = consumeAiFormHydration("invoice", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      const payload = hydration.payload;
      setAiInvoicePayload(payload);
      setSelectedClientId(payloadString(payload, "clientId") || "new");
      setSelectedJobId(payloadString(payload, "jobId"));
      setInvoiceNumber(payloadString(payload, "invoiceNumber"));
      setInvoiceDate(payloadString(payload, "date") || getTodayDate());
      setBillToName(payloadString(payload, "clientName") || payloadString(payload, "billToName"));
      setBillToCompany(payloadString(payload, "billToCompany"));
      setBillToAddress(payloadString(payload, "billToAddress"));
      setBillToCity(payloadString(payload, "billToCity"));
      setBillToState(payloadString(payload, "billToState"));
      setBillToZip(payloadString(payload, "billToZip"));
      setBillToPhone(payloadString(payload, "billToPhone"));
      setBillToEmail(payloadString(payload, "billToEmail"));
      setFooterMessage(payloadString(payload, "notes") || "Thank you for your business!");
    });
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (!startingJob || selectedJobId === startingJob.id) return;

    queueMicrotask(() => {
      setSelectedJobId(startingJob.id);
      if (startingClient) {
        setSelectedClientId(startingClient.id);
        setBillToName(startingClient.name ?? "");
        setBillToCompany("");
        setBillToAddress(startingClient.address ?? "");
        setBillToCity(startingClient.city ?? "");
        setBillToState((startingClient.state ?? "").toUpperCase());
        setBillToZip(startingClient.zip ?? "");
        setBillToPhone(formatPhone(startingClient.phone ?? ""));
        setBillToEmail(startingClient.email ?? "");
      } else {
        setSelectedClientId("new");
        setBillToName(startingJob.client);
      }
    });
  }, [selectedJobId, startingClient, startingJob]);

  const savedWorkspaceSettings = workspaceSettings.find(
    (settings) => settings.workspaceId === activeWorkspace.id
  );

  const companyPlaceholder = {
    companyName:
      savedWorkspaceSettings?.companyName ||
      `${getWorkspaceDisplayName(activeWorkspace)} Company`,
    companyAddress:
      savedWorkspaceSettings?.companyAddress || "123 Business Street",
    companyCity: savedWorkspaceSettings?.companyCity || "Rochester Hills",
    companyState: savedWorkspaceSettings?.companyState || "MI",
    companyZip: savedWorkspaceSettings?.companyZip || "48307",
    companyPhone: savedWorkspaceSettings?.companyPhone || "(555) 123-4567",
    companyEmail: savedWorkspaceSettings?.companyEmail || "billing@example.com",
  };

  function clearBillToForm() {
    setSelectedClientId("new");
    setBillToName("");
    setBillToCompany("");
    setBillToAddress("");
    setBillToCity("");
    setBillToState("");
    setBillToZip("");
    setBillToPhone("");
    setBillToEmail("");
  }

  function populateBillToFromClient(clientId: string) {
    if (clientId === "new") {
      clearBillToForm();
      return;
    }

    const selectedClient = workspaceClients.find((client) => client.id === clientId);

    if (!selectedClient) return;

    setSelectedClientId(clientId);
    setBillToName(selectedClient.name ?? "");
    setBillToCompany("");
    setBillToAddress(selectedClient.address ?? "");
    setBillToCity(selectedClient.city ?? "");
    setBillToState((selectedClient.state ?? "").toUpperCase());
    setBillToZip(selectedClient.zip ?? "");
    setBillToPhone(formatPhone(selectedClient.phone ?? ""));
    setBillToEmail(selectedClient.email ?? "");
  }

  function populateFromJob(jobId: string) {
    if (!jobId) {
      setSelectedJobId("");
      return;
    }

    const selectedJob = workspaceJobs.find((job) => job.id === jobId);

    if (!selectedJob) return;

    setSelectedJobId(selectedJob.id);

    const matchedClient = getClientForJob(selectedJob);

    if (matchedClient) {
      populateBillToFromClient(matchedClient.id);
    } else {
      setSelectedClientId("new");
      setBillToName(selectedJob.client);
    }
  }

  function markManualBillToEdit() {
    setSelectedClientId("new");
  }

  function continueToBuilder() {
    const resolvedInvoiceNumber =
      invoiceNumber.trim() || getNextInvoiceNumber(savedInvoices);
    const attachedJob = workspaceJobs.find((job) => job.id === selectedJobId);

    if (!invoiceDate.trim()) return;
    if (!billToName.trim() && !billToCompany.trim()) return;

    const draft: InvoiceSetupDraft = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      invoiceNumber: resolvedInvoiceNumber,
      invoiceDate,

      jobId: attachedJob?.id,
      jobName: attachedJob?.name,
      sourceClientId: selectedClientId !== "new" ? selectedClientId : undefined,

      ...companyPlaceholder,

      billToName: billToName.trim(),
      billToCompany: billToCompany.trim(),
      billToAddress: billToAddress.trim(),
      billToCity: billToCity.trim(),
      billToState: billToState.trim().toUpperCase(),
      billToZip: billToZip.trim(),
      billToPhone: billToPhone.trim(),
      billToEmail: billToEmail.trim(),

      footerMessage: footerMessage.trim(),
      contactMessage: contactMessage.trim(),
    };

    if (aiInvoicePayload) {
      const rawLineItems = aiInvoicePayload.lineItems;
      if (Array.isArray(rawLineItems)) {
        Object.assign(draft, {
          lineItems: rawLineItems.flatMap((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return [];
            const description = typeof item.description === "string" ? item.description : "";
            const quantity = typeof item.quantity === "number" ? item.quantity : 1;
            const price = typeof item.unitPrice === "number" || typeof item.unitPrice === "string"
              ? String(item.unitPrice)
              : "";
            return description ? [{ id: crypto.randomUUID(), description, quantity, unitPrice: price }] : [];
          }),
          taxRate: typeof aiInvoicePayload.taxRate === "number" ? String(aiInvoicePayload.taxRate) : "",
          status: payloadString(aiInvoicePayload, "status") || "Draft",
        });
      }
    }

    writeStoredJson(storageKeys.invoiceDraft, draft);
    router.push("/invoices/new/build");
  }

  const inputClass =
    "rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-950 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
  const labelClass = "mb-2 block text-sm font-medium";

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">


        <Link
          href="/invoices"
          className="w-fit rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back to Invoices
        </Link>
      </div>

      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        {dataError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {dataError}
          </div>
        )}
        {isLoadingData && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            Loading invoice setup...
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_180px]">
          <div>
            <label className={labelClass}>Attach to Job</label>
            <select
              value={selectedJobId}
              onChange={(event) => populateFromJob(event.target.value)}
              className={`${inputClass} w-full bg-white`}
            >
              <option value="">No attached job</option>
              {workspaceJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name} - {job.client}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Invoice #</label>
            <input
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              placeholder="Leave blank for auto-number"
              className={`${inputClass} w-full`}
            />
          </div>

          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
          <h2 className="text-xl font-bold">From</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Uses the saved business profile for this workspace. You can edit this information from the settings tab.
          </p>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-800">
            <p className="font-semibold">{companyPlaceholder.companyName}</p>
            <p>{companyPlaceholder.companyAddress}</p>
            <p>
              {companyPlaceholder.companyCity}, {companyPlaceholder.companyState}{" "}
              {companyPlaceholder.companyZip}
            </p>
            <p className="mt-2">{companyPlaceholder.companyPhone}</p>
            <p>{companyPlaceholder.companyEmail}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Bill To</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Active clients show in the dropdown. Manually typed matching leads are promoted to Active when saved.
              </p>
            </div>

            <select
              value={selectedClientId}
              onChange={(event) => populateBillToFromClient(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="new">New Client</option>
              {activeWorkspaceClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                value={billToName}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToName(event.target.value);
                }}
                placeholder="Name"
                className={inputClass}
              />

              <input
                value={billToCompany}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToCompany(event.target.value);
                }}
                placeholder="Company Name"
                className={inputClass}
              />
            </div>

            <input
              value={billToAddress}
              onChange={(event) => {
                markManualBillToEdit();
                setBillToAddress(event.target.value);
              }}
              placeholder="Street Address"
              className={`${inputClass} w-full`}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_160px]">
              <input
                value={billToCity}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToCity(event.target.value);
                }}
                placeholder="City"
                className={inputClass}
              />

              <input
                value={billToState}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToState(event.target.value.toUpperCase());
                }}
                placeholder="State"
                maxLength={2}
                className={inputClass}
              />

              <input
                value={billToZip}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToZip(event.target.value);
                }}
                placeholder="ZIP"
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
              <input
                type="tel"
                inputMode="tel"
                value={billToPhone}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToPhone(formatPhone(event.target.value));
                }}
                placeholder="Phone"
                className={inputClass}
              />

              <input
                type="email"
                value={billToEmail}
                onChange={(event) => {
                  markManualBillToEdit();
                  setBillToEmail(event.target.value);
                }}
                placeholder="Email"
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
        <h2 className="text-xl font-bold">Messages</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className={labelClass}>Footer Message</label>
            <input
              value={footerMessage}
              onChange={(event) => setFooterMessage(event.target.value)}
              placeholder="Thank you message"
              className={`${inputClass} w-full`}
            />
          </div>

          <div>
            <label className={labelClass}>Contact Message</label>
            <input
              value={contactMessage}
              onChange={(event) => setContactMessage(event.target.value)}
              placeholder="Contact message"
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/invoices"
          className="rounded-lg border border-gray-300 px-5 py-3 text-center hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={continueToBuilder}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Continue to Itemization
        </button>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 text-gray-950 dark:text-gray-100">
          Loading invoice setup...
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
```

## app\invoices\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { deleteInvoiceAction, updateInvoiceAction } from "@/lib/actions/invoices";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createInvoicesRepository } from "@/lib/db/invoices";
import {
  formatCurrency,
  getInvoiceClientName,
  getInvoiceTotals,
  InvoiceRow,
  invoiceStatuses,
  InvoiceStatus,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";

export default function InvoicesPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);
  const invoices = isDatabaseMode ? databaseInvoices : localInvoices;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingInvoices(true);
        setInvoiceError("");
      }
    });
    invoicesRepo.getInvoices(activeWorkspace.id).then((items) => { if (!cancelled) setDatabaseInvoices(items); }).catch((error) => {
      if (!cancelled) setInvoiceError(error instanceof Error ? error.message : "Unable to load invoices.");
    }).finally(() => {
      if (!cancelled) setIsLoadingInvoices(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, invoicesRepo, isDatabaseMode]);

  const workspaceInvoices = invoices.filter(
    (invoice) => invoice.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const totalOutstanding = workspaceInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + getInvoiceTotals(invoice).total, 0);

  function saveInvoices(updatedInvoices: InvoiceRow[]) {
    if (isDatabaseMode) setDatabaseInvoices(updatedInvoices);
    else setLocalInvoices(updatedInvoices);
  }

  function toggleInvoice(id: string) {
    setSelectedInvoices((current) =>
      current.includes(id)
        ? current.filter((invoiceId) => invoiceId !== id)
        : [...current, id]
    );
  }

  function openDeleteModal() {
    if (!canDeleteBusinessRecords) return;
    if (selectedInvoices.length === 0) return;
    setShowDeleteModal(true);
  }

  async function removeSelectedInvoices() {
    if (!canDeleteBusinessRecords) return;

    try {
      const results = await Promise.all(
        selectedInvoices.map((id) =>
          deleteInvoiceAction(invoicesRepo, id, activeWorkspace.id)
        )
      );
      const deletedIds = selectedInvoices.filter((_, index) => results[index].ok);
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !deletedIds.length) {
        setInvoiceError(failedDelete.ok ? "Unable to delete invoices." : failedDelete.error);
        return;
      }
      saveInvoices(invoices.filter((invoice) => !deletedIds.includes(invoice.id)));
      setSelectedInvoices([]);
      setShowDeleteModal(false);
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to delete invoices.");
    }
  }

  async function updateInvoiceStatus(id: string, nextStatus: InvoiceStatus) {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice) return;
    try {
      const result = await updateInvoiceAction(invoicesRepo, { ...invoice, status: nextStatus });
      if (!result.ok) {
        setInvoiceError(result.error);
        return;
      }
      const saved = result.data;
      saveInvoices(invoices.map((item) => item.id === id ? saved : item));
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to update invoice.");
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">


        <div className="flex flex-wrap gap-2">
          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Invoice
          </Link>

          <button
            type="button"
            onClick={openDeleteModal}
            disabled={selectedInvoices.length === 0 || !canDeleteBusinessRecords}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove Invoice
          </button>
        </div>
      </div>

      {selectedInvoices.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedInvoices.length} invoice
          {selectedInvoices.length === 1 ? "" : "s"} selected
        </div>
      )}

      {invoiceError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {invoiceError}
        </div>
      )}

      {isLoadingInvoices && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading invoices...
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="mt-1 text-2xl font-bold">{workspaceInvoices.length}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
          <p className="mt-1 truncate text-2xl font-bold">
            {workspaceDisplayName}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4"></th>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Bill To</th>
              <th className="p-4">Job</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {workspaceInvoices.length > 0 ? (
              workspaceInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => toggleInvoice(invoice.id)}
                      className="h-4 w-4"
                    />
                  </td>

                  <td className="p-4 font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>

                  <td className="p-4">{invoice.invoiceDate}</td>
                  <td className="p-4">{getInvoiceClientName(invoice)}</td>

                  <td className="p-4">
                    {invoice.jobId ? (
                      <Link
                        href={`/jobs/${invoice.jobId}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {invoice.jobName || "Open Job"}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-4">
                    <select
                      value={invoice.status}
                      onChange={(event) =>
                        updateInvoiceStatus(
                          invoice.id,
                          event.target.value as InvoiceStatus
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      {invoiceStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-right font-medium">
                    {formatCurrency(getInvoiceTotals(invoice).total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-lg text-gray-500 dark:text-gray-400"
                >
                  No invoices found for {workspaceDisplayName}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Remove Invoice(s)
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to remove the selected invoice(s)?
            </p>

            <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {selectedInvoices.length} invoice
              {selectedInvoices.length === 1 ? "" : "s"} selected
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={removeSelectedInvoices}
                disabled={!canDeleteBusinessRecords}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\jobs\[id]\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import DocumentAttachments from "@/app/documents/DocumentAttachments";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { updateJobAction } from "@/lib/actions/jobs";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const jobStatuses: JobStatus[] = ["Lead", "Quoted", "Scheduled", "Completed", "Paid"];

function getStatusClasses(status: string) {
  switch (status) {
    case "Lead":
      return "bg-gray-400 text-gray-900";
    case "Quoted":
      return "bg-yellow-100 text-yellow-700";
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Paid":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function JobPage() {
  const params = useParams();
  const id = String(params.id);
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseJob, setDatabaseJob] = useState<Job | null>(null);
  const [databaseClients, setDatabaseClients] = useState<ClientRow[]>([]);
  const [localInvoiceItems, setLocalInvoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoices, setDatabaseInvoices] = useState<InvoiceRow[]>([]);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [dataError, setDataError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editStatus, setEditStatus] = useState<JobStatus>("Lead");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [editMaterials, setEditMaterials] = useState<JobMaterial[]>([]);
  const [editMaterialName, setEditMaterialName] = useState("");
  const [editMaterialQuantity, setEditMaterialQuantity] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const jobsRepository = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientsRepository = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const invoicesRepository = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localInvoiceItems, setLocalInvoices: setLocalInvoiceItems }), [isDatabaseMode, localInvoiceItems, setLocalInvoiceItems, supabase]);
  const job = isDatabaseMode ? databaseJob : localJobItems.find((item) => item.id === id);
  const clientItems = isDatabaseMode ? databaseClients : localClientItems;
  const invoiceItems = isDatabaseMode ? databaseInvoices : localInvoiceItems;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingJob(true);
        setDataError("");
      }
    });
    jobsRepository.getJobById(id).then(async (loadedJob) => {
      if (cancelled) return;
      setDatabaseJob(loadedJob);
      if (loadedJob) {
        const [clients, invoices] = await Promise.all([
          clientsRepository.getClients(loadedJob.workspaceId),
          invoicesRepository.getInvoices(loadedJob.workspaceId),
        ]);
        if (!cancelled) {
          setDatabaseClients(clients);
          setDatabaseInvoices(invoices);
        }
      }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load job.");
    }).finally(() => {
      if (!cancelled) setIsLoadingJob(false);
    });
    return () => { cancelled = true; };
  }, [clientsRepository, id, invoicesRepository, isDatabaseMode, jobsRepository]);
  const workspaceClients = job
    ? clientItems.filter((client) => client.workspaceId === job.workspaceId)
    : [];
  const jobInvoices = invoiceItems.filter((invoice) => invoice.jobId === id);
  const invoiceTotal = jobInvoices.reduce(
    (total, invoice) => total + getInvoiceTotals(invoice).total,
    0
  );

  function getClientForJob(jobItem: Job) {
    if (jobItem.clientId) {
      const matchedById = workspaceClients.find(
        (client) => client.id === jobItem.clientId
      );

      if (matchedById) return matchedById;
    }

    return workspaceClients.find(
      (client) =>
        client.name.trim().toLowerCase() ===
        jobItem.client.trim().toLowerCase()
    );
  }

  function openEditBox() {
    if (!job) return;
    const matchedClient = getClientForJob(job);

    setEditName(job.name);
    setEditClientId(matchedClient?.id ?? "");
    setEditStatus(job.status);
    setEditDate(job.date);
    setEditTime(job.time ?? "");
    setEditValue(job.value.replace("$", "").replace(",", ""));
    setEditNotes(job.notes ?? "");
    setEditMaterials(job.materials ?? []);
    setEditMaterialName("");
    setEditMaterialQuantity("");
    setEditOpen(true);
  }

  function closeEditBox() {
    setEditOpen(false);
    setEditMaterialName("");
    setEditMaterialQuantity("");
  }

  function addEditMaterial() {
    if (!editMaterialName.trim()) return;

    const quantity = Number(editMaterialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setEditMaterials((current) => [...current, { name: editMaterialName.trim(), quantity }]);
    setEditMaterialName("");
    setEditMaterialQuantity("");
  }

  function removeEditMaterial(indexToRemove: number) {
    setEditMaterials((current) => current.filter((_, index) => index !== indexToRemove));
  }

  async function saveEditedJob() {
    if (!job) return;
    if (!editName.trim() || !editClientId) return;

    const selectedClient = workspaceClients.find(
      (client) => client.id === editClientId
    );

    if (!selectedClient) return;

    const formattedValue = editValue.trim()
      ? editValue.trim().startsWith("$")
        ? editValue.trim()
        : `$${editValue.trim()}`
      : "$0";

    const updatedJob: Job = {
      ...job,
      name: editName.trim(),
      clientId: selectedClient.id,
      client: selectedClient.name,
      status: editStatus,
      date: editDate,
      time: editTime,
      value: formattedValue,
      notes: editNotes,
      materials: editMaterials,
    };

    try {
      const result = await updateJobAction(jobsRepository, updatedJob);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const saved = result.data;
      if (isDatabaseMode) setDatabaseJob(saved);
      setDataError("");
      setEditOpen(false);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to update job.");
    }
  }

  if (isLoadingJob) {
    return (
      <div className="space-y-4 p-6 text-gray-950 dark:text-gray-100">
        <h1 className="text-3xl font-bold">Loading job...</h1>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4 p-6 text-gray-950 dark:text-gray-100">
        <h1 className="text-3xl font-bold">Job not found</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {dataError || "This job does not exist in the current saved job list."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{job.name}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{job.client}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/invoices/new?jobId=${job.id}`}
            className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          >
            Create Invoice
          </Link>

          <button
            type="button"
            onClick={openEditBox}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Edit Job
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Job Information</h2>
        <div className="space-y-3">
          <p><strong>Client:</strong> {job.client}</p>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(job.status)}`}>{job.status}</span>
          </div>
          <p><strong>Scheduled:</strong> {job.date || "-"}{job.time ? ` at ${job.time}` : ""}</p>
          <p><strong>Estimated Value:</strong> {job.value}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Materials</h2>
        {job.materials && job.materials.length > 0 ? (
          <ul className="ml-6 list-disc">
            {job.materials.map((material, index) => (
              <li key={`${material.name}-${index}`}>{material.quantity} - {material.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No materials added.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Notes</h2>
        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {job.notes || "No notes added."}
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <Link href={`/invoices/new?jobId=${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
            + Create invoice for this job
          </Link>
        </div>

        {jobInvoices.length > 0 ? (
          <div className="space-y-3">
            {jobInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/invoices/${invoice.id}`} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {invoice.status} - {invoice.invoiceDate}
                    </p>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(getInvoiceTotals(invoice).total)}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 text-right text-lg font-bold dark:border-gray-800">
              Invoice Total: {formatCurrency(invoiceTotal)}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No invoices attached to this job.</p>
        )}
      </div>

      <DocumentAttachments
        workspaceId={job.workspaceId}
        jobId={job.id}
        title="Job Documents"
      />

      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">Edit Job</h2>
              <button type="button" onClick={closeEditBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
            </div>

            <div className="space-y-4">
              <input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="Job Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              <select value={editClientId} onChange={(event) => setEditClientId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <option value="">Select Client</option>
                {workspaceClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as JobStatus)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                {jobStatuses.map((statusItem) => <option key={statusItem}>{statusItem}</option>)}
              </select>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                <input type="time" value={editTime} onChange={(event) => setEditTime(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
              </div>
              <input type="number" value={editValue} onChange={(event) => setEditValue(event.target.value)} placeholder="Estimated Value" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-950 dark:text-gray-100">Materials</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto]">
                  <input type="text" value={editMaterialName} onChange={(event) => setEditMaterialName(event.target.value)} placeholder="Material name" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <input type="number" value={editMaterialQuantity} onChange={(event) => setEditMaterialQuantity(event.target.value)} placeholder="Qty" className="rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />
                  <button type="button" onClick={addEditMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Add</button>
                </div>

                <div className="mt-4 space-y-2">
                  {editMaterials.length > 0 ? (
                    editMaterials.map((material, index) => (
                      <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                        <span>{material.quantity} - {material.name}</span>
                        <button type="button" onClick={() => removeEditMaterial(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">Remove</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No materials added.</p>
                  )}
                </div>
              </div>

              <textarea rows={4} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} placeholder="Notes" className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800" />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeEditBox} className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
                <button type="button" onClick={saveEditedJob} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## app\jobs\page.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createJobAction, deleteJobAction } from "@/lib/actions/jobs";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import {
  formatCurrency,
  getInvoiceTotals,
  InvoiceRow,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import { consumeAiFormHydration, payloadNumber, payloadString } from "@/lib/ai/formHydration";

function getStatusColor(status: JobStatus) {
  switch (status) {
    case "Lead":
      return "bg-gray-500";
    case "Quoted":
      return "bg-yellow-500";
    case "Scheduled":
      return "bg-blue-500";
    case "Completed":
      return "bg-green-500";
    case "Paid":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

export default function JobsPage() {
  const { activeWorkspace, canDeleteBusinessRecords } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localJobItems, setLocalJobItems] = useStoredJsonState<Job[]>(
    storageKeys.jobs,
    []
  );
  const [databaseJobItems, setDatabaseJobItems] = useState<Job[]>([]);
  const [localInvoiceItems, setLocalInvoiceItems] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoiceItems, setDatabaseInvoiceItems] = useState<InvoiceRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [newJobOpen, setNewJobOpen] = useState(false);

  const [clientId, setClientId] = useState("");
  const [jobName, setJobName] = useState("");
  const [status, setStatus] = useState<JobStatus>("Lead");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [localClientItems, setLocalClientItems] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClientItems, setDatabaseClientItems] = useState<ClientRow[]>([]);
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materials, setMaterials] = useState<JobMaterial[]>([]);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const jobsRepository = useMemo(() => createJobsRepository({ isSignedIn: isDatabaseMode, supabase, localJobs: localJobItems, setLocalJobs: setLocalJobItems }), [isDatabaseMode, localJobItems, setLocalJobItems, supabase]);
  const clientsRepository = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients: localClientItems, setLocalClients: setLocalClientItems }), [isDatabaseMode, localClientItems, setLocalClientItems, supabase]);
  const invoicesRepository = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices: localInvoiceItems, setLocalInvoices: setLocalInvoiceItems }), [isDatabaseMode, localInvoiceItems, setLocalInvoiceItems, supabase]);
  const jobItems = isDatabaseMode ? databaseJobItems : localJobItems;
  const clientItems = isDatabaseMode ? databaseClientItems : localClientItems;
  const invoiceItems = isDatabaseMode ? databaseInvoiceItems : localInvoiceItems;

  useEffect(() => {
    const hydration = consumeAiFormHydration("job", activeWorkspace.id);
    if (!hydration) return;

    queueMicrotask(() => {
      const payload = hydration.payload;
      setClientId(payloadString(payload, "clientId"));
      setJobName(payloadString(payload, "title") || payloadString(payload, "name"));
      setDate(payloadString(payload, "date"));
      setTime(payloadString(payload, "time"));
      setNotes(payloadString(payload, "notes"));
      const amount = payloadNumber(payload, "value");
      setValue(amount === null ? "" : String(amount));
      const nextStatus = payloadString(payload, "status") as JobStatus;
      if (["Lead", "Quoted", "Scheduled", "Completed", "Paid"].includes(nextStatus)) {
        setStatus(nextStatus);
      }
      const rawMaterials = payload.materials;
      if (Array.isArray(rawMaterials)) {
        setMaterials(
          rawMaterials.flatMap((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return [];
            const name = typeof item.name === "string" ? item.name : "";
            const quantity = typeof item.quantity === "number" ? item.quantity : 0;
            return name && quantity > 0 ? [{ name, quantity }] : [];
          })
        );
      }
      setNewJobOpen(true);
    });
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingData(true);
        setDataError("");
      }
    });
    Promise.all([
      jobsRepository.getJobs(activeWorkspace.id),
      clientsRepository.getClients(activeWorkspace.id),
      invoicesRepository.getInvoices(activeWorkspace.id),
    ]).then(([jobs, clients, invoices]) => {
      if (!cancelled) {
        setDatabaseJobItems(jobs);
        setDatabaseClientItems(clients);
        setDatabaseInvoiceItems(invoices);
      }
    }).catch((error) => {
      if (!cancelled) setDataError(error instanceof Error ? error.message : "Unable to load jobs.");
    }).finally(() => {
      if (!cancelled) setIsLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepository, invoicesRepository, isDatabaseMode, jobsRepository]);

  const workspaceClients = clientItems.filter(
    (clientItem) => clientItem.workspaceId === activeWorkspace.id
  );

  const workspaceJobs = jobItems.filter(
    (job) => job.workspaceId === activeWorkspace.id
  );
  const workspaceDisplayName = getWorkspaceDisplayName(activeWorkspace);

  const allWorkspaceJobsSelected =
    workspaceJobs.length > 0 &&
    workspaceJobs.every((job) => selectedJobs.includes(job.id));

  function getClientForJob(job: Job) {
    if (job.clientId) {
      const matchedById = workspaceClients.find(
        (clientItem) => clientItem.id === job.clientId
      );

      if (matchedById) return matchedById;
    }

    return workspaceClients.find(
      (clientItem) =>
        clientItem.name.trim().toLowerCase() === job.client.trim().toLowerCase()
    );
  }

  function getInvoicesForJob(jobId: string) {
    return invoiceItems.filter((invoice) => invoice.jobId === jobId);
  }

  function getInvoiceTotalForJob(jobId: string) {
    return getInvoicesForJob(jobId).reduce(
      (total, invoice) => total + getInvoiceTotals(invoice).total,
      0
    );
  }

  function resetForm() {
    setClientId("");
    setJobName("");
    setStatus("Lead");
    setValue("");
    setDate("");
    setTime("");
    setNotes("");
    setMaterialName("");
    setMaterialQuantity("");
    setMaterials([]);
  }

  function closeNewJobBox() {
    setNewJobOpen(false);
    resetForm();
  }

  function toggleJob(jobId: string) {
    setSelectedJobs((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId]
    );
  }

  function toggleAllWorkspaceJobs() {
    if (allWorkspaceJobsSelected) {
      setSelectedJobs((current) =>
        current.filter((jobId) => !workspaceJobs.some((job) => job.id === jobId))
      );
      return;
    }

    setSelectedJobs((current) => {
      const workspaceJobIds = workspaceJobs.map((job) => job.id);
      const preservedOtherWorkspaceSelections = current.filter(
        (jobId) => !workspaceJobIds.includes(jobId)
      );

      return [...preservedOtherWorkspaceSelections, ...workspaceJobIds];
    });
  }

  async function deleteSelectedJobs() {
    if (!canDeleteBusinessRecords) return;

    try {
      const results = await Promise.all(
        selectedJobs.map((id) => deleteJobAction(jobsRepository, id, activeWorkspace.id))
      );
      const deletedIds = selectedJobs.filter((_, i) => results[i].ok);
      const failedDelete = results.find((result) => !result.ok);
      if (failedDelete && !deletedIds.length) {
        setDataError(failedDelete.ok ? "Unable to delete jobs." : failedDelete.error);
        return;
      }
      if (isDatabaseMode) setDatabaseJobItems((c) => c.filter((j) => !deletedIds.includes(j.id)));
      setSelectedJobs([]);
      setDataError("");
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to delete jobs.");
    }
  }

  function addMaterial() {
    if (!materialName.trim()) return;

    const quantity = Number(materialQuantity);
    if (Number.isNaN(quantity) || quantity <= 0) return;

    setMaterials((current) => [...current, { name: materialName.trim(), quantity }]);
    setMaterialName("");
    setMaterialQuantity("");
  }

  function removeMaterial(indexToRemove: number) {
    setMaterials((current) => current.filter((_, index) => index !== indexToRemove));
  }

  async function createJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientId || !jobName.trim()) return;

    const selectedClient = workspaceClients.find(
      (clientItem) => clientItem.id === clientId
    );

    if (!selectedClient) return;

    const formattedValue = value.trim()
      ? value.trim().startsWith("$")
        ? value.trim()
        : `$${value.trim()}`
      : "$0";

    const newJob: Job = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: jobName.trim(),
      clientId: selectedClient.id,
      client: selectedClient.name,
      status,
      value: formattedValue,
      date,
      time,
      materials,
      notes,
    };

    try {
      const result = await createJobAction(jobsRepository, newJob);
      if (!result.ok) {
        setDataError(result.error);
        return;
      }
      const created = result.data;
      if (isDatabaseMode) setDatabaseJobItems((c) => [...c, created]);
      setDataError("");
      closeNewJobBox();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Unable to create job.");
    }
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewJobOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add New Job
          </button>

          <button
            type="button"
            onClick={deleteSelectedJobs}
            disabled={selectedJobs.length === 0 || !canDeleteBusinessRecords}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Job
          </button>
        </div>
      </div>

      {selectedJobs.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-4 text-white">
          {selectedJobs.length} job{selectedJobs.length === 1 ? "" : "s"} selected
        </div>
      )}

      {dataError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Loading jobs...
        </div>
      )}

      {newJobOpen && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Add New Job</h2>
            <button type="button" onClick={closeNewJobBox} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">-</button>
          </div>

          <form onSubmit={createJob} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Client</label>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Select Client</option>
                {workspaceClients.map((clientItem) => (
                  <option key={clientItem.id} value={clientItem.id}>
                    {clientItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Job Name</label>
              <input
                type="text"
                value={jobName}
                onChange={(event) => setJobName(event.target.value)}
                placeholder="Spring Cleanup"
                required
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as JobStatus)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <option>Lead</option>
                <option>Quoted</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Paid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Scheduled Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Scheduled Time</label>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Estimated Value</label>
              <input
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="450"
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="text-xl font-semibold">Materials</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
                <input
                  type="text"
                  value={materialName}
                  onChange={(event) => setMaterialName(event.target.value)}
                  placeholder="Material name"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
                <input
                  type="number"
                  value={materialQuantity}
                  onChange={(event) => setMaterialQuantity(event.target.value)}
                  placeholder="Quantity"
                  className="rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                />
                <button type="button" onClick={addMaterial} className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">
                  Add Material
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {materials.length > 0 ? (
                  materials.map((material, index) => (
                    <div key={`${material.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                      <span>{material.quantity} - {material.name}</span>
                      <button type="button" onClick={() => removeMaterial(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">Remove</button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No materials added yet.</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Notes</label>
              <textarea
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Job details..."
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">Create Job</button>
              <button type="button" onClick={closeNewJobBox} className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
        <table className="min-w-[980px] w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="text-left text-gray-700 dark:text-gray-300">
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allWorkspaceJobsSelected}
                  onChange={toggleAllWorkspaceJobs}
                  disabled={workspaceJobs.length === 0}
                  className="h-4 w-4"
                />
              </th>
              <th className="p-4">Job</th>
              <th className="p-4">Client</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Value</th>
              <th className="p-4 text-right">Invoice</th>
            </tr>
          </thead>

          <tbody>
            {workspaceJobs.length > 0 ? (
              workspaceJobs.map((job) => {
                const matchedClient = getClientForJob(job);
                const jobInvoices = getInvoicesForJob(job.id);
                const invoiceTotal = getInvoiceTotalForJob(job.id);
                const firstInvoice = jobInvoices[0];

                return (
                  <tr key={job.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJob(job.id)}
                        className="h-4 w-4"
                      />
                    </td>

                    <td className="p-4 font-medium">
                      <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {job.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      {matchedClient ? (
                        <Link href={`/clients/${matchedClient.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {job.client}
                        </Link>
                      ) : (
                        <span>{job.client}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`rounded px-3 py-1 text-xs font-medium text-white ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {job.date || "-"}{job.time ? ` at ${job.time}` : ""}
                    </td>
                    <td className="p-4 text-right font-medium">{job.value}</td>
                    <td className="p-4 text-right">
                      {firstInvoice ? (
                        <div>
                          <Link href={`/invoices/${firstInvoice.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                            {firstInvoice.invoiceNumber}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {jobInvoices.length > 1 ? `${jobInvoices.length} invoices - ` : ""}
                            {formatCurrency(invoiceTotal)}
                          </div>
                        </div>
                      ) : (
                        <Link href={`/invoices/new?jobId=${job.id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                          Create
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-lg text-gray-500 dark:text-gray-400">
                  No jobs found for {workspaceDisplayName}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## app\layout.tsx

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { WorkspaceProvider } from "@/components/WorkspaceContext";
import { getCurrentUser } from "@/lib/auth/session";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frontier",
  description: "Business Operations Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <AuthSessionProvider initialUser={user}>
          <WorkspaceProvider>
            <AppShell>
              {children}
            </AppShell>
          </WorkspaceProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
```

## app\login\page.tsx

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getAuthErrorMessage } from "@/lib/auth/messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSigningIn(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(getAuthErrorMessage(error, "Unable to sign in."));
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "Unable to sign in."));
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={login} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {message && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isSigningIn} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isSigningIn} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <button disabled={isSigningIn} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">{isSigningIn ? "Signing in..." : "Sign In"}</button>
        <div className="flex justify-between text-sm">
          <Link href="/signup" className="text-blue-600">Create account</Link>
          <Link href="/reset-password" className="text-blue-600">Reset password</Link>
        </div>
      </form>
    </main>
  );
}
```

## app\logistics\logisticsData.ts

```typescript
import type { ClientRow } from "@/lib/clientTypes";

export type LogisticsLocation = {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  coordinateSource: "saved" | "temporary";
};

export type MissingCoordinateClient = {
  id: string;
  name: string;
  hasAddress: boolean;
};

export function hasClientAddress(client: ClientRow) {
  return Boolean(
    client.address?.trim() ||
      client.city?.trim() ||
      client.state?.trim() ||
      client.zip?.trim()
  );
}

function getTemporaryCoordinates(index: number) {
  const baseLatitude = 42.6584;
  const baseLongitude = -83.1498;
  const row = Math.floor(index / 5);
  const column = index % 5;

  return {
    latitude: baseLatitude + (row - 1) * 0.012,
    longitude: baseLongitude + (column - 2) * 0.014,
  };
}

export function getClientFullAddress(location: LogisticsLocation) {
  return [location.address, location.city, location.state, location.zip]
    .filter(Boolean)
    .join(", ");
}

export function buildLogisticsLocations(
  clients: ClientRow[]
): LogisticsLocation[] {
  return clients
    .map((client, index) => {
      const hasSavedCoordinates =
        typeof client.latitude === "number" &&
        typeof client.longitude === "number";
      const fallbackCoordinates = hasClientAddress(client)
        ? getTemporaryCoordinates(index)
        : undefined;
      const latitude = hasSavedCoordinates
        ? client.latitude
        : fallbackCoordinates?.latitude;
      const longitude = hasSavedCoordinates
        ? client.longitude
        : fallbackCoordinates?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return null;
      }

      return {
        id: client.id,
        workspaceId: client.workspaceId,
        clientId: client.id,
        name: client.name,
        status: client.status,
        address: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zip: client.zip ?? "",
        latitude,
        longitude,
        coordinateSource: hasSavedCoordinates ? "saved" : "temporary",
      };
    })
    .filter((location): location is LogisticsLocation => Boolean(location));
}

export function getMissingCoordinateClients(
  clients: ClientRow[]
): MissingCoordinateClient[] {
  return clients
    .filter(
      (client) =>
        typeof client.latitude !== "number" ||
        typeof client.longitude !== "number"
    )
    .map((client) => ({
      id: client.id,
      name: client.name,
      hasAddress: hasClientAddress(client),
    }));
}
```

## app\logistics\LogisticsMap.tsx

```tsx
"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { osmTileAttribution } from "@/lib/services/attribution";
import { LogisticsLocation } from "./logisticsData";

type LogisticsMapProps = {
  locations: LogisticsLocation[];
  selectedLocationIds: string[];
  onToggleLocation: (locationId: string) => void;
};

const defaultCenter: [number, number] = [42.68, -83.15];

const defaultMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LogisticsMap({
  locations,
  selectedLocationIds,
  onToggleLocation,
}: LogisticsMapProps) {
  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="relative z-0 h-[500px] w-full rounded-xl"
    >
      <TileLayer
        attribution={osmTileAttribution}
        url={
          process.env.NEXT_PUBLIC_OSM_TILE_URL ||
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />

      {locations.map((location) => {
        const isSelected = selectedLocationIds.includes(location.id);

        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
            eventHandlers={{
              click: () => onToggleLocation(location.id),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <div className="font-semibold">{location.name}</div>

                <div className="text-sm">
                  {location.address}
                  <br />
                  {location.city}, {location.state} {location.zip}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleLocation(location.id)}
                  className={`rounded px-3 py-1 text-sm font-semibold text-white ${
                    isSelected
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSelected ? "Remove from Route" : "Add to Route"}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
```

## app\logistics\page.tsx

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createRoutePlanAction } from "@/lib/actions/routes";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createRoutesRepository, type RoutePlan } from "@/lib/db/routes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  buildLogisticsLocations,
  getClientFullAddress,
  getMissingCoordinateClients,
  LogisticsLocation,
} from "./logisticsData";

const LogisticsMap = dynamic(() => import("./LogisticsMap"), {
  ssr: false,
});

const clientStatuses = ["All", "Lead", "Active", "Inactive"];
const maxGoogleMapsUrlLength = 2048;

export default function LogisticsPage() {
  const { activeWorkspace } = useWorkspace();
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [localClients, setLocalClients] = useStoredJsonState<ClientRow[]>(
    storageKeys.clients,
    []
  );
  const [databaseClients, setDatabaseClients] = useState<ClientRow[]>([]);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [routeError, setRouteError] = useState("");
  const [geocodingClientId, setGeocodingClientId] = useState("");
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const clientsRepo = useMemo(() => createClientsRepository({ isSignedIn: isDatabaseMode, supabase, localClients, setLocalClients }), [isDatabaseMode, localClients, setLocalClients, supabase]);
  const routesRepo = useMemo(() => createRoutesRepository({ isSignedIn: isDatabaseMode, supabase }), [isDatabaseMode, supabase]);
  const clients = isDatabaseMode ? databaseClients : localClients;

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    Promise.all([clientsRepo.getClients(activeWorkspace.id), routesRepo.getRoutes(activeWorkspace.id)]).then(([loadedClients, loadedRoutes]) => {
      if (!cancelled) { setDatabaseClients(loadedClients); setRoutes(loadedRoutes); }
    });
    return () => { cancelled = true; };
  }, [activeWorkspace.id, clientsRepo, isDatabaseMode, routesRepo]);

  const workspaceClients = useMemo(() => {
    return clients.filter(
      (client) => client.workspaceId === activeWorkspace.id
    );
  }, [clients, activeWorkspace.id]);

  const filteredClients = useMemo(() => {
    if (selectedStatus === "All") return workspaceClients;

    return workspaceClients.filter(
      (client) => client.status === selectedStatus
    );
  }, [workspaceClients, selectedStatus]);

  const visibleLocations = useMemo(() => {
    return buildLogisticsLocations(filteredClients).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [filteredClients]);

  const missingCoordinateClients = useMemo(() => {
    return getMissingCoordinateClients(filteredClients);
  }, [filteredClients]);

  const selectedLocations = useMemo(() => {
    const locationsById = new Map(
      visibleLocations.map((location) => [location.id, location])
    );
    return selectedLocationIds
      .map((locationId) => locationsById.get(locationId))
      .filter((location): location is LogisticsLocation => Boolean(location));
  }, [visibleLocations, selectedLocationIds]);

  function toggleLocation(locationId: string) {
    setSelectedLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId]
    );
  }

  function selectAllVisibleLocations() {
    setSelectedLocationIds(visibleLocations.map((location) => location.id));
  }

  function clearRoute() {
    setSelectedLocationIds([]);
  }

  function getSelectedRouteNumber(locationId: string) {
    return (
      selectedLocations.findIndex((location) => location.id === locationId) + 1
    );
  }

  function buildGoogleMapsUrl(routeLocations: LogisticsLocation[]) {
    if (routeLocations.length < 2) return "#";

    const origin = encodeURIComponent(
      `${routeLocations[0].latitude},${routeLocations[0].longitude}`
    );

    const destination = encodeURIComponent(
      `${routeLocations[routeLocations.length - 1].latitude},${
        routeLocations[routeLocations.length - 1].longitude
      }`
    );

    const waypoints = routeLocations
      .slice(1, -1)
      .map((location) =>
        encodeURIComponent(`${location.latitude},${location.longitude}`)
      )
      .join("|");

    const waypointParam = waypoints ? `&waypoints=${waypoints}` : "";

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointParam}&travelmode=driving`;
    return url.length <= maxGoogleMapsUrlLength ? url : "";
  }

  const googleMapsUrl = buildGoogleMapsUrl(selectedLocations);
  const canOpenGoogleMaps = selectedLocations.length >= 2 && Boolean(googleMapsUrl);

  async function geocodeClient(clientId: string) {
    if (!isDatabaseMode) {
      setRouteError("Sign in to geocode and save client coordinates.");
      return;
    }

    setGeocodingClientId(clientId);
    setRouteError("");

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          clientId,
        }),
      });
      const payload = (await response.json()) as {
        data?: {
          clientId: string;
          latitude: number;
          longitude: number;
        };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || "Address could not be geocoded.");
      }

      setDatabaseClients((current) =>
        current.map((client) =>
          client.id === payload.data?.clientId
            ? {
                ...client,
                latitude: payload.data.latitude,
                longitude: payload.data.longitude,
              }
            : client
        )
      );
      setSelectedLocationIds((current) =>
        current.includes(clientId) ? current : [...current, clientId]
      );
    } catch (error) {
      setRouteError(
        error instanceof Error ? error.message : "Address could not be geocoded."
      );
    } finally {
      setGeocodingClientId("");
    }
  }

  async function optimizeRoute() {
    if (!isDatabaseMode || selectedLocations.length < 2) return;

    setIsOptimizingRoute(true);
    setRouteError("");

    try {
      const response = await fetch("/api/logistics/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          stops: selectedLocations.map((location) => ({
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            addressSnapshot: getClientFullAddress(location),
          })),
        }),
      });
      const payload = (await response.json()) as {
        data?: { orderedStopIds: string[] };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || "Unable to optimize route.");
      }

      setSelectedLocationIds(payload.data.orderedStopIds);
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : "Unable to optimize route.");
    } finally {
      setIsOptimizingRoute(false);
    }
  }

  async function saveRoute() {
    if (!isDatabaseMode || selectedLocations.length === 0) return;
    if (selectedLocations.length >= 2 && !googleMapsUrl) {
      setRouteError("Too many route stops for Google Maps export. Reduce stop count.");
      return;
    }

    const route: RoutePlan = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspace.id,
      name: `Route ${new Date().toLocaleDateString()}`,
      googleMapsUrl,
      stops: selectedLocations.map((location, index) => ({
        clientId: location.id,
        stopOrder: index + 1,
        latitude: location.latitude,
        longitude: location.longitude,
        addressSnapshot: getClientFullAddress(location),
      })),
    };
    const result = await createRoutePlanAction(routesRepo, route);
    if (!result.ok) {
      setRouteError(result.error);
      return;
    }
    setRouteError("");
    setRoutes((current) => [result.data, ...current]);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <select
          value={selectedStatus}
          onChange={(event) => {
            setSelectedStatus(event.target.value);
            setSelectedLocationIds([]);
          }}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm lg:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          {clientStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      {routeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {routeError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
                Client Location Map
              </h2>

              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Select client pins to build a route.
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {selectedLocations.length} selected
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <LogisticsMap
              locations={visibleLocations}
              selectedLocationIds={selectedLocationIds}
              onToggleLocation={toggleLocation}
            />
          </div>

          {visibleLocations.length === 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              No client locations found for this filter.
            </div>
          )}

          {missingCoordinateClients.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="font-semibold">Missing coordinates</div>
              <p className="mt-1">
                Geocode saved addresses to replace temporary map positions:
              </p>
              <div className="mt-3 space-y-2">
                {missingCoordinateClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col gap-2 rounded-lg bg-white/70 p-3 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>{client.name}</span>
                    {client.hasAddress ? (
                      <button
                        type="button"
                        onClick={() => geocodeClient(client.id)}
                        disabled={!isDatabaseMode || geocodingClientId === client.id}
                        className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {geocodingClientId === client.id ? "Geocoding..." : "Geocode"}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold">Add an address first</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Geocoding data &copy; OpenStreetMap contributors.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Route Builder
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Add or remove client stops from the route.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={selectAllVisibleLocations}
                disabled={visibleLocations.length === 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
              >
                + Add All
              </button>

              <button
                type="button"
                onClick={clearRoute}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Clear Route
              </button>

              {isDatabaseMode && (
                <>
                  <button
                    type="button"
                    onClick={optimizeRoute}
                    disabled={selectedLocations.length < 2 || isOptimizingRoute}
                    className="w-full rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/30 sm:w-auto"
                  >
                    {isOptimizingRoute ? "Optimizing..." : "Optimize Route"}
                  </button>

                  <button
                    type="button"
                    onClick={saveRoute}
                    disabled={selectedLocations.length === 0}
                    className="w-full rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-300 dark:hover:bg-green-950/30 sm:w-auto"
                  >
                    Save Route
                  </button>
                </>
              )}
            </div>

            {routes.length > 0 && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {routes.length} saved route{routes.length === 1 ? "" : "s"}
              </div>
            )}

            <div className="mt-6 space-y-3">
              {visibleLocations.length > 0 ? (
                visibleLocations.map((location) => {
                  const isSelected = selectedLocationIds.includes(location.id);
                  const routeNumber = getSelectedRouteNumber(location.id);

                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => toggleLocation(location.id)}
                      className={`w-full rounded-xl border p-4 text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-950 dark:text-gray-100">
                            {location.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {location.status}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                            {getClientFullAddress(location)}
                          </p>

                          {location.coordinateSource === "temporary" && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                              Temporary map position
                            </p>
                          )}
                        </div>

                        <span
                          className={`flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {isSelected ? routeNumber : "+"}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No client locations available.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-100">
              Suggested Route
            </h2>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Current selected stop order.
            </p>

            <div className="mt-6 space-y-4">
              {selectedLocations.length > 0 ? (
                selectedLocations.map((location, index) => (
                  <div
                    key={location.id}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-950 dark:text-gray-100">
                          {location.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {getClientFullAddress(location)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Select clients to build a route.
                </p>
              )}
            </div>

            <a
              href={canOpenGoogleMaps ? googleMapsUrl : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!canOpenGoogleMaps}
              className={`mt-6 block w-full rounded-lg px-4 py-3 text-center font-semibold text-white ${
                canOpenGoogleMaps
                  ? "bg-green-600 hover:bg-green-700"
                  : "pointer-events-none cursor-not-allowed bg-gray-400"
              }`}
            >
              Open Route in Google Maps
            </a>
            {selectedLocations.length >= 2 && !googleMapsUrl && (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                Too many route stops for Google Maps export. Reduce stop count.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## app\page.tsx

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="mt-6 text-8xl font-black text-blue-500">
          ⌖
        </div>

        <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.1em] text-gray-950 dark:text-gray-100">
          FRONTIER
        </h1>

        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Business Operations Platform
        </p>

        <div className="mt-8 inline-flex rounded-full border border-green-500 px-5 py-2">
          <span className="animate-pulse font-mono text-sm text-green-400">
            SYSTEM ONLINE _
          </span>
        </div>

        <div className="mt-10 text-sm tracking-widest text-gray-500 dark:text-gray-400">
          Built for the New Frontier.
        </div>

        <p className="mt-16 text-center text-xs tracking-wide text-gray-500 dark:text-gray-400">
          © 2026 Thompson Ventures MI. All Rights Reserved.
        </p>

        <p className="mt-3 text-center">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=thompsonrelay@proton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline"
          >
            Contact Us
          </a>
        </p>

      </div>
    </main>
  );
}
```

## app\reset-password\page.tsx

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { getAuthErrorMessage } from "@/lib/auth/messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function reset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setMessage(
        error
          ? getAuthErrorMessage(error, "Unable to send reset email.")
          : "Password reset email sent."
      );
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "Unable to send reset email."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={reset} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        {message && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isSending} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <button disabled={isSending} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">{isSending ? "Sending reset email..." : "Send Reset Email"}</button>
        <Link href="/login" className="block text-sm text-blue-600">Back to login</Link>
      </form>
    </main>
  );
}
```

## app\review\page.tsx

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import type {
  AiReviewDraft,
  AiReviewDraftRevision,
  AiReviewDraftStatus,
} from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import type { SuggestedAction } from "@/lib/ai/types";
import type { ClientRow } from "@/lib/clientTypes";
import type { Job } from "@/lib/jobTypes";
import { getAiFormTarget, saveAiFormHydration } from "@/lib/ai/formHydration";
import {
  advanceVoiceSession,
  createVoiceSession,
  type VoiceClarificationResponse,
  type VoiceSessionState,
} from "@/lib/ai/voiceClarification";
import type { SpeechWorkerSuccess } from "@/lib/speech/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ReviewDraftsResponse = {
  reviewDrafts?: AiReviewDraft[];
  reviewDraft?: AiReviewDraft;
  executionResult?: unknown;
  revisions?: AiReviewDraftRevision[];
  error?: string;
};

type TranscriptionResponse = {
  transcription?: SpeechWorkerSuccess["data"];
  error?: string;
};

type ImageAnalysisResponse = {
  reviewDraft?: AiReviewDraft;
  analysis?: {
    provider: string;
    model: string;
    usedFallback: boolean;
    confidence: number;
    warnings: unknown[];
    actions: SuggestedAction[];
  };
  error?: string;
};

type VoiceTurn = {
  speaker: "Frontier" | "User";
  text: string;
};

type ReviewFilter =
  | "All"
  | "Pending"
  | "Approved"
  | "Needs Changes"
  | "Rejected"
  | "Executed";

function formatConfidence(confidence: number | null) {
  if (typeof confidence !== "number") return "Unscored";
  return `${Math.round(confidence * 100)}%`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function statusClass(status: AiReviewDraftStatus) {
  if (status === "Approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "Rejected") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  }
  if (status === "Needs Changes") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
}

function executionClass(status: AiReviewDraft["executionStatus"]) {
  if (status === "Executed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "Failed") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  }
  return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300";
}

export default function ReviewQueuePage() {
  const router = useRouter();
  const { activeWorkspace, canDeleteBusinessRecords, isLoadingWorkspaces } =
    useWorkspace();
  const { user } = useAuthSession();
  const [reviewDrafts, setReviewDrafts] = useState<AiReviewDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [executingId, setExecutingId] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("All");
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptLabel, setTranscriptLabel] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const [isRecorderSupported, setIsRecorderSupported] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoListenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordedAudioUrlRef = useRef("");
  const voiceAutoProcessRef = useRef(false);
  const [transcription, setTranscription] = useState<
    SpeechWorkerSuccess["data"] | null
  >(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingTranscriptDraft, setIsGeneratingTranscriptDraft] =
    useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageAnalysis, setImageAnalysis] =
    useState<ImageAnalysisResponse["analysis"] | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [voiceTurns, setVoiceTurns] = useState<VoiceTurn[]>([]);
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceSession, setVoiceSession] = useState<VoiceSessionState>(() =>
    createVoiceSession()
  );
  const [voiceDraftAction, setVoiceDraftAction] = useState<SuggestedAction | null>(
    null
  );
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [voiceClients, setVoiceClients] = useState<ClientRow[]>([]);
  const [voiceJobs, setVoiceJobs] = useState<Job[]>([]);
  const [isCreatingVoiceDraft, setIsCreatingVoiceDraft] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const [error, setError] = useState("");
  const [editingDraftId, setEditingDraftId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editActions, setEditActions] = useState("");
  const [editRevisions, setEditRevisions] = useState<AiReviewDraftRevision[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  function openActionInForm(draft: AiReviewDraft, action: SuggestedAction) {
    const hydration = saveAiFormHydration(
      {
        workspaceId: draft.workspaceId,
        reviewDraftId: draft.id,
        sourceId: draft.sourceId ?? undefined,
        sourceType: draft.sourceType,
      },
      action
    );
    if (!hydration) return;

    const routes = {
      client: "/clients?aiDraft=1",
      job: "/jobs?aiDraft=1",
      invoice: "/invoices/new?aiDraft=1",
      expense: "/financials?aiDraft=1",
      material: "/inventory?aiDraft=1",
    } as const;
    router.push(routes[hydration.target]);
  }

  const workspaceReady = isUuid(activeWorkspace.id);
  const pendingCount = useMemo(
    () => reviewDrafts.filter((draft) => draft.status === "Pending").length,
    [reviewDrafts]
  );
  const filteredReviewDrafts = useMemo(() => {
    if (filter === "All") return reviewDrafts;
    if (filter === "Executed") {
      return reviewDrafts.filter((draft) => draft.executionStatus === "Executed");
    }
    return reviewDrafts.filter((draft) => draft.status === filter);
  }, [filter, reviewDrafts]);

  const loadReviewDrafts = useCallback(async () => {
    if (!user || !workspaceReady) {
      setReviewDrafts([]);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/ai/review-drafts?workspaceId=${encodeURIComponent(activeWorkspace.id)}`
      );
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load review drafts.");
      }
      setReviewDrafts(payload.reviewDrafts ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load review drafts."
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace.id, user, workspaceReady]);

  useEffect(() => {
    queueMicrotask(loadReviewDrafts);
  }, [loadReviewDrafts]);

  useEffect(() => {
    if (!user || !workspaceReady) {
      queueMicrotask(() => {
        setVoiceClients([]);
        setVoiceJobs([]);
      });
      return;
    }

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    async function loadVoiceContext() {
      const [{ data: clients }, { data: jobs }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude")
          .eq("workspace_id", activeWorkspace.id)
          .order("name", { ascending: true }),
        supabase
          .from("jobs")
          .select("id, workspace_id, client_id, client_name_snapshot, name, status, estimated_value_cents, scheduled_date, scheduled_time, notes")
          .eq("workspace_id", activeWorkspace.id)
          .order("scheduled_date", { ascending: true }),
      ]);
      if (cancelled) return;
      setVoiceClients(
        (clients ?? []).map((client) => ({
          id: client.id,
          workspaceId: client.workspace_id,
          name: client.name,
          status: client.status,
          balance: String((client.balance_cents ?? 0) / 100),
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          city: client.city ?? "",
          state: client.state ?? "",
          zip: client.zip ?? "",
          notes: client.notes ?? "",
          latitude: client.latitude ?? undefined,
          longitude: client.longitude ?? undefined,
        }))
      );
      setVoiceJobs(
        (jobs ?? []).map((job) => ({
          id: job.id,
          workspaceId: job.workspace_id,
          clientId: job.client_id ?? undefined,
          client: job.client_name_snapshot ?? "",
          name: job.name,
          status: job.status,
          value: String((job.estimated_value_cents ?? 0) / 100),
          date: job.scheduled_date ?? "",
          time: job.scheduled_time?.slice(0, 5) ?? "",
          notes: job.notes ?? "",
          materials: [],
        }))
      );
    }

    queueMicrotask(loadVoiceContext);
    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, user, workspaceReady]);

  useEffect(() => {
    queueMicrotask(() => {
      setIsRecorderSupported(
        typeof MediaRecorder !== "undefined" &&
          Boolean(navigator.mediaDevices?.getUserMedia)
      );
    });

    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (autoListenTimer.current) clearTimeout(autoListenTimer.current);
      const recorder = mediaRecorderRef.current;
      if (recorder?.state === "recording") recorder.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordedAudioUrlRef.current) URL.revokeObjectURL(recordedAudioUrlRef.current);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  function addVoiceTurn(speaker: VoiceTurn["speaker"], text: string) {
    setVoiceTurns((current) => [...current.slice(-5), { speaker, text }]);
  }

  function speakAssistant(text: string, listenAfter = false) {
    addVoiceTurn("Frontier", text);
    setVoiceStatus(text);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isRecording) stopRecording();
    if (autoListenTimer.current) clearTimeout(autoListenTimer.current);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      if (listenAfter || autoListen) {
        autoListenTimer.current = setTimeout(() => {
          void startRecording();
        }, 450);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function applyClarificationResponse(result: VoiceClarificationResponse) {
    setVoiceSession(result.session);
    setVoiceDraftAction(result.action ?? null);
    speakAssistant(result.assistantMessage, result.needsFollowup && autoListen);
  }

  function advanceClarificationWithText(text: string) {
    if (!text.trim()) return;
    addVoiceTurn("User", text.trim());
    const result = advanceVoiceSession(
      voiceSession,
      text.trim(),
      voiceClients,
      voiceJobs
    );
    applyClarificationResponse(result);
  }

  async function updateStatus(id: string, status: AiReviewDraftStatus) {
    if (!workspaceReady || updatingId || executingId) return;

    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch("/api/ai/review-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          workspaceId: activeWorkspace.id,
          status,
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to update review draft.");
      }
      setReviewDrafts((current) =>
        current.map((draft) =>
          draft.id === payload.reviewDraft?.id ? payload.reviewDraft : draft
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update review draft."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function executeDraft(id: string) {
    if (!workspaceReady || updatingId || executingId) return;

    const confirmed = window.confirm(
      "Execute this approved draft now? This will create the proposed Frontier record."
    );
    if (!confirmed) return;

    setExecutingId(id);
    setError("");
    try {
      const response = await fetch("/api/ai/review-drafts/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          workspaceId: activeWorkspace.id,
          confirmExecution: true,
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to execute review draft.");
      }
      setReviewDrafts((current) =>
        current.map((draft) =>
          draft.id === payload.reviewDraft?.id ? payload.reviewDraft : draft
        )
      );
    } catch (executeError) {
      setError(
        executeError instanceof Error
          ? executeError.message
          : "Unable to execute review draft."
      );
    } finally {
      setExecutingId("");
    }
  }

  async function generateTranscriptDraft(
    transcriptOverride?: string,
    sourceLabelOverride?: string,
    clearAfterCreate = true
  ) {
    const transcript = transcriptOverride?.trim() || transcriptText.trim();
    if (!workspaceReady || !transcript || isGeneratingTranscriptDraft) {
      return null;
    }

    setIsGeneratingTranscriptDraft(true);
    setError("");
    try {
      const response = await fetch("/api/ai/interpret-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          transcript,
          sourceLabel:
            sourceLabelOverride?.trim() || transcriptLabel.trim() || "Transcript",
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to generate transcript draft.");
      }
      setReviewDrafts((current) => [payload.reviewDraft as AiReviewDraft, ...current]);
      if (clearAfterCreate) {
        setTranscriptText("");
        setTranscriptLabel("");
      }
      return payload.reviewDraft as AiReviewDraft;
    } catch (draftError) {
      setError(
        draftError instanceof Error
          ? draftError.message
          : "Unable to generate transcript draft."
      );
      return null;
    } finally {
      setIsGeneratingTranscriptDraft(false);
    }
  }

  async function transcribeAudioSource(file: File, sourceLabel: string) {
    if (!workspaceReady || isTranscribing) return null;

    setIsTranscribing(true);
    setError("");
    setTranscription(null);
    try {
      const formData = new FormData();
      formData.append("workspaceId", activeWorkspace.id);
      formData.append("file", file);

      const response = await fetch("/api/speech/transcribe", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as TranscriptionResponse;
      if (!response.ok || !payload.transcription) {
        throw new Error(payload.error || "Unable to transcribe audio.");
      }

      setTranscription(payload.transcription);
      setTranscriptText(payload.transcription.text);
      if (!transcriptLabel.trim()) setTranscriptLabel(sourceLabel);
      return payload.transcription;
    } catch (transcriptionError) {
      setError(
        transcriptionError instanceof Error
          ? transcriptionError.message
          : "Unable to transcribe audio."
      );
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }

  async function transcribeAudio() {
    if (!audioFile) return;
    await transcribeAudioSource(audioFile, audioFile.name);
  }

  function selectImageFile(file: File | null) {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImageAnalysis(null);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  async function analyzeImage() {
    if (!workspaceReady || !imageFile || isAnalyzingImage) return;

    setIsAnalyzingImage(true);
    setError("");
    setImageAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("workspaceId", activeWorkspace.id);
      formData.append("sourceLabel", imageFile.name);
      formData.append("file", imageFile);

      const response = await fetch("/api/images/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as ImageAnalysisResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to analyze image.");
      }
      setImageAnalysis(payload.analysis ?? null);
      setReviewDrafts((current) => [payload.reviewDraft as AiReviewDraft, ...current]);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to analyze image."
      );
    } finally {
      setIsAnalyzingImage(false);
    }
  }

  function stopRecordingTimer() {
    if (!recordingTimer.current) return;
    clearInterval(recordingTimer.current);
    recordingTimer.current = null;
  }

  function releaseMicrophone() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }

  async function startRecording() {
    if (!isRecorderSupported || isRecording) return;

    setRecordingError("");
    setRecordedBlob(null);
    setRecordingDurationSeconds(0);
    setTranscription(null);
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
      recordedAudioUrlRef.current = "";
      setRecordedAudioUrl("");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordingChunksRef.current = [];

      const preferredMimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setRecordingError("The browser could not complete this recording.");
      };
      recorder.onstop = () => {
        stopRecordingTimer();
        releaseMicrophone();
        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size === 0) {
          setRecordingError("No audio was captured. Try recording again.");
          return;
        }
        const previewUrl = URL.createObjectURL(blob);
        recordedAudioUrlRef.current = previewUrl;
        setRecordedBlob(blob);
        setRecordedAudioUrl(previewUrl);
        if (voiceAutoProcessRef.current) {
          voiceAutoProcessRef.current = false;
          queueMicrotask(() => processVoiceBlob(blob));
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      recordingTimer.current = setInterval(() => {
        setRecordingDurationSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch (recordingFailure) {
      releaseMicrophone();
      setIsRecording(false);
      setRecordingError(
        recordingFailure instanceof DOMException && recordingFailure.name === "NotAllowedError"
          ? "Microphone permission was denied. Upload an audio file instead."
          : "Unable to access the microphone. Upload an audio file instead."
      );
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
    setIsRecording(false);
    stopRecordingTimer();
  }

  function clearRecording() {
    if (isRecording) stopRecording();
    if (recordedAudioUrlRef.current) URL.revokeObjectURL(recordedAudioUrlRef.current);
    recordedAudioUrlRef.current = "";
    setRecordedAudioUrl("");
    setRecordedBlob(null);
    setRecordingDurationSeconds(0);
    setRecordingError("");
  }

  async function transcribeRecording() {
    if (!recordedBlob) return;
    const extension = recordedBlob.type.includes("mp4") ? "mp4" : recordedBlob.type.includes("wav") ? "wav" : "webm";
    const file = new File([recordedBlob], `frontier-recording.${extension}`, {
      type: recordedBlob.type || "audio/webm",
    });
    await transcribeAudioSource(file, file.name);
  }

  async function startVoiceAssistant() {
    if (!canDeleteBusinessRecords || !isRecorderSupported || isRecording) return;
    const nextSession = createVoiceSession();
    setVoiceSession(nextSession);
    setVoiceDraftAction(null);
    setIsVoiceSessionActive(true);
    setVoiceTurns([]);
    speakAssistant("Tell me what you want Frontier to create or update.", true);
  }

  function stopVoiceAssistantRecording() {
    if (!isRecording) return;
    voiceAutoProcessRef.current = true;
    stopRecording();
    speakAssistant("Got it. I am transcribing and preparing a review draft.");
  }

  async function processVoiceBlob(blob: Blob) {
    const extension = blob.type.includes("mp4") ? "mp4" : blob.type.includes("wav") ? "wav" : "webm";
    const file = new File([blob], `frontier-voice-command.${extension}`, {
      type: blob.type || "audio/webm",
    });
    const result = await transcribeAudioSource(file, "Voice command");
    if (!result?.text) {
      speakAssistant("I could not hear enough to create a draft. Please try again.");
      return;
    }
    advanceClarificationWithText(result.text);
  }

  async function createVoiceReviewDraft() {
    if (!workspaceReady || !voiceDraftAction || isCreatingVoiceDraft) return;
    setIsCreatingVoiceDraft(true);
    setError("");
    try {
      const response = await fetch("/api/ai/voice-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          sourceLabel: "Voice clarification",
          rawInput: voiceSession.sourceTranscripts.join("\n"),
          action: voiceDraftAction,
        }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) {
        throw new Error(payload.error || "Unable to create voice review draft.");
      }
      setReviewDrafts((current) => [payload.reviewDraft as AiReviewDraft, ...current]);
      speakAssistant("The review draft is ready. Approve it and execute it when you are ready.");
      setVoiceSession((current) => ({ ...current, mode: "draft_ready" }));
    } catch (voiceDraftError) {
      setError(
        voiceDraftError instanceof Error
          ? voiceDraftError.message
          : "Unable to create voice review draft."
      );
    } finally {
      setIsCreatingVoiceDraft(false);
    }
  }

  function cancelVoiceSession() {
    window.speechSynthesis?.cancel();
    if (isRecording) stopRecording();
    setVoiceSession(createVoiceSession());
    setVoiceDraftAction(null);
    setVoiceAnswer("");
    setVoiceStatus("");
    setVoiceTurns([]);
    setIsVoiceSessionActive(false);
  }

  async function openDraftEditor(draft: AiReviewDraft) {
    setEditingDraftId(draft.id);
    setEditTitle(draft.sourceLabel ?? "");
    setEditSummary(draft.summary ?? "");
    setEditActions(JSON.stringify(draft.actions, null, 2));
    setEditRevisions([]);
    try {
      const response = await fetch(`/api/ai/review-drafts?workspaceId=${encodeURIComponent(activeWorkspace.id)}&draftId=${encodeURIComponent(draft.id)}`);
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (response.ok) setEditRevisions(payload.revisions ?? []);
    } catch {
      setEditRevisions([]);
    }
  }

  async function saveDraftEdit() {
    if (!editingDraftId || isSavingEdit) return;
    setIsSavingEdit(true);
    setError("");
    try {
      const actions = JSON.parse(editActions) as SuggestedAction[];
      const response = await fetch("/api/ai/review-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "content", id: editingDraftId, workspaceId: activeWorkspace.id, sourceLabel: editTitle, summary: editSummary, actions }),
      });
      const payload = (await response.json()) as ReviewDraftsResponse;
      if (!response.ok || !payload.reviewDraft) throw new Error(payload.error || "Unable to save review draft changes.");
      setReviewDrafts((current) => current.map((draft) => draft.id === payload.reviewDraft?.id ? payload.reviewDraft : draft));
      setEditingDraftId("");
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Unable to save review draft changes.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
          AI Review
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="mt-2 max-w-3xl text-gray-600 dark:text-gray-400">
              Review AI-generated action drafts before anything reaches the
              Frontier action layer.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-gray-500 dark:text-gray-400">Pending</div>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </div>
        </div>
      </section>

      {!user && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Sign in to review AI drafts.
        </div>
      )}

      {user && !workspaceReady && !isLoadingWorkspaces && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Create or select a workspace before reviewing drafts.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {user && workspaceReady && (
        <section className="space-y-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">Voice Assistant</h2>
                <p className="mt-1 text-sm text-blue-900/80 dark:text-blue-100/80">
                  Speak a Frontier command. Frontier will transcribe it, create a review draft, and wait for your approval before anything is executed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startVoiceAssistant}
                  disabled={
                    !canDeleteBusinessRecords ||
                    isRecording ||
                    isTranscribing ||
                    isGeneratingTranscriptDraft ||
                    isRecorderSupported !== true
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Voice Command
                </button>
                <button
                  type="button"
                  onClick={stopVoiceAssistantRecording}
                  disabled={!isVoiceSessionActive || !isRecording}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Stop & Prepare Draft
                </button>
              </div>
            </div>
            {isRecorderSupported === false && (
              <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-200">
                Browser microphone recording is unavailable. Use file upload or manual transcript instead.
              </p>
            )}
            {voiceStatus && (
              <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm dark:bg-gray-950/60">
                <span className="font-bold">Frontier:</span> {voiceStatus}
              </div>
            )}
            {voiceTurns.length > 0 && (
              <div className="mt-3 grid gap-2">
                {voiceTurns.map((turn, index) => (
                  <div
                    key={`${turn.speaker}-${index}`}
                    className="rounded-lg border border-blue-100 bg-white/70 p-3 text-sm dark:border-blue-900 dark:bg-gray-950/60"
                  >
                    <span className="font-bold">{turn.speaker}:</span> {turn.text}
                  </div>
                ))}
              </div>
            )}
            {isVoiceSessionActive && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-950">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-bold">Clarification Session</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Mode: {voiceSession.mode}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={autoListen}
                      onChange={(event) => setAutoListen(event.target.checked)}
                    />
                    Auto-listen after prompts
                  </label>
                </div>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-bold">Intent</dt>
                    <dd>{voiceSession.draftType || "Detecting"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Missing Fields</dt>
                    <dd>{voiceSession.missingFields.join(", ") || "None"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Matched Client</dt>
                    <dd>
                      {voiceClients.find((client) => client.id === voiceSession.selectedClientId)?.name || "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">Matched Job</dt>
                    <dd>
                      {voiceJobs.find((job) => job.id === voiceSession.selectedJobId)?.name || "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">Material Mode</dt>
                    <dd>{voiceSession.materialMode || "Not selected"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Transcript Count</dt>
                    <dd>{voiceSession.transcriptHistory.length}</dd>
                  </div>
                </dl>
                {voiceSession.candidateClients.length > 0 && !voiceSession.selectedClientId && (
                  <div className="mt-4 text-sm">
                    <div className="font-bold">Candidate Clients</div>
                    <ol className="mt-1 list-decimal pl-5">
                      {voiceSession.candidateClients.map((client) => (
                        <li key={client.id}>{client.name}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {voiceSession.candidateJobs.length > 0 && !voiceSession.selectedJobId && (
                  <div className="mt-4 text-sm">
                    <div className="font-bold">Candidate Jobs</div>
                    <ol className="mt-1 list-decimal pl-5">
                      {voiceSession.candidateJobs.map((job) => (
                        <li key={job.id}>{job.name}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="mt-4">
                  <div className="mb-2 text-sm font-bold">Draft Payload</div>
                  <pre className="max-h-56 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                    {JSON.stringify(voiceSession.draftPayload, null, 2)}
                  </pre>
                </div>
                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
                  <label className="flex-1">
                    <span className="mb-2 block text-sm font-bold">Answer or Correction</span>
                    <input
                      value={voiceAnswer}
                      onChange={(event) => setVoiceAnswer(event.target.value)}
                      placeholder="Example: use option 1, append, or inspection"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      advanceClarificationWithText(voiceAnswer);
                      setVoiceAnswer("");
                    }}
                    disabled={!voiceAnswer.trim()}
                    className="rounded-lg border border-blue-600 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={createVoiceReviewDraft}
                    disabled={!voiceDraftAction || isCreatingVoiceDraft}
                    className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreatingVoiceDraft ? "Creating..." : "Create Review Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelVoiceSession}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-bold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div id="audio-intake" className="scroll-mt-24 border-b border-gray-200 pb-5 dark:border-gray-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold">
                  Choose File
                </label>
                <input
                  type="file"
                  accept=".wav,.mp3,.m4a,.ogg,.flac,.webm,.mp4,audio/*"
                  onChange={(event) => {
                    setAudioFile(event.target.files?.[0] ?? null);
                    setTranscription(null);
                  }}
                  className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-semibold dark:file:bg-gray-800"
                />
              </div>
              <button
                type="button"
                onClick={transcribeAudio}
                disabled={!canDeleteBusinessRecords || !audioFile || isTranscribing}
                className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                {isTranscribing ? "Transcribing..." : "Transcribe File"}
              </button>
            </div>
            <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              Or
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Record from Microphone</div>
              {isRecorderSupported === false ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Microphone recording is not supported in this browser. Upload an audio file instead.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={startRecording} disabled={!canDeleteBusinessRecords || isRecording || isTranscribing || isRecorderSupported !== true} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Start Recording</button>
                    <button type="button" onClick={stopRecording} disabled={!isRecording} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">Stop Recording</button>
                    <span className="min-w-14 font-mono text-sm" aria-live="polite">
                      {String(Math.floor(recordingDurationSeconds / 60)).padStart(2, "0")}:{String(recordingDurationSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>
                  {isRecording && <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">Recording...</p>}
                  {recordedAudioUrl && (
                    <div className="mt-3 space-y-3">
                      <audio controls src={recordedAudioUrl} className="w-full" aria-label="Recorded audio preview" />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={transcribeRecording} disabled={!recordedBlob || isTranscribing || isRecording} className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40">{isTranscribing ? "Transcribing..." : "Transcribe Recording"}</button>
                        <button type="button" onClick={clearRecording} disabled={isRecording} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800">Clear Recording</button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {recordingError && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">{recordingError}</p>}
            </div>
            {transcription && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-950">
                <div className="font-semibold">
                  {transcription.provider} · {transcription.language} · {transcription.durationSeconds.toFixed(1)}s
                </div>
                <p className="mt-1 line-clamp-3 text-gray-600 dark:text-gray-400">
                  {transcription.text}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold">
                Transcript
              </label>
              <textarea
                rows={3}
                value={transcriptText}
                onChange={(event) => setTranscriptText(event.target.value)}
                placeholder="Paste a transcript or command..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
            <div className="lg:w-64">
              <label className="mb-2 block text-sm font-semibold">
                Source Label
              </label>
              <input
                value={transcriptLabel}
                onChange={(event) => setTranscriptLabel(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                void generateTranscriptDraft();
              }}
              disabled={
                !canDeleteBusinessRecords ||
                !transcriptText.trim() ||
                isGeneratingTranscriptDraft
              }
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingTranscriptDraft ? "Generating..." : "Generate Draft"}
            </button>
          </div>
          <div id="image-intake" className="scroll-mt-24 border-t border-gray-200 pt-5 dark:border-gray-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold">
                  Image Intake
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  capture="environment"
                  onChange={(event) => selectImageFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-semibold dark:file:bg-gray-800"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supports JPG, PNG, and WebP. HEIC is not supported yet.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeImage}
                disabled={!canDeleteBusinessRecords || !imageFile || isAnalyzingImage}
                className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzingImage ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>
            {imagePreviewUrl && (
              <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviewUrl}
                  alt="Selected image preview"
                  className="max-h-72 w-full rounded-lg border border-gray-200 object-contain dark:border-gray-800"
                />
                <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-950">
                  <div className="font-semibold">{imageFile?.name}</div>
                  <div className="mt-1 text-gray-600 dark:text-gray-400">
                    {imageFile?.type || "Unknown type"} {imageFile?.size ? `- ${imageFile.size} bytes` : ""}
                  </div>
                  {imageAnalysis && (
                    <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                      {JSON.stringify(imageAnalysis, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {(["All", "Pending", "Approved", "Needs Changes", "Rejected", "Executed"] as const).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg border px-4 py-2 text-sm font-bold ${
                filter === item
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          Loading review drafts...
        </div>
      ) : filteredReviewDrafts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          No AI review drafts for {activeWorkspace.name}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviewDrafts.map((draft) => (
            <article
              key={draft.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(draft.status)}`}
                    >
                      {draft.status}
                    </span>
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      {draft.sourceType}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Confidence {formatConfidence(draft.confidence)}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${executionClass(draft.executionStatus)}`}
                    >
                      {draft.executionStatus}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold">
                    {draft.sourceLabel || "AI Review Draft"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Created {formatDate(draft.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Source {draft.sourceId || "inline transcript"}
                  </p>
                  {draft.summary && <p className="mt-3 max-w-3xl text-sm text-gray-700 dark:text-gray-300">{draft.summary}</p>}
                  {draft.sourceType === "ocr" && draft.sourceId && (
                    <a href={`/documents#document-${draft.sourceId}`} className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">View source document</a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(draft.status === "Pending" || draft.status === "Needs Changes") && draft.executionStatus !== "Executed" && (
                    <button type="button" disabled={!canDeleteBusinessRecords || Boolean(updatingId) || Boolean(executingId)} onClick={() => openDraftEditor(draft)} className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950/30">Edit Draft</button>
                  )}
                  <button
                    type="button"
                    disabled={
                      !canDeleteBusinessRecords ||
                      Boolean(updatingId) ||
                      Boolean(executingId)
                    }
                    onClick={() => updateStatus(draft.id, "Approved")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={
                      !canDeleteBusinessRecords ||
                      Boolean(updatingId) ||
                      Boolean(executingId)
                    }
                    onClick={() => updateStatus(draft.id, "Rejected")}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={
                      !canDeleteBusinessRecords ||
                      Boolean(updatingId) ||
                      Boolean(executingId)
                    }
                    onClick={() => updateStatus(draft.id, "Needs Changes")}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Mark Needs Changes
                  </button>
                  {draft.status === "Approved" &&
                    draft.executionStatus !== "Executed" && (
                      <button
                        type="button"
                        disabled={
                          !canDeleteBusinessRecords ||
                          Boolean(updatingId) ||
                          Boolean(executingId)
                        }
                        onClick={() => executeDraft(draft.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {executingId === draft.id
                          ? "Executing..."
                          : "Execute Approved Draft"}
                      </button>
                    )}
                </div>
              </div>

              {!canDeleteBusinessRecords && (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Owner or Manager access is required to update draft status.
                </p>
              )}

              {draft.executionError && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  {draft.executionError}
                </p>
              )}

              {Object.keys(draft.executionResult).length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold">Execution Result</h3>
                  <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                    {JSON.stringify(draft.executionResult, null, 2)}
                  </pre>
                </div>
              )}

              {draft.warnings.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold">Warnings</h3>
                  <ul className="mt-2 space-y-2">
                    {draft.warnings.map((warning, index) => (
                      <li
                        key={`${warning.code}-${index}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                      >
                        <span className="font-semibold">{warning.code}</span>:{" "}
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5">
                <h3 className="font-bold">Action Drafts</h3>
                <div className="mt-3 space-y-3">
                  {draft.actions.map((action, index) => (
                    <div
                      key={`${action.type}-${index}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{action.type}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatConfidence(action.confidence)}
                        </span>
                        {getAiFormTarget(action) && (
                          <button
                            type="button"
                            onClick={() => openActionInForm(draft, action)}
                            className="ml-auto rounded-lg border border-blue-600 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                          >
                            Open {getAiFormTarget(action)} draft
                          </button>
                        )}
                      </div>
                      <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100">
                        {JSON.stringify(action.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {editingDraftId && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/75 p-4">
          <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Edit Review Draft</h2><button type="button" onClick={() => setEditingDraftId("")} className="text-2xl text-gray-500">x</button></div>
            <div className="mt-5 space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-semibold">Title</span><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Summary</span><textarea rows={3} value={editSummary} onChange={(event) => setEditSummary(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Action Fields (JSON)</span><textarea rows={14} value={editActions} onChange={(event) => setEditActions(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-950 px-4 py-3 font-mono text-xs text-gray-100 dark:border-gray-700" /></label>
              {editRevisions.length > 0 && <div><h3 className="text-sm font-bold">Revision History</h3><div className="mt-2 space-y-2">{editRevisions.map((revision) => <div key={revision.id} className="rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-800"><div className="font-semibold">{formatDate(revision.createdAt)}</div><div className="text-gray-500 dark:text-gray-400">Previous title: {revision.sourceLabel || "Untitled"}</div></div>)}</div></div>}
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditingDraftId("")} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700">Cancel</button><button type="button" onClick={saveDraftEdit} disabled={isSavingEdit} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-50">{isSavingEdit ? "Saving..." : "Save Revision"}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
```

## app\settings\DataMigrationSettings.tsx

```tsx
"use client";

import { useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isUuid } from "@/lib/db/ids";
import { importLocalFrontierData, previewLocalFrontierData } from "@/lib/migration/localImport";
import type { LocalImportCounts, LocalImportSummary } from "@/lib/migration/localImportTypes";

const countLabels: Record<keyof LocalImportCounts, string> = {
  clients: "Clients",
  jobs: "Jobs",
  jobMaterials: "Job materials",
  invoices: "Invoices",
  invoiceLineItems: "Invoice line items",
  expenses: "Expenses",
  inventory: "Inventory",
  clientCalendarEvents: "Client calendar events",
  documents: "Documents metadata",
  routes: "Routes",
  workspaceSettings: "Workspace settings",
};

export default function DataMigrationSettings() {
  const { user } = useAuthSession();
  const { activeWorkspace } = useWorkspace();
  const [counts, setCounts] = useState<LocalImportCounts | null>(null);
  const [summary, setSummary] = useState<LocalImportSummary | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">Sign in to import local data.</section>;
  }

  function preview() {
    if (!isUuid(activeWorkspace.id)) return;
    setCounts(previewLocalFrontierData(activeWorkspace.id));
  }

  async function importData() {
    if (!isUuid(activeWorkspace.id)) return;
    setBusy(true);
    const supabase = createBrowserSupabaseClient();
    const result = await importLocalFrontierData({ workspaceId: activeWorkspace.id, supabase });
    setSummary(result);
    setBusy(false);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h2 className="text-2xl font-bold">Data Migration</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Import localStorage data into the active Supabase workspace. Local data is not deleted.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={preview} disabled={!isUuid(activeWorkspace.id)} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Preview Local Data</button>
        <button onClick={importData} disabled={busy || !isUuid(activeWorkspace.id)} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Import Local Data</button>
        <button onClick={() => { setCounts(null); setSummary(null); }} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold dark:border-gray-700">Clear Import Status</button>
      </div>
      {counts && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(countLabels) as (keyof LocalImportCounts)[]).map((key) => (
            <div key={key} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">{countLabels[key]}</div>
              <div className="text-2xl font-bold">{counts[key]}</div>
            </div>
          ))}
        </div>
      )}
      {summary && (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          Created: {summary.created} | Skipped: {summary.skipped} | Failed: {summary.failed}
          {summary.warnings.length > 0 && <div className="mt-2 text-sm text-amber-600">{summary.warnings.join(" ")}</div>}
        </div>
      )}
    </section>
  );
}
```

## app\settings\page.tsx

```tsx
"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/WorkspaceContext";
import { deleteWorkspaceAction } from "@/lib/actions/workspaces";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { getWorkspaceDisplayName } from "@/lib/workspaceDisplay";
import { defaultBusinessTypes } from "@/lib/workspaceOptions";
import DataMigrationSettings from "./DataMigrationSettings";
import PermissionsSettings from "./PermissionsSettings";
import StorageSettings from "./StorageSettings";

type SettingsTab =
  | "business"
  | "invoice"
  | "tax"
  | "workspace"
  | "permissions"
  | "migration"
  | "storage";

type WorkspaceSettings = {
  workspaceId: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;

  defaultInvoiceTerms: string;
  defaultFooterMessage: string;
  defaultContactMessage: string;
  defaultInvoiceStatus: "Draft" | "Sent";

  taxState: string;
  defaultTaxRate: string;
  taxLocationMode: "Business location" | "Job location";
  discountBeforeTax: boolean;

  workspaceNickname: string;
  businessType: string;
  notes: string;
};

function getDefaultSettings(
  workspaceId: string,
  workspaceName: string
): WorkspaceSettings {
  return {
    workspaceId,

    companyName: `${workspaceName} Company`,
    companyAddress: "123 Business Street",
    companyCity: "Rochester Hills",
    companyState: "MI",
    companyZip: "48307",
    companyPhone: "(555) 123-4567",
    companyEmail: "billing@example.com",
    companyWebsite: "",

    defaultInvoiceTerms: "Due upon receipt",
    defaultFooterMessage: "Thank you for your business!",
    defaultContactMessage:
      "Please contact us with any questions about this invoice.",
    defaultInvoiceStatus: "Draft",

    taxState: "MI",
    defaultTaxRate: "6",
    taxLocationMode: "Business location",
    discountBeforeTax: true,

    workspaceNickname: workspaceName,
    businessType: workspaceName,
    notes: "",
  };
}

export default function SettingsPage() {
  const { activeWorkspace, canManageWorkspace, deleteWorkspace } = useWorkspace();
  const [allSettings, setAllSettings] = useStoredJsonState<WorkspaceSettings[]>(
    storageKeys.settings,
    []
  );

  const initialSettings =
    allSettings.find((item) => item.workspaceId === activeWorkspace.id) ??
    getDefaultSettings(activeWorkspace.id, getWorkspaceDisplayName(activeWorkspace));

  return (
    <SettingsWorkspacePanel
      key={activeWorkspace.id}
      activeWorkspaceId={activeWorkspace.id}
      activeWorkspaceName={getWorkspaceDisplayName(activeWorkspace)}
      allSettings={allSettings}
      initialSettings={initialSettings}
      setAllSettings={setAllSettings}
      canManageWorkspace={canManageWorkspace}
      deleteWorkspace={deleteWorkspace}
    />
  );
}

function SettingsWorkspacePanel({
  activeWorkspaceId,
  activeWorkspaceName,
  allSettings,
  initialSettings,
  setAllSettings,
  canManageWorkspace,
  deleteWorkspace,
}: {
  activeWorkspaceId: string;
  activeWorkspaceName: string;
  allSettings: WorkspaceSettings[];
  initialSettings: WorkspaceSettings;
  setAllSettings: (settings: WorkspaceSettings[]) => void;
  canManageWorkspace: boolean;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
}) {

  const [tab, setTab] = useState<SettingsTab>("business");
  const [settings, setSettings] = useState<WorkspaceSettings>(initialSettings);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const [savedNotice, setSavedNotice] = useState("");

  function updateSetting<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function showSavedNotice(message: string) {
    setSavedNotice(message);
    window.setTimeout(() => setSavedNotice(""), 2500);
  }

  function saveSettings() {
    const withoutCurrentWorkspace = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspaceId
    );

    const updatedSettings = [...withoutCurrentWorkspace, settings];

    setAllSettings(updatedSettings);

    showSavedNotice("Settings saved.");

    window.dispatchEvent(new Event("frontier-settings-updated"));
  }

  function resetWorkspaceSettings() {
    const resetSettings = getDefaultSettings(
      activeWorkspaceId,
      activeWorkspaceName
    );

    const updatedSettings = allSettings.filter(
      (item) => item.workspaceId !== activeWorkspaceId
    );

    setSettings(resetSettings);
    setAllSettings(updatedSettings);

    showSavedNotice("Settings reset.");

    window.dispatchEvent(new Event("frontier-settings-updated"));
  }

  async function handleDeleteWorkspace() {
    if (activeWorkspaceId === "create-workspace") return;
    if (!canManageWorkspace) {
      showSavedNotice("Only workspace owners can delete a workspace.");
      return;
    }

    if (deleteConfirmation !== activeWorkspaceName) {
      showSavedNotice("Type the workspace name exactly before deleting.");
      return;
    }

    const confirmed = window.confirm(
      `Delete workspace "${activeWorkspaceName}" and its related data? This cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeletingWorkspace(true);
    const result = await deleteWorkspaceAction(
      { addWorkspace: () => undefined, deleteWorkspace },
      activeWorkspaceId
    );
    setIsDeletingWorkspace(false);

    if (!result.ok) {
      showSavedNotice(result.error);
      return;
    }

    setDeleteConfirmation("");
    showSavedNotice("Workspace deleted.");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100";

  const tabClass = (target: SettingsTab) =>
    `rounded-lg px-4 py-2 text-xs font-semibold ${
      tab === target
        ? "bg-blue-600 text-white shadow"
        : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="space-y-8 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetWorkspaceSettings}
            className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {savedNotice}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
        <button
          onClick={() => setTab("business")}
          className={tabClass("business")}
        >
          Business Profile
        </button>

        <button
          onClick={() => setTab("invoice")}
          className={tabClass("invoice")}
        >
          Invoice Defaults
        </button>

        <button onClick={() => setTab("tax")} className={tabClass("tax")}>
          Tax
        </button>

        <button
          onClick={() => setTab("workspace")}
          className={tabClass("workspace")}
        >
          Workspace
        </button>

        <button
          onClick={() => setTab("permissions")}
          className={tabClass("permissions")}
        >
          Permissions
        </button>
        <button onClick={() => setTab("migration")} className={tabClass("migration")}>
          Data Migration
        </button>
        <button onClick={() => setTab("storage")} className={tabClass("storage")}>
          Storage
        </button>
      </div>

      {tab === "business" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Business Profile</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This should later feed the invoice -From- section automatically.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                value={settings.companyName}
                onChange={(event) =>
                  updateSetting("companyName", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(event) =>
                  updateSetting("companyEmail", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Company Phone</label>
              <input
                value={settings.companyPhone}
                onChange={(event) =>
                  updateSetting("companyPhone", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Website</label>
              <input
                value={settings.companyWebsite}
                onChange={(event) =>
                  updateSetting("companyWebsite", event.target.value)
                }
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input
                value={settings.companyAddress}
                onChange={(event) =>
                  updateSetting("companyAddress", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                value={settings.companyCity}
                onChange={(event) =>
                  updateSetting("companyCity", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State</label>
                <input
                  value={settings.companyState}
                  onChange={(event) =>
                    updateSetting(
                      "companyState",
                      event.target.value.toUpperCase()
                    )
                  }
                  maxLength={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>ZIP</label>
                <input
                  value={settings.companyZip}
                  onChange={(event) =>
                    updateSetting("companyZip", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "invoice" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Invoice Defaults</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            These values should be connected to the invoice builder next.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Default Invoice Status</label>
              <select
                value={settings.defaultInvoiceStatus}
                onChange={(event) =>
                  updateSetting(
                    "defaultInvoiceStatus",
                    event.target
                      .value as WorkspaceSettings["defaultInvoiceStatus"]
                  )
                }
                className={inputClass}
              >
                <option>Draft</option>
                <option>Sent</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Default Terms</label>
              <input
                value={settings.defaultInvoiceTerms}
                onChange={(event) =>
                  updateSetting("defaultInvoiceTerms", event.target.value)
                }
                placeholder="Due upon receipt"
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Default Footer Message</label>
              <input
                value={settings.defaultFooterMessage}
                onChange={(event) =>
                  updateSetting("defaultFooterMessage", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Default Contact Message</label>
              <input
                value={settings.defaultContactMessage}
                onChange={(event) =>
                  updateSetting("defaultContactMessage", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {tab === "tax" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h2 className="text-2xl font-bold">Tax Settings</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discount is currently set to apply before tax, which is the normal
            invoice calculation flow.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Tax State</label>
              <input
                value={settings.taxState}
                onChange={(event) =>
                  updateSetting("taxState", event.target.value.toUpperCase())
                }
                maxLength={2}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Default Tax Rate %</label>
              <input
                type="number"
                value={settings.defaultTaxRate}
                onChange={(event) =>
                  updateSetting("defaultTaxRate", event.target.value)
                }
                placeholder="6"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tax Location Basis</label>
              <select
                value={settings.taxLocationMode}
                onChange={(event) =>
                  updateSetting(
                    "taxLocationMode",
                    event.target.value as WorkspaceSettings["taxLocationMode"]
                  )
                }
                className={inputClass}
              >
                <option>Business location</option>
                <option>Job location</option>
              </select>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.discountBeforeTax}
                  onChange={(event) =>
                    updateSetting("discountBeforeTax", event.target.checked)
                  }
                  className="mt-1 h-4 w-4"
                />

                <span>
                  <span className="block font-semibold">
                    Apply discount before tax
                  </span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                    Keeps invoice totals consistent with the current calculation
                    helper.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>
      )}

      {tab === "workspace" && (
        <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div>
            <h2 className="text-2xl font-bold">Workspace Configuration</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The Reset button only resets settings for this workspace. It does not delete or reset workspaces.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass}>Workspace Name</label>
              <input
                value={activeWorkspaceName}
                readOnly
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Display Nickname</label>
              <input
                value={settings.workspaceNickname}
                onChange={(event) =>
                  updateSetting("workspaceNickname", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Business Type</label>
              <select
                value={settings.businessType}
                onChange={(event) =>
                  updateSetting("businessType", event.target.value)
                }
                className={inputClass}
              >
                {defaultBusinessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Workspace ID</label>
              <input
                value={activeWorkspaceId}
                readOnly
                className={inputClass}
              />
            </div>

            <div className="xl:col-span-2">
              <label className={labelClass}>Internal Notes</label>
              <textarea
                rows={5}
                value={settings.notes}
                onChange={(event) =>
                  updateSetting("notes", event.target.value)
                }
                placeholder="Internal workspace notes, default operating procedures, billing notes..."
                className={inputClass}
              />
            </div>
          </div>

          {activeWorkspaceId !== "create-workspace" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                Delete Workspace
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-200">
                This permanently deletes the workspace and database records tied to it. Type the workspace name to enable deletion.
              </p>
              {!canManageWorkspace && (
                <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-200">
                  Only workspace owners can delete this workspace.
                </p>
              )}
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                <input
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder={activeWorkspaceName}
                  disabled={!canManageWorkspace}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleDeleteWorkspace}
                  disabled={
                    isDeletingWorkspace ||
                    !canManageWorkspace ||
                    deleteConfirmation !== activeWorkspaceName
                  }
                  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isDeletingWorkspace ? "Deleting..." : "Delete Workspace"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "permissions" && (
        <PermissionsSettings
          activeWorkspaceId={activeWorkspaceId}
          activeWorkspaceName={activeWorkspaceName}
          setSavedNotice={showSavedNotice}
        />
      )}

      {tab === "migration" && <DataMigrationSettings />}

      {tab === "storage" && <StorageSettings workspaceId={activeWorkspaceId} />}
    </div>
  );
}
```

## app\settings\PermissionsSettings.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { isUuid } from "@/lib/db/ids";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PermissionsSettingsProps = {
  activeWorkspaceId: string;
  activeWorkspaceName: string;
  setSavedNotice: (message: string) => void;
};

type WorkspaceRole = "Owner" | "Manager" | "Employee";
type MemberRow = {
  id: string;
  user_id: string | null;
  role: WorkspaceRole;
  status: "Active" | "Invited" | "Removed";
  invited_email: string | null;
  created_at: string;
  profiles?: { email: string | null; display_name: string | null } | null;
};

const roles = [
  {
    name: "Owner",
    color: "text-purple-600",
    description:
      "Full access. Can manage settings, billing, team members, clients, invoices, jobs, inventory, and documents.",
  },
  {
    name: "Manager",
    color: "text-blue-600",
    description:
      "Can manage daily operations, clients, jobs, invoices, calendar, inventory, logistics, and documents.",
  },
  {
    name: "Employee",
    color: "text-gray-700 dark:text-gray-300",
    description:
      "Can view assigned jobs, update job notes, view calendar, and access limited client/job information.",
  },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 shadow-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100";

export default function PermissionsSettings({
  activeWorkspaceId,
  activeWorkspaceName,
  setSavedNotice,
}: PermissionsSettingsProps) {
  const { user } = useAuthSession();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("Employee");
  const [inviteInstruction, setInviteInstruction] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [memberLoadError, setMemberLoadError] = useState("");

  const supabase = useMemo(() => (user ? createBrowserSupabaseClient() : null), [user]);
  const currentMember = members.find((member) => member.user_id === user?.id);
  const canManageMembers =
    currentMember?.role === "Owner" || currentMember?.role === "Manager";

  useEffect(() => {
    if (!supabase) return;
    if (!isUuid(activeWorkspaceId)) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setMembers((current) => (current.length > 0 ? [] : current));
        setMemberLoadError((current) => (current ? "" : current));
      });
      return () => {
        cancelled = true;
      };
    }
    let cancelled = false;
    supabase
      .from("workspace_members")
      .select("id, user_id, role, status, invited_email, created_at")
      .eq("workspace_id", activeWorkspaceId)
      .neq("status", "Removed")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setMemberLoadError(error.message || "Unable to load members.");
          setMembers([]);
          return;
        }
        setMemberLoadError("");
        setMembers((data ?? []) as unknown as MemberRow[]);
      });
    return () => { cancelled = true; };
  }, [activeWorkspaceId, supabase]);

  if (!user) {
    return <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">Sign in to manage members.</section>;
  }

  function closeInviteModal() {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("Employee");
    setInviteInstruction("");
    setIsInviting(false);
  }

  function buildInviteInstruction(email: string) {
    const origin = window.location.origin;
    return [
      `${activeWorkspaceName} invited you to Frontier.`,
      `Use this email address: ${email}`,
      `Create an account or sign in here: ${origin}/signup`,
      "After login, Frontier will automatically connect you to the invited workspace.",
    ].join("\n");
  }

  async function copyInviteInstruction() {
    if (!inviteInstruction) return;
    await navigator.clipboard.writeText(inviteInstruction);
    setSavedNotice("Invite instructions copied.");
  }

  async function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    if (!isUuid(activeWorkspaceId)) {
      setSavedNotice("Create a workspace before inviting members.");
      return;
    }
    if (!canManageMembers) {
      setSavedNotice("Only Owners and Managers can invite members.");
      return;
    }

    setIsInviting(true);
    setInviteInstruction("");

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    const response = await fetch("/api/workspace-members/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        email: normalizedEmail,
        role: inviteRole,
      }),
    });
    const payload = (await response.json()) as {
      member?: MemberRow;
      error?: string;
    };

    if (!response.ok || !payload.member) {
      setSavedNotice(payload.error || "Unable to save invite.");
      setIsInviting(false);
      return;
    }

    setMembers((current) => {
      const nextMember = payload.member as MemberRow;
      const withoutExisting = current.filter(
        (member) => member.id !== nextMember.id
      );
      return [nextMember, ...withoutExisting];
    });

    const fallbackInstruction = buildInviteInstruction(normalizedEmail);
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setIsInviting(false);

    if (emailError) {
      setInviteInstruction(fallbackInstruction);
      setSavedNotice(
        "Invite saved. Email could not be sent, so use the copyable instructions."
      );
      return;
    }

    setInviteEmail("");
    setInviteRole("Employee");
    setInviteOpen(false);
    setSavedNotice("Invite saved and email sent.");
  }

  async function updateRole(member: MemberRow, role: WorkspaceRole) {
    if (!isUuid(activeWorkspaceId)) return setSavedNotice("Create a workspace first.");
    const ownerCount = members.filter((item) => item.role === "Owner" && item.status !== "Removed").length;
    if (member.role === "Owner" && role !== "Owner" && ownerCount <= 1) {
      setSavedNotice("Cannot change the last Owner.");
      return;
    }
    const response = await fetch("/api/workspace-members/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        memberId: member.id,
        role,
      }),
    });
    const payload = (await response.json()) as {
      member?: MemberRow;
      error?: string;
    };
    if (!response.ok || !payload.member) {
      setSavedNotice(payload.error || "Unable to update member role.");
      return;
    }
    setMembers((current) =>
      current.map((item) => item.id === member.id ? payload.member as MemberRow : item)
    );
  }

  async function removeMember(member: MemberRow) {
    if (!isUuid(activeWorkspaceId)) return setSavedNotice("Create a workspace first.");
    const ownerCount = members.filter((item) => item.role === "Owner" && item.status !== "Removed").length;
    if (member.role === "Owner" && ownerCount <= 1) {
      setSavedNotice("Cannot remove the last Owner.");
      return;
    }
    const response = await fetch("/api/workspace-members/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspaceId,
        memberId: member.id,
        status: "Removed",
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setSavedNotice(payload.error || "Unable to remove member.");
      return;
    }
    setMembers((current) => current.filter((item) => item.id !== member.id));
  }

  function getMemberLabel(member: MemberRow) {
    if (member.profiles?.email) return member.profiles.email;
    if (member.invited_email) return member.invited_email;
    if (member.user_id === user?.id && user.email) return user.email;
    return member.user_id || "-";
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Team Members</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Invite and manage access for {activeWorkspaceName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={!canManageMembers}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Invite Member
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          {memberLoadError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {memberLoadError}
            </div>
          )}

          <table className="w-full min-w-[760px]">
            <thead><tr className="text-left text-sm text-gray-500"><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="p-3">{getMemberLabel(member)}</td>
                  <td className="p-3">
                    <select value={member.role} onChange={(e) => updateRole(member, e.target.value as WorkspaceRole)} disabled={!canManageMembers} className={inputClass}>
                      <option>Owner</option><option>Manager</option><option>Employee</option>
                    </select>
                  </td>
                  <td className="p-3">{member.status}</td>
                  <td className="p-3">{new Date(member.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right"><button type="button" onClick={() => removeMember(member)} disabled={!canManageMembers} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">Remove</button></td>
                </tr>
              ))}
              {members.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No team members saved yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-2xl font-bold">Role Permissions</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.name}
              className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
            >
              <h3 className={`text-lg font-bold ${role.color}`}>
                {role.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Invite Team Member</h2>

              <button
                type="button"
                onClick={closeInviteModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                -
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as WorkspaceRole)}
                  className={inputClass}
                >
                  <option>Owner</option>
                  <option>Manager</option>
                  <option>Employee</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isInviting}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>

              {inviteInstruction && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Email delivery is not available yet. Share this instead.
                  </p>
                  <textarea
                    readOnly
                    value={inviteInstruction}
                    className="mt-3 h-32 w-full rounded-lg border border-amber-200 bg-white p-3 text-sm text-gray-950 dark:border-amber-900 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={copyInviteInstruction}
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Copy Instructions
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
```

## app\settings\StorageSettings.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createDocumentsRepository, type StoredDocument } from "@/lib/db/documents";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function StorageSettings({ workspaceId }: { workspaceId: string }) {
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);
  const [localDocuments, setLocalDocuments] = useStoredJsonState<StoredDocument[]>(storageKeys.documents, []);
  const [databaseDocuments, setDatabaseDocuments] = useState<StoredDocument[]>([]);
  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const documentsRepo = useMemo(() => createDocumentsRepository({ isSignedIn: isDatabaseMode, supabase, localDocuments, setLocalDocuments }), [isDatabaseMode, localDocuments, setLocalDocuments, supabase]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    documentsRepo.getDocuments(workspaceId).then((items) => { if (!cancelled) setDatabaseDocuments(items); });
    return () => { cancelled = true; };
  }, [documentsRepo, isDatabaseMode, workspaceId]);

  const documents = isDatabaseMode ? databaseDocuments : localDocuments;
  const workspaceDocuments = documents.filter((doc) => doc.workspaceId === workspaceId);
  const docsWithFiles = workspaceDocuments.filter((doc) => doc.fileName && doc.fileName !== "No file selected");
  const totalSize = docsWithFiles.reduce((sum, doc) => sum + (doc.sizeBytes ?? 0), 0);

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h2 className="text-2xl font-bold">Storage Planning</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Current mode: Metadata only. File upload provider not configured.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["documents", "invoice-attachments", "client-files"].map((bucket) => (
          <div key={bucket} className="rounded-lg bg-gray-50 p-4 font-semibold dark:bg-gray-800">{bucket}</div>
        ))}
      </div>
      <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
        Documents with file metadata: {docsWithFiles.length}. Placeholder size: {formatBytes(totalSize)}.
      </div>
    </section>
  );
}
```

## app\signup\page.tsx

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getAuthErrorMessage } from "@/lib/auth/messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsCreating(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(
          getAuthErrorMessage(error, "Unable to create account. Please try again.")
        );
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Account created. Check your email to confirm your signup.");
      }
    } catch (error) {
      setMessage(
        getAuthErrorMessage(error, "Unable to create account. Please try again.")
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <form onSubmit={signup} className="space-y-4 rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="text-2xl font-bold">Create Account</h1>
        {message && <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{message}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isCreating} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isCreating} className="w-full rounded-lg border p-3 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:disabled:bg-gray-800/60" />
        <button disabled={isCreating} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400">{isCreating ? "Creating account..." : "Create Account"}</button>
        <Link href="/login" className="block text-sm text-blue-600">Already have an account?</Link>
      </form>
    </main>
  );
}
```

## CLAUDE.md

```markdown
@AGENTS.md
```

## components\AppShell.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";
import { createWorkspaceAction } from "@/lib/actions/workspaces";
import {
  removeStoredValue,
  storageKeys,
  useStoredJsonState,
  useStoredStringState,
} from "@/lib/clientStorage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { defaultBusinessTypes } from "@/lib/workspaceOptions";

type WorkspaceDisplaySettings = {
  workspaceId: string;
  workspaceNickname?: string;
  businessType?: string;
  userDisplayName?: string;
  userEmail?: string;
};

const localUserFallback = {
  name: "Account",
  email: "Sign in to save and sync workspaces",
};

function getWorkspaceInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getUserInitials(name: string) {
  const initials = getWorkspaceInitials(name);
  return initials.slice(0, 2) || "A";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthSession();
  const [theme, setTheme] = useStoredStringState(storageKeys.theme, "dark");
  const [allDisplaySettings] = useStoredJsonState<WorkspaceDisplaySettings[]>(
    storageKeys.settings,
    []
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);
  const [newWorkspaceError, setNewWorkspaceError] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [platformAdminCheck, setPlatformAdminCheck] = useState<{
    userId: string;
    isAdmin: boolean;
  } | null>(null);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState<string>(
    defaultBusinessTypes[0]
  );
  const [customWorkspaceType, setCustomWorkspaceType] = useState("");

  const {
    workspaces,
    activeWorkspace,
    adminViewWorkspace,
    setActiveWorkspace,
    addWorkspace,
    workspaceError,
  } = useWorkspace();

  const darkMode = theme !== "light";

  const displaySettings =
    allDisplaySettings.find(
      (item) => item.workspaceId === activeWorkspace.id
    ) ?? null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setUserOpen(false);
      }
    });

    const supabase = createBrowserSupabaseClient();

    supabase.rpc("is_platform_admin").then(({ data, error }) => {
      if (error) console.error("Unable to verify platform admin access.", error);
      if (!cancelled) {
        setPlatformAdminCheck({
          userId: user.id,
          isAdmin: Boolean(data),
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const localVisibleWorkspaces = user
    ? workspaces
    : workspaces.filter((workspace) => workspace.id !== "local-workspace");

  const displayedWorkspaceName =
    !user && activeWorkspace.id === "local-workspace"
      ? "Create Workspace"
      : displaySettings?.workspaceNickname?.trim() || activeWorkspace.name;

  const displayedWorkspaceType =
    !user && activeWorkspace.id === "local-workspace"
      ? "Setup"
      : displaySettings?.businessType?.trim() || activeWorkspace.type;

  const displayedUserName =
    user?.email || displaySettings?.userDisplayName?.trim() || localUserFallback.name;

  const displayedUserEmail =
    user?.email || displaySettings?.userEmail?.trim() || localUserFallback.email;

  const displayedWorkspaceInitials =
    getWorkspaceInitials(displayedWorkspaceName);
  const displayedUserInitials = getUserInitials(displayedUserName);
  const hasWorkspaces = localVisibleWorkspaces.length > 0;
  const isPlatformAdmin =
    Boolean(user) &&
    platformAdminCheck?.userId === user?.id &&
    Boolean(platformAdminCheck?.isAdmin);

  function toggleDarkMode() {
    const nextMode = !darkMode;
    setTheme(nextMode ? "dark" : "light");
  }

  function resetNewWorkspaceForm() {
    setWorkspaceName("");
    setWorkspaceType(defaultBusinessTypes[0]);
    setCustomWorkspaceType("");
    setNewWorkspaceError("");
  }

  function closeNewWorkspaceModal() {
    setNewWorkspaceOpen(false);
    setWorkspaceOpen(false);
    setUserOpen(false);
    resetNewWorkspaceForm();
  }

  async function createWorkspace() {
    if (!workspaceName.trim()) return;
    if (isCreatingWorkspace) return;

    const resolvedType =
      workspaceType === "Other"
        ? customWorkspaceType.trim()
        : workspaceType;

    if (!resolvedType) return;
    setNewWorkspaceError("");
    setIsCreatingWorkspace(true);

    const newWorkspace = {
      id: crypto.randomUUID(),
      name: workspaceName.trim(),
      type: resolvedType,
    };

    let created = false;
    try {
      const result = await createWorkspaceAction(
        { addWorkspace },
        newWorkspace
      );
      if (!result.ok) {
        setIsCreatingWorkspace(false);
        setNewWorkspaceError(result.error);
        return;
      }
      created = true;
    } catch (error) {
      setIsCreatingWorkspace(false);
      setNewWorkspaceError(
        error instanceof Error
          ? error.message
          : workspaceError || "Unable to create workspace."
      );
      return;
    }
    setIsCreatingWorkspace(false);
    if (!created) {
      setNewWorkspaceError(workspaceError || "Unable to create workspace.");
      return;
    }

    resetNewWorkspaceForm();
    setNewWorkspaceOpen(false);
    setWorkspaceOpen(false);
  }

  function getWorkspaceDisplayName(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = allDisplaySettings.find(
      (item) => item.workspaceId === workspace.id
    );
    return saved?.workspaceNickname?.trim() || workspace.name;
  }

  function getWorkspaceDisplayType(workspace: {
    id: string;
    name: string;
    type: string;
  }) {
    const saved = allDisplaySettings.find(
      (item) => item.workspaceId === workspace.id
    );
    return saved?.businessType?.trim() || workspace.type;
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function exitAdminView() {
    const workspaceId = adminViewWorkspace?.id ?? null;
    const targetUserId =
      window.localStorage.getItem(storageKeys.adminViewUserId) || null;

    try {
      await fetch("/api/frontier-admin/view-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "exit",
          workspaceId,
          userId: targetUserId,
        }),
      });
    } finally {
      removeStoredValue(storageKeys.adminViewAdminUserId);
      removeStoredValue(storageKeys.adminViewWorkspaceId);
      removeStoredValue(storageKeys.adminViewWorkspaceName);
      removeStoredValue(storageKeys.adminViewWorkspaceType);
      removeStoredValue(storageKeys.adminViewUserId);
      window.location.href = "/frontier-admin";
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-100 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      {adminViewWorkspace && (
        <div className="relative z-[2100] flex flex-col gap-2 border-b border-amber-300 bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="font-semibold">
            Admin View Mode: {adminViewWorkspace.name}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/frontier-admin"
              className="rounded-lg bg-amber-700 px-3 py-2 font-semibold text-white hover:bg-amber-800"
            >
              Back to Admin
            </Link>
            <button
              type="button"
              onClick={exitAdminView}
              className="rounded-lg bg-gray-900 px-3 py-2 font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-950"
            >
              Exit Admin View
            </button>
          </div>
        </div>
      )}

      <header className="relative z-[2000] flex h-20 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-0">
            <button
              onClick={() => {
                setWorkspaceOpen(!workspaceOpen);
                setUserOpen(false);
              }}
              className="flex max-w-[150px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 sm:max-w-[260px]"
            >


              {/* Mobile: initials only */}
              <span className="font-semibold sm:hidden">
                {displayedWorkspaceInitials}
              </span>

              {/* Tablet/Desktop: full workspace name */}
              <span className="hidden truncate font-semibold sm:inline">
                {displayedWorkspaceName}
              </span>

            </button>

            {workspaceOpen && (
              <div className="absolute left-0 top-14 z-[2100] w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Workspaces
                </div>

                {hasWorkspaces ? localVisibleWorkspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setActiveWorkspace(workspace);
                      setWorkspaceOpen(false);
                    }}
                    className={`flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      activeWorkspace.id === workspace.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >


                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {getWorkspaceDisplayName(workspace)}
                      </span>
                      <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                        {getWorkspaceDisplayType(workspace)}
                      </span>
                    </span>
                  </button>
                )) : (
                  <div className="px-4 py-5 text-sm text-gray-500 dark:text-gray-400">
                    Create a workspace to start using Frontier.
                  </div>
                )}

                <button
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setNewWorkspaceOpen(true);
                  }}
                  className="flex w-full items-center gap-4 border-t border-gray-200 px-4 py-4 text-left hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">+</span>
                  <span className="font-medium">Create Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={toggleDarkMode}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen(!userOpen);
                  setWorkspaceOpen(false);
                }}
                className="flex items-center gap-2 rounded-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950">
                  {displayedUserInitials}
                </span>
                <span className="hidden max-w-48 truncate font-semibold lg:block">
                  {displayedUserName}
                </span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-14 z-[2100] w-72 max-w-[90vw] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                    <div className="font-semibold">{displayedUserName}</div>
                    <div className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                      {displayedUserEmail}
                    </div>
                  </div>

                  <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {displayedWorkspaceName}
                    <br />
                    {displayedWorkspaceType}
                  </div>

                  <div className="grid grid-cols-1">
                    {isPlatformAdmin && (
                      <Link
                        href="/frontier-admin"
                        className="px-4 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserOpen(false)}
                      >
                        Frontier Admin
                      </Link>
                    )}
                    {isPlatformAdmin && adminViewWorkspace && (
                      <button
                        type="button"
                        onClick={exitAdminView}
                        className="px-4 py-3 text-left font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Exit Admin View
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-100 dark:text-gray-950"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-800"
              >
                Sign up for free
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {newWorkspaceOpen && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">New Workspace</h2>

              <button
                onClick={closeNewWorkspaceModal}
                className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                x
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Workspace Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              />

              <select
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                {defaultBusinessTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              {workspaceType === "Other" && (
                <input
                  type="text"
                  value={customWorkspaceType}
                  onChange={(e) => setCustomWorkspaceType(e.target.value)}
                  placeholder="Specify Business Type"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
                />
              )}

              {newWorkspaceError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {newWorkspaceError}
                </div>
              )}

              <button
                onClick={createWorkspace}
                disabled={isCreatingWorkspace}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingWorkspace ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## components\AuthSessionProvider.tsx

```tsx
"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

type AuthSessionContextValue = {
  isSupabaseConfigured: boolean;
  user: User | null;
};

const AuthSessionContext =
  createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const isSupabaseConfigured = Boolean(getSupabasePublicEnv());
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const value = useMemo(
    () => ({
      isSupabaseConfigured,
      user,
    }),
    [isSupabaseConfigured, user]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession must be used inside AuthSessionProvider"
    );
  }

  return context;
}
```

## components\Sidebar.tsx

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Clients", href: "/clients", icon: "🧑‍💼" },
  { label: "Jobs", href: "/jobs", icon: "✅" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Inventory", href: "/inventory", icon: "🧱" },
  { label: "Financials", href: "/financials", icon: "💵" },
  { label: "Invoices", href: "/invoices", icon: "📄" },
  { label: "Document Extraction", href: "/documents", icon: "📁" },
  { label: "Logistics", href: "/logistics", icon: "🛣️" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center rounded-lg px-3 py-2.5 transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              } ${collapsed ? "justify-center" : "gap-3"}`}
            >
              <span className="w-8 text-center text-2xl leading-none">
                {item.icon}
              </span>

              {!collapsed && (
                <span className="truncate text-base font-medium">
                  {item.label}
                </span>
              )}

              {collapsed && (
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className={`flex w-full items-center rounded-lg px-3 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <span className="text-xl">{collapsed ? ">" : "<"}</span>

          {!collapsed && <span className="text-base font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
```

## components\Statcard.tsx

```tsx
type StatCardProps = {
  title: string;
  value: string;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="min-w-0 rounded-lg bg-white p-3 shadow dark:bg-gray-900">
      <h2 className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        {title}
      </h2>

      <p className="mt-1 break-words text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
```

## components\WorkspaceContext.tsx

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import {
  storageKeys,
  readStoredString,
  writeStoredString,
  useStoredJsonState,
  useStoredStringState,
} from "@/lib/clientStorage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type Workspace = {
  id: string;
  name: string;
  type: string;
  role?: WorkspaceRole;
};

export type WorkspaceRole = "Owner" | "Manager" | "Employee";

const createWorkspacePlaceholder: Workspace = {
  id: "create-workspace",
  name: "Create Workspace",
  type: "Setup",
};

const defaultWorkspaces: Workspace[] = [
  {
    id: "local-workspace",
    name: "Local Workspace",
    type: "Other",
  },
];

type WorkspaceContextValue = {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => Promise<boolean>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  adminViewWorkspace: Workspace | null;
  activeWorkspaceRole: WorkspaceRole;
  canManageWorkspace: boolean;
  canDeleteBusinessRecords: boolean;
  isLoadingWorkspaces: boolean;
  workspaceError: string | null;
};

const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

type WorkspacesResponse = {
  workspaces?: Workspace[];
  error?: string;
};

function getUserDisplayName(user: { email?: string; user_metadata?: object }) {
  const metadata = user.user_metadata as
    | {
        full_name?: string;
        name?: string;
      }
    | undefined;

  return metadata?.full_name || metadata?.name || user.email || "Frontier User";
}

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSupabaseConfigured, user } = useAuthSession();
  const [workspaces, setWorkspaces] = useStoredJsonState<Workspace[]>(
    storageKeys.workspaces,
    defaultWorkspaces
  );
  const [activeWorkspaceId, setActiveWorkspaceId] = useStoredStringState(
    storageKeys.activeWorkspace,
    defaultWorkspaces[0].id
  );
  const [databaseWorkspaces, setDatabaseWorkspaces] = useState<Workspace[]>([]);
  const [databaseActiveWorkspaceId, setDatabaseActiveWorkspaceId] = useState<
    string | null
  >(null);
  const [adminViewWorkspaceId] = useStoredStringState(
    storageKeys.adminViewWorkspaceId,
    ""
  );
  const [adminViewWorkspaceName] = useStoredStringState(
    storageKeys.adminViewWorkspaceName,
    ""
  );
  const [adminViewWorkspaceType] = useStoredStringState(
    storageKeys.adminViewWorkspaceType,
    ""
  );
  const [adminViewAdminUserId] = useStoredStringState(
    storageKeys.adminViewAdminUserId,
    ""
  );
  const [isPlatformAdminForViewMode, setIsPlatformAdminForViewMode] =
    useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const ensureSignedInWorkspace = useCallback(
    async (supabaseUser: NonNullable<typeof user>) => {
      const supabase = createBrowserSupabaseClient();
      const displayName = getUserDisplayName(supabaseUser);

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: supabaseUser.id,
          display_name: displayName,
          email: supabaseUser.email ?? null,
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      const { error: inviteError } = await supabase.rpc(
        "accept_workspace_invites_for_current_user"
      );

      if (inviteError) throw inviteError;

      const response = await fetch("/api/workspaces");
      const payload = (await response.json()) as WorkspacesResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load workspaces.");
      }

      const loadedWorkspaces = payload.workspaces ?? [];

      return loadedWorkspaces;
    },
    []
  );

  useEffect(() => {
    if (!isDatabaseMode || !user) {
      return;
    }

    let cancelled = false;
    const signedInUser = user;

    async function loadDatabaseWorkspaces() {
      setIsLoadingWorkspaces(true);
      setWorkspaceError(null);

      try {
        const loadedWorkspaces = await ensureSignedInWorkspace(signedInUser);
        if (cancelled) return;

        const savedActiveWorkspaceId = readStoredString(
          storageKeys.activeWorkspace,
          defaultWorkspaces[0].id
        );
        const nextActiveWorkspace =
          loadedWorkspaces.find(
            (workspace) => workspace.id === savedActiveWorkspaceId
          ) ?? loadedWorkspaces[0] ?? null;

        setDatabaseWorkspaces(loadedWorkspaces);
        setDatabaseActiveWorkspaceId(nextActiveWorkspace?.id ?? null);
        if (nextActiveWorkspace) {
          writeStoredString(storageKeys.activeWorkspace, nextActiveWorkspace.id);
        }
      } catch (error) {
        if (cancelled) return;

        setWorkspaceError(
          error instanceof Error
            ? error.message
            : "Unable to load workspaces."
        );
      } finally {
        if (!cancelled) {
          setIsLoadingWorkspaces(false);
        }
      }
    }

    loadDatabaseWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [ensureSignedInWorkspace, isDatabaseMode, user]);

  useEffect(() => {
    if (!isDatabaseMode || !user || !adminViewWorkspaceId) {
      return;
    }

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    supabase.rpc("is_platform_admin").then(({ data, error }) => {
      if (error) console.error("Unable to verify admin view mode.", error);
      if (!cancelled) setIsPlatformAdminForViewMode(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [adminViewWorkspaceId, isDatabaseMode, user]);

  const adminViewWorkspace = useMemo(() => {
    if (
      !isDatabaseMode ||
      !user ||
      adminViewAdminUserId !== user.id ||
      !isPlatformAdminForViewMode ||
      !adminViewWorkspaceId
    ) {
      return null;
    }

    return {
      id: adminViewWorkspaceId,
      name: adminViewWorkspaceName || "Admin View Workspace",
      type: adminViewWorkspaceType || "Other",
    };
  }, [
    adminViewAdminUserId,
    adminViewWorkspaceId,
    adminViewWorkspaceName,
    adminViewWorkspaceType,
    isDatabaseMode,
    isPlatformAdminForViewMode,
    user,
  ]);

  const visibleWorkspaces = isDatabaseMode ? databaseWorkspaces : workspaces;
  const visibleActiveWorkspaceId = isDatabaseMode
    ? databaseActiveWorkspaceId
    : activeWorkspaceId;

  const activeWorkspace: Workspace =
    useMemo<Workspace>(
      () =>
        adminViewWorkspace ??
        visibleWorkspaces.find(
          (workspace) => workspace.id === visibleActiveWorkspaceId
        ) ??
        visibleWorkspaces[0] ??
        (isDatabaseMode ? createWorkspacePlaceholder : defaultWorkspaces[0]),
      [adminViewWorkspace, isDatabaseMode, visibleActiveWorkspaceId, visibleWorkspaces]
    );
  const activeWorkspaceRole = (adminViewWorkspace
    ? "Owner"
    : activeWorkspace.role) ?? "Owner";
  const canManageWorkspace = activeWorkspaceRole === "Owner";
  const canDeleteBusinessRecords =
    activeWorkspaceRole === "Owner" || activeWorkspaceRole === "Manager";

  const addWorkspace = useCallback(async (workspace: Workspace) => {
    if (!isDatabaseMode || !user) {
      setWorkspaces((current) => [
        ...current,
        workspace,
      ]);

      setActiveWorkspaceId(workspace.id);
      return true;
    }

    setWorkspaceError(null);

    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workspace),
    });
    const payload = (await response.json()) as {
      workspace?: Workspace;
      error?: string;
    };

    if (!response.ok || !payload.workspace) {
      const message = payload.error || "Unable to create workspace.";
      setWorkspaceError(message);
      throw new Error(message);
    }

    const createdWorkspace = payload.workspace;
    const loadedWorkspaces = await ensureSignedInWorkspace(user);
    const nextWorkspaces = loadedWorkspaces.some(
      (item) => item.id === createdWorkspace.id
    )
      ? loadedWorkspaces
      : [...loadedWorkspaces, createdWorkspace];

    setDatabaseWorkspaces(nextWorkspaces);
    setDatabaseActiveWorkspaceId(createdWorkspace.id);
    writeStoredString(storageKeys.activeWorkspace, createdWorkspace.id);
    return true;
  }, [ensureSignedInWorkspace, isDatabaseMode, setActiveWorkspaceId, setWorkspaces, user]);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    if (!isDatabaseMode || !user) {
      setWorkspaces((current) => {
        const nextWorkspaces = current.filter(
          (workspace) => workspace.id !== workspaceId
        );
        const nextActiveWorkspace = nextWorkspaces[0] ?? defaultWorkspaces[0];
        setActiveWorkspaceId(nextActiveWorkspace.id);
        return nextWorkspaces.length > 0 ? nextWorkspaces : defaultWorkspaces;
      });
      return true;
    }

    const response = await fetch(`/api/workspaces?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setWorkspaceError(payload.error || "Unable to delete workspace.");
      return false;
    }

    setDatabaseWorkspaces((current) => {
      const nextWorkspaces = current.filter(
        (workspace) => workspace.id !== workspaceId
      );
      const nextActiveWorkspace = nextWorkspaces[0] ?? null;
      setDatabaseActiveWorkspaceId(nextActiveWorkspace?.id ?? null);
      if (nextActiveWorkspace) {
        writeStoredString(storageKeys.activeWorkspace, nextActiveWorkspace.id);
      }
      return nextWorkspaces;
    });

    return true;
  }, [isDatabaseMode, setActiveWorkspaceId, setWorkspaces, user]);

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    if (isDatabaseMode) {
      setDatabaseActiveWorkspaceId(workspace.id);
      writeStoredString(storageKeys.activeWorkspace, workspace.id);
      return;
    }

    setActiveWorkspaceId(workspace.id);
  }, [isDatabaseMode, setActiveWorkspaceId]);

  const contextValue = useMemo(
    () => ({
      workspaces: visibleWorkspaces,
      activeWorkspace,
      setActiveWorkspace,
      addWorkspace,
      deleteWorkspace,
      adminViewWorkspace,
      activeWorkspaceRole,
      canManageWorkspace,
      canDeleteBusinessRecords,
      isLoadingWorkspaces,
      workspaceError,
    }),
    [
      activeWorkspace,
      addWorkspace,
      activeWorkspaceRole,
      deleteWorkspace,
      adminViewWorkspace,
      canDeleteBusinessRecords,
      canManageWorkspace,
      isLoadingWorkspaces,
      setActiveWorkspace,
      visibleWorkspaces,
      workspaceError,
    ]
  );

  return (
    <WorkspaceContext.Provider
      value={contextValue}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider"
    );
  }

  return context;
}
```

## docs\access-plans.md

```markdown
# Frontier Access Plans

Frontier separates local demo behavior from authenticated cloud services.

| Plan | Cloud storage | OCR | Speech | AI drafts | Logistics | External routing |
| --- | --- | --- | --- | --- | --- | --- |
| Visitor | No | No | No | No | No | No |
| Free | No | No | No | No | No | No |
| Basic | Yes | No | No | No | No | No |
| Professional | Yes | Yes | Yes | Yes | Yes | Yes |
| Business | Yes | Yes | Yes | Yes | Yes | Yes |

Until billing and a persisted workspace plan are implemented, signed-in workspaces use
`FRONTIER_DEFAULT_PLAN`. Its safe alpha fallback is `professional`, preserving existing
development workflows. Server routes remain authoritative; UI disabled states are only guidance.

Daily OCR, speech, AI-draft, geocode, and route limits use the existing in-process counter
foundation. Durable quota accounting should replace it when billing is introduced.
```

## docs\action-layer.md

```markdown
# Frontier Action Layer

## Purpose

The action layer is the shared business mutation boundary for Frontier. GUI screens, future voice commands, OCR review flows, AI review flows, customer portals, employee portals, server routes, and automation should call these actions instead of duplicating create/update/delete logic in page components.

Actions are intentionally thin. They validate required business fields, call the existing repository method, normalize readable errors, and preserve the current signed-in/signed-out split.

## Flow

Signed-out mode:

1. UI or workflow calls an action.
2. The action validates required fields.
3. The repository writes to localStorage through the existing local fallback.

Signed-in mode:

1. UI or workflow calls an action.
2. The action validates required fields.
3. The repository uses the existing Supabase/server-route path.
4. RLS remains enforced for browser-safe reads and updates; signed-in creates that require elevated validation continue through server routes.

## Available Actions

Clients:

- `createClientAction`
- `updateClientAction`
- `deleteClientAction`

Jobs:

- `createJobAction`
- `updateJobAction`
- `deleteJobAction`

Invoices:

- `createInvoiceAction`
- `updateInvoiceAction`
- `deleteInvoiceAction`
- `markInvoicePaid`

Inventory:

- `createInventoryItemAction`
- `updateInventoryItemAction`
- `deleteInventoryItemAction`

Expenses:

- `createExpenseAction`
- `updateExpenseAction`
- `deleteExpenseAction`

Documents:

- `createDocumentAction`
- `updateDocumentAction`
- `deleteDocumentAction`

Calendar:

- `createCalendarEventAction`
- `updateCalendarEventAction`
- `deleteCalendarEventAction`

Routes:

- `createRoutePlanAction`
- `updateRoutePlanAction`
- `deleteRoutePlanAction`

Workspaces:

- `createWorkspaceAction`
- `updateWorkspaceAction`
- `deleteWorkspaceAction`

Compatibility aliases without the `Action` suffix remain exported for older imports.

## Current Consumers

The main UI mutation surfaces now route through shared actions for clients, jobs, invoices, inventory, documents, calendar events, route plans, and workspace create/delete.

The repository layer remains responsible for choosing localStorage fallback vs Supabase-backed persistence.

## Mutation Inventory

| Area | UI entry point | Shared action | Repository | Signed-in path | Signed-out path |
| --- | --- | --- | --- | --- | --- |
| Clients | `app/clients/page.tsx`, invoice builder client upsert | `createClientAction`, `updateClientAction`, `deleteClientAction` | `lib/db/clients.ts` | Create/update/delete through server routes | localStorage client helpers |
| Jobs | `app/jobs/page.tsx`, `app/jobs/[id]/page.tsx` | `createJobAction`, `updateJobAction`, `deleteJobAction` | `lib/db/jobs.ts` | Create/update/delete through server routes; material replacement uses the same server mutation path | localStorage jobs |
| Invoices | `app/invoices/page.tsx`, `app/invoices/[id]/page.tsx`, `app/invoices/new/build/page.tsx`, `app/financials/page.tsx` | `createInvoiceAction`, `updateInvoiceAction`, `deleteInvoiceAction` | `lib/db/invoices.ts` | Create/update/delete through server routes | localStorage invoices |
| Inventory | `app/inventory/page.tsx` | `createInventoryItemAction`, `updateInventoryItemAction`, `deleteInventoryItemAction` | `lib/db/inventory.ts` | Create/update/delete through server routes | localStorage inventory |
| Expenses | `app/financials/page.tsx` | `createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction` | `lib/db/expenses.ts` | Create/update/delete through server routes | localStorage expenses |
| Documents | `app/documents/page.tsx`, `app/documents/DocumentAttachments.tsx` | `createDocumentAction`, `updateDocumentAction`, `deleteDocumentAction` | `lib/db/documents.ts` | Metadata create/update/delete through server routes; file storage remains separate | localStorage document metadata |
| Calendar | `app/calendar/page.tsx` | `createCalendarEventAction` | `lib/db/calendarEvents.ts` | Create/update/delete through server routes; update/delete available in repository/action but not exposed broadly in UI | localStorage calendar events |
| Routes | `app/logistics/page.tsx` | `createRoutePlanAction` | `lib/db/routes.ts` | Create/update/delete through server routes; update/delete available in repository/action but not exposed broadly in UI | route persistence is signed-in focused today |
| Workspaces | `components/AppShell.tsx`, `app/settings/page.tsx` | `createWorkspaceAction`, `deleteWorkspaceAction` | `components/WorkspaceContext.tsx` | Create/delete through workspace context server routes | local workspace state |
| Settings | `app/settings/page.tsx`, settings subpanels | Not fully centralized | local settings state and targeted Supabase settings where implemented | Mixed | localStorage settings |

## Human Review Rule

AI and OCR workflows must remain human-review-first. They may prepare draft document extraction data, suggested records, or command payloads, but they must not directly create clients, jobs, invoices, expenses, calendar events, route plans, or documents without explicit user approval.

## Remaining Hotspots

- Document upload/delete is still a two-resource operation: storage object plus metadata row. Metadata writes are server-routed, but browser storage upload/delete still needs real workflow QA.
- Settings persistence is still mixed local-only and DB-backed depending on setting type.

## Next Sprint

Document Workflow QA:

- Verify upload/download/delete in a real browser environment that supports file upload.
- Validate storage object cleanup when metadata creation fails.
- Validate metadata cleanup when storage deletion fails.
- Verify OCR review persistence after real uploaded files exist.
```

## docs\admin-console.md

```markdown
# Frontier Admin Console

The platform admin console lives at `/frontier-admin`.

Platform admin is separate from workspace roles. A workspace `Owner` is not a Frontier platform admin unless that auth user is also present in `public.platform_admins`.

## Access

Admin access is checked through `public.is_platform_admin()`.

Cross-tenant inspection uses server-only API routes under `/api/frontier-admin/*`. These routes verify the signed-in user first, then use `SUPABASE_SERVICE_ROLE_KEY` on the server only.

## Features

- Aggregate system summary cards
- User search by email, auth user id, workspace name, or business name
- User workspace inspection
- Workspace read-only inspection:
  - members
  - clients
  - jobs
  - invoices
  - inventory
  - documents metadata
  - route plans
- Admin view mode
- Recent audit log list

## Audit Logs

The `public.admin_audit_logs` table records:

- `user_search`
- `view_user`
- `view_workspace`
- `enter_admin_view_mode`
- `exit_admin_view_mode`

Only platform admins can read audit logs.

## Admin View Mode

Admin view mode does not replace or fake the auth session. It stores separate local browser state:

- `frontier-admin-view-admin-user-id`
- `frontier-admin-view-user-id`
- `frontier-admin-view-workspace-id`
- `frontier-admin-view-workspace-name`
- `frontier-admin-view-workspace-type`

The AppShell shows an `Admin View Mode` banner with `Back to Admin` and `Exit Admin View`.

## Current Limits

- Read-only only.
- No destructive admin actions.
- No private file preview/download in admin yet.
- No billing or customer portal controls yet.
```

## docs\ai-interpretation-layer.md

```markdown
# AI Interpretation Layer

Frontier's AI interpretation layer is a contract boundary between extraction workers and human-approved business actions.

## Current Status

- OCR worker is frozen and can produce text.
- Speech worker is frozen and can produce transcripts.
- This layer converts text into structured review drafts.
- This layer does not call AI providers yet.
- This layer does not write to Supabase.
- This layer does not execute Frontier actions.
- This layer does not create autonomous actions.

## Flow

```text
OCR Worker
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Shared Frontier Action Layer

Speech Worker
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Shared Frontier Action Layer
```

## Allowed Draft Actions

- `create_client`
- `update_client`
- `create_job`
- `update_job`
- `create_invoice`
- `update_invoice`
- `create_expense`
- `update_inventory`
- `create_calendar_event`

Delete and destructive actions are intentionally excluded.

## Validation Responsibilities

- Required field validation.
- Payload shape validation.
- Confidence threshold warnings.
- Duplicate protection hooks.
- Workspace ownership hooks.
- Future permission hooks.

Hooks are intentionally passive. They return warnings and do not mutate data.

## Provider Strategy

Future model providers should satisfy the `InterpretationProvider` contract in `lib/ai/types.ts`.

Provider implementation must remain behind this boundary. Do not hardcode OpenAI, OpenRouter, Anthropic, or any other model provider into UI flows.

## Next Phases

1. Finalize review draft persistence schema.
2. Add a server-only provider adapter.
3. Add OCR result -> interpretation route.
4. Add transcript -> interpretation route.
5. Build review UI.
6. On approval, map accepted drafts into the shared Frontier action layer.
```

## docs\ai-model-contract.md

```markdown
# Frontier AI Model Contract

Use this document as context when evaluating or changing Frontier AI prompts.

## Safety Boundary

AI output is an editable proposal. It never mutates Frontier records directly.

```text
OCR / speech / image / manual text
  -> interpretation
  -> editable review draft
  -> existing Frontier form or material allocation draft
  -> explicit user save
```

Approval and execution remain separate actions. Delete actions are forbidden.

## Compact Runtime Contract

Runtime AI calls use the compact contract in `lib/ai/parserContract.ts`:

```text
You parse contractor ops input into safe Frontier drafts. Return JSON only. Never execute. Do not guess clients/jobs/vendors/materials/dates. Fuzzy/single matches are candidates only. Ask for clarification when identity/date/cost/mode is uncertain. Ignore filler/prompt echoes. Never use action words as names. Preserve source text.
```

Keep examples and expanded behavior notes in this document, not in runtime
prompts. Runtime prompts should stay short and only add the allowed action list
and required JSON envelope.

## Supported Draft Intents

- `create_client`
- `update_client`
- `create_job`
- `update_job`
- `create_invoice`
- `update_invoice`
- `create_expense`
- `update_inventory`
- `create_material_allocation`
- `create_calendar_event`

Interpret receipts as expense drafts. Interpret vendor quotes as inventory drafts.
Interpret material lists and sticky notes as material allocation drafts.

## Material Allocation Contract

```json
{
  "type": "create_material_allocation",
  "confidence": 0.82,
  "payload": {
    "jobId": "optional-existing-job-id",
    "jobName": "optional-job-label",
    "mode": "Append",
    "materials": [
      { "name": "Mulch", "quantity": 3, "notes": "cubic yards" }
    ]
  }
}
```

Valid modes are `Append`, `Merge`, and `Replace`. The user must select or create
a job and explicitly save. Saving creates draft allocations only; it does not
change job materials or inventory quantities.

## Source Retention

OCR drafts retain their source document ID. Material allocations retain both
the source document ID and review draft ID. Review Queue links back to source
documents.

## Validation Expectations

- Return JSON only.
- Never invent record IDs.
- Use warnings when fields are uncertain.
- Material names must be non-empty.
- Material quantities must be positive numbers.
- Keep payloads minimal and workspace-neutral; the server verifies ownership.

## Example Behavior

Input:

```text
Create a new client Clarissa and schedule a visit with her Wednesday the 23rd.
```

Expected behavior:

- Do not extract `new` as a client name.
- Treat `Clarissa` as the candidate client name.
- Resolve the date into an explicit date where deterministic context is
  available, then ask for confirmation if ambiguous.
- Create only draft actions or clarification state. Do not execute.

Input:

```text
Materials for sturdybaker job are 25 shingles and two packs of siding.
```

Expected behavior:

- Treat `sturdybaker` as a possible fuzzy candidate for `Studebaker`, not as a
  confirmed match.
- Ask which job to attach materials to if multiple candidates exist.
- Ask whether material costs are unit cost or total cost when unclear.
- Ask whether to append, merge, or replace before applying material changes.
```

## docs\ai-provider-layer.md

```markdown
# AI Provider Layer

The AI provider layer is server-only glue between Frontier's interpretation contracts and external model providers.

## Current Status

- Primary provider is selected by `AI_PROVIDER`.
- Primary text model is selected by `AI_MODEL_TEXT`.
- Vision model is reserved through `AI_MODEL_VISION`.
- Fallback provider is selected by `AI_FALLBACK_PROVIDER`.
- Fallback model is selected by `AI_MODEL_FALLBACK`.
- OpenRouter and OpenAI adapters exist.
- Provider output must be JSON.
- Provider output is validated through the existing interpretation validators.
- Review and Documents include image analysis entry points.
- Provider adapters do not write to Supabase; server routes may persist review drafts.
- No actions are executed.

## Exported Entry Points

- `interpretDocumentWithAI()`
- `interpretTranscriptWithAI()`
- `interpretImageWithAI()`

Image interpretation now uses the configured vision model through the same
server-only provider abstraction. It accepts image data from the server route,
returns structured JSON, validates suggested actions, and persists review drafts
only. It does not execute actions.

Supported image intake types are JPG, PNG, and WebP. HEIC is intentionally not
enabled yet.

## Safety Rules

- Providers run server-side only.
- API keys are read from `process.env`.
- Secrets are never exposed to the browser.
- Delete/destructive actions are not allowed.
- Invalid JSON is rejected.
- Invalid draft actions are rejected.
- Primary provider failure falls back to the configured fallback provider when available.

## Next Steps

1. Add OCR-result-to-AI server route.
2. Add transcript-to-AI server route.
3. Persist review drafts.
4. Build review queue UI.
5. Execute only user-approved drafts through the shared Frontier action layer.
```

## docs\ai-readiness.md

```markdown
# AI Readiness

Frontier is structurally ready for AI orchestration, but no external AI calls are wired yet.

## Current Foundation

- `public.ai_jobs` tracks future document, voice, logistics, invoice, and client parsing work.
- Future job types include `document_ocr`, `document_extraction`, `voice_command`, `logistics_plan`, `invoice_parse`, and `client_parse`.
- Action wrappers exist for clients, jobs, invoices, inventory, documents, routes, and calendar events.
- Workspace RLS applies to AI job rows.

## Required Next Step

Add a server-side job runner that claims queued jobs, calls the selected provider, writes results, and sends extracted data to human review.

AI should not write business records directly without review.
```

## docs\ai-review-draft-persistence.md

```markdown
# AI Review Draft Persistence

Frontier stores AI-generated suggestions as review drafts before a human approves anything.

## Flow

```text
OCR extracted text
  -> interpretDocumentWithAI()
  -> ReviewDraft
  -> ai_review_drafts

Transcript text
  -> interpretTranscriptWithAI()
  -> ReviewDraft
  -> ai_review_drafts
```

## Safety Boundaries

- Review draft creation does not execute actions.
- Review draft creation does not create clients, jobs, invoices, expenses, inventory, or calendar records.
- Delete/destructive action types are excluded by the AI schema and guarded by a database check.
- Review drafts are scoped to a workspace.
- Workspace members can read and create drafts for their workspace.
- Owners and Managers can update draft status for future approval/rejection flows.

## Server Routes

- `POST /api/ai/interpret-document`
- `POST /api/ai/interpret-transcript`

Both routes require a signed-in user and active workspace membership.

## Future UI

The Review Queue UI should show pending drafts, warnings, confidence, source text, and proposed actions. Approval should remain explicit.

## Future Approval Mapping

Approved drafts should be mapped into the shared Frontier action layer only after user confirmation. This sprint intentionally does not implement that execution path.
```

## docs\database-plan.md

```markdown
# Frontier Database Plan

This plan prepares Frontier for Supabase/Postgres without changing the current localStorage UI. The migration is intentionally relational, workspace-scoped, and boring: UUID IDs, cents for money, `date` for business dates, `timestamptz` for audit timestamps, and RLS through `workspace_members`.

## Table Purpose

- `profiles`: one row per Supabase auth user.
- `workspaces`: contractor/business workspaces.
- `workspace_members`: user access, roles, invitations, and active membership checks.
- `workspace_settings`: company profile, invoice defaults, tax settings, and workspace notes.
- `clients`: client records, contact info, balance, and geocoded address fields.
- `client_notes`: editable client note history.
- `client_activity`: client timeline events.
- `jobs`: job records linked to clients by ID with a client name snapshot.
- `job_materials`: materials used or estimated for a job.
- `job_activity`: job timeline/history.
- `inventory_items`: workspace inventory levels.
- `estimates` and `estimate_line_items`: estimates that can later convert into invoices.
- `invoices` and `invoice_line_items`: invoice source of truth with company and bill-to snapshots.
- `invoice_payments`: full or partial payment records.
- `expenses`: workspace expense records.
- `documents`: document metadata and attachment links to clients, jobs, invoices, estimates, and expenses.
- `document_tags` and `document_tag_links`: document tagging.
- `client_calendar_events`: client-linked calendar items.
- `route_plans` and `route_plan_stops`: saved logistics routes, ordered stops, distance, duration, and export URL.
- `ai_jobs`: database tracking for AI workflows while workflow logic stays visible in TypeScript.

## Relationship Map

```text
Workspace
  -> Members
  -> Settings
  -> Clients
      -> Client Notes
      -> Client Activity
      -> Jobs
      -> Invoices
      -> Estimates
      -> Documents
      -> Calendar Events
  -> Jobs
      -> Job Materials
      -> Job Activity
      -> Invoices
      -> Estimates
      -> Documents
  -> Estimates
      -> Estimate Line Items
      -> Converted Invoice
  -> Invoices
      -> Invoice Line Items
      -> Invoice Payments
      -> Documents
  -> Expenses
      -> Documents
  -> Documents
      -> Tags
      -> AI Jobs
  -> Route Plans
      -> Route Stops
```

Every business table has `workspace_id`. Relationships use IDs, while invoices and estimates keep snapshots so historical billing records do not mutate when clients or settings change.

## RLS Strategy

RLS is enabled on every app table. Access flows through `workspace_members` using `is_workspace_member(workspace_id)`, which checks for an active membership for `auth.uid()`.

First-pass policies allow active workspace members to select, insert, update, and delete workspace records. Role-specific restrictions for Owner, Manager, and Employee should come later after the app’s permission model is fully designed.

Profiles are owner-scoped. Workspaces can be created by authenticated users, then an initial Owner membership can be inserted for the creating user.

## LocalStorage To Database Migration Order

1. Create authenticated user profile.
2. Create workspace rows from `frontier-workspaces`; create an Owner membership for the current user.
3. Insert workspace settings from `frontier-settings`.
4. Insert clients from `frontier-clients`, converting balances to cents.
5. Insert jobs from `frontier-jobs`, preserving `clientId` and `client` as `client_name_snapshot`.
6. Insert job materials.
7. Insert inventory from `frontier-inventory`.
8. Insert invoices from `frontier-invoices`, preserving company and bill-to snapshots, then insert line items.
9. Insert expenses from `frontier-expenses`.
10. Insert documents from `frontier-documents`; later move file bytes into Supabase Storage and save `storage_bucket` and `storage_path`.
11. Insert client calendar events from `frontier-client-calendar-events`.
12. Start adding new UI against Supabase module by module, leaving localStorage fallback until each module is migrated.

AI workflow code should live in visible TypeScript files under a future `lib/ai/` folder. The `ai_jobs` table should only track workflow status, inputs, outputs, approvals, and errors.
```

## docs\invoice-hardening-audit.md

```markdown
# Invoice Hardening Audit

## Completed

- Existing invoices can be opened from the detail page and edited in the current builder.
- Edited invoices save back to the same invoice id instead of creating a duplicate.
- Duplicate invoice flow creates a new invoice id, invoice number, and line item ids.
- Invoice detail supports Estimate, Draft, Sent, Overdue, and Paid status updates.
- Print output now includes invoice/estimate label, status, subtotal, discount, tax, and total.

## Deferred Payment Rule

Automatically changing a linked job to `Paid` when an invoice is marked `Paid` is intentionally deferred.

Reason: a job can have multiple invoices, partial billing, deposits, change orders, or an invoice that does not represent the full job value. The safe rule needs to be explicit:

- mark job paid only when all linked invoices are paid, or
- mark job paid when one final invoice is paid, or
- ask the user each time.

Recommended next step: add a confirmation prompt or workspace setting before automating job status changes.

## Transaction Risks

Invoice writes are still multi-step:

1. save invoice row
2. delete existing line items
3. insert replacement line items

If step 3 fails, the invoice header may be saved while line items are incomplete. This should become a Postgres RPC or server action transaction before production launch.

## Permission Notes

Invoice RLS is workspace-member scoped. This preserves workspace isolation, but role-level permissions are still broad. Owner/Manager/Employee distinctions should be tightened in a future permission sprint.

## Schema Snapshot Blocker

`supabase db dump --schema public` is still blocked on this Windows machine because the Supabase CLI requires Docker access and Docker Desktop is not available/running for the current shell. The failed dump attempt was reverted, so `supabase/schema-current.sql` was not intentionally refreshed in this sprint.
```

## docs\logistics-api-readiness.md

```markdown
# Logistics API Readiness

The logistics module is ready for external provider insertion, but no paid APIs are called yet.

## Current Foundation

- Client addresses feed the map.
- Routes and stops persist in Supabase.
- Route writes are atomic through `public.upsert_route_with_stops`.
- `lib/logistics/providers.ts` defines provider boundaries for geocoding, distance matrix, route optimization, and Google Maps export.

## Future Provider Flow

1. Geocode client/job addresses.
2. Cache latitude/longitude.
3. Run distance matrix.
4. Optimize stop order.
5. Save route plan with total distance and duration.
6. Export to Google Maps.

## Still Missing

- Provider selection in settings.
- API key storage strategy.
- Traffic-aware routing.
- Route recalculation UI.
```

## docs\logistics-next.md

```markdown
# Logistics Foundation Next

## Goal

Prepare logistics for provider-backed routing without committing to a provider implementation in this sprint.

## Intended Flow

Client Save
-> Geocode Once
-> Store Latitude/Longitude
-> Cached Coordinates

Route Generation
-> OpenRouteService Matrix
-> Nearest Neighbor
-> Optimized Stop Order
-> Google Maps Export

## Implementation Notes

- Store coordinates on the client or address record after a successful geocode.
- Re-geocode only when the normalized address changes.
- Keep geocoding and matrix API keys server-side.
- Keep route plans workspace-scoped and RLS protected.
- Use cached coordinates for map rendering and route generation.
- Use a simple nearest-neighbor pass first, then preserve room for stronger optimization later.
- Export to Google Maps as ordered stops, not as a stored Google route.
- Use public Nominatim only for low-volume development geocoding.
- Do not call Nominatim from browser components.
- Require `NOMINATIM_USER_AGENT` before outbound provider calls.
- Respect at least 1100ms between public Nominatim requests.
- Show OpenStreetMap attribution wherever geocoding is exposed.

## Environment

```env
OPENROUTE_SERVICE_API_KEY=
GEOCODER_PROVIDER=nominatim
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=Frontier/0.1 (contact: your-email@example.com)
GEOCODE_CACHE_TTL_DAYS=30
GEOCODE_RATE_LIMIT_MS=1100
```

## Open Questions

- Whether coordinates belong directly on `clients` or in a separate `addresses` table.
- Whether route plans should snapshot addresses at creation time for historical accuracy.
- Whether traffic-aware routing is needed for MVP or should remain post-MVP.
```

## docs\ocr-command-workflow.md

```markdown
# OCR-to-Command Workflow

## Goal

Convert reviewed OCR text into editable Frontier action drafts without directly changing records.

```text
Stored document
-> OCR extraction
-> Human correction
-> AI interpretation
-> Review draft
-> Human edit and target selection
-> Explicit approval
-> Explicit execution through the action layer
```

## Material Notes

For sticky notes, handwritten lists, and material sheets, interpretation produces a
`create_material_allocation` draft containing normalized material names and quantities. The draft
is not executable as a business action. The user selects an existing job in the same workspace.

> Apply these materials to which job?

The selected job ID must be validated server-side for workspace ownership. Existing materials
should be shown before confirmation, and the user chooses whether to append, replace, or merge
matching materials. Saving creates draft allocation rows only. No job material or inventory
quantity is changed, and no delete action is generated.

## Current Support

1. Review-draft title, summary, and action payload editing.
2. Workspace-scoped existing-job selection.
3. Append, Merge, and Replace intent selection.
4. Source document and review-draft retention.
5. Draft allocation persistence without automatic application.

Applying a saved allocation to job materials remains a separate future explicit action.
See `docs/ai-model-contract.md` for the model-facing contract.

Invoices, receipts, job notes, and client notes follow the same review-first contract. AI output is
never permission to execute an action automatically.
```

## docs\ocr-next.md

```markdown
# OCR MVP Next

## Goal

Turn the existing OCR foundation into a practical document extraction workflow without adding external providers in this sprint.

## Current Status

- Standalone `worker-ocr/` service exists.
- Worker QA hardening is in place.
- Worker returns clean JSON success and error payloads.
- Frontier app integration has not started.
- OCR review screen has not started.
- Deployment has not started.

## Intended Flow

Upload Document
-> Create Metadata
-> Queue OCR Job
-> Run Tesseract/OCRmyPDF
-> Store Extracted Text
-> Score Confidence
-> Human Review
-> Mark Reviewed

## Implementation Notes

- Start with Tesseract/OCRmyPDF for local or server-side OCR.
- Store confidence scores per document and, if practical, per extracted field.
- Keep OCR output as a draft until a human approves it.
- Use `ai_jobs` or equivalent job records for status, errors, attempts, and timing.
- Add an optional AI rescue path only after deterministic OCR and review flow are stable.
- Do not create clients, jobs, invoices, or expenses automatically from OCR output.

## Review Requirements

- Human approval is required before extracted data affects business records.
- Low-confidence fields should be visibly flagged in the review screen.
- Failed OCR jobs should remain inspectable and retryable.

## Next Phases

1. App-side OCR API route.
2. Document upload -> OCR worker call.
3. OCR review screen.
4. Approve extracted result.
5. Action layer integration.
```

## docs\ocr-readiness.md

```markdown
# OCR Readiness

Documents now have the metadata needed for OCR and visual document understanding.

## Document Fields

- `processing_status`
- `extracted_text`
- `extracted_json`
- `ocr_provider`
- `ai_job_id`
- `reviewed_at`
- `reviewed_by`
- `confidence`
- `document_type`

## Status Flow

```text
uploaded -> queued -> processing -> needs_review -> reviewed
                                      -> failed
```

## Still Missing

- OCR queue button or automatic enqueue.
- Worker/job runner.
- Review extracted document data screen.
- Provider-specific parser adapters.
```

## docs\permissions-hardening.md

```markdown
# Permissions Hardening

## Current State

Workspace isolation is based on active `workspace_members` rows through `public.is_workspace_member(workspace_id)`.

Platform admin access is separate through `public.platform_admins` and server-only admin routes.

## Implemented Role Helpers

- `public.has_workspace_role(workspace_id, roles)`
- `public.is_workspace_owner(workspace_id)`
- `public.is_workspace_manager(workspace_id)`

`is_workspace_manager` currently means Owner or Manager.

## Safe Today

- Normal users cannot access admin data unless `public.is_platform_admin()` passes.
- Business records are workspace-scoped.
- Storage objects are scoped by workspace path prefix.
- Workspace deletion is owner-only.
- Business object deletion is limited to Owner/Manager.
- Employee/member users retain non-destructive workspace access.

## Broad Permissions Remaining

Most workspace tables still allow any active workspace member to create and update records.

Tables needing role-specific create/update refinement include clients, jobs, invoices, inventory, documents, route plans, and workspace settings.

## Recommended Role Rules

- Owner: full workspace control.
- Manager: operations control, invites, most CRUD.
- Member/Employee: assigned work, uploads, limited status changes.
- Customer: own records only, no workspace-wide access.
- Platform Admin: support inspection only through audited server routes.

## Future Customer Requirements

- Customers must never receive workspace-wide membership.
- Customer access should be scoped through customer/client relationship tables.
- Customers should only read their own invoices, jobs, documents, and messages.
- Customer uploads should be quarantined or marked as customer-submitted until reviewed.

## Future Employee Requirements

- Employees should read assigned jobs, assigned routes, relevant documents, and their own schedule.
- Employees may upload photos/documents and add notes.
- Employees should not delete business records.
- Employee status updates should be constrained to safe workflow transitions.
```

## docs\portal-architecture.md

```markdown
# Portal Architecture

Portals are not implemented yet. This is the recommended foundation.

## Employee Portal

Employees should authenticate normally, then route into a workforce view based on workspace membership and role.

Future employee capabilities include assigned jobs, schedule, route plan, document/photo upload, job notes, and status updates.

## Customer Portal

Customers should authenticate separately from employees and connect to a business workspace by invite or verified customer relationship.

Future customer capabilities include own jobs, invoices, documents, messages, and payment links.

## RLS Needs

- Employee access should be workspace-scoped and role-limited.
- Customer access should be relationship-scoped, not workspace-wide.
- Platform admin must remain separate from workspace owner.
```

## docs\review-queue.md

```markdown
# Review Queue

The Review Queue lists persisted AI review drafts for the active workspace.

## Current Scope

- Lists `ai_review_drafts`.
- Shows source type, status, confidence, warnings, and proposed action payloads.
- Allows Owners and Managers to update status.
- Supported statuses: `Pending`, `Approved`, `Rejected`, `Needs Changes`.

## Safety Boundary

Approving a draft does not execute it yet. The UI only updates review draft status. It does not create clients, jobs, invoices, expenses, inventory records, or calendar events.

## Next Step

The approval-to-action sprint should map approved drafts into the shared Frontier action layer behind an explicit final confirmation.
```

## docs\rls-audit.md

```markdown
# RLS Audit

| Table | Current Access | Risk | Recommended Future State |
|---|---|---|---|
| `profiles` | Owner can read/insert/update own profile | Low | Keep self-scoped; add admin support reads only through server routes |
| `workspaces` | Members can read/update; Owners can delete | Medium | Owner-only destructive actions; consider Manager update limits |
| `workspace_members` | Members can view; Managers can invite/manage/remove | Medium | Prevent Managers from removing last Owner; audit role changes |
| `workspace_settings` | Members can read/insert/update; Owners can delete | Medium | Owner/Manager update, Owner delete |
| `clients` | Members can read/insert/update; Owner/Manager delete | Medium | Employee/member update limits; customer relationship scope later |
| `jobs` | Members can read/insert/update; Owner/Manager delete | Medium | Employees limited to assigned jobs and safe status updates |
| `job_materials` | Members can read/insert/update; Owner/Manager delete | Medium | Tie writes to job permissions |
| `invoices` | Members can read/insert/update; Owner/Manager delete | High | Limit invoice create/update to Owner/Manager; customer read own invoices only |
| `invoice_line_items` | Members can read/insert/update; Owner/Manager delete | High | Tie writes to invoice permissions |
| `inventory_items` | Members can read/insert/update; Owner/Manager delete | Medium | Managers manage inventory; employees consume/request only |
| `client_calendar_events` | Members can read/insert/update; Owner/Manager delete | Medium | Employees read assigned schedule; Managers manage |
| `documents` | Members can read/insert/update; Owner/Manager delete | High | Employees upload/read assigned docs; customers read own docs only |
| `storage.objects` | Workspace members read/upload/update; Owner/Manager delete document objects | High | Add server-side signed URL workflows for portal users |
| `ai_jobs` | Members can read/insert/update; Owner/Manager delete | Medium | Server job runner should own processing updates |
| `route_plans` | Members can read/insert/update; Owner/Manager delete | Medium | Employees read assigned route only |
| `route_plan_stops` | Members can read/insert/update; Owner/Manager delete | Medium | Tie stop visibility to route assignment |
| `platform_admins` | Platform admins can read | Low | Keep creation SQL/admin-only |
| `admin_audit_logs` | Platform admins can read | Low | Continue logging all support inspection actions |

## Privilege Escalation Notes

- Workspace Owner is not Platform Admin.
- Platform Admin can inspect through audited server routes, but normal client-side RLS does not grant cross-workspace access.
- Employee/member destructive deletes are now blocked at RLS for core business tables.
- Create/update policies remain intentionally broad to avoid breaking the current app; tighten these in a later role-workflow sprint.
```

## docs\schema-drift-report.md

```markdown
# Schema Drift Report

Generated: 2026-06-17

## Scope

This audit compares the live Supabase public application schema against:

- `supabase/migrations/0001_frontier_foundation.sql`
- `supabase/migrations/0002_workspace_member_invites.sql`

The generated snapshot is stored at `supabase/schema-current.sql`.

## Summary

App schema drift: No

Platform extension drift: Yes

Risk level: Low

## Tables Found

- `ai_jobs`
- `client_activity`
- `client_calendar_events`
- `client_notes`
- `clients`
- `document_tag_links`
- `document_tags`
- `documents`
- `estimate_line_items`
- `estimates`
- `expenses`
- `inventory_items`
- `invoice_line_items`
- `invoice_payments`
- `invoices`
- `job_activity`
- `job_materials`
- `jobs`
- `profiles`
- `route_plan_stops`
- `route_plans`
- `workspace_members`
- `workspace_settings`
- `workspaces`

## Drift Findings

Tables missing from migrations: None

Schema drift: None found in the public application tables, columns, defaults, primary keys, foreign keys, unique constraints, check constraints, functions, triggers, or standalone indexes.

Policy drift: None found. The live invite insert policy from Task 39 is represented by `0002_workspace_member_invites.sql`.

Trigger drift: None found.

Index drift: None found for standalone app indexes. Primary key and unique-constraint backing indexes are represented through constraints in the schema snapshot.

Extension drift: The live Supabase database includes platform/default extensions that are not all declared in app migrations:

- `pg_stat_statements`
- `plpgsql`
- `supabase_vault`
- `uuid-ossp`

`pgcrypto` is declared by app migration history and exists live under Supabase's `extensions` schema.

## Recommended Corrective Action

No corrective app migration is recommended.

The extension differences are Supabase platform-managed state, not Frontier application schema drift. Keep `schema-current.sql` as an audit snapshot. If Frontier ever needs a standalone non-Supabase Postgres rebuild, add a separate platform bootstrap script or document the required extensions explicitly for that environment.

## Rebuild Confidence

High for rebuilding the Frontier public application schema on Supabase from the existing migrations.

Not fully standalone outside Supabase without platform setup, because the app schema references Supabase-managed objects such as `auth.users` and relies on Supabase-managed extension/schema conventions.
```

## docs\service-compliance.md

```markdown
# Service Compliance

## Scope

This audit covers Frontier logistics integrations:

- Public Nominatim geocoding.
- OpenStreetMap raster tiles.
- OpenRouteService matrix requests.
- Optional GeocodeFarm fallback geocoding.
- Google Maps URL export.
- Supabase-backed API route protection.

## Reference Policies

- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
- OpenRouteService restrictions: https://openrouteservice.org/restrictions/
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started

## Implemented Safeguards

### Nominatim

- Nominatim is called from server-only code.
- Browser components call `/api/geocode`, not the provider directly.
- `NOMINATIM_USER_AGENT` is required before outbound Nominatim calls.
- All outbound Nominatim calls pass through a single in-process FIFO throttle.
- The throttle enforces at least `GEOCODE_RATE_LIMIT_MS`, with a hard minimum of 1100ms.
- The throttle has a bounded queue of 5 requests and a max wait of 10 seconds.
- Successful geocode results are cached in memory.
- Saved client coordinates prevent repeat provider calls for the same client.
- Logistics exposes explicit user-triggered geocoding only.
- No autocomplete, typing-time geocoding, page-load geocoding, or bulk geocoding is implemented.
- OpenStreetMap geocoding attribution is visible on the Logistics page.

### OpenStreetMap Tiles

- Tiles use HTTPS.
- Attribution is visible through the Leaflet tile attribution control.
- Tile URL is configurable through `NEXT_PUBLIC_OSM_TILE_URL`.
- Frontier does not implement tile scraping, prefetching, offline tile download, or tile archives.

### OpenRouteService

- API key stays server-side.
- Matrix requests go through `/api/logistics/matrix`.
- Requests validate workspace access before provider use.
- `MATRIX_MAX_LOCATIONS` blocks oversized matrix requests before provider invocation.
- Route daily user/workspace counters limit abuse.
- Missing config, 429s, provider failures, and oversized requests return clean messages.

### GeocodeFarm Fallback

- Fallback is server-side only.
- Fallback is disabled unless `GEOCODEFARM_ENABLED=true`.
- API key is never exposed to browser code.
- Global daily fallback counter limits usage through `GEOCODEFARM_MAX_REQUESTS_PER_DAY`.
- Provider status errors are mapped to clean user-facing messages.

### Google Maps Export

- Export is a URL handoff only, not a routing provider.
- URLs include `api=1`.
- Export remains user initiated.
- URLs over 2048 characters are blocked with a clean message.

### Supabase Protection

- Logistics routes require a signed-in user.
- API routes verify active workspace membership server-side.
- Workspace membership checks use bounded `.limit(1)` queries.
- Provider routes do not trust browser-provided workspace ids without validation.

## Remaining Risks

- In-memory geocode cache resets on server restart.
- In-memory counters and throttles are per process, not distributed.
- Multiple deployed instances could exceed global provider limits unless Redis, Supabase advisory locks, or a single queue worker is added.
- Public Nominatim should remain development and low-volume only.
- GeocodeFarm fallback has not been browser-QA tested against a live provider response in this sprint.
- OpenRouteService totals are not yet persisted into saved route plans automatically.

## Future Scaling Requirements

- Replace in-memory geocode cache with a Supabase-backed `geocode_cache` table.
- Replace in-memory daily counters with Redis or a database-backed rate limiter.
- Replace in-process Nominatim throttle with a distributed queue or single geocoding worker.
- Add durable provider request logs for operations review.
- Move from public Nominatim to a hosted provider or self-hosted Nominatim before broad commercial traffic.
- Consider a commercial tile provider before broad customer usage.

## Distributed Rate Limiter Requirements

Production rate limiting should provide:

- Atomic per-user daily counters.
- Atomic per-workspace daily counters.
- Global per-provider counters.
- FIFO provider queues with bounded length.
- Per-provider cooldowns.
- Provider failure circuit breakers.
- Operator-visible metrics and alerts.
```

## docs\storage-strategy.md

```markdown
# Frontier Storage Strategy

Frontier uses document metadata separately from document bytes. Metadata lives in `public.documents`; file bytes should live in the private Supabase Storage bucket named `workspace-documents`.

## Path Convention

Storage paths should use:

```text
workspaceId/entityType/entityId/file.ext
```

Examples:

```text
workspace123/client/client456/file.pdf
workspace123/job/job789/photo.jpg
workspace123/invoice/invoice111/document.pdf
```

The workspace id must be the first path segment so storage RLS can isolate files by workspace membership.

## Local-Only Storage Model

Signed-out mode should remain metadata-only. The browser can record file name, MIME type, size, notes, and local client/job links, but it should not pretend that file bytes are durable. This keeps demo/local usage lightweight and avoids browser-only file persistence traps.

## Cloud Storage Add-On Model

Signed-in workspaces should upload bytes to `workspace-documents`, then write a `documents` row with:

- `workspace_id`
- `uploaded_by`
- `client_id`, `job_id`, or `invoice_id`
- `file_name`
- `mime_type`
- `size_bytes`
- `storage_bucket`
- `storage_path`
- `status`

Downloads and previews should use short-lived signed URLs or server routes. Public buckets should not be used for customer documents.

## AI Document Tier Model

AI/OCR should be a later layer on top of durable storage:

1. Upload file bytes.
2. Write document metadata.
3. Create an `ai_jobs` row linked to the document.
4. Extract text or structured data.
5. Present extracted data for human review.
6. Only then create or update clients, jobs, invoices, expenses, or calendar items.

AI should never be the first persistence layer. It should consume stored documents and produce reviewable suggestions.
```

## docs\supabase-env.md

```markdown
# Supabase Environment Setup

Required local and deployment environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` is browser-safe.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is browser-safe.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Never prefix the service role key with `NEXT_PUBLIC_`.
- Never import service-role helpers into client components.

## Auth URLs

Supabase Authentication URL Configuration:

```text
Site URL:
https://frontier-demo.vercel.app

Redirect URLs:
http://localhost:3000/**
https://frontier-demo.vercel.app/**
```

## Promote Platform Admin

Use the commented helper in `supabase/migrations/0004_platform_admin_groundwork.sql`.

Replace only:

```sql
'replace-me@example.com'
```

with the confirmed auth user email, then run it in Supabase SQL Editor.

This is intentionally not exposed in the browser.

## Storage

The private document bucket is:

```text
workspace-documents
```

Intended object path:

```text
workspaceId/userId/timestamp-filename
```

File preview/download is deferred until explicit server-side storage access is implemented.
```

## docs\testing-checklist.md

```markdown
# Frontier Testing Checklist

## Auth

- Create account from `/signup`.
- Confirm the submit button says `Creating account...`.
- Sign in from `/login`.
- Confirm the submit button says `Signing in...`.
- Request reset from `/reset-password`.
- Confirm the submit button says `Sending reset email...`.
- Confirm errors appear as readable text, never raw `{}`.

## Local Fallback

- Sign out.
- Confirm Local Workspace is available.
- Confirm local clients/jobs/invoices still render from localStorage.

## Platform Admin

- Sign in as a user in `public.platform_admins`.
- Open `/frontier-admin`.
- Confirm aggregate cards load.
- Search by email.
- Search by auth user id.
- Search by workspace name or business name.
- Select a user and inspect workspaces.
- Inspect a workspace.
- Confirm read-only sections appear:
  - members
  - clients
  - jobs
  - invoices
  - inventory
  - documents metadata
  - route plans
- Load audit logs.
- Confirm non-admin users receive Access Denied or 403.

## Admin View Mode

- From `/frontier-admin`, click `View As` for a workspace.
- Confirm the app navigates to `/dashboard`.
- Confirm AppShell shows `Admin View Mode`.
- Click `Back to Admin`.
- Click `Exit Admin View`.
- Confirm normal workspace switching still works.

## Documents

- Open Documents.
- Create a metadata-only document.
- Confirm status text shows metadata/storage status.
- Upload a document and confirm OCR status shows `uploaded`.
- Confirm admin console shows document metadata only.
- Confirm no private file contents are exposed.

## Logistics

- Open Logistics with no clients.
- Confirm the map still renders.
- Add/select client locations where available.
- Confirm Google Maps route export is only enabled with at least two stops.
- Save a route plan with multiple stops and confirm it persists.

## Core DB Migration

- Sign out and confirm clients, jobs, invoices, inventory, and calendar still use localStorage fallback.
- Sign in and create a workspace.
- Create a client, refresh, and confirm it persists from Supabase.
- Create a job linked to that client with materials and a scheduled date.
- Open the job detail page and confirm client, materials, date, notes, and status render.
- Open Calendar and confirm the DB-backed scheduled job appears in month, week, and agenda views.
- Open Inventory and confirm scheduled/completed job materials appear as reserved job material rows.
- Add a real inventory item matching a job material and confirm reserved/available/suggested order values update.
- Create an invoice from the job and confirm the job/client link is preserved.
- Open the invoice detail page and confirm print/email controls still render.
- Mark an invoice Paid and confirm Financials revenue/outstanding totals update from Supabase data.
- Switch workspaces and confirm clients, jobs, invoices, inventory, and calendar data are isolated.
- Try opening a client/job/invoice id from a different workspace and confirm it does not load.

## AI/OCR Readiness

- Confirm uploaded documents receive `processing_status = uploaded`.
- Confirm no external AI/OCR request is made.
- Confirm `ai_jobs` can represent future OCR, extraction, voice, logistics, invoice, and client parse jobs.

## Transaction Integrity

- Create and edit an invoice with multiple line items.
- Create and edit a job with multiple materials.
- Save a route plan with multiple stops.
- Confirm failed child-record writes surface readable errors.

## Known Limits

- Admin console is read-only.
- No destructive support tools yet.
- No full document file upload/download/preview yet.
- OCR and AI extraction are not implemented yet.
- Voice/intake parser is intentionally deferred.
```

## docs\transaction-integrity-audit.md

```markdown
# Transaction Integrity Audit

## Fixed This Sprint

### Job create/update

- File: `lib/db/jobs.ts`
- Function: `createJob`, `updateJob`
- Previous risk: job header could save, then material replacement could fail.
- Fix: signed-in job saves now use `public.upsert_job_with_materials(job_payload, materials_payload)` from migration `0011_ai_ocr_logistics_readiness.sql`.
- Result: job row and material replacement run inside one Postgres transaction.

### Route plan create/update

- File: `lib/db/routes.ts`
- Function: `createRoute`, `updateRoute`
- Previous risk: route plan could save without all stops.
- Fix: signed-in route saves now use `public.upsert_route_with_stops(route_payload, stops_payload)`.
- Result: route plan and stop replacement run inside one Postgres transaction.

### Invoice create/update

- File: `lib/db/invoices.ts`
- Function: `createInvoice`, `updateInvoice`
- Previous risk: invoice header could save, then line item replacement could partially fail.
- Fix: signed-in invoice saves now use `public.upsert_invoice_with_lines(invoice_payload, line_items_payload)` from migration `0010_transaction_hardening.sql`.
- Result: invoice row and line item replacement run inside one Postgres transaction.

### Workspace creation

- File: `components/WorkspaceContext.tsx`
- Function: `addWorkspace`
- Previous risk: workspace could be created without owner membership or settings.
- Fix: signed-in workspace creation now uses `public.create_workspace_with_owner(...)`.
- Result: workspace, owner membership, and workspace settings are created atomically.

### Document upload

- File: `app/documents/page.tsx`
- Function: `saveUploadPlaceholder`
- Previous risk: storage object could upload, then metadata insert could fail.
- Fix: failed metadata saves now attempt to remove the uploaded storage object.
- Remaining limitation: browser cleanup can still fail due to network interruption after upload.

## Remaining Transaction Risks

### Document delete

- File: `app/documents/page.tsx`, `app/documents/DocumentAttachments.tsx`
- Function: `deleteDocument`
- Risk: object deletion can succeed, then metadata deletion can fail.
- Severity: Medium.
- Recommended fix: server route or RPC-backed metadata deletion with clear retry state.

## Permission Findings

- Workspace isolation is enforced broadly through `public.is_workspace_member(workspace_id)`.
- Platform admin remains separate through `public.platform_admins`.
- Most workspace business tables still allow broad CRUD for any active workspace member.
- Future hardening should distinguish Owner, Manager, Employee, and portal roles.

## Schema Snapshot

`supabase db dump --schema public` remains blocked unless Docker Desktop is running and reachable by the Supabase CLI on Windows.
```

## docs\voice-next.md

```markdown
# Voice MVP Next

## Goal

Add voice input through the existing action layer while keeping command execution deterministic and reviewable.

## Intended Flow

Record Audio
-> Transcribe with Faster-Whisper
-> Parse Deterministic Command
-> Preview Intended Action
-> Confirm
-> Execute Through Action Layer

## Implementation Notes

- Use Faster-Whisper for transcription when voice work begins.
- Keep transcription and parsing server-side where provider/runtime constraints require it.
- Route all resulting mutations through the existing action layer.
- Start with deterministic command parsing for known commands.
- Add optional AI interpretation later, after deterministic commands are reliable.
- Require confirmation for destructive or high-impact actions.

## Early Command Targets

- Create client.
- Create job.
- Add job note.
- Schedule job.
- Create invoice draft.
- Add expense.

## Safety Rules

- Never execute a destructive voice command without explicit confirmation.
- Show the parsed command before execution.
- Preserve an audit trail for accepted commands.
```

## docs\workflow-integrity-audit.md

```markdown
# Workflow Integrity Audit

## Security Review

Workspace-owned application tables use RLS through `public.is_workspace_member(workspace_id)`. This gives basic tenant isolation for clients, jobs, invoices, inventory, documents, route plans, and calendar events.

Platform admin access is separate from workspace ownership through `public.platform_admins` and `public.is_platform_admin()`. Admin APIs use server-only service-role access and verify platform admin status before returning cross-tenant data.

Storage hardening added in `0009_document_storage_policies.sql` keeps `workspace-documents` private and scopes object access by the first path segment.

## Remaining Security Concerns

- Most workspace tables still grant broad workspace-member CRUD. Owner/Manager/Employee role enforcement should be tightened in RLS or server actions.
- Document file preview/download routes are not implemented yet.
- Settings are still partly localStorage-backed.
- Admin inspection should eventually include explicit support reason/consent metadata.

## Multi-Step Write Risks

- Invoice save: creates/updates invoice, then replaces line items. A line item failure can leave invoice header changes committed.
- Job save: creates/updates job, then replaces job materials. A material failure can leave job header changes committed.
- Workspace creation: creates workspace, membership, then settings from the browser. A later failure can leave partial workspace setup.
- Route creation: creates route plan, then route stops. A stop failure can leave an incomplete route plan.

## Recommended Fix

Move multi-step writes into Postgres RPC functions or server actions that perform the full operation transactionally. The current repository layer should remain as the UI adapter, but the actual grouped writes should become atomic before production launch.
```

## lib\actions\calendar.ts

```typescript
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { ClientCalendarEvent } from "@/lib/db/calendarEvents";

export type CalendarActionsRepository = {
  createEvent: (event: ClientCalendarEvent) => Promise<ClientCalendarEvent | null>;
  updateEvent: (event: ClientCalendarEvent) => Promise<ClientCalendarEvent | null>;
  deleteEvent: (eventId: string, workspaceId?: string) => Promise<boolean>;
};

function validateCalendarEvent(event: ClientCalendarEvent) {
  return {
    ...event,
    workspaceId: requireText(event.workspaceId, "Workspace"),
    title: requireText(event.title, "Event title"),
    date: requireText(event.date, "Event date"),
  };
}

export async function createCalendarEventAction(
  repository: CalendarActionsRepository,
  event: ClientCalendarEvent
): Promise<ActionResult<ClientCalendarEvent>> {
  try {
    const created = await repository.createEvent(validateCalendarEvent(event));
    return created ? ok(created) : fail("Unable to create calendar event.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create calendar event.");
  }
}

export async function updateCalendarEventAction(
  repository: CalendarActionsRepository,
  event: ClientCalendarEvent
): Promise<ActionResult<ClientCalendarEvent>> {
  try {
    requireText(event.id, "Calendar event");
    const updated = await repository.updateEvent(validateCalendarEvent(event));
    return updated ? ok(updated) : fail("Unable to update calendar event.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update calendar event.");
  }
}

export async function deleteCalendarEventAction(
  repository: CalendarActionsRepository,
  eventId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteEvent(
      requireText(eventId, "Calendar event"),
      workspaceId
    );
    return deleted ? ok(true) : fail("Unable to delete calendar event.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete calendar event.");
  }
}

export const createCalendarEvent = createCalendarEventAction;
export const updateCalendarEvent = updateCalendarEventAction;
export const deleteCalendarEvent = deleteCalendarEventAction;
```

## lib\actions\clients.ts

```typescript
import type { ClientRow } from "@/lib/clientTypes";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type ClientActionsRepository = {
  createClient: (client: ClientRow) => Promise<ClientRow | null>;
  updateClient: (client: ClientRow) => Promise<ClientRow | null>;
  deleteClient: (clientId: string, workspaceId?: string) => Promise<boolean>;
};

export async function createClientAction(
  repository: ClientActionsRepository,
  client: ClientRow
): Promise<ActionResult<ClientRow>> {
  try {
    const normalizedClient = {
      ...client,
      name: requireText(client.name, "Client name"),
      workspaceId: requireText(client.workspaceId, "Workspace"),
    };
    const created = await repository.createClient(normalizedClient);
    return created ? ok(created) : fail("Unable to create client.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create client.");
  }
}

export async function updateClientAction(
  repository: ClientActionsRepository,
  client: ClientRow
): Promise<ActionResult<ClientRow>> {
  try {
    requireText(client.id, "Client");
    requireText(client.workspaceId, "Workspace");
    requireText(client.name, "Client name");
    const updated = await repository.updateClient(client);
    return updated ? ok(updated) : fail("Unable to update client.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update client.");
  }
}

export async function deleteClientAction(
  repository: ClientActionsRepository,
  clientId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteClient(
      requireText(clientId, "Client"),
      workspaceId
    );
    return deleted ? ok(true) : fail("Unable to delete client.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete client.");
  }
}

export const createClient = createClientAction;
export const updateClient = updateClientAction;
export const deleteClient = deleteClientAction;
```

## lib\actions\commandTypes.ts

```typescript
import type { ClientRow } from "@/lib/clientTypes";
import type { InventoryRow } from "@/lib/db/inventory";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import type { Workspace } from "@/components/WorkspaceContext";
import type { StoredDocument } from "@/lib/db/documents";
import type { RoutePlan } from "@/lib/db/routes";
import type { ClientCalendarEvent } from "@/lib/db/calendarEvents";

export type FrontierCommandIntent =
  | { name: "client.create"; payload: ClientRow }
  | { name: "client.update"; payload: ClientRow }
  | { name: "client.delete"; payload: { id: string } }
  | { name: "job.create"; payload: Job }
  | { name: "job.update"; payload: Job }
  | { name: "job.delete"; payload: { id: string } }
  | { name: "invoice.create"; payload: InvoiceRow }
  | { name: "invoice.update"; payload: InvoiceRow }
  | { name: "invoice.markPaid"; payload: { id: string } }
  | { name: "inventory.create"; payload: InventoryRow }
  | { name: "inventory.update"; payload: InventoryRow }
  | { name: "inventory.delete"; payload: InventoryRow }
  | { name: "workspace.create"; payload: Workspace }
  | { name: "workspace.update"; payload: Workspace }
  | { name: "document.metadata.create"; payload: StoredDocument }
  | { name: "document.metadata.update"; payload: StoredDocument }
  | { name: "document.metadata.delete"; payload: { id: string } }
  | { name: "route.create"; payload: RoutePlan }
  | { name: "route.update"; payload: RoutePlan }
  | { name: "route.delete"; payload: { id: string } }
  | { name: "calendar.create"; payload: ClientCalendarEvent }
  | { name: "calendar.update"; payload: ClientCalendarEvent }
  | { name: "calendar.delete"; payload: { id: string } };

export type FrontierCommandSource = "gui" | "future-ai" | "future-voice";
```

## lib\actions\documents.ts

```typescript
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { StoredDocument } from "@/lib/db/documents";

export type DocumentActionsRepository = {
  createDocument: (document: StoredDocument) => Promise<StoredDocument | null>;
  updateDocument: (document: StoredDocument) => Promise<StoredDocument | null>;
  deleteDocument: (documentId: string, workspaceId?: string) => Promise<boolean>;
};

function validateDocument(document: StoredDocument) {
  return {
    ...document,
    workspaceId: requireText(document.workspaceId, "Workspace"),
    name: requireText(document.name, "Document name"),
  };
}

export async function createDocumentAction(
  repository: DocumentActionsRepository,
  document: StoredDocument
): Promise<ActionResult<StoredDocument>> {
  try {
    const created = await repository.createDocument(validateDocument(document));
    return created ? ok(created) : fail("Unable to create document metadata.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create document metadata.");
  }
}

export async function updateDocumentAction(
  repository: DocumentActionsRepository,
  document: StoredDocument
): Promise<ActionResult<StoredDocument>> {
  try {
    requireText(document.id, "Document");
    const updated = await repository.updateDocument(validateDocument(document));
    return updated ? ok(updated) : fail("Unable to update document metadata.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update document metadata.");
  }
}

export async function deleteDocumentAction(
  repository: DocumentActionsRepository,
  documentId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteDocument(
      requireText(documentId, "Document"),
      workspaceId
    );
    return deleted ? ok(true) : fail("Unable to delete document metadata.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete document metadata.");
  }
}

export const uploadDocumentMetadata = createDocumentAction;
export const updateDocumentMetadata = updateDocumentAction;
export const deleteDocumentMetadata = deleteDocumentAction;
```

## lib\actions\expenses.ts

```typescript
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { ExpenseRow } from "@/lib/db/expenses";

export type ExpenseActionsRepository = {
  createExpense: (expense: ExpenseRow) => Promise<ExpenseRow | null>;
  updateExpense: (expense: ExpenseRow) => Promise<ExpenseRow | null>;
  deleteExpense: (expense: ExpenseRow) => Promise<boolean>;
};

function validateExpense(expense: ExpenseRow) {
  return {
    ...expense,
    workspaceId: requireText(expense.workspaceId, "Workspace"),
    description: requireText(expense.description, "Expense description"),
    category: requireText(expense.category, "Expense category"),
    amount: requireText(expense.amount, "Expense amount"),
  };
}

export async function createExpenseAction(
  repository: ExpenseActionsRepository,
  expense: ExpenseRow
): Promise<ActionResult<ExpenseRow>> {
  try {
    const created = await repository.createExpense(validateExpense(expense));
    return created ? ok(created) : fail("Unable to create expense.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create expense.");
  }
}

export async function updateExpenseAction(
  repository: ExpenseActionsRepository,
  expense: ExpenseRow
): Promise<ActionResult<ExpenseRow>> {
  try {
    requireText(expense.id, "Expense");
    const updated = await repository.updateExpense(validateExpense(expense));
    return updated ? ok(updated) : fail("Unable to update expense.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update expense.");
  }
}

export async function deleteExpenseAction(
  repository: ExpenseActionsRepository,
  expense: ExpenseRow
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteExpense(validateExpense(expense));
    return deleted ? ok(true) : fail("Unable to delete expense.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete expense.");
  }
}

export const createExpense = createExpenseAction;
export const updateExpense = updateExpenseAction;
export const deleteExpense = deleteExpenseAction;
```

## lib\actions\inventory.ts

```typescript
import type { InventoryRow } from "@/lib/db/inventory";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type InventoryActionsRepository = {
  createInventoryItem: (item: InventoryRow) => Promise<InventoryRow | null>;
  updateInventoryItem: (item: InventoryRow) => Promise<InventoryRow | null>;
  deleteInventoryItem: (item: InventoryRow) => Promise<boolean>;
};

function validateInventoryItem(item: InventoryRow) {
  return {
    ...item,
    workspaceId: requireText(item.workspaceId, "Workspace"),
    name: requireText(item.name, "Item name"),
  };
}

export async function createInventoryItemAction(
  repository: InventoryActionsRepository,
  item: InventoryRow
): Promise<ActionResult<InventoryRow>> {
  try {
    const created = await repository.createInventoryItem(validateInventoryItem(item));
    return created ? ok(created) : fail("Unable to create inventory item.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create inventory item.");
  }
}

export async function updateInventoryItemAction(
  repository: InventoryActionsRepository,
  item: InventoryRow
): Promise<ActionResult<InventoryRow>> {
  try {
    const updated = await repository.updateInventoryItem(validateInventoryItem(item));
    return updated ? ok(updated) : fail("Unable to update inventory item.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update inventory item.");
  }
}

export async function deleteInventoryItemAction(
  repository: InventoryActionsRepository,
  item: InventoryRow
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteInventoryItem(validateInventoryItem(item));
    return deleted ? ok(true) : fail("Unable to delete inventory item.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete inventory item.");
  }
}

export const createInventoryItem = createInventoryItemAction;
export const updateInventoryItem = updateInventoryItemAction;
export const deleteInventoryItem = deleteInventoryItemAction;
```

## lib\actions\invoices.ts

```typescript
import type { InvoiceRow } from "@/lib/frontierInvoices";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type InvoiceActionsRepository = {
  createInvoice: (invoice: InvoiceRow) => Promise<InvoiceRow | null>;
  updateInvoice: (invoice: InvoiceRow) => Promise<InvoiceRow | null>;
  deleteInvoice: (invoiceId: string, workspaceId?: string) => Promise<boolean>;
};

function validateInvoice(invoice: InvoiceRow) {
  return {
    ...invoice,
    workspaceId: requireText(invoice.workspaceId, "Workspace"),
    invoiceNumber: requireText(invoice.invoiceNumber, "Invoice number"),
  };
}

export async function createInvoiceAction(
  repository: InvoiceActionsRepository,
  invoice: InvoiceRow
): Promise<ActionResult<InvoiceRow>> {
  try {
    const created = await repository.createInvoice(validateInvoice(invoice));
    return created ? ok(created) : fail("Unable to create invoice.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create invoice.");
  }
}

export async function updateInvoiceAction(
  repository: InvoiceActionsRepository,
  invoice: InvoiceRow
): Promise<ActionResult<InvoiceRow>> {
  try {
    requireText(invoice.id, "Invoice");
    const updated = await repository.updateInvoice(validateInvoice(invoice));
    return updated ? ok(updated) : fail("Unable to update invoice.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update invoice.");
  }
}

export async function markInvoicePaid(
  repository: InvoiceActionsRepository,
  invoice: InvoiceRow
): Promise<ActionResult<InvoiceRow>> {
  return updateInvoiceAction(repository, {
    ...invoice,
    status: "Paid",
  });
}

export async function deleteInvoiceAction(
  repository: InvoiceActionsRepository,
  invoiceId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteInvoice(
      requireText(invoiceId, "Invoice"),
      workspaceId
    );
    return deleted ? ok(true) : fail("Unable to delete invoice.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete invoice.");
  }
}

export const createInvoice = createInvoiceAction;
export const updateInvoice = updateInvoiceAction;
export const deleteInvoice = deleteInvoiceAction;
```

## lib\actions\jobs.ts

```typescript
import type { Job } from "@/lib/jobTypes";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type JobActionsRepository = {
  createJob: (job: Job) => Promise<Job | null>;
  updateJob: (jobId: string, job: Job) => Promise<Job | null>;
  deleteJob: (jobId: string, workspaceId?: string) => Promise<boolean>;
};

function validateJob(job: Job) {
  return {
    ...job,
    workspaceId: requireText(job.workspaceId, "Workspace"),
    name: requireText(job.name, "Job name"),
  };
}

export async function createJobAction(
  repository: JobActionsRepository,
  job: Job
): Promise<ActionResult<Job>> {
  try {
    const created = await repository.createJob(validateJob(job));
    return created ? ok(created) : fail("Unable to create job.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create job.");
  }
}

export async function updateJobAction(
  repository: JobActionsRepository,
  job: Job
): Promise<ActionResult<Job>> {
  try {
    requireText(job.id, "Job");
    const updated = await repository.updateJob(job.id, validateJob(job));
    return updated ? ok(updated) : fail("Unable to update job.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update job.");
  }
}

export async function deleteJobAction(
  repository: JobActionsRepository,
  jobId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteJob(requireText(jobId, "Job"), workspaceId);
    return deleted ? ok(true) : fail("Unable to delete job.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete job.");
  }
}

export const createJob = createJobAction;
export const updateJob = updateJobAction;
export const deleteJob = deleteJobAction;
```

## lib\actions\routes.ts

```typescript
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { RoutePlan } from "@/lib/db/routes";

export type RouteActionsRepository = {
  createRoute: (route: RoutePlan) => Promise<RoutePlan | null>;
  updateRoute: (route: RoutePlan) => Promise<RoutePlan | null>;
  deleteRoute: (routeId: string, workspaceId?: string) => Promise<boolean>;
};

function validateRoute(route: RoutePlan) {
  return {
    ...route,
    workspaceId: requireText(route.workspaceId, "Workspace"),
    name: requireText(route.name, "Route name"),
  };
}

export async function createRoutePlanAction(
  repository: RouteActionsRepository,
  route: RoutePlan
): Promise<ActionResult<RoutePlan>> {
  try {
    const created = await repository.createRoute(validateRoute(route));
    return created ? ok(created) : fail("Unable to create route plan.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create route plan.");
  }
}

export async function updateRoutePlanAction(
  repository: RouteActionsRepository,
  route: RoutePlan
): Promise<ActionResult<RoutePlan>> {
  try {
    requireText(route.id, "Route");
    const updated = await repository.updateRoute(validateRoute(route));
    return updated ? ok(updated) : fail("Unable to update route plan.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update route plan.");
  }
}

export async function deleteRoutePlanAction(
  repository: RouteActionsRepository,
  routeId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteRoute(requireText(routeId, "Route"), workspaceId);
    return deleted ? ok(true) : fail("Unable to delete route plan.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete route plan.");
  }
}

export const createRoutePlan = createRoutePlanAction;
export const updateRoutePlan = updateRoutePlanAction;
export const deleteRoutePlan = deleteRoutePlanAction;
```

## lib\actions\shared.ts

```typescript
export type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): ActionResult<T> {
  return { ok: false, error };
}

export function requireText(value: string | undefined, label: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
}
```

## lib\actions\workspaces.ts

```typescript
import type { Workspace } from "@/components/WorkspaceContext";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type WorkspaceActionsRepository = {
  addWorkspace: (workspace: Workspace) => boolean | void | Promise<boolean | void>;
  updateWorkspace?: (workspace: Workspace) => Workspace | Promise<Workspace>;
  deleteWorkspace?: (workspaceId: string) => boolean | Promise<boolean>;
  setActiveWorkspace?: (workspace: Workspace) => void;
};

export async function createWorkspaceAction(
  repository: WorkspaceActionsRepository,
  workspace: Workspace
): Promise<ActionResult<Workspace>> {
  try {
    const normalizedWorkspace = {
      ...workspace,
      name: requireText(workspace.name, "Workspace name"),
      type: requireText(workspace.type, "Workspace type"),
    };
    await repository.addWorkspace(normalizedWorkspace);
    return ok(normalizedWorkspace);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create workspace.");
  }
}

export async function updateWorkspaceAction(
  repository: WorkspaceActionsRepository,
  workspace: Workspace
): Promise<ActionResult<Workspace>> {
  try {
    const normalizedWorkspace = {
      ...workspace,
      name: requireText(workspace.name, "Workspace name"),
      type: requireText(workspace.type, "Workspace type"),
    };
    const updated = repository.updateWorkspace
      ? await repository.updateWorkspace(normalizedWorkspace)
      : normalizedWorkspace;
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update workspace.");
  }
}

export async function deleteWorkspaceAction(
  repository: WorkspaceActionsRepository,
  workspaceId: string
): Promise<ActionResult<boolean>> {
  try {
    if (!repository.deleteWorkspace) return fail("Workspace deletion is not available here.");
    const deleted = await repository.deleteWorkspace(requireText(workspaceId, "Workspace"));
    return deleted ? ok(true) : fail("Unable to delete workspace.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete workspace.");
  }
}

export const createWorkspace = createWorkspaceAction;
export const updateWorkspace = updateWorkspaceAction;
export const deleteWorkspace = deleteWorkspaceAction;
```

## lib\ai\actionDrafts.ts

```typescript
import type { AiActionType, DraftPayload, SuggestedAction } from "@/lib/ai/types";

export const ALLOWED_AI_ACTION_TYPES = [
  "create_client",
  "update_client",
  "create_job",
  "update_job",
  "create_invoice",
  "update_invoice",
  "create_expense",
  "update_inventory",
  "create_material_allocation",
  "create_calendar_event",
] as const satisfies readonly AiActionType[];

export const DESTRUCTIVE_AI_ACTION_TYPES = [
  "delete_client",
  "delete_job",
  "delete_invoice",
  "delete_expense",
  "delete_inventory",
  "delete_calendar_event",
] as const;

export function isAllowedAiActionType(value: string): value is AiActionType {
  return ALLOWED_AI_ACTION_TYPES.includes(value as AiActionType);
}

export function createSuggestedAction<TPayload extends DraftPayload>(
  type: AiActionType,
  payload: TPayload,
  confidence: number
): SuggestedAction<TPayload> {
  return {
    type,
    payload,
    confidence,
  };
}
```

## lib\ai\documentInterpreter.ts

```typescript
import { createSuggestedAction } from "@/lib/ai/actionDrafts";
import { createReviewDraft, type ReviewDraft } from "@/lib/ai/reviewTypes";
import {
  validateInterpretationResult,
  type AiValidationHooks,
} from "@/lib/ai/validators";
import type { InterpretationInput, InterpretationResult } from "@/lib/ai/types";

export type DocumentInterpretationInput = Omit<
  InterpretationInput,
  "sourceType"
> & {
  documentId?: string;
};

function extractCurrency(text: string) {
  const match = text.match(/\$?\b(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\b/);
  if (!match) return undefined;
  return Number(match[1].replace(/,/g, ""));
}

function extractVendor(text: string) {
  const firstUsefulLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 2 && !/invoice|receipt/i.test(line));
  return firstUsefulLine;
}

export async function interpretDocument(
  input: DocumentInterpretationInput,
  hooks: AiValidationHooks = {}
): Promise<{ result: InterpretationResult; reviewDraft: ReviewDraft }> {
  const amount = extractCurrency(input.text);
  const vendor = extractVendor(input.text);
  const warnings = [];

  const actions = amount
    ? [
        createSuggestedAction(
          "create_expense",
          {
            amount,
            vendor: vendor ?? "Unknown vendor",
            documentId: input.documentId ?? input.sourceId ?? "",
            notes: "Mock OCR interpretation draft. Requires human review.",
          },
          vendor ? 0.72 : 0.61
        ),
      ]
    : [];

  if (!amount) {
    warnings.push({
      code: "missing_required_field" as const,
      message: "No expense amount was detected in the OCR text.",
      path: "actions.create_expense.payload.amount",
    });
  }

  const result: InterpretationResult = {
    sourceType: "ocr",
    sourceId: input.documentId ?? input.sourceId,
    workspaceId: input.workspaceId,
    confidence: actions.length ? 0.68 : 0.35,
    warnings,
    actions,
  };

  const validation = await validateInterpretationResult(result, hooks);
  const resultWithValidation = {
    ...result,
    warnings: validation.warnings,
  };

  return {
    result: resultWithValidation,
    reviewDraft: createReviewDraft(resultWithValidation),
  };
}
```

## lib\ai\executeReviewDraft.ts

```typescript
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createClientAction, type ClientActionsRepository } from "@/lib/actions/clients";
import { createExpenseAction, type ExpenseActionsRepository } from "@/lib/actions/expenses";
import { createInvoiceAction, type InvoiceActionsRepository } from "@/lib/actions/invoices";
import { createJobAction, type JobActionsRepository } from "@/lib/actions/jobs";
import type { SuggestedAction } from "@/lib/ai/types";
import type { ClientRow } from "@/lib/clientTypes";
import type { AiReviewDraft } from "@/lib/db/aiReviewDrafts";
import type { ExpenseRow } from "@/lib/db/expenses";
import type { InvoiceLineItem, InvoiceRow, InvoiceStatus } from "@/lib/frontierInvoices";
import type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";

export type ReviewDraftExecutionResult = {
  executedActions: Array<{
    type: string;
    recordId: string;
    label: string;
  }>;
};

type ExecuteReviewDraftInput = {
  draft: AiReviewDraft;
  serviceClient: SupabaseClient;
};

const executableActionTypes = new Set([
  "create_client",
  "update_client",
  "create_job",
  "update_job",
  "create_invoice",
  "update_invoice",
  "create_expense",
  "update_inventory",
  "create_calendar_event",
]);

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalTextValue(value: unknown) {
  const text = textValue(value);
  return text || "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const numericValue = Number(value.replace(/[$,%\s,]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  return 0;
}

function dateValue(value: unknown) {
  const text = textValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function statusValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
) {
  const text = textValue(value);
  return allowed.includes(text as T) ? (text as T) : fallback;
}

function moneyStringToCents(value: unknown) {
  return Math.round(numberValue(value) * 100);
}

function centsToMoneyString(value: number | null | undefined) {
  const cents = Number.isFinite(value) ? value ?? 0 : 0;
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function mapDatabaseClientToClientRow(client: {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}): ClientRow {
  const balanceCents = client.balance_cents ?? 0;
  return {
    id: client.id,
    workspaceId: client.workspace_id,
    name: client.name,
    status: client.status,
    balance: centsToMoneyString(balanceCents),
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    zip: client.zip ?? "",
    notes: client.notes ?? "",
    latitude: client.latitude ?? undefined,
    longitude: client.longitude ?? undefined,
  };
}

function mapDatabaseExpenseToExpenseRow(expense: {
  id: string;
  workspace_id: string;
  description: string;
  category: string;
  amount_cents: number;
}): ExpenseRow {
  return {
    id: expense.id,
    workspaceId: expense.workspace_id,
    description: expense.description,
    category: expense.category,
    amount: centsToMoneyString(expense.amount_cents),
  };
}

function mapDatabaseJobToJob(row: {
  id: string;
  workspace_id: string;
  client_id: string | null;
  client_name_snapshot: string | null;
  name: string;
  status: JobStatus;
  estimated_value_cents: number;
  scheduled_date: string | null;
  notes: string | null;
  job_materials?: Array<{ name: string; quantity: number }>;
}): Job {
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
    materials: (row.job_materials ?? []).map((material) => ({
      name: material.name,
      quantity: Number(material.quantity),
    })),
  };
}

function mapDatabaseInvoiceToInvoice(row: {
  id: string;
  workspace_id: string;
  client_id: string | null;
  job_id: string | null;
  invoice_number: string;
  invoice_date: string;
  company_name: string | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  company_phone: string | null;
  company_email: string | null;
  bill_to_name: string | null;
  bill_to_company: string | null;
  bill_to_address: string | null;
  bill_to_city: string | null;
  bill_to_state: string | null;
  bill_to_zip: string | null;
  bill_to_phone: string | null;
  bill_to_email: string | null;
  discount_type: InvoiceRow["discountType"];
  discount_value: number;
  tax_rate: number;
  footer_message: string | null;
  contact_message: string | null;
  status: InvoiceStatus;
  invoice_line_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price_cents: number;
    sort_order: number;
  }>;
}): InvoiceRow {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    jobId: row.job_id ?? undefined,
    sourceClientId: row.client_id ?? undefined,
    companyName: row.company_name ?? "",
    companyAddress: row.company_address ?? "",
    companyCity: row.company_city ?? "",
    companyState: row.company_state ?? "",
    companyZip: row.company_zip ?? "",
    companyPhone: row.company_phone ?? "",
    companyEmail: row.company_email ?? "",
    billToName: row.bill_to_name ?? "",
    billToCompany: row.bill_to_company ?? "",
    billToAddress: row.bill_to_address ?? "",
    billToCity: row.bill_to_city ?? "",
    billToState: row.bill_to_state ?? "",
    billToZip: row.bill_to_zip ?? "",
    billToPhone: row.bill_to_phone ?? "",
    billToEmail: row.bill_to_email ?? "",
    lineItems: (row.invoice_line_items ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((line) => ({
        id: line.id,
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: centsToMoneyString(line.unit_price_cents),
      })),
    discountType: row.discount_type,
    discountValue: String(row.discount_value ?? 0),
    taxRate: String(row.tax_rate ?? 0),
    footerMessage: row.footer_message ?? "",
    contactMessage: row.contact_message ?? "",
    status: row.status,
  };
}

function createServerClientRepository(
  serviceClient: SupabaseClient
): ClientActionsRepository {
  return {
    async createClient(client) {
      const { data, error } = await serviceClient
        .from("clients")
        .insert({
          id: client.id,
          workspace_id: client.workspaceId,
          name: client.name,
          status: client.status,
          balance_cents: moneyStringToCents(client.balance),
          email: client.email?.trim() || null,
          phone: client.phone?.trim() || null,
          address: client.address?.trim() || null,
          city: client.city?.trim() || null,
          state: client.state?.trim() || null,
          zip: client.zip?.trim() || null,
          notes: client.notes?.trim() || null,
          latitude: client.latitude ?? null,
          longitude: client.longitude ?? null,
        })
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .single();

      if (error || !data) {
        throw new Error(error?.message || "Unable to create client.");
      }

      return mapDatabaseClientToClientRow(data);
    },
    async updateClient() {
      throw new Error("update_client execution is not enabled yet.");
    },
    async deleteClient() {
      throw new Error("delete_client execution is forbidden.");
    },
  };
}

function createServerExpenseRepository(
  serviceClient: SupabaseClient
): ExpenseActionsRepository {
  return {
    async createExpense(expense) {
      const { data, error } = await serviceClient
        .from("expenses")
        .insert({
          id: expense.id,
          workspace_id: expense.workspaceId,
          description: expense.description,
          category: expense.category,
          amount_cents: moneyStringToCents(expense.amount),
          expense_date: null,
          notes: null,
        })
        .select("*")
        .single();

      if (error || !data) throw new Error(error?.message || "Unable to create expense.");
      return mapDatabaseExpenseToExpenseRow(data);
    },
    async updateExpense() {
      throw new Error("update_expense execution is not enabled yet.");
    },
    async deleteExpense() {
      throw new Error("delete_expense execution is forbidden.");
    },
  };
}

function createServerJobRepository(
  serviceClient: SupabaseClient
): JobActionsRepository {
  return {
    async createJob(job) {
      const { data: insertedJob, error: jobError } = await serviceClient
        .from("jobs")
        .insert({
          id: job.id,
          workspace_id: job.workspaceId,
          client_id: job.clientId ?? null,
          client_name_snapshot: job.client || null,
          name: job.name,
          status: job.status,
          estimated_value_cents: moneyStringToCents(job.value),
          scheduled_date: job.date || null,
          notes: job.notes?.trim() || null,
        })
        .select("*")
        .single();

      if (jobError || !insertedJob) {
        throw new Error(jobError?.message || "Unable to create job.");
      }

      try {
        if (job.materials.length > 0) {
          const { error: materialsError } = await serviceClient
            .from("job_materials")
            .insert(
              job.materials.map((material) => ({
                workspace_id: job.workspaceId,
                job_id: insertedJob.id,
                name: material.name,
                quantity: material.quantity,
              }))
            );
          if (materialsError) throw materialsError;
        }
      } catch (error) {
        await serviceClient.from("jobs").delete().eq("id", insertedJob.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("jobs")
        .select("*, job_materials(*)")
        .eq("id", insertedJob.id)
        .single();

      if (error || !data) throw new Error(error?.message || "Unable to load job.");
      return mapDatabaseJobToJob(data);
    },
    async updateJob() {
      throw new Error("update_job execution is not enabled yet.");
    },
    async deleteJob() {
      throw new Error("delete_job execution is forbidden.");
    },
  };
}

function createServerInvoiceRepository(
  serviceClient: SupabaseClient
): InvoiceActionsRepository {
  return {
    async createInvoice(invoice) {
      const { data: insertedInvoice, error: invoiceError } = await serviceClient
        .from("invoices")
        .insert({
          id: invoice.id,
          workspace_id: invoice.workspaceId,
          client_id: invoice.sourceClientId ?? null,
          job_id: invoice.jobId ?? null,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.invoiceDate,
          company_name: invoice.companyName || null,
          company_address: invoice.companyAddress || null,
          company_city: invoice.companyCity || null,
          company_state: invoice.companyState || null,
          company_zip: invoice.companyZip || null,
          company_phone: invoice.companyPhone || null,
          company_email: invoice.companyEmail || null,
          bill_to_name: invoice.billToName || null,
          bill_to_company: invoice.billToCompany || null,
          bill_to_address: invoice.billToAddress || null,
          bill_to_city: invoice.billToCity || null,
          bill_to_state: invoice.billToState || null,
          bill_to_zip: invoice.billToZip || null,
          bill_to_phone: invoice.billToPhone || null,
          bill_to_email: invoice.billToEmail || null,
          discount_type: invoice.discountType,
          discount_value: numberValue(invoice.discountValue),
          tax_rate: numberValue(invoice.taxRate),
          footer_message: invoice.footerMessage || null,
          contact_message: invoice.contactMessage || null,
          status: invoice.status,
        })
        .select("*")
        .single();

      if (invoiceError || !insertedInvoice) {
        throw new Error(invoiceError?.message || "Unable to create invoice.");
      }

      try {
        if (invoice.lineItems.length > 0) {
          const { error: linesError } = await serviceClient
            .from("invoice_line_items")
            .insert(
              invoice.lineItems.map((line, index) => ({
                id: line.id,
                workspace_id: invoice.workspaceId,
                invoice_id: insertedInvoice.id,
                description: line.description,
                quantity: line.quantity,
                unit_price_cents: moneyStringToCents(line.unitPrice),
                sort_order: index,
              }))
            );
          if (linesError) throw linesError;
        }
      } catch (error) {
        await serviceClient.from("invoices").delete().eq("id", insertedInvoice.id);
        throw error;
      }

      const { data, error } = await serviceClient
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", insertedInvoice.id)
        .single();

      if (error || !data) throw new Error(error?.message || "Unable to load invoice.");
      return mapDatabaseInvoiceToInvoice(data);
    },
    async updateInvoice() {
      throw new Error("update_invoice execution is not enabled yet.");
    },
    async deleteInvoice() {
      throw new Error("delete_invoice execution is forbidden.");
    },
  };
}

function validateAction(action: SuggestedAction) {
  if (!executableActionTypes.has(action.type)) {
    throw new Error(`Action type ${action.type} is not allowed for execution.`);
  }
  if (action.type.startsWith("delete_")) {
    throw new Error("Delete actions are forbidden.");
  }
  if (
    action.type !== "create_client" &&
    action.type !== "create_expense" &&
    action.type !== "create_job" &&
    action.type !== "create_invoice"
  ) {
    throw new Error(`${action.type} execution is not enabled yet.`);
  }
}

async function executeCreateClient(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const name = textValue(payload.name);
  if (!name) throw new Error("Client name is required.");

  const client: ClientRow = {
    id: crypto.randomUUID(),
    workspaceId,
    name,
    status: optionalTextValue(payload.status) || "Active",
    balance: String(numberValue(payload.balance)),
    email: optionalTextValue(payload.email),
    phone: optionalTextValue(payload.phone),
    address: optionalTextValue(payload.address),
    city: optionalTextValue(payload.city),
    state: optionalTextValue(payload.state),
    zip: optionalTextValue(payload.zip),
    notes: optionalTextValue(payload.notes),
  };

  const result = await createClientAction(
    createServerClientRepository(serviceClient),
    client
  );

  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.name,
  };
}

async function executeCreateExpense(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const description =
    textValue(payload.description) ||
    textValue(payload.vendor) ||
    textValue(payload.name) ||
    "AI expense";
  const amount = numberValue(payload.amount);
  if (amount <= 0) throw new Error("Expense amount is required.");

  const expense: ExpenseRow = {
    id: crypto.randomUUID(),
    workspaceId,
    description,
    category: optionalTextValue(payload.category) || "AI Review",
    amount: String(amount),
  };

  const result = await createExpenseAction(
    createServerExpenseRepository(serviceClient),
    expense
  );

  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id ?? "",
    label: result.data.description,
  };
}

async function findClientByName(
  serviceClient: SupabaseClient,
  workspaceId: string,
  name: string
) {
  if (!name) return null;
  const { data, error } = await serviceClient
    .from("clients")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to match client.");
  return data as { id: string; name: string } | null;
}

function materialsFromPayload(value: unknown): JobMaterial[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") {
        return { name: item.trim(), quantity: 1 };
      }
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        return {
          name: textValue(record.name),
          quantity: numberValue(record.quantity) || 1,
        };
      }
      return { name: "", quantity: 0 };
    })
    .filter((item) => item.name);
}

async function executeCreateJob(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const name = textValue(payload.name) || textValue(payload.title);
  if (!name) throw new Error("Job name is required.");

  const matchedClient = await findClientByName(
    serviceClient,
    workspaceId,
    textValue(payload.clientName) || textValue(payload.client)
  );

  const job: Job = {
    id: crypto.randomUUID(),
    workspaceId,
    clientId: matchedClient?.id,
    client: matchedClient?.name ?? optionalTextValue(payload.clientName),
    name,
    status: statusValue(
      payload.status,
      ["Lead", "Quoted", "Scheduled", "Completed", "Paid"] as const,
      "Lead"
    ),
    value: String(numberValue(payload.value) || numberValue(payload.amount)),
    date: dateValue(payload.date) || dateValue(payload.scheduledDate),
    materials: materialsFromPayload(payload.materials),
    notes: optionalTextValue(payload.notes),
  };

  const result = await createJobAction(createServerJobRepository(serviceClient), job);
  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.name,
  };
}

function lineItemsFromPayload(payload: Record<string, unknown>): InvoiceLineItem[] {
  const rawLineItems = Array.isArray(payload.lineItems) ? payload.lineItems : [];
  const lineItems = rawLineItems
    .map((item) => {
      if (typeof item === "string") {
        return {
          id: crypto.randomUUID(),
          description: item.trim(),
          quantity: 1,
          unitPrice: "0",
        };
      }
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        return {
          id: crypto.randomUUID(),
          description: textValue(record.description) || textValue(record.name),
          quantity: numberValue(record.quantity) || 1,
          unitPrice: String(
            numberValue(record.unitPrice) ||
              numberValue(record.price) ||
              numberValue(record.amount)
          ),
        };
      }
      return null;
    })
    .filter((item): item is InvoiceLineItem => Boolean(item?.description));

  if (lineItems.length > 0) return lineItems;

  const description = textValue(payload.description) || "AI invoice item";
  return [
    {
      id: crypto.randomUUID(),
      description,
      quantity: 1,
      unitPrice: String(numberValue(payload.amount)),
    },
  ];
}

async function executeCreateInvoice(
  serviceClient: SupabaseClient,
  workspaceId: string,
  action: SuggestedAction
) {
  const payload = action.payload;
  const matchedClient = await findClientByName(
    serviceClient,
    workspaceId,
    textValue(payload.clientName) || textValue(payload.client)
  );
  const invoiceDate = dateValue(payload.invoiceDate) || new Date().toISOString().slice(0, 10);
  const invoice: InvoiceRow = {
    id: crypto.randomUUID(),
    workspaceId,
    invoiceNumber:
      textValue(payload.invoiceNumber) || `INV-AI-${Date.now().toString(36).toUpperCase()}`,
    invoiceDate,
    sourceClientId: matchedClient?.id,
    jobId: textValue(payload.jobId) || undefined,
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZip: "",
    companyPhone: "",
    companyEmail: "",
    billToName: matchedClient?.name ?? optionalTextValue(payload.clientName),
    billToCompany: "",
    billToAddress: "",
    billToCity: "",
    billToState: "",
    billToZip: "",
    billToPhone: "",
    billToEmail: "",
    lineItems: lineItemsFromPayload(payload),
    discountType: "None",
    discountValue: "0",
    taxRate: String(numberValue(payload.taxRate)),
    footerMessage: "",
    contactMessage: "",
    status: "Draft",
  };

  const result = await createInvoiceAction(
    createServerInvoiceRepository(serviceClient),
    invoice
  );
  if (!result.ok) throw new Error(result.error);
  return {
    type: action.type,
    recordId: result.data.id,
    label: result.data.invoiceNumber,
  };
}

export async function executeReviewDraft({
  draft,
  serviceClient,
}: ExecuteReviewDraftInput): Promise<ReviewDraftExecutionResult> {
  if (draft.status !== "Approved") {
    throw new Error("Only approved review drafts can be executed.");
  }
  if (draft.executionStatus === "Executed") {
    throw new Error("Review draft has already been executed.");
  }
  if (draft.actions.length !== 1) {
    throw new Error("Execution currently requires exactly one action draft.");
  }

  const action = draft.actions[0];
  validateAction(action);
  const executedAction =
    action.type === "create_client"
      ? await executeCreateClient(serviceClient, draft.workspaceId, action)
      : action.type === "create_expense"
        ? await executeCreateExpense(serviceClient, draft.workspaceId, action)
        : action.type === "create_job"
          ? await executeCreateJob(serviceClient, draft.workspaceId, action)
          : await executeCreateInvoice(serviceClient, draft.workspaceId, action);

  return {
    executedActions: [executedAction],
  };
}
```

## lib\ai\formHydration.ts

```typescript
import type { AiActionType, AiSourceType, DraftPayload, SuggestedAction } from "@/lib/ai/types";

export type AiFormTarget = "client" | "job" | "invoice" | "expense" | "material";

export type AiFormHydration = {
  workspaceId: string;
  reviewDraftId: string;
  sourceId?: string;
  sourceType: AiSourceType;
  target: AiFormTarget;
  actionType: AiActionType;
  payload: DraftPayload;
};

const STORAGE_KEY = "frontier-ai-form-hydration";

const ACTION_TARGETS: Partial<Record<AiActionType, AiFormTarget>> = {
  create_client: "client",
  create_job: "job",
  create_invoice: "invoice",
  create_expense: "expense",
  update_inventory: "material",
  create_material_allocation: "material",
};

export function getAiFormTarget(action: SuggestedAction) {
  return ACTION_TARGETS[action.type] ?? null;
}

export function saveAiFormHydration(
  draft: Pick<AiFormHydration, "workspaceId" | "reviewDraftId" | "sourceId" | "sourceType">,
  action: SuggestedAction
) {
  const target = getAiFormTarget(action);
  if (!target || typeof window === "undefined") return null;

  const hydration: AiFormHydration = {
    ...draft,
    target,
    actionType: action.type,
    payload: action.payload,
  };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hydration));
  return hydration;
}

export function consumeAiFormHydration(
  target: AiFormTarget,
  workspaceId: string
) {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const hydration = JSON.parse(raw) as AiFormHydration;
    if (hydration.target !== target || hydration.workspaceId !== workspaceId) {
      return null;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
    return hydration;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function payloadString(payload: DraftPayload, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

export function payloadNumber(payload: DraftPayload, key: string) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
```

## lib\ai\parserContract.ts

```typescript
export const FRONTIER_COMPACT_AI_PARSER_CONTRACT =
  "You parse contractor ops input into safe Frontier drafts. Return JSON only. Never execute. Do not guess clients/jobs/vendors/materials/dates. Fuzzy/single matches are candidates only. Ask for clarification when identity/date/cost/mode is uncertain. Ignore filler/prompt echoes. Never use action words as names. Preserve source text." as const;
```

## lib\ai\providers\jsonExtraction.ts

```typescript
import "server-only";

import { AiProviderError } from "@/lib/ai/providers/types";

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new AiProviderError("invalid_json", "AI provider returned an empty response.");
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new AiProviderError("invalid_json", "AI provider did not return JSON.");
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch (error) {
    throw new AiProviderError(
      "invalid_json",
      error instanceof Error ? error.message : "AI provider JSON parsing failed."
    );
  }
}
```

## lib\ai\providers\openaiProvider.ts

```typescript
import "server-only";

import { extractJsonObject } from "@/lib/ai/providers/jsonExtraction";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderRequest,
} from "@/lib/ai/providers/types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export function createOpenAiProvider(): AiProviderClient {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiProviderError("missing_config", "OpenAI is not configured.");
  }

  return {
    name: "openai",
    async completeJson(request: AiProviderRequest) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        request.timeoutMs ?? 20000
      );

      const userContent = request.imageDataUrl
        ? [
            { type: "text", text: request.userPrompt },
            { type: "image_url", image_url: { url: request.imageDataUrl } },
          ]
        : request.userPrompt;

      try {
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: request.model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 220,
          }),
        });

        if (!response.ok) {
          throw new AiProviderError("provider_failed", "OpenAI request failed.");
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        return extractJsonObject(data.choices?.[0]?.message?.content ?? "");
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new AiProviderError("timeout", "OpenAI request timed out.");
        }
        throw new AiProviderError("provider_failed", "OpenAI request failed.");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
```

## lib\ai\providers\openrouterProvider.ts

```typescript
import "server-only";

import { extractJsonObject } from "@/lib/ai/providers/jsonExtraction";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderRequest,
} from "@/lib/ai/providers/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function createOpenRouterProvider(): AiProviderClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AiProviderError("missing_config", "OpenRouter is not configured.");
  }

  return {
    name: "openrouter",
    async completeJson(request: AiProviderRequest) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        request.timeoutMs ?? 20000
      );

      const userContent = request.imageDataUrl
        ? [
            { type: "text", text: request.userPrompt },
            { type: "image_url", image_url: { url: request.imageDataUrl } },
          ]
        : request.userPrompt;

      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Frontier AI Interpretation",
          },
          body: JSON.stringify({
            model: request.model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 220,
          }),
        });

        if (!response.ok) {
          throw new AiProviderError("provider_failed", "OpenRouter request failed.");
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        return extractJsonObject(data.choices?.[0]?.message?.content ?? "");
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new AiProviderError("timeout", "OpenRouter request timed out.");
        }
        throw new AiProviderError("provider_failed", "OpenRouter request failed.");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
```

## lib\ai\providers\providerFactory.ts

```typescript
import "server-only";

import { createReviewDraft } from "@/lib/ai/reviewTypes";
import type { InterpretationResult, SuggestedAction } from "@/lib/ai/types";
import { validateInterpretationResult } from "@/lib/ai/validators";
import { createOpenAiProvider } from "@/lib/ai/providers/openaiProvider";
import { createOpenRouterProvider } from "@/lib/ai/providers/openrouterProvider";
import {
  buildImageAnalysisUserPrompt,
  buildInterpretationUserPrompt,
  AI_JSON_SYSTEM_PROMPT,
} from "@/lib/ai/providers/systemPrompts";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderName,
  type ProviderImageInterpretationInput,
  type ProviderInterpretationInput,
  type ProviderInterpretationOutput,
  type TextAiSourceType,
} from "@/lib/ai/providers/types";

function normalizeProviderName(value: string | undefined): AiProviderName | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "openrouter" || normalized === "openai") return normalized;
  return undefined;
}

function createProvider(name: AiProviderName): AiProviderClient {
  if (name === "openrouter") return createOpenRouterProvider();
  return createOpenAiProvider();
}

function getPrimaryConfig() {
  const provider = normalizeProviderName(process.env.AI_PROVIDER);
  const model = process.env.AI_MODEL_TEXT?.trim();
  if (!provider || !model) {
    throw new AiProviderError("missing_config", "Primary AI provider is not configured.");
  }
  return { provider, model };
}

function getFallbackConfig() {
  const provider = normalizeProviderName(process.env.AI_FALLBACK_PROVIDER);
  const model = process.env.AI_MODEL_FALLBACK?.trim();
  if (!provider || !model) return undefined;
  return { provider, model };
}

function getVisionConfig() {
  const provider = normalizeProviderName(process.env.AI_PROVIDER);
  const model = process.env.AI_MODEL_VISION?.trim();
  if (!provider || !model) {
    throw new AiProviderError("missing_config", "Vision AI provider is not configured.");
  }
  return { provider, model };
}

function toActions(value: unknown): SuggestedAction[] {
  if (!Array.isArray(value)) return [];
  return value.filter((action): action is SuggestedAction => {
    return (
      typeof action === "object" &&
      action !== null &&
      typeof (action as SuggestedAction).type === "string" &&
      typeof (action as SuggestedAction).confidence === "number" &&
      typeof (action as SuggestedAction).payload === "object" &&
      (action as SuggestedAction).payload !== null
    );
  });
}

function toWarnings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((warning) => {
      if (typeof warning === "string") {
        return { code: "needs_human_review" as const, message: warning };
      }
      if (
        typeof warning === "object" &&
        warning !== null &&
        typeof (warning as { message?: unknown }).message === "string"
      ) {
        return {
          code: "needs_human_review" as const,
          message: (warning as { message: string }).message,
        };
      }
      return undefined;
    })
    .filter((warning): warning is { code: "needs_human_review"; message: string } =>
      Boolean(warning)
    );
}

async function runProvider(
  provider: AiProviderClient,
  model: string,
  input: ProviderInterpretationInput,
  usedFallback: boolean
): Promise<ProviderInterpretationOutput> {
  const raw = (await provider.completeJson({
    model,
    systemPrompt: AI_JSON_SYSTEM_PROMPT,
    userPrompt: buildInterpretationUserPrompt({
      sourceType: input.sourceType,
      text: input.text,
    }),
  })) as {
    confidence?: unknown;
    warnings?: unknown;
    actions?: unknown;
  };

  const result: InterpretationResult = {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    workspaceId: input.workspaceId,
    confidence:
      typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
        ? raw.confidence
        : 0.5,
    warnings: toWarnings(raw.warnings),
    actions: toActions(raw.actions),
  };

  const validation = await validateInterpretationResult(result);
  const validatedResult = {
    ...result,
    warnings: validation.warnings,
  };

  if (!validation.ok) {
    throw new AiProviderError(
      "invalid_interpretation",
      "AI provider returned an invalid interpretation."
    );
  }

  return {
    result: validatedResult,
    reviewDraft: createReviewDraft(validatedResult),
    provider: provider.name,
    model,
    usedFallback,
  };
}

async function runImageProvider(
  provider: AiProviderClient,
  model: string,
  input: ProviderImageInterpretationInput,
  usedFallback: boolean
): Promise<ProviderInterpretationOutput> {
  const raw = (await provider.completeJson({
    model,
    systemPrompt: AI_JSON_SYSTEM_PROMPT,
    userPrompt: buildImageAnalysisUserPrompt({
      mimeType: input.mimeType,
      sourceLabel: input.sourceLabel,
    }),
    imageDataUrl: input.imageDataUrl,
    timeoutMs: 30000,
  })) as {
    confidence?: unknown;
    warnings?: unknown;
    actions?: unknown;
  };

  const result: InterpretationResult = {
    sourceType: "image",
    sourceId: input.sourceId,
    workspaceId: input.workspaceId,
    confidence:
      typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
        ? raw.confidence
        : 0.5,
    warnings: toWarnings(raw.warnings),
    actions: toActions(raw.actions),
  };

  const validation = await validateInterpretationResult(result);
  const validatedResult = {
    ...result,
    warnings: validation.warnings,
  };

  if (!validation.ok) {
    throw new AiProviderError(
      "invalid_interpretation",
      "AI provider returned an invalid image interpretation."
    );
  }

  return {
    result: validatedResult,
    reviewDraft: createReviewDraft(validatedResult),
    provider: provider.name,
    model,
    usedFallback,
  };
}

async function interpretWithConfiguredProvider(
  sourceType: TextAiSourceType,
  input: Omit<ProviderInterpretationInput, "sourceType">
) {
  const primary = getPrimaryConfig();
  const fallback = getFallbackConfig();

  try {
    return await runProvider(
      createProvider(primary.provider),
      primary.model,
      { ...input, sourceType },
      false
    );
  } catch (error) {
    if (!fallback) throw error;
    return runProvider(
      createProvider(fallback.provider),
      fallback.model,
      { ...input, sourceType },
      true
    );
  }
}

export async function interpretDocumentWithAI(
  input: Omit<ProviderInterpretationInput, "sourceType">
) {
  return interpretWithConfiguredProvider("ocr", input);
}

export async function interpretTranscriptWithAI(
  input: Omit<ProviderInterpretationInput, "sourceType">
) {
  return interpretWithConfiguredProvider("transcript", input);
}

export async function interpretImageWithAI(input: ProviderImageInterpretationInput) {
  const primary = getVisionConfig();
  const fallback = getFallbackConfig();

  try {
    return await runImageProvider(
      createProvider(primary.provider),
      primary.model,
      input,
      false
    );
  } catch (error) {
    if (!fallback) throw error;
    return runImageProvider(
      createProvider(fallback.provider),
      fallback.model,
      input,
      true
    );
  }
}
```

## lib\ai\providers\systemPrompts.ts

```typescript
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
```

## lib\ai\providers\types.ts

```typescript
import type { ReviewDraft } from "@/lib/ai/reviewTypes";
import type { AiSourceType, InterpretationResult } from "@/lib/ai/types";

export type AiProviderName = "openrouter" | "openai";
export type TextAiSourceType = Exclude<AiSourceType, "image">;

export type ProviderInterpretationInput = {
  workspaceId: string;
  sourceId?: string;
  sourceType: TextAiSourceType;
  text: string;
};

export type ProviderImageInterpretationInput = {
  workspaceId: string;
  sourceId?: string;
  imageDataUrl: string;
  mimeType: string;
  sourceLabel?: string;
};

export type ProviderInterpretationOutput = {
  result: InterpretationResult;
  reviewDraft: ReviewDraft;
  provider: AiProviderName;
  model: string;
  usedFallback: boolean;
};

export type AiProviderRequest = {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  imageDataUrl?: string;
  timeoutMs?: number;
};

export type AiProviderClient = {
  name: AiProviderName;
  completeJson(request: AiProviderRequest): Promise<unknown>;
};

export type ProviderErrorCode =
  | "missing_config"
  | "provider_failed"
  | "timeout"
  | "invalid_json"
  | "invalid_interpretation";

export class AiProviderError extends Error {
  code: ProviderErrorCode;

  constructor(code: ProviderErrorCode, message: string) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
  }
}
```

## lib\ai\reviewTypes.ts

```typescript
import type {
  AiSourceType,
  InterpretationWarning,
  SuggestedAction,
} from "@/lib/ai/types";

export type ReviewDraftStatus = "pending_review" | "approved" | "rejected";

export type ReviewDraft = {
  id: string;
  workspaceId: string;
  sourceType: AiSourceType;
  sourceId?: string;
  status: ReviewDraftStatus;
  confidence: number;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
  createdAt: string;
};

export function createReviewDraft(input: {
  workspaceId: string;
  sourceType: AiSourceType;
  sourceId?: string;
  confidence: number;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
}): ReviewDraft {
  return {
    id: crypto.randomUUID(),
    workspaceId: input.workspaceId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    status: "pending_review",
    confidence: input.confidence,
    warnings: input.warnings,
    actions: input.actions,
    createdAt: new Date().toISOString(),
  };
}
```

## lib\ai\schemas.ts

```typescript
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
```

## lib\ai\transcriptInterpreter.ts

```typescript
import { createSuggestedAction } from "@/lib/ai/actionDrafts";
import { createReviewDraft, type ReviewDraft } from "@/lib/ai/reviewTypes";
import {
  validateInterpretationResult,
  type AiValidationHooks,
} from "@/lib/ai/validators";
import type { InterpretationInput, InterpretationResult } from "@/lib/ai/types";

export type TranscriptInterpretationInput = Omit<
  InterpretationInput,
  "sourceType"
> & {
  transcriptId?: string;
};

function findQuotedOrNamedClient(text: string) {
  const quoted = text.match(/["']([^"']{2,80})["']/);
  if (quoted) return quoted[1].trim();

  const createClient = text.match(/create (?:a )?client(?: named| called)? ([A-Za-z0-9 .'-]{2,80})/i);
  if (createClient) return createClient[1].trim().replace(/[.?!]$/, "");

  return undefined;
}

function findCalendarTitle(text: string) {
  const schedule = text.match(/(?:schedule|book|create) (?:an? )?(?:event|appointment|visit|job) (?:for )?([A-Za-z0-9 .'-]{2,80})/i);
  return schedule?.[1]?.trim().replace(/[.?!]$/, "");
}

export async function interpretTranscript(
  input: TranscriptInterpretationInput,
  hooks: AiValidationHooks = {}
): Promise<{ result: InterpretationResult; reviewDraft: ReviewDraft }> {
  const clientName = findQuotedOrNamedClient(input.text);
  const calendarTitle = findCalendarTitle(input.text);
  const actions = [];
  const warnings = [];

  if (clientName) {
    actions.push(
      createSuggestedAction(
        "create_client",
        {
          name: clientName,
          notes: "Mock speech interpretation draft. Requires human review.",
        },
        0.74
      )
    );
  }

  if (calendarTitle && /tomorrow|today|\d{4}-\d{2}-\d{2}/i.test(input.text)) {
    actions.push(
      createSuggestedAction(
        "create_calendar_event",
        {
          title: calendarTitle,
          date: input.text.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "tomorrow",
          notes: "Mock speech interpretation draft. Normalize date before approval.",
        },
        0.66
      )
    );
  }

  if (!actions.length) {
    warnings.push({
      code: "unsupported_intent" as const,
      message: "Transcript did not match a supported draft action.",
    });
  }

  const result: InterpretationResult = {
    sourceType: "transcript",
    sourceId: input.transcriptId ?? input.sourceId,
    workspaceId: input.workspaceId,
    confidence: actions.length ? 0.7 : 0.3,
    warnings,
    actions,
  };

  const validation = await validateInterpretationResult(result, hooks);
  const resultWithValidation = {
    ...result,
    warnings: validation.warnings,
  };

  return {
    result: resultWithValidation,
    reviewDraft: createReviewDraft(resultWithValidation),
  };
}
```

## lib\ai\types.ts

```typescript
export type AiSourceType = "ocr" | "transcript" | "image";

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
  | "create_material_allocation"
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
```

## lib\ai\validators.ts

```typescript
import { isAllowedAiActionType } from "@/lib/ai/actionDrafts";
import {
  ACTION_PAYLOAD_SCHEMAS,
  CONFIDENCE_THRESHOLDS,
  type PayloadFieldType,
} from "@/lib/ai/schemas";
import type {
  DraftPayload,
  InterpretationResult,
  InterpretationWarning,
  SuggestedAction,
} from "@/lib/ai/types";

export type AiValidationHooks = {
  checkDuplicate?: (action: SuggestedAction) => Promise<InterpretationWarning[]>;
  checkWorkspaceOwnership?: (
    workspaceId: string,
    action: SuggestedAction
  ) => Promise<InterpretationWarning[]>;
  checkPermission?: (action: SuggestedAction) => Promise<InterpretationWarning[]>;
};

export type AiValidationResult = {
  ok: boolean;
  warnings: InterpretationWarning[];
};

function isRecord(value: unknown): value is DraftPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matchesFieldType(value: unknown, type: PayloadFieldType) {
  if (value === undefined || value === null) return true;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return typeof value === "object" && !Array.isArray(value);
  if (type === "number" || type === "currency") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (type === "boolean") return typeof value === "boolean";
  if (type === "string" || type === "date") return typeof value === "string";
  return false;
}

export function validateSuggestedAction(action: SuggestedAction): AiValidationResult {
  const warnings: InterpretationWarning[] = [];

  if (!isAllowedAiActionType(action.type)) {
    warnings.push({
      code: "unsupported_intent",
      message: `Unsupported action type: ${action.type}.`,
      path: "type",
    });
  }

  if (action.confidence < CONFIDENCE_THRESHOLDS.suggestedAction) {
    warnings.push({
      code: "low_confidence",
      message: "Suggested action confidence is below the review threshold.",
      path: "confidence",
    });
  }

  if (!isRecord(action.payload)) {
    warnings.push({
      code: "invalid_payload",
      message: "Suggested action payload must be an object.",
      path: "payload",
    });
    return { ok: false, warnings };
  }

  const schema = ACTION_PAYLOAD_SCHEMAS[action.type];
  for (const field of schema.requiredFields) {
    const value = action.payload[field];
    if (value === undefined || value === null || value === "") {
      warnings.push({
        code: "missing_required_field",
        message: `${field} is required for ${action.type}.`,
        path: `payload.${field}`,
      });
    }
  }

  for (const [field, fieldSchema] of Object.entries(schema.fields)) {
    if (!matchesFieldType(action.payload[field], fieldSchema.type)) {
      warnings.push({
        code: "invalid_payload",
        message: `${field} must be ${fieldSchema.type}.`,
        path: `payload.${field}`,
      });
    }
  }

  return {
    ok: !warnings.some(
      (warning) =>
        warning.code === "missing_required_field" ||
        warning.code === "invalid_payload" ||
        warning.code === "unsupported_intent"
    ),
    warnings,
  };
}

export async function validateInterpretationResult(
  result: InterpretationResult,
  hooks: AiValidationHooks = {}
): Promise<AiValidationResult> {
  const warnings: InterpretationWarning[] = [...result.warnings];

  if (!result.workspaceId) {
    warnings.push({
      code: "workspace_unverified",
      message: "Workspace id is required before review.",
      path: "workspaceId",
    });
  }

  if (result.confidence < CONFIDENCE_THRESHOLDS.reviewDraft) {
    warnings.push({
      code: "low_confidence",
      message: "Overall interpretation confidence is low.",
      path: "confidence",
    });
  }

  for (const action of result.actions) {
    const validation = validateSuggestedAction(action);
    warnings.push(...validation.warnings);
    if (hooks.checkDuplicate) warnings.push(...(await hooks.checkDuplicate(action)));
    if (hooks.checkWorkspaceOwnership) {
      warnings.push(
        ...(await hooks.checkWorkspaceOwnership(result.workspaceId, action))
      );
    }
    if (hooks.checkPermission) warnings.push(...(await hooks.checkPermission(action)));
  }

  return {
    ok: !warnings.some(
      (warning) =>
        warning.code === "missing_required_field" ||
        warning.code === "invalid_payload" ||
        warning.code === "unsupported_intent"
    ),
    warnings,
  };
}
```

## lib\ai\voiceClarification.ts

```typescript
import type { ClientRow } from "@/lib/clientTypes";
import type { Job } from "@/lib/jobTypes";
import type { DraftPayload, SuggestedAction } from "@/lib/ai/types";
import { FRONTIER_COMPACT_AI_PARSER_CONTRACT } from "./parserContract";

export type VoiceSessionMode =
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "waiting_for_answer"
  | "draft_ready"
  | "error";

export type MaterialMode = "append" | "merge" | "replace";

export type VoiceDraftType = "job" | "calendar_event" | "material_allocation";

export type VoiceSessionState = {
  sessionId: string;
  mode: VoiceSessionMode;
  transcriptHistory: string[];
  assistantMessages: string[];
  currentIntent: string;
  missingFields: string[];
  candidateClients: ClientRow[];
  candidateJobs: Job[];
  draftType: VoiceDraftType | "";
  draftPayload: DraftPayload;
  sourceTranscripts: string[];
  selectedClientId: string;
  selectedJobId: string;
  materialMode: MaterialMode | "";
};

export type VoiceClarificationResponse = {
  assistantMessage: string;
  needsFollowup: boolean;
  missingFields: string[];
  candidateClients: ClientRow[];
  candidateJobs: Job[];
  draftReady: boolean;
  draftType: VoiceDraftType | "";
  draftPayload: DraftPayload;
  action?: SuggestedAction;
  session: VoiceSessionState;
};

export const VOICE_CLARIFICATION_CONTRACT =
  FRONTIER_COMPACT_AI_PARSER_CONTRACT;

const CLIENT_NAME_STOPWORDS = new Set([
  "new",
  "create",
  "update",
  "schedule",
  "visit",
  "job",
  "client",
  "customer",
  "appointment",
  "inspection",
  "quote",
  "estimate",
  "service",
  "follow",
  "follow-up",
  "tomorrow",
  "today",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "the",
  "a",
  "an",
  "and",
  "in",
  "on",
  "with",
  "for",
  "her",
  "him",
  "them",
]);

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function createVoiceSession(): VoiceSessionState {
  return {
    sessionId: crypto.randomUUID(),
    mode: "idle",
    transcriptHistory: [],
    assistantMessages: [],
    currentIntent: "",
    missingFields: [],
    candidateClients: [],
    candidateJobs: [],
    draftType: "",
    draftPayload: {},
    sourceTranscripts: [],
    selectedClientId: "",
    selectedJobId: "",
    materialMode: "",
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function isUnsafeClientName(value: string) {
  const normalized = normalize(value);
  if (!normalized) return true;
  const tokens = normalized.split(" ");
  return tokens.every((token) => CLIENT_NAME_STOPWORDS.has(token));
}

export function cleanupVoiceTranscript(input: string, assistantMessages: string[] = []) {
  let text = input
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\bfrom to your to\b/gi, "")
    .replace(/\bfrontier\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const promptEchoes = [
    "tell me what you want to create or update",
    "tell me what you want from to your to create or update",
    "tell me what you want to your to create or update",
    ...assistantMessages,
  ];

  for (const prompt of promptEchoes) {
    const cleanedPrompt = normalize(prompt);
    if (!cleanedPrompt) continue;
    const escaped = cleanedPrompt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = normalize(text).replace(new RegExp(escaped, "gi"), " ");
  }

  const pieces = text
    .split(/\b(?=create |schedule |update |materials )/i)
    .map((piece) => piece.trim())
    .filter(Boolean);
  const uniquePieces = pieces.filter(
    (piece, index) => pieces.findIndex((candidate) => normalize(candidate) === normalize(piece)) === index
  );

  return (uniquePieces.length ? uniquePieces.join(". ") : text)
    .replace(/\b(uh|um|like|please)\b/gi, " ")
    .replace(/\b(\w+)(\s+\1\b)+/gi, "$1")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function distance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = old;
    }
  }
  return previous[b.length];
}

function bigrams(value: string) {
  const compact = value.replace(/\s+/g, "");
  return Array.from({ length: Math.max(0, compact.length - 1) }, (_, index) =>
    compact.slice(index, index + 2)
  );
}

function diceSimilarity(a: string, b: string) {
  const aPairs = bigrams(a);
  const bPairs = bigrams(b);
  if (!aPairs.length || !bPairs.length) return 0;
  const remaining = [...bPairs];
  let matches = 0;
  for (const pair of aPairs) {
    const index = remaining.indexOf(pair);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  }
  return (2 * matches) / (aPairs.length + bPairs.length);
}

function closeMatch(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = left.split(" ").filter((part) => part.length > 2);
  const rightTokens = right.split(" ").filter((part) => part.length > 2);
  return leftTokens.some((leftToken) =>
    rightTokens.some((rightToken) => {
      const shortest = Math.min(leftToken.length, rightToken.length);
      if (shortest < 5) return leftToken === rightToken;
      const maxDistance = Math.max(2, Math.floor(shortest * 0.3));
      return (
        distance(leftToken, rightToken) <= maxDistance ||
        diceSimilarity(leftToken, rightToken) >= 0.55
      );
    })
  );
}

function extractClientSearch(text: string) {
  const normalized = normalize(text);
  const explicitClient =
    normalized.match(/\bcreate\s+(?:a\s+)?new\s+client(?:\s+named)?\s+([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,2}?)(?=\s+(?:and|schedule|visit|on|at|with|for)\b|$)/)?.[1] ??
    normalized.match(/\bschedule\s+(?:a\s+)?(?:visit|appointment|inspection|quote|service visit)?\s*(?:with\s+)?([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,2}?)(?=\s+(?:and|on|at|for|with|visit)\b|$)/)?.[1] ??
    normalized.match(/\bschedule\s+([a-z][a-z0-9'-]*(?:\s+[a-z][a-z0-9'-]*){0,2})/)?.[1];
  if (explicitClient && !isUnsafeClientName(explicitClient)) {
    return explicitClient
      .split(" ")
      .filter((token) => !CLIENT_NAME_STOPWORDS.has(token))
      .join(" ");
  }

  const jobNameMatch = normalized.match(/\b(?:the\s+)?([a-z0-9'-]+)\s+(?:job|client)\b/);
  if (jobNameMatch && !isUnsafeClientName(jobNameMatch[1])) return jobNameMatch[1];

  const forMatch = normalized.match(/\b(?:for|update|schedule|materials for)\s+(?:the\s+)?([a-z0-9'-]+)/);
  if (forMatch && !isUnsafeClientName(forMatch[1])) return forMatch[1];

  return normalized.split(" ").find((part) => part.length > 3 && !CLIENT_NAME_STOPWORDS.has(part)) ?? "";
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextWeekdayDate(dayName: string, now = new Date()) {
  const target = WEEKDAYS.indexOf(dayName.toLowerCase() as (typeof WEEKDAYS)[number]);
  if (target < 0) return "";
  const result = new Date(now);
  const delta = (target - result.getDay() + 7) % 7 || 7;
  result.setDate(result.getDate() + delta);
  return dateOnly(result);
}

function resolveDayOfMonth(day: number, weekday?: string, now = new Date()) {
  const candidates = [0, 1, -1].map((monthOffset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
    return date;
  });
  const matchingWeekday = weekday
    ? candidates.find((date) => WEEKDAYS[date.getDay()] === weekday.toLowerCase())
    : undefined;
  const future = candidates.find((date) => date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  return dateOnly(matchingWeekday ?? future ?? candidates[0]);
}

function extractTimePhrase(text: string) {
  const numeric = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (numeric) {
    return `${numeric[1]}${numeric[2] ? `:${numeric[2]}` : ""} ${numeric[3].toUpperCase()}`;
  }
  const loose = text.match(/\bat\s+(\d{1,2})(?!\d)\b/i);
  return loose ? `${loose[1]}:00` : "";
}

function extractDateInfo(text: string) {
  const iso = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (iso) return { phrase: iso, resolvedDate: iso, time: extractTimePhrase(text), needsConfirmation: false };

  const lowered = text.toLowerCase();
  const today = new Date();
  if (/\btoday\b/.test(lowered)) return { phrase: "today", resolvedDate: dateOnly(today), time: extractTimePhrase(text), needsConfirmation: false };
  if (/\btomorrow\b/.test(lowered)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { phrase: "tomorrow", resolvedDate: dateOnly(tomorrow), time: extractTimePhrase(text), needsConfirmation: false };
  }

  const weekday = WEEKDAYS.find((day) => lowered.includes(day));
  const dayOfMonth = lowered.match(/\b(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/)?.[1];
  if (weekday && dayOfMonth) {
    const resolvedDate = resolveDayOfMonth(Number(dayOfMonth), weekday);
    return {
      phrase: `${weekday} the ${dayOfMonth}`,
      resolvedDate,
      time: extractTimePhrase(text),
      needsConfirmation: true,
    };
  }
  if (weekday) {
    const resolvedDate = nextWeekdayDate(weekday);
    return { phrase: weekday, resolvedDate, time: extractTimePhrase(text), needsConfirmation: true };
  }
  if (dayOfMonth) {
    const resolvedDate = resolveDayOfMonth(Number(dayOfMonth));
    return { phrase: `the ${dayOfMonth}`, resolvedDate, time: extractTimePhrase(text), needsConfirmation: true };
  }
  return { phrase: "", resolvedDate: "", time: extractTimePhrase(text), needsConfirmation: false };
}

function extractEventType(text: string) {
  const match = text.match(/\b(quote|inspection|service visit|follow-up|follow up|job|visit)\b/i);
  return match?.[1]?.replace("follow up", "follow-up") ?? "";
}

function extractEstimate(text: string) {
  const wordAmount = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+hundred\b/i);
  if (wordAmount) return NUMBER_WORDS[wordAmount[1].toLowerCase()] * 100;
  const match = text.match(/\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks)?/i);
  return match ? Number(match[1]) : undefined;
}

function extractPhone(text: string) {
  return text.match(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/)?.[0] ?? "";
}

function extractEmail(text: string) {
  return text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] ?? "";
}

function extractIsoDate(text: string) {
  return text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
}

function parseMaterials(text: string) {
  const normalized = text.replace(/\btwo\b/gi, "2").replace(/\bone\b/gi, "1");
  const matches = [...normalized.matchAll(/(\d+)\s+([a-z][a-z0-9 -]*?)(?=\s+and\s+|\s*,|\.|$)/gi)];
  return matches
    .map((match) => ({
      quantity: Number(match[1]),
      name: match[2].trim(),
    }))
    .filter((material) => !/^(am|pm|at|rd|st|nd|th)\b/i.test(material.name));
}

function matchClients(text: string, clients: ClientRow[]) {
  const search = extractClientSearch(text);
  if (!search) return [];
  return clients.filter((client) => closeMatch(search, client.name));
}

function matchJobs(text: string, jobs: Job[], clientId: string) {
  const normalized = normalize(text);
  return jobs.filter((job) => {
    const clientTokens = normalize(job.client).split(" ").filter((part) => part.length > 2);
    const clientMatches = clientId
      ? job.clientId === clientId
      : clientTokens.some((part) => normalized.includes(part) || closeMatch(normalized, part));
    return clientMatches || closeMatch(normalized, job.name);
  });
}

function selectedClient(session: VoiceSessionState, clients: ClientRow[]) {
  return clients.find((client) => client.id === session.selectedClientId) ?? null;
}

function selectedJob(session: VoiceSessionState, jobs: Job[]) {
  return jobs.find((job) => job.id === session.selectedJobId) ?? null;
}

function clientLabel(client: ClientRow) {
  return [
    client.name,
    client.address,
    [client.city, client.state, client.zip].filter(Boolean).join(", "),
    client.phone,
    client.email,
  ]
    .filter(Boolean)
    .join(" - ");
}

function jobLabel(job: Job) {
  return [
    job.name,
    job.status,
    [job.date, job.time].filter(Boolean).join(" "),
    job.client,
  ]
    .filter(Boolean)
    .join(" - ");
}

function askClientSelection(session: VoiceSessionState, name: string) {
  if (session.candidateClients.length === 1) {
    const client = session.candidateClients[0];
    return response(
      session,
      `I found 1 possible client match for ${name || client.name}: ${clientLabel(client)}. Would you like to: 1. Use this client, 2. Create a new client named ${name || client.name}, or 3. Search again?`
    );
  }

  return response(
    session,
    `I found multiple possible client matches. Which client should I use? ${session.candidateClients.map((client, index) => `${index + 1}. ${clientLabel(client)}`).join(", ")}. You can also say create new client or search again.`
  );
}

function askJobSelection(session: VoiceSessionState) {
  if (session.candidateJobs.length === 1) {
    const job = session.candidateJobs[0];
    return response(
      session,
      `I found 1 possible job match: ${jobLabel(job)}. Would you like to: 1. Use this job, 2. Create a new job draft, or 3. Search again?`
    );
  }

  return response(
    session,
    `I found multiple possible job matches. Which job should I use? ${session.candidateJobs.map((job, index) => `${index + 1}. ${jobLabel(job)}`).join(", ")}.`
  );
}

function response(session: VoiceSessionState, assistantMessage: string, draftReady = false): VoiceClarificationResponse {
  return {
    assistantMessage,
    needsFollowup: !draftReady,
    missingFields: session.missingFields,
    candidateClients: session.candidateClients,
    candidateJobs: session.candidateJobs,
    draftReady,
    draftType: session.draftType,
    draftPayload: session.draftPayload,
    action: draftReady ? buildVoiceAction(session) : undefined,
    session: {
      ...session,
      mode: draftReady ? "draft_ready" : "waiting_for_answer",
      assistantMessages: [...session.assistantMessages, assistantMessage],
    },
  };
}

export function buildVoiceAction(session: VoiceSessionState): SuggestedAction | undefined {
  if (session.draftType === "material_allocation") {
    return { type: "create_material_allocation", confidence: 0.82, payload: session.draftPayload };
  }
  if (session.draftType === "calendar_event") {
    return { type: "create_calendar_event", confidence: 0.82, payload: session.draftPayload };
  }
  if (session.draftType === "job") {
    const actionType = session.selectedJobId ? "update_job" : "create_job";
    return { type: actionType, confidence: 0.82, payload: session.draftPayload };
  }
  return undefined;
}

export function advanceVoiceSession(
  current: VoiceSessionState,
  transcript: string,
  clients: ClientRow[],
  jobs: Job[]
): VoiceClarificationResponse {
  const text = cleanupVoiceTranscript(transcript, current.assistantMessages);
  const lower = normalize(text);
  const session: VoiceSessionState = {
    ...current,
    mode: "thinking",
    transcriptHistory: [...current.transcriptHistory, text],
    sourceTranscripts: [...current.sourceTranscripts, text],
  };

  if (lower.includes("append")) session.materialMode = "append";
  if (lower.includes("merge")) session.materialMode = "merge";
  if (lower.includes("replace")) session.materialMode = "replace";

  const choiceNumber = lower.match(/\b(?:number\s*)?(\d+)\b/)?.[1];

  if (session.missingFields.includes("clientContact")) {
    const phone = extractPhone(text);
    const email = extractEmail(text);
    const skip = lower.includes("skip") || lower.includes("later") || lower.includes("no");
    session.draftPayload = {
      ...session.draftPayload,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
    };
    if (skip || phone || email) {
      session.missingFields = [];
    } else {
      return response(session, "You can provide address, phone, or email, or say skip for now.");
    }
  }

  if (session.missingFields.includes("dateConfirmation")) {
    const confirmedDate = extractIsoDate(text);
    if (confirmedDate) {
      session.draftPayload = { ...session.draftPayload, date: confirmedDate, dateConfirmed: true };
      session.missingFields = [];
    } else if (lower.includes("yes") || lower.includes("correct") || lower.includes("confirm")) {
      session.draftPayload = { ...session.draftPayload, dateConfirmed: true };
      session.missingFields = [];
    } else {
      return response(session, "Please confirm the exact date as YYYY-MM-DD, or say a clearer date.");
    }
  }

  if (session.missingFields.includes("materialCosts")) {
    const amount = extractEstimate(text);
    const costType = lower.includes("per") || lower.includes("unit") ? "unit" : lower.includes("total") ? "total" : "";
    if (amount !== undefined && costType) {
      session.draftPayload = {
        ...session.draftPayload,
        materialCostNote: text,
        materialCostType: costType,
      };
      session.missingFields = [];
    } else {
      return response(session, "Is that total cost or cost per unit? Include the amount.");
    }
  }

  if (session.missingFields.includes("replaceConfirmation")) {
    if (lower.includes("yes") || lower.includes("confirm") || lower.includes("replace")) {
      session.draftPayload = { ...session.draftPayload, replaceConfirmed: true };
      session.missingFields = [];
    } else {
      session.materialMode = "";
      session.missingFields = ["materialMode"];
      return response(session, "What material mode should I use: append, merge, or replace?");
    }
  }

  if (session.missingFields.includes("clientId") && !session.selectedClientId) {
    const wantsSearch = lower.includes("search") || (session.candidateClients.length === 0 && choiceNumber === "2");
    const wantsCreate =
      lower.includes("create") ||
      lower.includes("new") ||
      (session.candidateClients.length === 0 && (choiceNumber === "1" || lower.includes("yes"))) ||
      (session.candidateClients.length === 1 && choiceNumber === "2");
    const wantsUseSingle =
      session.candidateClients.length === 1 &&
      (choiceNumber === "1" || lower.includes("use") || lower.includes("yes") || lower.includes("that"));

    if (wantsSearch || (session.candidateClients.length === 1 && choiceNumber === "3")) {
      session.candidateClients = [];
      session.missingFields = ["clientId"];
      return response(session, "What client name, address, phone, or email should I search for?");
    }

    if (wantsCreate) {
      const existingName = String(session.draftPayload.clientName ?? extractClientSearch(session.sourceTranscripts[0] ?? text));
      session.candidateClients = [];
      session.missingFields = ["clientContact"];
      session.draftPayload = { ...session.draftPayload, clientName: existingName };
      return response(session, `Client name will be ${existingName}. Would you like to provide address, phone, or email now, or skip for now?`);
    } else if (wantsUseSingle) {
      session.selectedClientId = session.candidateClients[0].id;
      session.candidateClients = [];
      session.missingFields = [];
    } else if (choiceNumber && session.candidateClients.length > 1) {
      const picked = session.candidateClients[Number(choiceNumber) - 1];
      if (picked) {
        session.selectedClientId = picked.id;
        session.candidateClients = [];
        session.missingFields = [];
      }
    }
  }

  if (session.missingFields.includes("jobId") && !session.selectedJobId) {
    const wantsSearch = lower.includes("search");
    const wantsCreate = lower.includes("create") || lower.includes("new") || (session.candidateJobs.length === 1 && choiceNumber === "2");
    const wantsUseSingle =
      session.candidateJobs.length === 1 &&
      (choiceNumber === "1" || lower.includes("use") || lower.includes("yes") || lower.includes("that"));

    if (wantsSearch || (session.candidateJobs.length === 1 && choiceNumber === "3")) {
      session.candidateJobs = [];
      session.missingFields = ["jobId"];
      return response(session, "What job name, client, date, or description should I search for?");
    }

    if (wantsUseSingle) {
      session.selectedJobId = session.candidateJobs[0].id;
      session.candidateJobs = [];
      session.missingFields = [];
    } else if (choiceNumber && session.candidateJobs.length > 1) {
      const picked = session.candidateJobs[Number(choiceNumber) - 1];
      if (picked) {
        session.selectedJobId = picked.id;
        session.candidateJobs = [];
        session.missingFields = [];
      }
    } else if (wantsCreate) {
      session.candidateJobs = [];
      session.missingFields = [];
    }
  }

  const materials = parseMaterials(session.sourceTranscripts.join(" "));
  const isMaterial = lower.includes("material");
  const isJobUpdate = lower.includes("update") || lower.includes("estimated") || lower.includes("cost");
  session.draftType = isMaterial ? "material_allocation" : isJobUpdate ? "job" : "calendar_event";

  if (!session.selectedClientId && !session.draftPayload.clientName) {
    const candidates = matchClients(text, clients);
    session.candidateClients = candidates;
    if (candidates.length > 0) {
      session.missingFields = ["clientId"];
      return askClientSelection(session, extractClientSearch(text));
    }
    if (!candidates.length) {
      const name = extractClientSearch(text);
      session.missingFields = ["clientId"];
      session.draftPayload = { ...session.draftPayload, clientName: name };
      return response(session, `I could not find ${name || "that client"}. Would you like to: 1. Create a new client named ${name || "that"}, or 2. Search again?`);
    }
  }

  if (session.draftType === "material_allocation" || isJobUpdate) {
    if (!session.selectedJobId) {
      const candidates = matchJobs(text, jobs, session.selectedClientId);
      session.candidateJobs = candidates;
      if (candidates.length > 0) {
        session.missingFields = ["jobId"];
        return askJobSelection(session);
      }
      if (!candidates.length && session.draftType === "material_allocation") {
        session.missingFields = ["jobId"];
        return response(session, "Which job should these materials be attached to?");
      }
      if (!candidates.length && isJobUpdate) {
        session.missingFields = ["jobId"];
        return response(session, "I could not find a matching job. Should I create a new job draft?");
      }
    }
  }

  if (session.draftType === "material_allocation") {
    if (!session.selectedJobId) {
      session.missingFields = ["jobId"];
      return response(session, "Which job should these materials be attached to?");
    }
    if (!materials.length) {
      session.missingFields = ["materials"];
      return response(session, "What materials and quantities should I add?");
    }
    if (!session.materialMode) {
      session.missingFields = ["materialMode"];
      return response(session, "Do you want to append, merge, or replace the job materials?");
    }
    if (!session.draftPayload.materialCostNote) {
      session.missingFields = ["materialCosts"];
      return response(session, `What is the cost of ${materials.map((material) => material.name).join(" and ")}? Say whether it is total cost or cost per unit.`);
    }
    if (session.materialMode === "replace" && !session.draftPayload.replaceConfirmed) {
      session.missingFields = ["replaceConfirmation"];
      return response(session, "Replacing materials will overwrite the current material plan. Please confirm replace, or choose append or merge.");
    }
    session.missingFields = [];
    session.draftPayload = {
      jobId: session.selectedJobId,
      mode: session.materialMode,
      materials,
      ...(session.draftPayload.materialCostNote ? { materialCostNote: session.draftPayload.materialCostNote } : {}),
      ...(session.draftPayload.materialCostType ? { materialCostType: session.draftPayload.materialCostType } : {}),
      clarificationHistory: session.sourceTranscripts,
      notes: session.sourceTranscripts.join("\n"),
    };
    return response(session, "I have enough information. Please review this material allocation draft.", true);
  }

  const eventType = extractEventType(session.sourceTranscripts.join(" "));
  const dateInfo = extractDateInfo(session.sourceTranscripts.join(" "));
  if (!eventType) {
    session.missingFields = ["eventType"];
    return response(session, "Is this for a quote, inspection, service visit, follow-up, or job?");
  }
  if (!dateInfo.resolvedDate && session.draftType === "calendar_event") {
    session.missingFields = ["date"];
    return response(session, "What date and time should I use?");
  }
  if (dateInfo.resolvedDate && dateInfo.needsConfirmation && !session.draftPayload.dateConfirmed) {
    session.draftPayload = { ...session.draftPayload, date: dateInfo.resolvedDate, time: dateInfo.time };
    session.missingFields = ["dateConfirmation"];
    return response(session, `I heard ${dateInfo.phrase}, which resolves to ${dateInfo.resolvedDate}${dateInfo.time ? ` at ${dateInfo.time}` : ""}. Is that correct? If not, answer with YYYY-MM-DD.`);
  }

  const client = selectedClient(session, clients);
  const job = selectedJob(session, jobs);
  const finalDate = typeof session.draftPayload.date === "string" ? session.draftPayload.date : dateInfo.resolvedDate;
  const finalTime = typeof session.draftPayload.time === "string" ? session.draftPayload.time : dateInfo.time;
  session.missingFields = [];
  if (session.draftType === "job") {
    const estimate = extractEstimate(session.sourceTranscripts.join(" "));
    session.draftPayload = {
      ...(session.selectedJobId ? { jobId: session.selectedJobId } : {}),
      title: job?.name || `${client?.name ?? "Client"} ${eventType}`,
      ...(session.selectedClientId ? { clientId: session.selectedClientId } : {}),
      ...(!session.selectedClientId && session.draftPayload.clientName ? { clientName: session.draftPayload.clientName } : {}),
      status: "Scheduled",
      date: finalDate,
      ...(finalTime ? { time: finalTime } : {}),
      clarificationHistory: session.sourceTranscripts,
      notes: session.sourceTranscripts.join("\n"),
      ...(estimate !== undefined ? { estimatedValue: estimate } : {}),
    };
    return response(session, "I have enough information. Please review this job draft.", true);
  }

  session.draftPayload = {
    title: `${client?.name ?? "Client"} ${eventType}`,
    ...(session.selectedClientId ? { clientId: session.selectedClientId } : {}),
    ...(!session.selectedClientId && session.draftPayload.clientName ? { clientName: session.draftPayload.clientName } : {}),
    ...(session.selectedJobId ? { jobId: session.selectedJobId } : {}),
    date: finalDate,
    ...(finalTime ? { time: finalTime } : {}),
    clarificationHistory: session.sourceTranscripts,
    notes: session.sourceTranscripts.join("\n"),
  };
  return response(session, "I have enough information. Please review this calendar draft.", true);
}
```

## lib\auth\messages.ts

```typescript
export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return fallback;
}
```

## lib\auth\session.ts

```typescript
import { redirect } from "next/navigation";

import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await maybeCreateServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;

  return data.user;
}

export async function getCurrentClaims() {
  const supabase = await maybeCreateServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;

  return data?.claims ?? null;
}

export async function requireCurrentUser(redirectTo = "/") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
```

## lib\clients.ts

```typescript
export const clients = [
  // LANDSCAPING

  {
    id: "1",
    workspaceId: "landscaping",
    name: "Jones Family",
    status: "Active",
    balance: "$200",
    email: "jones@example.com",
    phone: "(555) 100-0001",
    address: "300 W Tienken Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48306",
  },
  {
    id: "2",
    workspaceId: "landscaping",
    name: "Brown Family",
    status: "Active",
    balance: "$350",
    email: "brown@example.com",
    phone: "(555) 100-0002",
    address: "1200 E Avon Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },
  {
    id: "3",
    workspaceId: "landscaping",
    name: "Acme HOA",
    status: "Active",
    balance: "$1500",
    email: "contact@acmehoa.com",
    phone: "(555) 100-0003",
    address: "900 Livernois Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },
  {
    id: "4",
    workspaceId: "landscaping",
    name: "John Smith",
    status: "Active",
    balance: "$450",
    email: "john@example.com",
    phone: "(555) 100-0004",
    address: "550 W Hamlin Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },
  {
    id: "5",
    workspaceId: "landscaping",
    name: "Sunset Apartments",
    status: "Active",
    balance: "$120",
    email: "office@sunsetapartments.com",
    phone: "(555) 100-0005",
    address: "1400 Walton Blvd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48309",
  },
  {
    id: "6",
    workspaceId: "landscaping",
    name: "Johnson Residence",
    status: "Active",
    balance: "$800",
    email: "johnson@example.com",
    phone: "(555) 100-0006",
    address: "1700 S Livernois Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },

  // SNOW REMOVAL

  {
    id: "7",
    workspaceId: "snow-removal",
    name: "Rochester Community Church",
    status: "Lead",
    balance: "$3500",
    email: "office@church.org",
    phone: "(555) 200-0001",
    address: "250 W Auburn Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },
  {
    id: "8",
    workspaceId: "snow-removal",
    name: "Riverside Office Park",
    status: "Active",
    balance: "$6800",
    email: "manager@riverside.com",
    phone: "(555) 200-0002",
    address: "400 Water St",
    city: "Rochester",
    state: "MI",
    zip: "48307",
  },
  {
    id: "9",
    workspaceId: "snow-removal",
    name: "Winter Ridge Condos",
    status: "Active",
    balance: "$9200",
    email: "hoa@winterridge.com",
    phone: "(555) 200-0003",
    address: "2200 Crooks Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48309",
  },
  {
    id: "10",
    workspaceId: "snow-removal",
    name: "Oakland Medical Center",
    status: "Active",
    balance: "$650",
    email: "facilities@oaklandmedical.com",
    phone: "(555) 200-0004",
    address: "1101 W University Dr",
    city: "Rochester",
    state: "MI",
    zip: "48307",
  },
  {
    id: "11",
    workspaceId: "snow-removal",
    name: "North Plaza",
    status: "Active",
    balance: "$2400",
    email: "management@northplaza.com",
    phone: "(555) 200-0005",
    address: "1900 S Rochester Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },

  // PROPERTIES

  {
    id: "12",
    workspaceId: "properties",
    name: "Maple Grove Apartments",
    status: "Active",
    balance: "$1200",
    email: "office@maplegrove.com",
    phone: "(555) 300-0001",
    address: "1000 Barclay Cir",
    city: "Rochester Hills",
    state: "MI",
    zip: "48307",
  },
  {
    id: "13",
    workspaceId: "properties",
    name: "Riverside Office Park",
    status: "Active",
    balance: "$950",
    email: "manager@riverside.com",
    phone: "(555) 300-0002",
    address: "400 Water St",
    city: "Rochester",
    state: "MI",
    zip: "48307",
  },
  {
    id: "14",
    workspaceId: "properties",
    name: "Sunset Strip Mall",
    status: "Active",
    balance: "$8500",
    email: "leasing@sunsetstripmall.com",
    phone: "(555) 300-0003",
    address: "1200 Walton Blvd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48309",
  },
  {
    id: "15",
    workspaceId: "properties",
    name: "Green Valley HOA",
    status: "Active",
    balance: "$2100",
    email: "board@greenvalleyhoa.com",
    phone: "(555) 300-0004",
    address: "800 E Tienken Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48306",
  },
  {
    id: "16",
    workspaceId: "properties",
    name: "Johnson Commercial",
    status: "Active",
    balance: "$4750",
    email: "admin@johnsoncommercial.com",
    phone: "(555) 300-0005",
    address: "2100 Crooks Rd",
    city: "Rochester Hills",
    state: "MI",
    zip: "48309",
  },
];
```

## lib\clientStorage.ts

```typescript
"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

export const storageKeys = {
  activeWorkspace: "frontier-active-workspace",
  adminViewAdminUserId: "frontier-admin-view-admin-user-id",
  adminViewUserId: "frontier-admin-view-user-id",
  adminViewWorkspaceId: "frontier-admin-view-workspace-id",
  adminViewWorkspaceName: "frontier-admin-view-workspace-name",
  adminViewWorkspaceType: "frontier-admin-view-workspace-type",
  clientCalendarEvents: "frontier-client-calendar-events",
  clients: "frontier-clients",
  documents: "frontier-documents",
  expenses: "frontier-expenses",
  inventory: "frontier-inventory",
  invoiceDraft: "frontier-invoice-draft",
  invoices: "frontier-invoices",
  jobs: "frontier-jobs",
  settings: "frontier-settings",
  theme: "frontier-theme",
  workspaces: "frontier-workspaces",
} as const;

type StoredStateSetter<T> = T | ((current: T) => T);

type StoredClientForMigration = {
  id: string;
  workspaceId: string;
  name: string;
};

type StoredJobForMigration = {
  client?: string;
  clientId?: string;
  workspaceId?: string;
};

function getStorageEventName(key: string) {
  return `frontier-storage:${key}`;
}

function repairLegacyJobClientIds(snapshot: string) {
  if (typeof window === "undefined") return snapshot;

  try {
    const jobs = JSON.parse(snapshot) as StoredJobForMigration[];
    const savedClients = window.localStorage.getItem(storageKeys.clients);
    const storedClients = savedClients ? JSON.parse(savedClients) : [];
    const clients = Array.isArray(storedClients)
      ? (storedClients as StoredClientForMigration[])
      : [];

    if (!Array.isArray(jobs)) return snapshot;

    let changed = false;
    const repairedJobs = jobs.map((job) => {
      if (job.clientId || !job.client?.trim() || !job.workspaceId) return job;

      // Legacy localStorage jobs only stored the client name.
      const matchingClient = clients.find(
        (client) =>
          client.workspaceId === job.workspaceId &&
          client.name.trim().toLowerCase() === job.client?.trim().toLowerCase()
      );

      if (!matchingClient) return job;

      changed = true;
      return { ...job, clientId: matchingClient.id };
    });

    if (!changed) return snapshot;

    const repairedSnapshot = JSON.stringify(repairedJobs);
    queueMicrotask(() => {
      window.localStorage.setItem(storageKeys.jobs, repairedSnapshot);
      window.dispatchEvent(new Event(getStorageEventName(storageKeys.jobs)));
    });

    return repairedSnapshot;
  } catch {
    return snapshot;
  }
}

function maybeRepairStoredJsonSnapshot(key: string, snapshot: string) {
  return key === storageKeys.jobs ? repairLegacyJobClientIds(snapshot) : snapshot;
}

export function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(maybeRepairStoredJsonSnapshot(key, saved)) as T;
  } catch {
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(getStorageEventName(key)));
}

export function readStoredString(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeStoredString(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(getStorageEventName(key)));
}

export function removeStoredValue(key: string) {
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(getStorageEventName(key)));
}

export function useStoredJsonState<T>(
  key: string,
  fallback: T
): [T, (value: StoredStateSetter<T>) => void] {
  const [fallbackValue] = useState(fallback);
  const [fallbackSnapshot] = useState(() => JSON.stringify(fallback));

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return fallbackSnapshot;
    const saved = window.localStorage.getItem(key) ?? fallbackSnapshot;
    return maybeRepairStoredJsonSnapshot(key, saved);
  }, [fallbackSnapshot, key]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function handleStorage(event: StorageEvent) {
        if (event.key === key) onStoreChange();
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(getStorageEventName(key), onStoreChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(getStorageEventName(key), onStoreChange);
      };
    },
    [key]
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => fallbackSnapshot
  );

  const value = useMemo(() => {
    try {
      return JSON.parse(snapshot) as T;
    } catch {
      return fallbackValue;
    }
  }, [fallbackValue, snapshot]);

  const setValue = useCallback(
    (nextValue: StoredStateSetter<T>) => {
      const current = readStoredJson(key, fallbackValue);
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(current)
          : nextValue;

      writeStoredJson(key, resolvedValue);
    },
    [fallbackValue, key]
  );

  return [value, setValue];
}

export function useStoredStringState(
  key: string,
  fallback: string
): [string, (value: StoredStateSetter<string>) => void] {
  const getSnapshot = useCallback(() => readStoredString(key, fallback), [
    fallback,
    key,
  ]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function handleStorage(event: StorageEvent) {
        if (event.key === key) onStoreChange();
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(getStorageEventName(key), onStoreChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(getStorageEventName(key), onStoreChange);
      };
    },
    [key]
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const setValue = useCallback(
    (nextValue: StoredStateSetter<string>) => {
      const current = readStoredString(key, fallback);
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: string) => string)(current)
          : nextValue;

      writeStoredString(key, resolvedValue);
    },
    [fallback, key]
  );

  return [value, setValue];
}
```

## lib\clientTypes.ts

```typescript
export type ClientRow = {
  id: string;
  workspaceId: string;
  name: string;
  status: string;
  balance: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
};
```

## lib\db\aiReviewDrafts.ts

```typescript
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewDraft } from "@/lib/ai/reviewTypes";
import type { AiSourceType, InterpretationWarning, SuggestedAction } from "@/lib/ai/types";

export type AiReviewDraftStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Needs Changes";

export type AiReviewDraftExecutionStatus =
  | "Not Executed"
  | "Executed"
  | "Failed";

export type AiReviewDraft = {
  id: string;
  workspaceId: string;
  sourceType: AiSourceType;
  sourceId: string | null;
  sourceLabel: string | null;
  summary: string | null;
  status: AiReviewDraftStatus;
  confidence: number | null;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
  rawInput: string | null;
  modelProvider: string | null;
  modelName: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  executionStatus: AiReviewDraftExecutionStatus;
  executedAt: string | null;
  executedBy: string | null;
  executionResult: Record<string, unknown>;
  executionError: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbAiReviewDraft = {
  id: string;
  workspace_id: string;
  source_type: AiSourceType;
  source_id: string | null;
  source_label: string | null;
  summary: string | null;
  status: AiReviewDraftStatus;
  confidence: number | null;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
  raw_input: string | null;
  model_provider: string | null;
  model_name: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  execution_status?: AiReviewDraftExecutionStatus;
  executed_at?: string | null;
  executed_by?: string | null;
  execution_result?: Record<string, unknown> | null;
  execution_error?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateAiReviewDraftInput = {
  reviewDraft: ReviewDraft;
  sourceLabel?: string | null;
  rawInput?: string | null;
  modelProvider?: string | null;
  modelName?: string | null;
  createdBy?: string | null;
};

export type UpdateAiReviewDraftStatusInput = {
  id: string;
  workspaceId: string;
  status: AiReviewDraftStatus;
  reviewedBy?: string | null;
};

export type UpdateAiReviewDraftExecutionInput = {
  id: string;
  workspaceId: string;
  executionStatus: AiReviewDraftExecutionStatus;
  executedBy?: string | null;
  executionResult?: Record<string, unknown>;
  executionError?: string | null;
};

export type AiReviewDraftRevision = {
  id: string;
  sourceLabel: string | null;
  summary: string | null;
  actions: SuggestedAction[];
  warnings: InterpretationWarning[];
  changedBy: string | null;
  createdAt: string;
};

function dbToAiReviewDraft(row: DbAiReviewDraft): AiReviewDraft {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    sourceLabel: row.source_label,
    summary: row.summary,
    status: row.status,
    confidence: row.confidence,
    warnings: row.warnings ?? [],
    actions: row.actions ?? [],
    rawInput: row.raw_input,
    modelProvider: row.model_provider,
    modelName: row.model_name,
    createdBy: row.created_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    executionStatus: row.execution_status ?? "Not Executed",
    executedAt: row.executed_at ?? null,
    executedBy: row.executed_by ?? null,
    executionResult: row.execution_result ?? {},
    executionError: row.execution_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createReviewDraft(
  supabase: SupabaseClient,
  input: CreateAiReviewDraftInput
) {
  const { reviewDraft } = input;
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .insert({
      id: reviewDraft.id,
      workspace_id: reviewDraft.workspaceId,
      source_type: reviewDraft.sourceType,
      source_id: reviewDraft.sourceId ?? null,
      source_label: input.sourceLabel ?? null,
      summary: null,
      status: "Pending",
      confidence: reviewDraft.confidence,
      warnings: reviewDraft.warnings,
      actions: reviewDraft.actions,
      raw_input: input.rawInput ?? null,
      model_provider: input.modelProvider ?? null,
      model_name: input.modelName ?? null,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to create AI review draft.");
  }

  return dbToAiReviewDraft(data as DbAiReviewDraft);
}

export async function updateReviewDraftContent(
  supabase: SupabaseClient,
  input: {
    id: string;
    workspaceId: string;
    sourceLabel: string;
    summary: string;
    actions: SuggestedAction[];
  }
) {
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .update({
      source_label: input.sourceLabel.trim() || null,
      summary: input.summary.trim() || null,
      actions: input.actions,
    })
    .eq("id", input.id)
    .eq("workspace_id", input.workspaceId)
    .in("status", ["Pending", "Needs Changes"])
    .neq("execution_status", "Executed")
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to save review draft changes.");
  }
  return dbToAiReviewDraft(data as DbAiReviewDraft);
}

export async function getReviewDraftRevisions(
  supabase: SupabaseClient,
  workspaceId: string,
  draftId: string
) {
  const { data, error } = await supabase
    .from("ai_review_draft_revisions")
    .select("id, source_label, summary, actions, warnings, changed_by, created_at")
    .eq("workspace_id", workspaceId)
    .eq("review_draft_id", draftId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message || "Unable to load draft revisions.");
  return (data ?? []).map((row) => ({
    id: row.id,
    sourceLabel: row.source_label,
    summary: row.summary,
    actions: (row.actions ?? []) as SuggestedAction[],
    warnings: (row.warnings ?? []) as InterpretationWarning[],
    changedBy: row.changed_by,
    createdAt: row.created_at,
  })) as AiReviewDraftRevision[];
}

export async function updateReviewDraftExecution(
  supabase: SupabaseClient,
  input: UpdateAiReviewDraftExecutionInput
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .update({
      execution_status: input.executionStatus,
      executed_at:
        input.executionStatus === "Executed" || input.executionStatus === "Failed"
          ? now
          : null,
      executed_by: input.executedBy ?? null,
      execution_result: input.executionResult ?? {},
      execution_error: input.executionError ?? null,
    })
    .eq("id", input.id)
    .eq("workspace_id", input.workspaceId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to update AI review draft execution.");
  }

  return dbToAiReviewDraft(data as DbAiReviewDraft);
}

export async function getReviewDrafts(
  supabase: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Unable to load AI review drafts.");
  return ((data ?? []) as DbAiReviewDraft[]).map(dbToAiReviewDraft);
}

export async function getReviewDraftById(
  supabase: SupabaseClient,
  workspaceId: string,
  id: string
) {
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to load AI review draft.");
  return data ? dbToAiReviewDraft(data as DbAiReviewDraft) : null;
}

export async function updateReviewDraftStatus(
  supabase: SupabaseClient,
  input: UpdateAiReviewDraftStatusInput
) {
  const now = new Date().toISOString();
  const patch = {
    status: input.status,
    reviewed_by: input.reviewedBy ?? null,
    reviewed_at: now,
    approved_at: input.status === "Approved" ? now : null,
    rejected_at: input.status === "Rejected" ? now : null,
  };

  const { data, error } = await supabase
    .from("ai_review_drafts")
    .update(patch)
    .eq("id", input.id)
    .eq("workspace_id", input.workspaceId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to update AI review draft.");
  }

  return dbToAiReviewDraft(data as DbAiReviewDraft);
}
```

## lib\db\calendarEvents.ts

```typescript
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
export type ClientCalendarEvent = { id: string; workspaceId: string; clientId: string; clientName: string; title: string; date: string; time?: string };
type DbEvent = { id: string; workspace_id: string; client_id: string | null; client_name_snapshot: string | null; title: string; event_date: string; event_time: string | null };
const dbToEvent = (e: DbEvent): ClientCalendarEvent => ({ id: e.id, workspaceId: e.workspace_id, clientId: e.client_id ?? "", clientName: e.client_name_snapshot ?? "", title: e.title, date: e.event_date, time: e.event_time?.slice(0, 5) ?? "" });
export function createCalendarEventsRepository({ isSignedIn, supabase, localEvents, setLocalEvents }: { isSignedIn: boolean; supabase: SupabaseClient | null; localEvents: ClientCalendarEvent[]; setLocalEvents: Setter<ClientCalendarEvent[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getEvents(workspaceId: string) {
      if (!useDb) return localEvents.filter((e) => e.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("client_calendar_events").select("*").eq("workspace_id", workspaceId).order("event_date");
      if (error) throw new Error(error.message || "Unable to load events.");
      return ((data ?? []) as DbEvent[]).map(dbToEvent);
    },
    async createEvent(event: ClientCalendarEvent) {
      if (!useDb) return setLocalEvents((c) => [...c, event]), event;
      assertUuid(event.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbEvent>("calendar_event", { id: event.id, workspace_id: event.workspaceId, client_id: event.clientId || null, client_name_snapshot: event.clientName, title: event.title, event_date: event.date, event_time: event.time || null });
      return dbToEvent(data);
    },
    async updateEvent(event: ClientCalendarEvent) {
      if (!useDb) return setLocalEvents((c) => c.map((e) => e.id === event.id ? event : e)), event;
      assertUuid(event.workspaceId, "Workspace");
      assertUuid(event.id, "Calendar event");
      const data = await mutateSignedInRecord<DbEvent>("calendar_event", "update", {
        id: event.id,
        workspace_id: event.workspaceId,
        client_id: event.clientId || null,
        client_name_snapshot: event.clientName,
        title: event.title,
        event_date: event.date,
        event_time: event.time || null,
      });
      if (!data) throw new Error("Unable to update event.");
      return dbToEvent(data);
    },
    async deleteEvent(id: string, workspaceId?: string) {
      if (!useDb) return setLocalEvents((c) => c.filter((e) => e.id !== id)), true;
      if (!isUuid(id)) return true;
      await mutateSignedInRecord<boolean>("calendar_event", "delete", {
        id,
        workspace_id: workspaceId,
      });
      return true;
    },
  };
}
```

## lib\db\clients.ts

```typescript
"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ClientRow } from "@/lib/clientTypes";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";

type StoredStateSetter<T> = T | ((current: T) => T);

type ClientsRepositoryOptions = {
  isSignedIn: boolean;
  supabase: SupabaseClient | null;
  localClients: ClientRow[];
  setLocalClients: (value: StoredStateSetter<ClientRow[]>) => void;
};

type ClientDatabaseRow = {
  id: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ClientDatabaseWrite = {
  id?: string;
  workspace_id: string;
  name: string;
  status: string;
  balance_cents: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

function emptyToNull(value: string | undefined) {
  const trimmedValue = value?.trim() ?? "";
  return trimmedValue || null;
}

export function mapDatabaseClientToClientRow(
  client: ClientDatabaseRow
): ClientRow {
  return {
    id: client.id,
    workspaceId: client.workspace_id,
    name: client.name,
    status: client.status,
    balance: centsToMoneyString(client.balance_cents),
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    zip: client.zip ?? "",
    notes: client.notes ?? "",
    latitude: client.latitude ?? undefined,
    longitude: client.longitude ?? undefined,
  };
}

function mapClientRowToDatabaseWrite(client: ClientRow): ClientDatabaseWrite {
  return {
    id: client.id,
    workspace_id: client.workspaceId,
    name: client.name,
    status: client.status,
    balance_cents: moneyStringToCents(client.balance),
    email: emptyToNull(client.email),
    phone: emptyToNull(client.phone),
    address: emptyToNull(client.address),
    city: emptyToNull(client.city),
    state: emptyToNull(client.state),
    zip: emptyToNull(client.zip),
    notes: emptyToNull(client.notes),
    latitude: client.latitude ?? null,
    longitude: client.longitude ?? null,
  };
}

export function createClientsRepository({
  isSignedIn,
  supabase,
  localClients,
  setLocalClients,
}: ClientsRepositoryOptions) {
  const useDatabase = isSignedIn && supabase;

  return {
    async getClients(workspaceId: string) {
      if (!useDatabase) {
        return localClients.filter((client) => client.workspaceId === workspaceId);
      }
      if (!isUuid(workspaceId)) return [];

      const { data, error } = await supabase
        .from("clients")
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message || "Unable to load clients.");
      }

      return ((data ?? []) as ClientDatabaseRow[]).map(
        mapDatabaseClientToClientRow
      );
    },

    async getClientById(clientId: string, workspaceId?: string) {
      if (!useDatabase) {
        return (
          localClients.find(
            (client) =>
              client.id === clientId &&
              (!workspaceId || client.workspaceId === workspaceId)
          ) ?? null
        );
      }
      if (workspaceId && !isUuid(workspaceId)) return null;
      if (!isUuid(clientId)) return null;

      let query = supabase
        .from("clients")
        .select(
          "id, workspace_id, name, status, balance_cents, email, phone, address, city, state, zip, notes, latitude, longitude"
        )
        .eq("id", clientId)
        .limit(1);

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw new Error(error.message || "Unable to load client.");
      }

      return data ? mapDatabaseClientToClientRow(data as ClientDatabaseRow) : null;
    },

    async createClient(client: ClientRow) {
      if (!useDatabase) {
        setLocalClients((current) => [...current, client]);
        return client;
      }
      assertUuid(client.workspaceId, "Workspace");

      const data = await createSignedInRecord<ClientDatabaseRow>(
        "client",
        mapClientRowToDatabaseWrite(client)
      );
      return mapDatabaseClientToClientRow(data);
    },

    async updateClient(client: ClientRow) {
      if (!useDatabase) {
        setLocalClients((current) =>
          current.map((currentClient) =>
            currentClient.id === client.id ? client : currentClient
          )
        );
        return client;
      }
      assertUuid(client.workspaceId, "Workspace");

      const updateValues = mapClientRowToDatabaseWrite(client);
      delete updateValues.id;
      const data = await mutateSignedInRecord<ClientDatabaseRow>("client", "update", {
        ...updateValues,
        id: client.id,
        workspace_id: client.workspaceId,
      });
      if (!data) throw new Error("Unable to update client.");
      return mapDatabaseClientToClientRow(data);
    },

    async deleteClient(clientId: string, workspaceId?: string) {
      if (!useDatabase) {
        setLocalClients((current) =>
          current.filter((client) => client.id !== clientId)
        );
        return true;
      }
      if (!isUuid(clientId)) return true;
      if (workspaceId && !isUuid(workspaceId)) return true;

      await mutateSignedInRecord<boolean>("client", "delete", {
        id: clientId,
        workspace_id: workspaceId,
      });

      return true;
    },
  };
}
```

## lib\db\documents.ts

```typescript
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
export type DocumentProcessingStatus = "uploaded" | "queued" | "processing" | "needs_review" | "reviewed" | "failed";
export type StoredDocument = { id: string; workspaceId: string; name: string; detectedType: string; extractionStatus: string; fileName: string; notes: string; clientId: string; jobId: string; invoiceId?: string; createdAt: string; uploadedBy?: string; status?: string; storageBucket?: string; storagePath?: string; mimeType?: string; sizeBytes?: number; storageStatus?: string; processingStatus?: DocumentProcessingStatus; extractedText?: string; extractedJson?: Record<string, unknown> | null; ocrProvider?: string; aiJobId?: string; reviewedAt?: string; reviewedBy?: string; confidence?: number | null; documentType?: string };
export type DbDoc = { id: string; workspace_id: string; client_id: string | null; job_id: string | null; invoice_id?: string | null; name: string; detected_type: string | null; extraction_status: string | null; file_name: string | null; notes: string | null; created_at: string; uploaded_by?: string | null; status?: string | null; storage_bucket: string | null; storage_path: string | null; mime_type: string | null; size_bytes: number | null; processing_status?: DocumentProcessingStatus | null; extracted_text?: string | null; extracted_json?: Record<string, unknown> | null; ocr_provider?: string | null; ai_job_id?: string | null; reviewed_at?: string | null; reviewed_by?: string | null; confidence?: number | null; document_type?: string | null };
export const dbToDoc = (d: DbDoc): StoredDocument => ({ id: d.id, workspaceId: d.workspace_id, clientId: d.client_id ?? "", jobId: d.job_id ?? "", invoiceId: d.invoice_id ?? "", name: d.name, detectedType: d.detected_type ?? "Pending", extractionStatus: d.extraction_status ?? "Waiting for extraction", fileName: d.file_name ?? "No file selected", notes: d.notes ?? "", createdAt: d.created_at, uploadedBy: d.uploaded_by ?? "", status: d.status ?? "Metadata available", storageBucket: d.storage_bucket ?? "", storagePath: d.storage_path ?? "", mimeType: d.mime_type ?? "", sizeBytes: d.size_bytes ?? 0, storageStatus: d.storage_path ? "Stored" : "Pending storage setup", processingStatus: d.processing_status ?? "uploaded", extractedText: d.extracted_text ?? "", extractedJson: d.extracted_json ?? null, ocrProvider: d.ocr_provider ?? "", aiJobId: d.ai_job_id ?? "", reviewedAt: d.reviewed_at ?? "", reviewedBy: d.reviewed_by ?? "", confidence: d.confidence ?? null, documentType: d.document_type ?? d.detected_type ?? "" });
function docToDb(doc: StoredDocument) {
  return { client_id: doc.clientId || null, job_id: doc.jobId || null, invoice_id: doc.invoiceId || null, name: doc.name, detected_type: doc.detectedType, extraction_status: doc.extractionStatus, file_name: doc.fileName, notes: doc.notes, uploaded_by: doc.uploadedBy || null, status: doc.status || "Metadata available", storage_bucket: doc.storageBucket || null, storage_path: doc.storagePath || null, mime_type: doc.mimeType || null, size_bytes: doc.sizeBytes ?? null, processing_status: doc.processingStatus ?? "uploaded", extracted_text: doc.extractedText || null, extracted_json: doc.extractedJson ?? null, ocr_provider: doc.ocrProvider || null, ai_job_id: doc.aiJobId || null, reviewed_at: doc.reviewedAt || null, reviewed_by: doc.reviewedBy || null, confidence: doc.confidence ?? null, document_type: doc.documentType || doc.detectedType || null };
}
export function createDocumentsRepository({ isSignedIn, supabase, localDocuments, setLocalDocuments }: { isSignedIn: boolean; supabase: SupabaseClient | null; localDocuments: StoredDocument[]; setLocalDocuments: Setter<StoredDocument[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getDocuments(workspaceId: string) {
      if (!useDb) return localDocuments.filter((d) => d.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("documents").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load documents.");
      return ((data ?? []) as DbDoc[]).map(dbToDoc);
    },
    async createDocument(doc: StoredDocument) {
      if (!useDb) return setLocalDocuments((c) => [doc, ...c]), doc;
      assertUuid(doc.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbDoc>("document", { id: doc.id, workspace_id: doc.workspaceId, ...docToDb(doc) });
      return dbToDoc(data);
    },
    async updateDocument(doc: StoredDocument) {
      if (!useDb) return setLocalDocuments((c) => c.map((d) => d.id === doc.id ? doc : d)), doc;
      assertUuid(doc.workspaceId, "Workspace");
      assertUuid(doc.id, "Document");
      const data = await mutateSignedInRecord<DbDoc>("document", "update", {
        id: doc.id,
        workspace_id: doc.workspaceId,
        ...docToDb(doc),
      });
      if (!data) throw new Error("Unable to update document.");
      return dbToDoc(data);
    },
    async deleteDocument(id: string, workspaceId?: string) {
      if (!useDb) return setLocalDocuments((c) => c.filter((d) => d.id !== id)), true;
      if (!isUuid(id)) return true;
      await mutateSignedInRecord<boolean>("document", "delete", {
        id,
        workspace_id: workspaceId,
      });
      return true;
    },
  };
}
```

## lib\db\expenses.ts

```typescript
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense } from "@/lib/expenseTypes";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
type DbExpense = { id: string; workspace_id: string; description: string; category: string; amount_cents: number; expense_date?: string | null; notes?: string | null };
export type ExpenseRow = Expense & { id?: string };
const keyOf = (e: ExpenseRow) => e.id ?? `${e.workspaceId}-${e.description}`;
const dbToExpense = (e: DbExpense): ExpenseRow => ({ id: e.id, workspaceId: e.workspace_id, description: e.description, category: e.category, amount: centsToMoneyString(e.amount_cents) });
export function createExpensesRepository({ isSignedIn, supabase, localExpenses, setLocalExpenses }: { isSignedIn: boolean; supabase: SupabaseClient | null; localExpenses: ExpenseRow[]; setLocalExpenses: Setter<ExpenseRow[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getExpenses(workspaceId: string) {
      if (!useDb) return localExpenses.filter((e) => e.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("expenses").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load expenses.");
      return ((data ?? []) as DbExpense[]).map(dbToExpense);
    },
    async createExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => [...c, expense]), expense;
      assertUuid(expense.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbExpense>("expense", { workspace_id: expense.workspaceId, description: expense.description, category: expense.category, amount_cents: moneyStringToCents(expense.amount) });
      return dbToExpense(data);
    },
    async updateExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => c.map((e) => keyOf(e) === keyOf(expense) ? expense : e)), expense;
      if (!expense.id || !isUuid(expense.id)) return null;
      const data = await mutateSignedInRecord<DbExpense>("expense", "update", {
        id: expense.id,
        workspace_id: expense.workspaceId,
        description: expense.description,
        category: expense.category,
        amount_cents: moneyStringToCents(expense.amount),
      });
      if (!data) throw new Error("Unable to update expense.");
      return dbToExpense(data);
    },
    async deleteExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => c.filter((e) => keyOf(e) !== keyOf(expense))), true;
      if (!expense.id || !isUuid(expense.id)) return false;
      await mutateSignedInRecord<boolean>("expense", "delete", {
        id: expense.id,
        workspace_id: expense.workspaceId,
      });
      return true;
    },
  };
}
```

## lib\db\ids.ts

```typescript
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined) {
  return Boolean(value && uuidPattern.test(value));
}

export function assertUuid(value: string | null | undefined, label: string) {
  if (!isUuid(value)) {
    throw new Error(`${label} is not ready yet. Create or select a workspace first.`);
  }
  return value;
}
```

## lib\db\inventory.ts

```typescript
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
export type InventoryRow = { id?: string; name: string; currentQty: number | null; targetQty: number | null; warning: boolean; workspaceId: string; autoGenerated?: boolean };
type DbItem = { id: string; workspace_id: string; name: string; current_qty: number | null; target_qty: number | null };
const dbToItem = (i: DbItem): InventoryRow => ({ id: i.id, workspaceId: i.workspace_id, name: i.name, currentQty: i.current_qty, targetQty: i.target_qty, warning: (i.current_qty ?? 0) < (i.target_qty ?? 0) });
export function createInventoryRepository({ isSignedIn, supabase, localItems, setLocalItems }: { isSignedIn: boolean; supabase: SupabaseClient | null; localItems: InventoryRow[]; setLocalItems: Setter<InventoryRow[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getInventoryItems(workspaceId: string) {
      if (!useDb) return localItems.filter((i) => i.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("inventory_items").select("*").eq("workspace_id", workspaceId).order("name");
      if (error) throw new Error(error.message || "Unable to load inventory.");
      return ((data ?? []) as DbItem[]).map(dbToItem);
    },
    async createInventoryItem(item: InventoryRow) {
      if (!useDb) return setLocalItems((c) => [...c, item]), item;
      assertUuid(item.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbItem>("inventory_item", { workspace_id: item.workspaceId, name: item.name, current_qty: item.currentQty, target_qty: item.targetQty });
      return dbToItem(data);
    },
    async updateInventoryItem(item: InventoryRow) {
      if (!useDb) return setLocalItems((c) => c.map((i) => i.workspaceId === item.workspaceId && i.name.toLowerCase() === item.name.toLowerCase() ? item : i)), item;
      assertUuid(item.workspaceId, "Workspace");
      const data = await mutateSignedInRecord<DbItem>("inventory_item", "update", {
        id: item.id,
        workspace_id: item.workspaceId,
        name: item.name,
        current_qty: item.currentQty,
        target_qty: item.targetQty,
      });
      if (!data) throw new Error("Unable to update inventory.");
      return dbToItem(data);
    },
    async deleteInventoryItem(item: InventoryRow) {
      if (!useDb) return setLocalItems((c) => c.filter((i) => !(i.workspaceId === item.workspaceId && i.name === item.name))), true;
      assertUuid(item.workspaceId, "Workspace");
      await mutateSignedInRecord<boolean>("inventory_item", "delete", {
        id: item.id,
        workspace_id: item.workspaceId,
        name: item.name,
      });
      return true;
    },
  };
}
```

## lib\db\invoices.ts

```typescript
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceLineItem, InvoiceRow } from "@/lib/frontierInvoices";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
type DbInvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  sort_order: number;
};
type DbInvoice = {
  id: string;
  workspace_id: string;
  client_id: string | null;
  job_id: string | null;
  invoice_number: string;
  invoice_date: string;
  company_name: string | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  company_zip: string | null;
  company_phone: string | null;
  company_email: string | null;
  bill_to_name: string | null;
  bill_to_company: string | null;
  bill_to_address: string | null;
  bill_to_city: string | null;
  bill_to_state: string | null;
  bill_to_zip: string | null;
  bill_to_phone: string | null;
  bill_to_email: string | null;
  discount_type: InvoiceRow["discountType"];
  discount_value: number;
  tax_rate: number;
  footer_message: string | null;
  contact_message: string | null;
  status: InvoiceRow["status"];
  invoice_line_items?: DbInvoiceLine[];
};
const selectInvoice = "*, invoice_line_items(*)";
function dbToInvoice(i: DbInvoice): InvoiceRow {
  return { id: i.id, workspaceId: i.workspace_id, invoiceNumber: i.invoice_number, invoiceDate: i.invoice_date, jobId: i.job_id ?? undefined, jobName: undefined, sourceClientId: i.client_id ?? undefined, companyName: i.company_name ?? "", companyAddress: i.company_address ?? "", companyCity: i.company_city ?? "", companyState: i.company_state ?? "", companyZip: i.company_zip ?? "", companyPhone: i.company_phone ?? "", companyEmail: i.company_email ?? "", billToName: i.bill_to_name ?? "", billToCompany: i.bill_to_company ?? "", billToAddress: i.bill_to_address ?? "", billToCity: i.bill_to_city ?? "", billToState: i.bill_to_state ?? "", billToZip: i.bill_to_zip ?? "", billToPhone: i.bill_to_phone ?? "", billToEmail: i.bill_to_email ?? "", lineItems: (i.invoice_line_items ?? []).sort((a, b) => a.sort_order - b.sort_order).map((l) => ({ id: l.id, description: l.description, quantity: Number(l.quantity), unitPrice: centsToMoneyString(l.unit_price_cents) })), discountType: i.discount_type, discountValue: String(i.discount_value ?? 0), taxRate: String(i.tax_rate ?? 0), footerMessage: i.footer_message ?? "", contactMessage: i.contact_message ?? "", status: i.status };
}
function invoiceToDb(i: InvoiceRow) {
  return { id: i.id, workspace_id: i.workspaceId, client_id: i.sourceClientId ?? null, job_id: i.jobId ?? null, invoice_number: i.invoiceNumber, invoice_date: i.invoiceDate, company_name: i.companyName, company_address: i.companyAddress, company_city: i.companyCity, company_state: i.companyState, company_zip: i.companyZip, company_phone: i.companyPhone, company_email: i.companyEmail, bill_to_name: i.billToName, bill_to_company: i.billToCompany, bill_to_address: i.billToAddress, bill_to_city: i.billToCity, bill_to_state: i.billToState, bill_to_zip: i.billToZip, bill_to_phone: i.billToPhone, bill_to_email: i.billToEmail, discount_type: i.discountType, discount_value: Number(i.discountValue) || 0, tax_rate: Number(i.taxRate) || 0, footer_message: i.footerMessage, contact_message: i.contactMessage, status: i.status };
}
export function createInvoicesRepository({ isSignedIn, supabase, localInvoices, setLocalInvoices }: { isSignedIn: boolean; supabase: SupabaseClient | null; localInvoices: InvoiceRow[]; setLocalInvoices: Setter<InvoiceRow[]> }) {
  const useDb = isSignedIn && supabase;
  function invoiceLinesToRpcPayload(invoice: InvoiceRow) {
    return invoice.lineItems.map((l: InvoiceLineItem, index) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unit_price_cents: moneyStringToCents(l.unitPrice),
      sort_order: index,
    }));
  }
  async function saveInvoiceWithLines(invoice: InvoiceRow) {
    if (!useDb) return invoice;
    const data = await mutateSignedInRecord<DbInvoice>("invoice", "update", {
      invoice: invoiceToDb(invoice),
      lineItems: invoiceLinesToRpcPayload(invoice),
    });
    if (!data) throw new Error("Unable to save invoice.");
    return dbToInvoice(data);
  }
  return {
    async getInvoices(workspaceId: string) {
      if (!useDb) return localInvoices.filter((i) => i.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("invoices").select(selectInvoice).eq("workspace_id", workspaceId).order("invoice_date", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load invoices.");
      return (data ?? []).map(dbToInvoice);
    },
    async getInvoiceById(id: string, workspaceId?: string) {
      if (!useDb) return localInvoices.find((i) => i.id === id && (!workspaceId || i.workspaceId === workspaceId)) ?? null;
      if (!isUuid(id)) return null;
      if (workspaceId && !isUuid(workspaceId)) return null;
      let query = supabase.from("invoices").select(selectInvoice).eq("id", id);
      if (workspaceId) query = query.eq("workspace_id", workspaceId);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message || "Unable to load invoice.");
      return data ? dbToInvoice(data) : null;
    },
    async createInvoice(invoice: InvoiceRow) {
      if (!useDb) return setLocalInvoices((c) => [...c, invoice]), invoice;
      assertUuid(invoice.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbInvoice>("invoice", {
        invoice: invoiceToDb(invoice),
        lineItems: invoiceLinesToRpcPayload(invoice),
      });
      return dbToInvoice(data);
    },
    async updateInvoice(invoice: InvoiceRow) {
      if (!useDb) return setLocalInvoices((c) => c.map((i) => i.id === invoice.id ? invoice : i)), invoice;
      assertUuid(invoice.workspaceId, "Workspace");
      assertUuid(invoice.id, "Invoice");
      return saveInvoiceWithLines(invoice);
    },
    async deleteInvoice(id: string, workspaceId?: string) {
      if (!useDb) return setLocalInvoices((c) => c.filter((i) => i.id !== id)), true;
      if (!isUuid(id)) return true;
      await mutateSignedInRecord<boolean>("invoice", "delete", {
        invoice: { id, workspace_id: workspaceId },
      });
      return true;
    },
  };
}
```

## lib\db\jobs.ts

```typescript
"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { moneyStringToCents, centsToMoneyString } from "@/lib/db/money";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
import type { Job, JobMaterial } from "@/lib/jobTypes";

type Setter<T> = (value: T | ((current: T) => T)) => void;
type Options = { isSignedIn: boolean; supabase: SupabaseClient | null; localJobs: Job[]; setLocalJobs: Setter<Job[]> };

type DbJob = { id: string; workspace_id: string; client_id: string | null; client_name_snapshot: string | null; name: string; status: Job["status"]; estimated_value_cents: number; scheduled_date: string | null; scheduled_time: string | null; notes: string | null; job_materials?: DbMaterial[] };
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
    time: row.scheduled_time?.slice(0, 5) ?? "",
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
    scheduled_time: job.time || null,
    notes: job.notes ?? null,
  };
}

export function createJobsRepository({ isSignedIn, supabase, localJobs, setLocalJobs }: Options) {
  const useDb = isSignedIn && supabase;
  function materialsToRpcPayload(materials: JobMaterial[]) {
    return materials.map((material) => ({
      name: material.name,
      quantity: material.quantity,
    }));
  }
  async function saveJobWithMaterials(job: Job) {
    if (!useDb) return job;
    const data = await mutateSignedInRecord<DbJob>("job", "update", {
      job: jobToDb(job),
      materials: materialsToRpcPayload(job.materials ?? []),
    });
    if (!data) throw new Error("Unable to save job.");
    return dbToJob(data);
  }
  return {
    async getJobs(workspaceId: string) {
      if (!useDb) return localJobs.filter((j) => j.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("jobs").select("*, job_materials(*)").eq("workspace_id", workspaceId).order("scheduled_date", { ascending: true });
      if (error) throw new Error(error.message || "Unable to load jobs.");
      return ((data ?? []) as DbJob[]).map(dbToJob);
    },
    async getJobById(id: string, workspaceId?: string) {
      if (!useDb) return localJobs.find((j) => j.id === id && (!workspaceId || j.workspaceId === workspaceId)) ?? null;
      if (!isUuid(id)) return null;
      if (workspaceId && !isUuid(workspaceId)) return null;
      let query = supabase.from("jobs").select("*, job_materials(*)").eq("id", id);
      if (workspaceId) query = query.eq("workspace_id", workspaceId);
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message || "Unable to load job.");
      return data ? dbToJob(data as DbJob) : null;
    },
    async createJob(job: Job) {
      if (!useDb) return setLocalJobs((c) => [...c, job]), job;
      assertUuid(job.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbJob>("job", {
        job: jobToDb(job),
        materials: materialsToRpcPayload(job.materials ?? []),
      });
      return dbToJob(data);
    },
    async updateJob(id: string, job: Job) {
      if (!useDb) return setLocalJobs((c) => c.map((j) => (j.id === id ? job : j))), job;
      assertUuid(job.workspaceId, "Workspace");
      assertUuid(id, "Job");
      return saveJobWithMaterials({ ...job, id });
    },
    async deleteJob(id: string, workspaceId?: string) {
      if (!useDb) return setLocalJobs((c) => c.filter((j) => j.id !== id)), true;
      if (!isUuid(id)) return true;
      await mutateSignedInRecord<boolean>("job", "delete", {
        job: { id, workspace_id: workspaceId },
      });
      return true;
    },
    async getJobMaterials(jobId: string) {
      if (!useDb) return localJobs.find((j) => j.id === jobId)?.materials ?? [];
      if (!isUuid(jobId)) return [];
      const { data, error } = await supabase.from("job_materials").select("*").eq("job_id", jobId);
      if (error) throw new Error(error.message || "Unable to load job materials.");
      return ((data ?? []) as DbMaterial[]).map((m) => ({ name: m.name, quantity: Number(m.quantity) }));
    },
    async saveJobMaterials(jobId: string, workspaceId: string, materials: JobMaterial[]) {
      if (!useDb) return true;
      assertUuid(jobId, "Job");
      assertUuid(workspaceId, "Workspace");
      await mutateSignedInRecord<boolean>("job_materials", "update", {
        workspace_id: workspaceId,
        job_id: jobId,
        materials: materials.map((m) => ({ name: m.name, quantity: m.quantity })),
      });
      return true;
    },
    async deleteJobMaterials(jobId: string, workspaceId?: string) {
      if (!useDb) return true;
      assertUuid(jobId, "Job");
      await mutateSignedInRecord<boolean>("job_materials", "delete", {
        workspace_id: workspaceId,
        job_id: jobId,
      });
      return true;
    },
  };
}
```

## lib\db\money.ts

```typescript
"use client";

export function moneyStringToCents(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 100) : 0;
  if (!value) return 0;
  const numericValue = Number(String(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(numericValue) ? Math.round(numericValue * 100) : 0;
}

export function centsToMoneyString(value: number | null | undefined) {
  const cents = Number.isFinite(value) ? value ?? 0 : 0;
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
```

## lib\db\routes.ts

```typescript
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
export type RoutePlan = { id: string; workspaceId: string; name: string; googleMapsUrl?: string; totalDistanceMeters?: number | null; totalDurationSeconds?: number | null; notes?: string; stops: RouteStop[] };
export type RouteStop = { id?: string; clientId: string; stopOrder: number; latitude: number | null; longitude: number | null; addressSnapshot: string };
type DbRouteStop = { id: string; client_id: string | null; stop_order: number; latitude: number | null; longitude: number | null; address_snapshot: string | null };
type DbRoute = { id: string; workspace_id: string; name: string; google_maps_url: string | null; total_distance_meters: number | null; total_duration_seconds: number | null; notes: string | null; route_plan_stops?: DbRouteStop[] };
export function createRoutesRepository({ isSignedIn, supabase }: { isSignedIn: boolean; supabase: SupabaseClient | null }) {
  const useDb = isSignedIn && supabase;
  function dbToRoute(r: DbRoute): RoutePlan {
    return { id: r.id, workspaceId: r.workspace_id, name: r.name, googleMapsUrl: r.google_maps_url ?? undefined, totalDistanceMeters: r.total_distance_meters, totalDurationSeconds: r.total_duration_seconds, notes: r.notes ?? "", stops: (r.route_plan_stops ?? []).map((s) => ({ id: s.id, clientId: s.client_id ?? "", stopOrder: s.stop_order, latitude: s.latitude, longitude: s.longitude, addressSnapshot: s.address_snapshot ?? "" })) };
  }
  function routeToDb(route: RoutePlan) {
    return {
      id: route.id,
      workspace_id: route.workspaceId,
      name: route.name,
      google_maps_url: route.googleMapsUrl ?? null,
      total_distance_meters: route.totalDistanceMeters ?? null,
      total_duration_seconds: route.totalDurationSeconds ?? null,
      notes: route.notes ?? null,
    };
  }
  function stopsToDb(route: RoutePlan) {
    return route.stops.map((s) => ({
      id: s.id ?? crypto.randomUUID(),
      client_id: s.clientId || null,
      stop_order: s.stopOrder,
      latitude: s.latitude,
      longitude: s.longitude,
      address_snapshot: s.addressSnapshot,
    }));
  }
  async function saveRouteWithStops(route: RoutePlan) {
    if (!useDb) return route;
    const data = await mutateSignedInRecord<DbRoute>("route_plan", "update", {
      route: {
        id: route.id,
        workspace_id: route.workspaceId,
        name: route.name,
        google_maps_url: route.googleMapsUrl ?? null,
        total_distance_meters: route.totalDistanceMeters ?? null,
        total_duration_seconds: route.totalDurationSeconds ?? null,
        notes: route.notes ?? null,
      },
      stops: route.stops.map((s) => ({
        id: s.id ?? "",
        client_id: s.clientId || "",
        stop_order: s.stopOrder,
        latitude: s.latitude,
        longitude: s.longitude,
        address_snapshot: s.addressSnapshot,
      })),
    });
    if (!data) throw new Error("Unable to save route.");
    return dbToRoute(data);
  }
  return {
    async getRoutes(workspaceId: string) {
      if (!useDb) return [] as RoutePlan[];
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("route_plans").select("*, route_plan_stops(*)").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load routes.");
      return ((data ?? []) as DbRoute[]).map(dbToRoute);
    },
    async createRoute(route: RoutePlan) {
      if (!useDb) return route;
      assertUuid(route.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbRoute>("route_plan", {
        route: routeToDb(route),
        stops: stopsToDb(route),
      });
      return dbToRoute(data);
    },
    async updateRoute(route: RoutePlan) {
      if (!useDb) return route;
      assertUuid(route.workspaceId, "Workspace");
      assertUuid(route.id, "Route");
      return saveRouteWithStops(route);
    },
    async deleteRoute(id: string, workspaceId?: string) {
      if (!useDb) return true;
      if (!isUuid(id)) return true;
      await mutateSignedInRecord<boolean>("route_plan", "delete", {
        route: { id, workspace_id: workspaceId },
      });
      return true;
    },
  };
}
```

## lib\db\serverCreate.ts

```typescript
"use client";

type ServerCreateResponse<T> = {
  data?: T;
  error?: string;
};

export async function createSignedInRecord<T>(
  entity: string,
  payload: Record<string, unknown>
) {
  const response = await fetch("/api/data/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, payload }),
  });
  const result = (await response.json()) as ServerCreateResponse<T>;

  if (!response.ok || !result.data) {
    throw new Error(result.error || `Unable to create ${entity}.`);
  }

  return result.data;
}
```

## lib\db\serverMutate.ts

```typescript
"use client";

type ServerMutationResponse<T> = {
  data?: T;
  error?: string;
};

export async function mutateSignedInRecord<T>(
  entity: string,
  operation: "update" | "delete",
  payload: Record<string, unknown>
) {
  const response = await fetch("/api/data/mutate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, operation, payload }),
  });
  const result = (await response.json()) as ServerMutationResponse<T>;

  if (!response.ok) {
    throw new Error(result.error || `Unable to ${operation} ${entity}.`);
  }

  return result.data;
}
```

## lib\demo\inventory.ts

```typescript
// lib/demo/inventory.ts

export type InventoryItem = {
  name: string;
  currentQty: number;
  targetQty: number;
  warning: boolean;
  workspaceId: string;
};

export const inventory: InventoryItem[] = [
  // LANDSCAPING

  {
    name: "Gasoline (gallons)",
    currentQty: 20,
    targetQty: 40,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Mulch (cubic yards)",
    currentQty: 12,
    targetQty: 50,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Fertilizer (50lb bags)",
    currentQty: 8,
    targetQty: 25,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Trimmer Line",
    currentQty: 6,
    targetQty: 15,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Topsoil (cubic yards)",
    currentQty: 22,
    targetQty: 20,
    warning: false,
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    name: "Salt Bags",
    currentQty: 18,
    targetQty: 80,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Ice Melt Buckets",
    currentQty: 10,
    targetQty: 30,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Snow Shovels",
    currentQty: 14,
    targetQty: 12,
    warning: false,
    workspaceId: "snow-removal",
  },
  {
    name: "Fuel (gallons)",
    currentQty: 30,
    targetQty: 50,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Hydraulic Fluid",
    currentQty: 12,
    targetQty: 10,
    warning: false,
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    name: "HVAC Filters",
    currentQty: 22,
    targetQty: 40,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Light Bulbs",
    currentQty: 60,
    targetQty: 50,
    warning: false,
    workspaceId: "properties",
  },
  {
    name: "Smoke Detectors",
    currentQty: 8,
    targetQty: 20,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Paint (gallons)",
    currentQty: 14,
    targetQty: 10,
    warning: false,
    workspaceId: "properties",
  },
  {
    name: "Air Fresheners",
    currentQty: 5,
    targetQty: 15,
    warning: true,
    workspaceId: "properties",
  },
];
```

## lib\expenses.ts

```typescript
// lib/expenses.ts

import type { Expense } from "@/lib/expenseTypes";

export type { Expense } from "@/lib/expenseTypes";

export const expenses: Expense[] = [
  // LANDSCAPING

  {
    description: "Mulch Bulk Order",
    category: "Materials",
    amount: "$1,750",
    workspaceId: "landscaping",
  },
  {
    description: "Fuel For Fleet",
    category: "Fuel",
    amount: "$420",
    workspaceId: "landscaping",
  },
  {
    description: "Trimmer Line Restock",
    category: "Materials",
    amount: "$180",
    workspaceId: "landscaping",
  },
  {
    description: "Equipment Maintenance",
    category: "Equipment",
    amount: "$320",
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    description: "Salt Bulk Order",
    category: "Materials",
    amount: "$900",
    workspaceId: "snow-removal",
  },
  {
    description: "Snow Plow Maintenance",
    category: "Equipment",
    amount: "$380",
    workspaceId: "snow-removal",
  },
  {
    description: "Diesel Fuel",
    category: "Fuel",
    amount: "$540",
    workspaceId: "snow-removal",
  },
  {
    description: "Hydraulic Repair",
    category: "Equipment",
    amount: "$650",
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    description: "Monthly Property Insurance",
    category: "Insurance",
    amount: "$650",
    workspaceId: "properties",
  },
  {
    description: "HVAC Service Contract",
    category: "Maintenance",
    amount: "$1,200",
    workspaceId: "properties",
  },
  {
    description: "Lighting Replacement",
    category: "Materials",
    amount: "$340",
    workspaceId: "properties",
  },
  {
    description: "Parking Lot Repairs",
    category: "Maintenance",
    amount: "$875",
    workspaceId: "properties",
  },
];
```

## lib\expenseTypes.ts

```typescript
export type Expense = {
  description: string;
  category: string;
  amount: string;
  workspaceId: string;
};
```

## lib\frontierClients.ts

```typescript
import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";
import { formatCurrency } from "@/lib/frontierInvoices";
import type { ClientRow } from "@/lib/clientTypes";

export type { ClientRow } from "@/lib/clientTypes";

export const clientStatuses = ["Lead", "Active", "Inactive"] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export function safeParseClients(value: string | null): ClientRow[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadClients() {
  return readStoredJson(storageKeys.clients, [] as ClientRow[]);
}

export function saveClients(clients: ClientRow[]) {
  writeStoredJson(storageKeys.clients, clients);
}

export function formatClientBalance(value: string) {
  const numericValue = Number(value.replace(/[$,]/g, ""));

  if (Number.isNaN(numericValue)) {
    return "$0";
  }

  return formatCurrency(numericValue).replace(".00", "");
}

export function normalizeName(value: string) {
  return value.trim().toLowerCase();
}
```

## lib\frontierInvoices.ts

```typescript
import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";

export const invoiceStatuses = ["Estimate", "Draft", "Sent", "Overdue", "Paid"] as const;
export const discountTypes = ["None", "Percent", "Fixed"] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type DiscountType = (typeof discountTypes)[number];

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
};

export type InvoiceRow = {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  invoiceDate: string;

  jobId?: string;
  jobName?: string;
  sourceClientId?: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;

  billToName: string;
  billToCompany: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToZip: string;
  billToPhone: string;
  billToEmail: string;

  lineItems: InvoiceLineItem[];

  discountType: DiscountType;
  discountValue: string;
  taxRate: string;

  footerMessage: string;
  contactMessage: string;
  status: InvoiceStatus;
};

export type InvoiceSetupDraft = Omit<
  InvoiceRow,
  "lineItems" | "discountType" | "discountValue" | "taxRate" | "status"
>;

export function moneyToNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  return Number(value.replace(/[$,%\s,]/g, "")) || 0;
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoneyNumber(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getInvoiceClientName(invoice: Pick<InvoiceRow, "billToCompany" | "billToName">) {
  return invoice.billToCompany || invoice.billToName || "-";
}

export function getLineTotal(item: InvoiceLineItem) {
  return item.quantity * moneyToNumber(item.unitPrice);
}

export function getSubtotal(lineItems: InvoiceLineItem[]) {
  return lineItems.reduce((total, item) => total + getLineTotal(item), 0);
}

export function getDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: string
) {
  const value = moneyToNumber(discountValue);

  if (discountType === "Percent") {
    return Math.min(subtotal * (value / 100), subtotal);
  }

  if (discountType === "Fixed") {
    return Math.min(value, subtotal);
  }

  return 0;
}

export function getTaxAmount(afterDiscountSubtotal: number, taxRate: string) {
  const rate = moneyToNumber(taxRate);
  return afterDiscountSubtotal * (rate / 100);
}

export function getInvoiceTotals(invoice: InvoiceRow) {
  const subtotal = getSubtotal(invoice.lineItems || []);
  const discount = getDiscountAmount(
    subtotal,
    invoice.discountType || "None",
    invoice.discountValue || "0"
  );
  const taxableSubtotal = Math.max(subtotal - discount, 0);
  const tax = getTaxAmount(taxableSubtotal, invoice.taxRate || "0");
  const total = taxableSubtotal + tax;

  return {
    subtotal,
    discount,
    taxableSubtotal,
    tax,
    total,
  };
}

export function safeParseInvoices(value: string | null): InvoiceRow[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadSavedInvoices() {
  return readStoredJson(storageKeys.invoices, [] as InvoiceRow[]);
}

export function saveSavedInvoices(invoices: InvoiceRow[]) {
  writeStoredJson(storageKeys.invoices, invoices);
}
```

## lib\geocoding\address.ts

```typescript
import type { GeocodeInput } from "@/lib/geocoding/types";

export function normalizeAddressPart(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function buildAddressCacheKey(input: GeocodeInput) {
  const parts = [
    input.street ?? input.fullAddress,
    input.city,
    input.state,
    input.zip,
    input.country ?? "us",
  ].map(normalizeAddressPart);

  return parts.join("|");
}

export function buildAddressQuery(input: GeocodeInput) {
  if (input.fullAddress?.trim()) {
    return input.fullAddress.trim().replace(/\s+/g, " ");
  }

  return [input.street, input.city, input.state, input.zip, input.country ?? "US"]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ");
}
```

## lib\geocoding\cache.ts

```typescript
import type { GeocodeResult } from "@/lib/geocoding/types";

type CacheEntry = {
  result: GeocodeResult;
  expiresAt: number;
};

const geocodeCache = new Map<string, CacheEntry>();

function getTtlMs() {
  const days = Number(process.env.GEOCODE_CACHE_TTL_DAYS ?? "30");
  const normalizedDays = Number.isFinite(days) && days > 0 ? days : 30;
  return normalizedDays * 24 * 60 * 60 * 1000;
}

export function getCachedGeocode(cacheKey: string) {
  const cached = geocodeCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    geocodeCache.delete(cacheKey);
    return null;
  }
  return cached.result;
}

export function setCachedGeocode(cacheKey: string, result: GeocodeResult) {
  geocodeCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + getTtlMs(),
  });
}
```

## lib\geocoding\geocodeFarm.ts

```typescript
import "server-only";

import { buildAddressQuery } from "@/lib/geocoding/address";
import {
  GeocodeProviderError,
  type GeocodeInput,
  type GeocodeResult,
} from "@/lib/geocoding/types";
import { checkDailyLimit } from "@/lib/rateLimit/dailyCounters";
import { serviceLimits } from "@/lib/services/serviceLimits";

type GeocodeFarmResponse = {
  geocoding_results?: {
    status?: {
      code?: number | string;
      message?: string;
    };
    results?: Array<{
      formatted_address?: string;
      coordinates?: {
        lat?: string | number;
        lon?: string | number;
        lng?: string | number;
      };
    }>;
  };
};

function mapStatus(status: number) {
  if (status === 401 || status === 402) {
    return new GeocodeProviderError(
      "config_error",
      "Fallback geocoding provider is not available."
    );
  }
  if (status === 404) {
    return new GeocodeProviderError("not_found", "Address could not be geocoded.");
  }
  if (status === 429) {
    return new GeocodeProviderError(
      "rate_limited",
      "Geocoding is rate-limited. Try again shortly."
    );
  }
  return new GeocodeProviderError(
    "provider_error",
    "Geocoding provider is temporarily unavailable."
  );
}

export async function geocodeWithGeocodeFarm(input: GeocodeInput): Promise<GeocodeResult> {
  const apiKey = process.env.GEOCODEFARM_API_KEY;
  const baseUrl = process.env.GEOCODEFARM_BASE_URL || "https://www.geocode.farm/v3/json";
  const query = buildAddressQuery(input);

  if (!serviceLimits.geocodeFarm.enabled() || !apiKey) {
    throw new GeocodeProviderError(
      "config_error",
      "Fallback geocoding provider is not configured."
    );
  }

  if (!query) {
    throw new GeocodeProviderError("missing_address", "Missing address fields.");
  }

  checkDailyLimit(
    "geocodefarm:global",
    serviceLimits.geocodeFarm.maxRequestsPerDay(),
    "Fallback geocoding daily limit reached. Try again tomorrow."
  );

  const url = new URL("forward", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  url.searchParams.set("addr", query);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);
  if (!response.ok) throw mapStatus(response.status);

  const data = (await response.json()) as GeocodeFarmResponse;
  const result = data.geocoding_results?.results?.[0];
  const latitude = Number(result?.coordinates?.lat);
  const longitude = Number(result?.coordinates?.lon ?? result?.coordinates?.lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new GeocodeProviderError("not_found", "Address could not be geocoded.");
  }

  return {
    latitude,
    longitude,
    provider: "geocodefarm",
    displayName: result?.formatted_address,
  };
}
```

## lib\geocoding\nominatim.ts

```typescript
import "server-only";

import { buildAddressQuery } from "@/lib/geocoding/address";
import {
  GeocodeProviderError,
  type GeocodeInput,
  type GeocodeResult,
} from "@/lib/geocoding/types";
import { nominatimThrottle } from "@/lib/rateLimit/globalThrottle";

type NominatimResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

export async function geocodeWithNominatim(input: GeocodeInput): Promise<GeocodeResult> {
  const baseUrl = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
  const userAgent = process.env.NOMINATIM_USER_AGENT;
  const query = buildAddressQuery(input);

  if (!userAgent) {
    throw new GeocodeProviderError(
      "config_error",
      "Geocoding provider is not configured."
    );
  }

  if (!query) {
    throw new GeocodeProviderError("missing_address", "Missing address fields.");
  }

  const url = new URL("/search", baseUrl);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const response = await nominatimThrottle.enqueue(() =>
    fetch(url, {
      headers: {
        "User-Agent": userAgent,
      },
    })
  );

  if (response.status === 429) {
    throw new GeocodeProviderError(
      "rate_limited",
      "Geocoding is rate-limited. Try again shortly."
    );
  }

  if (!response.ok) {
    throw new GeocodeProviderError(
      "provider_error",
      "Geocoding provider is temporarily unavailable."
    );
  }

  const results = (await response.json()) as NominatimResult[];
  const first = results[0];
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);

  if (!first || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new GeocodeProviderError("not_found", "Address could not be geocoded.");
  }

  return {
    latitude,
    longitude,
    provider: "nominatim",
    displayName: first.display_name,
    raw: first,
  };
}
```

## lib\geocoding\provider.ts

```typescript
import "server-only";

import { buildAddressCacheKey } from "@/lib/geocoding/address";
import { getCachedGeocode, setCachedGeocode } from "@/lib/geocoding/cache";
import { geocodeWithGeocodeFarm } from "@/lib/geocoding/geocodeFarm";
import { geocodeWithNominatim } from "@/lib/geocoding/nominatim";
import {
  GeocodeProviderError,
  type GeocodeInput,
  type GeocodeResult,
} from "@/lib/geocoding/types";

export async function geocodeAddress(input: GeocodeInput): Promise<GeocodeResult> {
  const provider = process.env.GEOCODER_PROVIDER || "nominatim";
  if (provider !== "nominatim") {
    throw new GeocodeProviderError(
      "config_error",
      "Configured geocoding provider is not supported yet."
    );
  }

  const cacheKey = buildAddressCacheKey(input);
  const cached = getCachedGeocode(cacheKey);
  if (cached) return cached;

  let result: GeocodeResult;
  try {
    result = await geocodeWithNominatim(input);
  } catch (error) {
    if (!process.env.GEOCODEFARM_ENABLED || process.env.GEOCODEFARM_ENABLED !== "true") {
      throw error;
    }
    result = await geocodeWithGeocodeFarm(input);
  }
  setCachedGeocode(cacheKey, result);
  return result;
}
```

## lib\geocoding\types.ts

```typescript
export type GeocodeInput = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  fullAddress?: string;
};

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  provider: "nominatim" | "geocodefarm";
  displayName?: string;
  raw?: unknown;
};

export type GeocodeErrorCode =
  | "missing_address"
  | "not_found"
  | "rate_limited"
  | "provider_error"
  | "config_error";

export class GeocodeProviderError extends Error {
  code: GeocodeErrorCode;

  constructor(code: GeocodeErrorCode, message: string) {
    super(message);
    this.name = "GeocodeProviderError";
    this.code = code;
  }
}
```

## lib\jobs.ts

```typescript
import type { Job } from "@/lib/jobTypes";

export type { Job, JobMaterial, JobStatus } from "@/lib/jobTypes";

export const jobs: Job[] = [
  // LANDSCAPING
  {
    id: "1",
    workspaceId: "landscaping",
    name: "Jones Residence",
    clientId: "1",
    client: "Jones Family",
    status: "Lead",
    value: "$200",
    date: "2026-06-10",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 2 },
      { name: "Fertilizer (50lb bags)", quantity: 1 },
    ],
    notes: "Initial lead for residential landscaping work.",
  },
  {
    id: "2",
    workspaceId: "landscaping",
    name: "Brown Property",
    clientId: "2",
    client: "Brown Family",
    status: "Lead",
    value: "$350",
    date: "2026-06-12",
    materials: [
      { name: "Gasoline (gallons)", quantity: 4 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Needs follow-up before quote is finalized.",
  },
  {
    id: "3",
    workspaceId: "landscaping",
    name: "Acme HOA Cleanup",
    clientId: "3",
    client: "Acme HOA",
    status: "Quoted",
    value: "$1,500",
    date: "2026-06-14",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 10 },
      { name: "Topsoil (cubic yards)", quantity: 5 },
      { name: "Fertilizer (50lb bags)", quantity: 4 },
    ],
    notes: "HOA cleanup quote submitted.",
  },
  {
    id: "4",
    workspaceId: "landscaping",
    name: "Spring Cleanup",
    clientId: "4",
    client: "John Smith",
    status: "Scheduled",
    value: "$450",
    date: "2026-06-15",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 5 },
      { name: "Fertilizer (50lb bags)", quantity: 1 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Customer requested cleanup around front flower beds.",
  },
  {
    id: "5",
    workspaceId: "landscaping",
    name: "Weekly Service",
    clientId: "5",
    client: "Sunset Apartments",
    status: "Completed",
    value: "$120",
    date: "2026-06-18",
    materials: [
      { name: "Gasoline (gallons)", quantity: 3 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Weekly service completed.",
  },
  {
    id: "6",
    workspaceId: "landscaping",
    name: "Mulch Installation",
    clientId: "6",
    client: "Johnson Residence",
    status: "Paid",
    value: "$800",
    date: "2026-06-17",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 8 },
      { name: "Topsoil (cubic yards)", quantity: 2 },
    ],
    notes: "Paid mulch installation job.",
  },

  // SNOW REMOVAL
  {
    id: "7",
    workspaceId: "snow-removal",
    name: "Church Snow Contract",
    clientId: "7",
    client: "Rochester Community Church",
    status: "Lead",
    value: "$3,500",
    date: "2026-11-01",
    materials: [
      { name: "Salt Bags", quantity: 20 },
      { name: "Ice Melt Buckets", quantity: 4 },
    ],
    notes: "Seasonal snow removal lead.",
  },
  {
    id: "8",
    workspaceId: "snow-removal",
    name: "Office Lot Bid",
    clientId: "8",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$6,800",
    date: "2026-11-05",
    materials: [
      { name: "Salt Bags", quantity: 40 },
      { name: "Fuel (gallons)", quantity: 10 },
    ],
    notes: "Commercial lot bid submitted.",
  },
  {
    id: "9",
    workspaceId: "snow-removal",
    name: "Condo Association",
    clientId: "9",
    client: "Winter Ridge Condos",
    status: "Scheduled",
    value: "$9,200",
    date: "2026-11-10",
    materials: [
      { name: "Salt Bags", quantity: 50 },
      { name: "Ice Melt Buckets", quantity: 8 },
      { name: "Fuel (gallons)", quantity: 12 },
    ],
    notes: "Scheduled snow removal contract.",
  },
  {
    id: "10",
    workspaceId: "snow-removal",
    name: "Emergency Salt Run",
    clientId: "10",
    client: "Oakland Medical Center",
    status: "Completed",
    value: "$650",
    date: "2026-11-12",
    materials: [
      { name: "Salt Bags", quantity: 12 },
      { name: "Fuel (gallons)", quantity: 5 },
      { name: "Hydraulic Fluid", quantity: 1 },
    ],
    notes: "Emergency salt run completed.",
  },
  {
    id: "11",
    workspaceId: "snow-removal",
    name: "Retail Plaza Clearing",
    clientId: "11",
    client: "North Plaza",
    status: "Paid",
    value: "$2,400",
    date: "2026-11-15",
    materials: [
      { name: "Salt Bags", quantity: 25 },
      { name: "Fuel (gallons)", quantity: 8 },
    ],
    notes: "Paid snow clearing job.",
  },

  // PROPERTIES
  {
    id: "12",
    workspaceId: "properties",
    name: "Unit 204 Turnover",
    clientId: "12",
    client: "Maple Grove Apartments",
    status: "Lead",
    value: "$1,200",
    date: "2026-07-01",
    materials: [
      { name: "Paint (gallons)", quantity: 3 },
      { name: "Light Bulbs", quantity: 4 },
    ],
    notes: "Potential apartment turnover job.",
  },
  {
    id: "13",
    workspaceId: "properties",
    name: "HVAC Inspection",
    clientId: "13",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$950",
    date: "2026-07-03",
    materials: [
      { name: "HVAC Filters", quantity: 6 },
      { name: "Smoke Detectors", quantity: 2 },
    ],
    notes: "Inspection quote submitted.",
  },
  {
    id: "14",
    workspaceId: "properties",
    name: "Parking Lot Sealcoat",
    clientId: "14",
    client: "Sunset Strip Mall",
    status: "Scheduled",
    value: "$8,500",
    date: "2026-07-10",
    materials: [
      { name: "Paint (gallons)", quantity: 8 },
      { name: "Light Bulbs", quantity: 10 },
    ],
    notes: "Scheduled parking lot maintenance.",
  },
  {
    id: "15",
    workspaceId: "properties",
    name: "Roof Leak Repair",
    clientId: "15",
    client: "Green Valley HOA",
    status: "Completed",
    value: "$2,100",
    date: "2026-07-12",
    materials: [
      { name: "Smoke Detectors", quantity: 3 },
      { name: "Air Fresheners", quantity: 5 },
    ],
    notes: "Repair completed.",
  },
  {
    id: "16",
    workspaceId: "properties",
    name: "Quarterly Maintenance",
    clientId: "16",
    client: "Johnson Commercial",
    status: "Paid",
    value: "$4,750",
    date: "2026-07-15",
    materials: [
      { name: "HVAC Filters", quantity: 8 },
      { name: "Light Bulbs", quantity: 12 },
      { name: "Air Fresheners", quantity: 6 },
    ],
    notes: "Paid quarterly maintenance job.",
  },
];
```

## lib\jobStorage.ts

```typescript
import { readStoredJson, storageKeys, writeStoredJson } from "@/lib/clientStorage";
import type { Job } from "@/lib/jobTypes";

export function getStoredJobs() {
  return readStoredJson(storageKeys.jobs, [] as Job[]);
}

export function saveStoredJobs(jobs: Job[]) {
  writeStoredJson(storageKeys.jobs, jobs);
}
```

## lib\jobTypes.ts

```typescript
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
  materials: JobMaterial[];
  notes?: string;
};
```

## lib\logistics\nearestNeighbor.ts

```typescript
import type { LogisticsCoordinate } from "@/lib/logistics/providers";

export type OptimizableStop = LogisticsCoordinate & {
  id: string;
};

function distanceMeters(a: LogisticsCoordinate, b: LogisticsCoordinate) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

export function orderStopsNearestNeighbor(stops: OptimizableStop[]) {
  if (stops.length <= 2) return stops;

  const [first, ...remaining] = stops;
  const ordered = [first];
  let current = first;
  const unvisited = [...remaining];

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    unvisited.forEach((candidate, index) => {
      const distance = distanceMeters(current, candidate);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const [nearest] = unvisited.splice(nearestIndex, 1);
    ordered.push(nearest);
    current = nearest;
  }

  return ordered;
}
```

## lib\logistics\openRouteService.ts

```typescript
import "server-only";

import type { LogisticsCoordinate } from "@/lib/logistics/providers";

export type OpenRouteMatrixResult = {
  distances: number[][];
  durations: number[][];
};

export async function getOpenRouteServiceMatrix(
  locations: LogisticsCoordinate[]
): Promise<OpenRouteMatrixResult> {
  const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
  if (!apiKey) {
    throw new Error("Route distance provider is not configured.");
  }

  const response = await fetch(
    "https://api.openrouteservice.org/v2/matrix/driving-car",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locations: locations.map((location) => [
          location.longitude,
          location.latitude,
        ]),
        metrics: ["distance", "duration"],
      }),
    }
  );

  if (response.status === 429) {
    throw new Error("Route distance provider is rate-limited. Try again shortly.");
  }

  if (!response.ok) {
    throw new Error("Route distance provider is temporarily unavailable.");
  }

  const data = (await response.json()) as OpenRouteMatrixResult;
  return {
    distances: data.distances ?? [],
    durations: data.durations ?? [],
  };
}
```

## lib\logistics\providers.ts

```typescript
export type LogisticsCoordinate = {
  latitude: number;
  longitude: number;
};

export type GeocodeRequest = {
  workspaceId: string;
  address: string;
};

export type GeocodeResult = LogisticsCoordinate & {
  formattedAddress?: string;
  providerPlaceId?: string;
};

export type DistanceMatrixRequest = {
  workspaceId: string;
  origins: LogisticsCoordinate[];
  destinations: LogisticsCoordinate[];
};

export type DistanceMatrixResult = {
  distanceMeters: number;
  durationSeconds: number;
};

export type RouteOptimizationRequest = {
  workspaceId: string;
  stops: Array<LogisticsCoordinate & { id: string }>;
};

export type RouteOptimizationResult = {
  orderedStopIds: string[];
  totalDistanceMeters?: number;
  totalDurationSeconds?: number;
};

export type LogisticsProviders = {
  geocode: (request: GeocodeRequest) => Promise<GeocodeResult>;
  distanceMatrix: (request: DistanceMatrixRequest) => Promise<DistanceMatrixResult[][]>;
  optimizeRoute: (request: RouteOptimizationRequest) => Promise<RouteOptimizationResult>;
};

export function buildGoogleMapsDirectionsUrl(
  stops: Array<{ addressSnapshot?: string; latitude?: number | null; longitude?: number | null }>
) {
  const waypoints = stops
    .map((stop) => {
      if (stop.latitude != null && stop.longitude != null) {
        return `${stop.latitude},${stop.longitude}`;
      }
      return stop.addressSnapshot?.trim() ?? "";
    })
    .filter(Boolean);

  if (waypoints.length === 0) return "";

  const [origin, ...rest] = waypoints;
  const destination = rest.pop() ?? origin;
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
  });

  if (rest.length > 0) {
    params.set("waypoints", rest.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
```

## lib\migration\localImport.ts

```typescript
"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import { readStoredJson, storageKeys } from "@/lib/clientStorage";
import type { ClientRow } from "@/lib/clientTypes";
import { createClientsRepository } from "@/lib/db/clients";
import { createCalendarEventsRepository } from "@/lib/db/calendarEvents";
import { createDocumentsRepository } from "@/lib/db/documents";
import { createExpensesRepository, type ExpenseRow } from "@/lib/db/expenses";
import { createInventoryRepository, type InventoryRow } from "@/lib/db/inventory";
import { createInvoicesRepository } from "@/lib/db/invoices";
import { createJobsRepository } from "@/lib/db/jobs";
import type { StoredDocument } from "@/lib/db/documents";
import type { ClientCalendarEvent } from "@/lib/db/calendarEvents";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import type { LocalImportCounts, LocalImportSummary } from "@/lib/migration/localImportTypes";

function norm(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function previewLocalFrontierData(workspaceId: string): LocalImportCounts {
  const clients = readStoredJson<ClientRow[]>(storageKeys.clients, []).filter((x) => x.workspaceId === workspaceId);
  const jobs = readStoredJson<Job[]>(storageKeys.jobs, []).filter((x) => x.workspaceId === workspaceId);
  const invoices = readStoredJson<InvoiceRow[]>(storageKeys.invoices, []).filter((x) => x.workspaceId === workspaceId);
  const expenses = readStoredJson<ExpenseRow[]>(storageKeys.expenses, []).filter((x) => x.workspaceId === workspaceId);
  const inventory = readStoredJson<InventoryRow[]>(storageKeys.inventory, []).filter((x) => x.workspaceId === workspaceId && !x.autoGenerated);
  const events = readStoredJson<ClientCalendarEvent[]>(storageKeys.clientCalendarEvents, []).filter((x) => x.workspaceId === workspaceId);
  const documents = readStoredJson<StoredDocument[]>(storageKeys.documents, []).filter((x) => x.workspaceId === workspaceId);
  const settings = readStoredJson<{ workspaceId: string }[]>(storageKeys.settings, []).filter((x) => x.workspaceId === workspaceId);

  return {
    clients: clients.length,
    jobs: jobs.length,
    jobMaterials: jobs.reduce((total, job) => total + (job.materials?.length ?? 0), 0),
    invoices: invoices.length,
    invoiceLineItems: invoices.reduce((total, invoice) => total + (invoice.lineItems?.length ?? 0), 0),
    expenses: expenses.length,
    inventory: inventory.length,
    clientCalendarEvents: events.length,
    documents: documents.length,
    routes: 0,
    workspaceSettings: settings.length,
  };
}

export async function importLocalFrontierData({
  workspaceId,
  supabase,
}: {
  workspaceId: string;
  supabase: SupabaseClient;
}): Promise<LocalImportSummary> {
  const summary: LocalImportSummary = { created: 0, skipped: 0, failed: 0, warnings: [] };
  const noop = () => undefined;
  const clientsRepo = createClientsRepository({ isSignedIn: true, supabase, localClients: [], setLocalClients: noop });
  const jobsRepo = createJobsRepository({ isSignedIn: true, supabase, localJobs: [], setLocalJobs: noop });
  const invoicesRepo = createInvoicesRepository({ isSignedIn: true, supabase, localInvoices: [], setLocalInvoices: noop });
  const expensesRepo = createExpensesRepository({ isSignedIn: true, supabase, localExpenses: [], setLocalExpenses: noop });
  const inventoryRepo = createInventoryRepository({ isSignedIn: true, supabase, localItems: [], setLocalItems: noop });
  const eventsRepo = createCalendarEventsRepository({ isSignedIn: true, supabase, localEvents: [], setLocalEvents: noop });
  const documentsRepo = createDocumentsRepository({ isSignedIn: true, supabase, localDocuments: [], setLocalDocuments: noop });

  const localClients = readStoredJson<ClientRow[]>(storageKeys.clients, []).filter((x) => x.workspaceId === workspaceId);
  const localJobs = readStoredJson<Job[]>(storageKeys.jobs, []).filter((x) => x.workspaceId === workspaceId);
  const localInvoices = readStoredJson<InvoiceRow[]>(storageKeys.invoices, []).filter((x) => x.workspaceId === workspaceId);
  const localExpenses = readStoredJson<ExpenseRow[]>(storageKeys.expenses, []).filter((x) => x.workspaceId === workspaceId);
  const localInventory = readStoredJson<InventoryRow[]>(storageKeys.inventory, []).filter((x) => x.workspaceId === workspaceId && !x.autoGenerated);
  const localEvents = readStoredJson<ClientCalendarEvent[]>(storageKeys.clientCalendarEvents, []).filter((x) => x.workspaceId === workspaceId);
  const localDocuments = readStoredJson<StoredDocument[]>(storageKeys.documents, []).filter((x) => x.workspaceId === workspaceId);

  const existingClients = await clientsRepo.getClients(workspaceId);
  const clientIdMap = new Map<string, string>();
  for (const client of localClients) {
    const duplicate = existingClients.find((x) => norm(x.name) === norm(client.name));
    if (duplicate) {
      clientIdMap.set(client.id, duplicate.id);
      summary.skipped++;
      continue;
    }
    const created = await clientsRepo.createClient({ ...client, workspaceId });
    if (created) {
      existingClients.push(created);
      clientIdMap.set(client.id, created.id);
      summary.created++;
    } else summary.failed++;
  }

  const existingJobs = await jobsRepo.getJobs(workspaceId);
  const jobIdMap = new Map<string, string>();
  for (const job of localJobs) {
    const nextClientId = job.clientId ? clientIdMap.get(job.clientId) ?? job.clientId : undefined;
    const duplicate = existingJobs.find((x) => norm(x.name) === norm(job.name) && x.date === job.date && (x.clientId ?? "") === (nextClientId ?? ""));
    if (duplicate) {
      jobIdMap.set(job.id, duplicate.id);
      summary.skipped++;
      continue;
    }
    const created = await jobsRepo.createJob({ ...job, workspaceId, clientId: nextClientId });
    if (created) {
      existingJobs.push(created);
      jobIdMap.set(job.id, created.id);
      summary.created++;
    } else summary.failed++;
  }

  const existingInvoices = await invoicesRepo.getInvoices(workspaceId);
  for (const invoice of localInvoices) {
    if (existingInvoices.some((x) => x.invoiceNumber === invoice.invoiceNumber)) {
      summary.skipped++;
      continue;
    }
    const created = await invoicesRepo.createInvoice({
      ...invoice,
      workspaceId,
      sourceClientId: invoice.sourceClientId ? clientIdMap.get(invoice.sourceClientId) ?? invoice.sourceClientId : undefined,
      jobId: invoice.jobId ? jobIdMap.get(invoice.jobId) ?? invoice.jobId : undefined,
    });
    if (created) summary.created++;
    else summary.failed++;
  }

  const existingInventory = await inventoryRepo.getInventoryItems(workspaceId);
  for (const item of localInventory) {
    if (existingInventory.some((x) => norm(x.name) === norm(item.name))) {
      summary.skipped++;
      continue;
    }
    const created = await inventoryRepo.createInventoryItem({ ...item, workspaceId });
    if (created) summary.created++;
    else summary.failed++;
  }

  const existingExpenses = await expensesRepo.getExpenses(workspaceId);
  for (const expense of localExpenses) {
    if (existingExpenses.some((x) => norm(x.description) === norm(expense.description) && x.amount === expense.amount && x.category === expense.category)) {
      summary.skipped++;
      continue;
    }
    const created = await expensesRepo.createExpense({ ...expense, workspaceId });
    if (created) summary.created++;
    else summary.failed++;
  }

  const existingEvents = await eventsRepo.getEvents(workspaceId);
  for (const event of localEvents) {
    const nextClientId = event.clientId ? clientIdMap.get(event.clientId) ?? event.clientId : "";
    if (existingEvents.some((x) => norm(x.title) === norm(event.title) && x.date === event.date && x.clientId === nextClientId)) {
      summary.skipped++;
      continue;
    }
    const created = await eventsRepo.createEvent({ ...event, workspaceId, clientId: nextClientId });
    if (created) summary.created++;
    else summary.failed++;
  }

  const existingDocs = await documentsRepo.getDocuments(workspaceId);
  for (const doc of localDocuments) {
    if (existingDocs.some((x) => norm(x.name) === norm(doc.name) && x.fileName === doc.fileName && x.createdAt === doc.createdAt)) {
      summary.skipped++;
      continue;
    }
    const created = await documentsRepo.createDocument({
      ...doc,
      workspaceId,
      clientId: doc.clientId ? clientIdMap.get(doc.clientId) ?? doc.clientId : "",
      jobId: doc.jobId ? jobIdMap.get(doc.jobId) ?? doc.jobId : "",
    });
    if (created) summary.created++;
    else summary.failed++;
  }

  summary.warnings.push("Local data was not deleted.");
  return summary;
}
```

## lib\migration\localImportTypes.ts

```typescript
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
```

## lib\ocr\provider.ts

```typescript
import "server-only";

import { runOcrWorker } from "@/lib/ocr/workerClient";

export type OcrProviderMode =
  | "mock"
  | "manual"
  | "worker"
  | "future_openai"
  | "future_google_document_ai";

export type OcrProviderName = OcrProviderMode | "ocrmypdf-tesseract";

export type OcrInput = {
  documentId: string;
  workspaceId: string;
  fileName: string;
  mimeType?: string | null;
  storagePath?: string | null;
  notes?: string | null;
  documentType?: string | null;
  file?: Blob | ArrayBuffer | Uint8Array;
};

export type OcrStructuredData = {
  documentType: "receipt" | "invoice" | "estimate" | "contract" | "unknown";
  vendor?: string;
  customer?: string;
  total?: string;
  date?: string;
  summary?: string;
  fields: Record<string, string>;
};

export type OcrExtractionResult = {
  provider: OcrProviderName;
  text: string;
  structuredData: OcrStructuredData;
  confidence: number;
};

export interface OcrProvider {
  mode: OcrProviderMode;
  extractTextFromDocument(input: OcrInput): Promise<string>;
  extractStructuredData(input: OcrInput, text: string): Promise<OcrStructuredData>;
}

function normalizeDocumentType(value?: string | null): OcrStructuredData["documentType"] {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized.includes("receipt")) return "receipt";
  if (normalized.includes("invoice")) return "invoice";
  if (normalized.includes("estimate") || normalized.includes("quote")) return "estimate";
  if (normalized.includes("contract")) return "contract";
  return "unknown";
}

function createMockProvider(): OcrProvider {
  return {
    mode: "mock",
    async extractTextFromDocument(input) {
      return [
        `Mock OCR extraction for ${input.fileName || "uploaded document"}.`,
        input.notes ? `Notes: ${input.notes}` : "",
        input.storagePath ? `Storage path: ${input.storagePath}` : "",
        "Review extracted information before using it.",
      ]
        .filter(Boolean)
        .join("\n");
    },
    async extractStructuredData(input, text) {
      const documentType = normalizeDocumentType(input.documentType);
      return {
        documentType,
        summary: text.split("\n")[0] ?? "Mock OCR extraction ready for review.",
        fields: {
          fileName: input.fileName || "",
          mimeType: input.mimeType || "",
          storagePath: input.storagePath || "",
        },
      };
    },
  };
}

function createManualProvider(): OcrProvider {
  return {
    mode: "manual",
    async extractTextFromDocument(input) {
      return input.notes?.trim() || "Manual OCR placeholder. Add reviewed text before using this document.";
    },
    async extractStructuredData(input, text) {
      return {
        documentType: normalizeDocumentType(input.documentType),
        summary: text.slice(0, 180),
        fields: {
          fileName: input.fileName || "",
        },
      };
    },
  };
}

export function getOcrProviderMode(): OcrProviderMode {
  const configured = process.env.FRONTIER_OCR_PROVIDER as OcrProviderMode | undefined;
  if (
    configured === "mock" ||
    configured === "manual" ||
    configured === "worker" ||
    configured === "future_openai" ||
    configured === "future_google_document_ai"
  ) {
    return configured;
  }

  if (process.env.OCR_WORKER_URL?.trim() && process.env.OCR_SHARED_SECRET?.trim()) {
    return "worker";
  }

  return "mock";
}

export function createOcrProvider(): OcrProvider {
  const mode = getOcrProviderMode();

  if (mode === "manual") return createManualProvider();

  if (mode === "future_openai" || mode === "future_google_document_ai") {
    if (mode === "future_openai" && process.env.OPENAI_API_KEY) {
      return createMockProvider();
    }

    if (mode === "future_google_document_ai" && process.env.GOOGLE_DOCUMENT_AI_PROCESSOR) {
      return createMockProvider();
    }
  }

  return createMockProvider();
}

export async function runOcrExtraction(input: OcrInput): Promise<OcrExtractionResult> {
  const mode = getOcrProviderMode();

  if (mode === "worker") {
    if (!input.file) throw new Error("The stored PDF could not be loaded for OCR.");

    const result = await runOcrWorker({
      file: input.file,
      fileName: input.fileName,
      contentType: input.mimeType || "application/pdf",
    });

    if (!result.ok) throw new Error(result.error.message);

    const structuredData: OcrStructuredData = {
      documentType: normalizeDocumentType(input.documentType),
      summary: result.data.text.split("\n").find(Boolean)?.slice(0, 180) || "OCR completed.",
      fields: {
        fileName: input.fileName || "",
        mimeType: input.mimeType || "",
        storagePath: input.storagePath || "",
      },
    };

    return {
      provider: result.data.provider,
      text: result.data.text,
      structuredData,
      confidence: 0.7,
    };
  }

  const provider = createOcrProvider();
  const text = await provider.extractTextFromDocument(input);
  const structuredData = await provider.extractStructuredData(input, text);

  return {
    provider: provider.mode,
    text,
    structuredData,
    confidence: provider.mode === "mock" ? 0.35 : 0.2,
  };
}
```

## lib\ocr\types.ts

```typescript
export type OcrWorkerStatus = "needs_review";

export type OcrWorkerSuccess = {
  ok: true;
  data: {
    provider: "ocrmypdf-tesseract";
    status: OcrWorkerStatus;
    text: string;
  };
};

export type OcrWorkerErrorCode =
  | "missing_config"
  | "missing_secret"
  | "invalid_secret"
  | "file_too_large"
  | "timeout"
  | "ocr_failed"
  | "invalid_file_type"
  | "empty_result"
  | "request_failed";

export type OcrWorkerFailure = {
  ok: false;
  error: {
    code: OcrWorkerErrorCode;
    message: string;
  };
};

export type OcrWorkerResult = OcrWorkerSuccess | OcrWorkerFailure;
```

## lib\ocr\workerClient.ts

```typescript
import "server-only";

import type { OcrWorkerResult } from "@/lib/ocr/types";

type OcrUpload = {
  file: Blob | ArrayBuffer | Uint8Array;
  fileName?: string;
  contentType?: string;
};

type WorkerErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

function failure(code: string, message: string): OcrWorkerResult {
  return {
    ok: false,
    error: {
      code:
        code === "missing_secret" ||
        code === "invalid_secret" ||
        code === "file_too_large" ||
        code === "timeout" ||
        code === "ocr_failed" ||
        code === "invalid_file_type" ||
        code === "empty_result"
          ? code
          : code === "missing_config"
            ? "missing_config"
            : "request_failed",
      message,
    },
  };
}

function toBlob(file: OcrUpload["file"], contentType: string) {
  if (file instanceof Blob) return file;
  if (file instanceof Uint8Array) {
    const copy = new Uint8Array(file);
    return new Blob([copy.buffer], { type: contentType });
  }
  return new Blob([file], { type: contentType });
}

export async function runOcrWorker(upload: OcrUpload): Promise<OcrWorkerResult> {
  const workerUrl = process.env.OCR_WORKER_URL?.trim();
  if (!workerUrl) {
    return failure("missing_config", "OCR worker is not configured.");
  }

  const secret = process.env.OCR_SHARED_SECRET ?? "";
  const secretHeader = process.env.OCR_SECRET_HEADER || "x-worker-secret";
  const contentType = upload.contentType || "application/pdf";

  const formData = new FormData();
  formData.append(
    "file",
    toBlob(upload.file, contentType),
    upload.fileName || "document.pdf"
  );

  const headers = new Headers();
  if (secret) headers.set(secretHeader, secret);

  try {
    const response = await fetch(new URL("/ocr", workerUrl), {
      method: "POST",
      headers,
      body: formData,
    });
    const payload = (await response.json()) as WorkerErrorPayload & {
      provider?: "ocrmypdf-tesseract";
      status?: "needs_review";
      text?: string;
    };

    if (!response.ok) {
      return failure(
        payload.error?.code || "request_failed",
        payload.error?.message || "OCR worker request failed."
      );
    }

    if (
      payload.provider !== "ocrmypdf-tesseract" ||
      payload.status !== "needs_review" ||
      typeof payload.text !== "string"
    ) {
      return failure("request_failed", "OCR worker returned an invalid response.");
    }

    return {
      ok: true,
      data: {
        provider: payload.provider,
        status: payload.status,
        text: payload.text,
      },
    };
  } catch {
    return failure("request_failed", "OCR worker is unavailable.");
  }
}
```

## lib\plans\capabilities.ts

```typescript
import type { PlanCapabilities, PlanCapability, PlanTier } from "@/lib/plans/types";

export const DEFAULT_SIGNED_IN_PLAN: PlanTier = "professional";

export const planCapabilities: Record<PlanTier, PlanCapabilities> = {
  visitor: { cloudStorage: false, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  free: { cloudStorage: false, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  basic: { cloudStorage: true, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  professional: { cloudStorage: true, ocr: true, speech: true, aiDrafts: true, logistics: true, externalRouting: true },
  business: { cloudStorage: true, ocr: true, speech: true, aiDrafts: true, logistics: true, externalRouting: true },
};

export function normalizePlanTier(value?: string | null): PlanTier {
  const normalized = value?.trim().toLowerCase();
  if (normalized && normalized in planCapabilities) return normalized as PlanTier;
  return DEFAULT_SIGNED_IN_PLAN;
}

export function canUseCapability(plan: PlanTier, capability: PlanCapability) {
  return planCapabilities[plan][capability];
}

export const canUseCloudStorage = (plan: PlanTier) => canUseCapability(plan, "cloudStorage");
export const canUseOcr = (plan: PlanTier) => canUseCapability(plan, "ocr");
export const canUseSpeech = (plan: PlanTier) => canUseCapability(plan, "speech");
export const canUseAiDrafts = (plan: PlanTier) => canUseCapability(plan, "aiDrafts");
export const canUseLogistics = (plan: PlanTier) => canUseCapability(plan, "logistics");
export const canUseExternalRouting = (plan: PlanTier) => canUseCapability(plan, "externalRouting");
```

## lib\plans\server.ts

```typescript
import "server-only";

import { normalizePlanTier } from "@/lib/plans/capabilities";

export function resolveWorkspacePlan() {
  return normalizePlanTier(process.env.FRONTIER_DEFAULT_PLAN);
}
```

## lib\plans\types.ts

```typescript
export const planTiers = [
  "visitor",
  "free",
  "basic",
  "professional",
  "business",
] as const;

export type PlanTier = (typeof planTiers)[number];

export type PlanCapabilities = {
  cloudStorage: boolean;
  ocr: boolean;
  speech: boolean;
  aiDrafts: boolean;
  logistics: boolean;
  externalRouting: boolean;
};

export type PlanCapability = keyof PlanCapabilities;
```

## lib\platformAdmin\server.ts

```typescript
import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export type AdminAuthContext = {
  adminUserId: string;
  adminEmail: string | null;
  serviceClient: ReturnType<typeof createServiceRoleClient>;
};

export function createServiceRoleClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function forbiddenResponse(message = "Access denied.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function serverErrorResponse(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "Server error.";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function requirePlatformAdmin(): Promise<
  | { ok: true; context: AdminAuthContext }
  | { ok: false; response: NextResponse }
> {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: forbiddenResponse("Sign in required."),
    };
  }

  const { data: isAdmin, error: adminError } = await userClient.rpc(
    "is_platform_admin"
  );

  if (adminError || !isAdmin) {
    return {
      ok: false,
      response: forbiddenResponse(),
    };
  }

  try {
    return {
      ok: true,
      context: {
        adminUserId: user.id,
        adminEmail: user.email ?? null,
        serviceClient: createServiceRoleClient(),
      },
    };
  } catch (error) {
    return {
      ok: false,
      response: serverErrorResponse(error),
    };
  }
}

export async function logAdminAction(
  context: AdminAuthContext,
  action: string,
  details: {
    targetUserId?: string | null;
    targetWorkspaceId?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const { error } = await context.serviceClient.from("admin_audit_logs").insert({
    admin_user_id: context.adminUserId,
    target_user_id: details.targetUserId ?? null,
    target_workspace_id: details.targetWorkspaceId ?? null,
    action,
    metadata: details.metadata ?? {},
  });

  if (error) {
    console.error("Unable to write admin audit log.", error);
  }
}
```

## lib\rateLimit\dailyCounters.ts

```typescript
import "server-only";

import { getUtcDayKey, RateLimitError } from "@/lib/rateLimit/policy";

type CounterRecord = {
  day: string;
  count: number;
};

const counters = new Map<string, CounterRecord>();

export function checkDailyLimit(key: string, limit: number, message: string) {
  const day = getUtcDayKey();
  const counter = counters.get(key);
  const nextCount = counter?.day === day ? counter.count + 1 : 1;

  if (nextCount > limit) {
    throw new RateLimitError(message);
  }

  counters.set(key, { day, count: nextCount });
}

export function checkUserAndWorkspaceDailyLimits({
  service,
  userId,
  workspaceId,
  userLimit,
  workspaceLimit,
}: {
  service: string;
  userId: string;
  workspaceId: string;
  userLimit: number;
  workspaceLimit: number;
}) {
  checkDailyLimit(
    `${service}:user:${userId}`,
    userLimit,
    "Daily request limit reached. Try again tomorrow."
  );
  checkDailyLimit(
    `${service}:workspace:${workspaceId}`,
    workspaceLimit,
    "Workspace daily request limit reached. Try again tomorrow."
  );
}
```

## lib\rateLimit\globalThrottle.ts

```typescript
import "server-only";

import { RateLimitError, readPositiveInt } from "@/lib/rateLimit/policy";

type QueuedTask<T> = {
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  enqueuedAt: number;
};

export class GlobalThrottle {
  private queue: QueuedTask<unknown>[] = [];
  private isRunning = false;
  private lastRunAt = 0;

  constructor(
    private readonly options: {
      minIntervalMs: () => number;
      maxQueueSize: () => number;
      maxWaitMs: () => number;
      busyMessage: string;
    }
  ) {}

  enqueue<T>(run: () => Promise<T>) {
    if (this.queue.length >= this.options.maxQueueSize()) {
      throw new RateLimitError(this.options.busyMessage);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        run,
        resolve: resolve as (value: unknown) => void,
        reject,
        enqueuedAt: Date.now(),
      });
      void this.drain();
    });
  }

  private async drain() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      while (this.queue.length > 0) {
        const task = this.queue.shift();
        if (!task) continue;

        if (Date.now() - task.enqueuedAt > this.options.maxWaitMs()) {
          task.reject(new RateLimitError(this.options.busyMessage));
          continue;
        }

        const elapsed = Date.now() - this.lastRunAt;
        const delay = this.options.minIntervalMs() - elapsed;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        this.lastRunAt = Date.now();

        try {
          task.resolve(await task.run());
        } catch (error) {
          task.reject(error);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}

export const nominatimThrottle = new GlobalThrottle({
  minIntervalMs: () => Math.max(readPositiveInt("GEOCODE_RATE_LIMIT_MS", 1100), 1100),
  maxQueueSize: () => 5,
  maxWaitMs: () => 10000,
  busyMessage: "Geocoding is busy. Try again shortly.",
});
```

## lib\rateLimit\policy.ts

```typescript
import "server-only";

export class RateLimitError extends Error {
  status: number;

  constructor(message: string, status = 429) {
    super(message);
    this.name = "RateLimitError";
    this.status = status;
  }
}

export function readPositiveInt(name: string, fallback: number) {
  const value = Number(process.env[name] ?? "");
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function getUtcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
```

## lib\services\attribution.ts

```typescript
export const osmTileAttribution = "&copy; OpenStreetMap contributors";
export const osmGeocodingAttribution = "Geocoding data © OpenStreetMap contributors.";
```

## lib\services\routeProtection.ts

```typescript
import "server-only";

import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { resolveWorkspacePlan } from "@/lib/plans/server";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function planUpgradeError() {
  return NextResponse.json(
    { error: "Your workspace plan does not include this service.", code: "plan_upgrade_required" },
    { status: 402 }
  );
}

export function cleanRouteError(error: unknown, fallback: string) {
  if (error instanceof RateLimitError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return jsonError(fallback, 400);
}

export async function requireWorkspaceAccess(workspaceId?: string) {
  if (!workspaceId) {
    return { ok: false as const, response: jsonError("Workspace is required.", 400) };
  }

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  if (error || !user) {
    return { ok: false as const, response: jsonError("Sign in required.", 401) };
  }

  const serviceClient = createServiceRoleClient();
  const { data } = await serviceClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return {
      ok: false as const,
      response: jsonError("You do not have access to this workspace.", 403),
    };
  }

  return {
    ok: true as const,
    serviceClient,
    userId: user.id,
    workspaceId,
    plan: resolveWorkspacePlan(),
  };
}
```

## lib\services\serviceLimits.ts

```typescript
import "server-only";

import { readPositiveInt } from "@/lib/rateLimit/policy";

export const serviceLimits = {
  ocr: {
    maxRequestsPerUserPerDay: () => readPositiveInt("OCR_MAX_REQUESTS_PER_USER_PER_DAY", 20),
    maxRequestsPerWorkspacePerDay: () => readPositiveInt("OCR_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 100),
  },
  speech: {
    maxRequestsPerUserPerDay: () => readPositiveInt("SPEECH_MAX_REQUESTS_PER_USER_PER_DAY", 20),
    maxRequestsPerWorkspacePerDay: () => readPositiveInt("SPEECH_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 100),
  },
  aiDrafts: {
    maxRequestsPerUserPerDay: () => readPositiveInt("AI_MAX_REQUESTS_PER_USER_PER_DAY", 50),
    maxRequestsPerWorkspacePerDay: () => readPositiveInt("AI_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 200),
  },
  geocode: {
    maxRequestsPerUserPerDay: () =>
      readPositiveInt("GEOCODE_MAX_REQUESTS_PER_USER_PER_DAY", 25),
    maxRequestsPerWorkspacePerDay: () =>
      readPositiveInt("GEOCODE_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 100),
    maxBatchSize: () => readPositiveInt("GEOCODE_MAX_BATCH_SIZE", 10),
  },
  geocodeFarm: {
    enabled: () => process.env.GEOCODEFARM_ENABLED === "true",
    maxRequestsPerDay: () => readPositiveInt("GEOCODEFARM_MAX_REQUESTS_PER_DAY", 200),
  },
  route: {
    maxStops: () => readPositiveInt("ROUTE_MAX_STOPS", 25),
    absoluteMaxStops: () => readPositiveInt("ROUTE_ABSOLUTE_MAX_STOPS", 50),
    maxRequestsPerUserPerDay: () =>
      readPositiveInt("ROUTE_MAX_REQUESTS_PER_USER_PER_DAY", 50),
    maxRequestsPerWorkspacePerDay: () =>
      readPositiveInt("ROUTE_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 200),
  },
  matrix: {
    maxLocations: () => readPositiveInt("MATRIX_MAX_LOCATIONS", 25),
  },
  googleMaps: {
    maxUrlLength: 2048,
  },
};
```

## lib\speech\types.ts

```typescript
export type SpeechWorkerStatus = "transcribed";

export type SpeechWorkerSegment = {
  start: number;
  end: number;
  text: string;
};

export type SpeechWorkerSuccess = {
  ok: true;
  data: {
    provider: "faster-whisper";
    status: SpeechWorkerStatus;
    language: string;
    durationSeconds: number;
    text: string;
    segments: SpeechWorkerSegment[];
  };
};

export type SpeechWorkerErrorCode =
  | "missing_config"
  | "missing_secret"
  | "invalid_secret"
  | "file_too_large"
  | "timeout"
  | "transcription_failed"
  | "invalid_file_type"
  | "empty_result"
  | "request_failed";

export type SpeechWorkerFailure = {
  ok: false;
  error: {
    code: SpeechWorkerErrorCode;
    message: string;
  };
};

export type SpeechWorkerResult = SpeechWorkerSuccess | SpeechWorkerFailure;
```

## lib\speech\workerClient.ts

```typescript
import "server-only";

import type { SpeechWorkerResult, SpeechWorkerSegment } from "@/lib/speech/types";

type SpeechUpload = {
  file: Blob | ArrayBuffer | Uint8Array;
  fileName?: string;
  contentType?: string;
};

type WorkerErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

function failure(code: string, message: string): SpeechWorkerResult {
  return {
    ok: false,
    error: {
      code:
        code === "missing_secret" ||
        code === "invalid_secret" ||
        code === "file_too_large" ||
        code === "timeout" ||
        code === "transcription_failed" ||
        code === "invalid_file_type" ||
        code === "empty_result" ||
        code === "missing_config"
          ? code
          : "request_failed",
      message,
    },
  };
}

function toBlob(file: SpeechUpload["file"], contentType: string) {
  if (file instanceof Blob) return file.type === contentType ? file : file.slice(0, file.size, contentType);
  if (file instanceof Uint8Array) {
    const copy = new Uint8Array(file);
    return new Blob([copy.buffer], { type: contentType });
  }
  return new Blob([file], { type: contentType });
}

function responsePreview(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 240);
}

export async function runSpeechWorker(
  upload: SpeechUpload
): Promise<SpeechWorkerResult> {
  const workerUrl = process.env.SPEECH_WORKER_URL?.trim();
  if (!workerUrl) {
    return failure("missing_config", "Speech worker is not configured.");
  }

  const secret = process.env.SPEECH_SHARED_SECRET ?? "";
  const secretHeader = process.env.SPEECH_SECRET_HEADER || "x-worker-secret";
  const contentType = upload.contentType || "audio/wav";
  const fileSize =
    upload.file instanceof Blob
      ? upload.file.size
      : upload.file instanceof Uint8Array
        ? upload.file.byteLength
        : upload.file.byteLength;

  const formData = new FormData();
  formData.append(
    "file",
    toBlob(upload.file, contentType),
    upload.fileName || "audio.wav"
  );

  const headers = new Headers();
  if (secret) headers.set(secretHeader, secret);

  try {
    console.info("[speech] worker request", {
      fileName: upload.fileName || "audio.wav",
      contentType,
      fileSize,
      workerUrlConfigured: Boolean(workerUrl),
    });

    const response = await fetch(new URL("/transcribe", workerUrl), {
      method: "POST",
      headers,
      body: formData,
    });
    const responseText = await response.text();
    console.info("[speech] worker response", {
      status: response.status,
      ok: response.ok,
      preview: responsePreview(responseText),
    });

    let payload: WorkerErrorPayload & {
      provider?: "faster-whisper";
      status?: "transcribed";
      language?: string;
      durationSeconds?: number;
      text?: string;
      segments?: SpeechWorkerSegment[];
    };
    try {
      payload = JSON.parse(responseText) as typeof payload;
    } catch {
      return failure("request_failed", "Speech worker returned an unreadable response.");
    }

    if (!response.ok) {
      return failure(
        payload.error?.code || "request_failed",
        payload.error?.message || "Speech worker request failed."
      );
    }

    if (
      payload.provider !== "faster-whisper" ||
      payload.status !== "transcribed" ||
      typeof payload.language !== "string" ||
      typeof payload.durationSeconds !== "number" ||
      typeof payload.text !== "string" ||
      !Array.isArray(payload.segments)
    ) {
      return failure(
        "request_failed",
        "Speech worker returned an invalid response."
      );
    }

    return {
      ok: true,
      data: {
        provider: payload.provider,
        status: payload.status,
        language: payload.language,
        durationSeconds: payload.durationSeconds,
        text: payload.text,
        segments: payload.segments,
      },
    };
  } catch (error) {
    console.warn("[speech] worker request failed", {
      message: error instanceof Error ? error.message : "Unknown speech worker error.",
    });
    return failure("request_failed", "Speech worker is unavailable.");
  }
}
```

## lib\storage\documents.ts

```typescript
export const DOCUMENT_STORAGE_BUCKET = "workspace-documents";

export type DocumentEntityType = "client" | "job" | "invoice" | "workspace";

export type DocumentStoragePathInput = {
  workspaceId: string;
  entityType?: DocumentEntityType | "";
  entityId?: string | "";
  fileName: string;
};

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildDocumentStoragePath({
  workspaceId,
  entityType,
  entityId,
  fileName,
}: DocumentStoragePathInput) {
  const safeWorkspaceId = sanitizePathSegment(workspaceId);
  const safeEntityType = sanitizePathSegment(entityType || "workspace");
  const safeEntityId = sanitizePathSegment(entityId || "general");
  const safeFileName = sanitizePathSegment(fileName) || "document";

  return `${safeWorkspaceId}/${safeEntityType}/${safeEntityId}/${safeFileName}`;
}

export function getDocumentEntity({
  clientId,
  jobId,
  invoiceId,
}: {
  clientId?: string;
  jobId?: string;
  invoiceId?: string;
}): { entityType: DocumentEntityType; entityId: string } {
  if (invoiceId) return { entityType: "invoice", entityId: invoiceId };
  if (jobId) return { entityType: "job", entityId: jobId };
  if (clientId) return { entityType: "client", entityId: clientId };
  return { entityType: "workspace", entityId: "general" };
}

export async function uploadDocumentFile({
  workspaceId,
  path,
  file,
}: {
  workspaceId: string;
  path: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("workspaceId", workspaceId);
  formData.append("path", path);
  formData.append("file", file);
  const response = await fetch("/api/documents/storage", { method: "POST", body: formData });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "Unable to upload document.");
}

export async function createDocumentDownloadUrl({
  workspaceId,
  path,
}: {
  workspaceId: string;
  path: string;
}) {
  const query = new URLSearchParams({ workspaceId, path });
  const response = await fetch(`/api/documents/storage?${query.toString()}`);
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error || "Unable to create download link.");
  return payload.url;
}

export async function removeDocumentFile({
  workspaceId,
  path,
}: {
  workspaceId: string;
  path: string;
}) {
  const response = await fetch("/api/documents/storage", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, path }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "Unable to remove document file.");
}
```

## lib\storage\index.ts

```typescript
export {
  DOCUMENT_STORAGE_BUCKET,
  buildDocumentStoragePath,
  createDocumentDownloadUrl,
  getDocumentEntity,
  removeDocumentFile,
  uploadDocumentFile,
  type DocumentEntityType,
  type DocumentStoragePathInput,
} from "@/lib/storage/documents";
```

## lib\supabase\client.ts

```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export function createBrowserSupabaseClient() {
  const { url, publishableKey } = requireSupabasePublicEnv();

  return createBrowserClient(url, publishableKey);
}
```

## lib\supabase\env.ts

```typescript
export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return null;

  return {
    url,
    publishableKey,
  };
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return env;
}
```

## lib\supabase\proxy.ts

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function updateSupabaseSession(request: NextRequest) {
  const env = getSupabasePublicEnv();
  let response = NextResponse.next({
    request,
  });

  if (!env) return response;

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getClaims();

  return response;
}
```

## lib\supabase\server.ts

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  getSupabasePublicEnv,
  requireSupabasePublicEnv,
} from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  const { url, publishableKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes them.
        }
      },
    },
  });
}

export async function maybeCreateServerSupabaseClient() {
  if (!getSupabasePublicEnv()) return null;

  return createServerSupabaseClient();
}
```

## lib\workspaceDisplay.ts

```typescript
import type { Workspace } from "@/components/WorkspaceContext";

export function getWorkspaceDisplayName(workspace: Workspace) {
  if (
    workspace.id === "local-workspace" ||
    workspace.id === "create-workspace"
  ) {
    return "Create Workspace";
  }

  return workspace.name;
}
```

## lib\workspaceOptions.ts

```typescript
export const defaultBusinessTypes = [
  "Landscaping",
  "Tree Service",
  "Lawn Care",
  "Snow Removal",
  "Property Management",
  "Construction",
  "Auto Repair",
  "IT Services",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Restaurant",
  "Property Maintenance",
  "Other",
] as const;
```

## next-env.d.ts

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

## next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

## package.json

```json
{
  "name": "frontier",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "leaflet": "^1.9.4",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-leaflet": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/leaflet": "^1.9.21",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## proxy.ts

```typescript
import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## README.md

```markdown
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```

## supabase\.temp\linked-project.json

```json
{"ref":"spgfikurhookuagsntcx","name":"Frontier Project","organization_id":"lgirxlqpyaulbmuznmly","organization_slug":"lgirxlqpyaulbmuznmly"}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

## worker-ocr\README.md

```markdown
# Frontier OCR Worker

Standalone OCR service for Frontier. This worker is intentionally isolated from the main Frontier app.

## Features

- FastAPI HTTP service.
- `GET /health`.
- `POST /ocr` PDF upload.
- OCRmyPDF + Tesseract searchable PDF generation.
- Text extraction from OCR output.
- Optional shared-secret request header.
- Clean JSON error responses.
- Cloud Run compatible.
- CPU only.
- No Supabase, database, or Frontier app access.

## Environment Variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `8080` | HTTP port used by Cloud Run/local Docker. |
| `OCR_SHARED_SECRET` | No | empty | If set, requests to `POST /ocr` must include the matching secret. |
| `OCR_SECRET_HEADER` | No | `x-worker-secret` | Header name used for the shared secret. |
| `OCR_LANGUAGE` | No | `eng` | Tesseract language passed to OCRmyPDF. |
| `OCR_TIMEOUT_SECONDS` | No | `180` | Max OCRmyPDF runtime per request. |
| `OCR_MAX_UPLOAD_MB` | No | `25` | Max accepted PDF upload size. |

## Local Python Run

Install system dependencies first:

```bash
sudo apt-get update
sudo apt-get install -y ghostscript qpdf tesseract-ocr tesseract-ocr-eng
```

Then run:

```bash
cd worker-ocr
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

Health check:

```bash
curl http://localhost:8080/health
```

OCR request:

```bash
curl -X POST http://localhost:8080/ocr \
  -H "x-worker-secret: your-secret" \
  -F "file=@sample.pdf"
```

If `OCR_SHARED_SECRET` is not set, the secret header is not required.

## Docker Build

```bash
cd worker-ocr
docker build -t frontier-ocr-worker .
```

## Docker Run

```bash
docker run --rm -p 8080:8080 \
  -e OCR_SHARED_SECRET=your-secret \
  frontier-ocr-worker
```

## API

### `GET /health`

Returns:

```json
{
  "status": "ok"
}
```

Errors use this shape:

```json
{
  "error": {
    "code": "invalid_file_type",
    "message": "Only PDF uploads are supported."
  }
}
```

Current error codes:

- `missing_secret`
- `invalid_secret`
- `file_too_large`
- `timeout`
- `ocr_failed`
- `invalid_file_type`
- `empty_result`
- `invalid_request`
- `request_failed`

### `POST /ocr`

Accepts multipart form upload field:

- `file`: PDF document.

Returns:

```json
{
  "provider": "ocrmypdf-tesseract",
  "status": "needs_review",
  "text": "..."
}
```

## Notes

- This worker does not deploy itself.
- This worker does not call Supabase.
- This worker does not create Frontier records.
- This worker does not include OCR review UI.
- See `SMOKE_TEST.md` for lightweight manual checks.
```

## worker-ocr\requirements.txt

```text
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.20
ocrmypdf==16.7.0
pikepdf<10
pypdf==5.1.0
```

## worker-ocr\SMOKE_TEST.md

```markdown
# OCR Worker Smoke Tests

These checks are documentation-first and do not require adding a test framework.

Assume the worker is running locally:

```bash
cd worker-ocr
uvicorn main:app --port 8080
```

Or with Docker:

```bash
docker run --rm -p 8080:8080 \
  -e OCR_SHARED_SECRET=test-secret \
  frontier-ocr-worker
```

## Health Check

```bash
curl http://localhost:8080/health
```

Expected:

```json
{"status":"ok"}
```

## OCR With Secret Header

```bash
curl -X POST http://localhost:8080/ocr \
  -H "x-worker-secret: test-secret" \
  -F "file=@../1.pdf"
```

Expected:

```json
{
  "provider": "ocrmypdf-tesseract",
  "status": "needs_review",
  "text": "..."
}
```

## OCR Without Secret Header

Run the worker with `OCR_SHARED_SECRET=test-secret`, then:

```bash
curl -X POST http://localhost:8080/ocr \
  -F "file=@../1.pdf"
```

Expected:

```json
{
  "error": {
    "code": "missing_secret",
    "message": "Missing shared secret."
  }
}
```

## Non-PDF Failure

```bash
curl -X POST http://localhost:8080/ocr \
  -H "x-worker-secret: test-secret" \
  -F "file=@README.md;type=text/plain"
```

Expected:

```json
{
  "error": {
    "code": "invalid_file_type",
    "message": "Only PDF uploads are supported."
  }
}
```

## Oversized Upload Failure

Start the worker with a tiny upload limit:

```bash
OCR_MAX_UPLOAD_MB=1 OCR_SHARED_SECRET=test-secret uvicorn main:app --port 8080
```

Upload a PDF larger than 1 MB.

Expected:

```json
{
  "error": {
    "code": "file_too_large",
    "message": "Uploaded PDF is too large."
  }
}
```

## Timeout Failure

Start the worker with a tiny timeout:

```bash
OCR_TIMEOUT_SECONDS=1 OCR_SHARED_SECRET=test-secret uvicorn main:app --port 8080
```

Upload a PDF that takes longer than 1 second to process.

Expected:

```json
{
  "error": {
    "code": "timeout",
    "message": "OCR timed out."
  }
}
```

## Notes

- Do not run heavy OCR tests in CI until system dependencies are available.
- A successful smoke test requires OCRmyPDF, Tesseract, Ghostscript, and QPDF.
```

## worker-speech\README.md

```markdown
# Frontier Speech Worker

Standalone speech-to-text service for Frontier. This worker is intentionally isolated from the main Frontier app.

## Features

- FastAPI HTTP service.
- `GET /health`.
- `POST /transcribe` audio upload.
- Faster-Whisper transcription.
- Shared-secret request header support.
- Clean JSON error responses.
- CPU-only by default.
- Docker Desktop and Cloud Run compatible.
- No Supabase, database, or Frontier app access.

## Environment Variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `8090` | HTTP port used by local Docker/Cloud Run. |
| `SPEECH_SHARED_SECRET` | No | empty | If set, requests to `POST /transcribe` must include the matching secret. |
| `SPEECH_SECRET_HEADER` | No | `x-worker-secret` | Header name used for the shared secret. |
| `SPEECH_MAX_UPLOAD_MB` | No | `25` | Max accepted audio upload size. |
| `SPEECH_TIMEOUT_SECONDS` | No | `180` | Max transcription runtime per request. |
| `WHISPER_MODEL_SIZE` | No | `tiny` | Faster-Whisper model size. Use `tiny` for local CPU smoke tests. |
| `WHISPER_DEVICE` | No | `cpu` | Faster-Whisper device. |
| `WHISPER_COMPUTE_TYPE` | No | `int8` | Faster-Whisper compute type. |

## Docker Build

From the Frontier project root:

```powershell
docker build -t frontier-speech ./worker-speech
```

## Docker Run

```powershell
docker run -d --rm --name frontier-speech-test -p 8090:8090 `
  -e SPEECH_SHARED_SECRET=test-secret `
  frontier-speech
```

Health check:

```powershell
curl.exe -s http://localhost:8090/health
```

Transcription request:

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe `
  -H "x-worker-secret: test-secret" `
  -F "file=@sample.wav"
```

Stop the test container:

```powershell
docker rm -f frontier-speech-test
```

## API

### `GET /health`

Returns:

```json
{
  "ok": true,
  "service": "frontier-speech-worker",
  "provider": "faster-whisper"
}
```

### `POST /transcribe`

Accepts multipart form upload field:

- `file`: common audio file such as WAV, MP3, M4A, OGG, FLAC, WebM, or MP4 audio.

Returns:

```json
{
  "provider": "faster-whisper",
  "status": "transcribed",
  "language": "en",
  "durationSeconds": 1.2,
  "text": "...",
  "segments": [
    {
      "start": 0,
      "end": 1.2,
      "text": "..."
    }
  ]
}
```

Errors use this shape:

```json
{
  "error": {
    "code": "invalid_file_type",
    "message": "Only common audio uploads are supported."
  }
}
```

Current error codes:

- `missing_secret`
- `invalid_secret`
- `file_too_large`
- `timeout`
- `transcription_failed`
- `invalid_file_type`
- `empty_result`
- `invalid_request`
- `request_failed`

## Notes

- This worker does not deploy itself.
- This worker does not call Supabase.
- This worker does not create Frontier records.
- This worker does not perform AI command interpretation.
- See `SMOKE_TEST.md` for lightweight manual checks.
```

## worker-speech\requirements.txt

```text
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.20
faster-whisper==1.1.1
requests==2.32.5
```

## worker-speech\SMOKE_TEST.md

```markdown
# Frontier Speech Worker Smoke Test

Run these commands from the Frontier project root.

## Build

```powershell
docker build -t frontier-speech ./worker-speech
```

## Start

```powershell
docker run -d --rm --name frontier-speech-test -p 8090:8090 `
  -e SPEECH_SHARED_SECRET=test-secret `
  frontier-speech
```

## Health

```powershell
curl.exe -s http://localhost:8090/health
```

Expected:

```json
{"ok":true,"service":"frontier-speech-worker","provider":"faster-whisper"}
```

## Missing Secret

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe -F "file=@worker-speech/README.md"
```

Expected error code:

```json
{"error":{"code":"missing_secret","message":"Missing shared secret."}}
```

## Invalid File

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe `
  -H "x-worker-secret: test-secret" `
  -F "file=@worker-speech/README.md;type=text/plain"
```

Expected error code:

```json
{"error":{"code":"invalid_file_type","message":"Only common audio uploads are supported."}}
```

## Generate A Tiny Local WAV

If no small audio file exists, generate a local WAV with ffmpeg inside the worker image:

```powershell
docker run --rm -v "${PWD}:/work" frontier-speech `
  ffmpeg -y -f lavfi -i "sine=frequency=440:duration=1" /work/worker-speech/smoke-tone.wav
```

This proves upload and decode plumbing, but it is not meaningful speech and may return `empty_result`.

For a meaningful transcription test, use a short speech WAV/MP3:

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe `
  -H "x-worker-secret: test-secret" `
  -F "file=@path\to\speech.wav"
```

## Stop

```powershell
docker rm -f frontier-speech-test
```
```

