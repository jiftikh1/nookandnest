import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// POST /api/ideas/[ideaId]/respond — client approves or rejects an idea
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId } = await params;
  const body = await req.json();
  const { status, note } = body; // status: "APPROVED" | "REJECTED"

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const idea = await prisma.designIdea.findFirst({
    where: { id: ideaId, isPushed: true },
    include: { project: { select: { clientId: true } } },
  });

  if (!idea) return NextResponse.json({ error: "Idea not found or not pushed" }, { status: 404 });
  if (idea.project.clientId !== dbUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.designIdea.update({
    where: { id: ideaId },
    data: {
      clientStatus: status,
      clientNote: note || null,
      respondedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
