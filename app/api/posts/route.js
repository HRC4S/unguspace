import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/posts?kategori=UIUX -> feed, bisa difilter kategori
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')

    const posts = await prisma.posts.findMany({
      where: {
        visibility: 'public',
        ...(kategori && { kategori }),
      },
      include: {
        users: {
          select: { nama_lengkap: true, avatar_url: true, prodi: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/posts -> buat postingan baru
export async function POST(request) {
  try {
    const body = await request.json()
    const { id_user, konten_teks, media_url, media_type, kategori, visibility } = body

    if (!id_user) {
      return NextResponse.json({ error: 'id_user wajib diisi' }, { status: 400 })
    }

    const newPost = await prisma.posts.create({
      data: {
        id_post: crypto.randomUUID(),
        id_user,
        konten_teks,
        media_url,
        media_type,
        kategori,
        visibility: visibility || 'public',
      },
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}