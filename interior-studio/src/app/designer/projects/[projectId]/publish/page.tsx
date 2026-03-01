import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PublishManager from "./PublishManager";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

export default async function PublishPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId },
    include: {
      client: { select: { name: true, email: true } },
      rooms: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, photoUrls: true },
      },
    },
  });

  if (!project) notFound();

  const checks = [
    { label: "Project description filled in", passed: !!project.description?.trim() },
    { label: "At least one room exists", passed: project.rooms.length > 0 },
    { label: "Each room has at least one photo", passed: project.rooms.length > 0 && project.rooms.every((r) => r.photoUrls.length > 0) },
  ];

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Publish to Client
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#7A7A7A" }}>
          Publish {project.name} to {project.client.name} — they{"'"}ll be able to view all rooms, mood boards, items, and renders.
        </p>
      </div>

      {/* Checklist */}
      <div className="mb-8 p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
        <h2 className="text-sm font-medium mb-4" style={{ color: "#1A1A1A" }}>Pre-publish checklist</h2>
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-3">
              <span className="text-lg">{check.passed ? "✓" : "○"}</span>
              <span className="text-sm" style={{ color: check.passed ? "#4A7B5B" : "#7A7A7A" }}>
                {check.label}
              </span>
              {!check.passed && (
                <Link
                  href={check.label.includes("description") ? `/designer/projects/${projectId}` : check.label.includes("room") ? `/designer/projects/${projectId}/rooms` : `/designer/projects/${projectId}/photos`}
                  className="text-xs tracking-widest uppercase ml-auto"
                  style={{ color: "#8B7355" }}
                >
                  Fix →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <PublishManager
        projectId={projectId}
        currentStatus={project.status}
        clientMessage={project.clientMessage ?? ""}
        canPublish={allPassed}
      />
    </div>
  );
}
