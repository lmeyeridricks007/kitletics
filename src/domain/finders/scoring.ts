import type { Product, SpecValue } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type {
  FactorConfidence,
  FactorScore,
  FinderDefinition,
  FinderNormalizedProfile,
  FinderScoringProfile,
} from "@/domain/finders/types";
import { getPadelRacketDecisionAttributes } from "@/content/padel/rackets";

function asArray(value: SpecValue | undefined): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

/** Use-case IDs mapped from finder answers */
export function resolveProfileUseCaseIds(
  profile: FinderNormalizedProfile,
): string[] {
  const ids = new Set<string>();
  const useMap: Record<string, string> = {
    "daily-training": "uc-daily-training",
    "easy-runs": "uc-easy-runs",
    "long-runs": "uc-long-runs",
    tempo: "uc-tempo-runs",
    intervals: "uc-tempo-runs",
    racing: "uc-marathon",
    recovery: "uc-recovery-runs",
    everything: "uc-daily-training",
    ultra: "uc-ultra",
    trail: "uc-trail-training",
    hyrox: "uc-hyrox-training",
    beginners: "uc-beginners",
    half: "uc-half",
    marathon: "uc-marathon",
  };
  for (const u of profile.primaryUses) {
    if (useMap[u]) ids.add(useMap[u]);
  }
  if (profile.primaryUses.includes("ultra")) {
    ids.add("uc-trail-training");
  }
  const distMap: Record<string, string> = {
    "under-5k": "uc-5k",
    "5k": "uc-5k",
    "10k": "uc-10k",
    half: "uc-half",
    marathon: "uc-marathon",
    ultra: "uc-ultra",
  };
  for (const d of profile.distances) {
    if (distMap[d]) ids.add(distMap[d]);
  }
  if (profile.raceDistance && distMap[profile.raceDistance]) {
    ids.add(distMap[profile.raceDistance]);
  }
  if (profile.terrain === "trail") ids.add("uc-trail-training");
  if (profile.experienceLevel === "beginner") ids.add("uc-beginners");
  if (profile.primaryUses.includes("trail")) {
    ids.add("uc-ultra");
    ids.add("uc-trail-training");
  }
  if (profile.primaryUses.includes("multisport")) ids.add("uc-advanced");
  if (profile.primaryUses.includes("long-runs")) ids.add("uc-high-mileage");
  if (profile.primaryUses.includes("racing")) {
    ids.add("uc-marathon");
    ids.add("uc-pb");
  }

  // Racket Match — category-aware contexts (not shape stereotypes alone)
  const racketCats = new Set([
    "cat-padel-rackets",
    "cat-tennis-rackets",
    "cat-pickleball-paddles",
    "cat-badminton-rackets",
    "cat-squash-rackets",
  ]);
  if (racketCats.has(profile.categoryId)) {
    const prefix =
      profile.categoryId === "cat-padel-rackets"
        ? "uc-padel"
        : profile.categoryId === "cat-tennis-rackets"
          ? "uc-tennis"
          : profile.categoryId === "cat-pickleball-paddles"
            ? "uc-pickleball"
            : profile.categoryId === "cat-badminton-rackets"
              ? "uc-badminton"
              : "uc-squash";

    const exp = profile.experienceLevel;
    if (exp === "beginner" || profile.primaryUses.includes("beginner")) {
      ids.add(`${prefix}-beginner`);
    }
    const style = profile.playingStyle;
    const hasStyleContexts =
      prefix === "uc-padel" || prefix === "uc-tennis";
    if (hasStyleContexts) {
      if (style === "control" || style === "control-focused" || style === "defensive") {
        ids.add(`${prefix}-control`);
      } else if (
        style === "power" ||
        style === "power-focused" ||
        style === "aggressive"
      ) {
        ids.add(`${prefix}-power`);
      } else if (
        style === "balanced" ||
        style === "all-round" ||
        style === "figuring-out"
      ) {
        ids.add(`${prefix}-balanced`);
      } else if (style === "spin" && prefix === "uc-tennis") {
        ids.add(`${prefix}-spin`);
      }
    } else {
      ids.add(`${prefix}-general`);
    }

    for (const p of profile.priorities) {
      if (!hasStyleContexts) break;
      if (["control", "power", "spin"].includes(p)) {
        if (p === "spin" && prefix === "uc-padel") {
          ids.add(`${prefix}-control`);
        } else {
          ids.add(`${prefix}-${p}`);
        }
      }
      if (p === "forgiveness") {
        // Forgiveness ≠ control. Prefer beginner/comfort contexts over control stereotypes.
        ids.add(`${prefix}-beginner`);
      }
      if (p === "maneuverability") {
        ids.add(`${prefix}-beginner`);
      }
      if (p === "comfort" && prefix === "uc-tennis") {
        ids.add(`${prefix}-beginner`);
      }
    }
  }

  return [...ids];
}

