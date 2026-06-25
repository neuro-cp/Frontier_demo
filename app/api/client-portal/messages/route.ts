import { NextRequest, NextResponse } from "next/server";

import { getClientPortalReadContext, getSignedInClientPortalContext } from "@/lib/clientPortal/server";

type MessageBody = {
  conversationId?: string;
  body?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const portal = await getClientPortalReadContext(request.nextUrl.searchParams.get("workspaceId"));
  if (!portal.ok) return jsonError(portal.error, portal.status);

  const { serviceClient, access } = portal;

  let conversationQuery = serviceClient
    .from("workspace_conversations")
    .select("id, title, status, channel, last_message_at, created_at")
    .eq("workspace_id", access.workspace_id)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (portal.mode === "client") conversationQuery = conversationQuery.eq("client_id", access.client_id);
  const { data: conversations, error: conversationError } = await conversationQuery;

  if (conversationError) return jsonError(conversationError.message, 500);

  const conversationIds = (conversations ?? []).map((conversation) => conversation.id);
  const messageQuery = serviceClient
        .from("workspace_messages")
        .select("id, conversation_id, sender_type, body, is_internal, read_at, created_at")
        .eq("workspace_id", access.workspace_id)
        .eq("is_internal", false)
        .in("conversation_id", conversationIds);
  if (portal.mode === "client") messageQuery.eq("client_id", access.client_id);
  const { data: messages, error: messageError } = conversationIds.length
    ? await messageQuery.order("created_at", { ascending: true })
    : { data: [], error: null };

  if (messageError) return jsonError(messageError.message, 500);

  return NextResponse.json({ conversations: conversations ?? [], messages: messages ?? [] });
}

export async function POST(request: NextRequest) {
  const portal = await getSignedInClientPortalContext();
  if (!portal.ok) return jsonError(portal.error, portal.status);

  let body: MessageBody;
  try {
    body = (await request.json()) as MessageBody;
  } catch {
    return jsonError("Invalid message request.", 400);
  }

  const messageBody = body.body?.trim();
  if (!messageBody) return jsonError("Message body is required.", 400);

  const { serviceClient, access, userId } = portal;
  let conversationId = body.conversationId;

  if (conversationId) {
    const { data: conversation, error: conversationError } = await serviceClient
      .from("workspace_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("workspace_id", access.workspace_id)
      .eq("client_id", access.client_id)
      .maybeSingle();

    if (conversationError) return jsonError(conversationError.message, 500);
    if (!conversation) return jsonError("Conversation not found.", 404);
  } else {
    const { data: conversation, error: createError } = await serviceClient
      .from("workspace_conversations")
      .insert({
        workspace_id: access.workspace_id,
        client_id: access.client_id,
        title: "Client portal conversation",
        channel: "Client Portal",
        status: "Open",
        created_by: userId,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (createError || !conversation) return jsonError(createError?.message || "Unable to create conversation.", 500);
    conversationId = conversation.id;
  }

  const { data: message, error: messageError } = await serviceClient
    .from("workspace_messages")
    .insert({
      workspace_id: access.workspace_id,
      conversation_id: conversationId,
      client_id: access.client_id,
      sender_user_id: userId,
      sender_type: "Client",
      body: messageBody,
      is_internal: false,
    })
    .select("id, conversation_id, sender_type, body, is_internal, read_at, created_at")
    .single();

  if (messageError || !message) return jsonError(messageError?.message || "Unable to send message.", 500);

  await serviceClient
    .from("workspace_conversations")
    .update({ last_message_at: message.created_at, status: "Open" })
    .eq("id", conversationId)
    .eq("workspace_id", access.workspace_id);

  await serviceClient.from("workspace_notifications").insert({
    workspace_id: access.workspace_id,
    type: "client_message",
    title: "New client portal message",
    body: messageBody.slice(0, 200),
    entity_type: "conversation",
    entity_id: conversationId,
    metadata: { clientId: access.client_id },
  });

  return NextResponse.json({ message, conversationId });
}
