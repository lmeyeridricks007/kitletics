"use client";

import { useEffect, useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kitletics:saved-comparisons";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function ComparisonShareSave({
  saveKey,
  shareTitle,
  className,
}: {
  saveKey: string;
  shareTitle: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);

  useEffect(() => {
    setSaved(readSaved().includes(saveKey));
  }, [saveKey]);

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareHint("Link copied");
      window.setTimeout(() => setShareHint(null), 2000);
    } catch {
      setShareHint(null);
    }
  }

  function onSave() {
    const current = readSaved();
    const next = saved
      ? current.filter((id) => id !== saveKey)
      : [...new Set([...current, saveKey])];
    writeSaved(next);
    setSaved(!saved);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={onSave}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-border bg-white px-3 text-[12px] font-semibold text-foreground transition-colors hover:bg-surface-muted",
          saved && "border-accent bg-accent/15",
        )}
        aria-pressed={saved}
      >
        <Heart
          className={cn("size-3.5", saved && "fill-accent text-accent")}
          strokeWidth={1.75}
          aria-hidden
        />
        Save
      </button>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-border bg-white px-3 text-[12px] font-semibold text-foreground transition-colors hover:bg-surface-muted"
      >
        <Share2 className="size-3.5" strokeWidth={1.75} aria-hidden />
        Share
      </button>
      {shareHint && (
        <span className="text-[11px] text-muted" role="status">
          {shareHint}
        </span>
      )}
    </div>
  );
}
