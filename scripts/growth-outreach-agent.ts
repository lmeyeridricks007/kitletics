import { readFileSync } from "node:fs";
import { persistForumThreadIngest } from "@/domain/growth/backlinks/service";
import {
  evaluateForumThread,
  type ForumThreadInput,
} from "@/domain/growth/backlinks/outreach-agent";
import { getLinkableAssets } from "@/domain/growth/backlinks/assets";
import { getWorkspace } from "@/domain/growth/backlinks/service";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

if (flag("help") || process.argv.includes("-h")) {
  console.log(`Kitletics Growth Outreach Agent

Never auto-posts. Never sends email.

  npm run growth:outreach -- --threads=path/to/threads.json
  npm run growth:outreach -- --threads=path.json --dry-run

JSON: array of { threadUrl, question, subreddit?, communityId?, threadAgeHours?, commentCount?, upvotes?, existingAnswers?, accountTrustOk? }
`);
  process.exit(0);
}

const path = arg("threads");
if (!path) {
  console.error("Pass --threads=file.json (array of forum thread objects). Use --help.");
  process.exit(1);
}

const threads = JSON.parse(readFileSync(path, "utf8")) as ForumThreadInput[];
if (!Array.isArray(threads)) {
  console.error("threads JSON must be an array");
  process.exit(1);
}

if (flag("dry-run")) {
  const ws = getWorkspace();
  const assets = getLinkableAssets();
  for (const thread of threads) {
    const result = evaluateForumThread(thread, { workspace: ws, assets });
    console.log(
      [
        result.forum?.community,
        result.opportunity.linkRecommendation,
        result.engage ? "ENGAGE_REVIEW" : "DO_NOT_ENGAGE",
        result.opportunity.targetUrl || "NO_ASSET",
        result.autoPost === false ? "NO_AUTO_POST" : "ERROR",
      ].join(" · "),
    );
    console.log(result.forum?.suggestedAnswer);
    console.log(result.nextAction);
    console.log("---");
  }
  process.exit(0);
}

const result = persistForumThreadIngest(threads);
console.log(
  `Ingested ${result.created} forum opportunities · skipped ${result.skipped} duplicates. Auto-post: never. Review in /admin/growth/backlinks`,
);
for (const row of result.results) {
  console.log(
    `${row.forum?.community ?? row.opportunity.siteName} · ${row.opportunity.linkRecommendation} · score ${row.opportunity.overallScore} · ${row.engage ? "review" : "do-not-engage"}`,
  );
}
