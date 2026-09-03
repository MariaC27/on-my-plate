import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { name, capacityPercent } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const member = await prisma.member.create({
    data: { projectId, name: name.trim(), capacityPercent: capacityPercent ?? 100 },
    include: { tasks: true },
  });
  return NextResponse.json(member, { status: 201 });
}
