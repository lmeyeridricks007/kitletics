/**
 * Contextual secondary navigation — config + resolution.
 * Primary nav = where am I? Secondary = what do I want to do here?
 */

export type ContextualNavMatch =
  | { type: "exact"; value: string }
  | { type: "prefix"; value: string }
  | { type: "query"; param: string; value: string; pathPrefix?: string }
  | { type: "custom"; id: string };

export interface ContextualNavItem {
  id: string;
  label: string;
  href: string;
  match: ContextualNavMatch | ContextualNavMatch[];
  /** Lower = shown earlier; used for desktop overflow into More */
  priority: number;
  /** Soft-hide until content exists (checked at resolve time) */
  requiresContent?: "setups" | "reviews" | "best" | "guides" | "tools";
}

export type LocalNavMode =
  | "none"
  | "product"
  | "brand"
  | "discipline"
  | "review"
  | "detail"
  | "tool"
  | "compare"
  | "search"
  | "home"
  | "hub-suppress";

export type PrimaryNavKey =
  | "shoes"
  | "racket"
  | "running"
  | "fitness"
  | "outdoors"
  | "team"
  | null;

export type SecondaryContextKey =
  | "shoes"
  | "running"
  | "racket"
  | "fitness"
  | "outdoors"
  | "team"
  | null;

export interface ContextualNavConfig {
  contextId: SecondaryContextKey;
  parentNavKey: PrimaryNavKey;
  label: string;
  /** Max inline items on desktop before More (excluding More itself) */
  maxVisibleDesktop?: number;
  items: ContextualNavItem[];
}

export interface ResolvedNavigationContext {
  primaryNavKey: PrimaryNavKey;
  secondaryContextKey: SecondaryContextKey;
  localNavMode: LocalNavMode;
  /** When false, do not render ContextualNav */
  showContextualNav: boolean;
  config?: ContextualNavConfig;
  activeItemId?: string;
  visibleItems: ContextualNavItem[];
  overflowItems: ContextualNavItem[];
}

const DESKTOP_MAX_DEFAULT = 8;

/** Running context — decision surface first; category deep-links in More */
export const RUNNING_CONTEXTUAL_NAV: ContextualNavConfig = {
  contextId: "running",
  parentNavKey: "running",
  label: "Running",
  /** Decision surface stays on the primary desktop row */
  maxVisibleDesktop: 9,
  items: [
    {
      id: "overview",
      label: "Overview",
      href: "/running",
      match: { type: "exact", value: "/running" },
      priority: 10,
    },
    {
      id: "shoes-gear",
      label: "Shoes / Gear",
      href: "/running/shoes",
      match: [
        { type: "prefix", value: "/running/shoes" },
        { type: "prefix", value: "/running/gear" },
      ],
      priority: 20,
    },
    {
      id: "best",
      label: "Best",
      href: "/best?sport=running",
      match: [
        { type: "query", param: "sport", value: "running", pathPrefix: "/best" },
        { type: "exact", value: "/best" },
      ],
      priority: 30,
      requiresContent: "best",
    },
    {
      id: "reviews",
      label: "Reviews",
      href: "/reviews?sport=running",
      match: [
        {
          type: "query",
          param: "sport",
          value: "running",
          pathPrefix: "/reviews",
        },
        { type: "exact", value: "/reviews" },
      ],
      priority: 35,
      requiresContent: "reviews",
    },
    {
      id: "guides",
      label: "Guides",
      href: "/guides?sport=running",
      match: [
        {
          type: "query",
          param: "sport",
          value: "running",
          pathPrefix: "/guides",
        },
        { type: "exact", value: "/guides" },
      ],
      priority: 40,
      requiresContent: "guides",
    },
    {
      id: "compare",
      label: "Compare",
      href: "/compare?sport=running&category=running-shoes",
      match: [
        {
          type: "query",
          param: "sport",
          value: "running",
          pathPrefix: "/compare",
        },
      ],
      priority: 45,
    },
    {
      id: "finders",
      label: "Finders",
      href: "/tools?sport=running&type=finder",
      match: {
        type: "query",
        param: "type",
        value: "finder",
        pathPrefix: "/tools",
      },
      priority: 50,
      requiresContent: "tools",
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools?sport=running",
      match: {
        type: "query",
        param: "sport",
        value: "running",
        pathPrefix: "/tools",
      },
      priority: 55,
      requiresContent: "tools",
    },
    {
      id: "gear-sets",
      label: "Gear Sets",
      href: "/setups?sport=running",
      match: {
        type: "query",
        param: "sport",
        value: "running",
        pathPrefix: "/setups",
      },
      priority: 60,
      requiresContent: "setups",
    },
    // Category deep-links — More / mobile scroll
    {
      id: "watches",
      label: "Watches",
      href: "/running/watches",
      match: { type: "prefix", value: "/running/watches" },
      priority: 70,
    },
    {
      id: "heart-rate",
      label: "Heart Rate",
      href: "/running/heart-rate-monitors",
      match: { type: "prefix", value: "/running/heart-rate-monitors" },
      priority: 72,
    },
    {
      id: "hydration",
      label: "Hydration",
      href: "/running/hydration",
      match: { type: "prefix", value: "/running/hydration" },
      priority: 74,
    },
    {
      id: "packs",
      label: "Packs",
      href: "/running/packs",
      match: { type: "prefix", value: "/running/packs" },
      priority: 76,
    },
    {
      id: "clothing",
      label: "Clothing",
      href: "/running/clothing",
      match: { type: "prefix", value: "/running/clothing" },
      priority: 78,
    },
    {
      id: "gear",
      label: "All Gear",
      href: "/running/gear",
      match: { type: "exact", value: "/running/gear" },
      priority: 80,
    },
  ],
};

