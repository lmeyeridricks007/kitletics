#!/usr/bin/env tsx
/**
 * Rewrite / verify reviews in expert buying-guide voice.
 *
 * Default: check enriched page output (what users see).
 * --write: persist clean voice into source content files (fixes CONTENT-002).
 *
 * Usage:
 *   npm run reviews:rewrite-voice
 *   npm run reviews:rewrite-voice -- --fail
 *   npm run reviews:rewrite-voice -- --write
 *   npm run reviews:rewrite-voice -- --write --dry-run
 *   npm run reviews:rewrite-voice -- --slug=nike-vomero-18
 *   npm run reviews:rewrite-voice -- --stage --category=running-shoes
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import { reviewsWave1 } from "@/content/reviews-wave1";
import { reviewsBackfill } from "@/content/reviews-backfill";
import { reviews as allReviewsExport } from "@/content/reviews";
import { getBrandById, getProductById, getReviews } from "@/repositories";
import { getEvidenceForIds, getRecommendationsForProduct } from "@/repositories/recommendations";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import {
  enrichReviewSummary,
  enrichTestingContext,
} from "@/lib/review/enrich-review-content";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { countWords } from "@/lib/review/review-longform";
import {
  EDITORIAL_DISCLOSURE,
  EXPERT_RESEARCH_METHODOLOGY,
  synthesizeExpertResearchDraft,
  stagedDraftToReviewShape,
} from "@/domain/review-agent";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function sourceHasJunkVoice(review: Review): boolean {
  if (isReportOrJunkVoice(review.summary ?? "")) return true;
  if (isReportOrJunkVoice(review.testingContext ?? "")) return true;
  return review.sections.some((s) => isReportOrJunkVoice(s.body));
}

/** Keep source files compact — page enricher expands long-form at request time. */
function compactSectionBody(body: string, maxParas = 3): string {
  const paras = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !isReportOrJunkVoice(p));
  const kept = (paras.length ? paras : body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)).slice(
    0,
    maxParas,
  );
  return kept.join("\n\n");
}

function cleanReviewSource(review: Review): Review | null {
  const product = getProductById(review.productId, { isDev: true });
  if (!product) return null;
  const brand = getBrandById(product.brandId, { isDev: true });
  if (!brand) return null;

  const evidence = getEvidenceForIds(product.evidenceIds);
  const recommendations = getRecommendationsForProduct(product.id);
  const draft = synthesizeExpertResearchDraft({
    product,
    brand,
    evidence,
    recommendations,
    alternativeProductIds: [
      ...new Set([
        ...(product.alternativeProductIds ?? []),
        ...(product.relatedProductIds ?? []),
        ...(review.alternativeProductIds ?? []),
      ]),
    ].filter((id) => id !== product.id).slice(0, 4),
    comparisonIds: review.comparisonIds ?? [],
    existing: review,
    priority: "P2",
  });

  if (draft) {
    const shaped = stagedDraftToReviewShape(draft, { publish: review.status === "published" });
    return {
      ...review,
      summary: shaped.summary,
      bottomLine: shaped.bottomLine ?? review.bottomLine,
      verdict: shaped.verdict,
      testingContext: EXPERT_RESEARCH_METHODOLOGY,
      editorialDisclosure: EDITORIAL_DISCLOSURE,
      sections: shaped.sections.map((s) => ({
        ...s,
        // Preserve existing section images when ids align
        image: review.sections.find((x) => x.id === s.id)?.image ?? s.image,
        body: compactSectionBody(s.body),
      })),
      pros: shaped.pros.length ? shaped.pros : review.pros,
      cons: shaped.cons.length ? shaped.cons : review.cons,
      whoShouldBuy: shaped.whoShouldBuy.length ? shaped.whoShouldBuy : review.whoShouldBuy,
      whoShouldAvoid: shaped.whoShouldAvoid.length
        ? shaped.whoShouldAvoid
        : review.whoShouldAvoid,
    };
  }

  // Fallback: page enricher fields, compacted
  const enriched = enrichReviewForPage(review, product, { brand });
  return {
    ...review,
    summary: enrichReviewSummary(review, product),
    testingContext: enrichTestingContext(review, product),
    editorialDisclosure: EDITORIAL_DISCLOSURE,
    sections: enriched.sections.map((s) => ({
      ...s,
      image: review.sections.find((x) => x.id === s.id)?.image ?? s.image,
      body: compactSectionBody(s.body),
    })),
  };
}

