import { NextResponse } from "next/server";
import { exportEarnedCsv } from "@/domain/growth/backlinks/service";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(exportEarnedCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitletics-earned-links.csv"',
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
