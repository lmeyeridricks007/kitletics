/**
 * Editorial Completion 46 — intent-role differentiation for Best ↔ Category
 * and residual Best ↔ Best pairs. Prefer role clarity over deleting URLs.
 */
import type { BestGuide } from "@/domain/editorial/types";

interface IntentRolePatch {
  /** Appended once to intro when missing */
  introSuffix?: string;
  /** Browse path for the matching category (anti-doorway) */
  categoryBrowseHref?: string;
  categoryBrowseLabel?: string;
  /** Sibling Best slugs that own narrower jobs */
  siblingBestSlugs?: string[];
}

const CATEGORY_MIRROR_PATCHES: Record<string, IntentRolePatch> = {
  "running-shoes": {
    introSuffix:
      " This page is not the Running Shoes category catalog: the category is for browsing and filtering the full grid. Stay here for ranked role winners (daily, race, stability, trail, and related jobs).",
    categoryBrowseHref: "/running/shoes",
    categoryBrowseLabel: "Browse all running shoes",
    siblingBestSlugs: [
      "daily-trainers",
      "race-shoes",
      "stability-running-shoes",
      "trail-running-shoes",
      "running-shoes-beginners",
    ],
  },
  "running-watches": {
    introSuffix:
      " This page is not the GPS Watches category catalog: browse and filter the full watch grid there. Stay here for an umbrella shortlist across roles; use beginners / budget / trail / ultra / music / small-wrist guides when that constraint is already known.",
    categoryBrowseHref: "/running/watches",
    categoryBrowseLabel: "Browse all GPS watches",
    siblingBestSlugs: [
      "running-watches-beginners",
      "running-watches-budget",
      "running-watches-trail",
      "running-watches-ultra",
      "running-watches-small-wrists",
    ],
  },
  "heart-rate-monitors-running": {
    introSuffix:
      " This page is not the Heart Rate Monitors category catalog: browse the full HRM grid there. Stay here for a ranked running HR shortlist; use chest-strap or intervals guides when form-factor or workout type is already decided.",
    categoryBrowseHref: "/running/heart-rate-monitors",
    categoryBrowseLabel: "Browse all heart rate monitors",
    siblingBestSlugs: [
      "heart-rate-monitors-chest-straps",
      "heart-rate-monitors-intervals",
    ],
  },
  "running-belts": {
    introSuffix:
      " This page is not the Running Belts category catalog — that grid is for browsing. Stay here for ranked bounce-control / carry roles.",
    categoryBrowseHref: "/running/belts",
    categoryBrowseLabel: "Browse all running belts",
  },
  "running-headphones": {
    introSuffix:
      " This page is not the Headphones category catalog — browse the full grid there. Stay here for ranked outdoor-awareness and fit roles.",
    categoryBrowseHref: "/running/headphones",
    categoryBrowseLabel: "Browse all running headphones",
  },
  "running-socks": {
    introSuffix:
      " This page is not the Running Socks category catalog — browse and filter there. Stay here for blister / cushion / climate role winners.",
    categoryBrowseHref: "/running/socks",
    categoryBrowseLabel: "Browse all running socks",
  },
  "running-sunglasses": {
    introSuffix:
      " This page is not the Sunglasses category catalog — browse the full grid there. Stay here for coverage / lens / fit role winners.",
    categoryBrowseHref: "/running/sunglasses",
    categoryBrowseLabel: "Browse all running sunglasses",
  },
  "handheld-running-bottles": {
    introSuffix:
      " This page shortlists handheld bottles. For the learning framework (when handhelds beat vests/belts, strap fatigue, volume), read Handheld Bottles for Running — then return here to pick a product.",
    siblingBestSlugs: ["running-hydration-vests", "running-belts"],
  },
};

/**
 * Pages held from indexation purely for intent cannibalization.
 * Prefer differentiation; only list here when two weak URLs should not both index.
 * (Empty after P46 audit — complementary roles kept; soft-gates live elsewhere.)
 */
export const EDITORIAL_INTENT_HOLD_PATHS = new Set<string>([
  // Example future: "/best/duplicate-slug",
]);

export function applyBestGuideP46IntentRoles(guides: BestGuide[]): BestGuide[] {
  return guides.map((guide) => {
    const patch = CATEGORY_MIRROR_PATCHES[guide.slug];
    if (!patch) return guide;

    let intro = guide.intro ?? "";
    if (patch.introSuffix && !intro.includes(patch.introSuffix.slice(0, 48))) {
      intro = `${intro}${patch.introSuffix}`;
    }

    const related = new Set(guide.relatedGuideIds ?? []);
    for (const slug of patch.siblingBestSlugs ?? []) {
      const id = `best-${slug}`;
      related.add(id);
    }

    const howWeChooseExtra =
      patch.categoryBrowseHref && patch.categoryBrowseLabel
        ? ` Prefer this shortlist when you want role winners; use ${patch.categoryBrowseLabel} (${patch.categoryBrowseHref}) when you want to explore the full filterable catalog.`
        : undefined;

    return {
      ...guide,
      intro,
      relatedGuideIds: [...related],
      methodologySummary: howWeChooseExtra
        ? `${guide.methodologySummary ?? ""}${howWeChooseExtra}`.trim()
        : guide.methodologySummary,
    };
  });
}
