import type { Evidence } from "@/domain/recommendations/types";

export function classifyEvidence(evidence: Evidence[]): {
  manufacturer: boolean;
  independent: boolean;
  personalTest: boolean;
  count: number;
} {
  return {
    manufacturer: evidence.some((e) => e.type === "manufacturer"),
    independent: evidence.some(
      (e) =>
        e.type === "independent-review" ||
        e.type === "lab-test" ||
        e.type === "editorial-research",
    ),
    personalTest: evidence.some((e) => e.type === "personal-test"),
    count: evidence.length,
  };
}
