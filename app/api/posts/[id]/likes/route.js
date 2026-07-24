import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST -> like postingan
export async function POST(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.posts.findUnique({
      where: { id_post: id },
      select: { id_user: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 },
      );
    }

    const like = await prisma.$transaction(async (tx) => {
      const created = await tx.likes.create({
        data: {
          id_like: crypto.randomUUID(),
          id_post: id,
          id_user: session.id_user,
        },
      });

      await tx.posts.update({
        where: { id_post: id },
        data: { like_count: { increment: 1 } },
      });

      if (post.id_user !== session.id_user) {
        await tx.notifications.create({
          data: {
            id_notif: crypto.randomUUID(),
            id_user: post.id_user,
            actor_id: session.id_user,
            reference_id: id,
            tipe: "like",
            pesan: `${session.nama_lengkap} menyukai postinganmu`,
          },
        });
      }

      return created;
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Kamu sudah like postingan ini" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE -> unlike
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const result = await tx.likes.deleteMany({
        where: { id_post: id, id_user: session.id_user },
      });

      if (result.count === 0) {
        throw Object.assign(new Error("Like tidak ditemukan"), { status: 404 });
      }

      await tx.posts.update({
        where: { id_post: id },
        data: { like_count: { decrement: 1 } },
      });
    });

    return NextResponse.json({ message: "Like dibatalkan" });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}