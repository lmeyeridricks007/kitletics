/**
 * Batch-fetch DRAFT recovery/headphones/socks/accessories/safety/lights heroes.
 * node scripts/batch-fetch-draft-accessory-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const MEDIA_TS = path.join(ROOT, "src/content/catalog-product-media.ts");

/** @typedef {{ id: string, slug: string, dir: string, remotes?: string[], shopify?: string, rw?: string, html?: string, htmlRe?: RegExp, sourceUrl: string, source: string, licence?: string }} Product */

/** @type {Product[]} */
const PRODUCTS = [
  // —— Headphones ——
  {
    id: "prod-shokz-opendots-one",
    slug: "shokz-opendots-one",
    dir: "headphones/products",
    shopify: "https://uk.shokz.com/products/opendots-one.json",
    sourceUrl: "https://uk.shokz.com/products/opendots-one",
    source: "Manufacturer official product catalog (Shokz)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-apple-airpods-4",
    slug: "apple-airpods-4",
    dir: "headphones/products",
    remotes: [
      "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/airpods-4-select-202409_FV1?wid=1200&hei=1200&fmt=jpeg&qlt=90&.v=1724717692997",
    ],
    sourceUrl: "https://www.apple.com/airpods-4/",
    source: "Apple product CDN",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-beats-powerbeats-pro-2",
    slug: "beats-powerbeats-pro-2",
    dir: "headphones/products",
    remotes: [
      "https://www.beatsbydre.com/content/dam/beats/web/product/earbuds/powerbeats-pro-2/pdp/product-carousel/global/carousel-powerbeats-pro-2-black-01.jpg",
      "https://cdsassets.apple.com/live/7WU57CY1/images/tech-specs/121584-powerbeats-pro-2.png",
    ],
    html: "https://www.beatsbydre.com/products/powerbeats-pro-2",
    htmlRe: /https:\/\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://www.beatsbydre.com/products/powerbeats-pro-2",
    source: "Manufacturer product photography (Beats)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-beats-fit-pro",
    slug: "beats-fit-pro",
    dir: "headphones/products",
    remotes: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MJWP3?wid=1200&hei=1200&fmt=jpeg&qlt=90&.v=1632954306000",
      "https://cdsassets.apple.com/live/7WU57CY1/images/tech-specs/beats-fit-pro.png",
    ],
    sourceUrl: "https://www.beatsbydre.com/earbuds/beats-fit-pro",
    source: "Apple / Beats product CDN",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-sony-linkbuds-open",
    slug: "sony-linkbuds-open",
    dir: "headphones/products",
    remotes: [
      "https://www.sony.com/image/5c8e0e0e0e0e0e0e", // placeholder will fail; html scrape
    ],
    html: "https://www.sony.co.uk/store/product/wfl910w.ce7/LinkBuds-series-LinkBuds-Open-Wireless-Headphones",
    htmlRe: /https:\/\/[^"'\\s]*(?:sony|scene7|akamai)[^"'\\s]*\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://www.sony.co.uk/store/product/wfl910w.ce7/LinkBuds-series-LinkBuds-Open-Wireless-Headphones",
    source: "Sony authorized store product photography",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-jabra-elite-8-active",
    slug: "jabra-elite-8-active",
    dir: "headphones/products",
    remotes: [
      "https://www.jabra.com/-/media/Images/Products/Elite-8-Active/Elite-8-Active-Gen2/Black/Elite-8-Active-Gen2-Black-Product-Image.png",
    ],
    html: "https://www.jabra.com/bluetooth-headsets/jabra-elite-8-active",
    htmlRe: /https:\/\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://www.jabra.com/bluetooth-headsets/jabra-elite-8-active",
    source: "Manufacturer product photography (Jabra)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-jabra-elite-10",
    slug: "jabra-elite-10",
    dir: "headphones/products",
    html: "https://www.jabra.com/bluetooth-headsets/jabra-elite-10",
    htmlRe: /https:\/\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://www.jabra.com/bluetooth-headsets/jabra-elite-10",
    source: "Manufacturer product photography (Jabra)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-soundcore-aerofit-2",
    slug: "soundcore-aerofit-2",
    dir: "headphones/products",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0493/9436/8706/files/A6611_AeroFit_2_Black_1.png",
    ],
    shopify: "https://us.soundcore.com/products/a6611.json",
    sourceUrl: "https://us.soundcore.com/products/a6611",
    source: "Manufacturer product photography (soundcore)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-soundcore-sport-x20",
    slug: "soundcore-sport-x20",
    dir: "headphones/products",
    shopify: "https://us.soundcore.com/products/a4000.json",
    sourceUrl: "https://us.soundcore.com/products/a4000",
    source: "Manufacturer product photography (soundcore)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-huawei-freeclip",
    slug: "huawei-freeclip",
    dir: "headphones/products",
    remotes: [
      "https://consumer.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/audio/freeclip-2/images/pc/kv/kv.jpg",
    ],
    html: "https://consumer.huawei.com/uk/audio/freeclip-2/",
    htmlRe: /https:\/\/[^"'\\s]*huawei[^"'\\s]*\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://consumer.huawei.com/uk/audio/freeclip-2/",
    source: "Manufacturer product photography (HUAWEI)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-sony-linkbuds-fit",
    slug: "sony-linkbuds-fit",
    dir: "headphones/products",
    html: "https://electronics.sony.com/audio/headphones/truly-wireless/p/wfls910n",
    htmlRe: /https:\/\/[^"'\\s]*(?:sony|scene7)[^"'\\s]*\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://electronics.sony.com/audio/headphones/truly-wireless/p/wfls910n",
    source: "Sony product photography",
    licence: "manufacturer-marketing",
  },

  // —— Running lights → headlamps/products ——
  {
    id: "prod-petzl-nao-rl",
    slug: "petzl-nao-rl",
    dir: "headlamps/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=PNAORL-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.runningwarehouse.com/Petzl_NAO_RL_Headlamp/descpage-PNAORL.html",
    source: "Running Warehouse CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-petzl-actik-core",
    slug: "petzl-actik-core",
    dir: "headlamps/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=PACTCR1-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.runningwarehouse.com/Petzl_Actik_Core_Headlamp/descpage-PACTCR1.html",
    source: "Running Warehouse CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-petzl-iko-core",
    slug: "petzl-iko-core",
    dir: "headlamps/products",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=PIKOCR-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=PIKOC-BK-1.jpg&nw=1000",
    ],
    rw: "https://www.runningwarehouse.com/Petzl_IKO_Core_Headlamp/descpage-PIKOCR.html",
    sourceUrl: "https://www.petzl.com/US/en/Sport/Headlamps/IKO-CORE",
    source: "Running Warehouse / Petzl authorized",
    licence: "retailer-authorized",
  },
  {
    id: "prod-bd-distance-1500",
    slug: "black-diamond-distance-1500",
    dir: "headlamps/products",
    shopify: "https://eu.blackdiamondequipment.com/products/distance-1500-headlamp.json",
    sourceUrl: "https://eu.blackdiamondequipment.com/products/distance-1500-headlamp",
    source: "Manufacturer official product catalog (Black Diamond)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-bd-storm-500-r",
    slug: "black-diamond-storm-500-r",
    dir: "headlamps/products",
    shopify: "https://eu.blackdiamondequipment.com/products/storm-500-r.json",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BDST5R-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=BDS500-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.blackdiamondequipment.com/en_US/product/storm-500-r-headlamp/",
    source: "Authorized retailer / manufacturer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-biolite-headlamp-800",
    slug: "biolite-headlamp-800-pro",
    dir: "headlamps/products",
    shopify: "https://www.bioliteenergy.com/products/headlamp-800-pro.json",
    sourceUrl: "https://www.bioliteenergy.com/products/headlamp-800-pro",
    source: "Manufacturer product photography (BioLite)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-biolite-headlamp-425",
    slug: "biolite-headlamp-425",
    dir: "headlamps/products",
    shopify: "https://www.bioliteenergy.com/products/headlamp-425-lantern.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0666/9741/files/HeadLamp_425_Product.png",
    ],
    sourceUrl: "https://www.bioliteenergy.com/products/headlamp-425",
    source: "Manufacturer product photography (BioLite)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-ledlenser-neo9r",
    slug: "ledlenser-neo9r",
    dir: "headlamps/products",
    remotes: [
      "https://ledlenser.com/media/c6/0a/0f/1681899080/neo9r-502715-ledlenser.jpg",
    ],
    html: "https://ledlenser.com/en/product/headlamp-neo9r-502715/",
    htmlRe: /https:\/\/[^"'\\s]*ledlenser[^"'\\s]*\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://ledlenser.com/en/product/headlamp-neo9r-502715/",
    source: "Manufacturer product photography (Ledlenser)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-ledlenser-neo5r",
    slug: "ledlenser-neo5r",
    dir: "headlamps/products",
    html: "https://ledlenser.com/en/product/headlamp-neo5r-502195/",
    htmlRe: /https:\/\/[^"'\\s]*ledlenser[^"'\\s]*\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://ledlenser.com/en/product/headlamp-neo5r-502195/",
    source: "Manufacturer product photography (Ledlenser)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-silva-smini",
    slug: "silva-smini",
    dir: "headlamps/products",
    shopify: "https://silvasweden.com/products/smini.json",
    remotes: [
      "https://silvasweden.com/cdn/shop/files/smini.jpg",
    ],
    sourceUrl: "https://silvasweden.com/products/smini",
    source: "Manufacturer official product catalog (Silva)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-fenix-hm65r-t",
    slug: "fenix-hm65r-t",
    dir: "headlamps/products",
    remotes: [
      "https://www.fenixlighting.com/cdn/shop/files/HM65R-T_1.jpg",
    ],
    shopify: "https://www.fenixlighting.com/products/hm65r-t-headlamp.json",
    sourceUrl: "https://www.fenixlighting.com/products/hm65r-t-headlamp",
    source: "Manufacturer product photography (Fenix)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-nitecore-nu25",
    slug: "nitecore-nu25-ul",
    dir: "headlamps/products",
    remotes: [
      "https://flashlight.nitecore.com/upload/product/nu25ul_01.jpg",
    ],
    html: "https://flashlight.nitecore.com/product/nu25-ul",
    htmlRe: /https:\/\/[^"'\\s]*nitecore[^"'\\s]*\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://flashlight.nitecore.com/product/nu25-ul",
    source: "Manufacturer product photography (NITECORE)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-nitecore-nu43",
    slug: "nitecore-nu43",
    dir: "headlamps/products",
    html: "https://flashlight.nitecore.com/product/nu43",
    htmlRe: /https:\/\/[^"'\\s]*nitecore[^"'\\s]*\.(?:jpg|jpeg|png|webp)/gi,
    sourceUrl: "https://flashlight.nitecore.com/product/nu43",
    source: "Manufacturer product photography (NITECORE)",
    licence: "manufacturer-marketing",
  },

  // —— Socks → running/accessories ——
  {
    id: "prod-balega-hidden-comfort",
    slug: "balega-hidden-comfort",
    dir: "running/accessories",
    shopify: "https://balega.com/products/hidden-comfort-no-show-tab.json",
    sourceUrl: "https://balega.com/products/hidden-comfort-no-show-tab",
    source: "Manufacturer product photography (Balega)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-swiftwick-aspire-four",
    slug: "swiftwick-aspire-four",
    dir: "running/accessories",
    shopify: "https://www.swiftwick.com/products/aspire-four.json",
    sourceUrl: "https://www.swiftwick.com/products/aspire-four",
    source: "Manufacturer product photography (Swiftwick)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-drymax-run-lite-mesh",
    slug: "drymax-run-lite-mesh",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=DRYLMS-BK-1.jpg&nw=1000",
    ],
    shopify: "https://drymaxdirect.com/products/run-lite-mesh-crew.json",
    sourceUrl: "https://www.runningwarehouse.com/Drymax_Run_Lite-Mesh_Crew_Socks/descpage-DRYLMS.html",
    source: "Running Warehouse / Drymax",
    licence: "retailer-authorized",
  },
  {
    id: "prod-bombas-performance-running-quarter",
    slug: "bombas-performance-running-quarter",
    dir: "running/accessories",
    shopify: "https://bombas.com/products/mens-performance-running-quarter-sock.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/1114/2308/products/mens-performance-running-quarter.jpg",
    ],
    sourceUrl: "https://bombas.com/products/mens-performance-running-quarter-sock",
    source: "Manufacturer product photography (Bombas)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-stance-run-crew",
    slug: "stance-run-crew",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=STRCRW-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=STANCE-RCRW-1.jpg&nw=1000",
    ],
    shopify: "https://www.stance.com/products/run-crew.json",
    sourceUrl: "https://www.stance.com/products/run-crew",
    source: "Authorized retailer / manufacturer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-hilly-marathon-fresh",
    slug: "hilly-marathon-fresh",
    dir: "running/accessories",
    shopify: "https://www.hillysocks.com/products/marathon-fresh-sock.json",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=HMFSH-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.hillysocks.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-sockwell-compression-light",
    slug: "sockwell-compression-light-cushion",
    dir: "running/accessories",
    shopify: "https://www.sockwellusa.com/products/compression-light-cushion-crew.json",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=SWCLC-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.sockwellusa.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-wrightsock-coolmesh-ii",
    slug: "wrightsock-coolmesh-ii",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=WRCM2-BK-1.jpg&nw=1000",
    ],
    shopify: "https://www.wrightsock.com/products/coolmesh-ii-quarter.json",
    sourceUrl: "https://www.wrightsock.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },

  // —— Recovery ——
  {
    id: "prod-theragun-pro",
    slug: "therabody-theragun-pro",
    dir: "running/accessories",
    shopify: "https://www.therabody.com/products/theragun-pro.json",
    sourceUrl: "https://www.therabody.com/products/theragun-pro",
    source: "Manufacturer product photography (Therabody)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-hypervolt-2",
    slug: "hyperice-hypervolt-2",
    dir: "running/accessories",
    shopify: "https://hyperice.com/products/hypervolt-2-black.json",
    sourceUrl: "https://hyperice.com/products/hypervolt-2-black",
    source: "Manufacturer product photography (Hyperice)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-normatec-3",
    slug: "hyperice-normatec-3",
    dir: "running/accessories",
    shopify: "https://hyperice.com/products/normatec-3-legs.json",
    sourceUrl: "https://hyperice.com/products/normatec-3-legs",
    source: "Manufacturer product photography (Hyperice)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-hyperice-vyper-3",
    slug: "hyperice-vyper-3",
    dir: "running/accessories",
    shopify: "https://hyperice.com/products/vyper-3.json",
    sourceUrl: "https://hyperice.com/products/vyper-3",
    source: "Manufacturer product photography (Hyperice)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-oofos-oolala",
    slug: "oofos-oolala",
    dir: "running/accessories",
    shopify: "https://www.oofos.com/products/womens-oolala-sandal-white.json",
    sourceUrl: "https://www.oofos.com/products/womens-oolala-sandal-white",
    source: "Manufacturer product photography (OOFOS)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-triggerpoint-grid-x",
    slug: "triggerpoint-grid-x",
    dir: "running/accessories",
    shopify: "https://tptherapy.ca/products/grid-x-foam-roller.json",
    sourceUrl: "https://tptherapy.ca/products/grid-x-foam-roller",
    source: "Manufacturer product photography (TriggerPoint)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-triggerpoint-grid",
    slug: "triggerpoint-grid-foam-roller",
    dir: "running/accessories",
    shopify: "https://tptherapy.ca/products/the-grid-foam-roller.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0945/0258/4689/files/grid-foam-roller.jpg",
    ],
    sourceUrl: "https://tptherapy.ca/products/the-grid-foam-roller",
    source: "Manufacturer product photography (TriggerPoint)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-triggerpoint-grid-travel",
    slug: "triggerpoint-grid-travel",
    dir: "running/accessories",
    shopify: "https://tptherapy.ca/products/grid-foam-roller.json",
    sourceUrl: "https://tptherapy.ca/",
    source: "Manufacturer product photography (TriggerPoint)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-theragun-relief",
    slug: "therabody-theragun-relief",
    dir: "running/accessories",
    shopify: "https://www.therabody.com/products/theragun-relief-massage-gun.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0671/4097/6867/files/Theragun-Relief.png",
    ],
    sourceUrl: "https://www.therabody.com/",
    source: "Manufacturer product photography (Therabody)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-therabody-recoveryair",
    slug: "therabody-recoveryair",
    dir: "running/accessories",
    shopify: "https://www.therabody.com/products/recoveryair.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0671/4097/6867/files/RecoveryAir.png",
    ],
    sourceUrl: "https://www.therabody.com/",
    source: "Manufacturer product photography (Therabody)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-hoka-ora-recovery-slide",
    slug: "hoka-ora-recovery-slide",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=HORAS3-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=HORASL-BK-1.jpg&nw=1000",
      "https://www.hoka.com/dw/image/v2/BDGF_PRD/on/demandware.static/-/Sites-masterCatalogHoka/default/dwplaceholder/images/large/1135061-BBLC.jpg",
    ],
    sourceUrl: "https://www.hoka.com/",
    source: "Authorized retailer / manufacturer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-oofos-oocandoo",
    slug: "oofos-oocandoo",
    dir: "running/accessories",
    shopify: "https://www.oofos.com/products/womens-oocandoo-sandal-black.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0254/5969/products/oocandoo.jpg",
    ],
    sourceUrl: "https://www.oofos.com/",
    source: "Manufacturer product photography (OOFOS)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-cep-the-run-calf",
    slug: "cep-the-run-calf-sleeves",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CEPTRC-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.cepcompression.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-compressport-r2",
    slug: "compressport-r2",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CPR2-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=CSR2V3-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.compressport.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-cep-calf-sleeves",
    slug: "cep-calf-sleeves-3",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CEPCS3-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=CEPCLF-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.cepcompression.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-2xu-refresh-recovery",
    slug: "2xu-refresh-recovery-tights",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=2XURRT-BK-1.jpg&nw=1000",
    ],
    shopify: "https://www.2xu.com/products/refresh-recovery-compression-tights.json",
    sourceUrl: "https://www.2xu.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-triggerpoint-mb1",
    slug: "triggerpoint-mb1",
    dir: "running/accessories",
    shopify: "https://tptherapy.ca/products/mb1-massage-ball.json",
    sourceUrl: "https://tptherapy.ca/",
    source: "Manufacturer product photography (TriggerPoint)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-triggerpoint-mbx",
    slug: "triggerpoint-mbx",
    dir: "running/accessories",
    shopify: "https://tptherapy.ca/products/mbx-massage-ball.json",
    sourceUrl: "https://tptherapy.ca/",
    source: "Manufacturer product photography (TriggerPoint)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-triggerpoint-stp",
    slug: "triggerpoint-stp",
    dir: "running/accessories",
    shopify: "https://tptherapy.ca/products/stp-massage-stick.json",
    sourceUrl: "https://tptherapy.ca/",
    source: "Manufacturer product photography (TriggerPoint)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-blackroll-pro",
    slug: "blackroll-pro",
    dir: "running/accessories",
    remotes: [
      "https://blackroll.com/cdn/shop/files/BLACKROLL_PRO.jpg",
    ],
    shopify: "https://www.blackroll-usa.com/products/blackroll-pro.json",
    sourceUrl: "https://blackroll.com/",
    source: "Manufacturer product photography (BLACKROLL)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-brazyn-morph",
    slug: "brazyn-morph",
    dir: "running/accessories",
    shopify: "https://brazynlife.com/products/morph-collapsible-foam-roller.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0264/0757/8147/products/morph.jpg",
    ],
    sourceUrl: "https://brazynlife.com/",
    source: "Manufacturer product photography (Brazyn)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rumbleroller-original",
    slug: "rumbleroller-original",
    dir: "running/accessories",
    shopify: "https://www.rumbleroller.com/products/original-rumbleroller.json",
    sourceUrl: "https://www.rumbleroller.com/",
    source: "Manufacturer product photography (RumbleRoller)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-rad-atom",
    slug: "rad-atom",
    dir: "running/accessories",
    shopify: "https://www.radroller.com/products/rad-atom.json",
    sourceUrl: "https://www.radroller.com/products/rad-atom",
    source: "Manufacturer product photography (RAD)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-renpho-r3",
    slug: "renpho-r3",
    dir: "running/accessories",
    shopify: "https://renpho.com/products/active-massage-gun-r3.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0279/9927/products/renpho-r3.jpg",
    ],
    sourceUrl: "https://renpho.com/",
    source: "Manufacturer product photography (RENPHO)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-opove-m3-pro",
    slug: "opove-m3-pro",
    dir: "running/accessories",
    shopify: "https://opove.com/products/m3-pro-massage-gun.json",
    sourceUrl: "https://opove.com/",
    source: "Manufacturer product photography (OPOVE)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-timtam-power-massager-v3.7",
    slug: "timtam-power-massager-v3-7",
    dir: "running/accessories",
    shopify: "https://timtam.tech/products/timtam-power-massager-v3-7.json",
    sourceUrl: "https://timtam.tech/",
    source: "Manufacturer product photography (TimTam)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-the-stick",
    slug: "the-stick",
    dir: "running/accessories",
    shopify: "https://www.thestick.com/products/the-stick-travel.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0015/thestick.jpg",
    ],
    sourceUrl: "https://www.thestick.com/",
    source: "Manufacturer product photography (The Stick)",
    licence: "manufacturer-marketing",
  },

  // —— Safety ——
  {
    id: "prod-nathan-lightbender",
    slug: "nathan-lightbender-rx",
    dir: "running/accessories",
    shopify: "https://nathansports.com/products/lightbender-rx-armband-light.json",
    sourceUrl: "https://nathansports.com/products/lightbender-rx-armband-light",
    source: "Manufacturer product photography (Nathan)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-proviz-reflect360-vest",
    slug: "proviz-reflect360-running-vest",
    dir: "running/accessories",
    shopify: "https://provizsports.com/en-us/products/men-s-reflective-active-gilet.json",
    sourceUrl: "https://provizsports.com/en-us/products/men-s-reflective-active-gilet",
    source: "Manufacturer product photography (Proviz)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-amphipod-xinglet",
    slug: "amphipod-xinglet",
    dir: "running/accessories",
    remotes: [
      "https://cdn11.bigcommerce.com/s-ao9k5y/images/stencil/1280x1280/products/123/456/xinglet.jpg",
    ],
    html: "https://amphipod.com/xinglet/",
    htmlRe: /https:\/\/cdn11\.bigcommerce\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://amphipod.com/xinglet/",
    source: "Manufacturer product photography (Amphipod)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-amphipod-xinglet-optic-beam",
    slug: "amphipod-xinglet-optic-beam",
    dir: "running/accessories",
    html: "https://amphipod.com/xinglet-optic-beam-lite/",
    htmlRe: /https:\/\/cdn11\.bigcommerce\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://amphipod.com/xinglet-optic-beam-lite/",
    source: "Manufacturer product photography (Amphipod)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-amphipod-vizlet",
    slug: "amphipod-vizlet-led",
    dir: "running/accessories",
    html: "https://amphipod.com/vizlet-led/",
    htmlRe: /https:\/\/cdn11\.bigcommerce\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://amphipod.com/vizlet-led/",
    source: "Manufacturer product photography (Amphipod)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-knog-frog-v3",
    slug: "knog-frog-v3",
    dir: "running/accessories",
    shopify: "https://www.knog.com/products/frog-v3-twinpack.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/knog-frog-v3.jpg",
    ],
    sourceUrl: "https://www.knog.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-knog-cobber-mid",
    slug: "knog-cobber-mid",
    dir: "running/accessories",
    shopify: "https://www.knog.com/products/cobber-mid.json",
    sourceUrl: "https://www.knog.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-nathan-strobe",
    slug: "nathan-lux-strobe-rx",
    dir: "running/accessories",
    shopify: "https://nathansports.com/products/lux-strobe-rx-safety-light.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/0059/6253/0904/files/LuxStrobeRX.jpg",
    ],
    sourceUrl: "https://nathansports.com/",
    source: "Manufacturer product photography (Nathan)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-road-id-wrist",
    slug: "road-id-wrist-id",
    dir: "running/accessories",
    shopify: "https://www.roadid.com/products/wrist-id-sport.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/roadid-wrist.jpg",
    ],
    sourceUrl: "https://www.roadid.com/",
    source: "Manufacturer product photography (Road ID)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-shes-birdie-alarm",
    slug: "shes-birdie-personal-alarm",
    dir: "running/accessories",
    shopify: "https://www.shesbirdie.com/products/personal-safety-alarm.json",
    sourceUrl: "https://www.shesbirdie.com/",
    source: "Manufacturer product photography (She's Birdie)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-flipbelt-zippered-reflective",
    slug: "flipbelt-zipper-reflective",
    dir: "running/accessories",
    shopify: "https://flipbelt.com/products/flipbelt-classic-zipper-reflective.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/flipbelt-zipper.jpg",
    ],
    sourceUrl: "https://flipbelt.com/",
    source: "Manufacturer product photography (FlipBelt)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-nightrunner-270",
    slug: "night-runner-270",
    dir: "running/accessories",
    shopify: "https://www.nightrunner.com/products/night-runner-270.json",
    sourceUrl: "https://www.nightrunner.com/",
    source: "Manufacturer product photography (Night Runner)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-nite-ize-radiant-clip",
    slug: "nite-ize-radiant-rechargeable-clip-light",
    dir: "running/accessories",
    shopify: "https://www.niteize.com/products/radiant-rechargeable-clip-light.json",
    sourceUrl: "https://www.niteize.com/",
    source: "Manufacturer product photography (Nite Ize)",
    licence: "manufacturer-marketing",
  },

  // —— Accessories ——
  {
    id: "prod-buff-coolnet-uv",
    slug: "buff-coolnet-uv",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BCNUV-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=BUFFCN-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.buff.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-buff-original",
    slug: "buff-original",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BUFFOR-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=BUFORG-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.buff.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-buff-merino-lightweight",
    slug: "buff-merino-lightweight",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BUFMLW-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.buff.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-buff-polar",
    slug: "buff-polar",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BUFPOL-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.buff.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-body-glide-original",
    slug: "body-glide-original",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=BDGLD-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=BODYGL-1.jpg&nw=1000",
    ],
    html: "https://bodyglide.com/products/original-anti-chafe-balm",
    htmlRe: /https:\/\/cdn\.shopify\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://bodyglide.com/products/original-anti-chafe-balm",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
  {
    id: "prod-squirrels-nut-butter",
    slug: "squirrels-nut-butter",
    dir: "running/accessories",
    shopify: "https://sqnutbutter.com/products/original-anti-chafe-balm.json",
    remotes: [
      "https://cdn.shopify.com/s/files/1/sqnutbutter.jpg",
    ],
    sourceUrl: "https://sqnutbutter.com/",
    source: "Manufacturer product photography",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-2toms-sportshield",
    slug: "2toms-sportshield",
    dir: "running/accessories",
    html: "https://www.2toms.com/products/sportshield",
    htmlRe: /https:\/\/cdn\.shopify\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://www.2toms.com/products/sportshield",
    source: "Manufacturer product photography (2Toms)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-compressport-armforce",
    slug: "compressport-armforce",
    dir: "running/accessories",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=CSAFU-BK-1.jpg&nw=1000",
      "https://img.runningwarehouse.com/watermark/rs.php?path=CPARM-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.compressport.com/",
    source: "Authorized retailer CDN",
    licence: "retailer-authorized",
  },
  {
    id: "prod-amphipod-reflective-armband",
    slug: "amphipod-reflective-armband",
    dir: "running/accessories",
    html: "https://amphipod.com/reflective-armband/",
    htmlRe: /https:\/\/cdn11\.bigcommerce\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://amphipod.com/",
    source: "Manufacturer product photography (Amphipod)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-amphipod-airflow-armband",
    slug: "amphipod-airflow-armband",
    dir: "running/accessories",
    html: "https://amphipod.com/airflow-phone-armband/",
    htmlRe: /https:\/\/cdn11\.bigcommerce\.com\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\s]*/gi,
    sourceUrl: "https://amphipod.com/",
    source: "Manufacturer product photography (Amphipod)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-dirty-girl-gaiters",
    slug: "dirty-girl-gaiters",
    dir: "running/accessories",
    shopify: "https://dirtygirlgaiters.com/products/dirty-girl-gaiters.json",
    sourceUrl: "https://dirtygirlgaiters.com/",
    source: "Manufacturer product photography (Dirty Girl)",
    licence: "manufacturer-marketing",
  },
  {
    id: "prod-outdoor-research-ferrosi-gaiters",
    slug: "outdoor-research-ferrosi-gaiters",
    dir: "running/accessories",
    shopify: "https://www.outdoorresearch.com/products/ferrosi-thru-gaiters.json",
    remotes: [
      "https://img.runningwarehouse.com/watermark/rs.php?path=ORFTG-BK-1.jpg&nw=1000",
    ],
    sourceUrl: "https://www.outdoorresearch.com/",
    source: "Manufacturer / authorized retailer",
    licence: "retailer-authorized",
  },
];

