import { getWorkspace } from "@/domain/growth/backlinks/service";
import { buildActionQueue } from "@/domain/growth/backlinks/action-queue";
import { KITLETICS_EXPERT_PROFILE } from "@/domain/growth/backlinks/expert-profile";
import { Panel } from "@/components/admin/growth/BacklinkControls";
import { CopyTextButtons } from "@/components/admin/growth/CopyTextButtons";

export default function ApplyNowPage() {
  const queue = buildActionQueue(getWorkspace());
  return (
    <div className="space-y-6">
      <Panel title="Kitletics expert profile (factual)">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">30 characters</dt>
            <dd>{KITLETICS_EXPERT_PROFILE.chars30}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">80 characters</dt>
            <dd>{KITLETICS_EXPERT_PROFILE.chars80}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">160 characters</dt>
            <dd>{KITLETICS_EXPERT_PROFILE.chars160}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <CopyTextButtons
            subject="Profile 50 words"
            message={KITLETICS_EXPERT_PROFILE.words50}
            followUp={KITLETICS_EXPERT_PROFILE.words100}
          />
        </div>
      </Panel>
      {queue.applyNow.map((a) => (
        <Panel key={a.id} title={a.platform}>
          <p className="text-sm">{a.what}</p>
          <p className="mt-2 text-sm text-muted">{a.whyQualifies}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>
              Apply:{" "}
              <a className="text-accent-ink hover:underline" href={a.applyUrl}>
                {a.applyUrl}
              </a>
            </li>
            <li>Requirements: {a.requirements}</li>
            <li>Deadline: {a.deadline}</li>
            <li>Cost: {a.cost}</li>
          </ul>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-sm">
            {a.suggestedSubmission}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm text-accent-foreground"
              href={a.applyUrl}
            >
              Apply now
            </a>
            <CopyTextButtons
              message={a.suggestedSubmission}
              followUp={a.suggestedProfile}
            />
          </div>
        </Panel>
      ))}
    </div>
  );
}
