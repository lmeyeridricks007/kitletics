import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { Tool } from "@/domain/tools/types";
import type { Sport } from "@/domain/sports/types";
import { getTools, getSportById, getSportBySlug } from "@/repositories";
import { getToolHref, sortToolsByHubPriority } from "@/lib/tools/href";
import {
  TOOLS_HUB_ENRICHMENT,
  TOOLS_HUB_HERO,
} from "@/lib/tools/tools-hub-config";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";

export interface ToolsHubCard {
  tool: Tool;
  href: string;
  title: string;
  description: string;
  estimatedTimeMinutes?: number;
  imageSrc?: string;
  icon: string;
  sportLabel?: string;
}

export interface ToolsHubSportGroup {
  sport: Sport;
  toolCount: number;
  href: string;
}

export interface ToolsHubRecommendationOption {
  label: string;
  href: string;
  description?: string;
}

export interface ToolsHubData {
  breadcrumbs: { label: string; href?: string }[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    heroImageSrc?: string;
    trust: readonly { title: string; detail: string }[];
  };
  recommendation: {
    title: string;
    body: string;
    ctaLabel: string;
    /** When false, open decision router instead of a single tool */
    hasGenericFinder: boolean;
    primaryHref?: string;
    options: ToolsHubRecommendationOption[];
  };
  finders: ToolsHubCard[];
  compareTools: ToolsHubCard[];
  planBuildTools: ToolsHubCard[];
  sports: ToolsHubSportGroup[];
  comingSoon: ToolsHubCard[];
  filters: {
    sportSlug?: string;
    type?: string;
    domain?: "shoes";
  };
  viewAll: {
    finders?: string;
    compare?: string;
    plan?: string;
  };
  howWeCompare: {
    title: string;
    body: string;
    methodologyHref: string;
  };
}

const SHOE_TOOL_SLUGS = new Set([
  "running-shoe-finder",
  "shoe-rotation-planner",
]);

function enrichTool(tool: Tool): Tool {
  const meta = TOOLS_HUB_ENRICHMENT[tool.slug];
  if (!meta) return tool;
  return {
    ...tool,
    estimatedTimeMinutes:
      tool.estimatedTimeMinutes ?? meta.estimatedTimeMinutes,
    featured: tool.featured ?? meta.featured,
    priority: tool.priority ?? meta.priority,
    hubImageSrc: tool.hubImageSrc ?? meta.hubImageSrc,
    shortDescription: tool.shortDescription ?? meta.shortDescription,
  };
}

function toCard(tool: Tool): ToolsHubCard {
  const sport = tool.sportIds[0] ? getSportById(tool.sportIds[0]) : undefined;
  return {
    tool,
    href: getToolHref(tool),
    title: tool.name,
    description: tool.shortDescription ?? tool.description,
    estimatedTimeMinutes: tool.estimatedTimeMinutes,
    imageSrc: tool.hubImageSrc,
    icon: tool.icon,
    sportLabel: sport?.name,
  };
}

function sectionFor(tool: Tool): "find" | "plan" | "compare" | null {
  if (!tool.available) return null;
  const forced = TOOLS_HUB_ENRICHMENT[tool.slug]?.hubSection;
  if (forced) return forced;
  if (tool.type === "finder") return "find";
  if (tool.type === "comparison") return "compare";
  if (
    tool.type === "planner" ||
    tool.type === "calculator" ||
    tool.type === "builder"
  ) {
    return "plan";
  }
  return "plan";
}

