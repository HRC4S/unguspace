"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MessageCircle, Bookmark, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [saved, setSaved] = useState(post.is_saved);

  const toggleLike = async () => {
    try {
      if (!liked) {
        await apiFetch(`/api/posts/${post.id_post}/likes`, { method: "POST" });
        setLikeCount((c) => c + 1);
      } else {
        await apiFetch(`/api/posts/${post.id_post}/likes`, { method: "DELETE" });
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
          body: JSON.stringify({ id_post: post.id_post }),
        });
      } else {
        await apiFetch("/api/saved-posts", {
          method: "DELETE",
          body: JSON.stringify({ id_post: post.id_post }),
        });
      }
      setSaved(!saved);
    } catch (e) {
      console.error(e);
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
          </div>

          {post.konten_teks && <p className="mt-1 whitespace-pre-wrap">{post.konten_teks}</p>}

          {post.media_url && post.media_type === "image" && (
            <img
              src={post.media_url}
              alt=""
              className="mt-3 max-h-[500px] w-full rounded-xl border object-cover"
            />
          )}
          {post.media_url && post.media_type === "video" && (
            <video src={post.media_url} controls className="mt-3 w-full rounded-xl border" />
          )}

          <div className="mt-3 flex items-center gap-1 text-muted-foreground">
            <Button variant="ghost" size="sm" className="gap-2" onClick={toggleLike}>
              <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likeCount}
            </Button>

            <Link href={`/post/${post.id_post}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                {post._count.comments}
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="ml-auto" onClick={toggleSave}>
              <Bookmark
                className={`h-4 w-4 ${saved ? "fill-blue-500 text-blue-500" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}