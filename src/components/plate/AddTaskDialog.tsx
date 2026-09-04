"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlateTask } from "./PlateChart";
import PlateChart from "./PlateChart";

const COLORS = [
  "oklch(0.62 0.22 287)",
  "oklch(0.72 0.12 214)",
  "oklch(0.78 0.14 155)",
  "oklch(0.72 0.17 25)",
  "oklch(0.80 0.13 172)",
  "oklch(0.75 0.15 50)",
  "oklch(0.70 0.18 340)",
  "oklch(0.76 0.10 240)",
];

type Props = {
  open: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
  projectId: string;
  existingTasks: PlateTask[];
  capacityPercent: number;
  onTaskAdded: (task: PlateTask) => void;
};

const fieldStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  padding: "10px 13px",
  font: "400 13px 'Instrument Sans',sans-serif",
  background: "rgba(255,255,255,.05)",
  color: "#ededf0",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  font: "400 10px/1 'JetBrains Mono',monospace",
  letterSpacing: "0.1em",
  color: "rgba(237,237,240,.4)",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 8,
};

export default function AddTaskDialog({
  open,
  onClose,
  memberName,
  memberId,
  projectId,
  existingTasks,
  capacityPercent,
  onTaskAdded,
}: Props) {
  const [name, setName] = useState("");
  const [platePercent, setPlatePercent] = useState(20);
  const [isRecurring, setIsRecurring] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalUsed = existingTasks.reduce((s, t) => s + t.platePercent, 0);
  const projected = Math.round(((totalUsed + platePercent) / capacityPercent) * 100);
  const wouldOverfill = totalUsed + platePercent > capacityPercent;

  const fitColor = projected > 100
    ? "oklch(0.68 0.18 25)"
    : projected > 92
    ? "oklch(0.78 0.17 287)"
    : "oklch(0.80 0.13 172)";

  async function handleSubmit() {
    if (!name.trim()) { setError("Task name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, platePercent, isRecurring, dueDate: dueDate || null, color }),
      });
      if (!res.ok) throw new Error();
      const task = await res.json();
      onTaskAdded(task);
      handleClose();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setName(""); setPlatePercent(20); setIsRecurring(false);
    setDueDate(""); setColor(COLORS[0]); setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        style={{
          background: "linear-gradient(155deg,rgba(255,255,255,.075),rgba(255,255,255,.022) 42%,rgba(255,255,255,.01))",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 24,
          boxShadow: "0 40px 90px -40px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.07)",
          backdropFilter: "blur(26px) saturate(1.3)",
          maxWidth: 780,
          padding: "30px 32px 32px",
        }}
        className="gap-0"
      >
        <DialogHeader className="mb-6">
          <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", letterSpacing: "0.16em", color: "rgba(237,237,240,.38)", textTransform: "uppercase", marginBottom: 8 }}>
            New task
          </div>
          <DialogTitle style={{ font: "600 20px/1.2 'Instrument Sans',sans-serif", letterSpacing: "-0.02em", color: "#ededf0" }}>
            Assign to {memberName}
          </DialogTitle>
        </DialogHeader>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 32 }}>
          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Task</label>
              <input
                style={fieldStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Export pipeline v2"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Delivery</label>
                <input
                  type="date"
                  style={{ ...fieldStyle, colorScheme: "dark" }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isRecurring}
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: "flex", gap: 7 }}>
                  {["Sprint", "Recurring"].map((type) => {
                    const active = type === "Recurring" ? isRecurring : !isRecurring;
                    return (
                      <button
                        key={type}
                        onClick={() => setIsRecurring(type === "Recurring")}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          border: `1px solid ${active ? "oklch(0.62 0.22 287)" : "rgba(255,255,255,.1)"}`,
                          borderRadius: 12,
                          padding: "10px 0",
                          font: `${active ? "500" : "400"} 12px 'Instrument Sans',sans-serif`,
                          color: active ? "oklch(0.78 0.17 287)" : "rgba(237,237,240,.45)",
                          background: active ? "oklch(0.62 0.22 287 / .18)" : "transparent",
                          cursor: "pointer",
                          transition: "all .18s ease",
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Share of plate</label>
                <span style={{ font: "500 15px/1 'JetBrains Mono',monospace", color: wouldOverfill ? "oklch(0.68 0.18 25)" : "oklch(0.78 0.17 287)" }}>
                  {platePercent}%
                </span>
              </div>
              <input
                type="range"
                className="pl-slider"
                min={5}
                max={100}
                step={5}
                value={platePercent}
                onChange={(e) => setPlatePercent(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, font: "400 10px 'JetBrains Mono',monospace", color: "rgba(237,237,240,.28)" }}>
                <span>5</span>
                <span>full sprint · 100</span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: c,
                      border: `2px solid ${color === c ? "#ededf0" : "transparent"}`,
                      outline: color === c ? "none" : "none",
                      cursor: "pointer",
                      transform: color === c ? "scale(1.15)" : "scale(1)",
                      transition: "transform .18s ease, border-color .18s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fit indicator */}
            <div style={{
              padding: "13px 15px",
              borderRadius: 14,
              border: `1px solid ${wouldOverfill ? "oklch(0.68 0.18 25 / .35)" : projected > 92 ? "oklch(0.62 0.22 287 / .38)" : "rgba(255,255,255,.09)"}`,
              background: wouldOverfill ? "oklch(0.68 0.18 25 / .09)" : projected > 92 ? "oklch(0.62 0.22 287 / .10)" : "rgba(255,255,255,.03)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", font: "400 11.5px 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.45)" }}>
                <span>On the plate now</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#ededf0" }}>{Math.round(totalUsed / capacityPercent * 100)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", font: "400 11.5px 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.45)", marginTop: 6 }}>
                <span>This task</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: fitColor }}>+{platePercent}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", font: "400 11.5px 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.45)", marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <span>{wouldOverfill ? "Over capacity" : "Left on plate"}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: fitColor }}>
                  {wouldOverfill ? `+${projected - 100}%` : `${100 - projected}%`}
                </span>
              </div>
            </div>

            {error && <p style={{ font: "400 12px 'Instrument Sans',sans-serif", color: "oklch(0.68 0.18 25)" }}>{error}</p>}
          </div>

          {/* Plate preview */}
          <div style={{ borderLeft: "1px solid rgba(255,255,255,.06)", paddingLeft: 28 }}>
            <PlateChart
              tasks={existingTasks}
              capacityPercent={capacityPercent}
              size={212}
              previewTask={name ? { name, platePercent, color } : null}
            />
          </div>
        </div>

        <DialogFooter style={{ marginTop: 24, gap: 8 }}>
          <button
            onClick={handleClose}
            style={{
              font: "500 12.5px 'Instrument Sans',sans-serif",
              color: "rgba(237,237,240,.6)",
              background: "transparent",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              font: "500 12.5px 'Instrument Sans',sans-serif",
              color: "#08080a",
              background: "oklch(0.62 0.22 287)",
              border: 0,
              borderRadius: 12,
              padding: "10px 18px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              boxShadow: "0 0 24px -6px oklch(0.62 0.22 287)",
            }}
          >
            {saving ? "Adding…" : "Add task"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
