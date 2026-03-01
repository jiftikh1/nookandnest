import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "DESIGNER")) return null;
  return dbUser;
}

// POST /api/ideas/[ideaId]/push — toggle push to client
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId } = await params;

  const idea = await prisma.designIdea.findFirst({
    where: { id: ideaId },
    include: { project: { select: { designerId: true } } },
  });
  if (!idea || idea.project.designerId !== admin.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newPushed = !idea.isPushed;
  const updated = await prisma.designIdea.update({
    where: { id: ideaId },
    data: {
      isPushed: newPushed,
      pushedAt: newPushed ? new Date() : null,
      // Reset client status when un-pushing
      ...(newPushed ? {} : { clientStatus: "PENDING", clientNote: null, respondedAt: null }),
    },
  });

  return NextResponse.json(updated);
}
