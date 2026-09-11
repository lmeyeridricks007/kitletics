/**
 * Guide depth backfill orchestrator.
 *
 * Stages research/outline work for thin & needs-research guides.
 * Does NOT auto-publish low-confidence medical content.
 * Does NOT overwrite human-locked long-form configs already registered.
 *
 * Usage:
 *   npm run guides:backfill -- --dry-run
 *   npm run guides:backfill -- --sport=running --thin
 *   npm run guides:backfill -- --priority=P0
 *   npm run guides:backfill -- --slug=running-shoe-drop
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getBuyingGuides, getSportById, getSportBySlug } from "@/repositories";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import {
  getGuideDepthTier,
  getGuideEditorialPriority,
} from "@/lib/guides/guide-depth";

interface BackfillArgs {
  dryRun: boolean;
  sport?: string;
  type?: string;
  thinOnly: boolean;
  needsResearch: boolean;
  all: boolean;
  priority?: string;
  slug?: string;
  limit: number;
}

function parseArgs(argv: string[]): BackfillArgs {
  const args: BackfillArgs = {
    dryRun: false,
    thinOnly: false,
    needsResearch: false,
    all: false,
    limit: 20,
  };
  for (const a of argv) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--thin") args.thinOnly = true;
    else if (a === "--needs-research") args.needsResearch = true;
    else if (a === "--all") args.all = true;
    else if (a.startsWith("--sport=")) args.sport = a.slice(8);
    else if (a.startsWith("--type=")) args.type = a.slice(7);
    else if (a.startsWith("--priority=")) args.priority = a.slice(11);
    else if (a.startsWith("--slug=")) args.slug = a.slice(7);
    else if (a.startsWith("--limit=")) args.limit = Number(a.slice(8)) || 20;
  }
  if (!args.thinOnly && !args.needsResearch && !args.all && !args.slug) {
    args.thinOnly = true;
    args.needsResearch = true;
  }
  return args;
}

interface Checkpoint {
  updatedAt: string;
  completedSlugs: string[];
  pendingSlugs: string[];
  notes: string[];
}

function loadCheckpoint(path: string): Checkpoint {
  if (!existsSync(path)) {
    return {
      updatedAt: new Date().toISOString(),
      completedSlugs: [],
      pendingSlugs: [],
      notes: [],
    };
  }
  return JSON.parse(readFileSync(path, "utf8")) as Checkpoint;
}

function outlineTemplate(slug: string, title: string): string {
  const depth = getGuideDepthTier(slug);
  const priority = getGuideEditorialPriority(slug);
  return [
    `# Guide backfill outline — ${title}`,
    "",
    `Slug: \`${slug}\``,
    `Depth tier: ${depth}`,
    `Priority: ${priority}`,
    "",
    "## Workflow",
    "",
    "1. AUDIT current sections / FAQs / products",
    "2. DEFINE question map (primary, secondary, decision, misconceptions, next-step)",
    "3. RESEARCH product examples + evidence notes",
    "4. BUILD outline (do not copy Stability section list blindly)",
    "5. GENERATE structured explainer or framework config",
    "6. ADD visuals that explain (not decorate)",
    "7. ADD Product examples with why-this-illustrates",
    "8. ADD Finder / Best / Compare handoffs where relevant",
    "9. VALIDATE claims (medical guardrail)",
    "10. STAGE for editorial QA — do not auto-publish low-confidence content",
    "",
    "## Suggested block families",
    "",
    depth === "deep"
      ? "- Quick answer, concept, comparison, factors, trade-offs, decision flow, product examples, mistakes, CTAs, FAQ"
      : depth === "standard"
        ? "- Quick answer, concept, trade-offs, examples, how to choose, CTA, FAQ"
        : "- Quick definition, why it matters, example, next step, FAQ",
    "",
    "## Human lock",
    "",
    getLongFormGuideConfig(slug)
      ? "LOCKED — long-form config already exists. Propose a diff; do not wipe."
      : "No long-form config yet — safe to create under `src/lib/guides/explainers/`.",
    "",
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sport = args.sport ? getSportBySlug(args.sport) : undefined;

  let guides = getBuyingGuides().filter((g) => g.status === "published");
  if (sport) guides = guides.filter((g) => g.sportId === sport.id);
  if (args.slug) guides = guides.filter((g) => g.slug === args.slug);
  if (args.type) {
    guides = guides.filter((g) => (g.guideType ?? "buying") === args.type);
  }
  if (args.priority) {
    guides = guides.filter(
      (g) => getGuideEditorialPriority(g.slug) === args.priority,
    );
  }

  const assessments = guides.map((g) => ({
    guide: g,
    quality: assessGuideQuality(g),
  }));

  let targets = assessments.filter(({ quality, guide }) => {
    if (getLongFormGuideConfig(guide.slug) && quality.status === "complete") {
      return false; // already complete + locked
    }
    if (args.all) return quality.status !== "complete";
    if (args.slug) return true;
    const matchThin = args.thinOnly && quality.status === "thin";
    const matchNeeds =
      args.needsResearch && quality.status === "needs-research";
    return matchThin || matchNeeds;
  });

  // Priority order: P0 → P1 → P2 → P3
  const priOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  targets = targets
    .sort(
      (a, b) =>
        priOrder[a.quality.priority] - priOrder[b.quality.priority] ||
        a.guide.slug.localeCompare(b.guide.slug),
    )
    .slice(0, args.limit);

  const outDir = join(process.cwd(), "reports", "guide-backfill");
  mkdirSync(outDir, { recursive: true });
  const checkpointPath = join(outDir, "checkpoint.json");
  const checkpoint = loadCheckpoint(checkpointPath);

  const planned: string[] = [];
  const notes: string[] = [];

  for (const { guide, quality } of targets) {
    const locked = Boolean(getLongFormGuideConfig(guide.slug));
    const outlinePath = join(outDir, `${guide.slug}.md`);
    planned.push(guide.slug);

    if (args.dryRun) {
      notes.push(
        `[dry-run] ${guide.slug} (${quality.status}/${quality.priority}${locked ? ", locked" : ""})`,
      );
      continue;
    }

    writeFileSync(outlinePath, outlineTemplate(guide.slug, guide.title));
    notes.push(
      locked
        ? `Wrote outline (LOCKED config) for ${guide.slug}`
        : `Wrote outline for ${guide.slug} → create explainer under src/lib/guides/explainers/`,
    );
    if (!checkpoint.pendingSlugs.includes(guide.slug) && !locked) {
      checkpoint.pendingSlugs.push(guide.slug);
    }
  }

  checkpoint.updatedAt = new Date().toISOString();
  checkpoint.notes = [...checkpoint.notes, ...notes].slice(-200);
  if (!args.dryRun) {
    writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
  }

  const summary = {
    dryRun: args.dryRun,
    sport: sport?.slug ?? args.sport ?? "all",
    plannedCount: planned.length,
    planned,
    notes,
    remainingThin: assessments.filter((a) => a.quality.status === "thin").length,
    remainingNeeds: assessments.filter(
      (a) => a.quality.status === "needs-research",
    ).length,
    complete: assessments.filter((a) => a.quality.status === "complete").length,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(
    args.dryRun
      ? "\nDry run only — no files written."
      : `\nWrote outlines to reports/guide-backfill/ (${planned.length} guides)`,
  );

  // Sport label for logs
  if (sport) {
    console.log(`Sport filter: ${getSportById(sport.id)?.name}`);
  }
}

main();
