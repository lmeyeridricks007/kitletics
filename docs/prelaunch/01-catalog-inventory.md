# Kitletics Pre-Launch Audit 01 — Complete Catalog Inventory

**Mode:** READ-ONLY forensic baseline
**Generated:** 2026-09-06T21:18:19.342Z
**Audit clock:** 2026-09-06T12:00:00.000Z
**Machine-readable:** [`data/01-catalog-inventory.json`](./data/01-catalog-inventory.json)

> This report measures the repository as-is. No website, catalog, or content mutations were made while measuring.

---

## 1. Actual repository totals

| Entity | Count |
|---|---:|
| Sports | 21 |
| Disciplines | 59 |
| Activities | 0 |
| Categories | 47 |
| Subcategories | 82 |
| Brands | 191 |
| Product Families | 308 |
| Products | 717 |
| Product Variants | 325 |
| Use Cases | 80 |
| Offers | 1271 |
| Retailers | 11 |
| Reviews (linked inventory) | 590 |

Notes:
- Product counts include **all** statuses (draft/review/scheduled/published/archived), after spec-fill + running audience-variant enrichment.
- Variant counts include generated audience variants from `applyRunningAudienceVariants`.
- Activities: raw taxonomy count (repository `getActivities()` is documented as empty).

---

## 2. Sport summary

| Sport | Disciplines | Categories | Products | Variants | Brands | Published | Draft | Scheduled | Unknown Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Running | 6 | 16 | 438 | 325 | 132 | 367 | 71 | 0 | 0 |
| Fitness & Training | 9 | 25 | 204 | 0 | 69 | 182 | 18 | 0 | 0 |
| HYROX | 0 | 15 | 68 | 2 | 29 | 65 | 1 | 0 | 0 |
| Calisthenics | 0 | 4 | 14 | 0 | 5 | 14 | 0 | 0 | 0 |
| Combat Sports | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Racket Sports | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Padel | 0 | 7 | 98 | 0 | 26 | 88 | 10 | 0 | 0 |
| Tennis | 0 | 3 | 95 | 0 | 27 | 86 | 9 | 0 | 0 |
| Pickleball | 0 | 1 | 6 | 0 | 4 | 3 | 3 | 0 | 0 |
| Badminton | 0 | 1 | 6 | 0 | 3 | 5 | 1 | 0 | 0 |
| Squash | 0 | 1 | 5 | 0 | 4 | 0 | 5 | 0 | 0 |
| Cycling | 5 | 7 | 85 | 0 | 35 | 82 | 3 | 0 | 0 |
| Swimming | 3 | 1 | 15 | 0 | 5 | 15 | 0 | 0 | 0 |
| Watersports | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Diving | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Fishing | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Target Sports | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Indoor Sports | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Winter Sports | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Recovery | 5 | 1 | 32 | 0 | 16 | 16 | 16 | 0 | 0 |
| Recreation | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Additional status fields (not in table header but present in data): review / archived are in JSON `sportSummary`.

| Sport | Review | Archived | Available | Content status |
|---|---:|---:|---|---|
| Running | 0 | 0 | true | live |
| Fitness & Training | 4 | 0 | true | live |
| HYROX | 2 | 0 | true | live |
| Calisthenics | 0 | 0 | true | live |
| Combat Sports | 0 | 0 | false | coming-soon |
| Racket Sports | 0 | 0 | true | live |
| Padel | 0 | 0 | true | live |
| Tennis | 0 | 0 | true | live |
| Pickleball | 0 | 0 | true | live |
| Badminton | 0 | 0 | true | live |
| Squash | 0 | 0 | true | live |
| Cycling | 0 | 0 | false | coming-soon |
| Swimming | 0 | 0 | false | coming-soon |
| Watersports | 0 | 0 | false | coming-soon |
| Diving | 0 | 0 | false | coming-soon |
| Fishing | 0 | 0 | false | coming-soon |
| Target Sports | 0 | 0 | false | coming-soon |
| Indoor Sports | 0 | 0 | false | coming-soon |
| Winter Sports | 0 | 0 | false | coming-soon |
| Recovery | 0 | 0 | false | coming-soon |
| Recreation | 0 | 0 | false | coming-soon |

---

## 3. Running deep dive (all actual categories)

| Category | Subcategory | Products | Current | Previous Gen | Variants | Brands | Men | Women | Unisex | Unknown | Offers | Products With Offers | Products With Media |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Running Shoes | Daily Trainers | 50 | 43 | 6 | 97 | 13 | 47 | 47 | 3 | 0 | 53 | 36 | 49 |
| Running Shoes | Max Cushion Shoes | 36 | 30 | 6 | 72 | 12 | 36 | 36 | 0 | 0 | 35 | 25 | 36 |
| Running Shoes | Tempo Shoes | 15 | 13 | 2 | 30 | 10 | 15 | 15 | 0 | 0 | 16 | 13 | 15 |
| Running Shoes | Race Shoes | 12 | 10 | 2 | 24 | 8 | 12 | 12 | 0 | 0 | 14 | 12 | 12 |
| Running Shoes | Carbon Plate Shoes | 10 | 9 | 1 | 20 | 7 | 10 | 10 | 0 | 0 | 11 | 10 | 10 |
| Running Shoes | Stability Shoes | 13 | 13 | 0 | 26 | 7 | 13 | 13 | 0 | 0 | 5 | 5 | 13 |
| Running Shoes | Neutral Shoes | 55 | 44 | 11 | 107 | 13 | 52 | 52 | 3 | 0 | 68 | 49 | 55 |
| Running Shoes | Trail Shoes | 15 | 15 | 0 | 29 | 11 | 14 | 14 | 1 | 0 | 6 | 6 | 15 |
| Running Shoes | Road-to-Trail Shoes | 3 | 3 | 0 | 6 | 2 | 3 | 3 | 0 | 0 | 1 | 1 | 3 |
| Running Shoes | Minimalist Shoes | 1 | 1 | 0 | 1 | 1 | 0 | 0 | 1 | 0 | 1 | 1 | 1 |
| Running Shoes | Zero Drop Shoes | 5 | 5 | 0 | 7 | 2 | 2 | 2 | 3 | 0 | 3 | 3 | 5 |
| Running Shoes | Wide Running Shoes | 12 | 11 | 1 | 21 | 4 | 9 | 9 | 3 | 0 | 11 | 7 | 12 |
| Running Shoes | Recovery / Walking Shoes | 5 | 4 | 1 | 10 | 4 | 5 | 5 | 0 | 0 | 5 | 4 | 5 |
| GPS Watches | Entry-Level Running Watches | 6 | 6 | 0 | 0 | 4 | 0 | 0 | 0 | 6 | 6 | 6 | 6 |
| GPS Watches | Performance Running Watches | 6 | 5 | 1 | 0 | 3 | 0 | 0 | 0 | 6 | 6 | 6 | 6 |
| GPS Watches | Premium Running Watches | 3 | 2 | 1 | 0 | 2 | 0 | 0 | 0 | 3 | 4 | 3 | 3 |
| GPS Watches | Ultra / Adventure Watches | 14 | 11 | 3 | 0 | 7 | 0 | 0 | 0 | 14 | 14 | 14 | 14 |
| GPS Watches | Small-Wrist / Compact Watches | 4 | 3 | 1 | 0 | 4 | 0 | 0 | 0 | 4 | 4 | 4 | 4 |
| Heart Rate Monitors | Chest Straps | 10 | 7 | 3 | 0 | 4 | 0 | 0 | 0 | 10 | 11 | 10 | 10 |
| Heart Rate Monitors | Arm-Band HR Monitors | 5 | 5 | 0 | 0 | 4 | 0 | 0 | 0 | 5 | 5 | 5 | 5 |
| Heart Rate Monitors | Optical HR Monitors | 5 | 5 | 0 | 0 | 4 | 0 | 0 | 0 | 5 | 5 | 5 | 5 |
| Heart Rate Monitors | Running Dynamics / Advanced Sensor Straps | 3 | 1 | 2 | 0 | 2 | 0 | 0 | 0 | 3 | 4 | 3 | 3 |
| Running Clothing | Running Shorts | 17 | 17 | 0 | 17 | 12 | 12 | 5 | 0 | 0 | 17 | 17 | 15 |
| Running Clothing | Running Tights | 8 | 8 | 0 | 8 | 7 | 3 | 5 | 0 | 0 | 8 | 8 | 7 |
| Running Clothing | Running T-Shirts | 7 | 7 | 0 | 7 | 6 | 5 | 1 | 1 | 0 | 7 | 7 | 6 |
| Running Clothing | Running Singlets / Tanks | 3 | 3 | 0 | 3 | 3 | 3 | 0 | 0 | 0 | 3 | 3 | 1 |
| Running Clothing | Long-Sleeve Running Tops | 4 | 4 | 0 | 4 | 4 | 4 | 0 | 0 | 0 | 4 | 4 | 3 |
| Running Clothing | Running Jackets | 7 | 7 | 0 | 7 | 5 | 7 | 0 | 0 | 0 | 7 | 7 | 6 |
| Running Clothing | Running Rain Jackets | 4 | 4 | 0 | 4 | 3 | 3 | 1 | 0 | 0 | 4 | 4 | 3 |
| Running Clothing | Running Vests | 3 | 3 | 0 | 3 | 3 | 3 | 0 | 0 | 0 | 3 | 3 | 2 |
| Running Clothing | Base Layers | 3 | 3 | 0 | 3 | 3 | 3 | 0 | 0 | 0 | 3 | 3 | 3 |
| Running Clothing | Running Underwear | 2 | 2 | 0 | 2 | 2 | 2 | 0 | 0 | 0 | 2 | 2 | 0 |
| Running Clothing | Sports Bras | 4 | 4 | 0 | 4 | 4 | 0 | 4 | 0 | 0 | 4 | 4 | 1 |
| Running Clothing | Running Hats / Caps | 7 | 7 | 0 | 7 | 4 | 0 | 0 | 7 | 0 | 7 | 7 | 7 |
| Running Clothing | Gloves | 3 | 3 | 0 | 3 | 3 | 0 | 0 | 3 | 0 | 3 | 3 | 3 |
| Running Socks | (none) | 14 | 14 | 0 | 14 | 13 | 0 | 0 | 14 | 0 | 14 | 14 | 10 |
| Hydration | Handheld Bottles | 6 | 6 | 0 | 6 | 4 | 0 | 0 | 6 | 0 | 6 | 6 | 5 |
| Hydration | Soft Flasks | 8 | 8 | 0 | 8 | 4 | 0 | 0 | 8 | 0 | 8 | 8 | 8 |
| Hydration | Hydration Bladders / Reservoirs | 5 | 5 | 0 | 5 | 4 | 0 | 0 | 5 | 0 | 5 | 5 | 4 |
| Running Packs & Vests | Hydration Vests | 26 | 24 | 2 | 26 | 14 | 3 | 2 | 21 | 0 | 28 | 26 | 23 |
| Running Packs & Vests | Race Vests | 21 | 20 | 1 | 21 | 12 | 2 | 2 | 17 | 0 | 23 | 21 | 18 |
| Running Packs & Vests | Running Backpacks | 15 | 15 | 0 | 15 | 6 | 4 | 2 | 9 | 0 | 15 | 15 | 13 |
| Running Packs & Vests | Fastpacking Packs | 9 | 9 | 0 | 9 | 4 | 4 | 2 | 3 | 0 | 9 | 9 | 9 |
| Running Packs & Vests | Pole Quivers | 2 | 2 | 0 | 2 | 2 | 0 | 0 | 2 | 0 | 2 | 2 | 1 |
| Running Packs & Vests | Accessory Pouches | 3 | 3 | 0 | 3 | 3 | 0 | 0 | 3 | 0 | 3 | 3 | 2 |
| Headphones | Open-Ear Headphones | 9 | 9 | 0 | 0 | 6 | 0 | 0 | 0 | 9 | 9 | 9 | 7 |
| Headphones | Bone Conduction Headphones | 3 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 3 | 3 | 3 | 3 |
| Headphones | True Wireless Earbuds | 11 | 11 | 0 | 0 | 7 | 0 | 0 | 0 | 11 | 11 | 11 | 5 |
| Headphones | Ear-Hook Headphones | 7 | 7 | 0 | 0 | 5 | 0 | 0 | 0 | 7 | 7 | 7 | 5 |
| Sunglasses | Performance Wrap | 11 | 11 | 0 | 0 | 5 | 0 | 0 | 0 | 11 | 11 | 11 | 11 |
| Sunglasses | Shield / Race | 5 | 5 | 0 | 0 | 3 | 0 | 0 | 0 | 5 | 5 | 5 | 5 |
| Sunglasses | Photochromic | 7 | 7 | 0 | 0 | 4 | 0 | 0 | 0 | 7 | 7 | 7 | 7 |
| Sunglasses | Everyday / Value | 3 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 3 | 3 | 3 | 3 |
| Running Lights | Headlamps | 16 | 16 | 0 | 0 | 7 | 0 | 0 | 0 | 16 | 16 | 16 | 9 |
| Running Lights | Waist / Hybrid Lights | 3 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 3 | 3 | 3 | 2 |
| Running Lights | High-Output Headlamps | 7 | 7 | 0 | 0 | 6 | 0 | 0 | 0 | 7 | 7 | 7 | 6 |
| Treadmills | (none) | 3 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 3 | 9 | 3 | 3 |
| Safety Gear | Clip Lights | 5 | 5 | 0 | 0 | 4 | 0 | 0 | 0 | 5 | 5 | 5 | 1 |
| Safety Gear | Wearable Lights | 4 | 4 | 0 | 0 | 4 | 0 | 0 | 0 | 4 | 4 | 4 | 2 |
| Safety Gear | Reflective Gear | 6 | 6 | 0 | 0 | 5 | 0 | 0 | 0 | 6 | 6 | 6 | 4 |
| Safety Gear | Visibility Vests | 4 | 4 | 0 | 0 | 3 | 0 | 0 | 0 | 4 | 4 | 4 | 4 |
| Safety Gear | Personal Alarms | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 0 |
| Running Belts | Phone / Essentials Belts | 11 | 11 | 0 | 11 | 10 | 0 | 0 | 11 | 0 | 11 | 11 | 11 |
| Running Belts | Hydration Belts | 4 | 4 | 0 | 4 | 3 | 0 | 0 | 4 | 0 | 4 | 4 | 4 |
| Running Belts | Race Belts | 10 | 10 | 0 | 10 | 9 | 0 | 0 | 10 | 0 | 10 | 10 | 10 |
| Recovery | Foam Rollers | 6 | 6 | 0 | 0 | 4 | 0 | 0 | 0 | 6 | 6 | 6 | 4 |
| Recovery | Massage Guns | 9 | 9 | 0 | 0 | 5 | 0 | 0 | 0 | 9 | 9 | 9 | 5 |
| Recovery | Massage Balls | 3 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 3 | 3 | 3 | 0 |
| Recovery | Compression Boots | 3 | 3 | 0 | 0 | 2 | 0 | 0 | 0 | 3 | 3 | 3 | 2 |
| Recovery | Recovery Sandals | 4 | 4 | 0 | 0 | 2 | 0 | 0 | 0 | 4 | 4 | 4 | 2 |
| Recovery | Compression Garments | 4 | 4 | 0 | 0 | 3 | 0 | 0 | 0 | 4 | 4 | 4 | 2 |
| Recovery | Mobility Tools | 3 | 3 | 0 | 0 | 3 | 0 | 0 | 0 | 3 | 3 | 3 | 1 |
| Accessories | (none) | 8 | 8 | 0 | 0 | 7 | 0 | 0 | 0 | 8 | 8 | 8 | 3 |
| Nutrition & Fuel | Energy Gels | 16 | 16 | 0 | 0 | 12 | 0 | 0 | 0 | 16 | 16 | 16 | 16 |
| Nutrition & Fuel | Energy Chews | 5 | 5 | 0 | 0 | 5 | 0 | 0 | 0 | 5 | 5 | 5 | 5 |
| Nutrition & Fuel | Energy Bars | 4 | 4 | 0 | 0 | 4 | 0 | 0 | 0 | 4 | 4 | 4 | 4 |
| Nutrition & Fuel | Sports Drinks | 8 | 8 | 0 | 0 | 7 | 0 | 0 | 0 | 8 | 8 | 8 | 8 |
| Nutrition & Fuel | Electrolyte Drink Mixes | 2 | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 2 | 2 | 2 | 2 |
| Nutrition & Fuel | Carbohydrate Drink Mixes | 8 | 8 | 0 | 0 | 7 | 0 | 0 | 0 | 8 | 8 | 8 | 8 |
| Nutrition & Fuel | Electrolyte Tablets | 4 | 4 | 0 | 0 | 3 | 0 | 0 | 0 | 4 | 4 | 4 | 4 |
| Nutrition & Fuel | Race Fuel Systems | 10 | 10 | 0 | 0 | 7 | 0 | 0 | 0 | 10 | 10 | 10 | 10 |

