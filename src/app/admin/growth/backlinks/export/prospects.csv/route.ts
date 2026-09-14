import { NextResponse } from "next/server";
import { exportProspectsCsv } from "@/domain/growth/backlinks/service";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(exportProspectsCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitletics-prospects.csv"',
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
