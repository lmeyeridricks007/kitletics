import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/products/[slug]/commerce/[region]/route";
import { getProductCommerce } from "@/lib/product/get-product-commerce";
import { productPageDataToCommerce } from "@/lib/product/product-commerce-from-page";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import {
  commercePayloadLooksSafe,
  COMMERCE_CACHE_CONTROL,
  COMMERCE_NO_STORE,
} from "@/lib/product/product-commerce";
import {
  isStaleCommerceGeneration,
  parseCommerceResponse,
  regionalCommercePath,
  shouldFetchRegionalCommerce,
} from "@/lib/product/commerce-island";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getLowestOfferPrice } from "@/repositories/products";

const PAGE = resolve(process.cwd(), "src/app/products/[slug]/page.tsx");
const COMMERCE_FN = resolve(
  process.cwd(),
  "src/lib/product/get-product-commerce.ts",
);
const ROUTE = resolve(
  process.cwd(),
  "src/app/api/products/[slug]/commerce/[region]/route.ts",
);
const GO = resolve(process.cwd(), "src/app/go/[offerId]/route.ts");
const SELECTOR = resolve(
  process.cwd(),
  "src/components/commerce/RegionSelector.tsx",
);

function sourceOf(path: string) {
  return readFileSync(path, "utf8");
}

async function commerceGet(slug: string, region: string) {
  return GET(new Request(`http://localhost/api/products/${slug}/commerce/${region}`), {
    params: Promise.resolve({ slug, region }),
  });
}

