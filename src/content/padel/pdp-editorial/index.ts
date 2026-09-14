import type { Product } from "@/domain/products/types";
import type {
  PadelRacketEditorialMeta,
  PadelSoftPdpCopy,
} from "@/domain/padel/soft-pdp-copy";
import { padelSoftPdpEditorialStore } from "@/content/padel/pdp-editorial/store.generated";
import { padelRacketEditorialMeta } from "@/content/padel/pdp-editorial/racket-meta.generated";
import { getPadelRacketPdpCopy } from "@/content/padel/rackets";

export function getPadelSoftPdpCopy(
  productId: string,
): PadelSoftPdpCopy | undefined {
  return padelSoftPdpEditorialStore[productId];
}

export function getPadelRacketEditorialMeta(
  productId: string,
): PadelRacketEditorialMeta | undefined {
  return padelRacketEditorialMeta[productId];
}

export function getPadelEditorialState(productId: string): string | undefined {
  return (
    padelSoftPdpEditorialStore[productId]?.editorialState ??
    padelRacketEditorialMeta[productId]?.editorialState
  );
}

/**
 * Upgrade thin / generator shortDescription + verdict from soft PDP store.
 * Does not invent heroes or offers.
 */
export function applyPadelPdpEditorialToProducts(
  products: Product[],
): Product[] {
  return products.map((p) => {
    const copy = padelSoftPdpEditorialStore[p.id];
    if (!copy) return p;
    if (
      copy.editorialState !== "EDITORIAL_READY" &&
      copy.editorialState !== "EDITORIAL_LIGHT"
    ) {
      return p;
    }

    const next: Product = { ...p };
    const thinOrGenerator =
      !p.shortDescription ||
      p.shortDescription.length < 60 ||
      /researched as a current|commercially meaningful/i.test(
        p.shortDescription,
      );
    if (thinOrGenerator && copy.shortDescription) {
      next.shortDescription = copy.shortDescription;
    }
    if (
      (!p.verdict ||
        p.verdict.length < 40 ||
        /researched as a current/i.test(p.verdict)) &&
      copy.verdict
    ) {
      next.verdict = copy.verdict;
    }
    if (
      (!p.strengths || p.strengths.length < 2) &&
      copy.strengthsNarrative.length
    ) {
      next.strengths = copy.strengthsNarrative.slice(0, 4);
    }
    if (
      (!p.weaknesses || p.weaknesses.length < 1) &&
      copy.tradeoffsNarrative.length
    ) {
      next.weaknesses = copy.tradeoffsNarrative.slice(0, 3);
    }
    return next;
  });
}

export function hasPadelLongformEditorial(productId: string): boolean {
  return Boolean(
    getPadelSoftPdpCopy(productId) || getPadelRacketPdpCopy(productId),
  );
}

export type { PadelSoftPdpCopy, PadelRacketEditorialMeta };
