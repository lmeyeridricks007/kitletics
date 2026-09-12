import { describe, expect, it } from "vitest";
import {
  classifyUniqueness,
  editorialSimilarity,
  isZeroUniquenessToken,
  scrubEntityNames,
  textSimilarity,
  uniqueAnalysisRatio,
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

  it("does not treat SKU/spec dumps as unique analysis", () => {
    const analysis =
      "I'd shortlist this when late-run foam still feels lively on long Sundays and I'd rotate a plated racer for Tuesday workouts.";
    const stamped = `${analysis} skuslugasicsnovablast6 255gweightasicsnovablast6 41mmheelstackasicsnovablast6`;
    expect(isZeroUniquenessToken("skuslugasicsnovablast6")).toBe(true);
    expect(uniqueAnalysisRatio("skuslugasicsnovablast6 255gweightasicsnovablast6")).toBe(0);
    expect(editorialSimilarity(analysis, stamped)).toBeGreaterThan(0.85);
  });

  it("does not penalize shared natural domain language as duplication", () => {
    const a =
      "I'd keep the Vomero for easy recovery days when I want the softest landing I can get from a daily trainer.";
    const b =
      "I'd use Superblast for faster long runs when I want more pop without going full race-day plate.";
    expect(editorialSimilarity(a, b)).toBeLessThan(0.5);
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
