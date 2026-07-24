import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST -> follow user lain
export async function POST(request) {
  try {
    const { follower_id, following_id } = await request.json()

    if (follower_id === following_id) {
      return NextResponse.json(
        { error: 'Tidak bisa follow diri sendiri' },
        { status: 400 }
      )
    }

    const follow = await prisma.follows.create({
      data: { follower_id, following_id },
    })

    return NextResponse.json(follow, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Sudah mengikuti user ini' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE -> unfollow
export async function DELETE(request) {
  try {
    const { follower_id, following_id } = await request.json()
    await prisma.follows.deleteMany({ where: { follower_id, following_id } })
    return NextResponse.json({ message: 'Berhasil unfollow' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}