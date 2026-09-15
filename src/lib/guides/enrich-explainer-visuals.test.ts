import { describe, expect, it } from "vitest";
import {
  enrichExplainerBlocksWithVisuals,
  resolveSectionVisual,
} from "@/lib/guides/enrich-explainer-visuals";
import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import { runningShoeDropConfig } from "@/lib/guides/explainers/running-shoe-drop-config";

describe("enrichExplainerBlocksWithVisuals", () => {
  it("injects a look-for checklist after factor-cards", () => {
    const blocks: ExplainerBlock[] = [
      {
        id: "factors",
        type: "factor-cards",
        title: "Key factors",
        cards: [
          {
            id: "fit",
            title: "Fit",
            whatItIs: "How the shoe holds your foot",
            whatYouNotice: "Hotspots or looseness",
            howItChanges: "Pick width and volume first",
          },
        ],
      },
    ];

    const out = enrichExplainerBlocksWithVisuals(
      blocks,
      "how-to-choose-training-shoes",
    );
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({
      type: "look-for",
      id: "factors-checklist",
    });
    expect(out[0]?.type).toBe("factor-cards");
    expect((out[0] as { diagram?: { variant: string } }).diagram?.variant).toBeTruthy();
  });

  it("adds lookFor panels and a diagram to matching comparison tables", () => {
    const blocks: ExplainerBlock[] = [
      {
        id: "compare",
        type: "comparison-table",
        title: "Chest strap or optical arm sensor?",
        columns: ["Chest strap", "Optical"],
        rows: [
          { label: "Signal", values: ["Consistent", "Convenient"] },
          { label: "Fit", values: ["Strap", "Band"] },
        ],
      },
    ];

    const out = enrichExplainerBlocksWithVisuals(
      blocks,
      "how-to-choose-heart-rate-monitor",
    );
    const table = out[0];
    expect(table?.type).toBe("comparison-table");
    if (table?.type !== "comparison-table") return;
    expect(table.lookFor?.length).toBe(2);
    expect(table.diagram?.variant).toBe("hrm-chest-vs-wrist");
  });

  it("does not duplicate an existing look-for after factors", () => {
    const blocks: ExplainerBlock[] = [
      {
        id: "factors",
        type: "factor-cards",
        title: "Key factors",
        cards: [
          {
            id: "a",
            title: "A",
            whatItIs: "x",
            whatYouNotice: "y",
            howItChanges: "z",
          },
        ],
      },
      {
        id: "factors-checklist",
        type: "look-for",
        title: "Already there",
        panels: [{ id: "p", title: "P", checks: ["c"] }],
      },
    ];

    const out = enrichExplainerBlocksWithVisuals(blocks, "any-guide");
    expect(out.filter((b) => b.type === "look-for")).toHaveLength(1);
  });

  it("maps drop definition to heel-to-toe-drop", () => {
    const blocks: ExplainerBlock[] = [
      {
        id: "what-is-drop",
        type: "prose",
        title: "What is running shoe drop?",
        paragraphs: ["Drop is heel minus forefoot stack."],
      },
    ];

    const out = enrichExplainerBlocksWithVisuals(blocks, "running-shoe-drop");
    expect(out[0]).toMatchObject({
      diagram: { variant: "heel-to-toe-drop" },
    });
  });

  it("never reuses the same diagram variant within a guide", () => {
    const blocks = enrichExplainerBlocksWithVisuals(
      runningShoeDropConfig.explainer!.blocks,
      "running-shoe-drop",
    );
    const variants = blocks
      .map((b) => ("diagram" in b ? b.diagram?.variant : undefined))
      .filter(Boolean) as string[];
    expect(variants.length).toBeGreaterThan(5);
    expect(new Set(variants).size).toBe(variants.length);
  });
  it("never stamps shoe concept art onto hydration guides", () => {
    const blocks: ExplainerBlock[] = [
      {
        id: "diff",
        type: "prose",
        title: "The practical difference",
        paragraphs: ["Belts and vests solve different carry jobs."],
      },
      {
        id: "decide",
        type: "decision-flow",
        title: "Choose your carry system",
        steps: [
          { id: "a", title: "Load", body: "Lay out the kit." },
          { id: "b", title: "Test", body: "Run with it." },
        ],
      },
      {
        id: "mistakes",
        type: "mistakes",
        title: "Common mistakes",
        mistakes: [
          { id: "m1", title: "Distance only", body: "Load first" },
        ],
      },
    ];
    const out = enrichExplainerBlocksWithVisuals(
      blocks,
      "hydration-vest-vs-running-belt",
    );
    const variants = out
      .map((b) => ("diagram" in b ? b.diagram?.variant : undefined))
      .filter(Boolean) as string[];
    expect(variants.length).toBeGreaterThan(0);
    expect(variants[0]).toBe("vest-vs-belt");
    for (const v of variants) {
      expect(v).not.toMatch(
        /daily-trainer|easy-miles|heel-to-toe|cushion|shoe|drop-|comparing-shoes|plate|foam|rocker|trainer/,
      );
    }
  });

  it("classifies fuel guides separately from hydration", () => {
    const out = enrichExplainerBlocksWithVisuals(
      [
        {
          id: "fuel",
          type: "prose",
          title: "How to carry fuel",
          paragraphs: ["Gels need a rehearsed access plan."],
        },
      ],
      "how-to-carry-fuel-on-long-runs",
    );
    expect((out[0] as { diagram?: { variant: string } }).diagram?.variant).toBe(
      "fuel-gels",
    );
  });

  it("attaches padel teaching diagrams and never shoe concept art", () => {
    const out = enrichExplainerBlocksWithVisuals(
      [
        {
          id: "shapes",
          type: "prose",
          title: "Round vs teardrop vs diamond",
          paragraphs: ["Shape shifts the sweet spot."],
        },
        {
          id: "decide",
          type: "decision-flow",
          title: "How to choose next",
          steps: [
            { id: "a", title: "Job", body: "Level and style." },
            { id: "b", title: "Geometry", body: "Shape and balance." },
          ],
        },
      ],
      "padel-racket-shapes-explained",
    );
    const variants = out
      .map((b) => ("diagram" in b ? b.diagram?.variant : undefined))
      .filter(Boolean) as string[];
    expect(variants.length).toBeGreaterThan(0);
    expect(variants).toContain("padel-racket-shapes");
    for (const v of variants) {
      expect(v.startsWith("padel-")).toBe(true);
    }
  });
});

describe("resolveSectionVisual", () => {
  it("prefers rocker imagery when the section is about rocker", () => {
    expect(
      resolveSectionVisual(
        "running-shoe-drop",
        "Drop, stack and rocker work as a system",
        "stack-rocker-interaction",
      )?.variant,
    ).toBe("rocker-geometry");
  });
});
