"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BadgeCheck, TrendingUp, MessageSquareText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api";

type UserResult = {
  id_user: string;
  nama_lengkap: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
};

type PostResult = {
  id_post: string;
  konten_teks: string | null;
  media_url: string | null;
  media_type: string | null;
  users: { nama_lengkap: string; username: string; avatar_url: string | null };
};

type Trending = {
  kategori: string;
  count: number;
};

export function TopbarSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<UserResult[]>([]);
  const [trending, setTrending] = useState<Trending[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [sugg, trend] = await Promise.all([
          apiFetch("/api/users/suggestions").catch(() => []),
          apiFetch("/api/posts/trending").catch(() => []),
        ]);
        setSuggestions(sugg);
        setTrending(trend);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUserResults([]);
      setPostResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
        setUserResults(data.users || []);
        setPostResults(data.posts || []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const goToProfile = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/profile/${id}`);
  };

  const goToPost = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/post/${id}`);
  };

  const goToTrending = (kategori: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/search?kategori=${encodeURIComponent(kategori)}`);
  };

  const goToFullSearch = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const showEmptyState = !query.trim();
  const hasResults = userResults.length > 0 || postResults.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari akun atau postingan..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToFullSearch()}
          className="rounded-full bg-muted pl-9 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-xl border bg-background shadow-lg">
          {showEmptyState ? (
            <div className="divide-y">
              {suggestions.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
                    Saran Akun
                  </p>
                  {suggestions.map((u) => (
                    <button
                      key={u.id_user}
                      onClick={() => goToProfile(u.id_user)}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-accent"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback>{u.nama_lengkap[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 truncate text-sm font-medium">
                          {u.nama_lengkap}
                          {u.is_verified && (
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-blue-500 text-white" />
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{u.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {trending.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 flex items-center gap-1 px-1 text-xs font-semibold text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Trending
                  </p>
                  {trending.map((t) => (
                    <button
                      key={t.kategori}
                      onClick={() => goToTrending(t.kategori)}
                      className="flex w-full flex-col rounded-lg p-2 text-left hover:bg-accent"
                    >
                      <span className="text-sm font-medium">{t.kategori}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.count} postingan
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {suggestions.length === 0 && trending.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Belum ada saran untuk ditampilkan.
                </p>
              )}
            </div>
          ) : loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Mencari...</p>
          ) : !hasResults ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Tidak ada hasil ditemukan.
            </p>
          ) : (
            <div className="divide-y">
              {userResults.length > 0 && (
                <div className="p-2">
                  <p className="mb-1 px-2 pt-1 text-xs font-semibold text-muted-foreground">
                    Akun
                  </p>
                  {userResults.map((u) => (
                    <button
                      key={u.id_user}
                      onClick={() => goToProfile(u.id_user)}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-accent"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback>{u.nama_lengkap[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 truncate text-sm font-medium">
                          {u.nama_lengkap}
                          {u.is_verified && (
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-blue-500 text-white" />
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{u.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {postResults.length > 0 && (
                <div className="p-2">
                  <p className="mb-1 px-2 pt-1 text-xs font-semibold text-muted-foreground">
                    Postingan
                  </p>
                  {postResults.map((p) => (
                    <button
                      key={p.id_post}
                      onClick={() => goToPost(p.id_post)}
                      className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-accent"
                    >
                      {p.media_url && p.media_type === "image" ? (
                        <img
                          src={p.media_url}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.users.nama_lengkap}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {p.konten_teks || "(tidak ada teks)"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={goToFullSearch}
                className="w-full p-3 text-center text-sm text-primary hover:bg-accent"
              >
                Lihat semua hasil untuk "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}