import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const session = await getCurrentUser();
    const { id } = await params;

    const post = await prisma.posts.findUnique({
      where: { id_post: id },
      include: {
        users: {
          select: {
            nama_lengkap: true,
            username: true,
            avatar_url: true,
            prodi: true,
            is_verified: true,
          },
        },
        _count: { select: { likes: true } },
        ...(session && {
          likes: {
            where: { id_user: session.id_user },
            select: { id_like: true },
          },
          saved_posts: {
            where: { id_user: session.id_user },
            select: { id_saved: true },
          },
        }),
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 },
      );
    }

    // Ambil komentar terpisah, dengan struktur induk + balasan (sama kayak endpoint /comments)
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

    const formatComment = (c) => ({
      id_comment: c.id_comment,
      id_user: c.id_user,
      isi_komentar: c.isi_komentar,
      media_url: c.media_url,
      created_at: c.created_at,
      users: c.users,
      like_count: c._count.comment_likes,
      is_liked: session ? c.comment_likes?.length > 0 : false,
    });

    const formattedComments = comments.map((c) => ({
      ...formatComment(c),
      replies: c.other_comments.map(formatComment),
    }));

    const formatted = {
      ...post,
      is_liked: session ? post.likes?.length > 0 : false,
      is_saved: session ? post.saved_posts?.length > 0 : false,
      likes: undefined,
      saved_posts: undefined,
      comments: formattedComments,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.posts.findUnique({ where: { id_post: id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!isAdminUser(session) && existing.id_user !== session.id_user) {
      return NextResponse.json(
        { error: "Kamu tidak berhak mengubah postingan ini" },
        { status: 403 },
      );
    }

    const { konten_teks, kategori, visibility } = await request.json();
    const updated = await prisma.posts.update({
      where: { id_post: id },
      data: { konten_teks, kategori, visibility },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.posts.findUnique({ where: { id_post: id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!isAdminUser(session) && existing.id_user !== session.id_user) {
      return NextResponse.json(
        { error: "Kamu tidak berhak menghapus postingan ini" },
        { status: 403 },
      );
    }

    await prisma.posts.delete({ where: { id_post: id } });
    return NextResponse.json({ message: "Postingan berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}