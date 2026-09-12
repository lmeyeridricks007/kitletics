/**
 * Defensible numeric sanity bounds for running-shoe specs.
 * Flag only — never auto-correct.
 */

export type SanityVerdict = "valid" | "suspect" | "invalid";

export interface SanityResult {
  verdict: SanityVerdict;
  code: string;
  detail: string;
}

const CURRENT_YEAR = new Date().getUTCFullYear();

/** Adult running shoes — grams. */
export function sanityWeightG(weight: number): SanityResult {
  if (!Number.isFinite(weight)) {
    return { verdict: "invalid", code: "weight_non_finite", detail: "Weight is not a finite number" };
  }
  if (weight <= 0) {
    return { verdict: "invalid", code: "weight_non_positive", detail: "Weight ≤ 0 g" };
  }
  // Likely ounces stored as grams (8–16 oz)
  if (weight > 0 && weight < 50) {
    return {
      verdict: "invalid",
      code: "weight_unit_suspect_oz",
      detail: `Weight ${weight} g is below adult shoe range — possible oz/g confusion`,
    };
  }
  if (weight < 100) {
    return { verdict: "invalid", code: "weight_impossible_low", detail: `Weight ${weight} g < 100 g` };
  }
  if (weight > 550) {
    return { verdict: "invalid", code: "weight_impossible_high", detail: `Weight ${weight} g > 550 g` };
  }
  if (weight < 130 || weight > 450) {
    return {
      verdict: "suspect",
      code: "weight_outlier",
      detail: `Weight ${weight} g is an edge outlier for adult road/trail shoes`,
    };
  }
  return { verdict: "valid", code: "weight_ok", detail: "Within expected adult range" };
}

export function sanityDropMm(drop: number): SanityResult {
  if (!Number.isFinite(drop)) {
    return { verdict: "invalid", code: "drop_non_finite", detail: "Drop is not a finite number" };
  }
  if (drop < 0) {
    return { verdict: "invalid", code: "drop_negative", detail: `Drop ${drop} mm is negative` };
  }
  if (drop > 16) {
    return { verdict: "invalid", code: "drop_impossible_high", detail: `Drop ${drop} mm > 16` };
  }
  if (drop > 14) {
    return { verdict: "suspect", code: "drop_outlier", detail: `Drop ${drop} mm is unusually high` };
  }
  return { verdict: "valid", code: "drop_ok", detail: "Within expected range" };
}

export function sanityHeelStackMm(heel: number): SanityResult {
  if (!Number.isFinite(heel)) {
    return { verdict: "invalid", code: "heel_non_finite", detail: "Heel stack is not a finite number" };
  }
  if (heel <= 0) {
    return { verdict: "invalid", code: "heel_non_positive", detail: "Heel stack ≤ 0 mm" };
  }
  if (heel < 12 || heel > 55) {
    return {
      verdict: "invalid",
      code: "heel_impossible",
      detail: `Heel stack ${heel} mm outside 12–55 mm`,
    };
  }
  if (heel < 18 || heel > 48) {
    return {
      verdict: "suspect",
      code: "heel_outlier",
      detail: `Heel stack ${heel} mm is an edge outlier`,
    };
  }
  return { verdict: "valid", code: "heel_ok", detail: "Within expected range" };
}

export function sanityForefootStackMm(fore: number): SanityResult {
  if (!Number.isFinite(fore)) {
    return {
      verdict: "invalid",
      code: "forefoot_non_finite",
      detail: "Forefoot stack is not a finite number",
    };
  }
  if (fore <= 0) {
    return {
      verdict: "invalid",
      code: "forefoot_non_positive",
      detail: "Forefoot stack ≤ 0 mm",
    };
  }
  if (fore < 8 || fore > 50) {
    return {
      verdict: "invalid",
      code: "forefoot_impossible",
      detail: `Forefoot stack ${fore} mm outside 8–50 mm`,
    };
  }
  if (fore < 12 || fore > 42) {
    return {
      verdict: "suspect",
      code: "forefoot_outlier",
      detail: `Forefoot stack ${fore} mm is an edge outlier`,
    };
  }
  return { verdict: "valid", code: "forefoot_ok", detail: "Within expected range" };
}

