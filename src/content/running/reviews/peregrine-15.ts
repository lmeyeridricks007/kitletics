import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;

/** Deep Expert Research review — overrides thin backfill entry by slug (first match wins). */
export const peregrine15Review: Review = {
  id: "review-peregrine-15",
  slug: "saucony-peregrine-15",
  productId: "prod-peregrine-15",
  title: "Saucony Peregrine 15 Review",
  subtitle:
    "An aggressive-lug trail trainer built for technical singletrack and mud — not long road connectors.",
  reviewType: "expert-research",
  bottomLine:
    "Aggressive-lug trail trainer for technical singletrack and muddy conditions. I'd shortlist it when you want confident muddy grip. Skip it if most of your week is long road connectors.",
  verdict:
    "The Saucony Peregrine 15 is a trail shoe for technical singletrack and mud. I'd shortlist it for confident muddy grip and a protective rock plate without a rigid carbon setup. The trade-off is long road connectors — skip it if pavement is most of your week.",
  score: 83,
  summary:
    "Aggressive-lug trail trainer for technical singletrack and muddy conditions. I'd shortlist it when you want confident muddy grip. Skip it if most of your week is long road connectors.",
  reviewerId: "author-kitletics-editorial",
  testingContext:
    "We put this guide together from published specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.",
  editorialDisclosure:
    "No brand-supplied product or sponsored testing applied to this review. Affiliate availability does not affect scores or verdict.",
  sections: [
    {
      id: "sec-overview",
      heading: "What it is",
      body: "Peregrine 15 sits in Saucony’s trail lineup as a training shoe for technical dirt, mud and mixed singletrack — not a road daily with optional gravel capability.\n\nIn-catalog strengths call out confident muddy grip and a protective rock-plate feel without a rigid plate. That combination targets runners who want bite and underfoot security on soft or uneven trail, while accepting that aggressive tread and protective geometry are a compromise on long stretches of pavement.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/products/peregrine-15-hero.jpg",
        alt: "Saucony Peregrine 15 trail running shoe",
        caption: "Peregrine 15 — aggressive-lug trail trainer under review.",
      },
    },
    {
      id: "sec-verified-specs",
      heading: "Verified design & specs",
      body: "Published measurements used in this assessment:\n• Weight ~275 g\n• Drop 4 mm\n• Heel stack 31 mm · Forefoot stack 27 mm\n• Cushion level: medium · Feel: balanced\n• Stability: mild-stability\n• Terrain: trail\n• Grip class: aggressive-trail\n• Widths: standard, wide\n• Midsole: PWRRUN · Outsole: PWRTRAC · Upper: reinforced mesh\n• Plate: none (protective geometry without a rigid plate)\n\nThese establish what Peregrine 15 is designed to be. They do not, by themselves, prove comfort, durability or subjective ride quality — those require wear evidence we do not claim here.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/reviews/review-verified-specs-flatlay.jpg",
        alt: "Trail shoe flat-lay with ruler for stack and geometry context",
        caption: "Stack, drop and geometry are verified anchors for this review.",
      },
    },
    {
      id: "sec-strengths",
      heading: "Where it is strongest",
      body: "I'd buy the Saucony Peregrine 15 when these outcomes match what you need most weeks:\n\nWhat it does well\n• Confident muddy grip\n• Protective rock plate feel without a rigid plate\n\nThe standout is confident muddy grip. If that is your main weekly need, keep going. If not, check trade-offs and alternatives.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/reviews/review-trail-muddy-grip.jpg",
        alt: "Trail shoe lugs biting into wet muddy singletrack",
        caption: "Muddy and soft trail is where aggressive lugs justify themselves.",
      },
    },
    {
      id: "sec-fit",
      heading: "Fit",
      body: "Catalog width options include standard and wide — useful for trail runners who need volume without guessing a different brand’s last.\n\nTrail fit priorities differ from road dailies: secure midfoot and heel lockdown matter on descents and cambers, while toe room helps on long downhill sections. Treat sizing as “confirm in person with trail socks” rather than a guaranteed true-to-size claim. Mild-stability geometry can also change how the shoe holds the foot versus a fully neutral trail last.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/reviews/review-shoe-fit-lockdown.jpg",
        alt: "Runner tightening trail-shoe laces for midfoot lockdown",
        caption: "Lockdown and volume matter as much as length on trail.",
      },
    },
    {
      id: "sec-cushioning",
      heading: "Cushioning",
      body: "Verified positioning is medium cushioning with a balanced feel and PWRRUN midsole naming — not a max-stack soft road shoe transplanted onto trail lugs.\n\nAt 31/27 mm stack with a 4 mm drop, the platform aims to protect on uneven ground while keeping geometry closer to trail control than plush road isolation. Documented trade-offs note it can feel firm on hardpack; runners seeking HOKA-like soft trail stack may prefer a higher-cushion trail alternative.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/reviews/review-midsole-cushion-stack.jpg",
        alt: "Cutaway view of running-shoe midsole foam and heel stack",
        caption: "Medium stack targets trail protection without max-cushion softness.",
      },
    },
    {
      id: "sec-ride",
      heading: "Ride",
      body: "Catalog ride character is listed as protective, with moderate energy return and a flexible platform — language that matches a technical trail trainer more than a road rocker daily.\n\nExpect the outsole and protective geometry to dominate the experience on soft or rocky trail. On long hardpack or gravel connectors, the same design can feel busier and firmer than a road-to-trail shoe. We do not invent cadence or “snappy” feel claims beyond that design intent.",
      evidenceIds: [...ev],
      image: {
        src: "/images/watches/guides/gps-forest-trail-running.jpg",
        alt: "Runner moving through dense forest trail under canopy",
        caption: "Ride character shows up over continuous trail miles.",
      },
    },
    {
      id: "sec-stability",
      heading: "Stability",
      body: "Peregrine 15 is catalogued as mild-stability rather than fully neutral or max-guidance.\n\nOn trail, “stability” often means planted contact and secure lockdown on cambers and descents as much as medial posting. Mild-stability geometry suits runners who want a touch more guidance than a pure neutral trail shoe without moving into a heavy support model. Confirm how that geometry feels under your own gait — especially if you are coming from a soft neutral road trainer.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/reviews/review-trail-stability-descent.jpg",
        alt: "Trail runner descending a rocky technical path",
        caption: "Trail stability is about control on uneven ground.",
      },
    },
    {
      id: "sec-tradeoffs",
      heading: "Trade-offs",
      body: "Choose something else when these matter more than Peregrine 15’s strengths:\n• Long road or bike-path connectors between trail segments\n• Soft, plush ride on hardpack fire roads\n• A single shoe that must also be your road daily\n\nAggressive lugs and protective trail geometry are the point of this shoe — and the reason it is a poor default for mixed-pavement weeks. Road-to-trail models or a dedicated road daily in the rotation usually solve those weeks better.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/reviews/review-trail-vs-road-surfaces.jpg",
        alt: "Muddy forest trail beside smooth asphalt showing surface trade-offs",
        caption: "Trail tools often compromise on long paved connectors.",
      },
    },
    {
      id: "sec-use-cases",
      heading: "Performance by use case",
      body: "• Trail training / technical singletrack — strongest fit. Aggressive grip and protective intent align with muddy and rooted routes.\n• Long trail days / ultra-style trail — plausible when you want underfoot protection and traction; confirm cushion preference for your distance.\n• Mixed road + trail commuting — weak fit. Documented weakness on long road connectors argues for a second shoe or a road-to-trail model.\n• Pure road racing or road dailies — outside the design brief.\n\nStructured recommendation scoring supports it most as a versatile trail trainer when trail surfaces dominate.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/category/use-trail.jpg",
        alt: "Trail runner on a rolling dirt path through open countryside",
        caption: "Best when trail surfaces dominate the week.",
      },
    },
    {
      id: "sec-value",
      heading: "Value & positioning",
      body: "Value depends on whether you will use aggressive trail traction often enough to justify a dedicated trail trainer in the category price band.\n\nCurrent street pricing belongs in the offers module — it is not a static claim in this verdict. Prefer Peregrine 15 when muddy/technical trail is a weekly need and the road-connector trade-off is acceptable. If you only hit soft trails occasionally, a more versatile road-to-trail shoe or waiting on a discounted prior generation may be better value. Compare linked alternatives (Speedgoat, Pulsar Trail, Lone Peak, Sense Ride) when cushion bias or brand last differs from what you want.",
      evidenceIds: [...ev],
      image: {
        src: "/images/running/guides/trail-shoe-outsole-compare.jpg",
        alt: "Trail shoe outsole with deep multidirectional lugs",
        caption: "You are paying for trail-specific outsole and protection — use them.",
      },
    },
  ],
  pros: [
    "Confident muddy / soft-trail grip story",
    "Protective underfoot feel without a rigid plate",
    "Medium cushion trail platform with 4 mm drop",
    "Mild-stability geometry for guided trail contact",
    "Standard and wide width options in catalog",
  ],
  cons: [
    "Not ideal on long road connectors",
    "Can feel firm on hardpack",
    "Trail-specific — poor as a sole road daily",
  ],
  whoShouldBuy: [
      "You want confident muddy grip and will rotate or compare against Speedgoat 6 — that is the Peregrine 15's main job",
      "Most of your sessions match protective rock plate feel without a rigid plate more than a do-everything compromise",
      "You need trail-specific grip and protection and are happy keeping pavement miles in a separate road shoe",
    ],
    whoShouldAvoid: [
      "You need not ideal on long road connectors — look at Speedgoat 6 or a clearer specialist instead of forcing the Peregrine 15",
      "Your must-haves conflict with a Peregrine 15 trade-off: can feel firm on hardpack",
      "Your week is mostly smooth pavement connectors — a road daily will usually feel more appropriate",
    ],
  scoreBreakdown: [
    { key: "grip", label: "Grip", score: 92, max: 100, note: "Aggressive trail" },
    { key: "cushioning", label: "Cushioning", score: 78, max: 100, note: "Medium / can feel firm" },
    { key: "stability", label: "Stability", score: 82, max: 100, note: "Mild-stability" },
    { key: "ride", label: "Ride", score: 80, max: 100, note: "Protective trail" },
    { key: "fit", label: "Fit options", score: 84, max: 100, note: "Standard + wide" },
    { key: "versatility", label: "Versatility", score: 72, max: 100, note: "Trail-focused" },
    { key: "durability", label: "Durability", score: 84, max: 100, note: "Research estimate" },
    { key: "value", label: "Value", score: 82, max: 100 },
  ],
  evidenceIds: [...ev],
  alternativeProductIds: [
    "prod-speedgoat-6",
    "prod-pulsar-trail-2",
    "prod-lone-peak-8",
    "prod-sense-ride-5",
  ],
  comparisonIds: ["cmp-speedgoat-peregrine"],
  faqIds: [],
  seoTitle: "Saucony Peregrine 15 Review: Trail Grip, Fit & Verdict | Kitletics",
  seoDescription:
    "Expert research review of the Saucony Peregrine 15 — trail grip, specs, fit, trade-offs, use cases, alternatives and current prices.",
  ...pub,
};
