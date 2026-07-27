"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopbarSearch } from "@/components/layout/topbar-search";
import { PostComposerDialog } from "@/components/post/post-composer-dialog";
import { PostComposerProvider, usePostComposer } from "@/lib/post-composer-context";
import { ProfileCard } from "@/components/sidebar-right/profile-card";
import { FollowSuggestions } from "@/components/sidebar-right/follow-suggestions";
import { TrendingTopics } from "@/components/sidebar-right/trending-topics";
import { useAuth } from "@/lib/auth-context";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { open, setOpen, triggerRefresh } = usePostComposer();

  return (
    <div className="flex min-h-screen justify-center">
      <Sidebar />
      <main className="min-h-screen w-full max-w-[680px] shrink-0 border-x">
        {children}
      </main>
      <aside className="hidden w-80 shrink-0 space-y-4 px-4 py-6 xl:block">
        <TopbarSearch />
        <ProfileCard />
        <FollowSuggestions />
        <TrendingTopics />
      </aside>

      <PostComposerDialog open={open} onOpenChange={setOpen} onPosted={triggerRefresh} />
    </div>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat...
      </div>
    );
  }

  return (
    <PostComposerProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </PostComposerProvider>
  );
}