/**
 * Soft racket/paddle factor scoring from structured specs.
 * Missing data → neutral / reduced confidence — never invent values.
 */
export function racketSpecsScore(
  profile: FinderNormalizedProfile,
  product: Product,
): { score: number; confidence: FactorConfidence; explanation: string } {
  const specs = product.specifications;
  const padelAttrs = getPadelRacketDecisionAttributes(product.id);
  const attr = (key: string) => padelAttrs?.find((a) => a.key === key)?.score;
  const parts: { score: number; known: boolean; note: string }[] = [];

  const power =
    attr("power") != null
      ? undefined
      : specs.powerPositioning != null
        ? String(specs.powerPositioning)
        : undefined;
  const control =
    attr("control") != null
      ? undefined
      : specs.controlPositioning != null
        ? String(specs.controlPositioning)
        : undefined;
  const sweet =
    specs.sweetSpot != null ? String(specs.sweetSpot) : undefined;
  const balance = specs.balance != null ? String(specs.balance) : undefined;
  const weightMin =
    typeof specs.weightMin === "number"
      ? specs.weightMin
      : typeof specs.weight === "number"
        ? specs.weight
        : typeof specs.strungWeight === "number"
          ? specs.strungWeight
          : typeof specs.strungWeightG === "number"
            ? specs.strungWeightG
            : undefined;
  const core = specs.core != null ? String(specs.core) : undefined;

  const wantsPower =
    profile.priorities.includes("power") ||
    profile.playingStyle === "power" ||
    profile.playingStyle === "aggressive";
  const wantsControl =
    profile.priorities.includes("control") ||
    profile.playingStyle === "control" ||
    profile.playingStyle === "defensive";
  const wantsForgive =
    profile.priorities.includes("forgiveness") ||
    profile.priorities.includes("comfort") ||
    profile.experienceLevel === "beginner";
  const wantsManeuver =
    profile.priorities.includes("maneuverability") ||
    profile.balancePreference === "low";

  if (wantsPower) {
    const powerScore = attr("power");
    if (powerScore != null) {
      parts.push({
        score: powerScore,
        known: true,
        note: "Padel power attribute (not a lab measurement)",
      });
    } else if (!power) {
      parts.push({
        score: 55,
        known: false,
        note: "Power positioning not verified",
      });
    } else {
      const hi = ["high", "attacking", "power"].includes(power);
      const mid = ["medium", "balanced", "medium-high"].includes(power);
      parts.push({
        score: hi ? 92 : mid ? 72 : 40,
        known: true,
        note: `Power positioning: ${power}`,
      });
    }
  }

  if (wantsControl) {
    const controlScore = attr("control");
    if (controlScore != null) {
      parts.push({
        score: controlScore,
        known: true,
        note: "Padel control attribute (not a lab measurement)",
      });
    } else if (!control) {
      parts.push({
        score: 55,
        known: false,
        note: "Control positioning not verified",
      });
    } else {
      const hi = ["high", "control"].includes(control);
      const mid = ["medium", "balanced", "medium-high"].includes(control);
      parts.push({
        score: hi ? 92 : mid ? 72 : 40,
        known: true,
        note: `Control positioning: ${control}`,
      });
    }
  }

  if (wantsForgive) {
    const forgiveScore = attr("forgiveness") ?? attr("comfort");
    if (forgiveScore != null) {
      parts.push({
        score: forgiveScore,
        known: true,
        note: "Padel forgiveness/comfort attribute (not a lab measurement)",
      });
    } else if (profile.categoryId === "cat-tennis-rackets") {
      const head =
        typeof specs.headSizeSqIn === "number" ? specs.headSizeSqIn : undefined;
      if (head === undefined) {
        parts.push({
          score: 55,
          known: false,
          note: "Head size not verified for forgiveness preference",
        });
      } else {
        // Larger head contributes to forgiveness — not an absolute rule alone
        const score = head >= 100 ? 90 : head >= 98 ? 72 : 48;
        parts.push({
          score,
          known: true,
          note: `Head size ${head} sq in vs forgiveness preference`,
        });
      }
    } else if (!sweet) {
      parts.push({
        score: 55,
        known: false,
        note: "Sweet spot classification not verified",
      });
    } else {
      const large = ["large", "medium-large"].includes(sweet);
      parts.push({
        score: large ? 90 : sweet === "medium" ? 70 : 45,
        known: true,
        note: `Sweet spot: ${sweet}`,
      });
    }
  }

  const wantsSpin = profile.priorities.includes("spin") || profile.playingStyle === "spin";
  if (wantsSpin) {
    const spin =
      specs.spinPositioning != null ? String(specs.spinPositioning) : undefined;
    const pattern =
      specs.stringPattern != null ? String(specs.stringPattern) : undefined;
    if (!spin && !pattern) {
      parts.push({
        score: 55,
        known: false,
        note: "Spin positioning not verified",
      });
    } else if (spin) {
      const hi = ["high", "spin", "very-high"].includes(spin);
      const mid = ["medium", "balanced", "medium-high"].includes(spin);
      parts.push({
        score: hi ? 92 : mid ? 72 : 45,
        known: true,
        note: `Spin positioning: ${spin}`,
      });
    } else if (pattern) {
      // One contributing factor only — not absolute
      const open = pattern.startsWith("16");
      parts.push({
        score: open ? 78 : 62,
        known: true,
        note: `String pattern ${pattern} as soft spin contributor`,
      });
    }
  }

  if (
    profile.weightPreference &&
    profile.weightPreference !== "any" &&
    profile.weightPreference !== "no-preference"
  ) {
    if (weightMin === undefined) {
      parts.push({
        score: 55,
        known: false,
        note: "Weight not verified — not assumed",
      });
    } else {
      // Padel typical ~350–375g; tennis strung often ~280–320g — use relative bands
      const isTennis = profile.categoryId === "cat-tennis-rackets";
      const lightMax = isTennis ? 290 : 355;
      const heavyMin = isTennis ? 315 : 370;
      const band =
        weightMin <= lightMax ? "light" : weightMin >= heavyMin ? "heavy" : "medium";
      parts.push({
        score: band === profile.weightPreference ? 95 : 55,
        known: true,
        note: `Weight ~${weightMin}g → ${band} vs preference ${profile.weightPreference}`,
      });
    }
  }

  if (
    profile.balancePreference &&
    profile.balancePreference !== "any" &&
    profile.balancePreference !== "no-preference"
  ) {
    if (!balance) {
      parts.push({
        score: 55,
        known: false,
        note: "Balance not verified — not assumed",
      });
    } else {
      const pref = profile.balancePreference;
      const match =
        balance === pref ||
        (pref === "low" && ["low", "mid-low", "head-light"].includes(balance)) ||
        (pref === "medium" &&
          ["medium", "mid-low", "mid-high", "even"].includes(balance)) ||
        (pref === "head-heavy" &&
          ["high", "head-heavy", "mid-high"].includes(balance));
      parts.push({
        score: match ? 90 : 50,
        known: true,
        note: `Balance ${balance} vs preference ${pref}`,
      });
    }
  } else if (wantsManeuver) {
    if (!balance) {
      parts.push({
        score: 55,
        known: false,
        note: "Balance unknown for maneuverability preference",
      });
    } else {
      parts.push({
        score: ["low", "mid-low", "medium"].includes(balance) ? 88 : 48,
        known: true,
        note: `Maneuverability lean from balance ${balance}`,
      });
    }
  }

  if (
    profile.feelPreference &&
    profile.feelPreference !== "any" &&
    profile.feelPreference !== "no-preference"
  ) {
    if (!core) {
      parts.push({
        score: 55,
        known: false,
        note: "Core/feel evidence not verified",
      });
    } else {
      const soft = ["soft-EVA", "foam", "soft"].some((c) =>
        core.toLowerCase().includes(c.toLowerCase()),
      );
      const firm = ["hard-EVA", "hard"].some((c) =>
        core.toLowerCase().includes(c.toLowerCase()),
      );
      const want = profile.feelPreference;
      const ok =
        (want === "softer" && soft) ||
        (want === "firmer" && firm) ||
        (want === "balanced" && !soft && !firm);
      parts.push({
        score: ok ? 88 : soft || firm ? 50 : 60,
        known: true,
        note: `Core ${core} vs feel preference ${want}`,
      });
    }
  }

  if (profile.armComfortPriority) {
    if (!core) {
      parts.push({
        score: 58,
        known: false,
        note: "Arm comfort requested but core/feel not verified",
      });
    } else {
      const soft = ["soft-EVA", "foam", "soft", "comfort"].some((c) =>
        core.toLowerCase().includes(c.toLowerCase()),
      );
      parts.push({
        score: soft ? 92 : 48,
        known: true,
        note: soft
          ? `Softer core (${core}) aligns with arm/elbow comfort priority`
          : `Firmer core (${core}) is a trade-off when arm comfort matters`,
      });
    }
  }

  if (parts.length === 0) {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "No racket-specific preference signals applied",
    };
  }

  const avg = parts.reduce((a, p) => a + p.score, 0) / parts.length;
  const known = parts.some((p) => p.known);
  const allKnown = parts.every((p) => p.known);
  return {
    score: Math.round(avg),
    confidence: allKnown ? "verified-spec" : known ? "inferred" : "unknown",
    explanation: parts.map((p) => p.note).join("; "),
  };
}

