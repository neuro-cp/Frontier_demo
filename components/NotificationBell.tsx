"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { useWorkspace } from "@/components/WorkspaceContext";

export default function NotificationBell() {
  const { user } = useAuthSession();
  const { activeWorkspace } = useWorkspace();
  const [unreadCount, setUnreadCount] = useState(0);
  const [canViewNotifications, setCanViewNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const query = new URLSearchParams({ workspaceId: activeWorkspace.id });

    fetch(`/api/notifications?${query.toString()}`)
      .then((response) => response.json())
      .then((payload: { unreadCount?: number; error?: string }) => {
        if (cancelled) return;
        setCanViewNotifications(!payload.error);
        setUnreadCount(payload.unreadCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) {
          setCanViewNotifications(false);
          setUnreadCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.id, user]);

  if (!user || !canViewNotifications) return null;

  return (
    <Link
      href="/notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      aria-label="Notifications"
      title="Notifications"
    >
      <span>!</span>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
