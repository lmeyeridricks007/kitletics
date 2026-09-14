import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts } from "@/content/padel";
import {
  getCommerceEnrichment,
  type CommerceOfferPresence,
} from "@/content/padel/commerce-enrichment";

export const metadata: Metadata = {
  title: "Padel equipment commerce queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type CovRow = {
  productId: string;
  categoryId: string;
  brandId: string;
  name: string;
  availabilityClass: string;
  offerPresence: CommerceOfferPresence | string;
  researchState: string;
  nlOfferCount: string;
  euOfferCount: string;
  affiliateMapped: string;
  freshOfferCount: string;
  staleOfferCount: string;
  notes: string;
};

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function loadCoverage(): CovRow[] {
  try {
    const text = readFileSync(
      join(process.cwd(), "docs/padel/data/PADEL-COMMERCE-COVERAGE.csv"),
      "utf8",
    );
    const lines = text.trimEnd().split(/\r?\n/);
    const headers = splitCsvLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cols = splitCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] ?? "";
      });
      return row as CovRow;
    });
  } catch {
    return [];
  }
}

function loadConflicts(): Record<string, string>[] {
  try {
    const text = readFileSync(
      join(process.cwd(), "docs/padel/data/PADEL-COMMERCE-CONFLICTS.csv"),
      "utf8",
    );
    const lines = text.trimEnd().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = splitCsvLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cols = splitCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] ?? "";
      });
      return row;
    });
  } catch {
    return [];
  }
}

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function PadelEquipmentCommercePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const view = String(sp.view ?? "no-offer");
  const category = String(sp.category ?? "");
  const brand = String(sp.brand ?? "");
  const retailer = String(sp.retailer ?? "");

  const coverage = loadCoverage();
  const conflicts = loadConflicts();
  const presenceCounts = coverage.reduce(
    (a, r) => {
      a[r.offerPresence] = (a[r.offerPresence] || 0) + 1;
      return a;
    },
    {} as Record<string, number>,
  );
  const classCounts = coverage.reduce(
    (a, r) => {
      a[r.availabilityClass] = (a[r.availabilityClass] || 0) + 1;
      return a;
    },
    {} as Record<string, number>,
  );

  const categories = [...new Set(coverage.map((r) => r.categoryId))].sort();
  const brands = [...new Set(coverage.map((r) => r.brandId))].sort();

  const matchView = (presence: string) => {
    if (view === "nl") return presence === "NL_OFFER";
    if (view === "eu") return presence === "EU_OFFER";
    if (view === "no-offer") return presence === "NO_OFFER";
    if (view === "stale") return presence === "STALE";
    if (view === "conflict") return presence === "IDENTITY_CONFLICT";
    if (view === "all") return true;
    return presence === "NO_OFFER";
  };

  let list = coverage.filter((r) => matchView(r.offerPresence));
  if (category) list = list.filter((r) => r.categoryId === category);
  if (brand) list = list.filter((r) => r.brandId === brand);
  if (retailer) {
    list = list.filter((r) => {
      const e = getCommerceEnrichment(r.productId);
      return e?.evidenceUrls.some((u) => u.includes(retailer));
    });
  }

  const qs = (extra: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { view, category, brand, retailer, ...extra };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const productById = new Map(padelAllProducts.map((p) => [p.id, p]));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-zinc-900">
      <p className="text-sm text-zinc-500">
        <Link href="/admin" className="underline">
          Admin
        </Link>{" "}
        /{" "}
        <Link href="/admin/catalog/padel-equipment" className="underline">
          Padel equipment
        </Link>{" "}
        / Commerce
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Padel commerce enrichment queue
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Catalog inclusion ≠ retail availability. From-prices use the shared
        regional resolver only. Affiliate commission never ranks products.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(
          [
            ["NL_OFFER", "NL OFFER"],
            ["EU_OFFER", "EU OFFER"],
            ["NO_OFFER", "NO OFFER"],
            ["STALE", "STALE"],
            ["IDENTITY_CONFLICT", "IDENTITY CONFLICT"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {label}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {presenceCounts[key] ?? 0}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(classCounts).map(([k, v]) => (
          <div key={k} className="border border-zinc-200 px-3 py-2 text-sm">
            <span className="text-zinc-500">{k}</span>
            <div className="font-medium">{v}</div>
          </div>
        ))}
      </section>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        {(
          [
            ["no-offer", "NO OFFER"],
            ["nl", "NL OFFER"],
            ["eu", "EU OFFER"],
            ["stale", "STALE"],
            ["conflict", "CONFLICT"],
            ["all", "ALL"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/catalog/padel-equipment/commerce${qs({ view: key })}`}
            className={
              view === key ? "font-semibold underline" : "underline text-zinc-600"
            }
          >
            {label}
          </Link>
        ))}
      </nav>

      <form
        method="get"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm"
      >
        <input type="hidden" name="view" value={view} />
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Category
          </span>
          <select
            name="category"
            defaultValue={category}
            className="mt-1 w-full border border-zinc-300 px-2 py-1.5"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace("cat-padel-", "")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Brand
          </span>
          <select
            name="brand"
            defaultValue={brand}
            className="mt-1 w-full border border-zinc-300 px-2 py-1.5"
          >
            <option value="">All</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b.replace(/^brand-/, "")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Retailer host
          </span>
          <input
            name="retailer"
            defaultValue={retailer}
            placeholder="e.g. padelmq"
            className="mt-1 w-full border border-zinc-300 px-2 py-1.5"
          />
        </label>
        <button
          type="submit"
          className="self-end border border-zinc-900 bg-zinc-900 px-3 py-2 text-white"
        >
          Apply filters
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-lg font-medium">
          IDENTITY CONFLICT ({conflicts.length})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">A</th>
                <th className="py-2 pr-3 font-medium">B</th>
                <th className="py-2 pr-3 font-medium">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.slice(0, 40).map((c, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-2 pr-3 text-xs">{c.productId}</td>
                  <td className="py-2 pr-3">{c.type}</td>
                  <td className="py-2 pr-3 text-xs">{c.valueA}</td>
                  <td className="py-2 pr-3 text-xs max-w-xs truncate">
                    {c.valueB}
                  </td>
                  <td className="py-2 pr-3 text-xs">{c.resolution}</td>
                </tr>
              ))}
              {conflicts.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={5}>
                    No conflicts.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">
          Queue <span className="text-zinc-500">({list.length})</span>
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Class</th>
                <th className="py-2 pr-3 font-medium">Presence</th>
                <th className="py-2 pr-3 font-medium">NL / EU</th>
                <th className="py-2 pr-3 font-medium">Affiliate map</th>
                <th className="py-2 pr-3 font-medium">Pack / notes</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 120).map((r) => {
                const e = getCommerceEnrichment(r.productId);
                const p = productById.get(r.productId);
                return (
                  <tr
                    key={r.productId}
                    className="border-b border-zinc-100 align-top"
                  >
                    <td className="py-2 pr-3">
                      <div className="font-medium">{r.name || p?.name}</div>
                      <div className="text-xs text-zinc-500">{r.productId}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {r.categoryId.replace("cat-padel-", "")}
                    </td>
                    <td className="py-2 pr-3 text-xs">{r.availabilityClass}</td>
                    <td className="py-2 pr-3 text-xs">{r.offerPresence}</td>
                    <td className="py-2 pr-3 text-xs">
                      {r.nlOfferCount} / {r.euOfferCount}
                    </td>
                    <td className="py-2 pr-3 text-xs">{r.affiliateMapped}</td>
                    <td className="py-2 pr-3 text-xs text-zinc-600 max-w-sm">
                      {e?.packNormalization?.unitLabel || r.notes || "—"}
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={7}>
                    No rows for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
