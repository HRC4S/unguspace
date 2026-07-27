"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/notifications/notification-item";
import { PostDetailDialog } from "@/components/post/post-detail-dialog";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { refreshUnreadCount } = useAuth();

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch("/api/notifications");
      setNotifications(data);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Polling: refresh diam-diam tiap 15 detik biar notif baru otomatis muncul
    const interval = setInterval(() => loadNotifications(true), 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id_notif === id ? { ...n, is_read: true } : n))
    );
    try {
      await apiFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id_notif: id }),
      });
      refreshUnreadCount();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await apiFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ mark_all: true }),
      });
      refreshUnreadCount();
    } catch (e) {
      console.error(e);
    }
  };

  const openPost = (postId: string) => {
    setSelectedPostId(postId);
    setDetailOpen(true);
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur">
        <h1 className="text-xl font-bold">Notifikasi</h1>
        {hasUnread && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          Belum ada notifikasi.
        </p>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id_notif}
            notification={notification}
            onRead={markAsRead}
            onOpenPost={openPost}
          />
        ))
      )}

      <PostDetailDialog
        postId={selectedPostId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}