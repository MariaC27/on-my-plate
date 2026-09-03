"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MemberPlate from "@/components/plate/MemberPlate";
import AddTaskDialog from "@/components/plate/AddTaskDialog";

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

type Project = {
  id: string;
  name: string;
  members: Member[];
};

export default function ProjectPageClient({ project: initial }: { project: Project }) {
  const [project, setProject] = useState(initial);
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [dialogMemberId, setDialogMemberId] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const dialogMember = project.members.find((m) => m.id === dialogMemberId);

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

  function handleTaskAdded(memberId: string, task: Task) {
    setProject((p) => ({
      ...p,
      members: p.members.map((m) =>
        m.id === memberId ? { ...m, tasks: [...m.tasks, task] } : m
      ),
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground mb-1 block">
              ← All projects
            </a>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {project.members.length} team member{project.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowAddMember(true)}>Add member</Button>
        </div>

        {showAddMember && (
          <div className="mb-6 p-4 bg-white rounded-lg border flex gap-3 items-end max-w-sm">
            <div className="flex-1 space-y-1">
              <Label>Member name</Label>
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="e.g. Maria"
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                autoFocus
              />
            </div>
            <Button onClick={addMember} disabled={addingMember}>
              {addingMember ? "Adding…" : "Add"}
            </Button>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
          </div>
        )}

        {project.members.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">No team members yet</p>
            <p className="text-sm">Add a member to get started</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
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
