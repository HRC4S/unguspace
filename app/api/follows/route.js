import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

// POST -> follow user lain
export async function POST(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { follower_id, following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json(
        { error: "following_id wajib diisi" },
        { status: 400 },
      );
    }

    const effectiveFollowerId = isAdminUser(session)
      ? follower_id || session.id_user
      : session.id_user;

    if (effectiveFollowerId === following_id) {
      return NextResponse.json(
        { error: "Tidak bisa follow diri sendiri" },
        { status: 400 },
      );
    }

    const follow = await prisma.follows.create({
      data: { follower_id: effectiveFollowerId, following_id },
    });

    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Sudah mengikuti user ini" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE -> unfollow
export async function DELETE(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { follower_id, following_id } = await request.json();

    if (!following_id) {
      return NextResponse.json(
        { error: "following_id wajib diisi" },
        { status: 400 },
      );
    }

    const effectiveFollowerId = isAdminUser(session)
      ? follower_id || session.id_user
      : session.id_user;

    await prisma.follows.deleteMany({
      where: { follower_id: effectiveFollowerId, following_id },
    });
    return NextResponse.json({ message: "Berhasil unfollow" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
