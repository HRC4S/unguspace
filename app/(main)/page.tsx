"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { PostCard } from "@/components/post/post-card";
import { PostComposerTrigger } from "@/components/post/post-composer-trigger";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { usePostComposer } from "@/lib/post-composer-context";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { refreshKey } = usePostComposer();
  const observerTarget = useRef<HTMLDivElement>(null);
  const postsRef = useRef<any[]>([]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/posts?page=1&limit=10");
      setPosts(data.posts);
      setHasMore(data.hasMore);
      setPage(2);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await apiFetch(`/api/posts?page=${page}&limit=10`);
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage, refreshKey]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  // Polling diam-diam: refresh like_count & comment_count post yang udah ke-load,
  // tanpa reset urutan/scroll position dan tanpa nambah post baru
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentPosts = postsRef.current;
      if (currentPosts.length === 0) return;

      try {
        const counts = await apiFetch("/api/posts/counts", {
          method: "POST",
          body: JSON.stringify({ ids: currentPosts.map((p) => p.id_post) }),
        });

        setPosts((prev) =>
          prev.map((p) => {
            const fresh = counts.find((c: any) => c.id_post === p.id_post);
            if (!fresh) return p;
            return {
              ...p,
              like_count: fresh.like_count,
              _count: { ...p._count, comments: fresh.comment_count },
            };
          })
        );
      } catch (e) {
        console.error(e);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);
  
  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id_post !== id));
  };

  const handlePostUpdated = (updated: any) => {
    setPosts((prev) =>
      prev.map((p) => (p.id_post === updated.id_post ? { ...p, ...updated } : p))
    );
  };

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur">
        <h1 className="text-xl font-bold">Beranda</h1>
      </div>

      <PostComposerTrigger />

      {loading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">Belum ada postingan.</p>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id_post}
              post={post}
              onDeleted={handlePostDeleted}
              onUpdated={handlePostUpdated}
            />
          ))}

          <div ref={observerTarget} className="h-4" />

          {loadingMore && (
            <div className="space-y-4 p-4">
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {!hasMore && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Sudah sampai akhir feed.
            </p>
          )}
        </>
      )}
    </div>
  );
}