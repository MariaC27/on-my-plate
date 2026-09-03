"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Project = {
  id: string;
  name: string;
  members: Array<{ id: string; tasks: Array<{ id: string }> }>;
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">On My Plate</h1>
            <p className="text-muted-foreground mt-1">Team workload at a glance</p>
          </div>
          <Button onClick={() => setShowForm(true)}>New project</Button>
        </div>

        {showForm && (
          <div className="mb-8 p-4 bg-white rounded-lg border flex gap-3 items-end max-w-sm">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Project name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Team Q3"
                onKeyDown={(e) => e.key === "Enter" && createProject()}
                autoFocus
              />
            </div>
            <Button onClick={createProject} disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-xl mb-2">No projects yet</p>
            <p className="text-sm">Create one to start tracking your team&apos;s workload</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const totalTasks = p.members.reduce((s, m) => s + m.tasks.length, 0);
              return (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/project/${p.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {p.members.length} member{p.members.length !== 1 ? "s" : ""} · {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
