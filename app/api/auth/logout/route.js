import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: 'Logout berhasil' })
  response.cookies.delete(AUTH_COOKIE_NAME)
  return response
}