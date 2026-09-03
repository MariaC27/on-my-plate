import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string; taskId: string }> }
) {
  const { taskId } = await params;
  const { name, platePercent, isRecurring, dueDate, manualProgress, color } = await req.json();
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(name && { name }),
      ...(platePercent !== undefined && { platePercent }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(manualProgress !== undefined && { manualProgress }),
      ...(color && { color }),
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string; taskId: string }> }
) {
  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
