"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Suggestion = {
  id_user: string;
  nama_lengkap: string;
  username: string;
  avatar_url: string | null;
  prodi: string;
  is_verified: boolean;
};

export function FollowSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/users/suggestions");
        setSuggestions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFollow = async (id: string) => {
    const isFollowing = followedIds.has(id);
    setPendingId(id);

    try {
      if (!isFollowing) {
        await apiFetch("/api/follows", {
          method: "POST",
          body: JSON.stringify({ following_id: id }),
        });
        setFollowedIds((prev) => new Set(prev).add(id));
      } else {
        await apiFetch("/api/follows", {
          method: "DELETE",
          body: JSON.stringify({ following_id: id }),
        });
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return null;

  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-3 font-semibold">Saran Diikuti</h3>

      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Kamu sudah mengikuti semua pengguna yang ada.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => {
            const isFollowing = followedIds.has(s.id_user);
            return (
              <div key={s.id_user} className="flex items-center gap-2">
                <Link href={`/profile/${s.id_user}`}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={s.avatar_url || undefined} />
                    <AvatarFallback>{s.nama_lengkap[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${s.id_user}`}
                    className="flex items-center gap-1 truncate text-sm font-semibold hover:underline"
                  >
                    {s.nama_lengkap}
                    {s.is_verified && (
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-blue-500 text-white" />
                    )}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">@{s.username}</p>
                </div>
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  className="rounded-full"
                  onClick={() => toggleFollow(s.id_user)}
                  disabled={pendingId === s.id_user}
                >
                  {isFollowing ? "Mengikuti" : "Ikuti"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}