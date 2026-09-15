#!/usr/bin/env tsx
/**
 * Generate unique product-only review section images from each product hero.
 *
 * Writes: public/images/<sport>/products/<product-slug>/sections/<topic>.png
 *
 * Uses Sharp crops / lighting / framing variants so every topic gets a distinct
 * src derived from the authentic hero (never stamps the same file, never other brands).
 *
 *   npm run reviews:section-images
 *   npm run reviews:section-images -- --limit=20
 *   npm run reviews:section-images -- --slug=brooks-ghost-18
 *   npm run reviews:section-images -- --slugs=a,b,c
 *   npm run reviews:section-images -- --force
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getBrandById, getProductById, getReviews } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import {
  PADEL_GRIP_SECTION_IMAGE_TOPICS,
  PADEL_RACKET_SECTION_IMAGE_TOPICS,
  PADEL_SHOE_SECTION_IMAGE_TOPICS,
  PADEL_SOFT_SECTION_IMAGE_TOPICS,
} from "@/lib/review/padel-review-outline";

type Family = "running" | "watches" | "racket" | "fitness" | "general";

const SHOE_TOPICS = [
  "overview",
  "specs",
  "fit",
  "cushioning",
  "ride",
  "stability",
  "upper",
  "grip",
  "durability",
  "strengths",
  "tradeoffs",
  "performance",
  "usecase",
  "value",
  "assessment",
] as const;

const WATCH_TOPICS = [
  "overview",
  "specs",
  "tech",
  "performance",
  "fit",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
  "assessment",
] as const;

const RACKET_TOPICS = [
  "overview",
  "specs",
  "fit",
  "performance",
  "tech",
  "durability",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
] as const;

const FITNESS_TOPICS = [
  "overview",
  "specs",
  "fit",
  "performance",
  "tech",
  "durability",
  "strengths",
  "tradeoffs",
  "usecase",
  "value",
] as const;

const GENERIC_TOPICS = FITNESS_TOPICS;

type Topic = string;

type VariantRecipe = {
  /** Left crop fraction 0–1 */
  left: number;
  top: number;
  width: number;
  height: number;
  brightness: number;
  saturation: number;
  hue?: number;
  rotate?: number;
  /** Final canvas size */
  size: number;
};

/** Distinct framing/lighting per topic so files are unique and section-specific. */
const TOPIC_RECIPES: Record<string, VariantRecipe> = {
  overview: {
    left: 0.06,
    top: 0.06,
    width: 0.88,
    height: 0.88,
    brightness: 1.02,
    saturation: 1.04,
    size: 1000,
  },
  specs: {
    left: 0.14,
    top: 0.12,
    width: 0.72,
    height: 0.72,
    brightness: 1.06,
    saturation: 0.92,
    size: 1000,
  },
  fit: {
    left: 0.08,
    top: 0.02,
    width: 0.84,
    height: 0.7,
    brightness: 1.04,
    saturation: 1.02,
    size: 1000,
  },
  cushioning: {
    left: 0.1,
    top: 0.35,
    width: 0.8,
    height: 0.58,
    brightness: 1.08,
    saturation: 1.1,
    size: 1000,
  },
  ride: {
    left: 0.04,
    top: 0.18,
    width: 0.92,
    height: 0.7,
    brightness: 1.03,
    saturation: 1.06,
    rotate: -2,
    size: 1000,
  },
  stability: {
    left: 0.02,
    top: 0.12,
    width: 0.7,
    height: 0.78,
    brightness: 0.98,
    saturation: 0.96,
    size: 1000,
  },
  upper: {
    left: 0.12,
    top: 0.0,
    width: 0.76,
    height: 0.62,
    brightness: 1.05,
    saturation: 1.0,
    size: 1000,
  },
  grip: {
    left: 0.08,
    top: 0.48,
    width: 0.84,
    height: 0.48,
    brightness: 0.97,
    saturation: 1.08,
    size: 1000,
  },
  durability: {
    left: 0.18,
    top: 0.18,
    width: 0.7,
    height: 0.7,
    brightness: 0.95,
    saturation: 0.88,
    size: 1000,
  },
  strengths: {
    left: 0.05,
    top: 0.08,
    width: 0.86,
    height: 0.86,
    brightness: 1.07,
    saturation: 1.12,
    hue: 8,
    size: 1000,
  },
  tradeoffs: {
    left: 0.16,
    top: 0.1,
    width: 0.74,
    height: 0.8,
    brightness: 0.94,
    saturation: 0.9,
    hue: -12,
    size: 1000,
  },
  performance: {
    left: 0.02,
    top: 0.1,
    width: 0.9,
    height: 0.82,
    brightness: 1.05,
    saturation: 1.08,
    rotate: 1.5,
    size: 1000,
  },
  tech: {
    left: 0.2,
    top: 0.15,
    width: 0.6,
    height: 0.7,
    brightness: 1.04,
    saturation: 0.95,
    hue: -20,
    size: 1000,
  },
  usecase: {
    left: 0.0,
    top: 0.05,
    width: 0.95,
    height: 0.9,
    brightness: 1.01,
    saturation: 1.03,
    size: 1000,
  },
  value: {
    left: 0.22,
    top: 0.2,
    width: 0.56,
    height: 0.56,
    brightness: 1.09,
    saturation: 1.0,
    size: 1000,
  },
  assessment: {
    left: 0.1,
    top: 0.1,
    width: 0.8,
    height: 0.8,
    brightness: 1.0,
    saturation: 1.05,
    size: 1000,
  },
};

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

