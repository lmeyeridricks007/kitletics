/**
 * Catalog depth for padel Best Guide estate decisions.
 */
import { getProducts } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { existsSync } from "node:fs";
import path from "node:path";

const padelCats = [
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-grips",
  "cat-padel-balls",
  "cat-padel-bags",
] as const;

function heroOk(src?: string) {
  if (!src) return false;
  if (src.includes("/fallbacks/") || src.endsWith(".svg")) return false;
  return existsSync(path.join(process.cwd(), "public", src.replace(/^\//, "")));
}

const products = getProducts({ isDev: true }).filter((p) =>
  padelCats.includes(p.categoryId as (typeof padelCats)[number]),
);

const rows = products.map((p) => {
  const s = p.specifications ?? {};
  const hero = getPrimaryProductMedia(p);
  return {
    id: p.id,
    slug: p.slug,
    name: p.fullName,
    cat: p.categoryId,
    status: p.status,
    life: p.lifecycleStatus,
    shape: s.shape,
    balance: s.balance,
    wMin: s.weightMin,
    wMax: s.weightMax,
    feel: s.feel,
    playerLevel: s.playerLevel,
    genderFit: s.genderFit,
    width: s.widthOptions ?? s.fit,
    lateral: s.lateralStability,
    courtFeel: s.courtFeel,
    cushion: s.cushioning,
    support: s.support,
    gripType: s.gripType,
    surface: s.surface,
    use: p.useCaseIds,
    hero: heroOk(hero?.src),
    heroSrc: hero?.src,
  };
});

for (const cat of padelCats) {
  const list = rows.filter((r) => r.cat === cat);
  const pub = list.filter((r) => r.status === "published");
  console.log("\n===", cat, "total", list.length, "published", pub.length, "===");
  for (const r of list.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(
      `${r.status}/${r.life} hero=${r.hero} ${r.id} | ${r.name} | shape=${r.shape} bal=${r.balance} w=${r.wMin}-${r.wMax} feel=${r.feel} lvl=${r.playerLevel} gender=${r.genderFit} lat=${r.lateral} feelC=${r.courtFeel} cush=${r.cushion} grip=${r.gripType} uc=${(r.use ?? []).join(",")}`,
    );
  }
}
