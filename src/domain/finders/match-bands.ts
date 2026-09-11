export interface MatchBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const MATCH_BANDS: MatchBand[] = [
  { id: "exceptional", label: "Exceptional match", min: 95, max: 100 },
  { id: "excellent", label: "Excellent match", min: 90, max: 94 },
  { id: "very-good", label: "Very good match", min: 85, max: 89 },
  { id: "good", label: "Good match", min: 80, max: 84 },
  { id: "solid", label: "Solid match", min: 70, max: 79 },
  { id: "fair", label: "Fair match", min: 60, max: 69 },
  { id: "weak", label: "Weak match", min: 0, max: 59 },
];

export function getMatchBand(score: number): MatchBand {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  return (
    MATCH_BANDS.find((b) => clamped >= b.min && clamped <= b.max) ??
    MATCH_BANDS[MATCH_BANDS.length - 1]
  );
}

export function rankLabel(rank: number, band: MatchBand): string {
  if (rank === 1) return band.label;
  return band.label;
}
