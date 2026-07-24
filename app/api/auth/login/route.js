import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email_amikom, password } = await request.json()

    if (!email_amikom || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    const user = await prisma.users.findUnique({ where: { email_amikom } })

    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    if (!user.is_verified) {
      return NextResponse.json(
        { error: 'Akun belum diverifikasi. Hubungi admin.' },
        { status: 403 }
      )
    }

    const token = signToken({
      id_user: user.id_user,
      nama_lengkap: user.nama_lengkap,
      email_amikom: user.email_amikom,
    })

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        email_amikom: user.email_amikom,
        prodi: user.prodi,
        avatar_url: user.avatar_url,
      },
    })

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}