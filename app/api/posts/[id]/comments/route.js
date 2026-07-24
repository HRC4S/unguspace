import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const comments = await prisma.comments.findMany({
      where: { id_post: id },
      include: { users: { select: { nama_lengkap: true, avatar_url: true } } },
      orderBy: { created_at: "asc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = params;
    const { id_user, isi_komentar } = await request.json();

    if (!isi_komentar) {
      return NextResponse.json(
        { error: "isi_komentar wajib diisi" },
        { status: 400 },
      );
    }

    const newComment = await prisma.comments.create({
      data: {
        id_comment: crypto.randomUUID(),
        id_post: id,
        id_user: session.id_user,
        isi_komentar,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