/**
 * Soft GPS-watch feature scoring from structured specs.
 * Missing data → neutral / reduced confidence — never invent values.
 */
export function hrmSpecsScore(
  profile: FinderNormalizedProfile,
  product: Product,
): { score: number; confidence: FactorConfidence; explanation: string } {
  const subs = product.subcategoryIds ?? [];
  const isChest = subs.includes("sub-hrm-chest");
  const isArmband =
    subs.includes("sub-hrm-armband") || subs.includes("sub-hrm-optical");
  const hasDynamics = subs.includes("sub-hrm-dynamics");
  const parts: { score: number; known: boolean; note: string }[] = [];

  if (profile.formFactor === "chest") {
    parts.push({
      score: isChest ? 98 : isArmband ? 35 : 55,
      known: isChest || isArmband,
      note: isChest
        ? "Chest-strap form matches preference"
        : isArmband
          ? "Optical/armband — less aligned with chest preference"
          : "Form factor not classified",
    });
  } else if (profile.formFactor === "armband") {
    parts.push({
      score: isArmband ? 98 : isChest ? 38 : 55,
      known: isChest || isArmband,
      note: isArmband
        ? "Armband/optical form matches preference"
        : isChest
          ? "Chest strap — less aligned with armband preference"
          : "Form factor not classified",
    });
  } else if (profile.formFactor === "any") {
    parts.push({
      score: 85,
      known: true,
      note: "Open to chest or armband forms",
    });
  }

  if (profile.needsDynamics === true) {
    parts.push({
      score: hasDynamics ? 100 : 28,
      known: true,
      note: hasDynamics
        ? "Running dynamics supported"
        : "No running-dynamics strap features",
    });
  } else if (profile.needsDynamics === false && hasDynamics) {
    parts.push({
      score: 78,
      known: true,
      note: "Has dynamics (optional for you)",
    });
  }

  if (profile.priorities.includes("accuracy") && (isChest || isArmband)) {
    parts.push({
      score: isChest ? 96 : 70,
      known: true,
      note: isChest
        ? "ECG chest strap — strong accuracy lane"
        : "Optical sensing — good when fit is stable",
    });
  }

  if (parts.length === 0) {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "HRM features scored mainly via use case and priorities.",
    };
  }

  const known = parts.filter((p) => p.known);
  const score =
    known.length > 0
      ? Math.round(known.reduce((s, p) => s + p.score, 0) / known.length)
      : 55;
  return {
    score,
    confidence: known.length > 0 ? "verified-spec" : "unknown",
    explanation: parts.map((p) => p.note).join("; "),
  };
}

