/**
 * Kitletics padel production prelaunch audit (READ-ONLY).
 *
 * Phase A always writes repository/eligibility inventory and catalog evidence.
 * Phase B crawls rendered production HTML only when CRAWL_BASE is explicitly set.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/padel-prelaunch-audit.ts
 *   CRAWL_BASE=http://127.0.0.1:3011 npx tsx --tsconfig tsconfig.json scripts/tmp/padel-prelaunch-audit.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getBestGuides,
  getBrands,
  getBuyingGuides,
  getCategories,
  getComparisons,
  getGearSetups,
  getLowestOfferPrice,
  getProductById,
  getProducts,
  getReviews,
  getSportById,
  getTools,
} from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  type LaunchEligibility,
} from "@/domain/launch";
import { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
import { getPublishRequirement } from "@/domain/catalog/publishability";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { classifyDecisionLine } from "@/lib/decision-copy/classify";
import { inspectPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { isRawPublicSpecKey } from "@/lib/specs/public-label";
import { getToolHref } from "@/lib/tools/href";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import {
  PADEL_RESEARCH_STORIES,
  getPadelResearchPageData,
} from "@/lib/padel-research";
import { listPadelCollections } from "@/lib/padel-collections";
import type { Product } from "@/domain/products/types";

const AS_OF = "2026-09-14";
const AUDIT_NOW = new Date("2026-09-14T12:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const UNIVERSE = { isDev: true as const, now: AUDIT_NOW };
const SPORT_ID = "sport-padel";
const SPORT_SLUG = "padel";
const OUT = join(process.cwd(), "docs/padel/data");
const CRAWL_BASE = process.env.CRAWL_BASE?.trim().replace(/\/$/, "") || null;
const DEFAULT_CRAWL_BASE = "http://127.0.0.1:3012";
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.CRAWL_CONCURRENCY?.trim() || "2", 10) || 2,
);
const TIMEOUT_MS = 90_000;
/** AUDIT_MODE=final | zero-debt | (default prelaunch) */
const AUDIT_MODE = process.env.AUDIT_MODE?.trim().toLowerCase() || "";
const FINAL_MODE = AUDIT_MODE === "final";
const ZERO_DEBT_MODE = AUDIT_MODE === "zero-debt";
const ISSUES_FILE = ZERO_DEBT_MODE
  ? "PADEL-ZERO-DEBT-ISSUES.csv"
  : FINAL_MODE
    ? "PADEL-FINAL-REMEDIATION-ISSUES.csv"
    : "PADEL-PRELAUNCH-ISSUES.csv";
const CRAWL_FILE = ZERO_DEBT_MODE
  ? "PADEL-ZERO-DEBT-URL-CRAWL.csv"
  : FINAL_MODE
    ? "PADEL-FINAL-URL-CRAWL.csv"
    : "PADEL-HTML-CRAWL.csv";
const SUMMARY_FILE = ZERO_DEBT_MODE
  ? "PADEL-ZERO-DEBT-SUMMARY.json"
  : FINAL_MODE
    ? "PADEL-FINAL-REMEDIATION-SUMMARY.json"
    : "PADEL-PRELAUNCH-SUMMARY.json";
const INVENTORY_FILE = ZERO_DEBT_MODE
  ? "PADEL-ZERO-DEBT-URL-INVENTORY.csv"
  : FINAL_MODE
    ? "PADEL-FINAL-URL-INVENTORY.csv"
    : "PADEL-URL-INVENTORY.csv";
const SCORECARD_FILE = ZERO_DEBT_MODE
  ? "PADEL-ZERO-DEBT-SCORECARD.json"
  : FINAL_MODE
    ? "PADEL-FINAL-CATALOG-SCORECARD.json"
    : "PADEL-CATALOG-SCORECARD.json";

const CATEGORY_IDS = {
  rackets: "cat-padel-rackets",
  shoes: "cat-padel-shoes",
  balls: "cat-padel-balls",
  bags: "cat-padel-bags",
  grips: "cat-padel-grips",
  accessories: "cat-padel-accessories",
  clothing: "cat-padel-clothing",
} as const;

const INVENTORY_COLUMNS = [
  "path",
  "page_type",
  "entity_id",
  "entity_slug",
  "launch_disposition",
  "robots_expectation",
  "in_sitemap_expected",
  "notes",
] as const;

const ISSUE_COLUMNS = [
  "issue_id",
  "severity",
  "url",
  "path",
  "page_type",
  "issue_class",
  "issue_subclass",
  "rendered_excerpt",
  "image_path",
  "root_cause",
  "status",
] as const;

const CRAWL_COLUMNS = [
  "url",
  "path",
  "page_type",
  "launch_disposition",
  "expected_indexable",
  "is_canary",
  "status",
  "error",
  "title",
  "canonical",
  "has_noindex",
  "text_len",
  "jsonld_types",
  "image_count",
  "token_hits",
  "machine_hits",
  "decision_machine",
  "decision_broken",
  "raw_schema_key",
  "image_failures",
  "fake_testing",
  "fake_ratings",
  "commerce_signals",
  "excerpt",
] as const;

export const TOKEN_RES: Array<{ name: string; re: RegExp }> = [
  { name: "skuslug", re: /skuslug[a-z0-9]*/i },
  { name: "skuid", re: /skuid[a-z0-9]*/i },
  { name: "gen_concat", re: /\bgen\d+[a-z][a-z0-9]{4,}/i },
  {
    name: "value_field_slug",
    re: /\b\d{1,4}(weight|heelstack|forefootstack|drop|capacity|batterygps|batterysmartwatch)[a-z0-9]{4,}/i,
  },
  {
    name: "slug_field_value",
    re: /\b[a-z]{6,}(weight|heelstack|forefootstack|drop|cushionlevel|cushionfeel|ridecharacter|stability|capacity|displaytype|touchscreen|multibandgps)[a-z0-9]+/i,
  },
  { name: "concatenated_token_phrase", re: /concatenated\s+\w+\s+token/i },
  { name: "object_object", re: /\[object Object\]/ },
  { name: "undefined_token", re: /(?:^|[^\w.])undefined(?:[^\w.]|$)/ },
  { name: "nan_token", re: /(?:^|[^\w.])NaN(?:[^\w.]|$)/ },
  { name: "stays_null", re: /\bstays null\b/i },
  { name: "remains_null", re: /\bremains null\b/i },
  { name: "null_until", re: /\bnull until\b/i },
  { name: "updated_on_field", re: /\bupdatedOn\b/ },
  { name: "schema_field", re: /\bschema field\b/i },
  { name: "internal_field", re: /\binternal field\b/i },
  { name: "intentional_stamp", re: /\bintentional stamp\b/i },
  { name: "fallback_value", re: /\bfallback value\b/i },
  { name: "catalog_role", re: /\bcatalog role\b/i },
];

