import type { ProductFamily } from "@/domain/products/types";

/**
 * Light product families for running headphones wave 2.
 * OpenRun Pro 2 (gear-wave1) is listed under OpenRun for lineage.
 */
export const runningHeadphonesFamilies: ProductFamily[] = [
  {
    id: "fam-shokz-openrun",
    brandId: "brand-shokz",
    name: "OpenRun",
    slug: "shokz-openrun",
    categoryId: "cat-headphones",
    description: "Shokz bone-conduction OpenRun outdoor headphones.",
    productIds: ["prod-shokz-openrun-pro-2", "prod-shokz-openrun"],
  },
  {
    id: "fam-shokz-openfit",
    brandId: "brand-shokz",
    name: "OpenFit",
    slug: "shokz-openfit",
    categoryId: "cat-headphones",
    description: "Shokz open-ear air-conduction buds (hooks and clips).",
    productIds: ["prod-shokz-openfit-2", "prod-shokz-opendots-one"],
  },
  {
    id: "fam-sony-linkbuds",
    brandId: "brand-sony",
    name: "LinkBuds",
    slug: "sony-linkbuds",
    categoryId: "cat-headphones",
    description: "Sony LinkBuds open-ear and sport fit true wireless.",
    productIds: ["prod-sony-linkbuds-open", "prod-sony-linkbuds-fit"],
  },
  {
    id: "fam-jabra-elite",
    brandId: "brand-jabra",
    name: "Elite",
    slug: "jabra-elite",
    categoryId: "cat-headphones",
    description: "Jabra Elite sport and premium true wireless.",
    productIds: ["prod-jabra-elite-8-active", "prod-jabra-elite-10"],
  },
  {
    id: "fam-beats-powerbeats",
    brandId: "brand-beats",
    name: "Powerbeats",
    slug: "beats-powerbeats",
    categoryId: "cat-headphones",
    description: "Beats ear-hook and fin sport true wireless.",
    productIds: ["prod-beats-powerbeats-pro-2", "prod-beats-fit-pro"],
  },
  {
    id: "fam-soundcore-aerofit",
    brandId: "brand-soundcore",
    name: "AeroFit",
    slug: "soundcore-aerofit",
    categoryId: "cat-headphones",
    description: "soundcore open-ear AeroFit sport headphones.",
    productIds: ["prod-soundcore-aerofit-2"],
  },
  {
    id: "fam-soundcore-sport",
    brandId: "brand-soundcore",
    name: "Sport",
    slug: "soundcore-sport",
    categoryId: "cat-headphones",
    description: "soundcore sealed Sport earbuds.",
    productIds: ["prod-soundcore-sport-x20"],
  },
  {
    id: "fam-apple-airpods",
    brandId: "brand-apple",
    name: "AirPods",
    slug: "apple-airpods",
    categoryId: "cat-headphones",
    description: "Apple AirPods everyday and Pro ANC earbuds.",
    productIds: ["prod-apple-airpods-4", "prod-airpods-pro-2"],
  },
  {
    id: "fam-bose-ultra-open",
    brandId: "brand-bose",
    name: "Ultra Open",
    slug: "bose-ultra-open",
    categoryId: "cat-headphones",
    description: "Bose Ultra Open clip earbuds.",
    productIds: ["prod-bose-ultra-open"],
  },
];
