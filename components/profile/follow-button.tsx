"use client";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onToggled,
}: {
  targetUserId: string;
  initialIsFollowing: boolean;
  onToggled?: (nowFollowing: boolean) => void;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (!isFollowing) {
        await apiFetch("/api/follows", {
          method: "POST",
          body: JSON.stringify({ following_id: targetUserId }),
        });
        toast.success("Berhasil mengikuti");
      } else {
        await apiFetch("/api/follows", {
          method: "DELETE",
          body: JSON.stringify({ following_id: targetUserId }),
        });
        toast.success("Berhasil berhenti mengikuti");
      }
      const next = !isFollowing;
      setIsFollowing(next);
      onToggled?.(next);
    } catch (e: any) {
      toast.error(e.message || "Gagal memproses follow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleToggle}
      disabled={loading}
      className="rounded-full"
    >
      {isFollowing ? "Mengikuti" : "Ikuti"}
    </Button>
  );
}