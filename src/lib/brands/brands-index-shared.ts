export type BrandsIndexRow = {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  country: string;
  description: string;
  href: string;
  productCount: number;
  shoeProductCount: number;
  sportSlugs: string[];
};

export type BrandsIndexSport = {
  slug: string;
  name: string;
};

export type BrandsIndexShellData = {
  brands: BrandsIndexRow[];
  sports: BrandsIndexSport[];
};
