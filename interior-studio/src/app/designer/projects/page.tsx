import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

export default async function ProjectsPage() {
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { designerId },
    include: {
      client: { select: { name: true, email: true } },
      _count: { select: { rooms: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#8B7355" }}>Designer Portal</p>
          <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>All Projects</h1>
        </div>
        <Link href="/designer/projects/new" className="text-xs tracking-widest uppercase px-5 py-2.5"
          style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-xl font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No projects yet</p>
          <Link href="/designer/projects/new" className="text-xs tracking-widest uppercase px-6 py-3 mt-4 inline-block"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/designer/projects/${project.id}`}
              className="flex items-center justify-between p-6 border rounded-sm hover:border-[#8B7355] transition-colors"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
              <div>
                <h2 className="font-light text-xl mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                  {project.name}
                </h2>
                <p className="text-sm" style={{ color: "#7A7A7A" }}>
                  {project.client.name} · {project._count.rooms} room{project._count.rooms !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs tracking-widest uppercase px-3 py-1"
                  style={{ backgroundColor: "#F0EDE8", color: "#8B7355" }}>
                  {project.status === "ACTIVE" || project.status === "DRAFT" ? "Draft" : project.status === "PUBLISHED" || project.status === "COMPLETED" ? "Published" : project.status}
                </span>
                <span className="text-xs" style={{ color: "#7A7A7A" }}>
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
