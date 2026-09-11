import { describe, expect, it } from "vitest";
import {
  getCurrentHyroxSinglesFormat,
  hyroxCompetitionEvidence,
} from "@/content/hyrox/competition";
import { getStationSequence, loadForDivision } from "@/domain/competition/types";
import {
  buildSimplePlan,
  buildAdvancedPlan,
  requiredRunPaceForTarget,
  formatRaceTime,
  parseTimeToSeconds,
} from "@/domain/hyrox/race-calculator";
import { buildHyroxRaceKit } from "@/domain/hyrox/race-kit";
import { products } from "@/content/products";
import { offers } from "@/content/offers";
import { recommendations } from "@/content/recommendations";
import { buyingGuides } from "@/content/editorial";
import { tools } from "@/content/tools";
import { getFinderDefinition } from "@/domain/finders/repository";

describe("HYROX CompetitionFormat", () => {
  it("has evidence-backed Season 26/27 singles format", () => {
    const fmt = getCurrentHyroxSinglesFormat();
    expect(fmt.status).toBe("published");
    expect(fmt.stations).toHaveLength(8);
    expect(fmt.totalRunningDistanceM).toBe(8000);
    expect(fmt.evidenceIds.length).toBeGreaterThan(0);
    expect(hyroxCompetitionEvidence.some((e) => e.id === fmt.evidenceIds[0])).toBe(
      true,
    );
  });

  it("loads Men Open sled push at 152 kg incl. sled", () => {
    const fmt = getCurrentHyroxSinglesFormat();
    const sled = fmt.stations.find((s) => s.type === "sled-push")!;
    expect(loadForDivision(sled, "men-open")?.loadKg).toBe(152);
    expect(loadForDivision(sled, "women-open")?.loadKg).toBe(102);
    expect(loadForDivision(sled, "men-pro")?.loadKg).toBe(202);
  });

  it("sequences run then station eight times", () => {
    const seq = getStationSequence(getCurrentHyroxSinglesFormat());
    expect(seq.filter((s) => s.kind === "run")).toHaveLength(8);
    expect(seq.filter((s) => s.kind === "station")).toHaveLength(8);
    expect(seq[0].kind).toBe("run");
    expect(seq[1].kind).toBe("station");
  });
});

describe("HYROX Race Calculator", () => {
  const format = getCurrentHyroxSinglesFormat();

  it("sums simple plan exactly", () => {
    const plan = buildSimplePlan({
      format,
      averageRunPaceSecPerKm: 300, // 5:00
      averageStationSeconds: 240, // 4:00
      totalTransitionSeconds: 480, // 8:00
    });
    expect(plan.runningSeconds).toBe(8 * 300);
    expect(plan.stationSeconds).toBe(8 * 240);
    expect(plan.transitionSeconds).toBe(480);
    expect(plan.totalSeconds).toBe(8 * 300 + 8 * 240 + 480);
    expect(formatRaceTime(plan.totalSeconds)).toBe("1:20:00");
  });

  it("advanced plan equals sum of segments", () => {
    const segmentSeconds: Record<string, number> = {};
    const seq = getStationSequence(format);
    for (const step of seq) {
      const id =
        step.kind === "run" ? `run-${step.runIndex}` : (step.station?.id ?? "");
      segmentSeconds[id] = 200;
    }
    const plan = buildAdvancedPlan({
      format,
      segmentSeconds,
      totalTransitionSeconds: 100,
    });
    expect(plan.totalSeconds).toBe(16 * 200 + 100);
  });

  it("target finish computes required pace", () => {
    const r = requiredRunPaceForTarget({
      format,
      targetFinishSeconds: 75 * 60,
      stationSecondsTotal: 8 * 240,
      transitionSeconds: 480,
    });
    expect(r.ok).toBe(true);
    // 4500 - 1920 - 480 = 2100 running / 8 = 262.5 s/km
    expect(r.requiredPaceSecPerKm).toBeCloseTo(262.5, 5);
  });

  it("impossible target errors clearly", () => {
    const r = requiredRunPaceForTarget({
      format,
      targetFinishSeconds: 1000,
      stationSecondsTotal: 2000,
      transitionSeconds: 100,
    });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/exceed/i);
  });

  it("parses mm:ss and h:mm:ss", () => {
    expect(parseTimeToSeconds("5:00")).toBe(300);
    expect(parseTimeToSeconds("1:15:00")).toBe(4500);
  });
});