export const MACHINE_RES: Array<{ name: string; re: RegExp }> = [
  { name: "already_decided_lane", re: /already decided the lane/i },
  { name: "headline_trait", re: /as the headline trait/i },
  { name: "whatever_optimizes", re: /whatever .+ optimizes for/i },
  { name: "catalogued_to_deliver", re: /catalogued to deliver/i },
  { name: "pause_if_not", re: /i['’]d pause if not/i },
  { name: "look_elsewhere_if_not", re: /look elsewhere if not/i },
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

type PageType =
  | "sport-hub"
  | "category"
  | "database"
  | "collections"
  | "product"
  | "alternatives"
  | "review"
  | "best-guide"
  | "buying-guide"
  | "comparison"
  | "brand"
  | "finder"
  | "research"
  | "setup"
  | "other";

type Disposition = "INDEXABLE" | "PUBLIC_NOINDEX" | "HIDDEN_404";

type InventoryRow = {
  path: string;
  page_type: PageType;
  entity_id: string;
  entity_slug: string;
  launch_disposition: Disposition;
  robots_expectation: string;
  in_sitemap_expected: string;
  notes: string;
  product_slug?: string;
  brand_slug?: string;
};

type Severity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";

type Issue = {
  issue_id: string;
  severity: Severity;
  url: string;
  path: string;
  page_type: PageType;
  issue_class: string;
  issue_subclass: string;
  rendered_excerpt: string;
  image_path: string;
  root_cause: string;
  status: "OPEN";
};

type CrawlRow = {
  url: string;
  path: string;
  page_type: PageType;
  launch_disposition: Disposition;
  expected_indexable: boolean;
  is_canary: boolean;
  status: number | "SKIPPED" | "ERR";
  error: string;
  title: string;
  canonical: string;
  has_noindex: boolean;
  text_len: number;
  jsonld_types: string;
  image_count: number;
  token_hits: string;
  machine_hits: string;
  decision_machine: boolean;
  decision_broken: boolean;
  raw_schema_key: boolean;
  image_failures: string;
  fake_testing: boolean;
  fake_ratings: boolean;
  commerce_signals: string;
  excerpt: string;
};

function csvEscape(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(
  fileName: string,
  rows: Array<Record<string, unknown>>,
  columns: readonly string[],
): void {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ];
  writeFileSync(join(OUT, fileName), `${lines.join("\n")}\n`);
}

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(join(OUT, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

function reasonsOf(eligibility: LaunchEligibility): string {
  return eligibility.reasons
    .map((reason) =>
      reason.detail ? `${reason.code}:${reason.detail}` : reason.code,
    )
    .join("|");
}

function robotsFor(disposition: Disposition): string {
  if (disposition === "INDEXABLE") return "index,follow";
  if (disposition === "PUBLIC_NOINDEX") return "noindex,follow";
  return "noindex,nofollow";
}

function excerpt(text: string, max = 240): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length <= max
    ? normalized
    : `${normalized.slice(0, Math.max(0, max - 1))}…`;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) =>
      String.fromCodePoint(Number.parseInt(n, 16)),
    );
}

function visibleText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function titleOf(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? excerpt(decodeEntities(match[1]!), 500) : "";
}

function canonicalOf(html: string): string {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (href) return decodeEntities(href);
  }
  return "";
}

function hasNoindex(html: string): boolean {
  return (html.match(/<meta\b[^>]*>/gi) ?? []).some(
    (tag) =>
      /\bname=["']robots["']/i.test(tag) &&
      /\bcontent=["'][^"']*noindex/i.test(tag),
  );
}

function jsonLdTypes(html: string): string[] {
  const types = new Set<string>();
  const scripts =
    html.match(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    ) ?? [];
  for (const script of scripts) {
    for (const match of script.matchAll(/"@type"\s*:\s*"([^"]+)"/g)) {
      types.add(match[1]!);
    }
  }
  return [...types].sort();
}

function normalizeImagePath(raw: string): string {
  try {
    const decoded = decodeURIComponent(decodeEntities(raw));
    if (decoded.startsWith("http")) return new URL(decoded).pathname;
    const nested = decoded.match(/[?&]url=([^&]+)/)?.[1];
    if (nested) return normalizeImagePath(nested);
    return decoded.split("?")[0]!;
  } catch {
    return decodeEntities(raw).split("?")[0]!;
  }
}

function extractImageSrcs(html: string): string[] {
  const found = new Set<string>();
  for (const tag of html.match(/<(?:img|meta)\b[^>]*>/gi) ?? []) {
    for (const attr of ["src", "content"]) {
      const raw = tag.match(new RegExp(`\\b${attr}=["']([^"']+)["']`, "i"))?.[1];
      if (!raw) continue;
      const path = normalizeImagePath(raw);
      if (path.startsWith("/images/")) found.add(path);
    }
    const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1];
    if (srcset) {
      for (const candidate of decodeEntities(srcset).split(",")) {
        const path = normalizeImagePath(candidate.trim().split(/\s+/)[0] ?? "");
        if (path.startsWith("/images/")) found.add(path);
      }
    }
  }
  for (const match of html.matchAll(/url=(%2Fimages%2F[^&"']+)/gi)) {
    const path = normalizeImagePath(match[1]!);
    if (path.startsWith("/images/")) found.add(path);
  }
  return [...found];
}

function primaryImageSrcs(html: string, all: string[]): string[] {
  const primary = new Set<string>();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/\bproperty=["']og:image(?::url)?["']/i.test(tag)) continue;
    const raw = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    if (raw) primary.add(normalizeImagePath(raw));
  }
  // Prefer authentic product hero namespaces (soft goods live under category folders).
  const heroLike = all.find((src) =>
    /\/images\/padel\/(?:products|balls|bags|grips|accessories|shoes)\/[^"'?\s]+-hero\./i.test(
      src,
    ),
  );
  if (heroLike) primary.add(heroLike);
  else {
    const productLike = all.find((src) => /\/images\/padel\//i.test(src));
    if (productLike) primary.add(productLike);
    else if (all[0]) primary.add(all[0]);
  }
  return [...primary];
}

function detectNames(
  text: string,
  detectors: Array<{ name: string; re: RegExp }>,
): string[] {
  return detectors.filter(({ re }) => re.test(text)).map(({ name }) => name);
}

function extractDecisionLines(text: string): string[] {
  const labels = [
    "Best for",
    "Not ideal for",
    "Buy if",
    "Skip if",
    "Who it's for",
    "Who should skip",
  ];
  const lines = new Set<string>();
  for (const label of labels) {
    const index = text.toLowerCase().indexOf(label.toLowerCase());
    if (index < 0) continue;
    for (const sentence of text
      .slice(index, index + 800)
      .split(/(?<=[.!?])\s+/)) {
      const words = sentence.trim().split(/\s+/).length;
      if (words >= 5 && words <= 50) lines.add(sentence.trim());
    }
  }
  return [...lines];
}

function specPresent(product: Product, key: string): boolean {
  const value = product.specifications[key];
  return value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0);
}

function specCompleteEstimate(product: Product): boolean {
  const requirement = getPublishRequirement(product.categoryId);
  if (requirement?.requiredSpecKeys.length) {
    return requirement.requiredSpecKeys.every((key) => specPresent(product, key));
  }
  return Object.values(product.specifications).some(
    (value) => value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0),
  );
}

function padelDispositionForStatic(): Disposition {
  const mode = resolveEntityVerticalPolicy([SPORT_ID]).mode;
  return mode === "enabled" || mode === "selective" ? "INDEXABLE" : "PUBLIC_NOINDEX";
}

function isPadelBestGuide(guide: { sportId?: string; slug: string }): boolean {
  return guide.sportId === SPORT_ID || guide.slug.startsWith("padel-");
}

function pageExpectedSchema(pageType: PageType): string[] {
  if (pageType === "product") return ["Product"];
  if (pageType === "review") return ["Review"];
  if (
    pageType === "best-guide" ||
    pageType === "buying-guide" ||
    pageType === "comparison" ||
    pageType === "research"
  ) {
    return ["Article", "Review"];
  }
  return [];
}

function addInventory(
  byPath: Map<string, InventoryRow>,
  input: Omit<InventoryRow, "robots_expectation" | "in_sitemap_expected">,
  sitemapPaths: Set<string>,
): void {
  const row: InventoryRow = {
    ...input,
    robots_expectation: robotsFor(input.launch_disposition),
    in_sitemap_expected: sitemapPaths.has(input.path) ? "yes" : "no",
  };
  const existing = byPath.get(input.path);
  if (!existing || existing.launch_disposition !== "INDEXABLE") {
    byPath.set(input.path, row);
  }
}

function buildInventory(): {
  rows: InventoryRow[];
  products: Product[];
  padelBrandIds: Set<string>;
  sitemapPaths: Set<string>;
  productEligibility: Map<string, LaunchEligibility>;
} {
  process.stderr.write("Phase A: resolving padel repository inventory\n");
  const sitemapPaths = new Set(
    sitemap().map((entry) => {
      try {
        return new URL(entry.url).pathname || "/";
      } catch {
        return entry.url.replace(siteConfig.url, "") || "/";
      }
    }),
  );
  const byPath = new Map<string, InventoryRow>();
  const universeProducts = getProducts(UNIVERSE).filter((product) =>
    product.sportIds.includes(SPORT_ID),
  );
  const productById = new Map(universeProducts.map((product) => [product.id, product]));
  const padelProductIds = new Set(universeProducts.map((product) => product.id));
  const padelBrandIds = new Set(universeProducts.map((product) => product.brandId));
  const productEligibility = new Map<string, LaunchEligibility>();
  const relationships = getAllProductRelationships();
  const brands = getBrands(UNIVERSE);
  const brandById = new Map(brands.map((brand) => [brand.id, brand]));
  const sport = getSportById(SPORT_ID);
  const sportEligibility = sport
    ? getLaunchEligibility({ kind: "sport", entity: sport }, PROD)
    : null;
  const staticDisposition =
    sportEligibility?.disposition ?? padelDispositionForStatic();

  addInventory(
    byPath,
    {
      path: "/padel",
      page_type: "sport-hub",
      entity_id: SPORT_ID,
      entity_slug: SPORT_SLUG,
      launch_disposition: staticDisposition,
      notes: sportEligibility
        ? reasonsOf(sportEligibility)
        : "static padel hub; sport entity missing",
    },
    sitemapPaths,
  );

  for (const [key, categoryId] of Object.entries(CATEGORY_IDS)) {
    const category = getCategories().find((item) => item.id === categoryId);
    const path = `/padel/${key}`;
    const softGated = category ? isSoftGatedCategory(category) : key === "clothing";
    const disposition: Disposition = softGated
      ? "PUBLIC_NOINDEX"
      : staticDisposition;
    addInventory(
      byPath,
      {
        path,
        page_type: "category",
        entity_id: categoryId,
        entity_slug: category?.slug ?? key,
        launch_disposition: disposition,
        notes: [
          softGated ? "soft_gated_category" : "category_under_padel_sport",
          staticDisposition !== "INDEXABLE" ? "padel_vertical_not_indexable" : "",
        ]
          .filter(Boolean)
          .join("|"),
      },
      sitemapPaths,
    );
  }

  addInventory(
    byPath,
    {
      path: "/padel/rackets/database",
      page_type: "database",
      entity_id: "padel-racket-database",
      entity_slug: "padel-racket-database",
      launch_disposition: padelDispositionForStatic(),
      notes: "public database; indexes with selective padel vertical",
    },
    sitemapPaths,
  );

  addInventory(
    byPath,
    {
      path: "/padel/collections",
      page_type: "collections",
      entity_id: "padel-collections",
      entity_slug: "collections",
      launch_disposition: padelDispositionForStatic(),
      notes: "VALID_PUBLIC_SURFACE racket family index",
    },
    sitemapPaths,
  );
  for (const collection of listPadelCollections()) {
    addInventory(
      byPath,
      {
        path: collection.href,
        page_type: "collections",
        entity_id: `padel-collection-${collection.slug}`,
        entity_slug: collection.slug,
        launch_disposition: padelDispositionForStatic(),
        notes: `collection|${collection.brandSlug}|${collection.racketCount}_rackets`,
      },
      sitemapPaths,
    );
  }

  for (const product of universeProducts) {
    const eligibility = getLaunchEligibility(
      { kind: "product", entity: product },
      PROD,
    );
    productEligibility.set(product.id, eligibility);
    const brand = brandById.get(product.brandId);
    addInventory(
      byPath,
      {
        path: `/products/${product.slug}`,
        page_type: "product",
        entity_id: product.id,
        entity_slug: product.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
        product_slug: product.slug,
        brand_slug: brand?.slug ?? "",
      },
      sitemapPaths,
    );

    const alternativesGate = canPublishAlternativesPage(product, relationships);
    const alternativesEligibility = alternativesGate.ok
      ? getLaunchEligibility({ kind: "alternatives", entity: product }, PROD)
      : null;
    addInventory(
      byPath,
      {
        path: `/products/${product.slug}/alternatives`,
        page_type: "alternatives",
        entity_id: product.id,
        entity_slug: product.slug,
        launch_disposition:
          alternativesEligibility?.disposition ?? "HIDDEN_404",
        notes: alternativesEligibility
          ? reasonsOf(alternativesEligibility)
          : `alternatives_graph_gate:${alternativesGate.reasons.join("|")}`,
        product_slug: product.slug,
        brand_slug: brand?.slug ?? "",
      },
      sitemapPaths,
    );
  }

  for (const review of getReviews(UNIVERSE)) {
    const product = productById.get(review.productId);
    if (!product) continue;
    const eligibility = getLaunchEligibility(
      { kind: "review", entity: review },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: `/reviews/${review.slug}`,
        page_type: "review",
        entity_id: review.id,
        entity_slug: review.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
        product_slug: product.slug,
        brand_slug: brandById.get(product.brandId)?.slug ?? "",
      },
      sitemapPaths,
    );
  }

  for (const guide of getBestGuides(UNIVERSE).filter(isPadelBestGuide)) {
    const eligibility = getLaunchEligibility(
      { kind: "best-guide", entity: guide },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: `/best/${guide.slug}`,
        page_type: "best-guide",
        entity_id: guide.id,
        entity_slug: guide.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
      },
      sitemapPaths,
    );
  }

  for (const guide of getBuyingGuides(UNIVERSE).filter(
    (item) => item.sportId === SPORT_ID,
  )) {
    const eligibility = getLaunchEligibility(
      { kind: "buying-guide", entity: guide },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: `/guides/${guide.slug}`,
        page_type: "buying-guide",
        entity_id: guide.id,
        entity_slug: guide.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
      },
      sitemapPaths,
    );
  }

  for (const comparison of getComparisons(UNIVERSE).filter((item) =>
    item.productIds.some((id) => padelProductIds.has(id)),
  )) {
    const eligibility = getLaunchEligibility(
      { kind: "comparison", entity: comparison },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: `/compare/${comparison.slug}`,
        page_type: "comparison",
        entity_id: comparison.id,
        entity_slug: comparison.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
      },
      sitemapPaths,
    );
  }

  for (const brand of brands.filter(
    (item) =>
      padelBrandIds.has(item.id) ||
      item.slug.includes("padel") ||
      /nox|bullpadel|siux|starvie/i.test(item.slug),
  )) {
    const eligibility = getLaunchEligibility(
      { kind: "brand", entity: brand },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: `/brands/${brand.slug}`,
        page_type: "brand",
        entity_id: brand.id,
        entity_slug: brand.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
        brand_slug: brand.slug,
      },
      sitemapPaths,
    );
  }

  const finder = getTools(UNIVERSE).find(
    (tool) => tool.slug === "padel-racket-finder",
  );
  if (finder) {
    const eligibility = getLaunchEligibility(
      { kind: "tool", entity: finder },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: getToolHref(finder),
        page_type: "finder",
        entity_id: finder.id,
        entity_slug: finder.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
      },
      sitemapPaths,
    );
  } else {
    addInventory(
      byPath,
      {
        path: "/tools/padel-racket-finder",
        page_type: "finder",
        entity_id: "tool-padel-racket-finder",
        entity_slug: "padel-racket-finder",
        launch_disposition: "HIDDEN_404",
        notes: "finder entity missing from repository universe",
      },
      sitemapPaths,
    );
  }

  for (const story of PADEL_RESEARCH_STORIES) {
    const data = getPadelResearchPageData(story.slug);
    const disposition: Disposition =
      padelDispositionForStatic() === "INDEXABLE" && data?.published
        ? "INDEXABLE"
        : "PUBLIC_NOINDEX";
    addInventory(
      byPath,
      {
        path: story.path,
        page_type: "research",
        entity_id: story.slug,
        entity_slug: story.slug,
        launch_disposition: disposition,
        notes: data
          ? `${data.published ? "published" : "withheld"}|${data.readiness.reasons.join("|")}`
          : "research config missing",
      },
      sitemapPaths,
    );
  }

  for (const setup of getGearSetups(UNIVERSE).filter(
    (item) => item.sportId === SPORT_ID || item.slug.startsWith("padel-"),
  )) {
    const eligibility = getLaunchEligibility(
      { kind: "setup", entity: setup },
      PROD,
    );
    addInventory(
      byPath,
      {
        path: `/setups/${setup.slug}`,
        page_type: "setup",
        entity_id: setup.id,
        entity_slug: setup.slug,
        launch_disposition: eligibility.disposition,
        notes: reasonsOf(eligibility),
      },
      sitemapPaths,
    );
  }

  return {
    rows: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path)),
    products: universeProducts,
    padelBrandIds,
    sitemapPaths,
    productEligibility,
  };
}

