#!/usr/bin/env python3
"""Append verified padel shoe heroes into PADEL_SECONDARY_PRODUCT_MEDIA."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
todo = json.loads(
    (ROOT / "data/staging/padel-pdp-shoe-media-register.json").read_text()
)
path = ROOT / "src/content/padel/soft-goods/product-media.ts"
text = path.read_text()

blocks: list[str] = []
for e in todo:
    source = e["source"].replace("\\", "\\\\").replace('"', '\\"')
    blocks.append(
        f'''  "{e["id"]}": {{
    productId: "{e["id"]}",
    src: "{e["src"]}",
    sourceUrl: "{e["sourceUrl"]}",
    source: "{source}",
    licence: "retailer-authorized",
    attribution: "© Brand — official / authorized product photography",
    width: 1200,
    height: 1200,
    retrievedAt: "2026-09-14",
  }},'''
    )

insert = (
    "\n  // PDP parity remediation — exact shoe packshots (wave27 + local verified)\n"
    + "\n".join(blocks)
    + "\n"
)

idx = text.rfind("\n};")
if idx < 0:
    raise SystemExit("no closing brace")

before = text[:idx].rstrip()
if before.endswith(","):
    new = text[:idx] + "\n" + insert + text[idx + 1 :]
else:
    new = text[:idx] + ",\n" + insert + text[idx + 1 :]

path.write_text(new)
print(f"appended {len(todo)} entries")