/**
 * Soft GPS-watch feature scoring from structured specs.
 * Missing data → neutral / reduced confidence — never invent values.
 */
export function watchSpecsScore(
  profile: FinderNormalizedProfile,
  product: Product,
): { score: number; confidence: FactorConfidence; explanation: string } {
  const specs = product.specifications;
  const parts: { score: number; known: boolean; note: string }[] = [];

  const maps = specs.maps === true;
  const mapsKnown = specs.maps !== undefined && specs.maps !== null;
  const navigation = specs.navigation === true;
  const music = specs.music === true;
  const musicKnown = specs.music !== undefined && specs.music !== null;
  const batteryGps =
    typeof specs.batteryGps === "number" ? specs.batteryGps : undefined;
  const displayType =
    specs.displayType != null ? String(specs.displayType) : undefined;
  const trainingSignals =
    specs.trainingReadiness === true ||
    specs.runningDynamics === true ||
    specs.recoveryMetrics === true;
  const trainingKnown =
    specs.trainingReadiness !== undefined ||
    specs.runningDynamics !== undefined ||
    specs.recoveryMetrics !== undefined;

  if (profile.needsMaps === true) {
    if (!mapsKnown) {
      parts.push({
        score: 50,
        known: false,
        note: "Map support not verified",
      });
    } else {
      parts.push({
        score: maps || navigation ? 100 : 22,
        known: true,
        note: maps
          ? "Offline maps available"
          : navigation
            ? "Navigation without full maps"
            : "No offline maps",
      });
    }
  } else if (profile.needsMaps === false && mapsKnown) {
    parts.push({
      score: maps ? 72 : 90,
      known: true,
      note: maps
        ? "Has maps (optional for you)"
        : "No maps required — lighter feature set OK",
    });
  }

  if (profile.priorities.includes("maps")) {
    if (!mapsKnown) {
      parts.push({
        score: 50,
        known: false,
        note: "Maps priority — support unknown",
      });
    } else {
      parts.push({
        score: maps ? 98 : navigation ? 70 : 30,
        known: true,
        note: maps ? "Maps match priority" : "Limited map/navigation support",
      });
    }
  }

  if (profile.priorities.includes("battery")) {
    if (batteryGps === undefined) {
      parts.push({
        score: 55,
        known: false,
        note: "GPS battery hours not verified",
      });
    } else {
      const score =
        batteryGps >= 40 ? 98 : batteryGps >= 25 ? 88 : batteryGps >= 15 ? 72 : 50;
      parts.push({
        score,
        known: true,
        note: `GPS battery ~${batteryGps}h`,
      });
    }
  }

  if (profile.priorities.includes("music")) {
    if (!musicKnown) {
      parts.push({
        score: 55,
        known: false,
        note: "On-watch music not verified",
      });
    } else {
      parts.push({
        score: music ? 95 : 35,
        known: true,
        note: music ? "On-watch music supported" : "No on-watch music",
      });
    }
  }

  if (profile.priorities.includes("training-metrics")) {
    if (!trainingKnown) {
      parts.push({
        score: 55,
        known: false,
        note: "Training metrics depth not verified",
      });
    } else {
      parts.push({
        score: trainingSignals ? 92 : 55,
        known: true,
        note: trainingSignals
          ? "Advanced training / recovery metrics present"
          : "Fewer structured training metrics listed",
      });
    }
  }

  if (profile.priorities.includes("display")) {
    if (!displayType) {
      parts.push({
        score: 55,
        known: false,
        note: "Display type not verified",
      });
    } else {
      const amoled = displayType.toLowerCase().includes("amoled");
      parts.push({
        score: amoled ? 95 : 78,
        known: true,
        note: `Display: ${displayType}`,
      });
    }
  }

  if (parts.length === 0) {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "No watch-specific preference signals applied",
    };
  }

  const avg = parts.reduce((a, p) => a + p.score, 0) / parts.length;
  const known = parts.some((p) => p.known);
  const allKnown = parts.every((p) => p.known);
  return {
    score: Math.round(avg),
    confidence: allKnown ? "verified-spec" : known ? "inferred" : "unknown",
    explanation: parts.map((p) => p.note).join("; "),
  };
}