function buildScorecard(
  universeProducts: Product[],
  inventory: InventoryRow[],
  productEligibility: Map<string, LaunchEligibility>,
): Record<string, unknown> {
  process.stderr.write("Phase A: computing padel catalog scorecard\n");
  const prodProducts = getProducts(PROD).filter((product) =>
    product.sportIds.includes(SPORT_ID),
  );
  const prodIds = new Set(prodProducts.map((product) => product.id));
  const categoryScorecard: Record<string, Record<string, string | number>> = {};

  for (const [key, categoryId] of Object.entries(CATEGORY_IDS)) {
    const products = universeProducts.filter(
      (product) => product.categoryId === categoryId,
    );
    categoryScorecard[key] = {
      categoryId,
      total: products.length,
      ready_published: products.filter((product) => prodIds.has(product.id)).length,
      indexable: products.filter((product) =>
        isIndexableEligibility(productEligibility.get(product.id)!),
      ).length,
      blocked_or_hidden: products.filter(
        (product) => !isIndexableEligibility(productEligibility.get(product.id)!),
      ).length,
      with_hero: products.filter((product) => Boolean(getPrimaryProductMedia(product)))
        .length,
      with_source: products.filter(
        (product) =>
          product.evidenceIds.length > 0 ||
          product.images.some((image) => Boolean(image.sourceUrl || image.source)),
      ).length,
      spec_complete_est: products.filter(specCompleteEstimate).length,
    };
  }

  const inventoryType = (pageType: PageType) =>
    inventory.filter((row) => row.page_type === pageType);
  const countIndexable = (pageType: PageType) =>
    inventoryType(pageType).filter(
      (row) => row.launch_disposition === "INDEXABLE",
    ).length;
  const indexableProducts = universeProducts.filter((product) =>
    isIndexableEligibility(productEligibility.get(product.id)!),
  );
  const pricedProducts = indexableProducts
    .map((product) => ({
      product,
      offer: getLowestOfferPrice(product.id, "NL", PROD),
    }))
    .filter(
      (
        item,
      ): item is {
        product: Product;
        offer: { price: number; currency: string; offerId?: string };
      } => Boolean(item.offer),
    );
  const researchStatus = Object.fromEntries(
    PADEL_RESEARCH_STORIES.map((story) => {
      const data = getPadelResearchPageData(story.slug);
      return [
        story.slug.replace("padel-racket-", "").replace("-2026", ""),
        data?.published ? "published" : data ? "withheld" : "missing",
      ];
    }),
  );

  return {
    asOf: AS_OF,
    sportId: SPORT_ID,
    categories: categoryScorecard,
    brands: {
      total_padel_brand_entities: inventoryType("brand").length,
      indexable: countIndexable("brand"),
    },
    editorial: {
      reviews: {
        total: inventoryType("review").length,
        indexable: countIndexable("review"),
        blocked:
          inventoryType("review").length - countIndexable("review"),
      },
      bestGuides: {
        total: inventoryType("best-guide").length,
        indexable: countIndexable("best-guide"),
      },
      buyingGuides: {
        total: inventoryType("buying-guide").length,
        indexable: countIndexable("buying-guide"),
      },
      comparisons: {
        total: inventoryType("comparison").length,
        indexable: countIndexable("comparison"),
      },
      alternatives_indexable: countIndexable("alternatives"),
      research: {
        shapes: researchStatus.shapes ?? "missing",
        weight: researchStatus.weight ?? "missing",
        prices: researchStatus.prices ?? "missing",
        market: researchStatus.market ?? "missing",
      },
    },
    commerce_nl: {
      products_with_from_price: pricedProducts.length,
      products_indexable: indexableProducts.length,
      sample: pricedProducts.slice(0, 12).map(({ product, offer }) => ({
        productId: product.id,
        slug: product.slug,
        price: offer.price,
        currency: offer.currency,
        offerId: offer.offerId ?? null,
      })),
    },
    diagnostic: {
      production_visible_products: prodProducts.length,
      launch_ready_quality_products: prodProducts.filter(
        (product) => assessProductLaunchQuality(product, PROD).quality === "LAUNCH_READY",
      ).length,
    },
  };
}

