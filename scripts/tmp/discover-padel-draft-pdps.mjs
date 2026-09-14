/**
 * Discover SKU PDPs and packshot URLs for remaining draft padel rackets.
 * node scripts/tmp/discover-padel-draft-pdps.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/staging/padel-draft-pdp-discover.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const LISTINGS = [
  "https://www.zonadepadel.com/4-bullpadel-padel-rackets",
  "https://www.zonadepadel.es/4-bullpadel-padel-rackets",
  "https://www.zonadepadel.com/18-adidas-padel-rackets",
  "https://www.zonadepadel.com/7-head-padel-rackets",
  "https://www.zonadepadel.com/5-nox-padel-rackets",
  "https://www.zonadepadel.com/12-siux-padel-rackets",
  "https://www.zonadepadel.com/15-babolat-padel-rackets",
  "https://www.zonadepadel.com/20-drop-shot-padel-rackets",
  "https://www.zonadepadel.com/22-black-crown-padel-rackets",
  "https://www.zonadepadel.com/23-kuikma-padel-rackets",
  "https://www.padelreference.com/en/padel-rackets/bullpadel-padel-rackets",
  "https://www.padelreference.com/en/padel-rackets/adidas-padel-rackets",
  "https://www.padelreference.com/en/padel-rackets/head-padel-rackets",
  "https://www.padelreference.com/en/padel-rackets/babolat-padel-rackets",
  "https://allforpadel.com/en/54-padel-rackets",
  "https://www.padelnuestro.com/int/padel-rackets/adidas",
];

const NEEDLES = [
  ["prod-bullpadel-vertex-05-hybrid", /vertex[- ]?05[- ]?hybrid/i],
  ["prod-bullpadel-vertex-05-w", /vertex[- ]?05[- ]?w(?!onder)/i],
  ["prod-bullpadel-hack-04-hybrid", /hack[- ]?04[- ]?hybrid(?![- ]cloud)/i],
  ["prod-bullpadel-hack-04-comfort", /hack[- ]?04[- ]?comfort/i],
  ["prod-bullpadel-neuron-02-edge", /neuron[- ]?02[- ]?edge/i],
  ["prod-bullpadel-neuron-02", /neuron[- ]?02(?![- ]?edge|[- ]?cloud|[- ]?premier)/i],
  ["prod-bullpadel-xplo-comfort", /xplo[- ]?comfort/i],
  ["prod-bullpadel-xplo", /xplo(?![- ]?comfort)[- ]?(26|2026)?/i],
  ["prod-bullpadel-ionic-light", /ionic[- ]?light/i],
  ["prod-bullpadel-indiga-ctr", /indiga[- ]?ctr/i],
  ["prod-bullpadel-vertex-advance", /vertex[- ]?advance/i],
  ["prod-adidas-cross-it-light", /cross[- ]?it[- ]?light(?![- ]?pro)/i],
  ["prod-adidas-cross-it-ctrl", /cross[- ]?it[- ]?ctrl(?![- ]?3\.3)/i],
  ["prod-adidas-arrow-hit-attk", /arrow[- ]?hit(?![- ]?(ctrl|carbon|junior|light|hexagon))/i],
  ["prod-adidas-metalbone-3-3-2026", /metalbone[- ]?3\.3(?![- ]?ctrl)/i],
  ["prod-head-coello-motion", /coello[- ]?motion[- ]?2026/i],
  ["prod-head-coello-team", /coello[- ]?team[- ]?2026/i],
  ["prod-head-gravity-pro", /gravity[- ]?pro(?![- ]?x)/i],
  ["prod-head-gravity-motion", /gravity[- ]?motion/i],
  ["prod-head-speed-pro", /speed[- ]?pro(?![- ]?x)/i],
  ["prod-head-one-ultralight", /one[- ]?ultralight/i],
  ["prod-babolat-air-viper", /air[- ]?viper/i],
  ["prod-babolat-air-veron", /air[- ]?veron/i],
  ["prod-siux-electra", /electra[- ]?pro/i],
  ["prod-siux-fenix", /fenix[- ]?pro/i],
  ["prod-kuikma-pr-soft-500", /pr[- ]?soft[- ]?500|soft[- ]?500/i],
  ["prod-kuikma-pr-hybrid-carbon", /hybrid[- ]?carbon/i],
  ["prod-drop-shot-canyon-pro", /canyon[- ]?pro/i],
  ["prod-black-crown-special-one-soft", /special[- ]?one[- ]?soft/i],
  ["prod-nox-at10-attack-12k-2026", /attack[- ]?12k/i],
];

const KNOWN = [
  {
    id: "prod-bullpadel-vertex-05-hybrid",
    page: "https://www.zonadepadel.com/bullpadel/13550-bullpadel-vertex-05-hybrid-2026.html",
  },
  {
    id: "prod-bullpadel-hack-04-hybrid",
    page: "https://www.zonadepadel.es/bullpadel/13554-bullpadel-hack-04-hybrid-2026.html",
  },
  {
    id: "prod-siux-fenix",
    page: "https://www.zonadepadel.com/siux/13935-siux-fenix-pro-black-2026.html",
  },
  {
    id: "prod-siux-electra",
    page: "https://www.zonadepadel.com/siux/13932-siux-electra-pro-fire-red-2026.html",
  },
  {
    id: "prod-nox-at10-attack-12k-2026",
    page: "https://www.zonadepadel.com/nox/13772-nox-at10-luxury-genius-attack-12k-alum-xtrem-2026.html",
  },
  {
    id: "prod-head-coello-motion",
    page: "https://www.padelreference.com/en/padel-rackets/p/head-coello-motion-2026",
  },
  {
    id: "prod-babolat-air-viper",
    page: "https://www.babolat.com/us/air-viper-2.6/150176.html",
  },
  {
    id: "prod-babolat-air-veron",
    page: "https://www.babolat.com/us/air-veron-2.6/150180.html",
  },
];

function collectHrefs(html, pageUrl) {
  const urls = new Set();
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) {
    try {
      urls.add(new URL(m[1].replace(/&amp;/g, "&"), pageUrl).href.split("#")[0]);
    } catch {
      /* ignore */
    }
  }
  return [...urls];
}

