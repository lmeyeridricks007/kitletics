import { NextResponse } from "next/server";
import { exportPriorityCsv } from "@/domain/growth/backlinks/service";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(exportPriorityCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitletics-priority-outreach.csv"',
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
