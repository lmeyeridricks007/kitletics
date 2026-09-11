"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CompareProductIndexItem } from "@/lib/comparison/product-index";
import type {
  ManualOwnedShoe,
  RotationMode,
  RotationPriority,
  RotationResponses,
  RotationSizeChoice,
} from "@/domain/shoe-rotation/types";
import type { RotationRoleId } from "@/domain/shoe-rotation/roles";
import { MAX_OWNED_SHOES, ROLE_BY_ID, ROTATION_ROLES } from "@/domain/shoe-rotation/roles";
import {
  getBudgetBands,
  PRIORITY_OPTIONS,
  ROTATION_PRESETS,
  TRAINING_OPTIONS,
} from "@/domain/shoe-rotation/normalization";
import { encodeRotationShareStateBrowser, trackRotationEvent } from "@/domain/shoe-rotation/share-state";
import { ProductSearchSelector } from "@/components/compare/ProductSearchSelector";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { DEFAULT_REGION } from "@/domain/shared/types";

type Phase = "intro" | "questions" | "summary";

export function RotationFlow({
  productIndex,
  initialResponses,
  startAtSummary = false,
  preselectOwnedId,
}: {
  productIndex: CompareProductIndexItem[];
  initialResponses?: Partial<RotationResponses>;
  startAtSummary?: boolean;
  preselectOwnedId?: string;
}) {
  const router = useRouter();
  const budgets = getBudgetBands(DEFAULT_REGION);

  const [responses, setResponses] = useState<RotationResponses>(() => ({
    mode: initialResponses?.mode ?? "from-scratch",
    trainingTypes: initialResponses?.trainingTypes ?? [],
    weeklyFrequency: initialResponses?.weeklyFrequency,
    weeklyDistance: initialResponses?.weeklyDistance,
    raceDistances: initialResponses?.raceDistances ?? [],
    terrain: initialResponses?.terrain ?? "road",
    priorities: initialResponses?.priorities ?? [],
    budgetBandId: initialResponses?.budgetBandId ?? "no-limit",
    desiredSize: initialResponses?.desiredSize ?? "recommend",
    maxAdditions: initialResponses?.maxAdditions ?? "recommend",
    ownedProductIds: initialResponses?.ownedProductIds ?? (preselectOwnedId ? [preselectOwnedId] : []),
    manualShoes: initialResponses?.manualShoes ?? [],
    roleOverrides: initialResponses?.roleOverrides,
  }));

  const [phase, setPhase] = useState<Phase>(startAtSummary ? "summary" : "intro");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string>();
  const [showManual, setShowManual] = useState(false);
  const [manualLabel, setManualLabel] = useState("");
  const [manualRoles, setManualRoles] = useState<RotationRoleId[]>([]);

  const steps = useMemo(() => {
    const list: string[] = ["mode"];
    if (responses.mode === "improve") list.push("owned");
    list.push("training", "frequency", "terrain");
    if (responses.trainingTypes.includes("racing")) list.push("races");
    list.push("priorities", "budget", "size");
    return list;
  }, [responses.mode, responses.trainingTypes]);

  const current = steps[step] ?? "mode";

  function patch(p: Partial<RotationResponses>) {
    setResponses((prev) => ({ ...prev, ...p }));
    setError(undefined);
  }

  function start(mode?: RotationMode) {
    if (mode) patch({ mode });
    setPhase("questions");
    setStep(0);
    trackRotationEvent("rotation_planner_started", { mode: mode ?? responses.mode });
  }

  function applyPreset(id: string) {
    const preset = ROTATION_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setResponses((prev) => ({
      ...prev,
      ...preset.patch,
      ownedProductIds: prev.ownedProductIds,
      manualShoes: prev.manualShoes,
    }));
    setPhase("questions");
    setStep(0);
  }

  function canContinue(): boolean {
    if (current === "mode") return true;
    if (current === "owned") {
      return (
        responses.ownedProductIds.length > 0 ||
        responses.manualShoes.length > 0
      );
    }
    if (current === "training") return responses.trainingTypes.length > 0;
    if (current === "priorities") return responses.priorities.length > 0;
    if (current === "budget") return Boolean(responses.budgetBandId);
    return true;
  }

  function next() {
    if (!canContinue()) {
      setError("Please complete this step to continue.");
      return;
    }
    if (step >= steps.length - 1) {
      setPhase("summary");
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    if (phase === "summary") {
      setPhase("questions");
      setStep(steps.length - 1);
      return;
    }
    if (step === 0) {
      setPhase("intro");
      return;
    }
    setStep((s) => s - 1);
  }

  function seeResults() {
    const encoded = encodeRotationShareStateBrowser(responses);
    trackRotationEvent("rotation_completed", { mode: responses.mode });
    router.push(
      `/tools/shoe-rotation-planner/results?s=${encodeURIComponent(encoded)}`,
    );
  }

  function addOwned(item: CompareProductIndexItem) {
    if (responses.ownedProductIds.length >= MAX_OWNED_SHOES) return;
    if (responses.ownedProductIds.includes(item.id)) return;
    patch({ ownedProductIds: [...responses.ownedProductIds, item.id] });
    trackRotationEvent("rotation_owned_product_added", { productId: item.id });
  }

  function removeOwned(id: string) {
    patch({
      ownedProductIds: responses.ownedProductIds.filter((x) => x !== id),
    });
  }

  function addManual() {
    if (!manualLabel.trim() || manualRoles.length === 0) {
      setError("Name your shoe and pick at least one role.");
      return;
    }
    const shoe: ManualOwnedShoe = {
      id: `manual-${Date.now()}`,
      label: manualLabel.trim(),
      roleIds: manualRoles,
    };
    patch({ manualShoes: [...responses.manualShoes, shoe] });
    setManualLabel("");
    setManualRoles([]);
    setShowManual(false);
  }

  if (phase === "intro") {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
            Shoe Rotation Planner
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Build the right running shoe rotation
          </h1>
          <p className="mt-4 text-muted">
            Tell us how you train and which shoes you already own. We&apos;ll show
            which roles your shoes cover, where there are gaps, and what to add
            next.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" size="lg" onClick={() => start("from-scratch")}>
              Build My Rotation
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => start("improve")}
            >
              Improve shoes I own
            </Button>
          </div>
          <p className="mt-6 text-xs text-subtle">
            Different shoes can be useful for different types of running because
            their designs prioritize different characteristics.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">
            Quick starts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROTATION_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className="rounded-lg border border-border px-3 py-2 text-left text-xs hover:border-accent"
              >
                <span className="font-medium">{p.label}</span>
                <span className="mt-0.5 block text-subtle">{p.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-border bg-surface p-6 text-left">
          <h2 className="font-display text-lg font-semibold">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>We identify the types of running you need to cover.</li>
            <li>We score how well each shoe fits those roles.</li>
            <li>We look at how the shoes work together as a set.</li>
            <li>
              We prefer combinations that cover more of your needs with less
              unnecessary overlap.
            </li>
            <li>Budget and priorities influence the result.</li>
          </ol>
          <p className="mt-4 text-xs text-subtle">
            Affiliate commission does not affect rotation rankings.
          </p>
        </div>
      </Container>
    );
  }

  if (phase === "summary") {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-xl space-y-6">
          <h2 className="font-display text-2xl font-semibold">Your inputs</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              Mode:{" "}
              {responses.mode === "improve"
                ? "Improve existing"
                : "From scratch"}
            </li>
            <li>Training: {responses.trainingTypes.join(", ") || "—"}</li>
            <li>Terrain: {responses.terrain}</li>
            <li>Priorities: {responses.priorities.join(", ")}</li>
            <li>
              Size: {responses.desiredSize === "recommend" ? "Recommend for me" : responses.desiredSize}
            </li>
            {responses.ownedProductIds.length > 0 && (
              <li>Owned catalog shoes: {responses.ownedProductIds.length}</li>
            )}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={seeResults}>
              See my rotation
            </Button>
            <Button type="button" variant="ghost" onClick={back}>
              Back
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">
            Step {step + 1}
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-valuenow={Math.round(((step + 1) / steps.length) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress"
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        {current === "mode" && (
          <ChoiceBlock
            title="What do you want to do?"
            options={[
              { value: "from-scratch", label: "Build a rotation from scratch" },
              { value: "improve", label: "Improve the shoes I already own" },
            ]}
            value={responses.mode}
            onChange={(v) => patch({ mode: v as RotationMode })}
          />
        )}

        {current === "owned" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">
              Which shoes do you currently use?
            </h2>
            <p className="text-sm text-muted">
              Add up to {MAX_OWNED_SHOES} shoes from the Kitletics catalog.
            </p>
            <ProductSearchSelector
              index={productIndex}
              categoryId="cat-running-shoes"
              excludeSlugs={productIndex
                .filter((i) => responses.ownedProductIds.includes(i.id))
                .map((i) => i.slug)}
              label="Search running shoes"
              onSelect={addOwned}
            />
            <ul className="space-y-2">
              {responses.ownedProductIds.map((id) => {
                const item = productIndex.find((i) => i.id === id);
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {item?.brandName} {item?.name}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-accent"
                      onClick={() => removeOwned(id)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
              {responses.manualShoes.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {m.label}{" "}
                    <span className="text-xs text-subtle">(Manual shoe)</span>
                  </span>
                  <button
                    type="button"
                    className="text-xs text-accent"
                    onClick={() =>
                      patch({
                        manualShoes: responses.manualShoes.filter(
                          (x) => x.id !== m.id,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            {!showManual ? (
              <button
                type="button"
                className="text-sm font-medium text-accent"
                onClick={() => setShowManual(true)}
              >
                My shoe isn&apos;t listed
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <label className="block text-sm font-medium" htmlFor="manual-name">
                  Shoe name
                </label>
                <input
                  id="manual-name"
                  value={manualLabel}
                  onChange={(e) => setManualLabel(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                />
                <p className="text-sm font-medium">What do you mainly use it for?</p>
                <div className="flex flex-wrap gap-2">
                  {ROTATION_ROLES.map((r) => {
                    const selected = manualRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          setManualRoles((prev) =>
                            selected
                              ? prev.filter((x) => x !== r.id)
                              : [...prev, r.id],
                          )
                        }
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs",
                          selected
                            ? "border-accent bg-accent/10"
                            : "border-border",
                        )}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                <Button type="button" size="sm" onClick={addManual}>
                  Add manual shoe
                </Button>
              </div>
            )}
          </div>
        )}

        {current === "training" && (
          <MultiChoice
            title="What types of running do you do?"
            options={TRAINING_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            values={responses.trainingTypes}
            onChange={(trainingTypes) => patch({ trainingTypes })}
          />
        )}

        {current === "frequency" && (
          <ChoiceBlock
            title="How many times do you typically run each week?"
            options={[
              { value: "1-2", label: "1–2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
              { value: "6+", label: "6+" },
            ]}
            value={responses.weeklyFrequency ?? ""}
            onChange={(v) =>
              patch({
                weeklyFrequency: v as RotationResponses["weeklyFrequency"],
              })
            }
          />
        )}

        {current === "terrain" && (
          <ChoiceBlock
            title="Where do you run?"
            options={[
              { value: "road", label: "Road" },
              { value: "trail", label: "Trail" },
              { value: "both", label: "Both" },
              { value: "treadmill", label: "Treadmill" },
            ]}
            value={responses.terrain ?? "road"}
            onChange={(v) =>
              patch({ terrain: v as RotationResponses["terrain"] })
            }
          />
        )}

        {current === "races" && (
          <MultiChoice
            title="What races matter to you?"
            options={[
              { value: "5k", label: "5K" },
              { value: "10k", label: "10K" },
              { value: "half", label: "Half Marathon" },
              { value: "marathon", label: "Marathon" },
              { value: "ultra", label: "Ultra" },
            ]}
            values={responses.raceDistances ?? []}
            onChange={(raceDistances) => patch({ raceDistances })}
          />
        )}

        {current === "priorities" && (
          <MultiChoice
            title="What matters most in your rotation?"
            description="Choose up to 3."
            max={3}
            options={PRIORITY_OPTIONS}
            values={responses.priorities}
            onChange={(priorities) =>
              patch({ priorities: priorities as RotationPriority[] })
            }
          />
        )}

        {current === "budget" && (
          <ChoiceBlock
            title={
              responses.mode === "improve"
                ? "What's your budget for adding shoes?"
                : "What's your budget for the rotation?"
            }
            options={budgets.map((b) => ({ value: b.id, label: b.label }))}
            value={responses.budgetBandId ?? "no-limit"}
            onChange={(v) => patch({ budgetBandId: v })}
          />
        )}

        {current === "size" && (
          <div className="space-y-6">
            {responses.mode === "from-scratch" ? (
              <ChoiceBlock
                title="How many shoes do you want?"
                options={[
                  { value: "1", label: "1 shoe" },
                  { value: "2", label: "2 shoes" },
                  { value: "3", label: "3 shoes" },
                  { value: "4", label: "4 shoes" },
                  { value: "recommend", label: "Recommend for me" },
                ]}
                value={String(responses.desiredSize ?? "recommend")}
                onChange={(v) =>
                  patch({
                    desiredSize:
                      v === "recommend"
                        ? "recommend"
                        : (Number(v) as RotationSizeChoice),
                  })
                }
              />
            ) : (
              <ChoiceBlock
                title="How many shoes are you willing to add?"
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                  { value: "recommend", label: "Recommend for me" },
                ]}
                value={String(responses.maxAdditions ?? "recommend")}
                onChange={(v) =>
                  patch({
                    maxAdditions:
                      v === "recommend"
                        ? "recommend"
                        : (Number(v) as 1 | 2 | 3),
                  })
                }
              />
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={back}>
            Back
          </Button>
          <Button type="button" className="ml-auto" onClick={next}>
            {step >= steps.length - 1 ? "Review" : "Continue"}
          </Button>
        </div>
      </div>
    </Container>
  );
}

function ChoiceBlock({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-2xl font-semibold">{title}</legend>
      <div className="grid gap-2" role="radiogroup" aria-label={title}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium",
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/60",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function MultiChoice({
  title,
  description,
  options,
  values,
  onChange,
  max,
}: {
  title: string;
  description?: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-2xl font-semibold">{title}</legend>
      {description && <p className="text-sm text-muted">{description}</p>}
      <div className="grid gap-2" role="group" aria-label={title}>
        {options.map((opt) => {
          const selected = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (selected) {
                  onChange(values.filter((v) => v !== opt.value));
                } else if (!max || values.length < max) {
                  onChange([...values, opt.value]);
                }
              }}
              className={cn(
                "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium",
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/60",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// silence unused import warning if ROLE_BY_ID unused in this file
void ROLE_BY_ID;