function collectImages(html, pageUrl) {
  const urls = new Set();
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (og?.[1]) urls.add(og[1]);
  for (const m of html.matchAll(/https?:\/\/[^"'>\s]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s]*)?/gi)) {
    urls.add(m[0]);
  }
  for (const m of html.matchAll(/"(https?:\\\/\\\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    urls.add(m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"));
  }
  for (const m of html.matchAll(/src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)) {
    urls.add(m[1]);
  }
  return [...urls]
    .map((u) => {
      try {
        return new URL(u.replace(/&amp;/g, "&"), pageUrl).href;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });
  const html = await res.text();
  return { ok: res.ok, status: res.status, html, finalUrl: res.url };
}

function matchNeedles(url) {
  const hits = [];
  for (const [id, re] of NEEDLES) {
    if (re.test(url)) hits.push(id);
  }
  return hits;
}

async function main() {
  const found = {};
  for (const [id] of NEEDLES) found[id] = { pages: [] };

  for (const row of KNOWN) {
    found[row.id].pages.push(row.page);
  }

  for (const listing of LISTINGS) {
    try {
      const { ok, status, html, finalUrl } = await fetchHtml(listing);
      console.log(`LIST ${status} ${listing}`);
      if (!ok) continue;
      for (const href of collectHrefs(html, finalUrl || listing)) {
        for (const id of matchNeedles(href)) {
          if (!found[id].pages.includes(href)) found[id].pages.push(href);
        }
      }
    } catch (err) {
      console.log(`LIST FAIL ${listing} ${err.message}`);
    }
  }

  const pages = [];
  for (const [id, rec] of Object.entries(found)) {
    const unique = [...new Set(rec.pages)].slice(0, 6);
    rec.pages = unique;
    for (const page of unique) pages.push({ id, page });
  }

  const details = [];
  for (const { id, page } of pages) {
    try {
      const { ok, status, html, finalUrl } = await fetchHtml(page);
      const images = ok ? collectImages(html, finalUrl || page).slice(0, 12) : [];
      details.push({ id, page, status, ok, images, title: html.match(/<title>([^<]+)/i)?.[1] });
      console.log(`PDP ${status} ${id} ${page} imgs=${images.length}`);
    } catch (err) {
      details.push({ id, page, error: String(err.message || err) });
      console.log(`PDP FAIL ${id} ${page} ${err.message}`);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({ found, details }, null, 2));
  console.log(`wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
