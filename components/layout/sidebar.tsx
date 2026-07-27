"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, User, PenSquare, Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { usePostComposer } from "@/lib/post-composer-context";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/search", label: "Cari", icon: Search },
  { href: "/notifications", label: "Notifikasi", icon: Bell },
  { href: "/saved", label: "Tersimpan", icon: Bookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, unreadCount } = useAuth();
  const { setOpen } = usePostComposer();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r px-4 py-6">
      <div className="flex flex-col gap-2">
        <div className="mb-6 px-2 text-xl font-bold">UnguSpace</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const showBadge = item.href === "/notifications" && unreadCount > 0;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className="relative w-full justify-start gap-3 text-base"
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {showBadge && (
                  <span className="absolute left-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}

        {user && (
          <Link href={`/profile/${user.id_user}`}>
            <Button
              variant={
                pathname === `/profile/${user.id_user}` ? "secondary" : "ghost"
              }
              className="w-full justify-start gap-3 text-base"
            >
              <User className="h-5 w-5" />
              Profil
            </Button>
          </Link>
        )}

        <Button
          className="mt-4 w-full gap-2 rounded-full"
          size="lg"
          onClick={() => setOpen(true)}
        >
          <PenSquare className="h-4 w-4" />
          Posting
        </Button>
      </div>
    </aside>
  );
}