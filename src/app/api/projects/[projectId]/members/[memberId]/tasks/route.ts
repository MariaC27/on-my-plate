import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  const { memberId } = await params;
  const { name, platePercent, isRecurring, dueDate, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!platePercent || platePercent < 1 || platePercent > 100)
    return NextResponse.json({ error: "platePercent must be 1–100" }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      memberId,
      name: name.trim(),
      platePercent,
      isRecurring: isRecurring ?? false,
      dueDate: dueDate ? new Date(dueDate) : null,
      color: color ?? "#6366f1",
    },
  });
  return NextResponse.json(task, { status: 201 });
}