function cushionScore(
  preferred: string | undefined,
  productLevel: string | undefined,
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (!preferred || preferred === "no-preference") {
    return {
      score: 75,
      confidence: "neutral",
      explanation: "No cushioning preference selected",
    };
  }
  if (!productLevel) {
    return {
      score: 55,
      confidence: "unknown",
      explanation: "Cushioning level not verified for this product",
    };
  }
  const order = ["minimal", "low", "medium", "high", "maximum"];
  const prefMap: Record<string, string> = {
    minimal: "minimal",
    balanced: "medium",
    cushioned: "high",
    maximum: "maximum",
  };
  const want = prefMap[preferred] ?? preferred;
  const wi = order.indexOf(want);
  const pi = order.indexOf(productLevel);
  if (wi < 0 || pi < 0) {
    return {
      score: 55,
      confidence: "unknown",
      explanation: "Could not compare cushioning values",
    };
  }
  const delta = Math.abs(wi - pi);
  const score = delta === 0 ? 100 : delta === 1 ? 78 : delta === 2 ? 50 : 28;
  return {
    score,
    confidence: "verified-spec",
    explanation:
      delta === 0
        ? `Cushioning (${productLevel}) matches your preference`
        : `Cushioning is ${productLevel}; you preferred ${want}`,
  };
}

function terrainScore(
  preferred: string | undefined,
  productTerrains: string[],
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (!preferred) {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "No terrain preference",
    };
  }
  if (productTerrains.length === 0) {
    return {
      score: 50,
      confidence: "unknown",
      explanation: "Terrain suitability not verified",
    };
  }
  if (preferred === "mixed") {
    const hasRoad = productTerrains.some((t) =>
      ["road", "mixed", "treadmill"].includes(t),
    );
    const hasTrail = productTerrains.includes("trail");
    if (productTerrains.includes("mixed") || (hasRoad && hasTrail)) {
      return {
        score: 95,
        confidence: "verified-spec",
        explanation: "Suited to mixed road and trail use",
      };
    }
    if (hasRoad) {
      return {
        score: 70,
        confidence: "verified-spec",
        explanation: "Primarily road-oriented for mixed use",
      };
    }
    return {
      score: 55,
      confidence: "verified-spec",
      explanation: "Limited mixed-terrain coverage",
    };
  }
  if (productTerrains.includes(preferred) || productTerrains.includes("mixed")) {
    return {
      score: 100,
      confidence: "verified-spec",
      explanation: `Listed for ${preferred} use`,
    };
  }
  // Soft mismatch (hard exclusions already applied)
  return {
    score: 25,
    confidence: "verified-spec",
    explanation: `Terrain list (${productTerrains.join(", ")}) is a weaker fit for ${preferred}`,
  };
}