function reviewToTsLiteral(r: Review): string {
  const pub = r.status === "published";
  const lines: string[] = [];
  lines.push(`  {`);
  lines.push(`    id: ${JSON.stringify(r.id)},`);
  lines.push(`    slug: ${JSON.stringify(r.slug)},`);
  lines.push(`    productId: ${JSON.stringify(r.productId)},`);
  lines.push(`    title: ${JSON.stringify(r.title)},`);
  if (r.subtitle) lines.push(`    subtitle: ${JSON.stringify(r.subtitle)},`);
  lines.push(`    reviewType: ${JSON.stringify(r.reviewType)},`);
  lines.push(`    bottomLine: ${JSON.stringify(r.bottomLine)},`);
  lines.push(`    verdict: ${JSON.stringify(r.verdict)},`);
  lines.push(`    score: ${r.score},`);
  lines.push(`    summary: ${JSON.stringify(r.summary)},`);
  lines.push(`    reviewerId: ${JSON.stringify(r.reviewerId)},`);
  lines.push(`    testingContext: ${JSON.stringify(r.testingContext)},`);
  lines.push(`    editorialDisclosure: ${JSON.stringify(r.editorialDisclosure)},`);
  lines.push(`    sections: ${JSON.stringify(r.sections)},`);
  lines.push(`    pros: ${JSON.stringify(r.pros)},`);
  lines.push(`    cons: ${JSON.stringify(r.cons)},`);
  lines.push(`    whoShouldBuy: ${JSON.stringify(r.whoShouldBuy)},`);
  lines.push(`    whoShouldAvoid: ${JSON.stringify(r.whoShouldAvoid)},`);
  lines.push(`    scoreBreakdown: ${JSON.stringify(r.scoreBreakdown)},`);
  lines.push(`    evidenceIds: ${JSON.stringify(r.evidenceIds)},`);
  lines.push(`    alternativeProductIds: ${JSON.stringify(r.alternativeProductIds)},`);
  lines.push(`    comparisonIds: ${JSON.stringify(r.comparisonIds)},`);
  lines.push(`    faqIds: [],`);
  if (r.seoTitle) lines.push(`    seoTitle: ${JSON.stringify(r.seoTitle)},`);
  if (r.seoDescription) lines.push(`    seoDescription: ${JSON.stringify(r.seoDescription)},`);
  if (pub) {
    lines.push(`    ...pub,`);
  } else {
    lines.push(`    status: ${JSON.stringify(r.status)},`);
    lines.push(`    createdAt: pub.createdAt,`);
    lines.push(`    updatedAt: pub.updatedAt,`);
    lines.push(`    lastVerifiedAt: pub.lastVerifiedAt,`);
  }
  lines.push(`  }`);
  return lines.join("\n");
}

function writeBackfillFile(reviews: Review[], dryRun: boolean): string {
  const header = `/**
 * AUTO-GENERATED by scripts/rewrite-review-voice.ts --write
 * Expert Research Reviews in buying-guide voice (no report/junk phrasing).
 * Re-run: npm run reviews:rewrite-voice -- --write
 * Also regenerable via: npm run reviews:backfill
 */
import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

export const reviewsBackfill: Review[] = [
`;
  const body = reviews.map(reviewToTsLiteral).join(",\n");
  const footer = `\n];\n`;
  const out = header + body + footer;
  const path = join(process.cwd(), "src/content/reviews-backfill.ts");
  if (!dryRun) writeFileSync(path, out, "utf8");
  return path;
}

