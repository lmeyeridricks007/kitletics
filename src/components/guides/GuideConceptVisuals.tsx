/**
 * Educational concept visuals for explainer guides.
 * Prefer photorealistic instructional photos; keep SVG for abstract UI concepts.
 */

import type { ReactNode } from "react";
import Image from "next/image";
import {
  Battery,
  Compass,
  HeartPulse,
  Map,
  Radio,
  Shield,
  Smartphone,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExplainerDiagramVariant } from "@/lib/guides/explainer-blocks";

export type ConceptDiagramVariant = ExplainerDiagramVariant;

const FACTOR_ICONS: Record<string, LucideIcon> = {
  gps: Radio,
  battery: Battery,
  maps: Map,
  navigation: Compass,
  "heart-rate": HeartPulse,
  heartrate: HeartPulse,
  heart: HeartPulse,
  training: Watch,
  metrics: Watch,
  durability: Shield,
  fit: Shield,
  display: Smartphone,
  phone: Smartphone,
};

export function factorIconForId(id: string): LucideIcon {
  const key = id.toLowerCase();
  for (const [k, icon] of Object.entries(FACTOR_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return Watch;
}

const CONCEPT_PHOTOS: Partial<
  Record<
    ExplainerDiagramVariant,
    { src: string; alt: string; aspect?: string }
  >
> = {
  "heel-to-toe-drop": {
    src: "/images/running/guides/concepts/heel-to-toe-drop-compare.jpg",
    alt: "Side-profile comparison of a zero-drop running shoe and a 10 mm drop shoe with stack and drop labels",
  },
  "drop-buckets": {
    src: "/images/running/guides/concepts/drop-buckets-spectrum.jpg",
    alt: "Four running shoes showing zero, low, medium and high heel-to-toe drop ranges",
  },
  "drop-feel": {
    src: "/images/running/guides/concepts/drop-feel-stride.jpg",
    alt: "Runner mid-stride illustrating how shoe geometry can change felt load",
  },
  "drop-factors": {
    src: "/images/running/guides/concepts/drop-factors-system.jpg",
    alt: "Four-panel diagram of stack, rocker, foam and plate factors that change drop feel",
  },
  "drop-geometry-matrix": {
    src: "/images/running/guides/concepts/drop-geometry-matrix.jpg",
    alt: "Four running shoes illustrating different drop and cushion geometry packages",
  },
  "drop-tradeoffs": {
    src: "/images/running/guides/concepts/drop-tradeoffs-balance.jpg",
    alt: "Balance scale comparing flatter zero-drop geometry with a raised-heel shoe",
  },
  "drop-transition": {
    src: "/images/running/guides/concepts/drop-transition-gradual.jpg",
    alt: "Three shoes showing a gradual transition from high drop to low drop",
  },
  "drop-decision": {
    src: "/images/running/guides/concepts/drop-decision-checklist.jpg",
    alt: "Checklist beside two running shoes for deciding drop and geometry",
  },
  "drop-mistakes": {
    src: "/images/running/guides/concepts/drop-mistakes-warning.jpg",
    alt: "Warning visual that drop alone does not make a shoe better",
  },
  "cushion-stack": {
    src: "/images/running/guides/concepts/cushion-stack-compare.jpg",
    alt: "Side-profile comparison of a firm lower-stack trainer and a plush higher-stack cushioned shoe",
  },
  "foam-compression": {
    src: "/images/running/guides/concepts/foam-compression-dynamic.jpg",
    alt: "Running shoe midsole compressing under load to show dynamic foam behaviour",
  },
  "stack-measurement": {
    src: "/images/running/guides/concepts/stack-measurement-ruler.jpg",
    alt: "Measuring heel stack height on a running shoe midsole cutaway",
  },
  "foam-soft-vs-firm": {
    src: "/images/running/guides/concepts/foam-soft-vs-firm.jpg",
    alt: "Soft plush midsole compared with a firmer responsive midsole",
  },
  "carbon-vs-nylon": {
    src: "/images/running/guides/concepts/carbon-vs-nylon-plate.jpg",
    alt: "Cutaway comparison of a carbon-plated racing shoe and a nylon-plated shoe",
  },
  "plate-stiffness": {
    src: "/images/running/guides/concepts/plate-stiffness-bend.jpg",
    alt: "Stiff carbon-plated racing shoe resisting bend",
  },
  "plate-flex": {
    src: "/images/running/guides/concepts/plate-flex-vs-stiff.jpg",
    alt: "Flexible nylon-plated trainer compared with a stiffer race shoe",
  },
  "rocker-geometry": {
    src: "/images/running/guides/concepts/rocker-geometry-side.jpg",
    alt: "Side profile of a rockered running shoe with an arrow showing forward roll through stance",
  },
  "shoe-rotation": {
    src: "/images/running/guides/concepts/shoe-rotation-flatlay.jpg",
    alt: "Flat lay of a shoe rotation with daily, tempo, race and trail pairs",
  },
  "rotation-week": {
    src: "/images/running/guides/concepts/rotation-week-plan.jpg",
    alt: "Weekly training plan with different shoes assigned to easy, tempo and long sessions",
  },
  "daily-trainer": {
    src: "/images/running/guides/concepts/daily-trainer-hero.jpg",
    alt: "Daily trainer running shoe in three-quarter view for easy training miles",
  },
  "easy-miles": {
    src: "/images/running/guides/concepts/easy-miles-lifestyle.jpg",
    alt: "Runner on an easy recovery jog in cushioned daily trainers",
  },
  "tempo-session": {
    src: "/images/running/guides/concepts/tempo-session-track.jpg",
    alt: "Athlete running a tempo interval on a track in lightweight shoes",
  },
  "road-trail-surfaces": {
    src: "/images/running/guides/concepts/road-vs-trail-surfaces.jpg",
    alt: "Split view of road asphalt under a road shoe and rocky trail under a trail shoe",
  },
  "trail-lugs": {
    src: "/images/running/guides/concepts/trail-lugs-macro.jpg",
    alt: "Macro close-up of deep trail shoe lugs",
  },
  "road-outsole": {
    src: "/images/running/guides/concepts/road-outsole-macro.jpg",
    alt: "Macro close-up of a smooth road running shoe outsole",
  },
  "neutral-vs-stability": {
    src: "/images/running/guides/concepts/neutral-vs-stability-midsole.jpg",
    alt: "Comparison of a neutral midsole platform and a stability midsole with guidance structures",
  },
  "stability-guidance": {
    src: "/images/running/guides/concepts/stability-guidance-closeup.jpg",
    alt: "Close-up of a stability shoe medial guidance structure",
  },
  "base-width": {
    src: "/images/running/guides/concepts/base-width-overhead.jpg",
    alt: "Overhead comparison of a narrower midsole platform and a wider base",
  },
  "comparing-shoes": {
    src: "/images/running/guides/concepts/comparing-two-shoes.jpg",
    alt: "Runner comparing two running shoes side by side",
  },
  "decision-steps": {
    src: "/images/running/guides/concepts/decision-three-steps.jpg",
    alt: "Three-step decision flow for choosing shoe geometry",
  },
  "mistakes-notes": {
    src: "/images/running/guides/concepts/mistakes-sticky-notes.jpg",
    alt: "Caution sticky notes about common shoe-buying mistakes",
  },
  "product-shortlist": {
    src: "/images/running/guides/concepts/product-shortlist-shelf.jpg",
    alt: "Shortlist of running shoes tagged as picks on a shelf",
  },
  "open-ear-vs-inear": {
    src: "/images/gear/guides/concepts/open-ear-vs-inear.jpg",
    alt: "Open-ear headphones next to sealed in-ear sport earbuds",
  },
  "hrm-chest-vs-wrist": {
    src: "/images/gear/guides/concepts/hrm-chest-vs-wrist.jpg",
    alt: "Chest-strap heart rate monitor next to a wrist optical heart rate watch",
  },
  "cross-training-shoe": {
    src: "/images/training/guides/concepts/cross-training-shoe-gym.jpg",
    alt: "Cross-training shoe on a gym floor beside training equipment",
  },
  "gps-watch-run": {
    src: "/images/watches/guides/concepts/gps-watch-wrist-run.jpg",
    alt: "GPS running watch on a runner’s wrist during a road run",
  },
  "vest-vs-belt": {
    src: "/images/packs/products/nathan-vaporair-2-hero.png",
    alt: "Running hydration vest illustrating torso carry versus a belt",
  },
  "hydration-vest": {
    src: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    alt: "Salomon ADV Skin running hydration vest with soft flasks",
  },
  "running-belt": {
    src: "/images/running/accessories/flipbelt-classic-hero.jpg",
    alt: "Minimal running belt for phone, keys and light fuel",
  },
  "soft-flask": {
    src: "/images/hydration/products/hydrapak-softflask-speed-500-hero.jpg",
    alt: "Soft flask used in running hydration vests",
  },
  "handheld-bottle": {
    src: "/images/hydration/products/nathan-exoshot-2-hero.jpg",
    alt: "Handheld running bottle with strap",
  },
  "running-headlamp": {
    src: "/images/headlamps/products/petzl-swift-rl-hero.jpg",
    alt: "Petzl Swift RL running headlamp",
  },
  "running-socks": {
    src: "/images/running/accessories/feetures-elite-light-cushion-hero.jpg",
    alt: "Performance running socks with cushion zones",
  },
  "running-jacket": {
    // Authentic Cascadia jacket packshot not in catalog yet — clothing category mark, not shoe art.
    src: "/images/catalog/fallbacks/clothing.svg",
    alt: "Running jacket / weather layer (category illustration)",
  },
  "fuel-gels": {
    src: "/images/running/accessories/flipbelt-classic-hero.jpg",
    alt: "Running belt used to carry gels and light fuel",
  },
  "massage-gun": {
    src: "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
    alt: "Compact massage gun for post-run soft-tissue work",
  },
  "recovery-sandal": {
    src: "/images/running/accessories/oofos-ooriginal-hero.jpg",
    alt: "Recovery sandal for easy walking after hard runs",
  },
};

export function ConceptDiagram({
  variant,
  caption,
}: {
  variant: ConceptDiagramVariant;
  caption: string;
}) {
  let body: ReactNode;
  let photoBleed = false;

  const photo = CONCEPT_PHOTOS[variant];
  if (photo) {
    body = <ConceptPhoto src={photo.src} alt={photo.alt} />;
    photoBleed = true;
  } else {
    switch (variant) {
      case "amoled-vs-mip":
        body = <AmoledVsMipDiagram />;
        break;
      case "breadcrumb-vs-maps":
        body = <BreadcrumbVsMapsDiagram />;
        break;
      case "gps-signal":
        body = <GpsSignalPhotoCompare />;
        photoBleed = true;
        break;
      case "road-vs-trail":
        body = <RoadVsTrailPhotoCompare />;
        photoBleed = true;
        break;
      case "phone-vs-watch":
        body = <PhoneVsWatchDiagram />;
        break;
      case "platform-width":
        body = <PlatformWidthInline />;
        break;
      default:
        body = null;
    }
  }

  if (!body) return null;

  return (
    <figure className="mt-5 overflow-hidden border border-border bg-[#fafaf8]">
      <div
        className={cn(photoBleed ? "p-0" : "p-4 sm:p-5")}
        role="img"
        aria-label={caption}
      >
        {body}
      </div>
      <figcaption className="border-t border-border px-4 py-2.5 text-[12px] text-muted sm:px-5">
        {caption}
      </figcaption>
    </figure>
  );
}

function ConceptPhoto({ src, alt }: { src: string; alt: string }) {
  // Native aspect — instructional overlays sit near edges; object-cover + fixed
  // 16:9 was clipping labels and diagram tops on 3:2 concept assets.
  return (
    <div className="w-full bg-surface-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- preserve intrinsic aspect; next/image object-fit clipped overlays */}
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function LookForPanels({
  panels,
}: {
  panels: {
    id: string;
    title: string;
    checks: string[];
    accent?: string;
  }[];
}) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {panels.map((panel) => {
        const Icon = factorIconForId(panel.id);
        return (
          <li
            key={panel.id}
            className="border border-border bg-white px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-surface-muted/50 text-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">
                  Look for
                </p>
                <p className="mt-1 text-[14px] font-bold text-foreground">
                  {panel.title}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {panel.checks.map((c) => (
                    <li
                      key={c}
                      className="flex gap-2 text-[13px] leading-snug text-muted"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                        aria-hidden
                      />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function AmoledVsMipDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          AMOLED
        </p>
        <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
          <rect x="55" y="18" width="110" height="104" rx="18" fill="#111" />
          <rect x="66" y="32" width="88" height="66" rx="6" fill="#0a2a1a" />
          <text
            x="110"
            y="58"
            textAnchor="middle"
            fill="#b8f000"
            fontSize="18"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="700"
          >
            5:12
          </text>
          <text
            x="110"
            y="78"
            textAnchor="middle"
            fill="#8fbf6a"
            fontSize="10"
            fontFamily="ui-sans-serif, system-ui"
          >
            /km
          </text>
          <circle cx="110" cy="108" r="3" fill="#333" />
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Bright, high-contrast screen. Great indoors and for rich graphics;
          brightness and always-on drain battery faster.
        </p>
      </div>
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          MIP (memory-in-pixel)
        </p>
        <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
          <rect x="55" y="18" width="110" height="104" rx="18" fill="#d8d6cf" />
          <rect x="66" y="32" width="88" height="66" rx="6" fill="#eceae3" />
          <text
            x="110"
            y="58"
            textAnchor="middle"
            fill="#1a1a1a"
            fontSize="18"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="700"
          >
            5:12
          </text>
          <text
            x="110"
            y="78"
            textAnchor="middle"
            fill="#555"
            fontSize="10"
            fontFamily="ui-sans-serif, system-ui"
          >
            /km
          </text>
          <circle cx="110" cy="108" r="3" fill="#999" />
          <g stroke="#c4a35a" strokeWidth="1.5">
            <line x1="178" y1="28" x2="192" y2="18" />
            <line x1="182" y1="40" x2="198" y2="40" />
            <line x1="178" y1="52" x2="192" y2="62" />
          </g>
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Reflective display that stays readable in bright sun with low power.
          Less “phone-like”, often paired with buttons.
        </p>
      </div>
    </div>
  );
}

function BreadcrumbVsMapsDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          Breadcrumb route
        </p>
        <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
          <rect x="10" y="10" width="200" height="120" rx="4" fill="#f3f2ee" />
          <path
            d="M40 100 C70 90, 90 50, 120 55 C150 60, 160 90, 190 70"
            fill="none"
            stroke="#111"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="40" cy="100" r="5" fill="#b8f000" stroke="#111" strokeWidth="1.5" />
          <circle cx="190" cy="70" r="5" fill="#111" />
          <text x="20" y="28" fill="#888" fontSize="9" fontFamily="ui-sans-serif, system-ui">
            Line only · limited context
          </text>
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Follow a planned line and turn prompts. Fine on known roads; weak when
          trails fork with no surrounding map.
        </p>
      </div>
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          Full offline maps
        </p>
        <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
          <rect x="10" y="10" width="200" height="120" rx="4" fill="#e8efe4" />
          <path d="M30 110 L70 80 L110 95 L150 50 L190 65" fill="none" stroke="#9bb58a" strokeWidth="2" />
          <path d="M50 30 L90 55 L130 40 L170 75" fill="none" stroke="#9bb58a" strokeWidth="2" />
          <path d="M25 60 L95 70 L160 100" fill="none" stroke="#c5d4bc" strokeWidth="1.5" />
          <path
            d="M40 100 C70 90, 90 50, 120 55 C150 60, 160 90, 190 70"
            fill="none"
            stroke="#111"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="40" cy="100" r="5" fill="#b8f000" stroke="#111" strokeWidth="1.5" />
          <text x="20" y="28" fill="#5a6b52" fontSize="9" fontFamily="ui-sans-serif, system-ui">
            Roads · trails · landmarks
          </text>
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Surrounding cartography helps at junctions and when you leave the
          planned track. Confirm offline maps and route import before you buy.
        </p>
      </div>
    </div>
  );
}

const GPS_SCENE_PHOTOS = [
  {
    src: "/images/watches/guides/gps-open-sky-running.jpg",
    label: "Open sky",
    note: "Clear sky view — standard GNSS is often enough for clean tracks and pace.",
    alt: "Runner on an open coastal path under clear sky with a GPS watch on their wrist",
  },
  {
    src: "/images/watches/guides/gps-urban-canyon-running.jpg",
    label: "Urban canyon",
    note: "Tall buildings reflect and block signals — multi-band GNSS can help, at a battery cost.",
    alt: "Runner in a city street between tall buildings wearing a GPS running watch",
  },
  {
    src: "/images/watches/guides/gps-forest-trail-running.jpg",
    label: "Dense forest",
    note: "Tree canopy restricts sky view. Harder reception is where multi-band earns its keep.",
    alt: "Trail runner under dense forest canopy with a GPS watch on their wrist",
  },
] as const;

function GpsSignalPhotoCompare() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-3">
      {GPS_SCENE_PHOTOS.map((photo) => (
        <div key={photo.src} className="bg-[#fafaf8]">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <span className="absolute top-2.5 left-2.5 rounded-[3px] bg-charcoal-950/85 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              {photo.label}
            </span>
          </div>
          <p className="px-3 py-2.5 text-[12px] leading-snug text-muted sm:px-3.5">
            {photo.note}
          </p>
        </div>
      ))}
    </div>
  );
}

const ROAD_VS_TRAIL_PHOTOS = [
  {
    src: "/images/running/guides/road-shoe-outsole-compare.jpg",
    label: "Road",
    note: "Flatter tread and road rubber for pavement — lighter geometry, less aggressive grip.",
    alt: "Road running shoe angled to show a smooth outsole with shallow flex grooves",
  },
  {
    src: "/images/running/guides/trail-shoe-outsole-compare.jpg",
    label: "Trail",
    note: "Deeper multidirectional lugs and a more planted base for dirt, rock and uneven ground.",
    alt: "Trail running shoe angled to show deep lugged outsole and protective construction",
  },
] as const;

function RoadVsTrailPhotoCompare() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {ROAD_VS_TRAIL_PHOTOS.map((photo) => (
        <div key={photo.src} className="bg-[#fafaf8]">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <span className="absolute top-2.5 left-2.5 rounded-[3px] bg-charcoal-950/85 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              {photo.label}
            </span>
          </div>
          <p className="px-3 py-2.5 text-[12px] leading-snug text-muted sm:px-3.5">
            {photo.note}
          </p>
        </div>
      ))}
    </div>
  );
}

function PhoneVsWatchDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          Phone in hand / pocket
        </p>
        <svg viewBox="0 0 160 140" className="mx-auto mt-3 w-28" aria-hidden>
          <rect x="45" y="10" width="70" height="120" rx="10" fill="#111" />
          <rect x="52" y="22" width="56" height="90" rx="4" fill="#2a2a2a" />
          <circle cx="80" cy="120" r="4" fill="#444" />
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Fine for a post-run log. Awkward for live pace, wet weather and long
          GPS sessions shared with calls and music.
        </p>
      </div>
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          Wrist GPS watch
        </p>
        <svg viewBox="0 0 160 140" className="mx-auto mt-3 w-36" aria-hidden>
          <rect x="20" y="55" width="30" height="18" rx="3" fill="#333" />
          <rect x="110" y="55" width="30" height="18" rx="3" fill="#333" />
          <rect x="50" y="35" width="60" height="58" rx="12" fill="#111" />
          <rect x="58" y="45" width="44" height="32" rx="4" fill="#1a3310" />
          <text
            x="80"
            y="66"
            textAnchor="middle"
            fill="#b8f000"
            fontSize="11"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="700"
          >
            5:12
          </text>
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Glanceable fields, workout controls and continuous GPS without digging
          for a phone mid-interval.
        </p>
      </div>
    </div>
  );
}

/** Kept as SVG fallback when a section truly needs base-width abstraction only. */
function PlatformWidthInline() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide uppercase text-subtle">
          Narrower platform
        </p>
        <svg viewBox="0 0 280 100" className="mt-3 w-full" aria-hidden>
          <ellipse cx="140" cy="55" rx="70" ry="22" fill="#e8e8e4" stroke="#bbb" />
          <text x="140" y="90" textAnchor="middle" fontSize="11" fill="#666">
            Quicker feel · less planted
          </text>
        </svg>
      </div>
      <div className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-wide uppercase text-subtle">
          Wider base
        </p>
        <svg viewBox="0 0 280 100" className="mt-3 w-full" aria-hidden>
          <ellipse cx="140" cy="55" rx="110" ry="26" fill="#d4d4ce" stroke="#aaa" />
          <text x="140" y="90" textAnchor="middle" fontSize="11" fill="#666">
            More planted · often more stable
          </text>
        </svg>
      </div>
    </div>
  );
}
