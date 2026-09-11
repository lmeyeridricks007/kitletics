/**
 * Invoke `reviews:section-images` for specific review/product slugs.
 * Used by the media→publish path after newly promoted SKUs get reviews.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

export function runReviewSectionImagesForSlugs(
  slugs: string[],
  options: { dryRun?: boolean } = {},
): { ok: boolean; skipped: boolean } {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (!unique.length) return { ok: true, skipped: true };

  if (options.dryRun) {
    console.log(
      `[dry-run] would run reviews:section-images --slugs=${unique.join(",")}`,
    );
    return { ok: true, skipped: false };
  }

  console.log(
    `\nPublish path: generating section images for ${unique.length} slug(s)…`,
  );
  const script = path.join(
    process.cwd(),
    "scripts/generate-review-section-images.ts",
  );
  const res = spawnSync(
    "npx",
    [
      "tsx",
      "--tsconfig",
      "tsconfig.json",
      script,
      `--slugs=${unique.join(",")}`,
    ],
    {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
    },
  );
  if (res.status !== 0) {
    console.error("reviews:section-images failed in publish path");
    return { ok: false, skipped: false };
  }
  return { ok: true, skipped: false };
}
