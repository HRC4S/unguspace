"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post/post-card";
import { CommentInput } from "@/components/post/comment-input";
import { CommentList } from "@/components/post/comment-list";
import { apiFetch } from "@/lib/api";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPost = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/posts/${id}`);
      setPost(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Postingan</h1>
      </div>

      {loading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !post ? (
        <p className="p-8 text-center text-muted-foreground">
          Postingan tidak ditemukan.
        </p>
      ) : (
        <>
          <PostCard
            post={{
              ...post,
              _count: {
                comments: post.comments?.length ?? 0,
                likes: post._count?.likes ?? 0,
              },
            }}
          />
          <CommentInput postId={post.id_post} onCommented={loadPost} />
          <CommentList
            comments={post.comments ?? []}
            postId={post.id_post}
            onChanged={loadPost}
          />
        </>
      )}
    </div>
  );
}