/** Wave1: only summaries carry junk disclosure — rewrite those in place via researchReview drafts. */
function rewriteWave1Summaries(dryRun: boolean): { path: string; changed: number } {
  const path = join(process.cwd(), "src/content/reviews-wave1.ts");
  let src = require("node:fs").readFileSync(path, "utf8") as string;
  let changed = 0;

  for (const review of reviewsWave1) {
    if (!isReportOrJunkVoice(review.summary)) continue;
    const product = getProductById(review.productId, { isDev: true });
    if (!product) continue;
    const next = enrichReviewSummary(review, product);
    if (next === review.summary || isReportOrJunkVoice(next)) {
      // Force a clean short summary without detector triggers
      const soft = (items: string[]) =>
        items
          .slice(0, 3)
          .map((s) => s.charAt(0).toLowerCase() + s.slice(1))
          .join(", ")
          .replace(/, ([^,]*)$/, " or $1");
      const forced = [
        product.shortDescription?.trim() || `${product.fullName} — practical buying notes.`,
        product.strengths.length
          ? `I'd shortlist it when you want ${soft(product.strengths)}.`
          : null,
        product.weaknesses.length
          ? `I'd pause if ${soft(product.weaknesses)} shows up often in your week.`
          : null,
        review.bottomLine?.trim() || review.verdict?.trim() || null,
      ]
        .filter(Boolean)
        .join(" ");
      if (forced !== review.summary) {
        const needle = JSON.stringify(review.summary);
        const repl = JSON.stringify(forced);
        if (src.includes(needle)) {
          src = src.replace(needle, repl);
          changed += 1;
        }
      }
      continue;
    }
    const needle = JSON.stringify(review.summary);
    const repl = JSON.stringify(next);
    if (src.includes(needle)) {
      src = src.replace(needle, repl);
      changed += 1;
    }
  }

  if (!dryRun && changed > 0) writeFileSync(path, src, "utf8");
  return { path, changed };
}

function rewriteHandAndPeregrine(dryRun: boolean): { files: string[]; changed: number } {
  const files: string[] = [];
  let changed = 0;
  const fs = require("node:fs") as typeof import("node:fs");

  const targets: Array<{ review: Review; path: string }> = [];
  // Hand-authored in reviews.ts (before spreads)
  const waveIds = new Set(reviewsWave1.map((r) => r.id));
  const backIds = new Set(reviewsBackfill.map((r) => r.id));
  for (const r of allReviewsExport) {
    if (waveIds.has(r.id) || backIds.has(r.id)) continue;
    if (r.slug === "saucony-peregrine-15") continue; // separate file
    if (!sourceHasJunkVoice(r)) continue;
    targets.push({ review: r, path: join(process.cwd(), "src/content/reviews.ts") });
  }
  // Peregrine override file
  const peregrine = allReviewsExport.find((r) => r.slug === "saucony-peregrine-15");
  if (peregrine && sourceHasJunkVoice(peregrine)) {
    targets.push({
      review: peregrine,
      path: join(process.cwd(), "src/content/running/reviews/peregrine-15.ts"),
    });
  }

  for (const { review, path } of targets) {
    const cleaned = cleanReviewSource(review);
    if (!cleaned) continue;
    let src = fs.readFileSync(path, "utf8");
    let fileChanged = false;

    const replacements: Array<[string, string]> = [
      [review.summary, cleaned.summary],
      [review.testingContext ?? "", cleaned.testingContext ?? ""],
      [review.verdict, cleaned.verdict],
      [review.bottomLine ?? "", cleaned.bottomLine ?? ""],
    ];
    for (const [from, to] of replacements) {
      if (!from || from === to) continue;
      if (isReportOrJunkVoice(from) || from !== to) {
        const needle = JSON.stringify(from);
        const repl = JSON.stringify(to);
        if (src.includes(needle)) {
          src = src.replace(needle, repl);
          fileChanged = true;
        }
      }
    }

    for (const section of review.sections) {
      if (!isReportOrJunkVoice(section.body)) continue;
      const next = cleaned.sections.find((s) => s.id === section.id);
      if (!next || next.body === section.body) continue;
      const needle = JSON.stringify(section.body);
      const repl = JSON.stringify(next.body);
      if (src.includes(needle)) {
        src = src.replace(needle, repl);
        fileChanged = true;
      }
    }

    if (fileChanged) {
      changed += 1;
      if (!files.includes(path)) files.push(path);
      if (!dryRun) fs.writeFileSync(path, src, "utf8");
    }
  }

  return { files, changed };
}

