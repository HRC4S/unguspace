"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post/post-card";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { FollowButton } from "@/components/profile/follow-button";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileData, postsData] = await Promise.all([
        apiFetch(`/api/users/${id}`),
        apiFetch(`/api/posts?id_user=${id}&limit=50`),
      ]);
      setProfile(profileData);
      setPosts(postsData.posts);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id_post !== postId));
    setProfile((prev: any) =>
      prev ? { ...prev, post_count: Math.max(0, prev.post_count - 1) } : prev
    );
  };

  const handlePostUpdated = (updated: any) => {
    setPosts((prev) =>
      prev.map((p) => (p.id_post === updated.id_post ? { ...p, ...updated } : p))
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Profil tidak ditemukan.
      </p>
    );
  }

  const isOwnProfile = currentUser?.id_user === id;

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-bold">{profile.nama_lengkap}</h1>
          {profile.is_verified && (
            <BadgeCheck className="h-5 w-5 fill-blue-500 text-white" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {profile.post_count} postingan
        </p>
      </div>

      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.nama_lengkap[0]}
            </AvatarFallback>
          </Avatar>

          {isOwnProfile ? (
            <EditProfileDialog user={profile} onUpdated={loadProfile} />
          ) : (
            <FollowButton
              targetUserId={id}
              initialIsFollowing={profile.is_following}
              onToggled={(nowFollowing) => {
                setProfile((prev: any) => ({
                  ...prev,
                  follower_count: prev.follower_count + (nowFollowing ? 1 : -1),
                }));
              }}
            />
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold">{profile.nama_lengkap}</h2>
            {profile.is_verified && (
              <BadgeCheck className="h-4 w-4 fill-blue-500 text-white" />
            )}
          </div>
          <p className="text-sm text-foreground">@{profile.username}</p>
          <p className=" mt-2 text-sm text-muted-foreground">{profile.prodi}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>

        <div className="mt-3 flex gap-4 text-sm">
          <span>
            <strong>{profile.following_count}</strong>{" "}
            <span className="text-muted-foreground">Mengikuti</span>
          </span>
          <span>
            <strong>{profile.follower_count}</strong>{" "}
            <span className="text-muted-foreground">Pengikut</span>
          </span>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          Belum ada postingan.
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id_post}
            post={post}
            onDeleted={handlePostDeleted}
            onUpdated={handlePostUpdated}
          />
        ))
      )}
    </div>
  );
}