function categoryFamily(categoryId: string): Family {
  // Keep in sync with src/lib/review/resolve-section-visuals.ts
  if (/watch|gps|hrm|heart.?rate/i.test(categoryId)) return "watches";
  if (/cat-padel-|padel/i.test(categoryId)) return "racket";
  if (
    /running|shoe|sock|belt|light|headphone|pack|hydrat|sunglass|recovery|safety/i.test(
      categoryId,
    )
  ) {
    return "running";
  }
  if (
    /tennis|squash|badminton|pickleball|racket|paddle|grip|ball/i.test(
      categoryId,
    )
  ) {
    return "racket";
  }
  if (
    /air-bike|treadmill|weight|dumbbell|barbell|kettle|row|ski|rack|bench|plate|gym|ring|parallette|pull-up|vest|functional|flooring|storage|lifting/i.test(
      categoryId,
    )
  ) {
    return "fitness";
  }
  return "general";
}

function sportFoldersFor(family: Family, heroSrc?: string): string[] {
  const primary =
    family === "racket"
      ? "padel"
      : family === "watches"
        ? "watches"
        : family === "fitness"
          ? "home"
          : "running";
  const fromHero = heroSrc?.match(/^\/images\/([^/]+)\//)?.[1];
  const folders = [primary];
  if (fromHero && fromHero !== primary && !folders.includes(fromHero)) {
    folders.push(fromHero);
  }
  return folders;
}

function topicsFor(family: Family, categoryId: string): Topic[] {
  if (family === "watches") return [...WATCH_TOPICS];
  if (categoryId === "cat-padel-rackets") {
    return [...PADEL_RACKET_SECTION_IMAGE_TOPICS];
  }
  if (categoryId === "cat-padel-shoes") {
    return [...PADEL_SHOE_SECTION_IMAGE_TOPICS];
  }
  if (categoryId === "cat-padel-grips") {
    return [...PADEL_GRIP_SECTION_IMAGE_TOPICS];
  }
  if (
    categoryId === "cat-padel-bags" ||
    categoryId === "cat-padel-balls" ||
    categoryId === "cat-padel-accessories"
  ) {
    return [...PADEL_SOFT_SECTION_IMAGE_TOPICS];
  }
  if (family === "racket") return [...RACKET_TOPICS];
  if (family === "fitness") return [...FITNESS_TOPICS];
  if (/shoe/i.test(categoryId)) return [...SHOE_TOPICS];
  return [...GENERIC_TOPICS];
}

function publicPathFromSrc(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}

function recipeFor(topic: Topic, index: number): VariantRecipe {
  const base = TOPIC_RECIPES[topic] ?? {
    left: 0.08 + (index % 5) * 0.03,
    top: 0.08 + (index % 4) * 0.04,
    width: 0.78,
    height: 0.78,
    brightness: 1 + (index % 3) * 0.02,
    saturation: 1,
    size: 1000,
  };
  return base;
}

async function writeSectionVariant(input: {
  heroAbs: string;
  outAbs: string;
  topic: Topic;
  index: number;
}): Promise<boolean> {
  const recipe = recipeFor(input.topic, input.index);
  const image = sharp(input.heroAbs, { failOn: "none" }).rotate(); // honor EXIF
  const meta = await image.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < 64 || h < 64) return false;

  const left = Math.max(0, Math.min(w - 8, Math.floor(w * recipe.left)));
  const top = Math.max(0, Math.min(h - 8, Math.floor(h * recipe.top)));
  const width = Math.max(
    8,
    Math.min(w - left, Math.floor(w * recipe.width)),
  );
  const height = Math.max(
    8,
    Math.min(h - top, Math.floor(h * recipe.height)),
  );

  let pipeline = sharp(input.heroAbs, { failOn: "none" })
    .rotate()
    .extract({ left, top, width, height });

  if (recipe.rotate) {
    pipeline = pipeline.rotate(recipe.rotate, {
      background: { r: 245, g: 245, b: 247, alpha: 1 },
    });
  }

  pipeline = pipeline.modulate({
    brightness: recipe.brightness,
    saturation: recipe.saturation,
    ...(typeof recipe.hue === "number" ? { hue: recipe.hue } : {}),
  });

  // Topic-tinted subtle grade so variants stay distinct even on similar crops.
  const tintByTopic: Record<string, { r: number; g: number; b: number }> = {
    cushioning: { r: 235, g: 245, b: 255 },
    tech: { r: 230, g: 240, b: 255 },
    tradeoffs: { r: 245, g: 240, b: 235 },
    strengths: { r: 255, g: 248, b: 235 },
    grip: { r: 240, g: 240, b: 240 },
    durability: { r: 235, g: 235, b: 235 },
  };
  const tint = tintByTopic[input.topic];
  if (tint) {
    pipeline = pipeline.tint(tint);
  }

  mkdirSync(path.dirname(input.outAbs), { recursive: true });
  await pipeline
    .resize(recipe.size, recipe.size, {
      fit: "cover",
      position: "centre",
      background: { r: 245, g: 245, b: 247, alpha: 1 },
    })
    .png({ compressionLevel: 8 })
    .toFile(input.outAbs);

  return existsSync(input.outAbs);
}

