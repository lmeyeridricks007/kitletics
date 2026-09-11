import type { EntityId } from "@/domain/shared/types";

/**
 * Structured HYROX (and future hybrid race) competition format.
 * UI/tools MUST read station order and loads from here — never hardcode.
 *
 * Kitletics is not affiliated with HYROX GmbH; data is descriptive research
 * from published rulebooks with evidence IDs.
 */

export type HyroxDivisionId =
  | "women-open"
  | "men-open"
  | "women-pro"
  | "men-pro"
  | "doubles-women"
  | "doubles-men"
  | "doubles-mixed"
  | "relay";

export type CompetitionStationType =
  | "ski-erg"
  | "sled-push"
  | "sled-pull"
  | "burpee-broad-jumps"
  | "rowing"
  | "farmers-carry"
  | "sandbag-lunges"
  | "wall-balls"
  | "run";

export interface DivisionLoadRule {
  divisionId: HyroxDivisionId;
  /** External load in kg where applicable (sled = total incl. sled per rulebook) */
  loadKg?: number;
  /** Per-hand load for farmers carry */
  loadKgPerHand?: number;
  /** Wall ball target height metres if division-specific */
  targetHeightM?: number;
  repetitions?: number;
  notes?: string;
}

export interface CompetitionStation {
  id: string;
  order: number;
  type: CompetitionStationType;
  name: string;
  /** Run distance before this station (metres) — typically 1000 */
  precedingRunDistanceM?: number;
  distanceM?: number;
  repetitions?: number;
  unit?: string;
  divisionRules: DivisionLoadRule[];
  evidenceIds: EntityId[];
  notes?: string;
}

export interface CompetitionFormat {
  id: EntityId;
  slug: string;
  name: string;
  sportId: EntityId;
  seasonLabel: string;
  /** Singles Open/Pro format is the primary calculator source */
  formatKind: "singles" | "doubles" | "relay" | "adaptive";
  runningSegments: {
    order: number;
    distanceM: number;
    label: string;
  }[];
  stations: CompetitionStation[];
  totalRunningDistanceM: number;
  sourceIds: EntityId[];
  evidenceIds: EntityId[];
  effectiveFrom: string;
  effectiveTo?: string;
  lastVerifiedAt: string;
  status: "published" | "draft" | "superseded";
  notes?: string;
}

export function getStationSequence(
  format: CompetitionFormat,
): { kind: "run" | "station"; order: number; label: string; station?: CompetitionStation; runIndex?: number }[] {
  const out: ReturnType<typeof getStationSequence> = [];
  for (let i = 0; i < format.stations.length; i++) {
    const run = format.runningSegments[i];
    if (run) {
      out.push({
        kind: "run",
        order: out.length + 1,
        label: run.label,
        runIndex: i,
      });
    }
    const st = format.stations[i];
    out.push({
      kind: "station",
      order: out.length + 1,
      label: st.name,
      station: st,
    });
  }
  return out;
}

export function loadForDivision(
  station: CompetitionStation,
  divisionId: HyroxDivisionId,
): DivisionLoadRule | undefined {
  return (
    station.divisionRules.find((r) => r.divisionId === divisionId) ??
    station.divisionRules.find((r) => r.divisionId === "men-open")
  );
}
