import urllib.request
import urllib.error

paths = [
    "/images/padel/products/bullpadel-indiga-ctr-hero.jpg",
    "/images/padel/products/kuikma-pr-comfort-soft-hero.jpg",
    "/images/padel/products/nox-equation-soft-advanced-2026-hero.jpg",
    "/images/padel/products/adidas-match-light-2026-hero.jpg",
]
base = "https://7ulvvexjky4ctpnj.public.blob.vercel-storage.com"
site = "https://kitletics.com"
for u in paths:
    for label, root in [("BLOB", base), ("SITE", site)]:
        try:
            with urllib.request.urlopen(root + u, timeout=30) as r:
                print(label, u, r.status, r.headers.get("content-type"), "len", r.headers.get("content-length"))
        except Exception as e:  # noqa: BLE001
            print(label, u, e)
