import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function Home() {
  const projects = await prisma.project.findMany({
    include: { members: { include: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <HomeClient projects={JSON.parse(JSON.stringify(projects))} />;
}
