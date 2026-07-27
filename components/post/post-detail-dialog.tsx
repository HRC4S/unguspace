"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Bookmark, BadgeCheck } from "lucide-react";
import { CommentInput } from "@/components/post/comment-input";
import { CommentItem } from "@/components/post/comment-item";
import { apiFetch } from "@/lib/api";

export function PostDetailDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const loadPost = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/posts/${postId}`);
      setPost(data);
      setLiked(data.is_liked);
      setLikeCount(data.like_count);
      setSaved(data.is_saved);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && postId) {
      loadPost();
    }
  }, [open, postId]);

  const toggleLike = async () => {
    try {
      if (!liked) {
        await apiFetch(`/api/posts/${postId}/likes`, { method: "POST" });
        setLikeCount((c) => c + 1);
      } else {
        await apiFetch(`/api/posts/${postId}/likes`, { method: "DELETE" });
        setLikeCount((c) => c - 1);
      }
      setLiked(!liked);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSave = async () => {
    try {
      if (!saved) {
        await apiFetch("/api/saved-posts", {
          method: "POST",
          body: JSON.stringify({ id_post: postId }),
        });
      } else {
        await apiFetch("/api/saved-posts", {
          method: "DELETE",
          body: JSON.stringify({ id_post: postId }),
        });
      }
      setSaved(!saved);
    } catch (e) {
      console.error(e);
    }
  };

  const hasMedia = !loading && post?.media_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex gap-0 overflow-hidden p-0"
        style={{
          width: "min(1000px, 95vw)",
          maxWidth: "min(1000px, 95vw)",
          height: "85vh",
          maxHeight: "90vh",
        }}
      >
        {/* Kolom kiri: media */}
        {hasMedia ? (
          <div
            className="hidden h-full items-center justify-center bg-white md:flex"
            style={{ width: 620, flexShrink: 0 }}
          >
            {post.media_type === "video" ? (
              <video
                src={post.media_url}
                controls
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={post.media_url}
                alt=""
                className="h-full w-full object-contain"
              />
            )}
          </div>
        ) : (
          <div
            className="hidden h-full items-center justify-center bg-muted p-8 md:flex"
            style={{ width: 620, flexShrink: 0 }}
          >
            <p className="text-center text-lg">{post?.konten_teks}</p>
          </div>
        )}

        {/* Kolom kanan: info + komentar */}
        <div className="flex h-full min-w-0 flex-1 flex-col">
          {loading || !post ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b p-3">
                <Link href={`/profile/${post.id_user}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.users.avatar_url || undefined} />
                    <AvatarFallback>{post.users.nama_lengkap[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  href={`/profile/${post.id_user}`}
                  className="flex items-center gap-1 text-sm font-semibold hover:underline"
                >
                  {post.users.nama_lengkap}
                  {post.users.is_verified && (
                    <BadgeCheck className="h-3.5 w-3.5 fill-blue-500 text-white" />
                  )}
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto">
                {post.media_url && post.konten_teks && (
                  <div className="flex gap-3 border-b p-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={post.users.avatar_url || undefined} />
                      <AvatarFallback>{post.users.nama_lengkap[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">
                      <span className="font-semibold">
                        {post.users.nama_lengkap}
                      </span>{" "}
                      {post.konten_teks}
                    </p>
                  </div>
                )}

                {post.comments?.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Belum ada komentar.
              </p>
              ) : (
                post.comments?.map((comment: any) => (
                  <CommentItem
                    key={comment.id_comment}
                    comment={comment}
                    postId={post.id_post}
                    onChanged={loadPost}
                  />
                ))
              )}
              </div>

              <div className="border-t">
                <div className="flex items-center gap-1 p-2 text-muted-foreground">
                  <Button variant="ghost" size="sm" className="gap-2" onClick={toggleLike}>
                    <Heart
                      className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={toggleSave}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${saved ? "fill-blue-500 text-blue-500" : ""}`}
                    />
                  </Button>
                </div>
                <p className="px-3 pb-2 text-sm font-semibold">{likeCount} suka</p>

                <CommentInput postId={postId!} onCommented={loadPost} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}