Category-level rollups (products may appear in multiple subcategory rows if multi-tagged):

| Category | Products (unique) | Brands |
|---|---:|---:|
| Running Shoes | 84 | 14 |
| GPS Watches | 33 | 7 |
| Heart Rate Monitors | 15 | 6 |
| Running Clothing | 72 | 19 |
| Running Socks | 14 | 13 |
| Hydration | 19 | 7 |
| Running Packs & Vests | 42 | 15 |
| Headphones | 17 | 9 |
| Sunglasses | 17 | 8 |
| Running Lights | 16 | 7 |
| Treadmills | 3 | 2 |
| Safety Gear | 14 | 9 |
| Running Belts | 14 | 11 |
| Recovery | 32 | 16 |
| Accessories | 8 | 7 |
| Nutrition & Fuel | 38 | 20 |

---

## 4. Running shoes — complete inventory

Total running shoe products: **84**

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Adidas | Adidas Adizero Adios Pro 4 | 4 | current | yes | yes | no | Marathon; Half Marathon; 10K; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| Adidas | Adidas Adizero Boston 12 | 12 | current | yes | yes | no | Tempo Runs; Daily Training; Long Runs; HYROX Training; Half Marathon; 5K | yes | yes | yes | published |
| Adidas | Adidas Adizero Boston 13 | 13 | current | yes | yes | no | uc-tempo; Daily Training; Intermediate Runners | yes | no | yes | published |
| Adidas | Adidas Adizero Evo SL | SL | current | yes | yes | no | Tempo Runs; Daily Training; Speed Work; Half Marathon; Intermediate Runners; Advanced Runners | yes | yes | yes | published |
| Adidas | Adidas Terrex Agravic 3 | 3 | current | yes | yes | no | Trail Running; Intermediate Runners | yes | no | yes | published |
| Adidas | Adidas Ultraboost 5 | 5 | current | yes | yes | no | Easy Runs; uc-recovery; Comfort; Daily Training | yes | no | yes | published |
| Altra | Altra Escalante 4 | 4 | current | no | no | yes | Daily Training; Easy Runs; Wide Feet; Neutral Runners | yes | yes | yes | published |
| Altra | Altra Experience Flow | Flow | current | no | no | yes | Daily Training; uc-beginner; Wide Feet | yes | no | yes | published |
| Altra | Altra Lone Peak 8 | 8 | current | no | no | yes | Trail Running; Ultra; Wide Feet; Long Runs | yes | yes | yes | published |
| Altra | Altra Paradigm 7 | 7 | current | yes | yes | no | uc-zero-drop; uc-stability; Comfort; Wide Feet | yes | no | yes | published |
| Altra | Altra Torin 8 | 8 | current | no | no | yes | Daily Training; Easy Runs; Wide Feet; Neutral Runners; Long Runs | yes | yes | yes | published |
| ASICS | ASICS Example Unpublished Trainer | — | upcoming | yes | yes | no | — | no | no | no | draft (noindex) · not prod-exposed |
| ASICS | ASICS GEL-Cumulus 27 | 27 | current | yes | yes | no | Daily Training; Easy Runs; Beginners; Neutral Runners; First 5K | yes | yes | yes | published |
| ASICS | ASICS GEL-Kayano 32 | 32 | current | yes | yes | no | Overpronators; Daily Training; Long Runs; Easy Runs; Injury-conscious running; Heavier Runners; Comfort | yes | yes | yes | published |
| ASICS | ASICS GEL-Nimbus 27 | 27 | current | yes | yes | no | Easy Runs; Recovery Runs; Long Runs; Heavier Runners; Comfort; Injury-conscious running | yes | yes | yes | published |
| ASICS | ASICS Gel-Trabuco 13 | 13 | current | yes | yes | no | Trail Running; Long Runs; Ultra | yes | no | yes | published |
| ASICS | ASICS GT-1000 13 | 13 | current | yes | yes | no | uc-stability; uc-beginner; Daily Training | yes | no | yes | published |
| ASICS | ASICS GT-2000 14 | 14 | current | yes | yes | no | Overpronators; Daily Training; Easy Runs; Beginners; Injury-conscious running | yes | yes | yes | published |
| ASICS | ASICS METASPEED Sky Paris | Paris | current | yes | yes | no | Marathon; Half Marathon; 10K; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| ASICS | ASICS Novablast 4 | 4 | previous-generation | yes | yes | no | Daily Training; Easy Runs | yes | yes | yes | published |
| ASICS | ASICS Novablast 5 | 5 | previous-generation | yes | yes | no | Daily Training; Long Runs; Easy Runs; Neutral Runners; Comfort; Intermediate Runners | yes | yes | yes | published |
| ASICS | ASICS Novablast 6 | 6 | current | yes | yes | no | Daily Training; Long Runs; Easy Runs; Neutral Runners; Comfort; Intermediate Runners; High Mileage | yes | yes | yes | published |
| ASICS | ASICS SUPERBLAST 2 | 2 | current | yes | yes | no | Long Runs; Daily Training; Tempo Runs; Marathon; Half Marathon; Advanced Runners; High Mileage | yes | yes | yes | published |
| Brooks | Brooks Adrenaline GTS 25 | 25 | current | yes | yes | no | Overpronators; Daily Training; Beginners; Injury-conscious running; Wide Feet | yes | yes | yes | published |
| Brooks | Brooks Cascadia 18 | 18 | current | yes | yes | no | Trail Running; Long Runs; uc-beginner | yes | no | yes | published |
| Brooks | Brooks Ghost 16 | 16 | previous-generation | yes | yes | no | Beginners; Daily Training; First 5K; Comfort; Neutral Runners | yes | yes | yes | published |
| Brooks | Brooks Ghost 18 | 18 | current | yes | yes | no | Beginners; Daily Training; First 5K; Comfort; Neutral Runners; Wide Feet | yes | yes | yes | published |
| Brooks | Brooks Glycerin 21 | 21 | previous-generation | yes | yes | no | Comfort; Easy Runs; Long Runs | yes | yes | yes | published |
| Brooks | Brooks Glycerin 22 | 22 | current | yes | yes | no | Comfort; Easy Runs; Long Runs; Recovery Runs; Heavier Runners; Injury-conscious running | yes | yes | yes | published |
| Brooks | Brooks Glycerin GTS 22 | 22 | current | yes | yes | no | uc-stability; Comfort; Long Runs | yes | no | yes | published |
| Brooks | Brooks Hyperion Max 2 | 2 | current | yes | yes | no | Tempo Runs; Long Runs; Half Marathon; Marathon; Intermediate Runners; Advanced Runners | yes | yes | yes | published |
| HOKA | HOKA Arahi 7 | 7 | current | yes | yes | no | uc-stability; Daily Training; Easy Runs | yes | no | yes | published |
| HOKA | HOKA Bondi 8 | 8 | previous-generation | yes | yes | no | Recovery Runs; Easy Runs; Comfort | yes | yes | yes | published |
| HOKA | HOKA Bondi 9 | 9 | current | yes | yes | no | Recovery Runs; Easy Runs; Long Runs; Comfort; Heavier Runners; Injury-conscious running | yes | yes | yes | published |
| HOKA | HOKA Clifton 10 | 10 | current | yes | yes | no | Daily Training; Long Runs; Easy Runs; Comfort; Heavier Runners; Neutral Runners | yes | yes | yes | published |
| HOKA | HOKA Clifton 9 | 9 | previous-generation | yes | yes | no | Daily Training; Long Runs; Heavier Runners; Comfort | yes | yes | yes | published |
| HOKA | HOKA Clifton Pro | Pro | current | yes | yes | no | Daily Training; High Mileage; Long Runs; Heavier Runners; Comfort | yes | yes | yes | published |
| HOKA | HOKA Gaviota 5 | 5 | current | yes | yes | no | uc-stability; Comfort; Long Runs | yes | no | yes | published |
| HOKA | HOKA Mach 6 | 6 | current | yes | yes | no | Tempo Runs; Daily Training; Speed Work; Intermediate Runners; Advanced Runners | yes | yes | yes | published |
| HOKA | HOKA Speedgoat 6 | 6 | current | yes | yes | no | Trail Running; Ultra; Long Runs; Advanced Runners | yes | yes | yes | published |
| Inov-8 | Inov8 Trailfly Ultra G 300 Max | G 300 Max | current | yes | yes | no | Trail Running; Ultra; Long Runs; Advanced Runners | yes | yes | yes | published |
| Mizuno | Mizuno Wave Rebellion Pro 3 | 3 | current | yes | yes | no | 5K; 10K; Half Marathon; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| Mizuno | Mizuno Wave Rider 28 | 28 | current | yes | yes | no | Daily Training; Easy Runs; Neutral Runners; Intermediate Runners; Beginners | yes | yes | yes | published |
| New Balance | New Balance Fresh Foam X 1080 v13 | 13 | previous-generation | yes | yes | no | Daily Training; Comfort; Wide Feet | yes | yes | yes | published |
| New Balance | New Balance Fresh Foam X 1080 v14 | 14 | current | yes | yes | no | Daily Training; Long Runs; Easy Runs; Comfort; Wide Feet; Neutral Runners | yes | yes | yes | published |
| New Balance | New Balance Fresh Foam X 860 v14 | v14 | current | yes | yes | no | uc-stability; Daily Training; High Mileage; Wide Feet | yes | no | yes | published |
| New Balance | New Balance Fresh Foam X Hierro v9 | v9 | current | yes | yes | no | Trail Running; Long Runs; Wide Feet | yes | no | yes | published |
| New Balance | New Balance FuelCell Rebel v4 | 4 | previous-generation | yes | yes | no | Tempo Runs; Daily Training; Speed Work | yes | yes | yes | published |
| New Balance | New Balance FuelCell Rebel v5 | 5 | current | yes | yes | no | Tempo Runs; Daily Training; Speed Work; 5K; Intermediate Runners | yes | yes | yes | published |
| New Balance | New Balance FuelCell SuperComp Elite v4 | 4 | current | yes | yes | no | Marathon; Half Marathon; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| New Balance | New Balance FuelCell SuperComp Trainer v3 | 3 | current | yes | yes | no | Long Runs; Tempo Runs; Marathon; Half Marathon; Advanced Runners; High Mileage | yes | yes | yes | published |
| Nike | Nike Alphafly 3 | 3 | current | yes | yes | no | Marathon; Half Marathon; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| Nike | Nike Invincible 3 | 3 | previous-generation | yes | yes | no | Recovery Runs; Easy Runs; Comfort; Long Runs | yes | yes | yes | published |
| Nike | Nike Pegasus 41 | 41 | previous-generation | yes | yes | no | Daily Training; Beginners; Intermediate Runners; Tempo Runs | yes | yes | yes | published |
| Nike | Nike Pegasus 42 | 42 | current | yes | yes | no | Daily Training; Beginners; Intermediate Runners; Tempo Runs; Easy Runs; Neutral Runners | yes | yes | yes | published |
| Nike | Nike Pegasus Trail 5 | 5 | current | yes | yes | no | Trail Running; Daily Training; Intermediate Runners | yes | no | yes | published |
| Nike | Nike React Infinity Run 4 | 4 | current | yes | yes | no | uc-stability; Daily Training; uc-beginner | yes | no | yes | published |
| Nike | Nike Structure 26 | 26 | current | yes | yes | no | Overpronators; Daily Training; Beginners; Easy Runs; Injury-conscious running | yes | yes | yes | published |
| Nike | Nike Structure Plus | Plus | current | yes | yes | no | Overpronators; Daily Training; Long Runs; Intermediate Runners; Injury-conscious running | yes | yes | yes | published |
| Nike | Nike Vaporfly 4 | 4 | current | yes | yes | no | Marathon; Half Marathon; 10K; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| Nike | Nike Vomero 18 | 18 | current | yes | yes | no | Easy Runs; Recovery Runs; Long Runs; Comfort; Heavier Runners; Daily Training | yes | yes | yes | published |
| On | On Cloudmonster 2 | 2 | current | yes | yes | no | Long Runs; Easy Runs; Daily Training; Comfort; Heavier Runners | yes | yes | yes | published |
| On | On Cloudmonster Hyper | Hyper | current | yes | yes | no | uc-tempo; Long Runs; Intermediate Runners | yes | no | yes | published |
| On | On Cloudsurfer 2 | 2 | current | yes | yes | no | Daily Training; Easy Runs; Long Runs; Comfort | yes | no | yes | published |
| On | On Cloudsurfer Next | Next | current | yes | yes | no | Easy Runs; Daily Training; Recovery Runs; Comfort; Beginners | yes | yes | yes | published |
| PUMA | PUMA Deviate NITRO 3 | 3 | current | yes | yes | no | Tempo Runs; Half Marathon; Marathon; Intervals; Advanced Runners | yes | yes | yes | published |
| PUMA | PUMA Magnify NITRO 2 | 2 | current | yes | yes | no | Daily Training; Easy Runs; Long Runs; Comfort; Beginners | yes | yes | yes | published |
| Salomon | Salomon Aero Glide 2 | 2 | current | yes | yes | no | Long Runs; Easy Runs; Daily Training; Comfort; Heavier Runners | yes | yes | yes | published |
| Salomon | Salomon Genesis | 1 | current | yes | yes | no | Trail Running; Daily Training; Intermediate Runners | yes | no | yes | published |
| Salomon | Salomon Pulsar Trail 2 | 2 | current | yes | yes | no | Trail Running; Tempo Runs; Ultra; Advanced Runners | yes | yes | yes | published |
| Salomon | Salomon Sense Ride 5 | 5 | current | yes | yes | no | Trail Running; Long Runs; Daily Training; Intermediate Runners | yes | yes | yes | published |
| Salomon | Salomon Ultra Glide 2 | 2 | current | yes | yes | no | Trail Running; Ultra; Comfort | yes | no | yes | published |
| Saucony | Saucony Endorphin Pro 3 | 3 | previous-generation | yes | yes | no | Marathon; Half Marathon; PB / PR | yes | yes | yes | published |
| Saucony | Saucony Endorphin Pro 4 | 4 | current | yes | yes | no | Marathon; Half Marathon; 10K; PB / PR; Advanced Runners; Lightweight Runners | yes | yes | yes | published |
| Saucony | Saucony Endorphin Speed 4 | 4 | previous-generation | yes | yes | no | Tempo Runs; Intervals; Half Marathon; Marathon; PB / PR; Advanced Runners | yes | yes | yes | published |
| Saucony | Saucony Endorphin Speed 5 | 5 | current | yes | yes | no | Tempo Runs; Intervals; Half Marathon; Marathon; PB / PR; Advanced Runners | yes | yes | yes | published |
| Saucony | Saucony Guide 18 | 18 | current | yes | yes | no | uc-stability; Daily Training; uc-beginner | yes | no | yes | published |
| Saucony | Saucony Peregrine 15 | 15 | current | yes | yes | no | Trail Running; Long Runs; Ultra | yes | yes | yes | published |
| Saucony | Saucony Ride 18 | 18 | current | yes | yes | no | Daily Training; Easy Runs; Beginners; Neutral Runners; Intermediate Runners | yes | yes | yes | published |
| Saucony | Saucony Triumph 22 | 22 | current | yes | yes | no | Long Runs; Easy Runs; Comfort; Daily Training; Heavier Runners | yes | yes | yes | published |
| Saucony | Saucony Xodus Ultra 3 | 3 | current | yes | yes | no | Trail Running; Ultra; Long Runs | yes | no | yes | published |
| Topo Athletic | Topo Athletic Phantom 3 | 3 | current | yes | yes | no | Daily Training; Easy Runs; Wide Feet; Comfort; Neutral Runners | yes | yes | yes | published |
| Topo Athletic | Topo Athletic Specter 2 | 2 | current | yes | yes | no | Tempo Runs; 5K; 10K; Half Marathon; Wide Feet; Advanced Runners | yes | yes | yes | published |
| Topo Athletic | Topo Athletic Terraventure 5 | 5 | current | yes | yes | no | Trail Running; Wide Feet; uc-zero-drop | yes | no | yes | published |

