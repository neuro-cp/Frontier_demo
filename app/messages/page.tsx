"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";

type Conversation = {
  id: string;
  title: string;
  status: string;
  client_id: string | null;
  last_message_at: string | null;
  created_at: string;
  clients?: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_type: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function getClientName(client: Conversation["clients"]) {
  if (Array.isArray(client)) return client[0]?.name ?? "";
  return client?.name ?? "";
}

export default function MessagesPage() {
  const { activeWorkspace } = useWorkspace();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({
      workspaceId: activeWorkspace.id,
      search,
      archived: includeArchived ? "true" : "false",
    });

    fetch(`/api/workspace-messages?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { conversations?: Conversation[]; messages?: Message[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setError(payload.error);
          setConversations([]);
          setMessages([]);
          return;
        }
        setConversations(payload.conversations ?? []);
        setMessages(payload.messages ?? []);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load conversations.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, includeArchived, search]);

  useEffect(() => {
    if (activeConversationId || conversations.length === 0) return;
    queueMicrotask(() => setActiveConversationId(conversations[0].id));
  }, [activeConversationId, conversations]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null;
  const activeMessages = useMemo(
    () => messages.filter((message) => message.conversation_id === activeConversationId),
    [activeConversationId, messages]
  );

  async function mutateConversation(action: "reply" | "archive" | "reopen" | "read") {
    if (!activeConversationId) return;
    setError("");
    setNotice("");
    const response = await fetch("/api/workspace-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: activeWorkspace.id,
        conversationId: activeConversationId,
        action,
        body: reply,
      }),
    });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      setError(payload.error ?? "Unable to update conversation.");
      return;
    }
    if (payload.message) {
      setMessages((current) => [...current, payload.message as Message]);
      setReply("");
    }
    if (payload.conversation) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId
            ? { ...conversation, status: payload.conversation.status }
            : conversation
        )
      );
    }
    if (action === "read") {
      setMessages((current) =>
        current.map((message) =>
          message.conversation_id === activeConversationId && message.sender_type === "Client"
            ? { ...message, read_at: new Date().toISOString() }
            : message
        )
      );
    }
    setNotice(action === "reply" ? "Reply sent." : "Conversation updated.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Workspace-side client conversations. Email, SMS, and attachments are not connected yet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700">
            <input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />
            Archived
          </label>
        </div>
      </div>

      {(error || notice) && (
        <div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          {notice && <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">{notice}</p>}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          {isLoading ? (
            <p className="p-3 text-sm text-gray-500">Loading conversations...</p>
          ) : conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const lastMessage = [...messages].reverse().find((message) => message.conversation_id === conversation.id);
                const unread = messages.some((message) => message.conversation_id === conversation.id && message.sender_type === "Client" && !message.read_at);
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left ${
                      activeConversationId === conversation.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{getClientName(conversation.clients) || conversation.title}</span>
                      {unread && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">New</span>}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">{lastMessage?.body ?? "No messages yet"}</p>
                    <p className="mt-1 text-xs text-gray-500">{conversation.status} - {formatDate(conversation.last_message_at ?? conversation.created_at)}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="p-3 text-sm text-gray-500">No conversations found.</p>
          )}
        </aside>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          {activeConversation ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{getClientName(activeConversation.clients) || activeConversation.title}</h2>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                    {activeConversation.client_id && <Link href={`/clients/${activeConversation.client_id}`} className="text-blue-600 hover:underline dark:text-blue-400">Open client</Link>}
                    <span>{activeConversation.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => mutateConversation("read")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700">Mark read</button>
                  <button type="button" onClick={() => mutateConversation(activeConversation.status === "Archived" ? "reopen" : "archive")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700">
                    {activeConversation.status === "Archived" ? "Reopen" : "Archive"}
                  </button>
                </div>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {activeMessages.length > 0 ? activeMessages.map((message) => (
                  <div key={message.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="mb-1 flex justify-between gap-3 text-xs text-gray-500">
                      <span>{message.sender_type}</span>
                      <span>{formatDate(message.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                  </div>
                )) : <p className="text-sm text-gray-500">No messages yet.</p>}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void mutateConversation("reply");
                }}
                className="space-y-3"
              >
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  placeholder="Reply to client..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                />
                <button type="submit" disabled={!reply.trim()} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                  Send Reply
                </button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a conversation.</p>
          )}
        </section>
      </div>
    </div>
  );
}
