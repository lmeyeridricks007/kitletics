import type { AudienceFit } from "@/lib/product/audience";

export interface RunningGearHubItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  categoryId?: string;
  productCount: number;
  /** True when this category supports genderFit filtering */
  genderFilterable: boolean;
}

export interface RunningGearHubGroup {
  id: string;
  label: string;
  items: RunningGearHubItem[];
}

export interface RunningGearHubData {
  title: string;
  description: string;
  backHref: string;
  gender?: AudienceFit;
  groups: RunningGearHubGroup[];
  ctas: {
    shoeFinder: { label: string; href: string };
    hydrationFinder: { label: string; href: string };
  };
}
