"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { handleRovingRadioKeyDown } from "@/lib/a11y/use-modal-focus";
import type {
  FinderQuestion,
  FinderResponseValue,
} from "@/domain/finders/types";

export function FinderQuestionCard({
  question,
  value,
  onChange,
  error,
  visual = false,
}: {
  question: FinderQuestion;
  value: FinderResponseValue;
  onChange: (value: FinderResponseValue) => void;
  error?: string;
  /** Larger visual option cards for short option lists */
  visual?: boolean;
}) {
  const optionCount = question.options?.length ?? 0;
  const useVisual =
    visual ||
    ((question.type === "single-select" || question.type === "boolean") &&
      optionCount > 0 &&
      optionCount <= 4 &&
      (question.options ?? []).some((o) => o.description));

  const useCompactGrid =
    (question.type === "single-select" || question.type === "boolean") &&
    optionCount >= 4 &&
    !(question.options ?? []).some((o) => o.description);

  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem]">
        {question.title}
        {!question.required && (
          <span className="ml-2 text-[12px] font-medium text-muted">
            Optional
          </span>
        )}
      </legend>
      {question.description && (
        <p className="text-[13px] text-muted">{question.description}</p>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {(question.type === "single-select" || question.type === "boolean") && (
        <div
          className={cn(
            "grid gap-2",
            useVisual && "sm:grid-cols-3",
            useCompactGrid &&
              (optionCount >= 5
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                : "sm:grid-cols-2 lg:grid-cols-3"),
          )}
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
                  "relative w-full border px-3.5 py-3 text-left text-sm font-medium transition-colors",
                  useVisual ? "min-h-[96px]" : "",
                  selected
                    ? "border-accent bg-[#f4ffe0] text-foreground"
                    : "border-border bg-white text-foreground hover:border-accent/60",
                )}
              >
                {selected && (
                  <span className="absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[#0b1220]">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                )}
                <span className="block pr-6">{opt.label}</span>
                {opt.description && (
                  <span className="mt-1 block text-[12px] font-normal text-muted">
                    {opt.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "multi-select" && (
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={question.title}>
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
                  "relative w-full border px-3.5 py-3 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-accent bg-[#f4ffe0] text-foreground"
                    : "border-border bg-white text-foreground hover:border-accent/60",
                )}
              >
                {selected && (
                  <span className="absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[#0b1220]">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                )}
                <span className="block pr-6">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {(question.type === "optional-number" || question.type === "number") && (
        <OptionalNumberInput
          question={question}
          value={value}
          onChange={onChange}
          required={question.type === "number"}
        />
      )}
    </fieldset>
  );
}

function OptionalNumberInput({
  question,
  value,
  onChange,
  required,
}: {
  question: FinderQuestion;
  value: FinderResponseValue;
  onChange: (value: FinderResponseValue) => void;
  required?: boolean;
}) {
  const isPlainNumber = question.type === "number";
  const obj =
    !isPlainNumber && value && typeof value === "object" && "value" in value
      ? value
      : {
          value:
            typeof value === "number"
              ? value
              : (undefined as number | undefined),
          unit: question.unitOptions?.[0]?.value ?? "kg",
        };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block flex-1 space-y-1.5">
        <span className="text-xs font-medium text-subtle uppercase">Value</span>
        <input
          type="number"
          inputMode="decimal"
          min={question.min}
          max={question.max}
          required={required}
          placeholder={required ? undefined : "Skip if you prefer"}
          value={obj.value ?? ""}
          onChange={(e) => {
            const n = e.target.value === "" ? undefined : Number(e.target.value);
            if (n === undefined || Number.isNaN(n)) {
              onChange(isPlainNumber ? null : null);
              return;
            }
            if (isPlainNumber) {
              onChange(n);
              return;
            }
            onChange({ value: n, unit: obj.unit });
          }}
          className="h-11 w-full border border-border bg-white px-3 text-sm"
        />
      </label>
      {!isPlainNumber && (question.unitOptions?.length ?? 0) > 0 && (
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
            className="h-11 border border-border bg-white px-3 text-sm"
          >
            {(question.unitOptions ?? []).map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {!required && (
        <button
          type="button"
          className="h-11 px-3 text-sm font-medium text-muted hover:text-foreground"
          onClick={() => onChange(null)}
        >
          Skip
        </button>
      )}
    </div>
  );
}
