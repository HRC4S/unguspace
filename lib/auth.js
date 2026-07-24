import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET belum di-set di environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "unguspace_token";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((userId) => userId.trim())
  .filter(Boolean);

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function isAdminUser(session) {
  if (!session) return false;

  if (session.id_user && ADMIN_USER_IDS.includes(session.id_user)) {
    return true;
  }

  if (
    session.email_amikom &&
    ADMIN_EMAILS.includes(session.email_amikom.toLowerCase())
  ) {
    return true;
  }

  return false;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;