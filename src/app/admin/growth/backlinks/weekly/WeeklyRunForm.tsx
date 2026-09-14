"use client";

import { useActionState } from "react";
import { actionWeeklyRun, type ImportActionState } from "@/app/admin/growth/backlinks/actions";
import { Button } from "@/components/ui/Button";

const initial: ImportActionState = { ok: false };

async function run(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  return actionWeeklyRun(formData);
}

function Field({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border p-4">
      <h3 className="font-medium">{label}</h3>
      <p className="text-xs text-muted">{hint}</p>
      <textarea
        name={name}
        rows={5}
        className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
        placeholder="Paste CSV…"
      />
      <input type="file" name={`${name}File`} accept=".csv,text/csv" className="block text-sm" />
    </div>
  );
}

export function WeeklyRunForm() {
  const [state, formAction, pending] = useActionState(run, initial);
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          name="competitor"
          label="Competitor backlinks"
          hint="Ahrefs / Semrush export. Deduped against existing URLs and open outreach."
        />
        <Field
          name="requests"
          label="Journalist / source requests"
          hint="HARO / Qwoted / Featured. No invented emails."
        />
        <Field
          name="pages"
          label="New research pages"
          hint="Columns: url, site, type, topic, evidence, who, contact_route. Page-level intent only."
        />
        <Field
          name="gsc"
          label="Search performance (optional)"
          hint="GSC export: Query, Page, Clicks, Impressions. Used as asset demand, not as prospects."
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Running…" : "Run weekly workflow"}
      </Button>
      <p className="text-xs text-muted">
        Does not send outreach. Does not change score weights. Does not scrape Google.
      </p>
      {state.ok && state.message ? (
        <p className="text-sm text-success">{state.message}</p>
      ) : null}
      {!state.ok && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
