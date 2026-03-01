import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import IdeaCard from "./IdeaCard";

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "DESIGNER")) redirect("/login");
  return dbUser;
}

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approved", REJECTED: "Rejected", PENDING: "Pending",
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPROVED: { bg: "#E8F5E9", text: "#4A7B5B" },
  REJECTED: { bg: "#FEF2F2", text: "#B85C5C" },
  PENDING:  { bg: "#FFF8E7", text: "#B8860B" },
};

export default async function AdminProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const admin = await getAdmin();

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId: admin.id },
    include: {
      client: { select: { name: true, email: true } },
      ideas: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!project) notFound();

  const drafted = project.ideas.filter(i => !i.isPushed);
  const pushed = project.ideas.filter(i => i.isPushed);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
      <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355", textDecoration: "none" }}>
        ← Dashboard
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "1.5rem 0 3rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginBottom: "0.25rem" }}>{project.client.name} · {project.client.email}</p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", fontWeight: 400, color: "#1A1A1A" }}>{project.name}</h1>
          {project.description && <p style={{ fontSize: "0.9rem", color: "#4A4A4A", marginTop: "0.5rem", maxWidth: "60ch" }}>{project.description}</p>}
        </div>
        <Link
          href={`/admin/projects/${projectId}/ideas/new`}
          style={{
            display: "inline-block", padding: "0.7rem 1.75rem",
            backgroundColor: "#1A1A1A", color: "#FAF8F5",
            fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", borderRadius: "2px", whiteSpace: "nowrap",
          }}
        >
          + Upload Idea
        </Link>
      </div>

      {project.ideas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6", borderRadius: "4px" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "#1A1A1A", marginBottom: "0.75rem" }}>No ideas yet</p>
          <p style={{ fontSize: "0.9rem", color: "#7A7A7A", marginBottom: "2rem" }}>Upload your first design idea to get started.</p>
          <Link
            href={`/admin/projects/${projectId}/ideas/new`}
            style={{ padding: "0.7rem 1.75rem", backgroundColor: "#1A1A1A", color: "#FAF8F5", fontSize: "0.8rem", textDecoration: "none", borderRadius: "2px" }}
          >
            Upload Idea
          </Link>
        </div>
      ) : (
        <>
          {/* Drafted / not pushed */}
          {drafted.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A4A4A" }}>Draft — Not Sent to Client</h2>
                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", backgroundColor: "#F0EDE8", color: "#8B7355", borderRadius: "2px" }}>{drafted.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                {drafted.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} projectId={projectId} STATUS_LABELS={STATUS_LABELS} STATUS_COLORS={STATUS_COLORS} />
                ))}
              </div>
            </section>
          )}

          {/* Pushed to client */}
          {pushed.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A4A4A" }}>Sent to Client</h2>
                <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", backgroundColor: "#F0EDE8", color: "#8B7355", borderRadius: "2px" }}>{pushed.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
                {pushed.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} projectId={projectId} STATUS_LABELS={STATUS_LABELS} STATUS_COLORS={STATUS_COLORS} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
