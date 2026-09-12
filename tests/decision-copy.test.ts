import { describe, expect, it } from "vitest";
import {
  classifyDecisionLine,
  resolveCanonicalDecisionCopy,
  resolveDecisionCopyForProduct,
  toSituationLabel,
  toDecisionLine,
  salvageDecisionLine,
  decisionCopyIsIndexable,
} from "@/lib/decision-copy";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductReviewSummary } from "@/lib/product/get-product-review-summary";
import { getProductBySlug } from "@/repositories";

describe("decision-copy classifier", () => {
  it("flags forensic machine templates as MACHINE_LIKE", () => {
    expect(
      classifyDecisionLine(
        "Novablast 6 fits buyers who already decided the lane is tempo trainer.",
      ),
    ).toBe("MACHINE_LIKE");
    expect(
      classifyDecisionLine("You need not a stability shoe look at Ghost 16."),
    ).toBe("BROKEN");
  });

  it("flags wordy and generic lines", () => {
    expect(
      classifyDecisionLine(
        "Runners shopping for daily training who want a dependable primary shoe without overcomplicating the rotation and still covering mixed weeks.",
      ),
    ).toBe("WORDY");
    expect(classifyDecisionLine("Comfortable.")).toBe("GENERIC");
  });

  it("accepts scannable consumer bullets as GOOD", () => {
    expect(
      classifyDecisionLine("Daily training with a soft, energetic ride."),
    ).toBe("GOOD");
    expect(
      classifyDecisionLine("You're looking for a soft, energetic daily trainer."),
    ).toBe("GOOD");
  });
});

describe("decision-copy transforms", () => {
  it("converts You-form Buy If into Best For situations", () => {
    expect(
      toSituationLabel(
        "You're looking for a soft, energetic daily trainer.",
        "buy",
      ),
    ).toBe("Daily training with a soft, energetic ride.");
    expect(
      toSituationLabel(
        "You want enough cushioning for long runs without a heavy ride.",
        "buy",
      ),
    ).toBe("Long runs where cushioning matters more than outright speed.");
    expect(
      toSituationLabel("You need added stability or guidance.", "skip"),
    ).toBe("Runners who need added stability or guidance.");
    expect(
      toSituationLabel(
        "You're primarily looking for the lightest race-day option.",
        "skip",
      ),
    ).toBe("Those looking for a lightweight race-day shoe.");
  });

  it("keeps Buy If in second person", () => {
    expect(
      toDecisionLine("Daily training with a soft, energetic ride.", "buy"),
    ).toMatch(/^You/);
  });

  it("does not prefix taxonomy fragments with Those looking for not a", () => {
    expect(salvageDecisionLine("Not a running shoe.", "notIdealFor")).not.toMatch(
      /looking for not a/i,
    );
    expect(salvageDecisionLine("Not a running shoe.", "skipIf")).toMatch(
      /shoe designed for running/i,
    );
    expect(
      salvageDecisionLine("not a stability shoe", "notIdealFor"),
    ).not.toMatch(/Runners who People/i);
    expect(
      salvageDecisionLine("Not a fully waterproof storm shell.", "notIdealFor"),
    ).toMatch(/waterproof/i);
    expect(
      salvageDecisionLine("Not a fully waterproof storm shell.", "notIdealFor"),
    ).not.toMatch(/looking for not a/i);
  });
});

