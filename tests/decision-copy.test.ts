import { describe, expect, it } from "vitest";
import {
  classifyDecisionLine,
  resolveCanonicalDecisionCopy,
  resolveDecisionCopyForProduct,
  toSituationLabel,
  toDecisionLine,
  salvageDecisionLine,
  decisionCopyIsIndexable,
  composeBuyIfSentence,
  composeSkipIfSentence,
} from "@/lib/decision-copy";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductReviewSummary } from "@/lib/product/get-product-review-summary";
import { getProductBySlug } from "@/repositories";

describe("composeBuyIfSentence / composeSkipIfSentence", () => {
  it("does not wrap Players-who seeds inside I'd shortlist if you want", () => {
    expect(
      composeBuyIfSentence(
        "Players who want the current Tello Vertex diamond with 12K and Multieva",
      ),
    ).toBe("You want the current Tello Vertex diamond with 12K and Multieva.");
    expect(composeBuyIfSentence("Players who want a ~350 g round")).toBe(
      "You want a ~350 g round.",
    );
    expect(composeBuyIfSentence("You want a high-balance diamond")).toBe(
      "You want a high-balance diamond.",
    );
  });

  it("does not append is most of your week to long skip clauses", () => {
    expect(
      composeSkipIfSentence(
        "Official power rating is 1.5 — you supply the pace",
      ),
    ).toMatch(/^Skip it if/i);
    expect(
      composeSkipIfSentence(
        "Official power rating is 1.5 — you supply the pace",
      ),
    ).not.toMatch(/is most of your week/i);
  });

  it("does not mash prefer-clause with trailing should look elsewhere", () => {
    expect(
      composeSkipIfSentence(
        "Players who prefer the lower balance of the Vertex Hybrid should look elsewhere",
      ),
    ).toBe(
      "Skip it if you prefer the lower balance of the Vertex Hybrid.",
    );
  });
});

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
  it("does not emit It when / Those looking for stem residue from editorial wrappers", () => {
    expect(
      toSituationLabel(
        "I'd shortlist it when you already play at a high club or tournament level.",
        "buy",
      ),
    ).not.toMatch(/^It when/i);
    expect(
      toSituationLabel(
        "I'd shortlist it when you already play at a high club or tournament level.",
        "buy",
      ),
    ).toMatch(/^Players who already play/i);
    expect(
      toSituationLabel("Advanced attackers", "skip"),
    ).not.toMatch(/^Those looking for Advanced/i);
    expect(
      toSituationLabel(
        "Not the Hybrid if you want a lower ~25 cm balance",
        "skip",
      ),
    ).not.toMatch(/Those looking for Not/i);
    expect(
      toSituationLabel(
        "I'd skip it if you are still building contact consistency.",
        "skip",
      ),
    ).not.toMatch(/Those looking for it if/i);
    expect(
      toSituationLabel(
        "You are choosing between PR Soft 500 and the 2026 Comfort Soft on-ramp.",
        "buy",
      ),
    ).toMatch(/^Players who are choosing/i);
    expect(
      toSituationLabel(
        "You are still building contact and need Indiga CTR.",
        "skip",
      ),
    ).toMatch(/^Players who are still building/i);
    expect(
      toSituationLabel("You specifically want the Hybrid mould.", "skip"),
    ).toMatch(/^Players who specifically want/i);
    expect(
      toSituationLabel("You specifically want the Hybrid mould.", "skip"),
    ).not.toMatch(/prefer specifically want/i);
    expect(
      classifyDecisionLine("Those looking for Advanced attackers."),
    ).toBe("BROKEN");
    expect(
      classifyDecisionLine("It when you already play at a high club level."),
    ).toBe("BROKEN");
    expect(
      classifyDecisionLine(
        "Live NL product URL should still be attached for offers",
      ),
    ).toBe("BROKEN");
    expect(
      classifyDecisionLine(
        "Players who want Faster match pace who want a clear this use case pick.",
      ),
    ).toBe("BROKEN");
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
