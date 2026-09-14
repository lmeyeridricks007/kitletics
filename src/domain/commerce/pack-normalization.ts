/**
 * Pack / unit price normalization for balls and grips.
 * Never compare bulk pack sticker prices to single-pack prices without this.
 */

export function normalizeBallPack(input: {
  packPrice: number;
  ballsPerCan?: number;
  cans?: number;
  currency?: string;
}): {
  packPrice: number;
  cans: number;
  ballsPerCan: number;
  totalBalls: number;
  pricePerCan: number;
  pricePerBall: number;
  currency: string;
  label: string;
} {
  const cans = Math.max(1, input.cans ?? 1);
  const ballsPerCan = Math.max(1, input.ballsPerCan ?? 3);
  const totalBalls = cans * ballsPerCan;
  const pricePerCan = input.packPrice / cans;
  const pricePerBall = input.packPrice / totalBalls;
  const currency = input.currency ?? "EUR";
  const label =
    cans === 1
      ? `${formatMoney(pricePerCan, currency)} / ${ballsPerCan}-ball can · ${formatMoney(pricePerBall, currency)} / ball`
      : `${formatMoney(input.packPrice, currency)} / ${cans} cans · ${formatMoney(pricePerCan, currency)} / can · ${formatMoney(pricePerBall, currency)} / ball`;
  return {
    packPrice: input.packPrice,
    cans,
    ballsPerCan,
    totalBalls,
    pricePerCan,
    pricePerBall,
    currency,
    label,
  };
}

export function normalizeGripPack(input: {
  packPrice: number;
  packQuantity?: number;
  currency?: string;
}): {
  packPrice: number;
  packQuantity: number;
  pricePerGrip: number;
  currency: string;
  label: string;
} {
  const packQuantity = Math.max(1, input.packQuantity ?? 1);
  const pricePerGrip = input.packPrice / packQuantity;
  const currency = input.currency ?? "EUR";
  const label = `${formatMoney(input.packPrice, currency)} / ${packQuantity}-pack · ${formatMoney(pricePerGrip, currency)} / grip`;
  return {
    packPrice: input.packPrice,
    packQuantity,
    pricePerGrip,
    currency,
    label,
  };
}

function formatMoney(n: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${n.toFixed(2)}`;
}

/** Infer pack quantity from product name / specs when explicit packQuantity absent. */
export function inferGripPackQuantity(
  name: string,
  specs: Record<string, unknown>,
): number | undefined {
  const fromSpec = Number(specs.packQuantity ?? specs.packSize);
  if (Number.isFinite(fromSpec) && fromSpec > 0) return fromSpec;
  const m = name.match(/\b(\d+)\s*[- ]?(?:pack|pcs|stuks|grips?)\b/i);
  if (m) return Number(m[1]);
  return undefined;
}

export function inferBallPack(
  name: string,
  specs: Record<string, unknown>,
): { ballsPerCan: number; cans: number } {
  const ballsPerCan = Number(specs.ballsPerCan ?? 3) || 3;
  const cansFromSpec = Number(specs.cansPerBox ?? specs.packCans);
  if (Number.isFinite(cansFromSpec) && cansFromSpec > 0) {
    return { ballsPerCan, cans: cansFromSpec };
  }
  const box = name.match(/\b(\d+)\s*(?:cans?|tubes?|dozen)\b/i);
  if (box) {
    const n = Number(box[1]);
    if (n >= 12) return { ballsPerCan, cans: n };
  }
  return { ballsPerCan, cans: 1 };
}