---

## 5. Other running categories

### GPS Watches

Category: `cat-gps-watches` (GPS Watches) — **33** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Amazfit | Amazfit Active 2 | 2 | current | no | no | no | Beginners; First 5K; First 10K; Daily Training | yes | yes | yes | published |
| Amazfit | Amazfit T-Rex 3 Pro | 3 Pro | current | no | no | no | Trail Running; Intermediate Runners; Beginners; Long Runs | yes | yes | yes | published |
| Apple | Apple Watch Series 10 | Series 10 | current | no | no | no | Beginners; Daily Training; First 5K; First 10K | yes | yes | yes | published |
| Apple | Apple Watch Ultra 2 | Ultra 2 | previous-generation | no | no | no | Intermediate Runners; Advanced Runners; Daily Training; Half Marathon | yes | yes | yes | published |
| Apple | Apple Watch Ultra 3 | Ultra 3 | current | no | no | no | Intermediate Runners; Advanced Runners; Daily Training; Half Marathon; Marathon | yes | yes | yes | published |
| COROS | COROS Apex 2 Pro | 2 Pro | previous-generation | no | no | no | Ultra; Trail Running; Advanced Runners; High Mileage | yes | yes | yes | published |
| COROS | COROS Apex 4 | 4 | current | no | no | no | Ultra; Trail Running; Advanced Runners; High Mileage; Long Runs | yes | yes | yes | published |
| COROS | COROS Pace 3 | 3 | current | no | no | no | Intermediate Runners; High Mileage; Marathon | yes | yes | yes | published |
| COROS | COROS Pace 4 | 4 | current | no | no | no | Intermediate Runners; Advanced Runners; Marathon; High Mileage; Half Marathon | yes | yes | yes | published |
| COROS | COROS Pace Pro | Pro | current | no | no | no | Intermediate Runners; Advanced Runners; High Mileage; Marathon; Ultra | yes | yes | yes | published |
| COROS | COROS Vertix 2S | 2S | current | no | no | no | Ultra; Trail Running; Advanced Runners; High Mileage | yes | yes | yes | published |
| Garmin | Garmin Enduro 3 | 3 | current | no | no | no | Ultra; Trail Running; Advanced Runners; High Mileage; Long Runs | yes | yes | yes | published |
| Garmin | Garmin Epix Pro (Gen 2) | Pro Gen 2 | previous-generation | no | no | no | Advanced Runners; Trail Running; Ultra; Marathon; High Mileage | yes | yes | yes | published |
| Garmin | Garmin Fenix 8 AMOLED 47mm | 8 | current | no | no | no | Advanced Runners; Ultra; Trail Running; High Mileage; Marathon | yes | yes | yes | published |
| Garmin | Garmin Forerunner 165 | 165 | current | no | no | no | Beginners; First 5K; First 10K; First Half Marathon | yes | yes | yes | published |
| Garmin | Garmin Forerunner 255 | 255 | current | no | no | no | Intermediate Runners; Beginners; First Half Marathon | yes | yes | yes | published |
| Garmin | Garmin Forerunner 265 | 265 | previous-generation | no | no | no | Intermediate Runners; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| Garmin | Garmin Forerunner 265S | 265S | previous-generation | no | no | no | Intermediate Runners; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| Garmin | Garmin Forerunner 55 | 55 | current | no | no | no | Beginners; First 5K; First 10K | yes | yes | yes | published |
| Garmin | Garmin Forerunner 570 | 570 | current | no | no | no | Intermediate Runners; Advanced Runners; Marathon; Half Marathon; High Mileage | yes | yes | yes | published |
| Garmin | Garmin Forerunner 965 | 965 | previous-generation | no | no | no | Advanced Runners; High Mileage; Marathon; PB / PR | yes | yes | yes | published |
| Garmin | Garmin Forerunner 970 | 970 | current | no | no | no | Advanced Runners; High Mileage; Marathon; PB / PR; Ultra | yes | yes | yes | published |
| Garmin | Garmin Instinct 3 | 3 | current | no | no | no | Trail Running; Intermediate Runners; Advanced Runners; Long Runs | yes | yes | yes | published |
| Garmin | Garmin Vivoactive 6 | 6 | current | no | no | no | Beginners; Intermediate Runners; Daily Training; First Half Marathon; Half Marathon | yes | yes | yes | published |
| Polar | Polar Grit X2 | X2 | current | no | no | no | Trail Running; Advanced Runners; Marathon; Intermediate Runners | yes | yes | yes | published |
| Polar | Polar Pacer | 1 | current | no | no | no | Beginners; First 5K; First 10K; Intermediate Runners; Half Marathon | yes | yes | yes | published |
| Polar | Polar Pacer Pro | Pro | current | no | no | no | Intermediate Runners; Beginners; Half Marathon; Marathon | yes | yes | yes | published |
| Polar | Polar Vantage V3 | V3 | current | no | no | no | Advanced Runners; Marathon; PB / PR; High Mileage | yes | yes | yes | published |
| Samsung | Samsung Galaxy Watch Ultra | Ultra 2025 | current | no | no | no | Intermediate Runners; Advanced Runners; Daily Training; Trail Running | yes | yes | yes | published |
| Suunto | Suunto Race | Race | current | no | no | no | Trail Running; Ultra; Advanced Runners; Long Runs | yes | yes | yes | published |
| Suunto | Suunto Race S | Race S | current | no | no | no | Intermediate Runners; Trail Running; Marathon | yes | yes | yes | published |
| Suunto | Suunto Run | 1 | current | no | no | no | Beginners; First 5K; First 10K; First Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Suunto | Suunto Vertical 2 | 2 | current | no | no | no | Trail Running; Ultra; Advanced Runners; Long Runs | yes | yes | yes | published |

### Heart Rate Monitors

Category: `cat-hrm` (Heart Rate Monitors) — **15** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| COROS | COROS Heart Rate Monitor | HRM | current | no | no | no | Intervals; Daily Training; Advanced Runners | yes | yes | yes | published |
| Garmin | Garmin HRM 200 | 200 | current | no | no | no | Intervals; Intermediate Runners; Beginners; Daily Training | yes | yes | yes | published |
| Garmin | Garmin HRM 600 | 600 | current | no | no | no | Advanced Runners; Intervals; PB / PR; Marathon; HYROX Training | yes | yes | yes | published |
| Garmin | Garmin HRM-Fit | Fit | current | no | no | no | Intervals; Daily Training; Intermediate Runners; Beginners | yes | yes | yes | published |
| Garmin | Garmin HRM-Pro Plus | Pro Plus | previous-generation | no | no | no | Advanced Runners; Intervals; PB / PR; Marathon | yes | yes | yes | published |
| Polar | Polar H10 | H10 | current | no | no | no | Intervals; Advanced Runners; PB / PR; Intermediate Runners; HYROX Training | yes | yes | yes | published |
| Polar | Polar H9 | H9 | current | no | no | no | Beginners; Intervals; Daily Training; Intermediate Runners | yes | yes | yes | published |
| Polar | Polar Verity Sense | Verity Sense | current | no | no | no | Intervals; Daily Training; Intermediate Runners; HYROX Training | yes | yes | yes | published |
| Scosche | Scosche Rhythm+ 2.0 | Rhythm+ 2.0 | current | no | no | no | Daily Training; Intervals; Beginners; HYROX Training | yes | yes | yes | published |
| Scosche | Scosche Rhythm24 | Rhythm24 | current | no | no | no | Daily Training; Intervals; Intermediate Runners | yes | yes | yes | published |
| Suunto | Suunto Smart Heart Rate Belt | Smart HR Belt | current | no | no | no | Intervals; Intermediate Runners; Advanced Runners; Daily Training | yes | yes | yes | published |
| Wahoo | Wahoo TICKR | TICKR | previous-generation | no | no | no | Intervals; Intermediate Runners; Daily Training | yes | yes | yes | published |
| Wahoo | Wahoo TICKR FIT | TICKR FIT | current | no | no | no | Daily Training; Intervals; Intermediate Runners; HYROX Training | yes | yes | yes | published |
| Wahoo | Wahoo TICKR X | TICKR X | previous-generation | no | no | no | Intervals; Advanced Runners; PB / PR | yes | yes | yes | published |
| Wahoo | Wahoo TRACKR Heart Rate | TRACKR | current | no | no | no | Intervals; Daily Training; Intermediate Runners; HYROX Training | yes | yes | yes | published |

### Hydration

Category: `cat-hydration` (Hydration) — **19** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Amphipod | Amphipod Hydraform Ergo-Lite Handheld | Ergo-Lite | current | no | no | yes | Long Runs; Daily Training; Half Marathon; Marathon | yes | yes | yes | published |
| CamelBak | CamelBak Crux 1.5L Reservoir | 1.5L | current | no | no | yes | Ultra; Long Runs; Trail Running | yes | yes | yes | published |
| CamelBak | CamelBak Quick Grip Chill Handheld | Chill | current | no | no | yes | Long Runs; Daily Training; Half Marathon; Marathon | yes | yes | yes | published |
| HydraPak | HydraPak Contour 2L Soft Reservoir | 2L | current | no | no | yes | Ultra; Long Runs; Trail Running | yes | yes | yes | published |
| HydraPak | HydraPak Shape-Shift 1.5L | 1.5L | current | no | no | yes | Ultra; Long Runs; Trail Running | no | yes | no | draft · not prod-exposed |
| HydraPak | HydraPak SkyFlask Speed 500 | Speed 500 | current | no | no | yes | Long Runs; Daily Training; Half Marathon; Trail Running | yes | yes | yes | published |
| HydraPak | HydraPak SoftFlask 250 ml | 250 | current | no | no | yes | Long Runs; Ultra; Trail Running; Daily Training | yes | yes | yes | published |
| HydraPak | HydraPak SoftFlask 500 ml | 500 | current | no | no | yes | Long Runs; Ultra; Trail Running | yes | yes | yes | published |
| HydraPak | HydraPak SoftFlask Speed 500 | Speed 500 | current | no | no | yes | Long Runs; Ultra; Trail Running; Marathon | yes | yes | yes | published |
| HydraPak | HydraPak Tube Kit | Tube Kit | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| Nathan | Nathan ExoShot 2 | 2 | current | no | no | yes | Long Runs; Daily Training; Trail Running | yes | yes | yes | published |
| Nathan | Nathan QuickDraw Plus Handheld | Plus | current | no | no | yes | Long Runs; Daily Training; Half Marathon; Marathon; Beginners | no | yes | no | draft · not prod-exposed |
| Nathan | Nathan SoftFlask 18oz | 18oz | current | no | no | yes | Long Runs; Ultra; Trail Running; Marathon | yes | yes | yes | published |
| Nathan | Nathan SpeedDraw Plus Insulated 18oz | Plus Insulated 18oz | current | no | no | yes | Long Runs; Daily Training; Half Marathon; Marathon | yes | yes | yes | published |
| Osprey | Osprey Hydraulics LT 1.5L Reservoir | LT 1.5L | current | no | no | yes | Ultra; Long Runs; Trail Running | yes | yes | yes | published |
| Salomon | Salomon Soft Flask 500 ml | 500 | current | no | no | yes | Long Runs; Trail Running; Ultra | yes | yes | yes | published |
| Salomon | Salomon Soft Flask Speed 500 | Speed 500 | current | no | no | yes | Long Runs; Ultra; Trail Running; Marathon | yes | yes | yes | published |
| Salomon | Salomon Soft Reservoir 1.5L | 1.5L | current | no | no | yes | Ultra; Long Runs; Trail Running | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Body Bottle 500 | 500 | current | no | no | yes | Long Runs; Ultra; Trail Running; Marathon | yes | yes | yes | published |

### Clothing

