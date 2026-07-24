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
        users: { select: { nama_lengkap: true, avatar_url: true, prodi: true } },
        comments: {
          include: { users: { select: { nama_lengkap: true, avatar_url: true } } },
          orderBy: { created_at: "asc" },
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

    const formatted = {
      ...post,
      is_liked: session ? post.likes?.length > 0 : false,
      is_saved: session ? post.saved_posts?.length > 0 : false,
      likes: undefined,
      saved_posts: undefined,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT dan DELETE tetap sama seperti sebelumnya
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