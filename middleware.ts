import { NextRequest, NextResponse } from "next/server";
import { verifyToken, isAdminUser, AUTH_COOKIE_NAME } from "@/lib/auth";

// Next.js 16: middleware bisa jalan di Node.js runtime (stabil),
// wajib di-set eksplisit supaya jsonwebtoken (butuh Node crypto) bisa dipakai.
export const runtime = "nodejs";

// Endpoint publik: boleh diakses tanpa login.
// Format: [regex path, method[] | null (null = semua method)]
const PUBLIC_ROUTES: [RegExp, string[] | null][] = [
  [/^\/api\/auth\/login$/, ["POST"]],
  [/^\/api\/auth\/logout$/, ["POST"]],
  [/^\/api\/users$/, ["POST"]], // register
  [/^\/api\/posts$/, ["GET"]], // feed publik
  [/^\/api\/posts\/[^/]+$/, ["GET"]], // detail post publik
  [/^\/api\/posts\/[^/]+\/comments$/, ["GET"]], // list komentar publik
  [/^\/api\/users\/[^/]+$/, ["GET"]], // profil publik
];

// Endpoint yang butuh login DAN harus admin
const ADMIN_ONLY_ROUTES: [RegExp, string[] | null][] = [
  [/^\/api\/users$/, ["GET"]], // list semua user
];

function isPublicRoute(pathname: string, method: string) {
  return PUBLIC_ROUTES.some(([pattern, methods]) => {
    if (!pattern.test(pathname)) return false;
    return methods === null || methods.includes(method);
  });
}

function isAdminOnlyRoute(pathname: string, method: string) {
  return ADMIN_ONLY_ROUTES.some(([pattern, methods]) => {
    if (!pattern.test(pathname)) return false;
    return methods === null || methods.includes(method);
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Rute publik -> lewat begitu saja
  if (isPublicRoute(pathname, method)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    return NextResponse.json(
      { error: "Belum login" },
      { status: 401 },
    );
  }

  if (isAdminOnlyRoute(pathname, method) && !isAdminUser(session)) {
    return NextResponse.json(
      { error: "Akses ditolak" },
      { status: 403 },
    );
  }

  // Teruskan info user via header, biar route handler bisa pakai
  // tanpa perlu verifyToken lagi kalau mau (opsional, tidak wajib dipakai).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.id_user);
  requestHeaders.set("x-user-email", session.email_amikom || "");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// Middleware hanya jalan untuk /api/*, tidak untuk halaman/frontend
export const config = {
  matcher: "/api/:path*",
};