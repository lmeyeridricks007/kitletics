#!/usr/bin/env python3
"""Merge Tier-1/Tier-2 discovery into PADEL-EQUIPMENT-MARKET-INVENTORY.csv."""
from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INV_PATH = ROOT / "docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv"
TIER2_PATH = ROOT / "docs/padel/data/PADEL-TIER2-SPECIALIST-DISCOVERY-2026-09.csv"

rows = list(csv.DictReader(INV_PATH.open()))
fields = list(rows[0].keys())
for f in ("disposition", "disposition_reason"):
    if f not in fields:
        fields.append(f)


def key(r: dict) -> tuple[str, str, str]:
    return (
        r.get("category", "").lower().strip(),
        r.get("brand", "").lower().strip(),
        r.get("model", "").lower().strip(),
    )


idx = {key(r): r for r in rows}
added: list[str] = []
skipped: list[str] = []


def blank_row() -> dict:
    return {f: "" for f in fields}


def upsert(nr: dict) -> dict:
    for f in fields:
        nr.setdefault(f, "")
    existing = idx.get(key(nr))
    if not existing:
        for r in rows:
            if (
                r["category"].lower() == nr["category"].lower()
                and r["brand"].lower() == nr["brand"].lower()
                and (
                    r["model"].lower() == nr["model"].lower()
                    or r["product"].lower() == nr["product"].lower()
                )
            ):
                existing = r
                break
    if existing:
        for fld in (
            "evidence",
            "research_status",
            "disposition",
            "disposition_reason",
            "current_status",
            "NL_available",
            "EU_available",
            "manufacturer_url",
            "retailer_urls",
            "subcategory",
            "product",
            "model",
        ):
            if nr.get(fld):
                if fld in ("disposition", "disposition_reason") or not existing.get(fld):
                    existing[fld] = nr[fld]
                elif fld in ("evidence",) and nr[fld] not in (existing.get("evidence") or ""):
                    existing[fld] = f"{existing.get('evidence') or ''} | {nr[fld]}".strip(" |")
        if nr.get("disposition", "").startswith("CATALOGED"):
            existing["disposition"] = nr["disposition"]
            existing["disposition_reason"] = nr.get("disposition_reason", "")
            existing["research_status"] = "verified"
            existing["current_status"] = nr.get("current_status", "CURRENT")
        skipped.append(f"{nr['product']} (updated)")
        return existing
    rows.append(nr)
    idx[key(nr)] = nr
    added.append(nr["product"])
    return nr


def make(
    *,
    category: str,
    subcategory: str,
    brand: str,
    product: str,
    model: str,
    evidence: str,
    generation: str = "current",
    variant: str = "",
    manufacturer_url: str = "",
    retailer_urls: str = "",
    NL_available: str = "unknown",
    EU_available: str = "yes",
    disposition: str = "CATALOGED_CURRENT",
    disposition_reason: str = "",
) -> dict:
    nr = blank_row()
    nr.update(
        {
            "category": category,
            "subcategory": subcategory,
            "brand": brand,
            "product": product,
            "model": model,
            "generation": generation,
            "gender": "unisex",
            "variant": variant,
            "manufacturer_url": manufacturer_url,
            "manufacturer_status": "current",
            "retailer_urls": retailer_urls,
            "NL_available": NL_available,
            "EU_available": EU_available,
            "current_status": "CURRENT",
            "existing_in_kitletics": "no",
            "kitletics_product_id": "",
            "evidence": evidence,
            "research_status": "verified",
            "disposition": disposition,
            "disposition_reason": disposition_reason
            or "Onboarded from brand×category discovery.",
        }
    )
    return nr


