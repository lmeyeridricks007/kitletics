/**
 * Pre-launch 16 — generate NMW → LAUNCH_READY enrichment for Running products.
 * Writes src/content/running/nmw-completion-launch-ready.ts
 *
 * Rules: no new products; expert-research reviews; no fake first-hand testing;
 * nutrition = label/spec facts only; do not touch draft/BLOCKED SKUs.
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { getProducts, getCategoryById } from "@/repositories";
import { getComparisons } from "@/repositories/editorial";
import { readFileSync } from "fs";
import { skipSentenceFromLimitation } from "@/lib/review/rewrite-uniqueness-era-skip";

const PROD = { isDev: false as const };
const audit = JSON.parse(
  readFileSync("docs/prelaunch/data/02-product-quality.json", "utf8"),
);

const nmwSlugs = new Set(
  (audit.products as { slug: string; isRunning: boolean; classification: string }[])
    .filter((p) => p.isRunning && p.classification === "NEEDS_MINOR_WORK")
    .map((p) => p.slug),
);

const products = getProducts(PROD).filter((p) => nmwSlugs.has(p.slug));
const comparisons = getComparisons(PROD);

function reviewIdFor(productId: string): string {
  return `review-${productId.replace(/^prod-/, "")}`;
}

function words(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function softLower(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function positioningFor(categorySlug: string | undefined, name: string): string {
  switch (categorySlug) {
    case "running-clothing":
      return "running apparel";
    case "nutrition-fuel":
      return "race / training fuel";
    case "sunglasses":
      return "running sunglasses";
    case "running-belts":
      return "running belt";
    case "treadmills":
      return "home treadmill";
    default:
      return name.toLowerCase().includes("gel")
        ? "race / training fuel"
        : "running gear";
  }
}

function jobLine(p: {
  name: string;
  shortDescription?: string;
  strengths?: string[];
  categoryName?: string;
}): string {
  const lead =
    p.shortDescription?.trim() ||
    p.strengths?.[0] ||
    `${p.name} for ${p.categoryName ?? "running"}`;
  return words(lead).slice(0, 220);
}

function pauseLine(p: { weaknesses?: string[]; name: string }): string {
  return softLower(
    (p.weaknesses?.[0] || `sessions outside what the ${p.name} was built for`).slice(
      0,
      140,
    ),
  );
}

function shortlistLine(p: { strengths?: string[]; name: string }): string {
  return softLower(
    (p.strengths?.[0] || `a clear role for the ${p.name}`).slice(0, 120),
  );
}

function specLines(p: {
  specifications?: Record<string, unknown>;
  categorySlug?: string;
}): string[] {
  const specs = p.specifications ?? {};
  const keysByCat: Record<string, string[]> = {
    "running-clothing": [
      "fit",
      "fabric",
      "material",
      "weather",
      "pockets",
      "reflectivity",
      "weight",
      "genderFit",
    ],
    "nutrition-fuel": [
      "type",
      "form",
      "carbsPerServing",
      "calories",
      "caffeine",
      "caffeineAmount",
      "sodium",
      "servingSize",
    ],
    sunglasses: [
      "lensType",
      "lens",
      "weight",
      "coverage",
      "frame",
      "interchangeableLenses",
    ],
    "running-belts": ["capacity", "pockets", "fit", "flaskCompatible", "weight"],
    treadmills: [
      "motorPower",
      "beltSize",
      "maxSpeed",
      "incline",
      "folding",
      "maxUserWeight",
    ],
  };
  const prefer = keysByCat[p.categorySlug ?? ""] ?? Object.keys(specs);
  const lines: string[] = [];
  for (const key of prefer) {
    const v = specs[key];
    if (v === undefined || v === null || v === "") continue;
    const display = Array.isArray(v) ? v.join(", ") : String(v);
    if (!display.trim()) continue;
    lines.push(`${key}: ${display}`);
    if (lines.length >= 6) break;
  }
  if (!lines.length) {
    for (const [key, v] of Object.entries(specs)) {
      if (v === undefined || v === null || v === "") continue;
      const display = Array.isArray(v) ? v.join(", ") : String(v);
      if (!display.trim()) continue;
      lines.push(`${key}: ${display}`);
      if (lines.length >= 4) break;
    }
  }
  return lines;
}

function peerAlts(
  p: { id: string; categoryId: string; alternativeProductIds?: string[] },
  all: { id: string; categoryId: string; status: string }[],
): string[] {
  const existing = (p.alternativeProductIds ?? []).filter(Boolean);
  if (existing.length >= 2) return existing.slice(0, 3);
  const peers = all
    .filter(
      (x) =>
        x.categoryId === p.categoryId &&
        x.id !== p.id &&
        x.status === "published",
    )
    .slice(0, 3)
    .map((x) => x.id);
  return [...new Set([...existing, ...peers])].slice(0, 3);
}

type Seed = {
  productId: string;
  slug: string;
  title: string;
  name: string;
  job: string;
  shortlist: string;
  pause: string;
  pros: string[];
  cons: string[];
  alts: string[];
  score: number;
  specLines: string[];
};

type Patch = {
  familyId?: string;
  reviewId: string;
  verdict: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription?: string;
  strengths?: string[];
  weaknesses?: string[];
  alternativeProductIds: string[];
  positioningLabel: string;
  evidenceIds?: string[];
};

const allPublished = getProducts(PROD);
const seeds: Seed[] = [];
const patches: Record<string, Patch> = {};

// Skip products that already have a linked full review AND only media/weak leftovers
// (we'll still patch positioning/seo). Always emit review if missing.
for (const p of products) {
  const cat = getCategoryById(p.categoryId, PROD);
  const categorySlug = cat?.slug;
  const name = p.name;
  const fullName = p.fullName;
  const job = jobLine({
    name,
    shortDescription: p.shortDescription,
    strengths: p.strengths,
    categoryName: cat?.name,
  });
  const shortlist = shortlistLine(p);
  const pause = pauseLine(p);
  const pros = (p.strengths?.length ? p.strengths : [shortlist]).slice(0, 3);
  const cons = (p.weaknesses?.length ? p.weaknesses : [pause]).slice(0, 3);
  const alts = peerAlts(p, allPublished);
  const rid = reviewIdFor(p.id);
  const hasReview = Boolean(p.reviewId);

  // Treadmills already have reviews — deepen product fields only
  if (categorySlug === "treadmills" && hasReview) {
    patches[p.id] = {
      reviewId: p.reviewId!,
      familyId: p.familyId,
      positioningLabel: "home treadmill",
      verdict: `Buy the ${name} when ${softLower(job)}. It earns a look for ${shortlist}. ${skipSentenceFromLimitation(pause)}`,
      seoTitle: `${fullName}: Specs, Who It's For & Alternatives | Kitletics`,
      seoDescription: `${fullName} — who it's for, key specs, trade-offs and alternatives for home treadmill training.`,
      shortDescription:
        p.shortDescription && p.shortDescription.length >= 80
          ? p.shortDescription
          : `${fullName} is a home treadmill option for structured indoor running. Shortlist when ${shortlist}; pause when ${pause}.`,
      strengths: pros,
      weaknesses: cons,
      alternativeProductIds: alts,
      evidenceIds: [
        ...new Set([...(p.evidenceIds ?? []), "ev-catalog-editorial", "ev-catalog-mfr"]),
      ],
    };
    continue;
  }

  if (!hasReview) {
    seeds.push({
      productId: p.id,
      slug: p.slug,
      title: `${fullName} Review`,
      name,
      job,
      shortlist,
      pause,
      pros,
      cons,
      alts,
      score: Math.min(88, Math.max(78, Math.round((p.recommendationScore ?? 80) * 0.9))),
      specLines: specLines({
        specifications: p.specifications as Record<string, unknown>,
        categorySlug,
      }),
    });
  }

  const pos = positioningFor(categorySlug, name);
  patches[p.id] = {
    reviewId: hasReview ? p.reviewId! : rid,
    familyId: p.familyId,
    positioningLabel: pos,
    verdict: `Buy the ${name} when ${softLower(job)}. It earns a look for ${shortlist}. ${skipSentenceFromLimitation(pause)}`,
    seoTitle: `${fullName}: Specs, Who It's For & Alternatives | Kitletics`,
    seoDescription: `${fullName} — who it's for, key specs, trade-offs and alternatives.`,
    shortDescription:
      p.shortDescription && p.shortDescription.length >= 60
        ? p.shortDescription
        : `${fullName}: ${job}`,
    strengths: pros,
    weaknesses: cons,
    alternativeProductIds: alts,
    evidenceIds: [
      ...new Set([...(p.evidenceIds ?? []), "ev-catalog-editorial", "ev-catalog-mfr"]),
    ],
  };
}

// Ensure comparison links exist where we already have comps for nutrition/sunglasses
for (const [id, patch] of Object.entries(patches)) {
  const comps = comparisons.filter((c) => c.productIds.includes(id));
  if (comps.length && patch.alternativeProductIds.length < 2) {
    const other = comps
      .flatMap((c) => c.productIds)
      .filter((pid) => pid !== id);
    patch.alternativeProductIds = [
      ...new Set([...patch.alternativeProductIds, ...other]),
    ].slice(0, 3);
  }
}

const seedBlocks = seeds
  .map((s) => {
    return `  {
    productId: ${JSON.stringify(s.productId)},
    slug: ${JSON.stringify(s.slug)},
    title: ${JSON.stringify(s.title)},
    name: ${JSON.stringify(s.name)},
    job: ${JSON.stringify(s.job)},
    shortlist: ${JSON.stringify(s.shortlist)},
    pause: ${JSON.stringify(s.pause)},
    pros: ${JSON.stringify(s.pros)},
    cons: ${JSON.stringify(s.cons)},
    alts: ${JSON.stringify(s.alts)},
    score: ${s.score},
    specLines: ${JSON.stringify(s.specLines)},
  }`;
  })
  .join(",\n");

const patchBlocks = Object.entries(patches)
  .map(([id, patch]) => {
    const parts = [
      `    reviewId: ${JSON.stringify(patch.reviewId)}`,
      patch.familyId ? `    familyId: ${JSON.stringify(patch.familyId)}` : null,
      `    positioningLabel: ${JSON.stringify(patch.positioningLabel)}`,
      `    verdict: ${JSON.stringify(patch.verdict)}`,
      `    seoTitle: ${JSON.stringify(patch.seoTitle)}`,
      `    seoDescription: ${JSON.stringify(patch.seoDescription)}`,
      patch.shortDescription
        ? `    shortDescription: ${JSON.stringify(patch.shortDescription)}`
        : null,
      patch.strengths
        ? `    strengths: ${JSON.stringify(patch.strengths)}`
        : null,
      patch.weaknesses
        ? `    weaknesses: ${JSON.stringify(patch.weaknesses)}`
        : null,
      `    alternativeProductIds: ${JSON.stringify(patch.alternativeProductIds)}`,
      patch.evidenceIds
        ? `    evidenceIds: ${JSON.stringify(patch.evidenceIds)}`
        : null,
    ]
      .filter(Boolean)
      .join(",\n");
    return `  ${JSON.stringify(id)}: {\n${parts},\n  }`;
  })
  .join(",\n");

const out = `/**
 * Pre-launch 16 — NMW Running product completion.
 * Auto-generated from catalog strengths/specs (expert-research).
 * Do not invent first-hand testing. Nutrition = label/spec facts only.
 */

