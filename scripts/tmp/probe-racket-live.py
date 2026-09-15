#!/usr/bin/env python3
"""Probe live racket sport pages for empty-catalog symptoms."""
from __future__ import annotations

import re
import urllib.request

PATHS = [
    "/racket",
    "/padel",
    "/padel/rackets",
    "/padel/shoes",
    "/padel/bags",
    "/tennis",
    "/tennis/rackets",
    "/tennis/shoes",
    "/badminton",
    "/pickleball",
    "/squash",
]


def fetch(path: str) -> tuple[int, str]:
    req = urllib.request.Request(
        f"https://kitletics.com{path}",
        headers={"User-Agent": "kitletics-probe/1.0"},
    )
    with urllib.request.urlopen(req, timeout=45) as res:
        return res.status, res.read().decode("utf-8", "replace")


def main() -> None:
    for path in PATHS:
        try:
            code, html = fetch(path)
        except Exception as exc:  # noqa: BLE001
            print(f"{path} -> ERROR {exc}")
            continue
        totals = re.findall(r'total\\":(\d+)', html)
        rank = html.count("RANK #")
        nomatch = html.count("No products match")
        empty = html.count("No products available")
        products = len(set(re.findall(r"/products/[a-z0-9-]+", html)))
        browse = "Browse " in html and "Padel Rackets" in html
        shortlist = "Shortlist frames" in html
        print(
            f"{path} -> {code} totals={totals[:2]} rank={rank} "
            f"nomatch={nomatch} empty={empty} products={products} "
            f"browseDefault={browse} shortlist={shortlist}"
        )


if __name__ == "__main__":
    main()
