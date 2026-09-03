"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlateChart from "./PlateChart";
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

type Member = {
  id: string;
  name: string;
  capacityPercent: number;
  tasks: Task[];
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
  const totalUsed = member.tasks.reduce((sum, t) => sum + t.platePercent, 0);
  const remaining = member.capacityPercent - totalUsed;
  const hoveredTask = member.tasks.find((t) => t.id === hoveredTaskId);

  return (
    <Card className="w-64 flex-shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{member.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {totalUsed}% used · {Math.max(0, remaining)}% free
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative">
          <PlateChart
            tasks={member.tasks}
            capacityPercent={member.capacityPercent}
            previewTask={previewTask}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
          />
          {hoveredTask && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[70px] z-10 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs pointer-events-none">
              <p className="font-semibold text-sm mb-1">{hoveredTask.name}</p>
              <p className="text-muted-foreground">{hoveredTask.platePercent}% of plate</p>
              {hoveredTask.dueDate && (
                <p className="text-muted-foreground">Due {formatDate(hoveredTask.dueDate)}</p>
              )}
              <p className="text-muted-foreground">
                Progress: {Math.round(hoveredTask.manualProgress * 100)}%
              </p>
              <p className="text-muted-foreground">
                Opacity: {Math.round(computeOpacity(hoveredTask) * 100)}%
              </p>
              {hoveredTask.isRecurring && <Badge variant="secondary" className="mt-1 text-xs">Recurring</Badge>}
            </div>
          )}
        </div>

        <div className="w-full space-y-1">
          {member.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.color, opacity: computeOpacity(task) }}
              />
              <span className="flex-1 truncate">{task.name}</span>
              <span className="text-muted-foreground flex-shrink-0">{task.platePercent}%</span>
            </div>
          ))}
        </div>

        {onAddTask && (
          <button
            onClick={onAddTask}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-1"
          >
            + Add task
          </button>
        )}
      </CardContent>
    </Card>
  );
}
