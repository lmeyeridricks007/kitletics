"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackRotationEvent } from "@/domain/shoe-rotation/share-state";

export function ShareRotationButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Kitletics shoe rotation", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      trackRotationEvent("rotation_shared");
    } catch {
      /* cancel */
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={share}>
      {copied ? "Link copied" : "Share rotation"}
    </Button>
  );
}
