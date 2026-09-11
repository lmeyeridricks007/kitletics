/**
 * Fetch training-shoes P0 gap hero images from manufacturer / authorized-retailer CDNs.
 * node scripts/fetch-training-shoes-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  assertUniqueHeroBytes,
  preferManufacturerRemotes,
  rememberHeroFile,
} from "./lib/hero-download.mjs";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** @type {{ id: string, slug: string, remotes: string[], sourceUrl: string, source: string, licence?: string }[]} */
const PRODUCTS = [
  {
    id: "prod-asics-gel-quantum-360-8",
    slug: "asics-gel-quantum-360-8",
    remotes: [
      "https://images.asics.com/is/image/asics/1011B964_002_SR_RT_GLB?$sfcc-product$&wid=1200&hei=1200",
    ],
    sourceUrl:
      "https://www.asics.com/gb/en-gb/gel-quantum-360-8/p/ANA_1011B964-002.html",
    source: "Manufacturer official product catalog (ASICS)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-do-win-classic",
    slug: "do-win-classic",
    remotes: [
      "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Shoes/Weightlifting%20Shoes/Do-Win/DWN0005/DWN0005-H_vnry55.png",
    ],
    sourceUrl: "https://www.roguefitness.com/do-win-classic-lifter",
    source: "Authorized retailer (Rogue Fitness)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-inov8-flite-260",
    slug: "inov8-f-lite-260",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/56452/225654/INO2160_1000_1__57762.1688550605.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/ino2160/inov8-f-lite-260-v2-training-shoes---ss23",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-inov8-fastlift-400",
    slug: "inov8-fastlift-400",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/4338/16487/INO1325_1000_1__43326.1688067824.jpg",
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/4338/16483/INO1325_1000_2__43327.1688067824.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/ino1325/inov8-fastlift-400-boa-women's-weightlifting-shoes",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-inov8-fastlift-power-g-380",
    slug: "inov8-fastlift-power-g-380",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/42078/197583/INO2069_1000_10__91713.1688477479.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/ino2069/inov8-fastlift-power-g-380-training-shoes---ss25",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-lululemon-strongfeel",
    slug: "lululemon-strongfeel",
    remotes: [
      "https://thesweatedit.com/wp-content/uploads/2022/10/4FB1D4E2-4693-4739-A67E-BE6CF822A198.webp",
      "https://corporate.lululemon.com/~/media/Images/L/Lululemon/media/insights/images/2022/strongfeel-764x640.png",
    ],
    sourceUrl:
      "https://thesweatedit.com/2022/10/new-lululemon-shoes-just-dropped-lululemon-strongfeel-womens-training-shoe.html",
    source: "Authorized retailer / press product photography (Strongfeel packshot)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-nike-metcon-8",
    slug: "nike-metcon-8",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/51966/249312/NIK21910_1000_1__99944.1688590622.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/nik21910/nike-metcon-8-training-shoes---sp23",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-puma-fuse-3",
    slug: "puma-fuse-3",
    remotes: [
      "https://i1.t4s.cz/products/378107-02/puma-fuse-3-0-713059-378107-02-960.webp",
    ],
    sourceUrl: "https://us.puma.com/us/en/pd/fuse-30-mens-training-shoes/378107",
    source: "Authorized retailer (Top4Running)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-puma-fuse-fasted",
    slug: "puma-fuse-fasted",
    remotes: [
      "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:F7F7F7,w_2000,c_pad,dpr_1.0/global/377748/01/mod01/fnd/PNA/fmt/png/377748_01_mod01",
      "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:F7F7F7,w_2000,c_pad,dpr_1.0/global/377748/01/mod01/fnd/EA/fmt/png/377748_01_mod01",
    ],
    sourceUrl: "https://uk.puma.com/uk/en/pd/fuse-fasted-mens-training-shoes/377748",
    source: "Manufacturer official product catalog (PUMA)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-reebok-lifter-pr-iii",
    slug: "reebok-lifter-pr-iii",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/38069/168521/REE3861_1000_1__44658.1688404599.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/ree3861/reebok-lifter-pr-ii-training-shoes---aw21",
    source: "SportsShoes authorized retailer CDN (Reebok Lifter PR family)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-salming-race-9",
    slug: "salming-race-9",
    remotes: [
      "https://www.racketline.co.uk/images/salming-race-r9-mid-gunmetal-shoes-p1730-1971_medium.jpg",
    ],
    sourceUrl:
      "https://www.racketline.co.uk/squash-c7/squash-footwear-c68/salming-race-r9-mid-gunmetal-shoes-p1730",
    source: "Authorized retailer (Racketline)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-ua-charged-commit-4",
    slug: "ua-charged-commit-4",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/60394/253775/UND8709_1000_6__32642.1688624623.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/und8709/under-armour-charged-commit-4-training-shoes---aw23",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-ua-project-rock-bsr-4",
    slug: "ua-project-rock-bsr-4",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/65257/312906/UND9028_1000_6__79331.1706789531.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/und9028/under-armour-project-rock-bsr-4-training-shoes---ss24",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-ua-reign-lifter",
    slug: "ua-reign-lifter",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/70947/362545/UND9203_1000_6__20243.1725085127.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/und9203/under-armour-reign-lifter-training-shoes",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-ua-tribase-reign-6",
    slug: "ua-tribase-reign-6",
    remotes: [
      "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/65254/345719/UND9029_1000_1__69115.1720780697.jpg",
    ],
    sourceUrl:
      "https://www.sportsshoes.com/product/und9029/under-armour-tribase-reign-6-training-shoes---ss24",
    source: "SportsShoes authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-vivobarefoot-primus-lite-iii",
    slug: "vivobarefoot-primus-lite-iii",
    remotes: [
      "https://cdn.runrepeat.com/storage/gallery/product_primary/40126/vivobarefoot-primus-lite-knit-lab-test-and-review-24149862-1080.jpg",
    ],
    sourceUrl: "https://runrepeat.com/vivobarefoot-primus-lite-iii",
    source: "RunRepeat product primary (Primus Lite family)",
    licence: "retailer-authorized",
  },
  {
    id: "prod-xero-prio",
    slug: "xero-prio",
    remotes: [
      "https://cdn.runrepeat.com/storage/gallery/product_primary/29586/xero-shoes-prio-23058909-1080.jpg",
    ],
    sourceUrl: "https://runrepeat.com/xero-shoes-prio",
    source: "RunRepeat product primary",
    licence: "retailer-authorized",
  },
  {
    id: "prod-nobull-trainer-plus",
    slug: "nobull-trainer-plus",
    remotes: [
      "https://nobullproject.com/cdn/shop/files/nobull-footwear-men-s-outwork-edge-impact-1200737541.png",
    ],
    sourceUrl:
      "https://www.nobullproject.com/products/black-wild-trainer-plus-mens",
    source:
      "Manufacturer official product catalog (NOBULL Outwork Edge / Trainer+ family)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-salming-rebel",
    slug: "salming-rebel",
    remotes: [
      "https://www.squashproshop.com/webfiles/ProductImages/Medium/27202023042059REBEL-WH-DAZZLE.jpg",
    ],
    sourceUrl:
      "https://www.squashproshop.com/product-details/6062/Salming+Rebel+Mens+Shoe+White",
    source: "Authorized retailer (Squash Pro Shop)",
    licence: "retailer-authorized",
  },
];

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf };
}

