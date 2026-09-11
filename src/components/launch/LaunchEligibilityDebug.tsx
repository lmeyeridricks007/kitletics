"use client";

import { useEffect, useState } from "react";
import type { LaunchEligibility } from "@/domain/launch/types";
import { formatLaunchEligibilityTrace } from "@/lib/launch/format-trace";

/**
 * Dev/preview-only trace of launch eligibility.
 * Hidden unless ?launchDebug=1 and preview context.
 * Never ship as public QA chrome.
 */
export function LaunchEligibilityDebug({
  eligibility,
  enabled,
}: {
  eligibility: LaunchEligibility;
  /** Server already verified preview/dev */
  enabled: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const params = new URLSearchParams(window.location.search);
    setShow(params.get("launchDebug") === "1");
  }, [enabled]);

  if (!enabled || !show) return null;

  return (
    <aside
      className="fixed bottom-3 left-3 z-[100] max-w-md rounded-lg border border-amber-500/40 bg-[#1a1a14] px-3 py-2 text-[11px] leading-snug text-amber-100 shadow-lg"
      data-launch-debug
    >
      <p className="font-bold tracking-wide text-amber-300 uppercase">
        Launch eligibility (internal)
      </p>
      <p className="mt-1 font-mono break-words">
        {formatLaunchEligibilityTrace(eligibility)}
      </p>
    </aside>
  );
}
