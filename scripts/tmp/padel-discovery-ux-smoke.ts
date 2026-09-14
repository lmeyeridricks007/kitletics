import { listPadelCollections } from "@/lib/padel-collections";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { resolveNavigationContext } from "@/lib/navigation/contextual-nav";

const nav = resolveNavigationContext({ pathname: "/padel/balls" });
console.log(
  JSON.stringify(
    {
      collections: listPadelCollections().map((c) => c.slug),
      ballsFilters: getCategoryPageConfig("padel", "padel-balls")?.primaryFilterKeys,
      racketsFinder: getCategoryPageConfig("padel", "padel-rackets")?.finder?.toolSlug,
      navVisible: nav.visibleItems.map((i) => i.label),
      navOverflow: nav.overflowItems.map((i) => i.label),
    },
    null,
    2,
  ),
);
