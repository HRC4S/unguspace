import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori");
    const id_user = searchParams.get("id_user");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const posts = await prisma.posts.findMany({
      where: {
        visibility: "public",
        ...(kategori && { kategori }),
        ...(id_user && { id_user }),
      },
      include: {
        users: {
          select: { nama_lengkap: true, username: true, avatar_url: true, prodi: true, is_verified: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
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
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit + 1, // ambil 1 ekstra buat tau masih ada halaman berikutnya atau nggak
    });

    const hasMore = posts.length > limit;
    const pagePosts = posts.slice(0, limit);

    const formatted = pagePosts.map((post) => ({
      ...post,
      is_liked: session ? post.likes?.length > 0 : false,
      is_saved: session ? post.saved_posts?.length > 0 : false,
      likes: undefined,
      saved_posts: undefined,
    }));

    return NextResponse.json({ posts: formatted, hasMore, nextPage: page + 1 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const body = await request.json();
    const { konten_teks, media_url, media_type, kategori, visibility } = body;

    const newPost = await prisma.posts.create({
      data: {
        id_post: crypto.randomUUID(),
        id_user: session.id_user,
        konten_teks,
        media_url,
        media_type,
        kategori,
        visibility: visibility || "public",
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}