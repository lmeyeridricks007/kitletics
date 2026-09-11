import type { FactorScore, EvaluatedProduct } from "@/domain/finders/types";

export function buildStrengths(factors: FactorScore[]): string[] {
  return factors
    .filter((f) => f.score >= 85 && f.confidence !== "unknown")
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 5)
    .map((f) => f.explanation);
}

export function buildCompromises(factors: FactorScore[]): string[] {
  return factors
    .filter((f) => f.score < 65 && f.confidence !== "neutral")
    .sort((a, b) => a.score * a.weight - b.score * b.weight)
    .slice(0, 4)
    .map((f) => f.explanation);
}

export function evidenceConfidenceFromFactors(
  factors: FactorScore[],
  coverage: number,
): EvaluatedProduct["evidenceConfidence"] {
  const unknown = factors.filter((f) => f.confidence === "unknown").length;
  if (coverage >= 0.75 && unknown <= 1) return "high";
  if (coverage >= 0.45) return "medium";
  return "low";
}

/** Structured deltas vs current equipment — omit when evidence missing */
export function buildCurrentEquipmentDeltas(
  current: { specifications: Record<string, unknown>; name?: string },
  candidate: { specifications: Record<string, unknown>; name?: string },
): string[] {
  const lines: string[] = [];
  const cur = current.specifications;
  const next = candidate.specifications;

  const curBal = cur.balance != null ? String(cur.balance) : undefined;
  const nextBal = next.balance != null ? String(next.balance) : undefined;
  if (curBal && nextBal && curBal !== nextBal) {
    const easier = ["low", "mid-low"].includes(nextBal) &&
      ["high", "head-heavy", "mid-high"].includes(curBal);
    if (easier) lines.push("+ easier to maneuver (lower balance)");
    const heavier = ["high", "head-heavy"].includes(nextBal) &&
      ["low", "mid-low", "medium"].includes(curBal);
    if (heavier) lines.push("+ more weight through the shot");
  }

  const curSweet = cur.sweetSpot != null ? String(cur.sweetSpot) : undefined;
  const nextSweet = next.sweetSpot != null ? String(next.sweetSpot) : undefined;
  if (curSweet && nextSweet) {
    const order = ["compact", "medium", "medium-large", "large"];
    if (order.indexOf(nextSweet) > order.indexOf(curSweet)) {
      lines.push("+ larger sweet spot");
    } else if (order.indexOf(nextSweet) < order.indexOf(curSweet)) {
      lines.push("- smaller / more demanding sweet spot");
    }
  }

  const curPow = cur.powerPositioning != null ? String(cur.powerPositioning) : undefined;
  const nextPow = next.powerPositioning != null ? String(next.powerPositioning) : undefined;
  if (curPow && nextPow && curPow !== nextPow) {
    const order = ["low", "medium", "medium-high", "high", "attacking", "power"];
    if (order.indexOf(nextPow) < order.indexOf(curPow)) {
      lines.push("- slightly less power-oriented");
    } else if (order.indexOf(nextPow) > order.indexOf(curPow)) {
      lines.push("+ more power-oriented");
    }
  }

  const curCtrl = cur.controlPositioning != null ? String(cur.controlPositioning) : undefined;
  const nextCtrl = next.controlPositioning != null ? String(next.controlPositioning) : undefined;
  if (curCtrl && nextCtrl && curCtrl !== nextCtrl) {
    const order = ["low", "medium", "medium-high", "high", "control"];
    if (order.indexOf(nextCtrl) > order.indexOf(curCtrl)) {
      lines.push("+ more control-oriented");
    }
  }

  return lines.slice(0, 4);
}

/** Concise why #1 beat #2 based on factor deltas */
export function explainRankDifference(
  winner: EvaluatedProduct,
  runnerUp: EvaluatedProduct,
  winnerName: string,
  runnerUpName: string,
): { winnerAdvantages: string[]; runnerUpAdvantages: string[] } {
  void winnerName;
  const byFactor = new Map(runnerUp.factorScores.map((f) => [f.factor, f]));
  const winnerAdvantages: string[] = [];
  const runnerUpAdvantages: string[] = [];

  for (const wf of winner.factorScores) {
    const rf = byFactor.get(wf.factor);
    if (!rf) continue;
    const delta = wf.score - rf.score;
    if (delta >= 8) {
      winnerAdvantages.push(`${wf.label}: stronger for your criteria`);
    } else if (delta <= -8) {
      runnerUpAdvantages.push(`${rf.label}: ${runnerUpName} scored higher`);
    }
  }

  return {
    winnerAdvantages: winnerAdvantages.slice(0, 4),
    runnerUpAdvantages: runnerUpAdvantages.slice(0, 4),
  };
}

export function detectConflictingPriorities(
  primaryUses: string[],
  priorities: string[],
): boolean {
  const wantsSpeed =
    primaryUses.some((u) => ["tempo", "intervals", "racing"].includes(u)) ||
    priorities.includes("speed");
  const wantsMaxComfort =
    priorities.includes("comfort") || priorities.includes("cushioning");
  return wantsSpeed && wantsMaxComfort;
}
