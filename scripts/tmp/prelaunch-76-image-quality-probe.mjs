#!/usr/bin/env node
/**
 * Fix 76 — probe next/image qualities and HTML surfaces.
 * Usage: node scripts/tmp/prelaunch-76-image-quality-probe.mjs [base]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3010";
const HERO = "/images/running/products/vomero-18-hero.png";
const ROUTES = [
  ["/running/shoes", "product cards"],
  ["/products/nike-vomero-18", "PDP hero"],
  ["/reviews/nike-vomero-18", "Review"],
  ["/best/running-shoes", "Best"],
  ["/guides/how-to-choose-running-shoes", "Guide"],
  ["/brands/nike", "Brand"],
  ["/compare/asics-novablast-6-vs-brooks-ghost-18", "Compare"],
  ["/tools/running-shoe-finder", "Finder"],
];

async function fetchStatus(url) {
  const res = await fetch(url, { redirect: "manual" });
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    status: res.status,
    type: res.headers.get("content-type") || "",
    bytes: buf.length,
    body: buf,
  };
}

const lines = [];
function log(msg) {
  lines.push(msg);
  console.log(msg);
}

log(`base=${BASE}`);
log("=== optimizer (vomero-18-hero.png w=384) ===");
const optimizer = {};
for (const q of [65, 70, 75, 80, 100]) {
  const url = `${BASE}/_next/image?url=${encodeURIComponent(HERO)}&w=384&q=${q}`;
  const r = await fetchStatus(url);
  optimizer[q] = { status: r.status, type: r.type, bytes: r.bytes };
  log(`q=${q} -> ${r.status} ${r.type} ${r.bytes}B`);
}

log("=== HTML routes ===");
const routes = [];
for (const [path, label] of ROUTES) {
  const r = await fetchStatus(`${BASE}${path}`);
  const html = r.body.toString("utf8");
  const imgUrls = [...html.matchAll(/\/_next\/image\?[^"'\s]+/g)].map((m) =>
    m[0].replaceAll("&amp;", "&"),
  );
  const qCounts = {};
  for (const u of imgUrls) {
    const m = u.match(/[?&]q=(\d+)/);
    const q = m ? m[1] : "omit";
    qCounts[q] = (qCounts[q] || 0) + 1;
  }
  const sample = imgUrls.slice(0, 6);
  const imageStatuses = [];
  for (const u of sample) {
    const ir = await fetchStatus(`${BASE}${u}`);
    imageStatuses.push({
      q: (u.match(/[?&]q=(\d+)/) || [])[1] || "?",
      status: ir.status,
      bytes: ir.bytes,
    });
  }
  const broken = imageStatuses.filter((s) => s.status >= 400);
  routes.push({
    path,
    label,
    status: r.status,
    htmlBytes: r.bytes,
    nextImageCount: imgUrls.length,
    qCounts,
    sampleStatuses: imageStatuses,
    broken: broken.length,
  });
  log(
    `${r.status} ${label.padEnd(14)} ${path}  next/image=${imgUrls.length} q={${Object.entries(
      qCounts,
    )
      .map(([k, v]) => `${k}:${v}`)
      .join(",")}} sample=${imageStatuses
      .map((s) => `q${s.q}:${s.status}`)
      .join(",") || "none"} broken=${broken.length}`,
  );
}

const out = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  optimizer,
  routes,
};
const dest = join("docs/prelaunch/data/rc-76/image-quality-probe.json");
writeFileSync(dest, JSON.stringify(out, null, 2));
writeFileSync(
  "docs/prelaunch/data/rc-76/image-quality-probe.txt",
  lines.join("\n") + "\n",
);
log(`wrote ${dest}`);
const fail =
  [65, 70, 75].some((q) => optimizer[q].status !== 200) ||
  [80, 100].some((q) => optimizer[q].status !== 400) ||
  routes.some((r) => r.status !== 200 || r.broken > 0);
process.exit(fail ? 1 : 0);
