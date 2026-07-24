"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/notifications/notification-item";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";



export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshUnreadCount } = useAuth();


  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/notifications");
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
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
          />
        ))
      )}
    </div>
  );
}