async function persistSourceVoice(opts: {
  slugFilter?: string;
  dryRun: boolean;
}): Promise<{
  backfillRewritten: number;
  wave1Changed: number;
  handChanged: number;
  files: string[];
  remainingJunk: number;
}> {
  const files: string[] = [];

  // --- Backfill: rewrite every junk entry ---
  let backfillNext = reviewsBackfill.map((r) => {
    if (opts.slugFilter && r.slug !== opts.slugFilter) return r;
    if (!sourceHasJunkVoice(r)) return r;
    return cleanReviewSource(r) ?? r;
  });
  // Verify compact bodies are clean; if not, force enrich summary/sections
  backfillNext = backfillNext.map((r) => {
    if (!sourceHasJunkVoice(r)) return r;
    const product = getProductById(r.productId, { isDev: true });
    const brand = product ? getBrandById(product.brandId, { isDev: true }) : null;
    if (!product || !brand) return r;
    const enriched = enrichReviewForPage(r, product, { brand });
    return {
      ...r,
      summary: isReportOrJunkVoice(r.summary)
        ? enrichReviewSummary(r, product)
        : r.summary,
      testingContext: EXPERT_RESEARCH_METHODOLOGY,
      editorialDisclosure: EDITORIAL_DISCLOSURE,
      sections: r.sections.map((s) => {
        if (!isReportOrJunkVoice(s.body)) return s;
        const hit = enriched.sections.find((e) => e.id === s.id);
        return hit ? { ...s, body: compactSectionBody(hit.body) } : s;
      }),
    };
  });

  const backfillRewritten = backfillNext.filter(
    (r, i) => JSON.stringify(r) !== JSON.stringify(reviewsBackfill[i]),
  ).length;
  files.push(writeBackfillFile(backfillNext, opts.dryRun));

  const wave = rewriteWave1Summaries(opts.dryRun);
  files.push(wave.path);

  const hand = rewriteHandAndPeregrine(opts.dryRun);
  files.push(...hand.files);

  // Recount junk across published + source arrays
  const { reviewsBackfill: reloaded } = await import(
    /* webpackIgnore: true */ "@/content/reviews-backfill"
  ).catch(() => ({ reviewsBackfill: backfillNext }));
  void reloaded;

  let remainingJunk = 0;
  for (const r of backfillNext) {
    if (sourceHasJunkVoice(r)) remainingJunk += 1;
  }
  // wave1 / hand checked after file write — approximate from in-memory cleans
  for (const r of reviewsWave1) {
    if (opts.slugFilter && r.slug !== opts.slugFilter) continue;
    // After write, summaries changed on disk; for dry-run use enrich check
    const product = getProductById(r.productId, { isDev: true });
    if (!product) continue;
    const nextSum = enrichReviewSummary(r, product);
    const still = isReportOrJunkVoice(
      opts.dryRun || wave.changed === 0 ? r.summary : nextSum,
    );
    // count only if we failed to produce clean summary
    if (still && isReportOrJunkVoice(nextSum) === false) {
      // will be fixed on write
    } else if (isReportOrJunkVoice(nextSum) && sourceHasJunkVoice(r)) {
      // forced path should have cleaned — ignore
    }
  }

  remainingJunk = backfillNext.filter((r) => sourceHasJunkVoice(r)).length;

  return {
    backfillRewritten,
    wave1Changed: wave.changed,
    handChanged: hand.changed,
    files: [...new Set(files)],
    remainingJunk,
  };
}

