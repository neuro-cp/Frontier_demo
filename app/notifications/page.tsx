"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useWorkspace } from "@/components/WorkspaceContext";
import { isUuid } from "@/lib/db/ids";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function linkFor(notification: Notification) {
  if (notification.entity_type === "conversation") return "/messages";
  if (notification.entity_type === "job" && notification.entity_id) return `/jobs/${notification.entity_id}`;
  if (notification.entity_type === "invoice" && notification.entity_id) return `/invoices/${notification.entity_id}`;
  if (notification.entity_type === "estimate" && notification.entity_id) return `/estimates/${notification.entity_id}`;
  if (notification.entity_type === "document" && notification.entity_id) return "/documents";
  return "/dashboard";
}

export default function NotificationsPage() {
  const { activeWorkspace } = useWorkspace();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(() => {
    if (!isUuid(activeWorkspace.id)) {
      setNotifications([]);
      setError("");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const query = new URLSearchParams({ workspaceId: activeWorkspace.id });
    fetch(`/api/notifications?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { notifications?: Notification[]; error?: string }) => {
        if (payload.error) {
          setError(payload.error);
          setNotifications([]);
          return;
        }
        setNotifications(payload.notifications ?? []);
        setError("");
      })
      .catch(() => setError("Unable to load notifications."))
      .finally(() => setIsLoading(false));
  }, [activeWorkspace.id]);

  useEffect(() => {
    if (!isUuid(activeWorkspace.id)) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) {
          setNotifications([]);
          setError("");
          setIsLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    let cancelled = false;
    const query = new URLSearchParams({ workspaceId: activeWorkspace.id });
    fetch(`/api/notifications?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { notifications?: Notification[]; error?: string }) => {
        if (cancelled) return;
        if (payload.error) {
          setError(payload.error);
          setNotifications([]);
          return;
        }
        setNotifications(payload.notifications ?? []);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load notifications.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id]);

  async function updateNotification(action: "read" | "archive" | "all_read", notificationId?: string) {
    if (!isUuid(activeWorkspace.id)) return;
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: activeWorkspace.id, notificationId, action }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Unable to update notification.");
      return;
    }
    loadNotifications();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Internal notification center. External delivery providers are not connected yet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateNotification("all_read")}
          className="rounded-lg border border-gray-300 px-4 py-2 font-semibold dark:border-gray-700"
        >
          Mark All Read
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${notification.read_at ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"}`}>
                      {notification.read_at ? "Read" : "Unread"}
                    </span>
                    <span className="text-xs text-gray-500">{notification.type}</span>
                    <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                  </div>
                  <h2 className="mt-2 font-bold">{notification.title}</h2>
                  {notification.body && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.body}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={linkFor(notification)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Open
                  </Link>
                  {!notification.read_at && (
                    <button type="button" onClick={() => updateNotification("read", notification.id)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700">
                      Mark Read
                    </button>
                  )}
                  <button type="button" onClick={() => updateNotification("archive", notification.id)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700">
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-500">No notifications.</p>
        )}
      </div>
    </div>
  );
}
