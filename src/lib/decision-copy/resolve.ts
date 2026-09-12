import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type {
  CanonicalDecisionCopy,
  DecisionCopyInput,
} from "@/lib/decision-copy/types";
import {
  classifyDecisionLine,
  normalizeDecisionLine,
} from "@/lib/decision-copy/classify";
import {
  salvageDecisionLine,
  isDisplayReady,
  toSituationLabel,
} from "@/lib/decision-copy/transform";

function cleanList(lines: string[] | undefined): string[] {
  return (lines ?? []).map((s) => s.trim()).filter(Boolean);
}

function uniquePush(out: string[], line: string): void {
  const key = normalizeDecisionLine(line);
  if (!key) return;
  if (out.some((s) => normalizeDecisionLine(s) === key)) return;
  out.push(line);
}

function mapRole(
  sources: Array<string[] | undefined>,
  role: "buyIf" | "skipIf" | "bestFor" | "notIdealFor" | "pro" | "con",
  productName: string | undefined,
  max: number,
): string[] {
  const out: string[] = [];
  for (const group of sources) {
    for (const raw of cleanList(group)) {
      const next = isDisplayReady(raw, role)
        ? raw
        : salvageDecisionLine(raw, role, productName);
      const cls = classifyDecisionLine(next);
      if (cls === "MACHINE_LIKE" || cls === "BROKEN" || cls === "CONFUSING") {
        continue;
      }
      if (!isDisplayReady(next, role)) continue;
      uniquePush(out, next);
      if (out.length >= max) return out;
    }
  }
  return out;
}

function deriveSituations(
  youLines: string[],
  polarity: "buy" | "skip",
  productName: string | undefined,
  extras: Array<string[] | undefined>,
): string[] {
  const out: string[] = [];
  for (const line of youLines) {
    const next = toSituationLabel(line, polarity, productName);
    if (classifyDecisionLine(next) === "MACHINE_LIKE") continue;
    if (classifyDecisionLine(next) === "BROKEN") continue;
    if (!isDisplayReady(next, polarity === "buy" ? "bestFor" : "notIdealFor")) {
      continue;
    }
    if (youLines.some((you) => normalizeDecisionLine(you) === normalizeDecisionLine(next))) {
      continue;
    }
    uniquePush(out, next);
  }
  for (const group of extras) {
    for (const raw of cleanList(group)) {
      const next = salvageDecisionLine(
        raw,
        polarity === "buy" ? "bestFor" : "notIdealFor",
        productName,
      );
      if (youLines.some((you) => normalizeDecisionLine(you) === normalizeDecisionLine(next))) {
        continue;
      }
      if (!isDisplayReady(next, polarity === "buy" ? "bestFor" : "notIdealFor")) {
        continue;
      }
      uniquePush(out, next);
      if (out.length >= 4) return out;
    }
  }
  return out.slice(0, 4);
}

/**
 * One canonical decision model for all public surfaces.
 * Situation labels (Best For) and You-sentences (Buy If) are derived
 * from the same evidence — they must not be word-for-word copies.
 */
export function resolveCanonicalDecisionCopy(
  input: DecisionCopyInput,
): CanonicalDecisionCopy {
  const name = input.productName;
  const buyIf = mapRole(
    [input.whoShouldBuy, input.bestFor, input.strengths],
    "buyIf",
    name,
    4,
  );
  const skipIf = mapRole(
    [input.whoShouldAvoid, input.notIdealFor, input.weaknesses],
    "skipIf",
    name,
    4,
  );

  let bestFor = mapRole([input.bestFor], "bestFor", name, 4);
  if (bestFor.length < 2) {
    bestFor = deriveSituations(buyIf, "buy", name, [input.bestFor, input.strengths]);
  }
  let notIdealFor = mapRole([input.notIdealFor], "notIdealFor", name, 4);
  if (notIdealFor.length < 2) {
    notIdealFor = deriveSituations(skipIf, "skip", name, [
      input.notIdealFor,
      input.weaknesses,
    ]);
  }

  // Last-resort: force situation register from You-form even if extras were empty.
  if (bestFor.length < 2) {
    bestFor = buyIf
      .map((line) => toSituationLabel(line, "buy", name))
      .filter((line, i, arr) => arr.findIndex((x) => normalizeDecisionLine(x) === normalizeDecisionLine(line)) === i)
      .filter((line) => classifyDecisionLine(line) !== "MACHINE_LIKE")
      .filter((line) => classifyDecisionLine(line) !== "BROKEN");
  }
  if (notIdealFor.length < 2) {
    notIdealFor = skipIf
      .map((line) => toSituationLabel(line, "skip", name))
      .filter((line, i, arr) => arr.findIndex((x) => normalizeDecisionLine(x) === normalizeDecisionLine(line)) === i)
      .filter((line) => classifyDecisionLine(line) !== "MACHINE_LIKE")
      .filter((line) => classifyDecisionLine(line) !== "BROKEN");
  }

  const pros = mapRole([input.pros, input.strengths], "pro", name, 5);
  const cons = mapRole([input.cons, input.weaknesses], "con", name, 4);

  return {
    bestFor: bestFor.slice(0, 4),
    notIdealFor: notIdealFor.slice(0, 4),
    buyIf: buyIf.slice(0, 4),
    skipIf: skipIf.slice(0, 4),
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 4),
  };
}

export function resolveDecisionCopyForProduct(args: {
  product: Pick<Product, "name" | "strengths" | "weaknesses">;
  review?: Pick<Review, "whoShouldBuy" | "whoShouldAvoid" | "pros" | "cons">;
  bestFor?: string[];
  notIdealFor?: string[];
}): CanonicalDecisionCopy {
  return resolveCanonicalDecisionCopy({
    productName: args.product.name,
    strengths: args.product.strengths,
    weaknesses: args.product.weaknesses,
    whoShouldBuy: args.review?.whoShouldBuy,
    whoShouldAvoid: args.review?.whoShouldAvoid,
    pros: args.review?.pros,
    cons: args.review?.cons,
    bestFor: args.bestFor,
    notIdealFor: args.notIdealFor,
  });
}

export function decisionCopyIsIndexable(copy: CanonicalDecisionCopy): boolean {
  const lists = [
    copy.bestFor,
    copy.notIdealFor,
    copy.buyIf,
    copy.skipIf,
    copy.pros,
    copy.cons,
  ];
  for (const list of lists) {
    for (const line of list) {
      const cls = classifyDecisionLine(line);
      if (cls === "MACHINE_LIKE" || cls === "BROKEN") return false;
    }
  }
  return copy.buyIf.length >= 2 && copy.skipIf.length >= 2;
}

export function punchyBestForLabel(copy: CanonicalDecisionCopy): string {
  const line = copy.bestFor[0] ?? copy.buyIf[0] ?? "";
  if (!line) return "—";
  const clipped = line.replace(/\.$/, "");
  return clipped.length > 48 ? `${clipped.slice(0, 45).replace(/\s+\S*$/, "")}…` : clipped;
}
