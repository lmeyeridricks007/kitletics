"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  runAdvancedHomeGymBuilder,
  createRectangularRoom,
  exercisesForGoals,
  type AdvancedBuilderProfile,
  type AdvancedBuildResult,
  type BuilderMode,
  type BuildDepth,
  type HomeGymGoal,
  type PriorityId,
  type SpendStyle,
} from "@/domain/builders/home-gym";
import { ROOM_PRESETS } from "@/domain/room-planner/room";
import type { ExerciseId } from "@/domain/room-planner/exercises";
import type {
  MountingAnswer,
  NoiseImportance,
  RotationDeg,
} from "@/domain/room-planner/types";
import {
  autoArrange,
  validatePlacementMove,
} from "@/domain/room-planner/layout";
import {
  encodeBuildShare,
  decodeBuildShare,
  LOCAL_GYMS_KEY,
  LOCAL_ROOM_KEY,
  type SavedGymLocal,
  type SharedBuildV1,
  BUILD_SHARE_VERSION,
} from "@/domain/room-planner/share";
import { formatLength } from "@/domain/room-planner/units";
import type { Product } from "@/domain/products/types";
import type { Offer } from "@/domain/commerce/types";
import { cn } from "@/lib/utils";

const RoomPlannerCanvas = dynamic(
  () =>
    import("@/components/builders/RoomPlannerCanvas").then(
      (m) => m.RoomPlannerCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted">
        Loading room planner…
      </div>
    ),
  },
);

const GOAL_OPTIONS: { value: HomeGymGoal; label: string }[] = [
  { value: "general-fitness", label: "General fitness" },
  { value: "strength", label: "Strength" },
  { value: "powerlifting", label: "Powerlifting" },
  { value: "bodybuilding", label: "Bodybuilding" },
  { value: "functional-fitness", label: "Functional fitness" },
  { value: "hyrox", label: "HYROX" },
  { value: "calisthenics", label: "Calisthenics" },
  { value: "conditioning", label: "Conditioning" },
  { value: "mixed", label: "Mixed" },
];

const PRIORITY_OPTIONS: { value: PriorityId; label: string }[] = [
  { value: "performance", label: "Performance" },
  { value: "value", label: "Value" },
  { value: "small-footprint", label: "Small footprint" },
  { value: "open-space", label: "Open space" },
  { value: "versatility", label: "Versatility" },
  { value: "heavy-lifting", label: "Heavy lifting" },
  { value: "quiet", label: "Quiet" },
  { value: "easy-storage", label: "Easy storage" },
  { value: "future-expansion", label: "Future expansion" },
  { value: "premium", label: "Premium equipment" },
];

const STEPS = [
  "Space",
  "Train",
  "Priorities",
  "Owned",
  "Budget",
  "Result",
] as const;

type Step = (typeof STEPS)[number];

