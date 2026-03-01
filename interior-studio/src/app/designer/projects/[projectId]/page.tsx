import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", IN_REVIEW: "In Review", PUBLISHED: "Published", ARCHIVED: "Archived",
  ACTIVE: "Draft", COMPLETED: "Published",
};

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId },
    include: {
      client: { select: { name: true, email: true } },
      rooms: { select: { id: true }, orderBy: { order: "asc" } },
      updates: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!project) notFound();

  const tabs = [
    { label: "Photos", href: `/designer/projects/${projectId}/photos` },
    { label: "Rooms", href: `/designer/projects/${projectId}/rooms`, count: project.rooms.length },
    { label: "Preview", href: `/designer/projects/${projectId}/preview` },
    { label: "Publish", href: `/designer/projects/${projectId}/publish` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href="/designer/dashboard" className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>
            {project.client.name}
          </p>
          <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 text-sm" style={{ color: "#7A7A7A" }}>{project.description}</p>
          )}
        </div>
        <span className="text-xs tracking-widest uppercase px-3 py-1 mt-2 rounded-sm" style={{ backgroundColor: "#F0EDE8", color: "#8B7355" }}>
          {STATUS_LABELS[project.status] ?? project.status}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-12">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="p-6 border rounded-sm hover:border-[#8B7355] transition-colors group"
            style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}
          >
            {"count" in tab && tab.count !== undefined && (
              <p className="text-3xl font-light mb-1 group-hover:text-[#8B7355] transition-colors"
                style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                {tab.count}
              </p>
            )}
            <p className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>{tab.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
              Project Updates
            </h2>
            <Link href={`/designer/projects/${projectId}/updates`}
              className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
              + Add Update
            </Link>
          </div>
          {project.updates.length === 0 ? (
            <p className="text-sm" style={{ color: "#7A7A7A" }}>No updates posted yet.</p>
          ) : (
            <div className="space-y-3">
              {project.updates.map((u) => (
                <div key={u.id} className="p-4 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
                  <p className="text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>{u.title}</p>
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>{u.body.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            Client Info
          </h2>
          <div className="p-5 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
            <p className="text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>{project.client.name}</p>
            <p className="text-sm" style={{ color: "#7A7A7A" }}>{project.client.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
