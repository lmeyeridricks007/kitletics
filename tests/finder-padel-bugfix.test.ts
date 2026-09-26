import { describe, expect, it } from "vitest";
import { getFinderDefinition } from "@/domain/finders/repository";
import {
  buildFinderResultsHref,
  decodeFinderShareState,
  encodeFinderShareState,
} from "@/domain/finders/share-state";
import { normalizeFinderResponses } from "@/domain/finders/normalization";
import { getFinderResultsData } from "@/lib/finder/get-finder-results-data";
import { getFinderUiConfig } from "@/lib/finder/finder-ui-config";
import { getToolBySlug, getProductById } from "@/repositories";

const PADEL_PROFILE = {
  primaryUse: "beginner",
  primaryPriority: "control",
  feelPreference: "dont-know",
  weightPreference: "light",
  armComfortPriority: "no",
  budget: "under-100",
} as const;

describe("Padel Racket Finder bugfix", () => {
  it("summary heading is racket-specific, never running profile", () => {
    const ui = getFinderUiConfig("padel-racket-finder");
    expect(ui.summaryHeading).toBe("Your racket profile");
    expect(ui.summaryHeading?.toLowerCase()).not.toContain("running");
    expect(ui.eyebrow).toContain("PADEL");
    expect(ui.productNoun).toBe("rackets");
  });

  it("padel finder config/questions have no Running shoe terminology leakage", () => {
    const def = getFinderDefinition("padel-racket-finder", "NL")!;
    const ui = getFinderUiConfig("padel-racket-finder");
    const blob = [
      ui.eyebrow,
      ui.headline,
      ui.supportingCopy,
      ui.summaryHeading,
      ui.resultsSupportingCopy,
      ...def.questions.flatMap((q) => [
        q.title,
        q.description ?? "",
        ...(q.options ?? []).flatMap((o) => [o.label, o.description ?? ""]),
      ]),
    ]
      .join("\n")
      .toLowerCase();
    for (const leak of [
      "running profile",
      "runner",
      "mileage",
      "pronation",
      "daily training",
      "road shoe",
      "trail shoe",
    ]) {
      expect(blob).not.toContain(leak);
    }
  });

  it("completed profile encodes, matches, and builds a results href", () => {
    const def = getFinderDefinition("padel-racket-finder", "NL")!;
    const tool = getToolBySlug("padel-racket-finder", { isDev: false });
    expect(tool?.status).toBe("published");
    expect(tool?.available).toBe(true);

    const encoded = encodeFinderShareState(def, { ...PADEL_PROFILE });
    const decoded = decodeFinderShareState(encoded, "padel-racket-finder");
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.responses.primaryUse).toBe("beginner");
    expect(decoded.responses.primaryPriority).toBe("control");
    expect(decoded.responses.budget).toBe("under-100");

    const profile = normalizeFinderResponses(def, decoded.responses, "NL");
    expect(profile.priorities).toContain("control");
    expect(profile.experienceLevel === "beginner" || profile.primaryUses.includes("beginner")).toBe(
      true,
    );
    expect(profile.weightPreference).toBe("light");
    expect(profile.armComfortPriority).toBe(false);

    const data = getFinderResultsData({
      finderSlug: "padel-racket-finder",
      responses: decoded.responses,
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeTruthy();
    expect(data!.rows.length).toBeGreaterThan(0);
    expect(data!.topResults.length).toBeGreaterThan(0);
    for (const row of data!.rows) {
      expect(row.product.categoryId).toBe("cat-padel-rackets");
      expect(row.product.status).toBe("published");
      const product = getProductById(row.product.id, { isDev: false });
      expect(product?.categoryId).toBe("cat-padel-rackets");
    }

    const href = buildFinderResultsHref(def, { ...PADEL_PROFILE });
    expect(href.startsWith("/tools/padel-racket-finder/results?s=")).toBe(true);
    expect(href.length).toBeGreaterThan(40);
  });

  it("zero-match-friendly: results page data still builds when answers are extreme", () => {
    const data = getFinderResultsData({
      finderSlug: "padel-racket-finder",
      responses: {
        primaryUse: "beginner",
        primaryPriority: "control",
        weightPreference: "light",
        armComfortPriority: "yes",
        budget: "under-100",
      },
      region: "NL",
      options: { isDev: false },
    });
    // Matcher must return a page model (possibly empty rows) — never throw.
    expect(data).toBeTruthy();
    expect(typeof data!.run.analysedCount).toBe("number");
    // Dead CTA is a client navigation concern; href must still be buildable.
    const def = getFinderDefinition("padel-racket-finder", "NL")!;
    expect(buildFinderResultsHref(def, { primaryUse: "beginner" })).toContain(
      "/results?s=",
    );
  });
});
