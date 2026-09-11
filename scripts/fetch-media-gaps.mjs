/**
 * Fetch authentic heroes for catalog media gaps via www.runrepeat.com
 * product_primary images (curl — more reliable than undici against RR).
 *
 * node scripts/fetch-media-gaps.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMP = path.join(ROOT, "data/staging/media-fetch-tmp");
fs.mkdirSync(TMP, { recursive: true });

function dirFor(categorySlug) {
  const c = categorySlug || "";
  if (c.includes("running-shoe")) return "running/products";
  if (c.includes("padel-shoe")) return "padel/products";
  if (c.includes("tennis-shoe")) return "tennis/products";
  if (/racket|paddle|pickle|squash|badminton/.test(c)) return "racket/products";
  if (/sock|clothing|accessor|safety|recover|sunglass|belt|hydration/.test(c))
    return "running/accessories";
  return "fitness/products";
}

function runrepeatSlugCandidates(gap) {
  const slug = gap.slug;
  const name = (gap.fullName || "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const out = [slug];
  if (name && name !== slug) out.push(name);
  if (slug.startsWith("new-balance-fresh-foam-x-")) {
    out.push(slug.replace("new-balance-fresh-foam-x-", "new-balance-"));
  }
  if (slug.startsWith("topo-athletic-")) {
    out.push(slug.replace("topo-athletic-", "topo-"));
  }
  // adidas terrex etc already fine
  return [...new Set(out.filter(Boolean))];
}

function curlToFile(url, dest, maxTime = 30) {
  try {
    const code = execFileSync(
      "curl",
      [
        "--http1.1",
        "-sL",
        "--max-time",
        String(maxTime),
        "-A",
        UA,
        "-o",
        dest,
        "-w",
        "%{http_code}",
        url,
      ],
      { encoding: "utf8" },
    ).trim();
    if (code !== "200" || !fs.existsSync(dest)) return { ok: false, code };
    const st = fs.statSync(dest);
    return { ok: st.size > 8000, size: st.size, code };
  } catch (e) {
    const code = (e.stdout || "").toString().trim() || "err";
    return { ok: false, code };
  }
}

function curlGet(url, maxTime = 30) {
  const dest = path.join(
    TMP,
    `page-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`,
  );
  const got = curlToFile(url, dest, maxTime);
  if (!got.ok || !fs.existsSync(dest)) {
    try {
      fs.unlinkSync(dest);
    } catch {
      /* ignore */
    }
    return null;
  }
  // HTML pages are large; allow >5k for HTML, images checked by caller size
  const buf = fs.readFileSync(dest);
  try {
    fs.unlinkSync(dest);
  } catch {
    /* ignore */
  }
  if (buf.length < 2000) return null;
  return buf;
}

function tryRunRepeat(gap) {
  for (const cand of runrepeatSlugCandidates(gap)) {
    const pageUrl = `https://www.runrepeat.com/${cand}`;
    const buf = curlGet(pageUrl, 30);
    if (!buf) continue;
    const html = buf.toString("utf8");
    if (html.length < 5000) continue;
    const mains = [
      ...html.matchAll(
        /https:\/\/cdn\.runrepeat\.com\/storage\/gallery\/product_primary\/\d+\/[A-Za-z0-9_.-]+-main\.jpg/g,
      ),
    ].map((m) => m[0]);
    const any = [
      ...html.matchAll(
        /https:\/\/cdn\.runrepeat\.com\/storage\/gallery\/product_primary\/\d+\/[A-Za-z0-9_.-]+\.jpg/g,
      ),
    ].map((m) => m[0]);
    const url =
      mains[0] ||
      any.find((u) => u.includes("-1440.") || u.includes("-1080.")) ||
      any.find((u) => u.includes("-720.")) ||
      any[0];
    if (!url) continue;
    const imgDest = path.join(TMP, `${cand}-hero.jpg`);
    const got = curlToFile(url, imgDest, 30);
    if (!got.ok || got.size < 8000) continue;
    const imgBuf = fs.readFileSync(imgDest);
    try {
      fs.unlinkSync(imgDest);
    } catch {
      /* ignore */
    }
    return {
      buf: imgBuf,
      pageUrl,
      licence: "retailer-authorized",
      source: "Independent lab product photography (RunRepeat)",
      ct: "image/jpeg",
    };
  }
  return null;
}