Category: `cat-running-clothing` (Running Clothing) — **72** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Adidas | adidas Own the Run Short (Men) | Own the Run | current | yes | no | no | Daily Training; 5K; 10K; Beginners | yes | yes | yes | published |
| Adidas | adidas Own the Run Tee (Men) | Own the Run | current | yes | no | no | Daily Training; 5K; 10K; Beginners | yes | yes | yes | published |
| ASICS | ASICS Core Split Short | Core | current | yes | no | no | Tempo Runs; Intervals; 5K; 10K; PB / PR | yes | yes | yes | published |
| ASICS | ASICS Race Singlet (Men) | Race | current | yes | no | no | 5K; 10K; Half Marathon; Advanced Runners | no | yes | no | draft · not prod-exposed |
| Brooks | Brooks Canopy Jacket (Men) | Canopy | current | yes | no | no | Daily Training; Long Runs; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Brooks | Brooks Cascadia Jacket | Cascadia | current | yes | no | no | Trail Running; Long Runs; Ultra | no | yes | no | draft · not prod-exposed |
| Brooks | Brooks Chaser 5" Short Tight (Women) | Chaser | current | no | yes | no | Daily Training; Long Runs; 10K; Half Marathon; Beginners | yes | yes | yes | published |
| Brooks | Brooks Dare Crossback Run Bra | Dare Crossback | current | no | yes | no | Daily Training; Long Runs; 5K; 10K; Half Marathon; Beginners | no | yes | no | draft · not prod-exposed |
| Brooks | Brooks Ghost Short Sleeve | Ghost | current | no | no | yes | Daily Training; Easy Runs; Beginners; Comfort | no | yes | no | draft · not prod-exposed |
| Brooks | Brooks LSD Thermal Vest (Men) | LSD Thermal | current | yes | no | no | Long Runs; Daily Training; Half Marathon; Marathon; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| Brooks | Brooks Method 7/8 Tight (Women) | Method | current | no | yes | no | Daily Training; Long Runs; Half Marathon; Beginners; Intermediate Runners | yes | yes | yes | published |
| Brooks | Brooks Notch Thermal Beanie | Notch Thermal | current | no | no | yes | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Brooks | Brooks Notch Thermal Hoodie (Men) | Notch Thermal | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Brooks | Brooks Sherpa 7" 2-in-1 Short (Men) | Sherpa | current | yes | no | no | Daily Training; Long Runs; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| BUFF | BUFF CoolNet UV+ Multifunctional Neckwear | CoolNet UV+ | current | no | no | yes | Trail Running; Daily Training; Long Runs; Bright Sun | yes | yes | yes | published |
| BUFF | BUFF Lightweight Merino Wool Multifunctional Neckwear | Lightweight Merino Wool | current | no | no | yes | Trail Running; Winter Running; Long Runs; Daily Training | yes | yes | yes | published |
| BUFF | Buff Original Multifunctional Headwear | Original | current | no | no | yes | Trail Running; Daily Training; Long Runs | yes | yes | yes | published |
| BUFF | BUFF Polar Multifunctional Neckwear | Polar | current | no | no | yes | Winter Running; Daily Training; Commute Running | yes | yes | yes | published |
| Ciele | Ciele GOCap Athletics | GOCap Athletics | current | no | no | yes | Daily Training; Long Runs; Trail Running; Half Marathon; Marathon | yes | yes | yes | published |
| Craft | Craft Active Extreme X Windstop (Men) | Active Extreme X | current | yes | no | no | Daily Training; Long Runs; Trail Running; Intermediate Runners; Advanced Runners | yes | yes | yes | published |
| Craft | Craft ADV Essence Light Wind Jacket (Men) | ADV Essence | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Craft | Craft ADV Essence Light Wind Vest (Men) | ADV Essence | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Craft | Craft ADV Essence Short | ADV Essence | current | yes | no | no | Daily Training; Easy Runs; Intermediate Runners | yes | yes | yes | published |
| Craft | Craft ADV Essence Tights (Men) | ADV Essence | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Craft | Craft ADV Lumen Fleece Glove | ADV Lumen | current | no | no | yes | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Janji | Janji Multi Short 2-in-1 7" (Men) | Multi | current | yes | no | no | Daily Training; Long Runs; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| Janji | Janji Pace Short 5" (Women) | Pace | current | no | yes | no | Daily Training; Long Runs; 10K; Half Marathon | yes | yes | yes | published |
| Janji | Janji Rainrunner Jacket (Men) | Rainrunner | current | yes | no | no | Daily Training; Long Runs; Trail Running; Half Marathon | yes | yes | yes | published |
| Janji | Janji Run Tee / AFO Tee (Men) | AFO / Run Tee | current | yes | no | no | Daily Training; Long Runs; 10K; Half Marathon; Beginners | yes | yes | yes | published |
| lululemon | lululemon Always In Motion Boxer (Men) | Always In Motion | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| lululemon | lululemon Energy Bra | Energy | current | no | yes | no | Daily Training; 10K; Beginners; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| lululemon | lululemon Fast and Free High-Rise Tight (Women) | Fast and Free | current | no | yes | no | Daily Training; Long Runs; Half Marathon; Beginners; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| lululemon | lululemon Hotty Hot High-Rise Short (Women) | Hotty Hot | current | no | yes | no | Daily Training; 10K; Beginners; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| lululemon | lululemon Pace Breaker Lined Short (Men) | Pace Breaker | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| New Balance | New Balance RC Essential Short (Men) | RC Essential | current | yes | no | no | Daily Training; 5K; 10K; Beginners; Intermediate Runners | yes | yes | yes | published |
| Nike | Nike AeroBill / Dri-FIT Advantage Cap | AeroBill | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| Nike | Nike AeroSwift Singlet (Men) | AeroSwift | current | yes | no | no | 5K; 10K; Half Marathon; Marathon; Advanced Runners | yes | yes | yes | published |
| Nike | Nike Dri-FIT Fast Tights (Men) | Fast | current | yes | no | no | Daily Training; 5K; 10K; Half Marathon; Advanced Runners | yes | yes | yes | published |
| Nike | Nike Dri-FIT Miler Tee (Men) | Miler | current | yes | no | no | Daily Training; 5K; 10K; Beginners; Intermediate Runners | yes | yes | yes | published |
| Nike | Nike Dri-FIT Miler Tee (Women) | Miler | current | no | yes | no | Daily Training; 5K; 10K; Beginners; Intermediate Runners | yes | yes | yes | published |
| Nike | Nike Dri-FIT Stride Short | Stride | current | yes | no | no | Daily Training; Easy Runs; Tempo Runs | yes | yes | yes | published |
| Nike | Nike Element / Therma Long Sleeve (Men) | Element | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | no | yes | no | draft · not prod-exposed |
| Nike | Nike Impossibly Light / Windrunner Light Shell (Men) | Impossibly Light | current | yes | no | no | Daily Training; 5K; 10K; Half Marathon; Advanced Runners | yes | yes | yes | published |
| Nike | Nike Swoosh Medium Support Bra | Swoosh | current | no | yes | no | Daily Training; 10K; Beginners; Intermediate Runners | yes | yes | yes | published |
| Nike | Nike Therma-FIT Run Gloves | Therma-FIT | current | no | no | yes | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Odlo | Odlo Active Warm Eco Bottom (Men) | Active Warm Eco | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Odlo | Odlo Active Warm Eco Long Sleeve (Men) | Active Warm Eco | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| On | On Performance Shorts / Hybrid (Men) | Performance | current | yes | no | no | Daily Training; 10K; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| On | On Performance Tights (Women) | Performance | current | no | yes | no | Daily Training; Long Runs; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| On | On Weather Jacket (Men) | Weather | current | yes | no | no | Daily Training; Long Runs; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Patagonia | Patagonia Capilene Cool Daily Shirt (Men) | Capilene Cool Daily | current | yes | no | no | Daily Training; Trail Running; Long Runs; Beginners | yes | yes | yes | published |
| Patagonia | Patagonia Capilene Midweight Zip-Neck (Men) | Capilene Midweight | current | yes | no | no | Daily Training; Long Runs; Trail Running; Intermediate Runners | yes | yes | yes | published |
| Patagonia | Patagonia Capilene Thermal Weight Crew (Men) | Capilene Thermal Weight | current | yes | no | no | Daily Training; Long Runs; Trail Running; Intermediate Runners | yes | yes | yes | published |
| Patagonia | Patagonia Endless Run Tights (Women) | Endless Run | current | no | yes | no | Trail Running; Long Runs; Daily Training; Ultra | yes | yes | yes | published |
| Patagonia | Patagonia Houdini Jacket (Men) | Houdini | current | yes | no | no | Long Runs; Trail Running; Ultra; Marathon; Advanced Runners | yes | yes | yes | published |
| Patagonia | Patagonia Nano-Puff Vest (Men) | Nano-Puff | current | yes | no | no | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| Patagonia | Patagonia Strider Pro Shorts (Men) | Strider Pro | current | yes | no | no | Daily Training; Long Runs; Trail Running; Half Marathon | yes | yes | yes | published |
| Patagonia | Patagonia Trailfarer Shorts (Women) | Trailfarer | current | no | yes | no | Trail Running; Long Runs; Daily Training; Ultra | yes | yes | yes | published |
| Rabbit | rabbit Fuel n' Fly 5" Short (Men) | Fuel n' Fly | current | yes | no | no | Long Runs; Half Marathon; Marathon; Daily Training; Advanced Runners | yes | yes | yes | published |
| Salomon | Salomon Bonatti Waterproof Jacket (Men) | Bonatti | current | yes | no | no | Trail Running; Long Runs; Ultra; Marathon; Advanced Runners | yes | yes | yes | published |
| Salomon | Salomon Bonatti Waterproof Jacket (Women) | Bonatti | current | no | yes | no | Trail Running; Long Runs; Ultra; Marathon; Advanced Runners | yes | yes | yes | published |
| SAXX | SAXX Kinetic HD Boxer Brief (Men) | Kinetic HD | current | yes | no | no | Daily Training; Long Runs; Half Marathon; Marathon; Beginners | no | yes | no | draft · not prod-exposed |
| Smartwool | Smartwool Thermal Merino Glove | Thermal Merino | current | no | no | yes | Daily Training; Long Runs; Beginners; Intermediate Runners | yes | yes | yes | published |
| The North Face | The North Face Flight Series / Better Than Naked Rain Shell (Men) | Flight Series | current | yes | no | no | Long Runs; Trail Running; Half Marathon; Marathon; Advanced Runners | no | yes | no | draft · not prod-exposed |
| Tracksmith | Tracksmith Brighton Bra | Brighton | current | no | yes | no | Daily Training; 5K; 10K; Half Marathon; Intermediate Runners; Advanced Runners | no | yes | no | draft · not prod-exposed |
| Tracksmith | Tracksmith Brighton Long Sleeve (Men) | Brighton | current | yes | no | no | Daily Training; Long Runs; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Tracksmith | Tracksmith Harrier Singlet (Men) | Harrier | current | yes | no | no | 5K; 10K; Half Marathon; Advanced Runners | no | yes | no | draft · not prod-exposed |
| Tracksmith | Tracksmith Session Short (Men) | Session | current | yes | no | no | Daily Training; 10K; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Tracksmith | Tracksmith Session Short (Women) | Session | current | no | yes | no | Daily Training; 10K; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Tracksmith | Tracksmith Turnover Lined Tight (Women) | Turnover | current | no | yes | no | Daily Training; Long Runs; Half Marathon; Intermediate Runners | yes | yes | yes | published |
| Tracksmith | Tracksmith Twilight Half Tights (Men) | Twilight | current | yes | no | no | Daily Training; 5K; 10K; Intermediate Runners; Advanced Runners | yes | yes | yes | published |
| Tracksmith | Tracksmith Van Cortlandt / Session Tee (Men) | Van Cortlandt | current | yes | no | no | Daily Training; Long Runs; Intermediate Runners; Advanced Runners | yes | yes | yes | published |

### Packs/Vests

Category: `cat-packs-vests` (Running Packs & Vests) — **42** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Black Diamond | Black Diamond Distance 15 Backpack | 15 | current | no | no | yes | Trail Running; Ultra; Long Runs; Fastpacking | yes | yes | yes | published |
| Black Diamond | Black Diamond Distance 22 Backpack | 22 | current | no | no | yes | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Black Diamond | Black Diamond Distance 8 | 8 | current | no | no | yes | Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| CamelBak | CamelBak Apex Pro Run Vest | Pro | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| CamelBak | CamelBak Circuit Run Vest | Circuit | current | no | no | yes | Beginners; Long Runs; Daily Training; Half Marathon; Marathon | yes | yes | yes | published |
| CamelBak | CamelBak Octane 22 | 22 | current | no | no | yes | Long Runs; Trail Running; Ultra; Fastpacking | no | yes | no | draft · not prod-exposed |
| CamelBak | CamelBak Zephyr | Zephyr | previous-generation | no | no | yes | Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| CamelBak | CamelBak Zephyr Pro | Pro | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| Compressport | Compressport Ultrun S Pack | S Pack | current | no | no | yes | Ultra; Trail Running; Long Runs; Marathon | yes | yes | yes | published |
| Decathlon | Kiprun Trail 10L Running Vest | 10 | current | no | no | yes | Beginners; Long Runs; Trail Running; Ultra | no | yes | no | draft · not prod-exposed |
| LEKI | LEKI Trail Running Quiver | 1 | current | no | no | yes | Trail Running; Ultra; Long Runs | no | yes | no | draft · not prod-exposed |
| Nathan | Nathan Pinnacle 12L | 12 | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| Nathan | Nathan VaporAir 2 | 2 | previous-generation | no | no | yes | Long Runs; Trail Running; Ultra; Marathon | yes | yes | yes | published |
| Nathan | Nathan VaporAir 4.0 8L | 4.0 | current | no | no | yes | Long Runs; Trail Running; Ultra; Marathon | yes | yes | yes | published |
| Nathan | Nathan Zippered Stash / Phone Pouch | 1 | current | no | no | yes | Long Runs; Trail Running; Marathon; Ultra | yes | yes | yes | published |
| NNormal | NNormal Race Vest | Race | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| On | On Ultra Vest Pro | Pro | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| Osprey | Osprey Duro 15 | 15 | current | yes | no | no | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| Osprey | Osprey Duro 6 | 6 | current | yes | no | no | Long Runs; Trail Running; Ultra | yes | yes | yes | published |
| Osprey | Osprey Duro LT | LT | current | yes | no | no | Long Runs; Daily Training; Half Marathon; Marathon; Trail Running | yes | yes | yes | published |
| Osprey | Osprey Dyna 6 | 6 | current | no | yes | no | Long Runs; Trail Running; Ultra | yes | yes | yes | published |
| Osprey | Osprey Dyna LT | LT | current | no | yes | no | Long Runs; Daily Training; Half Marathon; Marathon; Trail Running | yes | yes | yes | published |
| Osprey | Osprey Talon Velocity 20 | 20 | current | yes | no | no | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Osprey | Osprey Talon Velocity 30 | 30 | current | yes | no | no | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Osprey | Osprey Tempest Velocity 20 | 20 | current | no | yes | no | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Patagonia | Patagonia Slope Runner Vest | Slope Runner | current | no | no | yes | Trail Running; Long Runs; Ultra | no | yes | no | draft · not prod-exposed |
| RaidLight | RaidLight Responsiv 12L | 12 | current | no | no | yes | Ultra; Trail Running; Long Runs | no | yes | no | draft · not prod-exposed |
| Salomon | Salomon ADV Skin 12 | 12 | current | no | no | yes | Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Salomon | Salomon ADV Skin 5 | 5 | current | no | no | yes | Trail Running; Ultra; Long Runs; Marathon | yes | yes | yes | published |
| Salomon | Salomon Custom Quiver | 1 | current | no | no | yes | Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Salomon | Salomon Soft Flask Stash / Pocket | 1 | current | no | no | yes | Long Runs; Trail Running; Ultra; Marathon | no | yes | no | draft · not prod-exposed |
| Salomon | Salomon Trailblazer 20 | 20 | current | no | no | yes | Long Runs; Trail Running; Commute Running | no | yes | no | draft · not prod-exposed |
| Salomon | Salomon XA 15 | 15 | current | no | no | yes | Trail Running; Ultra; Long Runs; Fastpacking | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Adventure Vest | 5 | current | no | no | yes | Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Fastpack 20 | 20 | current | yes | no | no | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Fastpack 30 | 30 | current | no | no | yes | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction FastpackHer 20 | 20 | current | no | yes | no | Fastpacking; Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Race Vest 6.0 | 6.0 | current | no | no | yes | Ultra; Trail Running; Long Runs; Marathon | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Utility Bag | 1 | current | no | no | yes | Long Runs; Trail Running; Ultra; Marathon | yes | yes | yes | published |
| UltrAspire | UltrAspire Alpha 6.0 Race Vest | 6.0 | current | no | no | yes | Ultra; Trail Running; Long Runs | yes | yes | yes | published |
| UltrAspire | UltrAspire Spry 5.0 | 5.0 | current | no | no | yes | Beginners; Long Runs; Trail Running; Half Marathon | yes | yes | yes | published |
| USWE | USWE Pace 8L | 8 | current | no | no | yes | Trail Running; Ultra; Long Runs | yes | yes | yes | published |

