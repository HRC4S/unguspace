// app/api/debug/route.js
import fs from "fs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const uploadDir = process.cwd() + "/public/uploads";
  let files = [];
  let error = null;

  try {
    files = fs.readdirSync(uploadDir);
  } catch (e) {
    error = e.message;
  }

  return NextResponse.json({
    cwd: process.cwd(),
    uploadDir,
    files,
    error,
  }, { headers: { "Cache-Control": "no-store" } });
}