function tryZonaDePadel(gap) {
  if (!/padel/.test(gap.categorySlug || "")) return null;
  const searchUrl = `https://www.zonadepadel.es/busca?controller=search&s=${encodeURIComponent(gap.fullName || gap.slug)}`;
  const buf = curlGet(searchUrl, 25);
  if (!buf) return null;
  const html = buf.toString("utf8");
  const imgs = [
    ...html.matchAll(
      /https:\/\/www\.zonadepadel\.es\/\d+-large_default\/[A-Za-z0-9_.-]+\.jpg/g,
    ),
  ].map((m) => m[0]);
  const tokens = (gap.slug || "")
    .split("-")
    .filter((t) => t.length > 2 && !["padel", "the", "and"].includes(t));
  const scored = imgs
    .map((u) => {
      const h = u.toLowerCase();
      let score = 0;
      for (const t of tokens) if (h.includes(t)) score += 1;
      return { u, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);
  for (const cand of scored.slice(0, 3)) {
    const imgDest = path.join(TMP, `zona-${Date.now()}.jpg`);
    const got = curlToFile(cand.u, imgDest, 25);
    if (!got.ok || got.size < 8000) continue;
    const imgBuf = fs.readFileSync(imgDest);
    try {
      fs.unlinkSync(imgDest);
    } catch {
      /* ignore */
    }
    return {
      buf: imgBuf,
      pageUrl: searchUrl,
      licence: "retailer-authorized",
      source: "Zona de Padel authorized product photography",
      ct: "image/jpeg",
    };
  }
  return null;
}

function mergeRegistryEntries(entries) {
  const runningPath = path.join(ROOT, "src/content/running/product-media.ts");
  const catalogPath = path.join(ROOT, "src/content/catalog-product-media.ts");
  let runningSrc = fs.readFileSync(runningPath, "utf8");
  let catalogSrc = fs.readFileSync(catalogPath, "utf8");
  let addedRunning = 0;
  let addedCatalog = 0;

  for (const e of entries) {
    if (!e.ok) continue;
    if (runningSrc.includes(`"${e.id}":`) || catalogSrc.includes(`"${e.id}":`))
      continue;
    const attribution = e.source.includes("RunRepeat")
      ? "Product photography via RunRepeat — pending manufacturer packshot"
      : "© Brand — authorized retailer product photography";
    const block = `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "${e.licence}",
    attribution: ${JSON.stringify(attribution)},
    width: 1000,
    height: 1000,
  },
`;
    const isRunning =
      e.src.includes("/running/products/") ||
      e.categorySlug === "running-shoes";
    if (isRunning) {
      runningSrc = runningSrc.replace(
        "export const RUNNING_PRODUCT_MEDIA: Record<string, RunningProductMediaSource> = {\n",
        `export const RUNNING_PRODUCT_MEDIA: Record<string, RunningProductMediaSource> = {\n${block}`,
      );
      addedRunning += 1;
    } else {
      catalogSrc = catalogSrc.replace(
        "export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n",
        `export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n${block}`,
      );
      addedCatalog += 1;
    }
  }

  fs.writeFileSync(runningPath, runningSrc);
  fs.writeFileSync(catalogPath, catalogSrc);
  return { addedRunning, addedCatalog };
}

const auditPath = path.join(
  ROOT,
  "data/staging/catalog-media-audit-2026-09-04.json",
);
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const gaps = (audit.gaps || []).filter(
  (g) =>
    g.reason !== "missing-provenance" &&
    (g.lifecycleStatus === "current" || g.lifecycleStatus === "unknown"),
);

const priority = (g) => {
  if (g.categorySlug === "running-shoes") return 0;
  if (g.categorySlug === "padel-shoes") return 1;
  if (g.categorySlug === "tennis-shoes") return 2;
  if (/racket|paddle|pickle|squash|badminton/.test(g.categorySlug || ""))
    return 3;
  return 5;
};
gaps.sort((a, b) => priority(a) - priority(b) || a.slug.localeCompare(b.slug));

console.log(`Fetching ${gaps.length} media gaps via www.runrepeat.com (curl)…`);

const results = [];
for (const g of gaps) {
  process.stdout.write(`… ${g.slug} `);
  let hit = tryRunRepeat(g);
  if (!hit) hit = tryZonaDePadel(g);
  // polite pause — RunRepeat rate-limits aggressive HTTP/2 clients
  await new Promise((r) => setTimeout(r, 350));
  if (!hit) {
    console.log("FAIL");
    results.push({
      id: g.productId,
      slug: g.slug,
      ok: false,
      categorySlug: g.categorySlug,
    });
    continue;
  }

  const dir = dirFor(g.categorySlug);
  const dest = path.join(ROOT, "public/images", dir, `${g.slug}-hero.jpg`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const written = await writeWebMaster(hit.buf, dest, { role: "hero" });
  const file = path.basename(written.dest);
  console.log(`OK ${written.bytes}`);
  results.push({
    id: g.productId,
    slug: g.slug,
    ok: true,
    src: `/images/${dir}/${file}`,
    sourceUrl: hit.pageUrl,
    licence: hit.licence,
    source: hit.source,
    categorySlug: g.categorySlug,
  });
}

const outJson = path.join(ROOT, "data/staging/media-gaps-batch.json");
fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ok);
const merged = mergeRegistryEntries(ok);
console.log(
  `\nDone ${ok.length}/${results.length} · registry +${merged.addedRunning} running +${merged.addedCatalog} catalog`,
);
console.log(`Wrote ${outJson}`);
