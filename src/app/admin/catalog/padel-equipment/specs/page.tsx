import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts } from "@/content/padel";
import {
  getSpecEnrichment,
  type SpecCompleteness,
} from "@/content/padel/spec-enrichment";

export const metadata: Metadata = {
  title: "Padel equipment specs queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type CovRow = {
  productId: string;
  categoryId: string;
  brandId: string;
  name: string;
  completeness: SpecCompleteness | string;
  unknownCount: string;
  notPublishedCount: string;
  sourceCoveragePct: string;
  identityNotes: string;
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
      join(process.cwd(), "docs/padel/data/PADEL-SPEC-COVERAGE.csv"),
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
      join(process.cwd(), "docs/padel/data/PADEL-SPEC-CONFLICTS.csv"),
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

export default async function PadelEquipmentSpecsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const view = String(sp.view ?? "unknown");
  const category = String(sp.category ?? "");
  const brand = String(sp.brand ?? "");
  const field = String(sp.field ?? "");
  const sourceQuality = String(sp.source ?? ""); // manufacturer | specialist | any | none

  const coverage = loadCoverage();
  const conflicts = loadConflicts();
  const counts = coverage.reduce(
    (a, r) => {
      a[r.completeness] = (a[r.completeness] || 0) + 1;
      return a;
    },
    {} as Record<string, number>,
  );

  const productById = new Map(padelAllProducts.map((p) => [p.id, p]));
  const categories = [...new Set(coverage.map((r) => r.categoryId))].sort();
  const brands = [...new Set(coverage.map((r) => r.brandId))].sort();

  const matchView = (c: string) => {
    if (view === "incomplete") return c === "INCOMPLETE_RESEARCH";
    if (view === "unknown") return c === "COMPLETE_WITH_UNKNOWN";
    if (view === "complete") return c === "VERIFIED_COMPLETE";
    if (view === "blocked") return c === "BLOCKED";
    if (view === "all") return true;
    return c === "COMPLETE_WITH_UNKNOWN";
  };

  let list = coverage.filter((r) => matchView(r.completeness));
  if (category) list = list.filter((r) => r.categoryId === category);
  if (brand) list = list.filter((r) => r.brandId === brand);
  if (field) {
    list = list.filter((r) => {
      const e = getSpecEnrichment(r.productId);
      return Boolean(e?.fields[field]);
    });
  }
  if (sourceQuality === "none") {
    list = list.filter((r) => Number(r.sourceCoveragePct || 0) === 0);
  } else if (sourceQuality === "any") {
    list = list.filter((r) => Number(r.sourceCoveragePct || 0) > 0);
  } else if (sourceQuality === "manufacturer" || sourceQuality === "specialist") {
    list = list.filter((r) => {
      const e = getSpecEnrichment(r.productId);
      if (!e) return false;
      return Object.values(e.fields).some((f) =>
        sourceQuality === "manufacturer"
          ? f.sourceType === "manufacturer"
          : f.sourceType === "specialist-retailer" ||
            f.sourceType === "major-retailer",
      );
    });
  }

  const qs = (extra: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = {
      view,
      category,
      brand,
      field,
      source: sourceQuality,
      ...extra,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `?${s}` : "";
  };

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
        / Specs
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Padel spec enrichment queue
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Field-level provenance lives beside Product.specifications. Terminal
        NOT_PUBLISHED / UNKNOWN values are valid — never invent manufacturer
        measurements.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {k}
            </div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </div>
        ))}
        <div className="border border-zinc-200 px-3 py-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            CONFLICTS
          </div>
          <div className="mt-1 text-xl font-semibold">{conflicts.length}</div>
        </div>
      </section>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        {(
          [
            ["unknown", "UNKNOWN"],
            ["incomplete", "INCOMPLETE"],
            ["complete", "COMPLETE"],
            ["blocked", "BLOCKED"],
            ["all", "ALL"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/catalog/padel-equipment/specs${qs({ view: key })}`}
            className={
              view === key ? "font-semibold underline" : "underline text-zinc-600"
            }
          >
            {label}
          </Link>
        ))}
        <Link
          href="/admin/catalog/padel-equipment/specs?view=all#conflicts"
          className="underline text-zinc-600"
        >
          CONFLICT
        </Link>
      </nav>

      <form
        method="get"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm"
      >
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
          <select name="brand" defaultValue={brand} className="mt-1 w-full border border-zinc-300 px-2 py-1.5">
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
            Field
          </span>
          <input
            name="field"
            defaultValue={field}
            placeholder="e.g. weightMin"
            className="mt-1 w-full border border-zinc-300 px-2 py-1.5"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Source quality
          </span>
          <select
            name="source"
            defaultValue={sourceQuality}
            className="mt-1 w-full border border-zinc-300 px-2 py-1.5"
          >
            <option value="">Any</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="specialist">Specialist / major retailer</option>
            <option value="any">Has URL</option>
            <option value="none">No URL</option>
          </select>
        </label>
        <input type="hidden" name="view" value={view} />
        <button
          type="submit"
          className="sm:col-span-2 lg:col-span-4 border border-zinc-900 bg-zinc-900 px-3 py-2 text-white"
        >
          Apply filters
        </button>
      </form>

      <section id="conflicts" className="mt-10">
        <h2 className="text-lg font-medium">
          CONFLICT ({conflicts.length})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Field</th>
                <th className="py-2 pr-3 font-medium">Value A</th>
                <th className="py-2 pr-3 font-medium">Value B</th>
                <th className="py-2 pr-3 font-medium">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.slice(0, 40).map((c, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-2 pr-3 text-xs">{c.productId}</td>
                  <td className="py-2 pr-3">{c.field}</td>
                  <td className="py-2 pr-3 text-xs">{c.valueA}</td>
                  <td className="py-2 pr-3 text-xs">{c.valueB}</td>
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
          Queue{" "}
          <span className="text-zinc-500">({list.length})</span>
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">Product</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Completeness</th>
                <th className="py-2 pr-3 font-medium">Unknown</th>
                <th className="py-2 pr-3 font-medium">Not published</th>
                <th className="py-2 pr-3 font-medium">Source %</th>
                <th className="py-2 pr-3 font-medium">Sample specs</th>
                <th className="py-2 pr-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 120).map((r) => {
                const p = productById.get(r.productId);
                const enrichment = getSpecEnrichment(r.productId);
                const sample = Object.entries(p?.specifications ?? {})
                  .slice(0, 4)
                  .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                  .join(", ");
                return (
                  <tr
                    key={r.productId}
                    className="border-b border-zinc-100 align-top"
                  >
                    <td className="py-2 pr-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-zinc-500">{r.productId}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {r.categoryId.replace("cat-padel-", "")}
                    </td>
                    <td className="py-2 pr-3 text-xs">{r.completeness}</td>
                    <td className="py-2 pr-3">{r.unknownCount}</td>
                    <td className="py-2 pr-3">{r.notPublishedCount}</td>
                    <td className="py-2 pr-3">{r.sourceCoveragePct}%</td>
                    <td className="py-2 pr-3 text-xs text-zinc-600 max-w-sm">
                      {sample || "—"}
                      {enrichment
                        ? ` · ${Object.keys(enrichment.fields).length} provenance fields`
                        : ""}
                    </td>
                    <td className="py-2 pr-3 text-xs text-zinc-600 max-w-xs">
                      {r.identityNotes || "—"}
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={8}>
                    No rows for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {list.length > 120 ? (
            <p className="mt-2 text-xs text-zinc-500">
              Truncated — full list in{" "}
              <code>docs/padel/data/PADEL-SPEC-COVERAGE.csv</code>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
