/**
 * READ-ONLY forensic scan of rendered page-data (SSR contract).
 * Writes CSVs under docs/prelaunch/data/. Does not mutate product/content.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import {
  getReviews,
  getProducts,
  getBuyingGuides,
  getBestGuides,
  getComparisons,
  getBrands,
} from "@/repositories";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductReviewSummary } from "@/lib/product/get-product-review-summary";
import { getBuyingGuidePageData, getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getComparisonPageData } from "@/lib/comparison/get-comparison-page-data";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import { getSportHubData } from "@/lib/sport-hub/get-sport-hub-data";
import { getBrandHubPageData } from "@/lib/brand-hub/get-brand-hub-data";
import { getGuidesHubData } from "@/lib/guides/get-guides-hub-data";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { resolveBestGuideImage } from "@/lib/best/resolve-best-guide-image";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { reviewsUniqueRewrite } from "@/content/reviews-unique-rewrite";
import { reviewsP53Differentiation } from "@/content/reviews-p53-differentiation";
import { reviewsP54HeldFinalized } from "@/content/reviews-p54-held-finalized";
import { reviewsP62FinalRunning } from "@/content/reviews-p62-final-running";

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data");
const SITE = "https://kitletics.com";

type Issue = Record<string, string | number>;
type QualityRow = Record<string, string | number | boolean>;
type ImageRow = Record<string, string | number>;

const issues: Issue[] = [];
const quality: QualityRow[] = [];
const images: ImageRow[] = [];

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function writeCsv(name: string, rows: Record<string, unknown>[], cols: string[]) {
  const lines = [cols.join(",")];
  for (const r of rows) {
    lines.push(cols.map((c) => csvEscape(r[c])).join(","));
  }
  writeFileSync(join(OUT, name), lines.join("\n") + "\n");
}

function excerpt(text: string, max = 220): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const TOKEN_RES: Array<{ name: string; re: RegExp }> = [
  { name: "skuslug", re: /skuslug[a-z0-9]*/i },
  { name: "skuid", re: /skuid[a-z0-9]*/i },
  { name: "gen_concat", re: /\bgen\d+[a-z][a-z0-9]{4,}/i },
  { name: "value_field_slug", re: /\b\d{1,4}(weight|heelstack|forefootstack|drop|capacity|batterygps|batterysmartwatch)[a-z0-9]{4,}/i },
  { name: "slug_field_value", re: /\b[a-z]{6,}(weight|heelstack|forefootstack|drop|cushionlevel|cushionfeel|ridecharacter|stability|capacity|displaytype|touchscreen|multibandgps)[a-z0-9]+/i },
  { name: "concatenated_token_phrase", re: /concatenated\s+\w+\s+token/i },
  { name: "strengths_on_file", re: /strengths on file:/i },
  { name: "limits_on_file", re: /limits on file:/i },
  { name: "gates_product", re: /\bgates [A-Z][A-Za-z0-9 .'+-]{2,}/ },
  { name: "object_object", re: /\[object Object\]/ },
  { name: "undefined_token", re: /\bundefined\b/ },
  { name: "nan_token", re: /\bNaN\b/ },
  { name: "camel_spec", re: /\b(heelStack|forefootStack|cushionLevel|cushionFeel|rideCharacter|energyReturn|plateMaterial|widthOptions|archSupport|skuSlug|skuId)\b/ },
];

const MACHINE_RES: Array<{ name: string; re: RegExp }> = [
  { name: "already_decided_lane", re: /already decided the lane/i },
  { name: "headline_trait", re: /as the headline trait/i },
  { name: "whatever_optimizes", re: /whatever .+ optimizes for/i },
  { name: "catalogued_to_deliver", re: /catalogued to deliver/i },
  { name: "pause_if_not_a", re: /i'd pause if not a /i },
  { name: "look_elsewhere_if_not_a", re: /look elsewhere if not a /i },
  { name: "main_job_matches_week", re: /when its main job matches most of your week/i },
  { name: "rotate_or_compare_against", re: /will rotate or compare against/i },
  { name: "do_everything_compromise", re: /more than a do-everything compromise/i },
  { name: "you_need_not_a", re: /you need not a /i },
  { name: "expert_research_dump", re: /kitletics expert research review\. how we assessed it:/i },
  { name: "intended_job_framing", re: /this exact .+ brief on /i },
  { name: "walk_away_from", re: /walk away from .+ when /i },
  { name: "best_audience_for", re: /best audience for .+:/i },
  { name: "shows_up_more_often_plan", re: /shows up more often in your (plan|week)/i },
];

function overlayOf(slug: string): string {
  if (P62.has(slug)) return "p62_genuine_overlay";
  if (P54.has(slug)) return "p54_held_finalized_uniqueness_tokens";
  if (P53.has(slug)) return "p53_indexable_uniqueness_tokens";
  if (URW.has(slug)) return "unique_rewrite_machine_copy";
  return "seed_or_wave";
}

const P62 = new Set(reviewsP62FinalRunning.map((r) => r.slug));
const P54 = new Set(reviewsP54HeldFinalized.map((r) => r.slug));
const P53 = new Set(reviewsP53Differentiation.map((r) => r.slug));
const URW = new Set(reviewsUniqueRewrite.map((r) => r.slug));

function detectTokens(text: string): string[] {
  const hits: string[] = [];
  for (const { name, re } of TOKEN_RES) {
    if (re.test(text)) hits.push(name);
  }
  return hits;
}
function detectMachine(text: string): string[] {
  const hits: string[] = [];
  for (const { name, re } of MACHINE_RES) {
    if (re.test(text)) hits.push(name);
  }
  return hits;
}

function classifyDecision(line: string, repetitive: boolean): string {
  const t = line.trim();
  if (!t) return "BROKEN";
  if (detectTokens(t).length) return "BROKEN";
  if (/you need not a |look elsewhere if not a |i'd pause if not a /i.test(t)) {
    return "BROKEN";
  }
  if (detectMachine(t).length) return "MACHINE_LIKE";
  if (repetitive) return "REPETITIVE";
  if (t.length > 160 || words(t) > 32) return "WORDY";
  if (words(t) < 6) return "GENERIC";
  if (/whatever |not a [a-z]+ [a-z]+ shows up/i.test(t)) return "CONFUSING";
  return "GOOD";
}

function pushIssue(p: {
  severity: string;
  url: string;
  page_type: string;
  entity_slug: string;
  section: string;
  issue_class: string;
  issue_subclass: string;
  rendered_excerpt: string;
  image_path?: string;
  related_entity?: string;
  root_cause: string;
  source_file: string;
  source_field: string;
  transform: string;
  component: string;
  detector_that_should_have_caught_it: string;
  why_detector_missed: string;
  recommended_fix_class: string;
  confidence: string;
}) {
  issues.push({
    issue_id: `RQ-${String(issues.length + 1).padStart(5, "0")}`,
    status: "OPEN",
    ...p,
    image_path: p.image_path ?? "",
    related_entity: p.related_entity ?? "",
  });
}

function pushQuality(p: QualityRow) {
  quality.push(p);
}

function sportFromPath(src: string): string {
  if (/\/padel\//.test(src) || /guide-tennis/.test(src)) return "padel_or_tennis";
  if (/\/tennis\//.test(src)) return "tennis";
  if (/\/watches\//.test(src)) return "watches";
  if (/\/hrm\//.test(src)) return "hrm";
  if (/\/headphones\//.test(src)) return "headphones";
  if (/\/packs\//.test(src) || /\/hydration\//.test(src)) return "packs";
  if (/\/headlamps\//.test(src)) return "headlamps";
  if (/\/training\//.test(src) || /guide-home-gym/.test(src)) return "fitness";
  if (/\/running\//.test(src) || /guide-running-shoes/.test(src)) return "running";
  if (/\/brands\/heroes\//.test(src)) return "atmosphere";
  if (/\/home\//.test(src)) return "home_generic";
  if (/\/catalog\/fallbacks\//.test(src)) return "placeholder";
  return "unknown";
}

function classifyImage(opts: {
  src: string;
  pageSport?: string;
  expected: string;
  pageType: string;
  entitySlug?: string;
}): { classification: string; reason: string } {
  const { src, pageSport, expected, entitySlug } = opts;
  const sport = sportFromPath(src);
  if (/\/fallbacks\/|\.svg$/.test(src) && /catalog\/fallbacks/.test(src)) {
    return { classification: "DUPLICATE_PLACEHOLDER", reason: "catalog fallback illustration" };
  }
  if (pageSport === "running" && (sport === "padel_or_tennis" || /guide-tennis|\/padel\//.test(src))) {
    return { classification: "WRONG_SPORT", reason: "running page uses padel/tennis imagery" };
  }
  if (pageSport === "running" && sport === "fitness" && /guide-home-gym/.test(src)) {
    return { classification: "WRONG_SPORT", reason: "running page uses home-gym imagery" };
  }
  if (expected.includes("watch") && /\/padel\/|guide-tennis|\/running\/products\//.test(src) && !/watches\//.test(src)) {
    return { classification: "WRONG_SPORT", reason: "watch content without watch photography" };
  }
  if (expected.includes("shoe") && /\/padel\/guides\/choose-shoes|guide-tennis/.test(src)) {
    return { classification: "WRONG_CONTENT_TYPE", reason: "shoe/racket mismatch" };
  }
  if (entitySlug && /\/products\//.test(src)) {
    const file = src.split("/").pop() ?? "";
    const stem = file.replace(/-hero\.(jpg|png|webp)$/i, "").replace(/\.(jpg|png|webp)$/i, "");
    if (stem && entitySlug && !file.includes("hero") === false) {
      const slugTok = entitySlug.replace(/[^a-z0-9]+/gi, "");
      const stemTok = stem.replace(/[^a-z0-9]+/gi, "");
      if (
        /\/products\//.test(src) &&
        stemTok.length >= 6 &&
        slugTok.length >= 6 &&
        !stemTok.includes(slugTok.slice(0, 8)) &&
        !slugTok.includes(stemTok.slice(0, 8)) &&
        opts.pageType === "product"
      ) {
        return { classification: "WRONG_PRODUCT", reason: `product page ${entitySlug} uses file ${file}` };
      }
    }
  }
  if (/urban-dusk|guide-how-to-choose|hero-gear-composite|running-urban/.test(src)) {
    if (expected && !/atmosphere|generic|hub/.test(expected)) {
      return {
        classification: "GENERIC_BUT_RELEVANT",
        reason: "shared atmosphere/generic editorial asset",
      };
    }
  }
  if (/\/products\/.+-hero\./.test(src) || /\/best-hub\//.test(src) || /\/category\//.test(src)) {
    return { classification: "LIKELY_CORRECT", reason: "topic-aligned product or hub photography" };
  }
  if (sport === pageSport) return { classification: "LIKELY_CORRECT", reason: "path sport matches page sport" };
  if (sport === "unknown" || sport === "home_generic" || sport === "atmosphere") {
    return { classification: "GENERIC_BUT_RELEVANT", reason: "generic/atmosphere asset" };
  }
  if (pageSport && sport !== pageSport && sport !== "unknown") {
    return { classification: "WRONG_SPORT", reason: `page sport ${pageSport} vs image ${sport}` };
  }
  return { classification: "UNKNOWN", reason: "insufficient subject evidence" };
}

function addImage(row: Omit<ImageRow, "reuse_count"> & { reuse_count?: number }) {
  images.push({ reuse_count: 0, ...row });
}

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url;
  }
}

function pageTypeOf(path: string): string {
  if (path === "/") return "home";
  const p = path.replace(/^\//, "").split("/");
  const head = p[0] ?? "";
  const map: Record<string, string> = {
    products: "product",
    reviews: "review",
    guides: "buying_guide",
    best: "best_guide",
    compare: "comparison",
    brands: "brand",
    tools: "tool",
    setups: "gear_setup",
    running: p[1] === "shoes" && p[2] === "database" ? "data_product" : p.length === 1 ? "sport_hub" : "sport_or_category",
    padel: "sport_hub",
    tennis: "sport_hub",
    fitness: "sport_hub",
    gear: "editorial_hub",
    authors: "author",
  };
  if (path.includes("/alternatives")) return "alternatives";
  return map[head] ?? (head || "other");
}

function scanText(opts: {
  url: string;
  page_type: string;
  entity_slug: string;
  section: string;
  text: string;
  source_file: string;
  source_field: string;
  transform: string;
  component: string;
  overlay?: string;
}) {
  const text = (opts.text ?? "").trim();
  if (!text) return;
  const tokenHits = detectTokens(text);
  const machineHits = detectMachine(text);
  const overlay = opts.overlay ?? overlayOf(opts.entity_slug);
  const token = tokenHits.length > 0;
  const machine = machineHits.length > 0;
  const wordy = words(text) > 80 && /buy|skip|best for|not ideal/i.test(opts.section);
  const broken = token || /you need not a |look elsewhere if not a /i.test(text);
  const qualityClass = token
    ? "BROKEN"
    : machine
      ? "MACHINE_LIKE"
      : wordy
        ? "WORDY"
        : "GOOD";

  pushQuality({
    url: opts.url,
    page_type: opts.page_type,
    entity_slug: opts.entity_slug,
    section: opts.section,
    text_length: text.length,
    token_leak: token,
    machine_language: machine,
    wordy,
    repetitive: false,
    generic: classifyDecision(text, false) === "GENERIC",
    broken,
    unsupported: false,
    quality_class: qualityClass,
    excerpt: excerpt(text),
    source_field: opts.source_field,
    root_cause: token
      ? `uniqueness-token injection (${overlay})`
      : machine
        ? `unique-expert-research / audience-signal templates (${overlay})`
        : "n/a",
  });

  if (token) {
    pushIssue({
      severity: "BLOCKER",
      url: opts.url,
      page_type: opts.page_type,
      entity_slug: opts.entity_slug,
      section: opts.section,
      issue_class: "TOKEN_LEAK",
      issue_subclass: tokenHits.join("|"),
      rendered_excerpt: excerpt(text, 280),
      related_entity: overlay,
      root_cause:
        "synthesizeUniqueExpertResearch uniqueTokenList/skuStamp concatenated identifiers persisted in overlay JSON and preserved by page-time enrichTestingContext / section keepers",
      source_file: opts.source_file,
      source_field: opts.source_field,
      transform: opts.transform,
      component: opts.component,
      detector_that_should_have_caught_it:
        "canPublishReview.containsInternalTerminology + assessReviewArticle + site:audit CONTENT INTERNAL_LEAK + isReportOrJunkVoice",
      why_detector_missed:
        "INTERNAL_PATTERNS omit sku concatenations; junk-voice regex has no identifier detector; quality-contract treats testingContext as disclosure; uniqueness Jaccard is improved by unique stamps; launch assessor uses length/presence not semantic garbage; site:audit samples 15 reviews",
      recommended_fix_class: "STRIP_UNIQUENESS_TOKENS_AND_REGENERATE_PUBLIC_COPY",
      confidence: "high",
    });
  }
  if (machine && !token) {
    const decisionSection = /buy|skip|best for|not ideal|who should|verdict/i.test(
      opts.section,
    );
    pushIssue({
      severity: decisionSection ? "HIGH" : "MEDIUM",
      url: opts.url,
      page_type: opts.page_type,
      entity_slug: opts.entity_slug,
      section: opts.section,
      issue_class: "MACHINE_DECISION_COPY",
      issue_subclass: machineHits.join("|"),
      rendered_excerpt: excerpt(text, 280),
      related_entity: overlay,
      root_cause:
        "unique-expert-research buildWhoShouldBuy/Avoid templates and/or audience-signals thin-line expanders produce taxonomy-speak instead of consumer bullets",
      source_file: opts.source_file,
      source_field: opts.source_field,
      transform: opts.transform,
      component: opts.component,
      detector_that_should_have_caught_it:
        "assessReviewLaunchQuality + article auditor audience checks + editorial voice",
      why_detector_missed:
        "Gates require presence and minimum length of Buy/Skip lines, not consumer readability; thin-line detector treats long template sentences as strong; uniqueness rewarded template variants",
      recommended_fix_class: "REWRITE_DECISION_BULLETS_TO_CONSUMER_STYLE",
      confidence: "high",
    });
  }
}

function scanDecisionList(
  url: string,
  page_type: string,
  slug: string,
  section: string,
  lines: string[],
  source_file: string,
  source_field: string,
  component: string,
  seen: Map<string, string[]>,
) {
  const overlay = overlayOf(slug);
  for (const line of lines ?? []) {
    const t = line.trim();
    if (!t) continue;
    const key = t.toLowerCase().replace(/\s+/g, " ");
    const prev = seen.get(key) ?? [];
    const repetitive = prev.length > 0;
    prev.push(`${page_type}:${section}`);
    seen.set(key, prev);
    const q = classifyDecision(t, repetitive);
    scanText({
      url,
      page_type,
      entity_slug: slug,
      section,
      text: t,
      source_file,
      source_field,
      transform: "page-time enrichReviewForPage / audienceSignals / overlay merge",
      component,
      overlay,
    });
    if (q === "WORDY" && !detectMachine(t).length && !detectTokens(t).length) {
      pushIssue({
        severity: "HIGH",
        url,
        page_type,
        entity_slug: slug,
        section,
        issue_class: "DECISION_COPY_QUALITY",
        issue_subclass: "WORDY",
        rendered_excerpt: excerpt(t, 280),
        related_entity: overlay,
        root_cause: "decision lines written as long taxonomy sentences instead of scannable bullets",
        source_file,
        source_field,
        transform: "overlay templates",
        component,
        detector_that_should_have_caught_it: "audienceSignalsAreThin (inverted: long lines pass)",
        why_detector_missed:
          "isThinLine treats length>=64 with a clause marker as strong; wordy machine sentences pass",
        recommended_fix_class: "REWRITE_DECISION_BULLETS_TO_CONSUMER_STYLE",
        confidence: "high",
      });
    }
    if (repetitive) {
      pushIssue({
        severity: "HIGH",
        url,
        page_type,
        entity_slug: slug,
        section,
        issue_class: "REPEATED_COPY",
        issue_subclass: prev.join(" | "),
        rendered_excerpt: excerpt(t, 280),
        related_entity: overlay,
        root_cause: "same generated decision sentence reused across PDP/review surfaces",
        source_file,
        source_field,
        transform: "shared review overlay fields copied into PDP review summary + review page",
        component,
        detector_that_should_have_caught_it: "cross-surface uniqueness / duplication check",
        why_detector_missed:
          "uniqueness compares category peer pages after name-scrub, not intra-entity PDP vs review repetition",
        recommended_fix_class: "DEDUPE_CROSS_SURFACE_DECISION_COPY",
        confidence: "high",
      });
    }
  }
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const sitemapEntries = sitemap();
  const sitemapPaths = sitemapEntries.map((e) => pathOf(String(e.url)));
  const sitemapSet = new Set(sitemapPaths);

  const reviews = getReviews(PROD);
  const products = getProducts(PROD);
  const indexableReviews = reviews.filter((r) =>
    isIndexableEligibility(getLaunchEligibility({ kind: "review", entity: r }, PROD)),
  );
  const indexableProducts = products.filter((p) =>
    isIndexableEligibility(getLaunchEligibility({ kind: "product", entity: p }, PROD)),
  );

  const overlayCounts = { p62: 0, p54: 0, p53: 0, urw: 0, other: 0 };
  for (const r of indexableReviews) {
    const o = overlayOf(r.slug);
    if (o.startsWith("p62")) overlayCounts.p62++;
    else if (o.startsWith("p54")) overlayCounts.p54++;
    else if (o.startsWith("p53")) overlayCounts.p53++;
    else if (o.startsWith("unique")) overlayCounts.urw++;
    else overlayCounts.other++;
  }

  const crossSeen = new Map<string, Map<string, string[]>>();
  function seenFor(slug: string) {
    if (!crossSeen.has(slug)) crossSeen.set(slug, new Map());
    return crossSeen.get(slug)!;
  }

  // Reviews
  for (const r of indexableReviews) {
    const data = getReviewPageData(r.slug, PROD);
    if (!data) continue;
    const url = `${SITE}/reviews/${r.slug}`;
    const overlay = overlayOf(r.slug);
    const sourceFile =
      overlay === "p54_held_finalized_uniqueness_tokens"
        ? "src/content/reviews-p54-held-finalized.json"
        : overlay === "p53_indexable_uniqueness_tokens"
          ? "src/content/reviews-p53-differentiation.json"
          : overlay === "unique_rewrite_machine_copy"
            ? "src/content/reviews-unique-rewrite.json"
            : overlay === "p62_genuine_overlay"
              ? "src/content/reviews-p62-final-running.ts"
              : "src/content/reviews.ts";
    const rev = data.review;
    scanText({
      url,
      page_type: "review",
      entity_slug: r.slug,
      section: "verdict",
      text: rev.verdict ?? "",
      source_file: sourceFile,
      source_field: "review.verdict",
      transform: "enrichReviewForPage",
      component: "ReviewPage/verdict",
      overlay,
    });
    scanText({
      url,
      page_type: "review",
      entity_slug: r.slug,
      section: "final_verdict",
      text: rev.bottomLine ?? "",
      source_file: sourceFile,
      source_field: "review.bottomLine",
      transform: "enrichReviewForPage",
      component: "ReviewPage/bottomLine",
      overlay,
    });
    scanText({
      url,
      page_type: "review",
      entity_slug: r.slug,
      section: "summary",
      text: rev.summary ?? "",
      source_file: sourceFile,
      source_field: "review.summary",
      transform: "enrichReviewSummary",
      component: "ReviewPage/summary",
      overlay,
    });
    scanText({
      url,
      page_type: "review",
      entity_slug: r.slug,
      section: "how_we_assessed",
      text: rev.testingContext ?? "",
      source_file: sourceFile,
      source_field: "review.testingContext",
      transform: "enrichTestingContext (preserves unique-rewrite methodology if >=40 words)",
      component: "ReviewPage/testingContext",
      overlay,
    });
    scanDecisionList(
      url,
      "review",
      r.slug,
      "buy_if",
      rev.whoShouldBuy ?? [],
      sourceFile,
      "review.whoShouldBuy",
      "ReviewPage/BuyIf",
      seenFor(r.slug),
    );
    scanDecisionList(
      url,
      "review",
      r.slug,
      "skip_if",
      rev.whoShouldAvoid ?? [],
      sourceFile,
      "review.whoShouldAvoid",
      "ReviewPage/SkipIf",
      seenFor(r.slug),
    );
    scanDecisionList(
      url,
      "review",
      r.slug,
      "pros",
      rev.pros ?? [],
      sourceFile,
      "review.pros",
      "ReviewPage/pros",
      seenFor(r.slug),
    );
    scanDecisionList(
      url,
      "review",
      r.slug,
      "cons",
      rev.cons ?? [],
      sourceFile,
      "review.cons",
      "ReviewPage/cons",
      seenFor(r.slug),
    );
    for (const sec of rev.sections ?? []) {
      scanText({
        url,
        page_type: "review",
        entity_slug: r.slug,
        section: `section:${sec.id ?? sec.heading}`,
        text: `${sec.heading}\n${sec.body}`,
        source_file: sourceFile,
        source_field: `review.sections.${sec.id}.body`,
        transform: "enrichReviewSectionBodies (keeps token-stuffed bodies; junk regex misses stamps)",
        component: "ReviewPage/section",
        overlay,
      });
      const img = (sec as { image?: { src?: string; alt?: string } }).image;
      if (img?.src) {
        const cls = classifyImage({
          src: img.src,
          pageSport: data.product.categoryId?.includes("padel")
            ? "padel"
            : data.product.categoryId?.includes("watch")
              ? "watches"
              : "running",
          expected: `${data.product.fullName} ${sec.heading}`,
          pageType: "review",
          entitySlug: data.product.slug,
        });
        addImage({
          url,
          page_type: "review",
          section: sec.id ?? sec.heading,
          content_title: data.review.title,
          entity_slug: r.slug,
          image_path: img.src,
          alt: img.alt ?? "",
          expected_subject: data.product.fullName,
          association: overlay,
          classification: cls.classification,
          reason: cls.reason,
          provenance: "resolveReviewSectionVisuals",
          recommended_action:
            cls.classification === "LIKELY_CORRECT" || cls.classification === "CORRECT"
              ? "keep"
              : "review_semantic_match",
        });
      }
    }
    const hero = getPrimaryProductMedia(data.product);
    if (hero?.src) {
      const cls = classifyImage({
        src: hero.src,
        expected: data.product.fullName,
        pageType: "review",
        entitySlug: data.product.slug,
      });
      addImage({
        url,
        page_type: "review",
        section: "hero",
        content_title: data.review.title,
        entity_slug: r.slug,
        image_path: hero.src,
        alt: hero.alt ?? "",
        expected_subject: data.product.fullName,
        association: "product_primary",
        classification: cls.classification,
        reason: cls.reason,
        provenance: "getPrimaryProductMedia",
        recommended_action: "keep_if_authentic_same_sku",
      });
    }
  }

  // Products / PDP
  for (const p of indexableProducts) {
    const data = getProductPageData(p.slug, PROD);
    if (!data) continue;
    const url = `${SITE}/products/${p.slug}`;
    const summary = getProductReviewSummary({ productSlug: p.slug, pageData: data });
    const overlay = overlayOf(summary?.reviewSlug ?? p.slug);
    scanDecisionList(
      url,
      "product",
      p.slug,
      "best_for",
      data.bestFor ?? [],
      "src/lib/product/get-product-page-data.ts",
      "product.strengths+recommendations",
      "ProductPage/bestFor",
      seenFor(p.slug),
    );
    scanDecisionList(
      url,
      "product",
      p.slug,
      "not_ideal_for",
      data.notIdealFor ?? [],
      "src/lib/product/get-product-page-data.ts",
      "product.weaknesses+compromises",
      "ProductPage/notIdealFor",
      seenFor(p.slug),
    );
    if (summary) {
      scanText({
        url,
        page_type: "product",
        entity_slug: p.slug,
        section: "pdp_verdict",
        text: summary.verdict ?? "",
        source_file: "linked review overlay",
        source_field: "review.verdict",
        transform: "getProductReviewSummary uses page.review (NOT enrichReviewForPage)",
        component: "ProductReviewSummary/verdict",
        overlay,
      });
      scanText({
        url,
        page_type: "product",
        entity_slug: p.slug,
        section: "pdp_methodology",
        text: summary.methodology ?? "",
        source_file: "linked review overlay",
        source_field: "review.testingContext",
        transform: "getProductReviewSummary",
        component: "ProductReviewSummary/methodology",
        overlay,
      });
      scanDecisionList(
        url,
        "product",
        p.slug,
        "pdp_buy_if",
        summary.bestFor ?? [],
        "linked review overlay",
        "review.whoShouldBuy",
        "ProductReviewSummary/bestFor",
        seenFor(p.slug),
      );
      scanDecisionList(
        url,
        "product",
        p.slug,
        "pdp_skip_if",
        summary.notIdealFor ?? [],
        "linked review overlay",
        "review.whoShouldAvoid",
        "ProductReviewSummary/notIdealFor",
        seenFor(p.slug),
      );
      scanText({
        url,
        page_type: "product",
        entity_slug: p.slug,
        section: "pdp_review_summary",
        text: summary.summary ?? "",
        source_file: "linked review overlay",
        source_field: "review.summary",
        transform: "getProductReviewSummary",
        component: "ProductReviewSummary/summary",
        overlay,
      });
      for (const sec of summary.sections ?? []) {
        scanText({
          url,
          page_type: "product",
          entity_slug: p.slug,
          section: `pdp_section:${sec.id}`,
          text: `${sec.heading} ${sec.body}`,
          source_file: "linked review overlay",
          source_field: `review.sections.${sec.id}`,
          transform: "getProductReviewSummary excerpts/bodies from raw review",
          component: "ProductReviewSummary/section",
          overlay,
        });
      }
    }
    const hero = getPrimaryProductMedia(p);
    if (hero?.src) {
      const cls = classifyImage({
        src: hero.src,
        expected: p.fullName,
        pageType: "product",
        entitySlug: p.slug,
      });
      addImage({
        url,
        page_type: "product",
        section: "hero",
        content_title: p.fullName,
        entity_slug: p.slug,
        image_path: hero.src,
        alt: hero.alt ?? "",
        expected_subject: p.fullName,
        association: "product_primary",
        classification: cls.classification,
        reason: cls.reason,
        provenance: "getPrimaryProductMedia",
        recommended_action: "keep_if_authentic_same_sku",
      });
    }
  }

  // Buying guides
  const guides = getBuyingGuides(PROD).filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD),
    ),
  );
  for (const g of guides) {
    const url = `${SITE}/guides/${g.slug}`;
    const data = getBuyingGuidePageData(g.slug, PROD);
    const image = resolveGuideImage(g);
    const pageSport = g.categoryId?.includes("watch")
      ? "watches"
      : g.categoryId?.includes("padel") || g.categoryId?.includes("tennis")
        ? "padel_or_tennis"
        : g.categoryId?.includes("headphone")
          ? "headphones"
          : g.sportId?.includes("padel")
            ? "padel"
            : "running";
    const cls = classifyImage({
      src: image.src,
      pageSport,
      expected: g.title,
      pageType: "buying_guide",
      entitySlug: g.slug,
    });
    addImage({
      url,
      page_type: "buying_guide",
      section: "hero",
      content_title: g.title,
      entity_slug: g.slug,
      image_path: image.src,
      alt: image.alt,
      expected_subject: g.title,
      association: g.categoryId ?? "",
      classification: cls.classification,
      reason: cls.reason,
      provenance: "resolveGuideImage",
      recommended_action:
        cls.classification.startsWith("WRONG") ? "replace_with_topic_correct_hero" : "keep",
    });
    if (cls.classification.startsWith("WRONG") || cls.classification === "DUPLICATE_PLACEHOLDER") {
      pushIssue({
        severity: cls.classification === "WRONG_SPORT" ? "BLOCKER" : "HIGH",
        url,
        page_type: "buying_guide",
        entity_slug: g.slug,
        section: "hero",
        issue_class: "IMAGE_CONTENT_MISMATCH",
        issue_subclass: cls.classification,
        rendered_excerpt: `${g.title} → ${image.src}`,
        image_path: image.src,
        related_entity: g.categoryId ?? "",
        root_cause:
          "guide image fallback/shared hub asset or relatedProduct hero chosen without sport/subject check on every surface",
        source_file: "src/lib/guides/resolve-guide-image.ts",
        source_field: "hubImageSrc/heroImageSrc/relatedProductIds",
        transform: "resolveGuideImage",
        component: "GuidePage/hero + hub cards",
        detector_that_should_have_caught_it:
          "media:ci authentic-primary + assessGuideQuality hasMedia + visual QA",
        why_detector_missed:
          "media:ci scores IMAGE AUTHENTICITY of product heroes, not IMAGE SEMANTIC CORRECTNESS of editorial cards; guide quality only checks that some src exists; visual QA sampled layout not sport match",
        recommended_fix_class: "SEMANTIC_IMAGE_ASSOCIATION_GATE",
        confidence: "high",
      });
    }
    const blob = [
      g.title,
      g.shortDescription,
      g.quickAnswer,
      ...(g.sections ?? []).map((s) => `${s.heading} ${s.body}`),
    ].join("\n");
    scanText({
      url,
      page_type: "buying_guide",
      entity_slug: g.slug,
      section: "body",
      text: blob,
      source_file: "src/content/running/buying-guides.ts (or vertical seed)",
      source_field: "guide.sections",
      transform: "getBuyingGuidePageData",
      component: "BuyingGuidePage",
    });
    void data;
  }

  // Best guides
  const best = getBestGuides(PROD).filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
    ),
  );
  for (const g of best) {
    const url = `${SITE}/best/${g.slug}`;
    const img = resolveBestGuideImage(g);
    const src = typeof img === "string" ? img : (img as { src?: string })?.src ?? "";
    if (src) {
      const cls = classifyImage({
        src,
        expected: g.title,
        pageType: "best_guide",
        entitySlug: g.slug,
      });
      addImage({
        url,
        page_type: "best_guide",
        section: "hero",
        content_title: g.title,
        entity_slug: g.slug,
        image_path: src,
        alt: g.title,
        expected_subject: g.title,
        association: g.categoryId ?? "",
        classification: cls.classification,
        reason: cls.reason,
        provenance: "resolveBestGuideImage",
        recommended_action:
          cls.classification.startsWith("WRONG") ? "replace_with_topic_correct_hero" : "keep",
      });
      if (cls.classification.startsWith("WRONG")) {
        pushIssue({
          severity: "HIGH",
          url,
          page_type: "best_guide",
          entity_slug: g.slug,
          section: "hero",
          issue_class: "IMAGE_CONTENT_MISMATCH",
          issue_subclass: cls.classification,
          rendered_excerpt: `${g.title} → ${src}`,
          image_path: src,
          related_entity: g.categoryId ?? "",
          root_cause: "best-guide slug image map / shared atmosphere asset",
          source_file: "src/lib/best/resolve-best-guide-image.ts",
          source_field: "SLUG_IMAGES",
          transform: "resolveBestGuideImage",
          component: "BestGuidePage/hero",
          detector_that_should_have_caught_it: "media semantic match",
          why_detector_missed: "best-guide image map is existence-based, not subject-based",
          recommended_fix_class: "SEMANTIC_IMAGE_ASSOCIATION_GATE",
          confidence: "medium",
        });
      }
    }
    const data = getBestGuidePageData(g.slug, PROD);
    if (data) {
      const recText = (data.recommendations ?? [])
        .map((rec) =>
          [rec.whyText, ...(rec.strengths ?? []), ...(rec.compromises ?? []), ...(rec.bestForLabels ?? [])].filter(Boolean).join(" "),
        )
        .join("\n");
      scanText({
        url,
        page_type: "best_guide",
        entity_slug: g.slug,
        section: "recommendation_rationale",
        text: recText,
        source_file: "best guide seed / enrichGuideRecommendation",
        source_field: "recommendations",
        transform: "getBestGuidePageData",
        component: "BestGuidePage/picks",
      });
    }
  }

  // Comparisons
  const comparisons = getComparisons(PROD).filter((c) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "comparison", entity: c }, PROD),
    ),
  );
  for (const c of comparisons) {
    const url = `${SITE}/compare/${c.slug}`;
    const data = getComparisonPageData(c.slug, PROD);
    const blob = [
      c.title,
      c.summary,
      c.verdict,
      ...(c.keyDifferences ?? []).map((k) => `${k.title ?? ""} ${k.body ?? ""}`),
    ]
      .filter(Boolean)
      .join("\n");
    scanText({
      url,
      page_type: "comparison",
      entity_slug: c.slug,
      section: "body",
      text: blob,
      source_file: "comparison seed",
      source_field: "comparison.summary/verdict",
      transform: "getComparisonPageData",
      component: "ComparisonPage",
    });
    void data;
  }

  // Alternatives for indexable products
  for (const p of indexableProducts) {
    const data = getAlternativesPageData(p.slug, PROD);
    if (!data) continue;
    const url = `${SITE}/products/${p.slug}/alternatives`;
    if (!sitemapSet.has(`/products/${p.slug}/alternatives`) && !sitemapSet.has(`/alternatives/${p.slug}`)) {
      // still scan if page data exists; sitemap reconciliation later
    }
    const altUrl = sitemapSet.has(`/products/${p.slug}/alternatives`)
      ? `${SITE}/products/${p.slug}/alternatives`
      : sitemapPaths.find((x) => x.includes(p.slug) && x.includes("alternative"))
        ? `${SITE}${sitemapPaths.find((x) => x.includes(p.slug) && x.includes("alternative"))}`
        : url;
    const blob = JSON.stringify({
      summary: (data as { summary?: string }).summary,
      intro: (data as { intro?: string }).intro,
    });
    scanText({
      url: altUrl,
      page_type: "alternatives",
      entity_slug: p.slug,
      section: "decision_copy",
      text: blob,
      source_file: "src/lib/product/alternative-decision-copy.ts",
      source_field: "AlternativeDecisionCopy",
      transform: "build alternative decision copy (skips sku-token verdicts)",
      component: "AlternativesPage",
    });
  }

  // Homepage + hubs
  const home = getHomepageData();
  const homeUrl = `${SITE}/`;
  for (const g of home.latestGuides ?? []) {
    const cls = classifyImage({
      src: g.imageSrc,
      pageSport: "running",
      expected: g.title,
      pageType: "home",
      entitySlug: g.slug,
    });
    addImage({
      url: homeUrl,
      page_type: "home",
      section: "latest_buying_guides",
      content_title: g.title,
      entity_slug: g.slug,
      image_path: g.imageSrc,
      alt: g.imageAlt,
      expected_subject: g.title,
      association: "homepage_latest_guides",
      classification: cls.classification,
      reason: cls.reason,
      provenance: "getHomepageData → resolveGuideImage",
      recommended_action:
        cls.classification.startsWith("WRONG") ? "replace_with_topic_correct_hero" : "keep",
    });
    if (cls.classification.startsWith("WRONG")) {
      pushIssue({
        severity: "BLOCKER",
        url: homeUrl,
        page_type: "home",
        entity_slug: g.slug,
        section: "latest_buying_guides",
        issue_class: "IMAGE_CONTENT_MISMATCH",
        issue_subclass: cls.classification,
        rendered_excerpt: `${g.title} → ${g.imageSrc}`,
        image_path: g.imageSrc,
        related_entity: g.slug,
        root_cause: "homepage guide cards use resolveGuideImage / shared fillers",
        source_file: "src/lib/home/get-homepage-data.ts",
        source_field: "latestGuides.imageSrc",
        transform: "resolveGuideImage",
        component: "GuidesJournalRow",
        detector_that_should_have_caught_it: "homepage tests + visual QA + media semantic",
        why_detector_missed:
          "tests assert path prefixes for some slugs locally; production/other surfaces (brand hub maps, journal, leftover fillers) not fully covered; authenticity ≠ sport match",
        recommended_fix_class: "SEMANTIC_IMAGE_ASSOCIATION_GATE",
        confidence: "high",
      });
    }
  }
  for (const g of home.journalItems ?? []) {
    addImage({
      url: homeUrl,
      page_type: "home",
      section: "journal",
      content_title: g.title,
      entity_slug: g.id,
      image_path: g.imageSrc,
      alt: g.imageAlt,
      expected_subject: g.title,
      association: "homepage_journal_mirrors_guides",
      classification: "LIKELY_CORRECT",
      reason: "mirrors latest guide images",
      provenance: "getHomepageData.journalItems",
      recommended_action: "keep_if_guide_image_correct",
    });
  }

  for (const sport of ["running", "padel", "tennis", "fitness"]) {
    try {
      const hub = getSportHubData({ sportSlug: sport });
      if (!hub) continue;
      const url = `${SITE}/${sport}`;
      // collect any image-like fields
      const json = JSON.stringify(hub);
      const srcs = [...json.matchAll(/"src":"(\/images\/[^"]+)"/g)].map((m) => m[1]!);
      for (const src of [...new Set(srcs)].slice(0, 40)) {
        const cls = classifyImage({
          src,
          pageSport: sport === "padel" || sport === "tennis" ? "padel_or_tennis" : sport,
          expected: `${sport} hub`,
          pageType: "sport_hub",
        });
        addImage({
          url,
          page_type: "sport_hub",
          section: "hub_media",
          content_title: sport,
          entity_slug: sport,
          image_path: src,
          alt: "",
          expected_subject: `${sport} products/guides`,
          association: "sport_hub",
          classification: cls.classification,
          reason: cls.reason,
          provenance: "getSportHubData",
          recommended_action: "keep",
        });
      }
    } catch {
      /* hub may be gated */
    }
  }

  const guidesHub = getGuidesHubData({ sportSlug: "running" });
  const hubUrl = `${SITE}/guides`;
  const hubCards = [
    ...(guidesHub.featuredGuide ? [guidesHub.featuredGuide] : []),
    ...guidesHub.startHereGuides,
    ...guidesHub.topics.flatMap((t) => [
      ...(t.featured ? [t.featured] : []),
      ...t.guides,
    ]),
  ];
  for (const card of hubCards) {
    const cls = classifyImage({
      src: card.imageSrc,
      pageSport: "running",
      expected: card.guide.title,
      pageType: "guides_hub",
      entitySlug: card.guide.slug,
    });
    addImage({
      url: hubUrl,
      page_type: "guides_hub",
      section: "card",
      content_title: card.guide.title,
      entity_slug: card.guide.slug,
      image_path: card.imageSrc,
      alt: card.imageAlt,
      expected_subject: card.guide.title,
      association: card.guide.categoryId ?? "",
      classification: cls.classification,
      reason: cls.reason,
      provenance: "getGuidesHubData → resolveGuideImage",
      recommended_action:
        cls.classification.startsWith("WRONG") ? "replace_with_topic_correct_hero" : "keep",
    });
    if (cls.classification.startsWith("WRONG")) {
      pushIssue({
        severity: "BLOCKER",
        url: hubUrl,
        page_type: "guides_hub",
        entity_slug: card.guide.slug,
        section: "card",
        issue_class: "IMAGE_CONTENT_MISMATCH",
        issue_subclass: cls.classification,
        rendered_excerpt: `${card.guide.title} → ${card.imageSrc}`,
        image_path: card.imageSrc,
        related_entity: card.guide.slug,
        root_cause: "guides hub card image mismatch",
        source_file: "src/lib/guides/get-guides-hub-data.ts",
        source_field: "card.imageSrc",
        transform: "resolveGuideImage",
        component: "GuidesHub",
        detector_that_should_have_caught_it: "get-guides-hub-data tests (partial slug list)",
        why_detector_missed: "tests cover a subset of slugs; other hub/brand/journal surfaces untested",
        recommended_fix_class: "SEMANTIC_IMAGE_ASSOCIATION_GATE",
        confidence: "high",
      });
    }
  }

  // Brand hubs (indexable)
  const brands = getBrands(PROD).filter((b) =>
    isIndexableEligibility(getLaunchEligibility({ kind: "brand", entity: b }, PROD)),
  );
  for (const b of brands) {
    try {
      const data = getBrandHubPageData({ brandSlug: b.slug });
      if (!data) continue;
      const url = `${SITE}/brands/${b.slug}`;
      const json = JSON.stringify(data);
      scanText({
        url,
        page_type: "brand",
        entity_slug: b.slug,
        section: "editorial",
        text: json.slice(0, 20000),
        source_file: "src/lib/brand-hub/brand-hub-editorial.ts",
        source_field: "buildBrandHubEditorial",
        transform: "getBrandHubPageData",
        component: "BrandHub",
      });
      const srcs = [...json.matchAll(/"src":"(\/images\/[^"]+)"/g)].map((m) => m[1]!);
      for (const src of [...new Set(srcs)].slice(0, 25)) {
        const cls = classifyImage({
          src,
          expected: b.name,
          pageType: "brand",
          entitySlug: b.slug,
        });
        addImage({
          url,
          page_type: "brand",
          section: "hub_media",
          content_title: b.name,
          entity_slug: b.slug,
          image_path: src,
          alt: "",
          expected_subject: b.name,
          association: "brand_hub",
          classification: cls.classification,
          reason: cls.reason,
          provenance: "getBrandHubPageData",
          recommended_action: "keep",
        });
      }
    } catch {
      /* skip */
    }
  }

  // Reuse counts
  const reuse = new Map<string, number>();
  for (const img of images) {
    const k = String(img.image_path);
    reuse.set(k, (reuse.get(k) ?? 0) + 1);
  }
  for (const img of images) {
    img.reuse_count = reuse.get(String(img.image_path)) ?? 1;
  }
  for (const [src, count] of reuse) {
    if (count < 8) continue;
    if (!/hero-gear-composite|guide-how-to-choose|guide-tennis|urban-dusk|running-urban|daily-vs-long|guide-home-gym/.test(src) && !/best-marathon-running/.test(src)) {
      continue;
    }
    // already have per-placement rows; add a reuse cluster issue on home as representative
    pushIssue({
      severity: count >= 15 ? "HIGH" : "MEDIUM",
      url: SITE,
      page_type: "sitewide",
      entity_slug: src.split("/").pop() ?? src,
      section: "image_reuse",
      issue_class: "IMAGE_REUSE",
      issue_subclass: "shared_asset",
      rendered_excerpt: `${src} used ${count} times`,
      image_path: src,
      related_entity: "",
      root_cause: "shared editorial placeholder / hub asset reused across unrelated titles",
      source_file: "various resolvers",
      source_field: "image src",
      transform: "shared fallback",
      component: "cards/heroes",
      detector_that_should_have_caught_it: "media reuse cluster / uniqueness of editorial imagery",
      why_detector_missed:
        "media:ci authentic-primary counts a licensed product photo as success even when reused as a wrong-topic card; no reuse×sport matrix",
      recommended_fix_class: "SEMANTIC_IMAGE_ASSOCIATION_GATE",
      confidence: "high",
    });
  }

  const issueCols = [
    "issue_id",
    "severity",
    "url",
    "page_type",
    "entity_slug",
    "section",
    "issue_class",
    "issue_subclass",
    "rendered_excerpt",
    "image_path",
    "related_entity",
    "root_cause",
    "source_file",
    "source_field",
    "transform",
    "component",
    "detector_that_should_have_caught_it",
    "why_detector_missed",
    "recommended_fix_class",
    "confidence",
    "status",
  ];
  const qualityCols = [
    "url",
    "page_type",
    "entity_slug",
    "section",
    "text_length",
    "token_leak",
    "machine_language",
    "wordy",
    "repetitive",
    "generic",
    "broken",
    "unsupported",
    "quality_class",
    "excerpt",
    "source_field",
    "root_cause",
  ];
  const imageCols = [
    "url",
    "page_type",
    "section",
    "content_title",
    "entity_slug",
    "image_path",
    "alt",
    "expected_subject",
    "association",
    "reuse_count",
    "classification",
    "reason",
    "provenance",
    "recommended_action",
  ];

  writeCsv("FULL-RENDERED-QUALITY-ISSUES.csv", issues, issueCols);
  writeCsv("FULL-RENDERED-CONTENT-QUALITY.csv", quality, qualityCols);
  writeCsv("FULL-IMAGE-CONTENT-MATCH.csv", images, imageCols);

  const tokenUrls = new Set(
    issues.filter((i) => i.issue_class === "TOKEN_LEAK").map((i) => i.url),
  );
  const machineUrls = new Set(
    issues.filter((i) => i.issue_class === "MACHINE_DECISION_COPY").map((i) => i.url),
  );
  const imageUrls = new Set(
    issues.filter((i) => String(i.issue_class).startsWith("IMAGE")).map((i) => i.url),
  );
  const problemUrls = new Set(issues.map((i) => i.url));

  const summary = {
    generatedAt: new Date().toISOString(),
    sitemapCount: sitemapPaths.length,
    sitemapPaths,
    indexableReviews: indexableReviews.length,
    indexableProducts: indexableProducts.length,
    indexableGuides: guides.length,
    indexableBest: best.length,
    indexableComparisons: comparisons.length,
    overlayCounts,
    issueCount: issues.length,
    qualityRows: quality.length,
    imageRows: images.length,
    uniqueIssueUrls: problemUrls.size,
    tokenLeakUrls: tokenUrls.size,
    machineCopyUrls: machineUrls.size,
    imageIssueUrls: imageUrls.size,
    blocker: issues.filter((i) => i.severity === "BLOCKER").length,
    high: issues.filter((i) => i.severity === "HIGH").length,
    medium: issues.filter((i) => i.severity === "MEDIUM").length,
    low: issues.filter((i) => i.severity === "LOW").length,
    byClass: Object.fromEntries(
      [...new Set(issues.map((i) => i.issue_class))].map((c) => [
        c,
        issues.filter((i) => i.issue_class === c).length,
      ]),
    ),
    byPageType: Object.fromEntries(
      [...new Set(issues.map((i) => i.page_type))].map((c) => [
        c,
        issues.filter((i) => i.page_type === c).length,
      ]),
    ),
  };
  writeFileSync(join(OUT, "forensic-scan-summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ...summary, sitemapPaths: sitemapPaths.length }, null, 2));
}

main();
