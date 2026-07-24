import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST -> like postingan
export async function POST(request, { params }) {
  try {
    const { id } = params
    const { id_user } = await request.json()

    const like = await prisma.likes.create({
      data: {
        id_like: crypto.randomUUID(),
        id_post: id,
        id_user,
      },
    })

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kamu sudah like postingan ini' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE -> unlike (butuh id_user di body)
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { id_user } = await request.json()

    await prisma.likes.deleteMany({ where: { id_post: id, id_user } })
    await prisma.posts.update({
      where: { id_post: id },
      data: { like_count: { decrement: 1 } },
    })

    return NextResponse.json({ message: 'Like dibatalkan' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}