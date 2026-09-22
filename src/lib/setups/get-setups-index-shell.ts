import { getGearSetups, getSportById } from "@/repositories";
import type {
  SetupsIndexCard,
  SetupsIndexShellData,
} from "@/lib/setups/setups-index-shared";

export type {
  SetupsIndexCard,
  SetupsIndexShellData,
} from "@/lib/setups/setups-index-shared";

export function getSetupsIndexShellData(): SetupsIndexShellData {
  const cards: SetupsIndexCard[] = getGearSetups().map((setup) => {
    const sport = getSportById(setup.sportId);
    return {
      id: setup.id,
      slug: setup.slug,
      title: setup.title,
      description: (setup.description ?? "").slice(0, 240),
      sportId: setup.sportId,
      sportSlug: sport?.slug ?? null,
      sportName: sport?.name ?? "Other",
    };
  });
  return { cards };
}
