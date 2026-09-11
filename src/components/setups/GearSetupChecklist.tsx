"use client";

import { useEffect, useState } from "react";

interface GearSetupChecklistProps {
  items: string[];
  storageKey: string;
}

export function GearSetupChecklist({
  items,
  storageKey,
}: GearSetupChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function toggle(item: string) {
    setChecked((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  if (!items.length) return null;

  return (
    <section
      id="faq-checklist"
      className="scroll-mt-16 border border-border bg-white p-5 sm:p-6"
    >
      <h2 className="font-display text-[1.1rem] font-bold tracking-tight text-foreground uppercase">
        Race-day checklist
      </h2>
      <p className="mt-1 text-[13px] text-muted">
        Non-commercial prep steps — saved on this device only.
      </p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-3 text-[13px] text-foreground">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-border accent-[var(--color-accent,#c8f135)]"
                checked={Boolean(checked[item])}
                onChange={() => toggle(item)}
              />
              <span className={checked[item] ? "text-muted line-through" : ""}>
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
