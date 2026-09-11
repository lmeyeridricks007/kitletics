/**
 * Batch-download missing running shoe hero images via manufacturer CDN + SportsShoes.
 * node scripts/batch-fetch-running-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const OUT = path.join(process.cwd(), "public/images/running/products");
fs.mkdirSync(OUT, { recursive: true });

const products = [
  { id: "prod-superblast-2", slug: "superblast-2", q: "asics superblast 2" },
  { id: "prod-novablast-5", slug: "novablast-5", q: "asics novablast 5" },
  { id: "prod-nimbus-27", slug: "nimbus-27", q: "asics gel-nimbus 27" },
  { id: "prod-cumulus-27", slug: "cumulus-27", q: "asics gel-cumulus 27" },
  { id: "prod-metaspeed-sky-paris", slug: "metaspeed-sky-paris", q: "asics metaspeed sky" },
  { id: "prod-gt-2000-14", slug: "gt-2000-14", q: "asics gt-2000 14" },
  { id: "prod-pegasus-41", slug: "pegasus-41", q: "nike pegasus 41" },
  { id: "prod-vomero-18", slug: "vomero-18", q: "nike vomero 18" },
  { id: "prod-invincible-3", slug: "invincible-3", q: "nike invincible run 3" },
  { id: "prod-alphafly-3", slug: "alphafly-3", q: "nike alphafly 3" },
  { id: "prod-structure-26", slug: "structure-26", q: "nike structure 26" },
  { id: "prod-structure-plus", slug: "structure-plus", q: "nike structure plus" },
  { id: "prod-ghost-16", slug: "ghost-16", q: "brooks ghost 16" },
  { id: "prod-glycerin-22", slug: "glycerin-22", q: "brooks glycerin 22" },
  { id: "prod-glycerin-21", slug: "glycerin-21", q: "brooks glycerin 21" },
  { id: "prod-adrenaline-gts-25", slug: "adrenaline-gts-25", q: "brooks adrenaline gts 25" },
  { id: "prod-hyperion-max-2", slug: "hyperion-max-2", q: "brooks hyperion max 2" },
  { id: "prod-clifton-9", slug: "clifton-9", q: "hoka clifton 9" },
  { id: "prod-bondi-8", slug: "bondi-8", q: "hoka bondi 8" },
  { id: "prod-mach-6", slug: "mach-6", q: "hoka mach 6" },
  { id: "prod-clifton-pro", slug: "clifton-pro", q: "hoka clifton pro" },
  { id: "prod-endorphin-speed-4", slug: "endorphin-speed-4", q: "saucony endorphin speed 4" },
  { id: "prod-endorphin-pro-4", slug: "endorphin-pro-4", q: "saucony endorphin pro 4" },
  { id: "prod-endorphin-pro-3", slug: "endorphin-pro-3", q: "saucony endorphin pro 3" },
  { id: "prod-ride-18", slug: "ride-18", q: "saucony ride 18" },
  { id: "prod-triumph-22", slug: "triumph-22", q: "saucony triumph 22" },
  { id: "prod-peregrine-15", slug: "peregrine-15", q: "saucony peregrine 15" },
  { id: "prod-1080-v14", slug: "1080-v14", q: "new balance 1080 v14" },
  { id: "prod-1080-v13", slug: "1080-v13", q: "new balance 1080 v13" },
  { id: "prod-rebel-v5", slug: "rebel-v5", q: "new balance rebel v5" },
  { id: "prod-rebel-4", slug: "rebel-4", q: "new balance rebel v4" },
  { id: "prod-sc-elite-v4", slug: "sc-elite-v4", q: "new balance fuelcell elite v4" },
  { id: "prod-sc-trainer-v3", slug: "sc-trainer-v3", q: "new balance fuelcell trainer v3" },
  { id: "prod-boston-12", slug: "boston-12", q: "adidas boston 12" },
  { id: "prod-adios-pro-4", slug: "adios-pro-4", q: "adidas adios pro 4" },
  { id: "prod-adizero-evo-sl", slug: "adizero-evo-sl", q: "adidas adizero evo sl" },
  { id: "prod-cloudmonster-2", slug: "cloudmonster-2", q: "on cloudmonster 2" },
  { id: "prod-cloudsurfer-next", slug: "cloudsurfer-next", q: "on cloudsurfer next" },
  { id: "prod-torin-8", slug: "torin-8", q: "altra torin 8" },
  { id: "prod-escalante-4", slug: "escalante-4", q: "altra escalante 4" },
  { id: "prod-lone-peak-8", slug: "lone-peak-8", q: "altra lone peak 8" },
  { id: "prod-aero-glide-2", slug: "aero-glide-2", q: "salomon aero glide 2" },
  { id: "prod-sense-ride-5", slug: "sense-ride-5", q: "salomon sense ride 5" },
  { id: "prod-pulsar-trail-2", slug: "pulsar-trail-2", q: "salomon pulsar trail 2" },
  { id: "prod-deviate-nitro-3", slug: "deviate-nitro-3", q: "puma deviate nitro 3" },
  { id: "prod-magnify-nitro-2", slug: "magnify-nitro-2", q: "puma magnify nitro 2" },
  { id: "prod-wave-rider-28", slug: "wave-rider-28", q: "mizuno wave rider 28" },
  { id: "prod-wave-rebellion-pro-3", slug: "wave-rebellion-pro-3", q: "mizuno wave rebellion pro 3" },
  { id: "prod-specter-2", slug: "specter-2", q: "topo athletic specter 2" },
  { id: "prod-phantom-3", slug: "phantom-3", q: "topo athletic phantom 3" },
  { id: "prod-trailfly-ultra-g-300-max", slug: "trailfly-ultra-g-300-max", q: "inov8 trailfly ultra" },
  { id: "prod-novablast-4", slug: "novablast-4", q: "asics novablast 4" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DIRECT = {
  "prod-superblast-2": [
    "https://images.asics.com/is/image/asics/1013A124_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
    "https://images.asics.com/is/image/asics/1013A124_100_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  ],
  "prod-novablast-5": [
    "https://images.asics.com/is/image/asics/1011B974_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
    "https://images.asics.com/is/image/asics/1011B699_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  ],
  "prod-nimbus-27": [
    "https://images.asics.com/is/image/asics/1011B872_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
    "https://images.asics.com/is/image/asics/1011C051_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  ],
  "prod-cumulus-27": [
    "https://images.asics.com/is/image/asics/1011B870_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  ],
  "prod-gt-2000-14": [
    "https://images.asics.com/is/image/asics/1011B863_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  ],
  "prod-novablast-4": [
    "https://images.asics.com/is/image/asics/1011B593_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  ],
};

function isApparelTitle(title) {
  return /t-shirt|shirt|jacket|sock|hoodie|bra|legging|short(?!s shoe)/i.test(
    title,
  ) && !/shoe|trainer|running shoe/i.test(title);
}

async function fetchBuf(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 12000) return null;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("image") && buf[0] !== 0xff && buf[0] !== 0x89) return null;
    // Reject tiny error JPEGs / HTML
    if (buf.slice(0, 15).toString().includes("html")) return null;
    return { buf, ct, finalUrl: r.url };
  } catch {
    return null;
  }
}

async function sportsshoesSearch(q) {
  const url =
    "https://www.sportsshoes.com/search.php?search_query=" +
    encodeURIComponent(q);
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  const html = await r.text();
  const links = [
    ...html.matchAll(/href="(\/product\/[A-Z]{2,4}[0-9]+\/[^"]+)"/g),
  ].map((m) => m[1]);
  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["the", "and", "for"].includes(t));
  const scored = links
    .map((href) => {
      const h = href.toLowerCase();
      let score = 0;
      for (const t of tokens) if (h.includes(t)) score += 1;
      if (/shoe|trainer|running/.test(h)) score += 2;
      if (/shirt|sock|jacket|short|hoodie/.test(h)) score -= 6;
      return { href, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);

  for (const cand of scored.slice(0, 5)) {
    const pr = await fetch("https://www.sportsshoes.com" + cand.href, {
      headers: { "User-Agent": UA },
    });
    if (!pr.ok) continue;
    const ph = await pr.text();
    const title = (ph.match(/<h1[^>]*>([^<]+)/)?.[1] || "").replace(
      /&#x27;/g,
      "'",
    );
    if (isApparelTitle(title)) continue;
    const og = ph.match(/property="og:image" content="([^"]+)"/)?.[1];
    if (!og || /logo\.png|favicon/i.test(og)) continue;
    const img = await fetchBuf(og);
    if (!img) continue;
    return {
      ...img,
      pageUrl: "https://www.sportsshoes.com" + cand.href,
      title,
      licence: "retailer-authorized",
      source: "Authorized retailer (SportsShoes.com)",
    };
  }
  return null;
}

async function tryDirect(id) {
  for (const u of DIRECT[id] || []) {
    const img = await fetchBuf(u);
    if (img) {
      return {
        ...img,
        pageUrl: u,
        title: id,
        licence: "manufacturer-marketing",
        source: "Manufacturer product CDN",
      };
    }
  }
  return null;
}

const results = [];
for (const p of products) {
  process.stdout.write(`… ${p.slug} `);
  let hit = await tryDirect(p.id);
  if (!hit) hit = await sportsshoesSearch(p.q);
  if (!hit) {
    console.log("FAIL");
    results.push({ ...p, ok: false });
    continue;
  }
  const dest = path.join(OUT, `${p.slug}-hero.jpg`);
  const written = await writeWebMaster(hit.buf, dest, { role: "hero" });
  const file = path.basename(written.dest);
  console.log("OK", written.bytes, `(${hit.title?.slice?.(0, 40) || ""})`);
  results.push({
    id: p.id,
    slug: p.slug,
    ok: true,
    src: `/images/running/products/${file}`,
    sourceUrl: hit.pageUrl,
    licence: hit.licence,
    source: hit.source,
    width: written.width,
    height: written.height,
  });
}

fs.writeFileSync(
  path.join(process.cwd(), "data/staging/running-media-batch.json"),
  JSON.stringify(results, null, 2),
);
console.log(
  `\nDone ${results.filter((r) => r.ok).length}/${results.length} → data/staging/running-media-batch.json`,
);
