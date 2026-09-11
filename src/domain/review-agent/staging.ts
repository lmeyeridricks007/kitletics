import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import type {
  ReviewAgentSession,
  ReviewAgentReport,
  StagedReviewDraft,
} from "@/domain/review-agent/types";

const ROOT = join(process.cwd(), "data", "staging", "reviews");

export function reviewStagingRoot(): string {
  return ROOT;
}

export function ensureReviewStagingDirs(): void {
  for (const sub of ["", "sessions", "drafts", "reports", "locks", "checkpoints"]) {
    mkdirSync(join(ROOT, sub), { recursive: true });
  }
}

export function sessionPath(sessionId: string): string {
  return join(ROOT, "sessions", `${sessionId}.json`);
}

export function saveReviewAgentSession(session: ReviewAgentSession): void {
  ensureReviewStagingDirs();
  writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2), "utf8");
  for (const draft of session.stagedReviews) {
    writeFileSync(
      join(ROOT, "drafts", `${draft.id}.json`),
      JSON.stringify(
        {
          sessionId: session.id,
          proposedStatus: draft.proposedStatus,
          draft,
          updatedAt: session.updatedAt,
        },
        null,
        2,
      ),
      "utf8",
    );
  }
  writeFileSync(
    join(ROOT, "reports", `${session.id}.md`),
    renderReviewAgentReportMarkdown(session.report, session),
    "utf8",
  );
}

export function loadReviewAgentSession(
  sessionId: string,
): ReviewAgentSession | undefined {
  const path = sessionPath(sessionId);
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf8")) as ReviewAgentSession;
}

export function listReviewAgentSessions(): ReviewAgentSession[] {
  const dir = join(ROOT, "sessions");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as ReviewAgentSession)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveCheckpoint(
  sessionId: string,
  processedProductIds: string[],
): void {
  ensureReviewStagingDirs();
  writeFileSync(
    join(ROOT, "checkpoints", `${sessionId}.json`),
    JSON.stringify(
      { sessionId, processedProductIds, updatedAt: new Date().toISOString() },
      null,
      2,
    ),
    "utf8",
  );
}

export function loadCheckpoint(
  sessionId: string,
): string[] {
  const path = join(ROOT, "checkpoints", `${sessionId}.json`);
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    processedProductIds?: string[];
  };
  return raw.processedProductIds ?? [];
}

export function renderReviewAgentReportMarkdown(
  report: ReviewAgentReport,
  session?: ReviewAgentSession,
): string {
  const lines: string[] = [
    `# Product Review Agent Report`,
    ``,
    `- Mode: **${report.mode}**`,
    `- Dry run: **${report.dryRun}**`,
    `- Agent version: ${report.agentVersion}`,
    `- Started: ${report.startedAt}`,
    `- Finished: ${report.finishedAt}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| Products scanned | ${report.scanned} |`,
    `| Reviews created (staged) | ${report.created} |`,
    `| Reviews refreshed (staged) | ${report.refreshed} |`,
    `| Reviews repaired (staged) | ${report.repaired} |`,
    `| Needs research | ${report.needsResearch} |`,
    `| Needs editorial review | ${report.needsEditorialReview} |`,
    `| Blocked | ${report.blocked} |`,
    `| Not required | ${report.notRequired} |`,
    `| Failures | ${report.failures.length} |`,
    ``,
    `## Coverage`,
    ``,
  ];

  for (const [k, v] of Object.entries(report.byCoverage)) {
    lines.push(`- ${k}: ${v}`);
  }

  lines.push(``, `## Priority (internal)`, ``);
  for (const [k, v] of Object.entries(report.byPriority)) {
    lines.push(`- ${k}: ${v}`);
  }

  lines.push(``, `## Review types`, ``);
  for (const [k, v] of Object.entries(report.byReviewType)) {
    lines.push(`- ${k}: ${v}`);
  }

  if (report.stagedReviewIds.length) {
    lines.push(``, `## Staged review IDs`, ``);
    for (const id of report.stagedReviewIds) {
      lines.push(`- ${id}`);
    }
  }

  if (report.failures.length) {
    lines.push(``, `## Failures`, ``);
    for (const f of report.failures) {
      lines.push(`- ${f.productId}: ${f.error}`);
    }
  }

  const interesting = report.rows.filter(
    (r) =>
      r.coverage !== "complete" &&
      r.coverage !== "not-required",
  );
  if (interesting.length) {
    lines.push(``, `## Gaps (sample)`, ``);
    for (const row of interesting.slice(0, 40)) {
      lines.push(
        `- **${row.productSlug}** [${row.priority}] → ${row.coverage}: ${row.reasons.join("; ")}`,
      );
    }
  }

  if (session?.logs.length) {
    lines.push(``, `## Log (tail)`, ``);
    for (const log of session.logs.slice(-30)) {
      lines.push(`- [${log.level}] ${log.stage}: ${log.message}`);
    }
  }

  lines.push(
    ``,
    `---`,
    `Staged drafts are **not published**. Merge into \`src/content\` only after editorial approval.`,
    ``,
  );

  return lines.join("\n");
}

export function loadEditorialLocks(): Map<
  string,
  { reviewId: string; lockedFields: string[]; note?: string }
> {
  ensureReviewStagingDirs();
  const dir = join(ROOT, "locks");
  const map = new Map<
    string,
    { reviewId: string; lockedFields: string[]; note?: string }
  >();
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
      reviewId: string;
      lockedFields: string[];
      note?: string;
    };
    map.set(raw.reviewId, raw);
  }
  return map;
}

export function writeDiffPreview(
  sessionId: string,
  draft: StagedReviewDraft,
  current: {
    bottomLine?: string;
    verdict?: string;
    pros?: string[];
    cons?: string[];
  } | null,
): void {
  if (!current) return;
  ensureReviewStagingDirs();
  const body = [
    `# Review diff: ${draft.id}`,
    ``,
    `## Short verdict`,
    `- Current: ${current.bottomLine ?? "(none)"}`,
    `- Proposed: ${draft.bottomLine}`,
    `- Reason: ${draft.changeSummary?.join("; ") || "synthesize from product/recommendation/evidence"}`,
    ``,
    `## Pros`,
    `- Current: ${(current.pros ?? []).join(" | ") || "(none)"}`,
    `- Proposed: ${draft.pros.join(" | ")}`,
    ``,
    `## Compromises`,
    `- Current: ${(current.cons ?? []).join(" | ") || "(none)"}`,
    `- Proposed: ${draft.cons.join(" | ")}`,
    ``,
  ].join("\n");
  writeFileSync(
    join(ROOT, "reports", `${sessionId}-${draft.id}-diff.md`),
    body,
    "utf8",
  );
}
