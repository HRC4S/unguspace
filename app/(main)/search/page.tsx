"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, BadgeCheck } from "lucide-react";
import { PostCard } from "@/components/post/post-card";
import { apiFetch } from "@/lib/api";

const KATEGORI_OPTIONS = ["UIUX", "Film", "Event", "Coding", "Umum"];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [kategori, setKategori] = useState(searchParams.get("kategori") || "all");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q: string, kat: string) => {
    if (!q.trim() && kat === "all") {
      setUsers([]);
      setPosts([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (kat !== "all") params.set("kategori", kat);
      const data = await apiFetch(`/api/search?${params.toString()}`);
      setUsers(data.users || []);
      setPosts(data.posts || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialKategori = searchParams.get("kategori");
    const initialQ = searchParams.get("q");
    if (initialKategori || initialQ) {
      runSearch(initialQ || "", initialKategori || "all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query, kategori);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur">
        <h1 className="mb-3 text-xl font-bold">Cari</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari akun atau kata dalam postingan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {KATEGORI_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !searched ? (
        <p className="p-8 text-center text-muted-foreground">
          Ketik kata kunci atau pilih kategori untuk mencari.
        </p>
      ) : users.length === 0 && posts.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          Tidak ada hasil yang cocok.
        </p>
      ) : (
        <>
          {users.length > 0 && (
            <div className="border-b p-4">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Akun ({users.length})
              </h2>
              <div className="flex flex-col gap-3">
                {users.map((u) => (
                  <Link
                    key={u.id_user}
                    href={`/profile/${u.id_user}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/30"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback>{u.nama_lengkap[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="flex items-center gap-1 font-medium">
                        {u.nama_lengkap}
                        {u.is_verified && (
                          <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{u.username} · {u.prodi}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <h2 className="p-4 pb-0 text-sm font-semibold text-muted-foreground">
                Postingan ({posts.length})
              </h2>
              {posts.map((post) => (
                <PostCard key={post.id_post} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-muted-foreground">Memuat...</div>}
    >
      <SearchPageContent />
    </Suspense>
  );
}