tier1_new = [
    make(
        category="bags",
        subcategory="BACKPACK",
        brand="Kuikma",
        product="Kuikma Insulated Backpack Pro 40 L",
        model="Insulated Backpack Pro 40 L",
        manufacturer_url="https://www.decathlon.com",
        retailer_urls="https://www.decathlon.com",
        NL_available="yes",
        evidence="Tier1: Decathlon Pro 40L insulated backpack third ladder rung.",
    ),
    make(
        category="bags",
        subcategory="PADEL_RACKET_BAG",
        brand="Wilson",
        product="Wilson Super Tour Padel Bag 2026",
        model="Super Tour Padel Bag 2026",
        generation="2026",
        variant="Red non-Bela",
        manufacturer_url="https://www.wilson.com",
        retailer_urls="https://www.padelreference.com/en/padel-bag/p/wilson-super-tour-padel-bag-2026-red",
        evidence="Distinct non-Bela Super Tour 2026 Red vs Bela Super Tour.",
    ),
    make(
        category="bags",
        subcategory="BACKPACK",
        brand="Wilson",
        product="Wilson Bela Super Tour Backpack",
        model="Bela Super Tour Backpack",
        manufacturer_url="https://www.wilson.com",
        retailer_urls="https://www.padelmq.com",
        evidence="Form split from Bela Super Tour racket bag.",
    ),
    make(
        category="bags",
        subcategory="DUFFEL",
        brand="Adidas",
        product="Adidas Weekend Bag Martita Ortega 2026",
        model="Weekend Bag Martita Ortega 2026",
        generation="2026",
        manufacturer_url="https://allforpadel.com/en/138-new-bag-collection",
        retailer_urls="https://padelshop.com/collections/adidas-padel-bags",
        NL_available="yes",
        evidence="Official All For Padel 2026 weekend roll-top.",
    ),
    make(
        category="accessories",
        subcategory="ACCESSORY_BAG",
        brand="Adidas",
        product="Adidas Accessory Pouch 2026",
        model="Accessory Pouch 2026",
        generation="2026",
        manufacturer_url="https://allforpadel.com",
        retailer_urls="https://padelmarket.com/en/products/adidas-accessory-bag-red-black-2026-ale-galan-toiletry-bag",
        NL_available="yes",
        evidence="Official 2026 toiletry/accessory pouch line.",
    ),
    make(
        category="accessories",
        subcategory="SHOE_BAG",
        brand="Adidas",
        product="Adidas Shoe Bag Ale Galán",
        model="Shoe Bag Ale Galán",
        generation="2026",
        manufacturer_url="https://allforpadel.com",
        retailer_urls="https://padelmarket.com",
        NL_available="yes",
        evidence="Official Adidas Padel shoe bag accessory.",
    ),
    make(
        category="bags",
        subcategory="PADEL_RACKET_BAG",
        brand="Dunlop",
        product="Dunlop Elite Thermo Paletero",
        model="Elite Thermo",
        manufacturer_url="https://www.dunlopsports.com",
        retailer_urls="https://www.dunlopsports.com",
        evidence="Official Dunlop padel Elite Thermo paletero.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Dunlop",
        product="Dunlop Tour Pro Overgrip",
        model="Tour Pro",
        manufacturer_url="https://www.dunlopsports.com",
        evidence="Official Dunlop padel Tour Pro overgrip.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Dunlop",
        product="Dunlop Tour Dry Overgrip",
        model="Tour Dry",
        manufacturer_url="https://www.dunlopsports.com",
        evidence="Official Dunlop padel Tour Dry overgrip.",
    ),
    make(
        category="accessories",
        subcategory="protector",
        brand="Dunlop",
        product="Dunlop Protection Tape",
        model="Protection Tape",
        manufacturer_url="https://www.dunlopsports.com",
        evidence="Official Dunlop padel protection tape.",
    ),
    make(
        category="bags",
        subcategory="PADEL_RACKET_BAG",
        brand="Joma",
        product="Joma Vero Virseda 2026 Padel Bag",
        model="Vero Virseda 2026",
        generation="2026",
        manufacturer_url="https://www.joma-sport.com",
        retailer_urls="https://www.padelproshop.com",
        evidence="Signature 2026 Virseda bag beyond generic Joma Pro.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Joma",
        product="Joma Club Cushion Overgrip",
        model="Club Cushion",
        manufacturer_url="https://www.joma-sport.com",
        retailer_urls="https://www.zonadepadel.com/joma/8683-overgrip-joma-club-cuhsion-orange-fluor.html",
        NL_available="yes",
        evidence="Joma Club Cushion overgrip on Zona.",
    ),
    make(
        category="bags",
        subcategory="PADEL_RACKET_BAG",
        brand="Babolat",
        product="Babolat RH Perf Padel",
        model="RH Perf Padel",
        variant="52 L",
        manufacturer_url="https://www.babolat.com/us/padel/bags.html",
        evidence="Official Babolat RH Perf architecture distinct from RH Pro.",
    ),
    make(
        category="bags",
        subcategory="BACKPACK",
        brand="Babolat",
        product="Babolat Court Backpack Lite",
        model="Court Backpack Lite",
        variant="25 L",
        manufacturer_url="https://www.babolat.com/us/padel/bags.html",
        evidence="Official Court Backpack Lite 25L.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Bullpadel",
        product="Bullpadel GB-1201 Perforated Overgrip",
        model="GB-1201 Perforated",
        manufacturer_url="https://www.bullpadel.com/gb/79-overgrips",
        NL_available="yes",
        evidence="Official Bullpadel GB-1201 perforated fork.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Bullpadel",
        product="Bullpadel GB-1202 FixoGrip Pro",
        model="GB-1202 FixoGrip Pro",
        manufacturer_url="https://www.bullpadel.com/gb/79-overgrips",
        NL_available="yes",
        evidence="Official FixoGrip Pro overgrip.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Bullpadel",
        product="Bullpadel GB-1705 SensoGrip Pro",
        model="GB-1705 SensoGrip Pro",
        manufacturer_url="https://www.bullpadel.com/gb/79-overgrips",
        NL_available="yes",
        evidence="Official thinner micro-perf SensoGrip Pro.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Nox",
        product="Nox Pro Overgrip Perforated",
        model="Pro Overgrip Perforated",
        manufacturer_url="https://noxsport.com/en/collections/overgrips",
        NL_available="yes",
        evidence="Official perforated Pro fork distinct from smooth Pro.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Wilson",
        product="Wilson Pro Overgrip Perforated",
        model="Pro Overgrip Perforated",
        manufacturer_url="https://au.wilson.com/products/pro-padel-overgrip",
        retailer_urls="https://www.tradeinn.com",
        evidence="Wilson perforated Pro padel overgrip fork.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="Wilson",
        product="Wilson Profile Padel Overgrip",
        model="Profile Padel Overgrip",
        manufacturer_url="https://www.wilson.com",
        retailer_urls="https://www.tradeinn.com/smashinn/en/wilson-profile-padel-overgrip/139879280/p",
        evidence="Wilson Profile Padel Overgrip on Tradeinn.",
    ),
    make(
        category="grips",
        subcategory="overgrip",
        brand="HEAD",
        product="HEAD Padel Pro Perforated Overgrip",
        model="Padel Pro Perforated",
        manufacturer_url="https://www.head.com/product/padel-pro-perforated-285701",
        NL_available="yes",
        evidence="Official HEAD Padel Pro Perforated PDP.",
    ),
]

