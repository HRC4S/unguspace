import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const grouped = await prisma.posts.groupBy({
      by: ["kategori"],
      where: {
        visibility: "public",
        kategori: { not: null },
        created_at: { gte: sevenDaysAgo },
      },
      _count: { kategori: true },
      orderBy: { _count: { kategori: "desc" } },
      take: 5,
    });

    const formatted = grouped.map((g) => ({
      kategori: g.kategori,
      count: g._count.kategori,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}