/**
 * Fix 67 — production-equivalent internal link classification (READ diagnostic).
 */
import sitemap from "@/app/sitemap";
import {
  getBestGuides,
  getBrands,
  getBuyingGuides,
  getComparisons,
  getProductById,
  getProducts,
  getReviews,
  getSportBySlug,
  getTools,
} from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";
import { PRIMARY_NAV } from "@/lib/navigation/config";
import { PRIMARY_MENU_PANELS } from "@/lib/navigation/primary-menu-panels";

const PROD = { isDev: false as const };

const pathSet = new Set(
  sitemap().map((e) => {
    try {
      return new URL(e.url).pathname || "/";
    } catch {
      return "";
    }
  }),
);

function classifyHref(href: string) {
  const path = href.split("?")[0] || "/";
  if (pathSet.has(path)) {
    return { path, inSitemap: true, disp: "INDEXABLE" as const };
  }
  const parts = path.split("/").filter(Boolean);
  if (path.startsWith("/reviews/")) {
    const r = getReviews(PROD).find((x) => x.slug === parts[1]);
    if (!r) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "review", entity: r }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/products/") && path.endsWith("/alternatives")) {
    const p = getProducts(PROD).find((x) => x.slug === parts[1]);
    if (!p) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "alternatives", entity: p }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/products/")) {
    const p = getProducts(PROD).find((x) => x.slug === parts[1]);
    if (!p) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "product", entity: p }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/best/") && parts.length === 2) {
    const g = getBestGuides(PROD).find((x) => x.slug === parts[1]);
    if (!g) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "best-guide", entity: g }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/guides/") && parts.length === 2) {
    const g = getBuyingGuides(PROD).find((x) => x.slug === parts[1]);
    if (!g) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/compare/") && parts.length === 2) {
    const c = getComparisons(PROD).find((x) => x.slug === parts[1]);
    if (!c) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "comparison", entity: c }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/tools/")) {
    const slug = parts[1] === "finder" ? parts[2] : parts[1];
    const t = getTools(PROD).find((x) => x.slug === slug);
    if (!t) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "tool", entity: t }, PROD)
        .disposition,
    };
  }
  if (path.startsWith("/brands/")) {
    const b = getBrands(PROD).find((x) => x.slug === parts[1]);
    if (!b) return { path, inSitemap: false, disp: "NO_ENTITY" };
    return {
      path,
      inSitemap: false,
      disp: getLaunchEligibility({ kind: "brand", entity: b }, PROD)
        .disposition,
    };
  }
  if (parts.length === 1) {
    const s = getSportBySlug(parts[0], PROD);
    if (!s) return { path, inSitemap: false, disp: "NO_SPORT" };
    const elig = getLaunchEligibility({ kind: "sport", entity: s }, PROD);
    return {
      path,
      inSitemap: false,
      disp: elig.disposition,
      live: s.contentStatus,
      reasons: elig.reasons.map((r) => r.code),
    };
  }
  if (parts.length >= 2) {
    const s = getSportBySlug(parts[0], PROD);
    if (!s) return { path, inSitemap: false, disp: "NO_SPORT" };
    const sportElig = getLaunchEligibility({ kind: "sport", entity: s }, PROD);
    return {
      path,
      inSitemap: false,
      disp: `DEEP_${sportElig.disposition}`,
      live: s.contentStatus,
    };
  }
  return { path, inSitemap: false, disp: "UNKNOWN" };
}

const navHrefs: { from: string; href: string; label: string }[] = [];
for (const n of PRIMARY_NAV) {
  navHrefs.push({ from: "PRIMARY_NAV", href: n.href, label: n.label });
}
for (const panel of Object.values(PRIMARY_MENU_PANELS)) {
  for (const col of panel.columns) {
    for (const l of col.links) {
      navHrefs.push({
        from: panel.navHref,
        href: l.href,
        label: l.badge ? `${l.label} [${l.badge}]` : l.label,
      });
    }
  }
  if (panel.footer) {
    navHrefs.push({
      from: panel.navHref,
      href: panel.footer.href,
      label: panel.footer.label,
    });
  }
}

console.log("sitemap", pathSet.size);
console.log("=== NAV not in sitemap ===");
for (const n of navHrefs) {
  const c = classifyHref(n.href);
  if (c.inSitemap) continue;
  console.log(
    `${n.from}\t${n.label}\t${n.href}\t${c.disp}\tlive=${"live" in c ? c.live : ""}`,
  );
}