describe("PDP regional commerce — architecture contracts", () => {
  it("PDP remains on-demand ISR without cookies", () => {
    const source = sourceOf(PAGE);
    expect(source).toMatch(/export const revalidate = 86400/);
    expect(source).toMatch(/export const dynamicParams = true/);
    expect(source).toMatch(/generateStaticParams[\s\S]*return \[\]/);
    expect(source).not.toMatch(/force-dynamic/);
    expect(source).not.toMatch(/getRequestRegion/);
    expect(source).not.toMatch(/from ["']next\/headers["']/);
    expect(source).not.toMatch(/\bcookies\s*\(/);
    expect(source).toMatch(/region:\s*DEFAULT_REGION/);
  });

  it("commerce data function and route avoid the page graph", () => {
    for (const source of [sourceOf(COMMERCE_FN), sourceOf(ROUTE)]) {
      expect(source).not.toMatch(/from ["']@\/lib\/product\/get-product-page-data["']/);
      expect(source).not.toMatch(/getProductGraph/);
      expect(source).not.toMatch(/from ["']@\/repositories["']/);
      expect(source).not.toMatch(/repositories\/graph/);
      expect(source).not.toMatch(/repositories\/editorial/);
      expect(source).not.toMatch(/repositories\/recommendations/);
      expect(source).not.toMatch(/get-product-review-summary/);
      expect(source).not.toMatch(/from ["']next\/headers["']/);
      expect(source).not.toMatch(/\bcookies\s*\(/);
    }
  });

  it("commerce route is cacheable ISR, not force-dynamic", () => {
    const source = sourceOf(ROUTE);
    expect(source).toMatch(/export const revalidate = 3600/);
    expect(source).toMatch(/generateStaticParams[\s\S]*return \[\]/);
    expect(source).not.toMatch(/force-dynamic/);
    expect(source).not.toMatch(/cache:\s*["']no-store["']/);
    expect(source).toMatch(/COMMERCE_CACHE_CONTROL|s-maxage=3600/);
  });

  it("does not change /go and removes region reload", () => {
    const go = sourceOf(GO);
    expect(go).toMatch(/export const dynamic = "force-dynamic"/);
    expect(go).toMatch(/no-store/);
    expect(sourceOf(SELECTOR)).not.toMatch(/location\.reload/);
    const pdp = sourceOf(
      resolve(process.cwd(), "src/components/product/ProductDetailPage.tsx"),
    );
    const jsonLdAt = pdp.indexOf("<JsonLdScript");
    const islandAt = pdp.indexOf("<ProductCommerceIsland");
    expect(jsonLdAt).toBeGreaterThan(0);
    expect(islandAt).toBeGreaterThan(jsonLdAt);
  });
});

describe("getProductCommerce", () => {
  it("NL Novablast 6 matches ISR commerce IDs without sending ProductPageData", () => {
    const api = getProductCommerce("asics-novablast-6", "NL", { isDev: false });
    expect(api).toBeTruthy();
    expect(api!.region).toBe("NL");
    expect(api!.currency).toBe("EUR");
    expect(api!.lowestPrice?.amount).toBeGreaterThan(0);
    expect(api!.offers.length).toBeGreaterThan(1);
    expect(api!.offers.every((o) => o.region === "NL")).toBe(true);
    expect(api!.offers.every((o) => o.goUrl.startsWith("/go/"))).toBe(true);
    expect(api!.offers.some((o) => o.id.includes("nb6-nl"))).toBe(true);
    expect(commercePayloadLooksSafe(api)).toBe(true);

    const page = getProductPageData("asics-novablast-6", {
      region: DEFAULT_REGION,
      isDev: false,
    });
    expect(page).toBeTruthy();
    const peerPrices = Object.fromEntries(
      [...page!.product.alternativeProductIds, ...page!.product.relatedProductIds]
        .filter((id, i, arr) => arr.indexOf(id) === i)
        .map((id) => {
          const price = getLowestOfferPrice(id, "NL", { isDev: false });
          return [
            id,
            price
              ? {
                  amount: price.price,
                  currency: price.currency,
                  offerId: price.offerId,
                }
              : null,
          ];
        }),
    );
    const mapped = productPageDataToCommerce(page!, peerPrices);
    expect(mapped.offers.map((o) => o.id).sort()).toEqual(
      api!.offers.map((o) => o.id).sort(),
    );
  });

  it("UK/US use regional offer IDs and currencies", () => {
    const uk = getProductCommerce("asics-novablast-6", "UK", { isDev: false });
    expect(uk?.currency).toBe("GBP");
    expect(uk?.offers.some((o) => o.id === "offer-nb6-uk")).toBe(true);
    expect(uk?.offers.every((o) => o.goUrl.includes("/go/offer-nb6"))).toBe(true);
    expect(uk?.offers.every((o) => !o.goUrl.includes("amzn.to"))).toBe(true);

    const us = getProductCommerce("asics-novablast-6", "US", { isDev: false });
    expect(us?.currency).toBe("USD");
    expect(us?.offers.some((o) => o.id === "offer-nb6-us")).toBe(true);
  });

  it("BE/ZA return empty offers without inventing prices", () => {
    for (const region of ["BE", "ZA"] as const) {
      const data = getProductCommerce("asics-novablast-6", region, {
        isDev: false,
      });
      expect(data, region).toBeTruthy();
      expect(data!.offers).toEqual([]);
      expect(data!.lowestPrice).toBeNull();
      expect(data!.offersOtherRegions.length).toBeGreaterThan(0);
    }
  });
});

describe("commerce API route", () => {
  it("returns UK JSON with cache headers", async () => {
    const res = await commerceGet("asics-novablast-6", "UK");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(COMMERCE_CACHE_CONTROL);
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    const body = await res.json();
    expect(body.region).toBe("UK");
    expect(body.currency).toBe("GBP");
    expect(body.offers.some((o: { id: string }) => o.id === "offer-nb6-uk")).toBe(
      true,
    );
    expect(JSON.stringify(body)).not.toMatch(/affiliateUrl/);
    expect(JSON.stringify(body)).not.toMatch(/reviewBody/);
    expect(JSON.stringify(body)).not.toMatch(/specifications/);
  });

  it("returns US JSON", async () => {
    const res = await commerceGet("asics-novablast-6", "US");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.currency).toBe("USD");
  });

  it("returns 200 empty offers for ZA", async () => {
    const res = await commerceGet("asics-novablast-6", "ZA");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.offers).toEqual([]);
    expect(body.lowestPrice).toBeNull();
  });

  it("rejects invalid region with no-store", async () => {
    const res = await commerceGet("asics-novablast-6", "ZZ");
    expect(res.status).toBe(400);
    expect(res.headers.get("Cache-Control")).toBe(COMMERCE_NO_STORE);
    const body = await res.json();
    expect(body.error).toBe("invalid_region");
  });

  it("404s unknown products", async () => {
    const res = await commerceGet("this-product-definitely-does-not-exist", "UK");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("not_found");
  });
});

describe("commerce island helpers", () => {
  it("NL does not fetch; UK/US do", () => {
    expect(shouldFetchRegionalCommerce("NL")).toBe(false);
    expect(shouldFetchRegionalCommerce("UK")).toBe(true);
    expect(shouldFetchRegionalCommerce("US")).toBe(true);
    expect(regionalCommercePath("asics-novablast-6", "UK")).toBe(
      "/api/products/asics-novablast-6/commerce/UK",
    );
  });

  it("ignores stale generations (UK then US)", () => {
    expect(isStaleCommerceGeneration(1, 2)).toBe(true);
    expect(isStaleCommerceGeneration(2, 2)).toBe(false);
  });

  it("parses commerce payloads and rejects junk", () => {
    expect(parseCommerceResponse(null)).toBeNull();
    expect(
      parseCommerceResponse({
        productId: "prod-novablast-6",
        slug: "asics-novablast-6",
        region: "UK",
        offers: [],
        offersOtherRegions: [],
        peerPrices: {},
      }),
    ).toBeTruthy();
  });
});

type ProductCommerceResponseLike = {
  productId: string;
  slug: string;
  region: string;
  offers: unknown[];
  offersOtherRegions: unknown[];
  peerPrices: Record<string, unknown>;
};

describe("commerce island fetch race", () => {
  it("late UK response does not win after US switch", async () => {
    let resolveUk: (value: ProductCommerceResponseLike) => void = () => {};
    const ukPromise = new Promise<ProductCommerceResponseLike>((resolve) => {
      resolveUk = resolve;
    });
    const usPayload = {
      productId: "prod-novablast-6",
      slug: "asics-novablast-6",
      region: "US" as const,
      offers: [],
      offersOtherRegions: [],
      peerPrices: {},
    };

    let generation = 0;
    let applied: string | null = null;

    async function run(region: "UK" | "US", payload: Promise<ProductCommerceResponseLike>) {
      const gen = ++generation;
      const data = await payload;
      if (isStaleCommerceGeneration(gen, generation)) return;
      applied = data.region;
    }

    const ukRun = run("UK", ukPromise);
    const usRun = run("US", Promise.resolve(usPayload));
    await usRun;
    resolveUk({
      productId: "prod-novablast-6",
      slug: "asics-novablast-6",
      region: "UK",
      offers: [],
      offersOtherRegions: [],
      peerPrices: {},
    });
    await ukRun;
    expect(applied).toBe("US");
  });
});

describe("PDP SEO ownership and layout cookies", () => {
  it("root layout does not read cookies", () => {
    const layout = sourceOf(
      resolve(process.cwd(), "src/app/layout.tsx"),
    );
    expect(layout).not.toMatch(/from ["']next\/headers["']/);
    expect(layout).not.toMatch(/await cookies/);
    expect(layout).toMatch(/Do not read cookies\(\)\/headers\(\)/);
    expect(layout).toMatch(/RegionPreferenceProvider/);
  });

  it("JSON-LD stays server-owned and outside the commerce island", () => {
    const pdp = sourceOf(
      resolve(process.cwd(), "src/components/product/ProductDetailPage.tsx"),
    );
    const jsonLdAt = pdp.indexOf("<JsonLdScript");
    const islandAt = pdp.indexOf("<ProductCommerceIsland");
    expect(jsonLdAt).toBeGreaterThan(0);
    expect(islandAt).toBeGreaterThan(jsonLdAt);
    expect(pdp).toMatch(/productJsonLd\(product, offers\.map/);
    expect(pdp).not.toMatch(/productJsonLd\(.*commerce/);
  });

  it("error path does not keep NL commerce under a non-NL region", () => {
    const island = sourceOf(
      resolve(
        process.cwd(),
        "src/components/product/ProductCommerceIsland.tsx",
      ),
    );
    expect(island).toMatch(/setStatus\("error"\)/);
    expect(island).toMatch(/setCommerce\(null\)/);
    expect(island).toMatch(/AbortController/);
  });

  it("US → NL does not fetch", () => {
    expect(shouldFetchRegionalCommerce("US")).toBe(true);
    expect(shouldFetchRegionalCommerce("NL")).toBe(false);
  });
});
