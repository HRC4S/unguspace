"use client";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

const KATEGORI_OPTIONS = ["UIUX", "Film", "Event", "Coding", "Umum"];

export function EditPostDialog({
  open,
  onOpenChange,
  post,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: { id_post: string; konten_teks: string | null; kategori: string | null };
  onUpdated: (updated: any) => void;
}) {
  const [text, setText] = useState(post.konten_teks || "");
  const [kategori, setKategori] = useState(post.kategori || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSubmit = async () => {
  setError("");
  setLoading(true);
  try {
    const updated = await apiFetch(`/api/posts/${post.id_post}`, {
      method: "PUT",
      body: JSON.stringify({
        konten_teks: text,
        kategori: kategori || null,
        visibility: "public",
      }),
    });
    onUpdated(updated);
    onOpenChange(false);
    toast.success("Postingan berhasil diperbarui");
  } catch (err: any) {
    setError(err.message);
    toast.error(err.message || "Gagal memperbarui postingan");
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Postingan</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger className="w-40">
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

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32 resize-none"
            placeholder="Apa yang terjadi?"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}