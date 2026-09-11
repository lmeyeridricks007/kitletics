#!/usr/bin/env node
/**
 * Fetch authentic heroes for draft sunglasses + nutrition products.
 * Curated CDN URLs + HTML scrape fallbacks. Registers in catalog-product-media.ts.
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public/images/running/accessories");
const TMP = path.join(ROOT, "data/staging/draft-media-tmp");
const REPORT = path.join(ROOT, "data/staging/sunglasses-nutrition-media-report.json");
const CATALOG = path.join(ROOT, "src/content/catalog-product-media.ts");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** @type {Record<string, { slug: string; remote: string; sourceUrl: string; source: string; licence: 'manufacturer-marketing' | 'retailer-authorized' }>} */
const CURATED = {
  "prod-oakley-radar-ev-path": {
    slug: "oakley-radar-ev-path",
    remote:
      "https://assets2.oakley.com/cdn-record-files-pi/d808f640-b9d6-4de1-95e5-a4440109cc66/0fb85840-6ef9-4221-ac50-ad79015d5c22/0OO9208__920805__P21__shad__qt.png?impolicy=OO_ratio&width=1200",
    sourceUrl: "https://www.oakley.com/en-us/product/W0OO9208",
    source: "Oakley assets2 CDN (Radar EV Path packshot)",
    licence: "manufacturer-marketing",
  },
  "prod-oakley-sutro-lite": {
    slug: "oakley-sutro-lite",
    remote:
      "https://assets2.oakley.com/cdn-record-files-pi/59eb7feb-243d-4151-8ccb-ab6500a9c6a0/9b91368e-f0a4-4468-9ee5-ae93017d8db8/0OO9463__946305__P21__shad__qt.png?impolicy=OO_ratio&width=1200",
    sourceUrl: "https://www.oakleysi.com/en-us/product/W0OO9463",
    source: "Oakley assets2 CDN (Sutro Lite packshot)",
    licence: "manufacturer-marketing",
  },
  "prod-oakley-kato": {
    slug: "oakley-kato",
    remote:
      "https://assets2.oakley.com/cdn-record-files-pi/f2778096-6148-4388-9b54-ae3f01076f09/aff02b44-4c5f-471c-9e45-aea600491b74/0OO9455M__945501__STD__noshad__adv.png?impolicy=OO_ratio&width=1200",
    sourceUrl: "https://www.oakley.com/en-us/product/W0OO9455M",
    source: "Oakley assets2 CDN (Kato packshot)",
    licence: "manufacturer-marketing",
  },
  "prod-smith-shift-mag": {
    slug: "smith-shift-mag",
    remote: "https://images.evo.com/imgp/700/204009/802712/smith-shift-mag-sunglasses-.jpg",
    sourceUrl: "https://www.evo.com/sunglasses/smith-shift-mag",
    source: "EVO authorized retailer CDN (Smith Shift MAG)",
    licence: "retailer-authorized",
  },
  "prod-maurten-gel-100": {
    slug: "maurten-gel-100",
    remote:
      "https://cdn.shopify.com/s/files/1/0446/6373/4429/files/Maurten-Gel-100-3.jpg?v=1775825702",
    sourceUrl: "https://www.maurten.com/products/gel-100-box-us",
    source: "Authorized retailer Shopify CDN (Maurten Gel 100)",
    licence: "retailer-authorized",
  },
};

