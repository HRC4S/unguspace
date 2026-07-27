"use client";

import { Heart, MessageCircle, MessageCircleReply, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Notification = {
  id_notif: string;
  tipe: string;
  pesan: string | null;
  is_read: boolean;
  created_at: string;
  reference_id: string | null;
  actor: {
    nama_lengkap: string;
    avatar_url: string | null;
  } | null;
};

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  return `${days}h`;
}

const iconMap: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircleReply,
  follow: UserPlus,
};

const iconColorMap: Record<string, string> = {
  like: "text-red-500",
  comment: "text-blue-500",
  reply: "text-purple-500",
  follow: "text-green-500",
};

export function NotificationItem({
  notification,
  onRead,
  onOpenPost,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onOpenPost: (postId: string) => void;
}) {
  const Icon = iconMap[notification.tipe] || Heart;
  const iconColor = iconColorMap[notification.tipe] || "text-muted-foreground";

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id_notif);
    if (notification.tipe !== "follow" && notification.reference_id) {
      onOpenPost(notification.reference_id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer gap-3 border-b p-4 transition-colors hover:bg-accent/30 ${
        !notification.is_read ? "bg-primary/5" : ""
      }`}
    >
      <Icon className={`mt-1 h-5 w-5 shrink-0 ${iconColor}`} />

      <Avatar className="h-9 w-9">
        <AvatarImage src={notification.actor?.avatar_url || undefined} />
        <AvatarFallback>
          {notification.actor?.nama_lengkap?.[0] || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">
            {notification.actor?.nama_lengkap || "Seseorang"}
          </span>{" "}
          {notification.tipe === "like" && "menyukai postinganmu"}
          {notification.tipe === "comment" && "mengomentari postinganmu"}
          {notification.tipe === "reply" && "membalas komentarmu"}
          {notification.tipe === "follow" && "mengikuti kamu"}
        </p>
        <span className="text-xs text-muted-foreground">
          {timeAgo(notification.created_at)}
        </span>
      </div>

      {!notification.is_read && (
        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
}