import type { Product } from "@/domain/products/types";
import { applyMediaPublishGate } from "@/content/running/products/media-publish-gate";
import {
  toSoftProduct,
  toSoftProductPatch,
  toSoftEvidence,
  type SoftDraft,
} from "@/content/padel/soft-goods/build";
import { ballDrafts } from "@/content/padel/soft-goods/balls";
import { bagDrafts } from "@/content/padel/soft-goods/bags";
import { gripDrafts } from "@/content/padel/soft-goods/grips";
import { accessoryDrafts } from "@/content/padel/soft-goods/accessories";
import { marketWaveDrafts } from "@/content/padel/soft-goods/market-wave";
import { extraShoeDrafts } from "@/content/padel/soft-goods/extra-shoes";
import {
  padelShoeCatalogPatches,
  padelShoeCatalogEvidence,
  padelShoeWrongImageIds,
} from "@/content/padel/soft-goods/shoe-patches";

export { padelSoftGoodsBrands } from "@/content/padel/soft-goods/brands";
export { PADEL_SECONDARY_PRODUCT_MEDIA } from "@/content/padel/soft-goods/product-media";
export { padelSoftGoodsOffers } from "@/content/padel/soft-goods/offers";
export { padelCommerceWaveOffers } from "@/content/padel/soft-goods/commerce-wave-offers";
export { padelSoftGoodsAlternatives } from "@/content/padel/soft-goods/alternatives";
export {
  padelShoeCatalogPatches,
  padelShoeCatalogEvidence,
  padelShoeWrongImageIds,
};

export const padelSoftGoodsDrafts: SoftDraft[] = [
  ...ballDrafts(),
  ...bagDrafts(),
  ...gripDrafts(),
  ...accessoryDrafts(),
  ...marketWaveDrafts(),
  ...extraShoeDrafts(),
];

export const padelSoftGoodsPatches: Record<string, Partial<Product>> = {};
export const padelSoftGoodsProductsRaw: Product[] = [];

for (const draft of padelSoftGoodsDrafts) {
  if (draft.existing) {
    padelSoftGoodsPatches[draft.id] = toSoftProductPatch(draft);
  } else {
    padelSoftGoodsProductsRaw.push(toSoftProduct(draft));
  }
}

export const padelSoftGoodsMediaPendingIds = new Set(
  padelSoftGoodsDrafts.map((d) => d.id),
);

export const padelSecondaryMediaPendingIds = new Set([
  ...padelSoftGoodsMediaPendingIds,
  ...padelShoeWrongImageIds,
]);

export const padelSoftGoodsProducts: Product[] = applyMediaPublishGate(
  padelSoftGoodsProductsRaw,
  padelSoftGoodsMediaPendingIds,
);

export const padelSoftGoodsEvidence = [
  ...padelSoftGoodsDrafts.flatMap(toSoftEvidence),
  ...padelShoeCatalogEvidence,
];
