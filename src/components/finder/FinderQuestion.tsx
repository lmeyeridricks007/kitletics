"use client";

import { cn } from "@/lib/utils";
import { handleRovingRadioKeyDown } from "@/lib/a11y/use-modal-focus";
import type {
  FinderQuestion,
  FinderResponseValue,
  FinderResponses,
} from "@/domain/finders/types";

export function FinderProgress({
  stepIndex,
  stepCount,
}: {
  stepIndex: number;
  stepCount: number;
}) {
  const pct = stepCount > 0 ? ((stepIndex + 1) / stepCount) * 100 : 0;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wide text-subtle uppercase">
        Step {stepIndex + 1}
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress ${Math.round(pct)} percent`}
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function FinderQuestionCard({
  question,
  value,
  onChange,
  error,
}: {
  question: FinderQuestion;
  value: FinderResponseValue;
  onChange: (value: FinderResponseValue) => void;
  error?: string;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {question.title}
      </legend>
      {question.description && (
        <p className="text-sm text-muted">{question.description}</p>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {(question.type === "single-select" || question.type === "boolean") && (
        <div
          className="grid gap-2"
          role="radiogroup"
          aria-label={question.title}
          onKeyDown={(event) =>
            handleRovingRadioKeyDown(
              event,
              (question.options ?? []).map((o) => o.value),
              typeof value === "string" ? value : undefined,
              (next) => onChange(next),
            )
          }
        >
          {(question.options ?? []).map((opt, index) => {
            const selected = String(value ?? "") === opt.value;
            const noneSelected = !(question.options ?? []).some(
              (o) => String(value ?? "") === o.value,
            );
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected || (noneSelected && index === 0) ? 0 : -1}
                onClick={() => onChange(opt.value)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface text-foreground hover:border-accent/60",
                )}
              >
                {opt.label}
                {opt.description && (
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {opt.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "multi-select" && (
        <div className="grid gap-2" role="group" aria-label={question.title}>
          {(question.options ?? []).map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => {
                  const current = Array.isArray(value) ? [...value] : [];
                  if (selected) {
                    onChange(current.filter((v) => v !== opt.value));
                  } else {
                    const max = question.maxSelections ?? 99;
                    if (current.length >= max) {
                      onChange([...current.slice(1), opt.value]);
                    } else {
                      onChange([...current, opt.value]);
                    }
                  }
                }}
                className={cn(
                  "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface text-foreground hover:border-accent/60",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "optional-number" && (
        <OptionalNumberInput
          question={question}
          value={value}
          onChange={onChange}
        />
      )}
    </fieldset>
  );
}

function OptionalNumberInput({
  question,
  value,
  onChange,
}: {
  question: FinderQuestion;
  value: FinderResponseValue;
  onChange: (value: FinderResponseValue) => void;
}) {
  const obj =
    value && typeof value === "object" && "value" in value
      ? value
      : { value: undefined as number | undefined, unit: question.unitOptions?.[0]?.value ?? "kg" };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block flex-1 space-y-1.5">
        <span className="text-xs font-medium text-subtle uppercase">Value</span>
        <input
          type="number"
          inputMode="decimal"
          min={question.min}
          max={question.max}
          placeholder="Skip if you prefer"
          value={obj.value ?? ""}
          onChange={(e) => {
            const n = e.target.value === "" ? undefined : Number(e.target.value);
            if (n === undefined || Number.isNaN(n)) {
              onChange(null);
              return;
            }
            onChange({ value: n, unit: obj.unit });
          }}
          className="h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-subtle uppercase">Unit</span>
        <select
          value={obj.unit}
          onChange={(e) => {
            if (obj.value === undefined) {
              onChange(null);
              return;
            }
            onChange({ value: obj.value, unit: e.target.value });
          }}
          className="h-12 rounded-xl border border-border bg-surface px-3 text-sm"
        >
          {(question.unitOptions ?? []).map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="h-12 rounded-xl px-3 text-sm text-muted hover:text-foreground"
        onClick={() => onChange(null)}
      >
        Skip
      </button>
    </div>
  );
}

export function FinderAnswerSummary({
  definition,
  responses,
  onEdit,
}: {
  definition: { questions: FinderQuestion[]; priorityKey: string; budgetKey: string };
  responses: FinderResponses;
  onEdit: (key: string) => void;
}) {
  const items: { key: string; label: string; display: string }[] = [];
  for (const q of definition.questions) {
    const v = responses[q.key];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    let display = "";
    if (Array.isArray(v)) {
      display = v
        .map((val) => q.options?.find((o) => o.value === val)?.label ?? val)
        .join(", ");
    } else if (typeof v === "object" && "value" in v) {
      continue; // weight — privacy
    } else {
      display =
        q.options?.find((o) => o.value === String(v))?.label ?? String(v);
    }
    items.push({ key: q.key, label: q.title, display });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-semibold">Your running profile</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3 last:border-0"
          >
            <div>
              <p className="text-xs text-subtle">{item.label}</p>
              <p className="text-sm font-medium">{item.display}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(item.key)}
              className="text-xs font-medium text-accent hover:underline"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
