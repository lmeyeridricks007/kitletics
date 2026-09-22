import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductBySlug } from "@/repositories";
import { productMetadata } from "@/lib/seo/metadata";
import { buildOfferClickHref } from "@/lib/commerce/offer-click-href";
import { siteConfig } from "@/content/config";

const PAGE = resolve(process.cwd(), "src/app/products/[slug]/page.tsx");
const source = readFileSync(PAGE, "utf8");

describe("PDP ISR pilot — route contract", () => {
  it("is on-demand ISR without force-dynamic or cookie region reads", () => {
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
    expect(source).toMatch(/region:\s*DEFAULT_REGION/);
  });
});

function assertCanonicalPdp(slug: string) {
  const data = getProductPageData(slug, {
    region: DEFAULT_REGION,
    isDev: false,
  });
  expect(data, slug).toBeTruthy();
  expect(data!.region).toBe("NL");
  expect(data!.product.slug).toBe(slug);
  expect(data!.product.name.length).toBeGreaterThan(0);
  expect(data!.product.shortDescription.length).toBeGreaterThan(0);

  const meta = productMetadata(data!.product);
  expect(meta.alternates?.canonical).toBe(
    `${siteConfig.url}/products/${slug}`,
  );
  expect(String(meta.title).length).toBeGreaterThan(0);
  expect(String(meta.description).length).toBeGreaterThan(0);

  expect(data!.featuredSpecs.length + data!.specGroups.length).toBeGreaterThan(
    0,
  );
  expect(data!.galleryImages.length).toBeGreaterThan(0);
  expect(data!.offers.every((row) => row.offer.region === "NL")).toBe(true);
  expect(data!.lowestPrice?.currency).toBe("EUR");

  for (const row of data!.offers) {
    expect(buildOfferClickHref(row.offer.id, "product-offers")).toBe(
      `/go/${row.offer.id}?placement=product-offers`,
    );
  }

  return data!;
}

describe("PDP ISR pilot — canonical NL document", () => {
  it("A/B/C/D: Novablast 6 has review, multiple NL offers, alternatives", () => {
    const data = assertCanonicalPdp("asics-novablast-6");
    expect(data.offers.length).toBeGreaterThan(1);
    expect(data.lowestPrice?.price).toBeGreaterThan(0);
    expect(data.review?.slug).toBe("asics-novablast-6");
    expect(data.alternatives.length).toBeGreaterThan(0);
    expect(data.buyIf.length + data.skipIf.length).toBeGreaterThan(0);
  });

  it("C: Forerunner 970 keeps editorial identity on NL HTML", () => {
    const data = assertCanonicalPdp("garmin-forerunner-970");
    expect(
      Boolean(data.review) ||
        Boolean(data.verdict) ||
        data.buyIf.length > 0,
    ).toBe(true);
  });

  it("D: Novablast 5 alternatives remain on the canonical document", () => {
    const data = assertCanonicalPdp("asics-novablast-5");
    expect(data.alternatives.length).toBeGreaterThan(0);
    expect(
      data.alternatives.every((row) => row.product.id !== data.product.id),
    ).toBe(true);
  });

  it("E: unknown slug does not assemble a page model", () => {
    expect(
      getProductBySlug("not-a-kitletics-product-zzz", { isDev: false }),
    ).toBeUndefined();
    expect(
      getProductPageData("not-a-kitletics-product-zzz", {
        region: DEFAULT_REGION,
        isDev: false,
      }),
    ).toBeUndefined();
  });
});
