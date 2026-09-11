"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackFinderEvent } from "@/domain/finders/analytics";

export function ShareResultsButton({
  path,
  finderId,
}: {
  path: string;
  finderId: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Kitletics matches",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      trackFinderEvent("finder_result_viewed", { finderId, action: "share" });
    } catch {
      // User cancelled share — ignore
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={share}>
      {copied ? "Link copied" : "Share results"}
    </Button>
  );
}
