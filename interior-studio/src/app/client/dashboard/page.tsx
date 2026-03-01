import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getClient() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return prisma.user.findUnique({ where: { email: user.email! } });
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "In Progress", IN_REVIEW: "In Review", PUBLISHED: "Ready to View",
  ARCHIVED: "Archived", ACTIVE: "In Progress", COMPLETED: "Ready to View",
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "#F0EDE8", text: "#8B7355" },
  IN_REVIEW: { bg: "#FFF8E7", text: "#B8860B" },
  PUBLISHED: { bg: "#E8F5E9", text: "#4A7B5B" },
  ARCHIVED:  { bg: "#E0DCD6", text: "#7A7A7A" },
  ACTIVE:    { bg: "#F0EDE8", text: "#8B7355" },
  COMPLETED: { bg: "#E8F5E9", text: "#4A7B5B" },
};

export default async function ClientDashboard() {
  const client = await getClient();
  if (!client) redirect("/login");

  const projects = await prisma.project.findMany({
    where: {
      clientId: client.id,
      status: { in: ["PUBLISHED", "COMPLETED", "IN_REVIEW", "DRAFT", "ACTIVE"] },
    },
    include: {
      designer: { select: { name: true } },
      _count: { select: { rooms: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const published = projects.filter((p) => p.status === "PUBLISHED" || p.status === "COMPLETED");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "#8B7355" }}>Client Portal</p>
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Welcome back, {client.name.split(" ")[0]}
        </h1>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No projects yet</p>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>Your designer will share projects with you here.</p>
        </div>
      ) : (
        <>
          {published.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Your Projects</h2>
              <div className="grid gap-4">
                {published.map((project) => {
                  const colors = STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT;
                  return (
                    <Link
                      key={project.id}
                      href={`/client/projects/${project.id}`}
                      className="flex items-center justify-between p-6 border rounded-sm hover:border-[#8B7355] transition-colors"
                      style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}
                    >
                      <div>
                        <h3 className="font-light text-xl mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>{project.name}</h3>
                        <p className="text-sm" style={{ color: "#7A7A7A" }}>
                          By {project.designer.name} · {project._count.rooms} room{project._count.rooms !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-sm" style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {STATUS_LABELS[project.status]}
                        </span>
                        <span className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>View →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {projects.filter((p) => p.status === "DRAFT" || p.status === "IN_REVIEW" || p.status === "ACTIVE").length > 0 && (
            <div>
              <h2 className="text-xl font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>In Progress</h2>
              <div className="grid gap-4">
                {projects.filter((p) => p.status === "DRAFT" || p.status === "IN_REVIEW" || p.status === "ACTIVE").map((project) => {
                  const colors = STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT;
                  return (
                    <div key={project.id} className="flex items-center justify-between p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF", opacity: 0.7 }}>
                      <div>
                        <h3 className="font-light text-xl mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>{project.name}</h3>
                        <p className="text-sm" style={{ color: "#7A7A7A" }}>By {project.designer.name} · Being prepared</p>
                      </div>
                      <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-sm" style={{ backgroundColor: colors.bg, color: colors.text }}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