export function HomeGymBuilderClient({
  products,
  offers,
}: {
  /** Published fitness catalog — passed from the server, not bundled as a client seed. */
  products: Product[];
  offers: Offer[];
}) {
  const [step, setStep] = useState<Step>("Space");
  const [mode, setMode] = useState<BuilderMode>("scratch");
  const [depth, setDepth] = useState<BuildDepth>("quick");
  const [pending, startTransition] = useTransition();

  const [widthM, setWidthM] = useState(3.4);
  const [lengthM, setLengthM] = useState(3.0);
  const [heightM, setHeightM] = useState(2.4);
  const [environment, setEnvironment] =
    useState<AdvancedBuilderProfile["room"]["environment"]>("house");
  const [wallMount, setWallMount] = useState<MountingAnswer>("yes");
  const [floorMount, setFloorMount] = useState<MountingAnswer>("yes");
  const [doorSwing, setDoorSwing] = useState(false);

  const [goals, setGoals] = useState<HomeGymGoal[]>(["strength"]);
  const [exercises, setExercises] = useState<ExerciseId[]>([]);
  const [priorities, setPriorities] = useState<PriorityId[]>(["value", "open-space"]);
  const [noiseImportance, setNoiseImportance] =
    useState<NoiseImportance>("somewhat");
  const [budget, setBudget] = useState(2000);
  const [budgetMode, setBudgetMode] =
    useState<AdvancedBuilderProfile["budgetMode"]>("strict");
  const [spendStyle, setSpendStyle] = useState<SpendStyle>("minimal");
  const [ownedCategories, setOwnedCategories] = useState<string[]>([]);
  const [ownedProductIds, setOwnedProductIds] = useState<string[]>([]);
  const [ownedQuery, setOwnedQuery] = useState("");

  const [result, setResult] = useState<AdvancedBuildResult | null>(null);
  const [layout, setLayout] = useState<AdvancedBuildResult["layout"] | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gymName, setGymName] = useState("My Home Gym");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const catalog = products;
  const productMap = useMemo(
    () => new Map(catalog.map((p) => [p.id, p])),
    [catalog],
  );

  const room = useMemo(() => {
    const openings = doorSwing
      ? [
          {
            id: "door-south",
            type: "door" as const,
            wallId: "south" as const,
            offsetMm: 200,
            widthMm: 900,
            swingDirection: "in" as const,
            swingDepthMm: 900,
          },
        ]
      : [];
    return createRectangularRoom({
      widthM,
      lengthM,
      heightM,
      environment,
      wallMount,
      openings,
    });
  }, [widthM, lengthM, heightM, environment, wallMount, doorSwing]);

  // Restore share / local room once on mount (URL ?build= / local room).
  // Latest applyShared is read via ref so we do not re-run when catalog/offers change.
  const applySharedRef = useRef<(b: SharedBuildV1) => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const buildParam = params.get("build");
    if (buildParam) {
      const decoded = decodeBuildShare(buildParam);
      if (decoded) {
        applySharedRef.current(decoded);
        return;
      }
    }
    const goalParam = params.get("goal");
    if (goalParam === "hyrox") {
      setGoals(["hyrox", "conditioning"]);
      setPriorities(["open-space", "performance"]);
    }
    try {
      const raw = localStorage.getItem(LOCAL_ROOM_KEY);
      if (raw) {
        const r = JSON.parse(raw) as { widthM: number; lengthM: number; heightM: number };
        if (r.widthM) {
          setWidthM(r.widthM);
          setLengthM(r.lengthM);
          setHeightM(r.heightM);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  function applyShared(b: SharedBuildV1) {
    setWidthM(b.room.widthMm / 1000);
    setLengthM(b.room.lengthMm / 1000);
    setHeightM(b.room.heightMm / 1000);
    setGoals(b.goals);
    setPriorities(b.priorities);
    setExercises(b.exercises);
    setBudget(b.budgetEur);
    setBudgetMode(b.budgetMode);
    setNoiseImportance(b.noiseImportance);
    setWallMount(b.wallMount);
    setFloorMount(b.floorMount);
    setOwnedProductIds(b.ownedProductIds);
    if (b.name) setGymName(b.name);
    setStep("Result");
    // rebuild with current offers
    startTransition(() => {
      const profile = profileFromState({
        roomOverride: createRectangularRoom({
          widthM: b.room.widthMm / 1000,
          lengthM: b.room.lengthMm / 1000,
          heightM: b.room.heightMm / 1000,
          environment: b.room.environment,
          wallMount: b.wallMount,
          openings: b.room.openings,
          obstacles: b.room.obstacles,
          restrictedZones: b.room.restrictedZones,
        }),
        goals: b.goals,
        priorities: b.priorities,
        exercises: b.exercises,
        budget: b.budgetEur,
        budgetMode: b.budgetMode,
        noiseImportance: b.noiseImportance,
        wallMount: b.wallMount,
        floorMount: b.floorMount,
        ownedProductIds: b.ownedProductIds,
      });
      const res = runAdvancedHomeGymBuilder({
        profile,
        products: catalog,
        offers,
      });
      setResult(res);
      setLayout(res.layout);
      setSavedMsg("Prices updated since this build was created.");
    });
  }
  applySharedRef.current = applyShared;

  function profileFromState(overrides?: Partial<{
    roomOverride: ReturnType<typeof createRectangularRoom>;
    goals: HomeGymGoal[];
    priorities: PriorityId[];
    exercises: ExerciseId[];
    budget: number;
    budgetMode: AdvancedBuilderProfile["budgetMode"];
    noiseImportance: NoiseImportance;
    wallMount: MountingAnswer;
    floorMount: MountingAnswer;
    ownedProductIds: string[];
  }>): AdvancedBuilderProfile {
    const g = overrides?.goals ?? goals;
    return {
      mode,
      depth,
      room: overrides?.roomOverride ?? room,
      wallMount: overrides?.wallMount ?? wallMount,
      floorMount: overrides?.floorMount ?? floorMount,
      goals: g,
      goalPriority: g,
      exercises:
        (overrides?.exercises ?? exercises).length > 0
          ? overrides?.exercises ?? exercises
          : exercisesForGoals(g),
      priorities: overrides?.priorities ?? priorities,
      noiseImportance: overrides?.noiseImportance ?? noiseImportance,
      budgetEur: overrides?.budget ?? budget,
      budgetMode: overrides?.budgetMode ?? budgetMode,
      spendStyle,
      experience: "intermediate",
      ownedProductIds: overrides?.ownedProductIds ?? ownedProductIds,
      ownedCategories,
      cardioPreference: g.includes("hyrox") ? "row" : "any",
      storagePriority: "normal",
    };
  }

  function build() {
    startTransition(() => {
      try {
        localStorage.setItem(
          LOCAL_ROOM_KEY,
          JSON.stringify({ widthM, lengthM, heightM }),
        );
      } catch {
        /* ignore */
      }
      const res = runAdvancedHomeGymBuilder({
        profile: profileFromState(),
        products: catalog,
        offers,
      });
      setResult(res);
      setLayout(res.layout);
      setStep("Result");
      setSavedMsg(null);
    });
  }

  const onMove = useCallback(
    (id: string, xMm: number, yMm: number) => {
      setLayout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          placements: prev.placements.map((p) =>
            p.id === id ? { ...p, xMm, yMm } : p,
          ),
        };
      });
    },
    [],
  );

  const onRotate = useCallback(
    (id: string, rotation: RotationDeg) => {
      setLayout((prev) => {
        if (!prev || !result) return prev;
        const placement = prev.placements.find((p) => p.id === id);
        if (!placement) return prev;
        const check = validatePlacementMove({
          room,
          placement,
          others: prev.placements,
          xMm: placement.xMm,
          yMm: placement.yMm,
          rotation,
        });
        if (!check.ok) return prev;
        return {
          ...prev,
          placements: prev.placements.map((p) =>
            p.id === id ? { ...p, rotation } : p,
          ),
        };
      });
    },
    [result, room],
  );

  function toggleLock(id: string) {
    setLayout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        placements: prev.placements.map((p) =>
          p.id === id ? { ...p, locked: !p.locked } : p,
        ),
      };
    });
  }

  function runAutoArrange() {
    if (!layout) return;
    const next = autoArrange(room, layout.placements, productMap, true);
    setLayout(next);
  }

  function removeSelected() {
    if (!selectedId || !layout || !result) return;
    const pl = layout.placements.find((p) => p.id === selectedId);
    if (!pl) return;
    setLayout({
      ...layout,
      placements: layout.placements.filter((p) => p.id !== selectedId),
    });
    setResult({
      ...result,
      items: result.items.filter((i) => i.productId !== pl.productId),
    });
    setSelectedId(null);
  }

  function saveLocal() {
    if (!result || !layout) return;
    const buildPayload = toShared();
    const entry: SavedGymLocal = {
      id: `gym-${Date.now()}`,
      name: gymName,
      build: buildPayload,
      updatedAt: new Date().toISOString(),
    };
    try {
      const existing: SavedGymLocal[] = JSON.parse(
        localStorage.getItem(LOCAL_GYMS_KEY) ?? "[]",
      );
      existing.unshift(entry);
      localStorage.setItem(LOCAL_GYMS_KEY, JSON.stringify(existing.slice(0, 12)));
      setSavedMsg(`Saved “${gymName}” on this device.`);
    } catch {
      setSavedMsg("Could not save locally.");
    }
  }

  function toShared(): SharedBuildV1 {
    return {
      version: BUILD_SHARE_VERSION,
      name: gymName,
      room: {
        widthMm: room.widthMm,
        lengthMm: room.lengthMm,
        heightMm: room.heightMm,
        openings: room.openings,
        obstacles: room.obstacles,
        restrictedZones: room.restrictedZones,
        environment: room.environment,
        walls: room.walls,
      },
      goals,
      priorities,
      exercises: exercises.length ? exercises : exercisesForGoals(goals),
      budgetEur: budget,
      budgetMode,
      noiseImportance,
      wallMount,
      floorMount,
      ownedProductIds,
      selectedProductIds: result?.items.map((i) => i.productId) ?? [],
      placements:
        layout?.placements.map((p) => ({
          productId: p.productId,
          xMm: p.xMm,
          yMm: p.yMm,
          rotation: p.rotation,
          locked: p.locked,
        })) ?? [],
      createdAt: new Date().toISOString(),
    };
  }

  function share() {
    const payload = encodeBuildShare(toShared());
    const url = `${window.location.pathname}?build=${encodeURIComponent(payload)}`;
    setShareUrl(url);
    void navigator.clipboard?.writeText(window.location.origin + url);
    setSavedMsg("Share link copied — prices will refresh when opened.");
  }

  const ownedHits = useMemo(() => {
    const q = ownedQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [ownedQuery, catalog]);

  const selectedPlacement = layout?.placements.find((p) => p.id === selectedId);
  const selectedItem = result?.items.find(
    (i) => i.productId === selectedPlacement?.productId,
  );

  return (
    <div className="bg-mesh">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Home Gym Builder" },
          ]}
          className="mb-8"
        />
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Home Gym Builder
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Design the gym you can actually build — space, goals, clearance,
          compatibility and budget. Not a shopping list of everything in the
          catalog.
        </p>

        {/* Mode */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["scratch", "Build from scratch"],
              ["improve", "Improve my gym"],
              ["around-owned", "Plan around what I own"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium",
                mode === id
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border text-muted hover:border-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          {(["quick", "advanced"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDepth(d)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs uppercase tracking-wide",
                depth === d ? "border-accent" : "border-border text-muted",
              )}
            >
              {d === "quick" ? "Quick build" : "Advanced build"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Builder steps">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                step === s
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </nav>

        {step === "Space" && (
          <section className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-medium">Room presets</p>
              <p className="text-xs text-muted">
                Approximate starting sizes — always editable. Not building standards.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROOM_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-accent"
                    onClick={() => {
                      setWidthM(p.widthM);
                      setLengthM(p.lengthM);
                      setHeightM(p.heightM);
                      setEnvironment(p.environment);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                Width (m)
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  value={widthM}
                  onChange={(e) => setWidthM(Number(e.target.value))}
                />
              </label>
              <label className="block text-sm">
                Length (m)
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  value={lengthM}
                  onChange={(e) => setLengthM(Number(e.target.value))}
                />
              </label>
              <label className="block text-sm">
                Ceiling (m)
                <input
                  type="number"
                  step="0.05"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  value={heightM}
                  onChange={(e) => setHeightM(Number(e.target.value))}
                />
              </label>
            </div>
            <p className="text-sm text-muted">
              Preview: {widthM.toFixed(1)} × {lengthM.toFixed(1)} m · Ceiling{" "}
              {heightM.toFixed(2)} m · Origin: top-left (north-west), internal
              mm.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Wall mounting
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  value={wallMount}
                  onChange={(e) => setWallMount(e.target.value as MountingAnswer)}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="some-walls">Some walls</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </label>
              <label className="block text-sm">
                Floor mounting / bolting
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  value={floorMount}
                  onChange={(e) => setFloorMount(e.target.value as MountingAnswer)}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="not-sure">Not sure</option>
                </select>
              </label>
            </div>
            {depth === "advanced" && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={doorSwing}
                  onChange={(e) => setDoorSwing(e.target.checked)}
                />
                Inward-opening door on south wall (hard clearance)
              </label>
            )}
            <button
              type="button"
              className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
              onClick={() => setStep("Train")}
            >
              Continue
            </button>
          </section>
        )}

        {step === "Train" && (
          <section className="mt-8 space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">How do you train?</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() =>
                      setGoals((prev) =>
                        prev.includes(g.value)
                          ? prev.filter((x) => x !== g.value)
                          : [...prev, g.value],
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm",
                      goals.includes(g.value)
                        ? "border-accent bg-accent/10"
                        : "border-border",
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Key exercises</p>
              <div className="flex flex-wrap gap-2">
                {exercisesForGoals(
                  goals.length ? goals : ["general-fitness"],
                ).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setExercises((prev) =>
                        prev.includes(id)
                          ? prev.filter((x) => x !== id)
                          : [...prev, id],
                      )
                    }
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs capitalize",
                      exercises.includes(id)
                        ? "border-accent bg-accent/10"
                        : "border-border",
                    )}
                  >
                    {id.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => setStep("Space")}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
                onClick={() => setStep("Priorities")}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === "Priorities" && (
          <section className="mt-8 space-y-6">
            <p className="text-sm text-muted">Choose up to 3 priorities.</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() =>
                    setPriorities((prev) => {
                      if (prev.includes(p.value)) {
                        return prev.filter((x) => x !== p.value);
                      }
                      if (prev.length >= 3) return [...prev.slice(1), p.value];
                      return [...prev, p.value];
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm",
                    priorities.includes(p.value)
                      ? "border-accent bg-accent/10"
                      : "border-border",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              Noise sensitivity
              <select
                className="mt-1 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2"
                value={noiseImportance}
                onChange={(e) =>
                  setNoiseImportance(e.target.value as NoiseImportance)
                }
              >
                <option value="not-important">Not important</option>
                <option value="somewhat">Somewhat important</option>
                <option value="very">Very important</option>
              </select>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => setStep("Train")}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
                onClick={() => setStep("Owned")}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === "Owned" && (
          <section className="mt-8 space-y-6">
            <p className="text-sm text-muted">
              Search the catalog and mark equipment you already own. We won&apos;t
              recommend duplicates.
            </p>
            <input
              type="search"
              placeholder="Search products…"
              className="w-full max-w-md rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={ownedQuery}
              onChange={(e) => setOwnedQuery(e.target.value)}
            />
            <ul className="space-y-1">
              {ownedHits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="text-sm text-accent hover:underline"
                    onClick={() =>
                      setOwnedProductIds((prev) =>
                        prev.includes(p.id) ? prev : [...prev, p.id],
                      )
                    }
                  >
                    + {p.fullName}
                  </button>
                </li>
              ))}
            </ul>
            {ownedProductIds.length > 0 && (
              <ul className="text-sm">
                {ownedProductIds.map((id) => (
                  <li key={id} className="flex gap-2">
                    <span>{productMap.get(id)?.fullName ?? id}</span>
                    <button
                      type="button"
                      className="text-muted hover:text-foreground"
                      onClick={() =>
                        setOwnedProductIds((prev) =>
                          prev.filter((x) => x !== id),
                        )
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              {[
                ["cat-barbells", "Barbell"],
                ["cat-weight-plates", "Plates"],
                ["cat-weight-benches", "Bench"],
                ["cat-adjustable-dumbbells", "Dumbbells"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    "rounded-md border px-3 py-1 text-xs",
                    ownedCategories.includes(id)
                      ? "border-accent"
                      : "border-border",
                  )}
                  onClick={() =>
                    setOwnedCategories((prev) =>
                      prev.includes(id)
                        ? prev.filter((x) => x !== id)
                        : [...prev, id],
                    )
                  }
                >
                  Own {label} (category)
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => setStep("Priorities")}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
                onClick={() => setStep("Budget")}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === "Budget" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 2000, 3000, 5000].map((b) => (
                <button
                  key={b}
                  type="button"
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm",
                    budget === b ? "border-accent" : "border-border",
                  )}
                  onClick={() => setBudget(b)}
                >
                  €{b.toLocaleString()}
                </button>
              ))}
            </div>
            <label className="block max-w-xs text-sm">
              Custom budget (EUR)
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </label>
            <label className="block max-w-xs text-sm">
              Budget mode
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={budgetMode}
                onChange={(e) =>
                  setBudgetMode(
                    e.target.value as AdvancedBuilderProfile["budgetMode"],
                  )
                }
              >
                <option value="strict">Strict — do not exceed</option>
                <option value="target">Target — small variance OK</option>
                <option value="flexible">Flexible — justified upgrades</option>
              </select>
            </label>
            <label className="block max-w-xs text-sm">
              Spending style
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={spendStyle}
                onChange={(e) => setSpendStyle(e.target.value as SpendStyle)}
              >
                <option value="minimal">Spend as little as necessary</option>
                <option value="maximize-budget">
                  Get the most from my budget
                </option>
              </select>
            </label>
            <p className="text-xs text-muted">
              Affiliate commission does not affect recommendations. Budget is a
              ceiling, not a target to spend.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => setStep("Owned")}
              >
                Back
              </button>
              <button
                type="button"
                disabled={pending || goals.length === 0}
                className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
                onClick={build}
              >
                {pending ? "Building your gym…" : "Build my gym"}
              </button>
            </div>
          </section>
        )}

        {step === "Result" && result && layout && (
          <section className="mt-8 space-y-10">
            {savedMsg && (
              <p className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
                {savedMsg}
              </p>
            )}

            <header>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Your home gym · {result.band} fit
              </p>
              <h2 className="font-display mt-1 text-3xl font-semibold">
                {result.title}
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted">Room</dt>
                  <dd>
                    {formatLength(room.widthMm)} × {formatLength(room.lengthMm)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Ceiling</dt>
                  <dd>{formatLength(room.heightMm)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Known total</dt>
                  <dd>
                    €{Math.round(result.totalKnown).toLocaleString()}
                    {result.unknownPriceCount > 0 && (
                      <span className="text-muted">
                        {" "}
                        · {result.unknownPriceCount} price unavailable
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Open training</dt>
                  <dd>
                    ~
                    {(layout.utilization.openTrainingMm2 / 1_000_000).toFixed(1)}{" "}
                    m²
                  </dd>
                </div>
              </dl>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-border px-3 py-1.5 text-sm"
                    onClick={runAutoArrange}
                  >
                    Auto arrange
                  </button>
                  {selectedPlacement && (
                    <>
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1.5 text-sm"
                        onClick={() => toggleLock(selectedPlacement.id)}
                      >
                        {selectedPlacement.locked ? "Unlock" : "Lock"}
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1.5 text-sm"
                        onClick={removeSelected}
                      >
                        Remove
                      </button>
                      <Link
                        href={`/tools/power-rack-finder`}
                        className="rounded-md border border-border px-3 py-1.5 text-sm"
                      >
                        Find a better rack
                      </Link>
                    </>
                  )}
                </div>
                <RoomPlannerCanvas
                  room={room}
                  layout={layout}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onMove={onMove}
                  onRotate={onRotate}
                />
              </div>

              <aside className="space-y-4 rounded-xl border border-border bg-background/70 p-4">
                {selectedItem ? (
                  <>
                    <h3 className="font-medium">{selectedItem.productName}</h3>
                    <p className="text-sm text-muted">{selectedItem.rationale}</p>
                    {selectedItem.whyNotAlternatives && (
                      <p className="text-sm">{selectedItem.whyNotAlternatives}</p>
                    )}
                    <p className="text-sm">
                      Fit: {selectedItem.fitStatus.replace(/-/g, " ")}
                      {selectedItem.priceKnown
                        ? ` · €${selectedItem.estimatedPrice}`
                        : " · price unavailable"}
                    </p>
                    <Link
                      href={`/products/${productMap.get(selectedItem.productId)?.slug ?? ""}`}
                      className="text-sm text-accent hover:underline"
                    >
                      Product page
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    Select equipment on the plan for details, lock, rotate or
                    remove.
                  </p>
                )}
                {layout.warnings.length > 0 && (
                  <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                    {layout.warnings.map((w, i) => (
                      <li key={i}>
                        [{w.severity}] {w.message}
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-display text-xl font-semibold">
                  What you can train
                </h3>
                <ul className="mt-3 space-y-1 text-sm">
                  {result.exerciseCoverage.map((e) => (
                    <li key={e.id} className="flex gap-2">
                      <span className="w-28 capitalize">{e.label}</span>
                      <span>
                        {e.coverage === "supported"
                          ? "✓"
                          : e.coverage === "partial"
                            ? "Limited"
                            : "Not supported"}
                        {e.note ? ` — ${e.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Goal coverage
                </h3>
                <ul className="mt-3 space-y-1 text-sm capitalize">
                  {result.goalCoverage.map((g) => (
                    <li key={g.goal}>
                      {g.goal.replace(/-/g, " ")} — {g.band}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold">Equipment</h3>
              <ul className="mt-3 divide-y divide-border">
                {result.items.map((i) => (
                  <li
                    key={i.productId}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{i.productName}</p>
                      <p className="text-muted">{i.rationale}</p>
                    </div>
                    <p>
                      {i.existing
                        ? "Owned"
                        : i.priceKnown
                          ? `€${i.estimatedPrice}`
                          : "Price TBA"}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                Known total €{Math.round(result.totalKnown).toLocaleString()}
                {result.retailersUsed > 1 &&
                  ` · spans ${result.retailersUsed} retailers`}
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold">
                Why this setup
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {result.explanations.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {result.confidenceNotes.map((e, i) => (
                  <li key={`c-${i}`}>{e}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                Kitletics is a planning tool, not structural engineering software.
                Confirm wall structure, floor load and electrical requirements
                with a qualified professional where needed. Planning clearances
                are Kitletics assumptions unless labelled manufacturer.
              </p>
            </div>

            {result.alternatives.length > 0 && (
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Alternative builds
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {result.alternatives.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-border p-4 text-sm"
                    >
                      <p className="text-xs uppercase tracking-wide text-muted">
                        {a.label}
                      </p>
                      <p className="mt-1 font-medium">
                        €{Math.round(a.totalEstimated).toLocaleString()}
                      </p>
                      <p className="mt-1 text-muted">{a.tagline}</p>
                      <p className="mt-2 text-xs">
                        {a.itemCount} items · ~{a.openTrainingM2.toFixed(1)} m²
                        open
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-display text-xl font-semibold">Upgrade path</h3>
              <ol className="mt-3 space-y-2 text-sm">
                {result.upgradePath.map((u, i) => (
                  <li key={i}>
                    <span className="uppercase tracking-wide text-muted">
                      {u.stage}
                    </span>{" "}
                    — {u.label}
                    {u.capability ? `: ${u.capability}` : ""}
                    {u.estimatedPrice != null
                      ? ` (~€${u.estimatedPrice})`
                      : ""}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap items-end gap-3 border-t border-border pt-6">
              <label className="text-sm">
                Name
                <input
                  className="ml-2 rounded-md border border-border bg-background px-2 py-1"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={saveLocal}
              >
                Save this gym
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={share}
              >
                Copy share link
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => window.print()}
              >
                Print / PDF
              </button>
              <Link
                href="/tools/power-rack-finder"
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Power Rack Finder
              </Link>
              <button
                type="button"
                className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
                onClick={() => setStep("Space")}
              >
                Start over
              </button>
            </div>
            {shareUrl && (
              <p className="break-all text-xs text-muted">{shareUrl}</p>
            )}

            <details className="text-sm text-muted">
              <summary className="cursor-pointer font-medium text-foreground">
                How Kitletics builds your gym
              </summary>
              <p className="mt-2 max-w-2xl">
                We filter products that physically cannot fit, enforce
                compatibility and mounting rules, allocate budget to goal-critical
                roles first, preserve open training space, then place equipment
                with a deterministic layout engine. Unknown dimensions never count
                as a fit. Affiliate commission is never an input.
              </p>
            </details>
          </section>
        )}

        {step === "Result" && !result && (
          <p className="mt-8 text-muted">
            Complete the steps and build your gym to see results.
          </p>
        )}
      </Container>
    </div>
  );
}
