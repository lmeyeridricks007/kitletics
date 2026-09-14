import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getProductBySlug,
  getSportBySlug,
  getBestGuideBySlug,
} from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { getPadelRacketDatabasePageData } from "@/lib/padel-racket-database/get-page-data";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { PADEL_RESEARCH_STORIES } from "@/lib/padel-research";
import {
  guideVisualFamily,
  enrichExplainerBlocksWithVisuals,
} from "@/lib/guides/enrich-explainer-visuals";
import { PADEL_KNOWLEDGE_UNIQUE } from "@/lib/guides/explainers/padel-knowledge-unique";
import { padelKnowledgeConfigs } from "@/lib/guides/explainers/padel-knowledge-plans";

const PROD = { isDev: false as const };

describe("Padel remediation regression", () => {
  it("indexes the padel hub", () => {
    const sport = getSportBySlug("padel", PROD)!;
    const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
    expect(elig.disposition).toBe("INDEXABLE");
    expect(isIndexableEligibility(elig)).toBe(true);
  });

  it("Vertex PDP copy has no public SKU word", () => {
    const p = getProductBySlug("bullpadel-vertex-05-2026", PROD)!;
    const blob = [
      p.shortDescription,
      p.verdict,
      ...(p.strengths ?? []),
      ...(p.weaknesses ?? []),
    ].join(" ");
    expect(blob).not.toMatch(/\bSKU\b/);
  });

  it("Nox Alum XTREM uses the alum-xtrem hero path", () => {
    const p = getProductBySlug("nox-at10-genius-12k-alum-xtrem-2026", PROD)!;
    const media = getPrimaryProductMedia(p);
    expect(media?.src).toContain("alum-xtrem");
    expect(media?.src).not.toMatch(/nox-at10-12k-2026-hero\.png$/);
    expect(CATALOG_PRODUCT_MEDIA[p.id]?.src).toContain("alum-xtrem");
  });

  it("Wilson padel overgrip media lives under /images/padel/", () => {
    const p = getProductBySlug("wilson-padel-overgrip-pack", PROD)!;
    const media = getPrimaryProductMedia(p);
    expect(media?.src.startsWith("/images/padel/")).toBe(true);
    expect(media?.src).not.toContain("/images/fitness/");
  });

  it("database chrome does not expose weightMin as a public label", () => {
    const data = getPadelRacketDatabasePageData({ region: "NL" });
    // Public strings only — records may use weightMinG internally.
    const publicChrome = [
      data.title,
      data.description,
      ...data.methodology.paragraphs,
      ...data.statisticsMethodology.paragraphs,
      ...data.datasetAbout.sections.map((s) => `${s.heading} ${s.body}`),
      ...data.marketInsights.cards.map((c) => `${c.title} ${c.definition}`),
      ...data.dataExplorer.panels.map(
        (p) => `${p.headline} ${p.interpretation} ${p.sampleNote}`,
      ),
    ].join("\n");
    expect(publicChrome).not.toMatch(/\bweightMin\b/);
    expect(data.description).toMatch(/minimum weight/i);
  });

  it("Wilson Blade score blurbs omit evidenceKind enums", () => {
    const data = getProductPageData("wilson-blade-pro-v3-padel", PROD);
    expect(data).toBeTruthy();
    const blob = data!.scoreExplainFactors.map((f) => f.explanation).join(" ");
    expect(blob).not.toMatch(/manufacturer claim/i);
    expect(blob).not.toMatch(/spec inference/i);
  });

  it("research weight story title is human-labelled", () => {
    const story = PADEL_RESEARCH_STORIES.find((s) => s.slug.includes("weight"));
    expect(story?.title).toBeTruthy();
    expect(story!.title).not.toContain("weightMin");
  });

  it("Best padel shoes prose has no widthOptions camelCase", () => {
    const g = getBestGuideBySlug("padel-shoes", PROD)!;
    const blob = JSON.stringify(g);
    expect(blob).not.toContain("widthOptions");
  });

  it("padel buying guides do not emit maps-to / prod- role language", () => {
    const blob = JSON.stringify(PADEL_KNOWLEDGE_UNIQUE);
    expect(blob).not.toMatch(/maps to prod-/i);
    expect(blob).not.toMatch(/as a catalog role/i);
    for (const why of Object.values(PADEL_KNOWLEDGE_UNIQUE).flatMap(
      (u) => u.exampleWhys,
    )) {
      expect(why).not.toMatch(/prod-/);
    }
  });

  it("padel guide visual family never attaches running diagrams", () => {
    expect(guideVisualFamily("how-to-choose-padel-shoes")).toBe("padel");
    expect(guideVisualFamily("padel-racket-shapes-explained")).toBe("padel");
    const cfg = padelKnowledgeConfigs.find(
      (c) => c.guideSlug === "how-to-choose-a-padel-racket",
    );
    expect(cfg?.explainer?.blocks).toBeTruthy();
    const enriched = enrichExplainerBlocksWithVisuals(
      cfg!.explainer!.blocks,
      cfg!.guideSlug,
    );
    const diagramSrcs = JSON.stringify(enriched);
    expect(diagramSrcs).not.toContain("/images/running/");
    expect(diagramSrcs).not.toContain("flipbelt");
    expect(diagramSrcs).not.toContain("guide-tennis");
  });

  it("hub hero file is a real JPEG under 500KB", () => {
    const hero = join(process.cwd(), "public/images/padel/hero.jpg");
    expect(existsSync(hero)).toBe(true);
    const buf = readFileSync(hero);
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0xd8);
    expect(buf.length).toBeLessThan(500_000);
  });

  it("Siux Electra public briefs avoid truncated SKU fragments", () => {
    const p = getProductBySlug("siux-electra-pro-2026", PROD);
    expect(p).toBeTruthy();
    const blob = [p!.shortDescription, p!.verdict, ...(p!.strengths ?? [])].join(
      " ",
    );
    expect(blob).not.toMatch(/\bSKU\b/);
    expect(blob).not.toMatch(/distinct SKU/i);
    expect(blob).toMatch(/distinct model/i);
  });

  it("Siux Diablo alternatives source briefs avoid SKU wording", () => {
    const p = getProductBySlug("siux-diablo-pro-2026", PROD);
    expect(p).toBeTruthy();
    const electra = getProductBySlug("siux-electra-pro-2026", PROD)!;
    const blob = [electra.shortDescription, electra.verdict].join(" ");
    expect(blob).not.toMatch(/\bSKU\b/);
    expect(blob.length).toBeGreaterThan(40);
    expect(p!.shortDescription ?? p!.verdict ?? "").not.toMatch(/\bSKU\b/);
  });

  it("Accessories is public/indexable and linked; Clothing stays held", async () => {
    const { padelSportHubConfig } = await import("@/lib/sport-hub/config");
    const hrefs = JSON.stringify(padelSportHubConfig);
    expect(hrefs).toContain("/padel/accessories");
    expect(hrefs).not.toContain("/padel/clothing");

    const { isSoftGatedCategory } = await import(
      "@/lib/navigation/category-href"
    );
    const { getCategoryById } = await import("@/repositories/sports");
    const accessories = getCategoryById("cat-padel-accessories");
    const clothing = getCategoryById("cat-padel-clothing");
    expect(accessories).toBeTruthy();
    expect(isSoftGatedCategory(accessories!)).toBe(false);
    if (clothing) {
      expect(isSoftGatedCategory(clothing)).toBe(true);
    }

    const { getSitemapPathSetFixture } = await import(
      "./helpers/sitemap-fixture"
    );
    const paths = getSitemapPathSetFixture();
    expect(paths.has("/padel/accessories")).toBe(true);
    expect(paths.has("/padel/clothing")).toBe(false);
  });
});