describe("canonical decision model", () => {
  it("does not duplicate Best For and Buy If", () => {
    const copy = resolveCanonicalDecisionCopy({
      productName: "Novablast 6",
      whoShouldBuy: [
        "You're looking for a soft, energetic daily trainer.",
        "You want enough cushioning for long runs without a heavy ride.",
        "You prefer a neutral shoe with a lively rocker.",
      ],
      whoShouldAvoid: [
        "You need added stability or guidance.",
        "You're primarily looking for the lightest race-day option.",
        "You prefer a firm, highly responsive ride.",
      ],
      strengths: ["Soft energetic daily ride"],
      weaknesses: ["Not a stability shoe"],
    });
    expect(copy.bestFor.length).toBeGreaterThanOrEqual(2);
    expect(copy.buyIf.length).toBeGreaterThanOrEqual(2);
    for (const buy of copy.buyIf) {
      expect(copy.bestFor).not.toContain(buy);
    }
    for (const skip of copy.skipIf) {
      expect(copy.notIdealFor).not.toContain(skip);
    }
    expect(decisionCopyIsIndexable(copy)).toBe(true);
    expect(copy.bestFor[0]).not.toMatch(/^You /);
    expect(copy.buyIf[0]).toMatch(/^You/);
  });

  it("salvages uniqueness-era Buy If templates", () => {
    const copy = resolveCanonicalDecisionCopy({
      productName: "Novablast 5",
      whoShouldBuy: [
        "You want soft energetic ride and will rotate or compare against Ghost 16 — that is the Novablast 5's main job",
        "Most of your sessions match good for high easy mileage more than a do-everything compromise",
      ],
      whoShouldAvoid: [
        "You need not a stability shoe — look at Ghost 16 or a clearer specialist instead of forcing the Novablast 5",
        "Your must-haves conflict with a Novablast 5 trade-off: less ideal for fast intervals",
      ],
      strengths: ["Soft energetic daily ride", "Light for the stack"],
      weaknesses: ["Not a stability shoe", "Less ideal as a pure race-day racer"],
    });
    for (const line of [
      ...copy.bestFor,
      ...copy.buyIf,
      ...copy.skipIf,
      ...copy.notIdealFor,
    ]) {
      expect(classifyDecisionLine(line)).not.toBe("MACHINE_LIKE");
      expect(classifyDecisionLine(line)).not.toBe("BROKEN");
    }
  });
});

describe("public surfaces use the canonical registers", () => {
  const PROD = { isDev: false as const };

  it("keeps Novablast 6 review Best For distinct from Buy If", () => {
    const page = getReviewPageData("asics-novablast-6", PROD);
    expect(page).toBeTruthy();
    const glance = page!.glanceRows.find((r) => r.key === "best-for");
    expect(glance?.items?.[0]).not.toMatch(/^You /);
    expect(page!.decisionCopy.buyIf[0]).toMatch(/^You/);
    expect(page!.decisionCopy.bestFor[0]).not.toBe(page!.decisionCopy.buyIf[0]);
    expect(page!.decisionCopy.bestFor[0]).not.toBe(page!.decisionCopy.buyIf[0]);
    expect(
      page!.decisionCopy.bestFor.some((l) =>
        page!.decisionCopy.buyIf.includes(l),
      ),
    ).toBe(false);
  });

  it("keeps PDP glance Best For as a situation, not taxonomy or Buy If", () => {
    const page = getProductPageData("asics-novablast-6", PROD);
    expect(page).toBeTruthy();
    expect(page!.bestFor[0]).not.toMatch(/^You /);
    expect(page!.buyIf[0]).toMatch(/^You/);
    expect(page!.bestFor[0]).not.toBe(page!.buyIf[0]);
    const fact = page!.quickFacts.find((f) => f.id === "best-for");
    expect(fact?.value).not.toMatch(/Daily Training|Easy Runs/);
  });

  it("splits PDP review Best for vs Buy if", () => {
    const summary = getProductReviewSummary({
      productSlug: "asics-novablast-6",
    });
    expect(summary).toBeTruthy();
    expect(summary!.bestFor[0]).not.toBe(summary!.buyIf[0]);
    expect(summary!.notIdealFor[0]).not.toBe(summary!.skipIf[0]);
  });

  it("resolves catalog products without inventing taxonomy Best For", () => {
    const product = getProductBySlug("asics-novablast-6", PROD);
    expect(product).toBeTruthy();
    const copy = resolveDecisionCopyForProduct({ product: product! });
    expect(copy.bestFor[0]).not.toMatch(/uc-/);
    expect(copy.bestFor[0]?.split(/\s+/).length).toBeLessThanOrEqual(18);
  });
});
