import { describe, expect, it } from "vitest";
import { getProductReviewSummary } from "@/lib/product/get-product-review-summary";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { getBrandHubPageData } from "@/lib/brand-hub";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import {
  isSemanticallyCompatible,
  inferEditorialTopic,
  resolveSemanticImage,
  topicSport,
} from "@/lib/media/semantic-image";
import {
  formatPublicSpecKey,
  formatPublicSpecCue,
  formatPublicSpecDisplayLabel,
  isRawPublicSpecKey,
} from "@/lib/specs/public-label";
import {
  rewriteUniquenessEraSkipProse,
  skipSentenceFromLimitation,
} from "@/lib/review/rewrite-uniqueness-era-skip";

const RUNNING_SHOES = "/images/home/guide-running-shoes.jpg";

const BANNED = [
  "I'd pause if not",
  "Look elsewhere if not",
  "already decided the lane",
  "headline trait",
  "skuslug",
  "concatenated",
  "heelStack",
] as const;

function visiblePublicText(value: unknown, key?: string): string {
  if (
    key === "specifications" ||
    key === "id" ||
    key === "productId" ||
    key === "key" ||
    key === "specKey"
  ) {
    return "";
  }
  if (typeof value === "string") {
    if (/^[a-z]+[A-Z][a-zA-Z]+$/.test(value)) return "";
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map((v) => visiblePublicText(v)).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => visiblePublicText(v, k))
      .join("\n");
  }
  return "";
}

function expectCleanPublicCopy(text: string, label: string) {
  for (const banned of BANNED) {
    expect(text, `${label} still contains ${banned}`).not.toContain(banned);
  }
}

describe("uniqueness-era skip rewriter", () => {
  it("rewrites Novablast / OOFOS / Houdini skip grammar into spoken English", () => {
    expect(
      rewriteUniquenessEraSkipProse(
        "I'd pause if not a stability shoe shows up often in your week.",
      ),
    ).toBe("Skip it if you need a stability shoe for most of your training.");
    expect(
      rewriteUniquenessEraSkipProse("Look elsewhere if Not a running shoe."),
    ).toBe("Skip it if you're looking for a shoe designed for running.");
    expect(
      rewriteUniquenessEraSkipProse(
        "Look elsewhere if Not a fully waterproof storm shell.",
      ),
    ).toBe("Choose another jacket if you need full waterproof protection.");
    expect(
      skipSentenceFromLimitation("not a commercial curved sprint deck"),
    ).toBe("Skip it if you need a commercial curved sprint deck.");
  });
});

