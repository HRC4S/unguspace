import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getCurrentUser()

  if (!session) {
    return NextResponse.json({ error: 'Belum login' }, { status: 401 })
  }

  const user = await prisma.users.findUnique({
    where: { id_user: session.id_user },
    select: {
      id_user: true,
      nama_lengkap: true,
      email_amikom: true,
      prodi: true,
      bio: true,
      avatar_url: true,
    },
  })

  return NextResponse.json(user)
}