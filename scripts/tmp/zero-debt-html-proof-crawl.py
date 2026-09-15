#!/usr/bin/env python3
"""Required-zero rendered-quality proof crawl against a production Next server."""
from __future__ import annotations

import csv
import html
import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

BASE = "http://127.0.0.1:3020"
OUT = Path("/Users/LMeyeridricks/Documents/coding/kitletics/docs/prelaunch/data")

TOKEN = [
    ("skuslug", re.compile(r"skuslug[a-z0-9]*", re.I)),
    ("skuid", re.compile(r"skuid[a-z0-9]*", re.I)),
    ("concatenated_token_phrase", re.compile(r"concatenated\s+\w+\s+token", re.I)),
]
MACHINE = [
    ("already_decided_lane", re.compile(r"already decided the lane", re.I)),
    ("headline_trait", re.compile(r"as the headline trait", re.I)),
    ("pause_if_not", re.compile(r"i['’]d pause if not", re.I)),
    ("look_elsewhere_if_not", re.compile(r"look elsewhere if not", re.I)),
]
RAW = re.compile(
    r"\b(heelStack|forefootStack|cushionLevel|cushionFeel|rideCharacter|energyReturn|plateMaterial|widthOptions|archSupport|intendedJob|skuSlug|skuId)\b"
)
BROKEN = re.compile(r"look elsewhere if not |i['’]d pause if not ", re.I)


def visible(h: str) -> str:
    h = re.sub(r"<script[\s\S]*?</script>", " ", h, flags=re.I)
    h = re.sub(r"<style[\s\S]*?</style>", " ", h, flags=re.I)
    h = re.sub(r"<noscript[\s\S]*?</noscript>", " ", h, flags=re.I)
    h = re.sub(r"<!--[\s\S]*?-->", " ", h)
    h = re.sub(r"<[^>]+>", " ", h)
    return re.sub(r"\s+", " ", html.unescape(h)).strip()


def imgs(h: str) -> set[str]:
    found: set[str] = set()
    for m in re.finditer(r"/images/[^\"'\s?]+", h):
        found.add(m.group(0).split("?")[0])
    return found


def topic_of(path: str, title: str) -> str:
    hay = f"{path} {title}".lower()
    if "padel" in hay:
        return "padel"
    if "tennis" in hay:
        return "tennis"
    if path.startswith("/brands/tyr") or "hyrox" in hay:
        return "fitness"
    if "watch" in hay or "gps" in hay:
        return "watch"
    return "other"


def known_filler(src: str, topic: str, path: str, title: str) -> str | None:
    hay = f"{path} {title}".lower()
    if (
        src == "/images/home/guide-how-to-choose.jpg"
        and "padel" not in topic
        and "padel" not in hay
    ):
        return "padel_running_watch_image"
    if src == "/images/brands/heroes/urban-dusk.jpg" and (
        "watch" in hay or "gps" in hay or topic == "watch"
    ):
        return "skyline_watch_guide"
    if src == "/images/home/guide-running-shoes.jpg" and topic in (
        "padel",
        "tennis",
        "fitness",
    ):
        return "running_shoe_cross_sport"
    return None


