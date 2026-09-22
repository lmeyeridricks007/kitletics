export type SetupsIndexCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sportId: string;
  sportSlug: string | null;
  sportName: string;
};

export type SetupsIndexShellData = {
  cards: SetupsIndexCard[];
};
