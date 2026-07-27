import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json([]);
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { nama_lengkap: { contains: q } },
        ],
      },
      select: {
        id_user: true,
        nama_lengkap: true,
        username: true,
        avatar_url: true,
        prodi: true,
        is_verified: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}