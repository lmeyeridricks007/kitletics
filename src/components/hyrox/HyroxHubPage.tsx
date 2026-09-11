import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Section } from "@/components/layout/Section";
import { getCurrentHyroxSinglesFormat } from "@/content/hyrox/competition";
import { loadForDivision } from "@/domain/competition/types";

const START_CARDS = [
  {
    title: "I need race shoes",
    href: "/tools/hyrox-shoe-finder",
    description: "Balance running speed with station stability.",
  },
  {
    title: "I need training shoes",
    href: "/tools/hyrox-shoe-finder",
    description: "Session footwear for gym + run volume.",
  },
  {
    title: "I'm building a race kit",
    href: "/tools/hyrox-race-kit-builder",
    description: "Essentials only — shoes, timing, optional HR.",
  },
  {
    title: "I'm training at home",
    href: "/tools/home-gym-builder",
    description: "HYROX-aware Home Gym Builder with open-space logic.",
  },
  {
    title: "I need a watch / HR monitor",
    href: "/best/heart-rate-monitors-running",
    description: "Reuse running HR guidance with HYROX movement context.",
  },
  {
    title: "I want to plan my race",
    href: "/tools/hyrox-race-time-calculator",
    description: "Arithmetic race plan from your assumed splits.",
  },
];

const STATIONS = [
  {
    name: "SkiErg",
    gear: "SkiErg + floor stand or wall mount",
    href: "/guides/rowerg-vs-skierg-for-hyrox-training",
  },
  {
    name: "Sled Push",
    gear: "Training sled — surface dependent; home runway often unrealistic",
    href: "/guides/how-to-choose-a-hyrox-training-sled",
  },
  {
    name: "Sled Pull",
    gear: "Sled + rope/harness — training equivalent ≠ race friction",
    href: "/guides/how-to-choose-a-hyrox-training-sled",
  },
  {
    name: "Burpee Broad Jumps",
    gear: "Open floor space — no special product required",
    href: "/setups/hyrox-home-conditioning",
  },
  {
    name: "Row",
    gear: "RowErg / magnetic rower",
    href: "/guides/rowerg-vs-skierg-for-hyrox-training",
  },
  {
    name: "Farmers Carry",
    gear: "Kettlebells or farmer handles (race uses competition KBs)",
    href: "/fitness/functional-fitness",
  },
  {
    name: "Sandbag Lunges",
    gear: "Training sandbag — confirm load vs division",
    href: "/guides/hyrox-home-training-setup",
  },
  {
    name: "Wall Balls",
    gear: "Wall ball + suitable target height",
    href: "/guides/hyrox-home-training-setup",
  },
];

