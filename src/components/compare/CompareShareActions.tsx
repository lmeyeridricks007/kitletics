"use client";

import { useState } from "react";
import { Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackCompareEvent } from "@/lib/comparison/analytics";
import { cn } from "@/lib/utils";

function absoluteUrl(url: string): string {
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).toString();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

interface CompareShareActionsProps {
  url: string;
  onClear: () => void;
  className?: string;
  disabled?: boolean;
}

export function CompareShareActions({
  url,
  onClear,
  className,
  disabled,
}: CompareShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  async function copyLink() {
    if (disabled) return;
    const absolute = absoluteUrl(url);
    trackCompareEvent("compare_shared", { source: "builder" });
    const ok = await copyText(absolute);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function share() {
    if (disabled) return;
    const absolute = absoluteUrl(url);
    trackCompareEvent("compare_shared", { source: "builder" });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Kitletics comparison",
          url: absolute,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // fall through to copy
      }
    }
    await copyLink();
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={share}
        className="gap-1.5 border-border bg-white"
      >
        <Share2 className="size-3.5" aria-hidden />
        {shared ? "Shared" : "Share comparison"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={copyLink}
        className="gap-1.5 border-foreground bg-white"
      >
        <Link2 className="size-3.5" aria-hidden />
        {copied ? "Link copied" : "Copy link"}
      </Button>
      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        className="px-2 text-sm font-medium text-red-600 hover:underline disabled:opacity-40"
      >
        Clear all
      </button>
    </div>
  );
}

/** Standalone copy control for help cards */
export function CopyCompareLinkButton({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const absolute = absoluteUrl(url);
    trackCompareEvent("compare_shared", { source: "builder" });
    if (await copyText(absolute)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("font-medium text-link hover:underline", className)}
    >
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