describe("HYROX Race Kit", () => {
  it("does not replace owned watch role", () => {
    const kit = buildHyroxRaceKit({
      profile: {
        experience: "intermediate",
        runningStrength: "balanced",
        priority: "versatility",
        budgetEur: 500,
        budgetMode: "strict",
        ownedProductIds: [],
        ownedRoles: ["TIMING", "HEART_RATE"],
        needCompleteKit: false,
        trainLocation: "commercial-gym",
      },
      products,
      offers,
    });
    expect(kit.items.every((i) => i.role !== "TIMING" || i.existing)).toBe(true);
    expect(kit.explanations.some((e) => /commercial gym/i.test(e))).toBe(true);
  });

  it("prefers training shoes when stability priority", () => {
    const kit = buildHyroxRaceKit({
      profile: {
        experience: "intermediate",
        runningStrength: "developing",
        priority: "stability",
        budgetEur: 400,
        budgetMode: "strict",
        ownedProductIds: [],
        ownedRoles: [],
        needCompleteKit: false,
        trainLocation: "mixed",
      },
      products,
      offers,
    });
    const shoe = kit.items.find((i) => i.role === "FOOTWEAR");
    expect(shoe).toBeTruthy();
    const p = products.find((x) => x.id === shoe!.productId);
    expect(p?.categoryId).toBe("cat-training-shoes");
  });
});

describe("HYROX content wiring", () => {
  it("registers tools and finder", () => {
    expect(tools.some((t) => t.slug === "hyrox-race-time-calculator")).toBe(true);
    expect(tools.some((t) => t.slug === "hyrox-race-kit-builder")).toBe(true);
    expect(getFinderDefinition("hyrox-shoe-finder")).toBeTruthy();
  });

  it("has HYROX recommendations without duplicate product entities", () => {
    const hyroxRecs = recommendations.filter((r) => r.sportId === "sport-hyrox");
    expect(hyroxRecs.length).toBeGreaterThanOrEqual(8);
    const boston = products.filter((p) => p.id === "prod-boston-12");
    expect(boston).toHaveLength(1);
  });

  it("publishes key buying guides", () => {
    for (const slug of [
      "how-to-choose-hyrox-shoes",
      "hyrox-race-shoes-vs-training-shoes",
      "hyrox-equipment-standards",
      "rowerg-vs-skierg-for-hyrox-training",
      "what-gear-do-you-need-for-hyrox",
      "how-to-build-a-hyrox-home-gym",
      "how-to-choose-a-hyrox-watch",
    ]) {
      expect(buyingGuides.some((g) => g.slug === slug)).toBe(true);
    }
  });
});

describe("HYROX search intents", () => {
  it("does not promote held HYROX finder as launch-active", async () => {
    const { searchKitletics } = await import("@/lib/search/engine");
    const hits = searchKitletics("hyrox shoes", { isDev: false, limit: 10 });
    expect(
      hits.every((h) => h.href !== "/tools/hyrox-shoe-finder"),
    ).toBe(true);
    expect(hits.every((h) => !h.href.startsWith("/tools/hyrox"))).toBe(true);
  });

  it("does not promote HYROX sport hub while vertical is held", async () => {
    const { searchKitletics } = await import("@/lib/search/engine");
    const hits = searchKitletics("hyrox", { isDev: false, limit: 20 });
    const sport = hits.find((h) => h.type === "sport" && h.title === "HYROX");
    expect(sport).toBeUndefined();
    expect(hits.every((h) => !h.href.startsWith("/tools/hyrox"))).toBe(true);
    expect(
      hits.every((h) => h.href !== "/hyrox" && h.href !== "/fitness/hyrox"),
    ).toBe(true);
  });
});
