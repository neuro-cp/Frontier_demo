import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MessageBody = {
  workspaceId?: string;
  conversationId?: string;
  body?: string;
  action?: "reply" | "archive" | "reopen" | "read";
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getClientName(client: unknown) {
  if (Array.isArray(client)) return String(client[0]?.name ?? "");
  if (client && typeof client === "object" && "name" in client) {
    return String((client as { name?: string }).name ?? "");
  }
  return "";
}

async function requireManager(workspaceId: string) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return { ok: false as const, status: 401, error: "Sign in required." };

  const serviceClient = createServiceRoleClient();
  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return { ok: false as const, status: 500, error: memberError.message };
  if (!member || (member.role !== "Owner" && member.role !== "Manager")) {
    return { ok: false as const, status: 403, error: "Only Owners and Managers can manage conversations." };
  }

  return { ok: true as const, userId: user.id, serviceClient };
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const includeArchived = request.nextUrl.searchParams.get("archived") === "true";
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const access = await requireManager(workspaceId);
  if (!access.ok) return jsonError(access.error, access.status);

  let conversationQuery = access.serviceClient
    .from("workspace_conversations")
    .select("id, workspace_id, client_id, title, status, channel, last_message_at, created_at, clients(id, name)")
    .eq("workspace_id", workspaceId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (!includeArchived) conversationQuery = conversationQuery.neq("status", "Archived");

  const { data: conversations, error: conversationError } = await conversationQuery.limit(100);
  if (conversationError) return jsonError(conversationError.message, 500);

  const conversationIds = (conversations ?? []).map((conversation) => conversation.id);
  const { data: messages, error: messageError } = conversationIds.length
    ? await access.serviceClient
        .from("workspace_messages")
        .select("id, conversation_id, sender_type, body, read_at, created_at")
        .eq("workspace_id", workspaceId)
        .eq("is_internal", false)
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (messageError) return jsonError(messageError.message, 500);

  const filteredConversations = search
    ? (conversations ?? []).filter((conversation) => {
        const conversationMessages = (messages ?? []).filter((message) => message.conversation_id === conversation.id);
        return (
          conversation.title.toLowerCase().includes(search) ||
          getClientName(conversation.clients).toLowerCase().includes(search) ||
          conversationMessages.some((message) => message.body.toLowerCase().includes(search))
        );
      })
    : conversations ?? [];

  const unreadCount = (messages ?? []).filter((message) => message.sender_type === "Client" && !message.read_at).length;

  return NextResponse.json({
    conversations: filteredConversations,
    messages: messages ?? [],
    unreadCount,
  });
}

export async function POST(request: NextRequest) {
  let body: MessageBody;
  try {
    body = (await request.json()) as MessageBody;
  } catch {
    return jsonError("Invalid message request.", 400);
  }

  if (!body.workspaceId || !body.conversationId || !body.action) {
    return jsonError("Workspace, conversation, and action are required.", 400);
  }

  const access = await requireManager(body.workspaceId);
  if (!access.ok) return jsonError(access.error, access.status);

  const { data: conversation, error: conversationError } = await access.serviceClient
    .from("workspace_conversations")
    .select("id, client_id")
    .eq("id", body.conversationId)
    .eq("workspace_id", body.workspaceId)
    .maybeSingle();

  if (conversationError) return jsonError(conversationError.message, 500);
  if (!conversation) return jsonError("Conversation not found.", 404);

  if (body.action === "archive" || body.action === "reopen") {
    const patch =
      body.action === "archive"
        ? { status: "Archived", archived_at: new Date().toISOString() }
        : { status: "Open", archived_at: null };
    const { data, error } = await access.serviceClient
      .from("workspace_conversations")
      .update(patch)
      .eq("id", body.conversationId)
      .eq("workspace_id", body.workspaceId)
      .select("id, status, archived_at")
      .single();
    if (error) return jsonError(error.message || "Unable to update conversation.", 500);
    return NextResponse.json({ conversation: data });
  }

  if (body.action === "read") {
    await access.serviceClient
      .from("workspace_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", body.conversationId)
      .eq("workspace_id", body.workspaceId)
      .eq("sender_type", "Client")
      .is("read_at", null);
    return NextResponse.json({ ok: true });
  }

  const messageBody = body.body?.trim();
  if (!messageBody) return jsonError("Message body is required.", 400);

  const { data: message, error: messageError } = await access.serviceClient
    .from("workspace_messages")
    .insert({
      workspace_id: body.workspaceId,
      conversation_id: body.conversationId,
      client_id: conversation.client_id,
      sender_user_id: access.userId,
      sender_type: "Workspace",
      body: messageBody,
      is_internal: false,
    })
    .select("id, conversation_id, sender_type, body, read_at, created_at")
    .single();

  if (messageError || !message) return jsonError(messageError?.message || "Unable to send reply.", 500);

  await access.serviceClient
    .from("workspace_conversations")
    .update({ last_message_at: message.created_at, status: "Open" })
    .eq("id", body.conversationId)
    .eq("workspace_id", body.workspaceId);

  return NextResponse.json({ message });
}
