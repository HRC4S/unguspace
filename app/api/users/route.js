import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  validateEmailAmikom,
  validateNim,
  validatePassword,
} from "@/lib/validation";
import { getCurrentUser, isAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!isAdminUser(session)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const users = await prisma.users.findMany({
      select: {
        id_user: true,
        nim: true,
        nama_lengkap: true,
        email_amikom: true,
        prodi: true,
        bio: true,
        avatar_url: true,
        is_verified: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nim, nama_lengkap, email_amikom, prodi, password, bio } = body;

    if (!nim || !nama_lengkap || !email_amikom || !prodi || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }
    if (!validateNim(nim)) {
      return NextResponse.json(
        { error: "Format NIM tidak valid (contoh: 23.01.1234)" },
        { status: 400 },
      );
    }
    if (!validateEmailAmikom(email_amikom)) {
      return NextResponse.json(
        { error: "Email harus menggunakan domain @student.amikom.ac.id" },
        { status: 400 },
      );
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        id_user: crypto.randomUUID(),
        nim,
        nama_lengkap,
        email_amikom,
        prodi,
        password_hash,
        bio: bio || null,
      },
      select: {
        id_user: true,
        nim: true,
        nama_lengkap: true,
        email_amikom: true,
        prodi: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "NIM atau Email sudah terdaftar" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
