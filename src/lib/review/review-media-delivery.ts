import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  isKnownUndeployablePublicImagePath,
  isRenderableReviewMediaSrc,
  resolveDeliverableMediaSrc,
} from "@/lib/media/deliverable-media-src";
import {
  assessmentVisual,
  resolveReviewSectionVisuals,
} from "@/lib/review/resolve-section-visuals";
import type { ContentSection } from "@/domain/editorial/types";
import type { MediaAsset } from "@/domain/shared/types";
import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";

/** Exact-case filesystem existence (Linux/Vercel-safe). */
export function exactCasePublicFileExists(publicUrlPath: string): boolean {
  if (!publicUrlPath.startsWith("/")) return false;
  const abs = path.join(process.cwd(), "public", ...publicUrlPath.split("/").filter(Boolean));
  if (!existsSync(abs)) return false;

  // Walk from public/ verifying each path segment's exact case.
  let current = path.join(process.cwd(), "public");
  const segments = publicUrlPath.split("/").filter(Boolean);
  for (const segment of segments) {
    let names: string[];
    try {
      names = readdirSync(current);
    } catch {
      return false;
    }
    if (!names.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}

export function collectResolvedReviewMediaSrcs(input: {
  review: Review;
  product: Product;
  productImages: MediaAsset[];
  heroSrc?: string;
}): string[] {
  const sections = resolveReviewSectionVisuals(input.review.sections ?? [], {
    productHero: input.product.images?.[0],
    productImages: input.productImages,
    productSlug: input.product.slug,
    categoryId: input.product.categoryId,
    reviewId: input.review.id,
  });

  const assessment = assessmentVisual({
    seedInput: input.review.id,
    productSlug: input.product.slug,
    categoryId: input.product.categoryId,
    heroSrc: input.heroSrc ?? input.productImages[0]?.src,
    productImages: input.productImages,
  });

  const srcs: string[] = [];
  if (input.heroSrc && isRenderableReviewMediaSrc(input.heroSrc)) {
    srcs.push(input.heroSrc);
  }
  if (assessment?.src && isRenderableReviewMediaSrc(assessment.src)) {
    srcs.push(assessment.src);
  }
  for (const section of sections) {
    const src = section.image?.src;
    if (src && isRenderableReviewMediaSrc(src)) srcs.push(src);
  }
  return srcs;
}

export type MediaDeliveryClass =
  | "VALID_LOCAL_ASSET"
  | "VALID_REMOTE_ASSET"
  | "INTENTIONAL_NO_IMAGE"
  | "MISSING_LOCAL_ASSET"
  | "HTTP_404"
  | "HTTP_403"
  | "INVALID_IMAGE_RESPONSE"
  | "BAD_PUBLIC_PATH"
  | "UNSUPPORTED_REMOTE_HOST"
  | "STALE_REFERENCE"
  | "CASE_MISMATCH"
  | "OTHER_BROKEN";

export function classifyResolvedMediaSrcSync(src: string): MediaDeliveryClass {
  if (!src) return "INTENTIONAL_NO_IMAGE";
  if (!isRenderableReviewMediaSrc(src)) {
    if (isKnownUndeployablePublicImagePath(src)) return "STALE_REFERENCE";
    return "BAD_PUBLIC_PATH";
  }
  if (/^https:\/\//i.test(src)) {
    try {
      // Host allow-list for review remotes we intentionally emit.
      const host = new URL(src).hostname;
      const allowed = new Set([
        "cdn.shopify.com",
        "res.garmin.com",
        "eu.wahoofitness.com",
        "images.asics.com",
        "images.ctfassets.net",
        "7ulvvexjky4ctpnj.public.blob.vercel-storage.com",
      ]);
      if (!allowed.has(host) && !host.endsWith(".public.blob.vercel-storage.com")) {
        // Still potentially fine — mark for HTTP check, not unsupported yet.
      }
      return "VALID_REMOTE_ASSET"; // HTTP status refined async
    } catch {
      return "BAD_PUBLIC_PATH";
    }
  }
  if (src.startsWith("/media/")) {
    if (!existsSync(path.join(process.cwd(), "public", ...src.split("/").filter(Boolean)))) {
      return "MISSING_LOCAL_ASSET";
    }
    if (!exactCasePublicFileExists(src)) return "CASE_MISMATCH";
    return "VALID_LOCAL_ASSET";
  }
  if (src.startsWith("/images/")) {
    // Gitignored tree: prefer exact local when present; otherwise treat as
    // Blob-contract and verify via HTTP in the async pass.
    const abs = path.join(process.cwd(), "public", ...src.split("/").filter(Boolean));
    if (existsSync(abs)) {
      return exactCasePublicFileExists(src) ? "VALID_LOCAL_ASSET" : "CASE_MISMATCH";
    }
    return "VALID_REMOTE_ASSET"; // pending HEAD against production /images rewrite
  }
  return "BAD_PUBLIC_PATH";
}

/** Remap a catalog MediaAsset to the URL the review UI should render. */
export function deliverableSrcForAsset(img: MediaAsset): string | undefined {
  const src = resolveDeliverableMediaSrc({
    src: img.src,
    sourceUrl: img.sourceUrl,
  });
  return isRenderableReviewMediaSrc(src) ? src : undefined;
}

export function stripUndeployableSectionImages(
  sections: ContentSection[],
): ContentSection[] {
  return sections.map((section) => {
    if (!section.image?.src) return section;
    if (isRenderableReviewMediaSrc(section.image.src)) return section;
    return { ...section, image: undefined };
  });
}
