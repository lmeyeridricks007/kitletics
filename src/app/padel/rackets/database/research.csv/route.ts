import { getPadelRacketDatabaseRecords } from "@/lib/padel-racket-database/build-records";
import {
  buildPadelRacketResearchExportRows,
  serializePadelRacketResearchCsv,
} from "@/lib/padel-racket-database/citation/research-export";

export const revalidate = 3600;

/**
 * Limited research CSV — factual fields only.
 * Not a proprietary catalog dump. X-Robots-Tag: noindex.
 */
export function GET() {
  const records = getPadelRacketDatabaseRecords();
  const rows = buildPadelRacketResearchExportRows(records);
  const body = serializePadelRacketResearchCsv(rows);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="kitletics-padel-racket-database-research.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