const reviews = getReviews(PROD);
const missingIdx = reviews.filter((r) => {
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  return elig.disposition === "INDEXABLE" && !pathSet.has(`/reviews/${r.slug}`);
});
console.log("\nINDEXABLE reviews missing sitemap", missingIdx.length);

const notInSm = reviews
  .filter((r) => !pathSet.has(`/reviews/${r.slug}`))
  .slice(0, 50);
const dispCount: Record<string, number> = {};
for (const r of notInSm) {
  const d = getLaunchEligibility({ kind: "review", entity: r }, PROD)
    .disposition;
  dispCount[d] = (dispCount[d] ?? 0) + 1;
}
console.log("old auditor first 50 not in sitemap", notInSm.length, dispCount);

const inbound = new Map<string, number>();
function bump(to: string) {
  if (to) inbound.set(to, (inbound.get(to) ?? 0) + 1);
}
const reviewByProduct = new Map(reviews.map((r) => [r.productId, r.slug]));
for (const p of getProducts(PROD)) {
  const rs = reviewByProduct.get(p.id);
  if (rs) {
    bump(`/reviews/${rs}`);
    bump(`/products/${p.slug}`);
  }
}
for (const g of getBestGuides(PROD)) {
  bump(`/best/${g.slug}`);
  for (const rec of g.recommendations ?? []) {
    const p = getProductById(rec.productId, PROD);
    if (p) bump(`/products/${p.slug}`);
    const rs = reviewByProduct.get(rec.productId);
    if (rs) bump(`/reviews/${rs}`);
  }
}
for (const g of getBuyingGuides(PROD)) bump(`/guides/${g.slug}`);
for (const c of getComparisons(PROD)) {
  bump(`/compare/${c.slug}`);
  for (const id of c.productIds) {
    const p = getProductById(id, PROD);
    if (p) {
      bump(`/products/${p.slug}`);
      bump(`/products/${p.slug}/alternatives`);
    }
    const rs = reviewByProduct.get(id);
    if (rs) bump(`/reviews/${rs}`);
  }
}

function orphansFor<T extends { slug: string }>(
  items: T[],
  kind:
    | "review"
    | "best-guide"
    | "buying-guide"
    | "comparison",
  prefix: string,
) {
  return items
    .filter((item) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind, entity: item } as never, PROD),
      ),
    )
    .filter((item) => (inbound.get(`${prefix}${item.slug}`) ?? 0) === 0)
    .map((item) => item.slug);
}

const oR = orphansFor(reviews, "review", "/reviews/");
const oB = orphansFor(getBestGuides(PROD), "best-guide", "/best/");
const oG = orphansFor(getBuyingGuides(PROD), "buying-guide", "/guides/");
const oC = orphansFor(getComparisons(PROD), "comparison", "/compare/");
console.log("INDEXABLE", {
  reviews: reviews.filter((r) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "review", entity: r }, PROD),
    ),
  ).length,
  best: getBestGuides(PROD).filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
    ),
  ).length,
  guides: getBuyingGuides(PROD).filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD),
    ),
  ).length,
  cmp: getComparisons(PROD).filter((c) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "comparison", entity: c }, PROD),
    ),
  ).length,
});
console.log("orphans reviews", oR.length, oR.slice(0, 12));
console.log("orphans best", oB.length, oB.slice(0, 12));
console.log("orphans guides", oG.length, oG.slice(0, 15));
console.log("orphans cmp", oC.length, oC.slice(0, 12));

let brandHeld = 0;
for (const b of getBrands(PROD)) {
  const eligB = getLaunchEligibility({ kind: "brand", entity: b }, PROD);
  if (eligB.disposition === "HIDDEN_404") continue;
  const ids = new Set(
    getProducts(PROD).filter((p) => p.brandId === b.id).map((p) => p.id),
  );
  const revs = reviews.filter((r) => ids.has(r.productId)).slice(0, 4);
  for (const r of revs) {
    if (
      !shouldPromotePublicly(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      )
    ) {
      brandHeld++;
      if (brandHeld <= 10) {
        console.log(
          "brand hub held",
          b.slug,
          r.slug,
          getLaunchEligibility({ kind: "review", entity: r }, PROD)
            .disposition,
        );
      }
    }
  }
}
console.log("brand hub held review cards", brandHeld);
