import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([]);
    }

    const posts = await prisma.posts.findMany({
      where: { id_post: { in: ids } },
      select: {
        id_post: true,
        like_count: true,
        _count: { select: { comments: true } },
      },
    });

    const formatted = posts.map((p) => ({
      id_post: p.id_post,
      like_count: p.like_count,
      comment_count: p._count.comments,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}