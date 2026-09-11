import { Suspense } from "react";
import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { ThemeToggle } from "./ThemeToggle";
import { SiteHeaderClient } from "./SiteHeaderClient";
import {
  getSports,
  getCategories,
  getProductsByCategory,
  getCategoriesBySport,
  getSportBySlug,
  getBestGuides,
  getReviews,
  getBuyingGuides,
  getTools,
  getGearSetups,
} from "@/repositories";
import { GEAR_MENU_FEATURED_SLUGS } from "@/lib/navigation/config";
import type { RegionCode } from "@/domain/shared/types";

/** Default region for static shell — RegionSelector hydrates from cookie client-side. */
const HEADER_DEFAULT_REGION: RegionCode = "NL";

export async function SiteHeader() {
  const sports = getSports();
  const categories = getCategories();
  const running = getSportBySlug("running");
  const runningCats = running ? getCategoriesBySport(running.id) : [];
  const featuredCategories = runningCats
    .filter((c) =>
      (GEAR_MENU_FEATURED_SLUGS as readonly string[]).includes(c.slug),
    )
    .filter((c) => getProductsByCategory(c.id).length > 0);
  const initialRegion = HEADER_DEFAULT_REGION;

  const categoryCounts: Record<string, number> = {};
  for (const cat of featuredCategories) {
    categoryCounts[cat.id] = getProductsByCategory(cat.id).length;
  }

  // Lightweight content flags for contextual nav (avoid dead links)
  const contextualContentFlags = {
    best: getBestGuides().length > 0,
    reviews: getReviews().length > 0,
    guides: getBuyingGuides().length > 0,
    tools: getTools().length > 0,
    setups: getGearSetups().length > 0,
  };

  return (
    <SiteHeaderClient
      sports={sports}
      categories={categories}
      featuredCategories={featuredCategories}
      categoryCounts={categoryCounts}
      initialRegion={initialRegion}
      contextualContentFlags={contextualContentFlags}
      logo={<Logo inverted className="mr-1" />}
      desktopNav={
        <Suspense fallback={<div className="h-10 w-full max-w-xl" />}>
          <DesktopNav
            sports={sports}
            featuredCategories={featuredCategories}
            categoryCounts={categoryCounts}
          />
        </Suspense>
      }
      themeToggle={<ThemeToggle className="hidden" />}
    />
  );
}
