import { describe, expect, it } from "vitest";
import {
  SHOE_DATABASE_HREF,
  SHOE_DATABASE_NAV_LABEL,
  shouldLinkShoeDatabaseFromBestGuide,
  shouldLinkShoeDatabaseFromBuyingGuide,
  shouldLinkShoeDatabaseFromFinder,
  ensureShoeDatabaseBuyingHelpLink,
} from "@/lib/running-shoe-database/discovery";
import { getBuyingGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { resolveNavigationContext } from "@/lib/navigation/contextual-nav";
import { PRIMARY_MENU_PANELS } from "@/lib/navigation/primary-menu-panels";
import { hasNonCanonicalQueryState } from "@/lib/seo/query-state";

describe("shoe database discovery integration", () => {
  it("uses Shoe Database label in Running and Shoes contextual nav", () => {
    const running = resolveNavigationContext({
      pathname: "/running",
      contentFlags: {
        best: true,
        reviews: true,
        guides: true,
        tools: true,
        setups: true,
      },
    });
    expect(
      running.visibleItems.some(
        (i) => i.href === SHOE_DATABASE_HREF && i.label === SHOE_DATABASE_NAV_LABEL,
      ),
    ).toBe(true);

    const shoes = resolveNavigationContext({ pathname: "/running/shoes" });
    expect(
      shoes.visibleItems.some(
        (i) => i.href === SHOE_DATABASE_HREF && i.label === SHOE_DATABASE_NAV_LABEL,
      ),
    ).toBe(true);
  });

  it("includes Shoe Database in Shoes primary mega-menu", () => {
    const panel = PRIMARY_MENU_PANELS["/running/shoes"];
    const links = panel.columns.flatMap((c) => c.links);
    expect(links.some((l) => l.href === SHOE_DATABASE_HREF)).toBe(true);
  });

  it("gates editorial links to shoe surfaces only", () => {
    expect(shouldLinkShoeDatabaseFromBestGuide("cat-running-shoes")).toBe(true);
    expect(shouldLinkShoeDatabaseFromBestGuide("cat-gps-watches")).toBe(false);
    expect(
      shouldLinkShoeDatabaseFromBuyingGuide({
        slug: "how-to-choose-running-shoes",
        categoryId: "cat-running-shoes",
      }),
    ).toBe(true);
    expect(
      shouldLinkShoeDatabaseFromBuyingGuide({
        slug: "how-to-choose-a-gps-watch",
        categoryId: "cat-gps-watches",
      }),
    ).toBe(false);
    expect(shouldLinkShoeDatabaseFromFinder("running-shoe-finder")).toBe(true);
    expect(shouldLinkShoeDatabaseFromFinder("fitness-watch-finder")).toBe(false);
  });

  it("attaches shoe database CTA on how-to-choose buying guide", () => {
    const page = getBuyingGuidePageData("how-to-choose-running-shoes", {
      isDev: false,
    });
    expect(page?.shoeDatabaseLink?.href).toBe(SHOE_DATABASE_HREF);
  });

  it("ensures best running-shoe guides include database in buying help links", () => {
    const page = getBestGuidePageData("running-shoes", { isDev: false });
    expect(page).toBeTruthy();
    expect(
      page!.buyingHelpLinks.some((l) => l.href === SHOE_DATABASE_HREF),
    ).toBe(true);
    const ensured = ensureShoeDatabaseBuyingHelpLink([{ label: "x", href: "/x" }]);
    expect(ensured.some((l) => l.href === SHOE_DATABASE_HREF)).toBe(true);
  });

  it("keeps filtered database URLs noindex via query-state gate", () => {
    expect(hasNonCanonicalQueryState({})).toBe(false);
    expect(hasNonCanonicalQueryState({ brand: "asics" })).toBe(true);
    expect(hasNonCanonicalQueryState({ use: "daily-training" })).toBe(true);
  });
});