export function HyroxHubPage() {
  const format = getCurrentHyroxSinglesFormat();
  const menOpenSled = loadForDivision(
    format.stations.find((s) => s.type === "sled-push")!,
    "men-open",
  );

  return (
    <div className="bg-mesh">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Fitness", href: "/fitness" },
            { label: "HYROX" },
          ]}
          className="mb-8"
        />

        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted">
            HYROX GEAR
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
            Find the right gear for training and race day.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Compare race shoes, training equipment, watches, heart-rate monitors
            and complete HYROX setups — without race news or coaching spam.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools/hyrox-shoe-finder"
              className="rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background"
            >
              Find My HYROX Shoes
            </Link>
            <Link
              href="/tools/hyrox-race-kit-builder"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium"
            >
              Build My Race Kit
            </Link>
            <Link
              href="/gear?sport=fitness"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium text-muted"
            >
              Explore HYROX Gear
            </Link>
            <Link
              href="/tools/hyrox-race-time-calculator"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium text-muted"
            >
              Estimate My Race Time
            </Link>
          </div>
        </header>

        <Section eyebrow="Start here" title="How do you want to decide?">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {START_CARDS.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-xl border border-border bg-background/60 p-5 transition hover:border-accent"
              >
                <p className="font-display text-lg font-semibold">{c.title}</p>
                <p className="mt-2 text-sm text-muted">{c.description}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          muted
          eyebrow="Tools"
          title="HYROX decision tools"
          description="Finders, builders and race planning — product decisions first."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                href: "/tools/hyrox-shoe-finder",
                title: "HYROX Shoe Finder",
                body: "Race vs training · run vs station priorities.",
              },
              {
                href: "/tools/hyrox-race-kit-builder",
                title: "Race Kit Builder",
                body: "Essential kit around what you already own.",
              },
              {
                href: "/tools/hyrox-race-time-calculator",
                title: "Race Time Calculator",
                body: "Split arithmetic from CompetitionFormat Season 26/27.",
              },
              {
                href: "/tools/home-gym-builder?goal=hyrox",
                title: "Home Gym Builder · HYROX",
                body: "Space, sled realism and open training zone.",
              },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-xl border border-border p-5 hover:border-accent"
              >
                <p className="font-medium">{t.title}</p>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Stations"
          title="Gear by station"
          description="Official competition loads differ by division. Training equipment is often an equivalent — not identical friction or hardware."
        >
          <div className="mb-6 rounded-xl border border-border bg-background/50 p-4 text-sm text-muted">
            <p>
              Current singles format ({format.seasonLabel}): 8×1 km run + 8
              stations. Example Men Open sled push:{" "}
              <strong className="text-foreground">
                {menOpenSled?.loadKg ?? "—"} kg incl. sled
              </strong>{" "}
              (rulebook). Last verified {format.lastVerifiedAt.slice(0, 10)}.
            </p>
            <Link
              href="/guides/hyrox-equipment-standards"
              className="mt-2 inline-block text-accent hover:underline"
            >
              Equipment standards guide
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {STATIONS.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                className="rounded-lg border border-border px-4 py-3 hover:border-accent"
              >
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-sm text-muted">{s.gear}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                  Official · Training · Home alternative — see guides
                </p>
              </Link>
            ))}
          </div>
        </Section>

        <Section muted eyebrow="Guides" title="Best picks & buying guides">
          <ul className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              ["/best/hyrox-shoes", "Best HYROX Shoes"],
              [
                "/guides/hyrox-race-shoes-vs-training-shoes",
                "Race shoes vs training shoes",
              ],
              ["/guides/how-to-choose-hyrox-shoes", "How to choose HYROX shoes"],
              [
                "/guides/rowerg-vs-skierg-for-hyrox-training",
                "RowErg vs SkiErg",
              ],
              [
                "/guides/how-to-choose-a-hyrox-training-sled",
                "How to choose a training sled",
              ],
              [
                "/guides/hyrox-race-day-gear-checklist",
                "Race-day gear checklist",
              ],
              ["/setups/hyrox-race-day-kit", "Race-day kit setup"],
              ["/setups/hyrox-home-conditioning", "Home conditioning setup"],
              ["/setups/first-hyrox-setup", "First HYROX setup"],
              [
                "/guides/what-gear-do-you-need-for-hyrox",
                "What gear do you need?",
              ],
              [
                "/guides/how-to-build-a-hyrox-home-gym",
                "How to build a HYROX home gym",
              ],
              [
                "/guides/how-to-choose-a-hyrox-watch",
                "How to choose a HYROX watch",
              ],
              [
                "/guides/hyrox-heart-rate-monitor",
                "Chest strap vs wrist HR",
              ],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-accent hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          eyebrow="Methodology"
          title="How we recommend HYROX gear"
          description="Affiliate commission does not affect rankings. Official partnership claims require evidence. We do not invent sled-push scores or promise faster finish times from a shoe purchase."
        >
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/guides/how-to-choose-hyrox-shoes" className="text-accent hover:underline">
              Shoe buying methodology
            </Link>
            <Link href="/fitness" className="text-accent hover:underline">
              Fitness & Training hub
            </Link>
            <Link href="/running" className="text-accent hover:underline">
              Running hub
            </Link>
          </div>
        </Section>
      </Container>
    </div>
  );
}
