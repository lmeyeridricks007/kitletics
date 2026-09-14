import { getAuthorById, getBrandById, getEvidenceForIds, getProductById } from "@/repositories";
import { canPublishReview } from "@/lib/review/can-publish";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { flattenPublicContent } from "@/lib/review/public-content-corruption";
import { REPORT_OR_JUNK_VOICE } from "@/lib/review/review-voice";
import { padelEstateReviews } from "@/content/padel/reviews";

const PATTERNS: Array<[string, RegExp]> = [
  ["already decided the lane", /already decided the lane/i],
  ["headline trait", /headline trait/i],
  ["whatever optimizes", /whatever\s+\S[\s\S]{0,40}?optimizes for/i],
  ["shows up more often", /shows up more often in your plan/i],
  ["gates A-Z", /gates\s+[A-Z]/],
  ["intendedJob", /\bintendedJob\b/],
  ["one-tool-for-every-session", /one-tool-for-every-session/i],
  ["walk if", /\bwalk if\b/i],
  ["is why you walk", /is why you walk/i],
  ["catalog pass", /catalog pass/i],
  ["concatenated", /\bconcatenated\b/i],
  ["token(s)", /\btokens?\b/i],
  ["SKU", /\bSKU\b/],
  ["taxonomy", /\btaxonomy\b/i],
  ["use-case ids", /use-case ids?\b/i],
  ["when its main job matches", /when its main job matches most of your week/i],
  ["catalogued as a", /catalogued as a /i],
  ["not a crossover default", /not a crossover default/i],
  ["catalog role makes sense", /catalog role makes sense/i],
  ["keep paying for week after week", /keep paying for week after week/i],
  ["Kitletics Expert Research Review", /Kitletics Expert Research Review\. How we assessed it:/i],
  ["is built for a specific job", /is built for a specific job — use that job as your first filter/i],
  ["Here are the catalog fields", /Here are the catalog fields that matter/i],
];

function findJunk(text: string) {
  const re = new RegExp(REPORT_OR_JUNK_VOICE.source, "gi");
  const hits: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    hits.push(
      text
        .slice(Math.max(0, m.index - 50), Math.min(text.length, m.index + m[0].length + 50))
        .replace(/\s+/g, " "),
    );
    if (hits.length > 4) break;
  }
  return hits;
}

function findMachine(text: string) {
  return PATTERNS.filter(([, re]) => re.test(text)).map(([n]) => n);
}

for (const review of padelEstateReviews) {
  const product = getProductById(review.productId, { isDev: true });
  if (!product) continue;
  const brand = getBrandById(product.brandId);
  const evidence = getEvidenceForIds(review.evidenceIds ?? []);
  const author = review.reviewerId ? getAuthorById(review.reviewerId) : null;
  const gate = canPublishReview({ review, product, author, evidence });
  const seedText = flattenPublicContent(review);
  const publicText = [
    review.summary,
    review.verdict,
    review.bottomLine,
    ...(review.pros ?? []),
    ...(review.cons ?? []),
    ...review.sections.map((s) => `${s.heading} ${s.body}`),
    ...(review.whoShouldBuy ?? []),
    ...(review.whoShouldAvoid ?? []),
    review.testingContext ?? "",
  ].join("\n");
  const enriched = enrichReviewForPage(review, product, { brand });
  const enrText = [enriched.summary, enriched.verdict, ...enriched.sections.map((s) => s.body)].join(
    "\n",
  );
  console.log(review.slug);
  console.log("  gate", gate.ok, gate.issues.map((i) => i.code).join(",") || "-");
  console.log("  seedMachine", findMachine(seedText).join("|") || "-");
  console.log("  pubMachine", findMachine(publicText).join("|") || "-");
  console.log("  enrMachine", findMachine(enrText).join("|") || "-");
  const junkHits = findJunk(enrText);
  console.log("  junkHits", junkHits.length ? junkHits.join(" || ") : "-");
}
