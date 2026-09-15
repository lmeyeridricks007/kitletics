#!/usr/bin/env python3
import re
import urllib.error
import urllib.request
from pathlib import Path

html = urllib.request.urlopen(
    urllib.request.Request("https://kitletics.com/padel", headers={"User-Agent": "probe"}),
    timeout=45,
).read().decode("utf-8", "replace")
imgs = sorted(set(re.findall(r"/images/padel/products/[^\"\\s?]+", html)))
print(f"unique product image refs: {len(imgs)}")
for needle in ["indiga", "comfort-soft", "equation", "match-light", "match_light"]:
    hits = [u for u in imgs if needle in u.lower()]
    print(needle, hits[:5])

# Check HTTP status for first hits + beginner-looking ones
check = []
for u in imgs:
    if any(x in u.lower() for x in ["indiga", "comfort-soft", "equation", "match"]):
        check.append(u)
check = check[:12] or imgs[:8]
root = Path("/Users/LMeyeridricks/Documents/coding/kitletics")
for u in check:
    local = root / "public" / u.lstrip("/")
    exists = local.exists()
    status = "?"
    try:
        req = urllib.request.Request(f"https://kitletics.com{u}", method="HEAD", headers={"User-Agent": "probe"})
        with urllib.request.urlopen(req, timeout=20) as res:
            status = str(res.status)
    except urllib.error.HTTPError as e:
        status = str(e.code)
    except Exception as e:  # noqa: BLE001
        status = type(e).__name__
    print(f"{status} local={exists} {u}")
