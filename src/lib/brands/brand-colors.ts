/** Brand accent hex (no #) for logo wells and UI tinting. */
export const BRAND_ACCENT_HEX: Record<string, string> = {
  asics: "003DA5",
  nike: "FA5400",
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
} as const;

export function brandAccentHex(slug: string): string | undefined {
  return BRAND_ACCENT_HEX[slug];
}

export function brandAccentCss(
  slug: string,
  alpha = 0.12,
): string | undefined {
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
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
