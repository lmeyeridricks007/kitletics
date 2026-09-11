/**
 * Running Shoes media QA — authentic primary images for published catalog products.
 * npm run media:qa
 */
import fs from "node:fs";
import path from "node:path";
import { getCategoryBySlug, getProductsByCategory } from "@/repositories";
import { RUNNING_PRODUCT_MEDIA } from "@/content/running/product-media";
import {
  getPrimaryProductMedia,
  isAuthenticProductMedia,
} from "@/lib/product/media";

const category = getCategoryBySlug("running-shoes");
if (!category) {
  console.error("Running Shoes category not found");
  process.exit(1);
}

const products = getProductsByCategory(category.id).filter(
  (p) => p.status === "published",
);

let primaryPresent = 0;
let authentic = 0;
let broken = 0;
let missingProvenance = 0;
const featuredWithPlaceholder: string[] = [];
const missing: string[] = [];

for (const product of products) {
  const media = getPrimaryProductMedia(product);
  const registry = RUNNING_PRODUCT_MEDIA[product.id];

  if (!media) {
    missing.push(product.fullName);
    continue;
  }

  primaryPresent += 1;
  if (isAuthenticProductMedia(media)) authentic += 1;
  else if (product.status === "published") {
    featuredWithPlaceholder.push(product.fullName);
  }

  const filePath = path.join(process.cwd(), "public", media.src.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    broken += 1;
    console.warn("BROKEN", product.fullName, media.src);
  }

  if (!registry?.sourceUrl && !media.sourceUrl) missingProvenance += 1;
}

console.log("Running Shoes media QA");
console.log("----------------------");
console.log("total published:", products.length);
console.log("primary image present:", primaryPresent);
console.log("authentic media:", authentic);
console.log("placeholder / missing authentic:", products.length - authentic);
console.log("broken media files:", broken);
console.log("missing provenance:", missingProvenance);
if (missing.length) {
  console.log("\nMissing authentic primary:");
  for (const name of missing) console.log(" -", name);
}

const fail =
  broken > 0 ||
  featuredWithPlaceholder.length > 0 ||
  missing.length > Math.ceil(products.length * 0.15);

if (fail) {
  console.error("\nmedia:qa FAILED");
  process.exit(1);
}

console.log("\nmedia:qa OK");