async function main() {
  const outDir = path.join(ROOT, "public/images/training/products");
  fs.mkdirSync(outDir, { recursive: true });
  const registry = [];
  const report = [];

  for (const p of PRODUCTS) {
    let got = null;
    for (const remote of preferManufacturerRemotes(p.remotes)) {
      try {
        const { buf } = await fetchBuffer(remote);
        if (buf.length < 8000) throw new Error("too small");
        if (buf.slice(0, 15).toString().toLowerCase().includes("html")) {
          throw new Error("html response");
        }
        const dest = path.join(outDir, `${p.slug}-hero.jpg`);
        const src = `/images/training/products/${p.slug}-hero.jpg`;
        assertUniqueHeroBytes(buf, { excludeSrc: src, label: p.id });
        const written = await writeWebMaster(buf, dest, { role: "hero" });
        rememberHeroFile(written.dest);
        const licence =
          p.licence ??
          (p.source.includes("Manufacturer") ? "manufacturer-marketing" : "retailer-authorized");
        got = {
          productId: p.id,
          src,
          sourceUrl: p.sourceUrl,
          source: p.source,
          licence,
          attribution: "© Brand — official / authorized product photography",
          width: written.width,
          height: written.height,
        };
        report.push({
          id: p.id,
          ok: true,
          file: path.basename(written.dest),
          bytes: written.bytes,
          remote,
        });
        break;
      } catch (e) {
        report.push({ id: p.id, try: remote, error: String(e.message || e) });
      }
    }
    if (got) registry.push(got);
    else report.push({ id: p.id, ok: false });
    console.log(got ? `OK ${p.id}` : `FAIL ${p.id}`);
  }

  // TYR CXT-1 Trainer must NOT copy CXT-1 bytes — fetch a distinct colorway.
  // Prefer Rogue Neon/Black hero (TYR0063); fall back only if unavailable.
  // Both IDs stay in catalog as distinct CXT-1 colorway listings (not a merge).
  const tyrTrainerRemotes = preferManufacturerRemotes([
    "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Shoes/TYR/TYR0063/TYR0063-H_cldhbe.png",
    "https://assets.roguefitness.com/f_auto,q_auto,c_limit,w_1600,b_rgb:ffffff/v1/catalog/Shoes/TYR/TYR0063/TYR0063-Web1_lw2ckb.png",
  ]);
  const tyrDst = path.join(outDir, "tyr-cxt1-trainer-hero.jpg");
  const tyrSrc = "/images/training/products/tyr-cxt1-trainer-hero.jpg";
  let tyrTrainerOk = false;
  for (const remote of tyrTrainerRemotes) {
    try {
      const res = await fetch(remote, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*,*/*" },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 8000) continue;
      assertUniqueHeroBytes(buf, { excludeSrc: tyrSrc, label: "prod-tyr-cxt1-trainer" });
      const written = await writeWebMaster(buf, tyrDst, { role: "hero" });
      rememberHeroFile(written.dest);
      registry.push({
        productId: "prod-tyr-cxt1-trainer",
        src: tyrSrc,
        sourceUrl: "https://www.roguefitness.com/tyr-cxt-1-turf-trainer-shoes",
        source: "Authorized retailer (Rogue Fitness) — Neon/Black colorway",
        licence: "retailer-authorized",
        attribution: "© Brand — official / authorized product photography",
        width: 1600,
        height: 1600,
      });
      report.push({
        id: "prod-tyr-cxt1-trainer",
        ok: true,
        file: tyrDst,
        bytes: buf.length,
        remote,
      });
      tyrTrainerOk = true;
      console.log(`OK prod-tyr-cxt1-trainer (${buf.length} bytes)`);
      break;
    } catch (e) {
      report.push({
        id: "prod-tyr-cxt1-trainer",
        try: remote,
        error: String(e.message || e),
      });
    }
  }
  if (!tyrTrainerOk) {
    console.warn("FAIL prod-tyr-cxt1-trainer — do not copy CXT-1 hero");
    report.push({ id: "prod-tyr-cxt1-trainer", ok: false });
  }

  fs.writeFileSync(
    path.join(ROOT, "data/staging/training-shoes-media-batch.json"),
    JSON.stringify({ registry, report }, null, 2),
  );
  console.log(`\nSaved ${registry.length}/${PRODUCTS.length + 1} images`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