function stabilityScore(
  preferred: string | undefined,
  productStab: string | undefined,
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (!preferred || preferred === "not-sure" || preferred === "no") {
    return {
      score: 75,
      confidence: "neutral",
      explanation:
        preferred === "no"
          ? "Stability not required — neutral-friendly"
          : "No explicit stability requirement",
    };
  }
  if (!productStab) {
    return {
      score: 50,
      confidence: "unknown",
      explanation: "Stability classification not verified",
    };
  }
  const stable = ["mild-stability", "stability", "maximum-stability"];
  if (preferred === "yes") {
    if (stable.includes(productStab)) {
      return {
        score: 95,
        confidence: "verified-spec",
        explanation: `Offers ${productStab.replace(/-/g, " ")} support`,
      };
    }
    return {
      score: 35,
      confidence: "verified-spec",
      explanation: "Neutral shoe — weaker if you specifically want stability",
    };
  }
  return { score: 70, confidence: "neutral", explanation: "Stability not weighted" };
}

function widthScore(
  preferred: string | undefined,
  widths: string[],
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (!preferred || preferred === "not-sure") {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "No explicit width requirement",
    };
  }
  if (widths.length === 0) {
    return {
      score: 50,
      confidence: "unknown",
      explanation: "Width options not verified — we do not claim fit",
    };
  }
  if (preferred === "standard" && widths.includes("standard")) {
    return {
      score: 95,
      confidence: "verified-spec",
      explanation: "Standard width available",
    };
  }
  if (preferred === "wide" && (widths.includes("wide") || widths.includes("extra-wide"))) {
    return {
      score: 100,
      confidence: "verified-spec",
      explanation: "Wide width options available",
    };
  }
  if (preferred === "extra-wide" && widths.includes("extra-wide")) {
    return {
      score: 100,
      confidence: "verified-spec",
      explanation: "Extra-wide options available",
    };
  }
  if (preferred === "narrow" && (widths.includes("narrow") || widths.includes("standard"))) {
    return {
      score: 90,
      confidence: "verified-spec",
      explanation: "Narrow or standard width listed",
    };
  }
  return {
    score: 30,
    confidence: "verified-spec",
    explanation: "Listed widths may not match your preference",
  };
}

function experienceScore(
  preferred: FinderNormalizedProfile["experienceLevel"],
  productLevels: string[],
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (!preferred) {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "Experience level not specified",
    };
  }
  if (productLevels.length === 0) {
    return {
      score: 60,
      confidence: "unknown",
      explanation: "Experience suitability not listed",
    };
  }
  if (productLevels.includes(preferred)) {
    return {
      score: 95,
      confidence: "inferred",
      explanation: `Suitable for ${preferred} runners`,
    };
  }
  // Beginners can use intermediate shoes — soft penalty only
  if (preferred === "beginner" && productLevels.includes("intermediate")) {
    return {
      score: 80,
      confidence: "inferred",
      explanation: "Also listed for intermediate runners",
    };
  }
  return {
    score: 55,
    confidence: "inferred",
    explanation: "Experience fit is a softer match",
  };
}

function scoreUseCaseContext(
  useCaseIds: string[],
  recommendations: Recommendation[],
  productId: string,
): { score: number; confidence: FactorConfidence; explanation: string; avg?: number } {
  if (useCaseIds.length === 0) {
    return {
      score: 70,
      confidence: "neutral",
      explanation: "No specific use-case contexts selected",
    };
  }
  // Score every requested context. Missing recs → unknown (55), not omitted —
  // otherwise products with a single matching context outrank fuller coverage.
  const scores: number[] = [];
  let known = 0;
  for (const uc of useCaseIds) {
    const rec = recommendations.find(
      (r) => r.productId === productId && r.useCaseId === uc,
    );
    if (rec) {
      scores.push(rec.score);
      known += 1;
    } else {
      scores.push(55);
    }
  }
  if (known === 0) {
    return {
      score: 55,
      confidence: "unknown",
      explanation: "No structured recommendation contexts for your selected uses",
    };
  }
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    score: Math.round(avg),
    confidence: known === scores.length ? "recommendation" : "inferred",
    explanation: `Average use-case suitability ${Math.round(avg)} across ${scores.length} context(s) (${known} evidenced)`,
    avg,
  };
}