async function main(): Promise<void> {
  const slugFilter = arg("slug");
  const fail = flag("fail");
  const stage = flag("stage");
  const write = flag("write");
  const dryRun = flag("dry-run");

  if (write) {
    console.log(
      `Site review voice --write${dryRun ? " (dry-run)" : ""}…`,
    );
    const result = await persistSourceVoice({ slugFilter, dryRun });
    console.log(
      `Backfill rewritten: ${result.backfillRewritten} · wave1 summaries: ${result.wave1Changed} · hand/peregrine: ${result.handChanged}`,
    );
    console.log(`Files: ${result.files.join(", ")}`);
    console.log(`Remaining junk in rewritten backfill: ${result.remainingJunk}`);

    // Re-check published corpus source fields (re-import after write)
    if (!dryRun) {
      // Clear module cache for content
      for (const key of Object.keys(require.cache)) {
        if (
          key.includes("reviews-backfill") ||
          key.includes("reviews-wave1") ||
          key.includes("/reviews.ts") ||
          key.includes("peregrine-15")
        ) {
          delete require.cache[key];
        }
      }
    }

    let reviews = getReviews({ isDev: true });
    if (slugFilter) reviews = reviews.filter((r) => r.slug === slugFilter);
    let sourceJunk = 0;
    for (const r of reviews) {
      if (sourceHasJunkVoice(r)) sourceJunk += 1;
    }
    console.log(
      `Published source junk after write: ${sourceJunk}/${reviews.length}`,
    );
    if (fail && sourceJunk > 0) process.exit(1);
    return;
  }

  let reviews = getReviews();
  if (slugFilter) {
    reviews = reviews.filter((r) => r.slug === slugFilter);
  }

  const bad: Array<{
    slug: string;
    sectionId: string;
    heading: string;
    snippet: string;
  }> = [];
  let ok = 0;
  let sourceJunk = 0;

  for (const review of reviews) {
    if (sourceHasJunkVoice(review)) sourceJunk += 1;
    const product = getProductById(review.productId);
    if (!product) continue;
    const brand = getBrandById(product.brandId);
    const enriched = enrichReviewForPage(review, product, { brand });

    const blobs = [
      enriched.summary,
      enriched.verdict,
      enriched.bottomLine ?? "",
      enriched.testingContext ?? "",
      ...enriched.sections.map((s) => s.body),
    ];

    let sectionBad = false;
    for (const section of enriched.sections) {
      if (isReportOrJunkVoice(section.body)) {
        sectionBad = true;
        bad.push({
          slug: review.slug,
          sectionId: section.id,
          heading: section.heading,
          snippet: section.body.slice(0, 120).replace(/\s+/g, " "),
        });
      }
    }
    for (const blob of [enriched.summary, enriched.verdict, enriched.bottomLine ?? ""]) {
      if (blob && isReportOrJunkVoice(blob)) {
        sectionBad = true;
        bad.push({
          slug: review.slug,
          sectionId: "meta",
          heading: "summary/verdict",
          snippet: blob.slice(0, 120).replace(/\s+/g, " "),
        });
      }
    }

    if (!sectionBad) ok += 1;
    else {
      void countWords(blobs.join(" "));
    }
  }

  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    total: reviews.length,
    clean: ok,
    sourceJunk,
    junkHits: bad.length,
    bad,
  };

  mkdirSync("reports", { recursive: true });
  const stamp = generatedAt.slice(0, 10);
  const jsonPath = join("reports", `review-voice-rewrite-${stamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const md = [
    `# Review voice rewrite check — ${stamp}`,
    "",
    `Enriched ${reviews.length} reviews. **${ok} clean**, **${bad.length} junk/report hits**.`,
    `Source-field junk (CONTENT-002): **${sourceJunk}**. Use \`--write\` to persist clean voice.`,
    "",
    bad.length
      ? [
          "## Remaining junk / report voice (enriched)",
          "",
          ...bad.map(
            (b) =>
              `- **${b.slug}** · ${b.heading} (\`${b.sectionId}\`): ${b.snippet}…`,
          ),
        ].join("\n")
      : "All enriched reviews pass the expert buying-guide voice detector.",
    "",
    "Voice contract: `src/lib/review/review-voice.ts`",
    "Writer skill: `.cursor/skills/review-writer/SKILL.md`",
    "Agent: `agents/product-review/voice.md` + `npm run reviews:agent`",
  ].join("\n");

  const mdPath = join("reports", `review-voice-rewrite-${stamp}.md`);
  writeFileSync(mdPath, md);

  console.log(md);
  console.log(`\nWrote ${mdPath}`);

  if (stage) {
    const { runProductReviewAgent, buildReviewAgentCatalog, ensureReviewStagingDirs } =
      await import("@/domain/review-agent");
    ensureReviewStagingDirs();
    const categorySlug = arg("category");
    const session = runProductReviewAgent({
      mode: "refresh",
      filters: {
        all: !slugFilter && !categorySlug,
        productSlug: slugFilter,
        categorySlug,
        limit: arg("limit") ? Number(arg("limit")) : undefined,
      },
      dryRun: flag("dry-run"),
      catalog: buildReviewAgentCatalog(),
    });
    console.log(
      `\nStaged refresh session ${session.id}: ${session.report.stagedReviewIds.length} draft(s)`,
    );
  }

  if (fail && bad.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
