import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { siteConfig } from "@/content/config";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { reviewPageDataToCommerce } from "@/lib/review/review-commerce-from-page";
import { getProductCommerce } from "@/lib/product/get-product-commerce";
import { GET } from "@/app/api/products/[slug]/commerce/[region]/route";
import { reviewMetadata } from "@/lib/seo/metadata";
import { getReviewBySlug } from "@/repositories";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";
import { buildOfferClickHref } from "@/lib/commerce/offer-click-href";
import {
  regionalCommercePath,
  shouldFetchRegionalCommerce,
} from "@/lib/product/commerce-island";
import { commercePayloadLooksSafe } from "@/lib/product/product-commerce";

const PAGE = resolve(process.cwd(), "src/app/reviews/[slug]/page.tsx");
const DETAIL = resolve(
  process.cwd(),
  "src/components/review/ReviewDetailPage.tsx",
);
const COMMERCE_FN = resolve(
  process.cwd(),
  "src/lib/product/get-product-commerce.ts",
);
const GO = resolve(process.cwd(), "src/app/go/[offerId]/route.ts");

const source = readFileSync(PAGE, "utf8");
const detail = readFileSync(DETAIL, "utf8");

const SLUG = "asics-novablast-6";

async function commerceGet(slug: string, region: string) {
  return GET(
    new Request(`http://localhost/api/products/${slug}/commerce/${region}`),
    { params: Promise.resolve({ slug, region }) },
  );
}

