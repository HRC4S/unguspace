import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.likes.findFirst({
      where: { id_post: id, id_user: session.id_user },
    });

    if (!existing) {
      await prisma.likes.create({
        data: {
          id_like: crypto.randomUUID(),
          id_post: id,
          id_user: session.id_user,
        },
      });
    }

    // Hitung ulang dari sumber asli (tabel likes), bukan increment manual
    const actualCount = await prisma.likes.count({ where: { id_post: id } });
    await prisma.posts.update({
      where: { id_post: id },
      data: { like_count: actualCount },
    });

    return NextResponse.json({ like_count: actualCount }, { status: 200 });
  } catch (error) {
    if (error.code === "P2002") {
      const actualCount = await prisma.likes.count({ where: { id_post: (await params).id } });
      return NextResponse.json({ like_count: actualCount }, { status: 200 });
    }
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

    await prisma.likes.deleteMany({
      where: { id_post: id, id_user: session.id_user },
    });

    // Hitung ulang dari sumber asli, jadi nggak mungkin minus lagi
    const actualCount = await prisma.likes.count({ where: { id_post: id } });
    await prisma.posts.update({
      where: { id_post: id },
      data: { like_count: actualCount },
    });

    return NextResponse.json({ like_count: actualCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}