### Headphones

Category: `cat-headphones` (Headphones) — **17** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Apple | Apple AirPods 4 | 4 | current | no | no | no | Gym / Indoor Training; Daily Training; Easy Runs; Treadmill Running; Commute Running | yes | yes | yes | published |
| Apple | Apple AirPods Pro 2 | 2 | current | no | no | no | Treadmill Running; Gym / Indoor Training; Daily Training; Easy Runs | yes | yes | yes | published |
| Beats | Beats Fit Pro | Fit Pro | current | no | no | no | Gym / Indoor Training; Treadmill Running; Daily Training; Easy Runs | yes | yes | yes | published |
| Beats | Beats Powerbeats Pro 2 | Pro 2 | current | no | no | no | Gym / Indoor Training; Daily Training; Long Runs; Treadmill Running; Intervals | no | yes | no | draft · not prod-exposed |
| Bose | Bose Ultra Open Earbuds | Ultra Open | current | no | no | no | Daily Training; Easy Runs; Situational Awareness | yes | yes | yes | published |
| HUAWEI | HUAWEI FreeClip 2 | 2 | current | no | no | no | Situational Awareness; Daily Training; Easy Runs; Commute Running | no | yes | no | draft · not prod-exposed |
| Jabra | Jabra Elite 10 Gen 2 | 10 Gen 2 | current | no | no | no | Gym / Indoor Training; Treadmill Running; Daily Training; Easy Runs | no | yes | no | draft · not prod-exposed |
| Jabra | Jabra Elite 8 Active Gen 2 | 8 Active Gen 2 | current | no | no | no | Gym / Indoor Training; Rain Running; Daily Training; Trail Running; Long Runs; Treadmill Running | no | yes | no | draft · not prod-exposed |
| Shokz | Shokz OpenDots One | One | current | no | no | no | Situational Awareness; Daily Training; Easy Runs; Commute Running | yes | yes | yes | published |
| Shokz | Shokz OpenFit 2 | 2 | current | no | no | no | Situational Awareness; Daily Training; Easy Runs; Long Runs; Commute Running | yes | yes | yes | published |
| Shokz | Shokz OpenRun | OpenRun | current | no | no | no | Situational Awareness; Daily Training; Long Runs; Trail Running; Rain Running; Easy Runs | yes | yes | yes | published |
| Shokz | Shokz OpenRun Pro 2 | 2 | current | no | no | no | Daily Training; Easy Runs; Long Runs; Situational Awareness; Trail Running | yes | yes | yes | published |
| Sony | Sony LinkBuds Fit | Fit | current | no | no | no | Gym / Indoor Training; Treadmill Running; Daily Training; Easy Runs | no | yes | no | draft · not prod-exposed |
| Sony | Sony LinkBuds Open | Open | current | no | no | no | Situational Awareness; Daily Training; Easy Runs; Commute Running | no | yes | no | draft · not prod-exposed |
| soundcore | soundcore AeroFit 2 | 2 | current | no | no | no | Situational Awareness; Daily Training; Easy Runs; Long Runs; Commute Running | yes | yes | yes | published |
| soundcore | soundcore Sport X20 | X20 | current | no | no | no | Gym / Indoor Training; Rain Running; Daily Training; Trail Running; Long Runs; Treadmill Running | yes | yes | yes | published |
| Suunto | Suunto Wing | Wing | current | no | no | no | Situational Awareness; Night Running; Daily Training; Trail Running; Rain Running; Long Runs | yes | yes | yes | published |

### Sunglasses

Category: `cat-sunglasses` (Sunglasses) — **17** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 100% | 100% S3 | S3 | current | no | no | no | Bright Sun; Marathon; Daily Training; 5K | yes | yes | yes | published |
| goodr | Goodr Circle Gs | Circle Gs | current | no | no | no | Daily Training; Easy Runs; Bright Sun | yes | yes | yes | published |
| goodr | Goodr OGs | OGs | current | no | no | no | Daily Training; Easy Runs; Beginners | yes | yes | yes | published |
| Julbo | Julbo Aerolite | Aerolite | current | no | no | no | Trail Running; Ultra; Long Runs | yes | yes | yes | published |
| Julbo | Julbo Rush | Rush | current | no | no | no | Trail Running; Mixed Light; Ultra; Long Runs | yes | yes | yes | published |
| Julbo | Julbo Ultimate | Ultimate | current | no | no | no | Trail Running; Mixed Light; Ultra; Long Runs; Bright Sun | yes | yes | yes | published |
| Oakley | Oakley Encoder | Encoder | current | no | no | no | Long Runs; Daily Training; Trail Running | yes | yes | yes | published |
| Oakley | Oakley Flak 2.0 XL | Flak 2.0 XL | current | no | no | no | Bright Sun; Daily Training; Marathon; Long Runs | yes | yes | yes | published |
| Oakley | Oakley Kato | Kato | current | no | no | no | Bright Sun; Marathon; 5K; Daily Training | yes | yes | yes | published |
| Oakley | Oakley Radar EV Path | Radar EV Path | current | no | no | no | Bright Sun; Daily Training; Trail Running; Marathon; Long Runs | yes | yes | yes | published |
| Oakley | Oakley Sutro Lite | Sutro Lite | current | no | no | no | Bright Sun; Daily Training; Marathon; Long Runs | yes | yes | yes | published |
| ROKA | ROKA Phantom Air | Phantom Air | current | no | no | no | Daily Training; Bright Sun; Marathon; Long Runs | yes | yes | yes | published |
| Rudy Project | Rudy Project Cutline | Cutline | current | no | no | no | Bright Sun; Marathon; Mixed Light; Daily Training; 5K | yes | yes | yes | published |
| Smith | Smith Attack MAG | Attack MAG | current | no | no | no | Trail Running; Mixed Light; Ultra; Long Runs; Bright Sun | yes | yes | yes | published |
| Smith | Smith Shift MAG | Shift MAG | current | no | no | no | Bright Sun; Mixed Light; Daily Training; Marathon; Trail Running | yes | yes | yes | published |
| Tifosi | Tifosi Rail | Rail | current | no | no | no | Daily Training; Bright Sun; Mixed Light; Trail Running; Marathon | yes | yes | yes | published |
| Tifosi | Tifosi Vogel | Vogel | current | no | no | no | Daily Training; Easy Runs; Bright Sun | yes | yes | yes | published |

### Headlamps

Category: `cat-running-lights` (Running Lights) — **16** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BioLite | BioLite HeadLamp 425 | 425 | current | no | no | no | Night Running; Winter Running; Long Runs; Trail Running | no | yes | no | draft · not prod-exposed |
| BioLite | BioLite HeadLamp 800 Pro | 800 Pro | current | no | no | no | Night Running; Trail Running; Long Runs; Ultra; Winter Running | yes | yes | yes | published |
| Black Diamond | Black Diamond Distance 1500 | 1500 | current | no | no | no | Trail Running; Ultra; Night Running; Long Runs; Winter Running | yes | yes | yes | published |
| Black Diamond | Black Diamond Spot 400-R | 400-R | current | no | no | no | Trail Running; Night Running; Daily Training | yes | yes | yes | published |
| Black Diamond | Black Diamond Storm 500-R | 500-R | current | no | no | no | Winter Running; Night Running; Trail Running; Long Runs | no | yes | no | draft · not prod-exposed |
| Fenix | Fenix HM65R-T | HM65R-T | current | no | no | no | Trail Running; Night Running; Ultra; Winter Running; Long Runs | no | yes | no | draft · not prod-exposed |
| Ledlenser | Ledlenser NEO5R | 5R | current | no | no | no | Night Running; Winter Running; Long Runs; Trail Running | no | yes | no | draft · not prod-exposed |
| Ledlenser | Ledlenser NEO9R | 9R | current | no | no | no | Trail Running; Night Running; Ultra; Long Runs; Winter Running | yes | yes | yes | published |
| NITECORE | NITECORE NU25 UL | NU25 UL | current | no | no | no | Night Running; Long Runs; Ultra; Winter Running | no | yes | no | draft · not prod-exposed |
| NITECORE | NITECORE NU43 | NU43 | current | no | no | no | Night Running; Trail Running; Long Runs; Ultra; Winter Running | yes | yes | yes | published |
| Petzl | Petzl Actik Core | CORE | current | no | no | no | Night Running; Winter Running; Long Runs; Trail Running | yes | yes | yes | published |
| Petzl | Petzl IKO Core | CORE | current | no | no | no | Night Running; Long Runs; Ultra; Winter Running | no | yes | no | draft · not prod-exposed |
| Petzl | Petzl NAO RL | RL | current | no | no | no | Night Running; Trail Running; Ultra; Long Runs; Winter Running | yes | yes | yes | published |
| Petzl | Petzl Swift RL | Swift RL | current | no | no | no | Trail Running; Ultra; Night Running; Long Runs | yes | yes | yes | published |
| Silva | Silva Smini | Smini | current | no | no | no | Night Running; Long Runs; Ultra; Winter Running | no | yes | no | draft · not prod-exposed |
| Silva | Silva Trail Runner Free 2 | 2 | current | no | no | no | Trail Running; Ultra; Night Running; Long Runs | yes | yes | yes | published |

### Fuel

Category: `cat-nutrition` (Nutrition & Fuel) — **38** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 226ERS | 226ERS High Energy Gel | High Energy Gel | current | no | no | no | Long Runs; Marathon; Ultra; High-Carb Fueling; Easy-to-Carry Fuel | yes | yes | yes | published |
| Clif Bar | CLIF Bar Original | Original | current | no | no | no | Long Runs; Ultra; Trail Running; Easy-to-Carry Fuel; Non-Caffeinated Fuel; Beginners | yes | yes | yes | published |
| Clif Bar | CLIF BLOKS Energy Chews | Bloks | current | no | no | no | Long Runs; Half Marathon; Marathon; Trail Running; Easy-to-Carry Fuel; Short Training; Beginners | yes | yes | yes | published |
| Enervit | Enervit C2:1 Carbo Gel | C2:1 Carbo Gel | current | no | no | no | Long Runs; Marathon; Ultra; High-Carb Fueling; Easy-to-Carry Fuel | yes | yes | yes | published |
| GU Energy | GU Energy Chews | Energy Chews | current | no | no | no | Long Runs; Half Marathon; Short Training; Easy-to-Carry Fuel; Trail Running; Beginners | yes | yes | yes | published |
| GU Energy | GU Energy Gel | Energy Gel | current | no | no | no | Short Training; Long Runs; Half Marathon; Marathon; Easy-to-Carry Fuel; Trail Running; Beginners | yes | yes | yes | published |
| GU Energy | GU Roctane Energy Gel | Roctane | current | no | no | no | Long Runs; Marathon; Ultra; Trail Running; Easy-to-Carry Fuel; Caffeinated Fuel | yes | yes | yes | published |
| High5 | High5 Energy Gel | Energy Gel | current | no | no | no | Long Runs; Half Marathon; Marathon; Easy-to-Carry Fuel; Short Training | yes | yes | yes | published |
| High5 | High5 ZERO Electrolyte Tablets | ZERO | current | no | no | no | Short Training; Long Runs; Half Marathon; Drink-Based Fueling; Easy-to-Carry Fuel; Non-Caffeinated Fuel; Beginners | yes | yes | yes | published |
| Honey Stinger | Honey Stinger Organic Energy Gel | Organic Energy Gel | current | no | no | no | Short Training; Long Runs; Half Marathon; Easy-to-Carry Fuel; Trail Running; Non-Caffeinated Fuel; Beginners | yes | yes | yes | published |
| Hüma | Hüma Original Energy Gel | Original | current | no | no | no | Long Runs; Trail Running; Ultra; Half Marathon; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Maurten | Maurten Drink Mix 160 | 160 | current | no | no | no | Long Runs; Marathon; Drink-Based Fueling; High-Carb Fueling; Half Marathon; Non-Caffeinated Fuel | yes | yes | yes | published |
| Maurten | Maurten Drink Mix 320 | 320 | current | no | no | no | Marathon; High-Carb Fueling; Drink-Based Fueling; Ultra; Long Runs; Non-Caffeinated Fuel | yes | yes | yes | published |
| Maurten | Maurten Gel 100 | 100 | current | no | no | no | Long Runs; Half Marathon; Marathon; Easy-to-Carry Fuel; Non-Caffeinated Fuel; High-Carb Fueling | yes | yes | yes | published |
| Maurten | Maurten Gel 100 Caf 100 | 100 Caf 100 | current | no | no | no | Marathon; Half Marathon; Long Runs; Caffeinated Fuel; Easy-to-Carry Fuel; High-Carb Fueling | yes | yes | yes | published |
| Maurten | Maurten Gel 160 | 160 | current | no | no | no | Marathon; Ultra; High-Carb Fueling; Long Runs; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Näak | Näak Ultra Energy Bar | Ultra Energy Bar | current | no | no | no | Ultra; Trail Running; Long Runs; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Näak | Näak Ultra Energy Drink Mix | Ultra Energy Drink Mix | current | no | no | no | Ultra; Long Runs; Trail Running; Drink-Based Fueling; High-Carb Fueling | yes | yes | yes | published |
| Neversecond | Neversecond C30 Energy Gel | C30 | current | no | no | no | Marathon; High-Carb Fueling; Long Runs; Half Marathon; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Neversecond | Neversecond C30 Sports Drink | C30 | current | no | no | no | Marathon; Drink-Based Fueling; High-Carb Fueling; Long Runs; Half Marathon; Non-Caffeinated Fuel | yes | yes | yes | published |
| Nuun | Nuun Sport Electrolyte Tablets | Sport | current | no | no | no | Short Training; Long Runs; Half Marathon; Drink-Based Fueling; Easy-to-Carry Fuel; Beginners | yes | yes | yes | published |
| PowerBar | PowerBar Energize | Energize | current | no | no | no | Long Runs; Half Marathon; Marathon; Ultra; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Precision Fuel & Hydration | Precision Fuel & Hydration PF 30 Drink Mix | PF 30 | current | no | no | no | Marathon; High-Carb Fueling; Drink-Based Fueling; Long Runs; Half Marathon; Non-Caffeinated Fuel | yes | yes | yes | published |
| Precision Fuel & Hydration | Precision Fuel & Hydration PF 30 Gel | PF 30 | current | no | no | no | Marathon; Half Marathon; High-Carb Fueling; Long Runs; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Precision Fuel & Hydration | Precision Fuel & Hydration PH 1500 | PH 1500 | current | no | no | no | Long Runs; Marathon; Ultra; Drink-Based Fueling; Trail Running; Half Marathon | yes | yes | yes | published |
| SaltStick | SaltStick Caps | Caps | current | no | no | no | Long Runs; Marathon; Ultra; Trail Running; Easy-to-Carry Fuel; Half Marathon | yes | yes | yes | published |
| SaltStick | SaltStick Fastchews | Fastchews | current | no | no | no | Long Runs; Marathon; Ultra; Trail Running; Easy-to-Carry Fuel; Half Marathon | yes | yes | yes | published |
| Science in Sport | Science in Sport Beta Fuel Dual Source Energy Gel | Beta Fuel | current | no | no | no | Marathon; Ultra; High-Carb Fueling; Long Runs; Half Marathon; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Science in Sport | Science in Sport Beta Fuel Energy Drink Mix | Beta Fuel | current | no | no | no | Marathon; High-Carb Fueling; Drink-Based Fueling; Long Runs; Ultra; Non-Caffeinated Fuel | yes | yes | yes | published |
| Science in Sport | Science in Sport GO Isotonic Energy Gel | GO Isotonic | current | no | no | no | Short Training; Half Marathon; Marathon; Long Runs; Easy-to-Carry Fuel; Non-Caffeinated Fuel; Beginners | yes | yes | yes | published |
| Skratch Labs | Skratch Labs Sport Energy Chews | Sport Energy Chews | current | no | no | no | Long Runs; Trail Running; Ultra; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| Skratch Labs | Skratch Labs Sport Hydration Drink Mix | Sport Hydration | current | no | no | no | Long Runs; Trail Running; Drink-Based Fueling; Half Marathon; Short Training; Non-Caffeinated Fuel; Beginners | yes | yes | yes | published |
| Spring Energy | Spring Energy Awesome Sauce | Awesome Sauce | current | no | no | no | Ultra; Trail Running; Long Runs; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| STYRKR | STYRKR GEL30 | GEL30 | current | no | no | no | Long Runs; Marathon; Ultra; High-Carb Fueling; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |
| STYRKR | STYRKR MIX90 Dual-Carb Drink Mix | MIX90 | current | no | no | no | High-Carb Fueling; Marathon; Drink-Based Fueling; Ultra; Long Runs; Non-Caffeinated Fuel | yes | yes | yes | published |
| Tailwind | Tailwind Endurance Fuel | Endurance Fuel | current | no | no | no | Long Runs; Ultra; Trail Running; Drink-Based Fueling; Marathon; Non-Caffeinated Fuel | yes | yes | yes | published |
| Veloforte | Veloforte Energy Bar | Energy Bar | current | no | no | no | Long Runs; Ultra; Trail Running; Easy-to-Carry Fuel | yes | yes | yes | published |
| Veloforte | Veloforte Energy Chews | Energy Chews | current | no | no | no | Long Runs; Trail Running; Ultra; Easy-to-Carry Fuel; Non-Caffeinated Fuel | yes | yes | yes | published |

