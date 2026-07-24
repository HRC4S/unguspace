"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export function CommentInput({
  postId,
  onCommented,
}: {
  postId: string;
  onCommented: () => void;
}) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      await apiFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ isi_komentar: text }),
      });
      setText("");
      onCommented();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 border-b p-4">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback>{user.nama_lengkap[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Tulis komentar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-16 resize-none border-none text-sm shadow-none focus-visible:ring-0"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            className="rounded-full"
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
          >
            {loading ? "Mengirim..." : "Kirim"}
          </Button>
        </div>
      </div>
    </div>
  );
}