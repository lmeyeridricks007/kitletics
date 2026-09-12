"use client";

import { trackShoeDatabaseEvent } from "@/lib/running-shoe-database/analytics";

export function RunningShoeDatasetDownloadLink({
  href,
}: {
  href: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex h-10 items-center border border-foreground bg-foreground px-4 text-[12px] font-bold tracking-[0.06em] text-white uppercase hover:bg-foreground/90"
      onClick={() =>
        trackShoeDatabaseEvent("shoe_database_data_download", {
          filter_type: "research_csv",
        })
      }
    >
      Download research CSV
    </a>
  );
}