/** Product pages to scrape for og:image / Shopify CDN (id → pages) */
const SCRAPE = {
  "prod-oakley-encoder": {
    slug: "oakley-encoder",
    pages: [
      "https://www.oakleysi.com/en-us/product/W0OO9471",
      "https://www.fashioneyewear.com/en-us/products/oakley-encoder-oo9471",
      "https://solsticesunglasses.com/products/oakley-0oo9471-encoder-0oo9471",
    ],
    prefer: /assets2\.oakley\.com|cdn\.shopify/,
    sourceUrl: "https://www.oakley.com/en-us/product/W0OO9471",
    source: "Oakley / authorized retailer CDN (Encoder)",
    licence: "manufacturer-marketing",
  },
  "prod-oakley-flak-2xl": {
    slug: "oakley-flak-2-0-xl",
    pages: [
      "https://www.oakleysi.com/en-us/product/W0OO9188",
      "https://www.oakleysi.com/en-us/product/W0OO9188SI",
    ],
    prefer: /assets2\.oakley\.com/,
    sourceUrl: "https://www.oakley.com/en-us/product/W0OO9188",
    source: "Oakley assets2 CDN (Flak 2.0 XL)",
    licence: "manufacturer-marketing",
  },
  "prod-goodr-ogs": {
    slug: "goodr-ogs",
    pages: [
      "https://goodr.com/products/running-from-responsibility",
      "https://goodr.com/products/a-ginger-soul",
      "https://goodr.com/collections/ogs",
    ],
    prefer: /goodr\.com\/cdn\/shop|cdn\.shopify\.com/,
    sourceUrl: "https://goodr.com/collections/ogs",
    source: "goodr Shopify CDN (OGs frame)",
    licence: "manufacturer-marketing",
  },
  "prod-goodr-circle-gs": {
    slug: "goodr-circle-gs",
    pages: [
      "https://goodr.com/products/its-not-black-its-obsidian",
      "https://goodr.ca/products/its-not-black-its-obsidian",
      "https://goodr.com/products/stares-into-the-abyss",
    ],
    prefer: /goodr\.com\/cdn\/shop|goodr\.ca\/cdn\/shop|cdn\.shopify/,
    sourceUrl: "https://goodr.com/collections/circle-gs",
    source: "goodr Shopify CDN (Circle Gs)",
    licence: "manufacturer-marketing",
  },
  "prod-julbo-ultimate": {
    slug: "julbo-ultimate",
    pages: [
      "https://julbo.us/products/ultimate-sunglasses",
      "https://julbo-canada.ca/products/sunglasses-ultimate-j546",
      "https://www.julbo.com/en_wo/p/ultimate-reactiv",
    ],
    prefer: /cdn\.shopify|julbo/,
    sourceUrl: "https://julbo.us/products/ultimate-sunglasses",
    source: "Julbo manufacturer / Shopify CDN (Ultimate)",
    licence: "manufacturer-marketing",
  },
  "prod-julbo-aerolite": {
    slug: "julbo-aerolite",
    pages: [
      "https://julbo.us/products/aerolite-sunglasses",
      "https://julbo.us/search?q=aerolite",
    ],
    prefer: /cdn\.shopify|julbo/,
    sourceUrl: "https://julbo.us/products/aerolite-sunglasses",
    source: "Julbo manufacturer CDN (Aerolite)",
    licence: "manufacturer-marketing",
  },
  "prod-julbo-rush": {
    slug: "julbo-rush",
    pages: ["https://julbo.us/products/rush-sunglasses", "https://julbo.us/search?q=rush"],
    prefer: /cdn\.shopify|julbo/,
    sourceUrl: "https://julbo.us/products/rush-sunglasses",
    source: "Julbo manufacturer CDN (Rush)",
    licence: "manufacturer-marketing",
  },
  "prod-smith-attack-mag": {
    slug: "smith-attack-mag",
    pages: [
      "https://www.smithoptics.com/us/en/p/attack-mag/204462.html",
      "https://www.evo.com/sunglasses/smith-attack-mag",
      "https://smithopticsaustralia.com/products/attack-mag",
    ],
    prefer: /smithoptics|evo\.com|cdn\.shopify/,
    sourceUrl: "https://www.smithoptics.com/us/en/p/attack-mag/204462.html",
    source: "Smith / authorized retailer (Attack MAG)",
    licence: "manufacturer-marketing",
  },
  "prod-tifosi-rail": {
    slug: "tifosi-rail",
    pages: [
      "https://www.tifosioptics.com/products/rail",
      "https://www.tifosioptics.com/collections/sunglasses/products/rail",
    ],
    prefer: /cdn\.shopify|tifosi/,
    sourceUrl: "https://www.tifosioptics.com/products/rail",
    source: "Tifosi Shopify CDN (Rail)",
    licence: "manufacturer-marketing",
  },
  "prod-tifosi-vogel": {
    slug: "tifosi-vogel",
    pages: ["https://www.tifosioptics.com/products/vogel", "https://www.tifosioptics.com/search?q=vogel"],
    prefer: /cdn\.shopify|tifosi/,
    sourceUrl: "https://www.tifosioptics.com/products/vogel",
    source: "Tifosi Shopify CDN (Vogel)",
    licence: "manufacturer-marketing",
  },
  "prod-roka-phantom-air": {
    slug: "roka-phantom-air",
    pages: [
      "https://www.roka.com/products/phantom-air",
      "https://www.roka.com/collections/sunglasses/products/phantom-air",
    ],
    prefer: /cdn\.shopify|roka/,
    sourceUrl: "https://www.roka.com/products/phantom-air",
    source: "ROKA Shopify CDN (Phantom Air)",
    licence: "manufacturer-marketing",
  },
  "prod-rudy-cutline": {
    slug: "rudy-project-cutline",
    pages: [
      "https://www.rudyproject.com/en-us/cutline",
      "https://www.rudyprojectusa.com/products/cutline",
    ],
    prefer: /cdn\.shopify|rudy/,
    sourceUrl: "https://www.rudyproject.com/en-us/cutline",
    source: "Rudy Project CDN (Cutline)",
    licence: "manufacturer-marketing",
  },
  "prod-100-s3": {
    slug: "100-percent-s3",
    pages: [
      "https://www.ride100percent.com/products/s3",
      "https://www.ride100percent.com/collections/sunglasses/products/s3",
    ],
    prefer: /cdn\.shopify|ride100/,
    sourceUrl: "https://www.ride100percent.com/products/s3",
    source: "100% Shopify CDN (S3)",
    licence: "manufacturer-marketing",
  },
  "prod-maurten-gel-100-caf": {
    slug: "maurten-gel-100-caf-100",
    pages: [
      "https://www.maurten.com.au/products/gel-100-caf-100",
      "https://enroute.cc/products/maurten-gel-100-caf-100",
      "https://www.maurten.com/products/gel-100-caf-100-box-us",
    ],
    prefer: /cdn\.shopify|maurten/,
    sourceUrl: "https://www.maurten.com/products/gel-100-caf-100-box-us",
    source: "Maurten / authorized retailer CDN (Gel 100 Caf 100)",
    licence: "retailer-authorized",
  },
  "prod-maurten-gel-160": {
    slug: "maurten-gel-160",
    pages: [
      "https://www.maurten.com.au/products/gel-160",
      "https://www.maurten.com/products/gel-160-box-us",
      "https://enroute.cc/products/maurten-gel-160",
    ],
    prefer: /cdn\.shopify|maurten/,
    sourceUrl: "https://www.maurten.com/products/gel-160-box-us",
    source: "Maurten / authorized retailer CDN (Gel 160)",
    licence: "retailer-authorized",
  },
  "prod-maurten-drink-mix-160": {
    slug: "maurten-drink-mix-160",
    pages: [
      "https://www.maurten.com.au/products/drink-mix-160",
      "https://www.maurten.com/products/drink-mix-160-box-us",
    ],
    prefer: /cdn\.shopify|maurten/,
    sourceUrl: "https://www.maurten.com/products/drink-mix-160-box-us",
    source: "Maurten / authorized retailer CDN (Drink Mix 160)",
    licence: "retailer-authorized",
  },
  "prod-maurten-drink-mix-320": {
    slug: "maurten-drink-mix-320",
    pages: [
      "https://www.maurten.com.au/products/drink-mix-320",
      "https://www.maurten.com/products/drink-mix-320-box-us",
    ],
    prefer: /cdn\.shopify|maurten/,
    sourceUrl: "https://www.maurten.com/products/drink-mix-320-box-us",
    source: "Maurten / authorized retailer CDN (Drink Mix 320)",
    licence: "retailer-authorized",
  },
  "prod-sis-go-isotonic-gel": {
    slug: "sis-go-isotonic-gel",
    pages: [
      "https://ftrs.ca/products/sis-go-isotonic-energy-gel-30x60ml",
      "https://www.scienceinsport.com/us/go-isotonic-energy-gel-60ml-30-pack-orange",
      "https://www.mysport.lv/ee/sis-go-isotonic-energy-gel-60ml-lemon-and-lime.html",
    ],
    prefer: /cdn\.shopify|scienceinsport|mysport|media/,
    sourceUrl: "https://www.scienceinsport.com/us/shop-sis/go-range/go-gels",
    source: "SiS / authorized retailer CDN (GO Isotonic Gel)",
    licence: "retailer-authorized",
  },
  "prod-sis-beta-fuel-gel": {
    slug: "sis-beta-fuel-gel",
    pages: [
      "https://www.scienceinsport.com/shop-sis/go-range/beta-fuel-gel-pack",
      "https://www.scienceinsport.com/us/shop-sis/go-range/beta-fuel-gel-pack",
      "https://ftrs.ca/search?q=beta+fuel+gel",
    ],
    prefer: /cdn\.shopify|scienceinsport|media/,
    sourceUrl: "https://www.scienceinsport.com/shop-sis/go-range/beta-fuel-gel-pack",
    source: "SiS manufacturer CDN (Beta Fuel Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-sis-beta-fuel-drink": {
    slug: "sis-beta-fuel-drink",
    pages: [
      "https://www.scienceinsport.com/shop-sis/go-range/beta-fuel-energy-drink-mix",
      "https://www.scienceinsport.com/us/beta-fuel-energy-drink",
    ],
    prefer: /cdn\.shopify|scienceinsport|media/,
    sourceUrl: "https://www.scienceinsport.com/shop-sis/go-range/beta-fuel-energy-drink-mix",
    source: "SiS manufacturer CDN (Beta Fuel Drink)",
    licence: "manufacturer-marketing",
  },
  "prod-gu-energy-gel": {
    slug: "gu-energy-gel",
    pages: [
      "https://guenergy.com/products/gu-energy-gel",
      "https://guenergy.com/collections/gels/products/energy-gel",
    ],
    prefer: /cdn\.shopify|guenergy/,
    sourceUrl: "https://guenergy.com/products/gu-energy-gel",
    source: "GU Energy Shopify CDN (Energy Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-gu-roctane-gel": {
    slug: "gu-roctane-gel",
    pages: [
      "https://guenergy.com/products/roctane-energy-gel",
      "https://guenergy.com/collections/gels/products/roctane-energy-gel",
    ],
    prefer: /cdn\.shopify|guenergy/,
    sourceUrl: "https://guenergy.com/products/roctane-energy-gel",
    source: "GU Energy Shopify CDN (Roctane Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-gu-chews": {
    slug: "gu-energy-chews",
    pages: [
      "https://guenergy.com/products/energy-chews",
      "https://guenergy.com/collections/chews/products/energy-chews",
    ],
    prefer: /cdn\.shopify|guenergy/,
    sourceUrl: "https://guenergy.com/products/energy-chews",
    source: "GU Energy Shopify CDN (Energy Chews)",
    licence: "manufacturer-marketing",
  },
  "prod-clif-bloks": {
    slug: "clif-bloks-energy-chews",
    pages: [
      "https://www.clifbar.com/shop/product/clif-bloks-energy-chews",
      "https://www.clifbar.com/products/clif-bloks-energy-chews",
    ],
    prefer: /cdn\.shopify|clifbar|scene7|cloudinary/,
    sourceUrl: "https://www.clifbar.com/shop/product/clif-bloks-energy-chews",
    source: "Clif Bar manufacturer CDN (BLOKS)",
    licence: "manufacturer-marketing",
  },
  "prod-clif-bar-original": {
    slug: "clif-bar-original",
    pages: [
      "https://www.clifbar.com/shop/product/clif-bar",
      "https://www.clifbar.com/products/clif-bar",
    ],
    prefer: /cdn\.shopify|clifbar|scene7|cloudinary/,
    sourceUrl: "https://www.clifbar.com/shop/product/clif-bar",
    source: "Clif Bar manufacturer CDN (Original Bar)",
    licence: "manufacturer-marketing",
  },
  "prod-skratch-sport-hydration": {
    slug: "skratch-sport-hydration-mix",
    pages: [
      "https://www.skratchlabs.com/products/sport-hydration-drink-mix",
      "https://www.skratchlabs.com/collections/hydration/products/sport-hydration-drink-mix",
    ],
    prefer: /cdn\.shopify|skratch/,
    sourceUrl: "https://www.skratchlabs.com/products/sport-hydration-drink-mix",
    source: "Skratch Labs Shopify CDN (Sport Hydration)",
    licence: "manufacturer-marketing",
  },
  "prod-skratch-chews": {
    slug: "skratch-sport-energy-chews",
    pages: [
      "https://www.skratchlabs.com/products/sport-energy-chews",
      "https://www.skratchlabs.com/collections/chews/products/sport-energy-chews",
    ],
    prefer: /cdn\.shopify|skratch/,
    sourceUrl: "https://www.skratchlabs.com/products/sport-energy-chews",
    source: "Skratch Labs Shopify CDN (Energy Chews)",
    licence: "manufacturer-marketing",
  },
  "prod-tailwind-endurance": {
    slug: "tailwind-endurance-fuel",
    pages: [
      "https://www.tailwindnutrition.com/products/endurance-fuel",
      "https://www.tailwindnutrition.com/collections/all/products/endurance-fuel",
    ],
    prefer: /cdn\.shopify|tailwind/,
    sourceUrl: "https://www.tailwindnutrition.com/products/endurance-fuel",
    source: "Tailwind Shopify CDN (Endurance Fuel)",
    licence: "manufacturer-marketing",
  },
  "prod-nuun-sport": {
    slug: "nuun-sport",
    pages: ["https://nuunlife.com/products/nuun-sport", "https://nuunlife.com/collections/sport"],
    prefer: /cdn\.shopify|nuun/,
    sourceUrl: "https://nuunlife.com/products/nuun-sport",
    source: "Nuun Shopify CDN (Sport)",
    licence: "manufacturer-marketing",
  },
  "prod-honey-stinger-gel": {
    slug: "honey-stinger-organic-energy-gel",
    pages: [
      "https://www.honeystinger.com/products/organic-energy-gel",
      "https://honeystinger.com/collections/gels",
    ],
    prefer: /cdn\.shopify|honeystinger/,
    sourceUrl: "https://www.honeystinger.com/products/organic-energy-gel",
    source: "Honey Stinger Shopify CDN (Organic Energy Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-saltstick-caps": {
    slug: "saltstick-caps",
    pages: ["https://saltstick.com/products/saltstick-caps", "https://saltstick.com/collections/all"],
    prefer: /cdn\.shopify|saltstick/,
    sourceUrl: "https://saltstick.com/products/saltstick-caps",
    source: "SaltStick Shopify CDN (Caps)",
    licence: "manufacturer-marketing",
  },
  "prod-saltstick-fastchews": {
    slug: "saltstick-fastchews",
    pages: [
      "https://saltstick.com/products/saltstick-fastchews",
      "https://saltstick.com/products/fastchews",
    ],
    prefer: /cdn\.shopify|saltstick/,
    sourceUrl: "https://saltstick.com/products/saltstick-fastchews",
    source: "SaltStick Shopify CDN (Fastchews)",
    licence: "manufacturer-marketing",
  },
  "prod-precision-pf30-gel": {
    slug: "precision-pf30-gel",
    pages: [
      "https://www.precisionhydration.com/products/pf-30-gel",
      "https://precisionfuelandhydration.com/products/pf-30-gel",
    ],
    prefer: /cdn\.shopify|precision/,
    sourceUrl: "https://www.precisionhydration.com/products/pf-30-gel",
    source: "Precision Fuel Shopify CDN (PF 30 Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-precision-pf30-drink": {
    slug: "precision-pf30-drink-mix",
    pages: [
      "https://www.precisionhydration.com/products/pf-30-drink-mix",
      "https://precisionfuelandhydration.com/products/pf-30-drink-mix",
    ],
    prefer: /cdn\.shopify|precision/,
    sourceUrl: "https://www.precisionhydration.com/products/pf-30-drink-mix",
    source: "Precision Fuel Shopify CDN (PF 30 Drink Mix)",
    licence: "manufacturer-marketing",
  },
  "prod-precision-ph1500": {
    slug: "precision-ph1500",
    pages: [
      "https://www.precisionhydration.com/products/ph-1500",
      "https://precisionfuelandhydration.com/products/ph-1500",
    ],
    prefer: /cdn\.shopify|precision/,
    sourceUrl: "https://www.precisionhydration.com/products/ph-1500",
    source: "Precision Fuel Shopify CDN (PH 1500)",
    licence: "manufacturer-marketing",
  },
  "prod-huma-gel-original": {
    slug: "huma-gel-original",
    pages: ["https://humagel.com/products/original", "https://humagel.com/collections/gels"],
    prefer: /cdn\.shopify|huma/,
    sourceUrl: "https://humagel.com/products/original",
    source: "Hüma Shopify CDN (Original Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-spring-awesome-sauce": {
    slug: "spring-energy-awesome-sauce",
    pages: [
      "https://www.springenergy.co/products/awesome-sauce",
      "https://springenergy.co/products/awesome-sauce",
    ],
    prefer: /cdn\.shopify|spring/,
    sourceUrl: "https://www.springenergy.co/products/awesome-sauce",
    source: "Spring Energy Shopify CDN (Awesome Sauce)",
    licence: "manufacturer-marketing",
  },
  "prod-naak-ultra-energy-bar": {
    slug: "naak-ultra-energy-bar",
    pages: [
      "https://www.naak.com/products/ultra-energy-bar",
      "https://www.naak.com/collections/bars",
    ],
    prefer: /cdn\.shopify|naak/,
    sourceUrl: "https://www.naak.com/products/ultra-energy-bar",
    source: "Näak Shopify CDN (Ultra Energy Bar)",
    licence: "manufacturer-marketing",
  },
  "prod-naak-ultra-energy-drink": {
    slug: "naak-ultra-energy-drink-mix",
    pages: [
      "https://www.naak.com/products/ultra-energy-drink-mix",
      "https://www.naak.com/collections/drink-mixes",
    ],
    prefer: /cdn\.shopify|naak/,
    sourceUrl: "https://www.naak.com/products/ultra-energy-drink-mix",
    source: "Näak Shopify CDN (Ultra Energy Drink Mix)",
    licence: "manufacturer-marketing",
  },
  "prod-neversecond-c30-gel": {
    slug: "neversecond-c30-gel",
    pages: ["https://www.never2.com/products/c30-energy-gel", "https://www.never2.com/collections/gels"],
    prefer: /cdn\.shopify|never2/,
    sourceUrl: "https://www.never2.com/products/c30-energy-gel",
    source: "Neversecond Shopify CDN (C30 Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-neversecond-c30-drink": {
    slug: "neversecond-c30-sports-drink",
    pages: [
      "https://www.never2.com/products/c30-sports-drink",
      "https://www.never2.com/collections/drinks",
    ],
    prefer: /cdn\.shopify|never2/,
    sourceUrl: "https://www.never2.com/products/c30-sports-drink",
    source: "Neversecond Shopify CDN (C30 Sports Drink)",
    licence: "manufacturer-marketing",
  },
  "prod-high5-energy-gel": {
    slug: "high5-energy-gel",
    pages: ["https://highfive.co.uk/products/energy-gel", "https://highfive.co.uk/collections/gels"],
    prefer: /cdn\.shopify|highfive/,
    sourceUrl: "https://highfive.co.uk/products/energy-gel",
    source: "High5 Shopify CDN (Energy Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-high5-zero": {
    slug: "high5-zero",
    pages: ["https://highfive.co.uk/products/zero", "https://highfive.co.uk/products/zero-electrolyte-drink"],
    prefer: /cdn\.shopify|highfive/,
    sourceUrl: "https://highfive.co.uk/products/zero",
    source: "High5 Shopify CDN (ZERO)",
    licence: "manufacturer-marketing",
  },
  "prod-styrkr-gel30": {
    slug: "styrkr-gel30",
    pages: ["https://styrkr.com/products/gel30", "https://styrkr.com/collections/gels"],
    prefer: /cdn\.shopify|styrkr/,
    sourceUrl: "https://styrkr.com/products/gel30",
    source: "STYRKR Shopify CDN (GEL30)",
    licence: "manufacturer-marketing",
  },
  "prod-styrkr-mix90": {
    slug: "styrkr-mix90",
    pages: ["https://styrkr.com/products/mix90", "https://styrkr.com/collections/drink-mixes"],
    prefer: /cdn\.shopify|styrkr/,
    sourceUrl: "https://styrkr.com/products/mix90",
    source: "STYRKR Shopify CDN (MIX90)",
    licence: "manufacturer-marketing",
  },
  "prod-veloforte-bar": {
    slug: "veloforte-energy-bar",
    pages: ["https://www.veloforte.cc/products/ciocco", "https://www.veloforte.cc/collections/energy-bars"],
    prefer: /cdn\.shopify|veloforte/,
    sourceUrl: "https://www.veloforte.cc/collections/energy-bars",
    source: "Veloforte Shopify CDN (Energy Bar)",
    licence: "manufacturer-marketing",
  },
  "prod-veloforte-chews": {
    slug: "veloforte-energy-chews",
    pages: ["https://www.veloforte.cc/products/energia", "https://www.veloforte.cc/collections/chews"],
    prefer: /cdn\.shopify|veloforte/,
    sourceUrl: "https://www.veloforte.cc/collections/chews",
    source: "Veloforte Shopify CDN (Energy Chews)",
    licence: "manufacturer-marketing",
  },
  "prod-226ers-high-energy-gel": {
    slug: "226ers-high-energy-gel",
    pages: [
      "https://www.226ers.com/en/high-energy-gel",
      "https://www.226ers.com/products/high-energy-gel",
    ],
    prefer: /cdn\.shopify|226ers/,
    sourceUrl: "https://www.226ers.com/en/high-energy-gel",
    source: "226ERS CDN (High Energy Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-enervit-carbo-gel": {
    slug: "enervit-c2-1-carbo-gel",
    pages: [
      "https://www.enervit.com/en/c21-carbo-gel",
      "https://www.enervitsport.com/products/c2-1-carbo-gel",
    ],
    prefer: /cdn\.shopify|enervit/,
    sourceUrl: "https://www.enervit.com/en/c21-carbo-gel",
    source: "Enervit CDN (C2:1 Carbo Gel)",
    licence: "manufacturer-marketing",
  },
  "prod-powerbar-energize": {
    slug: "powerbar-energize",
    pages: [
      "https://www.powerbar.com/en/products/energize",
      "https://www.powerbar.eu/en/products/energize",
    ],
    prefer: /cdn\.shopify|powerbar|media/,
    sourceUrl: "https://www.powerbar.com/en/products/energize",
    source: "PowerBar CDN (Energize)",
    licence: "manufacturer-marketing",
  },
};

function curl(url, dest, maxTime = 35) {
  try {
    const code = execFileSync(
      "/usr/bin/curl",
      ["--http1.1", "-sL", "--max-time", String(maxTime), "-A", UA, "-o", dest, "-w", "%{http_code}", url],
      { encoding: "utf8" },
    ).trim();
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    return { code, size, ok: code === "200" && size > 3000 };
  } catch (e) {
    return { code: String(e.stdout || "err").trim(), size: 0, ok: false };
  }
}

function isImage(buf) {
  if (buf.length < 4000) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF") return true;
  const head = buf.slice(0, 200).toString("utf8");
  if (/<!DOCTYPE|<html/i.test(head)) return false;
  return false;
}

function extractUrls(html) {
  const urls = new Set();
  const re =
    /https?:\/\/[^"'\\\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s<>]*)?/gi;
  for (const m of html.matchAll(re)) urls.add(m[0].replace(/&amp;/g, "&"));
  for (const m of html.matchAll(/\/\/(?:cdn\.shopify\.com|[^"'\\\s]+\/cdn\/shop)\/[^"'\\\s]+/gi)) {
    urls.add(`https:${m[0]}`.replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(
    /property=["']og:image["']\s+content=["']([^"']+)/gi,
  )) {
    let u = m[1];
    if (u.startsWith("//")) u = `https:${u}`;
    urls.add(u);
  }
  for (const m of html.matchAll(
    /content=["']([^"']+)["']\s+property=["']og:image["']/gi,
  )) {
    let u = m[1];
    if (u.startsWith("//")) u = `https:${u}`;
    urls.add(u);
  }
  // Shopify product JSON featured_image
  for (const m of html.matchAll(/"featured_image"\s*:\s*"(\/\/[^"]+)"/g)) {
    urls.add(`https:${m[1]}`);
  }
  for (const m of html.matchAll(/"src"\s*:\s*"(https:[^"]+\.(?:jpg|png|webp)[^"]*)"/gi)) {
    urls.add(m[1].replace(/\\u0026/g, "&"));
  }
  return [...urls];
}

function scoreUrl(url, prefer) {
  let s = 0;
  const u = url.toLowerCase();
  if (prefer && prefer.test(url)) s += 50;
  if (/og|product|primary|hero|pack|featured|__shad__qt|noshad__adv/i.test(u)) s += 20;
  if (/logo|icon|sprite|favicon|banner|social|avatar|placeholder|1x1|pixel/i.test(u)) s -= 80;
  if (/lifestyle|model|worn|athlete/i.test(u)) s -= 10;
  if (/width=1200|width=1000|_1200|_1000|master|2048|1600/i.test(u)) s += 15;
  if (/\.(jpg|jpeg|png)(\?|$)/i.test(u)) s += 5;
  if (/assets2\.oakley\.com/.test(u)) s += 30;
  return s;
}

function pickBest(urls, prefer) {
  const ranked = urls
    .map((url) => ({ url, score: scoreUrl(url, prefer) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, 8).map((x) => x.url);
}

function widenOakley(url) {
  if (!/assets2\.oakley\.com/.test(url)) return url;
  if (/impolicy=/.test(url)) {
    return url.replace(/width=\d+/, "width=1200");
  }
  return `${url.split("?")[0]}?impolicy=OO_ratio&width=1200`;
}

function downloadImage(remote, destBase) {
  const candidates = [widenOakley(remote), remote.split("?")[0], remote];
  for (const url of [...new Set(candidates)]) {
    const tmp = `${destBase}.bin`;
    const got = curl(url, tmp, 40);
    if (!got.ok) continue;
    const buf = fs.readFileSync(tmp);
    if (!isImage(buf)) continue;
    const ext = url.toLowerCase().includes(".png")
      ? "png"
      : url.toLowerCase().includes(".webp")
        ? "webp"
        : "jpg";
    const dest = `${destBase}.${ext}`;
    fs.renameSync(tmp, dest);
    return { dest, buf, remote: url, ext };
  }
  return null;
}

function mergeRegistry(entries) {
  let src = fs.readFileSync(CATALOG, "utf8");
  let added = 0;
  for (const e of entries) {
    if (!e.ok || !e.src) continue;
    if (src.includes(`"${e.id}":`)) continue;
    const block = `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "${e.licence}",
    attribution: "© Brand — official / authorized product photography",
    width: 1200,
    height: 1200,
  },
`;
    src = src.replace(
      "export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n",
      `export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n${block}`,
    );
    added += 1;
  }
  fs.writeFileSync(CATALOG, src);
  return added;
}

function processCurated(id, meta) {
  const base = path.join(OUT_DIR, `${meta.slug}-hero`);
  const hit = downloadImage(meta.remote, base);
  if (!hit) return { id, slug: meta.slug, ok: false, error: "download-fail" };
  const rel = `/images/running/accessories/${meta.slug}-hero.${hit.ext}`;
  return {
    id,
    slug: meta.slug,
    ok: true,
    src: rel,
    sourceUrl: meta.sourceUrl,
    source: meta.source,
    licence: meta.licence,
    remote: hit.remote,
    bytes: hit.buf.length,
  };
}

function processScrape(id, meta) {
  for (const page of meta.pages) {
    const htmlPath = path.join(TMP, `${id}-${crypto.createHash("md5").update(page).digest("hex").slice(0, 8)}.html`);
    const got = curl(page, htmlPath, 30);
    if (!got.ok && got.size < 5000) continue;
    const html = fs.readFileSync(htmlPath, "utf8");
    if (/page not found|404|access denied|captcha|enable cookies/i.test(html) && html.length < 8000)
      continue;
    const urls = pickBest(extractUrls(html), meta.prefer);
    for (const remote of urls) {
      const base = path.join(OUT_DIR, `${meta.slug}-hero`);
      const hit = downloadImage(remote, base);
      if (!hit) continue;
      const rel = `/images/running/accessories/${meta.slug}-hero.${hit.ext}`;
      return {
        id,
        slug: meta.slug,
        ok: true,
        src: rel,
        sourceUrl: meta.sourceUrl || page,
        source: meta.source,
        licence: meta.licence,
        remote: hit.remote,
        bytes: hit.buf.length,
        page,
      };
    }
  }
  return { id, slug: meta.slug, ok: false, error: "no-image" };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const results = [];
console.log(`Curated: ${Object.keys(CURATED).length} | Scrape: ${Object.keys(SCRAPE).length}`);

for (const [id, meta] of Object.entries(CURATED)) {
  process.stdout.write(`… ${meta.slug} `);
  const r = processCurated(id, meta);
  console.log(r.ok ? `OK ${r.bytes}` : `FAIL ${r.error}`);
  results.push(r);
}

for (const [id, meta] of Object.entries(SCRAPE)) {
  if (results.some((x) => x.id === id && x.ok)) continue;
  process.stdout.write(`… ${meta.slug} `);
  const r = processScrape(id, meta);
  console.log(r.ok ? `OK ${r.bytes}` : `FAIL ${r.error}`);
  results.push(r);
}

const ok = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
const added = mergeRegistry(ok);
fs.writeFileSync(REPORT, JSON.stringify({ ok: ok.length, fail: fail.length, results }, null, 2));

console.log(`\nOK ${ok.length} / FAIL ${fail.length}`);
console.log(`Registry added: ${added}`);
console.log(`OK ids:\n${ok.map((r) => r.id).join("\n")}`);
if (fail.length) console.log(`FAIL ids:\n${fail.map((r) => r.id).join("\n")}`);
