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

    const like = await prisma.comment_likes.create({
      data: {
        id_comment_like: crypto.randomUUID(),
        id_comment: id,
        id_user: session.id_user,
      },
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Sudah menyukai komentar ini" },
        { status: 409 }
      );
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
    await prisma.comment_likes.deleteMany({
      where: { id_comment: id, id_user: session.id_user },
    });

    return NextResponse.json({ message: "Like komentar dibatalkan" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}