import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/saved-posts?id_user=xxx -> daftar postingan yang disimpan user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id_user = searchParams.get('id_user')

    if (!id_user) {
      return NextResponse.json({ error: 'id_user wajib diisi' }, { status: 400 })
    }

    const saved = await prisma.saved_posts.findMany({
      where: { id_user },
      include: {
        posts: {
          include: {
            users: { select: { nama_lengkap: true, avatar_url: true } },
          },
        },
      },
      orderBy: { saved_at: 'desc' },
    })

    return NextResponse.json(saved)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/saved-posts -> simpan postingan
export async function POST(request) {
  try {
    const { id_user, id_post } = await request.json()

    if (!id_user || !id_post) {
      return NextResponse.json(
        { error: 'id_user dan id_post wajib diisi' },
        { status: 400 }
      )
    }

    const saved = await prisma.saved_posts.create({
      data: {
        id_saved: crypto.randomUUID(),
        id_user,
        id_post,
      },
    })

    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Postingan sudah pernah disimpan' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/saved-posts -> batalkan simpan
export async function DELETE(request) {
  try {
    const { id_user, id_post } = await request.json()
    await prisma.saved_posts.deleteMany({ where: { id_user, id_post } })
    return NextResponse.json({ message: 'Berhasil dihapus dari saved posts' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}