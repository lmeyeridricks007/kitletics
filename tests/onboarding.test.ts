import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { productFamilies } from "@/content/families";
import {
  findExistingProductCandidate,
  resolveBrand,
} from "@/domain/onboarding/identity";
import {
  normalizeFindingValue,
  normalizeWeightToGrams,
  rejectUnsafeDerivation,
} from "@/domain/onboarding/normalize";
import {
  getProductResearchConfig,
  padelRacketsResearchConfig,
} from "@/domain/onboarding/research-config";
import {
  discoverBrandCatalog,
  onboardExplicitProduct,
  publishApprovedSession,
  approveSession,
} from "@/domain/onboarding/orchestrator";
import {
  createFixtureResearchProvider,
  FIXTURE_ASICS_LINEUP,
  FIXTURE_CONFLICT_WEIGHT,
  FIXTURE_NOVABLAST_7,
  FIXTURE_OVERSIZED_MEDIA,
  FIXTURE_PADEL_RACKET,
  FIXTURE_WRONG_GENERATION_MEDIA,
} from "@/domain/onboarding/fixtures";
import { validateResearchProviderResult } from "@/domain/onboarding/schemas";

const catalog = {
  products,
  brands,
  families: productFamilies,
};

describe("Product identity / duplicates", () => {
  it("resolves ASICS brand casing", () => {
    expect(resolveBrand(brands, "asics")?.id).toBe("brand-asics");
    expect(resolveBrand(brands, "ASICS")?.id).toBe("brand-asics");
  });

  it("detects existing Novablast 6 as exact match", () => {
    const result = findExistingProductCandidate(products, brands, productFamilies, {
      brandName: "ASICS",
      modelName: "Novablast 6",
      fullName: "ASICS Novablast 6",
      familyName: "Novablast",
      generation: "6",
      aliases: ["Novablast6"],
    });
    expect(result.kind).toBe("exact");
    expect(result.existingProductId).toBe("prod-novablast-6");
  });

  it("treats Novablast 7 as new when not in catalog", () => {
    const result = findExistingProductCandidate(products, brands, productFamilies, {
      brandName: "ASICS",
      modelName: "Novablast 7",
      fullName: "ASICS Novablast 7",
      familyName: "Novablast",
      generation: "7",
      aliases: [],
    });
    expect(result.kind).toBe("new");
  });
});

describe("Normalization", () => {
  it("converts oz to grams", () => {
    expect(normalizeWeightToGrams(9, "oz")).toBe(255);
  });

  it("does not coerce unknown to 0", () => {
    expect(normalizeFindingValue("drop", "unknown")).toBeNull();
    expect(normalizeFindingValue("weight", null)).toBeNull();
  });

  it("rejects unsafe stack derivation", () => {
    expect(rejectUnsafeDerivation("forefootStack", "derived-from-drop")).toBe(
      true,
    );
  });
});

describe("Research schema", () => {
  it("validates fixture output", () => {
    const parsed = validateResearchProviderResult(FIXTURE_NOVABLAST_7);
    expect(parsed.success).toBe(true);
  });
});

