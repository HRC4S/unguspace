import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const { isi_komentar } = await request.json()

    const updated = await prisma.comments.update({
      where: { id_comment: id },
      data: { isi_komentar },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await prisma.comments.delete({ where: { id_comment: id } })
    return NextResponse.json({ message: 'Komentar berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}