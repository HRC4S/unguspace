import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    const user = await prisma.users.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        username: true,
        nama_lengkap: true,
        prodi: true,
        bio: true,
        avatar_url: true,
        is_verified: true,
        _count: {
          select: {
            posts: true,
            follows_follows_follower_idTousers: true,
            follows_follows_following_idTousers: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const isFollowing = session
      ? (await prisma.follows.findFirst({
          where: {
            follower_id: session.id_user,
            following_id: id,
          },
          select: { follower_id: true },
        })) !== null
      : false;

    return NextResponse.json({
      ...user,
      follower_count: user._count.follows_follows_following_idTousers,
      following_count: user._count.follows_follows_follower_idTousers,
      post_count: user._count.posts,
      is_following: isFollowing,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/users/:id -> update profil (nim & email TIDAK BOLEH diubah)
// Admin juga bisa ubah is_verified di sini
export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;
    const admin = isAdminUser(session);
    if (!admin && session.id_user !== id) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { nama_lengkap, prodi, bio, avatar_url, is_verified } = body;

    const data = { nama_lengkap, prodi, bio, avatar_url };
    // Hanya admin yang boleh mengubah status verifikasi
    if (admin && typeof is_verified === "boolean") {
      data.is_verified = is_verified;
    }

    const updated = await prisma.users.update({
      where: { id_user: id },
      data,
      select: {
        id_user: true,
        username: true,
        nama_lengkap: true,
        prodi: true,
        bio: true,
        avatar_url: true,
        is_verified: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;
    if (!isAdminUser(session) && session.id_user !== id) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.users.delete({ where: { id_user: id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}