describe("Reviews ISR — route contract", () => {
  it("is on-demand ISR without cookies or force-dynamic", () => {
    expect(source).toMatch(/export const revalidate = 86400/);
    expect(source).toMatch(/export const dynamicParams = true/);
    expect(source).toMatch(/generateStaticParams[\s\S]*return \[\]/);
    expect(source).not.toMatch(/force-dynamic/);
    expect(source).not.toMatch(/getRequestRegion/);
    expect(source).not.toMatch(/from ["']next\/headers["']/);
    expect(source).not.toMatch(/\bcookies\s*\(/);
    expect(source).not.toMatch(/\bheaders\s*\(/);
    expect(source).not.toMatch(/draftMode\s*\(/);
    expect(source).not.toMatch(/connection\s*\(/);
    expect(source).not.toMatch(/unstable_noStore/);
    expect(source).not.toMatch(/cache:\s*["']no-store["']/);
    expect(source).not.toMatch(/revalidate\s*=\s*0/);
    expect(source).not.toMatch(/getReviews\s*\(/);
    expect(source).toMatch(/region:\s*DEFAULT_REGION/);
    expect(source).toMatch(/cache\(/);
  });

  it("JSON-LD is server-rendered before the commerce island", () => {
    const jsonLdAt = detail.indexOf("<JsonLdScript");
    const islandAt = detail.indexOf("<ProductCommerceIsland");
    expect(jsonLdAt).toBeGreaterThan(0);
    expect(islandAt).toBeGreaterThan(jsonLdAt);
    expect(detail).toMatch(/reviewPageDataToCommerce/);
    expect(detail).toMatch(/slug=\{product\.slug\}/);
  });

  it("does not change /go and commerce API still avoids the review graph", () => {
    const go = readFileSync(GO, "utf8");
    expect(go).toMatch(/export const dynamic = "force-dynamic"/);
    expect(go).toMatch(/no-store/);
    const commerce = readFileSync(COMMERCE_FN, "utf8");
    expect(commerce).not.toMatch(/getReviewPageData/);
    expect(commerce).not.toMatch(/getProductGraph/);
    expect(commerce).not.toMatch(/enrichReviewForPage/);
  });
});

describe("Reviews ISR — canonical NL document", () => {
  it("Novablast 6 review keeps editorial identity and NL commerce", () => {
    const data = getReviewPageData(SLUG, {
      region: DEFAULT_REGION,
      isDev: false,
    });
    expect(data).toBeDefined();
    expect(data!.review.slug).toBe(SLUG);
    expect(data!.product.slug).toBe(SLUG);
    expect(data!.review.title.length).toBeGreaterThan(8);
    expect(data!.displayScore).toBeGreaterThan(0);
    expect(data!.review.sections.length).toBeGreaterThan(2);
    expect(data!.decisionCopy.buyIf.length).toBeGreaterThan(0);
    expect(data!.offers.length).toBeGreaterThan(0);
    expect(data!.offers.every((row) => row.offer.region === "NL")).toBe(true);
    expect(data!.lowestPrice?.currency).toBe("EUR");
    expect(data!.heroImage?.src).toBeTruthy();

    const meta = reviewMetadata(data!.review, data!.product.fullName);
    expect(meta.alternates?.canonical).toBe(
      `${siteConfig.url}/reviews/${SLUG}`,
    );
    expect(String(meta.title).length).toBeGreaterThan(0);
    expect(data!.review.score).toBeGreaterThan(0);
    expect(data!.review.publishedAt || data!.review.updatedAt).toBeTruthy();
    expect(data!.author?.name.length).toBeGreaterThan(0);
    expect(data!.faqs.length).toBeGreaterThanOrEqual(0);

    for (const row of data!.offers) {
      expect(buildOfferClickHref(row.offer.id, "review")).toBe(
        `/go/${row.offer.id}?placement=review`,
      );
    }
  });

  it("unknown review slug yields no page data", () => {
    expect(
      getReviewPageData("this-review-does-not-exist-kitletics", {
        region: DEFAULT_REGION,
        isDev: false,
      }),
    ).toBeUndefined();
  });
});

describe("Reviews — regional commerce mapping", () => {
  it("maps review ISR commerce onto the product commerce API by product slug", () => {
    const page = getReviewPageData(SLUG, {
      region: DEFAULT_REGION,
      isDev: false,
    });
    expect(page).toBeDefined();
    const mapped = reviewPageDataToCommerce(page!);
    expect(mapped.slug).toBe(page!.product.slug);
    expect(mapped.region).toBe("NL");
    expect(mapped.currency).toBe("EUR");
    expect(mapped.peerPrices).toEqual({});
    expect(commercePayloadLooksSafe(mapped)).toBe(true);
    expect(mapped.offers.every((o) => o.goUrl.startsWith("/go/"))).toBe(true);

    const api = getProductCommerce(page!.product.slug, "NL", { isDev: false });
    expect(api).toBeTruthy();
    expect(mapped.offers.map((o) => o.id).sort()).toEqual(
      api!.offers.map((o) => o.id).sort(),
    );

    expect(shouldFetchRegionalCommerce("NL")).toBe(false);
    expect(shouldFetchRegionalCommerce("UK")).toBe(true);
    expect(regionalCommercePath(page!.product.slug, "UK")).toBe(
      `/api/products/${page!.product.slug}/commerce/UK`,
    );
  });

  it("UK/US/empty-region commerce stay on the product endpoint", async () => {
    const page = getReviewPageData(SLUG, {
      region: DEFAULT_REGION,
      isDev: false,
    });
    const productSlug = page!.product.slug;

    const uk = await commerceGet(productSlug, "UK");
    expect(uk.status).toBe(200);
    const ukBody = await uk.json();
    expect(ukBody.currency).toBe("GBP");
    expect(ukBody.offers.length).toBeGreaterThan(0);

    const us = await commerceGet(productSlug, "US");
    expect(us.status).toBe(200);
    const usBody = await us.json();
    expect(usBody.currency).toBe("USD");

    const za = await commerceGet(productSlug, "ZA");
    expect(za.status).toBe(200);
    const zaBody = await za.json();
    expect(zaBody.offers).toEqual([]);
    expect(zaBody.lowestPrice).toBeNull();
  });

  it("canonical Novablast 6 review is a public launch-eligible entity", () => {
    const review = getReviewBySlug("asics-novablast-6", { isDev: false });
    expect(review).toBeDefined();
    const elig = getLaunchEligibility({ kind: "review", entity: review! });
    expect(shouldPromotePublicly(elig)).toBe(true);
  });
});