/** Shoes domain — owns /running/shoes*; primary Shoes stays active */
export const SHOES_CONTEXTUAL_NAV: ContextualNavConfig = {
  contextId: "shoes",
  parentNavKey: "shoes",
  label: "Shoes",
  maxVisibleDesktop: 8,
  items: [
    {
      id: "running-shoes",
      label: "Running Shoes",
      href: "/running/shoes",
      match: [
        { type: "exact", value: "/running/shoes" },
        { type: "prefix", value: "/running/shoes" },
      ],
      priority: 10,
    },
    {
      id: "training-shoes",
      label: "Training Shoes",
      href: "/fitness/training-shoes",
      match: { type: "prefix", value: "/fitness/training-shoes" },
      priority: 20,
    },
    {
      id: "best",
      label: "Best",
      href: "/best?domain=shoes",
      match: [
        { type: "query", param: "domain", value: "shoes", pathPrefix: "/best" },
      ],
      priority: 30,
      requiresContent: "best",
    },
    {
      id: "reviews",
      label: "Reviews",
      href: "/reviews?domain=shoes",
      match: [
        {
          type: "query",
          param: "domain",
          value: "shoes",
          pathPrefix: "/reviews",
        },
      ],
      priority: 40,
      requiresContent: "reviews",
    },
    {
      id: "guides",
      label: "Guides",
      href: "/guides?domain=shoes",
      match: [
        {
          type: "query",
          param: "domain",
          value: "shoes",
          pathPrefix: "/guides",
        },
      ],
      priority: 50,
      requiresContent: "guides",
    },
    {
      id: "compare",
      label: "Compare",
      href: "/compare?domain=shoes&category=running-shoes",
      match: [
        {
          type: "query",
          param: "domain",
          value: "shoes",
          pathPrefix: "/compare",
        },
        {
          type: "query",
          param: "category",
          value: "running-shoes",
          pathPrefix: "/compare",
        },
      ],
      priority: 60,
    },
    {
      id: "finders",
      label: "Finders",
      href: "/tools?domain=shoes&type=finder",
      match: [
        {
          type: "query",
          param: "domain",
          value: "shoes",
          pathPrefix: "/tools",
        },
      ],
      priority: 70,
      requiresContent: "tools",
    },
    {
      id: "brands",
      label: "Brands",
      href: "/brands?domain=shoes",
      match: {
        type: "query",
        param: "domain",
        value: "shoes",
        pathPrefix: "/brands",
      },
      priority: 80,
    },
  ],
};

