import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/:id -> detail profil (pakai logic mirip stored procedure profil_user)
export async function GET(request, { params }) {
  try {
    const { id } = params

    const user = await prisma.users.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        nama_lengkap: true,
        prodi: true,
        bio: true,
        avatar_url: true,
        is_verified: true,
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/users/:id -> update profil (nim & email TIDAK BOLEH diubah, sesuai aturan bisnis)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { nama_lengkap, prodi, bio, avatar_url } = body

    const updated = await prisma.users.update({
      where: { id_user: id },
      data: { nama_lengkap, prodi, bio, avatar_url },
      select: {
        id_user: true,
        nama_lengkap: true,
        prodi: true,
        bio: true,
        avatar_url: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/users/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.users.delete({ where: { id_user: id } })
    return NextResponse.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}