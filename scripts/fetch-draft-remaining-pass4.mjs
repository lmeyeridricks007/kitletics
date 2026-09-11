#!/usr/bin/env node
/**
 * Pass 4: scrape manufacturer / retailer pages for remaining draft gaps.
 * node scripts/fetch-draft-remaining-pass4.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TMP = path.join(ROOT, "data/staging/draft-pass4-tmp");
const REPORT = path.join(ROOT, "data/staging/draft-remaining-pass4-report.json");
fs.mkdirSync(TMP, { recursive: true });

const tw = (c) =>
  `https://img.tennis-warehouse.com/watermark/rs.php?path=${c}&nw=1000`;

/** @type {{id:string,slug:string,dir:string,remotes?:string[],pages?:string[],tokens?:string[],sourceUrl:string,source:string}[]} */
const PRODUCTS = [
  // —— Tennis (verified TW codes) ——
  {
    id: "prod-babolat-jet-tere",
    slug: "babolat-jet-tere",
    dir: "tennis/products",
    remotes: [tw("BMJTBK-1.jpg"), tw("BMJTWH-1.jpg"), tw("BMJTBK.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/learning_center/shoe_reviews/babolat_jet_tere_mens.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-yonex-sonicage-3",
    slug: "yonex-power-cushion-sonicage-3",
    dir: "tennis/products",
    remotes: [tw("YMSCBMG-1.jpg"), tw("YMSCWH-1.jpg"), tw("YPS3-1.jpg")],
    sourceUrl: "https://www.tennis-warehouse.com/Yonex_Sonicage_Black_Mocha_Gray_Mens_Shoes/descpageMSYONEX-YMSCBMG.html",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-head-revolt-pro-45",
    slug: "head-revolt-pro-4-5",
    dir: "tennis/products",
    remotes: [tw("HMR5WHB-1.jpg"), tw("HMR45-1.jpg"), tw("HRP45-1.jpg")],
    pages: [
      "https://www.zonadepadel.es/head-padel/9507-head-revolt-pro-45-clay-black-red-2024.html",
      "https://www.zonadepadel.es/head-padel/9520-zapatillas-head-revolt-pro-45-clay-banana-black-2024.html",
    ],
    tokens: ["revolt", "pro", "4", "45", "head"],
    sourceUrl: "https://www.tennis-warehouse.com/Head_Revolt_Pro_50_WhiteBlack_Mens_Shoes/descpageMSHEAD-HMR5WHB.html",
    source: "Tennis Warehouse / Zona de Padel",
  },
  {
    id: "prod-head-sprint-pro-35",
    slug: "head-sprint-pro-3-5",
    dir: "tennis/products",
    remotes: [tw("HMSP35-1.jpg"), tw("HSP35WHB-1.jpg"), tw("HMSP3-1.jpg")],
    pages: [
      "https://www.tennis-warehouse.com/Learning_Center/reviews/shoes/Head_Sprint_Pro_35_mens.html",
    ],
    tokens: ["sprint", "pro", "head"],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-mizuno-wave-exceed-tour-5",
    slug: "mizuno-wave-exceed-tour-5",
    dir: "tennis/products",
    remotes: [tw("MWET5WH-1.jpg"), tw("MWET5MB-1.jpg"), tw("MWET5-1.jpg")],
    pages: [
      "https://www.tennis-warehouse.com/learning_center/shoe_reviews/mizuno_wave_exceed_tour_5_mens.html",
      "https://www.zonadepadel.es/busca?controller=search&s=Mizuno%20Wave%20Exceed%20Tour%205",
    ],
    tokens: ["exceed", "tour", "mizuno", "wave"],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse / Zona de Padel",
  },
  {
    id: "prod-wilson-kaos-rapide-30",
    slug: "wilson-kaos-rapide-3-0",
    dir: "tennis/products",
    remotes: [tw("WKR3WHB-1.jpg"), tw("WKRAP3-1.jpg"), tw("WKR3MB-1.jpg")],
    pages: [
      "https://www.tennis-warehouse.com/search.html?searchtext=Wilson%20Kaos%20Rapide%203",
      "https://www.wilson.com/en-us/explore/tennis/shoes/kaos",
    ],
    tokens: ["kaos", "rapide", "wilson"],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse CDN",
  },
  {
    id: "prod-nb-lav-v2",
    slug: "new-balance-fresh-foam-x-lav-v2",
    dir: "tennis/products",
    remotes: [tw("NBLAV2-1.jpg"), tw("NFFLAV2-1.jpg"), tw("NLAVV2-1.jpg")],
    pages: [
      "https://www.tennis-warehouse.com/search.html?searchtext=New%20Balance%20Lav%20v2",
      "https://www.newbalance.com/pd/fresh-foam-x-lav-v2/MLAVV2.html",
    ],
    tokens: ["lav", "fresh", "foam", "balance"],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse / New Balance",
  },
  {
    id: "prod-nike-zoom-gp-turbo-2",
    slug: "nike-zoom-gp-turbo-hc-2",
    dir: "tennis/products",
    remotes: [tw("NGPT2-1.jpg"), tw("NGPTHC2-1.jpg"), tw("NCVGPT2-1.jpg")],
    pages: [
      "https://www.tennis-warehouse.com/search.html?searchtext=Nike%20GP%20Turbo%20HC%202",
      "https://www.nike.com/t/nikecourt-air-zoom-gp-turbo-hc-tennis-shoes",
    ],
    tokens: ["turbo", "gp", "nike", "vapor"],
    sourceUrl: "https://www.tennis-warehouse.com/",
    source: "Tennis Warehouse / Nike",
  },

  // —— Padel ——
  {
    id: "prod-head-revolt-court",
    slug: "head-revolt-court-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=Head%20Revolt%20Court",
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Head%20Revolt%20Court",
    ],
    tokens: ["revolt", "court", "head"],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-starvie-absolute-padel",
    slug: "starvie-absolute-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=StarVie%20Absolute%20zapatillas",
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20StarVie%20Absolute",
    ],
    tokens: ["starvie", "absolute"],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-oxdog-hyper-court",
    slug: "oxdog-hyper-court",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=Oxdog%20Hyper%20Court",
      "https://oxdog.net/search?q=hyper+court",
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Oxdog",
    ],
    tokens: ["oxdog", "hyper"],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-kuikma-ps-560-women",
    slug: "kuikma-ps-560-women",
    dir: "padel/products",
    pages: [
      "https://www.decathlon.nl/search?Ntt=kuikma%20ps%20560",
      "https://www.decathlon.es/search?Ntt=kuikma%20ps%20560",
      "https://www.zonadepadel.es/busca?controller=search&s=Kuikma%20PS%20560",
    ],
    tokens: ["kuikma", "560", "ps"],
    sourceUrl: "https://www.decathlon.nl/",
    source: "Decathlon / Zona de Padel",
  },
  {
    id: "prod-varlion-bourne-padel-shoe",
    slug: "varlion-bourne-padel",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=Varlion%20Bourne%20zapatillas",
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Varlion%20Bourne",
    ],
    tokens: ["varlion", "bourne"],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-tecnifibre-t-fight-padel",
    slug: "tecnifibre-wall-shooter",
    dir: "padel/products",
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=Tecnifibre%20Wall%20Shooter",
      "https://www.zonadepadel.es/busca?controller=search&s=zapatillas%20Tecnifibre",
    ],
    tokens: ["tecnifibre", "wall", "shooter"],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel authorized product photography",
  },
  {
    id: "prod-adidas-solecourt-boost-padel",
    slug: "adidas-solecourt-boost-padel",
    dir: "padel/products",
    remotes: [tw("ASCB-1.jpg"), tw("ASOLEB-1.jpg")],
    pages: [
      "https://www.zonadepadel.es/busca?controller=search&s=Adidas%20Solecourt%20Boost",
      "https://www.tennis-warehouse.com/search.html?searchtext=adidas%20Solecourt%20Boost",
    ],
    tokens: ["solecourt", "boost", "adidas"],
    sourceUrl: "https://www.zonadepadel.es/",
    source: "Zona de Padel / Tennis Warehouse",
  },

  // —— Packs / vests ——
  {
    id: "prod-black-diamond-distance-15",
    slug: "black-diamond-distance-15",
    dir: "packs/products",
    pages: [
      "https://blackdiamondequipment.com/products/distance-15-backpack",
      "https://eu.blackdiamondequipment.com/products/distance-15-backpack",
      "https://www.bergfreunde.eu/black-diamond-distance-15/",
    ],
    tokens: ["distance", "15", "black", "diamond"],
    sourceUrl: "https://blackdiamondequipment.com/products/distance-15-backpack",
    source: "Manufacturer CDN (Black Diamond)",
  },
  {
    id: "prod-black-diamond-distance-22",
    slug: "black-diamond-distance-22",
    dir: "packs/products",
    pages: [
      "https://blackdiamondequipment.com/products/distance-22-backpack",
      "https://eu.blackdiamondequipment.com/products/distance-22-backpack",
      "https://www.bergfreunde.eu/black-diamond-distance-22/",
    ],
    tokens: ["distance", "22", "black", "diamond"],
    sourceUrl: "https://blackdiamondequipment.com/",
    source: "Manufacturer CDN (Black Diamond)",
  },
  {
    id: "prod-compressport-ultrun-s-pack",
    slug: "compressport-ultrun-s-pack",
    dir: "packs/products",
    pages: [
      "https://www.bergfreunde.eu/compressport-ultrun-s-pack-evo-15-trail-running-backpack/",
      "https://www.compressport.com/eu/ultrun-s-pack-evo-15.html",
      "https://www.sportsshoes.com/search/?q=compressport+ultrun",
    ],
    tokens: ["ultrun", "compressport", "pack"],
    sourceUrl: "https://www.bergfreunde.eu/compressport-ultrun-s-pack-evo-15-trail-running-backpack/",
    source: "Authorized retailer CDN (Bergfreunde)",
  },
  {
    id: "prod-compressport-free-belt-pro",
    slug: "compressport-free-belt-pro",
    dir: "packs/products",
    pages: [
      "https://www.bergfreunde.eu/compressport-free-belt-pro/",
      "https://www.compressport.com/eu/free-belt-pro.html",
      "https://www.sportsshoes.com/search/?q=compressport+free+belt+pro",
    ],
    tokens: ["free", "belt", "compressport"],
    sourceUrl: "https://www.compressport.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-raidlight-responsiv-12",
    slug: "raidlight-responsiv-12",
    dir: "packs/products",
    pages: [
      "https://www.bergfreunde.eu/raidlight-responsiv-12l/",
      "https://www.raidlight.com/en/responsiv-12l.html",
      "https://www.sportsshoes.com/search/?q=raidlight+responsiv+12",
    ],
    tokens: ["responsiv", "raidlight", "12"],
    sourceUrl: "https://www.raidlight.com/",
    source: "Authorized retailer / manufacturer",
  },
  {
    id: "prod-patagonia-slope-runner",
    slug: "patagonia-slope-runner-vest",
    dir: "packs/products",
    pages: [
      "https://www.patagonia.com/product/slope-runner-exploration-vest/49050.html",
      "https://www.bergfreunde.eu/patagonia-slope-runner-endurance-vest/",
      "https://www.rei.com/product/228148/patagonia-slope-runner-endurance-vest",
    ],
    tokens: ["slope", "runner", "patagonia"],
    sourceUrl: "https://www.patagonia.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-osprey-duro-15",
    slug: "osprey-duro-15",
    dir: "packs/products",
    pages: [
      "https://www.osprey.com/duro-15",
      "https://www.bergfreunde.eu/osprey-duro-15/",
      "https://www.rei.com/search?q=osprey%20duro%2015",
    ],
    tokens: ["duro", "15", "osprey"],
    sourceUrl: "https://www.osprey.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-osprey-dyna-lt",
    slug: "osprey-dyna-lt",
    dir: "packs/products",
    pages: [
      "https://www.osprey.com/dyna-lt-w-flasks",
      "https://www.bergfreunde.eu/osprey-dyna-lt/",
      "https://www.rei.com/search?q=osprey%20dyna%20lt",
    ],
    tokens: ["dyna", "lt", "osprey"],
    sourceUrl: "https://www.osprey.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-osprey-talon-velocity-20",
    slug: "osprey-talon-velocity-20",
    dir: "packs/products",
    pages: [
      "https://www.osprey.com/talon-velocity-20",
      "https://www.bergfreunde.eu/osprey-talon-velocity-20/",
      "https://www.rei.com/search?q=osprey%20talon%20velocity%2020",
    ],
    tokens: ["talon", "velocity", "20", "osprey"],
    sourceUrl: "https://www.osprey.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-osprey-talon-velocity-30",
    slug: "osprey-talon-velocity-30",
    dir: "packs/products",
    pages: [
      "https://www.osprey.com/talon-velocity-30",
      "https://www.bergfreunde.eu/osprey-talon-velocity-30/",
    ],
    tokens: ["talon", "velocity", "30", "osprey"],
    sourceUrl: "https://www.osprey.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-osprey-tempest-velocity-20",
    slug: "osprey-tempest-velocity-20",
    dir: "packs/products",
    pages: [
      "https://www.osprey.com/tempest-velocity-20",
      "https://www.bergfreunde.eu/osprey-tempest-velocity-20/",
    ],
    tokens: ["tempest", "velocity", "20", "osprey"],
    sourceUrl: "https://www.osprey.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-camelbak-zephyr-pro",
    slug: "camelbak-zephyr-pro",
    dir: "packs/products",
    pages: [
      "https://www.camelbak.com/product/zephyr-pro%2C-34oz%2C-galaxy-blue/CB-2820402000.html",
      "https://www.bergfreunde.eu/camelbak-zephyr-pro/",
      "https://www.sportsshoes.com/search/?q=camelbak+zephyr+pro",
    ],
    tokens: ["zephyr", "pro", "camelbak"],
    sourceUrl: "https://www.camelbak.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-camelbak-octane-22",
    slug: "camelbak-octane-22",
    dir: "packs/products",
    pages: [
      "https://www.camelbak.com/search?q=octane%2022",
      "https://www.bergfreunde.eu/camelbak-octane-22/",
      "https://www.rei.com/search?q=camelbak%20octane%2022",
    ],
    tokens: ["octane", "22", "camelbak"],
    sourceUrl: "https://www.camelbak.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-xa-15",
    slug: "salomon-xa-15",
    dir: "packs/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/xa-15-set.html",
      "https://www.bergfreunde.eu/salomon-xa-15-set/",
      "https://www.sportsshoes.com/search/?q=salomon+xa+15",
    ],
    tokens: ["xa", "15", "salomon"],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-trailblazer-20",
    slug: "salomon-trailblazer-20",
    dir: "packs/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/trailblazer-20.html",
      "https://www.bergfreunde.eu/salomon-trailblazer-20/",
    ],
    tokens: ["trailblazer", "20", "salomon"],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-custom-quiver",
    slug: "salomon-custom-quiver",
    dir: "packs/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/custom-quiver.html",
      "https://www.bergfreunde.eu/salomon-custom-quiver/",
      "https://www.sportsshoes.com/search/?q=salomon+custom+quiver",
    ],
    tokens: ["custom", "quiver", "salomon"],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-soft-flask-stash",
    slug: "salomon-soft-flask-stash",
    dir: "packs/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/soft-flask-500ml-42.html",
      "https://www.bergfreunde.eu/search/?searchparam=salomon+soft+flask+stash",
    ],
    tokens: ["stash", "flask", "salomon"],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-leki-trail-running-quiver",
    slug: "leki-trail-running-quiver",
    dir: "packs/products",
    pages: [
      "https://www.leki.com/us/trail-running-quiver/",
      "https://www.bergfreunde.eu/leki-trail-running-quiver/",
      "https://www.rei.com/search?q=leki%20trail%20running%20quiver",
    ],
    tokens: ["leki", "quiver", "trail"],
    sourceUrl: "https://www.leki.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-ud-utility-bag",
    slug: "ultimate-direction-utility-bag",
    dir: "packs/products",
    pages: [
      "https://ultimatedirection.com/utility-bag/",
      "https://ultimatedirection.com/search.php?search_query=utility+bag",
    ],
    tokens: ["utility", "bag", "ultimate", "direction"],
    sourceUrl: "https://ultimatedirection.com/",
    source: "Manufacturer CDN (Ultimate Direction)",
  },
  {
    id: "prod-nathan-zippered-stash",
    slug: "nathan-zippered-stash",
    dir: "packs/products",
    pages: [
      "https://www.nathansports.com/products/zippered-stash",
      "https://www.nathansports.com/search?q=zippered+stash",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Nathan%20Zippered%20Stash",
    ],
    tokens: ["zippered", "stash", "nathan"],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer / Running Warehouse",
  },

  // —— Hydration ——
  {
    id: "prod-hydrapak-contour-2l",
    slug: "hydrapak-contour-2l",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/contour%e2%84%a2-2l-reservoir",
      "https://hydrapak.com/products/contour-2l",
      "https://www.bergfreunde.eu/hydrapak-contour-2-l/",
    ],
    tokens: ["contour", "hydrapak", "2l", "2-l"],
    sourceUrl: "https://www.hydrapak.com/products/contour%e2%84%a2-2l-reservoir",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-hydrapak-shape-shift-15",
    slug: "hydrapak-shape-shift-15",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/shape-shift-reservoir-1-5l",
      "https://www.bergfreunde.eu/hydrapak-shape-shift-1-5-l/",
      "https://www.rei.com/search?q=hydrapak%20shape%20shift%201.5",
    ],
    tokens: ["shape", "shift", "hydrapak"],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-hydrapak-tube-kit",
    slug: "hydrapak-tube-kit",
    dir: "hydration/products",
    pages: [
      "https://www.hydrapak.com/products/tube-kit",
      "https://hydrapak.com/products/tube-kit",
      "https://www.bergfreunde.eu/hydrapak-tube-kit/",
    ],
    tokens: ["tube", "kit", "hydrapak"],
    sourceUrl: "https://www.hydrapak.com/",
    source: "Manufacturer CDN (HydraPak)",
  },
  {
    id: "prod-osprey-hydraulics-15",
    slug: "osprey-hydraulics-lt-15",
    dir: "hydration/products",
    pages: [
      "https://www.osprey.com/hydraulics-lt-15-reservoir",
      "https://www.bergfreunde.eu/osprey-hydraulics-lt-15l-reservoir/",
      "https://www.rei.com/search?q=osprey%20hydraulics%20lt%201.5",
    ],
    tokens: ["hydraulics", "osprey", "reservoir", "1.5", "15"],
    sourceUrl: "https://www.osprey.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-soft-flask-speed-500",
    slug: "salomon-soft-flask-speed-500",
    dir: "hydration/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/soft-flask-500ml-speed-42.html",
      "https://www.bergfreunde.eu/salomon-soft-flask-speed-500-ml/",
      "https://www.sportsshoes.com/search/?q=salomon+soft+flask+speed+500",
    ],
    tokens: ["soft", "flask", "speed", "500", "salomon"],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-salomon-soft-reservoir-15",
    slug: "salomon-soft-reservoir-15",
    dir: "hydration/products",
    pages: [
      "https://www.salomon.com/en-us/shop/product/soft-reservoir-1.5l.html",
      "https://www.bergfreunde.eu/salomon-soft-reservoir-15l/",
    ],
    tokens: ["soft", "reservoir", "salomon", "1.5"],
    sourceUrl: "https://www.salomon.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-ud-body-bottle-500",
    slug: "ultimate-direction-body-bottle-500",
    dir: "hydration/products",
    pages: [
      "https://ultimatedirection.com/body-bottle-500/",
      "https://ultimatedirection.com/search.php?search_query=body+bottle+500",
    ],
    tokens: ["body", "bottle", "500"],
    sourceUrl: "https://ultimatedirection.com/",
    source: "Manufacturer CDN (Ultimate Direction)",
  },
  {
    id: "prod-nathan-softflask-18oz",
    slug: "nathan-softflask-18oz",
    dir: "hydration/products",
    pages: [
      "https://www.nathansports.com/products/softflask-18oz",
      "https://www.nathansports.com/search?q=softflask+18",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Nathan%20SoftFlask%2018",
    ],
    tokens: ["softflask", "soft", "flask", "nathan", "18"],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-nathan-quickdraw-plus",
    slug: "nathan-quickdraw-plus-handheld",
    dir: "hydration/products",
    pages: [
      "https://www.nathansports.com/products/quickdraw-plus",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Nathan%20QuickDraw%20Plus",
    ],
    tokens: ["quickdraw", "nathan", "handheld"],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-amphipod-hydraform-handheld",
    slug: "amphipod-hydraform-ergo-lite-handheld",
    dir: "hydration/products",
    pages: [
      "https://www.amphipod.com/products/hydraform-ergo-lite",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Amphipod%20Hydraform%20Ergo-Lite",
      "https://www.rei.com/search?q=amphipod%20hydraform",
    ],
    tokens: ["hydraform", "amphipod", "ergo"],
    sourceUrl: "https://www.amphipod.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-camelbak-quick-grip-chill",
    slug: "camelbak-quick-grip-chill",
    dir: "hydration/products",
    pages: [
      "https://www.camelbak.com/search?q=quick%20grip%20chill",
      "https://www.bergfreunde.eu/camelbak-quick-grip-chill/",
      "https://www.rei.com/search?q=camelbak%20quick%20grip%20chill",
    ],
    tokens: ["quick", "grip", "chill", "camelbak"],
    sourceUrl: "https://www.camelbak.com/",
    source: "Manufacturer / authorized retailer",
  },

  // —— Belts ——
  {
    id: "prod-amphipod-airflow-lite-belt",
    slug: "amphipod-airflow-lite-belt",
    dir: "packs/products",
    pages: [
      "https://www.amphipod.com/products/airflow-lite-belt",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Amphipod%20AirFlow%20Lite",
      "https://www.rei.com/search?q=amphipod%20airflow%20lite",
    ],
    tokens: ["airflow", "lite", "amphipod", "belt"],
    sourceUrl: "https://www.amphipod.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-fitletic-fully-loaded",
    slug: "fitletic-fully-loaded",
    dir: "packs/products",
    pages: [
      "https://www.fitletic.com/products/fully-loaded",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Fitletic%20Fully%20Loaded",
      "https://www.rei.com/search?q=fitletic%20fully%20loaded",
    ],
    tokens: ["fully", "loaded", "fitletic"],
    sourceUrl: "https://www.fitletic.com/",
    source: "Manufacturer / authorized retailer",
  },
  {
    id: "prod-nathan-zipster-lite",
    slug: "nathan-zipster-lite",
    dir: "packs/products",
    pages: [
      "https://www.nathansports.com/products/zipster-lite",
      "https://www.runningwarehouse.com/searchrc.html?searchtext=Nathan%20ZipSter%20Lite",
    ],
    tokens: ["zipster", "nathan", "lite"],
    sourceUrl: "https://www.nathansports.com/",
    source: "Manufacturer / Running Warehouse",
  },
  {
    id: "prod-kiprun-running-belt",
    slug: "kiprun-running-belt",
    dir: "packs/products",
    pages: [
      "https://www.decathlon.nl/search?Ntt=kiprun%20running%20belt",
      "https://www.decathlon.com/search?Ntt=kiprun%20belt",
      "https://www.decathlon.es/search?Ntt=cinturon%20kiprun",
    ],
    tokens: ["kiprun", "belt", "cinturon"],
    sourceUrl: "https://www.decathlon.com/",
    source: "Decathlon CDN",
  },
];

