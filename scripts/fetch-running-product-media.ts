/**
 * Download licensed running shoe hero images declared in product-media.ts.
 *
 * npm run media:fetch-running-products
 * npm run media:fetch-running-products -- --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { RUNNING_PRODUCT_MEDIA } from "../src/content/running/product-media";
import { writeWebMaster } from "./lib/media-ingest.mjs";

const ROOT = path.join(process.cwd(), "public");

/** Remote fetch URL per product — kept here so product-media.ts stays static content. */
const REMOTE_BY_PRODUCT: Record<string, string> = {
  "prod-novablast-6":
    "https://images.asics.com/is/image/asics/1011C243_001_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  "prod-ghost-18":
    "https://www.brooksrunning.com/on/demandware.static/-/Sites-brooks-master-catalog/default/dw1fc29a95/original/110493/110493-172-l-ghost-18-mens-neutral-cushion-running-shoe.png",
  "prod-pegasus-42":
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/92073d56-fb22-4b19-9b4d-b06f9d419347/AIR+ZOOM+PEGASUS+42+ESS.png",
  "prod-clifton-10":
    "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/70028/346290/HOK2640_1000_1__93217.1720005450.jpg",
  "prod-bondi-9":
    "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/70469/349900/HOK2623_1000_1__33103.1722442702.jpg",
  "prod-endorphin-speed-5":
    "https://thekit.wolverineworldwide.com/match/media_lookup/S21007-140_1/?preset=dw-large",
  "prod-vaporfly-4":
    "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/5099975e-9d67-42dd-bfe3-1a18f13d1e95/ZOOMX+VAPORFLY+NEXT%254+4.png",
  "prod-kayano-32":
    "https://images.asics.com/is/image/asics/1011C052_002_SR_RT_GLB?$sfcc-product$&wid=800&hei=800",
  "prod-speedgoat-6":
    "https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/69718/343398/HOK2612_1000_1__02589.1719402454.jpg",
};

const dryRun = process.argv.includes("--dry-run");

async function main() {
  let ok = 0;
  let fail = 0;

  for (const [productId, entry] of Object.entries(RUNNING_PRODUCT_MEDIA)) {
    const remote = REMOTE_BY_PRODUCT[productId];
    const localPath = path.join(ROOT, entry.src.replace(/^\//, ""));

    if (!remote) {
      console.warn(`skip ${productId}: no remote URL configured`);
      continue;
    }

    if (dryRun) {
      console.log(`would fetch ${productId} → ${localPath}`);
      ok += 1;
      continue;
    }

    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    try {
      const res = await fetch(remote, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "image/*,*/*",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        console.error(`fail ${productId}: HTTP ${res.status}`);
        fail += 1;
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 8000) {
        console.error(`fail ${productId}: response too small (${buf.length} bytes)`);
        fail += 1;
        continue;
      }

      const written = await writeWebMaster(buf, localPath, { role: "hero" });
      console.log(
        `ok ${productId} (${written.bytes} bytes) → ${path.relative(ROOT, written.dest)}`,
      );
      ok += 1;
    } catch (err) {
      console.error(`fail ${productId}:`, err instanceof Error ? err.message : err);
      fail += 1;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main();
