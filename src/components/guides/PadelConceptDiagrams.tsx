/**
 * Brand-neutral SVG teaching diagrams for padel buying guides.
 * Prefer these over lifestyle photos or Running shoe concept art.
 */

export function PadelRacketShapesDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        {
          label: "Round",
          note: "Larger centred sweet spot — forgiveness first.",
          path: "M110 28 C148 28 168 58 168 100 C168 148 138 172 110 172 C82 172 52 148 52 100 C52 58 72 28 110 28 Z",
          spot: { cx: 110, cy: 108 },
        },
        {
          label: "Teardrop",
          note: "Hybrid sweet zone — balanced attack and control.",
          path: "M110 24 C142 28 166 62 164 108 C160 150 136 172 110 172 C84 172 60 150 56 108 C54 62 78 28 110 24 Z",
          spot: { cx: 110, cy: 96 },
        },
        {
          label: "Diamond",
          note: "Higher sweet spot — more finishing reward, less mishit room.",
          path: "M110 22 L158 78 L148 168 L72 168 L62 78 Z",
          spot: { cx: 110, cy: 82 },
        },
      ].map((shape) => (
        <div key={shape.label} className="border border-border bg-white p-3">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {shape.label}
          </p>
          <svg viewBox="0 0 220 200" className="mt-2 w-full" aria-hidden>
            <path
              d={shape.path}
              fill="#f3f1eb"
              stroke="#1a1a1a"
              strokeWidth="2.5"
            />
            <rect x="98" y="172" width="24" height="18" rx="3" fill="#2a2a2a" />
            <circle
              cx={shape.spot.cx}
              cy={shape.spot.cy}
              r="16"
              fill="none"
              stroke="#7a9e3a"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={shape.spot.cx}
              y={shape.spot.cy + 4}
              textAnchor="middle"
              fill="#5a6b3a"
              fontSize="9"
              fontFamily="ui-sans-serif, system-ui"
            >
              sweet
            </text>
          </svg>
          <p className="mt-1 text-[12px] leading-snug text-muted">{shape.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelRacketBalanceDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {[
        {
          label: "Low / handle-biased",
          note: "Easier preparation and defence — tip feels lighter through the swing.",
          tipY: 48,
          balY: 128,
        },
        {
          label: "High / head-biased",
          note: "More mass through the ball — tip feels heavier late in long sessions.",
          tipY: 48,
          balY: 72,
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 200 200" className="mx-auto mt-3 w-full max-w-[220px]" aria-hidden>
            <path
              d="M100 28 C132 32 148 62 146 100 C142 140 124 162 100 162 C76 162 58 140 54 100 C52 62 68 32 100 28 Z"
              fill="#eeebe4"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <rect x="90" y="162" width="20" height="22" rx="2" fill="#2a2a2a" />
            <line
              x1="100"
              y1="40"
              x2="100"
              y2="170"
              stroke="#c8c4ba"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx="100" cy={col.balY} r="7" fill="#b8f000" stroke="#1a1a1a" strokeWidth="1.5" />
            <text
              x="118"
              y={col.balY + 4}
              fill="#333"
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui"
            >
              balance
            </text>
            <circle cx="100" cy={col.tipY} r="3" fill="#888" />
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelRacketWeightDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        {
          label: "Light",
          range: "~345–365 g",
          note: "Faster preparation; less plow-through on hard contact.",
          bars: 2,
        },
        {
          label: "Mid",
          range: "~365–375 g",
          note: "Club default band for most intermediate frames.",
          bars: 3,
        },
        {
          label: "Heavy",
          range: "~375–390 g+",
          note: "More stability and power bias; arm load rises over long matches.",
          bars: 4,
        },
      ].map((band) => (
        <div key={band.label} className="border border-border bg-white p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {band.label}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-foreground">{band.range}</p>
          <div className="mt-3 flex items-end gap-1.5" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-5 rounded-sm"
                style={{
                  height: `${18 + i * 10}px`,
                  background: i < band.bars ? "#1a1a1a" : "#e5e2da",
                }}
              />
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-snug text-muted">{band.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelBagFormsDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {[
        {
          label: "Paletero / club bag",
          note: "Wide racket wells, thermo sleeve, shoe pocket — court-day default.",
          svg: (
            <svg viewBox="0 0 240 140" className="w-full" aria-hidden>
              <rect x="20" y="30" width="200" height="90" rx="10" fill="#ebe8e0" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="36" y="44" width="70" height="62" rx="4" fill="#f7f5ef" stroke="#888" strokeWidth="1.5" />
              <rect x="116" y="44" width="70" height="62" rx="4" fill="#f7f5ef" stroke="#888" strokeWidth="1.5" />
              <text x="52" y="80" fill="#666" fontSize="10" fontFamily="ui-sans-serif, system-ui">
                rackets
              </text>
              <rect x="196" y="50" width="14" height="50" rx="2" fill="#c5d4a0" stroke="#1a1a1a" strokeWidth="1" />
              <text x="28" y="22" fill="#555" fontSize="9" fontFamily="ui-sans-serif, system-ui">
                thermo · shoe pocket
              </text>
            </svg>
          ),
        },
        {
          label: "Backpack commute",
          note: "Hands-free carry — usually fewer racket wells and less thermo volume.",
          svg: (
            <svg viewBox="0 0 240 140" className="w-full" aria-hidden>
              <path
                d="M70 28 H170 L185 50 V120 H55 V50 Z"
                fill="#ebe8e0"
                stroke="#1a1a1a"
                strokeWidth="2"
              />
              <path d="M55 55 C40 70 40 100 55 115" fill="none" stroke="#1a1a1a" strokeWidth="3" />
              <path d="M185 55 C200 70 200 100 185 115" fill="none" stroke="#1a1a1a" strokeWidth="3" />
              <rect x="95" y="48" width="50" height="55" rx="3" fill="#f7f5ef" stroke="#888" strokeWidth="1.5" />
              <text x="100" y="80" fill="#666" fontSize="9" fontFamily="ui-sans-serif, system-ui">
                1–2
              </text>
            </svg>
          ),
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <div className="mt-3">{col.svg}</div>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelGripVsOvergripDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {[
        {
          label: "Base / replacement grip",
          note: "Foundation layer on the handle. Rebuild when the core wrap is dead or diameter is wrong.",
          layers: [
            { y: 70, h: 40, fill: "#d4cfc4", label: "base grip" },
            { y: 55, h: 12, fill: "#2a2a2a", label: "" },
          ],
        },
        {
          label: "Overgrip (refresh wrap)",
          note: "Thin consumable over the base. Replace when tack dies or sweat soaks through — often weekly.",
          layers: [
            { y: 70, h: 40, fill: "#d4cfc4", label: "base" },
            { y: 58, h: 18, fill: "#b8f000", label: "overgrip" },
            { y: 48, h: 10, fill: "#2a2a2a", label: "" },
          ],
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 220 160" className="mt-3 w-full" aria-hidden>
            <rect x="90" y="20" width="40" height="120" rx="6" fill="#eeebe4" stroke="#1a1a1a" strokeWidth="2" />
            {col.layers.map((layer, i) => (
              <g key={i}>
                <rect
                  x="82"
                  y={layer.y}
                  width="56"
                  height={layer.h}
                  rx="4"
                  fill={layer.fill}
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                />
                {layer.label ? (
                  <text
                    x="150"
                    y={layer.y + layer.h / 2 + 4}
                    fill="#444"
                    fontSize="11"
                    fontFamily="ui-sans-serif, system-ui"
                  >
                    {layer.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelBallTypesDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {[
        {
          label: "Fresh pressurized can",
          note: "Match bounce and speed when the seal is new — expect fade after a few hard sessions.",
          balls: 3,
          faded: false,
        },
        {
          label: "Tired training balls",
          note: "Lower bounce and softer feel — fine for drilling, misleading for match timing.",
          balls: 3,
          faded: true,
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 240 120" className="mt-3 w-full" aria-hidden>
            <rect
              x="30"
              y="28"
              width="180"
              height="64"
              rx="8"
              fill={col.faded ? "#e8e4da" : "#f0efe8"}
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={70 + i * 50}
                cy={60}
                r="18"
                fill={col.faded ? "#c9c4b4" : "#d4e85a"}
                stroke="#1a1a1a"
                strokeWidth="1.5"
                opacity={col.faded ? 0.75 : 1}
              />
            ))}
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelPressurizerDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      <div className="bg-[#fafaf8] p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          Tube / pump pressurizer
        </p>
        <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
          <rect x="70" y="20" width="80" height="100" rx="8" fill="#ebe8e0" stroke="#1a1a1a" strokeWidth="2" />
          <circle cx="110" cy="50" r="16" fill="#d4e85a" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="110" cy="90" r="16" fill="#d4e85a" stroke="#1a1a1a" strokeWidth="1.5" />
          <rect x="95" y="8" width="30" height="14" rx="3" fill="#2a2a2a" />
          <text x="160" y="70" fill="#555" fontSize="10" fontFamily="ui-sans-serif, system-ui">
            seal + pump
          </text>
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Holds balls under pressure between sessions — only useful if you will actually reseal cans.
        </p>
      </div>
      <div className="bg-[#fafaf8] p-4">
        <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
          Multi-ball chamber
        </p>
        <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
          <rect x="40" y="35" width="140" height="70" rx="10" fill="#ebe8e0" stroke="#1a1a1a" strokeWidth="2" />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={70 + i * 40}
              cy={70}
              r="14"
              fill="#d4e85a"
              stroke="#1a1a1a"
              strokeWidth="1.5"
            />
          ))}
          <rect x="175" y="55" width="18" height="30" rx="3" fill="#2a2a2a" />
        </svg>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          Bigger chamber for several balls — same job as a tube, different form factor and desk footprint.
        </p>
      </div>
    </div>
  );
}

export function PadelDecisionStepsDiagram() {
  const steps = [
    { n: "1", title: "Lock the job", body: "Level, surface, and what fails today." },
    { n: "2", title: "Filter geometry", body: "Shape, balance, weight — then materials." },
    { n: "3", title: "Verify the pick", body: "Compare two roles, not ten clones." },
  ];
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step) => (
        <li key={step.n} className="border border-border bg-white p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            Step {step.n}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-foreground">{step.title}</p>
          <p className="mt-1 text-[12px] leading-snug text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function PadelShoeOutsoleDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {[
        {
          label: "Herringbone / clay-ready",
          note: "Channels clear sand and dust — preferred on dusty outdoor courts.",
          pattern: "M30 40 H170 M40 55 H160 M30 70 H170 M40 85 H160 M30 100 H170",
        },
        {
          label: "Omni / multipurpose",
          note: "More connected rubber — often faster on hard indoor courts, less self-cleaning outdoors.",
          pattern:
            "M50 35 L90 55 L50 75 L90 95 L50 115 M130 35 L170 55 L130 75 L170 95 L130 115 M90 45 L130 65 M90 85 L130 105",
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 200 140" className="mt-3 w-full" aria-hidden>
            <ellipse cx="100" cy="70" rx="78" ry="52" fill="#ebe8e0" stroke="#1a1a1a" strokeWidth="2" />
            <path d={col.pattern} fill="none" stroke="#1a1a1a" strokeWidth="2" />
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelSweetSpotDiagram() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        {
          label: "Centred / larger zone",
          note: "More usable face when contact is late or off-centre — typical of round comfort moulds.",
          cy: 108,
          r: 22,
        },
        {
          label: "Higher / smaller zone",
          note: "Rewards clean tip contact for finishing — typical of diamond attack moulds.",
          cy: 78,
          r: 14,
        },
      ].map((col) => (
        <div key={col.label} className="border border-border bg-white p-3">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 220 200" className="mt-2 w-full" aria-hidden>
            <path
              d="M110 28 C148 28 168 58 168 100 C168 148 138 172 110 172 C82 172 52 148 52 100 C52 58 72 28 110 28 Z"
              fill="#f3f1eb"
              stroke="#1a1a1a"
              strokeWidth="2.5"
            />
            <rect x="98" y="172" width="24" height="18" rx="3" fill="#2a2a2a" />
            <circle
              cx={110}
              cy={col.cy}
              r={col.r}
              fill="rgba(184,240,0,0.25)"
              stroke="#7a9e3a"
              strokeWidth="2"
            />
          </svg>
          <p className="mt-1 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelPowerControlDiagram() {
  return (
    <div className="border border-border bg-white p-4">
      <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
        Power ↔ control continuum
      </p>
      <svg viewBox="0 0 480 120" className="mt-4 w-full" aria-hidden>
        <defs>
          <linearGradient id="pcGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#b8f000" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>
        <rect x="40" y="48" width="400" height="12" rx="6" fill="url(#pcGrad)" />
        <circle cx="90" cy="54" r="8" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="240" cy="54" r="8" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="400" cy="54" r="8" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
        <text x="90" y="88" textAnchor="middle" fill="#333" fontSize="12" fontFamily="ui-sans-serif, system-ui">
          Soft round
        </text>
        <text x="240" y="88" textAnchor="middle" fill="#333" fontSize="12" fontFamily="ui-sans-serif, system-ui">
          Hybrid / teardrop
        </text>
        <text x="400" y="88" textAnchor="middle" fill="#333" fontSize="12" fontFamily="ui-sans-serif, system-ui">
          Stiff diamond
        </text>
        <text x="90" y="30" textAnchor="middle" fill="#555" fontSize="11" fontFamily="ui-sans-serif, system-ui">
          forgiveness
        </text>
        <text x="400" y="30" textAnchor="middle" fill="#555" fontSize="11" fontFamily="ui-sans-serif, system-ui">
          finishing
        </text>
      </svg>
      <p className="mt-2 text-[12px] leading-snug text-muted">
        Generic teaching continuum — not a score for any one brand. Match the mould to the job you play most weeks.
      </p>
    </div>
  );
}

export function PadelCoreFeelDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2">
      {[
        {
          label: "Softer core",
          note: "More trampoline at moderate pace; easier on the arm; less plow-through for hard finishers.",
          fill: "#d4e85a",
        },
        {
          label: "Firmer / multi-density",
          note: "More connected response when you already generate pace; less forgiveness on mishits.",
          fill: "#9aa08a",
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 220 140" className="mt-3 w-full" aria-hidden>
            <path
              d="M110 18 C142 22 158 52 156 88 C152 120 132 132 110 132 C88 132 68 120 64 88 C62 52 78 22 110 18 Z"
              fill="#eeebe4"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            <ellipse cx="110" cy="78" rx="36" ry="28" fill={col.fill} stroke="#1a1a1a" strokeWidth="1.5" opacity="0.85" />
            <rect x="100" y="132" width="20" height="16" rx="2" fill="#2a2a2a" />
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelShoeSupportDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-3">
      {[
        { label: "Heel lockdown", note: "Holds the heel on plant-and-cut — reduces slip inside the shoe." },
        { label: "Lateral wall", note: "Side support for glass-court cuts — not the same as running stability posts." },
        { label: "Forefoot flex", note: "Enough bend for split-step and push — too stiff feels planted but slow." },
      ].map((col, i) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 160 120" className="mt-3 w-full" aria-hidden>
            <path
              d="M30 70 C40 40 70 28 100 32 C130 36 140 55 138 78 C136 98 110 108 80 106 C50 104 28 92 30 70 Z"
              fill="#ebe8e0"
              stroke="#1a1a1a"
              strokeWidth="2"
            />
            {i === 0 ? (
              <ellipse cx="48" cy="78" rx="14" ry="18" fill="none" stroke="#b8f000" strokeWidth="3" />
            ) : null}
            {i === 1 ? (
              <path d="M100 40 L118 70 L100 95" fill="none" stroke="#b8f000" strokeWidth="3" />
            ) : null}
            {i === 2 ? (
              <path d="M110 55 Q130 70 118 90" fill="none" stroke="#b8f000" strokeWidth="3" />
            ) : null}
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelBagAnatomyDiagram() {
  return (
    <div className="border border-border bg-white p-4">
      <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
        Paletero anatomy
      </p>
      <svg viewBox="0 0 480 200" className="mt-3 w-full" aria-hidden>
        <rect x="40" y="40" width="400" height="120" rx="12" fill="#ebe8e0" stroke="#1a1a1a" strokeWidth="2" />
        <rect x="60" y="58" width="100" height="84" rx="6" fill="#f7f5ef" stroke="#888" strokeWidth="1.5" />
        <text x="78" y="105" fill="#555" fontSize="12" fontFamily="ui-sans-serif, system-ui">
          racket wells
        </text>
        <rect x="180" y="58" width="90" height="84" rx="6" fill="#c5d4a0" stroke="#1a1a1a" strokeWidth="1.5" />
        <text x="195" y="100" fill="#333" fontSize="11" fontFamily="ui-sans-serif, system-ui">
          thermo
        </text>
        <rect x="290" y="58" width="70" height="50" rx="6" fill="#f7f5ef" stroke="#888" strokeWidth="1.5" />
        <text x="300" y="88" fill="#555" fontSize="11" fontFamily="ui-sans-serif, system-ui">
          shoes
        </text>
        <rect x="375" y="58" width="45" height="84" rx="6" fill="#f0efe8" stroke="#888" strokeWidth="1.5" />
        <text x="382" y="105" fill="#555" fontSize="10" fontFamily="ui-sans-serif, system-ui">
          kit
        </text>
      </svg>
      <p className="mt-2 text-[12px] leading-snug text-muted">
        Generic layout — count racket wells, thermo volume, shoe pocket and carry straps against how you actually travel to court.
      </p>
    </div>
  );
}

export function PadelGripLayersDiagram() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-3">
      {[
        {
          label: "Bare handle",
          note: "Carbon / foam core — rarely played bare.",
          layers: [{ y: 70, h: 40, fill: "#c8c4ba" }],
        },
        {
          label: "Base grip on",
          note: "Sets diameter and foundation feel.",
          layers: [
            { y: 70, h: 40, fill: "#c8c4ba" },
            { y: 58, h: 18, fill: "#8a8580" },
          ],
        },
        {
          label: "Overgrip on top",
          note: "Thin refresh layer — replace when tack dies.",
          layers: [
            { y: 70, h: 40, fill: "#c8c4ba" },
            { y: 58, h: 16, fill: "#8a8580" },
            { y: 48, h: 14, fill: "#b8f000" },
          ],
        },
      ].map((col) => (
        <div key={col.label} className="bg-[#fafaf8] p-4">
          <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {col.label}
          </p>
          <svg viewBox="0 0 160 140" className="mt-3 w-full" aria-hidden>
            <rect x="60" y="16" width="40" height="110" rx="6" fill="#eeebe4" stroke="#1a1a1a" strokeWidth="2" />
            {col.layers.map((layer, i) => (
              <rect
                key={i}
                x="52"
                y={layer.y}
                width="56"
                height={layer.h}
                rx="4"
                fill={layer.fill}
                stroke="#1a1a1a"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          <p className="mt-2 text-[12px] leading-snug text-muted">{col.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PadelBeginnerKitDiagram() {
  const items = [
    { label: "Round racket", note: "Forgiving face first" },
    { label: "Court shoes", note: "Lateral grip, not runners" },
    { label: "Fresh balls", note: "Match bounce for timing" },
    { label: "Overgrips", note: "Replace when tack dies" },
    { label: "Bag", note: "Racket + shoe carry" },
    { label: "Optional", note: "Protector / pressurizer" },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="border border-border bg-white p-3">
          <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
          <p className="mt-1 text-[12px] text-muted">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