### Recovery

Category: `cat-recovery-gear` (Recovery) — **32** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2XU | 2XU Refresh Recovery Tights | Refresh Recovery | current | no | no | no | Post-Run Recovery Tools; Travel Recovery Kit; Home Recovery Setup; Comfort; High Mileage | no | yes | no | draft · not prod-exposed |
| BLACKROLL | BLACKROLL PRO Foam Roller | PRO | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Comfort | yes | yes | yes | published |
| Brazyn | Brazyn Morph Collapsible Foam Roller | Morph | current | no | no | no | Travel Recovery Kit; Post-Run Recovery Tools; Home Recovery Setup; High Mileage | yes | yes | yes | published |
| CEP | CEP Calf Sleeves 3.0 | 3.0 | current | no | no | no | Long Runs; Marathon; High Mileage; Post-Run Recovery Tools | yes | yes | yes | published |
| CEP | CEP The Run Calf Sleeves | The Run | current | no | no | no | High Mileage; Post-Run Recovery Tools; Comfort; Travel Recovery Kit | yes | yes | yes | published |
| Compressport | Compressport R2 Calf Sleeves | R2 | current | no | no | no | High Mileage; Post-Run Recovery Tools; Travel Recovery Kit; Comfort | no | yes | no | draft · not prod-exposed |
| HOKA | HOKA Ora Recovery Slide | Ora Recovery Slide | current | no | no | no | Post-Run Recovery Tools; Comfort; High Mileage; Recovery Runs | no | yes | no | draft · not prod-exposed |
| Hyperice | Hyperice Hypervolt 2 | 2 / 2 Pro | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Comfort | yes | yes | yes | published |
| Hyperice | Hyperice Hypervolt Go 2 | Go 2 | current | no | no | no | Recovery Runs; Post-Run Recovery Tools; Travel Recovery Kit; High Mileage | yes | yes | yes | published |
| Hyperice | Hyperice Normatec 3 | 3 | current | no | no | no | Home Recovery Setup; Post-Run Recovery Tools; High Mileage; Comfort | yes | yes | yes | published |
| Hyperice | Hyperice Normatec Go | Go | current | no | no | no | Travel Recovery Kit; Post-Run Recovery Tools; Home Recovery Setup; High Mileage | yes | yes | yes | published |
| Hyperice | Hyperice Vyper 3 | 3 | current | no | no | no | Home Recovery Setup; Post-Run Recovery Tools; High Mileage; Comfort | yes | yes | yes | published |
| OOFOS | OOFOS OOcandoo | OOcandoo | current | no | no | no | Post-Run Recovery Tools; Comfort; High Mileage; Travel Recovery Kit | no | yes | no | draft · not prod-exposed |
| OOFOS | OOFOS OOlala | OOlala | current | no | no | no | Post-Run Recovery Tools; Comfort; High Mileage; Recovery Runs | yes | yes | yes | published |
| OOFOS | OOFOS OOriginal | OOriginal | current | no | no | no | Recovery Runs; Post-Run Recovery Tools; Comfort; High Mileage | yes | yes | yes | published |
| OPOVE | OPOVE M3 Pro Massage Gun | M3 Pro | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; Travel Recovery Kit; High Mileage | no | yes | no | draft · not prod-exposed |
| RAD Roller | RAD Atom | Atom | current | no | no | no | Post-Run Recovery Tools; Travel Recovery Kit; Home Recovery Setup; High Mileage | no | yes | no | draft · not prod-exposed |
| RENPHO | RENPHO R3 Massage Gun | R3 | current | no | no | no | Post-Run Recovery Tools; Travel Recovery Kit; Home Recovery Setup; Comfort | no | yes | no | draft · not prod-exposed |
| RumbleRoller | RumbleRoller Original | Original | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage | no | yes | no | draft · not prod-exposed |
| The Stick | The Stick | Original | current | no | no | no | Post-Run Recovery Tools; Travel Recovery Kit; Home Recovery Setup; High Mileage | no | yes | no | draft · not prod-exposed |
| Therabody | Therabody RecoveryAir | RecoveryAir / JetBoots | current | no | no | no | Home Recovery Setup; Post-Run Recovery Tools; High Mileage; Comfort | no | yes | no | draft · not prod-exposed |
| Therabody | Therabody Theragun mini | mini 2nd Gen | current | no | no | no | Recovery Runs; Post-Run Recovery Tools; Travel Recovery Kit; High Mileage; Comfort | yes | yes | yes | published |
| Therabody | Therabody Theragun Prime | Prime | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Comfort; Recovery Runs | yes | yes | yes | published |
| Therabody | Therabody Theragun Pro | Pro / Pro Plus | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Comfort | yes | yes | yes | published |
| Therabody | Therabody Theragun Relief | Relief | current | no | no | no | Post-Run Recovery Tools; Travel Recovery Kit; Comfort; Home Recovery Setup | no | yes | no | draft · not prod-exposed |
| TimTam | TimTam Power Massager V3.7 | V3.7 | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Travel Recovery Kit | no | yes | no | draft · not prod-exposed |
| TriggerPoint | TriggerPoint GRID Foam Roller | GRID | current | no | no | no | Recovery Runs; Post-Run Recovery Tools; Home Recovery Setup; Daily Training; Beginners | no | yes | no | draft · not prod-exposed |
| TriggerPoint | TriggerPoint GRID Foam Roller 13" | GRID 13" / Travel | current | no | no | no | Travel Recovery Kit; Post-Run Recovery Tools; Home Recovery Setup; Comfort | yes | yes | yes | published |
| TriggerPoint | TriggerPoint GRID X Foam Roller | GRID X | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Recovery Runs | yes | yes | yes | published |
| TriggerPoint | TriggerPoint MB1 Massage Ball | MB1 | current | no | no | no | Post-Run Recovery Tools; Travel Recovery Kit; Home Recovery Setup; Comfort | no | yes | no | draft · not prod-exposed |
| TriggerPoint | TriggerPoint MBX Massage Ball | MBX | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; High Mileage; Travel Recovery Kit | no | yes | no | draft · not prod-exposed |
| TriggerPoint | TriggerPoint STP Massage Stick | STP | current | no | no | no | Post-Run Recovery Tools; Home Recovery Setup; Travel Recovery Kit; Comfort | no | yes | no | draft · not prod-exposed |

### Accessories

Category: `cat-accessories` (Accessories) — **8** products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2Toms | 2Toms SportShield Anti-Chafe Roll-On | SportShield | current | no | no | no | Long Runs; Marathon; Half Marathon; Ultra | yes | yes | yes | published |
| Amphipod | Amphipod AirFlow Phone Armband | AirFlow | current | no | no | no | Daily Training; Commute Running; Beginners | no | yes | no | draft · not prod-exposed |
| Amphipod | Amphipod Reflective Armband | Reflective | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training | no | yes | no | draft · not prod-exposed |
| Body Glide | Body Glide Original Anti-Chafe Balm | Original | current | no | no | no | Long Runs; Marathon; Ultra; Half Marathon | yes | yes | yes | published |
| Compressport | Compressport ArmForce Ultralight Arm Sleeves | ArmForce | current | no | no | no | Long Runs; Marathon; Trail Running; Bright Sun | no | yes | no | draft · not prod-exposed |
| Dirty Girl | Dirty Girl Gaiters | Classic | current | no | no | no | Trail Running; Ultra; Long Runs | no | yes | no | draft · not prod-exposed |
| Outdoor Research | Outdoor Research Ferrosi Thru Gaiters | Ferrosi | current | no | no | no | Trail Running; Ultra; Long Runs | no | yes | no | draft · not prod-exposed |
| Squirrel's Nut Butter | Squirrel's Nut Butter Original Anti-Chafe Balm | Original | current | no | no | no | Long Runs; Marathon; Ultra; Half Marathon | yes | yes | yes | published |

### Additional running categories (not in expected list above)

#### Running Socks (`cat-running-socks`) — 14 products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Balega | Balega Blister Resist Quarter | Blister Resist | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| Balega | Balega Hidden Comfort | Hidden Comfort | current | no | no | yes | Daily Training; Easy Runs; Comfort; Beginners | yes | yes | yes | published |
| Bombas | Bombas Performance Running Quarter | Performance Running Quarter | current | no | no | yes | Daily Training; Easy Runs; Beginners; Half Marathon | no | yes | no | draft · not prod-exposed |
| CEP | CEP Run Compression Sock 3.0 | 3.0 | current | no | no | yes | Long Runs; Marathon; Half Marathon; High Mileage | yes | yes | yes | published |
| Darn Tough | Darn Tough Run 1/4 Ultra-Lightweight | Run 1/4 Ultra-Lightweight | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; Beginners | yes | yes | yes | published |
| Drymax | Drymax Run Lite-Mesh | Run Lite-Mesh | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; Trail Running | yes | yes | yes | published |
| Feetures | Feetures Elite Light Cushion | Elite | current | no | no | yes | Daily Training; Long Runs; Marathon | yes | yes | yes | published |
| Hilly | Hilly Marathon Fresh Socks | Marathon Fresh | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; 10K | no | yes | no | draft · not prod-exposed |
| Injinji | Injinji Run Midweight | Run Midweight | current | no | no | yes | Long Runs; Ultra; Trail Running; Marathon | yes | yes | yes | published |
| Smartwool | Smartwool Run Targeted Cushion Crew | Run Targeted Cushion | current | no | no | yes | Daily Training; Long Runs; Trail Running; Half Marathon; Marathon | yes | yes | yes | published |
| Sockwell | Sockwell Compression Light Cushion | Compression Light Cushion | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; High Mileage | no | yes | no | draft · not prod-exposed |
| Stance | Stance Run Crew | Run Crew | current | no | no | yes | Daily Training; Long Runs; 10K; Half Marathon; Beginners | no | yes | no | draft · not prod-exposed |
| Swiftwick | Swiftwick Aspire Four | Aspire Four | current | no | no | yes | Daily Training; Long Runs; 10K; Half Marathon; Marathon | yes | yes | yes | published |
| Wrightsock | Wrightsock Coolmesh II | Coolmesh II | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; Trail Running | yes | yes | yes | published |

#### Treadmills (`cat-treadmills`) — 3 products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Assault Fitness | Assault Fitness AssaultRunner Elite | Elite | current | no | no | no | Garage Gym; HYROX Training | yes | yes | yes | published |
| Assault Fitness | Assault Fitness AssaultRunner Pro | Pro | current | no | no | no | HYROX Training; Garage Gym | yes | yes | yes | published |
| Mirafit | Mirafit Folding Treadmill | Folding | current | no | no | no | Apartment Gym; Small Space; Home Gym | yes | yes | yes | published |

#### Safety Gear (`cat-safety`) — 14 products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Amphipod | Amphipod Vizlet LED Reflector | Vizlet LED | current | no | no | no | Night Running; Commute Running; Daily Training; Beginners | yes | yes | yes | published |
| Amphipod | Amphipod Xinglet Optic Beam Rechargeable Vest | Optic Beam | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training | yes | yes | yes | published |
| Amphipod | Amphipod Xinglet Reflective Sash | Xinglet | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training; Beginners | yes | yes | yes | published |
| FlipBelt | FlipBelt Zipper Reflective | Zipper Reflective | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training; Beginners | no | yes | no | draft · not prod-exposed |
| Knog | Knog Cobber Mid | Mid | current | no | no | no | Night Running; Commute Running; Winter Running | no | yes | no | draft · not prod-exposed |
| Knog | Knog Frog V3 Twin Pack | V3 | current | no | no | no | Night Running; Commute Running; Daily Training; Winter Running | no | yes | no | draft · not prod-exposed |
| Nathan | Nathan LightBender RX Armband Light | RX | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training; Beginners | yes | yes | yes | published |
| Nathan | Nathan Lux Strobe RX | Lux Strobe RX | current | no | no | no | Night Running; Commute Running; Daily Training; Winter Running | no | yes | no | draft · not prod-exposed |
| Nathan | Nathan Streak Reflective Vest | Streak | current | no | no | no | Daily Training; Night Running; Commute Running; Beginners | yes | yes | yes | published |
| Night Runner | Night Runner 270 Shoe Lights | 270 | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training | no | yes | no | draft · not prod-exposed |
| Nite Ize | Nite Ize Radiant Rechargeable Clip Light | Radiant | current | no | no | no | Night Running; Commute Running; Daily Training | no | yes | no | draft · not prod-exposed |
| Proviz | Proviz Reflect360 Running Vest | Reflect360 | current | no | no | no | Night Running; Commute Running; Winter Running; Daily Training; Beginners | yes | yes | yes | published |
| Road ID | Road ID Wrist ID | Wrist ID / Elite | current | no | no | no | Night Running; Commute Running; Daily Training; Beginners; Winter Running | no | yes | no | draft · not prod-exposed |
| She's Birdie | She's Birdie Personal Safety Alarm | Birdie 3.0 | current | no | no | no | Night Running; Commute Running; Daily Training; Beginners | no | yes | no | draft · not prod-exposed |

