import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getBrandHubPageData } from "@/lib/brand-hub";
import { assembleCategoryPage } from "@/lib/catalog";
import { getUseCaseListingPageData } from "@/lib/use-case-listing";
import { getGearHubData } from "@/lib/gear-hub";
import {
  getBestGuideCatalogPrices,
  getBrandCatalogPrices,
  getGearHubCatalogPrices,
} from "@/lib/commerce/get-scoped-catalog-prices";
import { GET as bestCommerceGet } from "@/app/api/best/[slug]/commerce/[region]/route";
import { GET as brandCommerceGet } from "@/app/api/brands/[slug]/commerce/[region]/route";
import { GET as catalogCommerceGet } from "@/app/api/catalog/[sport]/[segment]/commerce/[region]/route";
import { GET as gearCommerceGet } from "@/app/api/gear/commerce/[region]/route";
import { GET as searchGet } from "@/app/api/search/route";
import { commercePayloadLooksSafe } from "@/lib/product/product-commerce";
import {
  catalogRowMatches,
  filterAndSortCatalogRows,
} from "@/lib/catalog/client-filter";
import type { CatalogProductRow } from "@/lib/catalog/types";
import robots from "@/app/robots";

function src(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

function assertIsrShell(source: string) {
  expect(source).toMatch(/export const revalidate = 86400/);
  expect(source).not.toMatch(/force-dynamic/);
  expect(source).not.toMatch(/getRequestRegion/);
  expect(source).not.toMatch(/from ["']next\/headers["']/);
  expect(source).not.toMatch(/\bcookies\s*\(/);
}

describe("Remaining ISR route contracts", () => {
  it("best guides are on-demand ISR with empty params", () => {
    const source = src("src/app/best/[slug]/page.tsx");
    assertIsrShell(source);
    expect(source).toMatch(/generateStaticParams[\s\S]*return \[\]/);
    expect(source).toMatch(/region:\s*DEFAULT_REGION/);
    expect(source).toMatch(/CatalogPriceIsland/);
    expect(source).toMatch(/\/api\/best\//);
  });

  it("brands are on-demand ISR with empty params", () => {
    const source = src("src/app/brands/[slug]/page.tsx");
    assertIsrShell(source);
    expect(source).toMatch(/generateStaticParams[\s\S]*return \[\]/);
    expect(source).toMatch(/CatalogPriceIsland/);
  });

  it("sport/category and listings are ISR without searchParams RSC reads", () => {
    const category = src("src/app/[sport]/[segment]/page.tsx");
    const listing = src("src/app/[sport]/[segment]/[listing]/page.tsx");
    assertIsrShell(category);
    assertIsrShell(listing);
    expect(category).not.toMatch(/searchParams/);
    expect(listing).not.toMatch(/searchParams/);
    expect(category).toMatch(/generateStaticParams[\s\S]*return \[\]/);
    expect(listing).toMatch(/generateStaticParams[\s\S]*return \[\]/);
  });

  it("gear, tools landings, finder, and search shells are ISR", () => {
    assertIsrShell(src("src/app/gear/page.tsx"));
    assertIsrShell(src("src/app/tools/[slug]/page.tsx"));
    assertIsrShell(src("src/app/tools/finder/[slug]/page.tsx"));
    assertIsrShell(src("src/app/search/page.tsx"));
    expect(src("src/app/search/page.tsx")).not.toMatch(/searchParams/);
    expect(src("src/app/tools/[slug]/results/page.tsx")).toMatch(
      /force-dynamic/,
    );
  });
});

describe("Batched catalog commerce APIs", () => {
  it("best-guide commerce is compact and does not import the page graph", () => {
    const route = src("src/app/api/best/[slug]/commerce/[region]/route.ts");
    const impl = src("src/lib/commerce/get-scoped-catalog-prices.ts");
    expect(impl).not.toMatch(
      /from ["']@\/lib\/best\/get-best-guide-page-data["']/,
    );
    expect(route).toMatch(/revalidate = 3600/);
    const nl = getBestGuideCatalogPrices("running-shoes", "NL");
    expect(nl).toBeTruthy();
    expect(Object.keys(nl!.products).length).toBeGreaterThan(0);
    const uk = getBestGuideCatalogPrices("running-shoes", "UK");
    expect(uk?.region).toBe("UK");
  });

  it("serves cacheable JSON for NL/UK/US and empty ZA", async () => {
    const res = await bestCommerceGet(
      new Request("http://localhost/api/best/running-shoes/commerce/UK"),
      { params: Promise.resolve({ slug: "running-shoes", region: "UK" }) },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toMatch(/s-maxage=3600/);
    const json = await res.json();
    expect(commercePayloadLooksSafe(json)).toBe(true);
    expect(json.region).toBe("UK");

    const brand = await brandCommerceGet(
      new Request("http://localhost/api/brands/asics/commerce/NL"),
      { params: Promise.resolve({ slug: "asics", region: "NL" }) },
    );
    expect(brand.status).toBe(200);

    const cat = await catalogCommerceGet(
      new Request("http://localhost/api/catalog/running/shoes/commerce/US"),
      {
        params: Promise.resolve({
          sport: "running",
          segment: "shoes",
          region: "US",
        }),
      },
    );
    expect(cat.status).toBe(200);
    const catJson = await cat.json();
    expect(catJson.region).toBe("US");

    const gear = await gearCommerceGet(
      new Request("http://localhost/api/gear/commerce/ZA"),
      { params: Promise.resolve({ region: "ZA" }) },
    );
    expect(gear.status).toBe(200);
  });
});

describe("Canonical NL documents stay editorial", () => {
  it("best guide order is unchanged by region argument defaulting to NL", () => {
    const data = getBestGuidePageData("running-shoes", {
      region: DEFAULT_REGION,
      isDev: false,
    });
    expect(data).toBeTruthy();
    expect(data!.recommendations.length).toBeGreaterThan(1);
    const ranks = data!.recommendations.map((r) => r.entry.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("brand hub product set is canonical NL", () => {
    const data = getBrandHubPageData({
      brandSlug: "asics",
      region: DEFAULT_REGION,
    });
    expect(data).toBeTruthy();
    expect(data!.products.items.length).toBeGreaterThan(0);
    expect(getBrandCatalogPrices("asics", "NL")?.products).toBeTruthy();
  });

  it("running shoes category assembles unfiltered NL catalog", () => {
    const page = assembleCategoryPage({
      sportSlug: "running",
      pathSegment: "shoes",
      region: DEFAULT_REGION,
    });
    expect(page).toBeTruthy();
    expect(page!.catalog.products.length).toBeGreaterThan(24);
    expect(page!.catalog.products[0].filterTokens).toBeTruthy();
  });

  it("filterTokens use public spec keys and values", () => {
    const page = assembleCategoryPage({
      sportSlug: "padel",
      pathSegment: "accessories",
      region: DEFAULT_REGION,
    });
    const tokens = JSON.stringify(
      page?.catalog.products.map((p) => p.filterTokens) ?? [],
    );
    expect(tokens).not.toMatch(
      /genderFit|cushionLevel|customization_weight|frame_tape/,
    );
  });

  it("gear hub canonical data ignores filters when none passed", () => {
    const data = getGearHubData({ region: DEFAULT_REGION, filters: {} });
    expect(data.picks.items.length).toBeGreaterThan(0);
    expect(getGearHubCatalogPrices("NL").region).toBe("NL");
  });
});

describe("Client catalog filtering", () => {
  it("matches brand and price overlay independently of row.price", () => {
    const row = {
      slug: "demo-shoe",
      filterTokens: {
        brandSlug: "asics",
        typeSlugs: ["daily-trainers"],
        useCaseSlugs: [],
        specs: {},
      },
      price: { price: 200, currency: "EUR" },
    } as unknown as CatalogProductRow;
    expect(
      catalogRowMatches(
        row,
        {
          type: [],
          brand: ["asics"],
          specs: {},
          useCase: [],
          sort: "recommended",
          priceMax: 150,
        },
        140,
      ),
    ).toBe(true);
    expect(
      catalogRowMatches(row, {
        type: [],
        brand: ["hoka"],
        specs: {},
        useCase: [],
        sort: "recommended",
      }),
    ).toBe(false);
  });

  it("price-asc uses overlay map", () => {
    const rows = [
      {
        slug: "a",
        fullName: "A",
        price: { price: 10, currency: "EUR" },
        filterTokens: {
          typeSlugs: [],
          useCaseSlugs: [],
          specs: {},
        },
      },
      {
        slug: "b",
        fullName: "B",
        price: { price: 20, currency: "EUR" },
        filterTokens: {
          typeSlugs: [],
          useCaseSlugs: [],
          specs: {},
        },
      },
    ] as unknown as CatalogProductRow[];
    const sorted = filterAndSortCatalogRows(
      rows,
      {
        type: [],
        brand: [],
        specs: {},
        useCase: [],
        sort: "price-asc",
      },
      { a: 90, b: 40 },
    );
    expect(sorted.map((r) => r.slug)).toEqual(["b", "a"]);
  });
});

describe("Search, robots, middleware, images", () => {
  it("search API does not ISR and enforces a minimum query length", async () => {
    const route = src("src/app/api/search/route.ts");
    expect(route).toMatch(/force-dynamic/);
    expect(route).not.toMatch(/export const revalidate/);
    const short = await searchGet(
      new Request("http://localhost/api/search?q=a&region=NL"),
    );
    expect(short.status).toBe(200);
    const emptyish = await short.json();
    expect(emptyish.query).toBe("");

    const ok = await searchGet(
      new Request("http://localhost/api/search?q=novablast&region=UK"),
    );
    expect(ok.status).toBe(200);
    const json = await ok.json();
    expect(json.query).toBe("novablast");
    expect(json.region).toBe("UK");
  });

  it("robots disallows search, go, api, admin, preview", () => {
    const rules = robots();
    const disallow = Array.isArray(rules.rules)
      ? rules.rules[0]?.disallow
      : rules.rules.disallow;
    expect(disallow).toEqual(
      expect.arrayContaining(["/search", "/go/", "/api/", "/admin/", "/preview/"]),
    );
  });

  it("middleware no longer matches /images and next.config has no hostname **", () => {
    const mw = src("src/middleware.ts");
    expect(mw).not.toMatch(/\/images\/:path\*/);
    expect(mw).toMatch(/resolveRunningShoesEntryRedirect/);
    const nextConfig = src("next.config.ts");
    expect(nextConfig).not.toMatch(/hostname:\s*["']\*\*["']/);
    expect(nextConfig).toMatch(/public\.blob\.vercel-storage\.com/);
  });

  it("catalog price island does not import server catalog builders", () => {
    const island = src("src/components/commerce/CatalogPriceIsland.tsx");
    expect(island).toMatch(/from ["']@\/lib\/commerce\/catalog-price-dto["']/);
    expect(island).not.toMatch(/from ["']@\/lib\/commerce\/catalog-price-map["']/);
  });

  it("Speed Insights is sampled", () => {
    expect(src("src/app/layout.tsx")).toMatch(/sampleRate=\{0\.1\}/);
  });

  it("use-case listing still resolves a known shoes landing", () => {
    const data = getUseCaseListingPageData({
      sportSlug: "running",
      categoryPathSegment: "shoes",
      listingSlug: "daily-trainers",
      region: DEFAULT_REGION,
    });
    expect(data).toBeTruthy();
    expect(data!.products.length).toBeGreaterThan(0);
  });
});
