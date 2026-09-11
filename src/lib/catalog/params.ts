import type { CatalogFilterState, CatalogSort } from "@/lib/catalog/types";

const SORTS = new Set<CatalogSort>([
  "recommended",
  "score",
  "price-asc",
  "price-desc",
  "newest",
  "lightest",
  "most-cushioned",
]);

function splitCsv(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function mergeSpec(
  specs: Record<string, string[]>,
  key: string,
  values: string[],
): void {
  if (!values.length) return;
  specs[key] = unique([...(specs[key] ?? []), ...values]);
}

/**
 * Parse shareable catalog query params.
 *
 * Convention:
 * - type=daily-trainers,race
 * - brand=asics,hoka
 * - cushion=high (maps to specs.cushionLevel)
 * - terrain=road
 * - stability=neutral
 * - drop=5-8
 * - weight=200-280
 * - distance=marathon
 * - training=easy,long
 * - width=wide
 * - plate=true
 * - price=100-200
 * - usecase=beginners
 * - sort=recommended
 *
 * Spec aliases keep URLs short for common shoe filters.
 */
const SPEC_ALIASES: Record<string, string> = {
  cushion: "cushionLevel",
  terrain: "terrain",
  stability: "stability",
  drop: "drop",
  weight: "weight",
  distance: "recommendedDistance",
  training: "trainingTypes",
  width: "widthOptions",
  plate: "plate",
  plateMaterial: "plateMaterial",
  energy: "energyReturn",
  grip: "grip",
  gender: "genderFit",
};

/** Legacy / shorthand usecase slugs → canonical taxonomy slugs */
const USECASE_ALIASES: Record<string, string> = {
  half: "half-marathon",
  treadmill: "treadmill-running",
  trail: "trail-running",
  daily: "daily-training",
  tempo: "tempo-runs",
  recovery: "recovery-runs",
  long: "long-runs",
  easy: "easy-runs",
};

/**
 * Map entry usecases onto sidebar-visible facets so landing URLs light up the
 * filters shoppers actually see (distance / type / terrain / training / width).
 * Use-case eligibility is dropped when a stronger visible facet fully replaces it.
 */
const USECASE_ENTRY_EXPANSION: Record<
  string,
  {
    type?: string[];
    specs?: Record<string, string[]>;
    /** Keep usecase filter after expansion (default false when specs/type cover intent) */
    keepUseCase?: boolean;
  }
> = {
  marathon: { specs: { recommendedDistance: ["marathon"] } },
  "half-marathon": { specs: { recommendedDistance: ["half"] } },
  "5k": { specs: { recommendedDistance: ["5k"] } },
  "10k": { specs: { recommendedDistance: ["10k"] } },
  ultra: { specs: { recommendedDistance: ["ultra"] } },
  "daily-training": {
    type: ["daily-trainers"],
    specs: { trainingTypes: ["easy"], recommendedDistance: ["daily"] },
  },
  "long-runs": { specs: { trainingTypes: ["long"] } },
  "tempo-runs": {
    type: ["tempo"],
    specs: { trainingTypes: ["tempo"] },
  },
  "recovery-runs": { specs: { trainingTypes: ["recovery"] } },
  "easy-runs": { specs: { trainingTypes: ["easy"] } },
  intervals: { specs: { trainingTypes: ["intervals"] } },
  "speed-work": { specs: { trainingTypes: ["intervals"] } },
  "trail-running": {
    type: ["trail"],
    specs: { terrain: ["trail"] },
  },
  "treadmill-running": { specs: { terrain: ["treadmill"] } },
  "wide-feet": { specs: { widthOptions: ["wide"] } },
  overpronators: { type: ["stability"] },
  "neutral-runners": { specs: { stability: ["neutral"] } },
  beginners: { keepUseCase: true },
  "heavy-runners": { keepUseCase: true },
  comfort: { specs: { cushionLevel: ["high", "maximum"] } },
  "high-mileage": { type: ["daily-trainers"], specs: { trainingTypes: ["long", "easy"] } },
  "pb-pr": { type: ["race", "tempo"] },
};

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>,
  defaultSort: CatalogSort = "recommended",
): CatalogFilterState {
  const specs: Record<string, string[]> = {};

  for (const [alias, specKey] of Object.entries(SPEC_ALIASES)) {
    const values = splitCsv(params[alias]);
    if (values.length > 0) specs[specKey] = values;
  }

  // Also accept raw spec.* params for future categories
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith("spec.")) continue;
    const specKey = key.slice(5);
    const values = splitCsv(value);
    if (values.length > 0) specs[specKey] = values;
  }

  let priceMin: number | undefined;
  let priceMax: number | undefined;
  const price = typeof params.price === "string" ? params.price : undefined;
  if (price) {
    const [minRaw, maxRaw] = price.split("-");
    const min = Number(minRaw);
    const max = Number(maxRaw);
    if (!Number.isNaN(min) && minRaw !== "") priceMin = min;
    if (!Number.isNaN(max) && maxRaw !== undefined && maxRaw !== "") priceMax = max;
  }

  const sortRaw =
    typeof params.sort === "string" ? (params.sort as CatalogSort) : defaultSort;

  let type = splitCsv(params.type);
  const useCase = splitCsv(params.usecase ?? params.useCase).map(
    (slug) => USECASE_ALIASES[slug] ?? slug,
  );

  // Expand entry usecases into visible sidebar facets
  const keepUseCases: string[] = [];
  for (const slug of useCase) {
    const expansion = USECASE_ENTRY_EXPANSION[slug];
    if (!expansion) {
      keepUseCases.push(slug);
      continue;
    }
    if (expansion.type?.length) {
      type = unique([...type, ...expansion.type]);
    }
    for (const [key, values] of Object.entries(expansion.specs ?? {})) {
      mergeSpec(specs, key, values);
    }
    if (expansion.keepUseCase) keepUseCases.push(slug);
  }

  return {
    type,
    brand: splitCsv(params.brand),
    specs,
    useCase: keepUseCases,
    priceMin,
    priceMax,
    sort: SORTS.has(sortRaw) ? sortRaw : defaultSort,
  };
}

