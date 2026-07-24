import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const post = await prisma.posts.findUnique({
      where: { id_post: id },
      include: {
        users: { select: { nama_lengkap: true, avatar_url: true } },
        comments: {
          include: { users: { select: { nama_lengkap: true, avatar_url: true } } },
          orderBy: { created_at: 'asc' },
        },
      },
    })
    if (!post) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Belum login' }, { status: 401 })
    }

    const { id } = params
    const existing = await prisma.posts.findUnique({ where: { id_post: id } })

    if (!existing) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan' }, { status: 404 })
    }
    if (existing.id_user !== session.id_user) {
      return NextResponse.json(
        { error: 'Kamu tidak berhak mengubah postingan ini' },
        { status: 403 }
      )
    }

    const { konten_teks, kategori, visibility } = await request.json()
    const updated = await prisma.posts.update({
      where: { id_post: id },
      data: { konten_teks, kategori, visibility },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return NextResponse.json({ error: 'Belum login' }, { status: 401 })
    }

    const { id } = params
    const existing = await prisma.posts.findUnique({ where: { id_post: id } })

    if (!existing) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan' }, { status: 404 })
    }
    if (existing.id_user !== session.id_user) {
      return NextResponse.json(
        { error: 'Kamu tidak berhak menghapus postingan ini' },
        { status: 403 }
      )
    }

    await prisma.posts.delete({ where: { id_post: id } })
    return NextResponse.json({ message: 'Postingan berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}