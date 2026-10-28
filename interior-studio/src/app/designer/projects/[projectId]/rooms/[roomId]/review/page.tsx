import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ReviewManager from "./ReviewManager";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

export default async function ReviewPage({ params }: { params: Promise<{ projectId: string; roomId: string }> }) {
  const { projectId, roomId } = await params;
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const room = await prisma.room.findFirst({
    where: { id: roomId, project: { designerId } },
    include: {
      project: { select: { name: true, revisionsPerSpace: true } },
      renders: {
        where: { generatedImageUrl: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { id: true, generatedImageUrl: true, style: true },
      },
      rounds: { orderBy: { number: "desc" } },
    },
  });

  if (!room) notFound();

  const base = `/designer/projects/${projectId}/rooms/${roomId}`;
  const subTabs = [
    { label: "Photos", href: base },
    { label: "Mood Boards", href: `${base}/mood-boards` },
    { label: "Items", href: `${base}/items` },
    { label: "Renders", href: `${base}/renders` },
    { label: "Review", href: `${base}/review` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}/rooms`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Spaces
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>{room.project.name}</p>
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>{room.name}</h1>
      </div>

      <div className="flex border-b mb-10" style={{ borderColor: "#E0DCD6" }}>
        {subTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-xs tracking-widest uppercase py-3 mr-8 border-b-2 transition-colors"
            style={{
              borderColor: tab.href === `${base}/review` ? "#8B7355" : "transparent",
              color: tab.href === `${base}/review` ? "#8B7355" : "#7A7A7A",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ReviewManager
        roomId={roomId}
        initialStatus={room.status}
        initialTargetDate={room.targetDate?.toISOString().slice(0, 10) ?? ""}
        initialRevisionsIncluded={room.revisionsIncluded}
        projectRevisionsPerSpace={room.project.revisionsPerSpace}
        renders={room.renders.map((r) => ({ id: r.id, imageUrl: r.generatedImageUrl!, style: r.style }))}
        photoUrls={room.photoUrls}
        rounds={room.rounds.map((r) => ({ ...r, sentAt: r.sentAt.toISOString(), respondedAt: r.respondedAt?.toISOString() ?? null }))}
      />
    </div>
  );
}