#### Running Belts (`cat-running-belts`) — 14 products

| Brand | Product | Generation | Status | Men | Women | Unisex | Use Cases | Review? | Offers? | Media? | Publication Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Amphipod | Amphipod AirFlow Lite Belt | AirFlow Lite | current | no | no | yes | Daily Training; 5K; 10K; Half Marathon; Beginners | yes | yes | yes | published |
| Compressport | Compressport Free Belt Pro | Pro | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; Ultra | yes | yes | yes | published |
| Decathlon | Kiprun Running Belt | Running Belt | current | no | no | yes | Beginners; Daily Training; 5K; 10K; Half Marathon | yes | yes | yes | published |
| Fitletic | Fitletic Fully Loaded Running Belt | Fully Loaded | current | no | no | yes | Daily Training; Half Marathon; Marathon; 10K; 5K | yes | yes | yes | published |
| FlipBelt | FlipBelt Classic | Classic | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon | yes | yes | yes | published |
| Naked | Naked Running Band | Running Band | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; 5K; 10K | yes | yes | yes | published |
| Nathan | Nathan Mirage Pak | Mirage | current | no | no | yes | Daily Training; 5K; 10K; Half Marathon | yes | yes | yes | published |
| Nathan | Nathan Peak Hydration Waist Pack | Peak | current | no | no | yes | Long Runs; Daily Training; Half Marathon; Marathon | yes | yes | yes | published |
| Nathan | Nathan ZipSter Lite | ZipSter Lite | current | no | no | yes | Daily Training; 5K; 10K; Half Marathon; Beginners | yes | yes | yes | published |
| Salomon | Salomon Pulse Belt | Pulse | current | no | no | yes | Daily Training; Long Runs; Half Marathon; Marathon; 10K | yes | yes | yes | published |
| SPIbelt | SPIbelt Original | Original | current | no | no | yes | Daily Training; Long Runs; Beginners | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Race Belt | Race Belt | current | no | no | yes | Long Runs; Half Marathon; Marathon; 10K; Trail Running | yes | yes | yes | published |
| Ultimate Direction | Ultimate Direction Ultra Belt | Ultra Belt | current | no | no | yes | Long Runs; Ultra; Marathon; Trail Running | yes | yes | yes | published |
| UltrAspire | UltrAspire Fitted Race Belt 3.0 | 3.0 | current | no | no | yes | Daily Training; Beginners; 5K; 10K; Half Marathon | yes | yes | yes | published |

---

## 6. Brand coverage (Running, per category)

### Running Shoes

Products: **84** · Brands: **14**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| ASICS | 12 | 9 | 2 | — |
| Nike | 10 | 8 | 2 | — |
| HOKA | 9 | 7 | 2 | — |
| Saucony | 9 | 7 | 2 | — |
| Brooks | 8 | 6 | 2 | — |
| New Balance | 8 | 6 | 2 | — |
| Adidas | 6 | 6 | 0 | — |
| Altra | 5 | 5 | 0 | — |
| Salomon | 5 | 5 | 0 | — |
| On | 4 | 4 | 0 | — |
| Topo Athletic | 3 | 3 | 0 | — |
| Mizuno | 2 | 2 | 0 | — |
| PUMA | 2 | 2 | 0 | — |
| Inov-8 | 1 | 1 | 0 | — |

### GPS Watches

Products: **33** · Brands: **7**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Garmin | 13 | 9 | 4 | — |
| COROS | 6 | 5 | 1 | — |
| Polar | 4 | 4 | 0 | — |
| Suunto | 4 | 4 | 0 | — |
| Apple | 3 | 2 | 1 | — |
| Amazfit | 2 | 2 | 0 | — |
| Samsung | 1 | 1 | 0 | — |

### Heart Rate Monitors

Products: **15** · Brands: **6**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Garmin | 4 | 3 | 1 | — |
| Wahoo | 4 | 2 | 2 | — |
| Polar | 3 | 3 | 0 | — |
| Scosche | 2 | 2 | 0 | — |
| COROS | 1 | 1 | 0 | only_1_product_from_major_brand |
| Suunto | 1 | 1 | 0 | only_1_product_from_major_brand |

### Running Clothing

Products: **72** · Brands: **19**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Brooks | 10 | 10 | 0 | — |
| Nike | 10 | 10 | 0 | — |
| Patagonia | 8 | 8 | 0 | — |
| Tracksmith | 8 | 8 | 0 | — |
| Craft | 6 | 6 | 0 | — |
| lululemon | 5 | 5 | 0 | — |
| BUFF | 4 | 4 | 0 | — |
| Janji | 4 | 4 | 0 | — |
| On | 3 | 3 | 0 | — |
| Adidas | 2 | 2 | 0 | — |
| ASICS | 2 | 2 | 0 | — |
| Odlo | 2 | 2 | 0 | — |
| Salomon | 2 | 2 | 0 | — |
| Ciele | 1 | 1 | 0 | — |
| New Balance | 1 | 1 | 0 | only_1_product_from_major_brand |
| Rabbit | 1 | 1 | 0 | — |
| SAXX | 1 | 1 | 0 | — |
| Smartwool | 1 | 1 | 0 | — |
| The North Face | 1 | 1 | 0 | — |

### Running Socks

Products: **14** · Brands: **13**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Balega | 2 | 2 | 0 | — |
| Bombas | 1 | 1 | 0 | — |
| CEP | 1 | 1 | 0 | — |
| Darn Tough | 1 | 1 | 0 | — |
| Drymax | 1 | 1 | 0 | — |
| Feetures | 1 | 1 | 0 | — |
| Hilly | 1 | 1 | 0 | — |
| Injinji | 1 | 1 | 0 | — |
| Smartwool | 1 | 1 | 0 | — |
| Sockwell | 1 | 1 | 0 | — |
| Stance | 1 | 1 | 0 | — |
| Swiftwick | 1 | 1 | 0 | — |
| Wrightsock | 1 | 1 | 0 | — |

### Hydration

Products: **19** · Brands: **7**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| HydraPak | 7 | 7 | 0 | — |
| Nathan | 4 | 4 | 0 | — |
| Salomon | 3 | 3 | 0 | — |
| CamelBak | 2 | 2 | 0 | — |
| Amphipod | 1 | 1 | 0 | — |
| Osprey | 1 | 1 | 0 | — |
| Ultimate Direction | 1 | 1 | 0 | — |

### Running Packs & Vests

Products: **42** · Brands: **15**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Osprey | 8 | 8 | 0 | — |
| Salomon | 6 | 6 | 0 | — |
| Ultimate Direction | 6 | 6 | 0 | — |
| CamelBak | 5 | 4 | 1 | — |
| Nathan | 4 | 3 | 1 | — |
| Black Diamond | 3 | 3 | 0 | — |
| UltrAspire | 2 | 2 | 0 | — |
| Compressport | 1 | 1 | 0 | — |
| Decathlon | 1 | 1 | 0 | — |
| LEKI | 1 | 1 | 0 | — |
| NNormal | 1 | 1 | 0 | — |
| On | 1 | 1 | 0 | only_1_product_from_major_brand |
| Patagonia | 1 | 1 | 0 | — |
| RaidLight | 1 | 1 | 0 | — |
| USWE | 1 | 1 | 0 | — |

### Headphones

Products: **17** · Brands: **9**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Shokz | 4 | 4 | 0 | — |
| Apple | 2 | 2 | 0 | — |
| Beats | 2 | 2 | 0 | — |
| Jabra | 2 | 2 | 0 | — |
| Sony | 2 | 2 | 0 | — |
| soundcore | 2 | 2 | 0 | — |
| Bose | 1 | 1 | 0 | — |
| HUAWEI | 1 | 1 | 0 | — |
| Suunto | 1 | 1 | 0 | only_1_product_from_major_brand |

### Sunglasses

Products: **17** · Brands: **8**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Oakley | 5 | 5 | 0 | — |
| Julbo | 3 | 3 | 0 | — |
| goodr | 2 | 2 | 0 | — |
| Smith | 2 | 2 | 0 | — |
| Tifosi | 2 | 2 | 0 | — |
| 100% | 1 | 1 | 0 | — |
| ROKA | 1 | 1 | 0 | — |
| Rudy Project | 1 | 1 | 0 | — |

### Running Lights

Products: **16** · Brands: **7**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Petzl | 4 | 4 | 0 | — |
| Black Diamond | 3 | 3 | 0 | — |
| BioLite | 2 | 2 | 0 | — |
| Ledlenser | 2 | 2 | 0 | — |
| NITECORE | 2 | 2 | 0 | — |
| Silva | 2 | 2 | 0 | — |
| Fenix | 1 | 1 | 0 | — |

### Treadmills

Products: **3** · Brands: **2**
Category flags: `very_small_category`

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Assault Fitness | 2 | 2 | 0 | — |
| Mirafit | 1 | 1 | 0 | — |

### Safety Gear

Products: **14** · Brands: **9**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Amphipod | 3 | 3 | 0 | — |
| Nathan | 3 | 3 | 0 | — |
| Knog | 2 | 2 | 0 | — |
| FlipBelt | 1 | 1 | 0 | — |
| Night Runner | 1 | 1 | 0 | — |
| Nite Ize | 1 | 1 | 0 | — |
| Proviz | 1 | 1 | 0 | — |
| Road ID | 1 | 1 | 0 | — |
| She's Birdie | 1 | 1 | 0 | — |

### Running Belts

Products: **14** · Brands: **11**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Nathan | 3 | 3 | 0 | — |
| Ultimate Direction | 2 | 2 | 0 | — |
| Amphipod | 1 | 1 | 0 | — |
| Compressport | 1 | 1 | 0 | — |
| Decathlon | 1 | 1 | 0 | — |
| Fitletic | 1 | 1 | 0 | — |
| FlipBelt | 1 | 1 | 0 | — |
| Naked | 1 | 1 | 0 | — |
| Salomon | 1 | 1 | 0 | only_1_product_from_major_brand |
| SPIbelt | 1 | 1 | 0 | — |
| UltrAspire | 1 | 1 | 0 | — |

### Recovery

Products: **32** · Brands: **16**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| TriggerPoint | 6 | 6 | 0 | — |
| Hyperice | 5 | 5 | 0 | — |
| Therabody | 5 | 5 | 0 | — |
| OOFOS | 3 | 3 | 0 | — |
| CEP | 2 | 2 | 0 | — |
| 2XU | 1 | 1 | 0 | — |
| BLACKROLL | 1 | 1 | 0 | — |
| Brazyn | 1 | 1 | 0 | — |
| Compressport | 1 | 1 | 0 | — |
| HOKA | 1 | 1 | 0 | only_1_product_from_major_brand |
| OPOVE | 1 | 1 | 0 | — |
| RAD Roller | 1 | 1 | 0 | — |
| RENPHO | 1 | 1 | 0 | — |
| RumbleRoller | 1 | 1 | 0 | — |
| The Stick | 1 | 1 | 0 | — |
| TimTam | 1 | 1 | 0 | — |

### Accessories

Products: **8** · Brands: **7**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Amphipod | 2 | 2 | 0 | — |
| 2Toms | 1 | 1 | 0 | — |
| Body Glide | 1 | 1 | 0 | — |
| Compressport | 1 | 1 | 0 | — |
| Dirty Girl | 1 | 1 | 0 | — |
| Outdoor Research | 1 | 1 | 0 | — |
| Squirrel's Nut Butter | 1 | 1 | 0 | — |

### Nutrition & Fuel

Products: **38** · Brands: **20**
Category flags: none

| Brand | Product count | Current models | Previous generation | Flags |
|---|---:|---:|---:|---|
| Maurten | 5 | 5 | 0 | — |
| GU Energy | 3 | 3 | 0 | — |
| Precision Fuel & Hydration | 3 | 3 | 0 | — |
| Science in Sport | 3 | 3 | 0 | — |
| Clif Bar | 2 | 2 | 0 | — |
| High5 | 2 | 2 | 0 | — |
| Näak | 2 | 2 | 0 | — |
| Neversecond | 2 | 2 | 0 | — |
| SaltStick | 2 | 2 | 0 | — |
| Skratch Labs | 2 | 2 | 0 | — |
| STYRKR | 2 | 2 | 0 | — |
| Veloforte | 2 | 2 | 0 | — |
| 226ERS | 1 | 1 | 0 | — |
| Enervit | 1 | 1 | 0 | — |
| Honey Stinger | 1 | 1 | 0 | — |
| Hüma | 1 | 1 | 0 | — |
| Nuun | 1 | 1 | 0 | — |
| PowerBar | 1 | 1 | 0 | — |
| Spring Energy | 1 | 1 | 0 | — |
| Tailwind | 1 | 1 | 0 | — |

---

## 7. Variant coverage

### Running shoes

| Metric | Count |
|---|---:|
| Products | 84 |
| Products with variants | 84 |
| With men variants | 80 |
| With women variants | 80 |
| With unisex variants | 4 |
| Unknown (no variants) | 0 |
| Missing size data | 0 |
| Missing width data | 7 |
| Missing variant-specific weight | 1 |
| Missing variant media (structural) | 84 |
| Missing variant offers | 84 |

_ProductVariant schema has no media fields; variant-specific media cannot be stored in current model._

### Running clothing

| Metric | Count |
|---|---:|
| Products | 72 |
| Products with variants | 72 |
| With men variants | 45 |
| With women variants | 16 |
| With unisex variants | 11 |
| Unknown (no variants) | 0 |
| Missing size data | 0 |
| Missing width data | 72 |
| Missing variant-specific weight | 72 |
| Missing variant offers | 72 |

### All running products

| Metric | Count |
|---|---:|
| Products | 438 |
| Products with variants | 245 |
| With men variants | 131 |
| With women variants | 100 |
| With unisex variants | 94 |
| Unknown (no variants) | 193 |
| Missing size data | 0 |
| Missing width data | 168 |
| Missing variant-specific weight | 106 |
| Missing variant offers | 245 |

---

## 8. Use-case coverage (Running Shoes)

