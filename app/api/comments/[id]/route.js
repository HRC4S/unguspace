import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

async function getCommentOrNull(id) {
  return prisma.comments.findUnique({ where: { id_comment: id } });
}

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    const { id } = await params;
    const { isi_komentar } = await request.json();

    const comment = await getCommentOrNull(id);
    if (!comment) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!isAdminUser(session) && comment.id_user !== session.id_user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const updated = await prisma.comments.update({
      where: { id_comment: id },
      data: { isi_komentar },
    });

    return NextResponse.json(updated);
  } catch (error) {
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
    const comment = await getCommentOrNull(id);
    if (!comment) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!isAdminUser(session) && comment.id_user !== session.id_user) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.comments.delete({ where: { id_comment: id } });
    return NextResponse.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}