describe("rendered quality zero-debt canaries", () => {
  it("Novablast 6 PDP and review no longer print uniqueness-era skip lines", () => {
    const pdp = getProductPageData("asics-novablast-6", { region: "NL" });
    const summary = getProductReviewSummary({
      productSlug: "asics-novablast-6",
      region: "NL",
    });
    const review = getReviewPageData("asics-novablast-6", { region: "NL" });
    expect(pdp).toBeTruthy();
    expect(summary).toBeTruthy();
    expect(review).toBeTruthy();
    expectCleanPublicCopy(visiblePublicText(pdp), "novablast pdp");
    expectCleanPublicCopy(visiblePublicText(summary), "novablast summary");
    expectCleanPublicCopy(visiblePublicText(review), "novablast review");
  });

  it("OOFOS and Houdini PDPs use consumer skip sentences", () => {
    for (const slug of ["oofos-ooriginal", "patagonia-houdini-men"] as const) {
      const pdp = getProductPageData(slug, { region: "NL" });
      const summary = getProductReviewSummary({ productSlug: slug, region: "NL" });
      expect(pdp).toBeTruthy();
      expectCleanPublicCopy(visiblePublicText(pdp), slug);
      if (summary) expectCleanPublicCopy(visiblePublicText(summary), `${slug} summary`);
      expect(visiblePublicText(pdp), slug).not.toMatch(/looking for not a/i);
    }
  });

  it("Novablast alternatives intro never prints heelStack", () => {
    const data = getAlternativesPageData("asics-novablast-6", { region: "NL" });
    expect(data).toBeTruthy();
    const visible = [
      data!.source.intro,
      data!.source.summary,
      ...data!.alternatives.flatMap((a) => [
        a.summary,
        a.whyAlternative,
        a.whoShouldSwitch,
        a.whoShouldStay,
        ...a.betterAt,
        ...a.worseAt,
      ]),
    ].join("\n");
    expectCleanPublicCopy(visible, "novablast alternatives");
    expect(isRawPublicSpecKey(visible)).toBe(false);
  });

  it("padel brand hubs cannot resolve a running-shoe fallback", () => {
    for (const slug of ["adidas-padel", "bullpadel", "nox"] as const) {
      const data = getBrandHubPageData({ brandSlug: slug, region: "NL" });
      expect(data, slug).toBeTruthy();
      const blob = visiblePublicText(data);
      expect(blob, slug).not.toContain(RUNNING_SHOES);
      const hubTopic = inferEditorialTopic({
        slug,
        title: data!.brand.name,
        categoryId: "cat-padel-rackets",
      });
      expect(topicSport(hubTopic)).toBe("padel");
      for (const guide of data!.guides.items) {
        expect(
          isSemanticallyCompatible(guide.imageSrc, "padel_rackets", "card"),
          `${slug} ${guide.imageSrc}`,
        ).toBe(true);
        expect(topicSport(inferEditorialTopic({ slug: guide.href }))).not.toBe(
          "running",
        );
      }
    }
  });

  it("TYR / fitness brand hub cannot resolve a running-shoe fallback", () => {
    const data = getBrandHubPageData({ brandSlug: "tyr", region: "NL" });
    expect(data).toBeTruthy();
    expect(visiblePublicText(data)).not.toContain(RUNNING_SHOES);
    for (const guide of data!.guides.items) {
      expect(
        isSemanticallyCompatible(guide.imageSrc, "training_shoes", "card") ||
          isSemanticallyCompatible(guide.imageSrc, "fitness", "card"),
        `tyr ${guide.imageSrc}`,
      ).toBe(true);
    }
    const forced = resolveSemanticImage({
      pageType: "brand",
      placement: "card",
      slug: "how-to-choose-running-shoes",
      title: "How to Choose Running Shoes",
      dedicatedSrc: RUNNING_SHOES,
      topicHint: "training_shoes",
      brandSlug: "tyr",
    });
    expect(forced.src).not.toBe(RUNNING_SHOES);
    expect(isSemanticallyCompatible(RUNNING_SHOES, "training_shoes", "card")).toBe(
      false,
    );
  });

  it("resolver refuses running-shoe photography on padel brand-hub topic", () => {
    const resolved = resolveSemanticImage({
      pageType: "brand",
      placement: "card",
      slug: "how-to-choose-running-shoes",
      title: "How to Choose Running Shoes",
      dedicatedSrc: RUNNING_SHOES,
      topicHint: "padel_rackets",
      brandSlug: "bullpadel",
    });
    expect(resolved.src).not.toBe(RUNNING_SHOES);
    expect(
      isSemanticallyCompatible(resolved.src, "padel_rackets", "card"),
    ).toBe(true);
  });

  it("public spec labels never emit camelCase keys", () => {
    expect(formatPublicSpecKey("heelStack")).toBe("heel stack");
    expect(formatPublicSpecKey("cushionLevel")).toBe("cushioning");
    expect(formatPublicSpecDisplayLabel("heelStack")).toBe("Heel Stack");
    expect(formatPublicSpecCue("heelStack", 41.5)).toBe("heel stack 41.5");
    expect(isRawPublicSpecKey("heel stack 41.5")).toBe(false);
    expect(isRawPublicSpecKey("drop 8, heelStack 41.5")).toBe(true);
  });

  it("best-guide bodies that used to carry pause-if-not are rewritten", () => {
    const guide = getBestGuidePageData("running-jackets", { region: "NL" });
    expect(guide).toBeTruthy();
    expectCleanPublicCopy(visiblePublicText(guide), "running-jackets");
  });
});
