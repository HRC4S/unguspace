// app/api/media/[filename]/route.js
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
};

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { filename } = params;

  if (filename.includes("..") || filename.includes("/")) {
    return new NextResponse("Invalid filename", { status: 400 });
  }

  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    const fileBuffer = await readFile(filepath);
    const ext = filename.split(".").pop().toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}