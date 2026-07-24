import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || '{-+Q|3DVc8McGIuuSKHg[?3vNlJ_hIA4'
const COOKIE_NAME = 'unguspace_token'

// Bikin token dari data user
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verifikasi token, return payload atau null kalau invalid
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// Ambil user yang sedang login dari cookie (dipanggil di server-side / API route)
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token) // { id_user, nama_lengkap, email_amikom }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME