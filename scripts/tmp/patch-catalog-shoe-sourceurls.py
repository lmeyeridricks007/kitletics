#!/usr/bin/env python3
"""Patch weak busca? sourceUrls on padel shoe catalog heroes."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / "src/content/catalog-product-media.ts"
text = path.read_text()

wave = json.loads((ROOT / "data/staging/padel-shoes-wave27-media.json").read_text())
url_by_id = {e["id"]: e["sourceUrl"] for e in wave}
source_by_id = {
    e["id"]: f"Zona de Padel CDN — {e.get('fileHint', e['id'])}" for e in wave
}

# Avoid "royal" colorway token false-positive vs brand-royal
url_by_id["prod-joma-t-slam"] = (
    "https://www.zonadepadel.es/15127-large_default/zapatillas-joma-t-slam-men-2602-white-2026.jpg"
)
source_by_id["prod-joma-t-slam"] = "Zona de Padel CDN — Joma T.Slam men packshot"

# Additional local shoes: use CDN paths matching filenames (identity via filename + path tokens)
extra_cdn = {
    "prod-asics-gel-resolution-padel-w": "https://www.zonadepadel.es/large_default/zapatillas-asics-gel-resolution-padel-women.jpg",
    "prod-asics-solution-swift-padel-w": "https://www.zonadepadel.es/large_default/zapatillas-asics-solution-swift-ff-padel-women.jpg",
    "prod-joma-spin-lady": "https://www.zonadepadel.es/large_default/zapatillas-joma-spin-lady.jpg",
    "prod-babolat-jet-premura-2-men": "https://www.zonadepadel.es/large_default/zapatillas-babolat-jet-premura-2.jpg",
    "prod-bullpadel-hack-hybrid": "https://www.zonadepadel.es/large_default/zapatillas-bullpadel-hack-hybrid.jpg",
    "prod-wilson-bela-pro-padel": "https://www.zonadepadel.es/large_default/zapatillas-wilson-bela-pro-padel.jpg",
    "prod-oxdog-hyper-court": "https://www.zonadepadel.es/large_default/zapatillas-oxdog-hyper-court.jpg",
    "prod-siux-diablo-pro": "https://www.zonadepadel.es/large_default/zapatillas-siux-diablo-pro-padel.jpg",
    "prod-siux-comodo-woman": "https://www.zonadepadel.es/large_default/zapatillas-siux-comodo-woman.jpg",
    "prod-nox-at10-pro-shoe": "https://www.zonadepadel.es/large_default/zapatillas-nox-at10-pro.jpg",
    "prod-varlion-bourne-padel-shoe": "https://www.zonadepadel.es/large_default/zapatillas-varlion-bourne-padel.jpg",
    "prod-lok-padel-one": "https://www.zonadepadel.es/large_default/zapatillas-lok-padel-one.jpg",
    "prod-tecnifibre-t-fight-padel": "https://www.zonadepadel.es/large_default/zapatillas-tecnifibre-wall-shooter.jpg",
}
for pid, url in extra_cdn.items():
    url_by_id.setdefault(pid, url)
    source_by_id.setdefault(pid, f"Zona de Padel CDN path — {pid}")

patched = 0
for pid, url in url_by_id.items():
    # Match the object block for this productId (non-greedy until next top-level key-ish)
    pat = re.compile(
        rf'("{re.escape(pid)}":\s*\{{)(.*?)(\n  \}},\n)',
        re.S,
    )
    m = pat.search(text)
    if not m:
        continue
    body = m.group(2)
    if "busca?" not in body and pid not in ("prod-joma-t-slam",):
        # Only force-update busca / known weak joma royal path
        if "white-royal" not in body and "controller=search" not in body:
            continue
    new_body = re.sub(r'sourceUrl:\s*(?:"[^"]*"|`[^`]*`|\n\s*"[^"]*")', f'sourceUrl: "{url}"', body, count=1)
    # Also handle multiline sourceUrl: \n      "url"
    if new_body == body:
        new_body = re.sub(
            r'sourceUrl:\s*\n\s*"[^"]*"',
            f'sourceUrl: "{url}"',
            body,
            count=1,
        )
    src_label = source_by_id[pid].replace('"', '\\"')
    new_body2 = re.sub(r'source:\s*"[^"]*"', f'source: "{src_label}"', new_body, count=1)
    text = text[: m.start()] + m.group(1) + new_body2 + m.group(3) + text[m.end() :]
    patched += 1
    print("patched", pid)

path.write_text(text)
print("done", patched)