def fetch(path: str, timeout: int = 45) -> tuple[str, int, str, str]:
    req = urllib.request.Request(
        f"{BASE}{path}", headers={"user-agent": "kitletics-zero-debt/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return path, int(res.status), res.read().decode("utf-8", "replace"), ""
    except Exception as exc:  # noqa: BLE001
        return path, 0, "", str(exc)[:160]


def main() -> None:
    paths = [r["path"] for r in csv.DictReader(open(OUT / "ZERO-DEBT-HTML-CRAWL.csv"))]
    print(f"inventory {len(paths)}", flush=True)
    results: list[dict] = []
    issues: list[dict] = []
    ok = fail = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        for i, (path, status, body, err) in enumerate(ex.map(fetch, paths), 1):
            if status != 200:
                path, status, body, err = fetch(path, timeout=60)
            vis = ""
            title = ""
            token: list[str] = []
            machine: list[str] = []
            raw = False
            fillers: list[str] = []
            if status == 200:
                ok += 1
                vis = visible(body)
                m = re.search(r"<title[^>]*>([\s\S]*?)</title>", body, re.I)
                title = html.unescape(m.group(1)).strip() if m else ""
                srcs = imgs(body)
                token = [n for n, rx in TOKEN if rx.search(vis)]
                machine = [n for n, rx in MACHINE if rx.search(vis)]
                raw = bool(RAW.search(vis))
                top = topic_of(path, title)
                for src in srcs:
                    filler = known_filler(src, top, path, title)
                    if filler:
                        fillers.append(f"{filler}:{src}")
                if BROKEN.search(vis):
                    issues.append(
                        {
                            "path": path,
                            "cls": "DECISION_COPY",
                            "sub": "BROKEN",
                            "excerpt": vis[:180],
                            "img": "",
                            "sev": "BLOCKER",
                        }
                    )
            else:
                fail += 1
                issues.append(
                    {
                        "path": path,
                        "cls": "HTTP",
                        "sub": "NOT_200",
                        "excerpt": err,
                        "img": "",
                        "sev": "BLOCKER",
                    }
                )
            if token:
                issues.append(
                    {
                        "path": path,
                        "cls": "TOKEN_LEAK",
                        "sub": "|".join(token),
                        "excerpt": vis[:180],
                        "img": "",
                        "sev": "BLOCKER",
                    }
                )
            if machine and not BROKEN.search(vis):
                issues.append(
                    {
                        "path": path,
                        "cls": "MACHINE_COPY_BODY",
                        "sub": "|".join(machine),
                        "excerpt": vis[:180],
                        "img": "",
                        "sev": "HIGH",
                    }
                )
            if raw:
                issues.append(
                    {
                        "path": path,
                        "cls": "CONTENT_SANITY",
                        "sub": "raw_catalog_key",
                        "excerpt": vis[:180],
                        "img": "",
                        "sev": "HIGH",
                    }
                )
            for filler in fillers:
                issues.append(
                    {
                        "path": path,
                        "cls": "IMAGE_SEMANTIC",
                        "sub": "WRONG_SPORT",
                        "excerpt": title[:180],
                        "img": filler,
                        "sev": "BLOCKER",
                    }
                )
            results.append(
                {
                    "path": path,
                    "status": status,
                    "error": err,
                    "has_token": bool(token),
                    "has_machine": bool(machine),
                    "raw": raw,
                    "fillers": "|".join(fillers),
                }
            )
            if i % 100 == 0:
                print(
                    f"crawled {i}/{len(paths)} ok={ok} fail={fail} issues={len(issues)}",
                    flush=True,
                )

    print(f"DONE ok={ok} fail={fail} issues={len(issues)}", flush=True)
    cols = [
        "issue_id",
        "severity",
        "url",
        "path",
        "page_type",
        "issue_class",
        "issue_subclass",
        "rendered_excerpt",
        "image_path",
        "root_cause",
        "status",
    ]
    with open(OUT / "FINAL-RENDERED-QUALITY-ZERO-DEBT.csv", "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        for i, iss in enumerate(issues, 1):
            w.writerow(
                {
                    "issue_id": f"RQ-{i:05d}",
                    "severity": iss["sev"],
                    "url": f"{BASE}{iss['path']}",
                    "path": iss["path"],
                    "page_type": "",
                    "issue_class": iss["cls"],
                    "issue_subclass": iss["sub"],
                    "rendered_excerpt": iss["excerpt"].replace("\n", " ")[:220],
                    "image_path": iss["img"],
                    "root_cause": iss["sub"],
                    "status": "OPEN" if issues else "CLOSED",
                }
            )
    summary = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "base": BASE,
        "sitemapUrls": len(paths),
        "crawled": len(results),
        "httpNot200": sum(1 for r in results if r["status"] != 200),
        "tokenLeakUrls": sum(1 for r in results if r["has_token"]),
        "htmlMachineCopyUrls": sum(1 for r in results if r["has_machine"]),
        "decisionBrokenUrls": sum(1 for i in issues if i["sub"] == "BROKEN"),
        "knownFillerUrls": sum(1 for r in results if r["fillers"]),
        "rawCatalogKeyUrls": sum(1 for r in results if r["raw"]),
        "remainingIssues": len(issues),
    }
    (OUT / "ZERO-DEBT-HTML-CRAWL-SUMMARY.json").write_text(
        json.dumps(summary, indent=2) + "\n"
    )
    print(json.dumps(summary, indent=2), flush=True)
    for iss in issues[:40]:
        print(iss["sev"], iss["path"], iss["cls"], iss["sub"], iss["img"][:80])


if __name__ == "__main__":
    main()
