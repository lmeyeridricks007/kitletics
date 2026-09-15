#!/usr/bin/env python3
import re
import urllib.request
import urllib.error

UA = {"User-Agent": "parity-audit"}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as res:
        return res.read().decode("utf-8", "replace")


def head_ok(url: str) -> int:
    try:
        req = urllib.request.Request(url, method="HEAD", headers=UA)
        with urllib.request.urlopen(req, timeout=20) as res:
            return res.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


pages = {
    "run_hub": "https://kitletics.com/running",
    "padel_hub": "https://kitletics.com/padel",
    "run_cat": "https://kitletics.com/running/shoes",
    "padel_cat": "https://kitletics.com/padel/rackets",
    "padel_bags": "https://kitletics.com/padel/bags",
    "run_pdp": "https://kitletics.com/products/nike-vomero-18",
    "padel_pdp": "https://kitletics.com/products/bullpadel-vertex-05-2026",
    "run_rev": "https://kitletics.com/reviews/nike-vomero-18",
    "padel_rev": "https://kitletics.com/reviews/bullpadel-indiga-ctr",
    "run_best": "https://kitletics.com/best/running-shoes",
    "padel_best": "https://kitletics.com/best/padel-rackets",
    "run_guide": "https://kitletics.com/guides/how-to-choose-running-shoes",
    "padel_guide": "https://kitletics.com/guides/how-to-choose-a-padel-racket",
}

for key, url in pages.items():
    try:
        html = fetch(url)
    except Exception as exc:  # noqa: BLE001
        print(key, "ERR", exc)
        continue
    imgs = re.findall(r'src="(/[^"]+\.(?:jpg|jpeg|png|webp))"', html, re.I)
    imgs2 = re.findall(r'"src":"(/images/[^"\\]+)"', html)
    alli = imgs + imgs2
    product = [i for i in alli if "/products/" in i]
    section = [i for i in alli if "/sections/" in i]
    print(
        f"{key}: img_tags={len(imgs)} json={len(imgs2)} "
        f"uniq_product={len(set(product))} uniq_section={len(set(section))}"
    )
    if section:
        print("  section sample", list(dict.fromkeys(section))[:5])
        # probe first section file on site
        print("  section HTTP", head_ok("https://kitletics.com" + section[0]), section[0])

# Probe known local section paths on blob/site
probes = [
    "/images/running/products/nike-vomero-18/sections/fit.png",
    "/images/padel/products/bullpadel-indiga-ctr-2026/sections/overview.png",
    "/images/padel/products/bullpadel-indiga-ctr/sections/overview.png",
]
import os
from pathlib import Path
root = Path("/Users/LMeyeridricks/Documents/coding/kitletics/public")
for rel in [
    "images/padel/products/bullpadel-indiga-ctr-2026/sections",
    "images/padel/products/bullpadel-indiga-ctr/sections",
    "images/running/products/nike-vomero-18/sections",
]:
    p = root / rel
    print("local dir", rel, "exists", p.exists(), "count", len(list(p.glob('*'))) if p.exists() else 0)

for path in probes:
    print("SITE", path, head_ok("https://kitletics.com" + path))
