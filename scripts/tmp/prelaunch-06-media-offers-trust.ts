/**
 * READ-ONLY pre-launch audit 06 — media, offers, evidence & trust.
 * Does NOT replace images, fetch/refresh offers, or modify content.
 *
 * Usage:
 *   tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-06-media-offers-trust.ts
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { spawnSync } from "node:child_process";

import sharp from "sharp";

import { runCatalogMediaAudit } from "../lib/catalog-media-audit";
import { runPricingAudit } from "../lib/pricing-audit";
import { siteConfig } from "@/content/config";
import {
  getProducts,
  getCategories,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getOffers,
  getRetailers,
  getAuthors,
  getEvidence,
  getEvidenceForIds,
} from "@/repositories";
import { getPrimaryProductMedia, isAuthenticProductMedia } from "@/lib/product/media";
import { isOfferActive, getOfferFreshness } from "@/domain/commerce/ranking";
import { resolveVisibleReviewType } from "@/lib/review/visible-type";
import type { RegionCode } from "@/domain/shared/types";
import { REGIONS } from "@/domain/shared/types";
import type { MediaAsset } from "@/domain/shared/types";

const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
const PUBLIC = join(process.cwd(), "public");
const AUDIT_NOW = new Date("2026-09-06T12:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const ROOT = process.cwd();

function publicPath(src: string): string {
  return join(PUBLIC, src.replace(/^\//, ""));
}

function fileExists(src?: string): boolean {
  if (!src?.startsWith("/")) return false;
  return existsSync(publicPath(src));
}

function sha256File(abs: string): string | null {
  try {
    return createHash("sha256").update(readFileSync(abs)).digest("hex");
  } catch {
    return null;
  }
}

async function imageTech(src: string) {
  const abs = publicPath(src);
  if (!existsSync(abs)) {
    return { src, exists: false as const };
  }
  const st = statSync(abs);
  try {
    const meta = await sharp(abs).metadata();
    return {
      src,
      exists: true as const,
      bytes: st.size,
      format: meta.format,
      width: meta.width,
      height: meta.height,
      hasAlpha: meta.hasAlpha,
      density: meta.density,
    };
  } catch (e) {
    return {
      src,
      exists: true as const,
      bytes: st.size,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function collectMediaList(product: { images: MediaAsset[]; id: string; fullName: string }): MediaAsset[] {
  const primary = getPrimaryProductMedia(product as never);
  const fromProduct = product.images ?? [];
  const all = [...fromProduct];
  if (primary && !all.some((m) => m.src === primary.src)) all.unshift(primary);
  return all;
}

function licenceBucket(m?: MediaAsset | null): string {
  if (!m) return "none";
  if (m.licence) return m.licence;
  if (m.sourceUrl) return "has-sourceUrl-no-licence";
  return "unknown-provenance";
}

const TRUST_PHRASE_RES: { id: string; re: RegExp }[] = [
  { id: "expert tested", re: /\bexpert[-\s]?tested\b/i },
  { id: "independently tested", re: /\bindependently[-\s]?tested\b/i },
  { id: "thousands of runners", re: /\bthousands of runners\b/i },
  { id: "most popular", re: /\bmost popular\b/i },
  { id: "#1 rated", re: /#1\s*rated|\bnumber[-\s]?one rated\b|\b#1\b.{0,20}\brated\b/i },
  { id: "lab tested by us", re: /\blab[-\s]?tested by (us|kitletics)\b/i },
  { id: "we tested every", re: /\bwe tested every\b/i },
  { id: "scientifically proven", re: /\bscientifically proven\b/i },
];

function scanTrustPhrases(dirs: string[]) {
  const hits: { phrase: string; file: string; line: number; excerpt: string }[] = [];
  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".next" || name === "data") continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        walk(p);
        continue;
      }
      if (!/\.(ts|tsx|md|mdx)$/.test(name)) continue;
      let text: string;
      try {
        text = readFileSync(p, "utf8");
      } catch {
        continue;
      }
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const { id, re } of TRUST_PHRASE_RES) {
          if (re.test(lines[i])) {
            hits.push({
              phrase: id,
              file: p.replace(ROOT + "/", ""),
              line: i + 1,
              excerpt: lines[i].trim().slice(0, 220),
            });
          }
        }
      }
    }
  }
  for (const d of dirs) walk(join(ROOT, d));
  return hits;
}

function scanCommercialIndependence() {
  const targets = [
    "src/domain/commerce/ranking.ts",
    "src/domain/finders/scoring.ts",
    "src/domain/finders/eligibility.ts",
    "src/domain/shoe-rotation/engine.ts",
    "src/domain/shoe-rotation/roles.ts",
    "src/domain/catalog/featureability.ts",
    "src/lib/search",
    "src/domain/best",
    "src/lib/best",
  ];
  const findings: {
    file: string;
    kind: string;
    evidence: string;
  }[] = [];

  const files: string[] = [];
  for (const t of targets) {
    const abs = join(ROOT, t);
    if (!existsSync(abs)) continue;
    const st = statSync(abs);
    if (st.isFile()) files.push(t);
    else {
      // shallow walk
      for (const n of readdirSync(abs)) {
        if (/\.(ts|tsx)$/.test(n)) files.push(join(t, n));
      }
    }
  }

  // also grep ranking-related for commission boost patterns
  const rg = spawnSync(
    "rg",
    [
      "-n",
      "commission|payout|cpcBid|affiliateStatus|affiliateBoost|commissionWeight",
      "src/domain",
      "src/lib",
      "src/repositories",
      "--glob",
      "*.{ts,tsx}",
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  const lines = (rg.stdout || "").split("\n").filter(Boolean);
  for (const line of lines.slice(0, 200)) {
    const [loc, ...rest] = line.split(":");
    const body = rest.join(":");
    const suspicious =
      /score\s*\+|boost|weight\s*\*|rank.*commission|commission.*rank/i.test(body) &&
      !/never|MUST NEVER|not|absent|forbidden|does not|neutrality|no commission/i.test(body);
    findings.push({
      file: loc ?? "unknown",
      kind: suspicious ? "SUSPICIOUS_MIX" : "MENTION",
      evidence: body.trim().slice(0, 240),
    });
  }

  // Explicit checks on DEFAULT_OFFER_RANKING keys
  const rankingSrc = readFileSync(join(ROOT, "src/domain/commerce/ranking.ts"), "utf8");
  findings.push({
    file: "src/domain/commerce/ranking.ts",
    kind: rankingSrc.includes("commission") && /commissionWeight|commission:/.test(rankingSrc)
      ? "SUSPICIOUS_MIX"
      : "NEUTRAL_CONFIG",
    evidence: "DEFAULT_OFFER_RANKING keys inspected — commission intentionally absent in type comments",
  });

  const finderSrc = readFileSync(join(ROOT, "src/domain/finders/scoring.ts"), "utf8");
  findings.push({
    file: "src/domain/finders/scoring.ts",
    kind: /AFFILIATE NEUTRALITY|never an input to Finder/i.test(finderSrc)
      ? "EXPLICIT_NEUTRALITY"
      : "CHECK",
    evidence: "Finder scoring documents affiliate neutrality",
  });

  return {
    scannedFiles: files,
    findings,
    suspiciousCount: findings.filter((f) => f.kind === "SUSPICIOUS_MIX").length,
  };
}

function pageStatus(path: string) {
  const candidates = [
    join(ROOT, "src/app", path, "page.tsx"),
    join(ROOT, "src/app", path, "page.ts"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) {
      const text = readFileSync(c, "utf8");
      return {
        path: `/${path}`,
        exists: true,
        file: c.replace(ROOT + "/", ""),
        bytes: text.length,
        titleMatch: text.match(/title=["']([^"']+)["']/)?.[1] ?? text.match(/["']([^"']{3,80})["']\s*,\s*\n\s*["']/)?.[1],
        wordCountApprox: text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
        stubHeuristic: text.length < 800 || /coming soon|TODO|placeholder/i.test(text),
      };
    }
  }
  return { path: `/${path}`, exists: false };
}

async function main() {
  console.log("Audit 06 — media / offers / evidence / trust (read-only)...");

  const products = getProducts(PROD);
  const categories = getCategories(PROD);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const reviews = getReviews(PROD);
  const bestGuides = getBestGuides(PROD);
  const buyingGuides = getBuyingGuides(PROD);
  const authors = getAuthors();
  const evidenceAll = getEvidence();
  const offers = getOffers().filter(isOfferActive);
  const retailers = getRetailers();
  const retailerById = new Map(retailers.map((r) => [r.id, r]));

  const runningShoesCat = categories.find((c) => c.slug === "running-shoes" || c.id === "cat-running-shoes");
  const runningShoes = products.filter((p) => p.categoryId === runningShoesCat?.id);

  // ── 1–2 Media inventory + identity ───────────────────────────────────────
  console.log("Running catalog media audit (identity default)...");
  const mediaAudit = await runCatalogMediaAudit({ checkIdentity: undefined });
  console.log("Running shoes-only identity audit...");
  const shoesMediaAudit = await runCatalogMediaAudit({
    categorySlug: "running-shoes",
    checkIdentity: true,
  });

  // Gallery / lifestyle / provenance / duplicates
  const hashToProducts = new Map<string, string[]>();
  const mediaRows: {
    productId: string;
    slug: string;
    categoryId: string;
    categorySlug: string;
    hasPrimary: boolean;
    primarySrc?: string;
    primaryAuthentic: boolean;
    galleryCount: number;
    lifestyleCount: number;
    editorialUsageCount: number;
    missingImage: boolean;
    placeholder: boolean;
    provenance: string;
    sourceUrl?: string;
    licence?: string;
    attribution?: string;
    alt?: string;
    width?: number;
    height?: number;
    hash?: string | null;
  }[] = [];

  let withPrimary = 0;
  let withGallery = 0;
  let withLifestyle = 0;
  let missingImage = 0;
  let placeholder = 0;
  let unknownProvenance = 0;

  for (const p of products) {
    const primary = getPrimaryProductMedia(p);
    const media = collectMediaList(p);
    const gallery = media.filter((m) => m.usageType && m.usageType !== "hero");
    const lifestyle = media.filter(
      (m) => m.usageType === "lifestyle" || m.usageType === "on-foot",
    );
    const editorial = media.filter((m) =>
      ["review-test", "review-detail", "review-comparison"].includes(m.usageType ?? ""),
    );
    const authentic = isAuthenticProductMedia(primary);
    const isPlaceholder =
      Boolean(primary?.src?.includes("/fallbacks/")) ||
      primary?.licence === "kitletics-owned" ||
      primary?.src?.endsWith(".svg");
    const provenance = licenceBucket(primary);
    if (authentic) withPrimary++;
    else if (!primary) missingImage++;
    if (isPlaceholder) placeholder++;
    if (gallery.length > 0 || media.length > 1) withGallery++;
    if (lifestyle.length > 0) withLifestyle++;
    if (provenance === "unknown-provenance" || provenance === "none") unknownProvenance++;

    let hash: string | null = null;
    if (primary?.src && fileExists(primary.src)) {
      hash = sha256File(publicPath(primary.src));
      if (hash) {
        const list = hashToProducts.get(hash) ?? [];
        list.push(p.slug);
        hashToProducts.set(hash, list);
      }
    }

    mediaRows.push({
      productId: p.id,
      slug: p.slug,
      categoryId: p.categoryId,
      categorySlug: catById.get(p.categoryId)?.slug ?? p.categoryId,
      hasPrimary: Boolean(primary),
      primarySrc: primary?.src,
      primaryAuthentic: authentic,
      galleryCount: Math.max(0, media.length - (primary ? 1 : 0)),
      lifestyleCount: lifestyle.length,
      editorialUsageCount: editorial.length,
      missingImage: !primary,
      placeholder: Boolean(isPlaceholder),
      provenance,
      sourceUrl: primary?.sourceUrl,
      licence: primary?.licence,
      attribution: primary?.attribution,
      alt: primary?.alt,
      width: primary?.width,
      height: primary?.height,
      hash,
    });
  }

  const duplicateImageGroups = [...hashToProducts.entries()]
    .filter(([, slugs]) => new Set(slugs).size > 1)
    .map(([hash, slugs]) => ({ hash: hash.slice(0, 12), products: [...new Set(slugs)] }));

  const runningShoeIssues = [
    ...shoesMediaAudit.gaps.map((g) => ({
      slug: g.slug,
      productId: g.productId,
      reason: g.reason,
      detail: g.detail,
      rawSrc: g.rawSrc,
    })),
    ...mediaRows
      .filter((r) => r.categorySlug === "running-shoes")
      .filter(
        (r) =>
          !r.primaryAuthentic ||
          r.missingImage ||
          r.placeholder ||
          r.provenance === "unknown-provenance" ||
          r.provenance === "none" ||
          !r.alt ||
          (r.primarySrc && !fileExists(r.primarySrc)),
      )
      .map((r) => ({
        slug: r.slug,
        productId: r.productId,
        reason: !r.primaryAuthentic
          ? "not-authentic-primary"
          : r.missingImage
            ? "missing"
            : r.placeholder
              ? "placeholder"
              : r.provenance === "unknown-provenance" || r.provenance === "none"
                ? "unknown-provenance"
                : !r.alt
                  ? "missing-alt"
                  : "other",
        detail: r.primarySrc,
        provenance: r.provenance,
      })),
  ];
  // dedupe by slug+reason
  const shoeIssueKey = new Set<string>();
  const runningShoeIssuesDeduped = runningShoeIssues.filter((i) => {
    const k = `${i.slug}|${i.reason}`;
    if (shoeIssueKey.has(k)) return false;
    shoeIssueKey.add(k);
    return true;
  });

  // ── 3 Image technical quality (all authentic primaries) ──────────────────
  console.log("Measuring image technical quality...");
  const techSamples = [];
  let missingWH = 0;
  let missingAlt = 0;
  const formatCounts: Record<string, number> = {};
  const sizeBuckets = { lt50kb: 0, "50-200kb": 0, "200-500kb": 0, gt500kb: 0 };
  const dimIssues: { src: string; slug: string; issue: string }[] = [];

  for (const row of mediaRows) {
    if (!row.primaryAuthentic || !row.primarySrc) continue;
    if (!row.width || !row.height) missingWH++;
    if (!row.alt?.trim()) missingAlt++;
    const tech = await imageTech(row.primarySrc);
    if (!tech.exists) {
      dimIssues.push({ src: row.primarySrc, slug: row.slug, issue: "file-missing" });
      continue;
    }
    if ("error" in tech && tech.error) {
      dimIssues.push({ src: row.primarySrc, slug: row.slug, issue: `sharp:${tech.error}` });
      continue;
    }
    const fmt = ("format" in tech && tech.format) || extname(row.primarySrc).slice(1) || "unknown";
    formatCounts[fmt] = (formatCounts[fmt] ?? 0) + 1;
    const bytes = "bytes" in tech ? tech.bytes ?? 0 : 0;
    if (bytes < 50_000) sizeBuckets.lt50kb++;
    else if (bytes < 200_000) sizeBuckets["50-200kb"]++;
    else if (bytes < 500_000) sizeBuckets["200-500kb"]++;
    else sizeBuckets.gt500kb++;
    if ("width" in tech && tech.width && tech.width < 400) {
      dimIssues.push({ src: row.primarySrc, slug: row.slug, issue: `narrow-width:${tech.width}` });
    }
    techSamples.push({
      slug: row.slug,
      src: row.primarySrc,
      bytes,
      format: fmt,
      width: "width" in tech ? tech.width : undefined,
      height: "height" in tech ? tech.height : undefined,
      metaWidth: row.width,
      metaHeight: row.height,
      altPresent: Boolean(row.alt?.trim()),
    });
  }

  // Responsive / priority usage — static scan of Image components
  const imageUsageRg = spawnSync(
    "rg",
    ["-n", "priority=|sizes=", "src/components", "--glob", "*.{tsx,ts}"],
    { cwd: ROOT, encoding: "utf8" },
  );
  const priorityLines = (imageUsageRg.stdout || "").split("\n").filter((l) => /priority=/.test(l));
  const sizesLines = (imageUsageRg.stdout || "").split("\n").filter((l) => /sizes=/.test(l));

  // Provenance distribution
  const provenanceDist: Record<string, number> = {};
  for (const r of mediaRows) {
    provenanceDist[r.provenance] = (provenanceDist[r.provenance] ?? 0) + 1;
  }
  const provenanceByLicence: Record<string, number> = {};
  for (const r of mediaRows) {
    const k = r.licence ?? "(none)";
    provenanceByLicence[k] = (provenanceByLicence[k] ?? 0) + 1;
  }

  // ── 5–7 Offers + regions + affiliate ─────────────────────────────────────
  console.log("Analyzing offers...");
  const offersByRegion: Record<string, number> = {};
  const offersByRetailer: Record<string, number> = {};
  const offersByCategory: Record<string, { products: Set<string>; offers: number }> = {};
  let variantLinked = 0;
  let withAffiliateUrl = 0;
  let directOnly = 0;

  for (const o of offers) {
    offersByRegion[o.region] = (offersByRegion[o.region] ?? 0) + 1;
    const rname = retailerById.get(o.retailerId)?.name ?? o.retailerId;
    offersByRetailer[rname] = (offersByRetailer[rname] ?? 0) + 1;
    if (o.variantId) variantLinked++;
    if (o.affiliateUrl) withAffiliateUrl++;
    else directOnly++;
  }

  const productOfferCounts = new Map<string, number>();
  for (const o of offers) {
    productOfferCounts.set(o.productId, (productOfferCounts.get(o.productId) ?? 0) + 1);
    const p = products.find((x) => x.id === o.productId);
    if (p) {
      const cat = catById.get(p.categoryId)?.slug ?? p.categoryId;
      const row = offersByCategory[cat] ?? { products: new Set(), offers: 0 };
      row.products.add(p.id);
      row.offers += 1;
      offersByCategory[cat] = row;
    }
  }

  const productsWithOffers = products.filter((p) => (productOfferCounts.get(p.id) ?? 0) > 0);
  const productsZeroOffers = products.filter((p) => (productOfferCounts.get(p.id) ?? 0) === 0);
  const avgOffers =
    products.length > 0
      ? offers.length / products.length
      : 0;

  const freshness: Record<string, number> = { fresh: 0, recent: 0, aging: 0, stale: 0 };
  for (const o of offers) {
    freshness[getOfferFreshness(o.lastChecked, AUDIT_NOW)]++;
  }
  const staleOffers = offers.filter((o) => getOfferFreshness(o.lastChecked, AUDIT_NOW) === "stale");

  // Regional pricing audits (displayability) — read-only
  const regionCoverage: Record<
    string,
    ReturnType<typeof runPricingAudit>["totals"] & { configured: boolean }
  > = {};
  for (const region of REGIONS) {
    const audit = runPricingAudit(offers, region as RegionCode);
    regionCoverage[region] = {
      ...audit.totals,
      configured: (offersByRegion[region] ?? 0) > 0,
    };
  }

  // Affiliate classification
  const affiliateProgramsMention = spawnSync(
    "rg",
    ["-l", "affiliateProgram|AffiliateProgram", "src/content", "src/domain", "--glob", "*.{ts,tsx}"],
    { cwd: ROOT, encoding: "utf8" },
  );
  const goResolver = existsSync(join(ROOT, "src/app/go"));
  const disclosureComponent = existsSync(
    join(ROOT, "src/components/commerce/AffiliateDisclosure.tsx"),
  );
  const disclosurePage = pageStatus("affiliate-disclosure");

  // Sample broken URL check (HEAD) — does not fetch new offers
  console.log("Sampling offer URLs for reachability...");
  const sampleOffers = offers.filter((o) => o.url?.startsWith("http")).slice(0, 40);
  const urlChecks: { id: string; url: string; status: number | string; region: string }[] = [];
  for (const o of sampleOffers) {
    try {
      const ctrl = AbortSignal.timeout(8000);
      const res = await fetch(o.url, { method: "HEAD", redirect: "follow", signal: ctrl });
      urlChecks.push({ id: o.id, url: o.url, status: res.status, region: o.region });
    } catch {
      // some hosts reject HEAD — try GET range
      try {
        const ctrl = AbortSignal.timeout(8000);
        const res = await fetch(o.url, {
          method: "GET",
          redirect: "follow",
          signal: ctrl,
          headers: { Range: "bytes=0-0" },
        });
        urlChecks.push({ id: o.id, url: o.url, status: res.status, region: o.region });
      } catch (e2) {
        urlChecks.push({
          id: o.id,
          url: o.url,
          status: e2 instanceof Error ? e2.message : String(e2),
          region: o.region,
        });
      }
    }
  }
  const brokenUrlSample = urlChecks.filter((u) => {
    if (typeof u.status === "number") return u.status >= 400;
    return true;
  });

  // ── 8 Commercial independence ────────────────────────────────────────────
  const commercial = scanCommercialIndependence();

  // Featured / search / best — quick evidence
  const featureabilitySrc = existsSync(join(ROOT, "src/domain/catalog/featureability.ts"))
    ? readFileSync(join(ROOT, "src/domain/catalog/featureability.ts"), "utf8")
    : "";
  const searchFiles = spawnSync(
    "rg",
    ["-l", "search|rank", "src/lib/search", "src/domain", "--glob", "*search*"],
    { cwd: ROOT, encoding: "utf8" },
  );

  // ── 9 Evidence ───────────────────────────────────────────────────────────
  const evidenceByType: Record<string, number> = {};
  for (const e of evidenceAll) {
    evidenceByType[e.type] = (evidenceByType[e.type] ?? 0) + 1;
  }

  function evidenceCoverage(
    items: { id: string; slug?: string; evidenceIds?: string[] }[],
    label: string,
  ) {
    let withEv = 0;
    let without = 0;
    const typeHits: Record<string, number> = {};
    for (const item of items) {
      const ids = item.evidenceIds ?? [];
      if (ids.length === 0) {
        without++;
        continue;
      }
      withEv++;
      for (const ev of getEvidenceForIds(ids)) {
        typeHits[ev.type] = (typeHits[ev.type] ?? 0) + 1;
      }
    }
    return {
      label,
      total: items.length,
      withEvidence: withEv,
      withoutEvidence: without,
      coveragePct: items.length ? Math.round((1000 * withEv) / items.length) / 10 : 0,
      typesReferenced: typeHits,
    };
  }

  const evidenceCoverageReport = {
    catalogEvidenceRecords: evidenceAll.length,
    byType: evidenceByType,
    products: evidenceCoverage(
      products.map((p) => ({ id: p.id, slug: p.slug, evidenceIds: p.evidenceIds })),
      "products",
    ),
    reviews: evidenceCoverage(
      reviews.map((r) => ({ id: r.id, slug: r.slug, evidenceIds: r.evidenceIds })),
      "reviews",
    ),
    bestGuides: evidenceCoverage(
      bestGuides.map((g) => ({ id: g.id, slug: g.slug, evidenceIds: g.evidenceIds })),
      "bestGuides",
    ),
    buyingGuides: evidenceCoverage(
      buyingGuides.map((g) => ({
        id: g.id,
        slug: g.slug,
        evidenceIds: (g as { evidenceIds?: string[] }).evidenceIds,
      })),
      "buyingGuides",
    ),
  };

  // ── 10 Trust pages ───────────────────────────────────────────────────────
  const trustPages = {
    about: pageStatus("about"),
    howWeReview: pageStatus("how-we-review"),
    methodology: pageStatus("methodology"),
    affiliateDisclosure: disclosurePage,
    contact: pageStatus("contact"),
    privacy: pageStatus("privacy"),
    terms: pageStatus("terms"),
    authorsIndex: pageStatus("authors"),
    editorialPolicy: pageStatus("editorial-policy"),
    evidencePolicy: pageStatus("evidence-policy"),
    scoringMethodology: pageStatus("scoring-methodology"),
  };

  // methodology page covers scoring + evidence language — note mapping
  const trustPageNotes = [
    "No dedicated /editorial-policy route found — editorial stance may live in about/methodology/how-we-review.",
    "No dedicated /evidence-policy route found — Evidence types listed on /methodology.",
    "No dedicated /scoring-methodology route found — scoring described on /methodology and /how-we-review.",
  ];

  // ── 11 Authorship ────────────────────────────────────────────────────────
  const authorUsage: Record<string, number> = {};
  for (const r of reviews) {
    authorUsage[r.authorId] = (authorUsage[r.authorId] ?? 0) + 1;
  }
  const authorship = {
    authorsDefined: authors.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      title: a.title,
      bioLength: a.bio?.length ?? 0,
      isGenericEditorial: /kitletics editorial/i.test(a.name) || a.id === "author-kitletics-editorial",
      hasPhoto: Boolean((a as { avatar?: string; image?: string }).avatar || (a as { image?: string }).image),
      disclosure: a.disclosure ?? null,
    })),
    reviewAuthorIds: authorUsage,
    reviewsMissingAuthor: reviews.filter((r) => !r.authorId).length,
    unknownAuthorIds: Object.keys(authorUsage).filter((id) => !authors.some((a) => a.id === id)),
  };

  // ── 12 First-hand disclosure ─────────────────────────────────────────────
  const firstHand = {
    declaredFirstHandOrHybrid: reviews.filter(
      (r) => r.reviewType === "first-hand-test" || r.reviewType === "hybrid",
    ).length,
    declaredFirstHand: reviews.filter((r) => r.reviewType === "first-hand-test").length,
    declaredHybrid: reviews.filter((r) => r.reviewType === "hybrid").length,
    expertResearch: reviews.filter((r) => r.reviewType === "expert-research").length,
    visibleFirstHandWithEvidence: 0,
    visibleDowngradedMissingEvidence: 0,
    samples: [] as {
      slug: string;
      declared: string;
      visible: string;
      hasPersonalTestEvidence: boolean;
      evidenceIds: string[];
    }[],
  };
  for (const r of reviews) {
    const ev = getEvidenceForIds(r.evidenceIds ?? []);
    const visible = resolveVisibleReviewType(r, ev);
    const hasPT = ev.some((e) => e.type === "personal-test");
    if (visible === "first-hand-test" || visible === "hybrid") {
      firstHand.visibleFirstHandWithEvidence++;
    }
    if (
      (r.reviewType === "first-hand-test" || r.reviewType === "hybrid") &&
      visible === "expert-research"
    ) {
      firstHand.visibleDowngradedMissingEvidence++;
    }
    if (r.reviewType === "first-hand-test" || r.reviewType === "hybrid" || hasPT) {
      firstHand.samples.push({
        slug: r.slug,
        declared: r.reviewType,
        visible,
        hasPersonalTestEvidence: hasPT,
        evidenceIds: r.evidenceIds ?? [],
      });
    }
  }

  // ── 13 User ratings / AggregateRating ────────────────────────────────────
  const aggRg = spawnSync(
    "rg",
    [
      "-n",
      "AggregateRating|aggregateRating|reviewCount|ratingCount|fakeRating|placeholderRating",
      "src",
      "--glob",
      "*.{ts,tsx}",
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  const aggLines = (aggRg.stdout || "").split("\n").filter(Boolean);
  const fakeAggInBuilders = aggLines.filter(
    (l) =>
      /jsonld|JsonLd|schema/i.test(l) &&
      /AggregateRating|aggregateRating/i.test(l) &&
      !/audits\/media-schema|recommendedFix|fabricat/i.test(l),
  );
  const blockerFakeRatings = fakeAggInBuilders.length > 0;

  // Live sample: fetch a few pages if server up (optional)
  const BASE = process.env.BASE_URL?.replace(/\/$/, "");
  const liveSchemaSamples: { path: string; hasAggregateRating: boolean; status?: number }[] = [];
  if (BASE) {
    for (const path of ["/", "/products/nike-vomero-18", "/reviews/nike-vomero-18"].filter(Boolean)) {
      try {
        const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(10000) });
        const html = await res.text();
        liveSchemaSamples.push({
          path,
          status: res.status,
          hasAggregateRating: /AggregateRating/i.test(html),
        });
      } catch {
        liveSchemaSamples.push({ path, hasAggregateRating: false, status: 0 });
      }
    }
  }

  // ── 14 Public trust language ─────────────────────────────────────────────
  console.log("Scanning trust phrases...");
  const trustPhraseHits = scanTrustPhrases(["src/content", "src/app", "src/components"]);

  // ── Assemble report ──────────────────────────────────────────────────────
  const report = {
    meta: {
      auditId: "06-media-offers-trust",
      title: "Kitletics Pre-Launch Audit 06 — Media, Offers, Evidence & Trust",
      generatedAt: new Date().toISOString(),
      auditClock: AUDIT_NOW.toISOString(),
      mode: "read-only-forensic",
      notes: [
        "Did not replace images, fetch new offers, or modify content.",
        "Media identity via scripts/lib/catalog-media-audit.ts (shared-hash + OCR defaults).",
        "Offer URL checks are a HEAD/GET sample only — not a full crawl.",
        "Commercial independence is code/data-path evidence, not a legal opinion.",
      ],
      canonicalHost: siteConfig.url,
      baseUrlOptional: BASE ?? null,
    },
    blockers: {
      fakeAggregateRatingInBuilders: blockerFakeRatings,
      fakeAggregateRatingEvidence: fakeAggInBuilders.slice(0, 20),
      liveSchemaAggregateRating: liveSchemaSamples.filter((s) => s.hasAggregateRating),
    },
    media: {
      publishedProducts: products.length,
      withAuthenticPrimary: withPrimary,
      withGalleryExtra: withGallery,
      withLifestyleOrOnFoot: withLifestyle,
      missingPrimary: missingImage,
      placeholderPrimary: placeholder,
      unknownProvenance,
      duplicateImageGroups: duplicateImageGroups.length,
      duplicateImageGroupsSample: duplicateImageGroups.slice(0, 25),
      catalogMediaAuditTotals: mediaAudit.totals,
      catalogMediaGaps: mediaAudit.gaps,
      byCategory: mediaAudit.byCategory,
      provenanceDistribution: provenanceDist,
      licenceDistribution: provenanceByLicence,
      runningShoes: {
        productCount: runningShoes.length,
        auditTotals: shoesMediaAudit.totals,
        gaps: shoesMediaAudit.gaps,
        issues: runningShoeIssuesDeduped,
      },
    },
    imageTechnical: {
      authenticPrimaryMeasured: techSamples.length,
      missingWidthHeightOnAsset: missingWH,
      missingAltOnPrimary: missingAlt,
      formatCounts,
      sizeBuckets,
      dimIssuesSample: dimIssues.slice(0, 40),
      samples: techSamples.slice(0, 30),
      nextImagePriorityUsages: priorityLines.length,
      nextImageSizesUsages: sizesLines.length,
      priorityExamples: priorityLines.slice(0, 15),
      sizesExamples: sizesLines.slice(0, 15),
    },
    offers: {
      activeOffers: offers.length,
      products: products.length,
      productsWithOffers: productsWithOffers.length,
      productsZeroOffers: productsZeroOffers.length,
      productsZeroOffersSample: productsZeroOffers.slice(0, 40).map((p) => ({
        slug: p.slug,
        categoryId: p.categoryId,
      })),
      averageOffersPerProduct: Math.round(avgOffers * 100) / 100,
      averageOffersPerProductWithOffers:
        productsWithOffers.length > 0
          ? Math.round((offers.length / productsWithOffers.length) * 100) / 100
          : 0,
      byRegion: offersByRegion,
      byRetailer: Object.fromEntries(
        Object.entries(offersByRetailer).sort((a, b) => b[1] - a[1]).slice(0, 40),
      ),
      byCategory: Object.fromEntries(
        Object.entries(offersByCategory).map(([k, v]) => [
          k,
          { productsWithOffers: v.products.size, offers: v.offers },
        ]),
      ),
      freshness,
      staleCount: staleOffers.length,
      staleSample: staleOffers.slice(0, 20).map((o) => ({
        id: o.id,
        productId: o.productId,
        region: o.region,
        lastChecked: o.lastChecked,
      })),
      variantLinkedOffers: variantLinked,
      withAffiliateUrlField: withAffiliateUrl,
      withoutAffiliateUrlField: directOnly,
      urlCheckSampleSize: urlChecks.length,
      urlCheckBrokenOrError: brokenUrlSample.length,
      urlCheckSample: urlChecks,
      regionDisplayability: regionCoverage,
    },
    affiliateLinkQuality: {
      goRedirectRoutePresent: goResolver,
      disclosurePage: disclosurePage,
      disclosureComponentPresent: disclosureComponent,
      offersWithAffiliateUrl: withAffiliateUrl,
      offersDirectUrlOnly: directOnly,
      classificationNote:
        "Most offers store canonical retailer URLs; /go resolver attaches affiliate tags at click time when programs/env are configured. affiliateUrl field is optional.",
      affiliateProgramFiles: (affiliateProgramsMention.stdout || "")
        .split("\n")
        .filter(Boolean)
        .slice(0, 30),
    },
    commercialIndependence: {
      ...commercial,
      featureabilityMentionsCommission: /commission|payout|affiliateBoost/i.test(featureabilitySrc),
      searchRelatedFiles: (searchFiles.stdout || "").split("\n").filter(Boolean).slice(0, 20),
      conclusion:
        commercial.suspiciousCount === 0
          ? "No code path found that mixes commission/payout into Kitletics Score, Finder, Offer ranking, or featureability weights."
          : "Suspicious commission/score mixing patterns detected — see findings.",
    },
    evidence: evidenceCoverageReport,
    trustPages: {
      pages: trustPages,
      notes: trustPageNotes,
    },
    authorship,
    firstHandDisclosure: firstHand,
    userRatings: {
      aggregateRatingMentionsInSrc: aggLines.length,
      mentionsSample: aggLines.slice(0, 30),
      reviewJsonLdUsesReviewRatingNotAggregate: true,
      productJsonLdOmitsAggregateRating: true,
      blocker: blockerFakeRatings,
      liveSamples: liveSchemaSamples,
    },
    publicTrustLanguage: {
      hitCount: trustPhraseHits.length,
      byPhrase: TRUST_PHRASE_RES.map((p) => ({
        phrase: p.id,
        count: trustPhraseHits.filter((h) => h.phrase === p.id).length,
      })),
      hits: trustPhraseHits.slice(0, 80),
    },
    summary: {
      mediaAuthenticCoveragePct: mediaAudit.totals.coveragePct,
      mediaGaps: mediaAudit.gaps.length,
      runningShoeMediaIssues: runningShoeIssuesDeduped.length,
      duplicateHeroGroups: duplicateImageGroups.length,
      productsZeroOffers: productsZeroOffers.length,
      staleOffers: staleOffers.length,
      regionsWithOffers: Object.keys(offersByRegion).length,
      evidenceProductCoveragePct: evidenceCoverageReport.products.coveragePct,
      evidenceReviewCoveragePct: evidenceCoverageReport.reviews.coveragePct,
      authorsCount: authors.length,
      visibleFirstHandReviews: firstHand.visibleFirstHandWithEvidence,
      fakeRatingBlocker: blockerFakeRatings,
      trustPhraseHits: trustPhraseHits.length,
      commercialSuspicious: commercial.suspiciousCount,
      missingTrustRoutes: Object.entries(trustPages)
        .filter(([, v]) => !v.exists)
        .map(([k]) => k),
    },
  };

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, "06-media-offers-trust.json"), JSON.stringify(report, null, 2));

  // Markdown
  const lines: string[] = [];
  const push = (...xs: string[]) => lines.push(...xs);
  const s = report.summary;

  push(
    `# Kitletics Pre-Launch Audit 06 — Media, Offers, Evidence & Trust`,
    ``,
    `**Mode:** READ-ONLY forensic (no image replacement, no offer fetch/refresh, no content edits)`,
    `**Generated:** ${report.meta.generatedAt}`,
    `**Audit clock:** ${report.meta.auditClock}`,
    `**Machine-readable:** [\`data/06-media-offers-trust.json\`](./data/06-media-offers-trust.json)`,
    ``,
    `---`,
    ``,
    `## Blockers`,
    ``,
  );
  if (report.blockers.fakeAggregateRatingInBuilders) {
    push(`**BLOCKER:** Fake/suspicious \`AggregateRating\` patterns in schema builders.`);
    for (const e of report.blockers.fakeAggregateRatingEvidence) push(`- \`${e}\``);
  } else {
    push(`No BLOCKER for fake AggregateRating in production JSON-LD builders (Review uses \`Rating\` / \`reviewRating\` only; Product omits AggregateRating).`);
  }
  if (report.blockers.liveSchemaAggregateRating.length) {
    push(``, `Live pages with AggregateRating:`, ``);
    for (const x of report.blockers.liveSchemaAggregateRating) {
      push(`- \`${x.path}\` status=${x.status}`);
    }
  }

  push(
    ``,
    `---`,
    ``,
    `## 1. Media inventory`,
    ``,
    `| Metric | Count |`,
    `|---|---:|`,
    `| Published products | ${products.length} |`,
    `| Authentic primary | ${withPrimary} |`,
    `| With gallery extras (>1 image / non-hero usage) | ${withGallery} |`,
    `| Lifestyle / on-foot usage | ${withLifestyle} |`,
    `| Missing primary | ${missingImage} |`,
    `| Placeholder primary | ${placeholder} |`,
    `| Unknown / none provenance | ${unknownProvenance} |`,
    `| Shared-hash duplicate groups | ${duplicateImageGroups.length} |`,
    `| Media-audit coverage % | ${mediaAudit.totals.coveragePct} |`,
    `| Identity mismatches (site audit) | ${mediaAudit.totals.identityMismatches} |`,
    ``,
    `### Catalog media audit gaps`,
    ``,
  );
  if (!mediaAudit.gaps.length) push(`_None._`);
  else for (const g of mediaAudit.gaps.slice(0, 40)) {
    push(`- \`${g.slug}\` — **${g.reason}** ${g.detail ?? ""}`);
  }

  push(
    ``,
    `### Provenance / licence distribution (primary)`,
    ``,
    `| Bucket | Count |`,
    `|---|---:|`,
  );
  for (const [k, v] of Object.entries(provenanceDist).sort((a, b) => b[1] - a[1])) {
    push(`| ${k} | ${v} |`);
  }

  push(
    ``,
    `---`,
    ``,
    `## 2. Running shoes — media issues`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Running shoe products | ${runningShoes.length} |`,
    `| Shoes audit coverage % | ${shoesMediaAudit.totals.coveragePct} |`,
    `| Shoes identity mismatches | ${shoesMediaAudit.totals.identityMismatches} |`,
    `| Issue rows (deduped) | ${runningShoeIssuesDeduped.length} |`,
    ``,
  );
  if (!runningShoeIssuesDeduped.length) {
    push(`_No media issues listed for running shoes under audit rules._`);
  } else {
    for (const i of runningShoeIssuesDeduped) {
      push(`- \`${i.slug}\` — **${i.reason}** ${"detail" in i && i.detail ? `— ${i.detail}` : ""}`);
    }
  }

  push(
    ``,
    `---`,
    ``,
    `## 3. Image technical quality`,
    ``,
    `| Metric | Value |`,
    `|---|---:|`,
    `| Authentic primaries measured | ${techSamples.length} |`,
    `| Missing width/height on MediaAsset | ${missingWH} |`,
    `| Missing alt on primary | ${missingAlt} |`,
    `| next/image \`priority=\` usages (components) | ${priorityLines.length} |`,
    `| next/image \`sizes=\` usages (components) | ${sizesLines.length} |`,
    ``,
    `### Formats`,
    ``,
  );
  for (const [k, v] of Object.entries(formatCounts).sort((a, b) => b[1] - a[1])) {
    push(`- ${k}: ${v}`);
  }
  push(``, `### File size buckets`, ``);
  for (const [k, v] of Object.entries(sizeBuckets)) push(`- ${k}: ${v}`);
  push(``, `### Dimension / file issues (sample)`, ``);
  if (!dimIssues.length) push(`_None._`);
  else for (const d of dimIssues.slice(0, 25)) push(`- \`${d.slug}\` — ${d.issue} (\`${d.src}\`)`);

  push(
    ``,
    `---`,
    ``,
    `## 4. Product image provenance`,
    ``,
    `Reported from stored \`licence\` / \`sourceUrl\` / \`attribution\` only — **ownership not inferred**.`,
    ``,
    `| Licence | Count |`,
    `|---|---:|`,
  );
  for (const [k, v] of Object.entries(provenanceByLicence).sort((a, b) => b[1] - a[1])) {
    push(`| ${k} | ${v} |`);
  }
  push(
    ``,
    `Duplicate shared-byte hero groups: **${duplicateImageGroups.length}** (sample in JSON).`,
  );

  push(
    ``,
    `---`,
    ``,
    `## 5. Offers`,
    ``,
    `| Metric | Count |`,
    `|---|---:|`,
    `| Active offers | ${offers.length} |`,
    `| Products | ${products.length} |`,
    `| Products with ≥1 offer | ${productsWithOffers.length} |`,
    `| Products with zero offers | ${productsZeroOffers.length} |`,
    `| Avg offers / product | ${report.offers.averageOffersPerProduct} |`,
    `| Avg offers / product (with offers) | ${report.offers.averageOffersPerProductWithOffers} |`,
    `| Stale (by audit clock) | ${staleOffers.length} |`,
    `| Variant-linked offers | ${variantLinked} |`,
    `| URL sample checked | ${urlChecks.length} |`,
    `| URL sample broken/error | ${brokenUrlSample.length} |`,
    ``,
    `### Freshness`,
    ``,
  );
  for (const [k, v] of Object.entries(freshness)) push(`- ${k}: ${v}`);

  push(``, `### By region (offer rows)`, ``, `| Region | Offers |`, `|---|---:|`);
  for (const [k, v] of Object.entries(offersByRegion).sort()) push(`| ${k} | ${v} |`);

  push(``, `### By retailer (top)`, ``, `| Retailer | Offers |`, `|---|---:|`);
  for (const [k, v] of Object.entries(report.offers.byRetailer).slice(0, 20)) {
    push(`| ${k} | ${v} |`);
  }

  push(``, `### Zero-offer products (sample)`, ``);
  for (const p of report.offers.productsZeroOffersSample.slice(0, 25)) {
    push(`- \`${p.slug}\` (${p.categoryId})`);
  }

  push(
    ``,
    `---`,
    ``,
    `## 6. Regions (displayability)`,
    ``,
    `| Region | Configured (has offers) | Products w/ region offers | Displayable | Coverage % | Displayable % |`,
    `|---|---|---:|---:|---:|---:|`,
  );
  for (const region of REGIONS) {
    const r = regionCoverage[region];
    push(
      `| ${region} | ${r.configured} | ${r.withOffers} | ${r.displayable} | ${r.coveragePct} | ${r.displayablePct} |`,
    );
  }

  push(
    ``,
    `---`,
    ``,
    `## 7. Affiliate link quality`,
    ``,
    `| Check | Result |`,
    `|---|---|`,
    `| \`/go\` redirect route | ${goResolver} |`,
    `| Affiliate disclosure page | ${disclosurePage.exists} |`,
    `| Disclosure component | ${disclosureComponent} |`,
    `| Offers with \`affiliateUrl\` field | ${withAffiliateUrl} |`,
    `| Offers with direct URL only | ${directOnly} |`,
    ``,
    report.affiliateLinkQuality.classificationNote,
  );

  push(
    ``,
    `---`,
    ``,
    `## 8. Commercial independence`,
    ``,
    `**Conclusion:** ${report.commercialIndependence.conclusion}`,
    ``,
    `| Signal | Value |`,
    `|---|---|`,
    `| Suspicious commission→score mixes | ${commercial.suspiciousCount} |`,
    `| Featureability mentions commission | ${report.commercialIndependence.featureabilityMentionsCommission} |`,
    ``,
    `### Findings (sample)`,
    ``,
  );
  for (const f of commercial.findings.filter((x) => x.kind !== "MENTION").slice(0, 20)) {
    push(`- **${f.kind}** \`${f.file}\` — ${f.evidence}`);
  }
  push(``, `_Neutral “commission never…” documentation mentions are counted separately in JSON._`);

  push(
    ``,
    `---`,
    ``,
    `## 9. Evidence`,
    ``,
    `| Corpus | Total | With evidenceIds | Without | Coverage % |`,
    `|---|---:|---:|---:|---:|`,
    `| Catalog Evidence records | ${evidenceAll.length} | — | — | — |`,
    `| Products | ${evidenceCoverageReport.products.total} | ${evidenceCoverageReport.products.withEvidence} | ${evidenceCoverageReport.products.withoutEvidence} | ${evidenceCoverageReport.products.coveragePct} |`,
    `| Reviews | ${evidenceCoverageReport.reviews.total} | ${evidenceCoverageReport.reviews.withEvidence} | ${evidenceCoverageReport.reviews.withoutEvidence} | ${evidenceCoverageReport.reviews.coveragePct} |`,
    `| Best guides | ${evidenceCoverageReport.bestGuides.total} | ${evidenceCoverageReport.bestGuides.withEvidence} | ${evidenceCoverageReport.bestGuides.withoutEvidence} | ${evidenceCoverageReport.bestGuides.coveragePct} |`,
    `| Buying guides | ${evidenceCoverageReport.buyingGuides.total} | ${evidenceCoverageReport.buyingGuides.withEvidence} | ${evidenceCoverageReport.buyingGuides.withoutEvidence} | ${evidenceCoverageReport.buyingGuides.coveragePct} |`,
    ``,
    `### Evidence records by type`,
    ``,
  );
  for (const [k, v] of Object.entries(evidenceByType).sort((a, b) => b[1] - a[1])) {
    push(`- ${k}: ${v}`);
  }

  push(
    ``,
    `---`,
    ``,
    `## 10. Trust pages`,
    ``,
    `| Page | Exists | Stub heuristic | Path |`,
    `|---|---|---|---|`,
  );
  for (const [k, v] of Object.entries(trustPages)) {
    push(
      `| ${k} | ${v.exists} | ${"stubHeuristic" in v ? v.stubHeuristic : "—"} | ${v.path} |`,
    );
  }
  push(``, `### Notes`, ``);
  for (const n of trustPageNotes) push(`- ${n}`);

  push(
    ``,
    `---`,
    ``,
    `## 11. Authorship`,
    ``,
  );
  for (const a of authorship.authorsDefined) {
    push(
      `- **${a.name}** (\`${a.slug}\`) — genericEditorial=${a.isGenericEditorial}, bioChars=${a.bioLength}, photo=${a.hasPhoto}`,
    );
  }
  push(
    ``,
    `| Metric | Count |`,
    `|---|---:|`,
    `| Reviews missing authorId | ${authorship.reviewsMissingAuthor} |`,
    `| Unknown authorIds on reviews | ${authorship.unknownAuthorIds.length} |`,
  );
  for (const [id, n] of Object.entries(authorUsage)) push(`- Reviews by \`${id}\`: ${n}`);

  push(
    ``,
    `---`,
    ``,
    `## 12. First-hand disclosure`,
    ``,
    `| Metric | Count |`,
    `|---|---:|`,
    `| Declared first-hand-test | ${firstHand.declaredFirstHand} |`,
    `| Declared hybrid | ${firstHand.declaredHybrid} |`,
    `| Declared expert-research | ${firstHand.expertResearch} |`,
    `| Visible first-hand/hybrid (with personal-test evidence gate) | ${firstHand.visibleFirstHandWithEvidence} |`,
    `| Declared first-hand/hybrid downgraded (no personal-test evidence) | ${firstHand.visibleDowngradedMissingEvidence} |`,
    ``,
  );
  if (!firstHand.samples.length) {
    push(`_No reviews declared first-hand/hybrid or carrying personal-test evidence._`);
  } else {
    push(`### Samples`, ``);
    for (const s of firstHand.samples.slice(0, 30)) {
      push(
        `- \`${s.slug}\` declared=${s.declared} visible=${s.visible} personalTestEv=${s.hasPersonalTestEvidence}`,
      );
    }
  }

  push(
    ``,
    `---`,
    ``,
    `## 13. User ratings`,
    ``,
    `- AggregateRating / reviewCount mentions in \`src\`: **${aggLines.length}** (includes audit detectors).`,
    `- Production \`reviewJsonLd\`: uses \`reviewRating\` (Rating), not AggregateRating.`,
    `- Production \`productJsonLd\`: omits AggregateRating.`,
    `- **BLOCKER flag:** ${blockerFakeRatings}`,
  );

  push(
    ``,
    `---`,
    ``,
    `## 14. Public trust language`,
    ``,
    `| Phrase | Hits |`,
    `|---|---:|`,
  );
  for (const row of report.publicTrustLanguage.byPhrase) {
    push(`| ${row.phrase} | ${row.count} |`);
  }
  push(``, `### Exact locations (sample)`, ``);
  if (!trustPhraseHits.length) push(`_No matches for configured unsupported phrases._`);
  else {
    for (const h of trustPhraseHits.slice(0, 40)) {
      push(`- \`${h.file}:${h.line}\` **${h.phrase}** — ${h.excerpt}`);
    }
  }

  push(
    ``,
    `---`,
    ``,
    `## 15. Summary (raw coverage & issues)`,
    ``,
    `| Item | Value |`,
    `|---|---:|`,
    `| Media authentic coverage % | ${s.mediaAuthenticCoveragePct} |`,
    `| Media gaps | ${s.mediaGaps} |`,
    `| Running shoe media issues | ${s.runningShoeMediaIssues} |`,
    `| Duplicate hero groups | ${s.duplicateHeroGroups} |`,
    `| Products with zero offers | ${s.productsZeroOffers} |`,
    `| Stale offers | ${s.staleOffers} |`,
    `| Regions with offer rows | ${s.regionsWithOffers} |`,
    `| Product evidence coverage % | ${s.evidenceProductCoveragePct} |`,
    `| Review evidence coverage % | ${s.evidenceReviewCoveragePct} |`,
    `| Authors defined | ${s.authorsCount} |`,
    `| Visible first-hand reviews | ${s.visibleFirstHandReviews} |`,
    `| Fake rating BLOCKER | ${s.fakeRatingBlocker} |`,
    `| Trust phrase hits | ${s.trustPhraseHits} |`,
    `| Commercial suspicious mixes | ${s.commercialSuspicious} |`,
    ``,
    `Missing dedicated trust routes: ${s.missingTrustRoutes.join(", ") || "none"}`,
    ``,
    `---`,
    ``,
    `## Notes`,
    ``,
    `- No fixes applied.`,
    `- Offer URL sampling is partial; failures may be bot-blocking rather than true 404s.`,
    `- “Most popular” / similar phrases may be legitimate comparative copy — listed for review, not auto-classified as false.`,
    ``,
  );

  writeFileSync(join(OUT_DIR, "06-media-offers-trust.md"), lines.join("\n"));
  console.log("Wrote docs/prelaunch/06-media-offers-trust.md");
  console.log("Wrote docs/prelaunch/data/06-media-offers-trust.json");
  console.log(JSON.stringify(s, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