export const RACKET_CONTEXTUAL_NAV: ContextualNavConfig = {
  contextId: "racket",
  parentNavKey: "racket",
  label: "Racket Sports",
  maxVisibleDesktop: 8,
  items: [
    {
      id: "overview",
      label: "Overview",
      href: "/racket",
      match: { type: "exact", value: "/racket" },
      priority: 10,
    },
    {
      id: "padel",
      label: "Padel",
      href: "/padel",
      match: { type: "prefix", value: "/padel" },
      priority: 20,
    },
    {
      id: "tennis",
      label: "Tennis",
      href: "/tennis",
      match: { type: "prefix", value: "/tennis" },
      priority: 30,
    },
    {
      id: "best",
      label: "Best",
      href: "/best?sport=padel",
      match: [
        { type: "query", param: "sport", value: "padel", pathPrefix: "/best" },
        { type: "query", param: "sport", value: "tennis", pathPrefix: "/best" },
        { type: "exact", value: "/best" },
      ],
      priority: 40,
      requiresContent: "best",
    },
    {
      id: "reviews",
      label: "Reviews",
      href: "/reviews?sport=padel",
      match: [
        {
          type: "query",
          param: "sport",
          value: "padel",
          pathPrefix: "/reviews",
        },
        { type: "exact", value: "/reviews" },
      ],
      priority: 50,
      requiresContent: "reviews",
    },
    {
      id: "guides",
      label: "Guides",
      href: "/guides?sport=padel",
      match: [
        {
          type: "query",
          param: "sport",
          value: "padel",
          pathPrefix: "/guides",
        },
        { type: "exact", value: "/guides" },
      ],
      priority: 60,
      requiresContent: "guides",
    },
    {
      id: "compare",
      label: "Compare",
      href: "/compare?category=padel-rackets",
      match: {
        type: "query",
        param: "category",
        value: "padel-rackets",
        pathPrefix: "/compare",
      },
      priority: 70,
    },
    {
      id: "finders",
      label: "Finders",
      href: "/tools?sport=padel&type=finder",
      match: {
        type: "query",
        param: "type",
        value: "finder",
        pathPrefix: "/tools",
      },
      priority: 80,
      requiresContent: "tools",
    },
    {
      id: "brands",
      label: "Brands",
      href: "/brands?sport=padel",
      match: {
        type: "query",
        param: "sport",
        value: "padel",
        pathPrefix: "/brands",
      },
      priority: 90,
    },
  ],
};

