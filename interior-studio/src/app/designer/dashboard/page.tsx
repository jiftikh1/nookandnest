import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { projectProgress } from "@/lib/spaces";
import { redirect } from "next/navigation";

async function getDesigner() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return prisma.user.findUnique({ where: { email: user.email! } });
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  ACTIVE: "Draft",      // legacy
  COMPLETED: "Published", // legacy
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "#F0EDE8", text: "#8B7355" },
  IN_REVIEW: { bg: "#FFF8E7", text: "#B8860B" },
  PUBLISHED: { bg: "#E8F5E9", text: "#4A7B5B" },
  ARCHIVED:  { bg: "#E0DCD6", text: "#7A7A7A" },
  ACTIVE:    { bg: "#F0EDE8", text: "#8B7355" },
  COMPLETED: { bg: "#E8F5E9", text: "#4A7B5B" },
};

export default async function DesignerDashboard() {
  const designer = await getDesigner();
  if (!designer) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { designerId: designer.id },
    include: {
      client: { select: { name: true, email: true } },
      rooms: { select: { status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStatus = (status: string) => projects.filter((p) => p.status === status || (status === "DRAFT" && p.status === "ACTIVE") || (status === "PUBLISHED" && p.status === "COMPLETED")).length;

  const allRooms = projects.flatMap((p) => p.rooms);
  const awaitingClient = allRooms.filter((r) => r.status === "IN_REVIEW").length;
  const changesRequested = allRooms.filter((r) => r.status === "CHANGES_REQUESTED").length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#8B7355" }}>
          Studio Dashboard
        </p>
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Welcome back, {designer.name.split(" ")[0]}
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {[
          { label: "Total Projects", value: projects.length },
          { label: "Draft", value: byStatus("DRAFT") },
          { label: "In Review", value: byStatus("IN_REVIEW") },
          { label: "Published", value: byStatus("PUBLISHED") },
          { label: "Awaiting Client", value: awaitingClient },
          { label: "Changes Requested", value: changesRequested },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-sm border" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
            <p className="text-3xl font-light mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
              {stat.value}
            </p>
            <p className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          All Projects
        </h2>
        <Link
          href="/designer/projects/new"
          className="text-xs tracking-widest uppercase px-5 py-2.5 transition-colors"
          style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>
            No projects yet
          </p>
          <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Create your first client project to get started.</p>
          <Link href="/designer/projects/new" className="text-xs tracking-widest uppercase px-6 py-3" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const colors = STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT;
            const progress = projectProgress(project, project.rooms);
            const inReview = project.rooms.filter((r) => r.status === "IN_REVIEW").length;
            const toRevise = project.rooms.filter((r) => r.status === "CHANGES_REQUESTED").length;
            return (
              <Link
                key={project.id}
                href={`/designer/projects/${project.id}`}
                className="flex flex-wrap items-center justify-between gap-4 p-6 border rounded-sm hover:border-[#8B7355] transition-colors"
                style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}
              >
                <div className="flex-1 min-w-[14rem]">
                  <h3 className="font-light text-lg mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                    {project.name}
                  </h3>
                  <p className="text-sm" style={{ color: "#7A7A7A" }}>
                    {project.client.name} · {progress.completed} of {progress.total} space{progress.total !== 1 ? "s" : ""} complete
                  </p>
                  {progress.total > 0 && <div className="mt-3 max-w-sm"><ProgressBar pct={progress.pct} /></div>}
                  {(inReview > 0 || toRevise > 0) && (
                    <p className="text-xs mt-2 space-x-3">
                      {inReview > 0 && <span style={{ color: "#1565C0" }}>{inReview} awaiting client</span>}
                      {toRevise > 0 && <span style={{ color: "#C62828" }}>{toRevise} changes requested</span>}
                    </p>
                  )}
                </div>
                <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-sm" style={{ backgroundColor: colors.bg, color: colors.text }}>
                  {STATUS_LABELS[project.status] ?? project.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