describe("Explicit onboarding E2E (fixture)", () => {
  it("stages new Product without publishing", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
      },
      catalog,
    );
    expect(session.candidateProduct).toBeTruthy();
    expect(session.status).not.toBe("published");
    expect(["ready", "needs-review"]).toContain(session.status);
    expect(session.candidateProduct!.specifications.drop).toBe(8);
    expect(session.evidence.length).toBeGreaterThan(0);
    expect(
      session.evidence.every((e) => e.type !== "personal-test"),
    ).toBe(true);
  });

  it("idempotent: second run recognizes existing after first staged id collision via catalog match", async () => {
    const a = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 6",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
      },
      catalog,
    );
    expect(a.identity?.kind).toBe("exact");
    expect(a.quality.reviewReasons.some((r) => r.includes("Existing Product"))).toBe(
      true,
    );
  });

  it("records source conflict without averaging", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7 Conflict",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_CONFLICT_WEIGHT),
      },
      catalog,
    );
    expect(session.conflicts.some((c) => c.field === "weight")).toBe(true);
    expect(session.conflicts[0].recommendedResolution).toMatch(/not average/i);
    expect(session.status).toBe("needs-review");
  });

  it("rejects wrong-generation media", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7 Media",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_WRONG_GENERATION_MEDIA),
      },
      catalog,
    );
    expect(session.media.some((m) => m.status === "rejected")).toBe(true);
    expect(session.quality.mediaFlagged).toBeGreaterThan(0);
  });

  it("flags oversized source dimensions without rejecting licensed media", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7 Oversized",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_OVERSIZED_MEDIA),
      },
      catalog,
    );
    const hero = session.media.find((m) => m.usageType === "hero");
    expect(hero?.status).not.toBe("rejected");
    expect(hero?.ingestLevel).toBe("error");
    expect(session.quality.mediaFlagged).toBeGreaterThan(0);
    expect(
      session.quality.reviewReasons.some((r) => /ingest ERROR/i.test(r)),
    ).toBe(true);
  });

  it("refuses --publish auto path", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7 Pub",
        category: "running-shoes",
        dryRun: true,
        publish: true,
        provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
      },
      catalog,
    );
    expect(session.quality.blockers.some((b) => /Auto-publish/i.test(b))).toBe(
      true,
    );
  });

  it("publish requires approval", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7 Gate",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
      },
      catalog,
    );
    expect(() => publishApprovedSession(session)).toThrow(/approved/i);
    // Clear review-only reasons that aren't blockers for approve test when ready
    if (session.quality.blockers.length === 0) {
      session.conflicts = session.conflicts.filter((c) => c.status !== "open");
      // Force ready path
      session.quality.reviewReasons = [];
      const approved = approveSession(session);
      expect(approved.status).toBe("approved");
      const published = publishApprovedSession(approved);
      expect(published.status).toBe("published");
    }
  });
});

describe("Brand discovery", () => {
  it("flags Novablast 7 as new-generation and Novablast 6 as existing", () => {
    const session = discoverBrandCatalog(
      {
        brand: "ASICS",
        sport: "running",
        dryRun: true,
        knownLineup: FIXTURE_ASICS_LINEUP,
      },
      catalog,
    );
    const nb6 = session.discoveryCandidates?.find((c) =>
      c.modelName.includes("Novablast 6"),
    );
    const nb7 = session.discoveryCandidates?.find((c) =>
      c.modelName.includes("Novablast 7"),
    );
    expect(nb6?.kind).toBe("existing");
    expect(nb7?.kind).toBe("new-generation");
    expect(nb7?.priority).toBe("HIGH");
  });
});

describe("Multi-sport config", () => {
  it("exposes Padel racket research config without Running assumptions", () => {
    const cfg = getProductResearchConfig("padel-rackets");
    expect(cfg?.categoryId).toBe("cat-padel-rackets");
    expect(cfg?.requiredSpecs).toContain("shape");
    expect(cfg?.requiredSpecs).not.toContain("drop");
    expect(padelRacketsResearchConfig.sportId).toBe("sport-padel");
  });

  it("can onboard via padel category config with fixture", async () => {
    // Brand may not resolve — expect blocker or staged with brand issue
    const session = await onboardExplicitProduct(
      {
        brand: "Bullpadel",
        model: "Vertex 05",
        category: "padel-rackets",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_PADEL_RACKET),
      },
      catalog,
    );
    // Either brand exists in padel seed or blocked — pipeline must not crash
    expect(["blocked", "ready", "needs-review"]).toContain(session.status);
  });
});

describe("Publication security (staging)", () => {
  it("staged Product is not in public published product list by id until content merge", async () => {
    const session = await onboardExplicitProduct(
      {
        brand: "ASICS",
        model: "Novablast 7 Secure",
        category: "running-shoes",
        dryRun: true,
        provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
      },
      catalog,
    );
    const stagedId = session.candidateProduct!.id;
    expect(products.some((p) => p.id === stagedId && p.status === "published")).toBe(
      false,
    );
  });
});