export const FITNESS_CONTEXTUAL_NAV: ContextualNavConfig = {
  contextId: "fitness",
  parentNavKey: "fitness",
  label: "Fitness",
  maxVisibleDesktop: 7,
  items: [
    {
      id: "overview",
      label: "Overview",
      href: "/fitness",
      match: { type: "exact", value: "/fitness" },
      priority: 10,
    },
    {
      id: "gym-gear",
      label: "Gym Gear",
      href: "/fitness/power-racks",
      match: { type: "custom", id: "fitness-gym-gear" },
      priority: 20,
    },
    {
      id: "hyrox",
      label: "HYROX",
      href: "/fitness/hyrox",
      match: [
        { type: "prefix", value: "/fitness/hyrox" },
        { type: "prefix", value: "/hyrox" },
      ],
      priority: 30,
    },
    {
      id: "calisthenics",
      label: "Calisthenics",
      href: "/fitness/pull-up-bars",
      match: { type: "prefix", value: "/fitness/pull-up-bars" },
      priority: 40,
    },
    {
      id: "best",
      label: "Best",
      href: "/best?sport=fitness",
      match: [
        {
          type: "query",
          param: "sport",
          value: "fitness",
          pathPrefix: "/best",
        },
        { type: "exact", value: "/best" },
      ],
      priority: 50,
      requiresContent: "best",
    },
    {
      id: "reviews",
      label: "Reviews",
      href: "/reviews?sport=fitness",
      match: [
        {
          type: "query",
          param: "sport",
          value: "fitness",
          pathPrefix: "/reviews",
        },
        { type: "exact", value: "/reviews" },
      ],
      priority: 60,
      requiresContent: "reviews",
    },
    {
      id: "guides",
      label: "Guides",
      href: "/guides?sport=fitness",
      match: [
        {
          type: "query",
          param: "sport",
          value: "fitness",
          pathPrefix: "/guides",
        },
        { type: "exact", value: "/guides" },
      ],
      priority: 70,
      requiresContent: "guides",
    },
    {
      id: "finders",
      label: "Finders",
      href: "/tools?sport=fitness&type=finder",
      match: {
        type: "query",
        param: "type",
        value: "finder",
        pathPrefix: "/tools",
      },
      priority: 80,
      requiresContent: "tools",
    },
    {
      id: "builders",
      label: "Builders",
      href: "/tools?sport=fitness&type=builder",
      match: {
        type: "query",
        param: "type",
        value: "builder",
        pathPrefix: "/tools",
      },
      priority: 85,
      requiresContent: "tools",
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools?sport=fitness",
      match: {
        type: "query",
        param: "sport",
        value: "fitness",
        pathPrefix: "/tools",
      },
      priority: 90,
      requiresContent: "tools",
    },
  ],
};

/** Outdoors maps to live watersports shell in current IA */
export const OUTDOORS_CONTEXTUAL_NAV: ContextualNavConfig = {
  contextId: "outdoors",
  parentNavKey: "outdoors",
  label: "Outdoors",
  maxVisibleDesktop: 6,
  items: [
    {
      id: "overview",
      label: "Overview",
      href: "/watersports",
      match: { type: "exact", value: "/watersports" },
      priority: 10,
    },
    {
      id: "best",
      label: "Best",
      href: "/best",
      match: { type: "exact", value: "/best" },
      priority: 40,
      requiresContent: "best",
    },
    {
      id: "guides",
      label: "Guides",
      href: "/guides",
      match: { type: "exact", value: "/guides" },
      priority: 50,
      requiresContent: "guides",
    },
    {
      id: "tools",
      label: "Tools",
      href: "/tools",
      match: { type: "exact", value: "/tools" },
      priority: 70,
      requiresContent: "tools",
    },
  ],
};

export const TEAM_CONTEXTUAL_NAV: ContextualNavConfig = {
  contextId: "team",
  parentNavKey: "team",
  label: "Team Sports",
  maxVisibleDesktop: 5,
  items: [
    {
      id: "overview",
      label: "Overview",
      href: "/indoor",
      match: { type: "exact", value: "/indoor" },
      priority: 10,
    },
    {
      id: "best",
      label: "Best",
      href: "/best",
      match: { type: "exact", value: "/best" },
      priority: 30,
      requiresContent: "best",
    },
    {
      id: "guides",
      label: "Guides",
      href: "/guides",
      match: { type: "exact", value: "/guides" },
      priority: 40,
      requiresContent: "guides",
    },
  ],
};

export const CONTEXTUAL_NAV_BY_ID: Record<
  Exclude<SecondaryContextKey, null>,
  ContextualNavConfig
> = {
  shoes: SHOES_CONTEXTUAL_NAV,
  running: RUNNING_CONTEXTUAL_NAV,
  racket: RACKET_CONTEXTUAL_NAV,
  fitness: FITNESS_CONTEXTUAL_NAV,
  outdoors: OUTDOORS_CONTEXTUAL_NAV,
  team: TEAM_CONTEXTUAL_NAV,
};

