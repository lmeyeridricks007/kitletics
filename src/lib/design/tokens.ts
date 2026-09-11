/**
 * Design token reference mirroring CSS variables in globals.css.
 * Prefer Tailwind theme classes in components; use these when JS needs values.
 */
export const tokens = {
  colors: {
    accent: "var(--accent)",
    background: "var(--background)",
    foreground: "var(--foreground)",
    surface: "var(--surface)",
    muted: "var(--muted)",
    border: "var(--border)",
    link: "var(--link)",
    backgroundDark: "var(--background-dark)",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    "2xl": "var(--radius-2xl)",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    finder: "var(--shadow-finder)",
  },
  layout: {
    headerHeight: "var(--header-height)",
    utilityHeight: "var(--utility-height)",
    container: "var(--container)",
    containerWide: "var(--container-wide)",
  },
} as const;

/** Shared button / badge class fragments — prefer the UI components. */
export const surfaces = {
  card: "rounded-lg border border-border bg-surface",
  cardHover: "transition-all hover:border-border-strong hover:shadow-md",
  muted: "bg-surface-muted",
} as const;
