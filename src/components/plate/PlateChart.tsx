"use client";

import { computeOpacity } from "@/lib/opacity";

export type PlateTask = {
  id: string;
  name: string;
  platePercent: number;
  isRecurring: boolean;
  startDate: string | Date;
  dueDate?: string | Date | null;
  manualProgress: number;
  color: string;
};

type Props = {
  tasks: PlateTask[];
  capacityPercent: number;
  size?: number;
  previewTask?: { name: string; platePercent: number; color: string } | null;
  hoveredTaskId?: string | null;
  onHoverTask?: (id: string | null) => void;
};

const CX = 140, CY = 140;
const R0 = 64, R1 = 118;
const GAP = 0.0042;
const ACCENT = "oklch(0.62 0.22 287)";
const COOL   = "oklch(0.72 0.12 214)";
const DANGER = "oklch(0.68 0.18 25)";

function ptAt(r: number, f: number): [number, number] {
  const a = (f * 360 - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function annularSeg(r0: number, r1: number, f0: number, f1: number): string {
  if (f1 - f0 <= 0.0005) return "";
  const [x1, y1] = ptAt(r1, f0), [x2, y2] = ptAt(r1, f1);
  const [x3, y3] = ptAt(r0, f1), [x4, y4] = ptAt(r0, f0);
  const laf = f1 - f0 > 0.5 ? 1 : 0;
  const n = (v: number) => Math.round(v * 100) / 100;
  return `M${n(x1)} ${n(y1)}A${r1} ${r1} 0 ${laf} 1 ${n(x2)} ${n(y2)}L${n(x3)} ${n(y3)}A${r0} ${r0} 0 ${laf} 0 ${n(x4)} ${n(y4)}Z`;
}

export default function PlateChart({
  tasks,
  capacityPercent,
  size = 220,
  previewTask,
  hoveredTaskId,
  onHoverTask,
}: Props) {
  const totalUsed = tasks.reduce((s, t) => s + t.platePercent, 0);
  const rawPct = totalUsed / capacityPercent;
  const loadPct = Math.round(rawPct * 100);
  const isOver = loadPct > 100;

  const loadColor = isOver
    ? DANGER
    : loadPct >= 90
    ? "oklch(0.78 0.17 287)"
    : "#ededf0";

  type Wedge = {
    key: string;
    taskId: string;
    path: string;
    fill: string;
    stroke: string;
    dashArray: string;
    opacity: number;
    dx: number;
    dy: number;
    interactive: boolean;
    animDelay: number;
  };

  const wedges: Wedge[] = [];
  let cursor = 0;

  tasks.forEach((task, i) => {
    const f0 = cursor / capacityPercent;
    const f1raw = (cursor + task.platePercent) / capacityPercent;
    const f1clamped = Math.min(1, f1raw);
    const isHovered = hoveredTaskId === task.id;
    const mid = (f0 + Math.min(f1clamped, 1)) / 2;
    const midAngle = (mid * 360 - 90) * (Math.PI / 180);
    const dx = isHovered ? 7 * Math.cos(midAngle) : 0;
    const dy = isHovered ? 7 * Math.sin(midAngle) : 0;
    const fill = task.isRecurring ? COOL : task.color;
    const opacity = computeOpacity(task);

    if (f0 < 1) {
      const path = annularSeg(R0, R1, f0, Math.min(f1clamped, 1) - GAP);
      if (path) {
        wedges.push({
          key: task.id,
          taskId: task.id,
          path,
          fill,
          stroke: task.isRecurring ? fill : "transparent",
          dashArray: task.isRecurring ? "4 3" : "none",
          opacity,
          dx, dy,
          interactive: true,
          animDelay: i * 70,
        });
      }
    }

    if (f1raw > 1) {
      const overPath = annularSeg(124, 136, Math.max(0, f0 - 1), f1raw - 1 - GAP);
      if (overPath) {
        wedges.push({
          key: task.id + "_over",
          taskId: task.id,
          path: overPath,
          fill: DANGER,
          stroke: DANGER,
          dashArray: "none",
          opacity: 0.85,
          dx: 0, dy: 0,
          interactive: false,
          animDelay: i * 70,
        });
      }
    }

    cursor += task.platePercent;
  });

  const freeStart = Math.min(totalUsed, capacityPercent) / capacityPercent;
  const freeArc = freeStart < 1 ? annularSeg(R0, R1, freeStart, 1) : "";

  const previewTotal = totalUsed + (previewTask?.platePercent ?? 0);
  const previewPct = Math.round((previewTotal / capacityPercent) * 100);
  const previewLoadColor = previewPct > 100
    ? DANGER
    : previewPct >= 90
    ? "oklch(0.78 0.17 287)"
    : "#ededf0";

  let ghostPath = "";
  if (previewTask && previewTask.platePercent > 0) {
    const gf0 = Math.min(1, totalUsed / capacityPercent);
    const gf1 = Math.min(1, previewTotal / capacityPercent) - GAP;
    if (gf1 > gf0) ghostPath = annularSeg(R0, R1, gf0, gf1);
  }

  const displayPct = previewTask ? previewPct : loadPct;
  const displayColor = previewTask ? previewLoadColor : loadColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Guide rings */}
      <circle cx={CX} cy={CY} r={119} fill="none" stroke="rgba(255,255,255,.085)" strokeWidth={1} />
      <circle cx={CX} cy={CY} r={63}  fill="none" stroke="rgba(255,255,255,.07)"  strokeWidth={1} />
      <circle cx={CX} cy={CY} r={128} fill="none" stroke="rgba(255,255,255,.16)"  strokeWidth={2}
        strokeDasharray="2 37.6" strokeLinecap="round" />

      {/* Free arc */}
      {freeArc && (
        <path
          d={freeArc}
          fill="rgba(255,255,255,.035)"
          stroke="rgba(255,255,255,.09)"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      )}

      {/* Task wedges */}
      {wedges.map((w) => (
        <path
          key={w.key}
          d={w.path}
          fill={w.fill}
          stroke={w.stroke}
          strokeDasharray={w.dashArray}
          strokeWidth={1}
          style={{
            opacity: w.opacity,
            transform: (w.dx || w.dy) ? `translate(${w.dx.toFixed(2)}px,${w.dy.toFixed(2)}px)` : undefined,
            filter: hoveredTaskId === w.taskId ? `drop-shadow(0 0 16px ${w.fill})` : undefined,
            cursor: w.interactive ? "pointer" : "default",
            transition: "opacity 0.3s ease, filter 0.2s ease, transform 0.25s cubic-bezier(.2,.9,.2,1)",
          }}
          onMouseEnter={() => w.interactive && onHoverTask?.(w.taskId)}
          onMouseLeave={() => onHoverTask?.(null)}
        />
      ))}

      {/* Preview ghost */}
      {ghostPath && (
        <path
          d={ghostPath}
          fill={previewPct > 100 ? "oklch(0.68 0.18 25 / .18)" : "oklch(0.62 0.22 287 / .22)"}
          stroke={previewPct > 100 ? DANGER : ACCENT}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          style={{ animation: "ghostPulse 2.4s ease-in-out infinite" }}
        />
      )}

      {/* Center percentage */}
      <text
        x={CX}
        y={CY - 5}
        textAnchor="middle"
        fontSize={27}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="500"
        fill={displayColor}
        letterSpacing="-0.02em"
      >
        {displayPct}
        <tspan fontSize={13} opacity={0.5}>%</tspan>
      </text>
      <text
        x={CX}
        y={CY + 14}
        textAnchor="middle"
        fontSize={9.5}
        fontFamily="'JetBrains Mono', monospace"
        fill="rgba(237,237,240,.34)"
        letterSpacing="0.1em"
      >
        {isOver ? "OVER" : "FULL"}
      </text>
    </svg>
  );
}
