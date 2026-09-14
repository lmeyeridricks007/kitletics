import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts, padelAllOffers } from "@/content/padel";
import { hasRegisteredProductHero } from "@/content/running/products/media-publish-gate";

export const metadata: Metadata = {
  title: "Padel equipment catalog coverage",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const CAT: Record<string, string> = {
  balls: "cat-padel-balls",
  bags: "cat-padel-bags",
  grips: "cat-padel-grips",
  accessories: "cat-padel-accessories",
};

type CatScore = {
  market_discovered: number;
  catalog_products: number;
  current: number;
  previous_generation: number;
  ready: number;
  media_pending: number;
  /** Products without a Kitletics Offer — not unexplained research debt. */
  no_kitletics_offer?: number;
  /** Unexplained COMMERCE_PENDING research states (must stay 0). */
  commerce_research_pending?: number;
  /** @deprecated Prefer no_kitletics_offer */
  commerce_pending?: number;
  brands: number;
  catalog_capture_pct?: number;
  coverage_pct?: number;
  missing_current: string[];
};

function noKitleticsOffer(s: CatScore) {
  return s.no_kitletics_offer ?? s.commerce_pending ?? 0;
}

type Scorecard = {
  generatedAt: string;
  before_this_discovery_pass?: Record<string, number>;
  after?: Record<string, number>;
  metrics?: Record<string, number>;
  classifications: Record<string, string | boolean>;
  brand_discovery?: Record<string, Record<string, string>>;
  categories: Record<string, CatScore>;
  research_queue_count?: number;
};

function loadScorecard(): Scorecard | null {
  try {
    const path = join(
      process.cwd(),
      "docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json",
    );
    return JSON.parse(readFileSync(path, "utf8")) as Scorecard;
  } catch {
    return null;
  }
}

function brandLabel(brandId: string) {
  return brandId.replace(/^brand-/, "").replace(/-padel$/, "");
}

function capturePct(s: CatScore) {
  return s.catalog_capture_pct ?? s.coverage_pct ?? 0;
}

export default function PadelEquipmentCoveragePage() {
  const scorecard = loadScorecard();
  const offerSet = new Set(padelAllOffers.map((o) => o.productId));

  const byBrandCategory = new Map<
    string,
    {
      brand: string;
      category: string;
      catalog: number;
      ready: number;
      mediaPending: number;
      noKitleticsOffer: number;
    }
  >();

  for (const [cat, catId] of Object.entries(CAT)) {
    const products = padelAllProducts.filter((p) => p.categoryId === catId);
    for (const p of products) {
      const brand = brandLabel(p.brandId);
      const key = `${brand}|${cat}`;
      const row = byBrandCategory.get(key) ?? {
        brand,
        category: cat,
        catalog: 0,
        ready: 0,
        mediaPending: 0,
        noKitleticsOffer: 0,
      };
      row.catalog++;
      const media = hasRegisteredProductHero(p.id);
      if (p.status === "published" && media) row.ready++;
      if (!media) row.mediaPending++;
      if (!offerSet.has(p.id)) row.noKitleticsOffer++;
      byBrandCategory.set(key, row);
    }
  }

  const rows = [...byBrandCategory.values()].sort((a, b) =>
    `${a.category}${a.brand}`.localeCompare(`${b.category}${b.brand}`),
  );

  const discoveryPct = scorecard?.metrics?.discovery_completeness_pct;
  const capturePctAll = scorecard?.metrics?.catalog_capture_pct;
  const marketDiscovery = String(
    scorecard?.classifications?.MARKET_DISCOVERY ?? "UNKNOWN",
  );

  const brandDiscovery = scorecard?.brand_discovery ?? {};
  const brandRows = Object.entries(brandDiscovery)
    .map(([brand, cells]) => {
      const vals = Object.values(cells);
      const overall = vals.every(
        (s) => s === "COMPLETE" || s === "NOT_APPLICABLE",
      )
        ? "COMPLETE"
        : vals.some((s) => s === "BLOCKED_EXTERNAL")
          ? "BLOCKED"
          : "INCOMPLETE";
      return {
        brand,
        balls: cells.balls ?? "—",
        bags: cells.bags ?? "—",
        grips: cells.grips ?? "—",
        accessories: cells.accessories ?? "—",
        overall,
      };
    })
    .sort((a, b) => a.brand.localeCompare(b.brand));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-zinc-900">
      <p className="text-sm text-zinc-500">
        <Link href="/admin" className="underline">
          Admin
        </Link>{" "}
        / Catalog / Padel equipment
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Padel equipment market discovery
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Discovery completeness and catalog capture are separate. A high capture
        rate does not mean the market is fully researched. Public category pages
        still show READY products only. Commerce research COMPLETE does not mean
        every product has a Kitletics Offer — products without offers stay in
        catalog; UI shows regional empty-offer copy rather than dropping
        recommendations.
      </p>
      <p className="mt-3 text-sm text-zinc-600">
        <Link
          href="/admin/catalog/padel-equipment/media"
          className="underline"
        >
          Media queue
        </Link>
        {" · "}
        <Link
          href="/admin/catalog/padel-equipment/specs"
          className="underline"
        >
          Specs queue
        </Link>
        {" · "}
        <Link
          href="/admin/catalog/padel-equipment/commerce"
          className="underline"
        >
          Commerce queue
        </Link>
      </p>

      {scorecard ? (
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Market discovery
            </div>
            <div className="mt-1 text-xl font-semibold">{marketDiscovery}</div>
          </div>
          <div className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Discovery completeness
            </div>
            <div className="mt-1 text-xl font-semibold">
              {discoveryPct != null ? `${discoveryPct}%` : "—"}
            </div>
          </div>
          <div className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Catalog capture rate
            </div>
            <div className="mt-1 text-xl font-semibold">
              {capturePctAll != null ? `${capturePctAll}%` : "—"}
            </div>
          </div>
          <div className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Soft-goods catalog
            </div>
            <div className="mt-1 text-xl font-semibold">
              {scorecard.after?.total ?? "—"}
            </div>
            <div className="text-xs text-zinc-500">
              was {scorecard.before_this_discovery_pass?.total ?? 262} at finish-pass start
            </div>
          </div>
        </section>
      ) : null}

      {scorecard ? (
        <section className="mt-8">
          <h2 className="text-lg font-medium">Classifications</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(scorecard.classifications).map(([k, v]) => (
              <li
                key={k}
                className="border border-zinc-200 px-3 py-2 text-sm"
              >
                <span className="text-zinc-500">{k}</span>
                <div className="font-medium">{String(v)}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {scorecard ? (
        <section className="mt-10 overflow-x-auto">
          <h2 className="text-lg font-medium">Category scorecard</h2>
          <table className="mt-3 w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Discovered</th>
                <th className="py-2 pr-3 font-medium">Catalog</th>
                <th className="py-2 pr-3 font-medium">Ready</th>
                <th className="py-2 pr-3 font-medium">Media pending</th>
                <th className="py-2 pr-3 font-medium">No Kitletics offer</th>
                <th className="py-2 pr-3 font-medium">Commerce research pending</th>
                <th className="py-2 pr-3 font-medium">Capture %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scorecard.categories).map(([cat, s]) => (
                <tr key={cat} className="border-b border-zinc-100">
                  <td className="py-2 pr-3 capitalize">{cat}</td>
                  <td className="py-2 pr-3">{s.market_discovered}</td>
                  <td className="py-2 pr-3">{s.catalog_products}</td>
                  <td className="py-2 pr-3">{s.ready}</td>
                  <td className="py-2 pr-3">{s.media_pending}</td>
                  <td className="py-2 pr-3">{noKitleticsOffer(s)}</td>
                  <td className="py-2 pr-3">{s.commerce_research_pending ?? 0}</td>
                  <td className="py-2 pr-3">{capturePct(s)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {brandRows.length > 0 ? (
        <section className="mt-10 overflow-x-auto">
          <h2 className="text-lg font-medium">
            Brand discovery completeness
          </h2>
          <table className="mt-3 w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">Brand</th>
                <th className="py-2 pr-3 font-medium">Balls</th>
                <th className="py-2 pr-3 font-medium">Bags</th>
                <th className="py-2 pr-3 font-medium">Grips</th>
                <th className="py-2 pr-3 font-medium">Accessories</th>
                <th className="py-2 pr-3 font-medium">Overall</th>
              </tr>
            </thead>
            <tbody>
              {brandRows.map((r) => (
                <tr key={r.brand} className="border-b border-zinc-100">
                  <td className="py-2 pr-3">{r.brand}</td>
                  <td className="py-2 pr-3">{r.balls}</td>
                  <td className="py-2 pr-3">{r.bags}</td>
                  <td className="py-2 pr-3">{r.grips}</td>
                  <td className="py-2 pr-3">{r.accessories}</td>
                  <td className="py-2 pr-3 font-medium">{r.overall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="mt-10 overflow-x-auto">
        <h2 className="text-lg font-medium">Catalog by brand × category</h2>
        <table className="mt-3 w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="py-2 pr-3 font-medium">Brand</th>
              <th className="py-2 pr-3 font-medium">Category</th>
              <th className="py-2 pr-3 font-medium">Catalog</th>
              <th className="py-2 pr-3 font-medium">Ready</th>
              <th className="py-2 pr-3 font-medium">Media pending</th>
              <th className="py-2 pr-3 font-medium">No Kitletics offer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={`${r.brand}-${r.category}`}
                className="border-b border-zinc-100"
              >
                <td className="py-2 pr-3 capitalize">{r.brand}</td>
                <td className="py-2 pr-3 capitalize">{r.category}</td>
                <td className="py-2 pr-3">{r.catalog}</td>
                <td className="py-2 pr-3">{r.ready}</td>
                <td className="py-2 pr-3">{r.mediaPending}</td>
                <td className="py-2 pr-3">{r.noKitleticsOffer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-8 text-sm text-zinc-500">
        Evidence:{" "}
        <code>docs/padel/PADEL-BRAND-RESEARCH-EVIDENCE.md</code> · Inventory:{" "}
        <code>docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv</code>
      </p>
    </main>
  );
}
