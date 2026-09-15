import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { persistWeeklyRun } from "@/domain/growth/backlinks/service";
import { renderWeeklyReport } from "@/domain/growth/backlinks/weekly";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function readOptional(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return readFileSync(path, "utf8");
}

const competitor = readOptional(arg("competitor"));
const requests = readOptional(arg("requests"));
const pages = readOptional(arg("pages"));
const gsc = readOptional(arg("gsc"));
const since = arg("since");

const result = persistWeeklyRun({
  since,
  competitorCsv: competitor,
  journalistRequestCsv: requests,
  newPagesCsv: pages,
  searchPerformanceCsv: gsc,
});

const markdown = renderWeeklyReport(result.digest);
const root = process.cwd();
const latest = join(root, "docs/growth/WEEKLY-BACKLINK-REPORT.md");
const archiveDir = join(root, "docs/growth/weekly");
mkdirSync(archiveDir, { recursive: true });
writeFileSync(latest, markdown, "utf8");
const day = result.digest.ranAt.slice(0, 10);
writeFileSync(join(archiveDir, `${day}.md`), markdown, "utf8");

console.log(`Wrote ${latest}`);
console.log(`Archived docs/growth/weekly/${day}.md`);
console.log(
  `NEW MUST ${result.digest.newMustPursue.length} · NEW HIGH ${result.digest.newHigh.length} · follow-ups ${result.digest.followUpDue.length} · earned ${result.digest.linksEarned.length} · lost ${result.digest.linksLost.length} · skipped ${result.digest.skippedDuplicates}`,
);
