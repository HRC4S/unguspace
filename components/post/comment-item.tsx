"use client";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CommentInput } from "./comment-input";

type Comment = {
  id_comment: string;
  id_user: string;
  isi_komentar: string;
  media_url: string | null;
  created_at: string;
  like_count: number;
  is_liked: boolean;
  users: { nama_lengkap: string; username: string; avatar_url: string | null };
  replies?: Comment[];
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

function renderWithMentions(text: string, usernameToId: Map<string, string>) {
  const parts = text.split(/(@[a-z0-9_]+)/gi);
  return parts.map((part, i) => {
    const match = part.match(/^@([a-z0-9_]+)$/i);
    if (match) {
      const uname = match[1].toLowerCase();
      const targetId = usernameToId.get(uname);
      if (targetId) {
        return (
          <Link
            key={i}
            href={`/profile/${targetId}`}
            className="font-medium text-primary hover:underline"
          >
            {part}
          </Link>
        );
      }
    }
    return <span key={i}>{part}</span>;
  });
}

export function CommentItem({
  comment,
  postId,
  onChanged,
  isReply = false,
  topLevelCommentId,
  usernameToId,
}: {
  comment: Comment;
  postId: string;
  onChanged: () => void;
  isReply?: boolean;
  topLevelCommentId?: string;
  usernameToId?: Map<string, string>;
}) {
  const [likePending, setLikePending] = useState(false);
  const { user } = useAuth();
  const [liked, setLiked] = useState(comment.is_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const actualTopLevelId = topLevelCommentId ?? comment.id_comment;
  const isOwner = user?.id_user === comment.id_user;

  const map =
    usernameToId ??
    (() => {
      const m = new Map<string, string>();
      m.set(comment.users.username, comment.id_user);
      comment.replies?.forEach((r) => m.set(r.users.username, r.id_user));
      return m;
    })();

  const toggleLike = async () => {
  if (likePending) return;
  setLikePending(true);

  const wasLiked = liked;
  setLiked(!wasLiked);
  setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

  try {
    if (!wasLiked) {
      await apiFetch(`/api/comments/${comment.id_comment}/likes`, {
        method: "POST",
      });
    } else {
      await apiFetch(`/api/comments/${comment.id_comment}/likes`, {
        method: "DELETE",
      });
    }
  } catch (e) {
    setLiked(wasLiked);
    setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    console.error(e);
  } finally {
    setLikePending(false);
  }
};

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(`/api/comments/${comment.id_comment}`, { method: "DELETE" });
      setDeleteOpen(false);
      onChanged();
      toast.success("Komentar berhasil dihapus");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus komentar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={isReply ? "mt-3" : "border-b p-4"}>
      <div className="flex gap-3">
        <Link href={`/profile/${comment.id_user}`}>
          <Avatar className={isReply ? "h-7 w-7" : "h-9 w-9"}>
            <AvatarImage src={comment.users.avatar_url || undefined} />
            <AvatarFallback>{comment.users.nama_lengkap[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${comment.id_user}`}
              className="text-sm font-semibold hover:underline"
            >
              {comment.users.nama_lengkap}
            </Link>
            <span className="text-xs text-muted-foreground">
              · {timeAgo(comment.created_at)}
            </span>

            {isOwner && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="ml-auto text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {comment.isi_komentar && (
            <p className="mt-0.5 whitespace-pre-wrap text-sm">
              {renderWithMentions(comment.isi_komentar, map)}
            </p>
          )}
          {comment.media_url && (
            <img
              src={comment.media_url}
              alt=""
              className="mt-2 max-h-64 rounded-lg border object-cover"
            />
          )}

          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <button
            type="button"
            onClick={toggleLike}
            disabled={likePending}
            className="flex items-center gap-1 hover:text-foreground disabled:opacity-50"
          >
            <Heart
              className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            {likeCount > 0 && likeCount}
          </button>

            <button
              type="button"
              onClick={() => setShowReplyInput((v) => !v)}
              className="hover:text-foreground"
            >
              Balas
            </button>
          </div>

          {showReplyInput && (
            <div className="mt-2">
              <CommentInput
                postId={postId}
                parentCommentId={actualTopLevelId}
                mentionUsername={comment.users.username}
                compact
                onCommented={() => {
                  setShowReplyInput(false);
                  onChanged();
                }}
              />
            </div>
          )}

          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 border-l-2 pl-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id_comment}
                  comment={reply}
                  postId={postId}
                  onChanged={onChanged}
                  isReply
                  topLevelCommentId={comment.id_comment}
                  usernameToId={map}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus komentar ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan
              {!isReply && comment.replies && comment.replies.length > 0
                ? ", dan semua balasan di bawahnya akan ikut terhapus."
                : "."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}