function budgetScore(
  profile: FinderNormalizedProfile,
  lowestPrice: { price: number; currency: string } | undefined,
  cfg: FinderScoringProfile["budget"],
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (!profile.budgetBandId || profile.budgetBandId === "no-limit") {
    return {
      score: 80,
      confidence: "neutral",
      explanation: "No budget limit applied",
    };
  }
  if (!lowestPrice) {
    return {
      score: cfg.noOfferScore,
      confidence: "unknown",
      explanation:
        "No current regional offer — not eliminated, but budget fit is uncertain",
    };
  }
  if (
    profile.budgetCurrency &&
    lowestPrice.currency !== profile.budgetCurrency
  ) {
    return {
      score: cfg.noOfferScore,
      confidence: "unknown",
      explanation: "Offer currency does not match budget region — not compared",
    };
  }
  const price = lowestPrice.price;
  const max = profile.budgetMax;
  const min = profile.budgetMin ?? 0;
  if (max === undefined) {
    // Open upper (e.g. 200+)
    if (price >= min) {
      return {
        score: cfg.withinScore,
        confidence: "verified-spec",
        explanation: "Price sits in your open budget band",
      };
    }
    return {
      score: 70,
      confidence: "verified-spec",
      explanation: "Price is below your selected band (still fine)",
    };
  }
  if (price >= min && price <= max) {
    return {
      score: cfg.withinScore,
      confidence: "verified-spec",
      explanation: "Current regional price is within your budget",
    };
  }
  if (price < min) {
    return {
      score: 88,
      confidence: "verified-spec",
      explanation: "Priced below your selected band",
    };
  }
  const overRatio = (price - max) / Math.max(max, 1);
  if (overRatio <= cfg.slightOverRatio) {
    return {
      score: cfg.slightOverScore,
      confidence: "verified-spec",
      explanation: "Slightly above your budget band",
    };
  }
  if (overRatio <= cfg.farOverRatio) {
    return {
      score: Math.round((cfg.slightOverScore + cfg.farOverScore) / 2),
      confidence: "verified-spec",
      explanation: "Above your budget band",
    };
  }
  return {
    score: cfg.farOverScore,
    confidence: "verified-spec",
    explanation: "Well above your selected budget",
  };
}

function valueScoreFactor(
  product: Product,
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (typeof product.valueScore !== "number") {
    return {
      score: 55,
      confidence: "unknown",
      explanation: "No structured value score",
    };
  }
  return {
    score: product.valueScore,
    confidence: "inferred",
    explanation: `Kitletics value score ${product.valueScore}`,
  };
}

function lifecycleBonus(
  product: Product,
): { score: number; confidence: FactorConfidence; explanation: string } {
  if (product.lifecycleStatus === "current") {
    return {
      score: 90,
      confidence: "verified-spec",
      explanation: "Current generation",
    };
  }
  if (product.lifecycleStatus === "previous-generation") {
    return {
      score: 65,
      confidence: "verified-spec",
      explanation: "Previous generation — may offer value if still available",
    };
  }
  return {
    score: 40,
    confidence: "verified-spec",
    explanation: `Lifecycle: ${product.lifecycleStatus}`,
  };
}

/**
 * Compute active weights: drop factors with no user signal, apply priority
 * multipliers, then normalize to sum 1.
 *
 * Missing optional answers do NOT penalize products — those weights are
 * redistributed across remaining factors.
 */
export function resolveActiveWeights(
  definition: FinderDefinition,
  profile: FinderNormalizedProfile,
): Record<string, number> {
  const base = { ...definition.scoringProfile.baseWeights };
  const active: Record<string, number> = {};

  const include: Record<string, boolean> = {
    terrain: Boolean(profile.terrain),
    primaryUse: profile.primaryUses.length > 0 || profile.distances.length > 0,
    cushioning:
      Boolean(profile.cushioning) && profile.cushioning !== "no-preference",
    stability:
      Boolean(profile.stability) &&
      profile.stability !== "not-sure",
    width: Boolean(profile.width) && profile.width !== "not-sure",
    experience: Boolean(profile.experienceLevel),
    budget:
      Boolean(profile.budgetBandId) && profile.budgetBandId !== "no-limit",
    value: profile.priorities.includes("value"),
    lifecycle: true,
    specs:
      Boolean(profile.playingStyle) ||
      Boolean(profile.weightPreference) ||
      Boolean(profile.balancePreference) ||
      Boolean(profile.feelPreference) ||
      profile.needsMaps !== undefined ||
      profile.priorities.some((p) =>
        [
          "control",
          "power",
          "forgiveness",
          "maneuverability",
          "comfort",
          "spin",
          "maps",
          "battery",
          "music",
          "training-metrics",
          "display",
        ].includes(p),
      ),
    // runnerWeight intentionally omitted unless structured suitability exists
  };

  for (const [key, weight] of Object.entries(base)) {
    if (include[key] === false) continue;
    if (weight <= 0) continue;
    active[key] = weight;
  }

  // Priority multipliers
  for (const priority of profile.priorities) {
    const mults = definition.scoringProfile.priorityMultipliers[priority];
    if (!mults) continue;
    for (const [factor, mult] of Object.entries(mults)) {
      if (active[factor] !== undefined) {
        active[factor] *= mult;
      }
    }
  }

  const sum = Object.values(active).reduce((a, b) => a + b, 0) || 1;
  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(active)) {
    normalized[k] = v / sum;
  }
  return normalized;
}

