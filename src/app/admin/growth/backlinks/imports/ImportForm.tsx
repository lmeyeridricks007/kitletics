"use client";

import { useActionState } from "react";
import { actionImport, type ImportActionState } from "@/app/admin/growth/backlinks/actions";
import { Button } from "@/components/ui/Button";

const initial: ImportActionState = { ok: false };

async function runImport(
  _prev: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  return actionImport(formData);
}

export function ImportForm({
  kind,
  title,
  hint,
}: {
  kind: "competitors" | "prospects" | "requests";
  title: string;
  hint: string;
}) {
  const [state, formAction, pending] = useActionState(runImport, initial);
  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="text-xs text-muted">{hint}</p>
      <input type="hidden" name="kind" value={kind} />
      <textarea
        name="csv"
        rows={8}
        className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
        placeholder="Paste CSV…"
      />
      <input type="file" name="file" accept=".csv,text/csv" className="block text-sm" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Importing…" : "Import"}
      </Button>
      {state.ok && state.message ? (
        <p className="text-sm text-success">{state.message}</p>
      ) : null}
      {!state.ok && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