for nr in tier1_new:
    upsert(nr)

resolutions = {
    ("accessories", "Oxdog", "No2"): (
        "NOT_A_DISTINCT_PRODUCT",
        "Width variant of No1 Frame Protector; collapse under No1.",
    ),
    ("accessories", "Oxdog", "No3"): (
        "INSUFFICIENT_EVIDENCE",
        "No stable live PDP confirming distinct job vs No1/No2.",
    ),
    ("grips", "Black Crown", "Black Crown Smooth"): (
        "INSUFFICIENT_EVIDENCE",
        "Smooth fork EAN/construction vs Perforated not confirmed.",
    ),
    ("bags", "Royal Padel", "One / Pro Bag"): (
        "INSUFFICIENT_EVIDENCE",
        "One/Pro naming may duplicate Force 2026; no distinct PDP confirmed.",
    ),
    ("accessories", "Pascal Box", "External compressor"): (
        "NOT_COMMERCIALLY_MEANINGFUL",
        "NUAIR/SALKI compressors are PRO system spares.",
    ),
    ("accessories", "4ON", "SpinMax"): (
        "NOT_COMMERCIALLY_MEANINGFUL",
        "Unclear padel soft-goods job; excluded this pass.",
    ),
}

# Catalog EU-evidenced optional adds
force_catalog = {
    ("grips", "Volt", "Volt Premium"),
    ("bags", "Osaka", "Pro Tour Duffel"),
    ("balls", "4ON", "Pro T1"),
    ("grips", "Tourna", "Tourna Tuff"),
    ("grips", "4ON", "SwiftGrip"),
}

t2 = list(csv.DictReader(TIER2_PATH.open()))
ADD_ACTIONS = {"ADD", "ADD_OR_RECLASSIFY", "ADD_OR_UPGRADE"}

