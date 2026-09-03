"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import PlateChart from "./PlateChart";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

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
  open: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
  projectId: string;
  existingTasks: Task[];
  capacityPercent: number;
  onTaskAdded: (task: Task) => void;
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
  const wouldOverfill = totalUsed + platePercent > capacityPercent;

  async function handleSubmit() {
    if (!name.trim()) { setError("Task name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/members/${memberId}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, platePercent, isRecurring, dueDate: dueDate || null, color }),
        }
      );
      if (!res.ok) throw new Error("Failed to create task");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add task for {memberName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <PlateChart
              tasks={existingTasks}
              capacityPercent={capacityPercent}
              size={180}
              previewTask={name ? { name, platePercent, color } : null}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="task-name">Task name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Redesign Analytics"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Plate size</Label>
              <span className={`text-sm font-semibold ${wouldOverfill ? "text-red-500" : "text-indigo-600"}`}>
                {platePercent}%
              </span>
            </div>
            <Slider
              min={5}
              max={100}
              step={5}
              value={[platePercent]}
              onValueChange={(v) => setPlatePercent(Array.isArray(v) ? v[0] : v)}
            />
            {wouldOverfill && (
              <p className="text-xs text-red-500">
                This exceeds {memberName}&apos;s remaining capacity ({capacityPercent - totalUsed}%)
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="due-date">Due date (optional)</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="recurring">Recurring task (won&apos;t fade)</Label>
          </div>

          <div className="space-y-1">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Adding…" : "Add task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