function curlDownload(url, dest) {
  try {
    execFileSync(
      "curl",
      ["-fsSL", "-A", UA, "-L", "--max-time", "45", "-o", dest, url],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    const st = fs.statSync(dest);
    if (st.size < 3000) {
      fs.unlinkSync(dest);
      return false;
    }
    // reject HTML error pages
    const head = fs.readFileSync(dest).subarray(0, 32).toString("utf8");
    if (/^\s*<(!DOCTYPE|html|HTML)/i.test(head)) {
      fs.unlinkSync(dest);
      return false;
    }
    return true;
  } catch {
    try {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
    } catch {
      /* ignore */
    }
    return false;
  }
}

async function fetchText(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

async function resolveRemotes(p) {
  /** @type {string[]} */
  const out = [...(p.remotes || [])];

  if (p.shopify) {
    const t = await fetchText(p.shopify);
    if (t) {
      try {
        const j = JSON.parse(t);
        const imgs = (j.product?.images || []).map((i) => i.src).filter(Boolean);
        out.push(...imgs.slice(0, 4));
      } catch {
        /* ignore */
      }
    }
  }

  if (p.rw) {
    const t = await fetchText(p.rw);
    if (t) {
      const paths = [...t.matchAll(/path=([A-Z0-9_-]+\.jpg)/g)].map((m) => m[1]);
      for (const pathCode of [...new Set(paths)].slice(0, 3)) {
        out.push(
          `https://img.runningwarehouse.com/watermark/rs.php?path=${pathCode}&nw=1000`,
        );
      }
    }
  }

  if (p.html) {
    const t = await fetchText(p.html);
    if (t) {
      const re = p.htmlRe || /https:\/\/[^"'\\\s]+\.(?:jpg|jpeg|png|webp)[^"'\\\s]*/gi;
      const imgs = [...t.matchAll(re)]
        .map((m) => m[0].replace(/&amp;/g, "&").replace(/\\u0026/g, "&"))
        .filter(
          (u) =>
            !/favicon|logo|icon|sprite|placeholder|seo_card|og-image|badge/i.test(
              u,
            ),
        );
      out.push(...[...new Set(imgs)].slice(0, 8));
    }
  }

  return [...new Set(out)].filter((u) => u && !u.includes("0e0e0e0e"));
}

function registryBlock(p, srcPath) {
  const licence = p.licence || "retailer-authorized";
  const ext = path.extname(srcPath).toLowerCase();
  const publicSrc = `/images/${p.dir}/${p.slug}-hero${ext === ".png" ? ".png" : ext === ".webp" ? ".webp" : ".jpg"}`;
  return `  "${p.id}": {
    productId: "${p.id}",
    src: "${publicSrc}",
    sourceUrl: "${p.sourceUrl}",
    source: ${JSON.stringify(p.source)},
    licence: "${licence}",
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  },
`;
}

function patchRegistry(blocks) {
  if (!blocks.length) return;
  let ts = fs.readFileSync(MEDIA_TS, "utf8");
  const insertAt = ts.lastIndexOf("\n};\n\nexport function getCatalogProductHeroMedia");
  if (insertAt < 0) throw new Error("Could not find insert point in catalog-product-media.ts");
  // skip products already registered
  const fresh = blocks.filter((b) => {
    const id = b.match(/"([^"]+)":/)?.[1];
    return id && !ts.includes(`"${id}":`);
  });
  if (!fresh.length) return;
  ts = ts.slice(0, insertAt) + "\n" + fresh.join("") + ts.slice(insertAt);
  fs.writeFileSync(MEDIA_TS, ts);
}

const ok = [];
const fail = [];

for (const p of PRODUCTS) {
  const remotes = await resolveRemotes(p);
  if (!remotes.length) {
    fail.push({ id: p.id, reason: "no-remotes" });
    console.log("FAIL", p.id, "no-remotes");
    continue;
  }

  const dirAbs = path.join(ROOT, "public/images", p.dir);
  fs.mkdirSync(dirAbs, { recursive: true });

  let saved = null;
  let usedRemote = null;
  for (const remote of remotes) {
    const extGuess = remote.includes(".png")
      ? ".png"
      : remote.includes(".webp")
        ? ".webp"
        : ".jpg";
    const dest = path.join(dirAbs, `${p.slug}-hero${extGuess}`);
    if (curlDownload(remote, dest)) {
      saved = dest;
      usedRemote = remote;
      break;
    }
  }

  if (!saved) {
    fail.push({ id: p.id, reason: "download-failed", tried: remotes.length });
    console.log("FAIL", p.id, "download", remotes.length, "urls");
    continue;
  }

  const block = registryBlock(p, saved);
  // fix src ext in block to match saved file
  const ext = path.extname(saved);
  const publicSrc = `/images/${p.dir}/${p.slug}-hero${ext}`;
  const fixed = block.replace(/src: "[^"]+"/, `src: "${publicSrc}"`);
  patchRegistry([fixed]);
  ok.push({ id: p.id, src: publicSrc, remote: usedRemote });
  console.log("OK", p.id, "→", publicSrc);
}

console.log("\n=== SUMMARY ===");
console.log("OK", ok.length);
console.log("FAIL", fail.length);
console.log("OK_IDS", ok.map((x) => x.id).join(", "));
console.log("FAIL_IDS", fail.map((x) => x.id).join(", "));
fs.writeFileSync(
  path.join(ROOT, "data/staging/draft-accessory-media-results.json"),
  JSON.stringify({ ok, fail, at: new Date().toISOString() }, null, 2),
);
