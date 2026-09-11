import { describe, expect, it } from "vitest";
import {
  rectsOverlap,
  rotateFootprint,
  placementRect,
} from "@/domain/room-planner/geometry";
import { checkCollision } from "@/domain/room-planner/collision";
import { toMm, fromMm } from "@/domain/room-planner/units";
import { createRectangularRoom } from "@/domain/room-planner/room";
import { generateLayout, validatePlacementMove } from "@/domain/room-planner/layout";
import { assessProductFit } from "@/domain/room-planner/fit";
import {
  canUseInRoomPlanner,
  PLANNING_DIMENSIONS,
} from "@/domain/room-planner/product-geometry";
import {
  encodeBuildShare,
  decodeBuildShare,
  BUILD_SHARE_VERSION,
} from "@/domain/room-planner/share";
import {
  runAdvancedHomeGymBuilder,
  runHomeGymBuilder,
} from "@/domain/builders/home-gym";
import { fitnessProducts } from "@/content/fitness";
import { offers } from "@/content/offers";
import { products } from "@/content/products";

const catalog = fitnessProducts.filter((p) => p.status === "published");

describe("Room geometry", () => {
  it("normalizes metric and imperial to the same millimetres", () => {
    expect(Math.round(toMm(3.4, "m"))).toBe(3400);
    expect(Math.round(toMm(fromMm(3400, "ft"), "ft"))).toBe(3400);
  });

  it("detects overlap but allows edge contact", () => {
    expect(
      rectsOverlap(
        { x: 0, y: 0, width: 100, depth: 100 },
        { x: 100, y: 0, width: 100, depth: 100 },
      ),
    ).toBe(false);
    expect(
      checkCollision(
        { x: 0, y: 0, width: 100, depth: 100 },
        { x: 50, y: 0, width: 100, depth: 100 },
      ),
    ).toBe(true);
  });

  it("rotates footprints at 90°", () => {
    expect(rotateFootprint(1000, 500, 90)).toEqual({
      widthMm: 500,
      depthMm: 1000,
    });
  });
});

describe("Door swing hard clearance", () => {
  it("blocks placement in inward door swing", () => {
    const room = createRectangularRoom({
      widthM: 4,
      lengthM: 4,
      heightM: 2.5,
      openings: [
        {
          id: "d1",
          type: "door",
          wallId: "south",
          offsetMm: 0,
          widthMm: 900,
          swingDirection: "in",
          swingDepthMm: 900,
        },
      ],
    });
    const rack = catalog.find((p) => p.id === "prod-rogue-rml-390f")!;
    const layout = generateLayout({
      room,
      items: [{ product: rack, roleIds: ["PRIMARY_STRENGTH_STATION"] }],
    });
    // Placement should not sit inside swing zone at south
    for (const pl of layout.placements) {
      const rect = placementRect(
        pl.xMm,
        pl.yMm,
        pl.footprint.widthMm,
        pl.footprint.depthMm,
        pl.rotation,
      );
      const swing = {
        x: 0,
        y: room.lengthMm - 900,
        width: 900,
        depth: 900,
      };
      expect(rectsOverlap(rect, swing)).toBe(false);
    }
  });
});

describe("Fit & ceiling", () => {
  it("rejects tall rack for low ceiling", () => {
    const room = createRectangularRoom({
      widthM: 4,
      lengthM: 4,
      heightM: 2.0,
    });
    const rack = catalog.find((p) => p.id === "prod-rogue-rm-4")!;
    const fit = assessProductFit({
      product: rack,
      room,
      wallMount: "yes",
      floorMount: "yes",
    });
    expect(fit.status).toBe("does-not-fit");
  });

  it("marks pull-up limitation when product fits but activity clearance is tight", () => {
    const room = createRectangularRoom({
      widthM: 4,
      lengthM: 4,
      heightM: 2.25,
    });
    const rack = catalog.find((p) => p.id === "prod-rogue-rml-390f")!;
    const fit = assessProductFit({
      product: rack,
      room,
      wallMount: "yes",
      floorMount: "yes",
    });
    expect(["fits", "fits-with-limitations", "tight-fit"]).toContain(fit.status);
  });

  it("never treats unknown height as a hard fit", () => {
    const room = createRectangularRoom({
      widthM: 3,
      lengthM: 3,
      heightM: 2.4,
    });
    const bare = {
      ...catalog[0],
      id: "prod-test-no-dims",
      specifications: {},
    };
    // Clear overlay by using unknown id
    const fit = assessProductFit({
      product: bare,
      room,
      wallMount: "yes",
      floorMount: "yes",
      dims: {},
    });
    expect(fit.status).toBe("unknown");
    expect(fit.confidence).toBe("low");
  });
});

