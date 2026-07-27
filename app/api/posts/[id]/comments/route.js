import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const session = await getCurrentUser();
    const { id } = await params;

    const comments = await prisma.comments.findMany({
      where: { id_post: id, parent_comment_id: null },
      include: {
        users: { select: { nama_lengkap: true, username: true, avatar_url: true } },
        _count: { select: { comment_likes: true } },
        ...(session && {
          comment_likes: {
            where: { id_user: session.id_user },
            select: { id_comment_like: true },
          },
        }),
        other_comments: {
          include: {
            users: { select: { nama_lengkap: true, username: true, avatar_url: true } },
            _count: { select: { comment_likes: true } },
            ...(session && {
              comment_likes: {
                where: { id_user: session.id_user },
                select: { id_comment_like: true },
              },
            }),
          },
          orderBy: { created_at: "asc" },
        },
      },
      orderBy: { created_at: "asc" },
    });

    const format = (c) => ({
      id_comment: c.id_comment,
      id_user: c.id_user,
      isi_komentar: c.isi_komentar,
      media_url: c.media_url,
      created_at: c.created_at,
      users: c.users,
      like_count: c._count.comment_likes,
      is_liked: session ? c.comment_likes?.length > 0 : false,
    });

    const formatted = comments.map((c) => ({
      ...format(c),
      replies: c.other_comments.map(format),
    }));

    return NextResponse.json(formatted);
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
    const { isi_komentar, media_url, parent_comment_id } = await request.json();

    if (!isi_komentar && !media_url) {
      return NextResponse.json(
        { error: "Komentar atau gambar wajib diisi" },
        { status: 400 }
      );
    }

    const post = await prisma.posts.findUnique({ where: { id_post: id } });
    if (!post) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Kalau ini balasan, notif ditujukan ke pemilik komentar induk, bukan pemilik post
    let notifyUserId = post.id_user;
    if (parent_comment_id) {
      const parentComment = await prisma.comments.findUnique({
        where: { id_comment: parent_comment_id },
      });
      if (parentComment) notifyUserId = parentComment.id_user;
    }

    const [newComment] = await prisma.$transaction([
      prisma.comments.create({
        data: {
          id_comment: crypto.randomUUID(),
          id_post: id,
          id_user: session.id_user,
          isi_komentar: isi_komentar || "",
          media_url: media_url || null,
          parent_comment_id: parent_comment_id || null,
        },
        include: {
          users: { select: { nama_lengkap: true, username: true, avatar_url: true } },
        },
      }),
      ...(notifyUserId !== session.id_user
        ? [
            prisma.notifications.create({
              data: {
                id_notif: crypto.randomUUID(),
                id_user: notifyUserId,
                actor_id: session.id_user,
                reference_id: id,
                tipe: parent_comment_id ? "reply" : "comment",
                pesan: parent_comment_id
                  ? `${session.nama_lengkap} membalas komentarmu`
                  : `${session.nama_lengkap} mengomentari postinganmu`,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(
      { ...newComment, like_count: 0, is_liked: false, replies: [] },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}