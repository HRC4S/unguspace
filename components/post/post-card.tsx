"use client";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  BadgeCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { PostDetailDialog } from "@/components/post/post-detail-dialog";
import { EditPostDialog } from "@/components/post/edit-post-dialog";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

type Post = {
  id_post: string;
  id_user: string;
  konten_teks: string | null;
  media_url: string | null;
  media_type: string | null;
  kategori: string | null;
  like_count: number;
  created_at: string;
  is_liked: boolean;
  is_saved: boolean;
  users: {
    nama_lengkap: string;
    avatar_url: string | null;
    prodi: string;
    is_verified: boolean;
  };
  _count: { comments: number; likes: number };
};

export function PostCard({
  post,
  onDeleted,
  onUpdated,
}: {
  post: Post;
  onDeleted?: (id: string) => void;
  onUpdated?: (post: any) => void;
}) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [saved, setSaved] = useState(post.is_saved);
  const [likePending, setLikePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id_user === post.id_user;

  const toggleLike = async () => {
    if (likePending) return;
    setLikePending(true);

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      if (!wasLiked) {
        await apiFetch(`/api/posts/${post.id_post}/likes`, { method: "POST" });
      } else {
        await apiFetch(`/api/posts/${post.id_post}/likes`, { method: "DELETE" });
      }
    } catch (e: any) {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      toast.error(e.message || "Gagal memproses like");
    } finally {
      setLikePending(false);
    }
  };

  const toggleSave = async () => {
    if (savePending) return;
    setSavePending(true);

    const wasSaved = saved;
    setSaved(!wasSaved);

    try {
      if (!wasSaved) {
        await apiFetch("/api/saved-posts", {
          method: "POST",
          body: JSON.stringify({ id_post: post.id_post }),
        });
        toast.success("Postingan disimpan");
      } else {
        await apiFetch("/api/saved-posts", {
          method: "DELETE",
          body: JSON.stringify({ id_post: post.id_post }),
        });
        toast.success("Dihapus dari tersimpan");
      }
    } catch (e: any) {
      setSaved(wasSaved);
      toast.error(e.message || "Gagal memproses simpan");
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(`/api/posts/${post.id_post}`, { method: "DELETE" });
      onDeleted?.(post.id_post);
      setDeleteOpen(false);
      toast.success("Postingan berhasil dihapus");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus postingan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="border-b p-4 transition-colors hover:bg-accent/30">
      <div className="flex gap-3">
        <Link href={`/profile/${post.id_user}`}>
          <Avatar>
            <AvatarImage src={post.users.avatar_url || undefined} />
            <AvatarFallback>{post.users.nama_lengkap[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.id_user}`}
              className="font-semibold hover:underline"
            >
              {post.users.nama_lengkap}
            </Link>
            {post.users.is_verified && (
              <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />
            )}
            <span className="text-sm text-muted-foreground">· {post.users.prodi}</span>
            {post.kategori && (
              <Badge variant="secondary" className="ml-auto">
                {post.kategori}
              </Badge>
            )}

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {post.konten_teks && <p className="mt-1 whitespace-pre-wrap">{post.konten_teks}</p>}

          {post.media_url && post.media_type === "image" && (
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="mt-3 block w-full"
            >
              <img
                src={post.media_url}
                alt=""
                className="max-h-[500px] w-full rounded-xl border object-cover"
              />
            </button>
          )}
          {post.media_url && post.media_type === "video" && (
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="mt-3 block w-full"
            >
              <video src={post.media_url} className="w-full rounded-xl border" />
            </button>
          )}

          <div className="mt-3 flex items-center gap-1 text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={toggleLike}
              disabled={likePending}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likeCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setDetailOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              {post._count.comments}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={toggleSave}
              disabled={savePending}
            >
              <Bookmark
                className={`h-4 w-4 ${saved ? "fill-blue-500 text-blue-500" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <PostDetailDialog
        postId={post.id_post}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <EditPostDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        post={post}
        onUpdated={(updated) => onUpdated?.(updated)}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus postingan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Postingan, komentar, dan like yang
              terkait akan terhapus permanen.
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
    </article>
  );
}