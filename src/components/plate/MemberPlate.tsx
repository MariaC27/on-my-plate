"use client";

import { useState } from "react";
import PlateChart, { PlateTask } from "./PlateChart";
import { computeOpacity } from "@/lib/opacity";

type Member = {
  id: string;
  name: string;
  capacityPercent: number;
  tasks: PlateTask[];
};

type Props = {
  member: Member;
  previewTask?: { name: string; platePercent: number; color: string } | null;
  onAddTask?: () => void;
};

function formatDate(d: string | Date | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MemberPlate({ member, previewTask, onAddTask }: Props) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const totalUsed = member.tasks.reduce((s, t) => s + t.platePercent, 0);
  const loadPct = Math.round((totalUsed / member.capacityPercent) * 100);
  const remaining = member.capacityPercent - totalUsed;
  const isOver = loadPct > 100;

  const hintText = isOver
    ? `Over by ${loadPct - 100}%`
    : loadPct <= 60
    ? "Room for more"
    : `${Math.max(0, remaining)}% free`;

  const hintColor = isOver
    ? "oklch(0.68 0.18 25)"
    : loadPct <= 60
    ? "oklch(0.80 0.13 172)"
    : "rgba(237,237,240,.4)";

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 18,
        padding: "20px 16px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        background: "linear-gradient(180deg,rgba(255,255,255,.022),transparent)",
        width: 200,
        flexShrink: 0,
      }}
    >
      <PlateChart
        tasks={member.tasks}
        capacityPercent={member.capacityPercent}
        size={180}
        previewTask={previewTask}
        hoveredTaskId={hoveredTaskId}
        onHoverTask={setHoveredTaskId}
      />

      <div style={{ marginTop: 14, textAlign: "center" }}>
        <div style={{ font: "600 14px/1.2 'Instrument Sans',sans-serif", color: "#ededf0" }}>
          {member.name}
        </div>
      </div>

      <div style={{ height: 22, display: "flex", alignItems: "center", marginTop: 6 }}>
        <div style={{ font: "400 11px/1.3 'Instrument Sans',sans-serif", color: hintColor, textAlign: "center" }}>
          {hintText}
        </div>
      </div>

      {member.tasks.length > 0 && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, marginTop: 10 }}>
          {member.tasks.map((task) => {
            const isHovered = hoveredTaskId === task.id;
            const fill = task.isRecurring ? "oklch(0.72 0.12 214)" : task.color;
            const op = computeOpacity(task);
            return (
              <div
                key={task.id}
                onMouseEnter={() => setHoveredTaskId(task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "14px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "9px 10px",
                  borderRadius: 10,
                  border: "1px solid",
                  borderColor: isHovered ? "rgba(255,255,255,.08)" : "transparent",
                  background: isHovered ? "rgba(255,255,255,.04)" : "transparent",
                  cursor: "default",
                  transition: "background .18s ease, border-color .18s ease",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: task.isRecurring ? 2 : "50%",
                    background: fill,
                    opacity: op + 0.15,
                    display: "block",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ font: "500 12px/1.25 'Instrument Sans',sans-serif", color: "#ededf0" }}>
                    {task.name}
                  </div>
                  {isHovered && (
                    <div style={{ font: "400 10px/1 'JetBrains Mono',monospace", color: "rgba(237,237,240,.36)", marginTop: 5, animation: "rowIn .18s ease both" }}>
                      {task.isRecurring
                        ? "recurring · reserved"
                        : `due ${formatDate(task.dueDate) ?? "—"} · ${Math.round(task.manualProgress * 100)}% done`}
                    </div>
                  )}
                </div>
                <div style={{ font: "500 11px/1 'JetBrains Mono',monospace", color: "rgba(237,237,240,.6)" }}>
                  {task.platePercent}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      {onAddTask && (
        <button
          onClick={onAddTask}
          style={{
            marginTop: 12,
            font: "500 11.5px 'Instrument Sans',sans-serif",
            color: "oklch(0.78 0.17 287)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
            transition: "background .18s ease, border-color .18s ease",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,.04)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "transparent";
          }}
        >
          + Add task
        </button>
      )}
    </div>
  );
}