| Use case | Group | Products | Sparse (0–3)? |
|---|---|---:|---|
| Comfort | goals | 29 | — |
| First 10K | goals | 0 | YES (0) |
| First 5K | goals | 3 | YES (3) |
| First Half Marathon | goals | 0 | YES (0) |
| First Marathon | goals | 0 | YES (0) |
| High Mileage | goals | 5 | — |
| Injury-conscious running | goals | 8 | — |
| PB / PR | goals | 10 | — |
| 10K | racing | 6 | — |
| 5K | racing | 4 | — |
| Half Marathon | racing | 17 | — |
| Marathon | racing | 13 | — |
| Ultra | racing | 8 | — |
| Advanced Runners | runner | 19 | — |
| Beginners | runner | 12 | — |
| Flat Feet | runner | 0 | YES (0) |
| Heavier Runners | runner | 11 | — |
| High Arches | runner | 0 | YES (0) |
| Intermediate Runners | runner | 17 | — |
| Lightweight Runners | runner | 7 | — |
| Narrow Feet | runner | 0 | YES (0) |
| Neutral Runners | runner | 13 | — |
| Overpronators | runner | 5 | — |
| Wide Feet | runner | 14 | — |
| Bright Sun | training | 0 | YES (0) |
| Caffeinated Fuel | training | 0 | YES (0) |
| Commute Running | training | 0 | YES (0) |
| Daily Training | training | 47 | — |
| Drink-Based Fueling | training | 0 | YES (0) |
| Easy Runs | training | 30 | — |
| Easy-to-Carry Fuel | training | 0 | YES (0) |
| Fastpacking | training | 0 | YES (0) |
| Gym / Indoor Training | training | 0 | YES (0) |
| High-Carb Fueling | training | 0 | YES (0) |
| Home Recovery Setup | training | 0 | YES (0) |
| Intervals | training | 3 | YES (3) |
| Long Runs | training | 36 | — |
| Mixed Light | training | 0 | YES (0) |
| Night Running | training | 0 | YES (0) |
| Non-Caffeinated Fuel | training | 0 | YES (0) |
| Post-Run Recovery Tools | training | 0 | YES (0) |
| Rain Running | training | 0 | YES (0) |
| Recovery Runs | training | 7 | — |
| Short Training | training | 0 | YES (0) |
| Situational Awareness | training | 0 | YES (0) |
| Speed Work | training | 4 | — |
| Tempo Runs | training | 15 | — |
| Trail Running | training | 15 | — |
| Travel Recovery Kit | training | 0 | YES (0) |
| Treadmill Running | training | 0 | YES (0) |
| Winter Running | training | 0 | YES (0) |

### Flagged use cases with 0 / 1 / 2 / 3 shoe products

| Use case | Count |
|---|---:|
| First 10K | 0 |
| First 5K | 3 |
| First Half Marathon | 0 |
| First Marathon | 0 |
| Flat Feet | 0 |
| High Arches | 0 |
| Narrow Feet | 0 |
| Bright Sun | 0 |
| Caffeinated Fuel | 0 |
| Commute Running | 0 |
| Drink-Based Fueling | 0 |
| Easy-to-Carry Fuel | 0 |
| Fastpacking | 0 |
| Gym / Indoor Training | 0 |
| High-Carb Fueling | 0 |
| Home Recovery Setup | 0 |
| Intervals | 3 |
| Mixed Light | 0 |
| Night Running | 0 |
| Non-Caffeinated Fuel | 0 |
| Post-Run Recovery Tools | 0 |
| Rain Running | 0 |
| Short Training | 0 |
| Situational Awareness | 0 |
| Travel Recovery Kit | 0 |
| Treadmill Running | 0 |
| Winter Running | 0 |

---

## 9. Product family health

| Check | Count |
|---|---:|
| Duplicate slugs | 0 |
| Duplicate fullNames | 0 |
| Name patterns suggesting gender-split products | 0 |
| Paired men/women separate product candidates | 0 |
| Generation/lifecycle concerns | 14 |
| Orphan variants | 0 |
| Running shoes without familyId | 25 |
| Family.productIds → missing product | 0 |
| Product.familyId → missing family | 2 |

### Running shoes without ProductFamily

- ASICS Example Unpublished Trainer (`prod-draft-example`)
- Brooks Hyperion Max 2 (`prod-hyperion-max-2`)
- HOKA Mach 6 (`prod-mach-6`)
- HOKA Speedgoat 6 (`prod-speedgoat-6`)
- Saucony Peregrine 15 (`prod-peregrine-15`)
- New Balance Fresh Foam X 1080 v14 (`prod-1080-v14`)
- New Balance Fresh Foam X 1080 v13 (`prod-1080-v13`)
- New Balance FuelCell SuperComp Elite v4 (`prod-sc-elite-v4`)
- New Balance FuelCell SuperComp Trainer v3 (`prod-sc-trainer-v3`)
- Adidas Adizero Evo SL (`prod-adizero-evo-sl`)
- Adidas Adizero Adios Pro 4 (`prod-adios-pro-4`)
- On Cloudsurfer Next (`prod-cloudsurfer-next`)
- Altra Torin 8 (`prod-torin-8`)
- Altra Escalante 4 (`prod-escalante-4`)
- Altra Lone Peak 8 (`prod-lone-peak-8`)
- Salomon Aero Glide 2 (`prod-aero-glide-2`)
- Salomon Sense Ride 5 (`prod-sense-ride-5`)
- Salomon Pulsar Trail 2 (`prod-pulsar-trail-2`)
- Topo Athletic Specter 2 (`prod-specter-2`)
- Topo Athletic Phantom 3 (`prod-phantom-3`)
- PUMA Deviate NITRO 3 (`prod-deviate-nitro-3`)
- PUMA Magnify NITRO 2 (`prod-magnify-nitro-2`)
- Mizuno Wave Rider 28 (`prod-wave-rider-28`)
- Mizuno Wave Rebellion Pro 3 (`prod-wave-rebellion-pro-3`)
- Inov8 Trailfly Ultra G 300 Max (`prod-trailfly-ultra-g-300-max`)

### Generation concerns

- Mirafit Folding Treadmill (`prod-mirafit-treadmill`): lifecycle=current but generation string suggests previous
- Fastpack (`prod-ud-fastpack-20,prod-ud-fastpack-her-20`): Family has 2 current products sharing generation "20"
- SiS Beta Fuel (`prod-sis-beta-fuel-gel,prod-sis-beta-fuel-drink`): Family has 2 current products sharing generation "Beta Fuel"
- PF 30 (`prod-precision-pf30-gel,prod-precision-pf30-drink`): Family has 2 current products sharing generation "PF 30"
- Neversecond C30 (`prod-neversecond-c30-gel,prod-neversecond-c30-drink`): Family has 2 current products sharing generation "C30"
- Own the Run (`prod-adidas-own-the-run-short-men,prod-adidas-own-the-run-tee-men`): Family has 2 current products sharing generation "Own the Run"
- Notch Thermal (`prod-brooks-notch-thermal-men,prod-brooks-notch-thermal-beanie`): Family has 2 current products sharing generation "Notch Thermal"
- ADV Essence (`prod-craft-adv-essence-tight-men,prod-craft-adv-essence-light-wind-men,prod-craft-adv-essence-light-wind-vest-men`): Family has 3 current products sharing generation "ADV Essence"
- Miler (`prod-nike-dri-fit-miler-men,prod-nike-dri-fit-miler-women`): Family has 2 current products sharing generation "Miler"
- Active Warm Eco (`prod-odlo-active-warm-eco-men,prod-odlo-active-warm-eco-bottom-men`): Family has 2 current products sharing generation "Active Warm Eco"
- Performance (`prod-on-performance-short-men,prod-on-performance-tight-women`): Family has 2 current products sharing generation "Performance"
- Bonatti (`prod-salomon-bonatti-wp-men,prod-salomon-bonatti-wp-women`): Family has 2 current products sharing generation "Bonatti"
- Brighton (`prod-tracksmith-brighton-ls-men,prod-tracksmith-brighton-bra`): Family has 2 current products sharing generation "Brighton"
- Session (`prod-tracksmith-session-short-men,prod-tracksmith-session-short-women`): Family has 2 current products sharing generation "Session"

---

## 10. Publication status

### All products

| Status | Count |
|---|---:|
| Published | 623 |
| Draft | 90 |
| Scheduled | 0 |
| Review | 4 |
| Archived | 0 |
| Unknown | 0 |
| Future (inferred) | 1 |
| Blocked (inferred: archived\|noindex) | 1 |
| Production-exposed (`isPubliclyVisible` + not noindex) | 623 |
| Not production-exposed | 94 |

### Running products

| Status | Count |
|---|---:|
| Published | 367 |
| Draft | 71 |
| Scheduled | 0 |
| Review | 0 |
| Archived | 0 |
| Unknown | 0 |
| Future (inferred) | 1 |
| Blocked (inferred) | 1 |
| Production-exposed | 367 |
| Not production-exposed | 71 |

### Running shoes

| Status | Count |
|---|---:|
| Published | 83 |
| Draft | 1 |
| Scheduled | 0 |
| Review | 0 |
| Archived | 0 |
| Unknown | 0 |
| Future (inferred) | 1 |
| Blocked (inferred) | 1 |
| Production-exposed | 83 |
| Not production-exposed | 1 |

Production resolver: `isPubliclyVisible` in production requires `status=published` AND `publishedAt <= now`. Scheduled never leaks even if `scheduledFor` is past. `getProducts()` additionally excludes `noindex`.

---

## 11. Raw URL inventory (product URLs)

| Classification | Count |
|---|---:|
| Total product URLs | 717 |
| Indexable | 623 |
| Noindex | 1 |
| 404 (prod resolver would not resolve) | 0 |
| Future/draft protected | 93 |
| Unknown | 0 |

### Running-only product URLs

| Classification | Count |
|---|---:|
| Total | 438 |
| Indexable | 367 |
| Noindex | 1 |
| 404 | 0 |
| Future/draft protected | 70 |
| Unknown | 0 |

- generateStaticParams uses getProducts() which applies production publication resolver + filters noindex — so only indexable/production-visible products are statically generated in production builds.
- Draft/scheduled/review products 404 via getProductBySlug in production (isPubliclyVisible).
- Preview route /preview/products/[slug] exists and is noindex.
- Audit clock fixed at 2026-09-06T12:00:00.000Z for reproducibility.

---

## 12. Data completeness summary (Running categories)

| Category | Products | Identity % | Specs % | Variant % | Media % | Offers % | Use cases % | Relationships % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Running Shoes | 84 | 100 | 98.8 | 100 | 98.8 | 72.6 | 98.8 | 98.8 |
| GPS Watches | 33 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Heart Rate Monitors | 15 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Running Clothing | 72 | 100 | 94.4 | 100 | 79.2 | 100 | 100 | 100 |
| Running Socks | 14 | 100 | 100 | 100 | 71.4 | 100 | 100 | 100 |
| Hydration | 19 | 100 | 100 | 100 | 89.5 | 100 | 100 | 100 |
| Running Packs & Vests | 42 | 100 | 100 | 100 | 83.3 | 100 | 100 | 100 |
| Headphones | 17 | 100 | 100 | 100 | 64.7 | 100 | 100 | 100 |
| Sunglasses | 17 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Running Lights | 16 | 100 | 100 | 100 | 56.3 | 100 | 100 | 100 |
| Treadmills | 3 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Safety Gear | 14 | 100 | 100 | 100 | 42.9 | 100 | 100 | 100 |
| Running Belts | 14 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Recovery | 32 | 100 | 100 | 100 | 50 | 100 | 100 | 100 |
| Accessories | 8 | 100 | 100 | 100 | 37.5 | 100 | 100 | 100 |
| Nutrition & Fuel | 38 | 100 | 92.1 | 100 | 100 | 100 | 100 | 100 |

Counts behind percentages (identity / specs / variant / media / offers / useCases / relationships):

- **Running Shoes** (n=84): 84/84, 83/84, 84/84, 83/84, 61/84, 83/84, 83/84
- **GPS Watches** (n=33): 33/33, 33/33, 33/33, 33/33, 33/33, 33/33, 33/33
- **Heart Rate Monitors** (n=15): 15/15, 15/15, 15/15, 15/15, 15/15, 15/15, 15/15
- **Running Clothing** (n=72): 72/72, 68/72, 72/72, 57/72, 72/72, 72/72, 72/72
- **Running Socks** (n=14): 14/14, 14/14, 14/14, 10/14, 14/14, 14/14, 14/14
- **Hydration** (n=19): 19/19, 19/19, 19/19, 17/19, 19/19, 19/19, 19/19
- **Running Packs & Vests** (n=42): 42/42, 42/42, 42/42, 35/42, 42/42, 42/42, 42/42
- **Headphones** (n=17): 17/17, 17/17, 17/17, 11/17, 17/17, 17/17, 17/17
- **Sunglasses** (n=17): 17/17, 17/17, 17/17, 17/17, 17/17, 17/17, 17/17
- **Running Lights** (n=16): 16/16, 16/16, 16/16, 9/16, 16/16, 16/16, 16/16
- **Treadmills** (n=3): 3/3, 3/3, 3/3, 3/3, 3/3, 3/3, 3/3
- **Safety Gear** (n=14): 14/14, 14/14, 14/14, 6/14, 14/14, 14/14, 14/14
- **Running Belts** (n=14): 14/14, 14/14, 14/14, 14/14, 14/14, 14/14, 14/14
- **Recovery** (n=32): 32/32, 32/32, 32/32, 16/32, 32/32, 32/32, 32/32
- **Accessories** (n=8): 8/8, 8/8, 8/8, 3/8, 8/8, 8/8, 8/8
- **Nutrition & Fuel** (n=38): 38/38, 35/38, 38/38, 38/38, 38/38, 38/38, 38/38

---

## 14. Final section

### WHAT EXISTS

| Item | Count |
|---|---:|
| sports | 21 |
| disciplines | 59 |
| activities | 0 |
| categories | 47 |
| subcategories | 82 |
| brands | 191 |
| productFamilies | 308 |
| products | 717 |
| productVariants | 325 |
| useCases | 80 |
| offers | 1271 |
| retailers | 11 |
| reviews | 590 |
| runningProducts | 438 |
| runningShoes | 84 |
| runningCategoriesWithProducts | 16 |

### WHAT IS PARTIALLY POPULATED

- **Running Clothing**: media 79.2%
- **Running Socks**: media 71.4%
- **Headphones**: media 64.7%
- **Running Lights**: media 56.3%
- **Safety Gear**: media 42.9%
- **Recovery**: media 50%
- **Accessories**: media 37.5%


### WHAT IS EMPTY

- Activities count: **0**
- Empty running categories: none
- Missing expected other-running labels: none
- Running-shoe use cases with 0 products: **25** (full list in JSON / §8)

### WHAT CANNOT BE DETERMINED

- Activities: repository getActivities() returns empty array; taxonomy activities file may be absent or empty — count reported from rawActivities import.
- Variant-specific media: ProductVariant has no media field in schema — cannot measure variant media completeness beyond structural absence.
- Whether disk hero files exist for every registered media path was not filesystem-verified in this inventory (uses in-memory media resolution only).
- External market coverage gaps intentionally not researched.
- Offer price freshness / retailer stock accuracy not verified against live retailer APIs.
- 'Blocked' is inferred as archived OR noindex — there is no explicit blocked publication status in publishStatusSchema.
- 'Future' mixes scheduled publish status, upcoming lifecycle, and future scheduledFor — not a first-class status enum value.

### DATA INTEGRITY CONCERNS

- Running shoes without familyId: 25
- Products with missing familyId target: 2
- Generation/lifecycle concerns: 14
- Test fixture draft product present: prod-draft-example (noindex).
- getProducts() filters noindex AND applies publication resolver — inventory below uses raw+enriched ALL products unless noted.

---

## End of baseline

No fixes recommended in this document. This is measurement only.
