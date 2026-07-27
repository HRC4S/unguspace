import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const following = await prisma.follows.findMany({
      where: { follower_id: session.id_user },
      select: { following_id: true },
    });
    const followingIds = following.map((f) => f.following_id);

    const suggestions = await prisma.users.findMany({
      where: {
        id_user: { notIn: [...followingIds, session.id_user] },
      },
      select: {
        id_user: true,
        nama_lengkap: true,
        username: true,
        avatar_url: true,
        prodi: true,
        is_verified: true,
      },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}