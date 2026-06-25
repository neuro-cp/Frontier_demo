"use client";

import { useEffect, useMemo, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";

type Conversation = {
  id: string;
  title: string;
  status: string;
  channel: string;
  last_message_at: string | null;
  created_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_type: string;
  body: string;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function ClientPortalMessagesPanel() {
  const { activeWorkspace } = useWorkspace();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ workspaceId: activeWorkspace.id });

    fetch(`/api/client-portal/messages?${query.toString()}`)
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
        if (!cancelled) setError("Unable to load messages.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (activeConversationId || conversations.length === 0) return;
    queueMicrotask(() => setActiveConversationId(conversations[0].id));
  }, [activeConversationId, conversations]);

  const activeMessages = useMemo(
    () => messages.filter((message) => message.conversation_id === activeConversationId),
    [activeConversationId, messages]
  );

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setIsSending(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/client-portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId || undefined,
          body: trimmed,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to send message.");
      setMessages((current) => [...current, payload.message as Message]);
      if (!activeConversationId && payload.conversationId) {
        setActiveConversationId(payload.conversationId as string);
        setConversations((current) => [
          {
            id: payload.conversationId as string,
            title: "Client portal conversation",
            status: "Open",
            channel: "Client Portal",
            last_message_at: payload.message.created_at,
            created_at: payload.message.created_at,
          },
          ...current,
        ]);
      }
      setBody("");
      setNotice("Message sent.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      {(error || notice) && (
        <div className="lg:col-span-2">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
              {notice}
            </p>
          )}
        </div>
      )}

      <aside className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <h2 className="mb-3 font-bold">Conversations</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversationId(conversation.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  activeConversationId === conversation.id
                    ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                }`}
              >
                <div className="font-semibold">{conversation.title}</div>
                <div className="text-xs text-gray-500">{formatDate(conversation.last_message_at ?? conversation.created_at)}</div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No conversations yet.</p>
        )}
      </aside>

      <section className="space-y-4">
        <div className="min-h-[220px] rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          {activeMessages.length > 0 ? (
            <div className="space-y-3">
              {activeMessages.map((message) => (
                <div key={message.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <span>{message.sender_type}</span>
                    <span>{formatDate(message.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Send a message to start the conversation.</p>
          )}
        </div>

        <form onSubmit={sendMessage} className="space-y-3">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Write a message..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={isSending || !body.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
