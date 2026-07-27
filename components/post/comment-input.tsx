"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export function CommentInput({
  postId,
  parentCommentId,
  mentionUsername,
  compact = false,
  onCommented,
}: {
  postId: string;
  parentCommentId?: string;
  mentionUsername?: string;
  compact?: boolean;
  onCommented: () => void;
}) {
  const { user } = useAuth();
  const [text, setText] = useState(mentionUsername ? `@${mentionUsername} ` : "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mentionUsername) {
      setText(`@${mentionUsername} `);
    }
  }, [mentionUsername]);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    setLoading(true);

    try {
      let media_url = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const uploaded = await res.json();
        if (!res.ok) throw new Error(uploaded.error || "Gagal upload gambar");
        media_url = uploaded.media_url;
      }

      await apiFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          isi_komentar: text,
          media_url,
          parent_comment_id: parentCommentId || null,
        }),
      });

      setText(mentionUsername ? `@${mentionUsername} ` : "");
      removeFile();
      onCommented();
    } catch (e: any) {
      toast.error(e.message || "Gagal mengirim komentar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "flex gap-2" : "flex gap-3 border-b p-4"}>
      <Avatar className={compact ? "h-7 w-7" : "h-9 w-9"}>
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback>{user.nama_lengkap[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder={parentCommentId ? "Tulis balasan..." : "Tulis komentar..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus={compact}
          className={`resize-none border-none shadow-none focus-visible:ring-0 ${
            compact ? "min-h-9 text-xs" : "min-h-16 text-sm"
          }`}
        />

        {preview && (
          <div className="relative mb-2 inline-block">
            <img
              src={preview}
              alt=""
              className="max-h-40 rounded-lg border object-cover"
            />
            <button
              type="button"
              onClick={removeFile}
              className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="cursor-pointer text-primary">
            <ImageIcon className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <Button
            size="sm"
            className="rounded-full"
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !file)}
          >
            {loading ? "Mengirim..." : "Kirim"}
          </Button>
        </div>
      </div>
    </div>
  );
}