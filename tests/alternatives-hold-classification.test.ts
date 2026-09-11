import { describe, expect, it } from "vitest";
import { getProductBySlug, getProducts } from "@/repositories/products";
import { getAllProductRelationships } from "@/repositories/relationships";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { isAlternativeType } from "@/domain/relationships/types";
import {
  alternativeMarketCluster,
} from "@/content/alternatives-p65-completion";
import {
  classifyAlternativesHold,
  EXPLAINED_ALTERNATIVES_HOLDS,
} from "@/lib/product/classify-alternatives-hold";
import {
  scoreAlternativePair,
  scoreComparisonPair,
} from "@/lib/decision-graph/semantic-quality";

const PROD = { isDev: false as const };

const FINAL_FOUR = [
  "ciele-gocap-athletics",
  "brooks-notch-thermal-beanie",
  "horizon-t202-treadmill",
  "woodway-curve-trainer",
] as const;

describe("Fix 74 alternatives hold classification", () => {
  it("splits cap vs beanie and does not treat Sherpa shorts as headwear", () => {
    const cap = getProductBySlug("ciele-gocap-athletics", PROD)!;
    const beanie = getProductBySlug("brooks-notch-thermal-beanie", PROD)!;
    const aerobill = getProductBySlug("nike-aerobill-cap", PROD)!;
    const sherpa = getProductBySlug("brooks-sherpa-7-men", PROD)!;

    expect(alternativeMarketCluster(cap)).toBe("clothing:cap");
    expect(alternativeMarketCluster(aerobill)).toBe("clothing:cap");
    expect(alternativeMarketCluster(beanie)).toBe("clothing:beanie");
    expect(alternativeMarketCluster(sherpa)).toBe("clothing:short");
    expect(scoreAlternativePair(cap, beanie).cls).toBe("INVALID");
    expect(scoreAlternativePair(cap, sherpa).cls).toBe("INVALID");
    expect(scoreAlternativePair(cap, aerobill).cls).not.toBe("INVALID");
  });

  it("does not treat a motorised folding deck as a curved sprint substitute", () => {
    const horizon = getProductBySlug("horizon-t202-treadmill", PROD)!;
    const sole = getProductBySlug("sole-f80-treadmill", PROD)!;
    const woodway = getProductBySlug("woodway-curve-trainer", PROD)!;
    const assault = getProductBySlug("assaultrunner-pro", PROD)!;

    expect(alternativeMarketCluster(horizon)).toBe("treadmill:motorised");
    expect(alternativeMarketCluster(sole)).toBe("treadmill:motorised");
    expect(alternativeMarketCluster(woodway)).toBe("treadmill:curved-manual");
    expect(alternativeMarketCluster(assault)).toBe("treadmill:curved-manual");
    expect(scoreAlternativePair(horizon, woodway).cls).toBe("INVALID");
    expect(scoreAlternativePair(horizon, sole).cls).not.toBe("INVALID");
    expect(scoreAlternativePair(woodway, assault).cls).not.toBe("INVALID");
    expect(scoreComparisonPair(horizon, assault).cls).not.toBe("INVALID");
  });

  it("holds the final four as insufficient same-job markets, not READY or unexplained", () => {
    const catalog = getProducts(PROD);
    const rels = getAllProductRelationships();
    for (const slug of FINAL_FOUR) {
      const product = getProductBySlug(slug, PROD)!;
      const hold = classifyAlternativesHold(product, rels, catalog);
      expect(hold, slug).toBe("HOLD_INSUFFICIENT_ALTERNATIVE_MARKET");
      expect(canPublishAlternativesPage(product, rels).ok, slug).toBe(false);
    }
  });

  it("never leaves a failing Alternatives candidate THIN_UNEXPLAINED", () => {
    const catalog = getProducts(PROD);
    const rels = getAllProductRelationships();
    const unexplained: string[] = [];

    for (const product of catalog) {
      if (product.status !== "published" || product.noindex) continue;
      const alts = rels.filter(
        (r) =>
          r.sourceProductId === product.id &&
          r.status === "approved" &&
          isAlternativeType(r.type),
      );
      if (alts.length === 0) continue;
      const gate = canPublishAlternativesPage(product, rels);
      if (gate.ok) continue;
      const hold = classifyAlternativesHold(product, rels, catalog);
      if (hold === "THIN_UNEXPLAINED") unexplained.push(product.slug);
      expect(EXPLAINED_ALTERNATIVES_HOLDS).toContain(hold);
    }

    expect(unexplained).toEqual([]);
  });
});