function selectCanaries(rows: InventoryRow[]): Set<string> {
  const selected = new Set<string>([
    "/padel",
    "/padel/rackets",
    "/padel/shoes",
    "/tools/padel-racket-finder",
    "/padel/rackets/database",
  ]);
  const byType = (type: PageType) => rows.filter((row) => row.page_type === type);
  const productRows = byType("product");
  for (const brand of ["bullpadel", "nox", "adidas"]) {
    const row =
      productRows.find(
        (item) =>
          item.launch_disposition === "INDEXABLE" &&
          item.brand_slug?.includes(brand),
      ) ?? productRows.find((item) => item.brand_slug?.includes(brand));
    if (row) selected.add(row.path);
  }
  for (const [type, count] of [
    ["review", 3],
    ["best-guide", 3],
    ["comparison", 3],
    ["alternatives", 3],
  ] as const) {
    const candidates = byType(type).sort(
      (a, b) =>
        Number(b.launch_disposition === "INDEXABLE") -
          Number(a.launch_disposition === "INDEXABLE") ||
        a.path.localeCompare(b.path),
    );
    candidates.slice(0, count).forEach((row) => selected.add(row.path));
  }
  for (const type of ["brand", "buying-guide", "research"] as const) {
    const row =
      byType(type).find((item) => item.launch_disposition === "INDEXABLE") ??
      byType(type)[0];
    if (row) selected.add(row.path);
  }
  return selected;
}

