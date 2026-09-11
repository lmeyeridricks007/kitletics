#!/usr/bin/env bash
# Fetch authentic heroes for shoe media gaps via www.runrepeat.com
# Usage: bash scripts/fetch-media-gaps.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
UA="Mozilla/5.0"
TMP="data/staging/media-fetch-tmp"
mkdir -p "$TMP" public/images/running/products public/images/padel/products public/images/tennis/products
AUDIT="data/staging/catalog-media-audit-shoes-only.json"
[[ -f "$AUDIT" ]] || AUDIT="data/staging/catalog-media-audit-2026-09-04.json"

RESULTS_JSONL="data/staging/media-gaps-batch.jsonl"
: > "$RESULTS_JSONL"
ok=0
fail=0

dir_for() {
  case "$1" in
    running-shoes) echo "running/products" ;;
    padel-shoes) echo "padel/products" ;;
    tennis-shoes) echo "tennis/products" ;;
    *) echo "running/products" ;;
  esac
}

node -e "
const a=require('./$AUDIT');
for (const g of a.gaps||[]) {
  if (!/running-shoes|padel-shoes|tennis-shoes/.test(g.categorySlug||'')) continue;
  if (g.reason==='missing-provenance') continue;
  console.log([g.slug,g.productId,g.categorySlug].join('|'));
}
" | while IFS='|' read -r slug id cat; do
  echo -n "… $slug "
  hit_url=""
  page_url=""
  cands="$slug"
  if [[ "$slug" == new-balance-fresh-foam-x-* ]]; then
    cands="$cands ${slug/new-balance-fresh-foam-x-/new-balance-}"
  fi
  if [[ "$slug" == topo-athletic-* ]]; then
    cands="$cands ${slug/topo-athletic-/topo-}"
  fi

  for cand in $cands; do
    html="$TMP/$cand.html"
    code=$(curl --http1.1 -sL --max-time 35 -A "$UA" -o "$html" -w "%{http_code}" "https://www.runrepeat.com/$cand" || echo "000")
    if [[ "$code" != "200" ]]; then
      continue
    fi
    img=$(rg -o 'https://cdn\.runrepeat\.com/storage/gallery/product_primary/[0-9]+/[A-Za-z0-9_.-]+-main\.jpg' "$html" 2>/dev/null | head -1 || true)
    if [[ -z "$img" ]]; then
      img=$(rg -o 'https://cdn\.runrepeat\.com/storage/gallery/product_primary/[0-9]+/[A-Za-z0-9_.-]+-1440\.jpg' "$html" 2>/dev/null | head -1 || true)
    fi
    if [[ -n "$img" ]]; then
      hit_url="$img"
      page_url="https://www.runrepeat.com/$cand"
      break
    fi
  done

  if [[ -z "$hit_url" ]]; then
    echo "FAIL"
    printf '{"id":"%s","slug":"%s","ok":false,"categorySlug":"%s"}\n' "$id" "$slug" "$cat" >> "$RESULTS_JSONL"
    fail=$((fail+1))
    sleep 0.35
    continue
  fi

  dir=$(dir_for "$cat")
  dest="public/images/$dir/${slug}-hero.jpg"
  mkdir -p "public/images/$dir"
  icode=$(curl --http1.1 -sL --max-time 35 -A "$UA" -o "$dest" -w "%{http_code}" "$hit_url" || echo "000")
  size=$(wc -c < "$dest" | tr -d ' ')
  if [[ "$icode" != "200" || "$size" -lt 8000 ]]; then
    echo "FAIL img"
    rm -f "$dest"
    printf '{"id":"%s","slug":"%s","ok":false,"categorySlug":"%s"}\n' "$id" "$slug" "$cat" >> "$RESULTS_JSONL"
    fail=$((fail+1))
    sleep 0.35
    continue
  fi

  echo "OK $size"
  node -e "console.log(JSON.stringify({id:process.argv[1],slug:process.argv[2],ok:true,src:process.argv[3],sourceUrl:process.argv[4],licence:'retailer-authorized',source:'Independent lab product photography (RunRepeat)',categorySlug:process.argv[5]}))" \
    "$id" "$slug" "/images/$dir/${slug}-hero.jpg" "$page_url" "$cat" >> "$RESULTS_JSONL"
  ok=$((ok+1))
  sleep 0.35
done

# Note: ok/fail in subshell from pipe — recount from jsonl
node --input-type=module <<'NODE'
import fs from "node:fs";
const lines = fs.readFileSync("data/staging/media-gaps-batch.jsonl", "utf8").trim().split("\n").filter(Boolean);
const results = lines.map((l) => JSON.parse(l));
fs.writeFileSync("data/staging/media-gaps-batch.json", JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ok);
console.log(`Done OK=${ok.length} FAIL=${results.length - ok.length}`);

let runningSrc = fs.readFileSync("src/content/running/product-media.ts", "utf8");
let catalogSrc = fs.readFileSync("src/content/catalog-product-media.ts", "utf8");
let addedR = 0, addedC = 0;
for (const e of ok) {
  if (runningSrc.includes(`"${e.id}":`) || catalogSrc.includes(`"${e.id}":`)) continue;
  const block = `  "${e.id}": {
    productId: "${e.id}",
    src: "${e.src}",
    sourceUrl: ${JSON.stringify(e.sourceUrl)},
    source: ${JSON.stringify(e.source)},
    licence: "retailer-authorized",
    attribution: "Product photography via RunRepeat — pending manufacturer packshot",
    width: 1000,
    height: 1000,
  },
`;
  if (e.categorySlug === "running-shoes" || e.src.includes("/running/products/")) {
    runningSrc = runningSrc.replace(
      "export const RUNNING_PRODUCT_MEDIA: Record<string, RunningProductMediaSource> = {\n",
      `export const RUNNING_PRODUCT_MEDIA: Record<string, RunningProductMediaSource> = {\n${block}`,
    );
    addedR++;
  } else {
    catalogSrc = catalogSrc.replace(
      "export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n",
      `export const CATALOG_PRODUCT_MEDIA: Record<string, CatalogProductMediaSource> = {\n${block}`,
    );
    addedC++;
  }
}
fs.writeFileSync("src/content/running/product-media.ts", runningSrc);
fs.writeFileSync("src/content/catalog-product-media.ts", catalogSrc);
console.log(`Registry +${addedR} running +${addedC} catalog`);
NODE
