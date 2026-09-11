import { getTools, getGuides, getBestGuides } from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { getToolHref } from "@/lib/tools/href";

const opts = { isDev: false as const };

const tools = getTools(opts).filter((t) => t.available);
console.log(
  "TOOLS",
  tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    href: getToolHref(t),
    sports: t.sportIds,
  })),
);

const guides = getGuides(opts).filter((g) => isPubliclyVisible(g, opts));
const techKeywords =
  /drop|cushion|plate|carbon|foam|stack|gps|heart.rate|hrm|rotation|fit|width|stability|tempo|race|methodology|how to choose|vs /i;
const tech = guides.filter(
  (g) =>
    techKeywords.test(g.slug) ||
    techKeywords.test(g.title) ||
    techKeywords.test(g.summary ?? ""),
);
console.log(
  "TECH_GUIDES",
  tech.map((g) => ({ slug: g.slug, title: g.title })),
);
console.log("guides_total", guides.length, "techish", tech.length);

const best = getBestGuides(opts).filter((g) => isPubliclyVisible(g, opts));
console.log(
  "BEST",
  best.slice(0, 20).map((b) => b.slug),
  "n",
  best.length,
);
