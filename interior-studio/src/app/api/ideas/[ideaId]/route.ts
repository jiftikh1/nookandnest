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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId } = await params;
  const body = await req.json();
  const { title, description, imageUrls, category, internalNotes, externalNotes } = body;

  const idea = await prisma.designIdea.findFirst({
    where: { id: ideaId },
    include: { project: { select: { designerId: true } } },
  });
  if (!idea || idea.project.designerId !== admin.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.designIdea.update({
    where: { id: ideaId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(imageUrls !== undefined && { imageUrls }),
      ...(category !== undefined && { category }),
      ...(internalNotes !== undefined && { internalNotes }),
      ...(externalNotes !== undefined && { externalNotes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  await prisma.designIdea.delete({ where: { id: ideaId } });
  return NextResponse.json({ success: true });
}