for r in t2:
    action = r.get("discovery_action", "")
    cat, brand, model = r["category"], r["brand"], r["model"]

    resolved = None
    for (c, b, m), outcome in resolutions.items():
        if cat == c and brand == b and (model == m or model.startswith(m.split()[0])):
            resolved = outcome
            break

    if resolved:
        nr = blank_row()
        for f in fields:
            if f in r:
                nr[f] = r[f]
        nr["disposition"], nr["disposition_reason"] = resolved
        nr["research_status"] = "verified"
        upsert(nr)
        continue

    if brand == "Lok" and "Maxx" in model and action == "ADD_OR_RECLASSIFY":
        found = False
        for er in rows:
            if er["brand"] == "Lok" and "Maxx" in (er.get("model") or ""):
                er["subcategory"] = "PADEL_RACKET_BAG"
                er["model"] = "Maxx Gen 2 Paletero"
                er["product"] = "Lok Maxx Gen 2 Racket Bag"
                er["disposition"] = "CATALOGED_CURRENT"
                er["disposition_reason"] = "Reclassified backpack→paletero (70L retail)."
                er["research_status"] = "verified"
                er["current_status"] = "CURRENT"
                skipped.append("Lok Maxx reclassified")
                found = True
                break
        if not found:
            nr = blank_row()
            for f in fields:
                if f in r:
                    nr[f] = r[f]
            nr["disposition"] = "CATALOGED_CURRENT"
            nr["disposition_reason"] = "Tier-2 ADD_OR_RECLASSIFY."
            nr["research_status"] = "verified"
            upsert(nr)
        continue

    if action in ADD_ACTIONS or (cat, brand, model) in force_catalog:
        nr = blank_row()
        for f in fields:
            if f in r:
                nr[f] = r[f]
        nr["disposition"] = "CATALOGED_CURRENT"
        nr["disposition_reason"] = f"Tier-2 specialist discovery ({action or 'force'})."
        nr["research_status"] = "verified"
        nr["current_status"] = "CURRENT"
        upsert(nr)
        continue

    if action in ("ADD_IF_DISTINCT", "ADD_IF_NL_EU", "NEEDS_VERIFY"):
        nr = blank_row()
        for f in fields:
            if f in r:
                nr[f] = r[f]
        if action == "ADD_IF_DISTINCT":
            nr["disposition"] = "NOT_A_DISTINCT_PRODUCT"
            nr["disposition_reason"] = (
                r.get("exclude_reason")
                or "Not confirmed as distinct architecture vs sibling SKU."
            )
        elif action == "ADD_IF_NL_EU":
            nr["disposition"] = "NOT_COMMERCIALLY_MEANINGFUL"
            nr["disposition_reason"] = (
                r.get("exclude_reason")
                or "Insufficient NL/EU specialist shelf evidence."
            )
        else:
            nr["disposition"] = "INSUFFICIENT_EVIDENCE"
            nr["disposition_reason"] = (
                r.get("exclude_reason") or "Could not confirm distinct current SKU."
            )
        nr["research_status"] = "verified"
        upsert(nr)
        continue

    if action == "DEDUP_BRAND":
        nr = blank_row()
        for f in fields:
            if f in r:
                nr[f] = r[f]
        nr["disposition"] = "DUPLICATE"
        nr["disposition_reason"] = (
            r.get("exclude_reason")
            or "OEM brand duplicate of already-cataloged Pascal Box SKU."
        )
        nr["research_status"] = "verified"
        upsert(nr)
        continue

    if action.startswith("EXCLUDE"):
        nr = blank_row()
        for f in fields:
            if f in r:
                nr[f] = r[f]
        nr["disposition"] = "NOT_COMMERCIALLY_MEANINGFUL"
        nr["disposition_reason"] = r.get("exclude_reason") or "Excluded"
        nr["research_status"] = "verified"
        upsert(nr)

# Mark empty-disposition CURRENT verified/likely as CATALOGED_CURRENT
for r in rows:
    r.setdefault("disposition", "")
    r.setdefault("disposition_reason", "")
    if r["disposition"]:
        continue
    if r.get("current_status") not in ("CURRENT", "CURRENT_LIMITED"):
        continue
    if r.get("research_status") not in ("verified", "likely"):
        continue
    product = (r.get("product") or "").lower()
    model = (r.get("model") or "").lower()
    if product.endswith("range") or model.endswith("range"):
        continue
    if r.get("brand") in ("Generic", "various") or "/" in (r.get("brand") or ""):
        continue
    r["disposition"] = "CATALOGED_CURRENT"
    r["disposition_reason"] = (
        "In researched verified/likely inventory and kept in canonical catalog."
    )

for r in rows:
    if r["brand"] == "StarVie" and r["category"] == "balls":
        if r.get("current_status") == "CURRENT":
            r["current_status"] = "PREVIOUS_GENERATION"
        r["disposition"] = "CONFIRMED_PREVIOUS"
        r["disposition_reason"] = (
            "No current StarVie ball line on official/specialist (Master historic)."
        )

with INV_PATH.open("w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    w.writerows(rows)

print("total rows", len(rows))
print("added", len(added))
for a in added:
    print(" +", a)
print("updated", len(skipped))
print(Counter(r.get("disposition") or "(empty)" for r in rows))
nv = [
    r
    for r in rows
    if (r.get("research_status") or "") == "needs_verify"
    or (r.get("disposition") or "") == "NEEDS_VERIFY"
]
print("needs_verify left", len(nv))
for r in nv[:20]:
    print(" ", r.get("brand"), r.get("model"), r.get("research_status"))
