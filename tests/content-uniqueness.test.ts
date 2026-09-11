import { describe, expect, it } from "vitest";
import {
  classifyUniqueness,
  scrubEntityNames,
  textSimilarity,
} from "@/domain/content-uniqueness/text";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { getLaunchEligibility } from "@/domain/launch";
import { getReviewBySlug } from "@/repositories";

describe("content uniqueness", () => {
  it("detects name-swapped near-duplicates after scrubbing", () => {
    const a =
      "Buy the Brooks Cascadia 18 when its main job matches most of your week — not as a default for every session.";
    const b =
      "Buy the ASICS Gel-Trabuco 13 when its main job matches most of your week — not as a default for every session.";
    const scrubbedA = scrubEntityNames(a, ["Brooks Cascadia 18", "Brooks"]);
    const scrubbedB = scrubEntityNames(b, ["ASICS Gel-Trabuco 13", "ASICS"]);
    expect(textSimilarity(scrubbedA, scrubbedB)).toBeGreaterThan(0.85);
  });

  it("classifies high scaffold + high peer similarity as DUPLICATIVE", () => {
    expect(
      classifyUniqueness({
        maxPeerSimilarity: 0.93,
        scaffoldHits: 6,
        uniqueSignalRatio: 0.1,
      }),
    ).toBe("DUPLICATIVE");
  });

  it("holds a known duplicative review from Day-1 indexation", () => {
    const heldSlug = "brooks-cascadia-18";
    if (!isContentUniquenessReviewHeld(heldSlug)) return;
    const review = getReviewBySlug(heldSlug);
    expect(review).toBeTruthy();
    const assessed = assessReviewLaunchQuality(review!, { isDev: false });
    expect(assessed.quality).toBe("DUPLICATIVE");
    const elig = getLaunchEligibility(
      { kind: "review", entity: review! },
      { isDev: false },
    );
    expect(elig.disposition).toBe("HIDDEN_404");
  });
});
