import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "DESIGNER")) redirect("/login");
  return dbUser;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:     { bg: "#F0EDE8", text: "#8B7355" },
  IN_REVIEW: { bg: "#FFF8E7", text: "#B8860B" },
  PUBLISHED: { bg: "#E8F5E9", text: "#4A7B5B" },
  ARCHIVED:  { bg: "#E0DCD6", text: "#7A7A7A" },
  ACTIVE:    { bg: "#F0EDE8", text: "#8B7355" },
  COMPLETED: { bg: "#E8F5E9", text: "#4A7B5B" },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", IN_REVIEW: "In Review", PUBLISHED: "Active",
  ARCHIVED: "Archived", ACTIVE: "Draft", COMPLETED: "Active",
};

export default async function AdminDashboard() {
  const admin = await getAdmin();

  const projects = await prisma.project.findMany({
    where: { designerId: admin.id },
    include: {
      client: { select: { name: true, email: true } },
      ideas: { select: { id: true, isPushed: true, clientStatus: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => ["PUBLISHED", "IN_REVIEW", "ACTIVE"].includes(p.status)).length,
    totalIdeas: projects.reduce((sum, p) => sum + p.ideas.length, 0),
    pendingReview: projects.reduce((sum, p) => sum + p.ideas.filter(i => i.isPushed && i.clientStatus === "PENDING").length, 0),
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#8B7355", marginBottom: "0.5rem" }}>
          Admin Portal
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, color: "#1A1A1A" }}>
            Welcome, {admin.name.split(" ")[0]}
          </h1>
          <Link
            href="/admin/projects/new"
            style={{
              display: "inline-block", padding: "0.7rem 1.75rem",
              backgroundColor: "#1A1A1A", color: "#FAF8F5",
              fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: "2px",
            }}
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
        {[
          { label: "Total Projects", value: stats.total },
          { label: "Active Projects", value: stats.active },
          { label: "Total Ideas", value: stats.totalIdeas },
          { label: "Awaiting Client", value: stats.pendingReview },
        ].map(({ label, value }) => (
          <div key={label} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6", borderRadius: "4px", padding: "1.5rem 2rem" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, color: "#1A1A1A" }}>{value}</div>
            <div style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7A7A", marginTop: "0.25rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Projects list */}
      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6", borderRadius: "4px" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#1A1A1A", marginBottom: "0.75rem" }}>No projects yet</p>
          <p style={{ fontSize: "0.9rem", color: "#7A7A7A", marginBottom: "2rem" }}>Create your first project to get started.</p>
          <Link href="/admin/projects/new" style={{ padding: "0.7rem 1.75rem", backgroundColor: "#1A1A1A", color: "#FAF8F5", fontSize: "0.8rem", textDecoration: "none", borderRadius: "2px" }}>
            Create Project
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", backgroundColor: "#E0DCD6", borderRadius: "4px", overflow: "hidden", border: "1px solid #E0DCD6" }}>
          {projects.map((project) => {
            const pushed = project.ideas.filter(i => i.isPushed).length;
            const approved = project.ideas.filter(i => i.clientStatus === "APPROVED").length;
            const rejected = project.ideas.filter(i => i.clientStatus === "REJECTED").length;
            const awaiting = project.ideas.filter(i => i.isPushed && i.clientStatus === "PENDING").length;
            const colors = STATUS_COLORS[project.status] || STATUS_COLORS.DRAFT;

            return (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  alignItems: "center", gap: "2rem",
                  padding: "1.5rem 2rem", backgroundColor: "#FFFFFF",
                  textDecoration: "none", transition: "background 0.15s",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#1A1A1A" }}>{project.name}</span>
                    <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.6rem", borderRadius: "2px", backgroundColor: colors.bg, color: colors.text, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {STATUS_LABELS[project.status] || project.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#7A7A7A" }}>
                    {project.client.name} &middot; {project.client.email}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", color: "#1A1A1A", fontWeight: 500 }}>{project.ideas.length}</div>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#7A7A7A" }}>Ideas</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.1rem", color: "#1A1A1A", fontWeight: 500 }}>{pushed}</div>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#7A7A7A" }}>Pushed</div>
                  </div>
                  {awaiting > 0 && (
                    <div>
                      <div style={{ fontSize: "1.1rem", color: "#B8860B", fontWeight: 500 }}>{awaiting}</div>
                      <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#7A7A7A" }}>Awaiting</div>
                    </div>
                  )}
                  {approved > 0 && (
                    <div>
                      <div style={{ fontSize: "1.1rem", color: "#4A7B5B", fontWeight: 500 }}>{approved}</div>
                      <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#7A7A7A" }}>Approved</div>
                    </div>
                  )}
                  {rejected > 0 && (
                    <div>
                      <div style={{ fontSize: "1.1rem", color: "#B85C5C", fontWeight: 500 }}>{rejected}</div>
                      <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#7A7A7A" }}>Rejected</div>
                    </div>
                  )}
                  <span style={{ color: "#C4A882", fontSize: "1.2rem" }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
