/**
 * Sync brand logo SVGs into public/images/brands.
 * Prefers Wikimedia Commons vectors when available; otherwise writes a
 * colored wordmark (+ Simple Icons glyph when present).
 *
 * Run: node scripts/sync-brand-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as simpleIcons from "simple-icons";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/images/brands");

/** Official-ish brand accents for UI + fallback wordmarks (no #). */
const BRAND_COLORS = {
  asics: "003DA5",
  nike: "111111",
  adidas: "000000",
  saucony: "FF671F",
  hoka: "EC1C24",
  brooks: "007DC3",
  "new-balance": "CF0A2C",
  garmin: "007CC3",
  coros: "E31837",
  salomon: "E4002B",
  on: "111111",
  puma: "ED1C24",
  mizuno: "0033A0",
  altra: "00A651",
  "topo-athletic": "E87722",
  "inov-8": "C8102E",
  polar: "D6001C",
  suunto: "FF6600",
  apple: "555555",
  wahoo: "00A3E0",
  rogue: "C8102E",
  concept2: "E31837",
  yonex: "0077C8",
  eleiko: "E30613",
  mirafit: "E87722",
  "rep-fitness": "111111",
  tecnifibre: "009639",
  reebok: "E41D1B",
  bose: "111111",
  oakley: "111111",
  camelbak: "E31837",
  petzl: "E87722",
  "black-diamond": "111111",
  osprey: "7AB800",
  shokz: "FF6A00",
  goodr: "FF69B4",
  craft: "E30613",
  buff: "E30613",
  cep: "E30613",
  feetures: "00A3E0",
  balega: "E31837",
  hyperice: "111111",
  therabody: "111111",
  oofos: "00A651",
  nobull: "111111",
  "under-armour": "1B1B1B",
  tyr: "003087",
  salming: "E30613",
  "bear-komplex": "E87722",
  "do-win": "C8102E",
  domyos: "0082C3",
  lululemon: "D31345",
  vivobarefoot: "2E7D32",
  "xero-shoes": "E87722",
  zeraus: "111111",
};

const NAMES = {
  asics: "ASICS",
  nike: "Nike",
  adidas: "adidas",
  saucony: "Saucony",
  hoka: "HOKA",
  brooks: "Brooks",
  "new-balance": "New Balance",
  garmin: "Garmin",
  coros: "COROS",
  salomon: "Salomon",
  on: "On",
  puma: "PUMA",
  mizuno: "Mizuno",
  altra: "Altra",
  "topo-athletic": "Topo",
  "inov-8": "Inov-8",
  polar: "Polar",
  suunto: "Suunto",
  apple: "Apple",
  wahoo: "Wahoo",
  rogue: "Rogue",
  concept2: "Concept2",
  yonex: "Yonex",
  eleiko: "Eleiko",
  mirafit: "Mirafit",
  "rep-fitness": "REP",
  tecnifibre: "Tecnifibre",
  reebok: "Reebok",
  bose: "Bose",
  oakley: "Oakley",
  camelbak: "CamelBak",
  petzl: "Petzl",
  "black-diamond": "Black Diamond",
  osprey: "Osprey",
  shokz: "Shokz",
  goodr: "goodr",
  craft: "Craft",
  buff: "BUFF",
  cep: "CEP",
  feetures: "Feetures",
  balega: "Balega",
  hyperice: "Hyperice",
  therabody: "Therabody",
  oofos: "OOFOS",
  nobull: "NOBULL",
  "under-armour": "Under Armour",
  tyr: "TYR",
  salming: "Salming",
  "bear-komplex": "Bear KompleX",
  "do-win": "Do-Win",
  domyos: "Domyos",
  lululemon: "lululemon",
  vivobarefoot: "Vivobarefoot",
  "xero-shoes": "Xero Shoes",
  zeraus: "Zeraus",
};

/** Wikimedia Commons filenames (Special:FilePath) — SVG preferred */
const WIKI_FILES = {
  asics: "Asics_Logo.svg",
  nike: "Logo_NIKE.svg",
  adidas: "Adidas_Logo.svg",
  saucony: "Logo_Saucony.svg",
  brooks: "Brooks_Sports_logo.svg",
  "new-balance": "New_Balance_logo.svg",
  garmin: "Garmin_logo.svg",
  salomon: "Salomon_logo.svg",
  altra: "Altra_Running_logo.svg",
  puma: "Puma-logo-(text).svg",
  polar: "Polar_Electro_Logo.svg",
  mizuno: "MIZUNO_logo.svg",
  suunto: "Suunto-logo.svg",
  yonex: "Logo-Yonex.svg",
  apple: "Apple_logo_black.svg",
};

