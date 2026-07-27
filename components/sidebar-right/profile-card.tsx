"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export function ProfileCard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${user.id_user}`}>
          <Avatar className="h-11 w-11">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.nama_lengkap[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${user.id_user}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold hover:underline">
            {user.nama_lengkap}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{user.username} · {user.prodi}
          </p>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}