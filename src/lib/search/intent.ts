export type SearchIntent =
  | "product"
  | "brand"
  | "category"
  | "comparison"
  | "guide"
  | "tool"
  | "recommendation"
  | "general";

/** Deterministic heuristics — no generative AI required. */
export function detectSearchIntent(query: string): SearchIntent {
  const q = query.toLowerCase().trim();
  if (!q) return "general";
  if (/\bvs\.?\b|\bversus\b/.test(q)) return "comparison";
  if (/\bfinder\b|\bwhich .+ should i buy\b|\bwhat .+ should i buy\b/.test(q))
    return "tool";
  if (/\breview\b/.test(q)) return "product";
  if (/\bbest\b/.test(q)) return "recommendation";
  if (/\bhow to (choose|pick|buy)\b|\bguide\b/.test(q)) return "guide";
  if (/^(asics|nike|garmin|brooks|hoka|saucony|coros|rogue|bullpadel|adidas)\b/.test(q) && q.split(/\s+/).length <= 2)
    return "brand";
  return "general";
}

/** Group display order by intent for overview mode. */
export function groupOrderForIntent(
  intent: SearchIntent,
): Array<
  | "product"
  | "category"
  | "brand"
  | "guide"
  | "comparison"
  | "tool"
  | "review"
  | "setup"
> {
  switch (intent) {
    case "brand":
      return ["brand", "product", "guide", "comparison", "tool", "category", "review", "setup"];
    case "comparison":
      return ["comparison", "product", "guide", "brand", "tool", "category", "review", "setup"];
    case "tool":
      return ["tool", "guide", "product", "category", "brand", "comparison", "review", "setup"];
    case "guide":
    case "recommendation":
      return ["guide", "product", "tool", "category", "brand", "comparison", "review", "setup"];
    default:
      return ["product", "category", "brand", "guide", "comparison", "tool", "review", "setup"];
  }
}

export function relatedSearchesForQuery(query: string): {
  label: string;
  href: string;
}[] {
  const q = query.toLowerCase();
  if (q.includes("running shoe") || q.includes("trainers") || q === "shoes") {
    return [
      {
        label: "Women's running shoes",
        href: "/running/shoes?gender=women",
      },
      {
        label: "Men's running shoes",
        href: "/running/shoes?gender=men",
      },
      { label: "Carbon-plated shoes", href: "/search?q=carbon+plate+shoes" },
      { label: "Trail running shoes", href: "/search?q=trail+running+shoes" },
      { label: "Daily trainers", href: "/search?q=daily+trainers" },
      { label: "Stability shoes", href: "/search?q=stability+running+shoes" },
      { label: "Wide running shoes", href: "/search?q=wide+running+shoes" },
    ];
  }
  if (
    q.includes("women") &&
    (q.includes("shoe") || q.includes("trainer") || q.includes("running"))
  ) {
    return [
      {
        label: "Women's running shoes",
        href: "/running/shoes?gender=women",
      },
      {
        label: "Shoe Finder (Women's sizing)",
        href: "/tools/running-shoe-finder",
      },
      { label: "Best running shoes", href: "/best/running-shoes" },
      { label: "Men's running shoes", href: "/running/shoes?gender=men" },
    ];
  }
  if (q.includes("padel")) {
    return [
      { label: "Padel rackets", href: "/search?q=padel+rackets" },
      { label: "Padel shoes", href: "/search?q=padel+shoes" },
      { label: "Padel racket finder", href: "/tools/padel-racket-finder" },
    ];
  }
  if (q.includes("watch") || q.includes("garmin") || q.includes("coros")) {
    return [
      { label: "GPS watches", href: "/search?q=gps+watches" },
      { label: "Heart rate monitors", href: "/search?q=heart+rate+monitor" },
      { label: "Garmin", href: "/search?q=garmin" },
    ];
  }
  return [
    { label: "Running shoes", href: "/search?q=running+shoes" },
    {
      label: "Women's running shoes",
      href: "/running/shoes?gender=women",
    },
    { label: "Running Shoe Finder", href: "/tools/running-shoe-finder" },
    { label: "Best running shoes", href: "/search?q=best+running+shoes" },
    { label: "Browse gear", href: "/gear" },
  ];
}

export function contextualFinderForQuery(query: string): {
  label: string;
  href: string;
} {
  const q = query.toLowerCase();
  if (q.includes("padel"))
    return { label: "Try Padel Racket Finder", href: "/tools/padel-racket-finder" };
  if (q.includes("power rack") || q.includes("gym rack"))
    return { label: "Try Power Rack Finder", href: "/tools/power-rack-finder" };
  if (q.includes("tennis"))
    return { label: "Try Tennis Racket Finder", href: "/tools/tennis-racket-finder" };
  if (q.includes("hyrox"))
    return { label: "Try HYROX Shoe Finder", href: "/tools/hyrox-shoe-finder" };
  return {
    label: "Try Running Shoe Finder",
    href: "/tools/running-shoe-finder",
  };
}
