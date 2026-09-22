import { runningSportHubConfig } from "@/lib/sport-hub/config";
import { withRunningGender } from "@/lib/running/gender-links";
import { parseAudienceParam } from "@/lib/product/audience";
import { getProductsByCategory } from "@/repositories/products";
import type {
  RunningGearHubData,
  RunningGearHubGroup,
} from "@/lib/running-gear/running-gear-hub-types";

export type {
  RunningGearHubData,
  RunningGearHubGroup,
  RunningGearHubItem,
} from "@/lib/running-gear/running-gear-hub-types";

/** Running categories with a filterable genderFit spec. */
const GENDER_FILTERABLE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-packs-vests",
  "cat-running-clothing",
  "cat-recovery-gear",
]);

/**
 * Running Gear discovery data — shop groups from the sport hub config
 * with live category product counts. Optional gender is applied to
 * fit-aware category links (shoes, clothing, packs, recovery).
 */
export function getRunningGearHubData(
  genderRaw?: string | null,
): RunningGearHubData {
  const gender = parseAudienceParam(genderRaw);

  const groups: RunningGearHubGroup[] =
    runningSportHubConfig.shopGroups?.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.items.map((item) => {
        const genderFilterable = item.categoryId
          ? GENDER_FILTERABLE_CATEGORY_IDS.has(item.categoryId)
          : false;
        const href =
          gender && genderFilterable
            ? withRunningGender(item.href, gender)
            : item.href;

        return {
          id: item.categoryId ?? item.label,
          label: item.label,
          href,
          icon: item.icon,
          categoryId: item.categoryId,
          genderFilterable,
          productCount: item.categoryId
            ? getProductsByCategory(item.categoryId).length
            : 0,
        };
      }),
    })) ?? [];

  const genderLabel =
    gender === "men"
      ? "Men's"
      : gender === "women"
        ? "Women's"
        : gender === "unisex"
          ? "Unisex"
          : undefined;

  return {
    title: genderLabel ? `${genderLabel} Running Gear` : "Running Gear",
    description: gender
      ? `Browse running equipment with ${genderLabel?.toLowerCase()} fit applied where categories support it — shoes, clothing, packs and recovery. Watches, hydration and fuel stay unfiltered.`
      : "Browse the full running equipment catalog by category — shoes, watches, hydration, apparel, fuel and recovery.",
    backHref: gender ? `/running?gender=${gender}` : "/running",
    gender,
    groups,
    ctas: {
      shoeFinder: {
        label: "Running Shoe Finder",
        href: "/tools/running-shoe-finder",
      },
      hydrationFinder: {
        label: "Hydration Finder",
        href: "/tools/running-hydration-finder",
      },
    },
  };
}
