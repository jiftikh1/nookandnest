import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ProjectPhotoLibrary from "./ProjectPhotoLibrary";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

export default async function ProjectPhotosPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId },
    include: { rooms: { select: { id: true, name: true }, orderBy: { order: "asc" } } },
  });

  if (!project) notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← {project.name}
        </Link>
      </div>

      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>{project.name}</p>
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Photo Library
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#7A7A7A" }}>
          Upload all project photos here. Tag each photo to a room — or create a new room on the spot.
        </p>
      </div>

      <ProjectPhotoLibrary projectId={projectId} rooms={project.rooms} />
    </div>
  );
}