const SI_SLUGS = {
  nike: "nike",
  adidas: "adidas",
  "new-balance": "newbalance",
  garmin: "garmin",
  puma: "puma",
  apple: "apple",
  reebok: "reebok",
  bose: "bose",
};

const UA = "KitleticsBrandLogoSync/1.0 (local content tooling)";

function findSimpleIcon(siSlug) {
  if (!siSlug) return null;
  return (
    Object.values(simpleIcons).find(
      (icon) => icon && typeof icon === "object" && icon.slug === siSlug,
    ) || null
  );
}

function wordmarkSvg(name, hex, iconPath) {
  const safe = name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const width = Math.max(160, Math.min(340, 28 + safe.length * 14));
  const iconBlock = iconPath
    ? `<g transform="translate(6,8) scale(0.75)" fill="#${hex}"><path d="${iconPath}"/></g>`
    : "";
  const textX = iconPath ? 36 : 10;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 40" role="img" aria-label="${safe}">
  ${iconBlock}
  <text x="${textX}" y="27" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="18" font-weight="750" letter-spacing="0.04em" fill="#${hex}">${safe}</text>
</svg>
`;
}

function isChromaticHex(hex) {
  const raw = hex.replace("#", "");
  const n =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.slice(0, 6);
  if (n.length < 6) return false;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min > 30 && !(r > 230 && g > 230 && b > 230);
}

function tintSvgIfMonochrome(svgText, hex) {
  const colors = [...svgText.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map((m) =>
    m[1].toLowerCase(),
  );
  if (colors.some(isChromaticHex)) return svgText;
  return svgText
    .replace(
      /fill="(#(?:000(?:000)?|111(?:111)?|0{6}|1{6}|010101))"/gi,
      `fill="#${hex}"`,
    )
    .replace(
      /fill:(#(?:000(?:000)?|111(?:111)?|0{6}|1{6}|010101))/gi,
      `fill:#${hex}`,
    )
    .replace(
      /stroke="(#(?:000(?:000)?|111(?:111)?|0{6}|1{6}|010101))"/gi,
      `stroke="#${hex}"`,
    );
}

async function fetchWiki(filename) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.subarray(0, 80).toString("utf8");
  if (head.includes("<!DOCTYPE") || head.includes("<html")) return null;
  return buf;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const existing = fs
    .readdirSync(OUT)
    .filter((f) => f.endsWith("-logo.svg"))
    .map((f) => f.replace(/-logo\.svg$/, ""));

  const slugs = new Set([
    ...Object.keys(BRAND_COLORS),
    ...Object.keys(WIKI_FILES),
    ...existing,
  ]);

  let wikiOk = 0;
  let generated = 0;

  for (const slug of [...slugs].sort()) {
    const hex = BRAND_COLORS[slug] ?? "111111";
    const label = NAMES[slug] ?? slug;
    const outSvg = path.join(OUT, `${slug}-logo.svg`);
    const outWhite = path.join(OUT, `${slug}-logo-white.svg`);
    const wikiName = WIKI_FILES[slug];
    const si = findSimpleIcon(SI_SLUGS[slug]);

    let wrote = false;
    if (wikiName) {
      const buf = await fetchWiki(wikiName);
      if (buf) {
        let svg = buf.toString("utf8");
        svg = tintSvgIfMonochrome(svg, hex);
        fs.writeFileSync(outSvg, svg, "utf8");
        console.log(`wiki ${slug} <- ${wikiName}`);
        wikiOk++;
        wrote = true;
      } else {
        console.warn(`wiki miss ${slug}: ${wikiName}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }

    if (!wrote) {
      fs.writeFileSync(outSvg, wordmarkSvg(label, hex, si?.path), "utf8");
      generated++;
      console.log(`generate ${slug} #${hex}`);
    }

    fs.writeFileSync(
      outWhite,
      wordmarkSvg(label, "FFFFFF", si?.path),
      "utf8",
    );
  }

  const colorsModule = `/** Auto-generated by scripts/sync-brand-logos.mjs — brand accent hex (no #). */
export const BRAND_ACCENT_HEX: Record<string, string> = ${JSON.stringify(
    BRAND_COLORS,
    null,
    2,
  )} as const;

export function brandAccentHex(slug: string): string | undefined {
  return BRAND_ACCENT_HEX[slug];
}

export function brandAccentCss(slug: string, alpha = 0.12): string | undefined {
  const hex = brandAccentHex(slug);
  if (!hex) return undefined;
  const n =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
}
`;

  fs.writeFileSync(
    path.join(ROOT, "src/lib/brands/brand-colors.ts"),
    colorsModule,
    "utf8",
  );

  console.log(`\nDone. wiki=${wikiOk} generated=${generated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