const FITNESS_GYM_PREFIXES = [
  "/fitness/power-racks",
  "/fitness/adjustable-dumbbells",
  "/fitness/weight-benches",
  "/fitness/barbells",
  "/fitness/weight-plates",
  "/fitness/kettlebells",
  "/fitness/rowing-machines",
  "/fitness/air-bikes",
  "/fitness/treadmills",
  "/fitness/ski-ergs",
  "/fitness/gym-flooring",
  "/fitness/gym-storage",
  "/fitness/lifting-accessories",
  "/fitness/functional-fitness",
  "/fitness/training-shoes",
];

const DISCIPLINE_HUB_KEYS = new Set([
  "running/road",
  "running/trail",
  "running/racing",
]);

export interface ResolveNavigationInput {
  pathname: string;
  searchParams?: URLSearchParams | Record<string, string | undefined | null>;
  /** Precomputed content flags — avoid heavy queries in the header */
  contentFlags?: Partial<
    Record<NonNullable<ContextualNavItem["requiresContent"]>, boolean>
  >;
}

function getSearchParam(
  searchParams: ResolveNavigationInput["searchParams"],
  key: string,
): string | undefined {
  if (!searchParams) return undefined;
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined;
  }
  const raw = searchParams[key];
  return raw == null || raw === "" ? undefined : raw;
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchItem(
  item: ContextualNavItem,
  pathname: string,
  searchParams: ResolveNavigationInput["searchParams"],
): boolean {
  const matchers = Array.isArray(item.match) ? item.match : [item.match];
  return matchers.some((m) => {
    switch (m.type) {
      case "exact":
        return pathname === m.value;
      case "prefix":
        return pathMatchesPrefix(pathname, m.value);
      case "query": {
        if (m.pathPrefix && !pathMatchesPrefix(pathname, m.pathPrefix)) {
          return false;
        }
        // Hub indexes without query: only match exact path when no competing sport context
        const param = getSearchParam(searchParams, m.param);
        if (param === m.value) return true;
        // Soft: plain /best while in context can highlight Best if path is exact hub
        if (
          !param &&
          (pathname === m.pathPrefix || pathname === `${m.pathPrefix}/`)
        ) {
          return true;
        }
        return false;
      }
      case "custom":
        if (m.id === "fitness-gym-gear") {
          return FITNESS_GYM_PREFIXES.some((p) => pathMatchesPrefix(pathname, p));
        }
        return false;
      default:
        return false;
    }
  });
}

function hrefQueryScore(
  href: string,
  searchParams: ResolveNavigationInput["searchParams"],
): number {
  const qIndex = href.indexOf("?");
  if (qIndex < 0) return 0;
  const params = new URLSearchParams(href.slice(qIndex + 1));
  let score = 0;
  let matched = 0;
  for (const [key, value] of params.entries()) {
    if (getSearchParam(searchParams, key) === value) {
      matched += 1;
      score += 25;
    } else {
      score -= 15;
    }
  }
  // Prefer denser query matches (Finders over Tools when type=finder)
  score += matched * 10;
  return score;
}

/**
 * Prefer the most specific active item when multiple match
 * (e.g. shoes Overview exact vs Running Shoes prefix).
 */
