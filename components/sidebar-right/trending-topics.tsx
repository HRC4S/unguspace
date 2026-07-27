"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Trending = {
  kategori: string;
  count: number;
};

export function TrendingTopics() {
  const [trending, setTrending] = useState<Trending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/posts/trending");
        setTrending(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || trending.length === 0) return null;

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        <h3 className="font-semibold">Sedang Trending</h3>
      </div>
      <div className="flex flex-col gap-3">
        {trending.map((t, i) => (
          <Link
            key={t.kategori}
            href={`/search?kategori=${encodeURIComponent(t.kategori)}`}
            className="-mx-1 block rounded px-1 hover:bg-accent/30"
          >
            <p className="text-xs text-muted-foreground">#{i + 1} Kategori</p>
            <p className="text-sm font-semibold">{t.kategori}</p>
            <p className="text-xs text-muted-foreground">{t.count} postingan</p>
          </Link>
        ))}
      </div>
    </div>
  );
}