async function fetchHtml(
  base: string,
  path: string,
): Promise<{ status: number; html: string; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${base}${path}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "kitletics-padel-prelaunch-audit/1.0",
        "accept-language": "nl-NL,nl;q=0.9,en;q=0.8",
      },
    });
    return { status: response.status, html: await response.text(), error: "" };
  } catch (error) {
    return {
      status: 0,
      html: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const output = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await fn(items[index]!, index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return output;
}

function addIssue(
  issues: Issue[],
  row: InventoryRow,
  severity: Severity,
  issueClass: string,
  issueSubclass: string,
  renderedExcerpt: string,
  rootCause: string,
  imagePath = "",
): void {
  issues.push({
    issue_id: "PADEL-PENDING",
    severity,
    url: `${CRAWL_BASE ?? DEFAULT_CRAWL_BASE}${row.path}`,
    path: row.path,
    page_type: row.page_type,
    issue_class: issueClass,
    issue_subclass: issueSubclass,
    rendered_excerpt: excerpt(renderedExcerpt),
    image_path: imagePath,
    root_cause: rootCause,
    status: "OPEN",
  });
}

function wrongSportImage(src: string): string | null {
  const lower = src.toLowerCase();
  if (lower.includes("guide-running-shoes.jpg")) return "guide_running_shoes";
  if (lower.includes("guide-tennis.jpg")) return "guide_tennis";
  if (lower.includes("/images/running/")) return "running_image_path";
  if (lower.includes("urban-dusk")) return "urban_dusk";
  if (lower.includes("/tennis/") || lower.includes("tennis-")) return "tennis_image_path";
  return null;
}

function wrongProductPrimary(row: InventoryRow, src: string): boolean {
  if (!["product", "review"].includes(row.page_type) || !row.product_slug) return false;
  const match = src.match(/\/products\/([^/]+)/i);
  if (!match) return false;
  const actual = match[1]!.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const expected = row.product_slug.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return (
    actual.length >= 6 &&
    expected.length >= 6 &&
    !actual.includes(expected.slice(0, 8)) &&
    !expected.includes(actual.slice(0, 8))
  );
}

function wrongBrandPrimary(
  row: InventoryRow,
  src: string,
  knownBrands: string[],
): string | null {
  if (!["product", "review"].includes(row.page_type) || !row.brand_slug) return null;
  const lower = src.toLowerCase();
  const expectedTokens = row.brand_slug.split("-").filter((token) => token.length >= 3);
  const other = knownBrands.find((brand) => {
    if (brand === row.brand_slug || brand.length < 3) return false;
    const tokens = brand.split("-").filter((token) => token.length >= 3);
    return tokens.some((token) =>
      new RegExp(`(?:/|-)${token}(?:/|-)`, "i").test(lower),
    );
  });
  if (!other) return null;
  if (
    expectedTokens.some((token) =>
      new RegExp(`(?:/|-)${token}(?:/|-)`, "i").test(lower),
    )
  ) {
    return null;
  }
  return other;
}

async function crawl(
  inventory: InventoryRow[],
  knownBrandSlugs: string[],
  reviewProductNames: Map<string, { productSlug: string; productName: string }>,
): Promise<{ rows: CrawlRow[]; issues: Issue[]; canaryNotes: string[] }> {
  if (!CRAWL_BASE) return { rows: [], issues: [], canaryNotes: [] };
  const canaries = selectCanaries(inventory);
  const targets = inventory.filter(
    (row) =>
      row.launch_disposition === "INDEXABLE" ||
      row.launch_disposition === "PUBLIC_NOINDEX" ||
      canaries.has(row.path),
  );
  process.stderr.write(
    `Phase B: crawling ${targets.length} padel URLs at ${CRAWL_BASE}\n`,
  );
  const issues: Issue[] = [];
  let done = 0;
  const rows = await mapPool(targets, CONCURRENCY, async (row) => {
    let fetched = await fetchHtml(CRAWL_BASE, row.path);
    if (fetched.status === 0) fetched = await fetchHtml(CRAWL_BASE, row.path);
    const html = fetched.html;
    const text = visibleText(html);
    const title = titleOf(html);
    const canonical = canonicalOf(html);
    const noindex = hasNoindex(html);
    const schemaTypes = jsonLdTypes(html);
    const images = extractImageSrcs(html);
    const primaryImages = primaryImageSrcs(html, images);
    const tokenHits = [
      ...detectNames(text, TOKEN_RES),
      ...inspectPublicContentCorruption(text),
    ].filter((value, index, all) => all.indexOf(value) === index);
    const machineHits = detectNames(text, MACHINE_RES);
    const decisions = extractDecisionLines(text);
    const machineDecisions = decisions.filter(
      (line) => classifyDecisionLine(line) === "MACHINE_LIKE",
    );
    const brokenDecisions = decisions.filter(
      (line) => classifyDecisionLine(line) === "BROKEN",
    );
    const rawSchemaKey = isRawPublicSpecKey(text);
    const fakeTesting =
      /\b(?:I|we) (?:hit|tested|played|lab-tested)\b|hours on court|smash speed measured/i.test(
        text,
      ) &&
      /expert research|research review|how we assessed|methodology|evidence-led/i.test(
        text,
      );
    const fakeRatings =
      /\buser rating\b|★★★★|\bcommunity score\b/i.test(text) ||
      (/\bpopularity rank\b/i.test(text) &&
        !/\bnot a (?:fake )?popularity rank\b/i.test(text));
    const imageFailures: string[] = [];

    if (row.launch_disposition === "INDEXABLE" && fetched.status !== 200) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "HTTP",
        "EXPECTED_INDEXABLE_NON_200",
        fetched.error || `HTTP ${fetched.status}`,
        "Expected-indexable URL did not return HTTP 200",
      );
    }
    if (row.launch_disposition === "INDEXABLE" && noindex) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "SEO",
        "INDEXABLE_NOINDEX",
        title,
        "Expected-indexable page rendered a noindex robots directive",
      );
    }
    if (fetched.status === 200 && !title) {
      addIssue(issues, row, "HIGH", "SEO", "MISSING_TITLE", text, "HTML title is missing");
    }
    if (fetched.status === 200 && !canonical) {
      addIssue(
        issues,
        row,
        "HIGH",
        "SEO",
        "MISSING_CANONICAL",
        title,
        "Canonical link is missing",
      );
    }
    const expectedSchemas = pageExpectedSchema(row.page_type);
    if (
      fetched.status === 200 &&
      expectedSchemas.length &&
      !expectedSchemas.some((type) => schemaTypes.includes(type))
    ) {
      addIssue(
        issues,
        row,
        "HIGH",
        "SEO",
        "MISSING_EXPECTED_JSONLD",
        title,
        `Expected one of ${expectedSchemas.join("|")} JSON-LD types`,
      );
    }
    if (tokenHits.length) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "TOKEN_LEAK",
        tokenHits.join("|"),
        text,
        "Visible HTML contains internal or corruption tokens",
      );
    }
    if (machineDecisions.length) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "DECISION_COPY",
        "MACHINE_LIKE",
        machineDecisions[0]!,
        "Rendered decision line classified MACHINE_LIKE",
      );
    }
    if (brokenDecisions.length) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "DECISION_COPY",
        "BROKEN",
        brokenDecisions[0]!,
        "Rendered decision line classified BROKEN",
      );
    }
    if (machineHits.length && !machineDecisions.length && !brokenDecisions.length) {
      addIssue(
        issues,
        row,
        "HIGH",
        "MACHINE_COPY",
        machineHits.join("|"),
        text,
        "Visible body copy matches known machine-like templates",
      );
    }
    if (rawSchemaKey) {
      addIssue(
        issues,
        row,
        "HIGH",
        "RAW_SCHEMA_KEY",
        "raw_public_spec_key",
        text,
        "Raw catalog/schema key is visible to users",
      );
    }
    if (fakeTesting) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "FAKE_TESTING",
        "FIRST_HAND_CLAIM_ON_RESEARCH_PAGE",
        text.match(
          /.{0,80}(?:\b(?:I|we) (?:hit|tested|played|lab-tested)\b|hours on court|smash speed measured).{0,120}/i,
        )?.[0] ?? text,
        "First-hand testing language appears alongside expert-research framing",
      );
    }
    if (fakeRatings) {
      addIssue(
        issues,
        row,
        "BLOCKER",
        "FAKE_RATINGS",
        "UNVERIFIED_RATING_SIGNAL",
        text,
        "Rendered page contains prohibited user/community/popularity rating signal",
      );
    }

    if (row.page_type === "review" && fetched.status === 200) {
      const expected = reviewProductNames.get(row.entity_slug);
      if (expected) {
        const titleHay = `${title} ${text.slice(0, 400)}`.toLowerCase();
        const nameTokens = expected.productName
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((t) => t.length >= 4 && !["padel", "adidas", "review"].includes(t));
        const hit = nameTokens.some((t) => titleHay.includes(t));
        const slugStem = expected.productSlug
          .replace(/^adidas-/, "")
          .replace(/-padel$/, "")
          .split("-")
          .filter((t) => t.length >= 4);
        const slugHit = slugStem.some((t) => title.toLowerCase().includes(t));
        if (!hit && !slugHit) {
          addIssue(
            issues,
            row,
            "BLOCKER",
            "IDENTITY_MISMATCH",
            "REVIEW_TITLE_PRODUCT",
            title,
            `Review title/body does not name expected product ${expected.productName} (${expected.productSlug})`,
          );
        }
      }
    }
    if (
      fetched.status === 200 &&
      ["review", "best-guide", "buying-guide"].includes(row.page_type) &&
      text.length < 800
    ) {
      addIssue(
        issues,
        row,
        "HIGH",
        "THIN_CONTENT",
        "EDITORIAL_UNDER_800_CHARS",
        text,
        `Visible editorial text is only ${text.length} characters`,
      );
    }

    for (const image of images) {
      const wrongSport = wrongSportImage(image);
      if (!wrongSport) continue;
      // Multi-sport brand hubs legitimately list tennis/running products and
      // may reuse category guide art. Only treat FlipBelt filler as a defect.
      if (
        row.page_type === "brand" &&
        wrongSport !== "guide_tennis" &&
        !/flipbelt/i.test(image)
      ) {
        continue;
      }
      imageFailures.push(`WRONG_SPORT:${wrongSport}:${image}`);
      addIssue(
        issues,
        row,
        "BLOCKER",
        "IMAGE_WRONG_SPORT",
        wrongSport,
        title,
        "Padel page renders a tennis/running/filler image",
        image,
      );
    }
    for (const image of primaryImages) {
      if (wrongProductPrimary(row, image)) {
        imageFailures.push(`WRONG_PRODUCT:${image}`);
        addIssue(
          issues,
          row,
          "BLOCKER",
          "IMAGE_WRONG_PRODUCT",
          "PRIMARY_HERO_PRODUCT_MISMATCH",
          title,
          `Primary product image does not match ${row.product_slug}`,
          image,
        );
      }
      const wrongBrand = wrongBrandPrimary(row, image, knownBrandSlugs);
      if (wrongBrand) {
        imageFailures.push(`WRONG_BRAND:${wrongBrand}:${image}`);
        addIssue(
          issues,
          row,
          "BLOCKER",
          "IMAGE_WRONG_BRAND",
          wrongBrand,
          title,
          `Primary image path signals ${wrongBrand}, expected ${row.brand_slug}`,
          image,
        );
      }
    }

    const imageUnavailableCount = (
      text.match(/\bimage unavailable\b/gi) ?? []
    ).length;
    const placeholderCount = (
      text.match(/\bplaceholder image\b/gi) ?? []
    ).length;
    if (imageUnavailableCount > 0 || placeholderCount >= 2) {
      addIssue(
        issues,
        row,
        "HIGH",
        "A11Y",
        imageUnavailableCount > 0
          ? "IMAGE_UNAVAILABLE_TEXT"
          : "DUPLICATE_IMAGE_PLACEHOLDER",
        text,
        `Rendered page contains ${imageUnavailableCount} image-unavailable and ${placeholderCount} placeholder-image labels`,
      );
    }

    const commerceSignals: string[] = [];
    if (row.page_type === "product" && canaries.has(row.path)) {
      if (/\bEUR\b|€/.test(text)) commerceSignals.push("EUR");
      if (/\bFrom\b/i.test(text)) commerceSignals.push("FROM");
      if (/\b(?:USD|GBP)\b|[$£]\s?\d/.test(text)) {
        commerceSignals.push("NON_NL_CURRENCY");
        addIssue(
          issues,
          row,
          "MEDIUM",
          "COMMERCE",
          "NL_REGION_CURRENCY_LEAKAGE",
          text.match(/.{0,80}(?:USD|GBP|[$£]\s?\d).{0,100}/)?.[0] ?? text,
          "NL crawl contains a USD/GBP currency signal; verify region resolution",
        );
      }
      if (!/\bEUR\b|€/.test(text) && /\bFrom\b/i.test(text)) {
        addIssue(
          issues,
          row,
          "LOW",
          "COMMERCE",
          "FROM_WITHOUT_EUR_SIGNAL",
          text,
          "NL canary renders From copy without a visible EUR/€ signal",
        );
      }
    }

    done += 1;
    if (done % 25 === 0 || done === targets.length) {
      process.stderr.write(`  crawled ${done}/${targets.length}\n`);
    }
    return {
      url: `${CRAWL_BASE}${row.path}`,
      path: row.path,
      page_type: row.page_type,
      launch_disposition: row.launch_disposition,
      expected_indexable: row.launch_disposition === "INDEXABLE",
      is_canary: canaries.has(row.path),
      status: fetched.status || "ERR",
      error: fetched.error,
      title,
      canonical,
      has_noindex: noindex,
      text_len: text.length,
      jsonld_types: schemaTypes.join("|"),
      image_count: images.length,
      token_hits: tokenHits.join("|"),
      machine_hits: machineHits.join("|"),
      decision_machine: machineDecisions.length > 0,
      decision_broken: brokenDecisions.length > 0,
      raw_schema_key: rawSchemaKey,
      image_failures: imageFailures.join("|"),
      fake_testing: fakeTesting,
      fake_ratings: fakeRatings,
      commerce_signals: commerceSignals.join("|"),
      excerpt: excerpt(text, 300),
    } satisfies CrawlRow;
  });

  issues.sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.issue_class.localeCompare(b.issue_class) ||
      a.issue_subclass.localeCompare(b.issue_subclass),
  );
  issues.forEach((issue, index) => {
    issue.issue_id = `PADEL-${String(index + 1).padStart(5, "0")}`;
  });
  rows.sort((a, b) => a.path.localeCompare(b.path));
  const canaryNotes = rows
    .filter((row) => row.is_canary)
    .map(
      (row) =>
        `${row.path} [${row.status}; ${row.launch_disposition}] ${row.title || "(no title)"} — ${row.excerpt}`,
    );
  return { rows, issues, canaryNotes };
}

