import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const comments = await prisma.comments.findMany({
      where: { id_post: id },
      include: { users: { select: { nama_lengkap: true, avatar_url: true } } },
      orderBy: { created_at: "asc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;
    const { isi_komentar } = await request.json();

    if (!isi_komentar) {
      return NextResponse.json(
        { error: "isi_komentar wajib diisi" },
        { status: 400 },
      );
    }

    const post = await prisma.posts.findUnique({
      where: { id_post: id },
      select: { id_user: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 },
      );
    }

    const newComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.comments.create({
        data: {
          id_comment: crypto.randomUUID(),
          id_post: id,
          id_user: session.id_user,
          isi_komentar,
        },
      });

      // Jangan kirim notif ke diri sendiri
      if (post.id_user !== session.id_user) {
        await tx.notifications.create({
          data: {
            id_notif: crypto.randomUUID(),
            id_user: post.id_user,
            actor_id: session.id_user,
            reference_id: comment.id_comment,
            tipe: "comment",
            pesan: `${session.nama_lengkap} mengomentari postinganmu`,
          },
        });
      }

      return comment;
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}