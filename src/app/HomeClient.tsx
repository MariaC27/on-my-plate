"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  members: Array<{ id: string; tasks: Array<{ id: string }> }>;
};

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(155deg,rgba(255,255,255,.075),rgba(255,255,255,.022) 42%,rgba(255,255,255,.01))",
  border: "1px solid rgba(255,255,255,.09)",
  borderRadius: 20,
  boxShadow: "0 20px 60px -30px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.07)",
  backdropFilter: "blur(26px) saturate(1.3)",
  padding: "22px 24px",
  cursor: "pointer",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  padding: "10px 13px",
  font: "400 13px 'Instrument Sans',sans-serif",
  background: "rgba(255,255,255,.05)",
  color: "#ededf0",
  outline: "none",
  flex: 1,
};

export default function HomeClient({ projects: initial }: { projects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function createProject() {
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const project = await res.json();
      router.push(`/project/${project.id}`);
    }
    setCreating(false);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
          <div>
            <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", letterSpacing: "0.16em", color: "rgba(237,237,240,.38)", textTransform: "uppercase", marginBottom: 10 }}>
              Workload
            </div>
            <h1 style={{ font: "600 32px/1.1 'Instrument Sans',sans-serif", letterSpacing: "-0.03em", color: "#ededf0", margin: 0 }}>
              On My Plate
            </h1>
            <p style={{ font: "400 14px/1.5 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.45)", marginTop: 8, marginBottom: 0 }}>
              See everyone&apos;s workload at a glance and who has room for more.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              font: "500 13px 'Instrument Sans',sans-serif",
              color: "#08080a",
              background: "oklch(0.62 0.22 287)",
              border: 0,
              borderRadius: 12,
              padding: "10px 18px",
              cursor: "pointer",
              boxShadow: "0 0 28px -6px oklch(0.62 0.22 287)",
            }}
          >
            New project
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ ...cardStyle, cursor: "default", marginBottom: 24, padding: "20px 24px" }}>
            <div style={{ font: "500 10px/1 'JetBrains Mono',monospace", letterSpacing: "0.14em", color: "rgba(237,237,240,.38)", textTransform: "uppercase", marginBottom: 12 }}>
              New project
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Team Q3"
                onKeyDown={(e) => e.key === "Enter" && createProject()}
                autoFocus
              />
              <button
                onClick={createProject}
                disabled={creating}
                style={{
                  font: "500 13px 'Instrument Sans',sans-serif",
                  color: "#08080a",
                  background: "oklch(0.62 0.22 287)",
                  border: 0,
                  borderRadius: 10,
                  padding: "10px 16px",
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.7 : 1,
                  flexShrink: 0,
                }}
              >
                {creating ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  font: "500 13px 'Instrument Sans',sans-serif",
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
          </div>
        )}

        {/* Project list */}
        {projects.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 96 }}>
            <svg viewBox="0 0 280 280" style={{ width: 120, opacity: 0.3, margin: "0 auto", display: "block" }}>
              <circle cx="140" cy="140" r="119" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth={1} strokeDasharray="6 7" />
              <circle cx="140" cy="140" r="63"  fill="none" stroke="rgba(255,255,255,.1)"  strokeWidth={1} strokeDasharray="6 7" />
              <circle cx="140" cy="140" r="128" fill="none" stroke="oklch(0.62 0.22 287)"   strokeWidth={2} strokeDasharray="2 37.6" strokeLinecap="round" opacity={0.5} />
            </svg>
            <div style={{ font: "600 19px/1.25 'Instrument Sans',sans-serif", color: "#ededf0", marginTop: 28 }}>
              No projects yet
            </div>
            <div style={{ font: "400 13px/1.65 'Instrument Sans',sans-serif", color: "rgba(237,237,240,.45)", marginTop: 10 }}>
              Create one to start tracking your team&apos;s workload.
            </div>
            <button
              onClick={() => setShowForm(true)}
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
              Add a project
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {projects.map((p) => {
              const totalTasks = p.members.reduce((s, m) => s + m.tasks.length, 0);
              return (
                <div
                  key={p.id}
                  style={cardStyle}
                  onClick={() => router.push(`/project/${p.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.16)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 24px 70px -28px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.09)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,.09)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px -30px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.07)";
                  }}
                >
                  <div style={{ font: "600 16px/1.2 'Instrument Sans',sans-serif", color: "#ededf0", letterSpacing: "-0.01em" }}>
                    {p.name}
                  </div>
                  <div style={{ font: "400 12px/1 'JetBrains Mono',monospace", color: "rgba(237,237,240,.38)", marginTop: 12 }}>
                    {p.members.length} member{p.members.length !== 1 ? "s" : ""} · {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
