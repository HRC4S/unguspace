import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/saved-posts?id_user=xxx -> daftar postingan yang disimpan user
export async function GET(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("id_user");
    if (requestedUserId && requestedUserId !== session.id_user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const saved = await prisma.saved_posts.findMany({
      where: { id_user: session.id_user },
      include: {
        posts: {
          include: {
            users: { select: { nama_lengkap: true, avatar_url: true } },
          },
        },
      },
      orderBy: { saved_at: "desc" },
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/saved-posts -> simpan postingan
export async function POST(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id_post } = await request.json();

    if (!id_post) {
      return NextResponse.json(
        { error: "id_post wajib diisi" },
        { status: 400 },
      );
    }

    const saved = await prisma.saved_posts.create({
      data: {
        id_saved: crypto.randomUUID(),
        id_user: session.id_user,
        id_post,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Postingan sudah pernah disimpan" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/saved-posts -> batalkan simpan
export async function DELETE(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id_post } = await request.json();
    if (!id_post) {
      return NextResponse.json(
        { error: "id_post wajib diisi" },
        { status: 400 },
      );
    }

    await prisma.saved_posts.deleteMany({
      where: { id_user: session.id_user, id_post },
    });
    return NextResponse.json({ message: "Berhasil dihapus dari saved posts" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