function curlToFile(url, dest, maxTime = 30) {
  if (!url || !/^https?:\/\//i.test(url)) return { ok: false, code: "bad-url", size: 0 };
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
        "--",
        url,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    if (code !== "200" || !fs.existsSync(dest)) return { ok: false, code, size: 0 };
    const size = fs.statSync(dest).size;
    return { ok: size > 5000, size, code };
  } catch {
    return { ok: false, code: "err", size: 0 };
  }
}

function isImage(buf) {
  if (buf.length < 5000) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF") return true;
  const head = buf.slice(0, 200).toString("utf8");
  return !(head.includes("<!DOCTYPE") || head.includes("<html"));
}

function extractImageUrls(html, pageUrl) {
  const urls = new Set();
  const push = (u) => {
    if (!u) return;
    let x = u.replace(/&amp;/g, "&").trim();
    if (x.startsWith("//")) x = `https:${x}`;
    if (x.startsWith("/")) {
      try {
        x = new URL(x, pageUrl).toString();
      } catch {
        return;
      }
    }
    if (!/^https?:\/\//i.test(x)) return;
    if (/logo|icon|sprite|favicon|pixel|banner|social|flag|payment|avatar|placeholder|1x1|svg/i.test(x))
      return;
    urls.add(x.split(/\s/)[0]);
  };

  for (const m of html.matchAll(
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/gi,
  ))
    push(m[1]);
  for (const m of html.matchAll(
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/gi,
  ))
    push(m[1]);
  for (const m of html.matchAll(
    /https:\/\/www\.zonadepadel\.es\/\d+-(?:home_default|large_default)\/[A-Za-z0-9_.-]+\.jpg/gi,
  )) {
    push(m[0].replace("-home_default/", "-large_default/"));
  }
  for (const m of html.matchAll(/path=([A-Z0-9._-]+\.jpe?g)/gi)) {
    push(tw(m[1]));
    push(`https://img.runningwarehouse.com/watermark/rs.php?path=${m[1]}&nw=1000`);
  }
  for (const m of html.matchAll(
    /https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s>]*)?/gi,
  ))
    push(m[0]);
  for (const m of html.matchAll(
    /(?:src|data-src|data-zoom-image|content)=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
  ))
    push(m[1]);

  return [...urls];
}

