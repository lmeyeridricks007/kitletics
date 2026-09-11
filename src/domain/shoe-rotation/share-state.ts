import type {
  RotationResponses,
  RotationShareState,
} from "@/domain/shoe-rotation/types";
import { ROTATION_PLANNER_VERSION } from "@/domain/shoe-rotation/roles";

export function encodeRotationShareState(
  responses: RotationResponses,
): string {
  const payload: RotationShareState = {
    v: ROTATION_PLANNER_VERSION,
    mode: responses.mode,
    training: responses.trainingTypes,
    freq: responses.weeklyFrequency,
    dist: responses.weeklyDistance,
    races: responses.raceDistances,
    terrain: responses.terrain,
    priorities: responses.priorities,
    budget: responses.budgetBandId,
    size:
      responses.desiredSize === undefined
        ? undefined
        : String(responses.desiredSize),
    additions:
      responses.maxAdditions === undefined
        ? undefined
        : String(responses.maxAdditions),
    owned: responses.ownedProductIds,
    manuals: responses.manualShoes.map((m) => ({
      id: m.id,
      label: m.label,
      roles: m.roleIds,
    })),
    overrides: responses.roleOverrides,
  };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function encodeRotationShareStateBrowser(
  responses: RotationResponses,
): string {
  const payload: RotationShareState = {
    v: ROTATION_PLANNER_VERSION,
    mode: responses.mode,
    training: responses.trainingTypes,
    freq: responses.weeklyFrequency,
    dist: responses.weeklyDistance,
    races: responses.raceDistances,
    terrain: responses.terrain,
    priorities: responses.priorities,
    budget: responses.budgetBandId,
    size:
      responses.desiredSize === undefined
        ? undefined
        : String(responses.desiredSize),
    additions:
      responses.maxAdditions === undefined
        ? undefined
        : String(responses.maxAdditions),
    owned: responses.ownedProductIds,
    manuals: responses.manualShoes.map((m) => ({
      id: m.id,
      label: m.label,
      roles: m.roleIds,
    })),
    overrides: responses.roleOverrides,
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeRotationShareState(
  encoded: string,
):
  | { ok: true; responses: RotationResponses }
  | { ok: false; error: string } {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as RotationShareState;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Invalid share state" };
    }
    if (parsed.v !== ROTATION_PLANNER_VERSION && parsed.v !== "v1") {
      // Accept current or migrate lightly
      if (!parsed.v) return { ok: false, error: "Missing planner version" };
    }
    if (parsed.mode !== "from-scratch" && parsed.mode !== "improve") {
      return { ok: false, error: "Invalid mode" };
    }

    const sizeRaw = parsed.size;
    let desiredSize: RotationResponses["desiredSize"];
    if (sizeRaw === "recommend") desiredSize = "recommend";
    else if (sizeRaw === "1" || sizeRaw === "2" || sizeRaw === "3" || sizeRaw === "4") {
      desiredSize = Number(sizeRaw) as 1 | 2 | 3 | 4;
    }

    const addRaw = parsed.additions;
    let maxAdditions: RotationResponses["maxAdditions"];
    if (addRaw === "recommend") maxAdditions = "recommend";
    else if (addRaw === "1" || addRaw === "2" || addRaw === "3") {
      maxAdditions = Number(addRaw) as 1 | 2 | 3;
    }

    const responses: RotationResponses = {
      mode: parsed.mode,
      trainingTypes: Array.isArray(parsed.training) ? parsed.training.map(String) : [],
      weeklyFrequency: parsed.freq as RotationResponses["weeklyFrequency"],
      weeklyDistance: parsed.dist as RotationResponses["weeklyDistance"],
      raceDistances: parsed.races?.map(String),
      terrain: parsed.terrain as RotationResponses["terrain"],
      priorities: (parsed.priorities ?? []) as RotationResponses["priorities"],
      budgetBandId: parsed.budget,
      desiredSize,
      maxAdditions,
      ownedProductIds: Array.isArray(parsed.owned)
        ? parsed.owned.map(String).slice(0, 4)
        : [],
      manualShoes: (parsed.manuals ?? []).map((m) => ({
        id: String(m.id),
        label: String(m.label),
        roleIds: (m.roles ?? []) as RotationResponses["manualShoes"][0]["roleIds"],
      })),
      roleOverrides: parsed.overrides as RotationResponses["roleOverrides"],
    };
    return { ok: true, responses };
  } catch {
    return { ok: false, error: "Could not decode share state" };
  }
}

/**
 * Rotation planner analytics stub — intentional telemetry sink (no vendor).
 * No console residue; wire via setRotationAnalyticsSink when a vendor is ready.
 */
type RotationSink = (
  event: string,
  properties?: Record<string, string | number | boolean | undefined>,
) => void;

let rotationSink: RotationSink = () => {
  // no-op until analytics vendor is configured
};

export function setRotationAnalyticsSink(next: RotationSink): void {
  rotationSink = next;
}

export function trackRotationEvent(
  event: string,
  properties?: Record<string, string | number | boolean | undefined>,
): void {
  try {
    rotationSink(event, properties);
  } catch {
    // never break rotation UX for analytics
  }
}