export function getToolsHubData(opts?: {
  sport?: string;
  type?: string;
  domain?: "shoes";
  preview?: boolean;
} & PublishResolverOptions): ToolsHubData {
  const publishOpts: PublishResolverOptions = {
    isDev: opts?.preview ? true : opts?.isDev,
    now: opts?.now,
  };
  const shoesDomain = opts?.domain === "shoes";

  let tools = getTools(publishOpts)
    .map(enrichTool)
    .filter((t) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "tool", entity: t }, publishOpts),
      ),
    );

  if (opts?.type) {
    tools = tools.filter((t) => t.type === opts.type);
  }
  if (shoesDomain) {
    tools = tools.filter(
      (t) =>
        SHOE_TOOL_SLUGS.has(t.slug) ||
        /shoe|rotation/i.test(`${t.slug} ${t.name}`),
    );
  } else if (opts?.sport) {
    const sport = getSportBySlug(opts.sport);
    if (sport) {
      tools = tools.filter((t) => t.sportIds.includes(sport.id));
    }
  }

  const active = sortToolsByHubPriority(tools.filter((t) => t.available));
  const comingSoon = sortToolsByHubPriority(
    tools.filter((t) => !t.available && t.status === "published"),
  );

  const finders = active
    .filter((t) => sectionFor(t) === "find")
    .map(toCard);
  const compareTools = active
    .filter((t) => sectionFor(t) === "compare")
    .map(toCard);
  const planBuildTools = active
    .filter((t) => sectionFor(t) === "plan")
    .map(toCard);

  // Deduplicate: a tool appears in only one primary section
  const seen = new Set<string>();
  const dedupe = (cards: ToolsHubCard[]) =>
    cards.filter((c) => {
      if (seen.has(c.tool.id)) return false;
      seen.add(c.tool.id);
      return true;
    });

  const isFiltered = Boolean(opts?.sport || opts?.type || shoesDomain);
  const findersDeduped = isFiltered
    ? dedupe(finders)
    : dedupe(finders).slice(0, 8);
  const compareDeduped = dedupe(compareTools);
  const planDeduped = isFiltered
    ? dedupe(planBuildTools)
    : dedupe(planBuildTools).slice(0, 6);

  // Sport groups from all available tools (unfiltered catalog for hub overview)
  const allAvailable = getTools(publishOpts)
    .map(enrichTool)
    .filter((t) => t.available)
    .filter((t) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "tool", entity: t }, publishOpts),
      ),
    );
  const bySport = new Map<string, number>();
  for (const tool of allAvailable) {
    for (const sportId of tool.sportIds) {
      bySport.set(sportId, (bySport.get(sportId) ?? 0) + 1);
    }
  }

  const sports: ToolsHubSportGroup[] = shoesDomain
    ? []
    : [...bySport.entries()]
        .map(([sportId, toolCount]) => {
          const sport = getSportById(sportId);
          if (!sport) return null;
          return {
            sport,
            toolCount,
            href: `/tools?sport=${encodeURIComponent(sport.slug)}`,
          };
        })
        .filter((x): x is ToolsHubSportGroup => Boolean(x))
        .sort(
          (a, b) =>
            b.toolCount - a.toolCount ||
            a.sport.name.localeCompare(b.sport.name),
        );

  const recommendationOptions: ToolsHubRecommendationOption[] = findersDeduped
    .slice(0, 8)
    .map((c) => ({
      label: c.title,
      href: c.href,
      description: c.sportLabel,
    }));

  // Prefer shoe finder as soft default entry when present
  const shoeFinder = findersDeduped.find(
    (c) => c.tool.slug === "running-shoe-finder",
  );

  const shoesHero = shoesDomain
    ? {
        ...TOOLS_HUB_HERO,
        eyebrow: "Shoe finders",
        titleLine1: "Find the right shoe.",
        titleLine2: "Faster decisions.",
        description:
          "Shoe finders and planners that match footwear to how you run — not a medical gait exam.",
      }
    : TOOLS_HUB_HERO;

  return {
    breadcrumbs: shoesDomain
      ? [
          { label: "Home", href: "/" },
          { label: "Shoes", href: "/running/shoes" },
          { label: "Finders" },
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Tools" },
        ],
    hero: shoesHero,
    recommendation: {
      title: shoesDomain ? "Start with the Shoe Finder" : "Not sure where to start?",
      body: shoesDomain
        ? "Answer a few quick questions about how you run and we’ll shortlist shoes that fit the job."
        : "Answer a few quick questions and we'll guide you to the best gear for your goals.",
      ctaLabel: shoesDomain ? "Open Shoe Finder" : "Start recommendation",
      hasGenericFinder: false,
      primaryHref: shoeFinder?.href,
      options: recommendationOptions,
    },
    finders: findersDeduped,
    compareTools: compareDeduped,
    planBuildTools: planDeduped,
    sports,
    comingSoon: comingSoon.map(toCard),
    filters: {
      sportSlug: shoesDomain ? undefined : opts?.sport,
      type: opts?.type,
      domain: shoesDomain ? "shoes" : undefined,
    },
    viewAll: {
      finders: shoesDomain
        ? "/tools?domain=shoes&type=finder"
        : "/tools?type=finder",
      compare: shoesDomain
        ? "/compare?category=running-shoes"
        : "/compare",
      plan: shoesDomain
        ? "/tools?domain=shoes&type=planner"
        : "/tools?type=calculator",
    },
    howWeCompare: {
      title: "How we compare",
      body: "We compare structured specifications, recommendation criteria, evidence and current prices to highlight meaningful differences — not affiliate payouts.",
      methodologyHref: "/guides/how-to-choose-running-shoes",
    },
  };
}
