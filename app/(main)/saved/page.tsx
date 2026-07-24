"use client";

import { useEffect, useState, useCallback } from "react";
import { PostCard } from "@/components/post/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/saved_posts");
      setSaved(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur">
        <h1 className="text-xl font-bold">Tersimpan</h1>
      </div>

      {loading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : saved.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          Belum ada postingan yang disimpan.
        </p>
      ) : (
        saved.map((item) => <PostCard key={item.id_saved} post={item.post} />)
      )}
    </div>
  );
}