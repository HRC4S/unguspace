import { CommentItem } from "./comment-item";

type Comment = {
  id_comment: string;
  isi_komentar: string;
  media_url: string | null;
  created_at: string;
  like_count: number;
  is_liked: boolean;
  users: { nama_lengkap: string; avatar_url: string | null };
  replies?: Comment[];
};

export function CommentList({
  comments,
  postId,
  onChanged,
}: {
  comments: Comment[];
  postId: string;
  onChanged: () => void;
}) {
  if (comments.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        Belum ada komentar. Jadilah yang pertama berkomentar.
      </p>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id_comment}
          comment={comment}
          postId={postId}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}