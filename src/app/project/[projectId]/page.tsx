import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectPageClient from "./ProjectPageClient";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { include: { tasks: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!project) notFound();
  return <ProjectPageClient project={JSON.parse(JSON.stringify(project))} />;
}
