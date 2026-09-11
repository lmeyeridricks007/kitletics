import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
    /\/$/,
    "",
  );
  const entries = sitemapFn();
  const paths = entries.map((e) => {
    const u = e.url;
    if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
    return u.replace(siteConfig.url, "") || "/";
  });

  async function check(path: string) {
    try {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      return {
        path,
        status: res.status,
        location: res.headers.get("location"),
      };
    } catch (e) {
      return {
        path,
        status: 0,
        location: null as string | null,
        error: String(e),
      };
    }
  }

  const CONC = 24;
  const out: Awaited<ReturnType<typeof check>>[] = [];
  for (let i = 0; i < paths.length; i += CONC) {
    const chunk = paths.slice(i, i + CONC);
    out.push(...(await Promise.all(chunk.map(check))));
    if (i % 120 === 0) console.error(`progress ${i}/${paths.length}`);
  }

  const byStatus: Record<string, number> = {};
  for (const r of out) {
    byStatus[String(r.status)] = (byStatus[String(r.status)] || 0) + 1;
  }
  const bad = out.filter((r) => r.status !== 200);
  const summary = {
    base: BASE,
    n: out.length,
    byStatus,
    non200Count: bad.length,
    non200: bad,
  };
  writeFileSync(
    join(process.cwd(), "docs/prelaunch/data/rc27/sitemap-http-probe.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        n: summary.n,
        byStatus,
        non200Count: bad.length,
        sample: bad.slice(0, 30),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
