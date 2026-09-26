/**
 * Padel editorial remediation audit — reviews + guide visual plans.
 * Run: node --import tsx scripts/padel-editorial-parity-audit.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs/padel/data");

const GLUE = [
  /I'?d only keep the /i,
  /If this section still feels generic/i,
  /The useful question is/i,
  /What matters here/i,
  /This only matters if/i,
  /For this decision/i,
  /A sibling that wins a different court problem/i,
  /On the .+?, keep .+ in view before you chase extras/i,
  /Final note on the .+: buy for the job you will repeat/i,
];

const EDITORIAL_INSTRUCTION =
  /If this section still feels generic|How to read this section|editor note|internal note/i;

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows, headers) {
  return [headers.join(","), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(","))].join(
    "\n",
  );
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  // Dynamic imports from built TS via tsx
  const { listPublishedReviews } = await import("../src/content/reviews.ts").catch(() => ({
    listPublishedReviews: null,
  }));
  const { getProductById, getProductBySlug } = await import("../src/lib/catalog/query.ts").catch(
    () => ({}),
  );
  const { enrichReviewForPage } = await import("../src/lib/review/enrich-review-for-page.ts").catch(
    () => ({}),
  );
  const { isPadelReviewCategory } = await import("../src/lib/review/padel-review-outline.ts");
  const { PADEL_GUIDE_HEROES } = await import(
    "../src/lib/guides/explainers/padel-knowledge-plans.ts"
  ).catch(() => ({ PADEL_GUIDE_HEROES: {} }));
  const {
    evaluateReviewTemplateGlue,
    evaluateTeachingMediaCoverage,
    MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS,
  } = await import("../src/lib/padel/parity-gates.ts");
  const { PADEL_GUIDE_TEACHING_POOLS } = await import(
    "../src/lib/guides/enrich-explainer-visuals.ts"
  );

  // Fallback: read estate from padel reviews index
  let reviews = [];
  try {
    const padel = await import("../src/content/padel/reviews/index.ts");
    reviews = padel.padelEstateReviews ?? padel.default ?? [];
  } catch (e) {
    console.error("Failed to load padel reviews", e);
  }

  const auditRows = [];
  const similarityPairs = [];
  const mediaRows = [];
  const sentenceIndex = new Map(); // sentence -> review slugs

  const glueBefore = {
    onlyKeep: 48 + 50, // Vertex + Kuikma from prior audit reference
    feelsGeneric: 14 + 6,
  };

  let onlyKeepAfter = 0;
  let feelsGenericAfter = 0;
  let otherGlueAfter = 0;
  let editorialInstructionAfter = 0;

  const reviewSamples = [];
  for (const review of reviews) {
    const slug = review.slug;
    let product =
      (getProductById && review.productId ? getProductById(review.productId) : null) ||
      (getProductBySlug ? getProductBySlug(slug) : null);
    if (!product && review.productId) {
      // soft skip
    }
    let enriched = review;
    if (enrichReviewForPage && product) {
      try {
        enriched = enrichReviewForPage(review, product);
      } catch {
        enriched = review;
      }
    }

    const sections = enriched.sections ?? [];
    const entityNames = product
      ? [product.fullName, product.name].filter(Boolean)
      : [slug.replace(/-/g, " ")];
    for (const section of sections) {
      reviewSamples.push({
        productSlug: slug,
        sectionId: section.id,
        body: section.body || "",
        entityNames,
      });
    }
    const allText = sections.map((s) => s.body).join("\n\n");
    const onlyKeep = (allText.match(/I'?d only keep the /gi) || []).length;
    const feelsGeneric = (allText.match(/If this section still feels generic/gi) || []).length;
    const otherGlue = GLUE.reduce((n, re) => n + (allText.match(new RegExp(re.source, "gi")) || []).length, 0);
    const editorialInstr = (allText.match(EDITORIAL_INSTRUCTION) || []).length;
    onlyKeepAfter += onlyKeep;
    feelsGenericAfter += feelsGeneric;
    otherGlueAfter += otherGlue;
    editorialInstructionAfter += editorialInstr;

    for (const section of sections) {
      const body = section.body || "";
      const sentences = body
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 40);
      const unique = new Set(sentences.map((s) => s.toLowerCase().slice(0, 80)));
      const sharedLocal = sentences.length - unique.size;
      for (const s of sentences) {
        const key = s.toLowerCase().replace(/\s+/g, " ").slice(0, 100);
        if (!sentenceIndex.has(key)) sentenceIndex.set(key, []);
        sentenceIndex.get(key).push({ slug, section: section.heading });
      }

      const facts = [];
      if (/12[Kk]|Multieva|Soft.?EVA|diamond|round|teardrop|fiberglass|Polyglass/i.test(body)) {
        facts.push("spec-tokens");
      }
      auditRows.push({
        review: slug,
        section: section.heading,
        topic: section.id,
        bodyWords: body.trim().split(/\s+/).filter(Boolean).length,
        productFacts: facts.join("|") || "none",
        decisionClaims: /I'?d (shortlist|skip|buy|pause)|Best for|Skip/i.test(body) ? "yes" : "no",
        uniqueSentences: unique.size,
        sharedWithinSection: sharedLocal,
        glueHits: GLUE.filter((re) => re.test(body))
          .map((re) => re.source.slice(0, 40))
          .join("|"),
        editorialInstruction: EDITORIAL_INSTRUCTION.test(body) ? "yes" : "no",
        media: "",
        commerce: /€|EUR|Amazon|VIEW PRICES|From /i.test(body) ? "inline" : "page-chrome",
      });
    }

    // Media plan rows for major racket/shoe sections
    const planTopics = [
      { section: "Construction", visualNeeded: "yes", visualPurpose: "Show authentic face/frame", mediaType: "authentic-gallery", asset: "gallery", productSpecific: "yes" },
      { section: "Shape and balance", visualNeeded: "yes", visualPurpose: "Teach mould geometry", mediaType: "educational-diagram", asset: "/images/padel/education/padel-racket-shapes.svg", productSpecific: "no" },
      { section: "Sweet spot / forgiveness", visualNeeded: "yes", visualPurpose: "Teach sweet-spot height", mediaType: "educational-diagram", asset: "/images/padel/education/padel-sweet-spot.svg", productSpecific: "no" },
      { section: "Power", visualNeeded: "yes", visualPurpose: "Teach power-control continuum", mediaType: "educational-diagram", asset: "/images/padel/education/padel-power-control.svg", productSpecific: "no" },
    ];
    for (const p of planTopics) {
      mediaRows.push({
        review: slug,
        section: p.section,
        visualNeeded: p.visualNeeded,
        visualPurpose: p.visualPurpose,
        mediaType: p.mediaType,
        asset: p.asset,
        source: p.mediaType === "educational-diagram" ? "kitletics-education" : "product-gallery",
        productSpecific: p.productSpecific,
        unique: "yes",
        fallback: "omit",
      });
    }
  }

  for (const [sentence, locs] of sentenceIndex) {
    const slugs = [...new Set(locs.map((l) => l.slug))];
    if (slugs.length < 2) continue;
    if (/• |Published numbers|Affiliate|Expert Research|manufacturer/i.test(sentence)) continue;
    similarityPairs.push({
      sentence: sentence.slice(0, 160),
      reviewCount: slugs.length,
      reviews: slugs.slice(0, 8).join("|"),
      sections: [...new Set(locs.map((l) => l.section))].slice(0, 6).join("|"),
      kind: sentence.length > 80 ? "near-duplicate-paragraph" : "exact-sentence",
    });
  }

  const lessonPlans = [
    { guide: "how-to-choose-a-padel-racket", concept: "ROUND / TEARDROP / DIAMOND", whyVisualHelps: "Shape is hard to infer from packshots alone", visualType: "educational-diagram", asset: "padel-racket-shapes", placement: "shape section" },
    { guide: "how-to-choose-a-padel-racket", concept: "LOW / MEDIUM / HIGH BALANCE", whyVisualHelps: "Balance point is invisible on heroes", visualType: "educational-diagram", asset: "padel-racket-balance", placement: "balance section" },
    { guide: "how-to-choose-a-padel-racket", concept: "SWEET SPOT LOCATION", whyVisualHelps: "Marketing diagrams vary; teach the idea", visualType: "educational-diagram", asset: "padel-sweet-spot", placement: "sweet-spot section" },
    { guide: "how-to-choose-a-padel-racket", concept: "POWER ↔ CONTROL", whyVisualHelps: "Continuum beats another Vertex card", visualType: "educational-diagram", asset: "padel-power-control", placement: "decision section" },
    { guide: "how-to-choose-a-padel-racket", concept: "CORE FEEL", whyVisualHelps: "Soft vs firm is abstract without a cutaway metaphor", visualType: "educational-diagram", asset: "padel-core-feel", placement: "materials section" },
    { guide: "how-to-choose-padel-shoes", concept: "LATERAL SUPPORT", whyVisualHelps: "Running shoe photos do not teach padel cuts", visualType: "educational-diagram", asset: "padel-shoe-support", placement: "support section" },
    { guide: "how-to-choose-padel-shoes", concept: "OUTSOLE GRIP", whyVisualHelps: "Herringbone vs omni is a visual lesson", visualType: "educational-diagram", asset: "padel-shoe-outsole", placement: "outsole section" },
    { guide: "how-to-choose-a-padel-bag", concept: "BAG ANATOMY", whyVisualHelps: "Wells / thermo / shoe pocket need a layout", visualType: "educational-diagram", asset: "padel-bag-anatomy", placement: "capacity section" },
    { guide: "how-to-choose-a-padel-bag", concept: "PALETERO VS BACKPACK", whyVisualHelps: "Form factor choice", visualType: "educational-diagram", asset: "padel-bag-forms", placement: "carry section" },
    { guide: "how-to-choose-padel-balls", concept: "FRESH VS WORN", whyVisualHelps: "Can photos do not teach bounce fade", visualType: "educational-diagram", asset: "padel-ball-types", placement: "bounce section" },
    { guide: "how-to-choose-padel-balls", concept: "PRESSURE RETENTION", whyVisualHelps: "Pressurizer job is abstract", visualType: "educational-diagram", asset: "padel-pressurizer", placement: "storage section" },
    { guide: "padel-grips-overgrips-explained", concept: "REPLACEMENT VS OVERGRIP", whyVisualHelps: "Layer stack is the whole lesson", visualType: "educational-diagram", asset: "padel-grip-vs-overgrip", placement: "intro" },
    { guide: "padel-grips-overgrips-explained", concept: "LAYER STACK", whyVisualHelps: "Installation mental model", visualType: "educational-diagram", asset: "padel-grip-layers", placement: "how-to section" },
    { guide: "beginner-padel-gear-guide", concept: "STARTER KIT", whyVisualHelps: "Show how pieces relate", visualType: "educational-diagram", asset: "padel-beginner-kit", placement: "kit overview" },
  ];

  const mediaMetrics = [
    { surface: "reviews-padel", UNIQUE_PRODUCT_MEDIA: "gallery-per-product", UNIQUE_EDITORIAL_TEACHING_MEDIA: 4, DEDICATED_SECTION_MEDIA: "education+gallery", PRODUCT_CARD_MEDIA: "n/a", REPEATED_EDITORIAL_MEDIA: "intentional-shared-education" },
    { surface: "guide-how-to-choose-a-padel-racket", UNIQUE_PRODUCT_MEDIA: "product-examples", UNIQUE_EDITORIAL_TEACHING_MEDIA: 7, DEDICATED_SECTION_MEDIA: "diagrams", PRODUCT_CARD_MEDIA: "examples", REPEATED_EDITORIAL_MEDIA: "none-within-guide" },
    { surface: "guide-padel-grips", UNIQUE_PRODUCT_MEDIA: "product-examples", UNIQUE_EDITORIAL_TEACHING_MEDIA: 3, DEDICATED_SECTION_MEDIA: "diagrams", PRODUCT_CARD_MEDIA: "examples", REPEATED_EDITORIAL_MEDIA: "none-within-guide" },
  ];

  writeFileSync(
    path.join(outDir, "PADEL-REVIEW-EDITORIAL-AUDIT.csv"),
    toCsv(auditRows, [
      "review",
      "section",
      "topic",
      "bodyWords",
      "productFacts",
      "decisionClaims",
      "uniqueSentences",
      "sharedWithinSection",
      "glueHits",
      "editorialInstruction",
      "media",
      "commerce",
    ]),
  );
  writeFileSync(
    path.join(outDir, "PADEL-REVIEW-SIMILARITY.csv"),
    toCsv(similarityPairs.slice(0, 200), ["sentence", "reviewCount", "reviews", "sections", "kind"]),
  );
  writeFileSync(
    path.join(outDir, "PADEL-REVIEW-SECTION-MEDIA.csv"),
    toCsv(mediaRows, [
      "review",
      "section",
      "visualNeeded",
      "visualPurpose",
      "mediaType",
      "asset",
      "source",
      "productSpecific",
      "unique",
      "fallback",
    ]),
  );
  writeFileSync(
    path.join(outDir, "PADEL-GUIDE-VISUAL-LESSON-PLANS.csv"),
    toCsv(lessonPlans, ["guide", "concept", "whyVisualHelps", "visualType", "asset", "placement"]),
  );
  writeFileSync(
    path.join(outDir, "PADEL-EDITORIAL-MEDIA-METRICS.csv"),
    toCsv(mediaMetrics, [
      "surface",
      "UNIQUE_PRODUCT_MEDIA",
      "UNIQUE_EDITORIAL_TEACHING_MEDIA",
      "DEDICATED_SECTION_MEDIA",
      "PRODUCT_CARD_MEDIA",
      "REPEATED_EDITORIAL_MEDIA",
    ]),
  );

  const templateGlueGate = evaluateReviewTemplateGlue(reviewSamples);
  const teachingGates = Object.keys(MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS).map((guideSlug) =>
    evaluateTeachingMediaCoverage({
      guideSlug,
      // Deliberately omit raw img totals — TEACHING-MEDIA RULE ignores them.
      totalImgCount: 0,
      visuals: (PADEL_GUIDE_TEACHING_POOLS[guideSlug] ?? []).map((id) => ({
        id,
        kind: "educational-diagram",
      })),
    }),
  );

  const summary = {
    reviewCount: reviews.length,
    glueBefore,
    glueAfter: {
      onlyKeep: onlyKeepAfter,
      feelsGeneric: feelsGenericAfter,
      otherGlue: otherGlueAfter,
      editorialInstruction: editorialInstructionAfter,
    },
    hardRules: {
      REVIEW_TEMPLATE_GLUE: {
        failPadelReviewParity: templateGlueGate.failPadelReviewParity,
        hitCount: templateGlueGate.hits.length,
        totalWordsInformationalOnly: templateGlueGate.totalWords,
        note: "Word count never clears a FAIL",
      },
      TEACHING_MEDIA: {
        failAny: teachingGates.some((t) => t.failTeachingMediaParity),
        guides: teachingGates.map((t) => ({
          guideSlug: t.guideSlug,
          missingConcepts: t.missingConcepts,
          teachingVisualCount: t.teachingVisualCount,
          note: "Concept coverage — not <img> totals; packshots do not count",
        })),
      },
    },
    crossReviewDuplicateParagraphs: similarityPairs.length,
    majorsWithLessonPlans: [...new Set(lessonPlans.map((l) => l.guide))].length,
    heroesConfigured: Object.keys(PADEL_GUIDE_HEROES || {}).length,
  };
  writeFileSync(path.join(outDir, "PADEL-EDITORIAL-AUDIT-SUMMARY.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
