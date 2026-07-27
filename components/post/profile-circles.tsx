"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Author = {
  id_user: string;
  nama_lengkap: string;
  avatar_url: string | null;
};

export function ProfileCircles({ authors }: { authors: Author[] }) {
  if (authors.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto border-b p-4">
      {authors.map((author) => (
        <Link
          key={author.id_user}
          href={`/profile/${author.id_user}`}
          className="flex flex-col items-center gap-1"
        >
          <Avatar className="h-14 w-14 ring-2 ring-primary ring-offset-2 ring-offset-background">
            <AvatarImage src={author.avatar_url || undefined} />
            <AvatarFallback>{author.nama_lengkap[0]}</AvatarFallback>
          </Avatar>
          <span className="max-w-[60px] truncate text-xs">
            {author.nama_lengkap.split(" ")[0]}
          </span>
        </Link>
      ))}
    </div>
  );
}