import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

type Patch = {
  familyId?: string;
  reviewId?: string;
  verdict: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription?: string;
  strengths?: string[];
  weaknesses?: string[];
  alternativeProductIds?: string[];
  positioningLabel: string;
  evidenceIds?: string[];
};

type ReviewSeed = {
  productId: string;
  slug: string;
  title: string;
  name: string;
  job: string;
  shortlist: string;
  pause: string;
  pros: string[];
  cons: string[];
  alts: string[];
  score: number;
  specLines: string[];
};

function reviewIdFor(productId: string): string {
  return \`review-\${productId.replace(/^prod-/, "")}\`;
}

function buildReview(seed: ReviewSeed): Review {
  const id = reviewIdFor(seed.productId);
  const whoBuy = [
    \`You want \${seed.shortlist} as a weekly priority — that is the \${seed.name}'s main job\`,
    \`Most of your sessions line up with this product's intended role more than an adjacent specialty\`,
    seed.pros[0]
      ? \`You specifically need \${seed.pros[0].toLowerCase()} more than a generic category pick\`
      : \`Your week matches the \${seed.name} role more often than not\`,
  ];
  const whoAvoid = [
    \`You need to avoid \${seed.pause} — forcing the \${seed.name} into that job usually disappoints\`,
    \`Your must-haves conflict with a \${seed.name} trade-off: \${seed.cons[0] ?? seed.pause}\`,
    \`Your fit, fueling, or carry needs sit outside what this product was built to do\`,
  ];
  const bottomLine = \`\${seed.job} I'd shortlist it when you want \${seed.shortlist}. \${skipSentenceFromLimitation(seed.pause)}\`;
  const verdict = \`Buy the \${seed.name} when \${seed.job.charAt(0).toLowerCase()}\${seed.job.slice(1)}. It earns a look for \${seed.shortlist}. \${skipSentenceFromLimitation(seed.pause)}\`;
  const specsBody = seed.specLines.length
    ? seed.specLines.map((l) => \`• \${l}\`).join("\\n")
    : "• See the product specifications panel for verified catalog fields";

  return {
    id,
    slug: seed.slug,
    productId: seed.productId,
    title: seed.title,
    reviewType: "expert-research",
    bottomLine,
    verdict,
    score: seed.score,
    summary: bottomLine,
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict. For nutrition products, treat carb/caffeine figures as label facts, not medical advice.",
    editorialDisclosure:
      "No brand-supplied product or sponsored testing applied to this review unless stated. Affiliate availability does not affect scores or verdict. Nutrition copy is limited to label/spec facts — not health or medical claims.",
    sections: [
      {
        id: "sec-overview",
        heading: "What it is",
        body: \`\${seed.job}\\n\\n\${seed.name} is built for a specific job — use that job as your first filter.\\n\\nI'd shortlist it when you want \${seed.shortlist}.\\n\\nI'd pause if \${seed.pause} would show up often in your week.\`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-verified-specs",
        heading: "Key specs",
        body: \`Here are the catalog fields that matter for the \${seed.name}:\\n\\n\${specsBody}\\n\\nTreat specs as filters, not the whole buying story.\`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-strengths",
        heading: "Where it is strongest",
        body: \`What it does well\\n\${seed.pros.map((p) => \`• \${p}\`).join("\\n")}\\n\\nIf those outcomes match your week, keep going. If not, check trade-offs and alternatives.\`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-tradeoffs",
        heading: "Trade-offs & limits",
        body: \`Compromises to weigh:\\n\${seed.cons.map((c) => \`• \${c}\`).join("\\n")}\\n\\nSkip it if you need to avoid \${seed.pause}.\`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-usecase",
        heading: "Who it is for",
        body: \`Best when\\n\${whoBuy.map((w) => \`• \${w}\`).join("\\n")}\\n\\nLook elsewhere when\\n\${whoAvoid.map((w) => \`• \${w}\`).join("\\n")}\`,
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-value",
        heading: "Value",
        body: \`You are mainly paying for \${seed.shortlist}. You are also accepting \${seed.pause} — fine when that is not your weekly mix. Check live street price in the offers module.\`,
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    pros: seed.pros.length ? seed.pros : [seed.shortlist],
    cons: seed.cons.length ? seed.cons : [seed.pause],
    whoShouldBuy: whoBuy,
    whoShouldAvoid: whoAvoid,
    alternativeProductIds: seed.alts,
    evidenceIds: ["ev-catalog-editorial", "ev-catalog-mfr"],
    faqIds: [],
    ...pub,
  };
}

const REVIEW_SEEDS: ReviewSeed[] = [
${seedBlocks}
];

export const nmwCompletionReviews: Review[] = REVIEW_SEEDS.map(buildReview);

export const NMW_COMPLETION_PATCHES: Record<string, Patch> = {
${patchBlocks}
};

export function applyNmwCompletionEnrichment(products: Product[]): Product[] {
  return products.map((product) => {
    const patch = NMW_COMPLETION_PATCHES[product.id];
    if (!patch) return product;
    const alternativeProductIds = [
      ...new Set([
        ...(patch.alternativeProductIds ?? []),
        ...(product.alternativeProductIds ?? []),
      ]),
    ];
    const evidenceIds = [
      ...new Set([
        ...(patch.evidenceIds ?? []),
        ...(product.evidenceIds ?? []),
      ]),
    ];
    return {
      ...product,
      familyId: patch.familyId ?? product.familyId,
      reviewId: patch.reviewId ?? product.reviewId,
      positioning: patch.positioningLabel,
      verdict: patch.verdict,
      seoTitle: patch.seoTitle,
      seoDescription: patch.seoDescription,
      shortDescription: patch.shortDescription ?? product.shortDescription,
      strengths: patch.strengths ?? product.strengths,
      weaknesses: patch.weaknesses ?? product.weaknesses,
      alternativeProductIds: alternativeProductIds.length
        ? alternativeProductIds
        : product.alternativeProductIds,
      evidenceIds: evidenceIds.length ? evidenceIds : product.evidenceIds,
    };
  });
}
`;

const outPath = join(
  process.cwd(),
  "src/content/running/nmw-completion-launch-ready.ts",
);
writeFileSync(outPath, out);
console.log(
  JSON.stringify(
    {
      nmwProducts: products.length,
      newReviews: seeds.length,
      patches: Object.keys(patches).length,
      outPath,
    },
    null,
    2,
  ),
);
