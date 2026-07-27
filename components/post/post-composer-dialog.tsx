"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePostComposer } from "@/lib/post-composer-context";
import { apiFetch } from "@/lib/api";

const KATEGORI_OPTIONS = ["UIUX", "Film", "Event", "Coding", "Umum"];

export function PostComposerDialog({
  open,
  onOpenChange,
  onPosted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPosted: () => void;
}) {
  const { user } = useAuth();
  const { pendingFile, setPendingFile } = usePostComposer();

  const [text, setText] = useState("");
  const [kategori, setKategori] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && pendingFile) {
      setFile(pendingFile);
      setPreview(URL.createObjectURL(pendingFile));
      setPendingFile(null);
    }
  }, [open, pendingFile, setPendingFile]);

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

  const resetForm = () => {
    setText("");
    setKategori("");
    removeFile();
    setError("");
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    setError("");
    setLoading(true);

    try {
      let media_url = null;
      let media_type = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const uploaded = await res.json();
        if (!res.ok) throw new Error(uploaded.error || "Gagal upload media");
        media_url = uploaded.media_url;
        media_type = uploaded.media_type;
      }

      await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          konten_teks: text,
          media_url,
          media_type,
          kategori: kategori || null,
          visibility: "public",
        }),
      });

      resetForm();
      onOpenChange(false);
      onPosted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat Postingan</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.nama_lengkap[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{user.nama_lengkap}</p>

              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Apa yang terjadi?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              className="min-h-28 resize-none border-none p-0 text-lg shadow-none focus-visible:ring-0"
            />

            {preview && (
              <div className="relative mt-2 flex justify-center rounded-xl border bg-muted">
                <img
                  src={preview}
                  alt=""
                  className="max-h-[60vh] w-auto rounded-xl object-contain"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1.5 text-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <label className="cursor-pointer text-primary">
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <Button
            onClick={handleSubmit}
            disabled={loading || (!text.trim() && !file)}
            className="rounded-full"
          >
            {loading ? "Memposting..." : "Posting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}