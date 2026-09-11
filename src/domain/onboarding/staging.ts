import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import type { ProductOnboardingSession } from "@/domain/onboarding/types";

const ROOT = join(process.cwd(), "data", "staging", "onboarding");

export function stagingRoot(): string {
  return ROOT;
}

export function ensureStagingDirs(): void {
  for (const sub of [
    "",
    "sessions",
    "products",
    "evidence",
    "media",
    "recommendations",
    "relationships",
    "offers",
    "reports",
  ]) {
    mkdirSync(join(ROOT, sub), { recursive: true });
  }
}

export function sessionPath(sessionId: string): string {
  return join(ROOT, "sessions", `${sessionId}.json`);
}

export function saveSession(session: ProductOnboardingSession): void {
  ensureStagingDirs();
  writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2), "utf8");
  if (session.candidateProduct) {
    writeFileSync(
      join(ROOT, "products", `${session.candidateProduct.id}.json`),
      JSON.stringify(
        {
          sessionId: session.id,
          status: session.candidateProduct.status,
          product: session.candidateProduct,
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
    renderSessionReportMarkdown(session),
    "utf8",
  );
}

export function loadSession(
  sessionId: string,
): ProductOnboardingSession | undefined {
  const path = sessionPath(sessionId);
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf8")) as ProductOnboardingSession;
}

export function listSessions(): ProductOnboardingSession[] {
  const dir = join(ROOT, "sessions");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf8");
      return JSON.parse(raw) as ProductOnboardingSession;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Latest staged Product draft by slug (dev preview only). */
export function getStagedProductBySlug(slug: string) {
  const sessions = listSessions().filter(
    (s) => s.candidateProduct?.slug === slug,
  );
  return sessions[0]?.candidateProduct;
}

export function getSessionForStagedSlug(slug: string) {
  return listSessions().find((s) => s.candidateProduct?.slug === slug);
}

export function queueSummary(): Record<string, number> {
  const sessions = listSessions();
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
  }
  return counts;
}

export function renderSessionReportMarkdown(
  session: ProductOnboardingSession,
): string {
  const p = session.candidateProduct;
  const q = session.quality;
  const lines: string[] = [
    `# Product Onboarding — ${session.id}`,
    "",
    `**Mode:** ${session.mode}`,
    `**Status:** ${session.status}`,
    `**Dry run:** ${session.dryRun}`,
    `**Agent:** ${session.agentVersion} / prompt ${session.promptVersion}`,
    "",
    "## Product",
    p
      ? `${p.fullName} (\`${p.id}\` / \`${p.slug}\`)`
      : session.requestedBrand
        ? `${session.requestedBrand} ${session.requestedModel ?? ""}`.trim()
        : "—",
    "",
    "## Identity",
    session.identity
      ? `${session.identity.kind} — ${session.identity.reasons.join("; ")}`
      : "—",
    "",
    "## Specifications",
    `Verified findings: ${q.specsVerified}`,
    `Unknown / missing: ${q.specsUnknown}`,
    `Conflicts: ${q.specsConflicting}`,
    "",
    "## Evidence",
    `${q.evidenceCount} staged evidence records`,
    "",
    "## Media",
    `Accepted: ${q.mediaAccepted} · Flagged: ${q.mediaFlagged}`,
    "",
    "## Recommendations",
    `${q.recommendationCandidates} candidates`,
    "",
    "## Relationships",
    `${session.relationships.length} candidates`,
    "",
    "## Commercial",
    `${session.commercial.length} offer candidates`,
    "",
    "## Conflicts",
  ];

  if (session.conflicts.length === 0) {
    lines.push("_None_");
  } else {
    for (const c of session.conflicts) {
      lines.push(
        `- **${c.field}**: ${c.values.map((v) => JSON.stringify(v.value)).join(" vs ")} — ${c.status}`,
      );
      if (c.recommendedResolution) {
        lines.push(`  - Resolution hint: ${c.recommendedResolution}`);
      }
    }
  }

  lines.push("", "## Blockers");
  if (q.blockers.length === 0) lines.push("_None_");
  else q.blockers.forEach((b) => lines.push(`- ${b}`));

  lines.push("", "## Review reasons");
  if (q.reviewReasons.length === 0) lines.push("_None_");
  else q.reviewReasons.forEach((b) => lines.push(`- ${b}`));

  lines.push("", "## Content impact");
  if (session.contentImpact.length === 0) lines.push("_None_");
  else {
    for (const i of session.contentImpact) {
      lines.push(
        `- [${i.severity}] ${i.contentType} \`${i.contentId}\`: ${i.reason} → ${i.suggestedAction}`,
      );
    }
  }

  if (session.discoveryCandidates?.length) {
    lines.push("", "## Discovery candidates");
    for (const d of session.discoveryCandidates) {
      lines.push(
        `- [${d.priority}] ${d.fullName} (${d.kind}) — ${d.reason}`,
      );
    }
  }

  lines.push("", "## Next action");
  if (session.status === "ready") {
    lines.push("Human review → approve → `product:publish --session=<id>`");
  } else if (session.status === "blocked") {
    lines.push("Resolve blockers / supply research / reject");
  } else if (session.status === "needs-review") {
    lines.push("Review conflicts and flagged media before approve");
  } else {
    lines.push(session.status);
  }

  lines.push("", "## Logs");
  for (const log of session.logs.slice(-30)) {
    lines.push(`- ${log.at} [${log.level}] ${log.stage}: ${log.message}`);
  }

  return `${lines.join("\n")}\n`;
}
