"use client";

import { useState } from "react";
import MemberPlate from "@/components/plate/MemberPlate";
import AddTaskDialog from "@/components/plate/AddTaskDialog";
import { PlateTask } from "@/components/plate/PlateChart";

type Member = {
  id: string;
  name: string;
  capacityPercent: number;
  tasks: PlateTask[];
};

type Project = {
  id: string;
  name: string;
  members: Member[];
};

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  padding: "10px 13px",
  font: "400 13px 'Instrument Sans',sans-serif",
  background: "rgba(255,255,255,.05)",
  color: "#ededf0",
  outline: "none",
};

export default function ProjectPageClient({ project: initial }: { project: Project }) {
  const [project, setProject] = useState(initial);
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [dialogMemberId, setDialogMemberId] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const dialogMember = project.members.find((m) => m.id === dialogMemberId);

  const teamLoadPct = project.members.length > 0
    ? Math.round(
        project.members.reduce((sum, m) => {
          const used = m.tasks.reduce((s, t) => s + t.platePercent, 0);
          return sum + Math.round((used / m.capacityPercent) * 100);
        }, 0) / project.members.length
      )
    : 0;

  async function addMember() {
    if (!newMemberName.trim()) return;
    setAddingMember(true);
    const res = await fetch(`/api/projects/${project.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMemberName.trim() }),
    });
    if (res.ok) {
      const member = await res.json();
      setProject((p) => ({ ...p, members: [...p.members, member] }));
      setNewMemberName("");
      setShowAddMember(false);
    }
    setAddingMember(false);
  }

  function handleTaskAdded(memberId: string, task: PlateTask) {
    setProject((p) => ({
      ...p,
      members: p.members.map((m) =>
        m.id === memberId ? { ...m, tasks: [...m.tasks, task] } : m
      ),
    }));
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <a
              href="/"
              style={{ font: "400 11px/1 'JetBrains Mono',monospace", color: "rgba(237,237,240,.38)", letterSpacing: "0.06em", textDecoration: "none", display: "block", marginBottom: 12 }}
            >
              ← All projects
            </a>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h1 style={{ font: "600 25px/1.15 'Instrument Sans',sans-serif", letterSpacing: "-0.02em", color: "#ededf0", margin: 0 }}>
                {project.name}
              </h1>
            </div>
            <div style={{ font: "400 12px/1 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.4)", marginTop: 8 }}>
              {project.members.length} member{project.members.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {project.members.length > 0 && (
              <>
                <div style={{ textAlign: "right" }}>
                  <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", letterSpacing: "0.14em", color: "rgba(237,237,240,.38)", textTransform: "uppercase" }}>
                    Team load
                  </div>
                  <div style={{ font: "500 22px/1.2 'JetBrains Mono',monospace", marginTop: 7, color: "#ededf0" }}>
                    {teamLoadPct}%
                  </div>
                </div>
                <div style={{ width: 1, height: 34, background: "rgba(255,255,255,.09)" }} />
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, font: "400 11.5px 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.55)" }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: "oklch(0.62 0.22 287)", display: "inline-block" }} />
                    Sprint work
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, font: "400 11.5px 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.55)" }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: "oklch(0.72 0.12 214)", opacity: 0.55, border: "1px dashed oklch(0.72 0.12 214)", display: "inline-block" }} />
                    Recurring
                  </div>
                </div>
              </>
            )}
            <button
              onClick={() => setShowAddMember(true)}
              style={{
                font: "500 12.5px 'Instrument Sans',sans-serif",
                color: "#08080a",
                background: "oklch(0.62 0.22 287)",
                border: 0,
                borderRadius: 12,
                padding: "9px 15px",
                cursor: "pointer",
                boxShadow: "0 0 22px -6px oklch(0.62 0.22 287)",
              }}
            >
              Add member
            </button>
          </div>
        </div>

        {/* Add member form */}
        {showAddMember && (
          <div style={{
            background: "linear-gradient(155deg,rgba(255,255,255,.06),rgba(255,255,255,.02))",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 16,
            padding: "18px 20px",
            marginBottom: 28,
            display: "flex",
            gap: 10,
            alignItems: "center",
            maxWidth: 440,
          }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Teammate's name"
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              autoFocus
            />
            <button
              onClick={addMember}
              disabled={addingMember}
              style={{
                font: "500 12.5px 'Instrument Sans',sans-serif",
                color: "#08080a",
                background: "oklch(0.62 0.22 287)",
                border: 0,
                borderRadius: 10,
                padding: "10px 14px",
                cursor: addingMember ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}
            >
              {addingMember ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => setShowAddMember(false)}
              style={{
                font: "500 12.5px 'Instrument Sans',sans-serif",
                color: "rgba(237,237,240,.6)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Plates grid */}
        {project.members.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <svg viewBox="0 0 280 280" style={{ width: 140, opacity: 0.3, margin: "0 auto", display: "block" }}>
              <circle cx="140" cy="140" r="119" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth={1} strokeDasharray="6 7" />
              <circle cx="140" cy="140" r="63"  fill="none" stroke="rgba(255,255,255,.1)"  strokeWidth={1} strokeDasharray="6 7" />
              <circle cx="140" cy="140" r="128" fill="none" stroke="oklch(0.62 0.22 287)"   strokeWidth={2} strokeDasharray="2 37.6" strokeLinecap="round" opacity={0.5} />
            </svg>
            <div style={{ font: "600 19px/1.25 'Instrument Sans',sans-serif", color: "#ededf0", marginTop: 28 }}>
              No plates on {project.name} yet
            </div>
            <div style={{ font: "400 13px/1.65 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.45)", marginTop: 10, maxWidth: 360, margin: "10px auto 0" }}>
              Add a teammate to give them a plate. You fill it.
            </div>
            <button
              onClick={() => setShowAddMember(true)}
              style={{
                marginTop: 24,
                font: "500 13px 'Instrument Sans',sans-serif",
                color: "#08080a",
                background: "oklch(0.62 0.22 287)",
                border: 0,
                borderRadius: 12,
                padding: "11px 20px",
                cursor: "pointer",
                boxShadow: "0 0 28px -6px oklch(0.62 0.22 287)",
              }}
            >
              Add a plate
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {project.members.map((member) => (
              <MemberPlate
                key={member.id}
                member={member}
                onAddTask={() => setDialogMemberId(member.id)}
              />
            ))}
          </div>
        )}
      </div>

      {dialogMember && (
        <AddTaskDialog
          open={true}
          onClose={() => setDialogMemberId(null)}
          memberName={dialogMember.name}
          memberId={dialogMember.id}
          projectId={project.id}
          existingTasks={dialogMember.tasks}
          capacityPercent={dialogMember.capacityPercent}
          onTaskAdded={(task) => handleTaskAdded(dialogMember.id, task)}
        />
      )}
    </div>
  );
}
