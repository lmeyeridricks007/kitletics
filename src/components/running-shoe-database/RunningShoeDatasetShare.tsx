"use client";

import { useEffect, useMemo, useState } from "react";
import { runningShoeDatabaseShareUrls } from "@/lib/running-shoe-database/citation/share-urls";
import { trackShoeDatabaseEvent } from "@/lib/running-shoe-database/analytics";

/**
 * Restrained share controls — uses the current URL (including filters).
 * Not a floating social widget.
 */
export function RunningShoeDatasetShare({
  canonicalUrl,
}: {
  canonicalUrl: string;
}) {
  const [pageUrl, setPageUrl] = useState(canonicalUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const urls = useMemo(
    () => runningShoeDatabaseShareUrls(pageUrl),
    [pageUrl],
  );

  async function copyLink() {
    const href =
      typeof window !== "undefined" ? window.location.href : canonicalUrl;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShoeDatabaseEvent("shoe_database_share", {
        share_channel: "copy_link",
      });
    } catch {
      setCopied(false);
    }
  }

  const linkClass =
    "inline-flex h-9 items-center border border-border bg-white px-3 text-[12px] font-semibold text-foreground transition-colors hover:border-foreground/40";

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Share">
      <button type="button" className={linkClass} onClick={copyLink}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a
        className={linkClass}
        href={urls.linkedIn}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackShoeDatabaseEvent("shoe_database_share", {
            share_channel: "linkedin",
          })
        }
      >
        LinkedIn
      </a>
      <a
        className={linkClass}
        href={urls.x}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackShoeDatabaseEvent("shoe_database_share", {
            share_channel: "x",
          })
        }
      >
        X
      </a>
      <a
        className={linkClass}
        href={urls.reddit}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackShoeDatabaseEvent("shoe_database_share", {
            share_channel: "reddit",
          })
        }
      >
        Reddit
      </a>
    </div>
  );
}
