import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { siteConfig } from "@/content/config";
import {
  alternativesCanonicalPath,
  getAlternativesPageData,
} from "@/lib/product/get-alternatives-page-data";

const PAGE = resolve(
  process.cwd(),
  "src/app/products/[slug]/alternatives/page.tsx",
);
const source = readFileSync(PAGE, "utf8");

describe("Alternatives ISR — route contract", () => {
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
    expect(source).not.toMatch(/getProducts\s*\(/);
    expect(source).toMatch(/region:\s*DEFAULT_REGION/);
    expect(source).toMatch(/cache\(/);
  });
});

describe("Alternatives ISR — canonical NL document", () => {
  it("Novablast 6 keeps NL prices, canonical, and alternative relationships", () => {
    const data = getAlternativesPageData("asics-novablast-6", {
      isDev: false,
      region: DEFAULT_REGION,
    });
    expect(data).toBeDefined();
    expect(data!.region).toBe("NL");
    expect(data!.alternatives.length).toBeGreaterThanOrEqual(4);
    expect(data!.reasonGroups.length).toBeGreaterThanOrEqual(4);
    expect(data!.indexable).toBe(true);
    expect(alternativesCanonicalPath("asics-novablast-6")).toBe(
      `${siteConfig.url}/products/asics-novablast-6/alternatives`,
    );
    expect(data!.source.price?.currency).toBe("EUR");
  });

  it("unknown slug yields no page data (404)", () => {
    expect(
      getAlternativesPageData("this-product-does-not-exist-kitletics", {
        isDev: false,
        region: DEFAULT_REGION,
      }),
    ).toBeUndefined();
  });
});
