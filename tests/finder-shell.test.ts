import { describe, expect, it } from "vitest";
import { getFinderDefinition, getAllFinderDefinitions } from "@/domain/finders/repository";
import { getFinderUiConfig } from "@/lib/finder/finder-ui-config";
import { resolveFinderSteps } from "@/lib/finder/resolve-steps";
import { getVisibleQuestions } from "@/domain/finders/normalization";
import { getToolBySlug } from "@/repositories";

describe("finder shell QA", () => {
  it("running shoe finder has published tool and grouped steps", () => {
    const tool = getToolBySlug("running-shoe-finder", { isDev: false });
    expect(tool?.status).toBe("published");
    const def = getFinderDefinition("running-shoe-finder", "NL");
    expect(def).toBeTruthy();
    const ui = getFinderUiConfig(def!.slug);
    const steps = resolveFinderSteps(def!, {}, ui);
    expect(steps.length).toBeGreaterThanOrEqual(5);
    expect(steps.some((s) => s.isResults)).toBe(true);
    expect(ui.steps.every((s) => s.id && s.shortTitle)).toBe(true);
  });

  it("question keys are unique and options unique per question", () => {
    const def = getFinderDefinition("running-shoe-finder", "NL")!;
    const keys = def.questions.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const q of def.questions) {
      const values = (q.options ?? []).map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("conditional showWhen keys reference existing questions", () => {
      for (const def of getAllFinderDefinitions()) {
      const keys = new Set(def.questions.map((q) => q.key));
      for (const q of def.questions) {
        if (!q.showWhen) continue;
        expect(keys.has(q.showWhen.key)).toBe(true);
      }
    }
  });

  it("UI step questionKeys reference definition questions", () => {
    for (const slug of [
      "running-shoe-finder",
      "padel-racket-finder",
      "training-shoe-finder",
      "power-rack-finder",
    ]) {
      const def = getFinderDefinition(slug, "NL");
      if (!def) continue;
      const ui = getFinderUiConfig(slug);
      const keys = new Set(def.questions.map((q) => q.key));
      for (const step of ui.steps) {
        for (const k of step.questionKeys) {
          expect(keys.has(k)).toBe(true);
        }
      }
    }
  });

  it("padel and power-rack reuse step resolution without running-only keys", () => {
    for (const slug of ["padel-racket-finder", "power-rack-finder"]) {
      const def = getFinderDefinition(slug, "NL");
      expect(def).toBeTruthy();
      const ui = getFinderUiConfig(slug);
      const steps = resolveFinderSteps(def!, {}, ui);
      const titles = steps.map((s) => s.shortTitle).join(" ");
      expect(titles.toLowerCase()).not.toContain("running basics");
      expect(getVisibleQuestions(def!, {}).length).toBeGreaterThan(0);
    }
  });

  it("summary fields reference real question keys", () => {
    const def = getFinderDefinition("running-shoe-finder", "NL")!;
    const ui = getFinderUiConfig(def.slug);
    const keys = new Set(def.questions.map((q) => q.key));
    for (const f of ui.summaryFields) {
      expect(keys.has(f.key)).toBe(true);
    }
  });

  it("padel summary heading is not running profile", () => {
    const ui = getFinderUiConfig("padel-racket-finder");
    expect(ui.summaryHeading).toBe("Your racket profile");
  });
});
