import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Comment = {
  id_comment: string;
  isi_komentar: string;
  created_at: string;
  users: {
    nama_lengkap: string;
    avatar_url: string | null;
  };
};

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  return `${days}h`;
}

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3 border-b p-4">
      <Avatar className="h-9 w-9">
        <AvatarImage src={comment.users.avatar_url || undefined} />
        <AvatarFallback>{comment.users.nama_lengkap[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{comment.users.nama_lengkap}</span>
          <span className="text-xs text-muted-foreground">
            · {timeAgo(comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment.isi_komentar}</p>
      </div>
    </div>
  );
}