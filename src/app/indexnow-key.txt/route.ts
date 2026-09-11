import { NextResponse } from "next/server";
import { readIndexNowKey } from "@/lib/seo/indexnow/config";

export const dynamic = "force-dynamic";

/**
 * IndexNow keyLocation verification file.
 * Serves the INDEXNOW_KEY as plain text when configured.
 */
export async function GET() {
  const key = readIndexNowKey();
  if (!key) {
    return new NextResponse("IndexNow is not configured", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