function pickActiveItemId(
  items: ContextualNavItem[],
  pathname: string,
  searchParams: ResolveNavigationInput["searchParams"],
): string | undefined {
  const hits = items.filter((item) => matchItem(item, pathname, searchParams));
  if (hits.length === 0) return undefined;

  // Prefer query-aware / exact over broad prefix when both match
  const scored = hits.map((item) => {
    const matchers = Array.isArray(item.match) ? item.match : [item.match];
    let score = 0;
    for (const m of matchers) {
      if (m.type === "exact" && pathname === m.value) score += 100;
      if (m.type === "query" && getSearchParam(searchParams, m.param) === m.value)
        score += 80;
      if (m.type === "prefix") score += 40;
      if (m.type === "custom") score += 50;
    }
    score += hrefQueryScore(item.href, searchParams);
    // Prefer lower priority (more primary) slightly on ties
    score -= item.priority / 1000;
    return { id: item.id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.id;
}

function resolveLocalNavMode(pathname: string): LocalNavMode {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/products/")) return "product";
  if (/^\/brands\/[^/]+/.test(pathname)) return "brand";
  if (/^\/reviews\/[^/]+/.test(pathname)) return "review";
  if (/^\/best\/[^/]+/.test(pathname)) return "detail";
  if (/^\/guides\/[^/]+/.test(pathname)) return "detail";
  if (/^\/setups\/[^/]+/.test(pathname)) return "detail";
  if (/^\/tools\/[^/]+/.test(pathname)) return "tool";
  if (/^\/compare\/[^/]+/.test(pathname)) return "compare";
  if (/^\/compare\/[^/]+/.test(pathname)) return "compare";
  if (pathname === "/compare") return "compare";
  // Tools / gear hubs are discovery IA — no sport secondary rail
  if (pathname === "/tools") return "hub-suppress";
  if (pathname === "/gear" || pathname.startsWith("/gear/")) return "hub-suppress";

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const key = `${parts[0]}/${parts[1]}`;
    if (DISCIPLINE_HUB_KEYS.has(key)) return "discipline";
  }

  return "none";
}

function contextFromPathname(
  pathname: string,
  searchParams: ResolveNavigationInput["searchParams"],
): SecondaryContextKey {
  const sportQ = getSearchParam(searchParams, "sport");
  const domainQ = getSearchParam(searchParams, "domain");

  // Shoes domain hubs — must win before sport=running remaps to Running
  if (
    domainQ === "shoes" &&
    (pathname === "/best" ||
      pathname === "/reviews" ||
      pathname === "/guides" ||
      pathname === "/brands" ||
      pathname === "/setups" ||
      pathname === "/tools" ||
      pathname === "/compare")
  ) {
    return "shoes";
  }

  // Hub pages with sport query
  if (
    pathname === "/best" ||
    pathname === "/reviews" ||
    pathname === "/guides" ||
    pathname === "/setups" ||
    pathname === "/brands" ||
    pathname === "/tools" ||
    pathname === "/compare"
  ) {
    if (sportQ === "running") return "running";
    if (sportQ === "fitness" || sportQ === "hyrox") return "fitness";
    if (sportQ === "padel" || sportQ === "tennis" || sportQ === "racket")
      return "racket";
  }

  const categoryQ = getSearchParam(searchParams, "category");
  if (pathname === "/compare" || pathname.startsWith("/compare")) {
    if (categoryQ === "running-shoes") return "shoes";
    if (categoryQ === "padel-rackets" || categoryQ?.includes("padel"))
      return "racket";
    if (categoryQ?.includes("training")) return "fitness";
  }

  // Shoes owns /running/shoes* (and training shoes under fitness for shoes domain)
  if (pathMatchesPrefix(pathname, "/running/shoes")) return "shoes";
  if (pathMatchesPrefix(pathname, "/fitness/training-shoes")) return "shoes";

  if (
    pathMatchesPrefix(pathname, "/running") ||
    (pathname === "/best" && sportQ === "running")
  ) {
    return "running";
  }

  if (
    pathMatchesPrefix(pathname, "/racket") ||
    pathMatchesPrefix(pathname, "/padel") ||
    pathMatchesPrefix(pathname, "/tennis") ||
    pathMatchesPrefix(pathname, "/pickleball") ||
    pathMatchesPrefix(pathname, "/badminton") ||
    pathMatchesPrefix(pathname, "/squash")
  ) {
    return "racket";
  }

  if (
    pathMatchesPrefix(pathname, "/fitness") ||
    pathMatchesPrefix(pathname, "/hyrox") ||
    pathMatchesPrefix(pathname, "/calisthenics")
  ) {
    return "fitness";
  }

  if (pathMatchesPrefix(pathname, "/watersports")) return "outdoors";
  if (pathMatchesPrefix(pathname, "/indoor")) return "team";

  return null;
}

function filterItemsByContent(
  items: ContextualNavItem[],
  contentFlags: ResolveNavigationInput["contentFlags"],
): ContextualNavItem[] {
  return items.filter((item) => {
    if (!item.requiresContent) return true;
    // Default allow when flags omitted (hubs exist as routes)
    if (!contentFlags) return true;
    const flag = contentFlags[item.requiresContent];
    return flag !== false;
  });
}

function splitOverflow(
  items: ContextualNavItem[],
  maxVisible: number,
): { visible: ContextualNavItem[]; overflow: ContextualNavItem[] } {
  const sorted = [...items].sort((a, b) => a.priority - b.priority);
  if (sorted.length <= maxVisible) {
    return { visible: sorted, overflow: [] };
  }
  return {
    visible: sorted.slice(0, maxVisible),
    overflow: sorted.slice(maxVisible),
  };
}

/**
 * Resolve navigation context from the current URL.
 * Pure — safe for server or client.
 */
export function resolveNavigationContext(
  input: ResolveNavigationInput,
): ResolvedNavigationContext {
  const pathname = input.pathname || "/";
  const searchParams = input.searchParams;
  let localNavMode = resolveLocalNavMode(pathname);
  const secondaryContextKey = contextFromPathname(pathname, searchParams);

  // Scoped tools hubs keep the sport/domain secondary rail (Finders under Shoes/Running)
  if (
    localNavMode === "hub-suppress" &&
    pathname === "/tools" &&
    (getSearchParam(searchParams, "domain") ||
      getSearchParam(searchParams, "sport"))
  ) {
    localNavMode = "none";
  }

  // Compare builder hub keeps the domain/sport rail when context is known
  if (
    localNavMode === "compare" &&
    pathname === "/compare" &&
    secondaryContextKey
  ) {
    localNavMode = "none";
  }

  const suppressContextual =
    localNavMode !== "none" || secondaryContextKey === null;

  const primaryNavKey: PrimaryNavKey = secondaryContextKey;

  if (suppressContextual || !secondaryContextKey) {
    return {
      primaryNavKey:
        secondaryContextKey ??
        (localNavMode === "product" || localNavMode === "review"
          ? null
          : secondaryContextKey),
      secondaryContextKey,
      localNavMode,
      showContextualNav: false,
      visibleItems: [],
      overflowItems: [],
    };
  }

  const config = CONTEXTUAL_NAV_BY_ID[secondaryContextKey];
  const items = filterItemsByContent(config.items, input.contentFlags);
  const activeItemId = pickActiveItemId(items, pathname, searchParams);
  const { visible, overflow } = splitOverflow(
    items,
    config.maxVisibleDesktop ?? DESKTOP_MAX_DEFAULT,
  );

  // Keep active item visible (swap from overflow if needed)
  let visibleItems = visible;
  let overflowItems = overflow;
  if (activeItemId && overflow.some((i) => i.id === activeItemId)) {
    const active = overflow.find((i) => i.id === activeItemId)!;
    const demoted = visible[visible.length - 1];
    visibleItems = [...visible.slice(0, -1), active].sort(
      (a, b) => a.priority - b.priority,
    );
    overflowItems = [
      demoted,
      ...overflow.filter((i) => i.id !== activeItemId),
    ].filter(Boolean) as ContextualNavItem[];
  }

  return {
    primaryNavKey,
    secondaryContextKey,
    localNavMode,
    showContextualNav: true,
    config,
    activeItemId,
    visibleItems,
    overflowItems,
  };
}

/** Map primary nav key → PRIMARY_NAV href for active matching */
export function primaryNavHrefForKey(key: PrimaryNavKey): string | null {
  switch (key) {
    case "shoes":
      return "/running/shoes";
    case "racket":
      return "/racket";
    case "running":
      return "/running";
    case "fitness":
      return "/fitness";
    case "outdoors":
      return "/watersports";
    case "team":
      return "/indoor";
    default:
      return null;
  }
}
