import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notifications?id_user=xxx -> daftar notifikasi milik user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id_user = searchParams.get('id_user')

    if (!id_user) {
      return NextResponse.json({ error: 'id_user wajib diisi' }, { status: 400 })
    }

    const notifications = await prisma.notifications.findMany({
      where: { id_user },
      include: {
        users_notifications_actor_idTousers: {
          select: { nama_lengkap: true, avatar_url: true },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Rapikan biar frontend lebih gampang pakai field "actor" daripada nama panjang
    const formatted = notifications.map((n) => ({
      id_notif: n.id_notif,
      tipe: n.tipe,
      pesan: n.pesan,
      is_read: n.is_read,
      created_at: n.created_at,
      actor: n.users_notifications_actor_idTousers,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

///api/notifications -> tandai satu atau semua notifikasi sebagai sudah dibaca
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id_notif, id_user, mark_all } = body

    if (mark_all && id_user) {
      await prisma.notifications.updateMany({
        where: { id_user, is_read: false },
        data: { is_read: true },
      })
      return NextResponse.json({ message: 'Semua notifikasi ditandai dibaca' })
    }

    if (id_notif) {
      const updated = await prisma.notifications.update({
        where: { id_notif },
        data: { is_read: true },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(
      { error: 'id_notif atau (id_user + mark_all) wajib diisi' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}