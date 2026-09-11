import { describe, expect, it } from "vitest";
import {
  HALF_MARATHON_METERS,
  MARATHON_METERS,
  getRaceDistanceById,
} from "@/domain/calculators/running/distances";
import {
  calculateDistanceMeters,
  calculateDurationSeconds,
  calculatePaceSecondsPerMeter,
  runPaceCalculation,
} from "@/domain/calculators/running/pace";
import { generateSplits } from "@/domain/calculators/running/splits";
import {
  RIEGEL_EXPONENT,
  predictEquivalentRaceTimes,
  predictRaceTime,
  runRacePrediction,
} from "@/domain/calculators/running/race-predictor";
import {
  formatDuration,
  formatPace,
  paceDisplayToSecondsPerMeter,
  secondsPerMeterToPaceDisplay,
} from "@/domain/calculators/units";
import {
  parsePaceUrlState,
  parsePredictorUrlState,
  serializePaceUrlState,
  serializePredictorUrlState,
  buildPaceHandoffQuery,
} from "@/domain/calculators/share-state";
import { getCalculatorDefinition } from "@/domain/calculators/registry";
import { getToolBySlug } from "@/repositories";

describe("Running distance constants", () => {
  it("uses exact half and marathon metres", () => {
    expect(getRaceDistanceById("half")?.meters).toBe(21097.5);
    expect(getRaceDistanceById("marathon")?.meters).toBe(42195);
    expect(HALF_MARATHON_METERS).toBe(21097.5);
    expect(MARATHON_METERS).toBe(42195);
  });
});

describe("Pace mathematics", () => {
  it("5K in 25:00 = 5:00/km", () => {
    const spm = calculatePaceSecondsPerMeter(5000, 1500);
    const perKm = Math.round(secondsPerMeterToPaceDisplay(spm, "min_per_km"));
    expect(perKm).toBe(300);
    expect(formatPace(perKm)).toBe("5:00");

    const result = runPaceCalculation({
      mode: "pace",
      distanceMeters: 5000,
      durationSeconds: 1500,
    });
    expect(result?.conversions.pacePerKmLabel).toBe("5:00");
  });

  it("10K at 5:00/km = 50:00", () => {
    const pace = paceDisplayToSecondsPerMeter(300, "min_per_km");
    const duration = calculateDurationSeconds(10000, pace);
    expect(duration).toBe(3000);
    expect(formatDuration(duration)).toBe("50:00");
  });

  it("converts mile pace reasonably", () => {
    const spm = paceDisplayToSecondsPerMeter(300, "min_per_km");
    const perMile = Math.round(
      secondsPerMeterToPaceDisplay(spm, "min_per_mile"),
    );
    // 5:00/km ≈ 8:03/mile
    expect(perMile).toBeGreaterThanOrEqual(482);
    expect(perMile).toBeLessThanOrEqual(484);
  });

  it("time + pace → distance", () => {
    const pace = paceDisplayToSecondsPerMeter(300, "min_per_km");
    const meters = calculateDistanceMeters(3000, pace);
    expect(meters).toBeCloseTo(10000, 0);
  });

  it("rejects zero and negative inputs", () => {
    expect(calculatePaceSecondsPerMeter(0, 100)).toBeNaN();
    expect(calculateDurationSeconds(5000, -1)).toBeNaN();
    expect(calculateDistanceMeters(-10, 0.3)).toBeNaN();
  });
});

describe("Duration formatting", () => {
  it("formats common durations", () => {
    expect(formatDuration(330)).toBe("5:30");
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(27 * 3600 + 30 * 60)).toBe("27:30:00");
  });
});

describe("Splits", () => {
  it("accumulates from absolute distance × pace without drift", () => {
    const pace = paceDisplayToSecondsPerMeter(300, "min_per_km");
    const rows = generateSplits({
      distanceMeters: 5000,
      paceSecondsPerMeter: pace,
      interval: "1km",
    });
    expect(rows).toHaveLength(5);
    expect(rows[0].cumulativeLabel).toBe("5:00");
    expect(rows[4].label).toBe("Finish");
    expect(rows[4].cumulativeSeconds).toBe(1500);
  });

  it("uses marathon checkpoints", () => {
    const pace = paceDisplayToSecondsPerMeter(360, "min_per_km");
    const rows = generateSplits({
      distanceMeters: MARATHON_METERS,
      paceSecondsPerMeter: pace,
      interval: "checkpoints",
    });
    expect(rows.some((r) => r.label === "Half")).toBe(true);
    expect(rows[rows.length - 1].label).toBe("Finish");
    expect(rows[rows.length - 1].distanceMeters).toBe(MARATHON_METERS);
  });
});

