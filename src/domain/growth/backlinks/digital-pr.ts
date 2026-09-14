import type { ResearchIdea } from "./types";

export interface DigitalPrPacket {
  ideaId: string;
  finding: string;
  sampleSize: string;
  coverage: string;
  methodology: string;
  caveat: string;
  targetPublications: string[];
  targetJournalistIds: string[];
  recommendedSourceAssetId: string;
}

const N_RE = /\bn=(\d+)(?:\s*\/\s*(\d+))?/i;

function sampleFromText(text: string | undefined): string {
  if (!text) return "UNKNOWN";
  const m = text.match(N_RE);
  if (!m) return "UNKNOWN";
  return m[2] ? `${m[1]} of ${m[2]}` : m[1];
}

/**
 * Only emit a PR packet when the research board already marked the finding proven.
 * Never invent statistics, journalist names, or sample sizes.
 */
export function digitalPrPacketFromIdea(idea: ResearchIdea): DigitalPrPacket | null {
  if (!idea.findingProven || !idea.findingSummary?.trim()) return null;
  return {
    ideaId: idea.id,
    finding: idea.findingSummary.trim(),
    sampleSize: sampleFromText(idea.findingSummary) !== "UNKNOWN"
      ? sampleFromText(idea.findingSummary)
      : sampleFromText(idea.coverage),
    coverage: idea.coverage?.trim() || "UNKNOWN",
    methodology: idea.datasetRequired,
    caveat:
      "Catalog coverage is not a census of every shoe on the market. Do not pitch unpublished Market 2026 numbers. Do not invent extra statistics.",
    targetPublications: idea.targetPublications,
    targetJournalistIds: idea.targetJournalistIds,
    recommendedSourceAssetId: idea.targetAssetId,
  };
}

export function digitalPrPacketsFromIdeas(ideas: ResearchIdea[]): DigitalPrPacket[] {
  return ideas.flatMap((idea) => {
    const packet = digitalPrPacketFromIdea(idea);
    return packet ? [packet] : [];
  });
}
