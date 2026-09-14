import { NextResponse } from "next/server";
import { exportCampaignsCsv } from "@/domain/growth/backlinks/service";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(exportCampaignsCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitletics-campaigns.csv"',
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
