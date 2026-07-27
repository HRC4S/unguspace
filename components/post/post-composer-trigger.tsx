"use client";

import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Image as ImageIcon, Tag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePostComposer } from "@/lib/post-composer-context";

export function PostComposerTrigger() {
  const { user } = useAuth();
  const { setOpen, setPendingFile } = usePostComposer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setPendingFile(selected);
      setOpen(true);
    }
    e.target.value = "";
  };

  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback>{user.nama_lengkap[0]}</AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-accent"
        >
          Apa yang Anda pikirkan, {user.nama_lengkap.split(" ")[0]}?
        </button>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-around">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          <ImageIcon className="h-5 w-5 text-green-500" />
          Foto/Video
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          <Tag className="h-5 w-5 text-yellow-500" />
          Kategori
        </button>
      </div>
    </div>
  );
}