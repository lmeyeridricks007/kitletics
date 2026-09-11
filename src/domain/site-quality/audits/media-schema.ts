import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProducts,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getBrands,
} from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type { SiteIssue } from "../types";
import { issue } from "../issues";

export function auditMedia(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const products = getProducts();
  const FLAGSHIP =
    /running-shoes|padel-shoes|tennis-shoes|training-shoes|padel-rackets|tennis-rackets|gps-watch|heart-rate|power-rack|adjustable-dumbbell/i;

  let missingHero = 0;
  let missingFlagship = 0;
  let placeholder = 0;
  let brokenFile = 0;
  const missingSlugs: string[] = [];

  // Full catalog for flagship; first-200 sample still informs accessory gaps
  const sample = products.slice(0, 200);
  const flagshipProducts = products.filter((p) => FLAGSHIP.test(p.categoryId || ""));

  for (const p of flagshipProducts) {
    const media = getPrimaryProductMedia(p);
    if (!media?.src) {
      missingFlagship += 1;
      if (missingSlugs.length < 12) missingSlugs.push(p.slug);
      continue;
    }
    if (/placeholder|dummy|coming-soon|unavailable/i.test(media.src + (media.alt ?? ""))) {
      placeholder += 1;
    }
    if (media.src.startsWith("/")) {
      const abs = join(process.cwd(), "public", media.src.replace(/^\//, ""));
      if (!existsSync(abs)) brokenFile += 1;
    }
  }

  for (const p of sample) {
    if (FLAGSHIP.test(p.categoryId || "")) continue;
    const media = getPrimaryProductMedia(p);
    if (!media?.src) missingHero += 1;
  }

  if (missingFlagship > 0) {
    issues.push(
      issue("MEDIA", missingFlagship > 10 ? "HIGH" : "MEDIUM", "media", {
        idSuffix: "001",
        evidence: `${missingFlagship} flagship-category products missing authentic primary media (${missingSlugs.join(", ")}${missingFlagship > missingSlugs.length ? "…" : ""})`,
        whyItMatters: "Commercial shoe/racket/watch pages without authentic images look unfinished and hurt trust",
        recommendedFix: "bash scripts/fetch-media-gaps.sh; npm run media:audit -- --write; prioritize flagship SKUs",
        canAutoFix: false,
        owner: "Editorial",
        effort: "L",
        impact: "High",
      }),
    );
  } else {
    issues.push(
      issue("MEDIA", "INFO", "media", {
        idSuffix: "001",
        evidence: `0/${flagshipProducts.length} flagship-category products missing authentic primary media`,
        whyItMatters: "Flagship commercial pages need authentic heroes",
        recommendedFix: "Keep running bash scripts/fetch-media-gaps.sh after catalog expansions",
        canAutoFix: false,
        owner: "Editorial",
        status: "resolved",
      }),
    );
  }

  const accessoryMissing = missingHero;
  if (accessoryMissing > 0) {
    issues.push(
      issue("MEDIA", accessoryMissing > 25 ? "MEDIUM" : "LOW", "media", {
        idSuffix: "ACCESSORY",
        evidence: `${accessoryMissing} non-flagship products in sample still lack authentic primary media (accessories/apparel/etc.)`,
        whyItMatters: "Accessory pages should get real packshots when feasible; lower priority than shoes/rackets",
        recommendedFix: "npm run media:agent -- --mode=audit --write; source manufacturer/authorized retailer heroes",
        canAutoFix: false,
        owner: "Editorial",
        effort: "L",
        impact: "Medium",
      }),
    );
  }
  if (placeholder > 0) {
    issues.push(
      issue("MEDIA", "HIGH", "media", {
        evidence: `${placeholder} products look like placeholder/dummy media paths`,
        whyItMatters: "Dummy imagery is a launch blocker on commercial pages",
        recommendedFix: "Replace with authentic manufacturer/authorized photography",
        canAutoFix: false,
        owner: "Editorial",
      }),
    );
  }
  if (brokenFile > 0) {
    issues.push(
      issue("MEDIA", "HIGH", "media", {
        evidence: `${brokenFile} product hero files missing under public/`,
        whyItMatters: "Broken images create layout shift and poor UX",
        recommendedFix: "Restore files or update media registry paths",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
  }

  void getReviews;
  void getBestGuides;
  void getBuyingGuides;
  void getBrands;

  return issues;
}

export function auditSchemaPresence(): SiteIssue[] {
  const issues: SiteIssue[] = [];
  const jsonldPath = join(process.cwd(), "src/lib/seo/jsonld.tsx");
  if (!existsSync(jsonldPath)) {
    issues.push(
      issue("SCHEMA", "BLOCKER", "structured-data", {
        evidence: "Missing src/lib/seo/jsonld.tsx",
        whyItMatters: "No structured data builders",
        recommendedFix: "Restore JSON-LD helpers",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
    return issues;
  }

  const src = readFileSync(jsonldPath, "utf8");
  for (const fn of [
    "productJsonLd",
    "reviewJsonLd",
    "breadcrumbJsonLd",
    "articleJsonLd",
    "faqPageJsonLd",
  ]) {
    if (!src.includes(`export function ${fn}`) && !src.includes(`function ${fn}`)) {
      issues.push(
        issue("SCHEMA", "HIGH", "structured-data", {
          evidence: `Missing ${fn} builder`,
          whyItMatters: "Page-type schema coverage incomplete",
          recommendedFix: `Implement ${fn} without fabricating AggregateRating`,
          canAutoFix: false,
          owner: "Engineering",
        }),
      );
    }
  }

  if (/aggregateRating|AggregateRating/i.test(src) && /Math\.random|fakeRating|placeholderRating/i.test(src)) {
    issues.push(
      issue("SCHEMA", "BLOCKER", "structured-data", {
        evidence: "Suspicious AggregateRating generation in jsonld",
        whyItMatters: "Fabricated ratings violate trust and Google guidelines",
        recommendedFix: "Remove fake AggregateRating; only emit real offers/reviews",
        canAutoFix: false,
        owner: "Engineering",
      }),
    );
  } else {
    issues.push(
      issue("SCHEMA", "INFO", "structured-data", {
        evidence: "JSON-LD builders present; no fabricated AggregateRating pattern detected",
        whyItMatters: "Baseline schema hygiene",
        recommendedFix: "Validate with Rich Results on representative URLs after deploy",
        canAutoFix: false,
        owner: "SEO",
        status: "resolved",
      }),
    );
  }

  return issues;
}