export function scoreProductFactors(input: {
  product: Product;
  profile: FinderNormalizedProfile;
  definition: FinderDefinition;
  recommendations: Recommendation[];
  lowestPrice?: { price: number; currency: string };
}): { factors: FactorScore[]; matchScore: number; coverage: number; contextScore?: number } {
  const { product, profile, definition, recommendations, lowestPrice } = input;
  const weights = resolveActiveWeights(definition, profile);
  const useCaseIds = resolveProfileUseCaseIds(profile);
  const factors: FactorScore[] = [];

  const push = (
    factor: string,
    label: string,
    result: {
      score: number;
      confidence: FactorConfidence;
      explanation: string;
    },
  ) => {
    const weight = weights[factor];
    if (weight === undefined) return;
    factors.push({
      factor,
      label,
      score: result.score,
      weight,
      confidence: result.confidence,
      explanation: result.explanation,
    });
  };

  push(
    "terrain",
    "Terrain",
    terrainScore(
      profile.terrain,
      asArray(product.specifications.terrain as SpecValue),
    ),
  );

  const uc = scoreUseCaseContext(useCaseIds, recommendations, product.id);
  push("primaryUse", "Primary use & distance", uc);

  push(
    "cushioning",
    "Cushioning",
    cushionScore(
      profile.cushioning,
      product.specifications.cushionLevel != null
        ? String(product.specifications.cushionLevel)
        : undefined,
    ),
  );

  push(
    "stability",
    "Stability",
    stabilityScore(
      profile.stability,
      product.specifications.stability != null
        ? String(product.specifications.stability)
        : undefined,
    ),
  );

  push(
    "width",
    "Fit / width",
    widthScore(
      profile.width,
      asArray(product.specifications.widthOptions as SpecValue),
    ),
  );

  push(
    "experience",
    "Experience fit",
    experienceScore(profile.experienceLevel, product.experienceLevels ?? []),
  );

  push(
    "budget",
    "Budget",
    budgetScore(profile, lowestPrice, definition.scoringProfile.budget),
  );

  push("value", "Value", valueScoreFactor(product));
  push("lifecycle", "Availability", lifecycleBonus(product));

  if (profile.categoryId === "cat-gps-watches") {
    push("specs", "Watch features", watchSpecsScore(profile, product));
  } else if (
    profile.categoryId === "cat-padel-rackets" ||
    profile.categoryId === "cat-tennis-rackets" ||
    profile.categoryId === "cat-pickleball-paddles" ||
    profile.categoryId === "cat-badminton-rackets" ||
    profile.categoryId === "cat-squash-rackets"
  ) {
    push("specs", "Racket match factors", racketSpecsScore(profile, product));
  } else if (profile.categoryId === "cat-hrm") {
    push("specs", "HRM match factors", hrmSpecsScore(profile, product));
  } else {
    push("specs", "Category fit", {
      score: 72,
      confidence: "neutral" as const,
      explanation:
        "Matched mainly on use case, priorities and budget for this category.",
    });
  }

  // Weighted sum — unknown factors still contribute their neutral-ish score
  // but coverage tracks how many had real data
  let matchScore = 0;
  let knownWeight = 0;
  let totalWeight = 0;
  for (const f of factors) {
    matchScore += f.score * f.weight;
    totalWeight += f.weight;
    if (f.confidence !== "unknown" && f.confidence !== "neutral") {
      knownWeight += f.weight;
    }
  }
  if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.01) {
    matchScore = matchScore / totalWeight;
  }

  const coverage = totalWeight > 0 ? knownWeight / totalWeight : 0;

  return {
    factors,
    matchScore: Math.round(Math.min(100, Math.max(0, matchScore))),
    coverage,
    contextScore: uc.avg,
  };
}

/**
 * AFFILIATE NEUTRALITY (documented):
 * Ranking inputs may include availability, price, and budget fit only.
 * Affiliate status, commission rate, and retailer payout must NEVER
 * affect matchScore or eligibility.
 */
export const AFFILIATE_NEUTRALITY =
  "Affiliate commission is never an input to Finder ranking.";
