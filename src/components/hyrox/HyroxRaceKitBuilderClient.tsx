"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { RaceKitProfile, RaceKitRole, RaceKitResult } from "@/domain/hyrox/race-kit";
import { buildHyroxRaceKitAction } from "@/lib/hyrox/race-kit-action";
import { cn } from "@/lib/utils";

export function HyroxRaceKitBuilderClient() {
  const [pending, startTransition] = useTransition();
  const [runningStrength, setRunningStrength] =
    useState<RaceKitProfile["runningStrength"]>("balanced");
  const [priority, setPriority] =
    useState<RaceKitProfile["priority"]>("versatility");
  const [budget, setBudget] = useState(400);
  const [experience, setExperience] =
    useState<RaceKitProfile["experience"]>("intermediate");
  const [trainLocation, setTrainLocation] =
    useState<RaceKitProfile["trainLocation"]>("mixed");
  const [ownedRoles, setOwnedRoles] = useState<RaceKitRole[]>([]);
  const [result, setResult] = useState<RaceKitResult | null>(null);

  function toggleOwned(role: RaceKitRole) {
    setOwnedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void buildHyroxRaceKitAction({
        experience,
        runningStrength,
        priority,
        budgetEur: budget,
        budgetMode: "strict",
        ownedProductIds: [],
        ownedRoles,
        needCompleteKit: false,
        trainLocation,
      }).then(setResult);
    });
  }

  return (
    <div className="bg-mesh">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "HYROX Race Kit Builder" },
          ]}
          className="mb-8"
        />
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          HYROX Race Kit Builder
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Assemble race-day essentials — shoes first — without padding the kit
          with unnecessary accessories.
        </p>

        <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-5">
          <label className="text-sm">
            Running strength
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={runningStrength}
              onChange={(e) =>
                setRunningStrength(
                  e.target.value as RaceKitProfile["runningStrength"],
                )
              }
            >
              <option value="strong">Running is one of my strengths</option>
              <option value="balanced">Balanced runner</option>
              <option value="developing">
                Running is something I&apos;m working on
              </option>
            </select>
          </label>
          <label className="text-sm">
            Priority
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as RaceKitProfile["priority"])
              }
            >
              <option value="speed">Running speed</option>
              <option value="stability">Station stability</option>
              <option value="versatility">One-shoe versatility</option>
              <option value="value">Value</option>
            </select>
          </label>
          <label className="text-sm">
            Experience
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value as RaceKitProfile["experience"])
              }
            >
              <option value="beginner">First HYROX</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="text-sm">
            Where do you train?
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={trainLocation}
              onChange={(e) =>
                setTrainLocation(
                  e.target.value as RaceKitProfile["trainLocation"],
                )
              }
            >
              <option value="commercial-gym">Commercial / HYROX gym</option>
              <option value="home">Home primarily</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="text-sm">
            Budget (€)
            <input
              type="number"
              min={100}
              max={2000}
              step={50}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Already own</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  "FOOTWEAR",
                  "BOTTOM",
                  "TOP",
                  "SOCKS",
                  "TIMING",
                ] as RaceKitRole[]
              ).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleOwned(role)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs capitalize",
                    ownedRoles.includes(role)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border",
                  )}
                >
                  {role.replaceAll("_", " ").toLowerCase()}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            {pending ? "Building…" : "Build my race kit"}
          </button>
        </form>

        {result && (
          <section className="mt-12 space-y-6">
            <header>
              <h2 className="font-display text-2xl font-semibold">
                {result.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                Essential {result.essentialCount} · Useful/optional{" "}
                {result.optionalCount} · Already own {result.ownedCount} · New
                spend €{Math.round(result.totalNewSpend)}
                {result.unknownPriceCount > 0 &&
                  ` · ${result.unknownPriceCount} price unavailable`}
              </p>
            </header>
            <ul className="divide-y divide-border">
              {result.items.map((i) => (
                <li
                  key={`${i.role}-${i.productId}`}
                  className="flex flex-wrap justify-between gap-2 py-4 text-sm"
                >
                  <div>
                    <p className="text-xs tracking-wide text-muted uppercase">
                      {i.tier} · {i.role}
                    </p>
                    <p className="font-medium">{i.productName}</p>
                    <p className="text-muted">{i.rationale}</p>
                  </div>
                  <p>
                    {i.existing
                      ? "Owned"
                      : i.estimatedPrice != null
                        ? `€${i.estimatedPrice}`
                        : "Price TBA"}
                  </p>
                </li>
              ))}
            </ul>
            {result.explanations.map((e, idx) => (
              <p key={idx} className="text-sm text-muted">
                {e}
              </p>
            ))}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/hyrox-shoe-finder"
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Refine shoes
              </Link>
              <Link
                href="/tools/home-gym-builder"
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                HYROX home gym
              </Link>
              <Link
                href="/fitness/hyrox"
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                HYROX hub
              </Link>
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
