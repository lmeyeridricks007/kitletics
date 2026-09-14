import { describe, expect, it } from "vitest";
import {
  getLaunchEligibility,
  shouldRenderPublicly,
  shouldPromotePublicly,
  isIndexableEligibility,
  assessBestGuideLaunchQuality,
} from "@/domain/launch";
import { simulateDay1LaunchCounts } from "@/domain/launch/simulate-day1";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getProductBySlug,
  getProductById,
  getProducts,
  getSportBySlug,
  getTools,
} from "@/repositories";
import { verticalLaunchStrategy } from "@/content/launch/vertical-strategy";

const PROD = { isDev: false as const };
const PREVIEW = { isDev: true as const, preview: true as const };

describe("launch eligibility", () => {
  it(
    "indexes Best guides by LAUNCH_READY + vertical policy — not an absolute count ceiling",
    () => {
      const published = getBestGuides(PROD);
      expect(published.length).toBeGreaterThan(1);

      const indexable = published.filter((g) =>
        isIndexableEligibility(
          getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
        ),
      );
      // Some published Best remain held (thin / NMW / vertical) — not every published page indexes
      expect(indexable.length).toBeLessThan(published.length);
      expect(indexable.length).toBeGreaterThan(0);

      // Semantic policy (Fix 17+ / Fix 28): no arbitrary ≤N count.
      // Indexation requires production exposure + enabled vertical + LAUNCH_READY.
      for (const g of indexable) {
        const elig = getLaunchEligibility(
          { kind: "best-guide", entity: g },
          PROD,
        );
        expect(elig.quality).toBe("LAUNCH_READY");
        expect(elig.disposition).toBe("INDEXABLE");
        expect(elig.path).toBe(`/best/${g.slug}`);
        expect(elig.reasons.some((r) => r.code === "vertical_hold")).toBe(
          false,
        );

        const assessed = assessBestGuideLaunchQuality(g, PROD);
        expect(assessed.quality).toBe("LAUNCH_READY");
      }

      // Unique intent: one indexable Best slug per path (no duplicate-intent collisions)
      const slugs = indexable.map((g) => g.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    },
  );

  it("does not index thin Best guides", () => {
    const thin = getBestGuides(PROD).filter((g) => {
      const assessed = assessBestGuideLaunchQuality(g, PROD);
      return assessed.quality === "THIN";
    });
    for (const g of thin) {
      const elig = getLaunchEligibility(
        { kind: "best-guide", entity: g },
        PROD,
      );
      expect(isIndexableEligibility(elig)).toBe(false);
    }
  });

  it("does not index held-vertical Best guides", () => {
    const heldVertical = getBestGuides(PROD).filter((g) => {
      const elig = getLaunchEligibility(
        { kind: "best-guide", entity: g },
        PROD,
      );
      return elig.reasons.some((r) => r.code === "vertical_hold");
    });
    expect(heldVertical.length).toBeGreaterThan(0);
    for (const g of heldVertical) {
      const elig = getLaunchEligibility(
        { kind: "best-guide", entity: g },
        PROD,
      );
      expect(isIndexableEligibility(elig)).toBe(false);
      expect(elig.disposition).toBe("HIDDEN_404");
    }
  });

  it("hides thin Best guides in production but allows preview", () => {
    const thin = getBestGuides(PROD).find((g) => {
      const elig = getLaunchEligibility(
        { kind: "best-guide", entity: g },
        PROD,
      );
      return elig.disposition === "HIDDEN_404" && elig.quality === "THIN";
    });
    if (!thin) return; // catalog may have no thin best after enrichment

    const prod = getLaunchEligibility(
      { kind: "best-guide", entity: thin },
      PROD,
    );
    expect(shouldRenderPublicly(prod)).toBe(false);

    const preview = getLaunchEligibility(
      { kind: "best-guide", entity: thin },
      PREVIEW,
    );
    expect(shouldRenderPublicly(preview)).toBe(true);
    expect(preview.disposition).toBe("HIDDEN_404");
  });

  it("does not promote non-indexable products in search predicate", () => {
    const held = getProducts(PROD).find((p) => {
      const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
      return elig.disposition !== "INDEXABLE";
    });
    expect(held).toBeTruthy();
    const elig = getLaunchEligibility(
      { kind: "product", entity: held! },
      PROD,
    );
    expect(shouldPromotePublicly(elig)).toBe(false);
  });

  it("indexes selective padel hub without opening other racket sports", () => {
    expect(
      verticalLaunchStrategy.sports.find((s) => s.slug === "running")?.mode,
    ).toBe("enabled");
    expect(
      verticalLaunchStrategy.sports.find((s) => s.slug === "fitness")?.mode,
    ).toBe("selective");
    expect(
      verticalLaunchStrategy.sports.find((s) => s.slug === "padel")?.mode,
    ).toBe("selective");

    const padel = getSportBySlug("padel", PROD);
    expect(padel).toBeTruthy();
    expect(
      getLaunchEligibility({ kind: "sport", entity: padel! }, PROD)
        .disposition,
    ).toBe("INDEXABLE");

    const tennis = getSportBySlug("tennis", PROD);
    expect(tennis).toBeTruthy();
    expect(
      getLaunchEligibility({ kind: "sport", entity: tennis! }, PROD)
        .disposition,
    ).toBe("PUBLIC_NOINDEX");

    const fitness = getSportBySlug("fitness", PROD);
    expect(fitness).toBeTruthy();
    const sportElig = getLaunchEligibility(
      { kind: "sport", entity: fitness! },
      PROD,
    );
    expect(sportElig.disposition).toBe("PUBLIC_NOINDEX");

    const fitnessOnlyProduct = getProducts(PROD).find(
      (p) =>
        p.sportIds.includes("sport-training") &&
        !p.sportIds.includes("sport-running"),
    );
    if (fitnessOnlyProduct) {
      const elig = getLaunchEligibility(
        { kind: "product", entity: fitnessOnlyProduct },
        PROD,
      );
      expect(elig.disposition).toBe("HIDDEN_404");
      expect(elig.reasons.some((r) => r.code === "vertical_hold")).toBe(true);
    }
  });

  it("holds thin comparisons from indexation", () => {
    const thin = getComparisons(PROD).find((c) => {
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: c },
        PROD,
      );
      return elig.quality === "THIN";
    });
    if (!thin) return;
    const elig = getLaunchEligibility(
      { kind: "comparison", entity: thin },
      PROD,
    );
    expect(elig.disposition).toBe("PUBLIC_NOINDEX");
  });

  it("holds comparisons with unresolved peer products (no sitemap / no index)", () => {
    const broken = getComparisons(PROD).filter((c) =>
      c.productIds.some((id) => !getProductById(id, PROD)),
    );
    // P41 removed draft-peer comps from the live corpus; when none remain,
    // assert the eligibility gate still rejects synthetic missing peers.
    if (broken.length === 0) {
      const sample = getComparisons(PROD)[0];
      expect(sample).toBeTruthy();
      const synthetic = {
        ...sample!,
        productIds: [...sample!.productIds, "prod-does-not-exist-p48"],
      };
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: synthetic },
        PROD,
      );
      expect(elig.disposition).toBe("HIDDEN_404");
      expect(isIndexableEligibility(elig)).toBe(false);
      expect(
        elig.reasons.some((r) => r.code === "missing_comparison_product"),
      ).toBe(true);
      return;
    }
    for (const c of broken) {
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: c },
        PROD,
      );
      expect(elig.disposition).toBe("HIDDEN_404");
      expect(isIndexableEligibility(elig)).toBe(false);
      expect(shouldPromotePublicly(elig)).toBe(false);
      expect(
        elig.reasons.some((r) => r.code === "missing_comparison_product"),
      ).toBe(true);
    }
  });

  it("indexes COMPLETE buying guides only", () => {
    const guides = getBuyingGuides(PROD);
    for (const g of guides) {
      const elig = getLaunchEligibility(
        { kind: "buying-guide", entity: g },
        PROD,
      );
      if (elig.disposition === "INDEXABLE") {
        expect(elig.quality).toBe("COMPLETE");
      }
    }
  });

  it("includes reasons on every disposition", () => {
    const product = getProductBySlug("asics-novablast-5", PROD);
    expect(product).toBeTruthy();
    const elig = getLaunchEligibility(
      { kind: "product", entity: product! },
      PROD,
    );
    expect(elig.reasons.length).toBeGreaterThan(0);
    expect(["INDEXABLE", "PUBLIC_NOINDEX", "HIDDEN_404"]).toContain(
      elig.disposition,
    );
  });

  it("simulates Day-1 counts without hardcoding inventory", () => {
    const sim = simulateDay1LaunchCounts();
    expect(sim.rows.length).toBeGreaterThan(5);
    const best = sim.rows.find((r) => r.kind === "best-guide");
    expect(best).toBeTruthy();
    expect(best!.INDEXABLE).toBeLessThan(best!.published);
    expect(
      best!.INDEXABLE + best!.PUBLIC_NOINDEX + best!.HIDDEN_404,
    ).toBe(best!.published);

    const reviews = sim.rows.find((r) => r.kind === "review");
    expect(reviews!.INDEXABLE + reviews!.PUBLIC_NOINDEX + reviews!.HIDDEN_404).toBe(
      reviews!.published,
    );
  });

  it("indexes allowed padel tools but keeps tennis tools held", () => {
    const tools = getTools(PROD);
    const padel = tools.find((t) => t.slug === "padel-racket-finder");
    const tennis = tools.find((t) => t.slug === "tennis-racket-finder");
    expect(padel).toBeTruthy();
    expect(
      getLaunchEligibility({ kind: "tool", entity: padel! }, PROD)
        .disposition,
    ).toBe("INDEXABLE");
    expect(tennis).toBeTruthy();
    const tennisElig = getLaunchEligibility(
      { kind: "tool", entity: tennis! },
      PROD,
    );
    expect(isIndexableEligibility(tennisElig)).toBe(false);
    expect(tennisElig.reasons.some((r) => r.code === "vertical_hold")).toBe(
      true,
    );
  });
});
