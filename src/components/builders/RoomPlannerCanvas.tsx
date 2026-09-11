"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LayoutResult, PlacedEquipment, Room, RotationDeg } from "@/domain/room-planner/types";
import { hardExclusionZones } from "@/domain/room-planner/clearance";
import { placementRect } from "@/domain/room-planner/geometry";
import { validatePlacementMove } from "@/domain/room-planner/layout";
import { formatLength } from "@/domain/room-planner/units";

interface RoomPlannerCanvasProps {
  room: Room;
  layout: LayoutResult;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, xMm: number, yMm: number) => void;
  onRotate: (id: string, rotation: RotationDeg) => void;
  className?: string;
}

const CATEGORY_FILL: Record<string, string> = {
  rack: "var(--accent, #1a5f4a)",
  bench: "#3d5a80",
  weights: "#6b4f3a",
  cardio: "#4a6fa5",
  pull: "#2d6a4f",
  storage: "#7a7a6c",
  other: "#5c5c5c",
};

function fillForLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("rack") || l.includes("cage")) return CATEGORY_FILL.rack;
  if (l.includes("bench")) return CATEGORY_FILL.bench;
  if (l.includes("dumbbell") || l.includes("kettle") || l.includes("powerblock") || l.includes("nuobell") || l.includes("bowflex"))
    return CATEGORY_FILL.weights;
  if (l.includes("rower") || l.includes("bike") || l.includes("tread") || l.includes("ski"))
    return CATEGORY_FILL.cardio;
  if (l.includes("pull")) return CATEGORY_FILL.pull;
  if (l.includes("storage") || l.includes("tree") || l.includes("plate"))
    return CATEGORY_FILL.storage;
  return CATEGORY_FILL.other;
}

