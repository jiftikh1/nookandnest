import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import IdeaResponseButtons from "./IdeaResponseButtons";

async function getClient() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return prisma.user.findUnique({ where: { email: user.email! } });
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:  { bg: "#FFF8E7", text: "#B8860B", label: "Awaiting your response" },
  APPROVED: { bg: "#E8F5E9", text: "#4A7B5B", label: "Approved" },
  REJECTED: { bg: "#FEF2F2", text: "#B85C5C", label: "Declined" },
};

export default async function ClientIdeasPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const client = await getClient();
  if (!client) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId: client.id },
    include: {
      designer: { select: { name: true } },
      ideas: {
        where: { isPushed: true },
        orderBy: [{ order: "asc" }, { pushedAt: "desc" }],
      },
    },
  });

  if (!project) notFound();

  const pending = project.ideas.filter((i) => i.clientStatus === "PENDING");
  const responded = project.ideas.filter((i) => i.clientStatus !== "PENDING");

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem" }}>
      <Link
        href={`/client/projects/${projectId}`}
        style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355", textDecoration: "none" }}
      >
        ← Back to Project
      </Link>

      <div style={{ margin: "1.5rem 0 3rem" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#7A7A7A", marginBottom: "0.5rem" }}>
          {project.name} · Design Ideas
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "#1A1A1A" }}>
          Review Design Ideas
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#7A7A7A", marginTop: "0.5rem" }}>
          Curated by {project.designer.name} — approve or decline each idea.
        </p>
      </div>

      {project.ideas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", border: "1px solid #E0DCD6", backgroundColor: "#FFFFFF" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "#1A1A1A", marginBottom: "0.75rem" }}>
            No ideas yet
          </p>
          <p style={{ fontSize: "0.9rem", color: "#7A7A7A" }}>
            Your designer will share ideas here for your feedback.
          </p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A4A4A" }}>
                  Awaiting Response
                </h2>
                <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.6rem", backgroundColor: "#FFF8E7", color: "#B8860B", borderRadius: "2px" }}>
                  {pending.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {pending.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} showActions />
                ))}
              </div>
            </section>
          )}

          {/* Responded */}
          {responded.length > 0 && (
            <section>
              <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A4A4A", marginBottom: "1.5rem" }}>
                Already Responded
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {responded.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} showActions={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
  showActions,
}: {
  idea: {
    id: string;
    title: string;
    description: string | null;
    imageUrls: string[];
    category: string | null;
    externalNotes: string | null;
    clientStatus: string;
    clientNote: string | null;
  };
  showActions: boolean;
}) {
  const statusStyle = STATUS_STYLES[idea.clientStatus] ?? STATUS_STYLES.PENDING;

  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6", borderRadius: "4px", overflow: "hidden" }}>
      {/* Images */}
      {idea.imageUrls.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(idea.imageUrls.length, 4)}, 1fr)`, gap: "2px" }}>
          {idea.imageUrls.slice(0, 4).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
          ))}
        </div>
      )}

      <div style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            {idea.category && (
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355", display: "block", marginBottom: "0.35rem" }}>
                {idea.category}
              </span>
            )}
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 400, color: "#1A1A1A" }}>
              {idea.title}
            </h3>
          </div>
          <span style={{ fontSize: "0.65rem", padding: "0.25rem 0.75rem", borderRadius: "2px", whiteSpace: "nowrap", backgroundColor: statusStyle.bg, color: statusStyle.text, letterSpacing: "0.08em" }}>
            {statusStyle.label}
          </span>
        </div>

        {idea.description && (
          <p style={{ fontSize: "0.875rem", color: "#4A4A4A", lineHeight: 1.8, marginBottom: "1rem" }}>
            {idea.description}
          </p>
        )}

        {idea.externalNotes && (
          <div style={{ backgroundColor: "#FAF8F5", borderLeft: "2px solid #C4A882", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355", marginBottom: "0.25rem" }}>
              Designer Note
            </p>
            <p style={{ fontSize: "0.85rem", color: "#4A4A4A", lineHeight: 1.7 }}>{idea.externalNotes}</p>
          </div>
        )}

        {idea.clientNote && (
          <p style={{ fontSize: "0.8rem", color: "#7A7A7A", fontStyle: "italic", marginBottom: "1rem" }}>
            Your note: &ldquo;{idea.clientNote}&rdquo;
          </p>
        )}

        {showActions && <IdeaResponseButtons ideaId={idea.id} />}
      </div>
    </div>
  );
}