async function main(): Promise<void> {
  const force = flag("force");
  const onlySlug = arg("slug");
  const slugsArg = arg("slugs");
  const slugSet = slugsArg
    ? new Set(slugsArg.split(",").map((s) => s.trim()).filter(Boolean))
    : null;
  const limit = arg("limit") ? Number(arg("limit")) : undefined;

  const reviews = getReviews({ isDev: true })
    .filter((r) => r.status === "published")
    .filter((r) => {
      if (onlySlug) return r.slug === onlySlug;
      if (slugSet) return slugSet.has(r.slug);
      return true;
    });

  let created = 0;
  let skipped = 0;
  let failed = 0;
  let products = 0;

  for (const review of reviews) {
    if (limit != null && products >= limit) break;
    const product = getProductById(review.productId, { isDev: true });
    if (!product) continue;
    const hero = getPrimaryProductMedia(product);
    if (!hero?.src || hero.src.includes("/fallbacks/") || hero.src.endsWith(".svg")) {
      console.warn(`skip ${product.slug}: no authentic hero`);
      failed += 1;
      continue;
    }
    const heroAbs = publicPathFromSrc(hero.src);
    if (!existsSync(heroAbs)) {
      console.warn(`skip ${product.slug}: missing file ${hero.src}`);
      failed += 1;
      continue;
    }

    products += 1;
    const family = categoryFamily(product.categoryId);
    const folders = sportFoldersFor(family, hero.src);
    const topics = topicsFor(family, product.categoryId);

    for (const sport of folders) {
      const outDir = path.join(
        process.cwd(),
        "public",
        "images",
        sport,
        "products",
        product.slug,
        "sections",
      );
      mkdirSync(outDir, { recursive: true });

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]!;
        const outAbs = path.join(outDir, `${topic}.png`);
        const already = [".png", ".jpg", ".jpeg", ".webp"].some((ext) =>
          existsSync(path.join(outDir, `${topic}${ext}`)),
        );
        if (!force && already) {
          skipped += 1;
          continue;
        }
        try {
          const ok = await writeSectionVariant({
            heroAbs,
            outAbs,
            topic,
            index: i,
          });
          if (ok) {
            created += 1;
          } else {
            failed += 1;
            console.warn(`fail ${product.slug}/${sport}/${topic}: empty output`);
          }
        } catch (err) {
          failed += 1;
          console.warn(
            `fail ${product.slug}/${sport}/${topic}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    }
  }

  // Spot-check enriched pages for section-image gate.
  const sampleSlugs = onlySlug
    ? [onlySlug]
    : slugSet
      ? [...slugSet].slice(0, 4)
      : ["nike-vomero-18", "dunlop-cx-200", "garmin-forerunner-970", "rep-pr-5000"];
  let passSamples = 0;
  for (const slug of sampleSlugs) {
    const review = reviews.find((r) => r.slug === slug);
    if (!review) continue;
    const product = getProductById(review.productId, { isDev: true });
    if (!product) continue;
    const brand = getBrandById(product.brandId, { isDev: true });
    const enriched = enrichReviewForPage(review, product, {
      brand,
      productHero: getPrimaryProductMedia(product),
    });
    const skip = /buying checklist|before you buy|decision guide|who should/i;
    const major = enriched.sections.filter(
      (s) => !skip.test(`${s.id} ${s.heading}`),
    );
    const srcs = major
      .map((s) => s.image?.src)
      .filter((src): src is string => Boolean(src));
    const unique = new Set(srcs);
    const productOwned = srcs.filter((src) =>
      src.includes(`/products/${product.slug}/sections/`),
    );
    const ok =
      unique.size === srcs.length &&
      productOwned.length >= Math.min(major.length, 6) &&
      srcs.length >= Math.min(major.length, 6);
    console.log(
      `check ${slug}: ${ok ? "PASS" : "FAIL"} owned=${productOwned.length}/${major.length} unique=${unique.size}/${srcs.length}`,
    );
    if (ok) passSamples += 1;
  }

  console.log(
    JSON.stringify(
      {
        products,
        created,
        skippedExisting: skipped,
        failed,
        samplePass: passSamples,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
