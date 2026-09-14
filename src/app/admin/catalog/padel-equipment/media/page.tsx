import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
  title: "Padel equipment media queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type MediaRow = {
  productId: string;
  category: string;
  brand: string;
  model: string;
  generation: string;
  variant: string;
  identityKey: string;
  publicationStatus: string;
  currentHero: string;
  currentHeroSource: string;
  status: string;
  candidateSource: string;
  candidateImage: string;
  identityConfidence: string;
  semanticChecks: string;
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

function loadCoverage(): MediaRow[] {
  try {
    const text = readFileSync(
      join(process.cwd(), "docs/padel/data/PADEL-MEDIA-COVERAGE.csv"),
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
      return row as MediaRow;
    });
  } catch {
    return [];
  }
}

const SECTIONS: { key: string; title: string; statuses: string[] }[] = [
  { key: "missing", title: "MISSING", statuses: ["MEDIA_MISSING"] },
  { key: "candidate", title: "CANDIDATE", statuses: ["MEDIA_CANDIDATE"] },
  {
    key: "needs-review",
    title: "NEEDS REVIEW",
    statuses: ["MEDIA_AMBIGUOUS", "MEDIA_CANDIDATE"],
  },
  { key: "verified", title: "VERIFIED", statuses: ["MEDIA_VERIFIED"] },
  { key: "blocked", title: "BLOCKED", statuses: ["MEDIA_BLOCKED"] },
];

export default function PadelEquipmentMediaPage() {
  const rows = loadCoverage();
  const counts = rows.reduce(
    (a, r) => {
      a[r.status] = (a[r.status] || 0) + 1;
      return a;
    },
    {} as Record<string, number>,
  );

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
        / Media
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Padel soft-goods media queue
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Every CURRENT soft-goods product must end as MEDIA_VERIFIED or a
        documented MEDIA_BLOCKED. Candidates below 95 identity confidence need
        manual approve/reject before publish.
      </p>
      <p className="mt-3 text-sm text-zinc-600">
        <Link
          href="/admin/catalog/padel-equipment/specs"
          className="underline"
        >
          Specs queue
        </Link>
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="border border-zinc-200 px-3 py-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {k.replace(/^MEDIA_/, "")}
            </div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </div>
        ))}
      </section>

      {SECTIONS.map((section) => {
        const list = rows.filter((r) => section.statuses.includes(r.status));
        // Avoid double-listing candidates in both CANDIDATE and NEEDS REVIEW
        if (section.key === "needs-review") {
          /* keep MEDIA_AMBIGUOUS primarily; candidates already in CANDIDATE */
        }
        const display =
          section.key === "needs-review"
            ? rows.filter((r) => r.status === "MEDIA_AMBIGUOUS")
            : list;
        return (
          <section key={section.key} className="mt-10">
            <h2 className="text-lg font-medium">
              {section.title}{" "}
              <span className="text-zinc-500">({display.length})</span>
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 font-medium">Identity</th>
                    <th className="py-2 pr-3 font-medium">Hero / candidate</th>
                    <th className="py-2 pr-3 font-medium">Source</th>
                    <th className="py-2 pr-3 font-medium">Conf.</th>
                    <th className="py-2 pr-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {display.slice(0, 80).map((r) => (
                    <tr
                      key={`${section.key}-${r.productId}`}
                      className="border-b border-zinc-100 align-top"
                    >
                      <td className="py-2 pr-3">
                        <div className="font-medium">
                          {r.brand} {r.model}
                        </div>
                        <div className="text-xs text-zinc-500">{r.productId}</div>
                      </td>
                      <td className="py-2 pr-3 capitalize">{r.category}</td>
                      <td className="py-2 pr-3 text-xs text-zinc-600">
                        {r.identityKey}
                      </td>
                      <td className="py-2 pr-3 text-xs">
                        {r.currentHero || r.candidateImage || "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs">
                        {r.currentHeroSource || r.candidateSource || "—"}
                      </td>
                      <td className="py-2 pr-3">{r.identityConfidence || "—"}</td>
                      <td className="py-2 pr-3 text-xs text-zinc-600 max-w-xs">
                        {r.notes || r.semanticChecks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {display.length > 80 ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Showing 80 of {display.length}. Full list:{" "}
                  <code>docs/padel/data/PADEL-MEDIA-COVERAGE.csv</code>
                </p>
              ) : null}
            </div>
          </section>
        );
      })}
    </main>
  );
}