function countIssues(issues: Issue[], issueClass: string): number {
  return issues.filter((issue) => issue.issue_class === issueClass).length;
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const {
    rows: inventory,
    products,
    sitemapPaths,
    productEligibility,
  } = buildInventory();
  const scorecard = buildScorecard(products, inventory, productEligibility);
  writeCsv(
    INVENTORY_FILE,
    inventory as unknown as Array<Record<string, unknown>>,
    INVENTORY_COLUMNS,
  );
  writeJson(SCORECARD_FILE, scorecard);

  const knownBrandSlugs = getBrands(UNIVERSE).map((brand) => brand.slug);
  const reviewProductNames = new Map<
    string,
    { productSlug: string; productName: string }
  >();
  for (const review of getReviews(UNIVERSE)) {
    const product = products.find((p) => p.id === review.productId);
    if (!product) continue;
    reviewProductNames.set(review.slug, {
      productSlug: product.slug,
      productName: product.fullName || product.name,
    });
  }
  const crawlResult = await crawl(inventory, knownBrandSlugs, reviewProductNames);
  writeCsv(
    CRAWL_FILE,
    crawlResult.rows as unknown as Array<Record<string, unknown>>,
    CRAWL_COLUMNS,
  );

  const brokenIndexableUrls = new Set(
    crawlResult.issues
      .filter(
        (issue) =>
          issue.issue_class === "HTTP" &&
          issue.issue_subclass === "EXPECTED_INDEXABLE_NON_200",
      )
      .map((issue) => issue.path),
  ).size;

  const inventoryPaths = new Set(inventory.map((row) => row.path));
  const padelSitemapPaths = [...sitemapPaths].filter(
    (path) =>
      path === "/padel" ||
      path.startsWith("/padel/") ||
      (path.startsWith("/products/") &&
        inventory.some((row) => row.path === path)) ||
      (path.startsWith("/reviews/") &&
        inventory.some((row) => row.path === path)) ||
      (path.startsWith("/best/padel") &&
        inventory.some((row) => row.path === path)) ||
      path.startsWith("/tools/padel") ||
      path.startsWith("/research/padel") ||
      path.startsWith("/setups/padel"),
  );
  const invalidSitemapUrls = padelSitemapPaths.filter(
    (path) => !inventoryPaths.has(path),
  );
  for (const path of invalidSitemapUrls) {
    crawlResult.issues.push({
      issue_id: "",
      severity: "BLOCKER",
      url: `${siteConfig.url}${path}`,
      path,
      page_type: "other",
      issue_class: "SEO",
      issue_subclass: "INVALID_SITEMAP_URL",
      rendered_excerpt: path,
      image_path: "",
      root_cause: "Padel sitemap path is not in regenerated URL inventory",
      status: "OPEN",
    });
  }
  // Re-number after sitemap append
  crawlResult.issues.sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.issue_class.localeCompare(b.issue_class) ||
      a.issue_subclass.localeCompare(b.issue_subclass),
  );
  crawlResult.issues.forEach((issue, index) => {
    issue.issue_id = `PADEL-${String(index + 1).padStart(5, "0")}`;
  });
  writeCsv(
    ISSUES_FILE,
    crawlResult.issues as unknown as Array<Record<string, unknown>>,
    ISSUE_COLUMNS,
  );

  const identityMismatch = countIssues(crawlResult.issues, "IDENTITY_MISMATCH");
  const blockerCount = crawlResult.issues.filter(
    (issue) => issue.severity === "BLOCKER",
  ).length;
  const highCount = crawlResult.issues.filter(
    (issue) => issue.severity === "HIGH",
  ).length;
  const requiredZeros = {
    BLOCKER: blockerCount,
    HIGH: highCount,
    token_leakage: countIssues(crawlResult.issues, "TOKEN_LEAK"),
    raw_schema_leakage: countIssues(crawlResult.issues, "RAW_SCHEMA_KEY"),
    machine_copy:
      countIssues(crawlResult.issues, "MACHINE_COPY") +
      crawlResult.issues.filter(
        (issue) =>
          issue.issue_class === "DECISION_COPY" &&
          issue.issue_subclass === "MACHINE_LIKE",
      ).length,
    broken_copy: crawlResult.issues.filter(
      (issue) =>
        issue.issue_class === "DECISION_COPY" &&
        issue.issue_subclass === "BROKEN",
    ).length,
    WRONG_SPORT: countIssues(crawlResult.issues, "IMAGE_WRONG_SPORT"),
    WRONG_PRODUCT: countIssues(crawlResult.issues, "IMAGE_WRONG_PRODUCT"),
    WRONG_BRAND: countIssues(crawlResult.issues, "IMAGE_WRONG_BRAND"),
    fake_testing: countIssues(crawlResult.issues, "FAKE_TESTING"),
    fake_ratings: countIssues(crawlResult.issues, "FAKE_RATINGS"),
    broken_indexable_URL: brokenIndexableUrls,
    invalid_sitemap_URL: invalidSitemapUrls.length,
    review_product_identity_mismatch: identityMismatch,
    a11y_serious: Number(process.env.A11Y_SERIOUS ?? "0"),
    a11y_critical: Number(process.env.A11Y_CRITICAL ?? "0"),
    test_failures: Number(process.env.TEST_FAILURES ?? "0"),
  };
  const requiredZeroPass =
    Boolean(CRAWL_BASE) &&
    Object.values(requiredZeros).every((value) => value === 0);

  const summary = {
    asOf: AS_OF,
    generatedAt: new Date().toISOString(),
    auditMode: ZERO_DEBT_MODE ? "zero-debt" : FINAL_MODE ? "final" : "prelaunch",
    siteConfigUrl: siteConfig.url,
    crawlBase: CRAWL_BASE,
    crawl_default: DEFAULT_CRAWL_BASE,
    crawl_skipped: !CRAWL_BASE,
    crawl_skip_note: CRAWL_BASE
      ? null
      : "CRAWL_BASE was unset; Phase A completed and empty crawl/issues evidence was written.",
    inventory_count: inventory.length,
    inventory_indexable: inventory.filter(
      (row) => row.launch_disposition === "INDEXABLE",
    ).length,
    inventory_public_noindex: inventory.filter(
      (row) => row.launch_disposition === "PUBLIC_NOINDEX",
    ).length,
    inventory_hidden_404: inventory.filter(
      (row) => row.launch_disposition === "HIDDEN_404",
    ).length,
    inventory_in_sitemap: inventory.filter((row) => sitemapPaths.has(row.path))
      .length,
    inventory_includes_collections: inventory.some(
      (row) => row.path === "/padel/collections",
    ),
    crawled_count: crawlResult.rows.length,
    issue_count: crawlResult.issues.length,
    blocker_count: blockerCount,
    high_count: highCount,
    token_leak: requiredZeros.token_leakage,
    machine_like: requiredZeros.machine_copy,
    broken_decision: requiredZeros.broken_copy,
    wrong_sport_images: requiredZeros.WRONG_SPORT,
    wrong_product_images: requiredZeros.WRONG_PRODUCT,
    wrong_brand_images: requiredZeros.WRONG_BRAND,
    raw_schema_keys: requiredZeros.raw_schema_leakage,
    fake_testing: requiredZeros.fake_testing,
    fake_ratings: requiredZeros.fake_ratings,
    broken_indexable_urls: brokenIndexableUrls,
    invalid_sitemap_urls: invalidSitemapUrls,
    identity_mismatch: identityMismatch,
    required_zeros: requiredZeros,
    required_zero_pass: CRAWL_BASE ? requiredZeroPass : null,
    verdict: !CRAWL_BASE
      ? "INCOMPLETE"
      : requiredZeroPass
        ? "GO"
        : "NO-GO",
    canary_notes: crawlResult.canaryNotes,
    catalog: scorecard,
  };
  writeJson(SUMMARY_FILE, summary);
  if (ZERO_DEBT_MODE) {
    writeJson(SCORECARD_FILE, {
      asOf: AS_OF,
      generatedAt: summary.generatedAt,
      verdict: summary.verdict,
      required_zeros: requiredZeros,
      required_zero_pass: requiredZeroPass,
      inventory: {
        total: summary.inventory_count,
        indexable: summary.inventory_indexable,
        public_noindex: summary.inventory_public_noindex,
        hidden_404: summary.inventory_hidden_404,
        includes_collections: summary.inventory_includes_collections,
      },
      crawled_count: summary.crawled_count,
      issue_count: summary.issue_count,
      blocker_count: blockerCount,
      high_count: highCount,
      catalog: scorecard,
      ci: {
        lint: process.env.CI_LINT ?? "unknown",
        typecheck: process.env.CI_TYPECHECK ?? "unknown",
        test: process.env.CI_TEST ?? "unknown",
        build: process.env.CI_BUILD ?? "unknown",
        test_failures: requiredZeros.test_failures,
      },
      a11y: {
        serious: requiredZeros.a11y_serious,
        critical: requiredZeros.a11y_critical,
        source: process.env.A11Y_SOURCE ?? "env",
      },
    });
  }

  const result = {
    script: "scripts/tmp/padel-prelaunch-audit.ts",
    auditMode: ZERO_DEBT_MODE ? "zero-debt" : FINAL_MODE ? "final" : "prelaunch",
    verdict: summary.verdict,
    outputs: [
      `docs/padel/data/${INVENTORY_FILE}`,
      `docs/padel/data/${ISSUES_FILE}`,
      `docs/padel/data/${SCORECARD_FILE}`,
      `docs/padel/data/${CRAWL_FILE}`,
      `docs/padel/data/${SUMMARY_FILE}`,
    ],
    inventory: summary.inventory_count,
    indexable: summary.inventory_indexable,
    publicNoindex: summary.inventory_public_noindex,
    hidden404: summary.inventory_hidden_404,
    crawled: summary.crawled_count,
    issues: summary.issue_count,
    blockers: summary.blocker_count,
    high: summary.high_count,
    requiredZeros,
    crawlSkipped: summary.crawl_skipped,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(
    `Padel prelaunch audit failed: ${
      error instanceof Error ? error.stack ?? error.message : String(error)
    }\n`,
  );
  process.exitCode = 1;
});
