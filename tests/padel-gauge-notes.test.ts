import { describe, expect, it } from "vitest";
import { racketReviewFromDraft } from "@/content/padel/reviews/build-racket-review";
import { getPadelRacketDraft } from "@/content/padel/rackets";
import { friendlyScoreNote } from "@/lib/review/metric-editorials";

describe("Padel review gauge notes", () => {
  it("uses product-specific notes instead of methodology labels", () => {
    const draft = getPadelRacketDraft("prod-bullpadel-indiga-ctr");
    expect(draft).toBeTruthy();
    const review = racketReviewFromDraft({
      draft: draft!,
      reviewId: "review-bullpadel-indiga-ctr",
    });
    for (const item of review.scoreBreakdown) {
      const note = (item.note ?? "").toLowerCase();
      expect(note).not.toMatch(/manufacturer sheet/);
      expect(note).not.toMatch(/inferred from specs/);
      expect(note).not.toMatch(/popularity rank/);
      expect(note.length).toBeGreaterThan(10);
      expect(friendlyScoreNote(item.note ?? "", item.key).length).toBeGreaterThan(0);
    }
  });

  it("strips legacy methodology gauge notes", () => {
    expect(friendlyScoreNote("Manufacturer sheet.", "power")).toBe("");
    expect(friendlyScoreNote("Inferred from specs", "forgiveness")).toBe("");
    expect(
      friendlyScoreNote("Street price lives in offers — not a popularity rank", "value"),
    ).toBe("");
  });
});