describe("Riegel race predictor", () => {
  it("same distance returns same time", () => {
    expect(
      predictRaceTime({
        sourceDistanceMeters: 10000,
        sourceTimeSeconds: 2400,
        targetDistanceMeters: 10000,
      }),
    ).toBe(2400);
  });

  it("matches independent Riegel fixtures", () => {
    // 5K 25:00 → 10K
    const t10 = predictRaceTime({
      sourceDistanceMeters: 5000,
      sourceTimeSeconds: 1500,
      targetDistanceMeters: 10000,
      exponent: RIEGEL_EXPONENT,
    });
    const expected10 = Math.round(1500 * Math.pow(2, 1.06));
    expect(t10).toBe(expected10);

    // 10K 48:30 → Half
    const tHalf = predictRaceTime({
      sourceDistanceMeters: 10000,
      sourceTimeSeconds: 2910,
      targetDistanceMeters: HALF_MARATHON_METERS,
    });
    const expectedHalf = Math.round(
      2910 * Math.pow(HALF_MARATHON_METERS / 10000, 1.06),
    );
    expect(tHalf).toBe(expectedHalf);

    // Half → Marathon
    const tMara = predictRaceTime({
      sourceDistanceMeters: HALF_MARATHON_METERS,
      sourceTimeSeconds: 5400,
      targetDistanceMeters: MARATHON_METERS,
    });
    expect(tMara).toBe(
      Math.round(5400 * Math.pow(MARATHON_METERS / HALF_MARATHON_METERS, 1.06)),
    );

    // Marathon → 10K (reverse)
    const tDown = predictRaceTime({
      sourceDistanceMeters: MARATHON_METERS,
      sourceTimeSeconds: 14400,
      targetDistanceMeters: 10000,
    });
    expect(tDown).toBe(
      Math.round(14400 * Math.pow(10000 / MARATHON_METERS, 1.06)),
    );
  });

  it("builds equivalent race table", () => {
    const rows = predictEquivalentRaceTimes({
      sourceDistanceMeters: 10000,
      sourceTimeSeconds: 3000,
    });
    expect(rows.some((r) => r.distanceId === "10k" && r.isSource)).toBe(true);
    expect(rows.some((r) => r.distanceId === "marathon")).toBe(true);
  });

  it("runRacePrediction includes model provenance", () => {
    const result = runRacePrediction({
      sourceDistanceMeters: 5000,
      sourceTimeSeconds: 1200,
      targetDistanceMeters: 10000,
    });
    expect(result?.modelId).toBe("race-predictor-riegel-v1");
    expect(result?.exponent).toBe(1.06);
    expect(result?.reliability).toBe("closer");
  });
});

describe("Share / URL state", () => {
  it("round-trips pace URL state", () => {
    const qs = serializePaceUrlState({
      mode: "pace",
      distanceId: "10k",
      distanceUnit: "km",
      timeSeconds: 3000,
      paceUnit: "km",
      splitInterval: "auto",
    });
    const parsed = parsePaceUrlState(new URLSearchParams(qs));
    expect(parsed.mode).toBe("pace");
    expect(parsed.distanceId).toBe("10k");
    expect(parsed.timeSeconds).toBe(3000);
    expect(parsed.distanceMeters).toBe(10000);
  });

  it("rejects invalid pace query values", () => {
    const parsed = parsePaceUrlState({ mode: "pace", time: "-500", distance: "10k" });
    expect(parsed.timeSeconds).toBeUndefined();
  });

  it("round-trips predictor URL state", () => {
    const qs = serializePredictorUrlState({
      fromId: "10k",
      toId: "half",
      timeSeconds: 2910,
      distanceUnit: "km",
    });
    const parsed = parsePredictorUrlState(new URLSearchParams(qs));
    expect(parsed.fromId).toBe("10k");
    expect(parsed.toId).toBe("half");
    expect(parsed.timeSeconds).toBe(2910);
  });

  it("builds pace handoff from predictor", () => {
    const qs = buildPaceHandoffQuery({
      distanceId: "half",
      distanceMeters: HALF_MARATHON_METERS,
      timeSeconds: 6432,
    });
    const parsed = parsePaceUrlState(new URLSearchParams(qs));
    expect(parsed.mode).toBe("pace");
    expect(parsed.distanceId).toBe("half");
    expect(parsed.timeSeconds).toBe(6432);
  });
});

describe("Calculator publication", () => {
  it("publishes both calculators with definitions", () => {
    expect(getToolBySlug("running-pace-calculator", { isDev: false })?.available).toBe(
      true,
    );
    expect(getToolBySlug("race-time-predictor", { isDev: false })?.available).toBe(
      true,
    );
    expect(getCalculatorDefinition("running-pace-calculator")).toBeDefined();
    expect(getCalculatorDefinition("race-time-predictor")).toBeDefined();
  });
});