export function RoomPlannerCanvas({
  room,
  layout,
  selectedId,
  onSelect,
  onMove,
  onRotate,
  className,
}: RoomPlannerCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showClearance, setShowClearance] = useState(true);

  const pad = 40;
  const scale = useMemo(() => {
    const maxW = 640;
    const maxH = 480;
    return Math.min(maxW / room.widthMm, maxH / room.lengthMm);
  }, [room.widthMm, room.lengthMm]);

  const svgW = room.widthMm * scale + pad * 2;
  const svgH = room.lengthMm * scale + pad * 2;

  const exclusions = useMemo(() => hardExclusionZones(room), [room]);

  const toSvg = useCallback(
    (xMm: number, yMm: number) => ({
      x: pad + xMm * scale,
      y: pad + yMm * scale,
    }),
    [scale],
  );

  const fromSvg = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { xMm: 0, yMm: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { xMm: 0, yMm: 0 };
      const sp = pt.matrixTransform(ctm.inverse());
      return {
        xMm: Math.round((sp.x - pad) / scale / 50) * 50,
        yMm: Math.round((sp.y - pad) / scale / 50) * 50,
      };
    },
    [scale],
  );

  function onPointerDown(e: React.PointerEvent, p: PlacedEquipment) {
    if (p.locked) {
      setFeedback("Locked — unlock to move.");
      onSelect(p.id);
      return;
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragId(p.id);
    onSelect(p.id);
    setFeedback(null);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragId) return;
    const { xMm, yMm } = fromSvg(e.clientX, e.clientY);
    const placement = layout.placements.find((p) => p.id === dragId);
    if (!placement) return;
    const check = validatePlacementMove({
      room,
      placement,
      others: layout.placements,
      xMm: Math.max(0, xMm),
      yMm: Math.max(0, yMm),
      rotation: placement.rotation,
    });
    if (!check.ok) {
      setFeedback(check.reason ?? "Does not fit here");
      return;
    }
    setFeedback(null);
    onMove(dragId, Math.max(0, xMm), Math.max(0, yMm));
  }

  function onPointerUp() {
    setDragId(null);
  }

  const selected = layout.placements.find((p) => p.id === selectedId);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>
          Room {formatLength(room.widthMm)} × {formatLength(room.lengthMm)} ·
          Ceiling {formatLength(room.heightMm)}
        </span>
        <button
          type="button"
          className="rounded border border-border px-2 py-1 hover:border-accent"
          onClick={() => setShowClearance((v) => !v)}
        >
          {showClearance ? "Hide" : "Show"} clearances
        </button>
        {selected && !selected.locked && (
          <button
            type="button"
            className="rounded border border-border px-2 py-1 hover:border-accent"
            onClick={() =>
              onRotate(
                selected.id,
                ((selected.rotation + 90) % 360) as RotationDeg,
              )
            }
          >
            Rotate 90°
          </button>
        )}
      </div>

      <div className="overflow-auto rounded-xl border border-border bg-[linear-gradient(180deg,#f7f6f2_0%,#ebe8e0_100%)] dark:bg-[linear-gradient(180deg,#1a1a18_0%,#121210_100%)] p-2">
        <svg
          ref={svgRef}
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          role="img"
          aria-label="Home gym floor plan"
          className="mx-auto max-w-full touch-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* Room */}
          <rect
            x={pad}
            y={pad}
            width={room.widthMm * scale}
            height={room.lengthMm * scale}
            fill="rgba(255,255,255,0.55)"
            stroke="currentColor"
            strokeWidth={2}
            className="text-foreground"
          />

          {/* Dimension lines */}
          <text
            x={pad + (room.widthMm * scale) / 2}
            y={pad - 12}
            textAnchor="middle"
            className="fill-muted text-[11px]"
          >
            {formatLength(room.widthMm)}
          </text>
          <text
            x={pad - 12}
            y={pad + (room.lengthMm * scale) / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${pad - 12} ${pad + (room.lengthMm * scale) / 2})`}
            className="fill-muted text-[11px]"
          >
            {formatLength(room.lengthMm)}
          </text>

          {/* Open training hint */}
          {layout.openZones[0] && (
            <rect
              x={toSvg(layout.openZones[0].x, layout.openZones[0].y).x}
              y={toSvg(layout.openZones[0].x, layout.openZones[0].y).y}
              width={layout.openZones[0].width * scale}
              height={layout.openZones[0].depth * scale}
              fill="rgba(45,106,79,0.06)"
              stroke="rgba(45,106,79,0.25)"
              strokeDasharray="4 4"
            />
          )}

          {/* Hard exclusions (door swings etc.) */}
          {exclusions.map((z, i) => {
            const p = toSvg(z.x, z.y);
            return (
              <rect
                key={`ex-${i}`}
                x={p.x}
                y={p.y}
                width={z.width * scale}
                height={z.depth * scale}
                fill="rgba(180,60,60,0.18)"
                stroke="rgba(180,60,60,0.4)"
                strokeDasharray="3 2"
              />
            );
          })}

          {/* Equipment */}
          {layout.placements.map((pl) => {
            const rect = placementRect(
              pl.xMm,
              pl.yMm,
              pl.footprint.widthMm,
              pl.footprint.depthMm,
              pl.rotation,
            );
            const p = toSvg(rect.x, rect.y);
            const isSel = pl.id === selectedId;
            return (
              <g key={pl.id}>
                {showClearance &&
                  isSel &&
                  pl.clearanceZones.map((cz, i) => {
                    const c = toSvg(cz.x, cz.y);
                    return (
                      <rect
                        key={`${pl.id}-cz-${i}`}
                        x={c.x}
                        y={c.y}
                        width={cz.width * scale}
                        height={cz.depth * scale}
                        fill="rgba(61,90,128,0.12)"
                        stroke="rgba(61,90,128,0.35)"
                        strokeDasharray="2 3"
                      />
                    );
                  })}
                <rect
                  x={p.x}
                  y={p.y}
                  width={rect.width * scale}
                  height={rect.depth * scale}
                  rx={3}
                  fill={fillForLabel(pl.label)}
                  opacity={isSel ? 1 : 0.85}
                  stroke={isSel ? "#111" : "rgba(0,0,0,0.35)"}
                  strokeWidth={isSel ? 2.5 : 1}
                  className={cn(
                    "cursor-grab",
                    pl.locked && "cursor-not-allowed",
                    dragId === pl.id && "cursor-grabbing",
                  )}
                  onPointerDown={(e) => onPointerDown(e, pl)}
                  onClick={() => onSelect(pl.id)}
                />
                <text
                  x={p.x + (rect.width * scale) / 2}
                  y={p.y + (rect.depth * scale) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white text-[10px] font-medium"
                  style={{ fontSize: Math.min(11, rect.width * scale * 0.18) }}
                >
                  {pl.label.length > 14 ? `${pl.label.slice(0, 12)}…` : pl.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {feedback && (
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
          {feedback}
        </p>
      )}

      {/* Accessible list equivalent */}
      <ul className="space-y-1 text-sm text-muted">
        {layout.placements.map((pl) => (
          <li key={`list-${pl.id}`}>
            <button
              type="button"
              className={cn(
                "text-left hover:text-foreground",
                selectedId === pl.id && "font-medium text-foreground",
              )}
              onClick={() => onSelect(pl.id)}
            >
              {pl.label} — {wallLabel(pl, room)}
              {pl.locked ? " (locked)" : ""}
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted">
        Open training ~{(layout.utilization.openTrainingMm2 / 1_000_000).toFixed(1)}{" "}
        m² · Footprint{" "}
        {Math.round(layout.utilization.footprintRatio * 100)}% of floor · Clearances
        marked as Kitletics planning assumptions unless manufacturer-specified.
      </p>
    </div>
  );
}

function wallLabel(pl: PlacedEquipment, room: Room): string {
  const nearN = pl.yMm < room.lengthMm * 0.15;
  const nearS = pl.yMm + pl.footprint.depthMm > room.lengthMm * 0.85;
  const nearW = pl.xMm < room.widthMm * 0.15;
  const nearE = pl.xMm + pl.footprint.widthMm > room.widthMm * 0.85;
  if (nearN) return "north wall";
  if (nearS) return "south wall";
  if (nearW) return "west wall";
  if (nearE) return "east wall";
  return "center";
}
