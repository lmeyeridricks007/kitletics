import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import { writeFileSync } from "fs";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");

async function main() {
  const paths = sitemapFn().map((e) => {
    const u = e.url;
    if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
    return u.replace(siteConfig.url, "") || "/";
  });

  async function check(
    path: string,
    attempt = 1,
  ): Promise<{
    path: string;
    status: number;
    location: string | null;
    error?: string;
  }> {
    try {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      return {
        path,
        status: res.status,
        location: res.headers.get("location"),
      };
    } catch (e) {
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        return check(path, attempt + 1);
      }
      return { path, status: 0, location: null, error: String(e) };
    }
  }

  const byStatus: Record<string, number> = {};
  const non200: Awaited<ReturnType<typeof check>>[] = [];
  const CONC = 3;
  for (let i = 0; i < paths.length; i += CONC) {
    const chunk = paths.slice(i, i + CONC);
    const results = await Promise.all(chunk.map((p) => check(p)));
    for (const r of results) {
      byStatus[String(r.status)] = (byStatus[String(r.status)] || 0) + 1;
      if (r.status !== 200) non200.push(r);
    }
    if (i % 60 === 0) console.error(`progress ${i}/${paths.length}`);
    await new Promise((r) => setTimeout(r, 40));
  }

  const summary = {
    base: BASE,
    n: paths.length,
    byStatus,
    non200Count: non200.length,
    non200,
  };
  writeFileSync(
    "docs/prelaunch/data/rc-final/sitemap-http-probe.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        n: summary.n,
        byStatus,
        non200Count: non200.length,
        sample: non200.slice(0, 25),
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