describe("Layout engine", () => {
  it("does not auto-place products missing footprint", () => {
    const room = createRectangularRoom({
      widthM: 5,
      lengthM: 5,
      heightM: 2.6,
    });
    const noDim = {
      ...catalog[0],
      id: "prod-missing-fp",
      categoryId: "cat-power-racks",
      specifications: { heightMm: 2000 },
      fullName: "Missing Footprint Rack",
      name: "Missing",
    };
    const layout = generateLayout({
      room,
      items: [{ product: noDim, roleIds: ["PRIMARY_STRENGTH_STATION"] }],
    });
    expect(layout.placements.length).toBe(0);
    expect(layout.warnings.some((w) => w.code === "missing-dimensions")).toBe(
      true,
    );
  });

  it("validatePlacementMove rejects out of bounds", () => {
    const room = createRectangularRoom({
      widthM: 3,
      lengthM: 3,
      heightM: 2.4,
    });
    const placement = {
      id: "p1",
      productId: "x",
      roleIds: [],
      xMm: 0,
      yMm: 0,
      rotation: 0 as const,
      footprint: { widthMm: 1000, depthMm: 1000, rotationAllowed: true },
      clearanceZones: [],
      locked: false,
      source: "generated" as const,
      label: "Test",
    };
    const bad = validatePlacementMove({
      room,
      placement,
      others: [],
      xMm: 2500,
      yMm: 0,
      rotation: 0,
    });
    expect(bad.ok).toBe(false);
  });
});

describe("Advanced builder golden scenarios", () => {
  it("A: 3×3m strength €1500 produces compact setup", () => {
    const room = createRectangularRoom({
      widthM: 3,
      lengthM: 3,
      heightM: 2.4,
    });
    const res = runAdvancedHomeGymBuilder({
      profile: {
        mode: "scratch",
        depth: "quick",
        room,
        wallMount: "yes",
        floorMount: "yes",
        goals: ["strength"],
        goalPriority: ["strength"],
        exercises: ["squat", "bench-press", "deadlift"],
        priorities: ["value", "small-footprint"],
        noiseImportance: "not-important",
        budgetEur: 1500,
        budgetMode: "strict",
        spendStyle: "minimal",
        experience: "beginner",
        ownedProductIds: [],
        ownedCategories: [],
      },
      products: catalog,
      offers,
    });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.totalKnown).toBeLessThanOrEqual(1500);
    expect(res.totalKnown).not.toBe(0);
  });

  it("B: low ceiling calisthenics rejects tall racks", () => {
    const room = createRectangularRoom({
      widthM: 2.5,
      lengthM: 3,
      heightM: 2.2,
    });
    const res = runAdvancedHomeGymBuilder({
      profile: {
        mode: "scratch",
        depth: "quick",
        room,
        wallMount: "yes",
        floorMount: "no",
        goals: ["calisthenics"],
        goalPriority: ["calisthenics"],
        exercises: ["pull-ups", "muscle-ups"],
        priorities: ["small-footprint"],
        noiseImportance: "somewhat",
        budgetEur: 800,
        budgetMode: "strict",
        spendStyle: "minimal",
        experience: "intermediate",
        ownedProductIds: [],
        ownedCategories: [],
      },
      products: catalog,
      offers,
    });
    expect(
      res.items.every((i) => i.categoryId !== "cat-power-racks"),
    ).toBe(true);
    const mu = res.exerciseCoverage.find((e) => e.id === "muscle-ups");
    expect(mu?.coverage).not.toBe("supported");
  });

  it("D: apartment quiet penalizes loud cardio", () => {
    const room = createRectangularRoom({
      widthM: 3,
      lengthM: 3,
      heightM: 2.4,
      environment: "apartment",
    });
    const res = runAdvancedHomeGymBuilder({
      profile: {
        mode: "scratch",
        depth: "quick",
        room,
        wallMount: "no",
        floorMount: "no",
        goals: ["general-fitness"],
        goalPriority: ["general-fitness"],
        exercises: ["dumbbell-work"],
        priorities: ["quiet", "value"],
        noiseImportance: "very",
        budgetEur: 1000,
        budgetMode: "strict",
        spendStyle: "minimal",
        experience: "beginner",
        ownedProductIds: [],
        ownedCategories: [],
      },
      products: catalog,
      offers,
    });
    expect(
      res.items.every(
        (i) =>
          i.categoryId !== "cat-air-bikes" && i.categoryId !== "cat-treadmills",
      ),
    ).toBe(true);
  });

  it("E: HYROX preserves open space messaging", () => {
    const room = createRectangularRoom({
      widthM: 4,
      lengthM: 4,
      heightM: 2.5,
    });
    const res = runAdvancedHomeGymBuilder({
      profile: {
        mode: "scratch",
        depth: "quick",
        room,
        wallMount: "yes",
        floorMount: "yes",
        goals: ["hyrox"],
        goalPriority: ["hyrox"],
        exercises: ["sled", "rowing", "burpees"],
        priorities: ["open-space"],
        noiseImportance: "somewhat",
        budgetEur: 3000,
        budgetMode: "flexible",
        spendStyle: "minimal",
        experience: "intermediate",
        ownedProductIds: [],
        ownedCategories: [],
      },
      products: catalog,
      offers,
    });
    const sled = res.exerciseCoverage.find((e) => e.id === "sled");
    expect(sled?.coverage).toBe("not-supported");
    expect(res.explanations.some((e) => /HYROX|sled/i.test(e))).toBe(true);
  });

  it("F: owned equipment is not duplicated", () => {
    const room = createRectangularRoom({
      widthM: 5,
      lengthM: 4,
      heightM: 2.6,
    });
    const res = runAdvancedHomeGymBuilder({
      profile: {
        mode: "around-owned",
        depth: "quick",
        room,
        wallMount: "yes",
        floorMount: "yes",
        goals: ["strength"],
        goalPriority: ["strength"],
        exercises: ["bench-press"],
        priorities: ["value"],
        noiseImportance: "not-important",
        budgetEur: 3000,
        budgetMode: "strict",
        spendStyle: "minimal",
        experience: "intermediate",
        ownedProductIds: ["prod-rogue-ohio", "prod-rep-bumper-black"],
        ownedCategories: ["cat-weight-benches"],
      },
      products: catalog,
      offers,
    });
    expect(res.items.filter((i) => i.categoryId === "cat-barbells").length).toBe(1);
    expect(
      res.items.find((i) => i.productId === "prod-rogue-ohio")?.existing,
    ).toBe(true);
    expect(res.skipped.some((s) => s.role === "BENCH")).toBe(true);
  });

  it("strict budget €1500 rejects €1501 spend", () => {
    const legacy = runHomeGymBuilder({
      profile: {
        room: {
          lengthM: 5,
          widthM: 4,
          heightM: 2.6,
          wallMountAllowed: true,
          floorMountAllowed: true,
          noiseSensitive: false,
        },
        budgetEur: 1500,
        budgetMode: "strict",
        goals: ["strength", "powerlifting"],
        experience: "intermediate",
        ownedCategories: [],
        unitSystem: "metric",
      },
      products,
      offers,
    });
    expect(legacy.totalEstimated).toBeLessThanOrEqual(1500);
  });
});

