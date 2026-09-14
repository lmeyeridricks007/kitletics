"use client";

import { useEffect, useRef } from "react";
import { trackFinderEvent } from "@/domain/finders/analytics";

/** Fires once when finder results are shown. */
export function FinderResultsAnalytics({
  finderId,
  resultCount,
}: {
  finderId: string;
  resultCount: number;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackFinderEvent("finder_result_viewed", {
      finderId,
      resultCount,
      action: "view",
    });
  }, [finderId, resultCount]);
  return null;
}
