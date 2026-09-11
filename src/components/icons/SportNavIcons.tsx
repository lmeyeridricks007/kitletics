import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
};

/** Padel racket — perforated round face + handle. */
export function PadelIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="10" r="6.75" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="10" cy="8.5" r="0.55" fill="currentColor" />
      <circle cx="14" cy="8.5" r="0.55" fill="currentColor" />
      <circle cx="12" cy="11.5" r="0.55" fill="currentColor" />
      <circle cx="10" cy="12.8" r="0.55" fill="currentColor" />
      <circle cx="14" cy="12.8" r="0.55" fill="currentColor" />
      <path
        d="M12 16.75v4.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tennis racket — string-bed rings + handle. */
export function TennisIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="10" r="6.75" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="12" cy="10" r="3.75" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M12 16.75v4.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Pickleball — hole pattern in ball. */
export function PickleballIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="9.2" cy="10.2" r="0.9" fill="currentColor" />
      <circle cx="14.8" cy="10.2" r="0.9" fill="currentColor" />
      <circle cx="12" cy="13.8" r="0.9" fill="currentColor" />
      <circle cx="9.5" cy="15.2" r="0.75" fill="currentColor" />
      <circle cx="14.5" cy="15.2" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Running shoe — side profile, unmistakable silhouette. */
export function RunningIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M4.5 15.2c1.8-2.8 4.8-4.2 8.2-4.2 2.6 0 5 .9 6.8 2.4 1 .8 1.1 2.1.2 2.9-2.2 1.8-5.1 2.4-8.3 2.1-1.8-.2-3.4-.8-4.6-1.7-.6-.5-.7-1.2-.3-1.5z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M5.5 14.8c2-3.2 5.4-4.8 9.1-4.3 2.3.3 4.4 1.4 5.9 3"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M6 14.5c2.2-2.8 5.2-3.9 8.4-3.5 2 .2 3.8 1 5.2 2.3 1 .9 1.1 2.2.1 3-2.4 1.9-5.6 2.5-9 2.1-2-.3-3.7-1-4.9-2-.5-.4-.6-1-.2-1.4z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M11 10.8c1.6-1.6 3.4-2.2 5.2-1.8"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M6.5 16.2h11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Barbell — angled gym weight. */
export function FitnessIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect
        x="3.5"
        y="8.5"
        width="4"
        height="7"
        rx="0.8"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <rect
        x="16.5"
        y="8.5"
        width="4"
        height="7"
        rx="0.8"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="M7.5 12h9"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** HYROX flame. */
export function HyroxIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 20.5c3.8-2.6 6-5.4 6-9.1 0-2.8-2-5-5-6.8-3 1.8-5 4-5 6.8 0 3.7 2.2 6.5 6 9.1z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M12 17.2c1.7-1.1 2.7-2.5 2.7-4.1 0-1.4-1.1-2.5-2.7-3.2-1.6.7-2.7 1.8-2.7 3.2 0 1.6 1 3 2.7 4.1z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Mountain trail. */
export function HikingIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        d="M3 18.5 9.5 8.5 12.5 13.5 15.5 7 21 18.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 18.5h18"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Football / soccer ball panels. */
export function FootballIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.35" />
      <path
        d="M12 5.2 15.2 8.4 14 12l-2 3.4-2-3.4L8.8 8.4 12 5.2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** More sports. */
export function MoreSportsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export const SPORT_NAV_ICONS = {
  padel: PadelIcon,
  tennis: TennisIcon,
  pickleball: PickleballIcon,
  running: RunningIcon,
  fitness: FitnessIcon,
  hyrox: HyroxIcon,
  hiking: HikingIcon,
  football: FootballIcon,
  more: MoreSportsIcon,
} as const;

export type SportNavIconId = keyof typeof SPORT_NAV_ICONS;