/**
 * Heel/forefoot/drop geometric consistency.
 * forefoot > heel with non-negative stated drop is inconsistent.
 */
export function sanityStackDropConsistency(
  heel: number,
  forefoot: number,
  drop: number,
): SanityResult | null {
  if (![heel, forefoot, drop].every(Number.isFinite)) return null;

  if (forefoot > heel + 0.5 && drop >= 0) {
    return {
      verdict: "invalid",
      code: "forefoot_gt_heel",
      detail: `Forefoot ${forefoot} mm > heel ${heel} mm with drop ${drop} mm`,
    };
  }

  const computed = heel - forefoot;
  const delta = Math.abs(computed - drop);
  if (delta > 2.5) {
    return {
      verdict: "invalid",
      code: "drop_stack_mismatch",
      detail: `Drop ${drop} mm vs heel−forefoot ${computed.toFixed(1)} mm (Δ ${delta.toFixed(1)})`,
    };
  }
  if (delta > 1.25) {
    return {
      verdict: "suspect",
      code: "drop_stack_soft_mismatch",
      detail: `Drop ${drop} mm vs heel−forefoot ${computed.toFixed(1)} mm (Δ ${delta.toFixed(1)})`,
    };
  }
  return { verdict: "valid", code: "geometry_ok", detail: "Heel/forefoot/drop consistent" };
}

export function sanityOfferPrice(
  amount: number,
  currency: string,
): SanityResult {
  if (!Number.isFinite(amount)) {
    return { verdict: "invalid", code: "price_non_finite", detail: "Price is not finite" };
  }
  if (amount <= 0) {
    return { verdict: "invalid", code: "price_non_positive", detail: "Price ≤ 0" };
  }
  const cur = currency.trim().toUpperCase();
  if (!["EUR", "GBP", "USD", "SEK", "NOK", "DKK", "CHF", "PLN"].includes(cur)) {
    return {
      verdict: "suspect",
      code: "price_currency_unusual",
      detail: `Unusual currency code ${cur}`,
    };
  }
  // EUR-centric catalog — amounts that look like cents left as major units
  if (cur === "EUR" && amount >= 1000 && amount <= 50000 && amount % 1 === 0) {
    // e.g. 14900 could be cents; also could be ultra rare — flag suspect not invalid
    if (amount > 800) {
      return {
        verdict: "suspect",
        code: "price_possible_cents_or_outlier",
        detail: `EUR ${amount} is extreme for a running shoe — check cents/major unit`,
      };
    }
  }
  if (amount > 800) {
    return {
      verdict: "invalid",
      code: "price_impossible_high",
      detail: `${cur} ${amount} exceeds defensible running-shoe ceiling`,
    };
  }
  if (amount < 35) {
    return {
      verdict: "suspect",
      code: "price_outlier_low",
      detail: `${cur} ${amount} is unusually low for a new running shoe offer`,
    };
  }
  if (amount > 350) {
    return {
      verdict: "suspect",
      code: "price_outlier_high",
      detail: `${cur} ${amount} is a high outlier`,
    };
  }
  return { verdict: "valid", code: "price_ok", detail: "Within expected offer range" };
}

export function sanityReleaseYear(year: number): SanityResult {
  if (!Number.isFinite(year) || !Number.isInteger(year)) {
    return { verdict: "invalid", code: "release_year_non_int", detail: "Release year not an integer" };
  }
  if (year < 1995 || year > CURRENT_YEAR + 1) {
    return {
      verdict: "invalid",
      code: "release_year_impossible",
      detail: `Release year ${year} outside 1995–${CURRENT_YEAR + 1}`,
    };
  }
  if (year < 2018) {
    return {
      verdict: "suspect",
      code: "release_year_old",
      detail: `Release year ${year} is old for the current public cohort`,
    };
  }
  return { verdict: "valid", code: "release_year_ok", detail: "Plausible release year" };
}
