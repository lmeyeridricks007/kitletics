/**
 * READ-ONLY Running ↔ Padel forensic parity audit.
 * Writes CSV/JSON under docs/padel/data/. Does not mutate product/content.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/padel-running-parity-audit.ts
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import {
  getProducts,
  getProductsByCategory,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getBrandById,
  getProductById,
  getProductBySlug,
} from "@/repositories";
import { getPrimaryProductMedia, canFeatureProduct } from "@/lib/product/media";
import { getProductGalleryMedia } from "@/content/product-gallery-media";
import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { resolveReviewSectionVisuals } from "@/lib/review/resolve-section-visuals";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { isListableCatalogProduct } from "@/lib/catalog/listable-products";
import { getLaunchEligibility, isLaunchListable } from "@/domain/launch";
import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs/padel/data");
const PUB = join(ROOT, "public");

const PADEL_CATS = [
  { id: "cat-padel-rackets", label: "RACKETS", segment: "rackets" },
  { id: "cat-padel-shoes", label: "SHOES", segment: "shoes" },
  { id: "cat-padel-balls", label: "BALLS", segment: "balls" },
  { id: "cat-padel-bags", label: "BAGS", segment: "bags" },
  { id: "cat-padel-grips", label: "GRIPS", segment: "grips" },
  { id: "cat-padel-accessories", label: "ACCESSORIES", segment: "accessories" },
] as const;

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(path: string, headers: string[], rows: Record<string, unknown>[]) {
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  writeFileSync(path, lines.join("\n") + "\n");
}

function fileMeta(publicSrc: string | undefined) {
  if (!publicSrc || !publicSrc.startsWith("/")) {
    return { exists: false, bytes: 0, ext: "" };
  }
  const abs = join(PUB, publicSrc.replace(/^\//, ""));
  if (!existsSync(abs)) return { exists: false, bytes: 0, ext: extname(abs) };
  try {
    const st = statSync(abs);
    return { exists: true, bytes: st.size, ext: extname(abs) };
  } catch {
    return { exists: false, bytes: 0, ext: "" };
  }
}

function sectionDir(productSlug: string, sport: "running" | "padel") {
  return join(PUB, "images", sport, "products", productSlug, "sections");
}

function countSectionFiles(productSlug: string, sport: "running" | "padel"): number {
  const dir = sectionDir(productSlug, sport);
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) =>
    [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase()),
  ).length;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function classifyDescription(text: string): string {
  const t = text.trim();
  const wc = wordCount(t);
  const lower = t.toLowerCase();
  const genericHits = [
    /is designed for/,
    /choose this if/,
    /this is a .+ for/,
    /perfect for players who/,
    /ideal for those who/,
    /whether you('re| are)/,
    /manufacturer (sheet|positioning|copy)/,
    /not a kitletics lab/,
  ].filter((re) => re.test(lower)).length;

  if (wc < 40) return "THIN";
  if (genericHits >= 2 && wc < 120) return "GENERIC";
  if (genericHits >= 3) return "REPETITIVE";
  if (/image unavailable|lorem ipsum|todo:|FIXME/i.test(t)) return "BROKEN";
  if (wc < 80) return "UNHELPFUL";
  if (wc >= 180 && genericHits === 0) return "GOOD";
  if (wc >= 280 && /trade-?off|skip if|buy if|versus|compared/i.test(lower))
    return "EXCELLENT";
  if (genericHits >= 1) return "GENERIC";
  return "GOOD";
}

function provenance(src?: string, sourceUrl?: string): string {
  if (!src) return "PLACEHOLDER";
  if (src.includes("fallback") || src.includes("placeholder") || src.endsWith(".svg"))
    return "PLACEHOLDER";
  const u = (sourceUrl ?? "").toLowerCase();
  if (/nike\.com|adidas\.com|asics\.com|brooksrunning|hoka\.com|saucony|newbalance|noxsport|bullpadel|babolat|head\.com|wilson\.com|starvie|siux/.test(u))
    return "MANUFACTURER";
  if (/allforpadel|padelreference|tenniswarehouse|sportsshoes|decathlon|runningwarehouse|prodirect/.test(u))
    return "AUTHORIZED_RETAILER";
  if (src.startsWith("/images/")) return "UNKNOWN";
  return "UNKNOWN";
}

function productFamily(p: Product): string {
  const cat = PADEL_CATS.find((c) => c.id === p.categoryId);
  return cat?.label ?? (p.categoryId === "cat-running-shoes" ? "RUNNING_SHOES" : p.categoryId);
}

function galleryCount(p: Product): number {
  const primary = getPrimaryProductMedia(p);
  const extras = getProductGalleryMedia(p.id) ?? [];
  const authentic = (p.images ?? []).filter(
    (img) => img?.src && !img.src.includes("fallback") && img.src !== primary?.src,
  );
  const set = new Set<string>();
  if (primary?.src) set.add(primary.src);
  for (const e of extras) if (e.src) set.add(e.src);
  for (const a of authentic) if (a.src) set.add(a.src);
  return set.size;
}

function mediaStatus(p: Product) {
  const primary = getPrimaryProductMedia(p);
  const meta = fileMeta(primary?.src);
  const registryAssets = getCatalogProductHeroMedia(p.id, p.fullName);
  const registry = registryAssets?.[0];
  const gallery = galleryCount(p);
  const hasExactHero = Boolean(primary?.src && meta.exists && canFeatureProduct(p));
  let status = "HAS_EXACT_HERO";
  if (!primary?.src) status = "MEDIA_MISSING";
  else if (!meta.exists) status = "MEDIA_MISSING";
  else if (!canFeatureProduct(p)) status = "MEDIA_WRONG";
  else if (gallery <= 1) status = "MEDIA_INSUFFICIENT";
  else if (gallery >= 2) status = "HAS_USEFUL_GALLERY";

  // Low quality heuristic: tiny file
  if (hasExactHero && meta.bytes > 0 && meta.bytes < 8_000) status = "MEDIA_LOW_QUALITY";

  return {
    status,
    hasExactHero,
    gallery,
    primarySrc: primary?.src ?? "",
    sourceUrl: registry?.sourceUrl ?? "",
    bytes: meta.bytes,
    provenance: provenance(primary?.src, registry?.sourceUrl),
    alt: primary?.alt ?? "",
  };
}

function reviewTextBlob(r: Review): string {
  return [
    r.summary,
    r.verdict,
    r.bottomLine ?? "",
    ...(r.sections ?? []).map((s) => s.body),
    ...(r.pros ?? []),
    ...(r.cons ?? []),
  ].join("\n");
}

function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(join(ROOT, "docs/padel/parity-screenshots"), { recursive: true });

  const allProducts = getProducts({ isDev: true });
  const padelProducts = allProducts.filter((p) =>
    p.sportIds.includes("sport-padel"),
  );
  const runningShoes = allProducts.filter(
    (p) => p.categoryId === "cat-running-shoes",
  );

  // --- Product media gaps ---
  const mediaRows: Record<string, unknown>[] = [];
  for (const p of [...padelProducts, ...runningShoes]) {
    const brand = getBrandById(p.brandId);
    const m = mediaStatus(p);
    const listable = isListableCatalogProduct(p);
    mediaRows.push({
      productId: p.id,
      slug: p.slug,
      brand: brand?.name ?? "",
      model: p.name,
      family: productFamily(p),
      status: p.status,
      listable,
      mediaStatus: m.status,
      HAS_EXACT_HERO: m.hasExactHero,
      galleryCount: m.gallery,
      heroPath: m.primarySrc,
      heroSourceUrl: m.sourceUrl,
      fileBytes: m.bytes,
      provenance: m.provenance,
      alt: m.alt,
      identityConfidence: m.hasExactHero ? "HIGH_FILE_EXISTS" : "LOW",
      semanticStatus: m.status,
    });
  }
  writeCsv(
    join(OUT, "PADEL-PRODUCT-MEDIA-GAPS.csv"),
    [
      "productId",
      "slug",
      "brand",
      "model",
      "family",
      "status",
      "listable",
      "mediaStatus",
      "HAS_EXACT_HERO",
      "galleryCount",
      "heroPath",
      "heroSourceUrl",
      "fileBytes",
      "provenance",
      "alt",
      "identityConfidence",
      "semanticStatus",
    ],
    mediaRows.filter((r) => String(r.family) !== "RUNNING_SHOES"),
  );

  // --- PDP content quality ---
  const pdpRows: Record<string, unknown>[] = [];
  const sampleRunning = runningShoes.filter((p) => p.status === "published").slice(0, 40);
  const padelByCat: Record<string, Product[]> = {};
  for (const c of PADEL_CATS) {
    padelByCat[c.label] = getProductsByCategory(c.id, { isDev: true });
  }

  function auditPdp(p: Product, vertical: string) {
    const data = getProductPageData(p.slug, { region: "NL", preview: true });
    const padelCopy = data?.padelEditorial;
    const softCopy = data?.padelSoftEditorial;
    const desc = [
      p.shortDescription ?? "",
      p.verdict ?? "",
      ...(p.strengths ?? []),
      ...(p.weaknesses ?? []),
      ...(data?.bestFor ?? []),
      ...(data?.notIdealFor ?? []),
      ...(data?.buyIf ?? []),
      ...(data?.skipIf ?? []),
      padelCopy?.whatItIs ?? "",
      softCopy?.whatItIs ?? "",
      ...(padelCopy?.buyIf ?? []),
      ...(padelCopy?.skipIf ?? []),
    ].join("\n");
    const blob = desc;
    const m = mediaStatus(p);
    const gallery = data?.galleryImages?.length ?? m.gallery;
    pdpRows.push({
      productId: p.id,
      slug: p.slug,
      vertical,
      family: productFamily(p),
      descriptionClass: classifyDescription(blob),
      wordCount: wordCount(blob),
      galleryCount: gallery,
      hasVerdict: Boolean(
        (p.verdict && p.verdict.length > 40) ||
          (data?.verdict && data.verdict.length > 40),
      ),
      strengthCount: p.strengths?.length ?? 0,
      weaknessCount: p.weaknesses?.length ?? 0,
      hasOffers: (data?.offers?.length ?? 0) > 0,
      hasAlternatives: (data?.alternatives?.length ?? 0) > 0,
      sectionCount: data?.scoreExplainFactors?.length ?? 0,
    });
  }

  for (const p of sampleRunning) auditPdp(p, "running");
  // Sample sizes per user request (or all if fewer)
  const samplePlan: Array<[string, number]> = [
    ["RACKETS", 40],
    ["SHOES", 20],
    ["BALLS", 20],
    ["BAGS", 25],
    ["GRIPS", 20],
    ["ACCESSORIES", 20],
  ];
  for (const [label, n] of samplePlan) {
    const list = (padelByCat[label] ?? []).slice(0, n);
    for (const p of list) auditPdp(p, "padel");
  }
  // Also all published padel for completeness on description class
  for (const p of padelProducts.filter((x) => x.status === "published")) {
    if (pdpRows.some((r) => r.productId === p.id)) continue;
    auditPdp(p, "padel");
  }

  writeCsv(
    join(OUT, "PADEL-PDP-CONTENT-QUALITY.csv"),
    [
      "productId",
      "slug",
      "vertical",
      "family",
      "descriptionClass",
      "wordCount",
      "galleryCount",
      "hasVerdict",
      "strengthCount",
      "weaknessCount",
      "hasOffers",
      "hasAlternatives",
      "sectionCount",
    ],
    pdpRows,
  );

  // --- Reviews ---
  const reviews = getReviews({ isDev: true });
  const padelReviews = reviews.filter((r) => {
    const p = getProductById(r.productId, { isDev: true });
    return p?.sportIds.includes("sport-padel");
  });
  const runningReviews = reviews.filter((r) => {
    const p = getProductById(r.productId, { isDev: true });
    return p?.categoryId === "cat-running-shoes";
  });

  const reviewRows: Record<string, unknown>[] = [];
  const editorialMediaRows: Record<string, unknown>[] = [];

  function auditReview(r: Review, vertical: "running" | "padel") {
    const p = getProductById(r.productId, { isDev: true });
    if (!p) return;
    const sectionFiles = countSectionFiles(p.slug, vertical);
    const enriched = enrichReviewForPage(r, p, {
      productHero: getPrimaryProductMedia(p) ?? undefined,
    });
    const withVisuals = resolveReviewSectionVisuals(enriched.sections ?? [], {
      productHero: getPrimaryProductMedia(p) ?? undefined,
      productImages: p.images ?? [],
      productSlug: p.slug,
      categoryId: p.categoryId,
      reviewId: r.id,
    });
    const uniqueSrcs = new Set(
      withVisuals
        .map((s) => s.image?.src)
        .filter(Boolean) as string[],
    );
    const words = wordCount(reviewTextBlob(enriched));
    const inlineImages = uniqueSrcs.size;
    const per1k = words > 0 ? (inlineImages / words) * 1000 : 0;
    const onlyHero = inlineImages <= 1;
    const class_ = classifyDescription(reviewTextBlob(enriched));

    reviewRows.push({
      reviewId: r.id,
      slug: r.slug,
      vertical,
      productSlug: p.slug,
      wordCount: words,
      sectionFileCount: sectionFiles,
      resolvedSectionImages: inlineImages,
      imagesPer1000Words: Number(per1k.toFixed(2)),
      onlyHeroOrLess: onlyHero,
      descriptionClass: class_,
      scoreCount: r.scoreBreakdown?.length ?? 0,
      buyIfCount: r.whoShouldBuy?.length ?? 0,
      skipIfCount: r.whoShouldAvoid?.length ?? 0,
      methodologyNotePresent: Boolean(r.testingContext),
      readiness:
        sectionFiles >= 8 && class_ !== "THIN" && class_ !== "GENERIC"
          ? "RUNNING_PARITY_READY"
          : sectionFiles >= 3
            ? "FUNCTIONALLY_READY_BUT_THIN"
            : sectionFiles === 0
              ? "MEDIA_BLOCKED"
              : "CONTENT_BLOCKED",
    });

    editorialMediaRows.push({
      kind: "review",
      id: r.id,
      slug: r.slug,
      vertical,
      heroPresent: Boolean(getPrimaryProductMedia(p)),
      sectionFileCount: sectionFiles,
      resolvedInlineImages: inlineImages,
      words,
      imagesPer1000Words: Number(per1k.toFixed(2)),
      gap:
        sectionFiles === 0
          ? "NO_SECTION_FILES"
          : sectionFiles < 8
            ? "BELOW_RUNNING_SECTION_SET"
            : "OK",
    });
  }

  for (const r of padelReviews) auditReview(r, "padel");
  for (const r of runningReviews.slice(0, 25)) auditReview(r, "running");

  writeCsv(
    join(OUT, "PADEL-REVIEW-QUALITY.csv"),
    [
      "reviewId",
      "slug",
      "vertical",
      "productSlug",
      "wordCount",
      "sectionFileCount",
      "resolvedSectionImages",
      "imagesPer1000Words",
      "onlyHeroOrLess",
      "descriptionClass",
      "scoreCount",
      "buyIfCount",
      "skipIfCount",
      "methodologyNotePresent",
      "readiness",
    ],
    reviewRows,
  );

  // --- Best + buying guides ---
  const bestGuides = getBestGuides({ isDev: true });
  const buyingGuides = getBuyingGuides({ isDev: true });
  const padelBest = bestGuides.filter((g) => g.sportId === "sport-padel");
  const runningBest = bestGuides.filter((g) => g.sportId === "sport-running");
  const padelBuy = buyingGuides.filter((g) => g.sportId === "sport-padel");
  const runningBuy = buyingGuides.filter((g) => g.sportId === "sport-running");

  const guideRows: Record<string, unknown>[] = [];

  function guideImageExists(src?: string) {
    return fileMeta(src).exists;
  }

  for (const g of [...padelBest, ...runningBest.slice(0, 15)]) {
    const vertical = g.sportId === "sport-padel" ? "padel" : "running";
    const body = [
      g.summary ?? "",
      g.methodology ?? "",
      ...(g.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
      ...(g.recommendations ?? []).map(
        (r) => `${r.badge ?? ""} ${r.summary ?? ""} ${r.rationale ?? ""}`,
      ),
    ].join("\n");
    const recImages = (g.recommendations ?? [])
      .map((r) => getProductById(r.productId, { isDev: true }))
      .filter(Boolean)
      .map((p) => getPrimaryProductMedia(p!))
      .filter((m) => m?.src).length;
    const class_ = classifyDescription(body);
    guideRows.push({
      kind: "best",
      id: g.id,
      slug: g.slug,
      vertical,
      wordCount: wordCount(body),
      sectionCount: g.sections?.length ?? 0,
      recommendationCount: g.recommendations?.length ?? 0,
      recommendationImages: recImages,
      descriptionClass: class_,
      hasMethodology: Boolean(g.methodology && g.methodology.length > 80),
      readiness:
        class_ === "THIN" || class_ === "GENERIC"
          ? "CONTENT_BLOCKED"
          : recImages < Math.min(3, g.recommendations?.length ?? 0)
            ? "MEDIA_BLOCKED"
            : class_ === "EXCELLENT" || class_ === "GOOD"
              ? "FUNCTIONALLY_READY_BUT_THIN"
              : "FUNCTIONALLY_READY_BUT_THIN",
    });
    editorialMediaRows.push({
      kind: "best",
      id: g.id,
      slug: g.slug,
      vertical,
      heroPresent: true,
      sectionFileCount: 0,
      resolvedInlineImages: recImages,
      words: wordCount(body),
      imagesPer1000Words:
        wordCount(body) > 0
          ? Number(((recImages / wordCount(body)) * 1000).toFixed(2))
          : 0,
      gap: recImages < 3 ? "THIN_PRODUCT_VISUALS" : "OK",
    });
  }

  for (const g of [...padelBuy, ...runningBuy.slice(0, 15)]) {
    const vertical = g.sportId === "sport-padel" ? "padel" : "running";
    const body = [
      g.summary ?? "",
      g.quickAnswer ?? "",
      ...(g.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
    ].join("\n");
    const class_ = classifyDescription(body);
    guideRows.push({
      kind: "buying",
      id: g.id,
      slug: g.slug,
      vertical,
      wordCount: wordCount(body),
      sectionCount: g.sections?.length ?? 0,
      recommendationCount: 0,
      recommendationImages: 0,
      descriptionClass: class_,
      hasMethodology: false,
      readiness:
        class_ === "THIN" || class_ === "GENERIC" || class_ === "UNHELPFUL"
          ? "CONTENT_BLOCKED"
          : "FUNCTIONALLY_READY_BUT_THIN",
    });
    editorialMediaRows.push({
      kind: "buying",
      id: g.id,
      slug: g.slug,
      vertical,
      heroPresent: guideImageExists(
        `/images/padel/guides/${g.slug}.jpg`,
      ),
      sectionFileCount: 0,
      resolvedInlineImages: 0,
      words: wordCount(body),
      imagesPer1000Words: 0,
      gap: "FEW_OR_NO_INLINE_EDITORIAL_IMAGES",
    });
  }

  writeCsv(
    join(OUT, "PADEL-GUIDE-QUALITY.csv"),
    [
      "kind",
      "id",
      "slug",
      "vertical",
      "wordCount",
      "sectionCount",
      "recommendationCount",
      "recommendationImages",
      "descriptionClass",
      "hasMethodology",
      "readiness",
    ],
    guideRows,
  );

  writeCsv(
    join(OUT, "PADEL-EDITORIAL-MEDIA-GAPS.csv"),
    [
      "kind",
      "id",
      "slug",
      "vertical",
      "heroPresent",
      "sectionFileCount",
      "resolvedInlineImages",
      "words",
      "imagesPer1000Words",
      "gap",
    ],
    editorialMediaRows,
  );

  // --- Page parity scorecard rows ---
  const pageRows: Record<string, unknown>[] = [];

  function addPage(
    pageType: string,
    url: string,
    vertical: string,
    scores: Record<string, string>,
    notes: string,
  ) {
    pageRows.push({
      pageType,
      url,
      vertical,
      MEDIA_COMPLETENESS: scores.MEDIA_COMPLETENESS,
      MEDIA_QUALITY: scores.MEDIA_QUALITY,
      CONTENT_DEPTH: scores.CONTENT_DEPTH,
      PRODUCT_SPECIFICITY: scores.PRODUCT_SPECIFICITY,
      DECISION_SUPPORT: scores.DECISION_SUPPORT,
      VISUAL_STORYTELLING: scores.VISUAL_STORYTELLING,
      COMMERCE: scores.COMMERCE,
      INTERNAL_LINKING: scores.INTERNAL_LINKING,
      RUNNING_PARITY: scores.RUNNING_PARITY,
      readiness: scores.readiness,
      notes,
    });
  }

  // Aggregate media stats
  const padelMedia = mediaRows.filter((r) => String(r.family) !== "RUNNING_SHOES");
  const byFamily: Record<string, typeof padelMedia> = {};
  for (const r of padelMedia) {
    const f = String(r.family);
    (byFamily[f] ??= []).push(r);
  }

  const runningGallery = runningShoes.map((p) => galleryCount(p));
  const padelGallery = padelProducts.map((p) => galleryCount(p));
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  const median = (xs: number[]) => {
    if (!xs.length) return 0;
    const s = [...xs].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
  };

  addPage(
    "hub",
    "/running",
    "running",
    {
      MEDIA_COMPLETENESS: "HIGH",
      MEDIA_QUALITY: "HIGH",
      CONTENT_DEPTH: "HIGH",
      PRODUCT_SPECIFICITY: "HIGH",
      DECISION_SUPPORT: "HIGH",
      VISUAL_STORYTELLING: "HIGH",
      COMMERCE: "HIGH",
      INTERNAL_LINKING: "HIGH",
      RUNNING_PARITY: "BENCHMARK",
      readiness: "RUNNING_PARITY_READY",
    },
    "Declarative SportHubPage with fit links, best+finder, more bests, guides, reviews, brands",
  );
  addPage(
    "hub",
    "/padel",
    "padel",
    {
      MEDIA_COMPLETENESS: "MED",
      MEDIA_QUALITY: "MED",
      CONTENT_DEPTH: "MED",
      PRODUCT_SPECIFICITY: "MED",
      DECISION_SUPPORT: "MED",
      VISUAL_STORYTELLING: "LOW",
      COMMERCE: "MED",
      INTERNAL_LINKING: "MED",
      RUNNING_PARITY: "MAJOR_PARITY_GAPS",
      readiness: "FUNCTIONALLY_READY_BUT_THIN",
    },
    "Same stack as Running but thinner visuals; blob media gaps historically; fewer unique guide images",
  );
  addPage(
    "category",
    "/running/shoes",
    "running",
    {
      MEDIA_COMPLETENESS: "HIGH",
      MEDIA_QUALITY: "HIGH",
      CONTENT_DEPTH: "HIGH",
      PRODUCT_SPECIFICITY: "HIGH",
      DECISION_SUPPORT: "HIGH",
      VISUAL_STORYTELLING: "HIGH",
      COMMERCE: "HIGH",
      INTERNAL_LINKING: "HIGH",
      RUNNING_PARITY: "BENCHMARK",
      readiness: "RUNNING_PARITY_READY",
    },
    "Dedicated RunningShoesCategoryPage with collage hero, type nav, how-you-run, brand strip",
  );

  for (const c of PADEL_CATS) {
    const fam = byFamily[c.label] ?? [];
    const withHero = fam.filter((r) => r.HAS_EXACT_HERO).length;
    const rate = fam.length ? withHero / fam.length : 0;
    addPage(
      "category",
      `/padel/${c.segment}`,
      "padel",
      {
        MEDIA_COMPLETENESS: rate > 0.9 ? "HIGH" : rate > 0.6 ? "MED" : "LOW",
        MEDIA_QUALITY: rate > 0.8 ? "MED" : "LOW",
        CONTENT_DEPTH: c.label === "RACKETS" ? "MED" : "LOW",
        PRODUCT_SPECIFICITY: c.label === "RACKETS" ? "MED" : "LOW",
        DECISION_SUPPORT: c.label === "RACKETS" ? "MED" : "LOW",
        VISUAL_STORYTELLING: "LOW",
        COMMERCE: "MED",
        INTERNAL_LINKING: "MED",
        RUNNING_PARITY: "MAJOR_PARITY_GAPS",
        readiness:
          rate < 0.5
            ? "MEDIA_BLOCKED"
            : c.label === "RACKETS"
              ? "FUNCTIONALLY_READY_BUT_THIN"
              : "CONTENT_BLOCKED",
      },
      `Generic CategoryPage (not RunningShoes shell). Hero file coverage ${withHero}/${fam.length}`,
    );
  }

  addPage(
    "review_family",
    "/reviews/*",
    "running",
    {
      MEDIA_COMPLETENESS: "HIGH",
      MEDIA_QUALITY: "HIGH",
      CONTENT_DEPTH: "HIGH",
      PRODUCT_SPECIFICITY: "HIGH",
      DECISION_SUPPORT: "HIGH",
      VISUAL_STORYTELLING: "HIGH",
      COMMERCE: "HIGH",
      INTERNAL_LINKING: "HIGH",
      RUNNING_PARITY: "BENCHMARK",
      readiness: "RUNNING_PARITY_READY",
    },
    "Vomero-standard section images under public/images/running/products/<slug>/sections/",
  );

  const padelRevMediaBlocked = reviewRows.filter(
    (r) => r.vertical === "padel" && r.readiness === "MEDIA_BLOCKED",
  ).length;
  addPage(
    "review_family",
    "/reviews/* (padel)",
    "padel",
    {
      MEDIA_COMPLETENESS: "LOW",
      MEDIA_QUALITY: "MED",
      CONTENT_DEPTH: "MED",
      PRODUCT_SPECIFICITY: "MED",
      DECISION_SUPPORT: "MED",
      VISUAL_STORYTELLING: "LOW",
      COMMERCE: "MED",
      INTERNAL_LINKING: "MED",
      RUNNING_PARITY: "SYSTEMIC_PARITY_FAILURE",
      readiness: "MEDIA_BLOCKED",
    },
    `${padelRevMediaBlocked}/${padelReviews.length} padel reviews with 0 section image files; many flagships have 18–24 files — gap is uneven coverage + voice/visual QA, not total absence`,
  );

  writeCsv(
    join(OUT, "PADEL-RUNNING-PARITY-PAGES.csv"),
    [
      "pageType",
      "url",
      "vertical",
      "MEDIA_COMPLETENESS",
      "MEDIA_QUALITY",
      "CONTENT_DEPTH",
      "PRODUCT_SPECIFICITY",
      "DECISION_SUPPORT",
      "VISUAL_STORYTELLING",
      "COMMERCE",
      "INTERNAL_LINKING",
      "RUNNING_PARITY",
      "readiness",
      "notes",
    ],
    pageRows,
  );

  // Scorecard JSON
  const padelDesc = pdpRows.filter((r) => r.vertical === "padel");
  const runningDesc = pdpRows.filter((r) => r.vertical === "running");
  const classCounts = (rows: Record<string, unknown>[]) => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const k = String(r.descriptionClass);
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  };

  const scorecard = {
    asOf: new Date().toISOString().slice(0, 10),
    benchmark: "RUNNING_SHOES",
    running: {
      shoeProductCount: runningShoes.length,
      galleryAvg: Number(avg(runningGallery).toFixed(2)),
      galleryMedian: median(runningGallery),
      shoesWithGalleryExtras: runningGallery.filter((n) => n > 1).length,
      reviewSample: runningReviews.slice(0, 25).length,
      avgReviewSectionFiles: Number(
        avg(
          reviewRows
            .filter((r) => r.vertical === "running")
            .map((r) => Number(r.sectionFileCount)),
        ).toFixed(2),
      ),
      pdpDescriptionClasses: classCounts(runningDesc),
    },
    padel: {
      productCount: padelProducts.length,
      byFamily: Object.fromEntries(
        PADEL_CATS.map((c) => {
          const fam = byFamily[c.label] ?? [];
          return [
            c.label,
            {
              total: fam.length,
              exactHero: fam.filter((r) => r.HAS_EXACT_HERO).length,
              missing: fam.filter((r) => r.mediaStatus === "MEDIA_MISSING").length,
              insufficient: fam.filter(
                (r) => r.mediaStatus === "MEDIA_INSUFFICIENT",
              ).length,
              galleryAvg: Number(
                avg(fam.map((r) => Number(r.galleryCount))).toFixed(2),
              ),
            },
          ];
        }),
      ),
      galleryAvg: Number(avg(padelGallery).toFixed(2)),
      galleryMedian: median(padelGallery),
      pdpOnlyOneImage: padelGallery.filter((n) => n === 1).length,
      pdpZeroUsable: padelMedia.filter((r) => !r.HAS_EXACT_HERO).length,
      pdpDescriptionClasses: classCounts(padelDesc),
      reviews: {
        total: padelReviews.length,
        avgSectionFiles: Number(
          avg(
            reviewRows
              .filter((r) => r.vertical === "padel")
              .map((r) => Number(r.sectionFileCount)),
          ).toFixed(2),
        ),
        withZeroSectionFiles: reviewRows.filter(
          (r) => r.vertical === "padel" && Number(r.sectionFileCount) === 0,
        ).length,
        onlyHeroOrLess: reviewRows.filter(
          (r) => r.vertical === "padel" && r.onlyHeroOrLess,
        ).length,
      },
      bestGuides: padelBest.length,
      buyingGuides: padelBuy.length,
    },
    familyVerdicts: {
      hub: "MAJOR_PARITY_GAPS",
      category_rackets: "MAJOR_PARITY_GAPS",
      category_soft_goods: "SYSTEMIC_PARITY_FAILURE",
      pdp_rackets: "MAJOR_PARITY_GAPS",
      pdp_soft_goods: "SYSTEMIC_PARITY_FAILURE",
      reviews: "SYSTEMIC_PARITY_FAILURE",
      best_guides: "MAJOR_PARITY_GAPS",
      buying_guides: "SYSTEMIC_PARITY_FAILURE",
      comparisons: "MAJOR_PARITY_GAPS",
      alternatives: "MAJOR_PARITY_GAPS",
      brands: "MAJOR_PARITY_GAPS",
      finder: "FUNCTIONALLY_READY_BUT_THIN",
      database: "PARITY_READY", // padel-specific surface; richer than running absence
    },
    priorAuditBlindSpots: [
      "Image file exists ≠ useful gallery / visual storytelling",
      "Hero not wrong-brand ≠ Running-quality packshot + secondary angles",
      "Character count / not machine-like ≠ product-specific buyer guidance",
      "INDEXABLE / READY ≠ Running parity of layout modules and section media",
      "Token leakage zero ≠ editorial richness",
      "Jaccard uniqueness can be gamed with paraphrased templates",
    ],
  };

  writeFileSync(
    join(OUT, "PADEL-PARITY-SCORECARD.json"),
    JSON.stringify(scorecard, null, 2) + "\n",
  );

  console.log(JSON.stringify(scorecard, null, 2));
  console.log(`\nWrote CSVs + scorecard under ${OUT}`);
}

main();
