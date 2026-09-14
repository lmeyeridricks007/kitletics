"use server";

import { revalidatePath } from "next/cache";
import {
  importCompetitorCsv,
  importProspectsCsv,
  importSourceRequestCsv,
  persistWeeklyRun,
  reviewOpportunity,
  setOutreachStatus,
} from "@/domain/growth/backlinks/service";
import type { OpportunityStatus, OutreachStatus } from "@/domain/growth/backlinks/types";

const ROOT = "/admin/growth/backlinks";

function refresh() {
  revalidatePath(ROOT, "layout");
}

export async function actionReview(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OpportunityStatus;
  if (!id || !["APPROVED", "REJECTED", "DEFERRED"].includes(status)) {
    return;
  }
  reviewOpportunity(id, status);
  refresh();
}

export async function actionOutreach(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OutreachStatus;
  if (!id) return;
  try {
    setOutreachStatus(id, status);
    refresh();
  } catch {
    return;
  }
}

export type ImportActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function actionImport(
  formData: FormData,
): Promise<ImportActionState> {
  const kind = String(formData.get("kind") ?? "");
  const pasted = String(formData.get("csv") ?? "").trim();
  const file = formData.get("file");
  const text =
    pasted || (file instanceof File ? await file.text() : "");
  if (!text.trim()) return { ok: false, error: "empty" };
  try {
    if (kind === "competitors") {
      const r = importCompetitorCsv(text);
      refresh();
      return { ok: true as const, message: `Created ${r.created}, skipped ${r.skippedDuplicates} duplicates` };
    }
    if (kind === "prospects") {
      const r = importProspectsCsv(text);
      refresh();
      return { ok: true as const, message: `Created ${r.created}, skipped ${r.skipped}` };
    }
    if (kind === "requests") {
      const n = importSourceRequestCsv(text);
      refresh();
      return { ok: true as const, message: `Imported ${n} source requests` };
    }
    return { ok: false as const, error: "unknown_kind" };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "failed" };
  }
}

export async function actionWeeklyRun(
  formData: FormData,
): Promise<ImportActionState> {
  const fileText = async (key: string) => {
    const pasted = String(formData.get(key) ?? "").trim();
    const file = formData.get(`${key}File`);
    return pasted || (file instanceof File ? await file.text() : "");
  };
  try {
    const result = persistWeeklyRun({
      competitorCsv: await fileText("competitor"),
      journalistRequestCsv: await fileText("requests"),
      newPagesCsv: await fileText("pages"),
      searchPerformanceCsv: await fileText("gsc"),
    });
    refresh();
    return {
      ok: true,
      message: `NEW HIGH ${result.digest.newHigh.length} · MUST ${result.digest.newMustPursue.length} · skipped ${result.digest.skippedDuplicates} duplicates`,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "failed" };
  }
}
