import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  validateEmailAmikom,
  validateNim,
  validatePassword,
  validateUsername,
} from "@/lib/validation";

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id_user: true,
        nim: true,
        username: true,
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
    const { nim, username, nama_lengkap, email_amikom, prodi, password, bio } = body;

    if (!nim || !username || !nama_lengkap || !email_amikom || !prodi || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }
    if (!validateNim(nim)) {
      return NextResponse.json(
        { error: "Format NIM tidak valid (contoh: 23.01.1234)" },
        { status: 400 },
      );
    }
    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: "Username harus 3-20 karakter, huruf kecil/angka/underscore saja" },
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
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        id_user: crypto.randomUUID(),
        nim,
        username: username.toLowerCase(),
        nama_lengkap,
        email_amikom,
        prodi,
        password_hash,
        bio: bio || null,
      },
      select: {
        id_user: true,
        nim: true,
        username: true,
        nama_lengkap: true,
        email_amikom: true,
        prodi: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "";
      const label = field.includes("username")
        ? "Username"
        : field.includes("nim")
          ? "NIM"
          : "Email";
      return NextResponse.json({ error: `${label} sudah terdaftar` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}