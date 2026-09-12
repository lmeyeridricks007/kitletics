import { getRunningShoeDatabaseRecords } from "@/lib/running-shoe-database/build-records";
import {
  buildRunningShoeResearchExportRows,
  serializeRunningShoeResearchCsv,
} from "@/lib/running-shoe-database/citation/research-export";

export const revalidate = 3600;

/**
 * Limited research CSV — factual fields only.
 * Not a proprietary catalog dump.
 */
export function GET() {
  const records = getRunningShoeDatabaseRecords();
  const rows = buildRunningShoeResearchExportRows(records);
  const body = serializeRunningShoeResearchCsv(rows);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="kitletics-running-shoe-database-research.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
