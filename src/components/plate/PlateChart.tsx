"use client";

import { computeOpacity } from "@/lib/opacity";

type Task = {
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
  tasks: Task[];
  capacityPercent: number;
  size?: number;
  previewTask?: { name: string; platePercent: number; color: string } | null;
  hoveredTaskId?: string | null;
  onHoverTask?: (id: string | null) => void;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function PlateChart({
  tasks,
  capacityPercent,
  size = 240,
  previewTask,
  hoveredTaskId,
  onHoverTask,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  const totalUsed = tasks.reduce((sum, t) => sum + t.platePercent, 0);
  const previewPct = previewTask?.platePercent ?? 0;
  const totalWithPreview = Math.min(totalUsed + previewPct, capacityPercent);

  let cursor = 0;
  const wedges: Array<{
    id: string;
    path: string;
    color: string;
    opacity: number;
    isPreview?: boolean;
    task?: Task;
  }> = [];

  for (const task of tasks) {
    const pct = Math.min(task.platePercent, capacityPercent - cursor);
    if (pct <= 0) break;
    const startDeg = (cursor / capacityPercent) * 360;
    const endDeg = ((cursor + pct) / capacityPercent) * 360;
    wedges.push({
      id: task.id,
      path: wedgePath(cx, cy, r, startDeg, endDeg),
      color: task.color,
      opacity: computeOpacity(task),
      task,
    });
    cursor += pct;
  }

  if (previewTask && previewPct > 0 && cursor < capacityPercent) {
    const available = capacityPercent - cursor;
    const pct = Math.min(previewPct, available);
    const startDeg = (cursor / capacityPercent) * 360;
    const endDeg = ((cursor + pct) / capacityPercent) * 360;
    wedges.push({
      id: "preview",
      path: wedgePath(cx, cy, r, startDeg, endDeg),
      color: previewTask.color,
      opacity: 0.4,
      isPreview: true,
    });
  }

  const remainingPct = capacityPercent - totalWithPreview;
  if (remainingPct > 0) {
    const startDeg = (totalWithPreview / capacityPercent) * 360;
    const endDeg = 360;
    wedges.push({
      id: "remaining",
      path: wedgePath(cx, cy, r, startDeg, endDeg),
      color: "#e5e7eb",
      opacity: 1,
    });
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 6} fill="white" stroke="#e5e7eb" strokeWidth={2} />
      {wedges.map((w) => (
        <path
          key={w.id}
          d={w.path}
          fill={w.color}
          fillOpacity={w.opacity}
          stroke="white"
          strokeWidth={2}
          strokeDasharray={w.isPreview ? "6 3" : undefined}
          style={{ cursor: w.task ? "pointer" : "default", transition: "fill-opacity 0.3s" }}
          onMouseEnter={() => w.task && onHoverTask?.(w.id)}
          onMouseLeave={() => onHoverTask?.(null)}
          opacity={hoveredTaskId && hoveredTaskId !== w.id ? 0.6 : 1}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.38} fill="white" />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize={18}
        fontWeight="600"
        fill="#111827"
      >
        {Math.min(totalUsed, capacityPercent)}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="#6b7280">
        of {capacityPercent}%
      </text>
    </svg>
  );
}