/**
 * Canonical destinations for bare category entry intents
 * (no other refinements). Used by the shoes category route.
 */
export function resolveRunningShoesEntryRedirect(
  params: Record<string, string | string[] | undefined>,
): string | null {
  const refinementKeys = Object.keys(params).filter(
    (k) =>
      k !== "type" &&
      k !== "usecase" &&
      k !== "useCase" &&
      k !== "sort" &&
      params[k] !== undefined &&
      params[k] !== "",
  );
  if (refinementKeys.length > 0) return null;

  const typeValues = splitCsv(params.type);
  const useCaseRaw = splitCsv(params.usecase ?? params.useCase).map(
    (slug) => USECASE_ALIASES[slug] ?? slug,
  );

  if (typeValues.length === 1 && typeValues[0] === "trail" && useCaseRaw.length === 0) {
    return "/running/shoes/trail";
  }
  if (typeValues.length === 1 && typeValues[0] === "race" && useCaseRaw.length === 0) {
    return "/running/shoes/race";
  }
  if (typeValues.length === 1 && typeValues[0] === "stability" && useCaseRaw.length === 0) {
    return "/running/shoes/stability";
  }

  if (useCaseRaw.length === 1 && typeValues.length === 0) {
    switch (useCaseRaw[0]) {
      case "trail-running":
        return "/running/shoes/trail";
      case "marathon":
        return "/running/shoes/race?distance=marathon";
      case "half-marathon":
        return "/running/shoes/race?distance=half";
      case "5k":
        return "/running/shoes/race?distance=5k";
      case "10k":
        return "/running/shoes/race?distance=10k";
      default:
        break;
    }
  }

  return null;
}

export function serializeCatalogSearchParams(
  state: CatalogFilterState,
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.type.length) params.set("type", state.type.join(","));
  if (state.brand.length) params.set("brand", state.brand.join(","));
  if (state.useCase.length) params.set("usecase", state.useCase.join(","));

  const reverseAlias = Object.fromEntries(
    Object.entries(SPEC_ALIASES).map(([alias, key]) => [key, alias]),
  );

  for (const [specKey, values] of Object.entries(state.specs)) {
    if (!values.length) continue;
    const alias = reverseAlias[specKey] ?? `spec.${specKey}`;
    params.set(alias, values.join(","));
  }

  if (state.priceMin !== undefined || state.priceMax !== undefined) {
    params.set(
      "price",
      `${state.priceMin ?? ""}-${state.priceMax ?? ""}`,
    );
  }

  if (state.sort && state.sort !== "recommended") {
    params.set("sort", state.sort);
  }

  return params;
}

export function catalogHref(
  basePath: string,
  state: CatalogFilterState,
  page?: number,
): string {
  const params = serializeCatalogSearchParams(state);
  if (page !== undefined && page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Remove one active chip from filter state.
 */
export function removeFilterValue(
  state: CatalogFilterState,
  group: string,
  value: string,
): CatalogFilterState {
  const next: CatalogFilterState = {
    ...state,
    type: [...state.type],
    brand: [...state.brand],
    useCase: [...state.useCase],
    specs: { ...state.specs },
  };

  if (group === "type") {
    next.type = next.type.filter((v) => v !== value);
  } else if (group === "brand") {
    next.brand = next.brand.filter((v) => v !== value);
  } else if (group === "usecase") {
    next.useCase = next.useCase.filter((v) => v !== value);
  } else if (group === "price") {
    next.priceMin = undefined;
    next.priceMax = undefined;
  } else {
    next.specs[group] = (next.specs[group] ?? []).filter((v) => v !== value);
    if (next.specs[group]?.length === 0) delete next.specs[group];
  }

  return next;
}

export function clearCatalogFilters(
  state: CatalogFilterState,
): CatalogFilterState {
  return {
    type: [],
    brand: [],
    specs: {},
    useCase: [],
    priceMin: undefined,
    priceMax: undefined,
    sort: state.sort,
  };
}
