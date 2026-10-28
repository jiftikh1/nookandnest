import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ContractManager from "./ContractManager";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

const toDateInput = (d: Date | null) => d?.toISOString().slice(0, 10) ?? "";

export default async function ContractPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId },
    include: {
      client: { select: { name: true } },
      rooms: { select: { id: true, name: true }, orderBy: { order: "asc" } },
      milestones: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
      </div>
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>{project.client.name}</p>
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Contract</h1>
        <p className="text-sm mt-2" style={{ color: "#7A7A7A" }}>These terms and payment milestones are shown to your client.</p>
      </div>

      <ContractManager
        projectId={projectId}
        spaces={project.rooms}
        initialTerms={{
          contractedSpaces: project.contractedSpaces?.toString() ?? "",
          revisionsPerSpace: project.revisionsPerSpace.toString(),
          contractValue: project.contractValue?.toString() ?? "",
          currency: project.currency,
          targetDate: toDateInput(project.targetDate),
        }}
        initialMilestones={project.milestones.map((m) => ({
          id: m.id,
          label: m.label,
          amount: m.amount,
          dueDate: toDateInput(m.dueDate),
          status: m.status,
          paidAt: m.paidAt?.toISOString() ?? null,
          roomId: m.roomId,
        }))}
      />
    </div>
  );
}
