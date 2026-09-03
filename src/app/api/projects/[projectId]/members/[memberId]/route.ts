import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  const { memberId } = await params;
  await prisma.member.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  const { memberId } = await params;
  const { name, capacityPercent } = await req.json();
  const member = await prisma.member.update({
    where: { id: memberId },
    data: { ...(name && { name }), ...(capacityPercent !== undefined && { capacityPercent }) },
    include: { tasks: true },
  });
  return NextResponse.json(member);
}