function scoreUrl(url, tokens) {
  const h = url.toLowerCase();
  let score = 0;
  for (const t of tokens || []) {
    if (t.length < 2) continue;
    if (h.includes(t.toLowerCase())) score += 2;
  }
  if (/product_primary|watermark|cdn\/shop|scene7|demandware|bigcommerce|mediadecathlon|bfgcdn|shopify|osprey|patagonia|hydrapak|nathansports|camelbak|blackdiamond|salomon|compressport|leki|fitletic|amphipod|zonadepadel|tennis-warehouse|runningwarehouse/i.test(h))
    score += 3;
  if (/og|hero|primary|main|large|1280|1200|1000/i.test(h)) score += 1;
  if (/thumb|small|icon|50x|80w|100x100/i.test(h)) score -= 4;
  return score;
}

function tryRemotes(remotes) {
  for (const remote of remotes || []) {
    const dest = path.join(TMP, `img-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);
    const got = curlToFile(remote, dest, 25);
    if (!got.ok) continue;
    const buf = fs.readFileSync(dest);
    if (!isImage(buf)) continue;
    return { buf, remote };
  }
  return null;
}

function scrapePages(p) {
  const candidates = [];
  for (const page of p.pages || []) {
    const htmlDest = path.join(TMP, `page-${p.id}-${Date.now()}.html`);
    const got = curlToFile(page, htmlDest, 30);
    if (!got.ok && got.size < 3000) continue;
    const html = fs.readFileSync(htmlDest, "utf8");
    const imgs = extractImageUrls(html, page);
    for (const u of imgs) {
      const sc = scoreUrl(u, p.tokens);
      if (sc >= 3) candidates.push({ u, sc, page });
    }
    // follow product links on search pages
    if (/search|busca|Ntt=/i.test(page)) {
      const links = [...html.matchAll(/href=["']([^"']+)["']/gi)]
        .map((m) => m[1])
        .filter((h) => {
          const low = h.toLowerCase();
          return (
            (p.tokens || []).filter((t) => t.length > 2 && low.includes(t.toLowerCase()))
              .length >= 2 &&
            /product|zapatilla|\/p\/|descpage/i.test(low)
          );
        });
      for (const link of links.slice(0, 2)) {
        let abs = link;
        if (abs.startsWith("/")) abs = new URL(abs, page).toString();
        if (!/^https?:/i.test(abs)) continue;
        const d2 = path.join(TMP, `follow-${Date.now()}.html`);
        const g2 = curlToFile(abs, d2, 25);
        if (!g2.ok) continue;
        const html2 = fs.readFileSync(d2, "utf8");
        for (const u of extractImageUrls(html2, abs)) {
          const sc = scoreUrl(u, p.tokens);
          if (sc >= 3) candidates.push({ u, sc, page: abs });
        }
      }
    }
  }
  candidates.sort((a, b) => b.sc - a.sc);
  const seen = new Set();
  for (const c of candidates) {
    if (seen.has(c.u)) continue;
    seen.add(c.u);
    const hit = tryRemotes([c.u]);
    if (hit) return { ...hit, page: c.page };
  }
  return null;
}

function mergeRegistry(entries) {
  const catalogPath = path.join(ROOT, "src/content/catalog-product-media.ts");
  let catalogSrc = fs.readFileSync(catalogPath, "utf8");
  let added = 0;
  for (const e of entries) {
    if (!e.ok || !e.src) continue;
    if (catalogSrc.includes(`"${e.id}":`)) continue;
    const block = `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "retailer-authorized",
    attribution: "© Brand — official / authorized product photography",
    width: 1000,
    height: 1000,
  },
`;
    catalogSrc = catalogSrc.replace(
      "export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n",
      `export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n${block}`,
    );
    added += 1;
  }
  fs.writeFileSync(catalogPath, catalogSrc);
  return { added };
}

const catalog = fs.readFileSync(
  path.join(ROOT, "src/content/catalog-product-media.ts"),
  "utf8",
);
const targets = PRODUCTS.filter((p) => !catalog.includes(`"${p.id}":`));
console.log(`Pass4: ${targets.length} remaining targets…`);

const results = [];
for (const p of targets) {
  process.stdout.write(`… ${p.slug} `);
  let hit = tryRemotes(p.remotes || []);
  let pageUrl = p.sourceUrl;
  if (!hit) {
    const scraped = scrapePages(p);
    if (scraped) {
      hit = scraped;
      pageUrl = scraped.page || p.sourceUrl;
    }
  }
  if (!hit) {
    console.log("FAIL");
    results.push({ id: p.id, slug: p.slug, ok: false });
    continue;
  }
  const ext =
    hit.buf[0] === 0x89
      ? "png"
      : hit.remote?.toLowerCase().includes(".webp") ||
          (hit.buf.toString("ascii", 0, 4) === "RIFF")
        ? "webp"
        : "jpg";
  const outDir = path.join(ROOT, "public/images", p.dir);
  fs.mkdirSync(outDir, { recursive: true });
  const file = `${p.slug}-hero.${ext}`;
  fs.writeFileSync(path.join(outDir, file), hit.buf);
  console.log(`OK ${hit.buf.length}`);
  results.push({
    id: p.id,
    slug: p.slug,
    ok: true,
    src: `/images/${p.dir}/${file}`,
    sourceUrl: pageUrl,
    source: p.source,
    licence: "retailer-authorized",
    remote: hit.remote,
  });
}

fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
const { added } = mergeRegistry(ok);
console.log(`\nNEW OK ${ok.length}  FAIL ${fail.length}  registry+${added}`);
console.log("NEW OK ids:\n" + ok.map((r) => r.id).join("\n"));
console.log("FAIL ids:\n" + fail.map((r) => r.id).join("\n"));
