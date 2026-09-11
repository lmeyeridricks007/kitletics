import {
  Armchair,
  Footprints,
  Gauge,
  Scale,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import type { GuideLookForFactor } from "@/domain/editorial/types";

const FACTOR_ICONS: Record<string, LucideIcon> = {
  comfort: Armchair,
  cushioning: Armchair,
  stability: Shield,
  weight: Scale,
  fit: Footprints,
  versatility: Gauge,
  paceVersatility: Gauge,
  durability: Sparkles,
  officialWidths: Footprints,
  forefootFit: Footprints,
  upperVolume: Footprints,
  responsiveness: Gauge,
  energyReturn: Sparkles,
  grip: Footprints,
  battery: Gauge,
  gps: Gauge,
  pacing: Gauge,
  ride: Gauge,
  fitForPurpose: Sparkles,
  tradeoffs: Scale,
};

function importanceLabel(level?: "high" | "medium" | "low") {
  if (level === "high") return "Especially important";
  if (level === "medium") return "Also matters";
  if (level === "low") return "Secondary";
  return undefined;
}

export function BestGuideWhatWeLookFor({
  data,
}: {
  data: BestGuidePageData;
}) {
  const factors: GuideLookForFactor[] =
    data.guide.whatWeLookFor?.length
      ? data.guide.whatWeLookFor
      : data.contextConfig.factors.map((f) => ({
          key: f.key,
          label: f.label,
          whyItMatters: f.whyItMatters,
          importance: f.importance,
        }));

  if (factors.length === 0) return null;

  const intro =
    data.guide.whatMattersIntro ?? data.contextConfig.whatMattersFallback;
  const contextLabel = data.primaryUseCase?.name ?? data.contextConfig.label;
  const noun = (data.config.productNoun ?? "product").replace(/s$/i, "") || "product";
  const headingSubject = formatGuideSubject(contextLabel, noun);

  return (
    <section className="border-b border-border bg-surface py-8">
      <Container size="wide">
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase">
          Criteria
        </p>
        <h2 className="mt-2 heading-section">
          What makes a good {headingSubject}?
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          {intro}
        </p>

        <h3 className="mt-8 text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
          What we look for in a {headingSubject}
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {factors.slice(0, 6).map((factor) => {
            const Icon = FACTOR_ICONS[factor.key] ?? Sparkles;
            const imp = importanceLabel(factor.importance);
            const high = factor.importance === "high";
            return (
              <li
                key={factor.key}
                className={`border bg-surface px-4 py-4 ${
                  high ? "border-accent/60 bg-accent-muted/40" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center ${
                      high
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface-muted text-accent-ink"
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      {factor.label}
                    </p>
                    {imp && (
                      <p
                        className={`mt-1 inline-flex text-[10px] font-bold tracking-wide uppercase ${
                          high
                            ? "bg-accent px-1.5 py-0.5 text-accent-foreground"
                            : "text-accent-ink"
                        }`}
                      >
                        {imp}
                      </p>
                    )}
                    <p className="mt-1.5 text-[13px] leading-snug text-muted">
                      {factor.whyItMatters}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/** “Beginners” + “Running Shoe” → “beginner running shoe” */
function formatGuideSubject(contextLabel: string, noun: string): string {
  const label = contextLabel.trim().toLowerCase();
  const singularNoun = noun.trim().toLowerCase();

  const adjectiveForms: Record<string, string> = {
    beginners: "beginner",
    "first-time runners": "first-time runner",
    "long runs": "long-run",
    "wide feet": "wide-foot",
    "daily trainers": "daily trainer",
    "tempo / workouts": "tempo",
    "race / speed": "race",
    "marathon training": "marathon-training",
    "gps watches": "GPS watch",
  };

  if (adjectiveForms[label]) {
    return `${adjectiveForms[label]} ${singularNoun}`;
  }

  // Single plural word → singular adjective (“overpronators” stays as-is if odd)
  if (/^[a-z]+s$/.test(label) && !label.endsWith("ss")) {
    return `${label.slice(0, -1)} ${singularNoun}`;
  }

  return `${label} ${singularNoun}`;
}