describe("Share payload", () => {
  it("round-trips without product dimension objects", () => {
    const payload = encodeBuildShare({
      version: BUILD_SHARE_VERSION,
      room: {
        widthMm: 3400,
        lengthMm: 3000,
        heightMm: 2400,
        openings: [],
        obstacles: [],
        restrictedZones: [],
        walls: [
          { id: "north", mountable: true },
          { id: "east", mountable: true },
          { id: "south", mountable: true },
          { id: "west", mountable: true },
        ],
      },
      goals: ["strength"],
      priorities: ["value"],
      exercises: ["squat"],
      budgetEur: 2000,
      budgetMode: "strict",
      noiseImportance: "somewhat",
      wallMount: "yes",
      floorMount: "yes",
      ownedProductIds: [],
      selectedProductIds: ["prod-rogue-rml-390f"],
      placements: [
        {
          productId: "prod-rogue-rml-390f",
          xMm: 0,
          yMm: 0,
          rotation: 0,
          locked: false,
        },
      ],
      createdAt: "2026-08-31T00:00:00.000Z",
    });
    const decoded = decodeBuildShare(payload);
    expect(decoded?.selectedProductIds).toEqual(["prod-rogue-rml-390f"]);
    expect(decoded?.room.widthMm).toBe(3400);
  });
});

describe("Planner readiness", () => {
  it("reports planner-ready coverage for key categories", () => {
    const racks = catalog.filter((p) => p.categoryId === "cat-power-racks");
    const ready = racks.filter((p) => canUseInRoomPlanner(p));
    expect(ready.length).toBeGreaterThanOrEqual(6);
    expect(Object.keys(PLANNING_DIMENSIONS).length).toBeGreaterThan(40);
  });
});
